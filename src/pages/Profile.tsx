import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parse } from "date-fns";
import { Loader2, Mail, Phone, MapPin, BriefcaseBusiness, SquareUserRound } from "lucide-react";
import { toast } from "@/lib/toast";
import { UserProfile } from "@/contexts/AuthContext";

const Profile = () => {
  const { currentUser, userProfile, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: "",
    spiritualName: "",
    phoneNumber: "",
    location: "",
    address: "",
    city: "",
    pinCode: "",
    dateOfBirth: "",
    occupation: "",
    batch: ""
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        displayName: userProfile.displayName || "",
        spiritualName: userProfile.spiritualName || "",
        phoneNumber: userProfile.phoneNumber || "",
        location: userProfile.location || "",
        address: userProfile.address || "",
        city: userProfile.city || "",
        pinCode: userProfile.pinCode || "",
        dateOfBirth: userProfile.dateOfBirth 
          ? typeof userProfile.dateOfBirth === "string" 
            ? userProfile.dateOfBirth 
            : format(userProfile.dateOfBirth, "yyyy-MM-dd")
          : "",
        occupation: userProfile.occupation || "",
        batch: userProfile.batch || ""
      });
    }
  }, [userProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateUserProfile({
        ...formData,
        dateOfBirth: formData.dateOfBirth || undefined
      });
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

  const formatJoinDate = (date: any) => {
    if (!date) return "recently";
    
    try {
      const dateObj = date instanceof Date 
        ? date 
        : (date.toDate ? date.toDate() : new Date(date));
      
      return dateObj.toLocaleDateString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return "recently";
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4">
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
              Member since {userProfile?.joinDate ? formatJoinDate(userProfile.joinDate) : "recently"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Full Name</Label>
                <Input
                  id="displayName"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  className="spiritual-input"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="spiritualName">Spiritual Name (if any)</Label>
                <Input
                  id="spiritualName"
                  name="spiritualName"
                  value={formData.spiritualName}
                  onChange={handleInputChange}
                  className="spiritual-input"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="batch">Batch</Label>
              <Select
                value={formData.batch}
                onValueChange={(value) => handleSelectChange("batch", value)}
              >
                <SelectTrigger className="spiritual-input">
                  <SelectValue placeholder="Select your batch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sahadev">Sahadev</SelectItem>
                  <SelectItem value="nakula">Nakula</SelectItem>
                  <SelectItem value="arjuna">Arjuna</SelectItem>
                  <SelectItem value="yudhisthir">Yudhisthir</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  Date of Birth
                </Label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="spiritual-input"
                />
              </div>
            
              <div className="space-y-2">
                <Label htmlFor="occupation" className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-1" />
                  Occupation
                </Label>
                <Input
                  id="occupation"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleInputChange}
                  className="spiritual-input"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="spiritual-input"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                Address
              </Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="spiritual-input"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="flex items-center">
                  <Building className="h-4 w-4 mr-1" />
                  City
                </Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="spiritual-input"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pinCode">PIN Code</Label>
                <Input
                  id="pinCode"
                  name="pinCode"
                  value={formData.pinCode}
                  onChange={handleInputChange}
                  className="spiritual-input"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Temple/Center</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
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

export default Profile;
