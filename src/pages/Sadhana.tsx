import { useState, useEffect } from "react";
import { useAuth, UserProfile } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/lib/toast";
import { addSadhanaEntry, getDailySadhana, updateSadhanaEntry, SadhanaEntry } from "@/lib/sadhanaService";
import { CalendarDateRangePicker } from "@/components/ui/calendar-date-range-picker";
import { DEFAULT_BATCHES } from "@/lib/scoringService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface FormData {
  date: Date | null;
  chantingRounds: number;
  chantingCompletionTime: string;
  readingMinutes: number;
  hearingMinutes: number;
  wakeUpTime: string;
  sleepTime: string;
  daySleepDuration: number;
  mangalaArati: boolean;
  tulsiArati: boolean;
  narsimhaArati: boolean;
  guruPuja: boolean;
  bhagavatamClass: boolean;
  morningProgram: boolean;
  eveningArati: boolean;
  spiritualClass: boolean;
  notes: string;
}

const SadhanaForm = () => {
  const { currentUser, userProfile } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    date: new Date(),
    chantingRounds: 0,
    chantingCompletionTime: "01:45",
    readingMinutes: 0,
    hearingMinutes: 0,
    wakeUpTime: "04:30",
    sleepTime: "22:00",
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
  const [isSaving, setIsSaving] = useState(false);
  const [readingDuration, setReadingDuration] = useState<string | undefined>(undefined);

  useEffect(() => {
    const loadDailySadhana = async () => {
      if (!currentUser || !formData.date) return;
      
      try {
        const dailySadhana = await getDailySadhana(currentUser.uid, formData.date);
        if (dailySadhana) {
          setFormData({
            ...dailySadhana,
            date: dailySadhana.date,
          });
        } else {
          resetForm();
        }
      } catch (error) {
        console.error("Error loading daily sadhana:", error);
        toast.error("Failed to load daily sadhana");
      }
    };
    
    loadDailySadhana();
  }, [currentUser, formData.date]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof FormData) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof FormData) => {
    const value = parseInt(e.target.value, 10) || 0;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof FormData) => {
    const value = e.target.value;
    
    if (!/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
      toast.error("Invalid time format. Please use HH:MM format.");
      return;
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsSaving(true);
    try {
      const entryData: Omit<SadhanaEntry, 'id'> = {
        ...formData,
        userId: currentUser.uid,
        date: formData.date || new Date(),
      };
      
      if (formData.id) {
        await updateSadhanaEntry(formData.id, entryData, userProfile?.batchName?.toLowerCase());
        toast.success("Sadhana entry updated successfully!");
      } else {
        await addSadhanaEntry(entryData, userProfile?.batchName?.toLowerCase());
        toast.success("Sadhana entry saved successfully!");
      }
    } catch (error) {
      console.error("Error saving sadhana entry:", error);
      toast.error("Failed to save sadhana entry");
    } finally {
      setIsSaving(false);
    }
  };
  
  const resetForm = () => {
    setFormData({
      date: new Date(),
      chantingRounds: 0,
      chantingCompletionTime: "01:45",
      readingMinutes: 0,
      hearingMinutes: 0,
      wakeUpTime: "04:30",
      sleepTime: "22:00",
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
  };
  
  const formatDate = (date: Date | null): string => {
    if (!date) return "";
    return format(date, "PPP");
  };
  
  const getReadingMinimumForBatch = (batchName: string) => {
    const lowerBatchName = batchName.toLowerCase();
    const batch = DEFAULT_BATCHES[lowerBatchName];
    if (!batch) return 0;
    return batch.readingMinimum;
  };

  return (
    <Card className="max-w-2xl mx-auto spiritual-card">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Daily Sadhana Entry</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-base">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !formData.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDate(formData.date) || (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarDateRangePicker
                    date={formData.date}
                    onSelect={(date) => setFormData(prev => ({ ...prev, date: date }))}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="chantingRounds" className="text-base">Chanting Rounds</Label>
              <Input
                id="chantingRounds"
                type="number"
                min="0"
                placeholder="Enter number of rounds"
                value={formData.chantingRounds}
                onChange={(e) => handleNumberChange(e, 'chantingRounds')}
                className="spiritual-input"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="chantingCompletionTime" className="text-base">Chanting Completion Time</Label>
              <Input
                id="chantingCompletionTime"
                type="time"
                placeholder="HH:MM"
                value={formData.chantingCompletionTime}
                onChange={(e) => handleTimeChange(e, 'chantingCompletionTime')}
                className="spiritual-input"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="readingMinutes" className="text-base">
                SP Book Reading
                <span className="text-sm text-muted-foreground ml-2">
                  (Minimum: {userProfile?.batchName ? getReadingMinimumForBatch(userProfile.batchName.toLowerCase()) : 60} min/day)
                </span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="readingMinutes"
                  type="number"
                  min="0"
                  placeholder="Enter minutes"
                  value={formData.readingMinutes}
                  onChange={(e) => handleNumberChange(e, 'readingMinutes')}
                  className="spiritual-input w-1/2"
                />
                <Select
                  value={readingDuration}
                  onValueChange={(value) => {
                    setReadingDuration(value);
                    setFormData(prev => ({
                      ...prev,
                      readingMinutes: Number(value)
                    }));
                  }}
                >
                  <SelectTrigger className="w-1/2">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hearingMinutes" className="text-base">Hearing Minutes</Label>
              <Input
                id="hearingMinutes"
                type="number"
                min="0"
                placeholder="Enter minutes"
                value={formData.hearingMinutes}
                onChange={(e) => handleNumberChange(e, 'hearingMinutes')}
                className="spiritual-input"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="wakeUpTime" className="text-base">Wake Up Time</Label>
              <Input
                id="wakeUpTime"
                type="time"
                placeholder="HH:MM"
                value={formData.wakeUpTime}
                onChange={(e) => handleTimeChange(e, 'wakeUpTime')}
                className="spiritual-input"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sleepTime" className="text-base">Sleep Time</Label>
              <Input
                id="sleepTime"
                type="time"
                placeholder="HH:MM"
                value={formData.sleepTime}
                onChange={(e) => handleTimeChange(e, 'sleepTime')}
                className="spiritual-input"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="daySleepDuration" className="text-base">Day Sleep Duration (minutes)</Label>
              <Input
                id="daySleepDuration"
                type="number"
                min="0"
                placeholder="Enter minutes"
                value={formData.daySleepDuration}
                onChange={(e) => handleNumberChange(e, 'daySleepDuration')}
                className="spiritual-input"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <Input
                id="mangalaArati"
                type="checkbox"
                checked={formData.mangalaArati}
                onChange={(e) => handleInputChange(e, 'mangalaArati')}
                className="spiritual-checkbox"
              />
              <Label htmlFor="mangalaArati">Mangala Arati</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Input
                id="tulsiArati"
                type="checkbox"
                checked={formData.tulsiArati}
                onChange={(e) => handleInputChange(e, 'tulsiArati')}
                className="spiritual-checkbox"
              />
              <Label htmlFor="tulsiArati">Tulsi Arati</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Input
                id="narsimhaArati"
                type="checkbox"
                checked={formData.narsimhaArati}
                onChange={(e) => handleInputChange(e, 'narsimhaArati')}
                className="spiritual-checkbox"
              />
              <Label htmlFor="narsimhaArati">Narsimha Arati</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Input
                id="guruPuja"
                type="checkbox"
                checked={formData.guruPuja}
                onChange={(e) => handleInputChange(e, 'guruPuja')}
                className="spiritual-checkbox"
              />
              <Label htmlFor="guruPuja">Guru Puja</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Input
                id="bhagavatamClass"
                type="checkbox"
                checked={formData.bhagavatamClass}
                onChange={(e) => handleInputChange(e, 'bhagavatamClass')}
                className="spiritual-checkbox"
              />
              <Label htmlFor="bhagavatamClass">Bhagavatam Class</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Input
                id="morningProgram"
                type="checkbox"
                checked={formData.morningProgram}
                onChange={(e) => handleInputChange(e, 'morningProgram')}
                className="spiritual-checkbox"
              />
              <Label htmlFor="morningProgram">Morning Program</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Input
                id="eveningArati"
                type="checkbox"
                checked={formData.eveningArati}
                onChange={(e) => handleInputChange(e, 'eveningArati')}
                className="spiritual-checkbox"
              />
              <Label htmlFor="eveningArati">Evening Arati</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Input
                id="spiritualClass"
                type="checkbox"
                checked={formData.spiritualClass}
                onChange={(e) => handleInputChange(e, 'spiritualClass')}
                className="spiritual-checkbox"
              />
              <Label htmlFor="spiritualClass">Spiritual Class</Label>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-base">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Enter any notes about your sadhana"
                value={formData.notes}
                onChange={(e) => handleInputChange(e, 'notes')}
                className="spiritual-input"
              />
            </div>
          </div>
          
          <Button 
            type="submit"
            className="w-full bg-spiritual-purple hover:bg-spiritual-purple/90"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Sadhana Entry"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SadhanaForm;
