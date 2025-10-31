import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const projectTypes = [
  { value: "web", label: "Web App", icon: "🌐" },
  { value: "mobile", label: "Mobile App", icon: "📱" },
  { value: "desktop", label: "Desktop App", icon: "💻" },
  { value: "ml", label: "ML Model", icon: "🤖" },
  { value: "game", label: "Game", icon: "🎮" },
];

const domains = [
  "Healthcare", "Education", "Finance", "E-commerce",
  "Social Media", "Entertainment", "Productivity", "Other"
];

const purposes = [
  { value: "portfolio", label: "Portfolio Project" },
  { value: "learning", label: "Learning" },
  { value: "hackathon", label: "Hackathon" },
  { value: "startup", label: "Startup Idea" },
];

const goals = [
  "Build a real product for users",
  "Learn new technologies",
  "Solve a specific problem",
  "Build something for fun",
  "Create a portfolio piece",
  "Contribute to open source"
];

const projectKinds = [
  "Solo project",
  "Team collaboration",
  "Open source contribution",
  "Client work",
  "Research project"
];

const stackPreferences = [
  "Frontend only",
  "Backend only",
  "Full-stack",
  "Mobile development",
  "DevOps/Infrastructure",
  "Data Science/ML",
  "Blockchain/Web3"
];

const timePlans = [
  { value: "1-2weeks", label: "1-2 weeks (Quick sprint)" },
  { value: "1month", label: "1 month (Short-term)" },
  { value: "2-3months", label: "2-3 months (Medium-term)" },
  { value: "6months+", label: "6+ months (Long-term)" },
];

const realWorldAreas = [
  "Healthcare & Medicine",
  "Education & E-learning",
  "Finance & Banking",
  "E-commerce & Retail",
  "Social Impact & Sustainability",
  "Entertainment & Media",
  "Agriculture & Food Tech",
  "Smart Cities & IoT",
  "Cybersecurity",
  "Transportation & Logistics"
];

const educationRoles = [
  { value: "student-highschool", label: "High School Student" },
  { value: "student-undergrad", label: "Undergraduate Student" },
  { value: "student-grad", label: "Graduate Student" },
  { value: "professional-junior", label: "Junior Developer" },
  { value: "professional-mid", label: "Mid-level Developer" },
  { value: "professional-senior", label: "Senior Developer" },
  { value: "career-switcher", label: "Career Switcher" },
  { value: "hobbyist", label: "Hobbyist/Self-taught" },
];

