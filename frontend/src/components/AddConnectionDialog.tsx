import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
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
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react"; // Import spinner icon
import { ConnectionCreateInput, ApiKeyCredentialsInput } from "types"; // Added relevant types
import brain from "brain";
import { toast } from "sonner";


interface AddConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnectionAdded: () => void; // Callback to refresh list
}

// Define source types
const sourceTypes = ["Xero", "MYOB", "Sage"] as const; // Use const assertion
type SourceType = (typeof sourceTypes)[number]; // Infer type from array

// Form schema using Zod
const formSchema = z.object({
  source_type: z.enum(sourceTypes, {
    required_error: "Please select a data source type.",
  }),
  apiKey: z.string().optional(), // API Key field (optional by default)
})
.refine(
  (data) => {
    // Make apiKey required if source_type is 'Sage'
    if (data.source_type === "Sage") {
      return !!data.apiKey && data.apiKey.trim() !== "";
    }
    // No extra validation needed for other types for now
    return true;
  },
  {
    // Error message if refinement fails
    message: "API Key is required for Sage connections.",
    // Path to the field this error message applies to
    path: ["apiKey"],
  }
);


const AddConnectionDialog: React.FC<AddConnectionDialogProps> = ({
  open,
  onOpenChange,
  onConnectionAdded,
}) => {
  // Initialize the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      source_type: undefined,
      apiKey: "", // Default apiKey to empty string
    },
  });

  // Watch the selected source type to conditionally render fields
  const selectedSourceType = form.watch("source_type");

  // Add state for submission loading
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Placeholder for form submission logic
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("Form submitted", values);
    setIsSubmitting(true);

    let credentials: ApiKeyCredentialsInput | {} = {}; // Use {} for non-API key types for now
    if (values.source_type === "Sage" && values.apiKey) {
      credentials = { type: "api_key", api_key: values.apiKey };
    } else if (values.source_type === "Xero" || values.source_type === "MYOB") {
      // Placeholder for OAuth - send empty credentials for now
      // The actual OAuth flow will handle credential creation/storage
      credentials = { type: "oauth2" }; // Indicate the expected type
    }

    const payload: ConnectionCreateInput = {
      organization_id: "default", // TODO: Get from organization context
      source_type: values.source_type,
      credential_type: values.credential_type as "oauth2" | "api_key" | "basic_auth",
      credentials: credentials as any, // Cast needed as credentials union type validation is complex
    };

    try {
      const response = await brain.add_connection(payload);
      if (response.ok) {
        toast.success("Connection added successfully!");
        onConnectionAdded(); // Refresh the list in the parent component
        onOpenChange(false); // Close the dialog
        form.reset(); // Reset form fields
      } else {
        const errorData = await response.json() as any;
        const errorMessage = errorData?.detail || errorData?.message || `Failed to add connection. Status: ${response.status}`;
        console.error("Error adding connection:", errorMessage, errorData);
        toast.error(errorMessage);
      }
    } catch (err) {
      console.error("Network or parsing error adding connection:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown network error occurred.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

const isLoading = false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Data Connection</DialogTitle>
          <DialogDescription>
            Connect to a new data source like Xero, MYOB, or Sage.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="add-connection-form" // Add an id for the footer button association
            onSubmit={form.handleSubmit(onSubmit)} // Connect submit handler
            className="space-y-4 py-2 pb-4"
          >
            <FormField
              control={form.control}
              name="source_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data Source</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a data source" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sourceTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Conditional fields based on selectedSourceType */}
            {selectedSourceType === "Sage" && (
              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your Sage API Key" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {(selectedSourceType === "Xero" || selectedSourceType === "MYOB") && (
               <div className="text-sm p-4 border rounded-md bg-muted text-muted-foreground">
                 <p className="font-medium mb-2">OAuth Connection</p>
                 <p className="mb-4">Connection for {selectedSourceType} uses OAuth2.</p>
                 <Button type="button" disabled className="w-full">
                    Connect via {selectedSourceType} (Coming Soon)
                 </Button>
                 <p className="text-xs mt-2">You will be redirected to {selectedSourceType} to authorize the connection.</p>
              </div>
            )}
          </form>
        </Form>
        <DialogFooter>
          <Button
            type="submit"
            form="add-connection-form"
            disabled={isSubmitting}
          >
            {isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isSubmitting ? "Connecting..." : "Add Connection"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddConnectionDialog;
