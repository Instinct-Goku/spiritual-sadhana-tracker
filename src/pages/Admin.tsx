import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth, UserProfile } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/lib/toast";
import { Loader2, Search, UserCheck, UserX, Users, Settings, Crown, Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDevoteeGroups, getDevoteesInGroup } from "@/lib/adminService";
import BatchScoreConfig from "@/components/BatchScoreConfig";

// Define types for the admin page
interface DevoteeSadhanaProgress {
  profile: UserProfile;
  progress: {
    totalChantingDays: number;
    totalReadingDays: number;
    averageRounds: number;
    averageReadingMinutes: number;
  };
}

type DevoteeWithProfile = UserProfile;

interface DevoteeGroup {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: Date;
  devoteeIds: string[];
  devoteeCount?: number;
}

const AdminPage = () => {
  const { userProfile } = useAuth();
  const [devotees, setDevotees] = useState<DevoteeWithProfile[]>([]);
  const [filteredDevotees, setFilteredDevotees] = useState<DevoteeWithProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedDevotee, setSelectedDevotee] = useState<DevoteeWithProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isGroupAdmin, setIsGroupAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("devotees");
  const [groups, setGroups] = useState<DevoteeGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<DevoteeGroup | null>(null);
  const [groupDevotees, setGroupDevotees] = useState<DevoteeWithProfile[]>([]);

  useEffect(() => {
    // Check if current user is admin or group admin
    if (userProfile?.isAdmin) {
      setIsAdmin(true);
      fetchDevotees();
      fetchGroups();
    } else if (userProfile?.isGroupAdmin) {
      setIsGroupAdmin(true);
      fetchGroups(); // Group admins can only see their groups
    } else {
      setLoading(false);
    }
  }, [userProfile]);

  const fetchDevotees = async () => {
    try {
      const usersRef = collection(db, "users");
      const querySnapshot = await getDocs(usersRef);
      
      const devoteesList: DevoteeWithProfile[] = [];
      
      querySnapshot.forEach((doc) => {
        const devoteeData = doc.data() as UserProfile;
        devoteesList.push(devoteeData);
      });
      
      setDevotees(devoteesList);
      setFilteredDevotees(devoteesList);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching devotees:", error);
      toast.error("Failed to load devotees");
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      if (userProfile?.uid) {
        const groupsList = await getDevoteeGroups(userProfile.uid);
        setGroups(groupsList);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast.error("Failed to load devotee groups");
    }
  };

  const handleGroupSelect = async (group: DevoteeGroup) => {
    setSelectedGroup(group);
    setLoading(true);
    try {
      const devotees = await getDevoteesInGroup(group.id);
      setGroupDevotees(devotees);
    } catch (error) {
      console.error("Error fetching devotees in group:", error);
      toast.error("Failed to load devotees in this group");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (!term.trim()) {
      setFilteredDevotees(devotees);
      return;
    }
    
    const filtered = devotees.filter(
      (devotee) =>
        devotee.displayName?.toLowerCase().includes(term) ||
        devotee.email?.toLowerCase().includes(term) ||
        devotee.spiritualName?.toLowerCase().includes(term) ||
        devotee.mobileNumber?.includes(term)
    );
    
    setFilteredDevotees(filtered);
  };

  const toggleAdminStatus = async (devotee: DevoteeWithProfile, adminType: 'admin' | 'groupAdmin') => {
    // Only super admins can change admin status
    if (!userProfile?.isAdmin) {
      toast.error("Only super admins can change admin status");
      return;
    }

    try {
      const userRef = doc(db, "users", devotee.uid);
      let updateData: any = {};
      
      if (adminType === 'admin') {
        const newAdminStatus = !devotee.isAdmin;
        updateData.isAdmin = newAdminStatus;
        
        toast.success(
          `${devotee.displayName} is ${newAdminStatus ? "now" : "no longer"} a super admin`
        );
      } else if (adminType === 'groupAdmin') {
        const newGroupAdminStatus = !devotee.isGroupAdmin;
        updateData.isGroupAdmin = newGroupAdminStatus;
        
        toast.success(
          `${devotee.displayName} is ${newGroupAdminStatus ? "now" : "no longer"} a group admin`
        );
      }
      
      await updateDoc(userRef, updateData);
      
      // Update local state
      const updatedDevotees = devotees.map((d) =>
        d.uid === devotee.uid ? { ...d, ...updateData } : d
      );
      
      setDevotees(updatedDevotees);
      setFilteredDevotees(
        filteredDevotees.map((d) =>
          d.uid === devotee.uid ? { ...d, ...updateData } : d
        )
      );
      
      if (selectedDevotee?.uid === devotee.uid) {
        setSelectedDevotee({ ...selectedDevotee, ...updateData });
      }
      
    } catch (error) {
      console.error("Error updating admin status:", error);
      toast.error("Failed to update admin status");
    }
  };

  const handleDevoteeClick = (devotee: DevoteeWithProfile | DevoteeSadhanaProgress) => {
    if ('profile' in devotee) {
      setSelectedDevotee(devotee.profile);
    } else {
      setSelectedDevotee(devotee);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-spiritual-purple" />
      </div>
    );
  }

  if (!isAdmin && !isGroupAdmin) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
              <p className="mt-2">
                You do not have permission to access the admin dashboard.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderDevoteeCard = (devotee: DevoteeWithProfile, isSelected: boolean) => (
    <Card
      key={devotee.uid}
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? "border-2 border-spiritual-purple" : ""
      }`}
      onClick={() => handleDevoteeClick(devotee)}
    >
      <CardContent className="p-4 flex items-center space-x-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={devotee.photoURL || ""} />
          <AvatarFallback>
            {devotee.displayName?.charAt(0) || "D"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate flex items-center gap-2">
            {devotee.displayName}
            {devotee.isAdmin && <Crown className="h-4 w-4 text-yellow-500" />}
            {devotee.isGroupAdmin && <Shield className="h-4 w-4 text-blue-500" />}
            {devotee.spiritualName && (
              <span className="text-spiritual-purple ml-1">
                ({devotee.spiritualName})
              </span>
            )}
          </p>
          <p className="text-sm text-muted-foreground truncate">
            {devotee.email}
          </p>
          {devotee.mobileNumber && (
            <p className="text-sm text-muted-foreground">
              {devotee.mobileNumber}
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            Batch: {devotee.batch || "Not assigned"}
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                toggleAdminStatus(devotee, 'admin');
              }}
              title={devotee.isAdmin ? "Remove super admin" : "Make super admin"}
            >
              {devotee.isAdmin ? (
                <Crown className="h-5 w-5 text-yellow-600" />
              ) : (
                <Crown className="h-5 w-5 text-gray-400" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                toggleAdminStatus(devotee, 'groupAdmin');
              }}
              title={devotee.isGroupAdmin ? "Remove group admin" : "Make group admin"}
            >
              {devotee.isGroupAdmin ? (
                <Shield className="h-5 w-5 text-blue-600" />
              ) : (
                <Shield className="h-5 w-5 text-gray-400" />
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderDevoteeDetails = () => (
    selectedDevotee && (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-spiritual-purple flex items-center gap-2">
            Devotee Details
            {selectedDevotee.isAdmin && <Crown className="h-5 w-5 text-yellow-500" />}
            {selectedDevotee.isGroupAdmin && <Shield className="h-5 w-5 text-blue-500" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={selectedDevotee.photoURL || ""} />
                <AvatarFallback className="text-lg">
                  {selectedDevotee.displayName?.charAt(0) || "D"}
                </AvatarFallback>
              </Avatar>
              <p className="mt-2 font-medium">{selectedDevotee.displayName}</p>
              {selectedDevotee.spiritualName && (
                <p className="text-spiritual-purple">
                  {selectedDevotee.spiritualName}
                </p>
              )}
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-muted-foreground">{selectedDevotee.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Mobile</p>
                <p className="text-muted-foreground">
                  {selectedDevotee.mobileNumber || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Batch</p>
                <p className="text-muted-foreground">
                  {selectedDevotee.batch || "Not assigned"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Location</p>
                <p className="text-muted-foreground">
                  {selectedDevotee.city || selectedDevotee.location || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Initiated</p>
                <p className="text-muted-foreground">
                  {selectedDevotee.isInitiated ? "Yes" : "No"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Admin Status</p>
                <p className="text-muted-foreground flex items-center gap-2">
                  {selectedDevotee.isAdmin && (
                    <>
                      <Crown className="h-4 w-4 text-yellow-500" />
                      Super Admin
                    </>
                  )}
                  {selectedDevotee.isGroupAdmin && (
                    <>
                      <Shield className="h-4 w-4 text-blue-500" />
                      Group Admin
                    </>
                  )}
                  {!selectedDevotee.isAdmin && !selectedDevotee.isGroupAdmin && "Regular User"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Occupation</p>
                <p className="text-muted-foreground">
                  {selectedDevotee.occupation || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Marital Status</p>
                <p className="text-muted-foreground">
                  {selectedDevotee.maritalStatus || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Referred By</p>
                <p className="text-muted-foreground">
                  {selectedDevotee.referredBy || "Not provided"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  );

  return (
    <div className="container mx-auto py-6 px-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="mb-4">
          {isAdmin && <TabsTrigger value="devotees">All Devotees</TabsTrigger>}
          <TabsTrigger value="groups">Devotee Groups</TabsTrigger>
          {isAdmin && <TabsTrigger value="config">Batch Configuration</TabsTrigger>}
        </TabsList>
        
        {isAdmin && (
          <TabsContent value="devotees">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-2xl text-spiritual-purple">
                  Devotees Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search devotees by name, email, or mobile..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="pl-10"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredDevotees.map((devotee) => 
                    renderDevoteeCard(devotee, selectedDevotee?.uid === devotee.uid)
                  )}
                </div>

                {filteredDevotees.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No devotees found</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {renderDevoteeDetails()}
          </TabsContent>
        )}
        
        <TabsContent value="groups">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-xl text-spiritual-purple">
                  Devotee Groups
                </CardTitle>
              </CardHeader>
              <CardContent>
                {groups.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No groups created yet</p>
                    <Button className="mt-4">Create Group</Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {groups.map(group => (
                      <div 
                        key={group.id}
                        className={`p-3 border rounded-md cursor-pointer ${
                          selectedGroup?.id === group.id ? "bg-muted border-2 border-spiritual-purple" : ""
                        }`}
                        onClick={() => handleGroupSelect(group)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{group.name}</h3>
                            <p className="text-xs text-muted-foreground">
                              {group.devoteeIds.length} devotees
                            </p>
                          </div>
                          <Users className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-xl text-spiritual-purple">
                  {selectedGroup ? `${selectedGroup.name} - Members` : "Select a group to view members"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedGroup ? (
                  <div className="text-center py-16">
                    <Users className="h-16 w-16 mx-auto text-muted-foreground/50" />
                    <p className="mt-4 text-muted-foreground">Select a group to view its members</p>
                  </div>
                ) : (
                  <div>
                    {groupDevotees.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No devotees in this group</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {groupDevotees.map(devotee => 
                          renderDevoteeCard(devotee, selectedDevotee?.uid === devotee.uid)
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {renderDevoteeDetails()}
        </TabsContent>
        
        <TabsContent value="config">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl text-spiritual-purple">
                Batch Configuration for Sadhana Score
              </CardTitle>
              <Settings className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <BatchScoreConfig />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
