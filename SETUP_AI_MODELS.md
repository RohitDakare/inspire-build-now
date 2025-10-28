# Setup AI Models (Gemini & OpenAI) - Free Tier

## Goal
Use AI to generate personalized project ideas for users based on their preferences.

## Step 1: Get Free API Keys

### OpenAI (Free Tier Available)
1. Go to: https://platform.openai.com/signup
2. Sign up for an account
3. Add payment method (required for API access, but you get $5 free credit)
4. Navigate to: https://platform.openai.com/api-keys
5. Click "Create new secret key"
6. Name it: "inspire-build"
7. Copy the key (you won't see it again)

### Google Gemini (Completely Free)
1. Go to: https://makersuite.google.com/app/apikey
2. Click "Get API Key"
3. Sign in with your Google account
4. Create API key for free
5. Copy the key

## Step 2: Link Your Supabase Project

```bash
# Login to Supabase
supabase login

# Link your project
supabase link --project-ref uuxlmvpvwdavtftrjzzj
```

## Step 3: Add API Keys to Supabase

Go to Supabase Dashboard:
1. Navigate to: https://supabase.com/dashboard/project/uuxlmvpvwdavtftrjzzj/settings/functions
2. Scroll to "Secrets"
3. Add the following secrets:
   - Name: `OPENAI_API_KEY` → Value: your OpenAI key
   - Name: `GEMINI_API_KEY` → Value: your Gemini key

Or use CLI:

```bash
# Add secrets
supabase secrets set OPENAI_API_KEY=your-openai-key-here
supabase secrets set GEMINI_API_KEY=your-gemini-key-here
```

## Step 4: Deploy Edge Functions

```bash
# Deploy both functions
supabase functions deploy generate-project-ideas
supabase functions deploy generate-documentation
```

## Step 5: Test It!

1. Go to your app
2. Navigate to Generate page
3. Fill out the form with your preferences
4. Click "Generate Ideas"
5. You should see **real AI-generated projects**! 🎉

## How It Works

### Project Ideas (OpenAI)
- Uses GPT-4o-mini (affordable, fast)
- Generates 3-5 unique project ideas
- Based on: type, domain, complexity, tech stack, skill level
- Returns structured JSON with title, description, technologies

### Documentation (Gemini)
- Uses Gemini Pro (completely free!)
- Generates comprehensive project documentation
- Includes: introduction, analysis, design, implementation, testing, conclusion
- Ready for portfolio or academic use

## Cost Comparison

| Service | Free Tier | Cost After Free |
|---------|-----------|------------------|
| OpenAI | $5 credit | ~$0.15 per 1000 requests |
| Gemini | Unlimited free | Free tier limits apply |
| **Total** | **$5 + Unlimited Gemini** | **~$0.01 per generation** |

## API Limits

### OpenAI Free Tier
- $5 free credit
- GPT-4o-mini: ~$0.15 per 1M tokens
- Typical project idea: ~1000 tokens = $0.00015

### Gemini Free Tier
- 60 requests per minute
- Unlimited projects
- No credit card needed

## Verification

After deploying, check the logs:

```bash
# View function logs
supabase functions logs generate-project-ideas
supabase functions logs generate-documentation
```

## Troubleshooting

### "OPENAI_API_KEY is not configured"
- Make sure you set the secret in Supabase
- Check: https://supabase.com/dashboard/project/uuxlmvpvwdavtftrjzzj/settings/functions

### "Function not found"
- Deploy the function: `supabase functions deploy generate-project-ideas`

### "Rate limit exceeded"
- You're making too many requests
- Wait a minute or upgrade your plan

## Next Steps

Once deployed:
1. ✅ Users can generate AI-powered project ideas
2. ✅ Documentation auto-generated for each project
3. ✅ Personalized based on user preferences
4. ✅ Professional-quality content

## Estimated Deployment Time: 10 minutes

```bash
# 1. Get API keys (5 min)
# 2. Link project (1 min)
# 3. Add secrets (1 min)
# 4. Deploy functions (2 min)
# 5. Test (1 min)
```

Total: 10 minutes to unlock AI-powered project generation!

