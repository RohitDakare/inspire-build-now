# 🤖 AI Models Setup Summary

## What You Need

### 1. Free API Keys (Get them in 5 minutes)

**OpenAI (GPT-4o-mini)**
- Visit: https://platform.openai.com/signup  
- Get $5 free credit
- Key costs: ~$0.00015 per project idea
- Estimated: 33,000 free generations

**Gemini Pro (Completely Free)**
- Visit: https://makersuite.google.com/app/apikey
- Free tier with 60 requests/minute
- **No credit card required!**

### 2. Deploy Functions (3 commands)

```bash
# Login
supabase login

# Link project  
supabase link --project-ref uuxlmvpvwdavtftrjzzj

# Deploy
supabase functions deploy generate-project-ideas
supabase functions deploy generate-documentation
```

### 3. Add Secrets (2 minutes in dashboard)

Go to: https://supabase.com/dashboard/project/uuxlmvpvwdavtftrjzzj/settings/functions

Add:
- `OPENAI_API_KEY` = your OpenAI key
- `GEMINI_API_KEY` = your Gemini key

## Result

Users can now get **AI-powered project suggestions** based on:
- 💻 Project type (web/mobile/desktop/ML/game)
- 🏥 Domain (healthcare/education/finance/etc)
- 🎯 Purpose (portfolio/learning/hackathon/startup)
- ⚙️ Complexity (simple to very complex)
- 📚 Technologies (React, Python, etc.)
- 📊 Skill level (beginner/intermediate/advanced)

## What AI Generates

### 1. Project Ideas (OpenAI)
```
- Unique titles
- Descriptive summaries (2-3 sentences)
- Technology recommendations
- Matched to user's skill level
```

### 2. Documentation (Gemini)
```
- Introduction & overview
- System analysis
- Design & architecture  
- Implementation guide
- Testing strategy
- Conclusion & references
```

## Cost

**With Free Tiers:**
- OpenAI: $0.00015 per idea (first 33,000 are free)
- Gemini: FREE forever for documentation
- **Total cost per generation: ~$0.00015**

## Quick Start Checklist

- [ ] Get OpenAI API key
- [ ] Get Gemini API key  
- [ ] Login to Supabase CLI
- [ ] Link your project
- [ ] Add secrets to dashboard
- [ ] Deploy functions
- [ ] Test generation

**Total time: ~10 minutes**

## After Setup

Your app will:
- ✅ Use real AI (no mock data)
- ✅ Generate personalized projects
- ✅ Create professional documentation
- ✅ Work automatically with no errors

See `DEPLOY_INSTRUCTIONS.md` for detailed steps!

