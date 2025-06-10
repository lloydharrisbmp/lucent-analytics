import React, { useState, useEffect } from "react";
import brain from "brain";
import { BudgetVersion, ScenarioAssumption } from "types"; // Added ScenarioAssumption // Assuming BudgetVersion type is defined
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Plus } from 'lucide-react'; // Import icons

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScenarioCreated: () => void; // Callback to refresh list
}

export const CreateScenarioDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  onScenarioCreated,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [baseBudgetId, setBaseBudgetId] = useState<string | undefined>(
    undefined
  );
  const [budgetVersions, setBudgetVersions] = useState<BudgetVersion[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [assumptions, setAssumptions] = useState<Partial<ScenarioAssumption>[]>([]); // State for assumptions

  useEffect(() => {
    // Fetch budget versions when the dialog opens
    if (open) {
      const fetchBudgetVersions = async () => {
        setIsLoadingVersions(true);
        setFetchError(null);
        setBudgetVersions([]); // Clear previous versions
        try {
          // Assuming list_budget_versions takes an empty object or specific params
          const response = await brain.list_budget_versions({});
          if (response.ok) {
            const data = await response.json();
            // Ensure data is an array, default to empty array if null/undefined
            setBudgetVersions(data || []);
          } else {
            const errorText = await response.text();
            console.error(
              "Failed to fetch budget versions:",
              response.status,
              errorText
            );
            setFetchError(`Failed to load base budgets: ${response.status}`);
            toast.error("Failed to load base budgets.");
          }
        } catch (err) {
          console.error("Error fetching budget versions:", err);
          setFetchError(
            "An unexpected error occurred while loading base budgets."
          );
          toast.error("An error occurred loading base budgets.");
        } finally {
          setIsLoadingVersions(false);
        }
      };
      fetchBudgetVersions();
    }
  }, [open]); // Re-fetch when dialog opens

  const resetForm = () => {
    setName("");
    setDescription("");
    setBaseBudgetId(undefined);
    setIsLoadingSubmit(false);
    // Keep fetched versions, no need to clear them here
  };

  const handleAssumptionChange = (index: number, field: keyof ScenarioAssumption, value: any) => {
    setAssumptions(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addAssumption = () => {
    setAssumptions(prev => [...prev, { type: 'percentage' }]); // Default new assumption to percentage
  };

  const removeAssumption = (index: number) => {
    setAssumptions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      toast.error("Scenario name is required.");
      return;
    }
    // if (!baseBudgetId) {
    //   toast.error("Please select a base budget/forecast.");
    //   return;
    // }

    setIsLoadingSubmit(true);
    try {
      const response = await brain.create_scenario({
        name: name.trim(),
        description: description.trim() || null, // Send null if empty
        base_budget_version_id: baseBudgetId,
        assumptions: assumptions.filter(a => a.targetMetric && a.type && a.value !== undefined) as ScenarioAssumption[], // Add assumptions, ensuring basic fields are present
        // assumptions field might be added later based on schema
      });

      if (response.ok) {
        toast.success("Scenario created successfully!");
        resetForm();
        onScenarioCreated(); // Trigger list refresh and close dialog (handled by parent)
      } else {
        // Attempt to parse error detail from JSON response
        let errorText = response.statusText;
        try {
            const errorData = await response.json();
            errorText = errorData?.detail || errorText;
        } catch (parseError) {
            // Fallback to statusText if JSON parsing fails
            console.warn("Could not parse error response body as JSON");
        }
        console.error("Failed to create scenario:", response.status, errorText);
        toast.error(`Failed to create scenario: ${errorText}`);
      }
    } catch (err) {
      console.error("Error creating scenario:", err);
      toast.error(
        "An unexpected error occurred while creating the scenario."
      );
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  // Handle dialog close event
  const handleOpenChange = (isOpen: boolean) => {
      if (!isOpen) {
          resetForm(); // Reset form fields when dialog is closed
      }
      onOpenChange(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        {/* Use a form element to enable submission on Enter key */}
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Scenario</DialogTitle>
            <DialogDescription>
              Define a new planning scenario based on an existing budget or
              forecast.
            </DialogDescription>
          </DialogHeader>
          {/* Assumptions Section */}
          <div className="space-y-4 py-4">
            <h4 className="text-sm font-medium text-muted-foreground">Assumptions</h4>
            {assumptions.map((assumption, index) => (
              <div key={index} className="flex items-center space-x-2 p-2 border rounded">
                <Input
                  placeholder="Target Metric (e.g., Revenue)"
                  value={assumption.targetMetric || ""}
                  onChange={(e) => handleAssumptionChange(index, "targetMetric", e.target.value)}
                  className="flex-grow"
                />
                <Select
                  value={assumption.type || ""}
                  onValueChange={(value) => handleAssumptionChange(index, "type", value as "percentage" | "absolute")}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="absolute">Absolute</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="Value"
                  value={assumption.value || ""}
                  onChange={(e) => handleAssumptionChange(index, "value", parseFloat(e.target.value) || 0)}
                  className="w-[100px]"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeAssumption(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" onClick={addAssumption} className="mt-2">
              <Plus className="mr-2 h-4 w-4" /> Add Assumption
            </Button>
          </div>
          {/* End Assumptions Section */}
          <div className="grid gap-4 py-4">
            {/* Name Input */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder="e.g., Aggressive Growth Q3"
                required // Basic HTML5 validation
              />
            </div>
            {/* Description Textarea */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                placeholder="Optional: Describe the main assumptions"
              />
            </div>
            {/* Base Budget Select */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="baseBudget" className="text-right">
                Base Budget
              </Label>
              <Select
                onValueChange={setBaseBudgetId}
                value={baseBudgetId}
                disabled={isLoadingVersions}
                // required // Temporarily removed for testing MYA-137
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue
                    placeholder={
                      isLoadingVersions
                        ? "Loading budgets..."
                        : fetchError
                          ? "Error loading budgets"
                          : "Select a base budget..."
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingVersions && (
                    <SelectItem value="loading" disabled>
                      Loading...
                    </SelectItem>
                  )}
                  {fetchError && (
                    <SelectItem value="error" disabled>
                      {fetchError}
                    </SelectItem>
                  )}
                  {!isLoadingVersions &&
                    !fetchError &&
                    budgetVersions.length === 0 && (
                      <SelectItem value="no-versions" disabled>
                        No budget versions found
                      </SelectItem>
                    )}
                  {budgetVersions.map((version) => (
                    <SelectItem key={version.id} value={version.id}>
                      {/* Display format: Name (ID prefix) - Date */}
                      {`${version.name} (${version.id.substring(0, 8)}) - ${new Date(version.created_at).toLocaleDateString()}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)} // Use handler to ensure reset
              disabled={isLoadingSubmit}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoadingSubmit || isLoadingVersions /*|| !baseBudgetId*/ || !name.trim()}
            >
              {isLoadingSubmit ? "Creating..." : "Create Scenario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
