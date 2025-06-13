
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
  Calendar,
  Mic,
  BookCheck,
  Scroll,
  HandHeart
} from "lucide-react";
import { 
  addSadhanaEntry, 
  getDailySadhana, 
  SadhanaEntry, 
  updateSadhanaEntry 
} from "@/lib/sadhanaService";
import {
  DEFAULT_BATCHES,
  getBatchConfigurations,
  getBatchMinimumRequirements
} from "@/lib/scoringService";

const formatDateForDisplay = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const SadhanaPage = () => {
  const { currentUser, userProfile } = useAuth();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [existingEntry, setExistingEntry] = useState<SadhanaEntry | null>(null);
  
  // Form fields
  const [chantingCompletionTime, setChantingCompletionTime] = useState("12:00");
  const [readingMinutes, setReadingMinutes] = useState<number | ''>('');
  const [spLectureMinutes, setSpLectureMinutes] = useState<number | ''>('');
  const [smLectureMinutes, setSmLectureMinutes] = useState<number | ''>('');
  const [gsnsLectureMinutes, setGsnsLectureMinutes] = useState<number | ''>('');
  const [serviceMinutes, setServiceMinutes] = useState<number | ''>('');
  const [shlokaMemorized, setShlokaMemorized] = useState<number | ''>('');
  const [wakeUpTime, setWakeUpTime] = useState("05:00");
  const [sleepTime, setSleepTime] = useState("21:30");
  const [daySleepDuration, setDaySleepDuration] = useState<number | ''>('');
  const [morningProgram, setMorningProgram] = useState(false);
  const [mangalaArati, setMangalaArati] = useState(false);
  const [tulsiArati, setTulsiArati] = useState(false);
  const [narsimhaArati, setNarsimhaArati] = useState(false);
  const [guruPuja, setGuruPuja] = useState(false);
  const [bhagavatamClass, setBhagavatamClass] = useState(false);
  const [notes, setNotes] = useState("");
  
  // Get user's batch to determine which hearing fields to display
  const userBatch = userProfile?.batch?.toLowerCase() || "sahadev";
  const batchConfigs = getBatchConfigurations();
  const batchCriteria = batchConfigs[userBatch] || DEFAULT_BATCHES.sahadev;
  
  // Get minimum requirements for the user's batch
  const { readingMinutes: minReadingMinutes, hearingMinutes: minHearingMinutes, 
          serviceMinutes: minServiceMinutes, shlokaCount: minShlokaCount } = 
          getBatchMinimumRequirements(userProfile);
  
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
          setChantingCompletionTime(entry.chantingCompletionTime || "12:00");
          setReadingMinutes(entry.readingMinutes || '');
          setSpLectureMinutes(entry.spLectureMinutes || '');
          setSmLectureMinutes(entry.smLectureMinutes || '');
          setGsnsLectureMinutes(entry.gsnsLectureMinutes || '');
          setServiceMinutes(entry.serviceMinutes || '');
          setShlokaMemorized(entry.shlokaMemorized || '');
          setWakeUpTime(entry.wakeUpTime);
          setSleepTime(entry.sleepTime);
          setDaySleepDuration(entry.daySleepDuration || '');
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
          setChantingCompletionTime("12:00");
          setReadingMinutes('');
          setSpLectureMinutes('');
          setSmLectureMinutes('');
          setGsnsLectureMinutes('');
          setServiceMinutes('');
          setShlokaMemorized('');
          setWakeUpTime("05:00");
          setSleepTime("21:30");
          setDaySleepDuration('');
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
        chantingCompletionTime,
        readingMinutes: readingMinutes === '' ? 0 : Number(readingMinutes),
        spLectureMinutes: spLectureMinutes === '' ? 0 : Number(spLectureMinutes),
        smLectureMinutes: smLectureMinutes === '' ? 0 : Number(smLectureMinutes),
        gsnsLectureMinutes: gsnsLectureMinutes === '' ? 0 : Number(gsnsLectureMinutes), // New field
        serviceMinutes: serviceMinutes === '' ? 0 : Number(serviceMinutes),
        shlokaMemorized: shlokaMemorized === '' ? 0 : Number(shlokaMemorized),
        hearingMinutes: 0, // For backwards compatibility
        wakeUpTime,
        sleepTime,
        daySleepDuration: daySleepDuration === '' ? 0 : Number(daySleepDuration),
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

  // Helper to determine if a hearing field should be shown based on batch criteria
  const shouldShowHearingField = (type: 'sp' | 'sm' | 'gsns') => {
    if (type === 'sp') return true; // All batches show SP lectures
    if (type === 'sm') return batchCriteria.smLectureMinimum !== undefined;
    if (type === 'gsns') return batchCriteria.gsnsLectureMinimum !== undefined;
    return false;
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

              {/* Reading Section */}
              <div className="space-y-4">
                <h3 className="font-medium text-spiritual-purple flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Study
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="reading" className="font-medium">
                    Srila Prabhupada Book Reading (minutes) 
                    {minReadingMinutes > 0 && (
                      <span className="text-amber-600 ml-1">
                        (minimum: {minReadingMinutes} min / {minReadingMinutes / 60} hrs)
                      </span>
                    )}
                  </Label>
                  <Input
                    id="reading"
                    type="number"
                    min="0"
                    value={readingMinutes}
                    onChange={(e) => setReadingMinutes(e.target.value ? Number(e.target.value) : '')}
                    className="spiritual-input"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Hearing Section */}
              <div className="space-y-4">
                <h3 className="font-medium text-spiritual-purple flex items-center">
                  <Headphones className="h-4 w-4 mr-2" />
                  Hearing (minutes)
                  {minHearingMinutes > 0 && (
                    <span className="text-amber-600 ml-1">
                      (total minimum: {minHearingMinutes} min / {minHearingMinutes / 60} hrs)
                    </span>
                  )}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* SP Lecture field - always visible */}
                  <div className="space-y-2">
                    <Label htmlFor="spLecture" className="font-medium flex items-center">
                      <Mic className="h-4 w-4 mr-1" />
                      Srila Prabhupada Lectures 
                      {batchCriteria.spLectureMinimum && (
                        <span className="text-amber-600 ml-1">
                          (min: {batchCriteria.spLectureMinimum} min)
                        </span>
                      )}
                    </Label>
                    <Input
                      id="spLecture"
                      type="number"
                      min="0"
                      value={spLectureMinutes}
                      onChange={(e) => setSpLectureMinutes(e.target.value ? Number(e.target.value) : '')}
                      className="spiritual-input"
                      placeholder="0"
                    />
                  </div>
                  
                  {/* Spiritual Master Lecture field - conditionally visible */}
                  {shouldShowHearingField('sm') && (
                    <div className="space-y-2">
                      <Label htmlFor="smLecture" className="font-medium flex items-center">
                        <Mic className="h-4 w-4 mr-1" />
                        Spiritual Master Lectures
                        {batchCriteria.smLectureMinimum && (
                          <span className="text-amber-600 ml-1">
                            (min: {batchCriteria.smLectureMinimum} min)
                          </span>
                        )}
                      </Label>
                      <Input
                        id="smLecture"
                        type="number"
                        min="0"
                        value={smLectureMinutes}
                        onChange={(e) => setSmLectureMinutes(e.target.value ? Number(e.target.value) : '')}
                        className="spiritual-input"
                        placeholder="0"
                      />
                    </div>
                  )}
                  
                  {/* GS/NS Lecture field - conditionally visible */}
                  {shouldShowHearingField('gsns') && (
                    <div className="space-y-2">
                      <Label htmlFor="gsnsLecture" className="font-medium flex items-center">
                        <Mic className="h-4 w-4 mr-1" />
                        GS/NS Lectures
                        {batchCriteria.gsnsLectureMinimum && (
                          <span className="text-amber-600 ml-1">
                            (min: {batchCriteria.gsnsLectureMinimum} min)
                          </span>
                        )}
                      </Label>
                      <Input
                        id="gsnsLecture"
                        type="number"
                        min="0"
                        value={gsnsLectureMinutes}
                        onChange={(e) => setGsnsLectureMinutes(e.target.value ? Number(e.target.value) : '')}
                        className="spiritual-input"
                        placeholder="0"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Shloka Memorize and Service Section */}
              <div className="space-y-4">
                <h3 className="font-medium text-spiritual-purple flex items-center">
                  <BookCheck className="h-4 w-4 mr-2" />
                  Additional Practices
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shlokaMemorize" className="font-medium flex items-center">
                      <Scroll className="h-4 w-4 mr-1" />
                      Shlokas Memorized
                      {minShlokaCount > 0 && (
                        <span className="text-amber-600 ml-1">
                          (minimum: {minShlokaCount})
                        </span>
                      )}
                    </Label>
                    <Input
                      id="shlokaMemorize"
                      type="number"
                      min="0"
                      value={shlokaMemorized}
                      onChange={(e) => setShlokaMemorized(e.target.value ? Number(e.target.value) : '')}
                      className="spiritual-input"
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="service" className="font-medium flex items-center">
                      <HandHeart className="h-4 w-4 mr-1" />
                      Service (minutes)
                      {minServiceMinutes > 0 && (
                        <span className="text-amber-600 ml-1">
                          (minimum: {minServiceMinutes} min / {minServiceMinutes / 60} hrs)
                        </span>
                      )}
                    </Label>
                    <Input
                      id="service"
                      type="number"
                      min="0"
                      value={serviceMinutes}
                      onChange={(e) => setServiceMinutes(e.target.value ? Number(e.target.value) : '')}
                      className="spiritual-input"
                      placeholder="0"
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
                      onChange={(e) => setDaySleepDuration(e.target.value ? Number(e.target.value) : '')}
                      className="spiritual-input"
                      placeholder="0"
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
