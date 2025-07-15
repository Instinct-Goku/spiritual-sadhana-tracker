
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Clock, BookOpen, Headphones, Heart, Moon, Sun, Users } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { toast } from "@/lib/toast"
import { addSadhanaEntry, getDailySadhana, updateSadhanaEntry, SadhanaEntry } from "@/lib/sadhanaService"
import { useAuth } from "@/contexts/AuthContext"
import { getBatchCriteriaFromUserProfile, getBatchCriteria } from '@/lib/scoringService';
import { getUserGroups } from "../lib/adminService";

const formSchema = z.object({
  date: z.date({
    required_error: "A date is required.",
  }),
  chantingCompletionTime: z.string().optional(),
  readingMinutes: z.number().min(0, { message: "Must be 0 or more" }).optional(),
  spLectureMinutes: z.number().min(0, { message: "Must be 0 or more" }).optional(),
  smLectureMinutes: z.number().min(0, { message: "Must be 0 or more" }).optional(),
  gsnsLectureMinutes: z.number().min(0, { message: "Must be 0 or more" }).optional(),
  hgrspLectureMinutes: z.number().min(0, { message: "Must be 0 or more" }).optional(),
  serviceMinutes: z.number().min(0, { message: "Must be 0 or more" }).optional(),
  shlokaCount: z.number().min(0, { message: "Must be 0 or more" }).optional(),
  wakeUpTime: z.string().optional(),
  sleepTime: z.string().optional(),
  daySleepDuration: z.number().min(0, { message: "Must be 0 or more" }).optional(),
  mangalaArati: z.boolean().optional(),
  tulsiArati: z.boolean().optional(),
  narsimhaArati: z.boolean().optional(),
  guruPuja: z.boolean().optional(),
  bhagavatamClass: z.boolean().optional(),
  notes: z.string().optional(),
})

