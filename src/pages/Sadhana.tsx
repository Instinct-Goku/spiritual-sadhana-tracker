
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useSadhanaForm } from "@/hooks/useSadhanaForm";
import SadhanaForm from "@/components/sadhana/SadhanaForm";
import DateSelector from "@/components/sadhana/DateSelector";
import { formatDateForDisplay, formatDateForInput } from "@/utils/dateUtils";

const SadhanaPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const {
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
    handleSubmit,
  } = useSadhanaForm(selectedDate);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(new Date(e.target.value));
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
          <DateSelector 
            selectedDate={selectedDate}
            handleDateChange={handleDateChange}
            formatDateForDisplay={formatDateForDisplay}
            formatDateForInput={formatDateForInput}
          />
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
            <SadhanaForm 
              chantingRounds={chantingRounds}
              setChantingRounds={setChantingRounds}
              chantingCompletionTime={chantingCompletionTime}
              setChantingCompletionTime={setChantingCompletionTime}
              readingMinutes={readingMinutes}
              setReadingMinutes={setReadingMinutes}
              hearingMinutes={hearingMinutes}
              setHearingMinutes={setHearingMinutes}
              wakeUpTime={wakeUpTime}
              setWakeUpTime={setWakeUpTime}
              sleepTime={sleepTime}
              setSleepTime={setSleepTime}
              daySleepDuration={daySleepDuration}
              setDaySleepDuration={setDaySleepDuration}
              morningProgram={morningProgram}
              setMorningProgram={setMorningProgram}
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
              eveningArati={eveningArati}
              setEveningArati={setEveningArati}
              spiritualClass={spiritualClass}
              setSpiritualClass={setSpiritualClass}
              prasadam={prasadam}
              setPrasadam={setPrasadam}
              notes={notes}
              setNotes={setNotes}
              handleSubmit={handleSubmit}
              saving={saving}
              existingEntry={existingEntry}
            />
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default SadhanaPage;
