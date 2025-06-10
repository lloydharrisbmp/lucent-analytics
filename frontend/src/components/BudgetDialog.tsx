import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import brain from "brain";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useOrganizationStore } from "utils/organizationStore";
import { BudgetVersion } from "types"; // Assuming type exists

// Validation Schema
const formSchema = z.object({
  name: z.string().min(1, "Budget name is required"),
  description: z.string().optional(),
  status: z.string().optional(), // Assuming status might be editable
});

type BudgetFormValues = z.infer<typeof formSchema>;

interface Props {
  children?: React.ReactNode; // Trigger can be optional if controlled externally
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  budgetVersionToEdit?: BudgetVersion | null; // Budget to edit
  onSuccess: () => void; // Callback after successful creation/update
}

export const BudgetDialog = ({
  children,
  open,
  onOpenChange,
  budgetVersionToEdit,
  onSuccess,
}: Props) => {
  const { currentOrganizationId: currentOrgId } = useOrganizationStore(state => ({ currentOrganizationId: state.currentOrganizationId })); // Get only the ID
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!budgetVersionToEdit;

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "Draft", // Default status for new
    },
  });

  // Pre-fill form if in edit mode
  useEffect(() => {
    if (isEditMode && budgetVersionToEdit) {
      form.reset({
        name: budgetVersionToEdit.name,
        description: budgetVersionToEdit.description || "",
        status: budgetVersionToEdit.status || "Draft",
      });
    } else {
      // Reset for create mode if needed (e.g., if dialog is reused)
      form.reset({
        name: "",
        description: "",
        status: "Draft",
      });
    }
  }, [budgetVersionToEdit, isEditMode, form]);

  const onSubmit = async (values: BudgetFormValues) => {
    if (!currentOrgId) {
      toast.error("No organization selected.");
      return;
    }

    setIsSubmitting(true);
    try {
      let response;
      if (isEditMode && budgetVersionToEdit) {
        // Update existing budget version
        console.log(`Updating budget ${budgetVersionToEdit.id} for org ${currentOrgId}`);
        response = await brain.update_budget_version(
          {
            organization_id: currentOrgId,
            version_id: budgetVersionToEdit.id,
          },
          {
            name: values.name,
            description: values.description || null,
            status: values.status || "Draft", // Ensure status is sent
            // Include other fields from BudgetVersion if they are needed
          }
        );
      } else {
        // Create new budget version
        console.log(`Creating new budget for org ${currentOrgId}`);
        response = await brain.create_budget_version(
          { organization_id: currentOrgId },
          {
            name: values.name,
            description: values.description || null,
            status: values.status || "Draft",
          }
        );
      }

      if (response.ok) {
        toast.success(`Budget version ${isEditMode ? 'updated' : 'created'} successfully!`);
        form.reset(); // Reset form after success
        onSuccess(); // Call the success callback
        onOpenChange?.(false); // Close the dialog if controlled
      } else {
        const errorText = await response.text();
        console.error(`Failed to ${isEditMode ? 'update' : 'create'} budget version:`, response.status, errorText);
        toast.error(`Failed to ${isEditMode ? 'update' : 'create'} budget version: ${errorText || response.statusText}`);
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} budget version:`, error);
      toast.error(`An unexpected error occurred while ${isEditMode ? 'updating' : 'creating'} the budget version.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine if dialog should be open (controlled or triggered)
  const dialogOpen = open !== undefined ? open : undefined;
  const handleOpenChange = (newOpenState: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpenState);
    } 
    // If not controlled (triggered by children) and closing, reset form
    if (!newOpenState && children) {
        form.reset(); 
    }
  };

  const dialogContent = (
     <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit" : "Create New"} Budget Version</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update the details for this budget version." : "Enter the details for your new budget version."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Q3 Forecast" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Optional: Add a brief description" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="status" // Assuming Status is a simple text input for now
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                     {/* Replace with Select if status has predefined values */}
                    <Input placeholder="e.g., Draft, Final" {...field} value={field.value || ''}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? "Saving..." : "Creating..."}
                  </>
                ) : (
                  isEditMode ? "Save Changes" : "Create Budget"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
  );

  // If trigger (children) is provided, wrap content in Dialog and DialogTrigger
  if (children) {
     return (
        <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>{children}</DialogTrigger>
          {dialogContent}
        </Dialog>
     );
  }

  // If no trigger, assume controlled dialog
  return (
     <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
       {dialogContent}
     </Dialog>
  );
};
