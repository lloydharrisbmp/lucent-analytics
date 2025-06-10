import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from 'components/DashboardLayout';
import { useClientStore } from "utils/client-store";
import { formatCurrency } from "utils/client-data";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClientStatusBadge } from "components/ClientsDataTable";
import { 
  CircleAlertIcon, 
  MapPinIcon, 
  MailIcon, 
  PhoneIcon, 
  BuildingIcon,
  BarChart3Icon,
  FileIcon,
  CalendarIcon,
  CircleDollarSignIcon,
  PercentIcon,
  ClockIcon,
  TrendingUpIcon,
  BriefcaseIcon,
  EditIcon,
  Trash2Icon,
  FileTextIcon,
  UploadIcon,
  DownloadIcon
} from "lucide-react";
import { WorkingCapitalDashboard } from "components/WorkingCapitalDashboard";

// Interface for representing a file in the documents tab
interface DocumentFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  uploadedBy: string;
}

// Generate sample documents for demonstration
const generateSampleDocuments = (clientId: string): DocumentFile[] => {
  const types = ['pdf', 'xlsx', 'docx', 'csv', 'jpg'];
  const documents: DocumentFile[] = [];
  
  for (let i = 0; i < 5; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 90));
    
    documents.push({
      id: `doc-${clientId}-${i+1}`,
      name: `${type === 'pdf' ? 'Financial Report' : 
             type === 'xlsx' ? 'Cash Flow Analysis' :
             type === 'docx' ? 'Business Proposal' :
             type === 'csv' ? 'Transaction Data' : 'Signed Agreement'} ${i+1}`,
      type,
      size: Math.floor(100000 + Math.random() * 9900000), // Size in bytes
      uploadDate: date.toISOString(),
      uploadedBy: 'John Smith'
    });
  }
  
  return documents;
};

// Format file size in a human-readable format
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' bytes';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
};

