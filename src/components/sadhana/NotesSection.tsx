
import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface NotesSectionProps {
  notes: string;
  setNotes: (value: string) => void;
}

const NotesSection = ({
  notes,
  setNotes,
}: NotesSectionProps) => {
  return (
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
  );
};

export default NotesSection;
