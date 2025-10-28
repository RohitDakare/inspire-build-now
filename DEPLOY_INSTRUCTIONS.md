# 🚀 Deploy AI-Powered Edge Functions - Quick Guide

## Current Status
- ✅ Edge functions code ready
- ✅ OpenAI integration ready
- ✅ Gemini integration ready
- ⏳ Functions not deployed yet

## Step-by-Step Deployment

### Step 1: Get Free API Keys (5 minutes)

#### OpenAI (Free $5 Credit)
1. Visit: https://platform.openai.com/signup
2. Create account and verify email
3. Add a payment method (required, but you get $5 free)
4. Go to: https://platform.openai.com/api-keys
5. Click "Create new secret key"
6. Copy and save the key (you'll need it!)

**OpenAI Key:** `sk-proj-...` 

#### Gemini (Completely Free)
1. Visit: https://makersuite.google.com/app/apikey
2. Click "Get API Key" 
3. Sign in with Google
4. Create API key
5. Copy and save the key

**Gemini Key:** `AIzaSy...`

### Step 2: Login to Supabase CLI

Open a new terminal and run:

```bash
# This will open your browser
supabase login

# Follow the authentication flow in browser
```

### Step 3: Link Your Project

```bash
supabase link --project-ref uuxlmvpvwdavtftrjzzj
```

### Step 4: Add Secrets to Supabase

**Option A: Using Dashboard (Easier)**
1. Go to: https://supabase.com/dashboard/project/uuxlmvpvwdavtftrjzzj/settings/functions
2. Find "Secret keys" section
3. Click "Add secret"
4. Add two secrets:
   - Name: `OPENAI_API_KEY`, Value: your OpenAI key
   - Name: `GEMINI_API_KEY`, Value: your Gemini key
5. Click "Save"

**Option B: Using CLI**
```bash
supabase secrets set OPENAI_API_KEY="sk-proj-..."
supabase secrets set GEMINI_API_KEY="AIzaSy..."
```

### Step 5: Deploy Functions

```bash
# Deploy project ideas generator (OpenAI)
supabase functions deploy generate-project-ideas

# Deploy documentation generator (Gemini)
supabase functions deploy generate-documentation
```

### Step 6: Verify Deployment

Check function URLs:
- https://uuxlmvpvwdavtftrjzzj.supabase.co/functions/v1/generate-project-ideas
- https://uuxlmvpvwdavtftrjzzj.supabase.co/functions/v1/generate-documentation

## Test the AI Integration

1. Start your app: `npm run dev`
2. Go to Generate page
3. Fill the form:
   - **Project Type:** Web App
   - **Domains:** Healthcare
   - **Purpose:** Portfolio Project
   - **Technologies:** React, Node.js
   - **Skill Level:** Intermediate
4. Click "Generate Ideas"
5. **You should see AI-generated projects!** 🎉

## What Users Will Get

### AI-Generated Project Ideas
- **Personalized** based on their inputs
- **Unique** title and description
- **Technology stack** recommendations
- **Complexity** matched to skill level
- **Domain-specific** suggestions

### AI-Generated Documentation
- Professional project documentation
- System analysis and design
- Implementation guide
- Testing strategy
- References and resources

## Cost Breakdown (With Free Tiers)

| Feature | Model | Cost per Request |
|---------|-------|------------------|
| Project Ideas | GPT-4o-mini | ~$0.00015 |
| Documentation | Gemini Pro | FREE |
| **Total** | - | **~$0.00015** |

**Your $5 OpenAI credit = ~33,000 project generations!**

## Troubleshooting

### "Cannot use automatic login"
- Run `supabase login` in a terminal (not in script)
- Complete browser authentication

### "OPENAI_API_KEY is not configured"
- Check secret is added in Supabase Dashboard
- Verify spelling: `OPENAI_API_KEY` (all caps)

### "Function not found"
- Run: `supabase functions deploy generate-project-ideas`
- Wait for deployment to complete

### "Rate limit exceeded"
- Wait 60 seconds between requests
- Check API usage in dashboard

## After Deployment

Your app will now:
- ✅ Generate personalized project ideas with OpenAI
- ✅ Create professional documentation with Gemini
- ✅ Suggest projects based on user skills and preferences
- ✅ Save projects to database for user portfolio
- ✅ Work completely automatically

## Estimated Total Time: 10 minutes

```bash
# 1. Get API keys (5 min)
# 2. Login to CLI (1 min)
# 3. Link project (30 sec)
# 4. Add secrets (1 min)  
# 5. Deploy functions (1 min)
# 6. Test (1 min)
```

## Next: Commit Changes

```bash
git add .
git commit -m "Add AI integration and edge function deployment"
git push
```

Done! Your app now uses AI to generate personalized project ideas! 🚀

