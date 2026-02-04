# Project-Skill Chatbot Deployment Guide

## Prerequisites
- Supabase project created and accessible
- Supabase CLI installed (`npm install -g supabase`)
- Local environment variables configured

## Step 1: Create the Mentor Reports Table

Run the migration to create the `mentor_reports` table in your Supabase project:

```bash
# Option A: Using Supabase CLI (Recommended)
cd c:\Users\ANURAG\Dropbox\FORGE-LEARN\forge-learn
supabase migration up --project-ref <YOUR_PROJECT_REF>

# Option B: Manual SQL in Supabase Dashboard
# 1. Go to https://app.supabase.com → Your Project → SQL Editor
# 2. Copy the entire contents of supabase/migrations/20260202_create_mentor_reports_table.sql
# 3. Paste and execute in the SQL Editor
```

### What the Migration Creates:
- **`mentor_reports` table** with columns:
  - `id` (uuid, primary key)
  - `submission_id` (uuid, foreign key to `project_submissions`)
  - `report` (jsonb, stores mentor feedback JSON)
  - `raw_text` (text, raw JSON for debugging)
  - `created_at` (timestamp, auto-set)
  - `updated_at` (timestamp, auto-set)

- **Indexes** for fast queries on `submission_id` and `created_at`

- **RLS Policies**:
  - ✅ Mentors/Admins: View all reports
  - ✅ Students: View reports for their own submissions only
  - ✅ Chatbot: Insert new reports

---

## Step 2: Set Environment Variables in Supabase

The chatbot function needs the `LOVABLE_API_KEY` to call the AI API.

```bash
# Using Supabase CLI
supabase secrets set LOVABLE_API_KEY=<YOUR_LOVABLE_API_KEY> --project-ref <YOUR_PROJECT_REF>

# Verify the secret was set
supabase secrets list --project-ref <YOUR_PROJECT_REF>
```

---

## Step 3: Deploy the Chatbot Function

The Supabase function at `supabase/functions/bodhit-chat/index.ts` has been updated with the new system prompt.

```bash
# Deploy the function to your project
supabase functions deploy bodhit-chat --project-ref <YOUR_PROJECT_REF>

# Verify deployment
supabase functions list --project-ref <YOUR_PROJECT_REF>

# View function logs (if you encounter issues)
supabase functions logs bodhit-chat --project-ref <YOUR_PROJECT_REF> --follow
```

---

## Step 4: Verify Frontend Environment Variables

Ensure your frontend has the correct Supabase credentials:

**File**: `.env.local` (or `.env` for local dev)
```
VITE_SUPABASE_URL=https://<YOUR_PROJECT_ID>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<YOUR_PUBLIC_KEY>
```

You can find these in:
- Supabase Dashboard → Settings → API

---

## Step 5: Test the Chatbot in Your Application

1. **Start the dev server**:
   ```bash
   cd c:\Users\ANURAG\Dropbox\FORGE-LEARN\forge-learn
   npm run dev
   ```

2. **Login as a Student**:
   - Navigate to http://localhost:8081/auth
   - Sign up with a test student account

3. **Open Student Dashboard**:
   - Click "Dashboard" after login
   - Look for the floating chat button (bottom-right corner)
   - Click the chat button to open the BODHIT guide

4. **Test the Intake Flow**:
   - The bot will ask for intake fields
   - Enter in this format:
     ```
     Project idea: Build a REST API for task management
     Tech stack: Node.js, Express, MongoDB
     Skill level: intermediate
     Timeline: 4 weeks
     ```
   - Confirm with "yes"

5. **Test Code-Request Refusal**:
   - Try asking: "Can you give me the code?"
   - Bot should refuse with: "I cannot provide code. Describe your intended approach..."

6. **Generate a Mentor Report**:
   - Ask the bot a question about your milestone
   - The bot will respond with guidance and include a MENTOR_REPORT JSON block
   - The report is automatically saved to the database

7. **View Mentor Reports** (Mentor/Admin only):
   - Login as a mentor or admin
   - In Student Dashboard, look for "View Mentor Reports" button (bottom-right)
   - Click to see all saved mentor reports

---

## Troubleshooting

### Issue: "mentor_reports table does not exist"
**Solution**: Run the migration again
```bash
supabase migration up --project-ref <YOUR_PROJECT_REF>
```

### Issue: Function returns 402 (Credits Exhausted)
**Solution**: The LOVABLE_API_KEY has no remaining credits. Add credits in the API provider dashboard.

### Issue: Function returns 429 (Rate Limited)
**Solution**: Too many requests too quickly. Wait a moment and retry.

### Issue: MENTOR_REPORT not saving
**Solution**: 
1. Check browser console for errors
2. Check Supabase function logs: `supabase functions logs bodhit-chat --follow`
3. Verify `submission_id` is being passed correctly to the chat

---

## How It Works

### Flow Diagram
```
Student inputs intake fields
         ↓
Client-side parsing validates format
         ↓
Bot echoes back parsed fields
         ↓
Student confirms with "yes"
         ↓
intakeConfirmed = true
         ↓
Student asks question about milestone
         ↓
Message sent to bodhit-chat function
         ↓
Function calls Lovable API with system prompt
         ↓
API returns response with optional MENTOR_REPORT
         ↓
Client extracts MENTOR_REPORT JSON from response
         ↓
Client saves to mentor_reports table (if submissionId provided)
         ↓
Mentor can view report in dashboard
```

### Report Structure
```json
{
  "milestone_name": "Project Setup & Planning",
  "student_understanding_level": "high|medium|low",
  "strengths": ["strength 1", "strength 2"],
  "weak_areas": ["area 1", "area 2"],
  "red_flags": ["flag 1"] or [],
  "mentor_recommendation": "recommended action",
  "feedback_for_student": "guidance for next steps"
}
```

---

## Files Modified/Created

### Backend
- `supabase/functions/bodhit-chat/index.ts` — Updated system prompt (Project-Skill Chatbot rules)
- `supabase/migrations/20260202_create_mentor_reports_table.sql` — New migration for mentor_reports table

### Frontend
- `src/components/FloatingAIChat.tsx` — Pass submissionId prop
- `src/components/ide/AIChatPanel.tsx` — Parse intake, extract MENTOR_REPORT, save to DB
- `src/pages/StudentDashboard.tsx` — Add mentor reports UI, fetch user role

### Tests
- `test-chatbot-simulation.ts` — Complete simulation with all test cases passing ✅

---

## Next Steps

1. ✅ Run the SQL migration in Supabase
2. ✅ Deploy the function: `supabase functions deploy bodhit-chat`
3. ✅ Test in your local dev environment
4. ✅ Monitor function logs for errors
5. ✅ Invite mentors to view reports in the dashboard

---

## Support

For issues or questions:
- Check function logs: `supabase functions logs bodhit-chat --follow`
- Review the test results: See `CHATBOT_SIMULATION_RESULTS.md`
- Check browser console for frontend errors
- Verify all environment variables are set correctly
