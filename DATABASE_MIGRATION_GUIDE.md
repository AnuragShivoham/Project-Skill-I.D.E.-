# Database Migration Guide - Switch to New Database

## Current Setup

### Database Type
- **Current**: Supabase (PostgreSQL)
- **Provider**: Supabase.io (Firebase-like backend)
- **Tables Used**: 
  - conversations
  - messages
  - mentor_reports
  - progress_entries
  - project_submissions (referenced)
  - user_roles (referenced)

---

## Step 1: Gather Current Credentials

### Required Supabase Credentials (Find in Supabase Dashboard)

| Credential | Where to Find | Current Value | Purpose |
|-----------|--------------|---------------|---------|
| `VITE_SUPABASE_URL` | Settings → API → Project URL | `https://your-project.supabase.co` | Database connection URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Settings → API → Public (anon) key | `eyJhbGciOi...` | Public frontend access |
| `SUPABASE_SERVICE_ROLE_KEY` | Settings → API → Service role key | `eyJhbGciOi...` (longer) | Backend/admin access |
| `SUPABASE_DB_PASSWORD` | Settings → Database → Password | (not in code, for direct access) | Direct PostgreSQL connection |
| `SUPABASE_HOST` | Settings → Database → Host | `db.your-project.supabase.co` | PostgreSQL host |
| `SUPABASE_USER` | Settings → Database → User | `postgres` | PostgreSQL user |
| `SUPABASE_DB` | Settings → Database → Database | `postgres` | Database name |
| `SUPABASE_PORT` | Settings → Database → Port | `5432` | PostgreSQL port |

**Action**: Copy these values to a secure location before switching databases.

---

## Step 2: New Database Credentials

### For PostgreSQL (Recommended)

If switching to a new PostgreSQL provider (e.g., AWS RDS, DigitalOcean, Railway, Render):

```env
# Frontend Configuration (Vite)
VITE_DATABASE_URL=postgresql://user:password@host:5432/dbname
VITE_DATABASE_PROVIDER=postgresql  # or 'custom-backend'
VITE_API_URL=https://your-api.example.com  # If using custom backend

# Backend Configuration (for Edge Functions or API)
DATABASE_URL=postgresql://user:password@host:5432/dbname
DATABASE_HOST=your-host.example.com
DATABASE_PORT=5432
DATABASE_USER=your_user
DATABASE_PASSWORD=your_password
DATABASE_NAME=your_db_name

# If using Supabase again with different project:
VITE_SUPABASE_URL=https://new-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-new-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-new-service-role-key
```

### For Firebase (Alternative)

If switching to Firebase Realtime Database or Firestore:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

### For MongoDB (Alternative)

```env
VITE_MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname
VITE_MONGODB_DATABASE=your_db_name
```

---

## Step 3: Code Files That Need Changes

### Files Using Supabase Client

| File | Change Required | Details |
|------|-----------------|---------|
| `src/integrations/supabase/client.ts` | **CRITICAL** | Update client initialization |
| `src/services/ConversationService.ts` | **CRITICAL** | Replace `.from()` calls with new DB driver |
| `src/services/ProgressService.ts` | **CRITICAL** | Replace Supabase calls |
| `src/pages/Auth.tsx` | Update if using Supabase Auth | Switch to new auth provider |
| `src/pages/StudentDashboard.tsx` | Update query calls | May use Supabase queries |
| `src/pages/MentorDashboard.tsx` | Update query calls | Admin/mentor data fetching |
| `src/pages/AdminDashboard.tsx` | Update query calls | Admin functionality |
| `src/hooks/useConversationHistory.ts` | **CRITICAL** | Replace service calls |
| `src/hooks/useProgress.tsx` | Update if persisting | Progress saving |
| `src/supabase/functions/bodhit-chat/index.ts` | Update if using Edge Functions | Chat function backend |
| `.env.local` | **REQUIRED** | Environment variables |
| `vite.config.ts` | May need env variable aliases | If using different env structure |

---

## Step 4: Database Schema SQL

### Tables to Create in New Database

Copy-paste into your new database admin:

```sql
-- Users table (if not using auth provider)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  role VARCHAR(50) DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project submissions table
CREATE TABLE IF NOT EXISTS project_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conversations table (BODHIT Chat)
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES project_submissions(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Conversation',
  project_idea TEXT,
  tech_stack TEXT,
  skill_level TEXT,
  timeline TEXT,
  intake_confirmed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_message_at TIMESTAMP
);

-- Messages table (Chat history)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'explanation' CHECK (message_type IN ('explanation', 'hint', 'question', 'warning')),
  file_ops JSONB,
  mentor_report JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mentor reports table
CREATE TABLE IF NOT EXISTS mentor_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES project_submissions(id) ON DELETE CASCADE,
  report JSONB NOT NULL,
  raw_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Progress entries table
CREATE TABLE IF NOT EXISTS progress_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES project_submissions(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  files_snapshot JSONB,
  meta JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_submission_id ON conversations(submission_id);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at ASC);
CREATE INDEX idx_mentor_reports_submission_id ON mentor_reports(submission_id);
CREATE INDEX idx_progress_entries_user_id ON progress_entries(user_id);
CREATE INDEX idx_project_submissions_user_id ON project_submissions(user_id);
```

---

## Step 5: Code Changes Required

### 5.1 Update `src/integrations/supabase/client.ts`

**Current Code:**
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**If switching to custom PostgreSQL:**
```typescript
// Option 1: Use a custom backend API instead of direct Supabase
export const api = {
  async query(endpoint: string, method: string = 'GET', body?: any) {
    const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    })
    if (!response.ok) throw new Error(await response.text())
    return response.json()
  },
}

export const supabase = api // For compatibility
```

