import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Download, Loader2, ArrowLeft, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Documentation {
  introduction: string;
  system_analysis: string;
  system_design: string;
  implementation: string;
  testing: string;
  result: string;
  conclusion: string;
  references: string[];
}

const Documentation = () => {
  const { id } = useParams();
  const [projectTitle, setProjectTitle] = useState("");
  const [documentation, setDocumentation] = useState<Documentation | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadProject = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("projects")
        .select("title")
        .eq("id", id)
        .single();

      if (error || !data) {
        toast({
          title: "Error",
          description: "Project not found.",
          variant: "destructive",
        });
        navigate("/ideas");
        return;
      }

      setProjectTitle((data as any).title);
    };

    loadProject();
  }, [id, navigate, toast]);

  const handleGenerate = async () => {
    setGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-documentation", {
        body: { projectId: id },
      });

      if (error) throw error;

      if (data && data.documentation) {
        setDocumentation(data.documentation);
        toast({
          title: "Documentation Generated!",
          description: "Your project documentation is ready.",
        });
      }
    } catch (error: any) {
      console.error("Error generating documentation:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate documentation.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!documentation) return;

    const content = `
# ${projectTitle} - Project Documentation

## 1. Introduction
${documentation.introduction}

## 2. System Analysis
${documentation.system_analysis}

## 3. System Design
${documentation.system_design}

## 4. Implementation and Testing
${documentation.implementation}

### Testing
${documentation.testing}

## 5. Result and Discussion
${documentation.result}

## 6. Conclusion
${documentation.conclusion}

## 7. References
${documentation.references.map((ref, i) => `${i + 1}. ${ref}`).join('\n')}
    `.trim();

    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectTitle.replace(/\s+/g, "-")}-documentation.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded!",
      description: "Documentation downloaded as Markdown file.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to={`/project/${id}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
            Back to Project
          </Link>
          
          {documentation && (
            <Button className="btn-gradient" onClick={handleDownload}>
              <Download className="w-5 h-5 mr-2" />
              Download Documentation
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 animate-fade-in text-center">
          <h1 className="text-4xl font-bold mb-2 gradient-text">{projectTitle}</h1>
          <p className="text-xl text-muted-foreground">Project Documentation</p>
        </div>

        {!documentation && !generating && (
          <Card className="glass-card p-12 text-center animate-fade-in">
            <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-2xl font-bold mb-4">Generate Professional Documentation</h3>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Create a comprehensive project documentation including introduction, system analysis,
              design specifications, implementation details, and more.
            </p>
            <Button className="btn-gradient" onClick={handleGenerate} size="lg">
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Documentation
            </Button>
          </Card>
        )}

        {generating && (
          <Card className="glass-card p-12 text-center animate-fade-in">
            <Loader2 className="w-16 h-16 mx-auto text-primary mb-4 animate-spin" />
            <h3 className="text-2xl font-bold mb-2">Generating Documentation...</h3>
            <p className="text-muted-foreground">
              Creating comprehensive project documentation with AI. This may take a moment.
            </p>
          </Card>
        )}

        {documentation && (
          <div className="space-y-8 animate-fade-in">
            <Card className="glass-card p-8">
              <h2 className="text-2xl font-bold mb-4 gradient-text">1. Introduction</h2>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-lg leading-relaxed whitespace-pre-wrap">{documentation.introduction}</p>
              </div>
            </Card>

            <Card className="glass-card p-8">
              <h2 className="text-2xl font-bold mb-4 gradient-text">2. System Analysis</h2>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="leading-relaxed whitespace-pre-wrap">{documentation.system_analysis}</p>
              </div>
            </Card>

            <Card className="glass-card p-8">
              <h2 className="text-2xl font-bold mb-4 gradient-text">3. System Design</h2>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="leading-relaxed whitespace-pre-wrap">{documentation.system_design}</p>
              </div>
            </Card>

            <Card className="glass-card p-8">
              <h2 className="text-2xl font-bold mb-4 gradient-text">4. Implementation and Testing</h2>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="leading-relaxed whitespace-pre-wrap">{documentation.implementation}</p>
                <h3 className="text-xl font-semibold mt-6 mb-3">Testing Strategy</h3>
                <p className="leading-relaxed whitespace-pre-wrap">{documentation.testing}</p>
              </div>
            </Card>

            <Card className="glass-card p-8">
              <h2 className="text-2xl font-bold mb-4 gradient-text">5. Result and Discussion</h2>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="leading-relaxed whitespace-pre-wrap">{documentation.result}</p>
              </div>
            </Card>

            <Card className="glass-card p-8">
              <h2 className="text-2xl font-bold mb-4 gradient-text">6. Conclusion</h2>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="leading-relaxed whitespace-pre-wrap">{documentation.conclusion}</p>
              </div>
            </Card>

            <Card className="glass-card p-8">
              <h2 className="text-2xl font-bold mb-4 gradient-text">7. References</h2>
              <ol className="space-y-2">
                {documentation.references.map((ref, i) => (
                  <li key={i} className="text-muted-foreground">
                    {ref}
                  </li>
                ))}
              </ol>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default Documentation;
