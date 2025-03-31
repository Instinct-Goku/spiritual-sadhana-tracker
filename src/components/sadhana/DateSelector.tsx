
import React from "react";
import { Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CardTitle } from "@/components/ui/card";

interface DateSelectorProps {
  selectedDate: Date;
  handleDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  formatDateForDisplay: (date: Date) => string;
  formatDateForInput: (date: Date) => string;
}

const DateSelector = ({
  selectedDate,
  handleDateChange,
  formatDateForDisplay,
  formatDateForInput,
}: DateSelectorProps) => {
  return (
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
  );
};

export default DateSelector;
