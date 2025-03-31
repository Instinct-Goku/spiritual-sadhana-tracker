
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Clock, Sun, Moon, BedDouble } from "lucide-react";

interface RestScheduleSectionProps {
  wakeUpTime: string;
  setWakeUpTime: (value: string) => void;
  sleepTime: string;
  setSleepTime: (value: string) => void;
  daySleepDuration: number;
  setDaySleepDuration: (value: number) => void;
}

const RestScheduleSection = ({
  wakeUpTime,
  setWakeUpTime,
  sleepTime,
  setSleepTime,
  daySleepDuration,
  setDaySleepDuration,
}: RestScheduleSectionProps) => {
  return (
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
  );
};

export default RestScheduleSection;
