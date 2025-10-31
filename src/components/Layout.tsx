import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Menu, Settings, HelpCircle, Bookmark, Lightbulb, LayoutDashboard, Sparkles } from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/generate', icon: Lightbulb, label: 'Generate Ideas' },
  { to: '/saved', icon: Bookmark, label: 'Saved Projects' },
];

const bottomNavItems = [
  { to: '/settings', icon: Settings, label: 'Settings' },
  { to: '/help', icon: HelpCircle, label: 'Help' },
];

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
      } else {
        setUser(user);
      }
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 flex items-center gap-2 border-b">
        <Sparkles className="w-8 h-8 text-primary" />
        <h1 className={`text-xl font-bold gradient-text ${isCollapsed ? 'hidden' : ''}`}>ProjectAI</h1>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-2">
        {navItems.map((item) => (
          <Tooltip key={item.to}>
            <TooltipTrigger asChild>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-muted ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`
                }
              >
                <item.icon className="h-5 w-5" />
                <span className={`${isCollapsed ? 'hidden' : ''}`}>{item.label}</span>
              </NavLink>
            </TooltipTrigger>
            {isCollapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
          </Tooltip>
        ))}
      </nav>
      <div className="mt-auto p-2 border-t">
        <nav className="space-y-1">
          {bottomNavItems.map((item) => (
            <Tooltip key={item.to}>
              <TooltipTrigger asChild>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-muted ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`
                  }
                >
                  <item.icon className="h-5 w-5" />
                  <span className={`${isCollapsed ? 'hidden' : ''}`}>{item.label}</span>
                </NavLink>
              </TooltipTrigger>
              {isCollapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
            </Tooltip>
          ))}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
                <span className={`${isCollapsed ? 'hidden' : ''}`}>Logout</span>
              </Button>
            </TooltipTrigger>
            {isCollapsed && <TooltipContent side="right">Logout</TooltipContent>}
          </Tooltip>
        </nav>
        <div className="border-t mt-2 pt-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-muted" onClick={() => navigate('/settings')}>
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className={`${isCollapsed ? 'hidden' : ''}`}>
                  <p className="text-sm font-medium leading-none">{user?.user_metadata?.full_name || user?.email}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </div>
            </TooltipTrigger>
            {isCollapsed && <TooltipContent side="right">{user?.user_metadata?.full_name || user?.email}</TooltipContent>}
          </Tooltip>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full flex bg-muted/40">
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col border-r bg-background transition-all ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <NavContent />
      </aside>

      <div className="flex flex-col flex-1">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col w-64 p-0">
              <NavContent />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <h1 className="text-lg font-bold gradient-text">ProjectAI</h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;