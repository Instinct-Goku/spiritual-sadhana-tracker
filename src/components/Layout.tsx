
import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Calendar, 
  User, 
  LogOut, 
  Menu, 
  X, 
  BarChart3,
  Home,
  PenSquare,
  ShieldCheck
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/lib/toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { currentUser, logout, userProfile } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Close mobile menu when changing routes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const getInitials = (name: string) => {
    if (!name) return "DM";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const navItems = [
    {
      name: "Home",
      path: "/",
      icon: <Home className="h-5 w-5 mr-2" />,
    },
    {
      name: "Sadhana Card",
      path: "/sadhana",
      icon: <PenSquare className="h-5 w-5 mr-2" />,
    },
    {
      name: "Progress",
      path: "/progress",
      icon: <BarChart3 className="h-5 w-5 mr-2" />,
    },
    {
      name: "Reading Log",
      path: "/reading",
      icon: <BookOpen className="h-5 w-5 mr-2" />,
    },
    {
      name: "Calendar",
      path: "/calendar",
      icon: <Calendar className="h-5 w-5 mr-2" />,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: <User className="h-5 w-5 mr-2" />,
    },
  ];

  // Add Admin link if user is an admin
  if (userProfile?.isAdmin) {
    navItems.push({
      name: "Admin",
      path: "/admin",
      icon: <ShieldCheck className="h-5 w-5 mr-2" />
    });
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow pt-5 bg-spiritual-purple/5 backdrop-blur-sm overflow-y-auto border-r border-spiritual-purple/20">
          <div className="flex items-center justify-center px-4 mb-8">
            <Link to="/" className="flex items-center">
              <div className="h-12 w-12 bg-spiritual-purple/10 rounded-full flex items-center justify-center mr-3">
                <BookOpen className="h-6 w-6 text-spiritual-purple" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-semibold text-spiritual-purple">Devotee</span>
                <span className="text-xs text-muted-foreground">Management</span>
              </div>
            </Link>
          </div>
          
          <div className="mt-6 px-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  location.pathname === item.path
                    ? "bg-spiritual-purple text-white"
                    : "text-foreground hover:bg-spiritual-purple/10"
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </div>
          
          <div className="mt-auto p-4">
            <div className="p-2 bg-spiritual-purple/5 rounded-lg mb-4">
              <div className="flex items-center mb-1">
                <Avatar className="h-10 w-10 mr-2 border border-spiritual-purple/20">
                  <AvatarImage src={userProfile?.photoURL || ""} />
                  <AvatarFallback className="bg-spiritual-purple/20 text-spiritual-purple">
                    {getInitials(userProfile?.displayName || "")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{userProfile?.displayName || "Devotee"}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                    {userProfile?.email || currentUser.email}
                  </p>
                </div>
              </div>
              
              <Button 
                onClick={handleLogout}
                variant="outline" 
                size="sm" 
                className="w-full mt-2 border-spiritual-purple/20 hover:bg-spiritual-purple/10"
              >
                <LogOut className="h-4 w-4 mr-1" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-sm border-b border-spiritual-purple/10">
        <div className="flex items-center justify-between p-4">
          <Link to="/" className="flex items-center">
            <div className="h-8 w-8 bg-spiritual-purple/10 rounded-full flex items-center justify-center mr-2">
              <BookOpen className="h-4 w-4 text-spiritual-purple" />
            </div>
            <span className="text-lg font-semibold text-spiritual-purple">Devotee</span>
          </Link>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md text-foreground hover:bg-spiritual-purple/10"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-20 bg-background/95 backdrop-blur-sm md:hidden pt-16 overflow-y-auto">
          <div className="p-4 space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-4 py-3 text-base font-medium rounded-md ${
                  location.pathname === item.path
                    ? "bg-spiritual-purple text-white"
                    : "text-foreground hover:bg-spiritual-purple/10"
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
            
            <div className="pt-4 border-t border-spiritual-purple/10 mt-6">
              <div className="flex items-center mb-3 px-4">
                <Avatar className="h-10 w-10 mr-3 border border-spiritual-purple/20">
                  <AvatarImage src={userProfile?.photoURL || ""} />
                  <AvatarFallback className="bg-spiritual-purple/20 text-spiritual-purple">
                    {getInitials(userProfile?.displayName || "")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{userProfile?.displayName || "Devotee"}</p>
                  <p className="text-xs text-muted-foreground">
                    {userProfile?.email || currentUser.email}
                  </p>
                </div>
              </div>
              
              <Button 
                onClick={handleLogout}
                variant="outline" 
                className="w-full border-spiritual-purple/20 hover:bg-spiritual-purple/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="md:ml-64 w-full">
        <main className="p-4 md:p-8 pt-20 md:pt-8 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
