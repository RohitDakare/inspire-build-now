import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sparkles, Search, Eye, Trash2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SavedProject {
  id: string;
  project_id: string;
  saved_at: string;
  projects: {
    id: string;
    title: string;
    description: string;
    project_type: string;
    complexity: string;
    technologies: string[];
  };
}

const SavedProjects = () => {
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<SavedProject[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchSavedProjects = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("saved_projects")
        .select(`
          *,
          projects (*)
        `)
        .eq("user_id", session.user.id)
        .order("saved_at", { ascending: false });

      if (!error && data) {
        setSavedProjects(data as any);
        setFilteredProjects(data as any);
      }

      setLoading(false);
    };

    fetchSavedProjects();
  }, [navigate]);

  useEffect(() => {
    const filtered = savedProjects.filter(sp =>
      sp.projects.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sp.projects.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProjects(filtered);
  }, [searchQuery, savedProjects]);

  const handleUnsave = async (id: string, projectId: string) => {
    await supabase
      .from("saved_projects")
      .delete()
      .eq("id", id);

    setSavedProjects(prev => prev.filter(sp => sp.id !== id));
    
    toast({
      title: "Removed from Saved",
      description: "Project removed from your saved list.",
    });
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
            <Link to="/ideas">
              <Button variant="ghost">All Ideas</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h2 className="text-4xl font-bold mb-2 gradient-text">
            Saved Projects
          </h2>
          <p className="text-muted-foreground">
            {savedProjects.length} {savedProjects.length === 1 ? "project" : "projects"} saved
          </p>
        </div>

        {/* Search */}
        <Card className="glass-card p-4 mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search saved projects..."
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
            <h3 className="text-xl font-semibold mb-2">No saved projects</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery ? "Try adjusting your search" : "Start saving projects you like"}
            </p>
            <Link to="/ideas">
              <Button className="btn-gradient">
                <Eye className="w-5 h-5 mr-2" />
                Browse Ideas
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((sp, index) => (
              <Card
                key={sp.id}
                className="glass-card p-6 hover:scale-[1.02] transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold line-clamp-2 flex-1">{sp.projects.title}</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleUnsave(sp.id, sp.project_id)}
                    className="shrink-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {sp.projects.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                    {sp.projects.project_type}
                  </span>
                  <span className="text-xs px-2 py-1 bg-accent/10 text-accent rounded-full">
                    {sp.projects.complexity}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground mb-4">
                  Saved {new Date(sp.saved_at).toLocaleDateString()}
                </p>

                <div className="flex gap-2">
                  <Link to={`/project/${sp.project_id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                  <Link to={`/project/${sp.project_id}/documentation`}>
                    <Button variant="outline" size="icon">
                      <FileText className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SavedProjects;
