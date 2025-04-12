
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/lib/toast";
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar as CalendarIcon, Save as SaveIcon, Briefcase as BriefcaseIcon, Building2, X as XIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";

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
  // We don't include dateOfBirth in the schema as we'll handle it separately
});

// Define a type for our profile form values
type ProfileFormValues = z.infer<typeof profileSchema>;

// Helper function to validate a date
const isValidDate = (date: any): boolean => {
  if (!date) return false;
  
  // If it's already a Date object and valid
  if (date instanceof Date && !isNaN(date.getTime())) return true;
  
  // Try to convert string to Date
  if (typeof date === 'string') {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  }
  
  return false;
};

const Profile = () => {
  const { currentUser, userProfile, updateUserProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined | null>(undefined);
  const [year, setYear] = useState<number | undefined>(undefined);
  const [month, setMonth] = useState<number | undefined>(undefined);
  const [selectedView, setSelectedView] = useState<'days' | 'months' | 'years'>('days');

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
    },
  });

  // Generate years for the year selector
  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);
  
  // Generate months for the month selector
  const months = [
    { value: 0, label: "January" },
    { value: 1, label: "February" },
    { value: 2, label: "March" },
    { value: 3, label: "April" },
    { value: 4, label: "May" },
    { value: 5, label: "June" },
    { value: 6, label: "July" },
    { value: 7, label: "August" },
    { value: 8, label: "September" },
    { value: 9, label: "October" },
    { value: 10, label: "November" },
    { value: 11, label: "December" },
  ];

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
      });

      // Set date of birth if it exists and is valid
      if (userProfile.dateOfBirth) {
        try {
          let dobDate: Date | undefined;
          
          if (userProfile.dateOfBirth instanceof Date) {
            dobDate = userProfile.dateOfBirth;
          } else if (typeof userProfile.dateOfBirth === 'string') {
            dobDate = new Date(userProfile.dateOfBirth);
          }
          
          // Ensure the date is valid before setting it
          if (dobDate && !isNaN(dobDate.getTime())) {
            setDateOfBirth(dobDate);
            setYear(dobDate.getFullYear());
            setMonth(dobDate.getMonth());
          }
        } catch (error) {
          console.error("Error parsing date of birth:", error);
          // Don't set an invalid date
        }
      }
    }
  }, [userProfile, currentUser, form]);

  // Handle form submission
  const onSubmit = async (values: ProfileFormValues) => {
    if (!currentUser) return;

    setIsSubmitting(true);
    try {
      // Update the user profile with form values
      await updateUserProfile({
        ...values,
        dateOfBirth: dateOfBirth,
      });

      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create a complete date from year and month
  const handleYearMonthSelect = () => {
    if (year && month !== undefined) {
      // Create a date with the selected year and month (day is set to 1)
      const newDate = new Date(year, month, 1);
      setDateOfBirth(newDate);
      setSelectedView('days');
    }
  };

  // Clear the date of birth
  const clearDateOfBirth = () => {
    setDateOfBirth(null);
    setYear(undefined);
    setMonth(undefined);
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
          <Avatar className="h-40 w-40">
            <AvatarImage src={currentUser?.photoURL || ""} alt={currentUser?.displayName || ""} />
            <AvatarFallback className="text-4xl bg-spiritual-purple/20 text-spiritual-purple">
              {getInitials(currentUser?.displayName || "")}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h2 className="text-xl font-semibold">{currentUser?.displayName}</h2>
            {userProfile?.spiritualName && (
              <p className="text-muted-foreground">{userProfile.spiritualName}</p>
            )}
          </div>
        </div>

        {/* Profile Form Section */}
        <div className="col-span-1 md:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Names */}
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

              {/* Date of Birth - Enhanced Version */}
              <FormItem className="flex flex-col">
                <FormLabel>Date of Birth (Optional)</FormLabel>
                <div className="flex flex-col space-y-3">
                  
                  {/* Display selected date with clear button */}
                  {dateOfBirth && (
                    <div className="flex items-center">
                      <div className="border rounded-md px-3 py-2 flex-1">
                        {format(dateOfBirth, "PPP")}
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={clearDateOfBirth}
                        className="ml-2"
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  {/* Year and Month Selection UI */}
                  {!dateOfBirth && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <FormLabel className="text-sm">Year</FormLabel>
                        <Select
                          value={year?.toString()}
                          onValueChange={(value) => setYear(parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[240px]">
                            {years.map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <FormLabel className="text-sm">Month</FormLabel>
                        <Select
                          value={month !== undefined ? month.toString() : undefined}
                          onValueChange={(value) => setMonth(parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select month" />
                          </SelectTrigger>
                          <SelectContent>
                            {months.map((month) => (
                              <SelectItem key={month.value} value={month.value.toString()}>
                                {month.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                  
                  {/* Set Date Button */}
                  {!dateOfBirth && year && month !== undefined && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleYearMonthSelect}
                      className="w-full"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      Set Date of Birth
                    </Button>
                  )}
                  
                  {/* Show calendar picker button if no date selected */}
                  {!dateOfBirth && (!year || month === undefined) && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal text-muted-foreground"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          Select a date from calendar
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={dateOfBirth || undefined}
                          onSelect={setDateOfBirth}
                          initialFocus
                          className="pointer-events-auto"
                          captionLayout="dropdown-buttons"
                          fromYear={1920}
                          toYear={new Date().getFullYear()}
                        />
                      </PopoverContent>
                    </Popover>
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
                      defaultValue={field.value || ""}
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
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <>Saving...</>
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
