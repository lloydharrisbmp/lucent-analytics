import React, { useState, useEffect, useCallback } from 'react';
import { CashFlowScenarioComparison } from 'components/CashFlowScenarioComparison';
import { WorkingCapitalDashboard } from 'components/WorkingCapitalDashboard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import brain from 'brain';
import { ScenarioSummary, ScenarioApplyResponse } from 'types'; // Assuming types exist in types.ts
import { formatCurrency, determineAustralianSeason, generateSampleWorkingCapitalData } from "utils/financial-data"; // Added import

// Define the target interface (or import if available elsewhere)
interface CashFlowScenario {
  id: string;
  name: string;
  description: string;
  assumptions: { label: string; value: string }[];
  probabilityRating: "high" | "medium" | "low";
  monthlyProjections: {
    month: string;
    operatingCashFlow: number;
    investingCashFlow: number;
    financingCashFlow: number;
    netCashFlow: number;
    endingCashBalance: number;
  }[];
  metrics: {
    averageMonthlyBurn: number;
    peakNegativeCashFlow: number;
    runwayMonths: number;
    lowestCashBalance: number;
    highestCashBalance: number;
  };
}

// Transformation function
const transformApiDataToScenario = (
  scenarioSummary: ScenarioSummary,
  calculatedData: ScenarioApplyResponse['calculatedForecastData'] | null // Can be null if not fetched/error
): CashFlowScenario | null => {
  if (!calculatedData || !calculatedData.columns || !calculatedData.data) {
    // Return null or a default structure if data is missing
    // For now, let's return null if projections are missing
     return null;
  }

  // Find indices of required columns
  const monthIndex = calculatedData.columns.indexOf("Month");
  const opCfIndex = calculatedData.columns.indexOf("OperatingCashFlow");
  const invCfIndex = calculatedData.columns.indexOf("InvestingCashFlow");
  const finCfIndex = calculatedData.columns.indexOf("FinancingCashFlow");
  const netCfIndex = calculatedData.columns.indexOf("NetCashFlow");
  const endBalIndex = calculatedData.columns.indexOf("EndingCashBalance");

  // Basic validation if columns exist
  if ([monthIndex, opCfIndex, invCfIndex, finCfIndex, netCfIndex, endBalIndex].includes(-1)) {
      console.error("Missing expected columns in calculatedForecastData", calculatedData.columns);
      // Handle error - maybe return null or throw? For now, return null.
      return null;
  }

  const monthlyProjections = calculatedData.data.map(row => ({
    month: String(row[monthIndex]),
    operatingCashFlow: Number(row[opCfIndex]),
    investingCashFlow: Number(row[invCfIndex]),
    financingCashFlow: Number(row[finCfIndex]),
    netCashFlow: Number(row[netCfIndex]),
    endingCashBalance: Number(row[endBalIndex]),
  }));

  return {
    id: scenarioSummary.scenarioId,
    name: scenarioSummary.name,
    // --- Placeholders ---
    description: scenarioSummary.description || "Scenario description placeholder", // Use summary description if available
    assumptions: [{ label: "Placeholder Assumption", value: "N/A" }],
    probabilityRating: "medium", // Default placeholder
    metrics: { // Default placeholders
      averageMonthlyBurn: 0,
      peakNegativeCashFlow: 0,
      runwayMonths: 0,
      lowestCashBalance: 0,
      highestCashBalance: 0,
    },
    // --- Mapped Data ---
    monthlyProjections: monthlyProjections,
  };
};
import { toast } from 'sonner';
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Layers } from "lucide-react";

// TODO: Need to import relevant types if not already in types.ts
// import { ScenarioSummary, ScenarioApplyResponse } from 'brain/data-contracts'; 

const CashFlowDashboard = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('quarterly');
  const [selectedYear, setSelectedYear] = useState('2025');
  
  // State for scenarios
  const [scenarios, setScenarios] = useState<ScenarioSummary[]>([]);
  const [selectedScenarioAId, setSelectedScenarioAId] = useState<string | null>(null);
  const [selectedScenarioBId, setSelectedScenarioBId] = useState<string | null>(null);
  // const [scenarioAData, setScenarioAData] = useState<ScenarioApplyResponse['calculatedForecastData'] | null>(null); // Removed, using comparisonScenarios
