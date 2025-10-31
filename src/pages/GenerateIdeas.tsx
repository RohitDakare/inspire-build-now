import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/types/database.types';

const DIFFICULTY_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const DOMAINS = [
  'Web Development',
  'Mobile Development',
  'Data Science',
  'Machine Learning',
  'Game Development',
  'Blockchain',
  'IoT',
  'Desktop Applications',
  'DevOps',
  'Cybersecurity',
];

interface ProjectIdea {
  id?: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  domain: string;
  technologies: string[];
  features: string[];
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export default function GenerateIdeas() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: '',
    domain: '',
    technologies: [] as string[],
    features: [] as string[],
  });
  const [generatedIdeas, setGeneratedIdeas] = useState<ProjectIdea[]>([]);
  const [currentIdea, setCurrentIdea] = useState<ProjectIdea | null>(null);
  const [techInput, setTechInput] = useState('');
  const [featureInput, setFeatureInput] = useState('');
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addTechnology = () => {
    if (techInput.trim() && !formData.technologies.includes(techInput.trim())) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, techInput.trim()]
      }));
      setTechInput('');
    }
  };

  const removeTechnology = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech)
    }));
  };

  const addFeature = () => {
    if (featureInput.trim() && !formData.features.includes(featureInput.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, featureInput.trim()]
      }));
      setFeatureInput('');
    }
  };

  const removeFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature)
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent, type: 'tech' | 'feature') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (type === 'tech') addTechnology();
      else addFeature();
    }
  };

  // Error types for better error handling
  type ErrorWithCode = Error & { code?: string };
  
  const MAX_RETRIES = 2;
  const RETRY_DELAY = 1000; // 1 second

  const generateIdeas = async (retryCount = 0): Promise<void> => {
    // Input validation
    if (!formData.domain?.trim()) {
      toast({
        title: 'Missing Domain',
        description: 'Please select a project domain',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.difficulty) {
      toast({
        title: 'Missing Difficulty',
        description: 'Please select a difficulty level',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setGeneratedIdeas([]);
    
    try {
      // 1. Check user session with timeout
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Session check timed out')), 10000)
      );
      
      const { data: { session }, error: sessionError } = await Promise.race([
        sessionPromise,
        timeoutPromise
      ]) as { data: { session: any }, error: any };
      
      if (sessionError || !session) {
        const error: ErrorWithCode = new Error(sessionError?.message || 'Not authenticated');
        error.code = 'AUTH_ERROR';
        throw error;
      }

      // 2. Prepare request data
      const requestData = {
        domain: formData.domain.trim(),
        difficulty: formData.difficulty,
        technologies: formData.technologies.filter(t => t.trim() !== ''),
        features: formData.features.filter(f => f.trim() !== ''),
        count: 3,
        provider: 'both' as const
      };

      // 3. Call Supabase Edge Function (handles auth, URL, CORS)
      let result: any;
      let lastError: Error | null = null;
      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          const { data, error: fnError } = await supabase.functions.invoke('generate-project-ideas', {
            body: requestData,
          });

          if (fnError) {
            // Prefer structured error from function payload when available
            const errorData = (data as any) || {};
            const serverCode = errorData?.error?.code;
            const serverMessage = errorData?.error?.message || fnError.message;
            const httpStatus = (fnError as any)?.context?.status as number | undefined;

            let errorCode: string = serverCode || 'API_ERROR';
            if (httpStatus === 401) errorCode = 'AUTH_ERROR';
            else if (httpStatus === 429) errorCode = 'RATE_LIMIT';
            else if (httpStatus && httpStatus >= 500) errorCode = 'SERVER_ERROR';
            if (!errorCode && /unauthorized|401/i.test(serverMessage)) errorCode = 'AUTH_ERROR';
            if (serverCode === 'MISSING_CONFIG' || serverCode === 'CONFIG_ERROR') errorCode = 'CONFIG_ERROR';

            const err: ErrorWithCode = new Error(serverMessage || 'Failed to generate ideas');
            err.code = errorCode;
            // Re-throw to outer catch without wrapping as network error
            throw err;
          }

          result = data;
          break;
        } catch (error) {
          lastError = error as Error;
          // Only treat true network/timeout issues as retryable
          const isAbort = (error as Error).name === 'AbortError';
          const isNetwork = (error as Error).name === 'TypeError' || /NetworkError|Failed to fetch/i.test((error as Error).message);
          const isEdgeStatus = /non-2xx status code/i.test((error as Error).message);

          if (!isAbort && !isNetwork && !isEdgeStatus) {
            // Application error (with code) -> stop retrying
            throw error;
          }

          if (attempt === MAX_RETRIES || isAbort) {
            throw error;
          }
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (attempt + 1)));
        }
      }
      if (!result) {
        throw lastError || new Error('Failed to get a response from the server');
      }

      // 4. Process successful response
      // Supabase Edge Function returns { projects }. Fallbacks in case of different shapes.
      const projects = (result && (result.projects || (Array.isArray(result) ? result : result.data))) as any;
      
      if (!projects || !Array.isArray(projects)) {
        console.error('Unexpected response structure:', result);
        throw new Error('Invalid response format: missing or invalid data');
      }
      
      if (projects.length === 0) {
        throw new Error('No project ideas were generated. Please try different parameters.');
      }
      
      // Map API projects to local ProjectIdea structure for rendering/saving
      const mappedIdeas: ProjectIdea[] = projects.map((p: any) => {
        let features: string[] = [];
        if (p.overview) {
          try {
            const overviewObj = typeof p.overview === 'string' ? JSON.parse(p.overview) : p.overview;
            features = Array.isArray(overviewObj?.keyFeatures) ? overviewObj.keyFeatures : [];
          } catch (_e) {
            features = [];
          }
        }
        const domainValue = Array.isArray(p.domain) ? (p.domain[0] || 'General') : (p.domain || 'General');
        const difficultyValue = (p.difficulty || p.complexity || 'intermediate') as 'beginner' | 'intermediate' | 'advanced';
        return {
          title: p.title || 'Untitled Project',
          description: p.description || p.realWorldApplication || '',
          difficulty: ['beginner','intermediate','advanced'].includes(difficultyValue) ? difficultyValue : 'intermediate',
          domain: domainValue,
          technologies: Array.isArray(p.technologies) ? p.technologies : (Array.isArray(p.techStack) ? p.techStack : []),
          features,
        } as ProjectIdea;
      });
      
      setGeneratedIdeas(mappedIdeas);
      setStep(2);
      
      toast({
        title: 'Success!',
        description: `Generated ${mappedIdeas.length} project ideas`,
      });
      
    } catch (error) {
      console.error('Error in generateIdeas:', error);
      
      let errorMessage = 'Failed to generate project ideas. Please try again.';
      let errorCode = 'UNKNOWN_ERROR';
      let shouldRetry = false;
      
      // Handle different error types
      if (error instanceof Error) {
        const err = error as ErrorWithCode;
        errorMessage = err.message || errorMessage;
        errorCode = err.code || errorCode;
        
        // Network errors
        if (err.name === 'TypeError' && err.message.includes('fetch')) {
          errorCode = 'NETWORK_ERROR';
          errorMessage = 'Network error. Please check your connection and try again.';
          shouldRetry = retryCount < MAX_RETRIES;
        }
        
        // Timeout errors
        else if (err.name === 'AbortError') {
          errorCode = 'TIMEOUT';
          errorMessage = 'Request timed out. The server is taking too long to respond.';
          shouldRetry = retryCount < MAX_RETRIES;
        }
        
        // Specific error codes
        else if (errorCode === 'AUTH_ERROR') {
          navigate('/auth');
          return; // Don't show toast, as we're redirecting
        }
        else if (errorCode === 'RATE_LIMIT') {
          errorMessage = 'Rate limit exceeded. Please wait a few minutes before trying again.';
        }
        else if (errorCode === 'CONFIG_ERROR') {
          errorMessage = 'Configuration error. Please contact support if this persists.';
        }
      }
      
      console.error(`Error (${errorCode}):`, error);
      
      // Show error to user
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
        action: (errorCode === 'CONFIG_ERROR' || shouldRetry) ? (
          <Button 
            variant="outline" 
            onClick={() => shouldRetry 
              ? generateIdeas(retryCount + 1)
              : window.location.reload()
            }
            className="ml-2"
          >
            {shouldRetry ? 'Retry' : 'Reload Page'}
          </Button>
        ) : undefined,
      });
      
      // Auto-retry for certain errors
      if (shouldRetry) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
        return generateIdeas(retryCount + 1);
      }
    } finally {
      setLoading(false);
    }
  };

  const saveIdea = async (idea: ProjectIdea) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      // Prepare the data to be saved
      const ideaData = {
        title: idea.title,
        description: idea.description,
        difficulty_level: idea.difficulty,
        domain: idea.domain,
        technologies: idea.technologies || [],
        features: idea.features || [],
        user_id: session.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Insert the idea. If the table doesn't exist in the project,
      // surface a helpful error message instead of calling missing RPCs.
      const { data, error } = await supabase
        .from('project_ideas')
        .insert([ideaData] as any)
        .select();

      if (error) {
        // Common PostgREST errors when table is missing or schema not loaded
        const msg = (error as any)?.message || '';
        const code = (error as any)?.code || '';
        if (code === 'PGRST202' || /relation .* does not exist/i.test(msg)) {
          throw new Error('Project ideas table is missing. Please run the migration to create public.project_ideas.');
        }
        throw error;
      }
      if (!data || data.length === 0) throw new Error('Failed to save idea');

      toast({
        title: 'Success',
        description: 'Project idea saved successfully!',
      });
    } catch (error) {
      console.error('Error saving idea:', error);
      toast({
        title: 'Error',
        description: 'Failed to save project idea. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const renderStep1 = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Generate Project Ideas</CardTitle>
        <CardDescription>
          Fill in the details below to get personalized project ideas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="domain">Project Domain</Label>
          <Select 
            value={formData.domain} 
            onValueChange={(value) => handleSelectChange('domain', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a domain" />
            </SelectTrigger>
            <SelectContent>
              {DOMAINS.map((domain) => (
                <SelectItem key={domain} value={domain}>
                  {domain}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty Level</Label>
          <Select 
            value={formData.difficulty} 
            onValueChange={(value) => handleSelectChange('difficulty', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select difficulty level" />
            </SelectTrigger>
            <SelectContent>
              {DIFFICULTY_LEVELS.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Technologies (optional)</Label>
          <div className="flex gap-2">
            <Input
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 'tech')}
              placeholder="Add a technology (e.g., React, Python, etc.)"
            />
            <Button type="button" onClick={addTechnology}>
              Add
            </Button>
          </div>
          {formData.technologies.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.technologies.map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-primary/10 text-primary"
                >
                  {tech}
                  <button
                    type="button"
                    onClick={() => removeTechnology(tech)}
                    className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary/20 hover:bg-primary/30"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Desired Features (optional)</Label>
          <div className="flex gap-2">
            <Input
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 'feature')}
              placeholder="Add a feature (e.g., user authentication, etc.)"
            />
            <Button type="button" onClick={addFeature}>
              Add
            </Button>
          </div>
          {formData.features.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.features.map((feature) => (
                <span
                  key={feature}
                  className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-secondary/10 text-secondary-foreground"
                >
                  {feature}
                  <button
                    type="button"
                    onClick={() => removeFeature(feature)}
                    className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-secondary/20 hover:bg-secondary/30"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={() => generateIdeas()} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Ideas
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Generated Project Ideas</h2>
        <Button variant="outline" onClick={() => setStep(1)}>
          Back to Form
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {generatedIdeas.map((idea, index) => (
          <Card key={index} className="h-full flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{idea.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-muted-foreground">
                      {idea.difficulty.charAt(0).toUpperCase() + idea.difficulty.slice(1)}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{idea.domain}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCurrentIdea(idea);
                    // Show details modal or navigate to details page
                  }}
                >
                  View Details
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-muted-foreground mb-4">{idea.description}</p>
              
              {idea.technologies && idea.technologies.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Technologies:</h4>
                  <div className="flex flex-wrap gap-2">
                    {idea.technologies.map((tech, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => saveIdea(idea)}>
                Save Idea
              </Button>
              <Button>Generate Documentation</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="container py-8">
      {step === 1 ? renderStep1() : renderStep2()}
    </div>
  );
}
