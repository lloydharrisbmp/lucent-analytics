import React, { useState, useEffect } from "react";
import { useUserGuardContext } from "app";
import { useEntityStore } from "utils/entityStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogFooter, 
  DialogClose
} from "@/components/ui/dialog";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { EntityForm, EntityFormData } from "components/EntityForm";
import { Entity } from "utils/entityTypes"; // Import Entity type
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const EntityManagement = () => {
  const { user } = useUserGuardContext();
  const { 
    entities, 
    isLoading,
    error, 
    fetchEntities, 
    addEntity, 
    updateEntity, 
    deleteEntity 
  } = useEntityStore();

  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [formSubmissionLoading, setFormSubmissionLoading] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      console.log("Fetching entities for organization:", user.uid); // Debug log
      fetchEntities(user.uid);
    } else {
      console.warn("User ID not available for fetching entities.");
    }
  }, [user, fetchEntities]);

  // Map entities for the parent dropdown
  const potentialParents = entities.map(e => ({ id: e.id, name: e.name }));

  const handleCreateSubmit = async (data: EntityFormData) => {
    if (!user?.uid) {
      toast.error("Authentication error: User ID not found.");
      return;
    }
    setFormSubmissionLoading(true);
    try {
      await addEntity(user.uid, data);
      toast.success(`Entity "${data.name}" created successfully.`);
      setCreateDialogOpen(false);
    } catch (err) {
      console.error("Error creating entity:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      toast.error(`Failed to create entity: ${errorMessage}`);
    } finally {
      setFormSubmissionLoading(false);
    }
  };

  const handleEditSubmit = async (data: EntityFormData) => {
    if (!selectedEntity || !user?.uid) {
       toast.error("Error: Entity data or User ID is missing.");
       return;
    }
    setFormSubmissionLoading(true);
    try {
      await updateEntity(user.uid, selectedEntity.id, data);
      toast.success(`Entity "${data.name}" updated successfully.`);
      setEditDialogOpen(false);
      setSelectedEntity(null); // Clear selection
    } catch (err) {
       console.error("Error updating entity:", err);
       const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
       toast.error(`Failed to update entity: ${errorMessage}`);
    } finally {
       setFormSubmissionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedEntity || !user?.uid) {
      toast.error("Error: Entity data or User ID is missing.");
      return;
    }
    try {
      await deleteEntity(user.uid, selectedEntity.id);
      toast.success(`Entity "${selectedEntity.name}" deleted successfully.`);
      setDeleteDialogOpen(false);
      setSelectedEntity(null); // Clear selection
    } catch (err) {
      console.error("Error deleting entity:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
       toast.error(`Failed to delete entity: ${errorMessage}`);
    }
  };

  const openEditDialog = (entity: Entity) => {
    setSelectedEntity(entity);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (entity: Entity) => {
    setSelectedEntity(entity);
    setDeleteDialogOpen(true);
  };

  if (isLoading && entities.length === 0) {
    return <div>Loading entities...</div>; // Initial loading state
  }

  if (error) {
    return <div className="text-red-600">Error loading entities: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
             <CardTitle>Entity Management</CardTitle>
             <CardDescription>
                Define and manage the business entities within your organization.
             </CardDescription>
          </div>
           {/* --- Create Entity Dialog Trigger --- */}
           <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>Create Entity</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Entity</DialogTitle>
                <DialogDescription>
                  Fill in the details for the new business entity.
                </DialogDescription>
              </DialogHeader>
              <EntityForm 
                onSubmit={handleCreateSubmit} 
                onCancel={() => setCreateDialogOpen(false)} 
                isLoading={formSubmissionLoading}
                potentialParents={potentialParents} // Pass potential parents
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isLoading && entities.length > 0 && (
             <div className="text-center text-gray-500 py-4">Refreshing entity list...</div>
           )} 
          {entities.length === 0 && !isLoading ? (
            <div className="text-center text-gray-500 py-10">
              No entities found. Get started by creating one.
            </div>
          ) : (
             <Table>
               <TableHeader>
                 <TableRow>
                   <TableHead>Name</TableHead>
                   <TableHead className="hidden md:table-cell">Type</TableHead>
                   <TableHead className="hidden sm:table-cell">Base Currency</TableHead>
                   <TableHead className="hidden lg:table-cell">Country</TableHead>
                   <TableHead><span className="sr-only">Actions</span></TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {entities.map((entity) => (
                   <TableRow key={entity.id}>
                     <TableCell className="font-medium">{entity.name}</TableCell>
                     <TableCell className="hidden md:table-cell">{entity.entityType}</TableCell>
                     <TableCell className="hidden sm:table-cell">{entity.baseCurrency}</TableCell>
                     <TableCell className="hidden lg:table-cell">{entity.country}</TableCell>
                     <TableCell className="text-right">
                      {/* --- Actions Dropdown --- */}
                       <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                           <Button variant="ghost" className="h-8 w-8 p-0">
                             <span className="sr-only">Open menu</span>
                             <MoreHorizontal className="h-4 w-4" />
                           </Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end">
                           <DropdownMenuItem onClick={() => openEditDialog(entity)}>
                             <Pencil className="mr-2 h-4 w-4" />
                             Edit
                           </DropdownMenuItem>
                           <DropdownMenuItem onClick={() => openDeleteDialog(entity)} className="text-red-600">
                             <Trash2 className="mr-2 h-4 w-4" />
                             Delete
                           </DropdownMenuItem>
                         </DropdownMenuContent>
                       </DropdownMenu>
                     </TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
           )}
        </CardContent>
      </Card>

     {/* --- Edit Entity Dialog --- */}
     <Dialog open={isEditDialogOpen} onOpenChange={(open) => { if (!open) setSelectedEntity(null); setEditDialogOpen(open); }}>
       <DialogContent className="sm:max-w-[600px]">
         <DialogHeader>
           <DialogTitle>Edit Entity: {selectedEntity?.name}</DialogTitle>
           <DialogDescription>
             Update the details for this business entity.
           </DialogDescription>
         </DialogHeader>
         {selectedEntity && (
           <EntityForm 
             onSubmit={handleEditSubmit} 
             onCancel={() => setEditDialogOpen(false)} 
             initialData={selectedEntity}
             isLoading={formSubmissionLoading}
             potentialParents={potentialParents} // Pass potential parents
           />
         )}
       </DialogContent>
     </Dialog>

      {/* --- Delete Confirmation Dialog --- */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => { if (!open) setSelectedEntity(null); setDeleteDialogOpen(open); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the entity 
              <span className="font-semibold">{selectedEntity?.name}</span>.
              {/* TODO: Add warning about child entities or relationships if applicable later */}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