export default function ClientDetail() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { getClient, getClientSummary, deleteClient, clients, fetchClients } = useClientStore();
  const [client, setClient] = useState<any>(null);
  const [clientSummary, setClientSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  
  // Load client data on mount
  useEffect(() => {
    if (!clientId) {
      setError(new Error('Client ID is required'));
      setIsLoading(false);
      return;
    }
    
    const loadClient = async () => {
      try {
        setIsLoading(true);
        
        // If clients aren't loaded yet, fetch them
        if (clients.length === 0) {
          await fetchClients();
        }
        
        // Get the client with the given ID
        const foundClient = getClient(clientId);
        
        if (!foundClient) {
          throw new Error(`Client with ID ${clientId} not found`);
        }
        
        setClient(foundClient);
        
        // Get client summary data
        const summary = await getClientSummary(clientId);
        setClientSummary(summary);
        
        // Generate sample documents
        setDocuments(generateSampleDocuments(clientId));
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load client'));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadClient();
  }, [clientId, clients.length, fetchClients, getClient, getClientSummary]);
  
  // Handle client deletion
  const handleDeleteClient = async () => {
    if (!clientId) return;
    
    try {
      await deleteClient(clientId);
      navigate('/clients');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete client'));
      setDeleteDialogOpen(false);
    }
  };
  
  // Handle edit client
  const handleEditClient = () => {
    navigate(`/edit-client/${clientId}`);
  };
  
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <span className="ml-3">Loading client data...</span>
        </div>
      </DashboardLayout>
    );
  }
  
  if (error) {
    return (
      <DashboardLayout>
        <Alert variant="destructive" className="mb-6">
          <CircleAlertIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error.message}
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/clients')} variant="outline">
          Return to Clients
        </Button>
      </DashboardLayout>
    );
  }
  
  if (!client) {
    return (
      <DashboardLayout>
        <Alert variant="destructive" className="mb-6">
          <CircleAlertIcon className="h-4 w-4" />
          <AlertTitle>Client Not Found</AlertTitle>
          <AlertDescription>
            The requested client could not be found.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/clients')} variant="outline">
          Return to Clients
        </Button>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      {/* Breadcrumb navigation */}
      <Breadcrumb className="mb-6">
        <BreadcrumbItem>
          <BreadcrumbLink href="/clients">Clients</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>{client.name}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      
      {/* Client header with actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 rounded-md">
            {client.profileImage ? (
              <AvatarImage src={client.profileImage} alt={client.name} />
            ) : null}
            <AvatarFallback className="rounded-md text-lg">
              {client.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{client.name}</h1>
              <ClientStatusBadge status={client.status} />
            </div>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <BuildingIcon className="h-4 w-4" />
              <span>{client.businessType}</span>
              <span className="mx-1">•</span>
              <MapPinIcon className="h-4 w-4" />
              <span>{client.location}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-1"
            onClick={handleEditClient}
          >
            <EditIcon className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            className="gap-1"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2Icon className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
      
      {/* Client tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financial">Financial Data</TabsTrigger>
          <TabsTrigger value="working-capital">Working Capital</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Client Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>Client Details</CardTitle>
                <CardDescription>Business and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Business Information</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm font-medium">Industry</p>
                      <p className="text-sm">{client.industry}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">ABN</p>
                      <p className="text-sm">{client.abn}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Tax File Number</p>
                      <p className="text-sm">{client.taxFileNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Annual Revenue</p>
                      <p className="text-sm">{formatCurrency(client.annualRevenue)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Contact Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5"><BriefcaseIcon className="h-4 w-4 text-muted-foreground" /></span>
                      <div>
                        <p className="text-sm font-medium">Contact Name</p>
                        <p className="text-sm">{client.contactName}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5"><MailIcon className="h-4 w-4 text-muted-foreground" /></span>
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm">{client.contactEmail}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5"><PhoneIcon className="h-4 w-4 text-muted-foreground" /></span>
                      <div>
                        <p className="text-sm font-medium">Phone</p>
                        <p className="text-sm">{client.contactPhone}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {client.notes && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Notes</h4>
                    <p className="text-sm">{client.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Key Performance Indicators */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Key Performance Indicators</CardTitle>
                  <CardDescription>Financial performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center gap-2">
                        <CircleDollarSignIcon className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium">Total Revenue</span>
                      </div>
                      <span className="text-2xl font-bold">{formatCurrency(clientSummary.totalRevenue)}</span>
                      <span className="text-sm text-muted-foreground">Year to date</span>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center gap-2">
                        <CircleDollarSignIcon className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium">Total Profit</span>
                      </div>
                      <span className="text-2xl font-bold">{formatCurrency(clientSummary.totalProfit)}</span>
                      <span className="text-sm text-muted-foreground">Year to date</span>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center gap-2">
                        <ClockIcon className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium">Cash Conversion</span>
                      </div>
                      <span className="text-2xl font-bold">{clientSummary.cashConversionCycle} days</span>
                      <span className="text-sm text-muted-foreground">Average cycle time</span>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center gap-2">
                        <BarChart3Icon className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium">Benchmarks</span>
                      </div>
                      <span className="text-2xl font-bold">{clientSummary.activeBenchmarks}</span>
                      <span className="text-sm text-muted-foreground">Active comparisons</span>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center gap-2">
                        <PercentIcon className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium">Compliance Score</span>
                      </div>
                      <span className="text-2xl font-bold">{clientSummary.complianceScore}%</span>
                      <span className="text-sm text-muted-foreground">Regulatory compliance</span>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium">Created On</span>
                      </div>
                      <span className="text-xl font-bold">{new Date(client.createdAt).toLocaleDateString()}</span>
                      <span className="text-sm text-muted-foreground">Account creation</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Activity & Financial Snapshot */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Trend</CardTitle>
                    <CardDescription>Last 6 months</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[200px] flex items-center justify-center">
                    <div className="flex items-center justify-center h-full w-full text-muted-foreground">
                      <TrendingUpIcon className="h-8 w-8 mr-2" />
                      <span>Revenue chart will display here</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Deadlines</CardTitle>
                    <CardDescription>Next 30 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">BAS</Badge>
                          <span className="text-sm">Quarterly BAS Statement</span>
                        </div>
                        <span className="text-sm text-muted-foreground">Apr 28, 2025</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Tax</Badge>
                          <span className="text-sm">Tax Payment Due</span>
                        </div>
                        <span className="text-sm text-muted-foreground">May 15, 2025</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Review</Badge>
                          <span className="text-sm">Financial Review Meeting</span>
                        </div>
                        <span className="text-sm text-muted-foreground">May 10, 2025</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Financial Data Tab */}
        <TabsContent value="financial" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Dashboard</CardTitle>
              <CardDescription>Financial performance metrics and analysis</CardDescription>
            </CardHeader>
            <CardContent className="h-[500px] flex items-center justify-center">
              <div className="flex items-center justify-center h-full w-full text-muted-foreground">
                <BarChart3Icon className="h-8 w-8 mr-2" />
                <span>Financial dashboard will be integrated here</span>
              </div>
              {/* Integration with existing financial dashboard components would go here */}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Working Capital Tab */}
        <TabsContent value="working-capital">
          <Card>
            <CardHeader>
              <CardTitle>Working Capital Analysis</CardTitle>
              <CardDescription>Cash flow and working capital metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <WorkingCapitalDashboard clientId={clientId} />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Client Documents</h3>
            <Button className="gap-1">
              <UploadIcon className="h-4 w-4" />
              Upload Document
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <div className="border-b">
                <div className="grid grid-cols-12 py-3 px-4 text-sm font-medium text-muted-foreground">
                  <div className="col-span-5">Name</div>
                  <div className="col-span-2">Type</div>
                  <div className="col-span-2">Size</div>
                  <div className="col-span-2">Uploaded</div>
                  <div className="col-span-1"></div>
                </div>
              </div>
              
              <div className="divide-y">
                {documents.map((doc) => (
                  <div key={doc.id} className="grid grid-cols-12 py-3 px-4 items-center">
                    <div className="col-span-5 flex items-center gap-2">
                      <FileTextIcon className="h-4 w-4 text-muted-foreground" />
                      <span>{doc.name}</span>
                    </div>
                    <div className="col-span-2">
                      <Badge variant="outline">{doc.type.toUpperCase()}</Badge>
                    </div>
                    <div className="col-span-2 text-sm">{formatFileSize(doc.size)}</div>
                    <div className="col-span-2 text-sm text-muted-foreground">
                      {new Date(doc.uploadDate).toLocaleDateString()}
                    </div>
                    <div className="col-span-1 text-right">
                      <Button variant="ghost" size="icon">
                        <DownloadIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {documents.length === 0 && (
                  <div className="py-8 text-center text-muted-foreground">
                    <FileIcon className="h-8 w-8 mx-auto mb-2" />
                    <p>No documents found</p>
                    <p className="text-sm">Upload documents to get started</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {client.name}? This action cannot be undone and all associated data will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteClient}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}