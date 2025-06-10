import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { BusinessEntityBase } from "types"; // Import BusinessEntityBase for parent selection

// Define the schema based on BusinessEntityCreateRequest properties
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  abn: z.string().optional(), // Assuming optional based on previous update logic
  business_structure: z.enum(["Sole Trader", "Partnership", "Company", "Trust"]),
  registered_for_gst: z.boolean().default(false),
  parent_entity_id: z.string().optional().nullable(), // Allow optional parent selection
  // Add other fields as needed based on BusinessEntityCreateRequest
  // Example:
  // gst_frequency: z.enum(["Monthly", "Quarterly", "Annually"]).optional(),
  // tfn: z.string().optional(),
});

// Define the type for the form data
export type EntityFormData = z.infer<typeof formSchema>;

interface Props {
  onSubmit: (values: EntityFormData) => void;
  onCancel: () => void;
  initialData?: Partial<BusinessEntityBase> | null; // Optional initial data for editing (not used here yet)
  potentialParents: BusinessEntityBase[]; // List of entities that can be parents
  isLoading?: boolean; // Optional loading state for submit button
}

export function EntityForm({ onSubmit, onCancel, initialData, potentialParents, isLoading = false }: Props) {
  const form = useForm<EntityFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      abn: initialData?.abn || "",
      business_structure: initialData?.business_structure || "Company", // Default or from initialData
      registered_for_gst: initialData?.registered_for_gst || false,
      parent_entity_id: initialData?.parent_entity_id || null,
      // Set other defaults based on initialData or desired behavior
    },
  });

  // Handle form submission
  function handleFormSubmit(values: EntityFormData) {
    // Ensure parent_entity_id is null if the special "__none__" value is selected
    const submissionValues = {
        ...values,
        parent_entity_id: values.parent_entity_id === "__none__" ? null : values.parent_entity_id,
    };
    onSubmit(submissionValues);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Name Field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Entity Name</FormLabel>
              <FormControl>
                <Input placeholder="Acme Corporation" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ABN Field (Optional) */}
         <FormField
          control={form.control}
          name="abn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ABN (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="XX XXX XXX XXX" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Business Structure Field */}
        <FormField
          control={form.control}
          name="business_structure"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Structure</FormLabel>
               <Select onValueChange={field.onChange} defaultValue={field.value}>
                 <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a structure" />
                    </SelectTrigger>
                 </FormControl>
                 <SelectContent>
                    <SelectItem value="Sole Trader">Sole Trader</SelectItem>
                    <SelectItem value="Partnership">Partnership</SelectItem>
                    <SelectItem value="Company">Company</SelectItem>
                    <SelectItem value="Trust">Trust</SelectItem>
                 </SelectContent>
                </Select>
              <FormMessage />
            </FormItem>
          )}
        />

         {/* Parent Entity Field (Optional) */}
         <FormField
          control={form.control}
          name="parent_entity_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent Entity (Optional)</FormLabel>
               <Select
                    onValueChange={field.onChange}
                    // Handle null/undefined value for the "No Parent" option
                    value={field.value ?? "__none__"}
                >
                 <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a parent entity" />
                    </SelectTrigger>
                 </FormControl>
                 <SelectContent>
                    <SelectItem value="__none__">-- No Parent --</SelectItem> {/* Use non-empty value */}
                    {potentialParents.map(parent => (
                        // Prevent selecting itself as parent if initialData is provided (for editing)
                        initialData?.id !== parent.id && (
                            <SelectItem key={parent.id} value={parent.id}>
                                {parent.name}
                            </SelectItem>
                        )
                    ))}
                 </SelectContent>
                </Select>
                <FormDescription>
                    Select the entity that directly owns this new entity, if any.
                </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Registered for GST Field */}
        <FormField
          control={form.control}
          name="registered_for_gst"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Registered for GST</FormLabel>
                <FormDescription>
                  Is this entity registered for Goods and Services Tax?
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Add other form fields here based on schema */}

        <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : (initialData ? "Save Changes" : "Create Entity")}
            </Button>
        </div>
      </form>
    </Form>
  );
}

export default EntityForm;