**If switching to Firebase:**
```typescript
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
```

### 5.2 Update `src/services/ConversationService.ts`

**Current (Supabase):**
```typescript
const { data, error } = await supabase
  .from("conversations")
  .select("*, messages(*)")
  .eq("user_id", user.id)
  .order("updated_at", { ascending: false })
```

**For Custom PostgreSQL API:**
```typescript
const response = await fetch(`${import.meta.env.VITE_API_URL}/api/conversations`, {
  headers: {
    Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
  },
})
const data = await response.json()
```

**For Firebase Firestore:**
```typescript
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { auth, db } from '@/integrations/firebase/client'

const q = query(
  collection(db, 'conversations'),
  where('userId', '==', auth.currentUser?.uid),
  orderBy('updatedAt', 'desc')
)
const snapshot = await getDocs(q)
const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
```

---

## Step 6: Environment Variables Checklist

### Create `.env.local` in project root

```env
# ========== CURRENT SUPABASE (TO BE REMOVED) ==========
# VITE_SUPABASE_URL=https://old-project.supabase.co
# VITE_SUPABASE_PUBLISHABLE_KEY=old-key

# ========== NEW DATABASE CREDENTIALS ==========

# For PostgreSQL (via custom backend API)
VITE_API_URL=https://api.example.com
VITE_DATABASE_URL=postgresql://user:password@host:5432/dbname

# For Supabase (new project)
VITE_SUPABASE_URL=https://new-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=new-anon-key
SUPABASE_SERVICE_ROLE_KEY=new-service-role-key

# For Firebase
# VITE_FIREBASE_API_KEY=your_key
# VITE_FIREBASE_AUTH_DOMAIN=your.firebaseapp.com
# VITE_FIREBASE_PROJECT_ID=your_project_id

# Auth & Security
VITE_JWT_SECRET=your-secret-key
VITE_APP_ENV=development
```

---

## Step 7: Migration Strategy

### Option A: Parallel Setup (Recommended - Zero Downtime)

1. **Week 1**: Set up new database, create all tables, populate with test data
2. **Week 2**: Update code to write to both databases (dual-write)
3. **Week 3**: Update code to read from new database
4. **Week 4**: Migrate historical data, test thoroughly
5. **Week 5**: Switch to new database only, keep old as backup
6. **Week 6**: Archive old database

### Option B: Direct Cutover (Faster - Some Risk)

1. Set up new database
2. Create all tables
3. Migrate all data via SQL export/import
4. Update all code files
5. Test thoroughly in staging
6. Deploy to production
7. Monitor for issues

---

## Step 8: Data Migration SQL

### Export from Old Database

```sql
-- In old Supabase SQL editor
SELECT * FROM conversations;
SELECT * FROM messages;
SELECT * FROM mentor_reports;
SELECT * FROM progress_entries;
```

### Import to New Database

```sql
-- In new database
COPY conversations (id, user_id, submission_id, title, project_idea, tech_stack, skill_level, timeline, intake_confirmed, created_at, updated_at, last_message_at)
FROM STDIN WITH (FORMAT csv, DELIMITER ',');

-- Or use custom script to import JSON/CSV files
```

---

## Step 9: Testing Checklist

- [ ] New database credentials working
- [ ] All tables created successfully
- [ ] Test data inserted
- [ ] API endpoints responding
- [ ] Authentication working
- [ ] Conversations load correctly
- [ ] Messages save and retrieve
- [ ] Progress snapshots persist
- [ ] File system works
- [ ] Chat streams properly
- [ ] No 404 or 500 errors
- [ ] Performance acceptable
- [ ] RLS/security policies working

---

## Step 10: Rollback Plan

If something goes wrong:

1. **Keep old database running for 2 weeks**
2. **Maintain both data sources in parallel**
3. **Have DNS/load balancer to switch back quickly**
4. **Archive data before deletion**
5. **Document all changes made**

---

## Summary Table: Required Changes

| Component | Current | Action | New |
|-----------|---------|--------|-----|
| Database | Supabase | Replace | PostgreSQL/Firebase/etc |
| Auth Client | supabase-js | Update/Replace | firebase-sdk / custom API |
| ConversationService | Supabase SDK | Rewrite | SQL/Firestore queries |
| ProgressService | Supabase SDK | Rewrite | SQL/Firestore queries |
| Environment | .env.local | Update | New credentials |
| Auth Provider | Supabase Auth | Replace | Firebase Auth / custom |
| Edge Functions | Supabase Functions | Migrate | Node.js / serverless |
| RLS Policies | Supabase RLS | Port | Database-native security |

---

## Support Matrix

| Database | Complexity | Cost | Speed | Recommendation |
|----------|-----------|------|-------|-----------------|
| Supabase (new) | Low | $25-100/mo | Fast | ✅ Easiest for team |
| PostgreSQL (AWS RDS) | Medium | $50-200/mo | Fast | Good for scale |
| PostgreSQL (Railway) | Medium | $5-50/mo | Fast | Budget-friendly |
| PostgreSQL (Render) | Medium | $7-50/mo | Fast | Popular |
| Firebase Firestore | Low | Pay-per-read | Medium | Mobile-friendly |
| MongoDB Atlas | Medium | $0-500+/mo | Medium | Popular for startups |

---

## Next Steps

1. **Decide new database provider** (Supabase/PostgreSQL/Firebase/MongoDB)
2. **Create new database** and get credentials
3. **Update .env.local** with new credentials
4. **Create database schema** in new database
5. **Update code files** listed in Step 3
6. **Test in development** environment
7. **Migrate data** if needed
8. **Deploy to staging** first
9. **Verify functionality**
10. **Deploy to production**

Would you like specific guidance on any of these steps?
