import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { Download, FileText, Table, Image, FileSpreadsheet, Presentation } from "lucide-react";
import brain from "brain";

export interface ReportExportProps {
  reportType: "board" | "management" | "investor" | "executive" | "custom";
  reportName?: string;
  onExportStart?: () => void;
  onExportComplete?: (downloadUrl: string) => void;
  className?: string;
  buttonVariant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary";
}

const formatIcons = {
  pdf: <FileText className="h-4 w-4 mr-2" />,
  pptx: <Presentation className="h-4 w-4 mr-2" />,
  xlsx: <FileSpreadsheet className="h-4 w-4 mr-2" />,
  csv: <Table className="h-4 w-4 mr-2" />,
  png: <Image className="h-4 w-4 mr-2" />
};

export function ReportExport({
  reportType,
  reportName,
  onExportStart,
  onExportComplete,
  className = "",
  buttonVariant = "outline"
}: ReportExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [openPopover, setOpenPopover] = useState(false);

  const handleExport = async (format: "pdf" | "pptx" | "xlsx" | "csv" | "png") => {
    try {
      setIsExporting(true);
      setOpenPopover(false);
      
      if (onExportStart) {
        onExportStart();
      }

      toast.info(`Preparing ${format.toUpperCase()} export...`);
      
      // Call the API to export the report
      const response = await brain.export_report({
        reportType,
        reportName,
        format
      });
      
      const data = await response.json();
      
      // Create a temporary anchor element to trigger the download
      if (data.downloadUrl) {
        toast.success(`${format.toUpperCase()} export ready`, {
          description: `Your report has been exported successfully.`,
          action: {
            label: "Download",
            onClick: () => window.open(data.downloadUrl, "_blank")
          }
        });
        
        if (onExportComplete) {
          onExportComplete(data.downloadUrl);
        }
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error(`Failed to export as ${format.toUpperCase()}`, {
        description: "There was an error exporting your report. Please try again."
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <Popover open={openPopover} onOpenChange={setOpenPopover}>
      <PopoverTrigger asChild>
        <Button 
          variant={buttonVariant} 
          className={className}
          disabled={isExporting}
        >
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? "Exporting..." : "Export"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56" align="end">
        <div className="grid gap-1">
          <Button
            variant="ghost"
            className="flex justify-start text-sm"
            onClick={() => handleExport("pdf")}
            disabled={isExporting}
          >
            {formatIcons.pdf}
            Export as PDF
          </Button>
          <Button
            variant="ghost"
            className="flex justify-start text-sm"
            onClick={() => handleExport("pptx")}
            disabled={isExporting}
          >
            {formatIcons.pptx}
            Export as PowerPoint
          </Button>
          <Button
            variant="ghost"
            className="flex justify-start text-sm"
            onClick={() => handleExport("xlsx")}
            disabled={isExporting}
          >
            {formatIcons.xlsx}
            Export as Excel
          </Button>
          <Button
            variant="ghost"
            className="flex justify-start text-sm"
            onClick={() => handleExport("csv")}
            disabled={isExporting}
          >
            {formatIcons.csv}
            Export as CSV
          </Button>
          <Button
            variant="ghost"
            className="flex justify-start text-sm"
            onClick={() => handleExport("png")}
            disabled={isExporting}
          >
            {formatIcons.png}
            Export as Image
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
