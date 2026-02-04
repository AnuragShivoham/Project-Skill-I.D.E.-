# Database Credentials Checklist & Code Changes

## SECTION 1: Current Supabase Credentials (Collect These)

### Where to Find Each Credential

**Location**: Supabase Dashboard → Project Settings → API

| # | Credential Name | Example Format | Where to Find | Usage |
|---|-----------------|-----------------|---------------|-------|
| 1 | `VITE_SUPABASE_URL` | `https://abcdefgh.supabase.co` | Settings → API → Project URL | Frontend database URL |
| 2 | `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGc...` (56 chars) | Settings → API → Public (anon) key | Public API access |
| 3 | `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` (216+ chars) | Settings → API → Service Role secret | Backend/admin operations |
| 4 | `SUPABASE_DB_PASSWORD` | (you set this) | Settings → Database → Password reset | Direct PostgreSQL access |
| 5 | `SUPABASE_HOST` | `db.abcdefgh.supabase.co` | Settings → Database → Connection info | DB hostname |
| 6 | `SUPABASE_USER` | `postgres` | Settings → Database → Connection info | DB username |
| 7 | `SUPABASE_DB` | `postgres` | Settings → Database → Connection info | Database name |
| 8 | `SUPABASE_PORT` | `5432` | Settings → Database → Connection info | DB port |

### Current Credentials to Save (KEEP SECURE)

```
CURRENT SETUP BACKUP:
======================

Project Name: ________________
Project URL: ________________
VITE_SUPABASE_URL: ________________
VITE_SUPABASE_PUBLISHABLE_KEY: ________________
SUPABASE_SERVICE_ROLE_KEY: ________________
DB Host: ________________
DB User: ________________
DB Password: ________________ (DO NOT LOSE)
DB Name: ________________

Saved Date: ______________
Backup Location: ______________
```

---

## SECTION 2: New Database Provider Options & Credentials

### Option A: Supabase (Same provider, new project)

**Setup Time**: 5 minutes  
**Cost**: Free tier available, then $25-100/month  
**Pros**: Same tech stack, minimal code changes

