
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Save, User } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { UserProfile } from "@/contexts/AuthContext";

const ProfilePage = () => {
  const { currentUser, userProfile, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    displayName: "",
    spiritualName: "",
    initiationLevel: "",
    phoneNumber: "",
    location: "",
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        displayName: userProfile.displayName || "",
        spiritualName: userProfile.spiritualName || "",
        initiationLevel: userProfile.initiationLevel || "",
        phoneNumber: userProfile.phoneNumber || "",
        location: userProfile.location || "",
      });
    }
  }, [userProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error("You must be logged in");
      return;
    }
    
    try {
      setLoading(true);
      await updateUserProfile(formData);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
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

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-spiritual-purple">Devotee Profile</h1>
        <p className="text-muted-foreground">
          Manage your spiritual journey information
        </p>
      </div>
      
      <Card className="spiritual-card">
        <CardHeader>
          <div className="flex flex-col items-center">
            <Avatar className="h-24 w-24 mb-4 border-4 border-spiritual-purple/20">
              <AvatarImage src={userProfile?.photoURL || ""} />
              <AvatarFallback className="bg-spiritual-purple/20 text-spiritual-purple text-2xl">
                {getInitials(userProfile?.displayName || "")}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl">{userProfile?.displayName || "Devotee"}</CardTitle>
            <CardDescription>
              Member since {userProfile?.joinDate
                ? new Date(userProfile.joinDate instanceof Date 
                  ? userProfile.joinDate 
                  : userProfile.joinDate.toDate()).toLocaleDateString()
                : "recently"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="displayName">Full Name</Label>
              <Input
                id="displayName"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                className="spiritual-input"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="spiritualName">Spiritual Name (if any)</Label>
              <Input
                id="spiritualName"
                name="spiritualName"
                value={formData.spiritualName}
                onChange={handleChange}
                className="spiritual-input"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="initiationLevel">Initiation Level</Label>
              <Select
                value={formData.initiationLevel}
                onValueChange={(value) => handleSelectChange("initiationLevel", value)}
              >
                <SelectTrigger className="spiritual-input">
                  <SelectValue placeholder="Select your initiation level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Initiation Yet</SelectItem>
                  <SelectItem value="first">First Initiation</SelectItem>
                  <SelectItem value="second">Second Initiation</SelectItem>
                  <SelectItem value="sannyasa">Sannyasa</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="spiritual-input"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location/Temple</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="spiritual-input"
              />
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleSubmit}
            className="w-full bg-spiritual-purple hover:bg-spiritual-purple/90 text-white"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Profile
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProfilePage;
