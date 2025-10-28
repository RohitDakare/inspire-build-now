import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, FileText, Bookmark, Share2, ArrowLeft, Code2, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string;
  title: string;
  description: string;
  project_type: string;
  domain: string[];
  complexity: string;
  skill_level: string;
  technologies: string[];
  overview: string | null;
  roadmap: any;
  project_structure: any;
  pseudo_code: string | null;
  resource_links: any;
  created_at: string;
}

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProject = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("projects")
        .select("*")
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

      setProject(data);

      // Check if saved
      const { data: saved } = await supabase
        .from("saved_projects")
        .select("id")
        .eq("project_id", id)
        .eq("user_id", session.user.id)
        .single();

      setIsSaved(!!saved);
      setLoading(false);
    };

    fetchProject();
  }, [id, navigate, toast]);

  const handleSave = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    if (isSaved) {
      await supabase
        .from("saved_projects")
        .delete()
        .eq("project_id", id)
        .eq("user_id", session.user.id);

      setIsSaved(false);
      toast({
        title: "Removed from Saved",
        description: "Project removed from your saved list.",
      });
    } else {
      await supabase
        .from("saved_projects")
        .insert({
          project_id: id!,
          user_id: session.user.id,
        });

      setIsSaved(true);
      toast({
        title: "Project Saved!",
        description: "Added to your saved projects.",
      });
    }
  };

  const handleGenerateDoc = () => {
    navigate(`/project/${id}/documentation`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-glow text-primary">
          <Sparkles className="w-12 h-12" />
        </div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/ideas" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
              Back to Ideas
            </Link>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleSave}>
                <Bookmark className={`w-5 h-5 mr-2 ${isSaved ? "fill-primary text-primary" : ""}`} />
                {isSaved ? "Saved" : "Save"}
              </Button>
              <Button variant="outline" onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast({ title: "Link Copied!", description: "Project link copied to clipboard." });
              }}>
                <Share2 className="w-5 h-5 mr-2" />
                Share
              </Button>
              <Button className="btn-gradient" onClick={handleGenerateDoc}>
                <FileText className="w-5 h-5 mr-2" />
                Generate Documentation
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-4 gradient-text">{project.title}</h1>
          <p className="text-xl text-muted-foreground mb-6">{project.description}</p>
          
          <div className="flex flex-wrap gap-3">
            <span className="px-4 py-2 bg-primary/10 text-primary rounded-full font-medium">
              {project.project_type}
            </span>
            <span className="px-4 py-2 bg-accent/10 text-accent rounded-full font-medium">
              {project.complexity}
            </span>
            <span className="px-4 py-2 bg-secondary/10 text-secondary rounded-full font-medium">
              {project.skill_level}
            </span>
            {project.domain.map((d, i) => (
              <span key={i} className="px-4 py-2 bg-muted text-muted-foreground rounded-full">
                {d}
              </span>
            ))}
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="glass-card p-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
            <TabsTrigger value="structure">Structure</TabsTrigger>
            <TabsTrigger value="code">Pseudo Code</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card className="glass-card p-8 animate-fade-in">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-primary" />
                Project Overview
              </h2>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                {project.overview ? (
                  <p className="text-lg leading-relaxed">{project.overview}</p>
                ) : (
                  <p className="text-muted-foreground italic">
                    Detailed overview will be generated when you create the documentation.
                  </p>
                )}
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Technologies</h3>
                <div className="flex flex-wrap gap-3">
                  {project.technologies.map((tech, i) => (
                    <span
                      key={i}
                      className="px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="roadmap">
            <Card className="glass-card p-8 animate-fade-in">
              <h2 className="text-2xl font-bold mb-6">Development Roadmap</h2>
              {project.roadmap ? (
                <div className="space-y-4">
                  {Array.isArray(project.roadmap) ? (
                    project.roadmap.map((phase: any, i: number) => (
                      <div key={i} className="p-4 bg-muted/50 rounded-lg">
                        <h3 className="font-semibold text-lg mb-2">{phase.phase || `Phase ${i + 1}`}</h3>
                        <p className="text-muted-foreground">{phase.description || phase}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">{JSON.stringify(project.roadmap, null, 2)}</p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground italic">
                  Roadmap will be generated when you create the documentation.
                </p>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="structure">
            <Card className="glass-card p-8 animate-fade-in">
              <h2 className="text-2xl font-bold mb-6">Project Structure</h2>
              {project.project_structure ? (
                <pre className="p-4 bg-muted/50 rounded-lg overflow-x-auto">
                  <code>{JSON.stringify(project.project_structure, null, 2)}</code>
                </pre>
              ) : (
                <p className="text-muted-foreground italic">
                  Project structure will be generated when you create the documentation.
                </p>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="code">
            <Card className="glass-card p-8 animate-fade-in">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Code2 className="w-6 h-6 text-accent" />
                Pseudo Code
              </h2>
              {project.pseudo_code ? (
                <pre className="p-4 bg-muted/50 rounded-lg overflow-x-auto">
                  <code className="text-sm">{project.pseudo_code}</code>
                </pre>
              ) : (
                <p className="text-muted-foreground italic">
                  Pseudo code will be generated when you create the documentation.
                </p>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="resources">
            <Card className="glass-card p-8 animate-fade-in">
              <h2 className="text-2xl font-bold mb-6">Resources & References</h2>
              {project.resource_links && Array.isArray(project.resource_links) && project.resource_links.length > 0 ? (
                <div className="space-y-3">
                  {project.resource_links.map((resource: any, i: number) => (
                    <a
                      key={i}
                      href={resource.url || resource}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <p className="font-medium">{resource.title || `Resource ${i + 1}`}</p>
                      {resource.description && (
                        <p className="text-sm text-muted-foreground">{resource.description}</p>
                      )}
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground italic">
                  Resource links will be generated when you create the documentation.
                </p>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ProjectDetails;
