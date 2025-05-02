import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/lib/toast";
import { uploadImageToCloudinary } from "@/lib/cloudinaryService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar as CalendarIcon, 
  Save as SaveIcon, 
  Briefcase as BriefcaseIcon, 
  Building2,
  X as XIcon,
  Phone as PhoneIcon,
  User as UserIcon,
  Upload as UploadIcon,
  Loader2 as LoaderIcon
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Define the schema for form validation
const profileSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters."),
  spiritualName: z.string().optional(),
  email: z.string().email("Invalid email address.").optional(),
  bio: z.string().max(300, "Bio must be less than 300 characters.").optional(),
  occupation: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  pinCode: z.string().optional(),
  batch: z.string().optional(),
  mobileNumber: z.string().optional(),
  isInitiated: z.boolean().optional(),
  maritalStatus: z.string().optional(),
  referredBy: z.string().optional(),
});

// Define a type for our profile form values
type ProfileFormValues = z.infer<typeof profileSchema>;

const Profile = () => {
  const { currentUser, userProfile, updateUserProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize the form with react-hook-form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: "",
      spiritualName: "",
      email: "",
      bio: "",
      occupation: "",
      address: "",
      city: "",
      pinCode: "",
      batch: "",
      mobileNumber: "",
      isInitiated: false,
      maritalStatus: "",
      referredBy: "",
    },
  });

  // Populate form with user data when available
  useEffect(() => {
    if (userProfile) {
      form.reset({
        displayName: currentUser?.displayName || "",
        spiritualName: userProfile.spiritualName || "",
        email: currentUser?.email || "",
        bio: userProfile.bio || "",
        occupation: userProfile.occupation || "",
        address: userProfile.address || "",
        city: userProfile.city || "",
        pinCode: userProfile.pinCode || "",
        batch: userProfile.batch || "",
        mobileNumber: userProfile.mobileNumber || "",
        isInitiated: userProfile.isInitiated || false,
        maritalStatus: userProfile.maritalStatus || "",
        referredBy: userProfile.referredBy || "",
      });

      // Set profile image if exists
      if (userProfile.photoURL) {
        setPreviewUrl(userProfile.photoURL);
      } else if (currentUser?.photoURL) {
        setPreviewUrl(currentUser.photoURL);
      }

      // Set date of birth if it exists and is valid
      if (userProfile.dateOfBirth) {
        try {
          let dobDate: Date | null = null;
          
          if (userProfile.dateOfBirth instanceof Date) {
            dobDate = userProfile.dateOfBirth;
          } else if (typeof userProfile.dateOfBirth === 'string') {
            dobDate = new Date(userProfile.dateOfBirth);
          }
          
          // Ensure the date is valid before setting it
          if (dobDate && !isNaN(dobDate.getTime())) {
            setDateOfBirth(dobDate);
          }
        } catch (error) {
          console.error("Error parsing date of birth:", error);
          // Don't set an invalid date
        }
      }
    }
  }, [userProfile, currentUser, form]);

  // Handle image selection
  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedImage(file);
      
      // Create a preview URL for the selected image
      const imageUrl = URL.createObjectURL(file);
      setPreviewUrl(imageUrl);

      // Upload to Cloudinary immediately
      try {
        setIsUploading(true);
        const cloudinaryUrl = await uploadImageToCloudinary(file);
        // Update the preview with the Cloudinary URL
        setPreviewUrl(cloudinaryUrl);
        
        // Update the user profile with the new image URL
        if (currentUser) {
          await updateUserProfile({ photoURL: cloudinaryUrl });
        }
        
        toast.success("Image uploaded successfully!");
      } catch (error) {
        toast.error("Failed to upload image. Please try again.");
        console.error("Upload failed:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle form submission
  const onSubmit = async (values: ProfileFormValues) => {
    if (!currentUser) return;

    setIsSubmitting(true);
    try {
      // Update the user profile with form values and explicitly set dateOfBirth
      await updateUserProfile({
        ...values,
        dateOfBirth: dateOfBirth, // This can be null but not undefined
        photoURL: previewUrl || userProfile?.photoURL,
      });

      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear the date of birth
  const clearDateOfBirth = () => {
    setDateOfBirth(null);
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
    <div className="container max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Avatar Section */}
        <div className="col-span-1 flex flex-col items-center space-y-4">
          <div className="relative group">
            <Avatar className="h-40 w-40 border-2 border-gray-200">
              {isUploading ? (
                <div className="h-full w-full flex items-center justify-center bg-muted">
                  <LoaderIcon className="h-10 w-10 animate-spin text-spiritual-purple/70" />
                </div>
              ) : (
                <>
                  <AvatarImage src={previewUrl || ""} alt={currentUser?.displayName || ""} />
                  <AvatarFallback className="text-4xl bg-spiritual-purple/20 text-spiritual-purple">
                    {getInitials(currentUser?.displayName || "")}
                  </AvatarFallback>
                </>
              )}
            </Avatar>
            <div 
              onClick={!isUploading ? triggerFileInput : undefined} 
              className={`absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all ${!isUploading ? 'cursor-pointer' : 'cursor-not-allowed'}`}
            >
              {!isUploading && <UploadIcon className="text-white opacity-0 group-hover:opacity-100" />}
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageSelect}
              disabled={isUploading}
            />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold">{currentUser?.displayName}</h2>
            {userProfile?.spiritualName && (
              <p className="text-muted-foreground">{userProfile.spiritualName}</p>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={triggerFileInput}
              className="mt-2"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadIcon className="mr-2 h-4 w-4" />
                  Change Photo
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Profile Form Section */}
        <div className="col-span-1 md:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="spiritualName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Spiritual Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Spiritual name (if initiated)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Your email" {...field} readOnly />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Mobile Number */}
              <FormField
                control={form.control}
                name="mobileNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input className="pl-10" placeholder="Your mobile number" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Initiated Status */}
              <FormField
                control={form.control}
                name="isInitiated"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Initiated</FormLabel>
                      <FormDescription>
                        Have you received spiritual initiation?
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Marital Status */}
              <FormField
                control={form.control}
                name="maritalStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marital Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your marital status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="married">Married</SelectItem>
                        <SelectItem value="widowed">Widowed</SelectItem>
                        <SelectItem value="divorced">Divorced</SelectItem>
                        <SelectItem value="separated">Separated</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Referred By */}
              <FormField
                control={form.control}
                name="referredBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Referred By</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input className="pl-10" placeholder="Who referred you to us?" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Simplified Date of Birth */}
              <FormItem className="flex flex-col">
                <FormLabel>Date of Birth (Optional)</FormLabel>
                <div className="flex flex-col space-y-2">
                  
                  {/* Date Picker with Calendar */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateOfBirth ? format(dateOfBirth, "PPP") : "Select date of birth"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateOfBirth || undefined}
                        onSelect={setDateOfBirth}
                        initialFocus
                        captionLayout="dropdown-buttons"
                        fromYear={1920}
                        toYear={new Date().getFullYear()}
                        disabled={(date) => date > new Date()}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  
                  {/* Clear Button - Only show if date is selected */}
                  {dateOfBirth && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={clearDateOfBirth}
                      className="ml-auto w-auto"
                    >
                      <XIcon className="mr-2 h-4 w-4" />
                      Clear Date
                    </Button>
                  )}
                </div>
              </FormItem>

              {/* Occupation */}
              <FormField
                control={form.control}
                name="occupation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Occupation</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <BriefcaseIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input className="pl-10" placeholder="Your occupation" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Address */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Textarea className="pl-10 min-h-[80px]" placeholder="Your address" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* City and Pin Code */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Your city" {...field} />
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
                      <FormLabel>PIN Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Your PIN code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Batch Selection */}
              <FormField
                control={form.control}
                name="batch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batch</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your batch" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sahadev">Sahadev</SelectItem>
                        <SelectItem value="nakula">Nakula</SelectItem>
                        <SelectItem value="arjuna">Arjuna</SelectItem>
                        <SelectItem value="yudhisthir">Yudhisthir</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Bio */}
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us a bit about yourself"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button type="submit" disabled={isSubmitting || isUploading} className="w-full">
                {isSubmitting ? (
                  <>
                    <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <SaveIcon className="mr-2 h-4 w-4" />
                    Save Profile
                  </>
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
