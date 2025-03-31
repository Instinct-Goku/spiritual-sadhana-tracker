
import React from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Sun } from "lucide-react";

interface MorningProgramSectionProps {
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
}

const MorningProgramSection = ({
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
}: MorningProgramSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-spiritual-purple flex items-center">
        <Sun className="h-4 w-4 mr-2" />
        Morning Program
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-spiritual-purple/5 rounded-lg">
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
  );
};

export default MorningProgramSection;
