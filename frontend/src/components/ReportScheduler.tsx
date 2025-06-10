import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Calendar as CalendarIcon, Check, ChevronsUpDown, Mail, Bell } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import brain from "brain";

// Form schema
const formSchema = z.object({
  reportType: z.enum(["board", "management", "investor", "executive", "custom"]),
  reportName: z.string().min(1, { message: "Report name is required" }),
  description: z.string().optional(),
  frequency: z.enum(["daily", "weekly", "monthly", "quarterly", "annually", "once"]),
  startDate: z.date(),
  endDate: z.date().optional(),
  deliveryMethods: z.array(z.enum(["email", "notification", "download"])).min(1, {
    message: "Select at least one delivery method",
  }),
  recipients: z.array(z.object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    name: z.string().optional(),
  })).min(1, { message: "At least one recipient is required" }),
  formats: z.array(z.enum(["pdf", "pptx", "xlsx", "csv", "png"])).min(1, {
    message: "Select at least one format",
  }),
  includeFeedback: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

interface Recipient {
  email: string;
  name?: string;
}

interface ReportSchedulerProps {
  reportType?: "board" | "management" | "investor" | "executive" | "custom";
  reportName?: string;
  onScheduleCreated?: () => void;
  className?: string;
}

export function ReportScheduler({
  reportType = "board",
  reportName = "",
  onScheduleCreated,
  className = "",
}: ReportSchedulerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [newRecipient, setNewRecipient] = useState({ email: "", name: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form initialization
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reportType,
      reportName: reportName || `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
      description: "",
      frequency: "monthly",
      startDate: new Date(),
      deliveryMethods: ["email"],
      recipients: [],
      formats: ["pdf"],
      includeFeedback: true,
    },
  });

  // Watch form values
  const watchFrequency = form.watch("frequency");
  const watchDeliveryMethods = form.watch("deliveryMethods");

  // Add a recipient to the list
  const addRecipient = () => {
    if (!newRecipient.email) return;

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newRecipient.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Check for duplicates
    if (recipients.some(r => r.email === newRecipient.email)) {
      toast.error("This recipient is already added");
      return;
    }

    const recipientToAdd = {
      email: newRecipient.email,
      name: newRecipient.name || undefined,
    };

    setRecipients([...recipients, recipientToAdd]);
    setNewRecipient({ email: "", name: "" });
  };

  // Remove a recipient from the list
  const removeRecipient = (email: string) => {
    setRecipients(recipients.filter(r => r.email !== email));
  };

  // Form submission
  const onSubmit = async (data: FormData) => {
    // Make sure we have recipients
    if (recipients.length === 0) {
      toast.error("At least one recipient is required");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare feedback questions if enabled
      const feedbackQuestions = data.includeFeedback
        ? [
            { id: "overall_rating", question: "How would you rate the quality of this report?", questionType: "rating" },
            { id: "usefulness", question: "How useful was the information in this report?", questionType: "rating" },
            { id: "improvements", question: "What improvements would you suggest for future reports?", questionType: "text" },
          ]
        : undefined;

      // Call the API to schedule the report
      const response = await brain.schedule_report({
        reportType: data.reportType,
        reportName: data.reportName,
        description: data.description,
        frequency: data.frequency,
        startDate: data.startDate.toISOString().split('T')[0],
        endDate: data.endDate ? data.endDate.toISOString().split('T')[0] : undefined,
        deliveryMethods: data.deliveryMethods,
        recipients,
        formats: data.formats,
        parameters: {},
        feedbackQuestions,
      });

      const result = await response.json();

      toast.success("Report scheduled successfully", {
        description: `Next delivery: ${format(new Date(result.nextDeliveryDate), "MMMM d, yyyy")}`
      });

      // Close dialog and notify parent
      setDialogOpen(false);
      if (onScheduleCreated) {
        onScheduleCreated();
      }
      
      // Reset form
      form.reset();
      setRecipients([]);
    } catch (error) {
      console.error("Scheduling error:", error);
      toast.error("Failed to schedule report", {
        description: "There was an error scheduling your report. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          <CalendarIcon className="h-4 w-4 mr-2" />
          Schedule Delivery
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Schedule Report Delivery</DialogTitle>
          <DialogDescription>
            Set up automated delivery of this report to recipients on a schedule.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ScrollArea className="max-h-[70vh] pr-4">
              <div className="space-y-6 pr-4">
                {/* Report Details */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Report Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="reportType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Report Type</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            disabled={isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select report type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="board">Board Report</SelectItem>
                              <SelectItem value="management">Management Report</SelectItem>
                              <SelectItem value="investor">Investor Report</SelectItem>
                              <SelectItem value="executive">Executive Report</SelectItem>
                              <SelectItem value="custom">Custom Report</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="reportName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Report Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter report name" 
                              {...field} 
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter report description" 
                            {...field} 
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormDescription>
                          A brief description to help recipients understand the purpose of this report.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Schedule Settings */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Schedule Settings</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frequency</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            disabled={isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="quarterly">Quarterly</SelectItem>
                              <SelectItem value="annually">Annually</SelectItem>
                              <SelectItem value="once">One-time</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>
                            {watchFrequency === "once" ? "Delivery Date" : "Start Date"}
                          </FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                  disabled={isSubmitting}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date < new Date(new Date().setHours(0, 0, 0, 0))
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {watchFrequency !== "once" && (
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>End Date (Optional)</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                  disabled={isSubmitting}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>No end date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date < form.getValues("startDate")
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            Leave blank for indefinite scheduling
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {/* Delivery Methods */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Delivery Methods</h3>
                  <FormField
                    control={form.control}
                    name="deliveryMethods"
                    render={() => (
                      <FormItem>
                        <div className="space-y-2">
                          <FormField
                            control={form.control}
                            name="deliveryMethods"
                            render={({ field }) => {
                              return (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes("email")}
                                      onCheckedChange={(checked) => {
                                        const updatedValue = checked
                                          ? [...field.value, "email"]
                                          : field.value?.filter(
                                              (method) => method !== "email"
                                            );
                                        field.onChange(updatedValue);
                                      }}
                                      disabled={isSubmitting}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal flex items-center">
                                    <Mail className="h-4 w-4 mr-2" /> Email
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                          <FormField
                            control={form.control}
                            name="deliveryMethods"
                            render={({ field }) => {
                              return (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes("notification")}
                                      onCheckedChange={(checked) => {
                                        const updatedValue = checked
                                          ? [...field.value, "notification"]
                                          : field.value?.filter(
                                              (method) => method !== "notification"
                                            );
                                        field.onChange(updatedValue);
                                      }}
                                      disabled={isSubmitting}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal flex items-center">
                                    <Bell className="h-4 w-4 mr-2" /> In-app Notification
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Recipients */}
                {watchDeliveryMethods.includes("email") && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Recipients</h3>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-12 gap-3 mb-3">
                          <div className="col-span-5">
                            <Input
                              placeholder="Email address"
                              value={newRecipient.email}
                              onChange={(e) =>
                                setNewRecipient({ ...newRecipient, email: e.target.value })
                              }
                              disabled={isSubmitting}
                            />
                          </div>
                          <div className="col-span-5">
                            <Input
                              placeholder="Name (optional)"
                              value={newRecipient.name}
                              onChange={(e) =>
                                setNewRecipient({ ...newRecipient, name: e.target.value })
                              }
                              disabled={isSubmitting}
                            />
                          </div>
                          <div className="col-span-2">
                            <Button
                              type="button"
                              className="w-full"
                              onClick={addRecipient}
                              disabled={isSubmitting}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {recipients.length > 0 ? (
                          <div className="space-y-2">
                            {recipients.map((recipient) => (
                              <div
                                key={recipient.email}
                                className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-md"
                              >
                                <div>
                                  <p className="text-sm font-medium">{recipient.email}</p>
                                  {recipient.name && (
                                    <p className="text-xs text-muted-foreground">
                                      {recipient.name}
                                    </p>
                                  )}
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeRecipient(recipient.email)}
                                  disabled={isSubmitting}
                                >
                                  <span className="sr-only">Remove</span>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M18 6L6 18M6 6l12 12" />
                                  </svg>
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No recipients added yet
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Export Formats */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Export Formats</h3>
                  <FormField
                    control={form.control}
                    name="formats"
                    render={() => (
                      <FormItem>
                        <div className="grid grid-cols-2 gap-2">
                          <FormField
                            control={form.control}
                            name="formats"
                            render={({ field }) => {
                              return (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes("pdf")}
                                      onCheckedChange={(checked) => {
                                        const updatedValue = checked
                                          ? [...field.value, "pdf"]
                                          : field.value?.filter(
                                              (format) => format !== "pdf"
                                            );
                                        field.onChange(updatedValue);
                                      }}
                                      disabled={isSubmitting}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    PDF
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                          <FormField
                            control={form.control}
                            name="formats"
                            render={({ field }) => {
                              return (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes("pptx")}
                                      onCheckedChange={(checked) => {
                                        const updatedValue = checked
                                          ? [...field.value, "pptx"]
                                          : field.value?.filter(
                                              (format) => format !== "pptx"
                                            );
                                        field.onChange(updatedValue);
                                      }}
                                      disabled={isSubmitting}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    PowerPoint
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                          <FormField
                            control={form.control}
                            name="formats"
                            render={({ field }) => {
                              return (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes("xlsx")}
                                      onCheckedChange={(checked) => {
                                        const updatedValue = checked
                                          ? [...field.value, "xlsx"]
                                          : field.value?.filter(
                                              (format) => format !== "xlsx"
                                            );
                                        field.onChange(updatedValue);
                                      }}
                                      disabled={isSubmitting}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Excel
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                          <FormField
                            control={form.control}
                            name="formats"
                            render={({ field }) => {
                              return (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes("csv")}
                                      onCheckedChange={(checked) => {
                                        const updatedValue = checked
                                          ? [...field.value, "csv"]
                                          : field.value?.filter(
                                              (format) => format !== "csv"
                                            );
                                        field.onChange(updatedValue);
                                      }}
                                      disabled={isSubmitting}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    CSV
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                          <FormField
                            control={form.control}
                            name="formats"
                            render={({ field }) => {
                              return (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes("png")}
                                      onCheckedChange={(checked) => {
                                        const updatedValue = checked
                                          ? [...field.value, "png"]
                                          : field.value?.filter(
                                              (format) => format !== "png"
                                            );
                                        field.onChange(updatedValue);
                                      }}
                                      disabled={isSubmitting}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Image
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Feedback Collection */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Feedback Collection</h3>
                  <FormField
                    control={form.control}
                    name="includeFeedback"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-normal">
                            Include feedback form with report delivery
                          </FormLabel>
                          <FormDescription>
                            Recipients will be asked to rate the report quality and provide comments
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </ScrollArea>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || recipients.length === 0}>
                {isSubmitting ? "Scheduling..." : "Schedule Report"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
