import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    console.log("Received request data:", requestData);
    
    const {
      goal = "Unknown",
      projectType = "web",
      projectKind = "fullstack",
      domains = [],
      stackPreference = "modern",
      purpose = "learning",
      timePlan = "1-2 months",
      realWorldArea = [],
      complexity = "intermediate",
      technologies = [],
      skillLevel = "intermediate",
      educationRole = "developer",
    } = requestData;

    // Ensure arrays are valid
    const safeDomains = Array.isArray(domains) ? domains : [];
    const safeTechnologies = Array.isArray(technologies) ? technologies : [];
    const safeRealWorldArea = Array.isArray(realWorldArea) ? realWorldArea : [];

    console.log("Processing with domains:", safeDomains, "technologies:", safeTechnologies);

    const prompt = `You are an expert project advisor helping developers find the perfect project to build. Generate 3-5 unique, innovative, and real-world applicable project ideas based on these comprehensive preferences:

**User Profile:**
- Goal: ${goal}
- Project Type: ${projectType}
- Project Kind: ${projectKind}
- Education/Role: ${educationRole}
- Skill Level: ${skillLevel}

**Project Requirements:**
- Domains: ${safeDomains.length > 0 ? safeDomains.join(", ") : "General"}
- Stack Preference: ${stackPreference}
- Purpose: ${purpose}
- Time Commitment: ${timePlan}
- Complexity: ${complexity}
- Preferred Technologies: ${safeTechnologies.length > 0 ? safeTechnologies.join(", ") : "Any modern stack"}
- Real-World Focus Areas: ${safeRealWorldArea.length > 0 ? safeRealWorldArea.join(", ") : "General applications"}

**Instructions:**
1. Generate projects that are REALISTIC and ACHIEVABLE within the specified timeframe
2. Projects should align with the user's goal and solve REAL problems in the specified domains
3. Include current, trending technologies where appropriate
4. Consider the user's skill level when suggesting complexity
5. Make each project unique and exciting

For each project idea, provide:
{
  "title": "Engaging project name",
  "description": "Detailed 3-4 sentence description explaining what it does and why it's valuable",
  "keyFeatures": ["Feature 1", "Feature 2", "Feature 3", "Feature 4", "Feature 5"],
  "techStack": ["Tech 1", "Tech 2", "Tech 3", "Tech 4"],
  "estimatedTime": "Realistic timeframe",
  "difficulty": "beginner/intermediate/advanced",
  "learningOutcomes": ["Skill 1", "Skill 2", "Skill 3"],
  "realWorldApplication": "How this solves a real problem",
  "targetAudience": "Who would use this",
  "uniqueValue": "What makes this project stand out"
}

Return ONLY a valid JSON array with 3-5 project objects. No markdown, no explanations, just the JSON array.`;

    // Get Lovable AI Gateway API key
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log("Calling Lovable AI Gateway...");
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert software project advisor. Return only valid JSON arrays without markdown formatting.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 4000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a few moments.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your Lovable AI workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    let responseText = aiData.choices[0].message.content.trim();
    
    // Remove markdown code blocks if present
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    console.log("AI response received, parsing...");
    const allIdeas = JSON.parse(responseText);
    const ideasArray = Array.isArray(allIdeas) ? allIdeas : [allIdeas];

    if (ideasArray.length === 0) {
      throw new Error("No project ideas could be generated");
    }

    console.log(`Generated ${ideasArray.length} project ideas`);

    // Get the authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Store projects in database
    const projects = [];
    for (const idea of ideasArray) {
      try {
        const { data: project, error: insertError } = await supabase
          .from('projects')
          .insert({
            user_id: user.id,
            title: idea.title || 'Untitled Project',
            description: idea.description || idea.realWorldApplication || 'No description',
            technologies: idea.techStack || safeTechnologies,
            project_type: projectType,
            domain: safeDomains.length > 0 ? safeDomains : ['General'],
            complexity: idea.difficulty || complexity,
            skill_level: skillLevel,
            purpose: purpose,
            time_commitment: idea.estimatedTime || timePlan,
            overview: JSON.stringify({
              keyFeatures: idea.keyFeatures || [],
              learningOutcomes: idea.learningOutcomes || [],
              realWorldApplication: idea.realWorldApplication || '',
              targetAudience: idea.targetAudience || '',
              uniqueValue: idea.uniqueValue || '',
            }),
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error inserting project:', insertError);
        } else if (project) {
          projects.push(project);
        }
      } catch (error) {
        console.error('Error processing idea:', error);
      }
    }

    console.log(`Successfully stored ${projects.length} projects`);

    return new Response(
      JSON.stringify({ projects }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-project-ideas:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to generate ideas' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
