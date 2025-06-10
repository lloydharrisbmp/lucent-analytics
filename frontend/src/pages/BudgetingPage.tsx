import React, { useState, useEffect } from "react";
import brain from "brain";
import { useOrg } from "components/OrgProvider"; // Assuming OrgProvider gives current org ID
import { BudgetVersionSummary, BudgetVersion } from "types"; // Assuming these types exist
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { BudgetEditor } from "components/BudgetEditor"; // Import the new component

const BudgetingPage: React.FC = () => {
  const { currentOrganization } = useOrg();
  const [budgetVersions, setBudgetVersions] = useState<BudgetVersionSummary[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedBudgetData, setSelectedBudgetData] = useState<BudgetVersionDetails | null>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState<boolean>(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  useEffect(() => {
    if (currentOrganization) {
      const fetchVersions = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await brain.list_budget_versions({ 
            organization_id: currentOrganization.id 
          });
          const versions: BudgetVersionSummary[] = await response.json();
          setBudgetVersions(versions);
          // Optionally select the first version by default
          // if (versions.length > 0) {
          //   setSelectedVersionId(versions[0].id);
          // }
        } catch (err) {
          console.error("Failed to fetch budget versions:", err);
          setError("Failed to load budget versions. Please try again.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchVersions();
    } else {
      // Handle case where no organization is selected
      setBudgetVersions([]);
      setSelectedVersionId(null);
      // Optionally set an error or display a message
      // setError("Please select an organization first.");
    }
  }, [currentOrganization]);

  useEffect(() => {
    if (selectedVersionId) {
      const fetchDetails = async () => {
        console.log(`Fetching details for budget version ID: ${selectedVersionId}`);
        setIsDetailsLoading(true);
        setDetailsError(null);
        setSelectedBudgetData(null); // Clear previous data
        try {
          const response = await brain.get_budget_version({ version_id: selectedVersionId });
          const details: BudgetVersionDetails = await response.json();
          setSelectedBudgetData(details);
        } catch (err) {
          console.error("Failed to fetch budget details:", err);
          setDetailsError("Failed to load budget details. Please try again.");
        } finally {
          setIsDetailsLoading(false);
        }
      };
      fetchDetails();
    } else {
      // Clear details if no version is selected
      setSelectedBudgetData(null);
      setIsDetailsLoading(false);
      setDetailsError(null);
    }
  }, [selectedVersionId]);
  // TODO: Fetch budget versions, handle selection/creation

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Budget Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Budget selection and editor will go here.</p>
          {/* Placeholder for budget version selection dropdown */}
          <div className="my-4">
            <label htmlFor="budget-version-select" className="block text-sm font-medium text-gray-700 mb-1">
              Select or Create Budget Version:
            </label>
            {/* Replace with actual Select component later */}
            <Select 
              value={selectedVersionId ?? ''}
              onValueChange={setSelectedVersionId}
              disabled={isLoading || !currentOrganization}
            >
              <SelectTrigger id="budget-version-select">
                <SelectValue placeholder={isLoading ? "Loading..." : "Select a budget version"} />
              </SelectTrigger>
              <SelectContent>
                {budgetVersions.length > 0 ? (
                  budgetVersions.map((version) => (
                    <SelectItem key={version.id} value={version.id}>
                      {version.name} ({(version.start_date)} - {version.end_date})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-versions" disabled>
                    {currentOrganization ? "No budget versions found" : "Select an organization first"}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {error && (
              <Alert variant="destructive" className="mt-4">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
          <Button className="ml-4" disabled={!currentOrganization}>Create New Version</Button> {/* TODO: Implement creation dialog */}

          {/* Placeholder for BudgetEditor component */}
          <div className="mt-6 border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">Budget Editor</h2>
            <p className="text-muted-foreground">
              {selectedVersionId
                ? isDetailsLoading
                  ? "Loading budget details..."
                  : detailsError
                  ? detailsError // Display details error
                  : selectedBudgetData
                  ? "Budget details loaded. Editor component will go here." // Placeholder for editor
                  : "Select a version."
                : "Select or create a budget version to view/edit."
              }
            </p>
            {/* Render BudgetEditor when data is loaded */}
            {!isDetailsLoading && !detailsError && selectedBudgetData && (
              <BudgetEditor data={selectedBudgetData} />
            )}
            {/* <BudgetEditor data={selectedBudgetData} /> */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetingPage;
