import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are a project planning expert for the AMIT–BODHIT co-building platform. Your task is to analyze a student's project and create a structured learning roadmap with milestones and tasks.

GUIDELINES:
1. Create 4-6 milestones that build progressively
2. Each milestone should have 3-5 concrete tasks
3. Tasks should be specific, actionable, and educational
4. Consider the student's skill score when determining complexity
5. Align milestones with the project deadline
6. Focus on building real skills, not just completing the project
7. Include learning objectives in milestone descriptions

MILESTONE STRUCTURE:
- Start with project setup and foundation
- Progress through core features
- Include testing and documentation
- End with deployment and polish

TASK GUIDELINES:
- Each task should take 1-4 hours
- Include clear acceptance criteria in description
- Balance coding tasks with learning tasks
- Consider dependencies between tasks`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { submissionId } = await req.json();
    
    if (!submissionId) {
      return new Response(JSON.stringify({ error: "submissionId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch the submission
    const { data: submission, error: fetchError } = await supabase
      .from("project_submissions")
      .select("*")
      .eq("id", submissionId)
      .single();

    if (fetchError || !submission) {
      console.error("Failed to fetch submission:", fetchError);
      return new Response(JSON.stringify({ error: "Submission not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Generating milestones for:", submission.project_title);

    const userPrompt = `Generate a project roadmap for the following student project:

PROJECT TITLE: ${submission.project_title}

PROJECT DESCRIPTION:
${submission.project_description}

TECH STACK: ${submission.tech_stack.join(", ")}

DEADLINE: ${submission.deadline}

STUDENT SKILL SCORE: ${submission.skill_score}/15 (${submission.skill_score <= 5 ? "Beginner" : submission.skill_score <= 10 ? "Intermediate" : "Advanced"})

Create a structured learning roadmap with milestones and tasks that will help this student build real skills while completing their project.`;

    // Call Lovable AI with tool calling to get structured output
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_project_roadmap",
              description: "Create a structured project roadmap with milestones and tasks",
              parameters: {
                type: "object",
                properties: {
                  milestones: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string", description: "Clear, concise milestone title" },
                        description: { type: "string", description: "What the student will learn/accomplish" },
                        order_index: { type: "number", description: "Order of this milestone (0-based)" },
                        tasks: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              title: { type: "string", description: "Specific, actionable task title" },
                              description: { type: "string", description: "What to do and acceptance criteria" },
                              order_index: { type: "number", description: "Order within the milestone (0-based)" },
                            },
                            required: ["title", "description", "order_index"],
                            additionalProperties: false,
                          },
                        },
                      },
                      required: ["title", "description", "order_index", "tasks"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["milestones"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "create_project_roadmap" } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await response.json();
    console.log("AI response received");

    // Extract the structured data from tool call
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "create_project_roadmap") {
      console.error("Unexpected AI response format:", aiResponse);
      return new Response(JSON.stringify({ error: "Failed to generate roadmap structure" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const roadmap = JSON.parse(toolCall.function.arguments);
    console.log("Generated", roadmap.milestones.length, "milestones");

    // Calculate due dates based on deadline
    const deadlineDate = new Date(submission.deadline);
    const now = new Date();
    const totalDays = Math.max(1, Math.floor((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const daysPerMilestone = Math.floor(totalDays / roadmap.milestones.length);

    // Insert milestones and tasks into database
    const createdMilestones = [];

    for (const milestone of roadmap.milestones) {
      const dueDate = new Date(now);
      dueDate.setDate(dueDate.getDate() + daysPerMilestone * (milestone.order_index + 1));

      const { data: createdMilestone, error: milestoneError } = await supabase
        .from("milestones")
        .insert({
          submission_id: submissionId,
          title: milestone.title,
          description: milestone.description,
          order_index: milestone.order_index,
          due_date: dueDate.toISOString().split("T")[0],
          source: "ai",
          status: "pending",
        })
        .select()
        .single();

      if (milestoneError) {
        console.error("Failed to create milestone:", milestoneError);
        continue;
      }

      console.log("Created milestone:", createdMilestone.title);

      // Insert tasks for this milestone
      const tasksToInsert = milestone.tasks.map((task: any) => ({
        milestone_id: createdMilestone.id,
        title: task.title,
        description: task.description,
        order_index: task.order_index,
        status: "pending",
        progress: 0,
      }));

      const { error: tasksError } = await supabase.from("tasks").insert(tasksToInsert);

      if (tasksError) {
        console.error("Failed to create tasks:", tasksError);
      }

      createdMilestones.push({
        ...createdMilestone,
        tasks: milestone.tasks,
      });
    }

    // Update submission status to indicate milestones are generated
    await supabase
      .from("project_submissions")
      .update({ status: "in_progress" })
      .eq("id", submissionId);

    console.log("Milestone generation complete");

    return new Response(
      JSON.stringify({
        success: true,
        milestonesCreated: createdMilestones.length,
        milestones: createdMilestones,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Generate milestones error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
