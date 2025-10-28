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
    const { projectType, domains, purpose, complexity, technologies, skillLevel } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    
    const prompt = `Generate 3-5 unique project ideas based on:
- Project Type: ${projectType}
- Domains: ${domains.join(', ')}
- Purpose: ${purpose}
- Complexity: ${complexity}
- Technologies: ${technologies.join(', ')}
- Skill Level: ${skillLevel}

For each project, provide: title, description (2-3 sentences), and suggested technologies.
Return as JSON array with fields: title, description, technologies (array).`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    const ideas = JSON.parse(content.match(/\[[\s\S]*\]/)?.[0] || '[]');

    const projects = [];
    for (const idea of ideas) {
      const { data: project } = await supabaseClient
        .from('projects')
        .insert({
          user_id: user.id,
          title: idea.title,
          description: idea.description,
          project_type: projectType,
          domain: domains,
          complexity,
          skill_level: skillLevel,
          technologies: idea.technologies || technologies,
          purpose,
        })
        .select()
        .single();
      
      if (project) projects.push(project);
    }

    return new Response(JSON.stringify({ projects }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
