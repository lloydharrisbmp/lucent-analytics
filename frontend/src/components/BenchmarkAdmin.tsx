import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import brain from "brain";
import { AlertCircle, Calendar, CheckCircle, Download, FileSpreadsheet, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

type BenchmarkImport = {
  import_id: string;
  source_id: string;
  timestamp: string;
  filename: string;
  data_points: number;
  year: string;
  version: string;
  status: "success" | "error";
  error?: string;
};

type BenchmarkImportDetail = {
  import_details: BenchmarkImport;
  metadata: Record<string, any>;
  sample_data: any[];
};

type BenchmarkSource = {
  id: string;
  name: string;
  url: string;
  description: string;
  last_updated: string | null;
  update_frequency: string;
  data_types: string[];
  industries: string[];
  metrics: string[];
  version_history?: { version: string; date: string; description: string }[];
};

type BenchmarkVersion = {
  source_id: string;
  source_name: string;
  version: string;
  date: string;
  description: string;
};

export const BenchmarkAdmin = () => {
  const [sources, setSources] = useState<BenchmarkSource[]>([]);
  const [imports, setImports] = useState<BenchmarkImport[]>([]);
  const [versions, setVersions] = useState<BenchmarkVersion[]>([]);
  const [importDetails, setImportDetails] = useState<BenchmarkImportDetail | null>(null);
  const [selectedImportId, setSelectedImportId] = useState<string | null>(null);
  
  // Upload form state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [selectedSourceId, setSelectedSourceId] = useState<string>("");
  const [dataYear, setDataYear] = useState<string>(new Date().getFullYear().toString());
  const [version, setVersion] = useState<string>("1.0");
  const [description, setDescription] = useState<string>("");
  
  // Loading states
  const [loading, setLoading] = useState({
    sources: false,
    imports: false,
    versions: false,
    importDetails: false,
    upload: false,
    update: false,
  });

  useEffect(() => {
    fetchBenchmarkSources();
    fetchBenchmarkImports();
    fetchBenchmarkVersions();
  }, []);

  useEffect(() => {
    if (selectedImportId) {
      fetchImportDetails(selectedImportId);
    }
  }, [selectedImportId]);

  const fetchBenchmarkSources = async () => {
    setLoading((prev) => ({ ...prev, sources: true }));
    try {
      const response = await brain.list_benchmark_sources();
      const data = await response.json();
      setSources(data.sources);
    } catch (error) {
      console.error("Error fetching benchmark sources:", error);
      toast.error("Failed to load benchmark sources");
    } finally {
      setLoading((prev) => ({ ...prev, sources: false }));
    }
  };

  const fetchBenchmarkImports = async () => {
    setLoading((prev) => ({ ...prev, imports: true }));
    try {
      const response = await brain.list_imports2({});
      const data = await response.json();
      setImports(data.imports);
    } catch (error) {
      console.error("Error fetching benchmark imports:", error);
      toast.error("Failed to load benchmark imports");
    } finally {
      setLoading((prev) => ({ ...prev, imports: false }));
    }
  };

  const fetchBenchmarkVersions = async () => {
    setLoading((prev) => ({ ...prev, versions: true }));
    try {
      const response = await brain.get_benchmark_versions_endpoint({});
      const data = await response.json();
      setVersions(data.versions);
    } catch (error) {
      console.error("Error fetching benchmark versions:", error);
      toast.error("Failed to load benchmark versions");
    } finally {
      setLoading((prev) => ({ ...prev, versions: false }));
    }
  };

  const fetchImportDetails = async (importId: string) => {
    setLoading((prev) => ({ ...prev, importDetails: true }));
    try {
      const response = await brain.get_import2({
        importId: importId
      });
      const data = await response.json();
      setImportDetails(data);
    } catch (error) {
      console.error(`Error fetching import details for ${importId}:`, error);
      toast.error("Failed to load import details");
    } finally {
      setLoading((prev) => ({ ...prev, importDetails: false }));
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setUploadFile(event.target.files[0]);
    }
  };

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!uploadFile || !selectedSourceId || !dataYear) {
      toast.error("Please select a file, source, and year");
      return;
    }

    setLoading((prev) => ({ ...prev, upload: true }));
    
    // Create form data
    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("source_id", selectedSourceId);
    formData.append("year", dataYear);
    formData.append("version", version);
    if (description) {
      formData.append("description", description);
    }

    try {
      // Call upload endpoint using brain client
      const response = await brain.upload_benchmark_data(formData);
      const data = await response.json();
      
      toast.success(`Successfully uploaded benchmark data: ${data.processed_points} records processed`);
      
      // Reset form
      setUploadFile(null);
      setDescription("");
      setDataYear(new Date().getFullYear().toString());
      setVersion("1.0");
      
      // Reset file input
      const fileInput = document.getElementById("file") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      
      // Refresh data
      fetchBenchmarkImports();
      fetchBenchmarkVersions();
      fetchBenchmarkSources();
    } catch (error) {
      console.error("Error uploading benchmark data:", error);
      toast.error("Failed to upload benchmark data: " + (error.message || "Unknown error"));
    } finally {
      setLoading((prev) => ({ ...prev, upload: false }));
    }
  };

  const handleUpdateBenchmark = async (sourceId: string) => {
    setLoading((prev) => ({ ...prev, update: true }));
    try {
      const response = await brain.update_benchmark_data({
        source_id: sourceId,
        force_update: true,
      });
      const data = await response.json();
      if (data.success) {
        toast.success(`Benchmark data for ${data.updated_source.name} updated successfully`);
        // Refresh data
        fetchBenchmarkSources();
        fetchBenchmarkVersions();
        fetchBenchmarkImports();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error updating benchmark data:", error);
      toast.error("Failed to update benchmark data");
    } finally {
      setLoading((prev) => ({ ...prev, update: false }));
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("en-AU", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateString || "";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Benchmark Data Management</CardTitle>
        <CardDescription>
          Upload, update, and manage industry benchmark data for the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upload">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upload">Upload Data</TabsTrigger>
            <TabsTrigger value="imports">Import History</TabsTrigger>
            <TabsTrigger value="versions">Versions</TabsTrigger>
            <TabsTrigger value="sources">Data Sources</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="file">Benchmark Data File</Label>
                  <Input 
                    id="file" 
                    type="file" 
                    accept=".csv,.xls,.xlsx,.xlsm" 
                    onChange={handleFileChange}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Accepted formats: CSV, Excel (.xls, .xlsx, .xlsm)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="source">Benchmark Source</Label>
                  <Select 
                    value={selectedSourceId} 
                    onValueChange={setSelectedSourceId}
                    required
                  >
                    <SelectTrigger id="source">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      {sources.map((source) => (
                        <SelectItem key={source.id} value={source.id}>
                          {source.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Data Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={dataYear}
                    onChange={(e) => setDataYear(e.target.value)}
                    min="2000"
                    max={new Date().getFullYear() + 1}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="version">Version</Label>
                  <Input
                    id="version"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="1.0"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description of this data version"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading.upload || !uploadFile || !selectedSourceId}
              >
                {loading.upload ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin">◌</div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Benchmark Data
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6">
              <h3 className="text-lg font-medium">Upload Guidelines</h3>
              <Separator className="my-3" />
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">CSV Format</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">Required columns:</p>
                      <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                        <li>industry_code: ANZSIC code or industry identifier</li>
                        <li>industry_name: Full industry name</li>
                        <li>metric_name: Name of the performance metric</li>
                        <li>value: Numeric value (will be converted to percentage if &lt; 1)</li>
                      </ul>
                      <p className="text-sm mt-3">Optional columns:</p>
                      <ul className="list-disc list-inside text-sm mt-2">
                        <li>turnover_range: Revenue bracket (e.g., "$350,000 to $2 million")</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Excel Format</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">Support for multiple sheets:</p>
                      <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                        <li>Each sheet will be processed separately</li>
                        <li>Column headers should be on the first row</li>
                        <li>Same column requirements as CSV</li>
                        <li>ATO Small Business Benchmarks formatting is recognized automatically</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm font-medium">Important Notes:</p>
                  <ul className="list-disc list-inside text-sm mt-2">
                    <li>Each upload creates a new version in the version history</li>
                    <li>Uploading the same version number will overwrite existing data with that version</li>
                    <li>Make sure your data follows the required format to ensure successful processing</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="imports" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Import History</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchBenchmarkImports}
                disabled={loading.imports}
              >
                Refresh
              </Button>
            </div>

            {loading.imports ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin mr-2">◌</div>
                Loading import history...
              </div>
            ) : imports.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No benchmark data imports found. Upload some data to get started.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1 border rounded-md overflow-hidden">
                  <div className="p-3 bg-muted font-medium">Recent Imports</div>
                  <div className="divide-y max-h-[600px] overflow-y-auto">
                    {imports.map((importItem) => {
                      const source = sources.find(s => s.id === importItem.source_id);
                      return (
                        <div 
                          key={importItem.import_id} 
                          className={`p-3 hover:bg-accent cursor-pointer ${selectedImportId === importItem.import_id ? 'bg-accent' : ''}`}
                          onClick={() => setSelectedImportId(importItem.import_id)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium truncate max-w-[200px]">
                                {importItem.filename}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {source?.name || importItem.source_id}
                              </div>
                              <div className="flex items-center mt-1 text-sm">
                                <Calendar className="mr-1 h-3 w-3" /> 
                                {formatDate(importItem.timestamp)}
                              </div>
                            </div>
                            <Badge variant={importItem.status === "success" ? "success" : "destructive"}>
                              {importItem.status === "success" ? (
                                <CheckCircle className="mr-1 h-3 w-3" />
                              ) : (
                                <AlertCircle className="mr-1 h-3 w-3" />
                              )}
                              {importItem.status}
                            </Badge>
                          </div>
                          
                          <div className="mt-2 flex justify-between items-center text-xs">
                            <span className="flex items-center gap-1">
                              <FileSpreadsheet className="h-3 w-3" />
                              {importItem.data_points} records
                            </span>
                            <span>
                              Version: {importItem.version}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="md:col-span-2 border rounded-md overflow-hidden">
                  {selectedImportId ? (
                    loading.importDetails ? (
                      <div className="flex items-center justify-center h-full py-12">
                        <div className="inline-block animate-spin mr-2">◌</div>
                        Loading import details...
                      </div>
                    ) : importDetails ? (
                      <div className="p-4 space-y-4">
                        <div>
                          <h3 className="text-lg font-medium">{importDetails.import_details.filename}</h3>
                          <div className="text-sm text-muted-foreground">
                            Import ID: {importDetails.import_details.import_id}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium">Source</h4>
                            <p className="text-sm">{sources.find(s => s.id === importDetails.import_details.source_id)?.name || importDetails.import_details.source_id}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Status</h4>
                            <Badge variant={importDetails.import_details.status === "success" ? "success" : "destructive"}>
                              {importDetails.import_details.status}
                            </Badge>
                            {importDetails.import_details.error && (
                              <p className="text-sm text-destructive mt-1">{importDetails.import_details.error}</p>
                            )}
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Timestamp</h4>
                            <p className="text-sm">{formatDate(importDetails.import_details.timestamp)}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Data Year</h4>
                            <p className="text-sm">{importDetails.import_details.year}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Version</h4>
                            <p className="text-sm">{importDetails.import_details.version}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Records</h4>
                            <p className="text-sm">{importDetails.import_details.data_points}</p>
                          </div>
                        </div>

                        <Separator />
                        
                        <div>
                          <h4 className="text-sm font-medium mb-2">Metadata</h4>
                          <div className="bg-muted p-3 rounded-md text-sm">
                            <pre className="whitespace-pre-wrap">
                              {JSON.stringify(importDetails.metadata, null, 2)}
                            </pre>
                          </div>
                        </div>

                        {importDetails.sample_data && importDetails.sample_data.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">Sample Data ({Math.min(importDetails.sample_data.length, 10)} records)</h4>
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Industry</TableHead>
                                    <TableHead>Metric</TableHead>
                                    <TableHead className="text-right">Value</TableHead>
                                    <TableHead>Year</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {importDetails.sample_data.slice(0, 10).map((dataPoint, index) => (
                                    <TableRow key={index}>
                                      <TableCell>
                                        <div>{dataPoint.industry_name}</div>
                                        <div className="text-xs text-muted-foreground">{dataPoint.industry_code}</div>
                                      </TableCell>
                                      <TableCell>{dataPoint.metric_name}</TableCell>
                                      <TableCell className="text-right font-medium">
                                        {dataPoint.value < 1 ? `${(dataPoint.value * 100).toFixed(2)}%` : dataPoint.value.toLocaleString()}
                                      </TableCell>
                                      <TableCell>{dataPoint.year}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full py-12 text-muted-foreground">
                        Unable to load import details
                      </div>
                    )
                  ) : (
                    <div className="flex items-center justify-center h-full py-12 text-muted-foreground">
                      Select an import to view details
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="versions" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Version History</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchBenchmarkVersions}
                disabled={loading.versions}
              >
                Refresh
              </Button>
            </div>

            {loading.versions ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin mr-2">◌</div>
                Loading version history...
              </div>
            ) : versions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No version history found. Upload some data to create versions.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {versions.map((version, index) => (
                    <TableRow key={index}>
                      <TableCell>{version.source_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{version.version}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(version.date)}</TableCell>
                      <TableCell>{version.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="sources" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Benchmark Sources</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchBenchmarkSources}
                disabled={loading.sources}
              >
                Refresh
              </Button>
            </div>

            {loading.sources ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin mr-2">◌</div>
                Loading benchmark sources...
              </div>
            ) : (
              <div className="space-y-4">
                {sources.map((source) => (
                  <Card key={source.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{source.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {source.description}
                          </CardDescription>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleUpdateBenchmark(source.id)}
                          disabled={loading.update}
                        >
                          {loading.update ? (
                            <>
                              <div className="mr-2 h-4 w-4 animate-spin">◌</div>
                              Updating...
                            </>
                          ) : (
                            <>Update Data</>
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Data Types</div>
                          <div className="flex flex-wrap gap-1">
                            {source.data_types.map((type, idx) => (
                              <Badge key={idx} variant="secondary">{type}</Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Update Frequency</div>
                          <div>{source.update_frequency}</div>
                        </div>

                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Last Updated</div>
                          <div>
                            {source.last_updated ? (
                              formatDate(source.last_updated)
                            ) : (
                              <span className="text-muted-foreground">Never</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Source URL</div>
                          <a 
                            href={source.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center"
                          >
                            <Download className="mr-1 h-3 w-3" />
                            Visit Data Source
                          </a>
                        </div>
                      </div>

                      {source.version_history && source.version_history.length > 0 && (
                        <div className="mt-4">
                          <div className="text-sm text-muted-foreground mb-1">Version History</div>
                          <div className="flex flex-wrap gap-2">
                            {source.version_history.map((ver, idx) => (
                              <Badge key={idx} variant="outline">
                                v{ver.version}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
