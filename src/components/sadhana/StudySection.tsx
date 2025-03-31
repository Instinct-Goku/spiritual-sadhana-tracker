
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { BookOpen, Headphones } from "lucide-react";

interface StudySectionProps {
  readingMinutes: number;
  setReadingMinutes: (value: number) => void;
  hearingMinutes: number;
  setHearingMinutes: (value: number) => void;
}

const StudySection = ({
  readingMinutes,
  setReadingMinutes,
  hearingMinutes,
  setHearingMinutes,
}: StudySectionProps) => {
  return (
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
  );
};

export default StudySection;
