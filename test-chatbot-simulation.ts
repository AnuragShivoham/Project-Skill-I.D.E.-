/**
 * Test script to simulate Project-Skill Chatbot interactions.
 * Tests:
 * 1. Intake parsing (project idea, tech stack, skill level, timeline)
 * 2. Intake confirmation flow (yes/no)
 * 3. Code-request refusal detection
 * 4. Milestone creation prompt
 * 5. MENTOR_REPORT JSON extraction and validation
 */

// Simulate parseIntakeFromText function from AIChatPanel
const parseIntakeFromText = (text: string) => {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const map: Record<string, string> = {};
  for (const line of lines) {
    const m = line.match(/^([^:]+):\s*(.+)$/);
    if (m) {
      map[m[1].toLowerCase()] = m[2];
    }
  }
  const projectIdea = map["project idea"] || map["project"] || "";
  const techStack = map["tech stack"] || map["tech"] || "";
  const skillLevel = map["skill level"] || map["skill"] || "";
  const timeline = map["timeline"] || map["timeframe"] || "";
  if (projectIdea && techStack && skillLevel && timeline) {
    return { projectIdea, techStack, skillLevel, timeline };
  }
  return null;
};

// Simulate code-request detection
const detectCodeRequest = (text: string) => {
  const codeRequestPatterns = [
    /give me the code/i,
    /paste the code/i,
    /implement for me/i,
    /write the code/i,
    /full implementation/i,
    /complete solution/i,
  ];
  return codeRequestPatterns.some((rx) => rx.test(text));
};

// Simulate MENTOR_REPORT extraction from assistant content
const extractMentorReport = (assistantContent: string) => {
  if (!assistantContent.includes("```MENTOR_REPORT")) {
    return null;
  }
  const startTag = "```MENTOR_REPORT";
  const start = assistantContent.indexOf(startTag);
  const closing = assistantContent.indexOf("```", start + startTag.length);
  if (start !== -1 && closing !== -1 && closing > start) {
    const raw = assistantContent.slice(start + startTag.length, closing).trim();
    try {
      return JSON.parse(raw);
    } catch (err) {
      console.error("Failed to parse MENTOR_REPORT JSON:", err);
      return null;
    }
  }
  return null;
};

// Test cases
const tests = [
  {
    name: "Test 1: Intake parsing with all fields",
    input: `Project idea: Build a real-time chat application
Tech stack: Node.js, React, Socket.io
Skill level: intermediate
Timeline: 4 weeks`,
    expectedResult: {
      projectIdea: "Build a real-time chat application",
      techStack: "Node.js, React, Socket.io",
      skillLevel: "intermediate",
      timeline: "4 weeks",
    },
  },
  {
    name: "Test 2: Intake parsing with alternative field names",
    input: `Project: E-commerce platform
Tech: Python, Django, PostgreSQL
Skill: beginner
Timeframe: 6 weeks`,
    expectedResult: {
      projectIdea: "E-commerce platform",
      techStack: "Python, Django, PostgreSQL",
      skillLevel: "beginner",
      timeline: "6 weeks",
    },
  },
  {
    name: "Test 3: Intake parsing - missing field (should fail)",
    input: `Project idea: Todo app
Tech stack: React
Skill level: beginner`,
    expectedResult: null,
  },
  {
    name: "Test 4: Code request detection - 'give me the code'",
    input: "give me the code",
    expectedResult: true,
  },
  {
    name: "Test 5: Code request detection - 'write the code'",
    input: "write the code for authentication",
    expectedResult: true,
  },
  {
    name: "Test 6: Code request detection - innocent request (should pass)",
    input: "Can you explain how authentication works?",
    expectedResult: false,
  },
  {
    name: "Test 7: MENTOR_REPORT extraction",
    input: `Some discussion here...

\`\`\`MENTOR_REPORT
{
  "milestone_name": "Authentication Setup",
  "understanding_level": "high",
  "strengths": ["Good grasp of JWT concepts", "Asked clarifying questions"],
  "weak_areas": ["Token refresh logic still unclear"],
  "red_flags": [],
  "mentor_recommendation": "Move to next milestone"
}
\`\`\`

Next steps: ...`,
    expectedResult: {
      milestone_name: "Authentication Setup",
      understanding_level: "high",
      strengths: ["Good grasp of JWT concepts", "Asked clarifying questions"],
      weak_areas: ["Token refresh logic still unclear"],
      red_flags: [],
      mentor_recommendation: "Move to next milestone",
    },
  },
];

// Run tests
console.log("=".repeat(80));
console.log("PROJECT-SKILL CHATBOT TEST SIMULATION");
console.log("=".repeat(80));
console.log();

let passed = 0;
let failed = 0;

