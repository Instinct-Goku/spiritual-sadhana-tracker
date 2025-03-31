
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Music } from "lucide-react";

interface ChantingSectionProps {
  chantingRounds: number;
  setChantingRounds: (value: number) => void;
  chantingCompletionTime: string;
  setChantingCompletionTime: (value: string) => void;
}

const ChantingSection = ({
  chantingRounds,
  setChantingRounds,
  chantingCompletionTime,
  setChantingCompletionTime,
}: ChantingSectionProps) => {
  return (
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
  );
};

export default ChantingSection;
