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
  });

  const totalSteps = 5;
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

  const canProceed = () => {
    switch (step) {
      case 1: return formData.projectType !== "";
      case 2: return formData.domains.length > 0;
      case 3: return formData.purpose !== "";
      case 4: return true;
      case 5: return formData.technologies.trim() !== "";
      default: return false;
    }
  };

  const handleGenerate = async () => {
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Call the edge function to generate ideas
      const { data, error } = await supabase.functions.invoke("generate-project-ideas", {
        body: {
          projectType: formData.projectType,
          domains: formData.domains,
          purpose: formData.purpose,
          complexity: getComplexityLabel(formData.complexity),
          technologies: formData.technologies.split(",").map(t => t.trim()),
          skillLevel: formData.skillLevel,
        },
      });

      if (error) throw error;

      if (data && data.projects && data.projects.length > 0) {
        toast({
          title: "Ideas Generated!",
          description: `Created ${data.projects.length} project ideas for you.`,
        });
        navigate("/ideas");
      } else {
        throw new Error("No projects generated");
      }
    } catch (error: any) {
      console.error("Error generating ideas:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate ideas. Please try again.",
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

        <Card className="glass-card p-8 animate-scale-in">
          {/* Step 1: Project Type */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2 gradient-text">
                  What type of project?
                </h2>
                <p className="text-muted-foreground">
                  Choose the kind of project you want to build
                </p>
              </div>

              <RadioGroup
                value={formData.projectType}
                onValueChange={(value) => setFormData({ ...formData, projectType: value })}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {projectTypes.map((type) => (
                  <Label
                    key={type.value}
                    htmlFor={type.value}
                    className="cursor-pointer"
                  >
                    <Card
                      className={`p-6 hover:bg-muted/50 transition-all duration-300 hover:scale-105 ${
                        formData.projectType === type.value ? "border-primary bg-primary/5" : ""
                      }`}
                    >
                      <RadioGroupItem value={type.value} id={type.value} className="sr-only" />
                      <div className="text-center">
                        <span className="text-4xl mb-2 block">{type.icon}</span>
                        <span className="font-semibold">{type.label}</span>
                      </div>
                    </Card>
                  </Label>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Step 2: Domain */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2 gradient-text">
                  Choose your domain
                </h2>
                <p className="text-muted-foreground">
                  Select one or more areas of interest
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {domains.map((domain) => (
                  <Label
                    key={domain}
                    htmlFor={domain}
                    className="cursor-pointer"
                  >
                    <Card
                      className={`p-4 hover:bg-muted/50 transition-all duration-300 hover:scale-105 ${
                        formData.domains.includes(domain) ? "border-primary bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={domain}
                          checked={formData.domains.includes(domain)}
                          onCheckedChange={() => handleDomainToggle(domain)}
                        />
                        <span className="font-medium text-sm">{domain}</span>
                      </div>
                    </Card>
                  </Label>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Purpose */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2 gradient-text">
                  What's your purpose?
                </h2>
                <p className="text-muted-foreground">
                  Why are you building this project?
                </p>
              </div>

              <RadioGroup
                value={formData.purpose}
                onValueChange={(value) => setFormData({ ...formData, purpose: value })}
                className="space-y-4"
              >
                {purposes.map((purpose) => (
                  <Label
                    key={purpose.value}
                    htmlFor={purpose.value}
                    className="cursor-pointer"
                  >
                    <Card
                      className={`p-6 hover:bg-muted/50 transition-all duration-300 hover:scale-[1.02] ${
                        formData.purpose === purpose.value ? "border-primary bg-primary/5" : ""
                      }`}
                    >
                      <RadioGroupItem value={purpose.value} id={purpose.value} className="sr-only" />
                      <span className="font-semibold text-lg">{purpose.label}</span>
                    </Card>
                  </Label>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Step 4: Complexity & Skill */}
          {step === 4 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2 gradient-text">
                  Set your preferences
                </h2>
                <p className="text-muted-foreground">
                  Choose complexity and skill level
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <Label className="text-lg mb-4 block">Project Complexity</Label>
                  <div className="space-y-4">
                    <Slider
                      value={[formData.complexity]}
                      onValueChange={([value]) => setFormData({ ...formData, complexity: value })}
                      max={100}
                      step={25}
                      className="w-full"
                    />
                    <p className="text-center text-2xl font-bold gradient-text">
                      {getComplexityLabel(formData.complexity)}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-lg mb-4 block">Your Skill Level</Label>
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
                          <span className="font-medium capitalize">{level}</span>
                        </Card>
                      </Label>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Technologies */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2 gradient-text">
                  Preferred technologies
                </h2>
                <p className="text-muted-foreground">
                  List the technologies you want to use (comma-separated)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="technologies">Technologies</Label>
                <Input
                  id="technologies"
                  placeholder="React, Node.js, Python, MongoDB..."
                  value={formData.technologies}
                  onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                  className="text-lg"
                />
              </div>
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