**Credentials Needed**:
```
NEW SUPABASE PROJECT:
=====================
VITE_SUPABASE_URL=https://new-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

**Steps**:
1. Go to supabase.io → Create new project
2. Wait for project to initialize (2-3 min)
3. Go to Settings → API → Copy all keys
4. Paste into `.env.local`

---

### Option B: Firebase (Different approach - document-based)

**Setup Time**: 10 minutes  
**Cost**: Free tier available, then pay-per-read  
**Pros**: Real-time capabilities, good for mobile

**Credentials Needed**:
```
VITE_FIREBASE_API_KEY=AIzaSyD...
VITE_FIREBASE_AUTH_DOMAIN=my-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=my-project-123456
VITE_FIREBASE_STORAGE_BUCKET=my-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
VITE_FIREBASE_DATABASE_URL=https://my-project.firebaseio.com
```

**Steps**:
1. Go to firebase.google.com → Create project
2. Register web app
3. Copy config from Settings → Your apps
4. Paste into `.env.local`

---

### Option C: PostgreSQL (AWS RDS - self-managed)

**Setup Time**: 20 minutes  
**Cost**: $50-200/month  
**Pros**: Full control, scale easily

**Credentials Needed**:
```
VITE_DATABASE_URL=postgresql://admin:password@my-rds-instance.abc.us-east-1.rds.amazonaws.com:5432/mydb
DATABASE_HOST=my-rds-instance.abc.us-east-1.rds.amazonaws.com
DATABASE_PORT=5432
DATABASE_USER=admin
DATABASE_PASSWORD=your-password
DATABASE_NAME=mydb
```

**Steps**:
1. AWS Console → RDS → Create database
2. Choose PostgreSQL
3. Copy endpoint after creation
4. Note username and password
5. Format connection string

---

### Option D: PostgreSQL (Railway - simple hosting)

**Setup Time**: 10 minutes  
**Cost**: $5-50/month  
**Pros**: Super simple, good for startups

**Credentials Needed**:
```
VITE_DATABASE_URL=postgresql://postgres:password@containers-us-west-abc.railway.app:1234/railway
```

**Steps**:
1. Go to railway.app → New project
2. Add PostgreSQL plugin
3. Copy connection string from Variables tab
4. Paste as `VITE_DATABASE_URL`

---

### Option E: MongoDB Atlas (document database)

**Setup Time**: 10 minutes  
**Cost**: Free tier available, then $57+/month  
**Pros**: Flexible schema, good for NoSQL

**Credentials Needed**:
```
VITE_MONGODB_URI=mongodb+srv://user:password@cluster0.abc123.mongodb.net/mydb?retryWrites=true&w=majority
VITE_MONGODB_DATABASE=mydb
```

**Steps**:
1. Go to mongodb.com/cloud/atlas → Create account
2. Create cluster
3. Add database user
4. Get connection string
5. Replace username/password placeholders

---

## SECTION 3: Code Files to Update

### Critical Files (Must Update)

#### File 1: `src/integrations/supabase/client.ts`

**Current Code** (Supabase):
```typescript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
)
```

**Option A: Stay with Supabase (New Project)**
```typescript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,  // NEW: https://new-project.supabase.co
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY  // NEW: anon key
)
```

**Option B: Custom Backend API**
```typescript
export const api = {
  async request(endpoint: string, method: string = 'GET', body?: any) {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}${endpoint}`,
      {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      }
    )
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }
    return response.json()
  },
}

export const supabase = api
```

**Option C: Firebase**
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

---

#### File 2: `src/services/ConversationService.ts`

**Lines 1-50: Current Import**
```typescript
import { supabase } from "@/integrations/supabase/client";

export async function loadUserConversations(): Promise<Conversation[]> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("conversations")
      .select("*, messages(*)")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
```

**Replace With (Firebase)**:
```typescript
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db, auth } from '@/integrations/firebase/client'

export async function loadUserConversations(): Promise<Conversation[]> {
  try {
    if (!auth.currentUser) return []

    const q = query(
      collection(db, 'conversations'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('updatedAt', 'desc')
    )
    const snapshot = await getDocs(q)
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
```

**Replace With (Custom API)**:
```typescript
export async function loadUserConversations(): Promise<Conversation[]> {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/conversations`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      }
    )
    if (!response.ok) throw new Error('Failed to load conversations')
    const data = await response.json()
```

---

#### File 3: `src/services/ProgressService.ts`

Similar changes as ConversationService - replace all `.from()` calls with appropriate database driver.

---

#### File 4: `src/hooks/useConversationHistory.ts`

Update to use new ProgressService and ConversationService (should work automatically after Files 2-3 are updated).

---

### Files to Check (May Need Updates)

| File | Check If | Update If |
|------|----------|-----------|
| `src/pages/Auth.tsx` | Using Supabase Auth | Switching to Firebase Auth or custom auth |
| `src/pages/StudentDashboard.tsx` | Uses `supabase.from()` | Yes, need to update queries |
| `src/pages/MentorDashboard.tsx` | Uses `supabase.from()` | Yes, need to update queries |
| `src/pages/AdminDashboard.tsx` | Uses `supabase.from()` | Yes, need to update queries |
| `src/pages/Progress.tsx` | Uses ProgressService | Should work after ProgressService update |
| `.env.local` | Current credentials | Replace with new ones |
| `vite.config.ts` | Env variable aliases | May need to add new variables |

---

## SECTION 4: Environment Variables Setup

### Step 1: Create `.env.local` in Project Root

```bash
# Windows PowerShell
cd forge-learn
Copy-Item .env.example .env.local  # if template exists
notepad .env.local  # open for editing
```

### Step 2: Add All Credentials

**For Supabase Option**:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-role-key
```

**For Custom API Option**:
```env
VITE_API_URL=https://api.example.com
VITE_DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

**For Firebase Option**:
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=my-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=my-project
VITE_FIREBASE_STORAGE_BUCKET=my-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc
VITE_FIREBASE_DATABASE_URL=https://my-project.firebaseio.com
```

### Step 3: Save and Test

