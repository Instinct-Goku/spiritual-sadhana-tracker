
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, UsersRound } from "lucide-react";
import { toast } from "@/lib/toast";
import { 
  DevoteeGroup, 
  getAvailableGroups, 
  getUserGroups, 
  joinDevoteeGroup, 
  leaveGroup 
} from "@/lib/adminService";

const JoinGroup = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [availableGroups, setAvailableGroups] = useState<DevoteeGroup[]>([]);
  const [userGroups, setUserGroups] = useState<DevoteeGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  
  useEffect(() => {
    const loadGroups = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        
        // Get groups the user has already joined
        const joined = await getUserGroups(currentUser.uid);
        setUserGroups(joined);
        
        // Get all available groups
        const available = await getAvailableGroups();
        
        // Filter out groups user has already joined
        const joinedIds = joined.map(g => g.id);
        const filteredGroups = available.filter(g => !joinedIds.includes(g.id));
        
        setAvailableGroups(filteredGroups);
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
    if (!currentUser || !selectedGroup) {
      toast.error("Please select a group to join");
      return;
    }
    
    try {
      setJoining(true);
      await joinDevoteeGroup(currentUser.uid, selectedGroup);
      
      toast.success("Successfully joined the group!");
      
      // Refresh groups
      const joined = await getUserGroups(currentUser.uid);
      setUserGroups(joined);
      
      const available = await getAvailableGroups();
      const joinedIds = joined.map(g => g.id);
      const filteredGroups = available.filter(g => !joinedIds.includes(g.id));
      
      setAvailableGroups(filteredGroups);
      setSelectedGroup("");
    } catch (error: any) {
      console.error("Error joining group:", error);
      toast.error(error.message || "Failed to join group");
    } finally {
      setJoining(false);
    }
  };
  
  const handleLeaveGroup = async (groupId: string) => {
    if (!currentUser) return;
    
    try {
      setJoining(true);
      await leaveGroup(currentUser.uid, groupId);
      
      toast.success("Left the group successfully");
      
      // Refresh groups
      const joined = await getUserGroups(currentUser.uid);
      setUserGroups(joined);
      
      const available = await getAvailableGroups();
      const joinedIds = joined.map(g => g.id);
      const filteredGroups = available.filter(g => !joinedIds.includes(g.id));
      
      setAvailableGroups(filteredGroups);
    } catch (error: any) {
      console.error("Error leaving group:", error);
      toast.error(error.message || "Failed to leave group");
    } finally {
      setJoining(false);
    }
  };
  
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <UsersRound className="h-5 w-5 mr-2" />
          Devotee Groups
        </CardTitle>
        <CardDescription>
          Join spiritual groups to connect with other devotees
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-spiritual-purple" />
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {userGroups.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Your Groups</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {userGroups.map(group => (
                      <div key={group.id} className="p-3 bg-spiritual-purple/10 rounded-md">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{group.name}</h4>
                            {group.description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {group.description}
                              </p>
                            )}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleLeaveGroup(group.id)}
                            disabled={joining}
                            className="text-xs"
                          >
                            Leave
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {availableGroups.length > 0 ? (
                <div>
                  <h3 className="text-lg font-medium mb-2">Join a Group</h3>
                  <div className="flex items-center gap-2">
                    <Select
                      value={selectedGroup}
                      onValueChange={setSelectedGroup}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a group to join" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableGroups.map(group => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Button 
                      onClick={handleJoinGroup}
                      disabled={!selectedGroup || joining}
                      className="bg-spiritual-purple hover:bg-spiritual-purple/90 whitespace-nowrap"
                    >
                      {joining ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Joining...
                        </>
                      ) : (
                        "Join Group"
                      )}
                    </Button>
                  </div>
                </div>
              ) : userGroups.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">
                  No devotee groups are available to join at this time
                </p>
              ) : null}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default JoinGroup;
