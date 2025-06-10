import React, { useState, useEffect, useCallback, useRef } from "react"; // Added useRef
import { useNavigate } from "react-router-dom";
import DashboardLayout from 'components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, Trash2, RefreshCw } from 'lucide-react';
import brain from 'brain';
import { toast } from 'sonner';
import { Progress } from "@/components/ui/progress";
import { useOrg } from 'components/OrgProvider';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  // FinancialImport, // <-- Keep commented out or remove if not defined elsewhere
} from 'types';
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser, API_URL, auth } from "app"; // Import API_URL and auth
import { format } from 'date-fns'; // For date formatting

// Helper function to format dates (adjust locale/options as needed)
const formatDate = (dateString: string | undefined | null) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleString();
  } catch (e) {
    return "Invalid Date";
  }
};

// Helper to determine badge variant based on status
const getStatusVariant = (status: string | undefined): "default" | "secondary" | "destructive" | "outline" => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'default'; // Use default (often green/blue in themes)
    case 'processing':
      return 'secondary'; // Use secondary (often gray/yellow)
    case 'failed':
      return 'destructive'; // Use destructive (often red)
    default:
      return 'outline';
  }
}

export default function DataImports() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for file input
  const { currentOrganization } = useOrg();
  const [selectedDataType, setSelectedDataType] = useState<string>("trial_balance"); // Add state for data type

  // State for import history
  // NOTE: Using any[] due to incorrect generated type (ListImportsData = string[]) for brain.list_imports.
  // The backend API should return list[FinancialImportObject] and the client regenerated.
  const [imports, setImports] = useState<any[]>([]); 
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Function to fetch import history
  const fetchImportHistory = async () => {
    if (!currentOrganization) {
      // Don't fetch if no org is selected
      setImports([]);
      return;
    }
    setIsLoadingHistory(true);
    setHistoryError(null);
    try {
      console.log(`Fetching import history for org: ${currentOrganization.id}`);
      const response = await brain.list_imports({ organizationId: currentOrganization.id });
      if (response.ok) {
        const data = await response.json();
        console.log("Import history fetched:", data);
        setImports(Array.isArray(data) ? data : []); // Ensure it's an array
      } else {
        const errorText = await response.text();
        console.error("Failed to fetch import history:", response.status, errorText);
        setHistoryError(`Failed to load history: ${response.status}. ${errorText || 'Please try again.'}`);
        setImports([]); // Clear imports on error
      }
    } catch (error) {
      console.error("An error occurred fetching import history:", error);
      setHistoryError("An unexpected error occurred while fetching history. Check console.");
      setImports([]); // Clear imports on error
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Fetch history on mount and when organization changes
  useEffect(() => {
    fetchImportHistory();
  }, [currentOrganization]); // Re-run when currentOrganization changes

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("File selected:", file.name);
      setSelectedFile(file);
      setUploadProgress(0); 
    } else {
      setSelectedFile(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !currentOrganization) {
      toast.error("Missing required information", {
        description: !selectedFile ? "Please select a file." : "Please select an organization.",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      console.log(`Uploading file: ${selectedFile.name} for org: ${currentOrganization.id}`);
      
      // Create FormData object
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("organization_id", currentOrganization.id);
      formData.append("data_type", selectedDataType); // Use selected data type state
      
      // Get auth token
      const token = await auth.getAuthToken();
      
      // Use fetch for more control over FormData submission
      const response = await fetch(`${API_URL}/financial-import/upload-for-organization`, { 
          method: 'POST',
          headers: {
             // Content-Type is set automatically by browser when using FormData
             'Authorization': `Bearer ${token}`
          },
          body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Upload successful:", result);
        toast.success("File uploaded successfully!", {
          description: `${selectedFile.name} has been uploaded and processing initiated.`,
        });
        setSelectedFile(null); 
        fetchImportHistory(); // <-- Refresh history after successful upload
    setSelectedFile(null); // Clear selected file after upload
    // Clear the file input visually (requires a ref)
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
      } else {
        const errorText = await response.text();
        console.error("Upload failed:", response.status, errorText);
        toast.error("Upload failed", {
          description: `Server responded with ${response.status}. ${errorText || 'Please try again.'}`,
        });
      }
    } catch (error) {
      console.error("An error occurred during upload:", error);
      toast.error("Upload error", {
        description: "An unexpected error occurred during the file upload. Check console for details.",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(100); 
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Data Imports</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Upload Financial Data</CardTitle>
            <CardDescription>
              Upload your trial balance or other financial data files (e.g., CSV, XLSX).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-start gap-4">
              <p className="text-sm text-muted-foreground">
                Select a data type and the file to upload. Ensure it follows the required format.
              </p>
              {/* Data Type Selection */}
              <div className="w-full max-w-sm">
                 <label htmlFor="data-type-select" className="block text-sm font-medium text-gray-700 mb-1">
                    Data Type
                 </label>
                 <Select value={selectedDataType} onValueChange={setSelectedDataType}>
                    <SelectTrigger id="data-type-select">
                       <SelectValue placeholder="Select data type" />
                    </SelectTrigger>
                    <SelectContent>
                       <SelectItem value="trial_balance">Trial Balance</SelectItem>
                       <SelectItem value="budget">Budget</SelectItem>
                       {/* Add other types later if needed */}
                    </SelectContent>
                 </Select>
              </div>
              {/* File Input */}
              <div className="w-full max-w-sm">
                 <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-1">
                    File
                 </label>
                <Input 
                  type="file"
                  id="file-upload" // Add id for label association
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".csv,.xlsx" // Specify acceptable file types
                  className={`block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer ${isUploading ? 'opacity-50' : ''}`}
                  disabled={isUploading}
                />
              </div>
              {isUploading && (
                <Progress value={uploadProgress} className="w-full max-w-sm" />
              )}
              <Button onClick={handleUpload} disabled={!selectedFile || !currentOrganization || isUploading}>
                <UploadCloud className="mr-2 h-4 w-4" /> 
                {isUploading ? `Uploading... ${uploadProgress}%` : "Upload Selected File"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Import History</CardTitle>
              <CardDescription>
                View the status and details of your past data imports.
              </CardDescription>
            </div>
            <Button variant="outline" size="icon" onClick={fetchImportHistory} disabled={isLoadingHistory}>
              <RefreshCw className={`h-4 w-4 ${isLoadingHistory ? 'animate-spin' : ''}`} />
            </Button>
          </CardHeader>
          <CardContent>
            {isLoadingHistory && (
              <p className="text-center text-muted-foreground py-8">Loading history...</p>
            )}
            {historyError && (
              <p className="text-center text-red-600 py-8">{historyError}</p>
            )}
            {!isLoadingHistory && !historyError && imports.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No import history found for this organization.
              </p>
            )}
            {!isLoadingHistory && !historyError && imports.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Imported At</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Imported By</TableHead> {/* Assuming user info might be available */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingHistory ? (
                    // Skeleton rows while loading
                    Array.from({ length: 3 }).map((_, index) => (
                      <TableRow key={`skeleton-${index}`}>
                        <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[180px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                      </TableRow>
                    ))
                  ) : imports.length > 0 ? (
                    imports.map((imp: any) => (
                      <TableRow key={imp.import_id}>
                        <TableCell className="font-medium">{imp.file_name || 'N/A'}</TableCell>
                        <TableCell>{imp.data_type}</TableCell>
                        <TableCell>{format(new Date(imp.import_date), 'PPpp')}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(imp.status)}>{imp.status || 'Unknown'}</Badge>
                        </TableCell>
                        <TableCell>{imp.row_count}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        No import history found for this organization.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
