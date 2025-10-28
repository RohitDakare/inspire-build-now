# Supabase Database Connection Guide

## ✅ Current Status

Your Supabase connection is **working perfectly** through the API client!

**Connection Details:**
- Supabase URL: `https://uuxlmvpvwdavtftrjzzj.supabase.co`
- Project ID: `uuxlmvpvwdavtftrjzzj`
- Database: PostgreSQL
- API Status: ✅ Connected

## 🔧 Connection Methods

### Method 1: Using Supabase Client (Recommended - Already Working!)

Your project already has the Supabase client configured and working.

```typescript
import { supabase } from "@/integrations/supabase/client";

// Query data
const { data, error } = await supabase
  .from('profiles')
  .select('*');

// Insert data
const { data, error } = await supabase
  .from('projects')
  .insert({ 
    title: 'My Project',
    description: 'Description',
    // ... other fields
  });
```

**Test the connection:**
```bash
npm run test-supabase
```

### Method 2: Direct PostgreSQL Connection

For direct PostgreSQL access, you have several options:

#### Option A: Using GUI Tools

**1. Supabase Dashboard (Easiest)**
- Go to: https://supabase.com/dashboard/project/uuxlmvpvwdavtftrjzzj
- Click "SQL Editor" in the sidebar
- Run queries directly in the browser

**2. DBeaver (Recommended GUI Tool)**
- Download: https://dbeaver.io/download/
- Create new PostgreSQL connection:
  - Host: `db.uuxlmvpvwdavtftrjzzj.supabase.co`
  - Port: `5432`
  - Database: `postgres`
  - Username: `postgres`
  - Password: `qwertyuiop@1234567890`
  - Enable SSL/TLS

**3. pgAdmin**
- Download: https://www.pgadmin.org/download/
- Create new server with same credentials

**4. TablePlus**
- Download: https://tableplus.com/
- Create PostgreSQL connection with credentials above

#### Option B: Using Command Line (psql)

**Install PostgreSQL Client:**
```powershell
# Windows - Using Chocolatey
choco install postgresql

# Windows - Using Scoop
scoop install postgresql

# Or download from PostgreSQL website
```

**Connect:**
```bash
psql "postgresql://postgres:qwertyuiop@1234567890@db.uuxlmvpvwdavtftrjzzj.supabase.co:5432/postgres"
```

#### Option C: Using Node.js Script

```bash
npm run test-db
```

**Note:** Direct PostgreSQL connection might have network restrictions depending on your environment.

## 🗄️ Database Schema

Your database has the following tables:

### 1. profiles
```sql
- id (uuid)
- email (text)
- full_name (text)
- avatar_url (text)
- created_at (timestamp)
- updated_at (timestamp)
```

### 2. projects
```sql
- id (uuid)
- user_id (uuid)
- title (text)
- description (text)
- purpose (text)
- overview (text)
- project_type (text)
- complexity (text)
- skill_level (text)
- technologies (array)
- domain (array)
- time_commitment (text)
- pseudo_code (text)
- flowchart_data (jsonb)
- project_structure (jsonb)
- roadmap (jsonb)
- resource_links (jsonb)
- created_at (timestamp)
```

### 3. saved_projects
```sql
- id (uuid)
- user_id (uuid)
- project_id (uuid)
- saved_at (timestamp)
```

## 🧪 Testing Connections

### Test Supabase API:
```bash
npm run test-supabase
```

### Test Direct PostgreSQL:
```bash
npm run test-db
```

## 📝 Environment Variables

Create a `.env` file (already configured in client.ts):

```env
VITE_SUPABASE_URL=https://uuxlmvpvwdavtftrjzzj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🔒 Security Notes

1. **Never commit credentials** to version control
2. Use environment variables for sensitive data
3. The anon key is safe for client-side use
4. For server-side operations, use the service_role key
5. Always enable SSL/TLS for PostgreSQL connections

## 📚 Resources

- [Supabase Dashboard](https://supabase.com/dashboard/project/uuxlmvpvwdavtftrjzzj)
- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## ✅ Quick Start

Your connection is already working! Just use the Supabase client:

```typescript
import { supabase } from "@/integrations/supabase/client";

// Example: Get all projects
const { data: projects, error } = await supabase
  .from('projects')
  .select('*')
  .order('created_at', { ascending: false });
```

That's it! Your Supabase connection is ready to use. 🚀

