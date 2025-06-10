import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRangePicker } from "components/DateRangePicker";
import { ProfitLossStatement } from "components/ProfitLossStatement";
import { BalanceSheetReport } from "components/BalanceSheetReport";
import { CashFlowReport } from "components/CashFlowReport";
import { KPIDashboard } from "components/KPIDashboard";
import { ReportScheduleList } from "components/ReportScheduleList";
import { ReportExport } from "components/ReportExport";
import { ReportScheduler } from "components/ReportScheduler";
import { DateRange, ProfitAndLossStatement as PLType, BalanceSheet as BSType, CashFlowStatement as CFType } from "utils/financial-types"; // Added specific type imports for clarity
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, Download, FileText, Mail, Share2, Info, Users } from "lucide-react"; // Added Info, Users icons
import { toast } from "sonner";
import brain from "brain";
import {
  VarianceAnalysisRequest,
  VarianceAnalysisResponse,
  VarianceItem,
  NarrativeRequest, // Added for narrative generation
  VarianceInput, // Added for narrative generation
} from "types"; // Import necessary types
import { formatCurrency } from "utils/financial-data"; // Reuse currency formatting
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Import Tooltip components
import { CommentThread } from "components/CommentThread"; // Import CommentThread
import { SharingModal } from "components/SharingModal"; // Import SharingModal

import {
  generateSampleProfitAndLoss,
  generateSampleBalanceSheet,
  generateSampleCashFlow,
  generateSampleKPIs,
  generateDateRanges
} from "utils/financial-data";

type ContentType = 'report' | 'dashboard'; // Re-define or import if global type exists

