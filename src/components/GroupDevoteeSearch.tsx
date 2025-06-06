
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Users } from "lucide-react";
import { getDevoteeGroups, getDevoteesInGroup, DevoteeGroup } from "@/lib/adminService";
import { UserProfile } from "@/contexts/AuthContext";

interface GroupDevoteeSearchProps {
  adminId: string;
  onDevoteeSelect: (devotee: UserProfile) => void;
  selectedDevotee: UserProfile | null;
}

const GroupDevoteeSearch: React.FC<GroupDevoteeSearchProps> = ({ 
  adminId, 
  onDevoteeSelect, 
  selectedDevotee 
}) => {
  const [groups, setGroups] = useState<DevoteeGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [groupDevotees, setGroupDevotees] = useState<UserProfile[]>([]);
  const [filteredDevotees, setFilteredDevotees] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, [adminId]);

  useEffect(() => {
    if (selectedGroup) {
      fetchGroupDevotees(selectedGroup);
    } else {
      setGroupDevotees([]);
      setFilteredDevotees([]);
    }
  }, [selectedGroup]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredDevotees(groupDevotees);
      return;
    }
    
    const filtered = groupDevotees.filter(
      (devotee) =>
        devotee.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        devotee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        devotee.spiritualName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        devotee.mobileNumber?.includes(searchTerm)
    );
    
    setFilteredDevotees(filtered);
  }, [searchTerm, groupDevotees]);

  const fetchGroups = async () => {
    try {
      const groupsList = await getDevoteeGroups(adminId);
      setGroups(groupsList);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const fetchGroupDevotees = async (groupId: string) => {
    try {
      setLoading(true);
      const devotees = await getDevoteesInGroup(groupId);
      setGroupDevotees(devotees);
      setFilteredDevotees(devotees);
    } catch (error) {
      console.error("Error fetching group devotees:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupChange = (groupId: string) => {
    setSelectedGroup(groupId);
    setSearchTerm("");
    onDevoteeSelect(null as any); // Clear selected devotee when changing groups
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Group-based Devotee Search
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Group Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Group</label>
          <Select value={selectedGroup} onValueChange={handleGroupChange}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a devotee group" />
            </SelectTrigger>
            <SelectContent>
              {groups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name} ({group.devoteeCount || 0} devotees)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search Bar */}
        {selectedGroup && (
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search devotees in this group..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-spiritual-purple" />
          </div>
        )}

        {/* Devotees List */}
        {selectedGroup && !loading && (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {filteredDevotees.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">
                  {searchTerm ? "No devotees found matching your search" : "No devotees in this group"}
                </p>
              </div>
            ) : (
              filteredDevotees.map((devotee) => (
                <div
                  key={devotee.uid}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted ${
                    selectedDevotee?.uid === devotee.uid ? "bg-muted border-spiritual-purple" : ""
                  }`}
                  onClick={() => onDevoteeSelect(devotee)}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={devotee.photoURL || ""} />
                      <AvatarFallback>
                        {devotee.displayName?.charAt(0) || "D"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {devotee.displayName}
                        {devotee.spiritualName && (
                          <span className="text-spiritual-purple ml-1">
                            ({devotee.spiritualName})
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {devotee.email}
                      </p>
                      {devotee.batch && (
                        <Badge variant="outline" className="text-xs">
                          {devotee.batch}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GroupDevoteeSearch;
