import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
      provider = "both"
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

    let allIdeas: any[] = [];

    // Generate ideas from OpenAI if selected
    if (provider === "openai" || provider === "both") {
      const openaiKey = Deno.env.get('OPENAI_API_KEY');
      if (!openaiKey) {
        console.warn("OpenAI API key not configured");
      } else {
        try {
          console.log("Calling OpenAI API...");
          const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openaiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                { role: 'system', content: 'You are an expert software project advisor with deep knowledge of modern technologies and real-world applications. Generate practical, innovative project ideas that solve real problems.' },
                { role: 'user', content: prompt }
              ],
              temperature: 0.7,
              max_tokens: 2000,
            }),
          });

          if (!openaiResponse.ok) {
            const error = await openaiResponse.text();
            console.error('OpenAI API error:', error);
          } else {
            const openaiData = await openaiResponse.json();
            const openaiContent = openaiData.choices[0].message.content;
            
            // Clean the response - remove markdown code blocks if present
            let cleanContent = openaiContent.trim();
            if (cleanContent.startsWith('```json')) {
              cleanContent = cleanContent.replace(/```json\n?/, '').replace(/\n?```$/, '');
            } else if (cleanContent.startsWith('```')) {
              cleanContent = cleanContent.replace(/```\n?/, '').replace(/\n?```$/, '');
            }
            
            try {
              const openaiIdeas = JSON.parse(cleanContent);
              allIdeas = allIdeas.concat(Array.isArray(openaiIdeas) ? openaiIdeas : [openaiIdeas]);
              console.log(`Generated ${allIdeas.length} ideas from OpenAI`);
            } catch (parseError) {
              console.error('Error parsing OpenAI response:', parseError);
            }
          }
        } catch (error) {
          console.error('OpenAI API call failed:', error);
        }
      }
    }

    // Generate ideas from Gemini if selected
    if (provider === "gemini" || provider === "both") {
      const geminiKey = Deno.env.get('GEMINI_API_KEY');
      if (!geminiKey) {
        console.warn("Gemini API key not configured");
      } else {
        try {
          console.log("Calling Gemini API...");
          const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiKey}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contents: [{
                  parts: [{
                    text: prompt + "\n\nIMPORTANT: Return ONLY valid JSON array, no markdown formatting."
                  }]
                }],
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 2048,
                }
              }),
            }
          );

          if (!geminiResponse.ok) {
            const error = await geminiResponse.text();
            console.error('Gemini API error:', error);
          } else {
            const geminiData = await geminiResponse.json();
            const geminiContent = geminiData.candidates[0].content.parts[0].text;
            
            // Clean the response - remove markdown code blocks if present
            let cleanContent = geminiContent.trim();
            if (cleanContent.startsWith('```json')) {
              cleanContent = cleanContent.replace(/```json\n?/, '').replace(/\n?```$/, '');
            } else if (cleanContent.startsWith('```')) {
              cleanContent = cleanContent.replace(/```\n?/, '').replace(/\n?```$/, '');
            }
            
            try {
              const geminiIdeas = JSON.parse(cleanContent);
              allIdeas = allIdeas.concat(Array.isArray(geminiIdeas) ? geminiIdeas : [geminiIdeas]);
              console.log(`Generated ${allIdeas.length} total ideas (including Gemini)`);
            } catch (parseError) {
              console.error('Error parsing Gemini response:', parseError);
            }
          }
        } catch (error) {
          console.error('Gemini API call failed:', error);
        }
      }
    }

    if (allIdeas.length === 0) {
      throw new Error("No ideas generated from AI providers. Please check API keys and try again.");
    }

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

    // If using both providers, merge and deduplicate ideas
    let finalIdeas = allIdeas;
    if (provider === "both" && allIdeas.length > 5) {
      // Take best ideas from both providers
      finalIdeas = allIdeas.slice(0, 5);
    }

    // Store projects in database
    const projects = [];
    for (const idea of finalIdeas) {
      try {
        const { data: project, error: insertError } = await supabase
          .from('projects')
          .insert({
            user_id: user.id,
            title: idea.title || 'Untitled Project',
            description: idea.description || idea.realWorldApplication || 'No description',
            technologies: idea.techStack || safeTechnologies,
            project_type: projectType,
            domain: safeDomains,
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
