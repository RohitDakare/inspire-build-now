# Supabase PostgreSQL Connection Guide

## Database Connection Details

```
Host: db.uuxlmvpvwdavtftrjzzj.supabase.co
Port: 5432
Database: postgres
Username: postgres
Password: qwertyuiop@1234567890
```

## Connection Options

### Option 1: Using Node.js (Recommended for this project)

You can connect using the `pg` package that's likely already installed.

Create a test script:

```typescript
// test-connection.ts
import { Client } from 'pg';

const client = new Client({
  host: 'db.uuxlmvpvwdavtftrjzzj.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'qwertyuiop@1234567890',
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  try {
    await client.connect();
    console.log('✅ Connected to Supabase PostgreSQL!');
    
    const result = await client.query('SELECT NOW() as current_time');
    console.log('Current time:', result.rows[0].current_time);
    
    await client.end();
  } catch (err) {
    console.error('❌ Connection failed:', err);
  }
}

testConnection();
```

### Option 2: Using GUI Tools

#### 1. DBeaver (Free, Cross-platform)
- Download: https://dbeaver.io/download/
- Connection details:
  - Database: PostgreSQL
  - Host: db.uuxlmvpvwdavtftrjzzj.supabase.co
  - Port: 5432
  - Database: postgres
  - Username: postgres
  - Password: qwertyuiop@1234567890
  - Enable SSL

#### 2. pgAdmin (Free, Cross-platform)
- Download: https://www.pgadmin.org/download/
- Create a new server with the connection details above

#### 3. TablePlus (Paid, Mac & Windows)
- Download: https://tableplus.com/
- Create a PostgreSQL connection with the details above

### Option 3: Using Supabase Studio (Web-based)
- Visit: https://supabase.com/dashboard/project/uuxlmvpvwdavtftrjzzj
- Click on "SQL Editor" to run queries

### Option 4: Using Command Line Tools

#### Install psql (PostgreSQL Client)

**Windows:**
```powershell
# Using Chocolatey
choco install postgresql

# Using Scoop
scoop install postgresql

# Or download from: https://www.postgresql.org/download/windows/
```

**After installation, connect:**
```bash
psql -h db.uuxlmvpvwdavtftrjzzj.supabase.co -p 5432 -U postgres -d postgres
```

## Using with the Supabase Client (Already Configured)

Your project already has the Supabase client configured. You can use it directly:

```typescript
// In any component or page
import { supabase } from "@/integrations/supabase/client";

// Query data
const { data, error } = await supabase
  .from('profiles')
  .select('*');

// Insert data
const { data, error } = await supabase
  .from('projects')
  .insert({ title: 'My Project', ... });
```

## Connection String Format

Full connection string:
```
postgresql://postgres:qwertyuiop@1234567890@db.uuxlmvpvwdavtftrjzzj.supabase.co:5432/postgres
```

## Important Notes

1. **Enable SSL**: Always connect with SSL enabled (Supabase requires it)
2. **Use Environment Variables**: Don't hardcode credentials in your code
3. **Connection Pooling**: Supabase provides connection pooling at port 5432
4. **Rate Limits**: Be aware of Supabase's rate limits on the free tier

## Security Warning

⚠️ **Never commit this connection string to public repositories!**

Consider using environment variables:

```env
SUPABASE_DB_HOST=db.uuxlmvpvwdavtftrjzzj.supabase.co
SUPABASE_DB_PORT=5432
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=qwertyuiop@1234567890
```

