
import React from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, Apple } from "lucide-react";

interface OtherActivitiesSectionProps {
  eveningArati: boolean;
  setEveningArati: (value: boolean) => void;
  spiritualClass: boolean;
  setSpiritualClass: (value: boolean) => void;
  prasadam: boolean;
  setPrasadam: (value: boolean) => void;
}

const OtherActivitiesSection = ({
  eveningArati,
  setEveningArati,
  spiritualClass,
  setSpiritualClass,
  prasadam,
  setPrasadam,
}: OtherActivitiesSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-spiritual-purple flex items-center">
        <Clock className="h-4 w-4 mr-2" />
        Other Activities
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-spiritual-purple/5 rounded-lg">
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
  );
};

export default OtherActivitiesSection;
