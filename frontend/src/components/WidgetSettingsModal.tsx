import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelectBox, Option } from "components/MultiSelectBox"; // Assuming MultiSelectBox is in components
import { WidgetConfig } from "types"; // Assuming WidgetConfig is in types

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: Partial<WidgetConfig>) => void;
  initialConfig?: Partial<WidgetConfig>;
  availableMetrics: Option[]; // Pass available metrics as props
}

// Static options for now
const chartTypeOptions = [
  { value: "line", label: "Line Chart" },
  { value: "bar", label: "Bar Chart" },
  { value: "pie", label: "Pie Chart" },
  { value: "kpi", label: "KPI Card" },
];

const dateAggregationOptions = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annual", label: "Annually" },
];

const comparisonDataOptions = [
  { value: "none", label: "None" },
  { value: "budget", label: "vs Budget" },
  { value: "prior_year", label: "vs Prior Year" },
];

export const WidgetSettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  initialConfig = {},
  availableMetrics,
}) => {
  const [title, setTitle] = useState(initialConfig.title || "New Widget");
  const [chartType, setChartType] = useState<string | undefined>(
    initialConfig.chartType
  );
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(
    initialConfig.primaryMetrics || []
  );
  const [dateAggregation, setDateAggregation] = useState<string | undefined>(
    initialConfig.dateAggregation
  );
  const [comparisonData, setComparisonData] = useState<string | undefined>(
    initialConfig.comparisonData
  );

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens, based on initialConfig
      setTitle(initialConfig.title || "New Widget");
      setChartType(initialConfig.chartType);
      setSelectedMetrics(initialConfig.primaryMetrics || []);
      setDateAggregation(initialConfig.dateAggregation);
      setComparisonData(initialConfig.comparisonData);
    }
  }, [isOpen, initialConfig]);

  const handleSave = () => {
    const configUpdate: Partial<WidgetConfig> = {
      title, // Assuming title is also configurable, added basic state for it
      chartType,
      primaryMetrics: selectedMetrics,
      dateAggregation,
      comparisonData,
    };
    onSave(configUpdate);
    onClose();
  };

  const handleMetricsChange = (selectedOptions: Option[]) => {
    setSelectedMetrics(selectedOptions.map((option) => option.value));
  };

  // Find the initial selected metric options based on their values
   const initialSelectedMetricOptions = availableMetrics.filter(option =>
     selectedMetrics.includes(option.value)
   );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Configure Widget</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Basic Title Example - Can be expanded */}
           <div className="grid grid-cols-4 items-center gap-4">
             <Label htmlFor="widget-title" className="text-right">
               Title
             </Label>
             <input // Simple input for title for now
               id="widget-title"
               value={title}
               onChange={(e) => setTitle(e.target.value)}
               className="col-span-3 p-2 border rounded" // Basic styling
             />
           </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="chart-type" className="text-right">
              Chart Type
            </Label>
            <Select
              value={chartType}
              onValueChange={setChartType}
            >
              <SelectTrigger id="chart-type" className="col-span-3">
                <SelectValue placeholder="Select chart type" />
              </SelectTrigger>
              <SelectContent>
                {chartTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="metrics" className="text-right">
              Metrics
            </Label>
            <div className="col-span-3">
              <MultiSelectBox
                 id="metrics"
                 options={availableMetrics}
                 initialSelectedOptions={initialSelectedMetricOptions} // Pass initial selection
                 onChange={handleMetricsChange}
                 placeholder="Select metrics..."
                 className="w-full" // Ensure it takes full width of its container
               />
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date-aggregation" className="text-right">
              Date Aggregation
            </Label>
            <Select
              value={dateAggregation}
              onValueChange={setDateAggregation}
            >
              <SelectTrigger id="date-aggregation" className="col-span-3">
                <SelectValue placeholder="Select aggregation" />
              </SelectTrigger>
              <SelectContent>
                {dateAggregationOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="comparison-data" className="text-right">
              Comparison
            </Label>
            <Select
              value={comparisonData}
              onValueChange={setComparisonData}
            >
              <SelectTrigger id="comparison-data" className="col-span-3">
                <SelectValue placeholder="Select comparison" />
              </SelectTrigger>
              <SelectContent>
                {comparisonDataOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
           <DialogClose asChild>
             <Button type="button" variant="outline" onClick={onClose}>
               Cancel
             </Button>
           </DialogClose>
          <Button type="button" onClick={handleSave}>Save Widget</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};