import React, { useState } from "react";
import { DriverInputTable } from "components/DriverInputTable";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Placeholder data for drivers
const placeholderDrivers = [
  { id: "driver_1", name: "Units Sold" },
  { id: "driver_2", name: "Average Selling Price" },
  { id: "driver_3", name: "Website Visitors" },
  { id: "driver_4", name: "Conversion Rate (%)" },
  { id: "driver_5", name: "Customer Acquisition Cost" },
];

// Placeholder data for periods
const placeholderPeriods = [
  "Jan 2025", "Feb 2025", "Mar 2025", "Apr 2025", "May 2025", "Jun 2025",
  "Jul 2025", "Aug 2025", "Sep 2025", "Oct 2025", "Nov 2025", "Dec 2025",
];

// Initial empty data structure
const initialData: Record<string, Record<string, number | string>> = {};

const ForecastDriverInput: React.FC = () => {
  const [driverData, setDriverData] = useState(initialData);

  const handleDataChange = (newData: Record<string, Record<string, number | string>>) => {
    console.log("Driver data updated:", newData);
    setDriverData(newData);
    // In a real implementation, you might debounce this or have a save button
  };

  const handleSave = () => {
    // TODO: Implement API call to save the driverData
    console.log("Saving driver data:", driverData);
    toast.success("Driver forecast data saved (Placeholder)");
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Forecast Driver Input</CardTitle>
          <CardDescription>
            Enter the projected values for your forecast drivers for the upcoming periods.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DriverInputTable
            drivers={placeholderDrivers}
            periods={placeholderPeriods}
            initialData={driverData}
            onDataChange={handleDataChange}
          />
          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave}>Save Driver Data</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForecastDriverInput;