
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import JoinGroupButton from "./JoinGroupButton";
import { DevoteeGroup, getAvailableGroups } from "@/lib/adminService";

const JoinGroup = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [availableGroups, setAvailableGroups] = useState<DevoteeGroup[]>([]);

  useEffect(() => {
    const loadGroups = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const groups = await getAvailableGroups();
        setAvailableGroups(groups);
      } catch (error) {
        console.error("Error loading groups in JoinGroup:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadGroups();
  }, [currentUser]);

  return (
    <div className="mt-4">
      {loading ? (
        <p className="text-muted-foreground">Loading available groups...</p>
      ) : (
        <JoinGroupButton />
      )}
    </div>
  );
};

export default JoinGroup;
