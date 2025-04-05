
import { useAuth } from "@/contexts/AuthContext";
import JoinGroupButton from "@/components/JoinGroupButton";

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
      
      <JoinGroupButton />
      
    </div>
  );
};

export default Home;