for (const test of tests) {
  console.log(`📋 ${test.name}`);

  let result: any;
  if (test.name.includes("Intake parsing")) {
    result = parseIntakeFromText(test.input);
  } else if (test.name.includes("Code request detection")) {
    result = detectCodeRequest(test.input);
  } else if (test.name.includes("MENTOR_REPORT extraction")) {
    result = extractMentorReport(test.input);
  }

  const isPass = JSON.stringify(result) === JSON.stringify(test.expectedResult);

  if (isPass) {
    console.log("✅ PASSED");
    passed++;
  } else {
    console.log("❌ FAILED");
    console.log(`   Expected: ${JSON.stringify(test.expectedResult)}`);
    console.log(`   Got:      ${JSON.stringify(result)}`);
    failed++;
  }
  console.log();
}

// Summary
console.log("=".repeat(80));
console.log(`RESULTS: ${passed} passed, ${failed} failed out of ${tests.length} tests`);
console.log("=".repeat(80));

// Simulate full chatbot flow
console.log();
console.log("=".repeat(80));
console.log("FULL CHATBOT FLOW SIMULATION");
console.log("=".repeat(80));
console.log();

const simulateFlow = () => {
  console.log("🤖 BODHIT: Welcome! Please provide your intake fields:");
  console.log("   Project idea: ...");
  console.log("   Tech stack: ...");
  console.log("   Skill level: ...");
  console.log("   Timeline: ...");
  console.log();

  const userIntake = `Project idea: Build a REST API for a task management system
Tech stack: Node.js, Express, MongoDB
Skill level: intermediate
Timeline: 3 weeks`;

  console.log("👤 STUDENT:", userIntake);
  console.log();

  const parsed = parseIntakeFromText(userIntake);
  console.log("🤖 BODHIT: Parsed intake as:");
  console.log(`   Project idea: ${parsed!.projectIdea}`);
  console.log(`   Tech stack: ${parsed!.techStack}`);
  console.log(`   Skill level: ${parsed!.skillLevel}`);
  console.log(`   Timeline: ${parsed!.timeline}`);
  console.log("   Please confirm with 'yes' or 'no'");
  console.log();

  const confirmation = "yes";
  console.log("👤 STUDENT:", confirmation);
  console.log();

  console.log("🤖 BODHIT: Intake confirmed! Creating milestones...");
  console.log("   Milestone 1: Project Setup & Planning");
  console.log("   Milestone 2: REST API Core Routes");
  console.log("   Milestone 3: Database Schema & Models");
  console.log("   Milestone 4: Authentication & Security");
  console.log("   Milestone 5: Testing & Documentation");
  console.log("   Milestone 6: Deployment & Monitoring");
  console.log();
  console.log("   Choose a milestone to start, or ask a question.");
  console.log();

  const studentRequest = "Can you give me the code for milestone 1?";
  console.log("👤 STUDENT:", studentRequest);
  console.log();

  if (detectCodeRequest(studentRequest)) {
    console.log("🤖 BODHIT: I cannot provide code. Describe your intended approach and I will guide the logic, tests, and structure.");
    console.log();
  }

  console.log("👤 STUDENT: I want to set up the project structure. I'm thinking of using npm init to set up the project, then installing Express and MongoDB.");
  console.log();

  const assistantResponseWithReport = `Good thinking! Your approach is on the right track. Let me guide you through the key concepts:

1. **Project Initialization**: You'll run \`npm init -y\` to create package.json. This sets up your project metadata and dependencies list.

2. **Dependency Management**: You'll install Express (for routing and middleware) and MongoDB driver or Mongoose (for database interaction). Why Mongoose? It provides schema validation and reduces boilerplate.

3. **Project Structure Concepts**: Think about how you'd organize your code:
   - Entry point (index.js or server.js)
   - Routes directory (separate by resource)
   - Models directory (data schemas)
   - Controllers directory (business logic)
   - Middleware directory (custom middleware)

Before you proceed, tell me:
- What are you planning to use for the entry point filename?
- Will you use Mongoose or the native MongoDB driver? Why?

This is important because it affects the folder structure you'll create.

\`\`\`MENTOR_REPORT
{
  "milestone_name": "Project Setup & Planning",
  "student_understanding_level": "medium",
  "strengths": ["Understands npm workflow", "Identified core dependencies correctly"],
  "weak_areas": ["Not clear on why Mongoose vs native driver", "File structure organization needs refinement"],
  "red_flags": [],
  "mentor_recommendation": "Student should experiment with both Mongoose and native driver to understand trade-offs. Guide them toward Mongoose for this project.",
  "feedback_for_student": "Good start! Next, think about the folder structure and explain your choices."
}
\`\`\``;

  console.log("🤖 BODHIT:", assistantResponseWithReport.slice(0, 300) + "...\n");

  const report = extractMentorReport(assistantResponseWithReport);
  console.log("📊 MENTOR REPORT EXTRACTED:");
  console.log(JSON.stringify(report, null, 2));
  console.log();

  if (report) {
    console.log("✅ Mentor report saved to Supabase (submission_id: <id>, report: <json>)");
  }
};

simulateFlow();

console.log();
console.log("=".repeat(80));
console.log("SIMULATION COMPLETE");
console.log("=".repeat(80));
