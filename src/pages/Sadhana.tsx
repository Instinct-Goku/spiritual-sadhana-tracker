import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Loader2, 
  Save, 
  Clock, 
  BookOpen, 
  Sun, 
  Moon, 
  Music, 
  Headphones,
  BedDouble,
  Calendar
} from "lucide-react";
import { 
  addSadhanaEntry, 
  getDailySadhana, 
  SadhanaEntry, 
  updateSadhanaEntry 
} from "@/lib/sadhanaService";

const formatDateForDisplay = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const SadhanaPage = () => {
  const { currentUser } = useAuth();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [existingEntry, setExistingEntry] = useState<SadhanaEntry | null>(null);
  
  // Form fields
  const [chantingRounds, setChantingRounds] = useState(0);
  const [chantingCompletionTime, setChantingCompletionTime] = useState("12:00");
  const [readingMinutes, setReadingMinutes] = useState(0);
  const [hearingMinutes, setHearingMinutes] = useState(0);
  const [wakeUpTime, setWakeUpTime] = useState("05:00");
  const [sleepTime, setSleepTime] = useState("21:30");
  const [daySleepDuration, setDaySleepDuration] = useState(0);
  const [morningProgram, setMorningProgram] = useState(false);
  const [mangalaArati, setMangalaArati] = useState(false);
  const [tulsiArati, setTulsiArati] = useState(false);
  const [narsimhaArati, setNarsimhaArati] = useState(false);
  const [guruPuja, setGuruPuja] = useState(false);
  const [bhagavatamClass, setBhagavatamClass] = useState(false);
  const [notes, setNotes] = useState("");
  
  // Format date for input field
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split("T")[0];
  };
  
  // Fetch existing entry for the selected date
  useEffect(() => {
    const fetchDailySadhana = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const entry = await getDailySadhana(currentUser.uid, selectedDate);
        
        if (entry) {
          setExistingEntry(entry);
          // Populate form fields with existing data
          setChantingRounds(entry.chantingRounds);
          setChantingCompletionTime(entry.chantingCompletionTime || "12:00");
          setReadingMinutes(entry.readingMinutes);
          setHearingMinutes(entry.hearingMinutes || 0);
          setWakeUpTime(entry.wakeUpTime);
          setSleepTime(entry.sleepTime);
          setDaySleepDuration(entry.daySleepDuration || 0);
          setMorningProgram(entry.morningProgram);
          setMangalaArati(entry.mangalaArati);
          setTulsiArati(entry.tulsiArati || false);
          setNarsimhaArati(entry.narsimhaArati || false);
          setGuruPuja(entry.guruPuja || false);
          setBhagavatamClass(entry.bhagavatamClass || false);
          setNotes(entry.notes || "");
        } else {
          // Reset form for new entry
          setExistingEntry(null);
          setChantingRounds(0);
          setChantingCompletionTime("12:00");
          setReadingMinutes(0);
          setHearingMinutes(0);
          setWakeUpTime("05:00");
          setSleepTime("21:30");
          setDaySleepDuration(0);
          setMorningProgram(false);
          setMangalaArati(false);
          setTulsiArati(false);
          setNarsimhaArati(false);
          setGuruPuja(false);
          setBhagavatamClass(false);
          setNotes("");
        }
      } catch (error) {
        console.error("Error fetching sadhana:", error);
        toast.error("Failed to load sadhana data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDailySadhana();
  }, [currentUser, selectedDate]);
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(new Date(e.target.value));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error("You must be logged in");
      return;
    }
    
    try {
      setSaving(true);
      
      const sadhanaData: Omit<SadhanaEntry, "id"> = {
        userId: currentUser.uid,
        date: selectedDate,
        chantingRounds,
        chantingCompletionTime,
        readingMinutes,
        hearingMinutes,
        wakeUpTime,
        sleepTime,
        daySleepDuration,
        morningProgram,
        mangalaArati,
        tulsiArati,
        narsimhaArati,
        guruPuja,
        bhagavatamClass,
        eveningArati: false,
        spiritualClass: false,
        notes,
      };
      
      if (existingEntry?.id) {
        await updateSadhanaEntry(existingEntry.id, sadhanaData);
        toast.success("Sadhana updated successfully");
      } else {
        await addSadhanaEntry(sadhanaData);
        toast.success("Sadhana recorded successfully");
      }
      
      // Refresh the data
      const entry = await getDailySadhana(currentUser.uid, selectedDate);
      setExistingEntry(entry);
      
    } catch (error) {
      console.error("Error saving sadhana:", error);
      toast.error("Failed to save sadhana data");
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="mb-6 md:mb-8 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-spiritual-purple">Daily Sadhana Card</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Record your spiritual practices for personal growth
        </p>
      </div>
      
      <Card className="spiritual-card mb-6">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-xl md:text-2xl flex items-center">
              <Calendar className="h-5 w-5 mr-2 hidden md:inline" />
              {formatDateForDisplay(selectedDate)}
            </CardTitle>
            <div className="flex items-center">
              <Input
                type="date"
                value={formatDateForInput(selectedDate)}
                onChange={handleDateChange}
                className="w-full sm:w-auto"
              />
            </div>
          </div>
          <CardDescription>
            {existingEntry ? "Update your sadhana for today" : "Record your sadhana for today"}
          </CardDescription>
        </CardHeader>
        
        {loading ? (
          <CardContent className="flex justify-center py-10">
            <Loader2 className="h-10 w-10 animate-spin text-spiritual-purple" />
          </CardContent>
        ) : (
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Chanting Section */}
              <div className="space-y-4">
                <h3 className="font-medium text-spiritual-purple flex items-center">
                  <Music className="h-4 w-4 mr-2" />
                  Chanting
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="chanting" className="font-medium">
                      Rounds Completed
                    </Label>
                    <Input
                      id="chanting"
                      type="number"
                      min="0"
                      value={chantingRounds}
                      onChange={(e) => setChantingRounds(parseInt(e.target.value) || 0)}
                      className="spiritual-input"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="chantingCompletion" className="font-medium">
                      Completion Time
                    </Label>
                    <Input
                      id="chantingCompletion"
                      type="time"
                      value={chantingCompletionTime}
                      onChange={(e) => setChantingCompletionTime(e.target.value)}
                      className="spiritual-input"
                    />
                  </div>
                </div>
              </div>

              {/* Reading and Hearing Section */}
              <div className="space-y-4">
                <h3 className="font-medium text-spiritual-purple flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Study
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reading" className="font-medium">
                      Reading (minutes)
                    </Label>
                    <Input
                      id="reading"
                      type="number"
                      min="0"
                      value={readingMinutes}
                      onChange={(e) => setReadingMinutes(parseInt(e.target.value) || 0)}
                      className="spiritual-input"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hearing" className="font-medium flex items-center">
                      <Headphones className="h-4 w-4 mr-1" />
                      Hearing (minutes)
                    </Label>
                    <Input
                      id="hearing"
                      type="number"
                      min="0"
                      value={hearingMinutes}
                      onChange={(e) => setHearingMinutes(parseInt(e.target.value) || 0)}
                      className="spiritual-input"
                    />
                  </div>
                </div>
              </div>

              {/* Wake-up and Sleep Time */}
              <div className="space-y-4">
                <h3 className="font-medium text-spiritual-purple flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Rest Schedule
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="wakeup" className="font-medium flex items-center">
                      <Sun className="h-4 w-4 mr-1" />
                      Wake-up Time
                    </Label>
                    <Input
                      id="wakeup"
                      type="time"
                      value={wakeUpTime}
                      onChange={(e) => setWakeUpTime(e.target.value)}
                      className="spiritual-input"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sleep" className="font-medium flex items-center">
                      <Moon className="h-4 w-4 mr-1" />
                      Sleep Time
                    </Label>
                    <Input
                      id="sleep"
                      type="time"
                      value={sleepTime}
                      onChange={(e) => setSleepTime(e.target.value)}
                      className="spiritual-input"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="daySleep" className="font-medium flex items-center">
                      <BedDouble className="h-4 w-4 mr-1" />
                      Day Sleep (minutes)
                    </Label>
                    <Input
                      id="daySleep"
                      type="number"
                      min="0"
                      value={daySleepDuration}
                      onChange={(e) => setDaySleepDuration(parseInt(e.target.value) || 0)}
                      className="spiritual-input"
                    />
                  </div>
                </div>
              </div>

              {/* Morning Program Section */}
              <div className="space-y-4">
                <h3 className="font-medium text-spiritual-purple flex items-center">
                  <Sun className="h-4 w-4 mr-2" />
                  Morning Program
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-spiritual-purple/5 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="mangala-arati" 
                      checked={mangalaArati}
                      onCheckedChange={(checked) => setMangalaArati(checked === true)}
                    />
                    <Label htmlFor="mangala-arati">Mangala Arati</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="tulsi-arati" 
                      checked={tulsiArati}
                      onCheckedChange={(checked) => setTulsiArati(checked === true)}
                    />
                    <Label htmlFor="tulsi-arati">Tulsi Arati</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="narsimha-arati" 
                      checked={narsimhaArati}
                      onCheckedChange={(checked) => setNarsimhaArati(checked === true)}
                    />
                    <Label htmlFor="narsimha-arati">Narsimha Arati</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="guru-puja" 
                      checked={guruPuja}
                      onCheckedChange={(checked) => setGuruPuja(checked === true)}
                    />
                    <Label htmlFor="guru-puja">Guru Puja</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="bhagavatam-class" 
                      checked={bhagavatamClass}
                      onCheckedChange={(checked) => setBhagavatamClass(checked === true)}
                    />
                    <Label htmlFor="bhagavatam-class">Bhagavatam Class</Label>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="font-medium">
                  Notes & Reflections (optional)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Record insights, challenges, or reflections from your practice today..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="spiritual-input min-h-[100px]"
                />
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full bg-spiritual-purple hover:bg-spiritual-purple/90 text-white"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {existingEntry ? "Updating..." : "Saving..."}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {existingEntry ? "Update Sadhana" : "Save Sadhana"}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default SadhanaPage;
