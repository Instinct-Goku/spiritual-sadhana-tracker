
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { Loader2, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  getAvailableGroups, 
  joinDevoteeGroup, 
  getUserGroups,
  leaveGroup,
  DevoteeGroup 
} from "@/lib/adminService";

const JoinGroupButton = () => {
  const { currentUser } = useAuth();
  const [availableGroups, setAvailableGroups] = useState<DevoteeGroup[]>([]);
  const [userGroups, setUserGroups] = useState<DevoteeGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Load available groups and user's current groups
  useEffect(() => {
    const loadGroups = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const groups = await getAvailableGroups();
        setAvailableGroups(groups);
        
        // Also load user's current groups
        const userGroupsList = await getUserGroups(currentUser.uid);
        setUserGroups(userGroupsList);
      } catch (error) {
        console.error("Error loading groups:", error);
        toast.error("Failed to load devotee groups");
      } finally {
        setLoading(false);
      }
    };
    
    loadGroups();
  }, [currentUser]);

  const handleJoinGroup = async () => {
    if (!currentUser || !selectedGroup) return;
    
    try {
      setLoading(true);
      await joinDevoteeGroup(currentUser.uid, selectedGroup);
      
      toast.success("You have joined the group successfully");
      
      // Refresh user's groups
      const userGroupsList = await getUserGroups(currentUser.uid);
      setUserGroups(userGroupsList);
      
      // Reset selection
      setSelectedGroup("");
    } catch (error: any) {
      console.error("Error joining group:", error);
      toast.error(error.message || "Failed to join group");
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      await leaveGroup(currentUser.uid, groupId);
      
      toast.success("You have left the group");
      
      // Refresh user's groups
      const userGroupsList = await getUserGroups(currentUser.uid);
      setUserGroups(userGroupsList);
    } catch (error: any) {
      console.error("Error leaving group:", error);
      toast.error(error.message || "Failed to leave group");
    } finally {
      setLoading(false);
    }
  };

  // Filter out groups the user has already joined
  const filteredGroups = availableGroups.filter(
    group => !userGroups.some(userGroup => userGroup.id === group.id)
  );

  return (
    <div className="space-y-6">
      <div className="bg-muted/40 rounded-lg p-4 space-y-3">
        <h3 className="font-medium">Join a Devotee Group</h3>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Select
            value={selectedGroup}
            onValueChange={setSelectedGroup}
            disabled={loading || filteredGroups.length === 0}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a group to join" />
            </SelectTrigger>
            <SelectContent>
              {filteredGroups.map(group => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                </SelectItem>
              ))}
              {filteredGroups.length === 0 && (
                <SelectItem value="none" disabled>
                  No available groups to join
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          
          <Button
            onClick={handleJoinGroup}
            disabled={loading || !selectedGroup}
            className="whitespace-nowrap"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Joining...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Join Group
              </>
            )}
          </Button>
        </div>
      </div>
      
      {userGroups.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium">Your Groups</h3>
          <div className="space-y-2">
            {userGroups.map(group => (
              <div 
                key={group.id}
                className="flex items-center justify-between p-3 bg-muted/20 rounded-md"
              >
                <div>
                  <div className="font-medium">{group.name}</div>
                  {group.description && (
                    <div className="text-xs text-muted-foreground">{group.description}</div>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleLeaveGroup(group.id)}
                  disabled={loading}
                >
                  Leave
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default JoinGroupButton;
