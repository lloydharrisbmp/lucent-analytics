import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Removed Label import from here as it's imported below
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import brain from "brain";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // <-- Added RadioGroup
import { Label } from "@/components/ui/label"; // <-- Added Label
import { UploadCloud, FileText, X, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react"; // <-- Added Icons

// Interface for the component props
interface FileImportWizardProps {
  organizationId: string;
  onImportComplete?: (importId: string) => void;
}

// Interface for the upload response data
interface UploadResponseData {
  upload_id: string;
  file_name: string;
  data_type: string;
  columns: string[];
  preview_rows: Record<string, any>[];
  row_count: number;
}

// Interface for column mapping
interface ColumnMapping {
  source_column: string;
  target_field: string | null; // Financial: system field name, Non-financial: null
  user_metric_name?: string; // Non-financial: User defined name
}

type ImportStep = "upload" | "mapping" | "confirmation" | "processing" | "complete";

// Overall data type distinction
type OverallDataType = "financial" | "non-financial";

// Financial data types
const dataTypes = [
  { value: "trial_balance", label: "Trial Balance" },
  { value: "profit_loss", label: "Profit & Loss Statement" },
  { value: "balance_sheet", label: "Balance Sheet" },
];

// Field mappings based on data type
const fieldMappings = {
  trial_balance: [
    { value: "account_code", label: "Account Code" },
    { value: "account_name", label: "Account Name" },
    { value: "debit", label: "Debit" },
    { value: "credit", label: "Credit" },
  ],
  profit_loss: [
    { value: "item_name", label: "Item Name" },
    { value: "amount", label: "Amount" },
    { value: "category", label: "Category" },
  ],
  balance_sheet: [
    { value: "item_name", label: "Item Name" },
    { value: "amount", label: "Amount" },
    { value: "category", label: "Category" },
  ],
};

export function FileImportWizard({
  organizationId,
  onImportComplete,
}: FileImportWizardProps) {
  const [step, setStep] = useState<ImportStep>("upload");
  const [overallDataType, setOverallDataType] = useState<OverallDataType>("financial"); // New state for overall type
  const [financialDataType, setFinancialDataType] = useState<string>(""); // Specific financial type (trial_balance etc.)
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadData, setUploadData] = useState<UploadResponseData | null>(null);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [importDate, setImportDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [progress, setProgress] = useState(0);
  const [importResponse, setImportResponse] = useState<any>(null);
  const [uploadError, setUploadError] = useState<string | null>(null); // Added uploadError state

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setUploadError(null); // Clear previous errors on new file drop
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": ['.csv'],
      "application/vnd.ms-excel": ['.csv', '.xls'],
    },
    maxFiles: 1,
  });

  // Handle data type selection (Specific Financial Type)
  const handleFinancialDataTypeChange = (value: string) => {
    setFinancialDataType(value);
    // Reset mappings when data type changes
    setMappings([]);
  };

  // Handle file upload
  const handleUpload = async () => {
    // Validation
    if (!file) {
      toast.error("Please select a file to upload.");
      return;
    }
    if (overallDataType === 'financial' && !financialDataType) {
       toast.error("Please select a specific financial data type.");
      return;
    }
    
    // Determine the data type string to send to the backend
    // TODO: Backend might need update to accept 'non-financial' or similar
    const effectiveDataType = overallDataType === 'financial' ? financialDataType : 'non-financial'; 

    setIsUploading(true);
    setUploadError(null); // Clear previous errors

    try {
      const formData = new FormData();
      formData.append("file", file);

      // TODO: Update brain call if endpoint changes for non-financial
      const response = await brain.upload_financial_data({ data_type: effectiveDataType }, formData);
      const data = await response.json();
      setUploadData(data);
      setStep("mapping");
      
      // Initialize mappings differently based on overall data type
      initializeDefaultMappings(data.columns, overallDataType, financialDataType);
      
    } catch (error) {
      console.error("Upload error:", error);
      const errorMsg = error instanceof Error ? error.message : "An unknown error occurred during upload.";
      setUploadError(`Upload Failed: ${errorMsg}`);
      toast.error(`Upload Failed: ${errorMsg}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Initialize default mappings based on column names
  const initializeDefaultMappings = (columns: string[], type: OverallDataType, specificFinancialType: string) => {
    const newMappings: ColumnMapping[] = [];

    if (type === 'financial') {
      const availableFields = fieldMappings[specificFinancialType as keyof typeof fieldMappings] || [];
      columns.forEach(column => {
        const lowerColumn = column.toLowerCase().replace(/[^a-z0-9]/gi, ''); // Normalize column name
        
        // Find potential field match based on normalized names
        const matchField = availableFields.find(field => {
          const normalizedFieldLabel = field.label.toLowerCase().replace(/[^a-z0-9]/gi, '');
          const normalizedFieldValue = field.value.toLowerCase().replace(/[^a-z0-9]/gi, '');
          // Check common patterns (e.g., 'accountcode' vs 'account_code')
          return lowerColumn.includes(normalizedFieldValue) || 
                 normalizedFieldValue.includes(lowerColumn) ||
                 lowerColumn.includes(normalizedFieldLabel) ||
                 normalizedFieldLabel.includes(lowerColumn);
        });
        
        newMappings.push({
          source_column: column,
          target_field: matchField ? matchField.value : null, // Map to null if no match
          user_metric_name: undefined // Not used for financial
        });
      });
    } else { // Non-financial
      // For non-financial, initially map all columns with empty user metric name
      columns.forEach(column => {
        newMappings.push({
          source_column: column,
          target_field: null, // Not used for non-financial
          user_metric_name: "" // Default to empty, user needs to fill this
        });
      });
    }
    
    setMappings(newMappings);
  };

  // Handle mapping change
  const handleMappingChange = (sourceColumn: string, value: string) => {
    setMappings(prevMappings => {
      // Create a new array to avoid direct state mutation
      const newMappings = prevMappings.map(mapping => {
        if (mapping.source_column === sourceColumn) {
          if (overallDataType === 'financial') {
            // If user selects "Do not import" (empty string value), set target_field to null
            // Otherwise, set it to the selected value
            return {
              ...mapping,
              target_field: value === "do_not_import" || value === "" ? null : value,
              user_metric_name: undefined // Clear non-financial name
            };
          } else { // Non-financial
            // If the input is empty, treat it as "Do not import"
            // Otherwise, store the user's input
             return {
              ...mapping,
              target_field: null, // Clear financial field
              user_metric_name: value === "" ? undefined : value // Use undefined for 'do not import'
            };
          }
        }
        return mapping; // Return unchanged mapping for other columns
      });

      // If the column wasn't already in mappings (shouldn't happen with initialization, but good practice)
      if (!newMappings.some(m => m.source_column === sourceColumn)) {
         if (overallDataType === 'financial') {
            newMappings.push({
              source_column: sourceColumn,
              target_field: value === "do_not_import" || value === "" ? null : value,
              user_metric_name: undefined
            });
          } else {
             newMappings.push({
              source_column: sourceColumn,
              target_field: null,
              user_metric_name: value === "" ? undefined : value
            });
          }
      }

      return newMappings;
    });
  };

  // Check if required fields are mapped OR if at least one non-financial metric is defined
  const areRequiredFieldsMapped = () => {
    if (overallDataType === 'financial') {
      if (!financialDataType) return false;
      const requiredFields = getRequiredFields(financialDataType);
      // Get only mappings where a target_field is selected (not null or undefined)
      const mappedFields = mappings
          .map((m) => m.target_field)
          .filter((field): field is string => !!field); 
      return requiredFields.every((field) => mappedFields.includes(field));
    } else { // Non-financial
      // Check if at least one column is mapped with a non-empty user_metric_name
      const validMappings = mappings.filter(m => m.user_metric_name && m.user_metric_name.trim() !== '');
      
      // Optional: Check for duplicate metric names
      const metricNames = validMappings.map(m => m.user_metric_name);
      const uniqueMetricNames = new Set(metricNames);
      if (metricNames.length !== uniqueMetricNames.size) {
        toast.error("Duplicate Metric Names: Please ensure all mapped metric names are unique.");
        return false; // Indicate validation failure due to duplicates
      }
      
      // Return true if at least one valid mapping exists
      return validMappings.length > 0;
    }
  };

  // Get required fields based on data type
  const getRequiredFields = (dataType: string): string[] => {
    switch (dataType) {
      case "trial_balance":
        return ["account_code", "account_name", "debit", "credit"];
      case "profit_loss":
        return ["item_name", "amount"];
      case "balance_sheet":
        return ["item_name", "amount"];
      default:
        return [];
    }
  };

  // Handle process
  const handleProcess = async () => {
    if (!uploadData || !areRequiredFieldsMapped()) {
      toast.error("Missing Required Fields: Please map all required fields before proceeding.");
      return;
    }

    setStep("processing");
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 90) {
          clearInterval(progressInterval);
          return prevProgress;
        }
        return prevProgress + 10;
      });
    }, 500);

    try {
      // Prepare request payload
      const requestData = {
        upload_id: uploadData.upload_id,
        data_type: uploadData.data_type,
        date: importDate,
        organization_id: organizationId,
        mappings: mappings,
      };

      const response = await brain.process_financial_data(requestData);
      const data = await response.json();
      
      setImportResponse(data);
      setProgress(100);
      
      setTimeout(() => {
        setStep("complete");
        if (onImportComplete && data.import_id) {
          onImportComplete(data.import_id);
        }
      }, 1000);
      
    } catch (error) {
      console.error("Process error:", error);
      clearInterval(progressInterval);
      toast.error("Processing Failed: There was an error processing your data.");
      setStep("mapping");
    }
  };

  // Generate content based on current step
  const renderStepContent = () => {
    switch (step) {
      case "upload":
        return (
          <div className="space-y-6">
            {/* 1. Select Overall Data Type */}
            <div>
              <Label className="text-base font-semibold">1. Select Data Type</Label>
              <RadioGroup 
                value={overallDataType}
                onValueChange={(value: OverallDataType) => {
                  setOverallDataType(value);
                  setFinancialDataType(''); // Reset specific type if overall changes
                  setMappings([]); // Reset mappings
                }}
                className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem value="financial" id="financial" className="peer sr-only" />
                  <Label
                    htmlFor="financial"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer h-full"
                  >
                    <FileText className="mb-3 h-6 w-6" />
                    Financial Data
                    <span className="text-xs text-muted-foreground mt-1 text-center">Map to Chart of Accounts, P&L, etc.</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="non-financial" id="non-financial" className="peer sr-only" />
                  <Label
                    htmlFor="non-financial"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer h-full"
                  >
                    <UploadCloud className="mb-3 h-6 w-6" />
                    Non-Financial Data
                    <span className="text-xs text-muted-foreground mt-1 text-center">Map columns to Custom Metrics</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            {/* 2. Select Specific Financial Type (if Financial selected) */}
            {overallDataType === 'financial' && (
              <div className="space-y-2">
                <Label htmlFor="financial-data-type" className="text-base font-semibold">2. Select Financial Statement Type</Label>
                <Select value={financialDataType} onValueChange={handleFinancialDataTypeChange}>
                  <SelectTrigger id="financial-data-type">
                    <SelectValue placeholder="Select financial statement type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {dataTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* 3. Upload File */}
            <div>
              <Label className="text-base font-semibold">
                {overallDataType === 'financial' ? '3.' : '2.'} Upload File
              </Label>
              <div
                {...getRootProps()}
                className={`mt-2 flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-primary bg-primary/10"
                    : "border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5"
                }`}
              >
                <input {...getInputProps()} />
                {file ? (
                  <div className="text-center p-4">
                    <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
                    <p className="mt-2 font-semibold">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering dropzone
                        setFile(null);
                        setMappings([]);
                        setUploadData(null);
                        setUploadError(null);
                      }}
                      className="mt-2 text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4 mr-1" /> Remove File
                    </Button>
                  </div>
                ) : isDragActive ? (
                  <p className="text-lg font-semibold text-primary">Drop the file here ...</p>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-center">
                    <UploadCloud className="h-10 w-10 text-muted-foreground" />
                    <p className="text-base font-medium">
                      Drag & drop a CSV file here, or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Maximum file size: 10MB. Supported formats: CSV
                    </p>
                  </div>
                )}
              </div>
              {uploadError && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTitle>Upload Error</AlertTitle>
                  <AlertDescription>{uploadError}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Upload Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleUpload}
                disabled={!file || (overallDataType === 'financial' && !financialDataType) || isUploading}
              >
                {isUploading ? "Uploading..." : "Next: Map Columns"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      case "mapping":
        return (
          <>
            {uploadData && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-md font-medium">Map Columns</h3>
                      <p className="text-sm text-muted-foreground">
                        Map your file columns to our system fields
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="date" className="mr-2">
                        Date:
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={importDate}
                        onChange={(e) => setImportDate(e.target.value)}
                        className="w-auto inline-block"
                      />
                    </div>
                  </div>

                  <Alert className="mb-4">
                    <AlertTitle>Required Fields</AlertTitle>
                    <AlertDescription>
                      {overallDataType === 'financial' 
                        ? `Fields marked with * are required for ${dataTypes.find(dt => dt.value === financialDataType)?.label}`
                        : `Please provide a unique Metric Name for each column you wish to import. Columns left blank will not be imported.`}
                    </AlertDescription>
                  </Alert>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>File Column</TableHead>
                        <TableHead>
                          {overallDataType === 'financial' ? 'Map To Field' : 'Metric Name'}
                        </TableHead>
                        <TableHead>Preview</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {uploadData.columns.map((column) => {
                        const currentMapping = mappings.find(
                          (m) => m.source_column === column
                        );
                        
                        return (
                          <TableRow key={column}>
                            <TableCell className="font-medium">{column}</TableCell>
                            <TableCell>
                              {overallDataType === 'financial' ? (
                                <Select
                                  value={
                                    currentMapping?.target_field || ""
                                  }
                                  onValueChange={(value) =>
                                    handleMappingChange(column, value)
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select field or 'Do not import'" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="do_not_import">Do not import</SelectItem>
                                    {(fieldMappings[financialDataType as keyof typeof fieldMappings] || []).map(
                                      (field) => (
                                        <SelectItem key={field.value} value={field.value}>
                                          {field.label}
                                          {getRequiredFields(financialDataType).includes(field.value) ? " *" : ""}
                                        </SelectItem>
                                      )
                                    )}
                                  </SelectContent>
                                </Select>
                              ) : ( // Non-financial mapping uses Input
                                <Input
                                  placeholder="Enter Metric Name (or leave blank)"
                                  value={currentMapping?.user_metric_name || ""} 
                                  onChange={(e) => handleMappingChange(column, e.target.value)}
                                />
                              )}
                            </TableCell>
                            <TableCell className="max-w-xs truncate text-muted-foreground">
                              {uploadData.preview_rows.length > 0 && uploadData.preview_rows[0][column]}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                <div className="space-y-2">
                  <h3 className="text-md font-medium">Data Preview</h3>
                  <div className="border rounded-md overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {uploadData.columns.map((column) => (
                            <TableHead key={column}>{column}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {uploadData.preview_rows.map((row, idx) => (
                          <TableRow key={idx}>
                            {uploadData.columns.map((column) => (
                              <TableCell key={column}>{row[column]}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <p className="text-xs text-muted-foreground text-right">
                    Showing {uploadData.preview_rows.length} of {uploadData.row_count} rows
                  </p>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep("upload")}>
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep("confirmation")}
                    disabled={!areRequiredFieldsMapped()}
                  >
                    Next: Confirm Import
                  </Button>
                </div>
              </div>
            )}
          </>
        );

      case "confirmation":
        return (
          <>
            <div className="space-y-4">
              <Alert>
                <AlertTitle>Ready to Import</AlertTitle>
                <AlertDescription>
                  You are about to import {uploadData?.row_count} rows of 
                  {overallDataType === 'financial' ? 
                    `${dataTypes.find((t) => t.value === financialDataType)?.label || 'financial'} data` : 
                    'non-financial data'}.
                  Please confirm that your column mappings are correct before proceeding.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h3 className="text-md font-medium">Import Details</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <div className="text-sm text-muted-foreground">Data Type:</div>
                  <div className="text-sm font-medium">
                    {overallDataType === 'financial' ? 
                      dataTypes.find((t) => t.value === financialDataType)?.label : 
                      'Non-Financial (Custom Metrics)'}
                  </div>

                  <div className="text-sm text-muted-foreground">File Name:</div>
                  <div className="text-sm font-medium break-all">{uploadData?.file_name}</div>

                  <div className="text-sm text-muted-foreground">Import Date:</div>
                  <div className="text-sm font-medium">{importDate}</div>

                  <div className="text-sm text-muted-foreground">Row Count:</div>
                  <div className="text-sm font-medium">{uploadData?.row_count}</div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="text-md font-medium">Column Mappings</h3>
                <p className="text-sm text-muted-foreground">
                  {overallDataType === 'financial' ? 
                    'Columns mapped to system fields.' : 
                    'Columns mapped to custom metric names.'}
                  Columns not shown or mapped to \'Do not import\' will be ignored.
                </p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File Column</TableHead>
                      <TableHead>
                        {overallDataType === 'financial' ? 'Mapped To System Field' : 'Mapped To Metric Name'}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mappings
                      .filter(mapping => 
                        overallDataType === 'financial' ? !!mapping.target_field : !!mapping.user_metric_name
                      ) // Filter out unmapped columns
                      .map((mapping) => (
                        <TableRow key={mapping.source_column}>
                          <TableCell className="font-medium">{mapping.source_column}</TableCell>
                          <TableCell>
                            {overallDataType === 'financial' ? 
                              (fieldMappings[financialDataType as keyof typeof fieldMappings]?.find(
                                (f) => f.value === mapping.target_field
                              )?.label || mapping.target_field) :
                              mapping.user_metric_name
                            }
                          </TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep("mapping")}>
                Back to Mapping
              </Button>
              <Button onClick={handleProcess}>Import Data</Button>
            </div>
          </>
        );

      case "processing":
        return (
          <div className="space-y-8 py-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Processing Your Data</h3>
              <p className="text-muted-foreground">
                Please wait while we import and process your financial data.
              </p>
            </div>

            <div className="space-y-2">
              <Progress value={progress} className="w-full h-3" />
              <p className="text-sm text-center text-muted-foreground">
                {progress < 100 ? "Processing..." : "Complete!"}
              </p>
            </div>
          </div>
        );

      case "complete":
        return (
          <div className="space-y-6 py-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Import Successful</h3>
              <p className="text-muted-foreground">
                Your financial data has been successfully imported.
              </p>
            </div>

            {importResponse && (
              <Alert>
                <AlertTitle>Import Complete</AlertTitle>
                <AlertDescription>
                  <p>Successfully imported {importResponse.item_count} items.</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Import ID: {importResponse.import_id}
                  </p>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-center">
              <Button onClick={() => setStep("upload")}>Import Another File</Button>
            </div>
          </div>
        );
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Import Financial Data</CardTitle>
        <CardDescription>
          Import your financial data from CSV files into the system
        </CardDescription>
      </CardHeader>
      <CardContent>{renderStepContent()}</CardContent>
      <CardFooter className="border-t px-6 py-4">
        <div className="flex justify-between w-full items-center">
          <div className="flex space-x-1">
            <div
              className={`h-2 w-2 rounded-full ${step === "upload" ? "bg-primary" : "bg-muted"}`}
            />
            <div
              className={`h-2 w-2 rounded-full ${step === "mapping" ? "bg-primary" : "bg-muted"}`}
            />
            <div
              className={`h-2 w-2 rounded-full ${step === "confirmation" ? "bg-primary" : "bg-muted"}`}
            />
            <div
              className={`h-2 w-2 rounded-full ${step === "processing" || step === "complete" ? "bg-primary" : "bg-muted"}`}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Step {step === "upload" ? 1 : step === "mapping" ? 2 : step === "confirmation" ? 3 : 4} of 4
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}
