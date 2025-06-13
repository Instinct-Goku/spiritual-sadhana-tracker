import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { toast } from "@/lib/toast"
import { addSadhanaEntry, getDailySadhana, updateSadhanaEntry, SadhanaEntry } from "@/lib/sadhanaService"
import { useAuth } from "@/contexts/AuthContext"
import { getBatchCriteriaFromUserProfile } from '@/lib/scoringService';

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
  morningProgram: z.boolean().optional(),
  eveningArati: z.boolean().optional(),
  spiritualClass: z.boolean().optional(),
  notes: z.string().optional(),
})

const Sadhana = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [existingEntry, setExistingEntry] = useState<SadhanaEntry | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, userProfile } = useAuth();

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
      morningProgram: false,
      eveningArati: false,
      spiritualClass: false,
      notes: "",
    },
  })

  // Get batch criteria to determine which hearing categories to show
  const batchCriteria = getBatchCriteriaFromUserProfile(userProfile);

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
      morningProgram: false,
      eveningArati: false,
      spiritualClass: false,
      notes: "",
    });
  }, [selectedDate, form]);

  useEffect(() => {
    const loadDailySadhana = async () => {
      if (user && selectedDate) {
        try {
          const entry = await getDailySadhana(user.uid, selectedDate);
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
            form.setValue("morningProgram", entry.morningProgram || false);
            form.setValue("eveningArati", entry.eveningArati || false);
            form.setValue("spiritualClass", entry.spiritualClass || false);
            form.setValue("notes", entry.notes || "");
          }
        } catch (error) {
          console.error("Error loading daily sadhana:", error);
          toast.error("Failed to load daily sadhana");
        }
      }
    };

    loadDailySadhana();
  }, [user, selectedDate, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const sadhanaEntry = {
        ...values,
        userId: user!.uid,
        date: selectedDate,
        hearingMinutes: 0 // Keeping for backwards compatibility
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
      const entry = await getDailySadhana(user!.uid, selectedDate);
      setExistingEntry(entry);
    } catch (error) {
      console.error("Error submitting sadhana entry:", error);
      toast.error("Failed to submit sadhana entry");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-spiritual-purple">
            Daily Sadhana Entry
          </CardTitle>
          <CardDescription className="text-center">
            Record your spiritual practices for {selectedDate.toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Date Picker */}
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) =>
                      date > new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Japa Section */}
            <div className="space-y-2">
              <Label htmlFor="chantingCompletionTime">Chanting Completion Time</Label>
              <Input
                id="chantingCompletionTime"
                type="time"
                {...form.register("chantingCompletionTime")}
                className="w-full"
              />
              {form.formState.errors.chantingCompletionTime && (
                <p className="text-sm text-red-600">{form.formState.errors.chantingCompletionTime.message}</p>
              )}
            </div>

            {/* Reading Section */}
            <div className="space-y-2">
              <Label htmlFor="readingMinutes">Reading (minutes)</Label>
              <Input
                id="readingMinutes"
                type="number"
                min="0"
                {...form.register("readingMinutes", {
                  valueAsNumber: true,
                })}
                className="w-full"
              />
              {form.formState.errors.readingMinutes && (
                <p className="text-sm text-red-600">{form.formState.errors.readingMinutes.message}</p>
              )}
            </div>

            {/* Hearing Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-spiritual-purple">Hearing</h3>
              
              {/* Srila Prabhupada Lectures */}
              {batchCriteria.showSpLecture && (
                <div className="space-y-2">
                  <Label htmlFor="spLectureMinutes">Srila Prabhupada Lectures (minutes)</Label>
                  <Input
                    id="spLectureMinutes"
                    type="number"
                    min="0"
                    {...form.register("spLectureMinutes", { valueAsNumber: true })}
                    className="w-full"
                  />
                  {form.formState.errors.spLectureMinutes && (
                    <p className="text-sm text-red-600">{form.formState.errors.spLectureMinutes.message}</p>
                  )}
                </div>
              )}

              {/* Spiritual Master Lectures */}
              {batchCriteria.showSmLecture && (
                <div className="space-y-2">
                  <Label htmlFor="smLectureMinutes">Spiritual Master Lectures (minutes)</Label>
                  <Input
                    id="smLectureMinutes"
                    type="number"
                    min="0"
                    {...form.register("smLectureMinutes", { valueAsNumber: true })}
                    className="w-full"
                  />
                  {form.formState.errors.smLectureMinutes && (
                    <p className="text-sm text-red-600">{form.formState.errors.smLectureMinutes.message}</p>
                  )}
                </div>
              )}

              {/* GS/NS Lectures */}
              {batchCriteria.showGsnsLecture && (
                <div className="space-y-2">
                  <Label htmlFor="gsnsLectureMinutes">GS/NS Lectures (minutes)</Label>
                  <Input
                    id="gsnsLectureMinutes"
                    type="number"
                    min="0"
                    {...form.register("gsnsLectureMinutes", { valueAsNumber: true })}
                    className="w-full"
                  />
                  {form.formState.errors.gsnsLectureMinutes && (
                    <p className="text-sm text-red-600">{form.formState.errors.gsnsLectureMinutes.message}</p>
                  )}
                </div>
              )}

              {/* HGRSP/HGRKP Lectures */}
              {batchCriteria.showHgrspLecture && (
                <div className="space-y-2">
                  <Label htmlFor="hgrspLectureMinutes">HGRSP/HGRKP Lectures (minutes)</Label>
                  <Input
                    id="hgrspLectureMinutes"
                    type="number"
                    min="0"
                    {...form.register("hgrspLectureMinutes", { valueAsNumber: true })}
                    className="w-full"
                  />
                  {form.formState.errors.hgrspLectureMinutes && (
                    <p className="text-sm text-red-600">{form.formState.errors.hgrspLectureMinutes.message}</p>
                  )}
                </div>
              )}
            </div>

            {/* Service Section */}
            <div className="space-y-2">
              <Label htmlFor="serviceMinutes">Service (minutes)</Label>
              <Input
                id="serviceMinutes"
                type="number"
                min="0"
                {...form.register("serviceMinutes", { valueAsNumber: true })}
                className="w-full"
              />
              {form.formState.errors.serviceMinutes && (
                <p className="text-sm text-red-600">{form.formState.errors.serviceMinutes.message}</p>
              )}
            </div>

            {/* Shloka Section */}
            <div className="space-y-2">
              <Label htmlFor="shlokaCount">Shlokas Memorized</Label>
              <Input
                id="shlokaCount"
                type="number"
                min="0"
                {...form.register("shlokaCount", { valueAsNumber: true })}
                className="w-full"
              />
              {form.formState.errors.shlokaCount && (
                <p className="text-sm text-red-600">{form.formState.errors.shlokaCount.message}</p>
              )}
            </div>

            {/* Wake Up Time */}
            <div className="space-y-2">
              <Label htmlFor="wakeUpTime">Wake Up Time</Label>
              <Input
                id="wakeUpTime"
                type="time"
                {...form.register("wakeUpTime")}
                className="w-full"
              />
              {form.formState.errors.wakeUpTime && (
                <p className="text-sm text-red-600">{form.formState.errors.wakeUpTime.message}</p>
              )}
            </div>

            {/* Sleep Time */}
            <div className="space-y-2">
              <Label htmlFor="sleepTime">Sleep Time</Label>
              <Input
                id="sleepTime"
                type="time"
                {...form.register("sleepTime")}
                className="w-full"
              />
              {form.formState.errors.sleepTime && (
                <p className="text-sm text-red-600">{form.formState.errors.sleepTime.message}</p>
              )}
            </div>

            {/* Day Sleep Duration */}
            <div className="space-y-2">
              <Label htmlFor="daySleepDuration">Day Sleep Duration (minutes)</Label>
              <Input
                id="daySleepDuration"
                type="number"
                min="0"
                {...form.register("daySleepDuration", { valueAsNumber: true })}
                className="w-full"
              />
              {form.formState.errors.daySleepDuration && (
                <p className="text-sm text-red-600">{form.formState.errors.daySleepDuration.message}</p>
              )}
            </div>

            {/* Program Attendance */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-spiritual-purple">Program Attendance</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mangalaArati" className="flex items-center">
                    <input
                      id="mangalaArati"
                      type="checkbox"
                      className="mr-2"
                      {...form.register("mangalaArati")}
                    />
                    Mangala Arati
                  </Label>
                </div>
                <div>
                  <Label htmlFor="tulsiArati" className="flex items-center">
                    <input
                      id="tulsiArati"
                      type="checkbox"
                      className="mr-2"
                      {...form.register("tulsiArati")}
                    />
                    Tulsi Arati
                  </Label>
                </div>
                <div>
                  <Label htmlFor="narsimhaArati" className="flex items-center">
                    <input
                      id="narsimhaArati"
                      type="checkbox"
                      className="mr-2"
                      {...form.register("narsimhaArati")}
                    />
                    Narsimha Arati
                  </Label>
                </div>
                <div>
                  <Label htmlFor="guruPuja" className="flex items-center">
                    <input
                      id="guruPuja"
                      type="checkbox"
                      className="mr-2"
                      {...form.register("guruPuja")}
                    />
                    Guru Puja
                  </Label>
                </div>
                <div>
                  <Label htmlFor="bhagavatamClass" className="flex items-center">
                    <input
                      id="bhagavatamClass"
                      type="checkbox"
                      className="mr-2"
                      {...form.register("bhagavatamClass")}
                    />
                    Bhagavatam Class
                  </Label>
                </div>
                <div>
                  <Label htmlFor="morningProgram" className="flex items-center">
                    <input
                      id="morningProgram"
                      type="checkbox"
                      className="mr-2"
                      {...form.register("morningProgram")}
                    />
                    Morning Program
                  </Label>
                </div>
                <div>
                  <Label htmlFor="eveningArati" className="flex items-center">
                    <input
                      id="eveningArati"
                      type="checkbox"
                      className="mr-2"
                      {...form.register("eveningArati")}
                    />
                    Evening Arati
                  </Label>
                </div>
                <div>
                  <Label htmlFor="spiritualClass" className="flex items-center">
                    <input
                      id="spiritualClass"
                      type="checkbox"
                      className="mr-2"
                      {...form.register("spiritualClass")}
                    />
                    Spiritual Class
                  </Label>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                type="text"
                {...form.register("notes")}
                className="w-full"
              />
              {form.formState.errors.notes && (
                <p className="text-sm text-red-600">{form.formState.errors.notes.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full bg-spiritual-purple hover:bg-spiritual-purple/90" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Sadhana;
