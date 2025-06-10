import React, { useState, useEffect } from "react";
import DashboardLayout from "components/DashboardLayout";
import { FileImportWizard } from "components/FileImportWizard";
import { useOrg } from "components/OrgProvider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, Download, Eye } from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import brain from "brain";

export default function Imports() {
  const { currentOrganization } = useOrg();
  const [importFiles, setImportFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showImportWizard, setShowImportWizard] = useState(false);
  const [activeTab, setActiveTab] = useState("imports");
  const [selectedImport, setSelectedImport] = useState<any>(null);

  // Fetch import files when the component mounts or organization changes
  useEffect(() => {
    if (currentOrganization) {
      fetchImports();
    } else {
      setImportFiles([]);
      setIsLoading(false);
    }
  }, [currentOrganization]);

  const fetchImports = async () => {
    if (!currentOrganization) return;
    
    setIsLoading(true);
    try {
      const response = await brain.list_imports({ organization_id: currentOrganization.id });
      const importIds = await response.json();
      
      // If there are imports, fetch their details
      const importDetails = [];
      for (const importId of importIds) {
        try {
          // Extract the import ID from the filename
          const idMatch = importId.match(/import_([a-f0-9]+)/);
          if (idMatch && idMatch[1]) {
            const detailResponse = await brain.get_import({ import_id: idMatch[1] });
            const detail = await detailResponse.json();
            importDetails.push(detail);
          }
        } catch (error) {
          console.error("Error fetching import details:", error);
        }
      }
      
      // Sort by timestamp, newest first
      importDetails.sort((a, b) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
      
      setImportFiles(importDetails);
    } catch (error) {
      console.error("Error fetching imports:", error);
      toast.error("Failed to load import history");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportComplete = (importId: string) => {
    // Refresh the list of imports
    fetchImports();
    // Hide the import wizard
    setShowImportWizard(false);
    // Show a success message
    toast.success("Import completed successfully");
  };

  const handleViewImport = (importData: any) => {
    setSelectedImport(importData);
    setActiveTab("preview");
  };

  const getDataTypeLabel = (type: string) => {
    switch (type) {
      case "trial_balance":
        return "Trial Balance";
      case "profit_loss":
        return "Profit & Loss";
      case "balance_sheet":
        return "Balance Sheet";
      default:
        return type;
    }
  };

  const renderPreview = () => {
    if (!selectedImport) return null;

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">
              {getDataTypeLabel(selectedImport.data_type)}
            </h2>
            <p className="text-muted-foreground">
              Imported on {format(new Date(selectedImport.timestamp), "PPP")}
            </p>
          </div>
          <Button variant="outline" onClick={() => setActiveTab("imports")}>
            Back to Imports
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Import Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Import ID</dt>
                <dd className="text-sm">{selectedImport.import_id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Organization</dt>
                <dd className="text-sm">{currentOrganization?.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Data Type</dt>
                <dd className="text-sm">{getDataTypeLabel(selectedImport.data_type)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Items</dt>
                <dd className="text-sm">{selectedImport.data.length} records</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Preview</CardTitle>
            <CardDescription>
              Showing up to 100 records from your import
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedImport.data.length > 0 ? (
              <div className="border rounded-md overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Object.keys(selectedImport.data[0]).map((key) => (
                        <TableHead key={key}>{key}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedImport.data.slice(0, 100).map((item: any, idx: number) => (
                      <TableRow key={idx}>
                        {Object.values(item).map((value: any, valueIdx: number) => (
                          <TableCell key={valueIdx}>
                            {typeof value === "object" ? JSON.stringify(value) : value}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-center py-4 text-muted-foreground">
                No data available for this import
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderImports = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!currentOrganization) {
      return (
        <Card className="text-center py-12">
          <CardHeader>
            <div className="mx-auto bg-muted w-12 h-12 flex items-center justify-center rounded-full mb-4">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle>No Organization Selected</CardTitle>
            <CardDescription>
              Please select an organization to manage imports.
            </CardDescription>
          </CardHeader>
        </Card>
      );
    }

    if (importFiles.length === 0) {
      return (
        <Card className="text-center py-12">
          <CardHeader>
            <div className="mx-auto bg-muted w-12 h-12 flex items-center justify-center rounded-full mb-4">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle>No Imports Found</CardTitle>
            <CardDescription>
              You haven't imported any financial data yet. Get started by clicking the Import Data button.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowImportWizard(true)} className="mt-4">
              <PlusCircle className="mr-2 h-4 w-4" /> Import Data
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Import History</CardTitle>
          <CardDescription>
            View and manage your financial data imports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Records</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {importFiles.map((importFile, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">
                      {getDataTypeLabel(importFile.data_type)}
                    </TableCell>
                    <TableCell>
                      {format(new Date(importFile.timestamp), "PPP")}
                    </TableCell>
                    <TableCell>{importFile.data.length}</TableCell>
                    <TableCell className="font-mono text-xs truncate max-w-[120px]">
                      {importFile.import_id}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewImport(importFile)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">Data Imports</h1>
            <p className="text-muted-foreground">
              Import and manage your financial data
            </p>
          </div>
          {currentOrganization && !showImportWizard && (
            <Button onClick={() => setShowImportWizard(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Import Data
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="imports">Imports</TabsTrigger>
            {selectedImport && (
              <TabsTrigger value="preview">Data Preview</TabsTrigger>
            )}
          </TabsList>
          <TabsContent value="imports" className="space-y-6">
            {showImportWizard ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Import Financial Data</h2>
                  <Button
                    variant="ghost"
                    onClick={() => setShowImportWizard(false)}
                  >
                    Cancel
                  </Button>
                </div>
                <FileImportWizard
                  organizationId={currentOrganization?.id || ""}
                  onImportComplete={handleImportComplete}
                />
              </div>
            ) : (
              renderImports()
            )}
          </TabsContent>
          <TabsContent value="preview">{renderPreview()}</TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
