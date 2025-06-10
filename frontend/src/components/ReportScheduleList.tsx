import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { Calendar, Mail, Bell, Trash2, PencilLine, Eye, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReportScheduler } from "./ReportScheduler";
import brain from "brain";

interface Recipient {
  email: string;
  name?: string;
}

interface ReportSchedule {
  scheduleId: string;
  reportType: string;
  reportName: string;
  description?: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  deliveryMethods: string[];
  recipients: Recipient[];
  formats: string[];
  status: "scheduled" | "in_progress" | "completed" | "failed" | "delivered";
  nextDeliveryDate: string;
  lastDeliveryDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface ReportScheduleListProps {
  limit?: number;
  showAddButton?: boolean;
  className?: string;
}

export function ReportScheduleList({
  limit,
  showAddButton = true,
  className = "",
}: ReportScheduleListProps) {
  const [schedules, setSchedules] = useState<ReportSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<ReportSchedule | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSchedules = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await brain.list_schedules();
      const data = await response.json();
      
      // Sort schedules by next delivery date
      const sortedSchedules = [...data].sort((a, b) => {
        return new Date(a.nextDeliveryDate).getTime() - new Date(b.nextDeliveryDate).getTime();
      });
      
      setSchedules(limit ? sortedSchedules.slice(0, limit) : sortedSchedules);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      setError("Failed to load scheduled reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [limit]);

  const handleDeleteClick = (scheduleId: string) => {
    setDeletingId(scheduleId);
    setConfirmDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    
    setIsDeleting(true);
    try {
      await brain.delete_schedule(deletingId);
      toast.success("Schedule deleted successfully");
      setSchedules(schedules.filter((s) => s.scheduleId !== deletingId));
      setConfirmDeleteOpen(false);
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast.error("Failed to delete schedule");
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  const handleViewDetails = (schedule: ReportSchedule) => {
    setSelectedSchedule(schedule);
    setDetailsOpen(true);
  };

  const handleManualDeliver = async (scheduleId: string) => {
    try {
      toast.info("Triggering report delivery...");
      const response = await brain.manual_deliver_report(scheduleId);
      await response.json();
      toast.success("Report delivery triggered successfully");
    } catch (error) {
      console.error("Error triggering delivery:", error);
      toast.error("Failed to trigger report delivery");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Scheduled</Badge>;
      case "in_progress":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">In Progress</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case "failed":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Failed</Badge>;
      case "delivered":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Delivered</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels = {
      daily: "Daily",
      weekly: "Weekly",
      monthly: "Monthly",
      quarterly: "Quarterly",
      annually: "Annually",
      once: "One-time"
    };
    return labels[frequency as keyof typeof labels] || frequency;
  };

  const getReportTypeLabel = (reportType: string) => {
    const labels = {
      board: "Board Report",
      management: "Management Report",
      investor: "Investor Report",
      executive: "Executive Report",
      custom: "Custom Report"
    };
    return labels[reportType as keyof typeof labels] || reportType;
  };

  const getDeliveryMethodsIcons = (methods: string[]) => {
    return (
      <div className="flex space-x-1">
        {methods.includes("email") && (
          <span title="Email">
            <Mail className="h-4 w-4 text-muted-foreground" />
          </span>
        )}
        {methods.includes("notification") && (
          <span title="In-app Notification">
            <Bell className="h-4 w-4 text-muted-foreground" />
          </span>
        )}
      </div>
    );
  };

  const getFormatsLabel = (formats: string[]) => {
    return formats.map(f => f.toUpperCase()).join(", ");
  };

  if (loading) {
    return (
      <div className={className}>
        <div className="space-y-2">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (schedules.length === 0) {
    return (
      <div className={className}>
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No scheduled reports</h3>
          <p className="text-sm text-muted-foreground mt-1">
            You haven't scheduled any reports for delivery yet.
          </p>
          {showAddButton && (
            <div className="mt-6">
              <ReportScheduler 
                className="mx-auto"
                onScheduleCreated={fetchSchedules}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-medium">Scheduled Reports</h3>
          <p className="text-sm text-muted-foreground">
            {limit && schedules.length >= limit
              ? `Showing ${limit} of ${schedules.length} scheduled reports`
              : `${schedules.length} scheduled reports`}
          </p>
        </div>
        {showAddButton && (
          <ReportScheduler onScheduleCreated={fetchSchedules} />
        )}
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Report</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Next Delivery</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedules.map((schedule) => (
              <TableRow key={schedule.scheduleId}>
                <TableCell>
                  <div>
                    <div className="font-medium">{schedule.reportName}</div>
                    <div className="text-sm text-muted-foreground">
                      {getReportTypeLabel(schedule.reportType)}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{getFrequencyLabel(schedule.frequency)}</TableCell>
                <TableCell>
                  {schedule.nextDeliveryDate && (
                    <div className="text-sm">
                      {format(parseISO(schedule.nextDeliveryDate), "MMM d, yyyy")}
                    </div>
                  )}
                </TableCell>
                <TableCell>{getStatusBadge(schedule.status)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <span className="sr-only">Open menu</span>
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 15 15"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                        >
                          <path
                            d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z"
                            fill="currentColor"
                            fillRule="evenodd"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDetails(schedule)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleManualDeliver(schedule.scheduleId)}>
                        <Calendar className="mr-2 h-4 w-4" />
                        Deliver Now
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteClick(schedule.scheduleId)}>
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
      </div>

      {/* Schedule Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Schedule Details</DialogTitle>
            <DialogDescription>
              Information about the scheduled report delivery.
            </DialogDescription>
          </DialogHeader>

          {selectedSchedule && (
            <ScrollArea className="max-h-[70vh] pr-4">
              <div className="space-y-6 pr-4">
                <div>
                  <h3 className="text-sm font-semibold mb-2">Report Information</h3>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Report Name</p>
                          <p className="font-medium">{selectedSchedule.reportName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Report Type</p>
                          <p className="font-medium">{getReportTypeLabel(selectedSchedule.reportType)}</p>
                        </div>
                        {selectedSchedule.description && (
                          <div className="col-span-2">
                            <p className="text-sm text-muted-foreground">Description</p>
                            <p>{selectedSchedule.description}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-2">Schedule Information</h3>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Frequency</p>
                          <p className="font-medium">{getFrequencyLabel(selectedSchedule.frequency)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Status</p>
                          <div className="mt-1">{getStatusBadge(selectedSchedule.status)}</div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Start Date</p>
                          <p className="font-medium">
                            {format(parseISO(selectedSchedule.startDate), "MMMM d, yyyy")}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">End Date</p>
                          <p className="font-medium">
                            {selectedSchedule.endDate
                              ? format(parseISO(selectedSchedule.endDate), "MMMM d, yyyy")
                              : "None (ongoing)"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Next Delivery</p>
                          <p className="font-medium">
                            {format(parseISO(selectedSchedule.nextDeliveryDate), "MMMM d, yyyy")}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Last Delivery</p>
                          <p className="font-medium">
                            {selectedSchedule.lastDeliveryDate
                              ? format(parseISO(selectedSchedule.lastDeliveryDate), "MMMM d, yyyy")
                              : "Not delivered yet"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-2">Delivery Information</h3>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Delivery Methods</p>
                          <div className="flex space-x-2">
                            {selectedSchedule.deliveryMethods.map((method) => (
                              <Badge key={method} variant="outline">
                                {method === "email" ? (
                                  <>
                                    <Mail className="h-3 w-3 mr-1" />
                                    Email
                                  </>
                                ) : method === "notification" ? (
                                  <>
                                    <Bell className="h-3 w-3 mr-1" />
                                    Notification
                                  </>
                                ) : (
                                  method
                                )}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Export Formats</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedSchedule.formats.map((format) => (
                              <Badge key={format} variant="outline">
                                {format.toUpperCase()}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {selectedSchedule.deliveryMethods.includes("email") && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Recipients</p>
                            <div className="space-y-2">
                              {selectedSchedule.recipients.map((recipient) => (
                                <div
                                  key={recipient.email}
                                  className="flex items-center p-2 bg-muted/50 rounded-md"
                                >
                                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                                  <div>
                                    <p className="text-sm font-medium">{recipient.email}</p>
                                    {recipient.name && (
                                      <p className="text-xs text-muted-foreground">
                                        {recipient.name}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this scheduled report? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setConfirmDeleteOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
