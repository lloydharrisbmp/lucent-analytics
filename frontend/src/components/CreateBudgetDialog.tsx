import React, { useState } from "react";
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
import { useOrganizations } from "app/organizations";

// Validation Schema
const formSchema = z.object({
  name: z.string().min(1, "Budget name is required"),
  description: z.string().optional(),
});

type BudgetFormValues = z.infer<typeof formSchema>;

interface Props {
  children: React.ReactNode; // To wrap the trigger button
  onSuccess: () => void; // Callback after successful creation
}

export const CreateBudgetDialog = ({ children, onSuccess }: Props) => {
  const { currentOrgId } = useOrganizations();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (values: BudgetFormValues) => {
    if (!currentOrgId) {
      toast.error("No organization selected.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await brain.create_budget_version(
        { organization_id: currentOrgId },
        {
          name: values.name,
          description: values.description || null, // Send null if empty
          // Add other necessary fields if the API requires them, e.g., status
          status: "Draft", // Example default status
        }
      );

      if (response.ok) {
        toast.success("Budget version created successfully!");
        form.reset();
        onSuccess(); // Call the success callback (e.g., refetch list)
        setIsOpen(false);
      } else {
        const errorText = await response.text();
        console.error("Failed to create budget version:", response.status, errorText);
        toast.error(`Failed to create budget version: ${errorText || response.statusText}`);
      }
    } catch (error) {
      console.error("Error creating budget version:", error);
      toast.error("An unexpected error occurred while creating the budget version.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Budget Version</DialogTitle>
          <DialogDescription>
            Enter the details for your new budget version.
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
                    <Textarea placeholder="Optional: Add a brief description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Budget"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
