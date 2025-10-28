import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Plus, Bookmark, Settings, LogOut, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";

interface Project {
  id: string;
  title: string;
  description: string;
  project_type: string;
  complexity: string;
  created_at: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const initDashboard = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      // Fetch recent projects
      const { data: projects, error: projectsError } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (!projectsError && projects) {
        setRecentProjects(projects);
      }

      // Count saved projects
      const { count, error: countError } = await supabase
        .from("saved_projects")
        .select("*", { count: "exact", head: true })
        .eq("user_id", session.user.id);

      if (!countError && count !== null) {
        setSavedCount(count);
      }

      setLoading(false);
    };

    initDashboard();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          setUser(session.user);
        } else {
          navigate("/auth");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged Out",
      description: "You've been successfully logged out.",
    });
    navigate("/auth");
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
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold gradient-text">ProjectAI</h1>
          </div>
          
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
            <Link to="/settings">
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <Card className="glass-card p-8 mb-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                Welcome back, {user?.user_metadata?.full_name || "Builder"}! 👋
              </h2>
              <p className="text-muted-foreground">
                Ready to discover your next amazing project?
              </p>
            </div>
            <Link to="/generate">
              <Button className="btn-gradient">
                <Plus className="w-5 h-5 mr-2" />
                Generate New Ideas
              </Button>
            </Link>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glass-card p-6 animate-fade-in hover:scale-105 transition-transform duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Projects</p>
                <p className="text-2xl font-bold">{recentProjects.length}</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6 animate-fade-in hover:scale-105 transition-transform duration-300" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                <Bookmark className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Saved Projects</p>
                <p className="text-2xl font-bold">{savedCount}</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6 animate-fade-in hover:scale-105 transition-transform duration-300" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">
                  {recentProjects.filter(p => {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return new Date(p.created_at) > weekAgo;
                  }).length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Projects */}
        <Card className="glass-card p-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <h3 className="text-xl font-bold mb-6">Recent Project Ideas</h3>
          
          {recentProjects.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No project ideas yet. Let's create some!</p>
              <Link to="/generate">
                <Button className="btn-gradient">
                  <Plus className="w-5 h-5 mr-2" />
                  Generate Your First Idea
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentProjects.map((project, index) => (
                <Link key={project.id} to={`/project/${project.id}`}>
                  <Card 
                    className="p-4 hover:bg-muted/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer animate-fade-in"
                    style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{project.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {project.description}
                        </p>
                        <div className="flex gap-2">
                          <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                            {project.project_type}
                          </span>
                          <span className="text-xs px-2 py-1 bg-accent/10 text-accent rounded-full">
                            {project.complexity}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(project.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
