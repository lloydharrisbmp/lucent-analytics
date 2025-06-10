import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import brain from "brain";
import { ScenarioImpactHeatmap } from "./ScenarioImpactHeatmap";
import { ProbabilityDistributionChart } from "./ProbabilityDistributionChart";
import { ScenarioConvergenceChart } from "./ScenarioConvergenceChart";
import { ScenarioInsightsSummary } from "./ScenarioInsightsSummary";

export interface ScenarioComparisonProps {
  initialScenarioIds?: string[];
}

export const ScenarioComparison: React.FC<ScenarioComparisonProps> = ({ initialScenarioIds = [] }) => {
  const [selectedScenarioIds, setSelectedScenarioIds] = useState<string[]>(initialScenarioIds);
  const [availableScenarios, setAvailableScenarios] = useState<any[]>([]);
  const [comparisonResults, setComparisonResults] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [scenariosLoading, setScenariosLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState("sideBySide");
  const [targetMetric, setTargetMetric] = useState<string>("ebitda");

  // Fetch available scenarios on component mount
  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        setScenariosLoading(true);
        // In a real implementation, this would fetch from the API
        // Temporarily using setTimeout to simulate an API call
        setTimeout(() => {
          setAvailableScenarios([
            { id: "scenario-123", name: "Custom Interest Rate Scenario" },
            { id: "template-interest-rate-hike", name: "RBA Interest Rate Hike" },
            { id: "template-aud-depreciation", name: "AUD Depreciation" },
            { id: "template-labor-cost-increase", name: "Labor Cost Increase" },
            { id: "template-supply-chain-disruption", name: "Supply Chain Disruption" },
          ]);
          setScenariosLoading(false);
        }, 1000);
        
        // Uncomment the following code when the API endpoint is ready
        // const response = await brain.list_scenario_templates();
        // const data = await response.json();
        // setAvailableScenarios(data);
        // setScenariosLoading(false);
      } catch (error) {
        console.error("Error fetching scenarios:", error);
        toast.error("Failed to load scenarios");
        setScenariosLoading(false);
      }
    };

    fetchScenarios();
  }, []);

  const metrics = [
    { value: "revenue", label: "Revenue" },
    { value: "ebitda", label: "EBITDA" },
    { value: "cash_flow", label: "Cash Flow" },
    { value: "gross_margin", label: "Gross Margin" },
    { value: "debt_servicing_cost", label: "Debt Servicing Cost" },
    { value: "net_profit", label: "Net Profit" },
    { value: "working_capital", label: "Working Capital" }
  ];

  const addScenario = (scenarioId: string) => {
    if (!selectedScenarioIds.includes(scenarioId)) {
      setSelectedScenarioIds([...selectedScenarioIds, scenarioId]);
    }
  };

  const removeScenario = (scenarioId: string) => {
    setSelectedScenarioIds(selectedScenarioIds.filter(id => id !== scenarioId));
  };

  const runComparison = async () => {
    if (selectedScenarioIds.length < 2) {
      toast.error("Please select at least two scenarios to compare");
      return;
    }

    setIsLoading(true);
    setComparisonResults(null);

    try {
      // Placeholder for actual API call
      // This would be replaced with real API call when endpoint is ready
      const organizationId = "org123";

      // Example structure of what the API might return
      setTimeout(() => {
        const mockResults = {
          scenarios: selectedScenarioIds.map(id => {
            const scenario = availableScenarios.find(s => s.id === id) || { id, name: `Scenario ${id}` };
            return {
              id: scenario.id,
              name: scenario.name,
              financial_impacts: {
                revenue: Math.random() * 1000000 + 500000,
                ebitda: Math.random() * 200000 + 100000,
                net_profit: Math.random() * 150000 + 50000,
                cash_flow: Math.random() * 300000 + 150000,
                gross_margin: Math.random() * 0.15 + 0.3, // as percentage
                debt_servicing_cost: Math.random() * 50000 + 20000,
                working_capital: Math.random() * 400000 + 200000
              },
              business_unit_impacts: {
                operations: { impact: Math.random() * 0.2 - 0.1 },
                finance: { impact: Math.random() * 0.2 - 0.1 },
                sales: { impact: Math.random() * 0.2 - 0.1 },
                marketing: { impact: Math.random() * 0.2 - 0.1 },
                hr: { impact: Math.random() * 0.2 - 0.1 }
              },
              probability_distributions: {
                [targetMetric]: {
                  values: Array.from({ length: 100 }, () => Math.random() * 200000 + 100000),
                  percentiles: {
                    p10: Math.random() * 120000 + 80000,
                    p25: Math.random() * 140000 + 100000,
                    p50: Math.random() * 160000 + 120000,
                    p75: Math.random() * 180000 + 140000,
                    p90: Math.random() * 200000 + 160000
                  }
                }
              }
            };
          }),
          comparative_metrics: {
            risk_difference: selectedScenarioIds.reduce((obj: any, id) => {
              obj[id] = Math.random() * 1 - 0.5;
              return obj;
            }, {}),
            opportunity_difference: selectedScenarioIds.reduce((obj: any, id) => {
              obj[id] = Math.random() * 1 - 0.5;
              return obj;
            }, {})
          }
        };

        setComparisonResults(mockResults);
        setIsLoading(false);
      }, 2000);

      // Uncomment when the API endpoint is ready
      // const response = await brain.compare_with_benchmarks({
      //   scenario_ids: selectedScenarioIds,
      //   organization_id: organizationId,
      //   target_metrics: [targetMetric]
      // });
      // const data = await response.json();
      // setComparisonResults(data);
      // setIsLoading(false);
    } catch (error) {
      console.error("Error running comparison:", error);
      toast.error("Failed to run scenario comparison");
      setIsLoading(false);
    }
  };

  // Function to prepare data for the side-by-side chart
  const prepareSideBySideData = () => {
    if (!comparisonResults) return [];

    return Object.keys(metrics.reduce((obj, metric) => ({ ...obj, [metric.value]: true }), {})).map(metricKey => {
      const metricName = metrics.find(m => m.value === metricKey)?.label || metricKey;
      
      const dataPoint: any = {
        name: metricName,
      };
      
      comparisonResults.scenarios.forEach((scenario: any) => {
        dataPoint[scenario.name] = scenario.financial_impacts[metricKey] || 0;
      });
      
      return dataPoint;
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Scenario Comparison</CardTitle>
        <CardDescription>
          Compare multiple scenarios side-by-side to analyze their impacts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Scenario Selection */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Selected Scenarios</h3>
            <div className="flex space-x-2 items-center">
              <Label htmlFor="scenario-select">Add Scenario:</Label>
              <Select 
                disabled={scenariosLoading} 
                onValueChange={addScenario}
              >
                <SelectTrigger className="w-[240px]">
                  <SelectValue placeholder="Select a scenario" />
                </SelectTrigger>
                <SelectContent>
                  {availableScenarios.map((scenario) => (
                    <SelectItem 
                      key={scenario.id} 
                      value={scenario.id}
                      disabled={selectedScenarioIds.includes(scenario.id)}
                    >
                      {scenario.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {scenariosLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : selectedScenarioIds.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No scenarios selected. Add scenarios to compare them.
            </div>
          ) : (
            <div className="space-y-2">
              {selectedScenarioIds.map(id => {
                const scenario = availableScenarios.find(s => s.id === id);
                return (
                  <div key={id} className="flex justify-between items-center p-3 border rounded-md">
                    <span>{scenario ? scenario.name : id}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeScenario(id)}
                    >
                      Remove
                    </Button>
                  </div>
                );
              })}
              
              <div className="pt-4 flex justify-between items-center">
                <div className="flex space-x-2 items-center">
                  <Label htmlFor="target-metric">Target Metric:</Label>
                  <Select 
                    value={targetMetric} 
                    onValueChange={setTargetMetric}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select metric" />
                    </SelectTrigger>
                    <SelectContent>
                      {metrics.map((metric) => (
                        <SelectItem key={metric.value} value={metric.value}>
                          {metric.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex space-x-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="text-xs">
                        <Download className="h-4 w-4 mr-1" />
                        Export
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-56">
                      <div className="grid gap-1">
                        <Button 
                          variant="ghost" 
                          className="flex justify-start text-sm"
                          onClick={() => {
                            toast.success("Exported to Excel", {
                              description: "Scenario comparison data has been exported to Excel"
                            });
                          }}
                        >
                          <FileSpreadsheet className="h-4 w-4 mr-2" />
                          Export to Excel
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="flex justify-start text-sm"
                          onClick={() => {
                            toast.success("Exported to PDF", {
                              description: "Scenario comparison report has been generated"
                            });
                          }}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Export to PDF
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                
                  <Button 
                    onClick={runComparison} 
                    disabled={selectedScenarioIds.length < 2 || isLoading}
                  >
                    {isLoading ? "Running..." : "Run Comparison"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Comparison Results */}
        {comparisonResults && (
          <div className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="sideBySide">Side-by-Side</TabsTrigger>
                <TabsTrigger value="radar">Radar</TabsTrigger>
                <TabsTrigger value="heatmap">Impact Heatmap</TabsTrigger>
                <TabsTrigger value="probability">Probability</TabsTrigger>
                <TabsTrigger value="convergence">Convergence</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
              </TabsList>
              
              <TabsContent value="sideBySide" className="pt-4">
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={prepareSideBySideData()} 
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 'auto']} />
                      <YAxis dataKey="name" type="category" />
                      <Tooltip />
                      <Legend />
                      {comparisonResults.scenarios.map((scenario: any, index: number) => (
                        <Bar 
                          key={scenario.id} 
                          dataKey={scenario.name} 
                          fill={`hsl(${(index * 137) % 360}, 70%, 50%)`} 
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="radar" className="pt-4">
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart outerRadius={150} data={prepareSideBySideData()}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="name" />
                      <PolarRadiusAxis />
                      <Tooltip />
                      {comparisonResults.scenarios.map((scenario: any, index: number) => (
                        <Radar
                          key={scenario.id}
                          name={scenario.name}
                          dataKey={scenario.name}
                          stroke={`hsl(${(index * 137) % 360}, 70%, 50%)`}
                          fill={`hsl(${(index * 137) % 360}, 70%, 50%)`}
                          fillOpacity={0.3}
                        />
                      ))}
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              
              <TabsContent value="heatmap" className="pt-4">
                <ScenarioImpactHeatmap 
                  scenarios={comparisonResults.scenarios} 
                  targetMetric={targetMetric}
                />
              </TabsContent>
              
              <TabsContent value="probability" className="pt-4">
                <ProbabilityDistributionChart 
                  scenarios={comparisonResults.scenarios} 
                  targetMetric={targetMetric}
                />
              </TabsContent>
              
              <TabsContent value="convergence" className="pt-4">
                <ScenarioConvergenceChart 
                  scenarios={comparisonResults.scenarios.map((scenario: any) => ({
                    ...scenario,
                    time_series: [{
                      metric: targetMetric,
                      values: [
                        { date: "2025-01-01", value: scenario.financial_impacts[targetMetric] * 0.85 },
                        { date: "2025-04-01", value: scenario.financial_impacts[targetMetric] * 0.90 },
                        { date: "2025-07-01", value: scenario.financial_impacts[targetMetric] * 0.95 },
                        { date: "2025-10-01", value: scenario.financial_impacts[targetMetric] * 0.98 },
                        { date: "2026-01-01", value: scenario.financial_impacts[targetMetric] },
                        { date: "2026-04-01", value: scenario.financial_impacts[targetMetric] * 1.05 },
                        { date: "2026-07-01", value: scenario.financial_impacts[targetMetric] * 1.10 },
                        { date: "2026-10-01", value: scenario.financial_impacts[targetMetric] * 1.15 },
                        { date: "2027-01-01", value: scenario.financial_impacts[targetMetric] * 1.20 }
                      ]
                    }]
                  }))}
                  targetMetric={targetMetric}
                />
              </TabsContent>
              
              <TabsContent value="insights" className="pt-4">
                <ScenarioInsightsSummary 
                  scenarios={comparisonResults.scenarios} 
                  targetMetric={targetMetric}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
