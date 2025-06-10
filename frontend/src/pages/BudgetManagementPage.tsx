import React, { useState, useEffect } from "react";
import brain from "brain";
import { BudgetVersion } from "types"; // Assuming a BudgetVersion type exists in types.ts
import { useOrganizationStore } from "utils/organizationStore"; // Store to get current org ID
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
import { Button } from "@/components/ui/button";
import { BudgetDialog } from "components/BudgetDialog"; // Updated import
import { Terminal, Trash2, Loader2, Pencil } from "lucide-react"; // Added Pencil icon
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"; // Import AlertDialog components

const BudgetManagementPage = () => {
  const { currentOrganizationId: currentOrgId, isLoading: isLoadingOrg } = useOrganizationStore(state => ({
    currentOrganizationId: state.currentOrganizationId,
    isLoading: state.isLoading
  }));
  const [budgetVersions, setBudgetVersions] = useState<BudgetVersion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [editingBudget, setEditingBudget] = useState<BudgetVersion | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  // Add state for create/edit dialog if needed later

  const fetchBudgetVersions = async () => {
    if (!currentOrgId) {
      setError("Organization context is not available. Please select an organization.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      console.log(`Fetching budget versions for org: ${currentOrgId}`);
      const response = await brain.list_budget_versions({ organization_id: currentOrgId });
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched budget versions:", data);
        setBudgetVersions(data || []); // Ensure data is an array
      } else {
        const errorText = await response.text();
        console.error("Failed to fetch budget versions:", response.status, errorText);
        const errorMsg = `Failed to fetch budget versions: ${response.status} ${errorText || response.statusText}`;
        setError(errorMsg);
        toast.error("Failed to load budget versions.");
      }
    } catch (err) {
      console.error("Error fetching budget versions:", err);
      setError("An unexpected error occurred while fetching budget versions.");
      toast.error("An error occurred while loading budget versions.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (versionId: string) => {
    setDeleteTargetId(versionId);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId || !currentOrgId) {
      toast.error("Cannot delete budget: Missing ID or Organization context.");
      setDeleteTargetId(null);
      return;
    }

    setIsDeleting(true);
    try {
      console.log(`Attempting to delete budget version: ${deleteTargetId} for org: ${currentOrgId}`);
      const response = await brain.delete_budget_version({
        organization_id: currentOrgId,
        version_id: deleteTargetId,
      });

      if (response.ok) {
        toast.success("Budget version deleted successfully!");
        fetchBudgetVersions(); // Refresh the list
      } else {
        const errorText = await response.text();
        console.error("Failed to delete budget version:", response.status, errorText);
        toast.error(`Failed to delete budget version: ${errorText || response.statusText}`);
      }
    } catch (err) {
      console.error("Error deleting budget version:", err);
      toast.error("An unexpected error occurred while deleting the budget version.");
    } finally {
      setIsDeleting(false);
      setDeleteTargetId(null); // Close dialog implicitly by resetting target
    }
  };

  const handleEditClick = (budget: BudgetVersion) => {
    setEditingBudget(budget);
    setIsEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setEditingBudget(null);
    fetchBudgetVersions(); // Refresh list after edit
  };

  useEffect(() => {
    fetchBudgetVersions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOrgId]); // Re-fetch when org changes

  // Add handlers for create, update, delete later

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Budget Version Management
          </CardTitle>
          <div className="flex items-center space-x-2">
            {/* Use BudgetDialog for Creating */}
            <BudgetDialog onSuccess={fetchBudgetVersions}>
              <Button>Create New Budget</Button>
            </BudgetDialog>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Manage your financial budget versions. View, create, and manage different budget sets for planning and analysis.
          </p>
          <div>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error Loading Budgets</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : budgetVersions.length === 0 ? (
              <p className="text-center text-muted-foreground">No budget versions found. Create one to get started.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead> {/* Assuming a status field */}
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgetVersions.map((version) => (
                    <TableRow key={version.id}> {/* Assuming 'id' is the key */}
                      <TableCell className="font-medium">{version.name}</TableCell>
                      <TableCell>{version.description || "N/A"}</TableCell>
                      <TableCell>{version.status || "Draft"}</TableCell> {/* Placeholder */}
                      <TableCell>{version.created_at ? new Date(version.created_at).toLocaleString() : "N/A"}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="mr-2"
                          onClick={() => handleEditClick(version)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog onOpenChange={(open) => !open && setDeleteTargetId(null)}>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteClick(version.id)} // Pass ID
                              disabled={isDeleting && deleteTargetId === version.id}
                            >
                              {isDeleting && deleteTargetId === version.id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          {deleteTargetId === version.id && ( // Only render content if this is the target
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the budget version
                                  "<strong>{budgetVersions.find(v => v.id === deleteTargetId)?.name || 'this budget'}</strong>".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteConfirm} disabled={isDeleting}>
                                  {isDeleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : "Delete"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          )}
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Add Create/Edit Dialog components here later */}
    </div>
  );
};

export default BudgetManagementPage;
