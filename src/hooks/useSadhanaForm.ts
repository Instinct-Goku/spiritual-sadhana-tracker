
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  SadhanaEntry,
  getDailySadhana,
  addSadhanaEntry,
  updateSadhanaEntry 
} from "@/lib/sadhanaService";
import { toast } from "@/lib/toast";

export const useSadhanaForm = (selectedDate: Date) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
  const [eveningArati, setEveningArati] = useState(false);
  const [spiritualClass, setSpiritualClass] = useState(false);
  const [prasadam, setPrasadam] = useState(true);
  const [notes, setNotes] = useState("");

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
          setEveningArati(entry.eveningArati);
          setSpiritualClass(entry.spiritualClass);
          setPrasadam(entry.prasadam);
          setNotes(entry.notes || "");
        } else {
          // Reset form for new entry
          resetForm();
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

  const resetForm = () => {
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
    setEveningArati(false);
    setSpiritualClass(false);
    setPrasadam(true);
    setNotes("");
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

  return {
    loading,
    saving,
    existingEntry,
    chantingRounds,
    setChantingRounds,
    chantingCompletionTime,
    setChantingCompletionTime,
    readingMinutes,
    setReadingMinutes,
    hearingMinutes,
    setHearingMinutes,
    wakeUpTime,
    setWakeUpTime,
    sleepTime,
    setSleepTime,
    daySleepDuration,
    setDaySleepDuration,
    morningProgram,
    setMorningProgram,
    mangalaArati,
    setMangalaArati,
    tulsiArati,
    setTulsiArati,
    narsimhaArati,
    setNarsimhaArati,
    guruPuja,
    setGuruPuja,
    bhagavatamClass,
    setBhagavatamClass,
    eveningArati,
    setEveningArati,
    spiritualClass,
    setSpiritualClass,
    prasadam,
    setPrasadam,
    notes,
    setNotes,
    handleSubmit
  };
};