```bash
npm run dev
# Should start without credentials errors
```

---

## SECTION 5: Database Schema to Create

### Create All Tables in New Database

```sql
-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conversations Table (Core)
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  submission_id UUID,
  title TEXT NOT NULL DEFAULT 'Untitled',
  project_idea TEXT,
  tech_stack TEXT,
  skill_level TEXT,
  timeline TEXT,
  intake_confirmed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_message_at TIMESTAMP
);

-- Messages Table (Core)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'explanation',
  file_ops JSONB,
  mentor_report JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Progress Entries Table (Core)
CREATE TABLE progress_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  submission_id UUID,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  files_snapshot JSONB,
  meta JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mentor Reports Table (Core)
CREATE TABLE mentor_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL,
  report JSONB NOT NULL,
  raw_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for Performance
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_progress_entries_user_id ON progress_entries(user_id);
```

---

## SECTION 6: Quick Reference - What Changes Where

### Summary Matrix

| Aspect | Current (Supabase) | New Setup | Action |
|--------|-------------------|-----------|--------|
| **Client File** | `src/integrations/supabase/client.ts` | Same file | Update import/client init |
| **Service Files** | `ConversationService.ts` | Same file | Replace query syntax |
| **Environment** | `.env.local` | `.env.local` | Replace all `VITE_SUPABASE_*` |
| **Dependencies** | `@supabase/supabase-js` | Varies | May need `npm install` |
| **Authentication** | Supabase Auth | Varies | Update auth flow |
| **Database URL** | https://...supabase.co | Varies | Update connection string |
| **API Calls** | `.from().select()` | `.request()` or Firestore | Rewrite queries |

---

## SECTION 7: Credentials Template to Fill In

### SAVE THIS - Completed Checklist

```
MIGRATION CREDENTIALS CHECKLIST
================================

DATE: ________________________
MIGRATED BY: ________________________
APPROVED BY: ________________________

OLD DATABASE (BACKUP):
======================
Supabase Project URL: ___________________________
Service Role Key: ___________________________
Database Password: ___________________________
Backup Location: ___________________________

NEW DATABASE SETUP:
===================
Provider Chosen: ☐ Supabase  ☐ Firebase  ☐ PostgreSQL  ☐ MongoDB  ☐ Other: ___________

Credentials:
- URL/Host: ___________________________
- Username: ___________________________
- Password: ___________________________
- Database Name: ___________________________
- API Key (if needed): ___________________________

Environment File (.env.local):
- Location: forge-learn/.env.local
- Variables Added: ☐ Yes
- Tested: ☐ Yes
- Variables: 
  - VITE_DATABASE_URL or equivalent: ___________________________
  - Other key 1: ___________________________
  - Other key 2: ___________________________

Code Files Updated:
- ☐ src/integrations/supabase/client.ts
- ☐ src/services/ConversationService.ts
- ☐ src/services/ProgressService.ts
- ☐ src/hooks/useConversationHistory.ts
- ☐ (other auth files if needed)

Database Schema:
- ☐ All tables created
- ☐ All indexes created
- ☐ Test data inserted
- ☐ Verified connections work

Testing:
- ☐ npm run dev works
- ☐ No console errors
- ☐ Conversations load
- ☐ Messages save/retrieve
- ☐ Progress persists
- ☐ Auth working

Production Checklist:
- ☐ Staging environment tested
- ☐ Data migration complete
- ☐ Rollback plan documented
- ☐ Monitoring set up
- ☐ Team notified
- ☐ Ready for deployment: ☐ Yes  ☐ No

SIGN OFF: ________________________ DATE: ____________
```

---

## Next Actions

1. **Choose your new database** (Supabase, Firebase, PostgreSQL, etc.)
2. **Create new database** and collect credentials
3. **Update `.env.local`** with new credentials
4. **Update code files** (client.ts, ConversationService.ts, etc.)
5. **Create database schema** in new database
6. **Test locally** with `npm run dev`
7. **Deploy to staging** for full testing
8. **Migrate data** if keeping old data
9. **Deploy to production**
10. **Monitor** for issues

Which database provider are you choosing?
