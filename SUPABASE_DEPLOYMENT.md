# Supabase Edge Functions Deployment Guide

## Current Issue

The edge function `generate-project-ideas` is returning a 500 error because it's not deployed or configured.

## Solution: Deploy Edge Functions

### Option 1: Deploy via Supabase CLI (Recommended)

**Step 1: Install Supabase CLI**

```bash
# Windows (using Scoop)
scoop install supabase

# Or download from: https://github.com/supabase/cli/releases
```

**Step 2: Login to Supabase**

```bash
supabase login
```

**Step 3: Link Your Project**

```bash
supabase link --project-ref uuxlmvpvwdavtftrjzzj
```

**Step 4: Deploy Edge Functions**

```bash
# Deploy all functions
supabase functions deploy

# Or deploy specific function
supabase functions deploy generate-project-ideas
supabase functions deploy generate-documentation
```

**Step 5: Set Environment Variables**

Go to Supabase Dashboard:
1. Navigate to: https://supabase.com/dashboard/project/uuxlmvpvwdavtftrjzzj/settings/functions
2. Add the following secrets:
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `GEMINI_API_KEY` - Your Google Gemini API key (for documentation)

### Option 2: Use Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/uuxlmvpvwdavtftrjzzj/functions
2. Upload the function files manually
3. Set environment variables

## Quick Fix: Mock Response

Since you're in development, you can temporarily mock the API response by modifying the Generate.tsx page to return test data.

## Environment Variables Needed

You need to set these in your Supabase project:

1. **OPENAI_API_KEY**: Get from https://platform.openai.com/api-keys
2. **GEMINI_API_KEY**: Get from https://makersuite.google.com/app/apikey

## Testing After Deployment

```bash
# Test the function locally
supabase functions serve generate-project-ideas

# Or test via curl
curl -X POST https://uuxlmvpvwdavtftrjzzj.supabase.co/functions/v1/generate-project-ideas \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"projectType":"web","domains":["Healthcare"],"purpose":"learning","complexity":"moderate","technologies":["React"],"skillLevel":"intermediate"}'
```

## Troubleshooting

### Error: "Unauthorized"
- Make sure the user is authenticated
- Check the Authorization header is being sent

### Error: "OPENAI_API_KEY is not configured"
- Set the environment variable in Supabase Dashboard
- Function Settings → Secrets → Add Secret

### Error: Function not found
- Deploy the function first
- Check the function name matches exactly

