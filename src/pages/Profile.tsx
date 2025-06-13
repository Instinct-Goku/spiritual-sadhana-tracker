import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { uploadImageToCloudinary } from "@/lib/cloudinaryService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/lib/toast";
import { User, Loader2, Calendar, Upload } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  displayName: z.string().min(2, {
    message: "Display name must be at least 2 characters.",
  }).max(50, {
    message: "Display name must not exceed 50 characters.",
  }).optional(),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }).optional(),
  bio: z.string().max(160, {
    message: "Bio must not exceed 160 characters.",
  }).optional(),
  spiritualName: z.string().max(50, {
    message: "Spiritual name must not exceed 50 characters.",
  }).optional(),
  dateOfBirth: z.string().nullable().optional(),
  occupation: z.string().max(50, {
    message: "Occupation must not exceed 50 characters.",
  }).optional(),
  address: z.string().max(100, {
    message: "Address must not exceed 100 characters.",
  }).optional(),
  city: z.string().max(50, {
    message: "City must not exceed 50 characters.",
  }).optional(),
  pinCode: z.string().regex(/^\d{6}$/, {
    message: "Pin code must be a 6-digit number.",
  }).optional(),
  batch: z.string().optional(),
  mobileNumber: z.string().regex(/^\d{10}$/, {
    message: "Mobile number must be a 10-digit number.",
  }).optional(),
  isInitiated: z.boolean().default(false),
  maritalStatus: z.string().optional(),
  referredBy: z.string().max(50, {
    message: "Referred by must not exceed 50 characters.",
  }).optional(),
  dailyChantingRounds: z.number().min(0).max(64).optional(),
});

const maritalStatusOptions = [
  { value: "married", label: "Married" },
  { value: "unmarried", label: "Unmarried" },
];

const batchOptions = [
  { value: "sahadev", label: "Sahadev" },
  { value: "nakula", label: "Nakula" },
  { value: "arjuna", label: "Arjuna" },
  { value: "yudhishthira", label: "Yudhishthira" },
];

const Profile = () => {
  const { currentUser, userProfile, updateUserProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(userProfile?.photoURL || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: userProfile?.displayName || "",
      email: userProfile?.email || "",
      bio: userProfile?.bio || "",
      spiritualName: userProfile?.spiritualName || "",
      dateOfBirth: userProfile?.dateOfBirth ? 
        typeof userProfile.dateOfBirth === 'string' ? 
          userProfile.dateOfBirth : 
          userProfile.dateOfBirth.toISOString().split('T')[0] 
        : null,
      occupation: userProfile?.occupation || "",
      address: userProfile?.address || "",
      city: userProfile?.city || "",
      pinCode: userProfile?.pinCode || "",
      batch: userProfile?.batch || "",
      mobileNumber: userProfile?.mobileNumber || "",
      isInitiated: userProfile?.isInitiated || false,
      maritalStatus: userProfile?.maritalStatus || "",
      referredBy: userProfile?.referredBy || "",
      dailyChantingRounds: userProfile?.dailyChantingRounds || 16,
    },
  });
  
  const isInitiatedValue = form.watch("isInitiated");

  useEffect(() => {
    // Update form default values when userProfile changes
    form.reset({
      displayName: userProfile?.displayName || "",
      email: userProfile?.email || "",
      bio: userProfile?.bio || "",
      spiritualName: userProfile?.spiritualName || "",
      dateOfBirth: userProfile?.dateOfBirth ? 
        typeof userProfile.dateOfBirth === 'string' ? 
          userProfile.dateOfBirth : 
          userProfile.dateOfBirth.toISOString().split('T')[0] 
        : null,
      occupation: userProfile?.occupation || "",
      address: userProfile?.address || "",
      city: userProfile?.city || "",
      pinCode: userProfile?.pinCode || "",
      batch: userProfile?.batch || "",
      mobileNumber: userProfile?.mobileNumber || "",
      isInitiated: userProfile?.isInitiated || false,
      maritalStatus: userProfile?.maritalStatus || "",
      referredBy: userProfile?.referredBy || "",
      dailyChantingRounds: userProfile?.dailyChantingRounds || 16,
    });
    
    // Also update the preview URL when userProfile changes
    setPreviewUrl(userProfile?.photoURL || null);
  }, [userProfile, form]);

  // File input handler
  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Create a temporary URL for preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      // Don't automatically upload to Cloudinary here, it will be done on form submit
    }
  };
  
  const uploadProfileImage = async () => {
    if (!selectedFile) return;
    
    try {
      // Upload with mobile number and email
      const cloudinaryUrl = await uploadImageToCloudinary(selectedFile, {
        mobileNumber: userProfile?.mobileNumber,
        email: userProfile?.email
      });
      
      // Update the preview with the Cloudinary URL
      setPreviewUrl(cloudinaryUrl);
      
      // Update the user profile with the new image URL
      if (currentUser) {
        await updateUserProfile({ photoURL: cloudinaryUrl });
      }
      
      toast.success("Image uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload image. Please try again.");
      console.error("Error uploading image:", error);
    }
  };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      await updateUserProfile(values);
      toast.success("Profile updated successfully!");
      
      // If a new image was selected, upload it
      if (selectedFile) {
        await uploadProfileImage();
      }
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
      console.error("Error updating profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Profile</h1>
        <div className="flex items-center space-x-2">
          <Button type="submit" onClick={form.handleSubmit(handleSubmit)} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Profile"
            )}
          </Button>
        </div>
      </div>
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="md:col-span-1 lg:col-span-1">
              <div className="flex flex-col items-center justify-center space-y-4">
                <Avatar className="h-32 w-32">
                  {previewUrl ? (
                    <AvatarImage src={previewUrl} alt="Profile Image" className="object-cover" />
                  ) : (
                    <AvatarFallback>
                      <User className="h-8 w-8" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Image
                </Button>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                  ref={fileInputRef}
                />
              </div>
            </div>
            <div className="md:col-span-1 lg:col-span-2">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Display Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Email" {...field} type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mobileNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Mobile Number" {...field} type="tel" maxLength={10} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Write something about yourself." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isInitiated"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>I am initiated</FormLabel>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {isInitiatedValue && (
                    <FormField
                      control={form.control}
                      name="spiritualName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Spiritual Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Spiritual Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="occupation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Occupation</FormLabel>
                        <FormControl>
                          <Input placeholder="Occupation" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="City" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pinCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pin Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Pin Code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="batch"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Batch</FormLabel>
                        <FormControl>
                          <Select 
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a batch" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {batchOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maritalStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marital Status</FormLabel>
                        <FormControl>
                          <Select 
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select marital status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {maritalStatusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="referredBy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Referred By</FormLabel>
                        <FormControl>
                          <Input placeholder="Referred By" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dailyChantingRounds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Daily Chanting Rounds</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Daily Chanting Rounds" 
                            type="number"
                            {...field} 
                            onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                            min={0}
                            max={64}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
