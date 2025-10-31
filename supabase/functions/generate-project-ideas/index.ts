// @deno-types="https://deno.land/x/types/deno.d.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Type definitions
interface ProjectIdea {
  title: string;
  description: string;
  technologies: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  domain: string;
  features: string[];
  estimated_time?: string;
}

interface GenerationRequest {
  domain: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  technologies?: string[];
  features?: string[];
  count?: number;
  provider?: 'openai' | 'gemini' | 'both';
}

interface ErrorResponse {
  error: {
    message: string;
    details?: any;
    code?: string;
  };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

const openaiUrl = 'https://api.openai.com/v1/chat/completions';
const geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

serve(async (req: Request) => {
  // Enhanced request logging
  const requestId = Math.random().toString(36).substring(2, 9);
  const log = (...args: any[]) => console.log(`[${new Date().toISOString()}] [${requestId}]`, ...args);
  
  log('Request received:', {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries())
  });
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    log('Handling CORS preflight');
    return new Response(null, { 
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Origin': '*',
      } 
    });
  }

  try {
    // Parse request body and validate
    if (!req.body) {
      const error = { error: { message: 'Request body is required', code: 'MISSING_BODY' }};
      log('Error:', error);
      return new Response(
        JSON.stringify(error), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const requestData: GenerationRequest = await req.json();
    const { 
      domain, 
      difficulty, 
      technologies = [], 
      features = [],
      count = 3,
      provider = 'both'
    } = requestData;

    // Validate input
    if (!domain || !difficulty) {
      return new Response(
        JSON.stringify({ 
          error: { 
            message: 'Domain and difficulty are required',
            code: 'INVALID_INPUT'
          } 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get API keys from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');

    log('Environment variables:', {
      hasOpenAIKey: !!openaiApiKey,
      hasGeminiKey: !!geminiApiKey,
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseKey
    });

    if (!supabaseUrl || !supabaseKey) {
      const errorBody = { error: { message: 'Server configuration error: Missing Supabase credentials', code: 'MISSING_CONFIG' } };
      log('Error:', errorBody);
      return new Response(
        JSON.stringify(errorBody),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseClient = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: req.headers.get('Authorization') || ''
        }
      }
    });

    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (!user || userError) {
      return new Response(
        JSON.stringify({ error: { message: 'Unauthorized', code: 'AUTH_ERROR' } }),
        { status: 401, headers: corsHeaders }
      );
    }

    // Generate ideas using the selected provider(s) with graceful fallback
    let ideas: ProjectIdea[] = [];
    const wantOpenAI = provider === 'openai' || provider === 'both';
    const wantGemini = provider === 'gemini' || provider === 'both';

    let openaiTried = false;
    let geminiTried = false;
    let lastUpstreamError: Error | null = null;

    if (wantOpenAI) {
      if (openaiApiKey) {
        try {
          openaiTried = true;
          ideas = await generateWithOpenAI(domain, difficulty, technologies, features, count, openaiApiKey);
        } catch (e) {
          lastUpstreamError = e as Error;
          console.warn('OpenAI generation failed, will try Gemini if available:', lastUpstreamError?.message);
        }
      } else if (provider === 'openai') {
        return new Response(
          JSON.stringify({ error: { message: 'OpenAI API key is not configured', code: 'CONFIG_ERROR' } }),
          { status: 400, headers: corsHeaders }
        );
      }
    }

    if (wantGemini) {
      if (geminiApiKey) {
        try {
          geminiTried = true;
          const geminiIdeas = await generateWithGemini(domain, difficulty, technologies, features, count, geminiApiKey);
          ideas = [...ideas, ...geminiIdeas];
        } catch (e) {
          lastUpstreamError = e as Error;
          console.error('Gemini generation failed:', lastUpstreamError?.message);
        }
      } else if (provider === 'gemini') {
        return new Response(
          JSON.stringify({ error: { message: 'Gemini API key is not configured', code: 'CONFIG_ERROR' } }),
          { status: 400, headers: corsHeaders }
        );
      }
    }

    if (ideas.length === 0) {
      if (!openaiApiKey && !geminiApiKey) {
        return new Response(
          JSON.stringify({ error: { message: 'No AI providers are configured on the server', code: 'CONFIG_ERROR' } }),
          { status: 400, headers: corsHeaders }
        );
      }
      const message = lastUpstreamError?.message || 'Both providers failed to generate ideas';
      const code = 'UPSTREAM_ERROR';
      return new Response(
        JSON.stringify({ error: { message, code } }),
        { status: 502, headers: corsHeaders }
      );
    }

    // Deduplicate ideas by title
    const uniqueIdeas = Array.from(new Map(ideas.map(idea => [idea.title, idea])).values());
    
    // Return the generated ideas
    return new Response(
      JSON.stringify({ data: uniqueIdeas.slice(0, count) }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('Error in generate-project-ideas:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    const rawCode = error instanceof Error && 'code' in error ? (error as any).code as string : undefined;
    let errorCode = rawCode || 'UNKNOWN_ERROR';

    // Map error to HTTP status codes
    let status = 500;
    if (errorCode === 'AUTH_ERROR') status = 401;
    else if (errorCode === 'INVALID_INPUT' || errorCode === 'CONFIG_ERROR' || errorCode === 'MISSING_CONFIG') status = 400;
    else if (/^(OpenAI|Gemini) API error/i.test(errorMessage) || /UPSTREAM_PARSE_ERROR|UPSTREAM_ERROR/i.test(errorCode)) {
      errorCode = 'UPSTREAM_ERROR';
      status = 502;
    }

    const nodeEnv = Deno.env.get('NODE_ENV');
    const details = nodeEnv === 'development' && error instanceof Error ? error.stack : undefined;

    return new Response(
      JSON.stringify({ 
        error: { 
          message: errorMessage,
          code: errorCode,
          details
        } 
      }),
      { 
        status, 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );
  }
});

async function generateWithOpenAI(
  domain: string,
  difficulty: string,
  technologies: string[],
  features: string[],
  count: number,
  apiKey: string
): Promise<ProjectIdea[]> {
  const prompt = `Generate ${count} project ideas with these requirements:
  - Domain: ${domain}
  - Difficulty: ${difficulty}
  ${technologies.length ? `- Technologies: ${technologies.join(', ')}\n` : ''}
  ${features.length ? `- Features: ${features.join(', ')}\n` : ''}
  
  Format the response as a JSON array of objects with these properties:
  {
    "title": "Project Title",
    "description": "Detailed description of the project",
    "technologies": ["tech1", "tech2"],
    "difficulty": "beginner|intermediate|advanced",
    "domain": "Project domain",
    "features": ["feature1", "feature2"],
    "estimated_time": "Time estimate"
  }`;

  const response = await fetch(openaiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that generates project ideas. Always respond with valid JSON arrays only.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content as string | undefined;
  
  if (!content) {
    throw new Error('No content in OpenAI response');
  }

  const parsed = tryParseJsonArray(content);
  if (!parsed) {
    console.error('Failed to parse OpenAI response:', content);
    throw new Error('Failed to parse project ideas from the AI response');
  }
  return parsed;
}

async function generateWithGemini(
  domain: string,
  difficulty: string,
  technologies: string[],
  features: string[],
  count: number,
  apiKey: string
): Promise<ProjectIdea[]> {
  const prompt = `Generate ${count} project ideas with these requirements:
  - Domain: ${domain}
  - Difficulty: ${difficulty}
  ${technologies.length ? `- Technologies: ${technologies.join(', ')}\n` : ''}
  ${features.length ? `- Features: ${features.join(', ')}\n` : ''}
  
  Format the response as a JSON array of objects with these properties:
  {
    "title": "Project Title",
    "description": "Detailed description of the project",
    "technologies": ["tech1", "tech2"],
    "difficulty": "beginner|intermediate|advanced",
    "domain": "Project domain",
    "features": ["feature1", "feature2"],
    "estimated_time": "Time estimate"
  }`;

  const response = await fetch(`${geminiUrl}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000,
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Gemini API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text as string | undefined;
  
  if (!content) {
    throw new Error('No content in Gemini response');
  }

  const parsed = tryParseJsonArray(content);
  if (!parsed) {
    console.error('Failed to parse Gemini response:', content);
    throw new Error('Failed to parse project ideas from the AI response');
  }
  return parsed;
}

function tryParseJsonArray(text?: string): ProjectIdea[] | null {
  if (!text) return null;
  // Fast path: direct parse
  try {
    const val = JSON.parse(text);
    if (Array.isArray(val)) return val as ProjectIdea[];
  } catch (_) { /* fallthrough */ }
  // Fallback: extract first JSON array substring
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start >= 0 && end > start) {
    const slice = text.slice(start, end + 1);
    try {
      const val = JSON.parse(slice);
      if (Array.isArray(val)) return val as ProjectIdea[];
    } catch (_) { /* ignore */ }
  }
  return null;
}
