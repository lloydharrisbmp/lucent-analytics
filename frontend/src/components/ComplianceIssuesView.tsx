import React, { useState, useEffect } from "react";
import { useUserGuardContext } from "app";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, AlertTriangle, CheckCircle, Clock, Info, RefreshCw } from "lucide-react";
import { useNotificationsStore } from "utils/notificationsStore";
import NotificationBell from "components/NotificationBell";
import brain from "brain";

interface ValidationIssue {
  severity: "error" | "warning" | "info";
  code: string;
  message: string;
  field?: string;
  details?: Record<string, any>;
  remediation?: string;
  validation_type?: string;
}

interface ComplianceIssuesViewProps {
  entityId?: string;
  refreshTrigger?: number; // Optional prop to trigger refresh from parent
}

const ComplianceIssuesView: React.FC<ComplianceIssuesViewProps> = ({ entityId, refreshTrigger = 0 }) => {
  const { user } = useUserGuardContext();
  const { generateComplianceAlerts } = useNotificationsStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [complianceResults, setComplianceResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("all");
  
  const fetchComplianceData = async () => {
    if (!entityId) return;
    
    setIsLoading(true);
    try {
      // First run compliance checks
      const response = await brain.run_compliance_checks({
        entity: {
          entity_id: entityId
        }
      });
      
      const data = await response.json();
      setComplianceResults(data);
      
      // Generate notifications in the background
      if (user) {
        generateComplianceAlerts(user.uid, entityId);
      }
    } catch (error) {
      console.error("Error fetching compliance data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchComplianceData();
  }, [entityId, refreshTrigger]);
  
  const getIssuesBySeverity = (severity: "error" | "warning" | "info") => {
    if (!complianceResults?.all_issues) return [];
    return complianceResults.all_issues.filter((issue: ValidationIssue) => issue.severity === severity);
  };
  
  const errors = getIssuesBySeverity("error");
  const warnings = getIssuesBySeverity("warning");
  const infos = getIssuesBySeverity("info");
  
  const renderIssueIcon = (severity: string) => {
    switch (severity) {
      case "error":
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "info":
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };
  
  const renderIssues = (issues: ValidationIssue[]) => {
    if (issues.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-gray-500">
          <CheckCircle className="h-12 w-12 mb-2 text-green-500" />
          <p>No issues found in this category</p>
        </div>
      );
    }
    
    return issues.map((issue, index) => (
      <Card key={`${issue.code}-${index}`} className="mb-4 overflow-hidden">
        <CardHeader className={`pb-2 ${issue.severity === "error" ? "bg-red-50" : 
          issue.severity === "warning" ? "bg-amber-50" : "bg-blue-50"}`}>
          <div className="flex items-start gap-2">
            {renderIssueIcon(issue.severity)}
            <div>
              <CardTitle className="text-base">{issue.message}</CardTitle>
              <CardDescription className="text-xs mt-1">
                Issue code: {issue.code}
                {issue.field && ` • Field: ${issue.field}`}
                {issue.validation_type && ` • Type: ${issue.validation_type.replace("_validation", "").replace("_", " ")}`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-4">
          {issue.details && (
            <div className="text-sm mb-3">
              <h4 className="font-medium mb-1">Details:</h4>
              <ul className="list-disc pl-5 space-y-1">
                {Object.entries(issue.details).map(([key, value]) => (
                  <li key={key} className="text-gray-700">
                    <span className="font-medium">{key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}</span>: {String(value)}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {issue.remediation && (
            <div className="text-sm bg-gray-50 p-3 rounded-md border border-gray-200">
              <h4 className="font-medium mb-1">Recommended Action:</h4>
              <p className="text-gray-700">{issue.remediation}</p>
            </div>
          )}
        </CardContent>
      </Card>
    ));
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Compliance Status</h2>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchComplianceData} 
            disabled={isLoading}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <NotificationBell entityId={entityId} />
        </div>
      </div>
      
      {complianceResults ? (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className={`border ${errors.length > 0 ? "border-destructive" : ""}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className={`h-5 w-5 ${errors.length > 0 ? "text-destructive" : "text-gray-400"}`} />
                  Critical Issues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{errors.length}</div>
                <p className="text-sm text-muted-foreground">
                  {errors.length === 0 ? "No critical issues detected" : 
                   errors.length === 1 ? "Critical issue needs immediate attention" : 
                   `${errors.length} critical issues need attention`}
                </p>
              </CardContent>
            </Card>
            
            <Card className={`border ${warnings.length > 0 ? "border-amber-500" : ""}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className={`h-5 w-5 ${warnings.length > 0 ? "text-amber-500" : "text-gray-400"}`} />
                  Warnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{warnings.length}</div>
                <p className="text-sm text-muted-foreground">
                  {warnings.length === 0 ? "No warnings detected" : 
                   warnings.length === 1 ? "Warning should be reviewed" : 
                   `${warnings.length} warnings should be reviewed`}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className={`h-5 w-5 ${infos.length > 0 ? "text-blue-500" : "text-gray-400"}`} />
                  Informational
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{infos.length}</div>
                <p className="text-sm text-muted-foreground">
                  {infos.length === 0 ? "No informational notices" : 
                   infos.length === 1 ? "Informational item available" : 
                   `${infos.length} informational items available`}
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">
                All Issues
                <Badge className="ml-2 bg-gray-200 text-gray-800 hover:bg-gray-200">
                  {complianceResults.all_issues?.length || 0}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="errors">
                Critical
                {errors.length > 0 && (
                  <Badge className="ml-2 bg-red-100 text-red-800 hover:bg-red-100">
                    {errors.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="warnings">
                Warnings
                {warnings.length > 0 && (
                  <Badge className="ml-2 bg-amber-100 text-amber-800 hover:bg-amber-100">
                    {warnings.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="info">
                Info
                {infos.length > 0 && (
                  <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-100">
                    {infos.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              {complianceResults.all_issues?.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 pb-6">
                    <div className="flex flex-col items-center justify-center text-center">
                      <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                      <h3 className="text-xl font-medium mb-2">All Clear!</h3>
                      <p className="text-muted-foreground max-w-md">
                        No compliance issues were detected. Your business is in good standing.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                renderIssues(complianceResults.all_issues)
              )}
            </TabsContent>
            
            <TabsContent value="errors" className="mt-4">
              {renderIssues(errors)}
            </TabsContent>
            
            <TabsContent value="warnings" className="mt-4">
              {renderIssues(warnings)}
            </TabsContent>
            
            <TabsContent value="info" className="mt-4">
              {renderIssues(infos)}
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="animate-pulse flex flex-col items-center">
                <div className="rounded-full bg-gray-200 h-16 w-16 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-[250px] mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-[300px] mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-[270px]"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ComplianceIssuesView;
