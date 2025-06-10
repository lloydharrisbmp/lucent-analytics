import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import brain from "brain";
import { format } from "date-fns";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "sonner";
import { 
  Search, 
  PlusCircle, 
  FileClock, 
  ClipboardList, 
  CalendarClock,
  FileCheck,
  FileX,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";

// Status mapping for visual components
const STATUS_MAP = {
  draft: { label: "Draft", color: "bg-gray-200 text-gray-800", icon: <FileClock className="h-4 w-4" /> },
  submitted: { label: "Submitted", color: "bg-blue-200 text-blue-800", icon: <ClipboardList className="h-4 w-4" /> },
  in_review: { label: "In Review", color: "bg-yellow-200 text-yellow-800", icon: <CalendarClock className="h-4 w-4" /> },
  approved: { label: "Approved", color: "bg-green-200 text-green-800", icon: <FileCheck className="h-4 w-4" /> },
  rejected: { label: "Rejected", color: "bg-red-200 text-red-800", icon: <FileX className="h-4 w-4" /> },
};

// Step status mapping for visual components
const STEP_STATUS_MAP = {
  not_started: { label: "Not Started", color: "bg-gray-200 text-gray-800", icon: <Clock className="h-4 w-4" /> },
  in_progress: { label: "In Progress", color: "bg-yellow-200 text-yellow-800", icon: <CalendarClock className="h-4 w-4" /> },
  completed: { label: "Completed", color: "bg-green-200 text-green-800", icon: <CheckCircle2 className="h-4 w-4" /> },
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

export function GrantApplicationTracker() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [applications, setApplications] = useState<GrantApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState<GrantApplication | null>(null);

  // Fetch applications on component mount
  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await brain.list_applications({});
      const data = await response.json();
      setApplications(data.applications || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching applications:", err);
      setError("Failed to load applications. Please try again later.");
      toast.error("Could not load your grant applications. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Filter applications based on search query and active tab
  const filteredApplications = applications.filter(app => {
    const matchesSearch = searchQuery.trim() === "" || 
      app.grant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.provider.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = activeTab === "all" || 
      (activeTab === "active" && ["draft", "submitted", "in_review"].includes(app.status)) ||
      (activeTab === "approved" && app.status === "approved") ||
      (activeTab === "rejected" && app.status === "rejected");
    
    return matchesSearch && matchesStatus;
  });

  // Calculate progress percentage for an application
  const calculateProgress = (application: GrantApplication) => {
    const totalSteps = application.steps.length;
    if (totalSteps === 0) return 0;
    
    const completedSteps = application.steps.filter(step => step.status === "completed").length;
    return (completedSteps / totalSteps) * 100;
  };

  // Format date to a readable string
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "PPP");
  };

  // Handle view application details
  const handleViewApplication = (application: GrantApplication) => {
    navigate(`/GrantApplicationDetails/${application.id}`);
  };

  // Handle creating a new application for a grant
  const handleCreateApplication = (grantId: string) => {
    navigate(`/GrantApplicationForm/${grantId}`);
  };

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Grant Applications</h1>
        <Button 
          onClick={() => navigate("/GovernmentGrants")}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Find New Grants
        </Button>
      </div>

      <div className="mb-6">
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search applications..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            {renderApplicationsList(filteredApplications)}
          </TabsContent>
          
          <TabsContent value="active" className="mt-0">
            {renderApplicationsList(filteredApplications)}
          </TabsContent>
          
          <TabsContent value="approved" className="mt-0">
            {renderApplicationsList(filteredApplications)}
          </TabsContent>
          
          <TabsContent value="rejected" className="mt-0">
            {renderApplicationsList(filteredApplications)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );

  function renderApplicationsList(applications: GrantApplication[]) {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
              <CardFooter>
                <div className="h-9 bg-gray-200 rounded w-full"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      );
    }

    if (applications.length === 0) {
      return (
        <div className="text-center py-12">
          <h3 className="text-2xl font-semibold mb-2">No applications found</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery ? "Try adjusting your search criteria" : "Start by finding a grant to apply for"}
          </p>
          <Button 
            onClick={() => navigate("/GovernmentGrants")}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Find Grants
          </Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {applications.map((app) => (
          <Card key={app.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-bold">{app.grant_name}</CardTitle>
                <Badge className={STATUS_MAP[app.status as keyof typeof STATUS_MAP].color + " flex items-center gap-1"}>
                  {STATUS_MAP[app.status as keyof typeof STATUS_MAP].icon}
                  {STATUS_MAP[app.status as keyof typeof STATUS_MAP].label}
                </Badge>
              </div>
              <CardDescription>{app.provider}</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-2">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Progress</div>
                  <div className="flex items-center gap-2">
                    <Progress value={calculateProgress(app)} className="h-2" />
                    <span className="text-sm font-medium">
                      {Math.round(calculateProgress(app))}%
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Created</span>
                  <span>{formatDate(app.created_at)}</span>
                </div>
                {app.submitted_at && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Submitted</span>
                    <span>{formatDate(app.submitted_at)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Funding Type</span>
                  <span>{app.funding_type}</span>
                </div>
                {app.max_amount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Max Amount</span>
                    <span>${app.max_amount.toLocaleString()}</span>
                  </div>
                )}
                <div className="text-sm">
                  <span className="text-gray-500">Steps: </span>
                  <span className="font-medium">
                    {app.steps.filter(s => s.status === "completed").length} of {app.steps.length} completed
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => handleViewApplication(app)}
                variant="outline"
              >
                View Application
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
}
