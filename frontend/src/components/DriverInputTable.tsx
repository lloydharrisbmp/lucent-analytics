import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

// Define a structure for a driver
interface Driver {
  id: string;
  name: string;
  // Add other relevant driver properties if needed
}

// Define props for the component
interface Props {
  drivers: Driver[];
  periods: string[]; // e.g., ["Jan 2025", "Feb 2025", ...]
  initialData: Record<string, Record<string, number | string>>; // { driverId: { period: value } }
  onDataChange: (data: Record<string, Record<string, number | string>>) => void;
}

export const DriverInputTable: React.FC<Props> = ({ drivers, periods, initialData, onDataChange }) => {
  const [data, setData] = useState(initialData);

  const handleInputChange = (driverId: string, period: string, value: string) => {
    // Attempt to convert to number, keep as string if conversion fails or empty
    const numericValue = value === '' ? '' : Number(value);
    const finalValue = isNaN(numericValue as number) || value === '' ? value : numericValue;

    const newData = {
      ...data,
      [driverId]: {
        ...(data[driverId] || {}),
        [period]: finalValue,
      },
    };
    setData(newData);
    onDataChange(newData);
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="sticky left-0 bg-background z-10 min-w-[150px]">Driver</TableHead>
            {periods.map((period) => (
              <TableHead key={period} className="text-right min-w-[100px]">{period}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {drivers.map((driver) => (
            <TableRow key={driver.id}>
              <TableCell className="font-medium sticky left-0 bg-background z-10">{driver.name}</TableCell>
              {periods.map((period) => (
                <TableCell key={period} className="text-right">
                  <Input
                    type="text" // Use text to allow empty input initially, handle conversion
                    inputMode="numeric" // Hint for mobile keyboards
                    pattern="[0-9]*"    // Basic pattern for numeric input
                    value={data[driver.id]?.[period] ?? ''}
                    onChange={(e) => handleInputChange(driver.id, period, e.target.value)}
                    className="max-w-[100px] ml-auto text-right"
                    placeholder="0"
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};