import React, { useState } from "react";
import { Label } from "@/components/ui/label";

interface CheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const Checkbox: React.FC<CheckboxProps> = ({ id, label, checked, onChange }) => {
  return (
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
      />
      <Label htmlFor={id} className="text-sm font-normal">
        {label}
      </Label>
    </div>
  );
};

interface CheckboxGroupProps {
  items: { id: string; label: string }[];
  selectedItems: string[];
  onChange: (selectedItems: string[]) => void;
  className?: string;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({ items, selectedItems, onChange, className = "" }) => {
  const handleCheckboxChange = (id: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedItems, id]);
    } else {
      onChange(selectedItems.filter((item) => item !== id));
    }
  };

  return (
    <div className={className}>
      {items.map((item) => (
        <Checkbox
          key={item.id}
          id={item.id}
          label={item.label}
          checked={selectedItems.includes(item.id)}
          onChange={(checked) => handleCheckboxChange(item.id, checked)}
        />
      ))}
    </div>
  );
};
