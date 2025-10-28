import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Zap, Target, BookOpen, ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkSession();
  }, [navigate]);

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Ideas",
      description: "Generate unique project ideas tailored to your skills and interests",
    },
    {
      icon: Zap,
      title: "Instant Blueprints",
      description: "Get detailed project plans, roadmaps, and implementation guides",
    },
    {
      icon: Target,
      title: "Skill-Matched",
      description: "Projects suited to your experience level, from beginner to advanced",
    },
    {
      icon: BookOpen,
      title: "Professional Docs",
      description: "Generate comprehensive documentation ready for academic or portfolio use",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />
      </div>

      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold gradient-text">ProjectAI</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <Link to="/auth">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link to="/auth">
            <Button className="btn-gradient">Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Project Discovery</span>
          </div>
          
          <h2 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Discover Your Next
            <span className="gradient-text block">Coding Project</span>
          </h2>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Input your skills and interests, and our AI generates tailored project ideas with
            detailed plans and documentation to kickstart your journey
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Link to="/auth">
              <Button size="lg" className="btn-gradient">
                Start Generating Ideas
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="glass-card p-6 hover:scale-105 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${0.4 + index * 0.1}s` }}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center mb-12 animate-fade-in">
          <h3 className="text-3xl font-bold mb-4">How It Works</h3>
          <p className="text-muted-foreground">Get started in 4 simple steps</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {[
            { step: "1", title: "Select Preferences", desc: "Choose project type, domain, and complexity" },
            { step: "2", title: "Generate Ideas", desc: "AI creates personalized project suggestions" },
            { step: "3", title: "Explore Details", desc: "View roadmaps, structure, and code examples" },
            { step: "4", title: "Build & Document", desc: "Get professional documentation for your project" },
          ].map((item, index) => (
            <Card
              key={index}
              className="glass-card p-6 text-center hover:scale-105 transition-all animate-fade-in"
              style={{ animationDelay: `${0.5 + index * 0.1}s` }}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                {item.step}
              </div>
              <h4 className="font-bold mb-2">{item.title}</h4>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 relative z-10">
        <Card className="glass-card p-12 text-center animate-fade-in">
          <h3 className="text-3xl font-bold mb-4 gradient-text">
            Ready to Build Something Amazing?
          </h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join developers, students, and educators discovering their next project with AI
          </p>
          <Link to="/auth">
            <Button size="lg" className="btn-gradient">
              <Sparkles className="w-5 h-5 mr-2" />
              Get Started Now
            </Button>
          </Link>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-border/50 relative z-10">
        <div className="text-center text-muted-foreground">
          <p>© 2025 ProjectAI. Powered by AI to inspire developers worldwide.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