const [comparisonScenarios, setComparisonScenarios] = useState<CashFlowScenario[]>([]);
  // const [scenarioBData, setScenarioBData] = useState<ScenarioApplyResponse['calculatedForecastData'] | null>(null); // Removed, using comparisonScenarios
  const [isLoadingScenarios, setIsLoadingScenarios] = useState<boolean>(true);
  const [isLoadingComparison, setIsLoadingComparison] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // TODO: State/logic for working capital data if it's also dynamic
  // For now, keep the sample data generation if needed elsewhere on the page
  const workingCapitalData = generateSampleWorkingCapitalData(12); 
  
  // Fetch available scenarios on mount
  useEffect(() => {
    const fetchScenarios = async () => {
      setIsLoadingScenarios(true);
      setError(null);
      try {
        const response = await brain.list_scenarios({});
        if (response.ok) {
          const data: ScenarioSummary[] = await response.json();
          setScenarios(data || []);
          // Optionally set default selections
          // if (data && data.length > 0) {
          //   setSelectedScenarioAId(data[0].scenarioId); 
          // }
          // if (data && data.length > 1) {
          //   setSelectedScenarioBId(data[1].scenarioId);
          // }
        } else {
          const errorText = await response.text();
          console.error("Failed to fetch scenarios:", response.status, errorText);
          const errorMsg = `Failed to load scenarios: ${response.status} ${errorText || response.statusText}`;
          setError(errorMsg);
          toast.error("Failed to load scenario list.");
        }
      } catch (err: any) {
        console.error("Error fetching scenarios:", err);
        setError("An unexpected error occurred while fetching scenarios.");
        toast.error("An unexpected error occurred while fetching scenarios.");
      } finally {
        setIsLoadingScenarios(false);
      }
    };

    fetchScenarios();
    fetchScenarios();
  }, []);

  // Fetch calculated data when selections change
  useEffect(() => {
    const fetchComparisonData = async () => {
      if (!selectedScenarioAId && !selectedScenarioBId) {
        setScenarioAData(null);
        setScenarioBData(null);
        setError(null); // Clear errors if nothing is selected
        setComparisonScenarios([]); // Clear comparison data if nothing selected
        return;
        return;
      }

      setIsLoadingComparison(true);
      setError(null);
      // setScenarioAData(null); // Clear previous data
      // setScenarioBData(null);
      setComparisonScenarios([]); // Clear previous comparison data 

      const scenarioA = scenarios.find(s => s.scenarioId === selectedScenarioAId);
      const scenarioB = scenarios.find(s => s.scenarioId === selectedScenarioBId);

      let commonBaseForecastId: string | undefined | null = null;

      // Determine and validate baseForecastId
      if (scenarioA) {
        commonBaseForecastId = scenarioA.baseForecastId;
      }
      if (scenarioB) {
        if (commonBaseForecastId && scenarioB.baseForecastId !== commonBaseForecastId) {
          const errorMsg = "Cannot compare scenarios derived from different base forecasts.";
          setError(errorMsg);
          toast.error(errorMsg);
          setIsLoadingComparison(false);
          return;
        } 
        if (!commonBaseForecastId) { // If only B is selected
           commonBaseForecastId = scenarioB.baseForecastId;
        } 
      }

      if (!commonBaseForecastId) {
        const errorMsg = "Selected scenario(s) must have an associated base forecast ID.";
        setError(errorMsg);
        // Only show toast if a scenario is actually selected but missing the ID
        if (scenarioA || scenarioB) { 
            toast.error(errorMsg);
        }
        setIsLoadingComparison(false);
        return;
      }
      
      // Fetch data for selected scenarios
      try {
        const requests: Promise<any>[] = [];
        if (scenarioA) {
          console.log(`Fetching data for Scenario A: ${scenarioA.scenarioId} using base: ${commonBaseForecastId}`);
          requests.push(
            brain.apply_scenario({ scenario_id: scenarioA.scenarioId }, { baseForecastId: commonBaseForecastId })
              .then(async response => {
                  if (!response.ok) throw new Error(`Scenario A (${scenarioA.name}): ${await response.text() || response.statusText}`);
                  return await response.json();
              })
              .then(data => {
                  scenarioAData = data.calculatedForecastData; // Store temporarily
              })
              .catch(err => { throw new Error(`Failed to apply Scenario A (${scenarioA.name}): ${err.message}`) })
          );
        }
        if (scenarioB) {
          console.log(`Fetching data for Scenario B: ${scenarioB.scenarioId} using base: ${commonBaseForecastId}`);
           requests.push(
            brain.apply_scenario({ scenario_id: scenarioB.scenarioId }, { baseForecastId: commonBaseForecastId })
              .then(async response => {
                  if (!response.ok) throw new Error(`Scenario B (${scenarioB.name}): ${await response.text() || response.statusText}`);
                  return await response.json();
              })
              .then(data => {
                   scenarioBData = data.calculatedForecastData; // Store temporarily
              })
              .catch(err => { throw new Error(`Failed to apply Scenario B (${scenarioB.name}): ${err.message}`) })
          );
        }

        let scenarioAData: CalculatedForecastData | null = null;
        let scenarioBData: CalculatedForecastData | null = null;

        await Promise.all(requests);
        console.log("Successfully fetched raw comparison data. Transforming...");

        // Now transform and update state
        const transformedScenarios: CashFlowScenario[] = [];
        if (scenarioA && scenarioAData) {
            const transformedA = transformApiDataToScenario(scenarioA, scenarioAData);
            if (transformedA) transformedScenarios.push(transformedA);
        }
         if (scenarioB && scenarioBData) {
            const transformedB = transformApiDataToScenario(scenarioB, scenarioBData);
             if (transformedB) transformedScenarios.push(transformedB);
        }
         
         setComparisonScenarios(transformedScenarios);
         console.log("Transformed scenarios set:", transformedScenarios);

      } catch (err: any) {
        console.error("Error fetching comparison data:", err);
        const errorMsg = err.message || "An unexpected error occurred while applying scenarios.";
        setError(errorMsg); 
        toast.error(errorMsg);
         setComparisonScenarios([]); // Clear scenarios on error
      } finally {
        setIsLoadingComparison(false);
      }
    };

    fetchComparisonData();

  }, [selectedScenarioAId, selectedScenarioBId, scenarios]); // Rerun when selections or the list of scenarios change
  
  // Format date range
  const getDateRange = () => {
    const year = selectedYear;
    if (selectedTimeframe === 'monthly') {
      return `Monthly View - ${year}`;
    } else if (selectedTimeframe === 'quarterly') {
      return `Quarterly View - ${year}`;
    } else {
      return `Annual View - ${year}`;
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cash Flow Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive view of cash flow projections, working capital, and seasonal trends
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="annual">Annual</SelectItem>
            </SelectContent>
          </Select>
          <Button>Export Report</Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="scenarios">Scenario Analysis</TabsTrigger>
          <TabsTrigger value="workingcapital">Working Capital</TabsTrigger>
          <TabsTrigger value="seasonality">Seasonal Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Cash Position</CardTitle>
                <CardDescription>Current as of today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">$1,245,000</div>
                <p className="text-sm text-muted-foreground">+5.2% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Operating Cash Flow</CardTitle>
                <CardDescription>Last 90 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">$342,500</div>
                <p className="text-sm text-muted-foreground">-2.1% vs previous period</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Cash Runway</CardTitle>
                <CardDescription>Based on current burn rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">18 months</div>
                <p className="text-sm text-muted-foreground">+3 months from last forecast</p>
              </CardContent>
            </Card>
          </div>

          {/* Scenario Selection and Comparison Section */}
          <Card className="mt-6">
             <CardHeader>
                <CardTitle>Scenario Comparison</CardTitle>
                <CardDescription>Select scenarios from the list below to compare their projected cash flow.</CardDescription>
             </CardHeader>
            <CardContent>
               {/* Scenario Selectors */} 
              {isLoadingScenarios ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                   <div>
                      <Label htmlFor="scenario-a-loading">Compare Scenario A</Label>
                      <Skeleton className="h-10 w-full mt-1" />
                   </div>
                    <div>
                      <Label htmlFor="scenario-b-loading">With Scenario B</Label>
                      <Skeleton className="h-10 w-full mt-1" />
                   </div>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <Label htmlFor="scenario-a">Compare Scenario A</Label>
                    <Select 
                      value={selectedScenarioAId || ""} 
                      onValueChange={(value) => setSelectedScenarioAId(value || null)}
                      disabled={scenarios.length === 0}
                    >
                      <SelectTrigger id="scenario-a">
                        <SelectValue placeholder="Select Scenario A" />
                      </SelectTrigger>
                      <SelectContent>
                         <SelectItem value=""><em>None</em></SelectItem>
                        {scenarios.length === 0 ? (
                          <SelectItem value="no-scenarios" disabled>No scenarios available</SelectItem>
                        ) : (
                          scenarios.map((scenario) => (
                            <SelectItem key={scenario.scenarioId} value={scenario.scenarioId} disabled={scenario.scenarioId === selectedScenarioBId}>
                              {scenario.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="scenario-b">With Scenario B</Label>
                    <Select 
                      value={selectedScenarioBId || ""} 
                      onValueChange={(value) => setSelectedScenarioBId(value || null)}
                      disabled={scenarios.length === 0 || !selectedScenarioAId} // Disable if no scenarios or A not selected
                    >
                      <SelectTrigger id="scenario-b">
                        <SelectValue placeholder="Select Scenario B" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value=""><em>None</em></SelectItem>
                        {scenarios.length === 0 ? (
                          <SelectItem value="no-scenarios" disabled>No scenarios available</SelectItem>
                        ) : (
                          scenarios.map((scenario) => (
                            <SelectItem key={scenario.scenarioId} value={scenario.scenarioId} disabled={scenario.scenarioId === selectedScenarioAId}>
                              {scenario.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                     {!selectedScenarioAId && <p className="text-xs text-muted-foreground mt-1">Select Scenario A first</p>}
                  </div>
                </div>
               )} 

               {/* Comparison Chart Area */} 
              {isLoadingComparison ? (
                <div>
                  <Skeleton className="h-96 w-full" />
                  <Skeleton className="h-10 w-1/2 mt-4" />
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error Loading Comparison Data</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : comparisonScenarios.length > 0 ? (
                (() => {
                    // Calculate dynamic date range from the first scenario's data
                    let dynamicDateRange = "Date Range Unavailable"; // Default value
                    const firstScenario = comparisonScenarios[0];
                    if (firstScenario && firstScenario.monthlyProjections && firstScenario.monthlyProjections.length > 0) {
                      const projections = firstScenario.monthlyProjections;
                      const firstMonth = projections[0].month;
                      const lastMonth = projections[projections.length - 1].month;
                      if (firstMonth && lastMonth) {
                        if (firstMonth === lastMonth) {
                          dynamicDateRange = firstMonth;
                        } else {
                          dynamicDateRange = `${firstMonth} - ${lastMonth}`;
                        }
                      }
                    }
                    
                    return (
                      <CashFlowScenarioComparison
                        scenarios={comparisonScenarios}
                        defaultScenarioId={selectedScenarioAId}
                        comparisonScenarioId={selectedScenarioBId}
                        startingCashBalance={50000} // TODO: Source this dynamically later
                        dateRange={dynamicDateRange} // Use calculated range
                        isLoading={isLoadingComparison}
                        error={error}
                      />
                    );
                  })()
              ) : (
                <div className="flex flex-col items-center justify-center h-48 border border-dashed rounded-md">
                   <Layers className="h-8 w-8 text-muted-foreground mb-2" />
                   <p className="text-muted-foreground text-center">
                     {selectedScenarioAId || selectedScenarioBId
                       ? "Select scenarios with valid base forecast IDs to compare, or check for errors."
                       : "Select one or two scenarios above to see the comparison."}
                    </p>
                 </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="scenarios" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Scenario Comparison</CardTitle>
              <CardDescription>
                Compare baseline, optimistic, and conservative cash flow scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CashFlowScenarioComparison 
                scenarios={[baselineScenario, optimisticScenario, conservativeScenario]}
                defaultScenarioId="scenario1"
                comparisonScenarioId="scenario3"
                startingCashBalance={baselineScenario.startingBalance}
                dateRange={getDateRange()}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="workingcapital" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Working Capital Analysis</CardTitle>
              <CardDescription>
                Detailed breakdown of working capital components and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WorkingCapitalDashboard 
                monthlyData={workingCapitalData.monthlyData}
                benchmarkData={workingCapitalData.benchmarkData}
                focusArea="overall"
                dateRange={workingCapitalData.dateRange}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="seasonality" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Seasonal Cash Flow Patterns</CardTitle>
              <CardDescription>
                Identify seasonal patterns in revenue, expenses, and cash flow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CashFlowScenarioComparison 
                scenarios={[baselineScenario, optimisticScenario]}
                defaultScenarioId="scenario1"
                startingCashBalance={baselineScenario.startingBalance}
                dateRange={`Monthly View - ${selectedYear}`}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Working Capital Seasonal Impact</CardTitle>
              <CardDescription>
                How seasonal trends affect inventory, receivables, and payables
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WorkingCapitalDashboard 
                monthlyData={workingCapitalData.monthlyData}
                benchmarkData={workingCapitalData.benchmarkData}
                focusArea="inventory"
                dateRange={workingCapitalData.dateRange}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CashFlowDashboard;