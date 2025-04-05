
import { useAuth } from "@/contexts/AuthContext";
import JoinGroup from "@/components/JoinGroup";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

const Home = () => {
  const { userProfile } = useAuth();
  
  return (
    <div className="container max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-spiritual-purple mb-2">
        Welcome, {userProfile?.displayName || userProfile?.spiritualName || "Devotee"}
      </h1>
      
      <p className="text-muted-foreground mb-8">
        Track your spiritual practices and connect with other devotees
      </p>
      
      {userProfile?.isAdmin && (
        <div className="mb-6">
          <Link to="/admin">
            <Button variant="outline" className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Open Admin Dashboard
            </Button>
          </Link>
        </div>
      )}
      
      <JoinGroup />
      
    </div>
  );
};

export default Home;
