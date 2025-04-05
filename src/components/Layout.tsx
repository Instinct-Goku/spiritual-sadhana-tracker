import React from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Home,
  User,
  BookOpen,
  Calendar,
  BarChart3,
  Menu,
  LogOut,
  Settings,
  ShieldCheck,
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentUser, userProfile, logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "DM";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const navItems = [
    {
      name: "Home",
      path: "/",
      icon: <Home className="h-5 w-5" />,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: <User className="h-5 w-5" />,
    },
    {
      name: "Sadhana",
      path: "/sadhana",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      name: "Progress",
      path: "/progress",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      name: "Calendar",
      path: "/calendar",
      icon: <Calendar className="h-5 w-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
        <div className="container flex h-14 items-center">
          <div className="mr-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] sm:w-[300px]">
                <SheetHeader className="border-b pb-4 mb-4">
                  <SheetTitle className="text-spiritual-purple">Devotee Manager</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-2">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `${
                          isActive ? "bg-spiritual-purple/10 text-spiritual-purple" : "text-muted-foreground hover:bg-muted"
                        } flex items-center gap-3 rounded-lg px-3 py-2 transition-all`
                      }
                    >
                      {item.icon}
                      <span className="text-sm font-medium">{item.name}</span>
                    </NavLink>
                  ))}
                  
                  {userProfile?.isAdmin && (
                    <NavLink
                      to="/admin"
                      className={({ isActive }) =>
                        `${
                          isActive ? "bg-spiritual-purple/10 text-spiritual-purple" : "text-muted-foreground hover:bg-muted"
                        } flex items-center gap-3 rounded-lg px-3 py-2 transition-all`
                      }
                    >
                      <ShieldCheck className="h-5 w-5" />
                      <span className="text-sm font-medium">Admin</span>
                    </NavLink>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
          <Link to="/" className="flex items-center gap-2">
            <span className="font-bold text-xl text-spiritual-purple">Devotee Manager</span>
          </Link>
          <div className="flex-1"></div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser?.photoURL || ""} alt={currentUser?.displayName || ""} />
                  <AvatarFallback className="bg-spiritual-purple/20 text-spiritual-purple">
                    {getInitials(currentUser?.displayName || "")}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{currentUser?.displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{currentUser?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Desktop Layout */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col border-r bg-background fixed inset-y-0">
          <div className="flex h-14 items-center border-b px-4">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-bold text-xl text-spiritual-purple">Devotee Manager</span>
            </Link>
          </div>
          <nav className="flex-1 overflow-auto py-4 px-2">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `${
                      isActive ? "bg-spiritual-purple/10 text-spiritual-purple" : "text-muted-foreground hover:bg-muted"
                    } flex items-center gap-3 rounded-lg px-3 py-2 transition-all`
                  }
                >
                  {item.icon}
                  <span className="text-sm font-medium">{item.name}</span>
                </NavLink>
              ))}
              
              {userProfile?.isAdmin && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `${
                      isActive ? "bg-spiritual-purple/10 text-spiritual-purple" : "text-muted-foreground hover:bg-muted"
                    } flex items-center gap-3 rounded-lg px-3 py-2 transition-all`
                  }
                >
                  <ShieldCheck className="h-5 w-5" />
                  <span className="text-sm font-medium">Admin</span>
                </NavLink>
              )}
            </div>
          </nav>
          <div className="border-t p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={currentUser?.photoURL || ""} alt={currentUser?.displayName || ""} />
                    <AvatarFallback className="bg-spiritual-purple/20 text-spiritual-purple">
                      {getInitials(currentUser?.displayName || "")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">{currentUser?.displayName}</span>
                    <span className="text-xs text-muted-foreground">{userProfile?.spiritualName}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{currentUser?.displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{currentUser?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:pl-64">
          <div className="py-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
