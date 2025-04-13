
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout";

// Import useAuth inside components, not at the top level
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Sadhana from "./pages/Sadhana";
import Progress from "./pages/Progress";
import Reading from "./pages/Reading";
import Calendar from "./pages/Calendar";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppRoutes />
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// Protected route component - moved inside AppRoutes to avoid hook outside component error
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      
      {/* Protected Routes */}
      <Route path="/" element={<ProtectedRoute><Layout><Home /></Layout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
      <Route path="/sadhana" element={<ProtectedRoute><Layout><Sadhana /></Layout></ProtectedRoute>} />
      <Route path="/progress" element={<ProtectedRoute><Layout><Progress /></Layout></ProtectedRoute>} />
      <Route path="/reading" element={<ProtectedRoute><Layout><Reading /></Layout></ProtectedRoute>} />
      <Route path="/calendar" element={<ProtectedRoute><Layout><Calendar /></Layout></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><Layout><Admin /></Layout></ProtectedRoute>} />
      
      {/* Catch All - 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// Move these components inside AppRoutes to avoid hook calls outside components
import { useAuth } from "./contexts/AuthContext";

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

// Public route component (redirects to home if logged in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (currentUser) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

export default App;
