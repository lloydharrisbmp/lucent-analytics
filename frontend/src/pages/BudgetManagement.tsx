import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from 'components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, Trash2, PlusCircle, Loader2, Lock, CheckCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from 'sonner';
import brain from 'brain';
import { API_URL, auth } from "app"; // Import API_URL and auth
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
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
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BudgetVersionMetadata } from 'types';
// Removed useOrg import
import { useOrganizationStore } from 'utils/organizationStore';

export default function BudgetManagement() {
  // Use only the store for organization ID and loading state related to it
  const { currentOrgId, isLoading: isLoadingOrg } = useOrganizationStore(state => ({ 
    currentOrgId: state.currentOrganizationId, 
    isLoading: state.isLoading 
  })); 
  const [versions, setVersions] = useState<BudgetVersionMetadata[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Loading state specifically for budget versions
  const [error, setError] = useState<string | null>(null);

  // State for Create Dialog
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newVersionName, setNewVersionName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // State for Delete Dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [versionToDelete, setVersionToDelete] = useState<BudgetVersionMetadata | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchVersions = useCallback(async () => {
    // Now checks isLoadingOrg from the store as well
    if (isLoadingOrg) {
        setLoading(true); // Show loading skeleton if org is loading
        setError(null);
        setVersions([]);
        return;
    }
    if (!currentOrgId) {
      setVersions([]);
      setLoading(false);
      setError("Please select an organization.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await brain.list_budget_versions({ organizationId: currentOrgId });
      if (response.ok) {
        const data = await response.json();
        setVersions(data);
      } else {
        const errorText = await response.text();
        setError(`Failed to fetch budget versions: ${errorText}`);
        setVersions([]);
        toast.error("Failed to load budget versions.");
      }
    } catch (err: any) {
      console.error("Error fetching budget versions:", err);
      setError(err.message || "An unexpected error occurred.");
      setVersions([]);
      toast.error("Error fetching budget versions", { description: err.message });
    } finally {
      setLoading(false);
    }
  // Add isLoadingOrg to dependency array
  }, [currentOrgId, isLoadingOrg]); 

  useEffect(() => {
    // fetchVersions depends on currentOrgId and isLoadingOrg from the store now
    fetchVersions();
  }, [fetchVersions]);

  const renderTableContent = () => {
     // Use combined loading state: true if org is loading OR versions are loading
    if (isLoadingOrg || loading) {
      return (
        <>
          {[...Array(3)].map((_, i) => (
            <TableRow key={`skeleton-${i}`}>
              <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
              <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
              <TableCell className="text-right"><Skeleton className="h-8 w-[180px]" /></TableCell>
            </TableRow>
          ))}
        </>
      );
    }

    if (error && !versions.length) {
      return (
        <TableRow>
          <TableCell colSpan={3} className="text-center text-destructive">{error}</TableCell>
        </TableRow>
      );
    }

    if (!versions.length) {
      // If no error, but no versions and an org IS selected, show empty message
      const message = currentOrgId ? "No budget versions found for this organization." : "Please select an organization.";
      return (
        <TableRow>
          <TableCell colSpan={3} className="text-center text-muted-foreground">{message}</TableCell>
        </TableRow>
      );
    }

    return versions.map((version) => (
      <TableRow key={version.version_id}>
        <TableCell className="font-medium">{version.name}</TableCell>
        <TableCell>{new Date(version.created_at).toLocaleString()}</TableCell>
        <TableCell>-</TableCell>{/* Placeholder for Status */}
        <TableCell className="text-right flex justify-end space-x-2">
           {/* Placeholder buttons for future functionality */}
           {/* Tooltip for View/Edit */}
           <TooltipProvider>
             <Tooltip>
               <TooltipTrigger asChild>
                 {/* Wrap the disabled button in a span for TooltipTrigger */}
                 <span tabIndex={0}> 
                   <Button variant="outline" size="icon" disabled style={{ pointerEvents: "none" }}>
                     <Eye className="h-4 w-4" />
                   </Button>
                 </span>
               </TooltipTrigger>
               <TooltipContent>
                 <p>View/Edit (Coming Soon)</p>
               </TooltipContent>
             </Tooltip>
           </TooltipProvider>

           {/* Tooltip for Lock */}
           <TooltipProvider>
             <Tooltip>
               <TooltipTrigger asChild>
                 <span tabIndex={0}>
                   <Button variant="outline" size="icon" disabled style={{ pointerEvents: "none" }}>
                     <Lock className="h-4 w-4" />
                   </Button>
                 </span>
               </TooltipTrigger>
               <TooltipContent>
                 <p>Lock Version (Requires Backend Update)</p>
               </TooltipContent>
             </Tooltip>
           </TooltipProvider>

           {/* Tooltip for Set Active */}
           <TooltipProvider>
             <Tooltip>
               <TooltipTrigger asChild>
                 <span tabIndex={0}>
                   <Button variant="outline" size="icon" disabled style={{ pointerEvents: "none" }}>
                     <CheckCircle className="h-4 w-4" />
                   </Button>
                 </span>
               </TooltipTrigger>
               <TooltipContent>
                 <p>Set Active (Requires Backend Update)</p>
               </TooltipContent>
             </Tooltip>
           </TooltipProvider>

          {/* Delete Button - Controlled */}
          <Button
            variant="destructive"
            size="icon"
            onClick={() => {
                setVersionToDelete(version);
                setIsDeleteDialogOpen(true);
            }}
            disabled={isDeleting && versionToDelete?.version_id === version.version_id}
          >
            {isDeleting && versionToDelete?.version_id === version.version_id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4" />}
          </Button>
        </TableCell>
      </TableRow>
    ));
  };

  const handleCreateVersion = async () => {
     // Rely on currentOrgId from the store
    if (!newVersionName || !currentOrgId) { 
      console.error("Cannot create version: Missing name or organization ID.", {
        name: newVersionName,
        orgId: currentOrgId, // Use orgId from store
      });
      toast.error("Cannot create budget version", {
        description: "Version name cannot be empty and an organization must be selected.",
      });
      return;
    }

    setIsCreating(true);
    const toastId = toast.loading("Creating budget version...");

    console.log("Attempting to create budget version for org:", currentOrgId); // Log ID from store

    try {
      const token = await auth.getAuthToken();
      if (!token) {
        throw new Error("Authentication token not found.");
      }

      // Use currentOrgId directly from store
      const url = `${API_URL}/budgets/${currentOrgId}/versions`; 

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include', 
        body: JSON.stringify({ name: newVersionName, items: [] }) // Assuming empty items for now
      });

      if (response.ok) {
          console.log(`Create budget version successful with status: ${response.status}`);
          let createdName = newVersionName;
          try {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                 const data: BudgetVersionMetadata = await response.json();
                 createdName = data.name; 
            }
          } catch (jsonError) {
            console.warn("Could not parse JSON from create budget version response", jsonError);
          }

          toast.success(`Budget version \"${createdName}\" created successfully.`, { id: toastId });
          setNewVersionName("");
          setIsCreateDialogOpen(false);
          fetchVersions(); 
      } else {
        let errorDetail = "Failed to create budget version";
        try {
            const errorData = await response.json();
            errorDetail = errorData.detail || errorDetail;
        } catch (jsonError) {
            errorDetail = response.statusText || errorDetail;
        }
        throw new Error(errorDetail);
      }
    } catch (err: any) {
      console.error("Error creating budget version:", err);
      toast.error("Failed to create budget version", { id: toastId, description: err.message });
    } finally {
      setIsCreating(false);
    }
  };
  
  const handleDeleteVersion = async () => {
    if (!versionToDelete || !currentOrgId) {
        toast.error("Cannot delete: Missing version or organization context.");
        return;
    }

    setIsDeleting(true);
    const toastId = toast.loading(`Deleting budget version \"${versionToDelete.name}\"...`);

    try {
      // --- Frontend Pre-Delete LOGS --- 
      console.log(`handleDeleteVersion: Preparing to call API. Org ID: ${currentOrgId}, Version ID: ${versionToDelete.version_id}`);
      console.log(`handleDeleteVersion: Version object:`, versionToDelete);
      // --- END LOGS ---

      const response = await brain.delete_budget_version({ 
        organization_id: currentOrgId, 
        version_id: versionToDelete.version_id
      });

      if (response.ok) {
        console.log(`Delete budget version successful with status: ${response.status}`);
        toast.success(`Budget version \"${versionToDelete.name}\" deleted successfully.`, { id: toastId });
        setVersionToDelete(null); 
        setIsDeleteDialogOpen(false);
        fetchVersions(); 
      } else {
         let errorDetail = "Failed to delete budget version";
        try {
            const errorData = await response.json();
            errorDetail = errorData.detail || errorDetail;
        } catch (jsonError) {
            errorDetail = response.statusText || errorDetail;
        }
        throw new Error(errorDetail);
      }
    } catch (err: any) {
      console.error("Error deleting budget version:", err);
      toast.error("Failed to delete budget version", { id: toastId, description: err.message });
    } finally {
      setIsDeleting(false);
    }
  };


  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Budget Management</h1>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              {/* Updated disabled logic: Use isLoadingOrg and currentOrgId from store */}
              <Button disabled={isLoadingOrg || loading || isDeleting || !currentOrgId} onClick={() => setNewVersionName("")}> 
                <PlusCircle className="mr-2 h-4 w-4" /> Create New Version
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Budget Version</DialogTitle>
                <DialogDescription>
                  Enter a name for the new budget version. You can copy data from another version later.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newVersionName}
                    onChange={(e) => setNewVersionName(e.target.value)}
                    className="col-span-3"
                    placeholder="E.g., Q3 Forecast, 2025 Final"
                    disabled={isCreating}
                    autoFocus
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                   <Button variant="outline" disabled={isCreating}>Cancel</Button>
                </DialogClose>
                 {/* Disable create button if name is empty, creating is in progress, or no org selected */}
                <Button type="submit" onClick={handleCreateVersion} disabled={!newVersionName || isCreating || !currentOrgId}>
                  {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
                  {isCreating ? 'Creating...' : 'Create Version'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        </div>
        <Card>
          <CardHeader>
            <CardTitle>Budget Versions</CardTitle>
            <CardDescription>
              Manage your organization's budget versions.
              {/* Display specific error if loading failed but versions were previously loaded */}
              {error && versions.length > 0 && <span className="text-destructive ml-2"> (Error refreshing: {error})</span>} 
              {/* Show loading indicator text if organization is still loading */} 
              {isLoadingOrg && <span className="text-muted-foreground ml-2"> (Loading organization...)</span>}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Version Name</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {renderTableContent()}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog - Controlled */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => { 
          // Only clear versionToDelete when closing manually (Cancel or X)
          if (!open && !isDeleting) { 
             setVersionToDelete(null); 
          }
          setIsDeleteDialogOpen(open); 
        }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the budget version 
                <strong className="px-1">{versionToDelete?.name}</strong>
                 and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
               {/* Ensure Cancel button clears state */}
              <AlertDialogCancel disabled={isDeleting} onClick={() => { setVersionToDelete(null); setIsDeleteDialogOpen(false); }}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteVersion} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                 {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                 {isDeleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </DashboardLayout>
  );
}