export default function Reports() {
  // Get predefined date ranges and set default
  const dateRanges = generateDateRanges();
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>(dateRanges[1]); // Current month by default
  
  // State for the distribution tab
  const [activeDistributionTab, setActiveDistributionTab] = useState("scheduled");
  
  // Generate sample data based on the selected date range
  const profitAndLossData = generateSampleProfitAndLoss(selectedDateRange);
  const balanceSheetData = generateSampleBalanceSheet(selectedDateRange.endDate);
  const cashFlowData = generateSampleCashFlow(selectedDateRange);
  const kpiGroups = generateSampleKPIs();

  // State for Variance Analysis
  const [varianceData, setVarianceData] = useState<VarianceItem[]>([]);
  const [isVarianceLoading, setIsVarianceLoading] = useState(false);
  const [varianceError, setVarianceError] = useState<string | null>(null);

  // State for Narrative Generation (MYA-201)
  const [narrativeLoadingStatus, setNarrativeLoadingStatus] = useState<Record<string, boolean>>({});
  const [lastComparisonType, setLastComparisonType] = useState<VarianceAnalysisRequest['comparison_type']>('prior_period'); // Store comparison type used
  const [varianceNarratives, setVarianceNarratives] = useState<Record<string, string>>({}); // State to store narratives (MYA-199)

  // State for Sharing Modal (MYA-159)
  const [isSharingModalOpen, setIsSharingModalOpen] = useState(false);
  const [sharingContentType, setSharingContentType] = useState<ContentType | null>(null);
  const [sharingContentId, setSharingContentId] = useState<string | null>(null);
  const [sharingContentName, setSharingContentName] = useState<string | null>(null);

  // Mock permissions state (added/updated for MYA-159 indicator)
  const [mockPermissions, setMockPermissions] = useState<Record<string, string[]>>({});
  
  // Handle date range changes
  const handleDateRangeChange = (range: DateRange) => {
    setSelectedDateRange(range);
  };

  // Function to fetch mock permissions (simulated async operation - added/updated for MYA-159 indicator)
  const fetchMockPermissions = useCallback(async (contentIds: string[]) => {
    console.log(`Fetching permissions for: ${contentIds.join(', ')}`);
    const newPermissions: Record<string, string[]> = {};
    let needsUpdate = false;
    for (const contentId of contentIds) {
      if (!(contentId in mockPermissions)) { // Only fetch if not already fetched
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 50));
        // Example: Share based on report name pattern or randomly
        let sharedWith: string[] = [];
        if (contentId.startsWith("bs-") || contentId.startsWith("variance-")) {
          sharedWith = ["user_portal_client_02", "user_portal_client_03"]; // Share BS and Variance
        } else if (contentId.startsWith("pnl-")) {
          sharedWith = ["user_portal_client_03"]; // Share PnL
        }
        // Add other content types (cf-, kpi-) if needed
        newPermissions[contentId] = sharedWith;
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
        // Update state immutably
        setMockPermissions((prev) => ({
          ...prev,
          ...newPermissions,
        }));
        console.log("Mock permissions updated:", newPermissions);
    }
  }, [mockPermissions]); // Depend on mockPermissions to avoid redundant fetches

  // Effect to fetch permissions when date range changes (added/updated for MYA-159 indicator)
  useEffect(() => {
    const pnlId = `pnl-${selectedDateRange.label}`;
    const bsId = `bs-${format(selectedDateRange.endDate, 'yyyy-MM-dd')}`;
    const cfId = `cf-${selectedDateRange.label}`;
    const kpiId = `kpi-${selectedDateRange.label}`;
    const varianceId = `variance-${selectedDateRange.label}`;
    const reportIdsToFetch = [pnlId, bsId, cfId, kpiId, varianceId];

    fetchMockPermissions(reportIdsToFetch);
    // Run only when selectedDateRange changes, fetch function is stable
  }, [selectedDateRange, fetchMockPermissions]);

  // Handle export success

  // Handle fetching variance data
  const fetchVarianceData = async () => {
    setIsVarianceLoading(true);
    setVarianceError(null);
    setVarianceData([]); // Clear previous data
    setVarianceNarratives({}); // Clear old narratives when fetching new variances

    // Default/Placeholder request parameters - replace with actual inputs later
    const comparisonType: VarianceAnalysisRequest['comparison_type'] = "prior_period"; // Or get from UI input later
    const requestBody: VarianceAnalysisRequest = {
      entity_id: "entity-123", // Placeholder
      report_type: "pnl", // Default to P&L
      period_end_date: selectedDateRange.endDate.toISOString().split('T')[0], // Format date as YYYY-MM-DD
      comparison_type: comparisonType, // Use variable
      thresholds: { absolute: 1000, percentage: 0.1 } // Example thresholds
    };

    try {
      console.log("Fetching variance data with body:", requestBody);
      const response = await brain.calculate_variances(requestBody);
      const data: VarianceAnalysisResponse = await response.json();
      console.log("Variance data received:", data);

      if (data && data.variances) {
        setVarianceData(data.variances);
        setLastComparisonType(comparisonType); // Store the comparison type used

        // ---- START: New logic for batch narrative generation (MYA-161) ----
        const significantVariances = data.variances.filter(v => v.is_significant);
        if (significantVariances.length > 0) {
          console.log(`Found ${significantVariances.length} significant variances to explain.`);
          // Set loading state for all significant items
          setNarrativeLoadingStatus(prev => {
            const newStatus = { ...prev };
            significantVariances.forEach(item => newStatus[item.account_name] = true);
            return newStatus;
          });

          const narrativePromises = significantVariances.map(item =>
            fetchNarrativeForItem(item, selectedDateRange, comparisonType)
          );

          const results = await Promise.allSettled(narrativePromises);

          setVarianceNarratives(prevNarratives => {
            const newNarratives = { ...prevNarratives };
            results.forEach(result => {
              if (result.status === 'fulfilled' && result.value) {
                newNarratives[result.value.accountNameKey] = result.value.narrative;
              } else if (result.status === 'rejected') {
                // This case should be handled by fetchNarrativeForItem returning an error narrative object
                // console.error("A narrative promise was rejected during batch fetch:", result.reason);
                // Potentially find the item and store a generic error if result.value is not available
              }
            });
            return newNarratives;
          });

          // Reset loading state for all processed items
          setNarrativeLoadingStatus(prev => {
            const newStatus = { ...prev };
            significantVariances.forEach(item => newStatus[item.account_name] = false);
            return newStatus;
          });
          
          toast.info(`${significantVariances.length} significant variance(s) processed for explanation.`);
        }
        // ---- END: New logic for batch narrative generation ----
      } else {
        setVarianceData([]);
        console.warn("Variance data format unexpected:", data);
      }
    } catch (error: any) {
      console.error("Error fetching variance data:", error);
      const errorMsg = error?.message || "Failed to fetch variance data";
      setVarianceError(errorMsg);
      toast.error("Error fetching variance data", { description: errorMsg });
    } finally {
      setIsVarianceLoading(false);
    }
  };

  // Sharing Modal Handlers (MYA-159)
  const handleOpenShareModal = (contentType: ContentType, contentId: string, contentName: string) => {
    console.log(`Opening share modal for: ${contentType} - ${contentId} - ${contentName}`);
    setSharingContentType(contentType);
    setSharingContentId(contentId);
    setSharingContentName(contentName);
    setIsSharingModalOpen(true);
  };

  const handleSharingModalClose = () => {
    setIsSharingModalOpen(false);
    // Optionally reset state after a short delay to allow modal fade-out
    // setTimeout(() => {
    //   setSharingContentType(null);
    //   setSharingContentId(null);
    //   setSharingContentName(null);
    // }, 300);
  };

  // Helper function to fetch narrative for a single item (MYA-161)
  const fetchNarrativeForItem = async (item: VarianceItem, currentSelectedDateRange: DateRange, currentLastComparisonType: string) => {
    const accountNameKey = item.account_name;
    // Ensure varianceNarratives and narrativeLoadingStatus are updated for this item's loading state
    // This might be set by the caller, or we can set it here if this function is solely responsible

    const varianceInput: VarianceInput = {
      account_name: item.account_name,
      actual_value: item.actual_value,
      comparison_value: item.comparison_value,
      absolute_variance: item.absolute_variance,
      percentage_variance: item.percentage_variance,
      period: currentSelectedDateRange.label,
      variance_direction: item.variance_direction,
    };
    const requestBody: NarrativeRequest = {
      variances: [varianceInput],
      context: `Analysis for period ${currentSelectedDateRange.label}, comparing against ${currentLastComparisonType}.`,
    };

    try {
      console.log(`Requesting narrative for ${item.account_name} (helper):`, requestBody);
      const response = await brain.generate_variance_narrative(requestBody);
      const narrativeData = await response.json();
      console.log(`Narrative received for ${item.account_name} (helper):`, narrativeData);

      if (narrativeData?.narrative) {
        return { accountNameKey, narrative: narrativeData.narrative, error: null };
      }
      return { accountNameKey, narrative: "Could not generate explanation.", error: "No narrative content" };
    } catch (error: any) {
      console.error(`Error in fetchNarrativeForItem for ${item.account_name}:`, error);
      return { accountNameKey, narrative: `Error: ${error?.message || "Failed to generate narrative"}`, error: error?.message || "Failed to generate narrative" };
    }
  };

  // Handle generating variance narrative (MYA-161 Integration)
  const handleExplainVariance = async (item: VarianceItem) => {
    const accountNameKey = item.account_name;
    setNarrativeLoadingStatus(prev => ({ ...prev, [accountNameKey]: true }));
    // Do not clear previous narrative here, allow fetchNarrativeForItem to return it or new one
    // setVarianceNarratives(prev => ({ ...prev, [accountNameKey]: "" })); 

    // Use selectedDateRange and lastComparisonType from the component's state
    const result = await fetchNarrativeForItem(item, selectedDateRange, lastComparisonType);

    setVarianceNarratives(prev => ({ ...prev, [accountNameKey]: result.narrative }));
    setNarrativeLoadingStatus(prev => ({ ...prev, [accountNameKey]: false }));

    if (result.error) {
      // The error message is already part of result.narrative from fetchNarrativeForItem
      toast.error(`Problem explaining ${accountNameKey}`, { description: result.narrative });
    } else if (result.narrative === "Could not generate explanation.") {
      toast.info(`Could not generate explanation for ${accountNameKey}.`);
    } else {
      // Optionally, a success toast for individual clicks, though tooltip might be enough
      // toast.success(`Explanation ready for ${accountNameKey}`);
    }
  };
  const handleExportSuccess = (downloadUrl: string) => {
    toast.success("Report exported successfully", {
      description: "Your report is ready to download",
      action: {
        label: "Download",
        onClick: () => window.open(downloadUrl, "_blank")
      }
    });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">Financial Reports</h1>
        <div className="flex flex-col md:flex-row gap-2 items-center">
          <DateRangePicker value={selectedDateRange} onChange={handleDateRangeChange} />
        </div>
      </div>
      
      <Tabs defaultValue="profit-loss" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profit-loss">Profit & Loss</TabsTrigger>
          <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
          <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
          <TabsTrigger value="kpis">KPIs</TabsTrigger>
            <TabsTrigger value="variance-analysis">Variance Analysis</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profit-loss">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  Profit & Loss Statement
                  {mockPermissions[`pnl-${selectedDateRange.label}`]?.length > 0 && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      <Users className="mr-1 h-3 w-3" /> Shared
                    </span>
                  )}
                </CardTitle>
                <CardDescription>Summary of revenue, costs, and expenses for {selectedDateRange.label}</CardDescription>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleOpenShareModal('report', `pnl-${selectedDateRange.label}`, `P&L - ${selectedDateRange.label}`)} 
                      aria-label="Share Profit & Loss Report"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Share this P&L view</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardHeader>
            <CardContent>
              <ProfitLossStatement data={profitAndLossData} />
                        </CardContent>
            <CardFooter className="pt-6 border-t">
              <div>
                  <h3 className="text-lg font-medium mb-4">Comments</h3>
                   <CommentThread 
                    contextType="report-pnl" 
                    contextId={selectedDateRange.label} 
                  />
               </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="balance-sheet">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  Balance Sheet
                  {mockPermissions[`bs-${format(selectedDateRange.endDate, 'yyyy-MM-dd')}`]?.length > 0 && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      <Users className="mr-1 h-3 w-3" /> Shared
                    </span>
                  )}
                </CardTitle>
                <CardDescription>Assets, liabilities, and equity as of {selectedDateRange.endDate.toLocaleDateString()}</CardDescription>
              </div>
               <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleOpenShareModal('report', `bs-${format(selectedDateRange.endDate, 'yyyy-MM-dd')}`, `Balance Sheet - ${format(selectedDateRange.endDate, 'yyyy-MM-dd')}`)} 
                      aria-label="Share Balance Sheet Report"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Share this Balance Sheet view</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardHeader>
            <CardContent>
              <BalanceSheetReport data={balanceSheetData} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="cash-flow">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  Cash Flow Statement
                  {mockPermissions[`cf-${selectedDateRange.label}`]?.length > 0 && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      <Users className="mr-1 h-3 w-3" /> Shared
                    </span>
                  )}
                </CardTitle>
                <CardDescription>Cash generated and used during {selectedDateRange.label}</CardDescription>
              </div>
               <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                     <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleOpenShareModal('report', `cf-${selectedDateRange.label}`, `Cash Flow - ${selectedDateRange.label}`)} 
                      aria-label="Share Cash Flow Report"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Share this Cash Flow view</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardHeader>
            <CardContent>
              <CashFlowReport data={cashFlowData} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="kpis">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  Key Performance Indicators
                  {mockPermissions[`kpi-${selectedDateRange.label}`]?.length > 0 && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      <Users className="mr-1 h-3 w-3" /> Shared
                    </span>
                  )}
                </CardTitle>
                <CardDescription>Financial metrics for {selectedDateRange.label}</CardDescription>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                     <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleOpenShareModal('report', `kpi-${selectedDateRange.label}`, `KPIs - ${selectedDateRange.label}`)} 
                      aria-label="Share KPIs Report"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Share this KPI view</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardHeader>
            <CardContent>
              <KPIDashboard kpiGroups={kpiGroups} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Variance Analysis Tab */}
        <TabsContent value="variance-analysis">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center">
                    Variance Analysis
                    {mockPermissions[`variance-${selectedDateRange.label}`]?.length > 0 && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        <Users className="mr-1 h-3 w-3" /> Shared
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Compares actual results against budget, prior period, or prior year for {selectedDateRange.label}.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                         <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleOpenShareModal('report', `variance-${selectedDateRange.label}`, `Variance Analysis - ${selectedDateRange.label}`)} 
                          aria-label="Share Variance Analysis Report"
                          disabled={varianceData.length === 0} // Disable if no data generated yet
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{varianceData.length === 0 ? "Calculate variance first" : "Share this Variance Analysis view"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Button onClick={fetchVarianceData} disabled={isVarianceLoading}>
                    {isVarianceLoading ? "Loading..." : "Calculate Variances"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {varianceError && (
                <div className="text-red-600 mb-4">Error: {varianceError}</div>
              )}
              {isVarianceLoading && !varianceError && (
                <div>Loading variance data...</div>
              )}
              {!isVarianceLoading && !varianceError && varianceData.length === 0 && (
                <div>No variance data to display. Click "Calculate Variances" to fetch data.</div>
              )}
              {!isVarianceLoading && !varianceError && varianceData.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account</TableHead>
                      <TableHead className="text-right">Actual</TableHead>
                      <TableHead className="text-right">Comparison</TableHead>
                      <TableHead className="text-right">Absolute Variance</TableHead>
                      <TableHead className="text-right">Percentage Variance</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {varianceData.map((item, index) => (
                      <TableRow key={index} className={item.is_significant ? "bg-yellow-100 dark:bg-yellow-900" : ""}>
                        <TableCell className="font-medium">{item.account_name}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.actual_value)}</TableCell>
                        <TableCell className="text-right">{item.comparison_value !== null && item.comparison_value !== undefined ? formatCurrency(item.comparison_value) : "N/A"}</TableCell>
                        <TableCell className="text-right">{item.absolute_variance !== null && item.absolute_variance !== undefined ? formatCurrency(item.absolute_variance) : "N/A"}</TableCell>
                        <TableCell className="text-right">
                          {item.percentage_variance !== null && item.percentage_variance !== undefined
                            ? `${(item.percentage_variance * 100).toFixed(2)}%`
                            : "N/A"}
                        </TableCell>
                        {/* Actions Column Cell */}
                        <TableCell>
                          {item.is_significant && (
                            <TooltipProvider delayDuration={100}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleExplainVariance(item)}
                                    disabled={narrativeLoadingStatus[item.account_name]}
                                  >
                                    {narrativeLoadingStatus[item.account_name] ? "Explaining..." : "Explain"} {/* Shorter text */}
                                  </Button>
                                </TooltipTrigger>
                                {varianceNarratives[item.account_name] && (
                                  <TooltipContent>
                                    <p className="max-w-xs">{varianceNarratives[item.account_name]}</p>
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution">
          <div className="grid grid-cols-1 gap-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Report Distribution</h2>
                <p className="text-muted-foreground">Manage report delivery and distribution</p>
              </div>
              
              <div className="flex gap-2">
                <ReportExport 
                  reportType="board"
                  reportName={`Financial Report - ${selectedDateRange.label}`}
                  onExportComplete={handleExportSuccess}
                />
                
                <ReportScheduler
                  reportType="board"
                  reportName={`Financial Report - ${selectedDateRange.label}`}
                />
              </div>
            </div>
            
            <Tabs value={activeDistributionTab} onValueChange={setActiveDistributionTab}>
              <TabsList className="w-full md:w-auto grid grid-cols-3 mb-4">
                <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="feedback">Feedback</TabsTrigger>
              </TabsList>
              
              <TabsContent value="scheduled" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Scheduled Reports</CardTitle>
                    <CardDescription>
                      View and manage your scheduled report deliveries
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ReportScheduleList />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="history" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Delivery History</CardTitle>
                    <CardDescription>
                      View history of report deliveries
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Sample delivery history - in real app this would come from API */}
                      {[
                        {
                          id: "1",
                          reportName: "Q1 Financial Performance",
                          deliveryDate: new Date(2025, 0, 15),
                          recipients: 5,
                          formats: ["PDF", "XLSX"]
                        },
                        {
                          id: "2",
                          reportName: "Monthly Cash Flow Update",
                          deliveryDate: new Date(2025, 1, 5),
                          recipients: 3,
                          formats: ["PDF"]
                        },
                        {
                          id: "3",
                          reportName: "Board Financial Report",
                          deliveryDate: new Date(2025, 2, 20),
                          recipients: 8,
                          formats: ["PDF", "PPTX"]
                        }
                      ].map(delivery => (
                        <div key={delivery.id} className="flex items-start space-x-4 p-4 bg-muted/30 rounded-lg">
                          <div className="rounded-full bg-primary/10 p-2">
                            <Mail className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{delivery.reportName}</h4>
                              <div className="flex items-center space-x-1">
                                <p className="text-sm text-muted-foreground">
                                  {format(delivery.deliveryDate, "MMM d, yyyy")}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4 mt-2">
                              <div className="flex items-center">
                                <Mail className="h-4 w-4 mr-1 text-muted-foreground" />
                                <span className="text-sm">{delivery.recipients} recipients</span>
                              </div>
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 mr-1 text-muted-foreground" />
                                <span className="text-sm">
                                  {delivery.formats.join(", ")}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                toast.success("Report details", {
                                  description: `Viewing delivery details for ${delivery.reportName}`
                                });
                              }}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-center border-t p-4">
                    <Button variant="outline">View More</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="feedback" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recipient Feedback</CardTitle>
                    <CardDescription>
                      Feedback received from report recipients
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Sample feedback - in real app this would come from API */}
                      {[
                        {
                          id: "1",
                          name: "David Thompson",
                          reportName: "Q1 Financial Performance",
                          date: new Date(2025, 0, 16),
                          rating: 4,
                          comment: "Great report format, but would appreciate more trend analysis in future reports."
                        },
                        {
                          id: "2",
                          name: "Sarah Williams",
                          reportName: "Monthly Cash Flow Update",
                          date: new Date(2025, 1, 6),
                          rating: 5,
                          comment: "Excellent presentation of data. The cash flow projections were particularly useful for our planning."
                        },
                        {
                          id: "3",
                          name: "Robert Chen",
                          reportName: "Board Financial Report",
                          date: new Date(2025, 2, 22),
                          rating: 3,
                          comment: "Good overall, but needs more contextual information to interpret the results properly."
                        }
                      ].map(feedback => (
                        <div key={feedback.id} className="p-4 bg-muted/30 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{feedback.name}</h4>
                              <p className="text-sm text-muted-foreground">{feedback.reportName}</p>
                            </div>
                            <div className="flex">
                              {Array.from({length: 5}).map((_, i) => (
                                <svg
                                  key={i}
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill={i < feedback.rating ? "currentColor" : "none"}
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className={i < feedback.rating ? "text-amber-500" : "text-muted-foreground"}
                                >
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                              ))}
                            </div>
                          </div>
                          <p className="mt-2">{feedback.comment}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {format(feedback.date, "MMMM d, yyyy")}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-center border-t p-4">
                    <Button variant="outline">View More Feedback</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>
      </Tabs>

      {/* Sharing Modal Instance (MYA-159) */}
      <SharingModal
        isOpen={isSharingModalOpen}
        onOpenChange={handleSharingModalClose}
        contentType={sharingContentType}
        contentId={sharingContentId}
        contentName={sharingContentName}
        // onSharingUpdate={() => {}}
         // Optional: Add callback if you need to refresh data after sharing
      />

    </DashboardLayout>
  );
}
