import React, { useState, useEffect } from "react";
import brain from "brain";
import { Scenario } from "types"; import { CreateScenarioDialog } from "components/CreateScenarioDialog";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

const ScenarioManagementPage = () => {
    const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
const [error, setError] = useState<string | null>(null); // Add state for error handling


  const fetchScenarios = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await brain.list_scenarios({}); // Add query params if needed
      if (response.ok) {
        const data = await response.json();
        setScenarios(data || []); // Ensure data is an array
      } else {
        const errorText = await response.text();
        console.error("Failed to fetch scenarios:", response.status, errorText);
        const errorMsg = `Failed to fetch scenarios: ${response.status} ${errorText || response.statusText}`;
        setError(errorMsg); // Use the declared state setter
        toast.error("Failed to load scenarios.");
      }
    } catch (err) {
      console.error("Error fetching scenarios:", err);
      setError("An unexpected error occurred while fetching scenarios."); // Use the declared state setter
      toast.error("An error occurred while loading scenarios.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScenarios();
  }, []);

  const handleCreateScenario = () => {
        setIsCreateDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Scenario Management
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button onClick={handleCreateScenario}>Create New Scenario</Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Manage your financial planning scenarios. Create new scenarios based on existing budgets or forecasts, and view their details.
          </p>
                    <div>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : scenarios.length === 0 ? (
              <p className="text-center text-muted-foreground">No scenarios found. Create one to get started.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Base Budget/Forecast ID</TableHead>
                    <TableHead>Created At</TableHead>
                    {/* Add more columns as needed, e.g., actions */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scenarios.map((scenario) => (
                    <TableRow key={scenario.scenarioId}>
                      <TableCell className="font-medium">{scenario.name}</TableCell>
                      <TableCell>{scenario.description}</TableCell>
                      <TableCell>{scenario.base_budget_version_id || "N/A"}</TableCell>
                      <TableCell>{scenario.created_at ? new Date(scenario.created_at).toLocaleString() : "N/A"}</TableCell>
                      {/* Add actions cell if needed */}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
            {/* Dialog for creating scenarios */}
      <CreateScenarioDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onScenarioCreated={() => {
          fetchScenarios(); // Refresh the list when a new scenario is created
          setIsCreateDialogOpen(false); // Close the dialog
        }}
      />
    </div>
  );
};

export default ScenarioManagementPage;
