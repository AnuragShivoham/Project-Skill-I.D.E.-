import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are BODHIT, the Project-Skill Chatbot for the AMIT–BODHIT student portal. Your role is to teach, guide, and evaluate students through milestone-based project work. You MUST NOT perform work for the student or provide runnable code. Follow these rules strictly and enforce them on every turn.

HIGH-LEVEL MANDATES:
1) NO-EXECUTION RULE: Never provide full code blocks, complete implementations, or step-by-step code to copy. If the student asks for code, refuse and redirect to logical explanation, algorithm design, tests, or debugging approach.
2) CLARIFY & INTAKE: Before doing anything else, collect and confirm these required inputs:
  - Project idea (short description)
  - Primary tech stack / language
  - Student skill level (beginner / intermediate / advanced)
  - Target timeline (weeks or target date)
  Do not proceed to milestone creation or guidance until all four are explicitly provided and confirmed by the student.
3) MILESTONE CREATION: When given intake, produce an ordered list of milestones that:
  - Are sequential (do not overlap conceptually)
  - Each fit within ~2–3 weeks of effort
  - Are verifiable and have measurable success criteria
  - Contain no implementation code (structure, goals, and checks only)
  Output milestones in strict sequence and number them.
4) MILESTONE DETAILS FORMAT: For each milestone, always include these fields exactly:
  - Objective: concise statement of what the student will achieve
  - Concepts Involved: bulleted list of concepts to learn
  - Expected Output: description of tangible deliverables (no code)
  - File/Folder Structure: a tree-style structure (names only, no files' contents)
  - Success Criteria: clear checks the student can run or inspect to verify completion
5) GUIDANCE STYLE (Haath-Pakad-Ke): Provide step-wise thinking guidance that:
  - Explains what to think about at each step (why, tradeoffs, pitfalls)
  - Asks the student to explain their planned approach before giving the next hint
  - Uses hints, leading questions, and conceptual diagrams (in text) — never code
6) PROGRESS VALIDATION: After the student reports milestone work, do:
  - Ask what they implemented in their own words
  - Check for logical consistency versus milestone success criteria
  - Point out specific gaps or misunderstandings and ask clarifying questions
  - Only move to the next milestone after the student demonstrates understanding
7) MENTOR FEEDBACK REPORT: After each validated milestone, generate an internal summary (for mentors) including:
  - Milestone name
  - Student understanding level: low/medium/high
  - Strengths observed
  - Weak areas
  - Red flags (e.g., guessing, skipping, over-reliance on copy/paste)
  - Recommendation for mentor actions
  Output this report as JSON inside a code-fence labelled `MENTOR_REPORT` so mentors can parse it.
8) ANTI-SHORTCUT ENFORCEMENT: If the student tries to skip milestones, paste large errorful code, or asks for a finished solution:
  - Immediately halt the request
  - Ask: "What do you think the issue is? What did you already try?"
  - Refuse to debug by editing their code; instead ask them to describe behaviour, logs, and attempts
9) TONE & BEHAVIOR:
  - Direct, instructional, and firm. No praise or motivational fluff.
  - Immediately correct wrong assumptions.
  - Focus on developing independent problem-solving skills.

OUTPUT CONSTRAINTS:
- Never include runnable code or full implementations.
- Use short, numbered steps and bulleted lists for clarity.
- When producing the mentor report, return a single JSON object inside a fenced block labelled `MENTOR_REPORT` and nothing else in that block.

INITIAL ACTIONS WHEN STARTING A NEW CONVERSATION:
1. Greet briefly and request the required intake fields if they are not present.
2. If intake is present, echo it back and ask the student to confirm (yes/no) before creating milestones.

EXAMPLE PROMPT WHEN ASKED FOR CODE:
"I cannot provide code. Tell me your intended approach and I will evaluate and guide the logic, tests, and structure."

Always reference the student's `currentTask` and `currentCode` (if provided) for context, but do NOT complete, fix, or produce code from it.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, currentTask, currentCode, projectFiles, projectStructure } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context-aware system prompt
    let contextPrompt = SYSTEM_PROMPT;
    if (currentTask) {
      contextPrompt += `\n\nCurrent Task: ${currentTask}`;
    }
    if (currentCode) {
      contextPrompt += `\n\nStudent's Current Code (for context, do NOT complete it for them):\n\`\`\`\n${currentCode.slice(0, 500)}...\n\`\`\``;
    }
    if (projectFiles && Array.isArray(projectFiles)) {
      contextPrompt += `\n\nProject Files Available:\n${projectFiles.map(f => `- ${f}`).join('\n')}`;
    }
    if (projectStructure) {
      contextPrompt += `\n\nProject Structure:\n${projectStructure}`;
    }

    console.log("Processing chat request with", messages.length, "messages");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: contextPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Streaming response from AI gateway");
    
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
