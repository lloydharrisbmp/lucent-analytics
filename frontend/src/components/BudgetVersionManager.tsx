import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import brain from "brain";
// Assuming BudgetVersionMetadata is the correct type from types.ts based on API inspection
// Renaming import for clarity within this component
import { BudgetVersionMetadata as BudgetVersion } from "types"; 
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, PlusCircle, MoreHorizontal, Trash2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


interface Props {
  organizationId: string; // The ID of the organization whose budgets are being managed
}

export const BudgetVersionManager: React.FC<Props> = ({ organizationId }) => {
  // --- State ---
  const [versions, setVersions] = useState<BudgetVersion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [versionToDelete, setVersionToDelete] = useState<BudgetVersion | null>(null);

  // --- Form Schema (for Create) ---
  const formSchema = z.object({
    name: z.string().min(1, { message: "Version name cannot be empty." }).max(100, { message: "Name too long (max 100 chars)." }),
  });

  // --- React Hook Form (for Create) ---
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "" },
  });

  // --- Data Fetching ---
  const fetchVersions = useCallback(async () => {
    if (!organizationId) {
      setVersions([]);
      setError("Organization ID is required.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await brain.list_budget_versions({ organization_id: organizationId });
      
      if (response.ok) {
        // Assuming list_budget_versions returns BudgetVersionMetadata[] directly
        const data: BudgetVersion[] = await response.json();
        // Ensure data is an array; default to empty if not.
        setVersions(Array.isArray(data) ? data : []);
      } else {
        let errorText = `API returned status ${response.status}`;
        try {
            const errorData = await response.json();
            errorText = errorData?.detail || errorText;
        } catch (e) { /* Ignore parsing error if body is not JSON */ }
        console.error("Failed to fetch budget versions:", errorText);
        setVersions([]);
        setError(`Failed to fetch budget versions: ${errorText}`);
        toast.error("Failed to load budget versions.", { description: errorText });
      }

    } catch (err: any) {
      console.error("Failed to fetch budget versions (catch):", err);
      setError("Failed to load budget versions. Please try again.");
      toast.error("Failed to load budget versions.", { description: err.message || "Network error" });
      setVersions([]); 
    } finally {
      setIsLoading(false);
    }
  }, [organizationId]);

  // --- Initial Fetch Effect ---
  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]); // Rerun if organizationId changes via fetchVersions dependency

  // --- Create Handler ---
  const handleCreateVersion = async (values: z.infer<typeof formSchema>) => {
    if (!organizationId) return;
    setIsCreating(true);
    try {
      const response = await brain.create_budget_version(
        { organization_id: organizationId }, 
        { name: values.name, items: [] } // Send empty items array as required by API
      );

      if (response.ok) {
        toast.success(`Budget version "${values.name}" created successfully.`);
        form.reset(); 
        setIsCreateDialogOpen(false); 
        fetchVersions(); // Refresh the list
      } else {
        let errorDetail = "Unknown error creating version.";
        try {
          const errorData = await response.json();
          errorDetail = errorData?.detail || JSON.stringify(errorData);
        } catch (parseError) {
          errorDetail = `Server returned status ${response.status}. Failed to parse error details.`;
        }
        toast.error("Failed to create budget version", { description: errorDetail });
        console.error("API Error creating version:", errorDetail);
      }
    } catch (err: any) {
      console.error("Failed to create budget version (catch):", err);
      toast.error("An unexpected error occurred", {
        description: err.message || "Could not connect to the server.",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // --- Delete Handler ---
  const handleDeleteVersion = async () => {
    if (!versionToDelete || !organizationId) return;
    setIsDeleting(true);
    try {
      const response = await brain.delete_budget_version({ 
        organization_id: organizationId,
        version_id: versionToDelete.version_id
      });
      
      if (response.ok || response.status === 204) { // 204 No Content is also success
        toast.success(`Budget version "${versionToDelete.name}" deleted successfully.`);
        // versionToDelete is cleared in finally block
        fetchVersions(); // Refresh the list
      } else {
        let errorDetail = "Unknown error deleting version.";
        try {
          const errorData = await response.json();
          errorDetail = errorData?.detail || JSON.stringify(errorData);
        } catch (parseError) {
           errorDetail = `Server returned status ${response.status}. Failed to parse error details.`;
        }
        toast.error("Failed to delete budget version", { description: errorDetail });
        console.error("API Error deleting version:", errorDetail);
      }
    } catch (err: any) {
       console.error("Failed to delete budget version (catch):", err);
       toast.error("An unexpected error occurred during deletion", {
         description: err.message || "Could not connect to the server.",
       });
    } finally {
      setIsDeleting(false);
      // Ensure versionToDelete is cleared regardless of AlertDialog behavior or errors
      setVersionToDelete(null); 
    }
  };

  // --- Format Date Helper ---
  const formatDate = (dateString: string | Date): string => {
    try {
      // Attempt to handle potential non-standard date formats if necessary
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
          return "Invalid Date";
      }
      return date.toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric', 
        hour: '2-digit', minute: '2-digit', hour12: true // Use hour12 for AM/PM
      });
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return "Invalid Date";
    }
  };

  // --- Render ---
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">Budget Version Management</CardTitle>
        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Version
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Budget Version</DialogTitle>
              <DialogDescription>
                Enter a name for the new budget version. You can add budget items later.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreateVersion)} className="space-y-4 py-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Version Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 2024 Initial Budget" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline" disabled={isCreating}>
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Version
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading versions...</span>
          </div>
        )}
        {/* Error State */}
        {error && !isLoading && (
          <div className="text-red-600 text-center py-10 px-4 border border-dashed border-red-300 rounded-md">
            <p className="font-semibold">Error Loading Data</p>
            <p className="text-sm">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchVersions} className="mt-4">
                Try Again
            </Button>
          </div>
        )}
        {/* Table Display */}
        {!isLoading && !error && (
          <div>
            {versions.length === 0 ? (
              <p className="text-center text-gray-500 py-10">No budget versions found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Name</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {versions.map((version) => (
                    <TableRow key={version.version_id}>
                      <TableCell className="font-medium">{version.name}</TableCell>
                      <TableCell>{formatDate(version.created_at)}</TableCell>
                      {/* Actions Cell */}
                      <TableCell className="text-right">
                         {/* Wrap AlertDialog around Dropdown to manage state */}
                         <AlertDialog onOpenChange={isOpen => !isOpen && setVersionToDelete(null)}> 
                            <DropdownMenu>
                               <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                               </DropdownMenuTrigger>
                               <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  {/* Placeholder actions - enable when backend supports */}
                                  <DropdownMenuItem disabled>Edit Name</DropdownMenuItem>
                                  <DropdownMenuItem disabled>Set Active</DropdownMenuItem>
                                  <DropdownMenuItem disabled>Lock/Unlock</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {/* Delete Action */}
                                  <AlertDialogTrigger asChild>
                                     <DropdownMenuItem 
                                        className="text-red-600 focus:text-red-700 focus:bg-red-50" 
                                        onSelect={(e) => { 
                                            e.preventDefault(); // Keep dropdown open until dialog confirms/cancels
                                            setVersionToDelete(version); // Set the target version for the dialog
                                        }}
                                      >
                                         <Trash2 className="mr-2 h-4 w-4" />
                                         Delete Version
                                     </DropdownMenuItem>
                                  </AlertDialogTrigger>
                               </DropdownMenuContent>
                            </DropdownMenu>
                            
                            {/* Delete Confirmation Dialog Content */}
                            <AlertDialogContent>
                               <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the budget version:
                                    <br />
                                    <strong className="break-all">{versionToDelete?.name}</strong>
                                    <br />
                                    <span className="text-xs text-muted-foreground">ID: {versionToDelete?.version_id}</span>
                                  </AlertDialogDescription>
                               </AlertDialogHeader>
                               <AlertDialogFooter>
                                  <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                     onClick={handleDeleteVersion} 
                                     disabled={isDeleting} 
                                     className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
                                   >
                                     {isDeleting ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> 
                                     ) : "Delete"}
                                  </AlertDialogAction>
                               </AlertDialogFooter>
                            </AlertDialogContent>
                         </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        )}
      </CardContent>
      {/* Optional Footer */}
      {/* <CardFooter>
        <p className="text-xs text-muted-foreground">Manage your budget versions here.</p>
      </CardFooter> */}
    </Card>
  );
};
