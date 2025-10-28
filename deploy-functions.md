# Quick Deploy Guide for Supabase Edge Functions

## The Problem

The edge functions (`generate-project-ideas` and `generate-documentation`) are not deployed to Supabase yet, causing 500 errors.

## Quick Fix Applied

I've added a **fallback mechanism** that creates mock projects when the edge function fails. This allows you to test the app while you deploy the functions.

The app will now:
1. Try to call the edge function
2. If it fails, create 3 mock projects based on your input
3. Show a message that mock data is being used

## To Deploy Edge Functions (Do This Next)

### Option 1: Using Supabase CLI (Recommended)

```bash
# 1. Install Supabase CLI
# Windows with Scoop:
scoop install supabase

# Or download from: https://github.com/supabase/cli/releases

# 2. Login
supabase login

# 3. Link project
supabase link --project-ref uuxlmvpvwdavtftrjzzj

# 4. Deploy functions
supabase functions deploy generate-project-ideas
supabase functions deploy generate-documentation
```

### Option 2: Using Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/uuxlmvpvwdavtftrjzzj/functions
2. Click "Create a new function"
3. Name it: `generate-project-ideas`
4. Upload the code from `supabase/functions/generate-project-ideas/index.ts`
5. Repeat for `generate-documentation`

## Set Environment Variables

After deploying, add these secrets in Supabase Dashboard:

1. Navigate to: https://supabase.com/dashboard/project/uuxlmvpvwdavtftrjzzj/settings/functions
2. Add secrets:
   - `OPENAI_API_KEY` - Get from https://platform.openai.com/api-keys
   - `GEMINI_API_KEY` - Get from https://makersuite.google.com/app/apikey

## Test

After deployment, try generating projects again. The app will use real AI-generated ideas instead of mock data.

## Current Status

✅ **Frontend**: Fully working  
✅ **Database**: Connected and working  
⚠️ **Backend Functions**: Not deployed yet (using mock data as fallback)