const Sadhana = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [existingEntry, setExistingEntry] = useState<SadhanaEntry | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser, userProfile } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: selectedDate,
      chantingCompletionTime: "",
      readingMinutes: 0,
      spLectureMinutes: 0,
      smLectureMinutes: 0,
      gsnsLectureMinutes: 0,
      hgrspLectureMinutes: 0,
      serviceMinutes: 0,
      shlokaCount: 0,
      wakeUpTime: "",
      sleepTime: "",
      daySleepDuration: 0,
      mangalaArati: false,
      tulsiArati: false,
      narsimhaArati: false,
      guruPuja: false,
      bhagavatamClass: false,
      notes: "",
    },
  })

  // Get batch criteria to determine which hearing categories to show
  const [batchCriteria, setBatchCriteria] = useState<any>({});

  useEffect(() => {
    const fetchBatchCriteria = async () => {
      if (userProfile?.batchName) {
        try {
          // First try to get criteria from user's groups
          const userGroups = await getUserGroups(userProfile.uid);
          let groupCriteria = {};
          
          if (userGroups.length > 0) {
            // Use the first group's criteria or merge them
            const firstGroup = userGroups[0];
            if (firstGroup.batchCriteria) {
              groupCriteria = firstGroup.batchCriteria;
            }
          }
          
          // If no group criteria found, use default batch criteria
          if (Object.keys(groupCriteria).length === 0) {
            groupCriteria = getBatchCriteria(userProfile.batchName);
          }
          
          setBatchCriteria(groupCriteria);
        } catch (error) {
          console.error("Error fetching batch criteria:", error);
          // Fallback to default criteria
          const criteria = getBatchCriteria(userProfile.batchName);
          setBatchCriteria(criteria);
        }
      }
    };

    fetchBatchCriteria();
  }, [userProfile?.batchName, userProfile?.uid]);

  // Get batch criteria for display logic (using existing function)
  const displayCriteria = getBatchCriteriaFromUserProfile(userProfile);

  useEffect(() => {
    form.reset({
      date: selectedDate,
      chantingCompletionTime: "",
      readingMinutes: 0,
      spLectureMinutes: 0,
      smLectureMinutes: 0,
      gsnsLectureMinutes: 0,
      hgrspLectureMinutes: 0,
      serviceMinutes: 0,
      shlokaCount: 0,
      wakeUpTime: "",
      sleepTime: "",
      daySleepDuration: 0,
      mangalaArati: false,
      tulsiArati: false,
      narsimhaArati: false,
      guruPuja: false,
      bhagavatamClass: false,
      notes: "",
    });
  }, [selectedDate, form]);

  useEffect(() => {
    const loadDailySadhana = async () => {
      if (currentUser && selectedDate) {
        try {
          const entry = await getDailySadhana(currentUser.uid, selectedDate);
          setExistingEntry(entry);

          if (entry) {
            form.setValue("chantingCompletionTime", entry.chantingCompletionTime || "");
            form.setValue("readingMinutes", entry.readingMinutes || 0);
            form.setValue("spLectureMinutes", entry.spLectureMinutes || 0);
            form.setValue("smLectureMinutes", entry.smLectureMinutes || 0);
            form.setValue("gsnsLectureMinutes", entry.gsnsLectureMinutes || 0);
            form.setValue("hgrspLectureMinutes", entry.hgrspLectureMinutes || 0);
            form.setValue("serviceMinutes", entry.serviceMinutes || 0);
            form.setValue("shlokaCount", entry.shlokaCount || entry.shlokaMemorized || 0);
            form.setValue("wakeUpTime", entry.wakeUpTime || "");
            form.setValue("sleepTime", entry.sleepTime || "");
            form.setValue("daySleepDuration", entry.daySleepDuration || 0);
            form.setValue("mangalaArati", entry.mangalaArati || false);
            form.setValue("tulsiArati", entry.tulsiArati || false);
            form.setValue("narsimhaArati", entry.narsimhaArati || false);
            form.setValue("guruPuja", entry.guruPuja || false);
            form.setValue("bhagavatamClass", entry.bhagavatamClass || false);
            form.setValue("notes", entry.notes || "");
          }
        } catch (error) {
          console.error("Error loading daily sadhana:", error);
          toast.error("Failed to load daily sadhana");
        }
      }
    };

    loadDailySadhana();
  }, [currentUser, selectedDate, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const sadhanaEntry = {
        ...values,
        userId: currentUser!.uid,
        date: selectedDate,
        hearingMinutes: 0, // Keeping for backwards compatibility
        sleepTime: values.sleepTime || "",
        wakeUpTime: values.wakeUpTime || "",
        chantingCompletionTime: values.chantingCompletionTime || "",
        readingMinutes: values.readingMinutes || 0,
        spLectureMinutes: values.spLectureMinutes || 0,
        smLectureMinutes: values.smLectureMinutes || 0,
        gsnsLectureMinutes: values.gsnsLectureMinutes || 0,
        hgrspLectureMinutes: values.hgrspLectureMinutes || 0,
        serviceMinutes: values.serviceMinutes || 0,
        shlokaCount: values.shlokaCount || 0,
        daySleepDuration: values.daySleepDuration || 0,
        mangalaArati: values.mangalaArati || false,
        tulsiArati: values.tulsiArati || false,
        narsimhaArati: values.narsimhaArati || false,
        guruPuja: values.guruPuja || false,
        bhagavatamClass: values.bhagavatamClass || false,
        notes: values.notes || "",
        // Add missing required properties from SadhanaEntry interface
        morningProgram: values.mangalaArati || values.tulsiArati || values.narsimhaArati || values.guruPuja || values.bhagavatamClass || false,
        eveningArati: false, // Not used in current form but required by interface
        spiritualClass: values.bhagavatamClass || false, // Map bhagavatamClass to spiritualClass
      };

      if (existingEntry) {
        // Update existing entry
        await updateSadhanaEntry(existingEntry.id!, sadhanaEntry, userProfile);
        toast.success("Sadhana entry updated successfully");
      } else {
        // Add new entry
        await addSadhanaEntry(sadhanaEntry, userProfile);
        toast.success("Sadhana entry added successfully");
      }

      // Refresh the data
      const entry = await getDailySadhana(currentUser!.uid, selectedDate);
      setExistingEntry(entry);
    } catch (error) {
      console.error("Error submitting sadhana entry:", error);
      toast.error("Failed to submit sadhana entry");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-spiritual-cream via-white to-spiritual-cream/50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8 relative">
          <div className="absolute inset-0 mandala-decoration opacity-5" />
          <h1 className="text-3xl md:text-4xl font-bold text-spiritual-purple mb-2 relative z-10">
            Daily Sadhana Entry
          </h1>
          <p className="text-spiritual-sage text-lg relative z-10">
            Record your spiritual practices for {selectedDate.toLocaleDateString()}
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Date Selection Card */}
          <Card className="spiritual-card animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <CalendarIcon className="h-6 w-6 text-spiritual-purple" />
                <Label className="text-lg font-semibold text-spiritual-purple">Select Date</Label>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full md:w-auto justify-start text-left font-normal bg-white/80 border-spiritual-purple/30 hover:bg-spiritual-cream/50",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white border-spiritual-purple/20" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </CardContent>
          </Card>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Japa & Reading Section */}
            <div className="space-y-6">
              {/* Japa Card */}
              <Card className="spiritual-card animate-fade-in">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-spiritual-purple">
                    <Sun className="h-6 w-6" />
                    Japa Meditation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="chantingCompletionTime" className="text-sm font-medium text-gray-700 mb-2 block">
                      Chanting Completion Time
                    </Label>
                    <Input
                      id="chantingCompletionTime"
                      type="time"
                      {...form.register("chantingCompletionTime")}
                      className="spiritual-input"
                    />
                    {form.formState.errors.chantingCompletionTime && (
                      <p className="text-sm text-red-600 mt-1">{form.formState.errors.chantingCompletionTime.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Reading Card */}
              <Card className="spiritual-card animate-fade-in">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-spiritual-purple">
                    <BookOpen className="h-6 w-6" />
                    SP Book Reading
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="readingMinutes" className="text-sm font-medium text-gray-700 mb-2 block">
                      SP Book Reading (minutes)
                    </Label>
                    {batchCriteria.readingMinimum && (
                      <p className="text-xs text-gray-500 mb-2">
                        Minimum: {batchCriteria.readingMinimum} minutes
                      </p>
                    )}
                    <Input
                      id="readingMinutes"
                      type="number"
                      min="0"
                      {...form.register("readingMinutes", { valueAsNumber: true })}
                      className="spiritual-input"
                    />
                    {form.formState.errors.readingMinutes && (
                      <p className="text-sm text-red-600 mt-1">{form.formState.errors.readingMinutes.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Hearing Card */}
              <Card className="spiritual-card animate-fade-in">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-spiritual-purple">
                    <Headphones className="h-6 w-6" />
                    Hearing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {displayCriteria.showSpLecture && (
                    <div>
                      <Label htmlFor="spLectureMinutes" className="text-sm font-medium text-gray-700 mb-2 block">
                        Srila Prabhupada Lectures (minutes)
                      </Label>
                      {batchCriteria.spLectureMinimum && (
                        <p className="text-xs text-gray-500 mb-2">
                          Minimum: {batchCriteria.spLectureMinimum} minutes
                        </p>
                      )}
                      <Input
                        id="spLectureMinutes"
                        type="number"
                        min="0"
                        {...form.register("spLectureMinutes", { valueAsNumber: true })}
                        className="spiritual-input"
                      />
                      {form.formState.errors.spLectureMinutes && (
                        <p className="text-sm text-red-600 mt-1">{form.formState.errors.spLectureMinutes.message}</p>
                      )}
                    </div>
                  )}

                  {displayCriteria.showSmLecture && (
                    <div>
                      <Label htmlFor="smLectureMinutes" className="text-sm font-medium text-gray-700 mb-2 block">
                        Spiritual Master Lectures (minutes)
                      </Label>
                      {batchCriteria.smLectureMinimum && (
                        <p className="text-xs text-gray-500 mb-2">
                          Minimum: {batchCriteria.smLectureMinimum} minutes
                        </p>
                      )}
                      <Input
                        id="smLectureMinutes"
                        type="number"
                        min="0"
                        {...form.register("smLectureMinutes", { valueAsNumber: true })}
                        className="spiritual-input"
                      />
                      {form.formState.errors.smLectureMinutes && (
                        <p className="text-sm text-red-600 mt-1">{form.formState.errors.smLectureMinutes.message}</p>
                      )}
                    </div>
                  )}

                  {displayCriteria.showGsnsLecture && (
                    <div>
                      <Label htmlFor="gsnsLectureMinutes" className="text-sm font-medium text-gray-700 mb-2 block">
                        GS/NS Lectures (minutes)
                      </Label>
                      {batchCriteria.gsnsLectureMinimum && (
                        <p className="text-xs text-gray-500 mb-2">
                          Minimum: {batchCriteria.gsnsLectureMinimum} minutes
                        </p>
                      )}
                      <Input
                        id="gsnsLectureMinutes"
                        type="number"
                        min="0"
                        {...form.register("gsnsLectureMinutes", { valueAsNumber: true })}
                        className="spiritual-input"
                      />
                      {form.formState.errors.gsnsLectureMinutes && (
                        <p className="text-sm text-red-600 mt-1">{form.formState.errors.gsnsLectureMinutes.message}</p>
                      )}
                    </div>
                  )}

                  {displayCriteria.showHgrspLecture && (
                    <div>
                      <Label htmlFor="hgrspLectureMinutes" className="text-sm font-medium text-gray-700 mb-2 block">
                        HGRSP/HGRKP Lectures (minutes)
                      </Label>
                      {batchCriteria.hgrspLectureMinimum && (
                        <p className="text-xs text-gray-500 mb-2">
                          Minimum: {batchCriteria.hgrspLectureMinimum} minutes
                        </p>
                      )}
                      <Input
                        id="hgrspLectureMinutes"
                        type="number"
                        min="0"
                        {...form.register("hgrspLectureMinutes", { valueAsNumber: true })}
                        className="spiritual-input"
                      />
                      {form.formState.errors.hgrspLectureMinutes && (
                        <p className="text-sm text-red-600 mt-1">{form.formState.errors.hgrspLectureMinutes.message}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Service & Activities Section */}
            <div className="space-y-6">
              {/* Service Card */}
              <Card className="spiritual-card animate-fade-in">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-spiritual-purple">
                    <Heart className="h-6 w-6" />
                    Service
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="serviceMinutes" className="text-sm font-medium text-gray-700 mb-2 block">
                      Service (minutes)
                    </Label>
                    {batchCriteria.serviceMinimum && (
                      <p className="text-xs text-gray-500 mb-2">
                        Minimum: {batchCriteria.serviceMinimum} minutes
                      </p>
                    )}
                    <Input
                      id="serviceMinutes"
                      type="number"
                      min="0"
                      {...form.register("serviceMinutes", { valueAsNumber: true })}
                      className="spiritual-input"
                    />
                    {form.formState.errors.serviceMinutes && (
                      <p className="text-sm text-red-600 mt-1">{form.formState.errors.serviceMinutes.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Shloka Card */}
              <Card className="spiritual-card animate-fade-in">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-spiritual-purple">
                    <BookOpen className="h-6 w-6" />
                    Shloka Memorization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="shlokaCount" className="text-sm font-medium text-gray-700 mb-2 block">
                      Shlokas Memorized
                    </Label>
                    {batchCriteria.shlokaMinimum && (
                      <p className="text-xs text-gray-500 mb-2">
                        Minimum: {batchCriteria.shlokaMinimum} shlokas
                      </p>
                    )}
                    <Input
                      id="shlokaCount"
                      type="number"
                      min="0"
                      {...form.register("shlokaCount", { valueAsNumber: true })}
                      className="spiritual-input"
                    />
                    {form.formState.errors.shlokaCount && (
                      <p className="text-sm text-red-600 mt-1">{form.formState.errors.shlokaCount.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Sleep Schedule Card */}
              <Card className="spiritual-card animate-fade-in">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-spiritual-purple">
                    <Moon className="h-6 w-6" />
                    Sleep Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="wakeUpTime" className="text-sm font-medium text-gray-700 mb-2 block">
                        Wake Up Time
                      </Label>
                      <Input
                        id="wakeUpTime"
                        type="time"
                        {...form.register("wakeUpTime")}
                        className="spiritual-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sleepTime" className="text-sm font-medium text-gray-700 mb-2 block">
                        Sleep Time
                      </Label>
                      <Input
                        id="sleepTime"
                        type="time"
                        {...form.register("sleepTime")}
                        className="spiritual-input"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="daySleepDuration" className="text-sm font-medium text-gray-700 mb-2 block">
                      Day Sleep Duration (minutes)
                    </Label>
                    <Input
                      id="daySleepDuration"
                      type="number"
                      min="0"
                      {...form.register("daySleepDuration", { valueAsNumber: true })}
                      className="spiritual-input"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Morning Program Card */}
          <Card className="spiritual-card animate-fade-in">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-spiritual-purple">
                <Users className="h-6 w-6" />
                Morning Program Attendance
              </CardTitle>
              <CardDescription className="text-sm text-spiritual-sage">
                Select the programs you attended (points awarded for attendance)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-spiritual-cream/30 hover:bg-spiritual-cream/50 transition-colors">
                  <input
                    id="mangalaArati"
                    type="checkbox"
                    className="w-4 h-4 text-spiritual-purple bg-gray-100 border-gray-300 rounded focus:ring-spiritual-purple focus:ring-2"
                    {...form.register("mangalaArati")}
                  />
                  <Label htmlFor="mangalaArati" className="flex-1 cursor-pointer">
                    <span className="block font-medium text-gray-800">Mangala Arati</span>
                    <span className="text-xs text-spiritual-sage">10 points</span>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-lg bg-spiritual-cream/30 hover:bg-spiritual-cream/50 transition-colors">
                  <input
                    id="tulsiArati"
                    type="checkbox"
                    className="w-4 h-4 text-spiritual-purple bg-gray-100 border-gray-300 rounded focus:ring-spiritual-purple focus:ring-2"
                    {...form.register("tulsiArati")}
                  />
                  <Label htmlFor="tulsiArati" className="flex-1 cursor-pointer">
                    <span className="block font-medium text-gray-800">Tulsi Arati</span>
                    <span className="text-xs text-spiritual-sage">5 points</span>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-lg bg-spiritual-cream/30 hover:bg-spiritual-cream/50 transition-colors">
                  <input
                    id="narsimhaArati"
                    type="checkbox"
                    className="w-4 h-4 text-spiritual-purple bg-gray-100 border-gray-300 rounded focus:ring-spiritual-purple focus:ring-2"
                    {...form.register("narsimhaArati")}
                  />
                  <Label htmlFor="narsimhaArati" className="flex-1 cursor-pointer">
                    <span className="block font-medium text-gray-800">Narsimha Arati</span>
                    <span className="text-xs text-spiritual-sage">5 points</span>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-lg bg-spiritual-cream/30 hover:bg-spiritual-cream/50 transition-colors">
                  <input
                    id="guruPuja"
                    type="checkbox"
                    className="w-4 h-4 text-spiritual-purple bg-gray-100 border-gray-300 rounded focus:ring-spiritual-purple focus:ring-2"
                    {...form.register("guruPuja")}
                  />
                  <Label htmlFor="guruPuja" className="flex-1 cursor-pointer">
                    <span className="block font-medium text-gray-800">Guru Puja</span>
                    <span className="text-xs text-spiritual-sage">5 points</span>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-lg bg-spiritual-cream/30 hover:bg-spiritual-cream/50 transition-colors">
                  <input
                    id="bhagavatamClass"
                    type="checkbox"
                    className="w-4 h-4 text-spiritual-purple bg-gray-100 border-gray-300 rounded focus:ring-spiritual-purple focus:ring-2"
                    {...form.register("bhagavatamClass")}
                  />
                  <Label htmlFor="bhagavatamClass" className="flex-1 cursor-pointer">
                    <span className="block font-medium text-gray-800">Bhagavatam Class</span>
                    <span className="text-xs text-spiritual-sage">20 points</span>
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes Card */}
          <Card className="spiritual-card animate-fade-in">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-spiritual-purple">
                <Clock className="h-6 w-6" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="notes" className="text-sm font-medium text-gray-700 mb-2 block">
                  Additional Notes (Optional)
                </Label>
                <Input
                  id="notes"
                  type="text"
                  placeholder="Any additional reflections or notes about your sadhana..."
                  {...form.register("notes")}
                  className="spiritual-input"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <Button 
              type="submit" 
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-spiritual-purple to-spiritual-purple/80 hover:from-spiritual-purple/90 hover:to-spiritual-purple text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </div>
              ) : (
                "Submit Sadhana Entry"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Sadhana;
