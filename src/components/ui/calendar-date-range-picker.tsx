
import * as React from "react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarDateRangePickerProps {
  date?: Date | null;
  onSelect: (date: Date | null) => void;
  className?: string;
}

export function CalendarDateRangePicker({
  date,
  onSelect,
  className,
}: CalendarDateRangePickerProps) {
  const [month, setMonth] = React.useState<Date>(date || new Date());

  const handlePrevMonth = () => {
    setMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  return (
    <div className={cn("flex flex-col space-y-4", className)}>
      <div className="flex items-center justify-between px-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevMonth}
          className="h-7 w-7"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-sm font-medium">
          {month.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          })}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleNextMonth}
          className="h-7 w-7"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <CalendarComponent
        mode="single"
        selected={date || undefined}
        onSelect={onSelect}
        month={month}
        onMonthChange={setMonth}
        className="rounded-md border"
      />
      {date && (
        <Button 
          variant="outline"
          size="sm"
          onClick={() => onSelect(null)}
          className="mx-auto w-auto"
        >
          Clear Date
        </Button>
      )}
    </div>
  );
}
