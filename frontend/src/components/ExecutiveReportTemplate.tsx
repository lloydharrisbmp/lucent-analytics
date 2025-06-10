import React, { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer, Share2 } from "lucide-react";
import { format } from "date-fns";

export interface ExecutiveReportProps {
  title: string;
  description?: string;
  date: Date;
  organization: string;
  preparedBy?: string;
  children: ReactNode;
  onExport?: () => void;
  onPrint?: () => void;
  onShare?: () => void;
  footer?: ReactNode;
}

export function ExecutiveReportTemplate({
  title,
  description,
  date,
  organization,
  preparedBy,
  children,
  onExport = () => {},
  onPrint = () => {},
  onShare = () => {},
  footer
}: ExecutiveReportProps) {
  return (
    <div className="executive-report">
      <Card className="shadow-md border-t-4 border-t-primary">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-semibold">{title}</CardTitle>
              {description && <CardDescription>{description}</CardDescription>}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={onPrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={onShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground mt-3">
            <div>Organization: <span className="font-medium">{organization}</span></div>
            <div>Date: <span className="font-medium">{format(date, "MMMM d, yyyy")}</span></div>
            {preparedBy && <div>Prepared by: <span className="font-medium">{preparedBy}</span></div>}
          </div>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
        {footer && (
          <CardFooter className="border-t pt-4 text-sm text-muted-foreground">
            {footer}
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
