import React, { useState, useEffect, useCallback } from "react";
import { useUserGuardContext } from "app"; // Assuming protected page
import brain from "brain";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CoaCashFlowMappingsResponse, CoaCashFlowMappingsUpdate } from "types"; // Assuming types are generated

// --- Placeholder Types/Data ---
// Replace with actual CoA data structure and fetching mechanism
interface CoaItem {
  id: string;
  name: string;
  type: string; // e.g., 'ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE'
  // Add other relevant fields if needed
}

const CASH_FLOW_CATEGORIES = ["OPERATING", "INVESTING", "FINANCING", "UNASSIGNED"] as const;
type CashFlowCategory = typeof CASH_FLOW_CATEGORIES[number];

// Placeholder function to fetch CoA - replace with actual implementation
async function fetchCoaList(organizationId: string): Promise<CoaItem[]> {
  console.log(`Placeholder: Fetching CoA for org ${organizationId}`);
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  // Replace with actual API call or data fetching logic
  return [
    { id: "101", name: "Cash", type: "ASSET" },
    { id: "102", name: "Accounts Receivable", type: "ASSET" },
    { id: "105", name: "Property, Plant & Equipment", type: "ASSET" },
    { id: "201", name: "Accounts Payable", type: "LIABILITY" },
    { id: "205", name: "Loan Payable", type: "LIABILITY" },
    { id: "301", name: "Common Stock", type: "EQUITY" },
    { id: "305", name: "Retained Earnings", type: "EQUITY" },
    { id: "401", name: "Sales Revenue", type: "INCOME" },
    { id: "501", name: "Cost of Goods Sold", type: "EXPENSE" },
    { id: "505", name: "Rent Expense", type: "EXPENSE" },
  ];
}
// --- End Placeholder ---

const CoaMappingPage: React.FC = () => {
  const { user } = useUserGuardContext(); // Assuming this page is protected
  const [coaList, setCoaList] = useState<CoaItem[]>([]);
  const [mappings, setMappings] = useState<Record<string, CashFlowCategory>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [initialMappings, setInitialMappings] = useState<Record<string, CashFlowCategory>>({}); // To track changes

  const organizationId = user?.organizationId; // Adjust based on how you get the org ID

  const loadData = useCallback(async () => {
    if (!organizationId) {
      toast.error("Organization ID not found.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch CoA list and current mappings in parallel
      const [coaData, mappingsResponse] = await Promise.all([
        fetchCoaList(organizationId),
        brain.get_coa_mappings({ organization_id: organizationId }),
      ]);

      const fetchedMappings = (await mappingsResponse.json()) as CoaCashFlowMappingsResponse;

      setCoaList(coaData);
      setMappings(fetchedMappings.mappings || {});
      setInitialMappings(fetchedMappings.mappings || {}); // Store initial state

    } catch (error) {
      console.error("Error loading CoA data or mappings:", error);
      toast.error("Failed to load Chart of Accounts or mappings.");
      setMappings({}); // Reset mappings on error
      setInitialMappings({});
    } finally {
      setIsLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleMappingChange = (accountId: string, category: CashFlowCategory) => {
    setMappings(prev => ({ ...prev, [accountId]: category }));
  };

  const handleSave = async () => {
    if (!organizationId) {
      toast.error("Organization ID not found.");
      return;
    }
    if (isSaving) return;

    setIsSaving(true);
    try {
      const payload: CoaCashFlowMappingsUpdate = { mappings };
      await brain.update_coa_mappings({ organization_id: organizationId }, payload);
      setInitialMappings(mappings); // Update initial state on successful save
      toast.success("Cash Flow mappings updated successfully!");
    } catch (error) {
      console.error("Error saving CoA mappings:", error);
      toast.error("Failed to save mappings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Determine if there are unsaved changes
  const hasUnsavedChanges = JSON.stringify(mappings) !== JSON.stringify(initialMappings);

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Chart of Accounts - Cash Flow Mapping</CardTitle>
          <CardDescription>
            Assign each account to a cash flow category (Operating, Investing, Financing).
            Accounts marked 'UNASSIGNED' might not be included in the cash flow statement correctly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading Chart of Accounts and mappings...</p>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account Name</TableHead>
                    <TableHead>Account Type</TableHead>
                    <TableHead className="w-[250px]">Cash Flow Category</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coaList.length > 0 ? (
                    coaList.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell>{account.name}</TableCell>
                        <TableCell>{account.type}</TableCell>
                        <TableCell>
                          <Select
                            value={mappings[account.id] || "UNASSIGNED"}
                            onValueChange={(value) => handleMappingChange(account.id, value as CashFlowCategory)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {CASH_FLOW_CATEGORIES.map(category => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">
                        No Chart of Accounts data available. Please ensure data is imported.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={isLoading || isSaving || !hasUnsavedChanges}
                >
                  {isSaving ? "Saving..." : "Save Mappings"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CoaMappingPage;
