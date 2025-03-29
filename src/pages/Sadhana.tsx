
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { Loader2, Save, Clock, BookOpen, Sun, Moon, Music, Apple } from "lucide-react";
import { addSadhanaEntry, getDailySadhana, SadhanaEntry, updateSadhanaEntry } from "@/lib/sadhanaService";

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [existingEntry, setExistingEntry] = useState<SadhanaEntry | null>(null);
  
  // Form fields
  const [chantingRounds, setChantingRounds] = useState(0);
  const [readingMinutes, setReadingMinutes] = useState(0);
  const [wakeUpTime, setWakeUpTime] = useState("05:00");
  const [sleepTime, setSleepTime] = useState("21:30");
  const [morningProgram, setMorningProgram] = useState(false);
  const [mangalaArati, setMangalaArati] = useState(false);
  const [eveningArati, setEveningArati] = useState(false);
  const [spiritualClass, setSpiritualClass] = useState(false);
  const [prasadam, setPrasadam] = useState(true);
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
          setReadingMinutes(entry.readingMinutes);
          setWakeUpTime(entry.wakeUpTime);
          setSleepTime(entry.sleepTime);
          setMorningProgram(entry.morningProgram);
          setMangalaArati(entry.mangalaArati);
          setEveningArati(entry.eveningArati);
          setSpiritualClass(entry.spiritualClass);
          setPrasadam(entry.prasadam);
          setNotes(entry.notes || "");
        } else {
          // Reset form for new entry
          setExistingEntry(null);
          setChantingRounds(0);
          setReadingMinutes(0);
          setWakeUpTime("05:00");
          setSleepTime("21:30");
          setMorningProgram(false);
          setMangalaArati(false);
          setEveningArati(false);
          setSpiritualClass(false);
          setPrasadam(true);
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
        readingMinutes,
        wakeUpTime,
        sleepTime,
        morningProgram,
        mangalaArati,
        eveningArati,
        spiritualClass,
        prasadam,
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
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-spiritual-purple">Daily Sadhana Card</h1>
        <p className="text-muted-foreground">
          Record your spiritual practices for personal growth
        </p>
      </div>
      
      <Card className="spiritual-card mb-6">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>
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
              {/* Chanting and Reading */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-spiritual-purple/10 flex items-center justify-center mr-2">
                      <Music className="h-4 w-4 text-spiritual-purple" />
                    </div>
                    <Label htmlFor="chanting" className="font-medium">
                      Chanting Rounds
                    </Label>
                  </div>
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
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-spiritual-purple/10 flex items-center justify-center mr-2">
                      <BookOpen className="h-4 w-4 text-spiritual-purple" />
                    </div>
                    <Label htmlFor="reading" className="font-medium">
                      Reading (minutes)
                    </Label>
                  </div>
                  <Input
                    id="reading"
                    type="number"
                    min="0"
                    value={readingMinutes}
                    onChange={(e) => setReadingMinutes(parseInt(e.target.value) || 0)}
                    className="spiritual-input"
                  />
                </div>
              </div>

              {/* Wake-up and Sleep Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-spiritual-purple/10 flex items-center justify-center mr-2">
                      <Sun className="h-4 w-4 text-spiritual-purple" />
                    </div>
                    <Label htmlFor="wakeup" className="font-medium">
                      Wake-up Time
                    </Label>
                  </div>
                  <Input
                    id="wakeup"
                    type="time"
                    value={wakeUpTime}
                    onChange={(e) => setWakeUpTime(e.target.value)}
                    className="spiritual-input"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-spiritual-purple/10 flex items-center justify-center mr-2">
                      <Moon className="h-4 w-4 text-spiritual-purple" />
                    </div>
                    <Label htmlFor="sleep" className="font-medium">
                      Sleep Time
                    </Label>
                  </div>
                  <Input
                    id="sleep"
                    type="time"
                    value={sleepTime}
                    onChange={(e) => setSleepTime(e.target.value)}
                    className="spiritual-input"
                  />
                </div>
              </div>

              {/* Daily Activities */}
              <div className="space-y-3 p-4 bg-spiritual-purple/5 rounded-lg">
                <h3 className="font-medium mb-2">Daily Activities</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      id="morning-program" 
                      checked={morningProgram}
                      onCheckedChange={(checked) => setMorningProgram(checked === true)}
                    />
                    <Label htmlFor="morning-program">Morning Program</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="evening-arati" 
                      checked={eveningArati}
                      onCheckedChange={(checked) => setEveningArati(checked === true)}
                    />
                    <Label htmlFor="evening-arati">Evening Arati</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="spiritual-class" 
                      checked={spiritualClass}
                      onCheckedChange={(checked) => setSpiritualClass(checked === true)}
                    />
                    <Label htmlFor="spiritual-class">Spiritual Class</Label>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 mt-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="prasadam" 
                      checked={prasadam}
                      onCheckedChange={(checked) => setPrasadam(checked === true)}
                    />
                    <div className="flex items-center">
                      <Apple className="h-4 w-4 mr-1 text-spiritual-purple" />
                      <Label htmlFor="prasadam">Maintained Prasadam</Label>
                    </div>
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