const Generate = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    projectType: "",
    domains: [] as string[],
    purpose: "",
    complexity: 50,
    technologies: "",
    skillLevel: "intermediate",
    goal: "",
    projectKind: "",
    stackPreference: "",
    timePlan: "",
    realWorldArea: [] as string[],
    educationRole: "",
  });

  const totalSteps = 12;
  const progress = (step / totalSteps) * 100;

  const complexityLabels: { [key: number]: string } = {
    0: "Very Simple",
    25: "Simple",
    50: "Moderate",
    75: "Complex",
    100: "Very Complex",
  };

  const getComplexityLabel = (value: number) => {
    const closest = [0, 25, 50, 75, 100].reduce((prev, curr) =>
      Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
    );
    return complexityLabels[closest];
  };

  const handleDomainToggle = (domain: string) => {
    setFormData(prev => ({
      ...prev,
      domains: prev.domains.includes(domain)
        ? prev.domains.filter(d => d !== domain)
        : [...prev.domains, domain]
    }));
  };

  const handleRealWorldAreaToggle = (area: string) => {
    setFormData(prev => ({
      ...prev,
      realWorldArea: prev.realWorldArea.includes(area)
        ? prev.realWorldArea.filter(a => a !== area)
        : [...prev.realWorldArea, area]
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 1: return formData.goal !== "";
      case 2: return formData.projectType !== "";
      case 3: return formData.projectKind !== "";
      case 4: return formData.domains.length > 0;
      case 5: return formData.stackPreference !== "";
      case 6: return formData.purpose !== "";
      case 7: return formData.timePlan !== "";
      case 8: return formData.realWorldArea.length > 0;
      case 9: return true; // complexity slider
      case 10: return formData.technologies.trim() !== "";
      case 11: return formData.educationRole !== "";
      case 12: return true; // Always allow final step
      default: return false;
    }
  };

  const createMockProjects = async (userId: string) => {

    const mockProjects = [
      {
        title: `${formData.domains[0]} Management System`,
        description: `A comprehensive ${formData.domains[0].toLowerCase()} management application with user-friendly interface and robust features. Perfect for ${formData.purpose}`,
        technologies: formData.technologies.split(",").map(t => t.trim()).filter(t => t !== ""),
        project_type: formData.projectType,
        domain: formData.domains,
        complexity: getComplexityLabel(formData.complexity),
        skill_level: formData.skillLevel,
        purpose: formData.purpose,
      },
      {
        title: `${formData.domains[0]} Analytics Dashboard`,
        description: `Build an interactive dashboard to visualize and analyze ${formData.domains[0].toLowerCase()} data. Great for learning data visualization.`,
        technologies: [...formData.technologies.split(",").map(t => t.trim()), "Chart.js", "D3.js"],
        project_type: formData.projectType,
        domain: formData.domains,
        complexity: getComplexityLabel(formData.complexity),
        skill_level: formData.skillLevel,
        purpose: formData.purpose,
      },
      {
        title: `AI-Powered ${formData.domains[0]} Assistant`,
        description: `Create an intelligent assistant for ${formData.domains[0].toLowerCase()} with natural language processing and smart recommendations.`,
        technologies: [...formData.technologies.split(",").map(t => t.trim()), "OpenAI API", "WebSockets"],
        project_type: formData.projectType,
        domain: formData.domains,
        complexity: getComplexityLabel(formData.complexity),
        skill_level: formData.skillLevel,
        purpose: formData.purpose,
      }
    ];

    const projects = [];
    for (const idea of mockProjects) {
      const { data: project } = await supabase
        .from('projects')
        .insert({
          user_id: userId,
          ...idea,
        } as any)
        .select()
        .single();
      
      if (project) projects.push(project);
    }

    toast({
      title: "Ideas Generated! (Mock Data)",
      description: `Created ${projects.length} project ideas using mock data. The edge function is not deployed yet.`,
    });
    navigate("/ideas");
  };

  const handleGenerate = async () => {
    // Rate limiting: Prevent rapid clicks
    if (loading) return;
    
    setLoading(true);

    try {
      // Check session once and reuse
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Call the edge function to generate ideas
      const { data, error } = await supabase.functions.invoke("generate-project-ideas", {
        body: {
          goal: formData.goal,
          projectType: formData.projectType,
          projectKind: formData.projectKind,
          domains: formData.domains,
          stackPreference: formData.stackPreference,
          purpose: formData.purpose,
          timePlan: formData.timePlan,
          realWorldArea: formData.realWorldArea,
          complexity: getComplexityLabel(formData.complexity),
          technologies: formData.technologies.split(",").map(t => t.trim()).filter(t => t !== ""),
          skillLevel: formData.skillLevel,
          educationRole: formData.educationRole,
        },
      });

      // Handle edge function errors
      if (error) {
        console.error('Edge function error:', error);
        console.error('Error details:', JSON.stringify(error));
        
        // Check for specific error types
        if (error.message?.includes('Rate limit exceeded')) {
          toast({
            title: "Rate Limit Exceeded",
            description: "You're generating ideas too quickly. Please wait a moment and try again.",
            variant: "destructive",
          });
          return;
        }
        
        if (error.message?.includes('Payment required')) {
          toast({
            title: "Credits Required",
            description: "Please add credits to your workspace to continue generating projects.",
            variant: "destructive",
          });
          return;
        }
        
        // Generic error - try fallback
        console.warn('Using fallback mock data');
        try {
          await createMockProjects(session.user.id);
        } catch (mockError) {
          console.error('Mock data creation failed:', mockError);
          toast({
            title: "Generation Failed",
            description: "Failed to generate projects. Please try again.",
            variant: "destructive",
          });
        }
        return;
      }

      // Edge function succeeded
      console.log("Generation response:", JSON.stringify(data));
      console.log("Data type:", typeof data);
      console.log("Has projects key:", 'projects' in (data || {}));
      console.log("Projects value:", data?.projects);
      
      // Handle different possible response formats
      const projects = data?.projects || data;
      
      if (Array.isArray(projects) && projects.length > 0) {
        toast({
          title: "Ideas Generated!",
          description: `Created ${projects.length} project ideas for you.`,
        });
        navigate("/ideas");
      } else if (projects && typeof projects === 'object' && Object.keys(projects).length > 0) {
        // If data came back as a single object somehow
        toast({
          title: "Ideas Generated!",
          description: "Created project ideas for you.",
        });
        navigate("/ideas");
      } else {
        console.error("Invalid response format:", data);
        console.error("Response structure:", JSON.stringify(data, null, 2));
        throw new Error("Invalid response format: missing or invalid data");
      }
    } catch (error: any) {
      console.error("Error generating ideas:", error);
      toast({
        title: "Generation Failed",
        description: error?.message || "Failed to generate ideas. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background py-8 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* Progress */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Step {step} of {totalSteps}</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="glass-card p-6 md:p-8 animate-scale-in">
          {/* Step 1: Goal */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-2 gradient-text">
                  What's your goal?
                </h2>
                <p className="text-muted-foreground text-sm md:text-base">
                  What do you want to achieve with this project?
                </p>
              </div>

              <RadioGroup
                value={formData.goal}
                onValueChange={(value) => setFormData({ ...formData, goal: value })}
                className="space-y-3"
              >
                {goals.map((goal) => (
                  <Label key={goal} htmlFor={goal} className="cursor-pointer">
                    <Card
                      className={`p-4 hover:bg-muted/50 transition-all duration-300 hover:scale-[1.02] ${
                        formData.goal === goal ? "border-primary bg-primary/5" : ""
                      }`}
                    >
                      <RadioGroupItem value={goal} id={goal} className="sr-only" />
                      <span className="font-medium text-sm md:text-base">{goal}</span>
                    </Card>
                  </Label>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Step 2: Project Type */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-2 gradient-text">
                  What type of project?
                </h2>
                <p className="text-muted-foreground text-sm md:text-base">
                  Choose the kind of project you want to build
                </p>
              </div>

              <RadioGroup
                value={formData.projectType}
                onValueChange={(value) => setFormData({ ...formData, projectType: value })}
                className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4"
              >
                {projectTypes.map((type) => (
                  <Label
                    key={type.value}
                    htmlFor={type.value}
                    className="cursor-pointer"
                  >
                    <Card
                      className={`p-4 md:p-6 hover:bg-muted/50 transition-all duration-300 hover:scale-105 ${
                        formData.projectType === type.value ? "border-primary bg-primary/5" : ""
                      }`}
                    >
                      <RadioGroupItem value={type.value} id={type.value} className="sr-only" />
                      <div className="text-center">
                        <span className="text-3xl md:text-4xl mb-2 block">{type.icon}</span>
                        <span className="font-semibold text-sm md:text-base">{type.label}</span>
                      </div>
                    </Card>
                  </Label>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Step 3: Project Kind */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-2 gradient-text">
                  What kind of project?
                </h2>
                <p className="text-muted-foreground text-sm md:text-base">
                  How do you plan to work on this?
                </p>
              </div>

              <RadioGroup
                value={formData.projectKind}
                onValueChange={(value) => setFormData({ ...formData, projectKind: value })}
                className="space-y-3"
              >
                {projectKinds.map((kind) => (
                  <Label key={kind} htmlFor={kind} className="cursor-pointer">
                    <Card
                      className={`p-4 hover:bg-muted/50 transition-all duration-300 hover:scale-[1.02] ${
                        formData.projectKind === kind ? "border-primary bg-primary/5" : ""
                      }`}
                    >
                      <RadioGroupItem value={kind} id={kind} className="sr-only" />
                      <span className="font-medium text-sm md:text-base">{kind}</span>
                    </Card>
                  </Label>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Step 4: Domain */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-2 gradient-text">
                  Choose your domain
                </h2>
                <p className="text-muted-foreground text-sm md:text-base">
                  Select one or more areas of interest
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {domains.map((domain) => (
                  <Label
                    key={domain}
                    htmlFor={domain}
                    className="cursor-pointer"
                  >
                    <Card
                      className={`p-3 md:p-4 hover:bg-muted/50 transition-all duration-300 hover:scale-105 ${
                        formData.domains.includes(domain) ? "border-primary bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={domain}
                          checked={formData.domains.includes(domain)}
                          onCheckedChange={() => handleDomainToggle(domain)}
                        />
                        <span className="font-medium text-xs md:text-sm">{domain}</span>
                      </div>
                    </Card>
                  </Label>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Stack Preference */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-2 gradient-text">
                  Stack preference?
                </h2>
                <p className="text-muted-foreground text-sm md:text-base">
                  What area of development interests you?
                </p>
              </div>

              <RadioGroup
                value={formData.stackPreference}
                onValueChange={(value) => setFormData({ ...formData, stackPreference: value })}
                className="space-y-3"
              >
                {stackPreferences.map((pref) => (
                  <Label key={pref} htmlFor={pref} className="cursor-pointer">
                    <Card
                      className={`p-4 hover:bg-muted/50 transition-all duration-300 hover:scale-[1.02] ${
                        formData.stackPreference === pref ? "border-primary bg-primary/5" : ""
                      }`}
                    >
                      <RadioGroupItem value={pref} id={pref} className="sr-only" />
                      <span className="font-medium text-sm md:text-base">{pref}</span>
                    </Card>
                  </Label>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Step 6: Purpose */}
          {step === 6 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-2 gradient-text">
                  What's your purpose?
                </h2>
                <p className="text-muted-foreground text-sm md:text-base">
                  Why are you building this project?
                </p>
              </div>

              <RadioGroup
                value={formData.purpose}
                onValueChange={(value) => setFormData({ ...formData, purpose: value })}
                className="space-y-3"
              >
                {purposes.map((purpose) => (
                  <Label
                    key={purpose.value}
                    htmlFor={purpose.value}
                    className="cursor-pointer"
                  >
                    <Card
                      className={`p-4 md:p-6 hover:bg-muted/50 transition-all duration-300 hover:scale-[1.02] ${
                        formData.purpose === purpose.value ? "border-primary bg-primary/5" : ""
                      }`}
                    >
                      <RadioGroupItem value={purpose.value} id={purpose.value} className="sr-only" />
                      <span className="font-semibold text-base md:text-lg">{purpose.label}</span>
                    </Card>
                  </Label>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Step 7: Time Plan */}
          {step === 7 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-2 gradient-text">
                  How long will you work on this?
                </h2>
                <p className="text-muted-foreground text-sm md:text-base">
                  Choose your time commitment
                </p>
              </div>

              <RadioGroup
                value={formData.timePlan}
                onValueChange={(value) => setFormData({ ...formData, timePlan: value })}
                className="space-y-3"
              >
                {timePlans.map((plan) => (
                  <Label key={plan.value} htmlFor={plan.value} className="cursor-pointer">
                    <Card
                      className={`p-4 md:p-6 hover:bg-muted/50 transition-all duration-300 hover:scale-[1.02] ${
                        formData.timePlan === plan.value ? "border-primary bg-primary/5" : ""
                      }`}
                    >
                      <RadioGroupItem value={plan.value} id={plan.value} className="sr-only" />
                      <span className="font-semibold text-base md:text-lg">{plan.label}</span>
                    </Card>
                  </Label>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Step 8: Real World Area */}
          {step === 8 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-2 gradient-text">
                  Real-world areas of interest
                </h2>
                <p className="text-muted-foreground text-sm md:text-base">
                  Select areas that interest you most
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {realWorldAreas.map((area) => (
                  <Label
                    key={area}
                    htmlFor={area}
                    className="cursor-pointer"
                  >
                    <Card
                      className={`p-3 md:p-4 hover:bg-muted/50 transition-all duration-300 hover:scale-105 ${
                        formData.realWorldArea.includes(area) ? "border-primary bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={area}
                          checked={formData.realWorldArea.includes(area)}
                          onCheckedChange={() => handleRealWorldAreaToggle(area)}
                        />
                        <span className="font-medium text-xs md:text-sm">{area}</span>
                      </div>
                    </Card>
                  </Label>
                ))}
              </div>
            </div>
          )}

          {/* Step 9: Complexity & Skill */}
          {step === 9 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-2 gradient-text">
                  Set your preferences
                </h2>
                <p className="text-muted-foreground text-sm md:text-base">
                  Choose complexity and skill level
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <Label className="text-base md:text-lg mb-4 block">Project Complexity</Label>
                  <div className="space-y-4">
                    <Slider
                      value={[formData.complexity]}
                      onValueChange={([value]) => setFormData({ ...formData, complexity: value })}
                      max={100}
                      step={25}
                      className="w-full"
                    />
                    <p className="text-center text-xl md:text-2xl font-bold gradient-text">
                      {getComplexityLabel(formData.complexity)}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-base md:text-lg mb-4 block">Your Skill Level</Label>
                  <RadioGroup
                    value={formData.skillLevel}
                    onValueChange={(value) => setFormData({ ...formData, skillLevel: value })}
                    className="space-y-3"
                  >
                    {["beginner", "intermediate", "advanced"].map((level) => (
                      <Label key={level} htmlFor={level} className="cursor-pointer">
                        <Card
                          className={`p-4 hover:bg-muted/50 transition-all ${
                            formData.skillLevel === level ? "border-primary bg-primary/5" : ""
                          }`}
                        >
                          <RadioGroupItem value={level} id={level} className="sr-only" />
                          <span className="font-medium capitalize text-sm md:text-base">{level}</span>
                        </Card>
                      </Label>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            </div>
          )}

          {/* Step 10: Technologies */}
          {step === 10 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-2 gradient-text">
                  Preferred technologies
                </h2>
                <p className="text-muted-foreground text-sm md:text-base">
                  List the technologies you want to use (comma-separated)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="technologies" className="text-sm md:text-base">Technologies</Label>
                <Input
                  id="technologies"
                  placeholder="React, Node.js, Python, MongoDB..."
                  value={formData.technologies}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 500) {
                      setFormData({ ...formData, technologies: value });
                    }
                  }}
                  maxLength={500}
                  minLength={1}
                  className="text-base md:text-lg"
                />
                <p className="text-xs md:text-sm text-muted-foreground">
                  {formData.technologies.length}/500 characters
                </p>
              </div>
            </div>
          )}

          {/* Step 11: Education/Role */}
          {step === 11 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-2 gradient-text">
                  Your background
                </h2>
                <p className="text-muted-foreground text-sm md:text-base">
                  What's your current education or role?
                </p>
              </div>

              <RadioGroup
                value={formData.educationRole}
                onValueChange={(value) => setFormData({ ...formData, educationRole: value })}
                className="space-y-3"
              >
                {educationRoles.map((role) => (
                  <Label key={role.value} htmlFor={role.value} className="cursor-pointer">
                    <Card
                      className={`p-4 hover:bg-muted/50 transition-all duration-300 hover:scale-[1.02] ${
                        formData.educationRole === role.value ? "border-primary bg-primary/5" : ""
                      }`}
                    >
                      <RadioGroupItem value={role.value} id={role.value} className="sr-only" />
                      <span className="font-medium text-sm md:text-base">{role.label}</span>
                    </Card>
                  </Label>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Step 12: Provider */}
          {step === 12 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-2 gradient-text">
                  Choose AI provider
                </h2>
                <p className="text-muted-foreground text-sm md:text-base">
                  Select which AI to generate your project ideas
                </p>
              </div>

              <Card className="p-6 bg-primary/5 border-primary">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Powered by Lovable AI</h4>
                    <p className="text-muted-foreground">
                      Using Google Gemini 2.5 Flash for intelligent project idea generation tailored to your preferences.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={step === 1 || loading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {step < totalSteps ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed() || loading}
                className="btn-gradient"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleGenerate}
                disabled={!canProceed() || loading}
                className="btn-gradient"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Ideas
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Generate;
