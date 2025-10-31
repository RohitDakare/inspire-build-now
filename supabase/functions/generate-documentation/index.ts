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
    const { projectId } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: project } = await supabaseClient
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (!project) throw new Error('Project not found');

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    
    const technologies = Array.isArray(project.technologies) ? project.technologies.join(', ') : '';

    const prompt = `Generate comprehensive project documentation for:
Title: ${project.title}
Description: ${project.description}
Technologies: ${technologies}

Include these sections:
1. Introduction (overview, objectives, scope)
2. System Analysis (existing vs proposed, requirements)
3. System Design (architecture, database, UI/UX)
4. Implementation and Testing (approach, testing strategy)
5. Result and Discussion (performance, efficiency)
6. Conclusion (summary, future work)
7. References (5-7 relevant links)

Return as JSON with fields: introduction, system_analysis, system_design, implementation, testing, result, conclusion, references (array).`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const documentation = content ? JSON.parse(content.match(/\{[\s\S]*\}/)?.[0] || '{}') : {};

    return new Response(JSON.stringify({ documentation }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Function Error:', error);
    return new Response(JSON.stringify({ error: error.message, details: error.stack }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
