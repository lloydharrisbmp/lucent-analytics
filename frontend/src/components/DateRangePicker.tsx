import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRange, DateRangeType, generateDateRanges } from "utils/financial-data";
import { format } from "date-fns";
import { CalendarIcon, ChevronDown } from "lucide-react";

interface DateRangePickerProps {
  onChange: (range: DateRange) => void;
  value: DateRange;
}

export function DateRangePicker({ onChange, value }: DateRangePickerProps) {
  const predefinedRanges = generateDateRanges();
  const [isCustomRange, setIsCustomRange] = React.useState(value.type === "custom");
  const [customStartDate, setCustomStartDate] = React.useState<Date | undefined>(value.startDate);
  const [customEndDate, setCustomEndDate] = React.useState<Date | undefined>(value.endDate);
  
  // Handle selection of predefined date range
  const handleRangeSelect = (rangeType: string) => {
    if (rangeType === "custom") {
      setIsCustomRange(true);
      return;
    }
    
    const selectedRange = predefinedRanges.find(range => range.label === rangeType);
    if (selectedRange) {
      setIsCustomRange(false);
      onChange(selectedRange);
    }
  };
  
  // Apply custom date range selection
  const applyCustomRange = () => {
    if (customStartDate && customEndDate) {
      onChange({
        type: "custom",
        startDate: customStartDate,
        endDate: customEndDate,
        label: `${format(customStartDate, "MMM d, yyyy")} - ${format(customEndDate, "MMM d, yyyy")}`
      });
    }
  };
  
  // Format date range for display
  const formatSelectedRange = () => {
    if (value.type === "custom") {
      return value.label;
    }
    return value.label;
  };
  
  return (
    <div className="flex items-center space-x-2">
      <Select
        value={value.label}
        onValueChange={handleRangeSelect}
      >
        <SelectTrigger className="min-w-[180px]">
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent>
          {predefinedRanges.map((range) => (
            <SelectItem key={range.label} value={range.label}>
              {range.label}
            </SelectItem>
          ))}
          <SelectItem value="custom">Custom Range</SelectItem>
        </SelectContent>
      </Select>
      
      {isCustomRange && (
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[160px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {customStartDate ? format(customStartDate, "MMM d, yyyy") : "Start date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={customStartDate}
                onSelect={setCustomStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          <span className="text-muted-foreground">to</span>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[160px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {customEndDate ? format(customEndDate, "MMM d, yyyy") : "End date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={customEndDate}
                onSelect={setCustomEndDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          <Button onClick={applyCustomRange} size="sm">
            Apply
          </Button>
        </div>
      )}
      
      <div className="text-sm font-medium">
        {formatSelectedRange()}
      </div>
    </div>
  );
}
