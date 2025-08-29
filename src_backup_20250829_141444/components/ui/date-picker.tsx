"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

interface DatePickerProps {
  label?: string;
  value?: Date;
  // Rename disableDate to disabled to match Calendar's prop and accept a function
  disabled?: (date: Date) => boolean; 
  onChange?: (date: Date | undefined) => void;
}

export function DatePicker({ label, value, onChange, disabled }: DatePickerProps) {
  // Remove local 'today' as the disabling logic will come from the parent via 'disabled' prop
  // const today = new Date();
  // today.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="default"
            size="lg"
            className="w-full justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "PPP") : <span>Choisissez une date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            initialFocus
            // Pass the 'disabled' prop directly to Calendar
            disabled={disabled} 
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
