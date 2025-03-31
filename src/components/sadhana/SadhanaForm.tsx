
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { SadhanaEntry } from "@/lib/sadhanaService";
import ChantingSection from "./ChantingSection";
import StudySection from "./StudySection";
import RestScheduleSection from "./RestScheduleSection";
import MorningProgramSection from "./MorningProgramSection";
import OtherActivitiesSection from "./OtherActivitiesSection";
import NotesSection from "./NotesSection";

interface SadhanaFormProps {
  chantingRounds: number;
  setChantingRounds: (value: number) => void;
  chantingCompletionTime: string;
  setChantingCompletionTime: (value: string) => void;
  readingMinutes: number;
  setReadingMinutes: (value: number) => void;
  hearingMinutes: number;
  setHearingMinutes: (value: number) => void;
  wakeUpTime: string;
  setWakeUpTime: (value: string) => void;
  sleepTime: string;
  setSleepTime: (value: string) => void;
  daySleepDuration: number;
  setDaySleepDuration: (value: number) => void;
  morningProgram: boolean;
  setMorningProgram: (value: boolean) => void;
  mangalaArati: boolean;
  setMangalaArati: (value: boolean) => void;
  tulsiArati: boolean;
  setTulsiArati: (value: boolean) => void;
  narsimhaArati: boolean;
  setNarsimhaArati: (value: boolean) => void;
  guruPuja: boolean;
  setGuruPuja: (value: boolean) => void;
  bhagavatamClass: boolean;
  setBhagavatamClass: (value: boolean) => void;
  eveningArati: boolean;
  setEveningArati: (value: boolean) => void;
  spiritualClass: boolean;
  setSpiritualClass: (value: boolean) => void;
  prasadam: boolean;
  setPrasadam: (value: boolean) => void;
  notes: string;
  setNotes: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  saving: boolean;
  existingEntry: SadhanaEntry | null;
}

const SadhanaForm = ({
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
  handleSubmit,
  saving,
  existingEntry,
}: SadhanaFormProps) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ChantingSection
        chantingRounds={chantingRounds}
        setChantingRounds={setChantingRounds}
        chantingCompletionTime={chantingCompletionTime}
        setChantingCompletionTime={setChantingCompletionTime}
      />

      <StudySection
        readingMinutes={readingMinutes}
        setReadingMinutes={setReadingMinutes}
        hearingMinutes={hearingMinutes}
        setHearingMinutes={setHearingMinutes}
      />

      <RestScheduleSection
        wakeUpTime={wakeUpTime}
        setWakeUpTime={setWakeUpTime}
        sleepTime={sleepTime}
        setSleepTime={setSleepTime}
        daySleepDuration={daySleepDuration}
        setDaySleepDuration={setDaySleepDuration}
      />

      <MorningProgramSection
        mangalaArati={mangalaArati}
        setMangalaArati={setMangalaArati}
        tulsiArati={tulsiArati}
        setTulsiArati={setTulsiArati}
        narsimhaArati={narsimhaArati}
        setNarsimhaArati={setNarsimhaArati}
        guruPuja={guruPuja}
        setGuruPuja={setGuruPuja}
        bhagavatamClass={bhagavatamClass}
        setBhagavatamClass={setBhagavatamClass}
      />
      
      <OtherActivitiesSection
        eveningArati={eveningArati}
        setEveningArati={setEveningArati}
        spiritualClass={spiritualClass}
        setSpiritualClass={setSpiritualClass}
        prasadam={prasadam}
        setPrasadam={setPrasadam}
      />

      <NotesSection
        notes={notes}
        setNotes={setNotes}
      />

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
  );
};

export default SadhanaForm;
