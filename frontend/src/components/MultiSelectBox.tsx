import React, { useRef, useEffect, useState } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

interface MultiSelectBoxProps {
  options: SelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
}

export const MultiSelectBox: React.FC<MultiSelectBoxProps> = ({
  options,
  selected = [],
  onChange,
  placeholder = "Select options...",
  emptyMessage = "No options found.",
  disabled = false,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<SelectOption[]>([]);

  // Sync selectedLabels with options changes
  useEffect(() => {
    // Map selected values to full option objects with labels
    const selectedOptions = options.filter(option => 
      selected.includes(option.value)
    );
    setSelectedLabels(selectedOptions);
  }, [selected, options]);

  // Handle item selection toggle
  const handleSelect = (value: string) => {
    // If already selected, remove it; otherwise, add it
    const newSelected = selected.includes(value)
      ? selected.filter(item => item !== value)
      : [...selected, value];
    
    onChange(newSelected);
  };

  // Remove a selected item
  const handleRemove = (e: React.MouseEvent, value: string) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(selected.filter(item => item !== value));
  };

  // Clear all selected items
  const handleClearAll = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange([]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          role="combobox" 
          aria-expanded={open} 
          className={cn(
            "w-full justify-between min-h-10", 
            selectedLabels.length > 0 ? "h-auto" : "h-10",
            className
          )}
          onClick={() => setOpen(!open)}
          disabled={disabled}
        >
          <div className="flex flex-wrap gap-1 mr-2">
            {selectedLabels.length > 0 ? (
              selectedLabels.map(option => (
                <Badge 
                  variant="secondary" 
                  key={option.value}
                  className="flex items-center gap-1 px-2 py-0.5 max-w-full"
                >
                  <span className="truncate">{option.label}</span>
                  <button 
                    className="rounded-full opacity-70 hover:opacity-100"
                    onClick={(e) => handleRemove(e, option.value)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <div className="flex">
            {selectedLabels.length > 0 && (
              <button 
                className="mr-2 opacity-70 hover:opacity-100"
                onClick={handleClearAll}
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full min-w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search..." className="h-9" />
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          <CommandGroup className="max-h-60 overflow-auto">
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={() => handleSelect(option.value)}
              >
                <div className="flex items-center">
                  <span className={cn(
                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                    selected.includes(option.value) 
                      ? "border-primary bg-primary text-primary-foreground" 
                      : "opacity-50 border-muted-foreground"
                  )}>
                    {selected.includes(option.value) && <Check className="h-3 w-3" />}
                  </span>
                  {option.label}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
