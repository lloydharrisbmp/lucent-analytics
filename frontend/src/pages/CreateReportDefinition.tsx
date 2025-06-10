
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { cn } from "@/lib/utils"; // Assuming utils for className concatenation exists
import { toast } from "sonner";
import brain from "brain";

import { BudgetVersion } from "types"; // Assuming BudgetVersion type exists


// Placeholder data sources - replace with actual logic if needed
// TODO: Fetch this list dynamically or define centrally
const dataSources = [
  { value: "pnl", label: "Profit & Loss" },
  { value: "balance_sheet", label: "Balance Sheet" },
  { value: "consolidation_results", label: "Consolidation Results" },
  { value: "cash_flow_statement", label: "Cash Flow Statement" },
  // Add more relevant sources based on available data
];

const CreateReportDefinition: React.FC = () => {
  const navigate = useNavigate();
  const [reportName, setReportName] = useState("");
  const [description, setDescription] = useState("");
  const [dataSource, setDataSource] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const [budgetVersions, setBudgetVersions] = useState<BudgetVersion[]>([]);
  const [selectedBudgetVersionId, setSelectedBudgetVersionId] = useState<string | undefined>(undefined);

  // Fetch budget versions on mount
  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        // Assuming list_budget_versions requires no parameters or they can be derived
        // Adjust if organizationId or similar is needed and needs to be fetched/passed
        const response = await brain.list_budget_versions({}); 
        const versions = await response.json(); // Assuming this returns BudgetVersion[]
        setBudgetVersions(versions || []); // Handle potential null/undefined response
      } catch (error) {
        console.error("Failed to fetch budget versions:", error);
        toast.error("Could not load budget versions. Please try again later.");
      }
    };
    fetchBudgets();
  }, []);


  const handleSave = async () => {
    if (!reportName || !dataSource || !dateRange?.from || !dateRange?.to) {
      toast.error("Report Name, Data Source, and a complete Date Range are required.");
      return;
    }

    setIsLoading(true);
    try {
      // Construct the payload based on the API structure (MYA-95)
      // Using placeholder complex fields for now, adjust based on actual API needs
      const payload: ReportDefinitionCreate = {
        name: reportName,

        budget_version_id: selectedBudgetVersionId || null, // Pass selected ID or null

        // TODO: Refine dataSource structure based on final API definition
        dataSource: { type: dataSource, parameters: {} }, 
        // Use selected date range, ensuring dates are present
        filters: { 
          dateRange: {
             start: dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : "", 
             end: dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : ""
          }
        },
        // TODO: Define sensible default rows/columns or make them part of a later step
        rows: [{ type: "default_row_structure", parameters: {} }], // Placeholder
        columns: [{ type: "default_col_structure", parameters: {} }], // Placeholder
      };

      // TODO: Integrate with date range picker later

      // --- API Call --- 
      const response = await brain.create_report_definition(payload);
      // TODO: Add proper type assertion or check for response status before parsing
      const savedDefinition = await response.json(); 
      toast.success(`Report definition '${savedDefinition.name}' saved successfully!`);
      navigate(`/report-builder/${savedDefinition.id}`); // Navigate to the editor for the new report
      // --- End API Call ---

    } catch (error) {
      console.error("Failed to save report definition:", error);
      toast.error("Failed to save report definition. Please check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-12">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Create New Report Definition</CardTitle>
          <CardDescription>
            Define the core details for your custom report. You can customize the layout and components in the next step.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label htmlFor="reportName">Report Name *</Label>
            <Input
              id="reportName"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              placeholder="e.g., Monthly Performance Summary"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional: Describe the purpose or audience of this report"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dataSource">Primary Data Source *</Label>
            <Select value={dataSource} onValueChange={setDataSource} required>
              <SelectTrigger id="dataSource">
                <SelectValue placeholder="Select the main data source" />
              </SelectTrigger>
              <SelectContent>
                {dataSources.map((source) => (
                  <SelectItem key={source.value} value={source.value}>
                    {source.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground pt-1">
              This determines the primary dataset used for the report (e.g., P&L, Balance Sheet).
            </p>
          </div>

          {/* Budget Version Selection */}
          <div className="space-y-2">
            <Label htmlFor="budgetVersion">Comparison Budget (Optional)</Label>
            <Select value={selectedBudgetVersionId} onValueChange={setSelectedBudgetVersionId}>
              <SelectTrigger id="budgetVersion">
                <SelectValue placeholder="Select a budget version for comparison" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem> {/* Explicit None option */}
                {budgetVersions.map((version) => (
                  <SelectItem key={version.id} value={version.id}>
                    {version.name} {/* Assuming BudgetVersion has id and name */}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground pt-1">
              Select a budget to enable Budget vs. Actual columns in the report builder.
            </p>
          </div>

          {/* Date Range Picker */}
          <div className="space-y-2">
            <Label htmlFor="dateRange">Primary Date Range *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="dateRange"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
             <p className="text-xs text-muted-foreground pt-1">
               Select the main reporting period. You might be able to adjust this later.
             </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2 border-t pt-6">
           <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
           <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save & Continue"} 
            {/* Changed text to imply next step */}
           </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreateReportDefinition;
