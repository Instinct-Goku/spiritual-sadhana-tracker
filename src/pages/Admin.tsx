
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/lib/toast";
import { Loader2, Plus, Users, User, UsersRound, UserPlus } from "lucide-react";
import { 
  createDevoteeGroup, 
  getDevoteeGroups, 
  getDevoteesInGroup,
  DevoteeGroup, 
  DevoteeWithProfile 
} from "@/lib/adminService";

const AdminPage = () => {
  const { currentUser, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<DevoteeGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [groupMembers, setGroupMembers] = useState<DevoteeWithProfile[]>([]);
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: ""
  });
  
  // Load groups on initial render
  useEffect(() => {
    const loadGroups = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const fetchedGroups = await getDevoteeGroups(currentUser.uid);
        setGroups(fetchedGroups);
        
        if (fetchedGroups.length > 0) {
          setSelectedGroup(fetchedGroups[0].id);
        }
      } catch (error) {
        console.error("Error loading groups:", error);
        toast.error("Failed to load devotee groups");
      } finally {
        setLoading(false);
      }
    };
    
    loadGroups();
  }, [currentUser]);
  
  // Load members when a group is selected
  useEffect(() => {
    const loadGroupMembers = async () => {
      if (!selectedGroup) return;
      
      try {
        setLoading(true);
        const members = await getDevoteesInGroup(selectedGroup);
        setGroupMembers(members);
      } catch (error) {
        console.error("Error loading group members:", error);
        toast.error("Failed to load group members");
      } finally {
        setLoading(false);
      }
    };
    
    loadGroupMembers();
  }, [selectedGroup]);
  
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error("You must be logged in as an admin");
      return;
    }
    
    if (!newGroup.name.trim()) {
      toast.error("Group name is required");
      return;
    }
    
    try {
      setLoading(true);
      const groupId = await createDevoteeGroup({
        name: newGroup.name,
        description: newGroup.description,
        adminId: currentUser.uid,
        createdAt: new Date()
      });
      
      toast.success(`Group "${newGroup.name}" created successfully`);
      
      // Reset form and refresh groups
      setNewGroup({ name: "", description: "" });
      const updatedGroups = await getDevoteeGroups(currentUser.uid);
      setGroups(updatedGroups);
      
      // Select the newly created group
      setSelectedGroup(groupId);
      
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("Failed to create group");
    } finally {
      setLoading(false);
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
  
  if (!userProfile?.isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">Admin Access Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p>You need admin privileges to access this page.</p>
            <p className="mt-2">Please contact your administrator for assistance.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-spiritual-purple">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage devotee groups and track spiritual progress
        </p>
      </div>
      
      <Tabs defaultValue="groups">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2 mb-8">
          <TabsTrigger value="groups" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Devotee Groups
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="groups">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <UsersRound className="h-5 w-5 mr-2" />
                  Your Groups
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading && groups.length === 0 ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : groups.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No groups created yet. Create your first group!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {groups.map(group => (
                      <div 
                        key={group.id} 
                        className={`p-3 rounded-md cursor-pointer transition-colors ${
                          selectedGroup === group.id 
                            ? "bg-spiritual-purple text-white" 
                            : "hover:bg-spiritual-purple/10"
                        }`}
                        onClick={() => setSelectedGroup(group.id)}
                      >
                        <div className="font-medium">{group.name}</div>
                        <div className={`text-xs ${
                          selectedGroup === group.id 
                            ? "text-white/80" 
                            : "text-muted-foreground"
                        }`}>
                          {group.devoteeCount || 0} devotees
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>
                  {groups.find(g => g.id === selectedGroup)?.name || "Group Members"}
                </CardTitle>
                <CardDescription>
                  {selectedGroup ? (
                    `${groupMembers.length} devotees in this group`
                  ) : (
                    "Select a group to view members"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading && selectedGroup ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-spiritual-purple" />
                  </div>
                ) : !selectedGroup ? (
                  <p className="text-center py-8 text-muted-foreground">
                    Select a group from the left panel to view its members
                  </p>
                ) : groupMembers.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">
                    No devotees have joined this group yet
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Devotee</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Batch</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {groupMembers.map(devotee => (
                          <TableRow key={devotee.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={devotee.photoURL || ""} />
                                  <AvatarFallback className="bg-spiritual-purple/20 text-spiritual-purple">
                                    {getInitials(devotee.displayName || "")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{devotee.displayName}</div>
                                  {devotee.spiritualName && (
                                    <div className="text-xs text-muted-foreground">
                                      {devotee.spiritualName}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{devotee.phoneNumber || "-"}</TableCell>
                            <TableCell>{devotee.city || devotee.location || "-"}</TableCell>
                            <TableCell>
                              {devotee.batch ? (
                                <span className="capitalize">{devotee.batch}</span>
                              ) : "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserPlus className="h-5 w-5 mr-2" />
                Create New Devotee Group
              </CardTitle>
              <CardDescription>
                Create a new group for managing devotees and tracking their spiritual progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="groupName">Group Name</Label>
                  <Input
                    id="groupName"
                    placeholder="Enter group name"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
                    className="spiritual-input"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="groupDescription">Description (optional)</Label>
                  <Input
                    id="groupDescription"
                    placeholder="Brief description of the group"
                    value={newGroup.description}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
                    className="spiritual-input"
                  />
                </div>
                
                <Button 
                  type="submit"
                  className="w-full bg-spiritual-purple hover:bg-spiritual-purple/90"
                  disabled={loading || !newGroup.name.trim()}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Group
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
