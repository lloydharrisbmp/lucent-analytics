import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import brain from "brain";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  FileText,
  Upload,
  Trash2,
  Edit,
  Plus,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  CalendarClock,
  AlertCircle,
  Info,
  ExternalLink,
  AlertTriangle,
  FileCheck,
  FileX,
  FileClock,
  ClipboardList,
  CalendarPlus,
} from "lucide-react";

// Status mapping for visual components
const STATUS_MAP = {
  draft: {
    label: "Draft",
    color: "bg-gray-200 text-gray-800",
    icon: <FileClock className="h-4 w-4" />,
  },
  submitted: {
    label: "Submitted",
    color: "bg-blue-200 text-blue-800",
    icon: <ClipboardList className="h-4 w-4" />,
  },
  in_review: {
    label: "In Review",
    color: "bg-yellow-200 text-yellow-800",
    icon: <CalendarClock className="h-4 w-4" />,
  },
  approved: {
    label: "Approved",
    color: "bg-green-200 text-green-800",
    icon: <FileCheck className="h-4 w-4" />,
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-200 text-red-800",
    icon: <FileX className="h-4 w-4" />,
  },
};

// Step status mapping for visual components
const STEP_STATUS_MAP = {
  not_started: {
    label: "Not Started",
    color: "bg-gray-200 text-gray-800",
    icon: <Clock className="h-4 w-4" />,
  },
  in_progress: {
    label: "In Progress",
    color: "bg-yellow-200 text-yellow-800",
    icon: <CalendarClock className="h-4 w-4" />,
  },
  completed: {
    label: "Completed",
    color: "bg-green-200 text-green-800",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
};

interface Document {
  id: string;
  name: string;
  type: string;
  uploaded_at: string;
  file_key: string;
  status: string;
  notes?: string;
}

interface ApplicationStep {
  id: string;
  name: string;
  description?: string;
  status: string;
  due_date?: string;
  completed_at?: string;
  documents: Document[];
  notes?: string;
}

interface GrantApplication {
  id: string;
  grant_id: string;
  user_id: string;
  business_id?: string;
  status: string;
  created_at: string;
  updated_at: string;
  submitted_at?: string;
  grant_name: string;
  provider: string;
  funding_type: string;
  max_amount?: number;
  steps: ApplicationStep[];
  documents: Document[];
  notes?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
}

export default function GrantApplicationDetails() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<GrantApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");
  const [newNotes, setNewNotes] = useState<string>("");
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [stepBeingEdited, setStepBeingEdited] = useState<string | null>(null);
  const [editingStepStatus, setEditingStepStatus] = useState<string>("");
  const [editingStepNotes, setEditingStepNotes] = useState<string>("");
  const [editingStepDueDate, setEditingStepDueDate] = useState<string>("");
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [documentName, setDocumentName] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [uploadingForStep, setUploadingForStep] = useState<string | null>(null);

  useEffect(() => {
    if (applicationId) {
      fetchApplicationDetails();
    }
  }, [applicationId]);

  const fetchApplicationDetails = async () => {
    setLoading(true);
    try {
      const response = await brain.get_application({ application_id: applicationId! });
      const data = await response.json();
      setApplication(data.application);
      if (data.application) {
        setNewStatus(data.application.status);
        setNewNotes(data.application.notes || "");
      }
    } catch (err) {
      console.error("Error fetching application details:", err);
      setError("Failed to load application details. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!application) return;

    setIsUpdatingStatus(true);
    try {
      const response = await brain.update_application(
        { application_id: application.id },
        { status: newStatus, notes: newNotes }
      );
      const data = await response.json();
      setApplication(data.application);
      toast.success("Application status updated successfully");
    } catch (err) {
      console.error("Error updating application status:", err);
      toast.error("Failed to update application status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleUpdateStep = async (stepId: string) => {
    if (!application) return;

    try {
      const response = await brain.update_application_step(
        { application_id: application.id, step_id: stepId },
        {
          status: editingStepStatus,
          notes: editingStepNotes,
          due_date: editingStepDueDate ? new Date(editingStepDueDate).toISOString() : undefined,
        }
      );
      const data = await response.json();
      
      // Update the application with new steps
      setApplication(prev => {
        if (!prev) return null;
        return {
          ...prev,
          steps: data.steps
        };
      });
      
      setStepBeingEdited(null);
      toast.success("Step updated successfully");
    } catch (err) {
      console.error("Error updating step:", err);
      toast.error("Failed to update step");
    }
  };

  const handlePrepareUpload = async (stepId: string | null = null) => {
    if (!application) return;
    if (!documentName || !documentType) {
      toast.error("Please provide document name and type");
      return;
    }

    setUploadingDocument(true);
    try {
      const response = await brain.prepare_document_upload(
        { application_id: application.id },
        { name: documentName, type: documentType, step_id: stepId }
      );
      const data = await response.json();
      
      // Here you would typically handle the actual file upload
      // For demo purposes, we'll simulate a successful upload
      setTimeout(async () => {
        try {
          // Confirm the upload
          const confirmResponse = await brain.confirm_document_upload(
            { application_id: application.id, document_id: data.document_id },
            { name: documentName, type: documentType, step_id: stepId }
          );
          
          // Refresh application data
          fetchApplicationDetails();
          toast.success("Document uploaded successfully");
          
          // Reset form
          setDocumentName("");
          setDocumentType("");
          setUploadingForStep(null);
        } catch (err) {
          console.error("Error confirming document upload:", err);
          toast.error("Failed to complete document upload");
        } finally {
          setUploadingDocument(false);
        }
      }, 1500);
      
    } catch (err) {
      console.error("Error preparing document upload:", err);
      toast.error("Failed to prepare document upload");
      setUploadingDocument(false);
    }
  };

  const handleDeleteDocument = async (documentId: string, stepId: string | null = null) => {
    if (!application) return;

    try {
      const params: any = { application_id: application.id, document_id: documentId };
      if (stepId) params.step_id = stepId;
      
      await brain.delete_document(params);
      fetchApplicationDetails();
      toast.success("Document deleted successfully");
    } catch (err) {
      console.error("Error deleting document:", err);
      toast.error("Failed to delete document");
    }
  };

  // Calculate progress percentage for the application
  const calculateProgress = () => {
    if (!application) return 0;
    const totalSteps = application.steps.length;
    if (totalSteps === 0) return 0;
    
    const completedSteps = application.steps.filter(step => step.status === "completed").length;
    return (completedSteps / totalSteps) * 100;
  };

  // Format date to a readable string
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set";
    return format(new Date(dateString), "PPP");
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex animate-pulse space-x-4">
          <div className="h-12 w-12 rounded-full bg-gray-200"></div>
          <div className="flex-1 space-y-4">
            <div className="h-4 w-3/4 rounded bg-gray-200"></div>
            <div className="space-y-2">
              <div className="h-4 rounded bg-gray-200"></div>
              <div className="h-4 w-5/6 rounded bg-gray-200"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error || "Application not found"}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-2 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">{application.grant_name}</h1>
        <Badge className={STATUS_MAP[application.status as keyof typeof STATUS_MAP].color + " ml-2 flex items-center gap-1"}>
          {STATUS_MAP[application.status as keyof typeof STATUS_MAP].icon}
          {STATUS_MAP[application.status as keyof typeof STATUS_MAP].label}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Application Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <CalendarClock className="h-5 w-5" />
                Application Progress
              </CardTitle>
              <CardDescription>
                Track your application progress through required steps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">
                    {application.steps.filter(s => s.status === "completed").length} of {application.steps.length} steps completed
                  </span>
                  <span className="text-sm font-medium">
                    {Math.round(calculateProgress())}%
                  </span>
                </div>
                <Progress value={calculateProgress()} className="h-2" />
              </div>

              <Accordion
                type="single"
                collapsible
                value={activeStep || undefined}
                onValueChange={(value) => setActiveStep(value)}
                className="w-full"
              >
                {application.steps.map((step, index) => (
                  <AccordionItem key={step.id} value={step.id}>
                    <AccordionTrigger className="flex items-center py-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-1 rounded-full ${STEP_STATUS_MAP[step.status as keyof typeof STEP_STATUS_MAP].color}`}>
                          {STEP_STATUS_MAP[step.status as keyof typeof STEP_STATUS_MAP].icon}
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="text-base font-medium">
                            {index + 1}. {step.name}
                          </span>
                          {step.due_date && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Due: {formatDate(step.due_date)}
                            </span>
                          )}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-10">
                      {/* Step details */}
                      <div className="space-y-4">
                        {step.description && (
                          <div className="text-sm text-gray-600">
                            {step.description}
                          </div>
                        )}

                        {/* Status, due date and actions */}
                        <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-4">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <Badge className={STEP_STATUS_MAP[step.status as keyof typeof STEP_STATUS_MAP].color}>
                                {STEP_STATUS_MAP[step.status as keyof typeof STEP_STATUS_MAP].label}
                              </Badge>
                              {step.completed_at && (
                                <span className="text-xs text-gray-500">
                                  Completed on {formatDate(step.completed_at)}
                                </span>
                              )}
                            </div>
                            {step.notes && (
                              <div className="text-sm text-gray-600">
                                <strong>Notes:</strong> {step.notes}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setStepBeingEdited(step.id);
                                setEditingStepStatus(step.status);
                                setEditingStepNotes(step.notes || "");
                                setEditingStepDueDate(step.due_date ? new Date(step.due_date).toISOString().split("T")[0] : "");
                              }}
                              className="flex items-center gap-1"
                            >
                              <Edit className="h-3 w-3" />
                              Update
                            </Button>
                            <Dialog
                              open={uploadingForStep === step.id}
                              onOpenChange={(open) => {
                                if (!open) setUploadingForStep(null);
                                else setUploadingForStep(step.id);
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex items-center gap-1"
                                >
                                  <Upload className="h-3 w-3" />
                                  Upload
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Upload Document for {step.name}</DialogTitle>
                                  <DialogDescription>
                                    Upload required documentation for this step
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <label
                                      htmlFor="name"
                                      className="text-right text-sm font-medium"
                                    >
                                      Name
                                    </label>
                                    <input
                                      id="name"
                                      value={documentName}
                                      onChange={(e) => setDocumentName(e.target.value)}
                                      className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <label
                                      htmlFor="type"
                                      className="text-right text-sm font-medium"
                                    >
                                      Type
                                    </label>
                                    <input
                                      id="type"
                                      value={documentType}
                                      onChange={(e) => setDocumentType(e.target.value)}
                                      placeholder="e.g. PDF, Image, Spreadsheet"
                                      className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <label
                                      htmlFor="file"
                                      className="text-right text-sm font-medium"
                                    >
                                      File
                                    </label>
                                    <input
                                      id="file"
                                      type="file"
                                      className="col-span-3 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    onClick={() => setUploadingForStep(null)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={() => handlePrepareUpload(step.id)}
                                    disabled={uploadingDocument}
                                  >
                                    {uploadingDocument ? "Uploading..." : "Upload"}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>

                        {/* Edit step dialog */}
                        {stepBeingEdited === step.id && (
                          <Dialog
                            open={stepBeingEdited === step.id}
                            onOpenChange={(open) => {
                              if (!open) setStepBeingEdited(null);
                            }}
                          >
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Update Step: {step.name}</DialogTitle>
                                <DialogDescription>
                                  Update the status and details for this step
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">
                                    Status
                                  </label>
                                  <Select
                                    value={editingStepStatus}
                                    onValueChange={setEditingStepStatus}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="not_started">Not Started</SelectItem>
                                      <SelectItem value="in_progress">In Progress</SelectItem>
                                      <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">
                                    Due Date
                                  </label>
                                  <input
                                    type="date"
                                    value={editingStepDueDate}
                                    onChange={(e) => setEditingStepDueDate(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">
                                    Notes
                                  </label>
                                  <Textarea
                                    value={editingStepNotes}
                                    onChange={(e) => setEditingStepNotes(e.target.value)}
                                    placeholder="Add notes about this step"
                                    className="min-h-[100px]"
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => setStepBeingEdited(null)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={() => handleUpdateStep(step.id)}
                                >
                                  Save Changes
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}

                        {/* Documents list */}
                        <div className="mt-4">
                          <h4 className="text-sm font-semibold mb-2">Documents</h4>
                          {step.documents.length === 0 ? (
                            <div className="text-sm text-gray-500 italic">
                              No documents uploaded for this step yet
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {step.documents.map((doc) => (
                                <div
                                  key={doc.id}
                                  className="flex items-center justify-between bg-gray-50 p-2 rounded-md text-sm"
                                >
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-blue-500" />
                                    <div>
                                      <div className="font-medium">{doc.name}</div>
                                      <div className="text-xs text-gray-500">
                                        {doc.type} • Uploaded {formatDate(doc.uploaded_at)}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                              // Handle document download here
                                              toast.info("Download functionality would be implemented here");
                                            }}
                                          >
                                            <ExternalLink className="h-4 w-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>View Document</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteDocument(doc.id, step.id)}
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Delete Document</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* General Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <FileText className="h-5 w-5" />
                General Documents
              </CardTitle>
              <CardDescription>
                Additional documents for your application
              </CardDescription>
            </CardHeader>
            <CardContent>
              {application.documents.length === 0 ? (
                <div className="text-center py-6">
                  <div className="text-gray-500 mb-2">No general documents uploaded yet</div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Upload Document
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Upload General Document</DialogTitle>
                        <DialogDescription>
                          Upload additional documentation for your application
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <label
                            htmlFor="doc-name"
                            className="text-right text-sm font-medium"
                          >
                            Name
                          </label>
                          <input
                            id="doc-name"
                            value={documentName}
                            onChange={(e) => setDocumentName(e.target.value)}
                            className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <label
                            htmlFor="doc-type"
                            className="text-right text-sm font-medium"
                          >
                            Type
                          </label>
                          <input
                            id="doc-type"
                            value={documentType}
                            onChange={(e) => setDocumentType(e.target.value)}
                            placeholder="e.g. PDF, Image, Spreadsheet"
                            className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <label
                            htmlFor="doc-file"
                            className="text-right text-sm font-medium"
                          >
                            File
                          </label>
                          <input
                            id="doc-file"
                            type="file"
                            className="col-span-3 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => {}}>
                          Cancel
                        </Button>
                        <Button
                          onClick={() => handlePrepareUpload()}
                          disabled={uploadingDocument}
                        >
                          {uploadingDocument ? "Uploading..." : "Upload"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    {application.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded-md"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-blue-500" />
                          <div>
                            <div className="font-medium">{doc.name}</div>
                            <div className="text-xs text-gray-500">
                              {doc.type} • Uploaded {formatDate(doc.uploaded_at)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          Add Document
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Upload General Document</DialogTitle>
                          <DialogDescription>
                            Upload additional documentation for your application
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <label
                              htmlFor="doc-name"
                              className="text-right text-sm font-medium"
                            >
                              Name
                            </label>
                            <input
                              id="doc-name"
                              value={documentName}
                              onChange={(e) => setDocumentName(e.target.value)}
                              className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <label
                              htmlFor="doc-type"
                              className="text-right text-sm font-medium"
                            >
                              Type
                            </label>
                            <input
                              id="doc-type"
                              value={documentType}
                              onChange={(e) => setDocumentType(e.target.value)}
                              placeholder="e.g. PDF, Image, Spreadsheet"
                              className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <label
                              htmlFor="doc-file"
                              className="text-right text-sm font-medium"
                            >
                              File
                            </label>
                            <input
                              id="doc-file"
                              type="file"
                              className="col-span-3 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => {}}>
                            Cancel
                          </Button>
                          <Button
                            onClick={() => handlePrepareUpload()}
                            disabled={uploadingDocument}
                          >
                            {uploadingDocument ? "Uploading..." : "Upload"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Application Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Info className="h-5 w-5" />
                Application Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Provider</h3>
                <p>{application.provider}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Funding Type</h3>
                <p>{application.funding_type}</p>
              </div>
              {application.max_amount && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Maximum Amount</h3>
                  <p>${application.max_amount.toLocaleString()}</p>
                </div>
              )}
              <div>
                <h3 className="text-sm font-medium text-gray-500">Created</h3>
                <p>{formatDate(application.created_at)}</p>
              </div>
              {application.submitted_at && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Submitted</h3>
                  <p>{formatDate(application.submitted_at)}</p>
                </div>
              )}
              <Separator />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Contact Information</h3>
                <div className="mt-2 space-y-1">
                  {application.contact_name && (
                    <p className="text-sm">
                      <span className="font-medium">Name:</span> {application.contact_name}
                    </p>
                  )}
                  {application.contact_email && (
                    <p className="text-sm">
                      <span className="font-medium">Email:</span> {application.contact_email}
                    </p>
                  )}
                  {application.contact_phone && (
                    <p className="text-sm">
                      <span className="font-medium">Phone:</span> {application.contact_phone}
                    </p>
                  )}
                  {!application.contact_name && !application.contact_email && !application.contact_phone && (
                    <p className="text-sm text-gray-500 italic">No contact information provided</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Application Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <CalendarClock className="h-5 w-5" />
                Update Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="in_review">In Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Add notes about the status update"
                  className="min-h-[100px]"
                />
              </div>
              <Button
                className="w-full"
                onClick={handleUpdateStatus}
                disabled={isUpdatingStatus}
              >
                {isUpdatingStatus ? "Updating..." : "Update Status"}
              </Button>
            </CardContent>
          </Card>

          {/* Deadlines and Important Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <CalendarPlus className="h-5 w-5" />
                Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {application.steps
                  .filter((step) => step.due_date)
                  .sort((a, b) => {
                    if (!a.due_date || !b.due_date) return 0;
                    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
                  })
                  .map((step) => (
                    <div key={step.id} className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 p-1 rounded-full ${step.status === "completed" ? "bg-green-200" : "bg-yellow-200"}`}
                      >
                        {step.status === "completed" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-800" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-800" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{step.name}</div>
                        <div className="text-sm text-gray-500">
                          Due on {formatDate(step.due_date)}
                        </div>
                      </div>
                    </div>
                  ))}

                {application.steps.filter((step) => step.due_date).length === 0 && (
                  <div className="text-center py-3 text-gray-500 italic">
                    No deadlines set for this application
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
