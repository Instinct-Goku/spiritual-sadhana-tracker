import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/lib/toast";
import { Loader2, Plus, Users, User, UsersRound, UserPlus, Trash, Eye, X, BarChart, Settings } from "lucide-react";
import { 
  createDevoteeGroup, 
  getDevoteeGroups, 
  getDevoteesInGroup,
  DevoteeGroup, 
  DevoteeWithProfile,
  deleteDevoteeGroup,
  getDevoteeDetails,
  getGroupSadhanaProgress,
  DevoteeSadhanaProgress
} from "@/lib/adminService";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { UserProfile } from "@/contexts/AuthContext";
import { Timestamp } from "firebase/firestore";
import BatchScoreConfig from "@/components/BatchScoreConfig";

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
  const [selectedDevotee, setSelectedDevotee] = useState<DevoteeWithProfile | null>(null);
  const [devoteeDetails, setDevoteeDetails] = useState<UserProfile | null>(null);
  const [showDevoteeDetails, setShowDevoteeDetails] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewTab, setViewTab] = useState<"members" | "progress">("members");
  const [progressData, setProgressData] = useState<DevoteeSadhanaProgress[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [showScoreConfig, setShowScoreConfig] = useState(false);
  
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
  
  const loadProgressData = async () => {
    if (!selectedGroup) return;
    
    try {
      setLoadingProgress(true);
      const progress = await getGroupSadhanaProgress(selectedGroup);
      setProgressData(progress);
    } catch (error) {
      console.error("Error loading progress data:", error);
      toast.error("Failed to load spiritual progress data");
    } finally {
      setLoadingProgress(false);
    }
  };
  
  useEffect(() => {
    if (viewTab === "progress" && selectedGroup && progressData.length === 0) {
      loadProgressData();
    }
  }, [viewTab, selectedGroup]);
  
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
      
      setNewGroup({ name: "", description: "" });
      const updatedGroups = await getDevoteeGroups(currentUser.uid);
      setGroups(updatedGroups);
      
      setSelectedGroup(groupId);
      
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("Failed to create group");
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteGroup = async (groupId: string) => {
    if (!currentUser) {
      toast.error("You must be logged in as an admin");
      return;
    }
    
    try {
      setIsDeleting(true);
      await deleteDevoteeGroup(groupId, currentUser.uid);
      
      const updatedGroups = groups.filter(group => group.id !== groupId);
      setGroups(updatedGroups);
      
      if (updatedGroups.length > 0) {
        setSelectedGroup(updatedGroups[0].id);
      } else {
        setSelectedGroup("");
        setGroupMembers([]);
      }
      
      toast.success("Group deleted successfully");
    } catch (error: any) {
      console.error("Error deleting group:", error);
      toast.error(error.message || "Failed to delete group");
    } finally {
      setIsDeleting(false);
    }
  };
  
  const viewDevoteeDetails = async (devotee: DevoteeWithProfile | DevoteeSadhanaProgress) => {
    let devoteeId = 'uid' in devotee ? devotee.uid : devotee.id;
    
    if ('uid' in devotee) {
      setSelectedDevotee(devotee);
    }
    
    try {
      const details = await getDevoteeDetails(devoteeId);
      if (details) {
        setDevoteeDetails(details);
        setShowDevoteeDetails(true);
      } else {
        toast.error("Failed to load devotee details");
      }
    } catch (error) {
      console.error("Error loading devotee details:", error);
      toast.error("Failed to load devotee details");
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
  
  const formatDate = (date: Date | Timestamp | undefined | string | null) => {
    if (!date) return "N/A";
    
    try {
      let dateObject: Date;
      
      if (typeof date === 'string') {
        dateObject = new Date(date);
      } else if (date instanceof Timestamp) {
        dateObject = date.toDate();
      } else if (date instanceof Date) {
        dateObject = date;
      } else {
        return "N/A";
      }
      
      if (isNaN(dateObject.getTime())) {
        console.error("Invalid date detected:", date);
        return "Invalid date";
      }
      
      return format(dateObject, 'PPP');
    } catch (error) {
      console.error("Error formatting date:", error, "Date value:", date);
      return "Invalid date";
    }
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
      
      <div className="flex justify-end mb-4">
        <Button 
          onClick={() => setShowScoreConfig(true)} 
          variant="outline" 
          className="flex items-center text-spiritual-purple"
        >
          <Settings className="h-4 w-4 mr-2" />
          Configure Sadhana Scoring
        </Button>
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
                        className="flex items-center justify-between p-3 rounded-md hover:bg-spiritual-purple/10"
                      >
                        <div 
                          className={`flex-1 cursor-pointer ${
                            selectedGroup === group.id 
                              ? "text-spiritual-purple font-medium" 
                              : ""
                          }`}
                          onClick={() => setSelectedGroup(group.id)}
                        >
                          <div className="font-medium">{group.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {group.devoteeCount || 0} devotees
                          </div>
                        </div>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Group</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{group.name}"? This action
                                cannot be undone, and all members will be removed from the group.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                disabled={isDeleting}
                                onClick={() => handleDeleteGroup(group.id)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                {isDeleting ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                  </>
                                ) : (
                                  "Delete Group"
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader className="pb-4">
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
                
                {selectedGroup && (
                  <div className="flex space-x-2 mt-4">
                    <Button 
                      variant={viewTab === "members" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setViewTab("members")}
                      className={viewTab === "members" ? "bg-spiritual-purple hover:bg-spiritual-purple/90" : ""}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Members
                    </Button>
                    <Button 
                      variant={viewTab === "progress" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setViewTab("progress")}
                      className={viewTab === "progress" ? "bg-spiritual-purple hover:bg-spiritual-purple/90" : ""}
                    >
                      <BarChart className="h-4 w-4 mr-2" />
                      Spiritual Progress
                    </Button>
                  </div>
                )}
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
                ) : viewTab === "members" ? (
                  groupMembers.length === 0 ? (
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
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {groupMembers.map(devotee => (
                            <TableRow key={devotee.uid}>
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
                                {devotee.batchName || devotee.batch ? (
                                  <span className="capitalize">{devotee.batchName || devotee.batch}</span>
                                ) : "-"}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                  onClick={() => viewDevoteeDetails(devotee)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )
                ) : loadingProgress ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-spiritual-purple" />
                  </div>
                ) : progressData.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      No spiritual progress data available for this group
                    </p>
                    <Button onClick={loadProgressData}>
                      <Loader2 className="mr-2 h-4 w-4" />
                      Refresh Data
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Devotee</TableHead>
                          <TableHead>Chanting</TableHead>
                          <TableHead>Reading</TableHead>
                          <TableHead>Mangala Arati</TableHead>
                          <TableHead>Morning Program</TableHead>
                          <TableHead className="text-right">Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {progressData.map(devotee => (
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
                            <TableCell>
                              {devotee.weeklyStats ? (
                                <div>
                                  <div className="font-medium">
                                    {devotee.weeklyStats.averageChantingRounds} rounds/day
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {devotee.weeklyStats.totalChantingRounds} total rounds
                                  </div>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">No data</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {devotee.weeklyStats ? (
                                <div>
                                  <div className="font-medium">
                                    {devotee.weeklyStats.averageReadingMinutes} min/day
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {devotee.weeklyStats.totalReadingMinutes} total minutes
                                  </div>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">No data</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {devotee.weeklyStats ? (
                                <div>
                                  <Progress 
                                    value={devotee.weeklyStats.mangalaAratiAttendance} 
                                    className="h-2 w-24" 
                                  />
                                  <div className="text-xs mt-1">
                                    {devotee.weeklyStats.mangalaAratiAttendance}%
                                  </div>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">No data</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {devotee.weeklyStats ? (
                                <div>
                                  <Progress 
                                    value={devotee.weeklyStats.morningProgramAttendance} 
                                    className="h-2 w-24" 
                                  />
                                  <div className="text-xs mt-1">
                                    {devotee.weeklyStats.morningProgramAttendance}%
                                  </div>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">No data</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={() => viewDevoteeDetails(devotee)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
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
      
      <Dialog open={showDevoteeDetails} onOpenChange={setShowDevoteeDetails}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Devotee Details</DialogTitle>
            <DialogDescription>
              Detailed profile information for {selectedDevotee?.displayName}
            </DialogDescription>
          </DialogHeader>
          
          {devoteeDetails ? (
            <div className="grid gap-4 py-4">
              <div className="flex justify-center mb-2">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={devoteeDetails.photoURL || ""} />
                  <AvatarFallback className="bg-spiritual-purple/20 text-spiritual-purple text-xl">
                    {getInitials(devoteeDetails.displayName || "")}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold">{devoteeDetails.displayName}</h3>
                {devoteeDetails.spiritualName && (
                  <p className="text-muted-foreground">{devoteeDetails.spiritualName}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p>{devoteeDetails.email}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p>{devoteeDetails.phoneNumber || "Not provided"}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Location</p>
                  <p>{devoteeDetails.city || devoteeDetails.location || "Not provided"}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Batch</p>
                  <p className="capitalize">{devoteeDetails.batchName || devoteeDetails.batch || "Not provided"}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                  <p>{devoteeDetails.dateOfBirth ? formatDate(devoteeDetails.dateOfBirth) : "Not provided"}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Joined On</p>
                  <p>{devoteeDetails.joinDate ? formatDate(devoteeDetails.joinDate) : "Not provided"}</p>
                </div>
                
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Address</p>
                  <p>{devoteeDetails.address || "Not provided"}</p>
                </div>
                
                {devoteeDetails.bio && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Bio</p>
                    <p>{devoteeDetails.bio}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-spiritual-purple" />
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDevoteeDetails(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showScoreConfig} onOpenChange={setShowScoreConfig}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sadhana Score Configuration</DialogTitle>
            <DialogDescription>
              Configure scoring criteria for different batches and enable weekly score consolidation
            </DialogDescription>
          </DialogHeader>
          
          <BatchScoreConfig onClose={() => setShowScoreConfig(false)} />
          
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowScoreConfig(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;
