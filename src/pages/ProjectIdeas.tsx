import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sparkles, Search, Bookmark, Share2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string;
  title: string;
  description: string;
  project_type: string;
  domain: string[];
  complexity: string;
  technologies: string[];
  created_at: string;
}

const ProjectIdeas = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [savedProjects, setSavedProjects] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProjects = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setProjects(data);
        setFilteredProjects(data);
      }

      // Fetch saved projects
      const { data: saved } = await supabase
        .from("saved_projects")
        .select("project_id")
        .eq("user_id", session.user.id);

      if (saved) {
        setSavedProjects(new Set(saved.map((s: any) => s.project_id)));
      }

      setLoading(false);
    };

    fetchProjects();
  }, [navigate]);

  useEffect(() => {
    const filtered = projects.filter(project =>
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.technologies.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredProjects(filtered);
  }, [searchQuery, projects]);

  const handleSaveProject = async (projectId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    if (savedProjects.has(projectId)) {
      // Unsave
      await supabase
        .from("saved_projects")
        .delete()
        .eq("project_id", projectId)
        .eq("user_id", session.user.id);

      setSavedProjects(prev => {
        const newSet = new Set(prev);
        newSet.delete(projectId);
        return newSet;
      });

      toast({
        title: "Removed from Saved",
        description: "Project removed from your saved list.",
      });
    } else {
      // Save
      await supabase
        .from("saved_projects")
        .insert({
          project_id: projectId,
          user_id: session.user.id,
        } as any);

      setSavedProjects(prev => new Set(prev).add(projectId));

      toast({
        title: "Project Saved!",
        description: "Added to your saved projects.",
      });
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold gradient-text">ProjectAI</h1>
          </Link>
          
          <nav className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link to="/generate">
              <Button variant="ghost">Generate</Button>
            </Link>
            <Link to="/saved">
              <Button variant="ghost">Saved</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h2 className="text-4xl font-bold mb-2 gradient-text">
            Your Project Ideas
          </h2>
          <p className="text-muted-foreground">
            {projects.length} {projects.length === 1 ? "idea" : "ideas"} generated
          </p>
        </div>

        {/* Search */}
        <Card className="glass-card p-4 mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search projects by title, description, or technology..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <Card className="glass-card p-12 text-center animate-fade-in">
            <Sparkles className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery ? "Try adjusting your search" : "Generate some ideas to get started"}
            </p>
            <Link to="/generate">
              <Button className="btn-gradient">
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Ideas
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => (
              <Card
                key={project.id}
                className="glass-card p-6 hover:scale-[1.02] transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold line-clamp-1">{project.title}</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleSaveProject(project.id)}
                    className="shrink-0"
                  >
                    <Bookmark
                      className={`w-5 h-5 ${
                        savedProjects.has(project.id) ? "fill-primary text-primary" : ""
                      }`}
                    />
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                    {project.project_type}
                  </span>
                  <span className="text-xs px-2 py-1 bg-accent/10 text-accent rounded-full">
                    {project.complexity}
                  </span>
                  {project.domain.slice(0, 2).map((d, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 bg-secondary/10 text-secondary rounded-full"
                    >
                      {d}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Link to={`/project/${project.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/project/${project.id}`
                      );
                      toast({
                        title: "Link Copied!",
                        description: "Project link copied to clipboard.",
                      });
                    }}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ProjectIdeas;
