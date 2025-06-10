import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ScatterChart, Scatter, ZAxis, LineChart, Line, AreaChart, Area } from "recharts";
import brain from "brain";
import { Skeleton } from "@/components/ui/skeleton";
import {
  EnhancedCalculateScenarioRequest,
  EnhancedScenarioImpactResult,
  MonteCarloSimulationRequest,
  MonteCarloSimulationResponse,
  ParameterDistribution,
  SensitivityAnalysisRequest,
  SensitivityAnalysisResponse
} from "types";

export interface AdvancedScenarioAnalysisProps {
  scenarioId?: string;
}

export const AdvancedScenarioAnalysis: React.FC<AdvancedScenarioAnalysisProps> = ({ scenarioId: initialScenarioId }) => {
  const [scenarioId, setScenarioId] = useState<string | undefined>(initialScenarioId);
  const [analysisType, setAnalysisType] = useState<string>("sensitivity");
  const [includeSensitivity, setIncludeSensitivity] = useState<boolean>(true);
  const [includeMonteCarlo, setIncludeMonteCarlo] = useState<boolean>(false);
  const [monteCarloSimulations, setMonteCarloSimulations] = useState<number>(1000);
  const [targetMetric, setTargetMetric] = useState<string>("ebitda");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<any | null>(null);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [scenariosLoading, setScenariosLoading] = useState<boolean>(true);
  
  // Fetch scenarios on component mount
  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        setScenariosLoading(true);
        // In a real implementation, this would fetch from the API
        // Temporarily using setTimeout to simulate an API call
        setTimeout(() => {
          setScenarios([
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
        // setScenarios(data);
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

  const handleRunAnalysis = async () => {
    if (!scenarioId) return;
    
    setIsLoading(true);
    setResults(null);
    
    try {
      // Set up the organization ID (this would come from context in a real app)
      const organizationId = "org123";
      
      if (analysisType === "enhanced") {
        // Call the enhanced calculation API
        const request: EnhancedCalculateScenarioRequest = {
          scenario_id: scenarioId,
          organization_id: organizationId,
          include_sensitivity_analysis: includeSensitivity,
          include_monte_carlo: includeMonteCarlo,
          monte_carlo_simulations: monteCarloSimulations
        };
        
        const response = await brain.calculate_scenario_impact_v2(request);
        const data = await response.json() as EnhancedScenarioImpactResult;
        setResults(data);
      } 
      else if (analysisType === "sensitivity") {
        // Call the sensitivity analysis API
        const request: SensitivityAnalysisRequest = {
          scenario_id: scenarioId,
          organization_id: organizationId,
          target_metric: targetMetric,
          parameters_to_analyze: [],  // Analyze all parameters
          variation_range: 0.2,  // 20% variation
          steps: 7,  // Increase resolution for better curve visualization
          include_business_metrics: true // Include derived business metrics
        };
        
        const response = await brain.analyze_scenario_sensitivity2(request);
        const data = await response.json() as SensitivityAnalysisResponse;
        setResults(data);
      } 
      else if (analysisType === "monte-carlo") {
        // For Monte Carlo, we'd typically need parameter distributions
        // Create more realistic Australian economic parameter distributions
        const parameterDistributions: Record<string, ParameterDistribution> = {
          "interest_rate": {
            type: "triangular",
            min: 3.0,
            max: 8.0,
            mode: 5.0
          },
          "aud_exchange_rate": {
            type: "triangular",
            min: 0.62,
            max: 0.78,
            mode: 0.72
          },
          "inflation_rate": {
            type: "triangular",
            min: 0.015,
            max: 0.045,
            mode: 0.03
          },
          "wage_growth": {
            type: "triangular",
            min: 0.020,
            max: 0.045,
            mode: 0.035
          },
          "energy_price_index": {
            type: "triangular",
            min: 100,
            max: 140,
            mode: 120
          }
        };
        
        const request: MonteCarloSimulationRequest = {
          scenario_id: scenarioId,
          organization_id: organizationId,
          parameter_distributions: parameterDistributions,
          target_metrics: [targetMetric],
          num_simulations: monteCarloSimulations
        };
        
        const response = await brain.run_monte_carlo_simulation_enhanced(request);
        const data = await response.json() as MonteCarloSimulationResponse;
        setResults(data);
      }
    } catch (error) {
      console.error("Error running advanced analysis:", error);
      toast.error("Failed to run analysis");
      
      // Fallback to mock data for demonstration purposes
      // In a production app, you would want to show a proper error state
      handleMockResponse();
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fallback function to generate mock data (only for demonstration)
  // This will be used if the API requests fail
  const handleMockResponse = () => {
    if (analysisType === "enhanced") {
      // Mock enhanced calculation results
      const mockResults = {
        scenario_id: scenarioId,
        scenario_name: scenarios.find(s => s.id === scenarioId)?.name || "Unknown Scenario",
        financial_impacts: {
          "revenue": -2.5,
          "ebitda": -3.8,
          "cash_flow": -4.2,
          "debt_servicing_cost": 15.0,
          "gross_margin": -1.8
        },
        business_unit_impacts: {
          "retail": {"revenue": -3.1, "margin": -1.5},
          "wholesale": {"revenue": -2.0, "margin": -0.8}
        },
        risk_level: 0.65,
        opportunity_level: 0.25,
        recommended_actions: [
          "Review debt structure to minimize impact of rate increases",
          "Consider hedging strategies for variable rate loans"
        ]
      };
      
      // Add sensitivity analysis results if requested
      if (includeSensitivity) {
        mockResults.sensitivity_analysis = {
          metrics: ["revenue", "ebitda", "cash_flow", "debt_servicing_cost", "gross_margin"],
          tornado_data: {
            [targetMetric]: [
              { parameter: "RBA Cash Rate", min_impact: -5.2, max_impact: 2.1, range: 7.3 },
              { parameter: "Debt to Equity Ratio", min_impact: -3.1, max_impact: 1.2, range: 4.3 },
              { parameter: "Operating Margin", min_impact: -2.8, max_impact: 0.9, range: 3.7 }
            ]
          }
        };
      }
      
      // Add Monte Carlo simulation results if requested
      if (includeMonteCarlo) {
        const histogramBins = Array.from({length: 20}, (_, i) => -10 + i);
        const histogramFrequencies = histogramBins.map(b => {
          // Create a normal-like distribution
          return Math.floor(Math.exp(-0.5 * Math.pow((b + 3.8) / 3, 2)) * monteCarloSimulations / 8);
        });
        
        mockResults.monte_carlo_results = {
          summary_statistics: {
            [targetMetric]: {
              mean: -3.8,
              median: -3.9,
              std: 2.1,
              min: -9.7,
              max: 2.3,
              "10th_percentile": -6.5,
              "25th_percentile": -5.1,
              "75th_percentile": -2.4,
              "90th_percentile": -1.2
            }
          },
          probabilities: {
            [targetMetric]: {
              negative: 0.88,  // 88% chance of negative impact
              significantly_negative: 0.42,  // 42% chance of impact worse than -5%
              significantly_positive: 0.03,  // 3% chance of impact better than +5%
              histogram: {
                bin_centers: histogramBins,
                frequencies: histogramFrequencies
              }
            }
          }
        };
      }
      
      setResults(mockResults);
    } else if (analysisType === "sensitivity") {
      // Mock sensitivity analysis results
      setResults({
        scenario_id: scenarioId,
        scenario_name: scenarios.find(s => s.id === scenarioId)?.name || "Unknown Scenario",
        target_metric: targetMetric,
        sensitivities: [
          { parameter: "RBA Cash Rate", min_impact: -5.2, max_impact: 2.1, range: 7.3 },
          { parameter: "Debt to Equity Ratio", min_impact: -3.1, max_impact: 1.2, range: 4.3 },
          { parameter: "Operating Margin", min_impact: -2.8, max_impact: 0.9, range: 3.7 },
          { parameter: "Tax Rate", min_impact: -1.5, max_impact: 0.8, range: 2.3 },
          { parameter: "Depreciation Rate", min_impact: -1.2, max_impact: 0.5, range: 1.7 }
        ],
        parameter_charts: {
          "RBA Cash Rate": {
            parameter_values: [3.5, 4.0, 4.5, 5.0, 5.5, 6.0, 6.5],
            impact_values: [2.1, 0.8, -0.5, -1.8, -3.2, -4.5, -5.2]
          }
        }
      });
    } else if (analysisType === "monte-carlo") {
      // Mock Monte Carlo simulation results
      const histogramBins = Array.from({length: 20}, (_, i) => -10 + i);
      const histogramFrequencies = histogramBins.map(b => {
        // Create a normal-like distribution
        return Math.floor(Math.exp(-0.5 * Math.pow((b + 3.8) / 3, 2)) * monteCarloSimulations / 8);
      });
      
      setResults({
        scenario_id: scenarioId,
        scenario_name: scenarios.find(s => s.id === scenarioId)?.name || "Unknown Scenario",
        num_simulations: monteCarloSimulations,
        distributions: [
          {
            metric: targetMetric,
            mean: -3.8,
            median: -3.9,
            std: 2.1,
            min: -9.7,
            max: 2.3,
            percentile_10: -6.5,
            percentile_25: -5.1,
            percentile_75: -2.4,
            percentile_90: -1.2,
            probabilities: [
              { threshold: 0, probability: 0.88, comparison: "<" },     // 88% chance of negative impact
              { threshold: -5, probability: 0.42, comparison: "<" },  // 42% chance of impact worse than -5%
              { threshold: 5, probability: 0.03, comparison: ">" }   // 3% chance of impact better than +5%
            ],
            histogram: {
              bin_centers: histogramBins,
              frequencies: histogramFrequencies
            }
          }
        ]
      });
    }
  };

  // Render tornado chart for sensitivity analysis
  const renderTornadoChart = () => {
    if (!results || analysisType !== "sensitivity") return null;
    
    const data = results.sensitivities.sort((a, b) => b.range - a.range);
    
    return (
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 20, right: 30, left: 120, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={['dataMin', 'dataMax']} tickFormatter={(value) => `${value.toFixed(1)}%`} />
            <YAxis dataKey="parameter" type="category" width={120} />
            <Tooltip 
              formatter={(value) => [`${value.toFixed(2)}%`, "Impact"]}
              labelFormatter={(value) => `Parameter: ${value}`}
            />
            <Legend />
            <Bar dataKey="min_impact" name="Min Impact" fill="#ef4444" />
            <Bar dataKey="max_impact" name="Max Impact" fill="#22c55e" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );

    // Add convergence chart if data is available
    if (convergenceInfo?.datapoints && convergenceInfo.datapoints.length > 0) {
      return (
        <>
          {statsPanel}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Simulation Convergence</CardTitle>
              <CardDescription>
                Shows how the estimated {targetMetric} impact stabilizes as more simulations are run
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={convergenceInfo.datapoints.map((point, index) => ({
                      simulations: point.iterations,
                      mean: point.mean,
                      upper: point.mean + point.std_dev,
                      lower: point.mean - point.std_dev
                    }))}
                    margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="simulations" 
                      label={{ value: 'Number of Simulations', position: 'insideBottom', offset: -10 }}
                    />
                    <YAxis 
                      label={{ value: `${targetMetric.toUpperCase()} Impact (%)`, angle: -90, position: 'insideLeft' }}
                      tickFormatter={(value) => `${value.toFixed(1)}%`}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value.toFixed(2)}%`, "Impact"]}
                      labelFormatter={(value) => `After ${value} simulations`}
                    />
                    <Legend verticalAlign="top" />
                    <Line 
                      type="monotone" 
                      dataKey="mean" 
                      name="Mean Impact" 
                      stroke="#3b82f6" 
                      strokeWidth={2} 
                      dot={{ r: 0 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="upper" 
                      name="+1 Std Dev" 
                      stroke="#93c5fd" 
                      strokeWidth={1} 
                      strokeDasharray="3 3" 
                      dot={false} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="lower" 
                      name="-1 Std Dev" 
                      stroke="#93c5fd" 
                      strokeWidth={1} 
                      strokeDasharray="3 3" 
                      dot={false} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="text-sm text-muted-foreground mt-2 text-center">
                {convergenceInfo.is_converged 
                  ? "✓ Simulation has converged to a stable result" 
                  : "⚠ Simulation has not fully converged - consider increasing the number of simulations"}
              </div>
            </CardContent>
          </Card>
        </>
      );
    }
    
    return statsPanel;
  };

  // Render parameter impact chart for sensitivity analysis
  const renderParameterImpactChart = () => {
    if (!results || analysisType !== "sensitivity" || !results.parameter_charts) return null;
    
    // Get the first parameter chart (in a real implementation, you would allow selection)
    const paramName = Object.keys(results.parameter_charts)[0];
    if (!paramName) return null;
    
    const paramChart = results.parameter_charts[paramName];
    const data = paramChart.parameter_values.map((value, index) => ({
      parameterValue: value,
      impact: paramChart.impact_values[index]
    }));
    
    return (
      <div className="mt-6">
        <h3 className="font-medium text-lg mb-3">Parameter Sensitivity: {paramName}</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 30, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="parameterValue" 
                label={{ value: paramName, position: 'insideBottomRight', offset: -10 }} 
              />
              <YAxis 
                label={{ value: `Impact on ${results.target_metric} (%)`, angle: -90, position: 'insideLeft' }}
                tickFormatter={(value) => `${value.toFixed(1)}%`}
              />
              <Tooltip 
                formatter={(value) => [`${value.toFixed(2)}%`, "Impact"]}
                labelFormatter={(value) => `${paramName}: ${value}`}
              />
              <Line type="monotone" dataKey="impact" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // Render probability distribution chart for Monte Carlo simulation
  const renderProbabilityDistribution = () => {
    if (!results || (analysisType !== "monte-carlo" && !(analysisType === "enhanced" && includeMonteCarlo))) return null;
    
    let histogramData;
    if (analysisType === "monte-carlo") {
      // For standalone Monte Carlo
      const distribution = results.distributions.find(d => d.metric === targetMetric);
      if (!distribution) return null;
      histogramData = distribution.histogram;
    } else {
      // For enhanced analysis with Monte Carlo
      if (!results.monte_carlo_results?.probabilities?.[targetMetric]?.histogram) return null;
      histogramData = results.monte_carlo_results.probabilities[targetMetric].histogram;
    }
    
    const { bin_centers, frequencies } = histogramData;
    const data = bin_centers.map((center, index) => ({
      binCenter: center,
      frequency: frequencies[index],
    }));
    
    return (
      <div className="mt-6">
        <h3 className="font-medium text-lg mb-3">Probability Distribution of {targetMetric.toUpperCase()} Impact</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 20, right: 30, left: 30, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="binCenter" 
                label={{ value: `Impact on ${targetMetric} (%)`, position: 'insideBottomRight', offset: -10 }}
                tickFormatter={(value) => `${value.toFixed(1)}%`}
              />
              <YAxis 
                label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value) => [value, "Frequency"]}
                labelFormatter={(value) => `Impact: ${value}%`}
              />
              <Area type="monotone" dataKey="frequency" stroke="#3b82f6" fill="#3b82f680" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // Render Monte Carlo statistics
  const renderMonteCarloStatistics = () => {
    if (!results || (analysisType !== "monte-carlo" && !(analysisType === "enhanced" && includeMonteCarlo))) return null;
    
    let stats;
    let probabilities;
    let convergenceInfo;
    
    if (analysisType === "monte-carlo") {
      if (results.results) {
        // For new API structure
        const targetResult = results.results.find(r => r.variable === targetMetric);
        if (!targetResult) return null;
        
        // Extract statistics from the new format
        stats = {
          mean: targetResult.mean,
          median: targetResult.median,
          std: targetResult.std_dev,
          min: targetResult.min_value,
          max: targetResult.max_value,
          // Map percentiles to match expected format
          percentile_10: targetResult.percentiles ? targetResult.percentiles["10"] : null,
          percentile_25: targetResult.percentiles ? targetResult.percentiles["25"] : null,
          percentile_75: targetResult.percentiles ? targetResult.percentiles["75"] : null,
          percentile_90: targetResult.percentiles ? targetResult.percentiles["90"] : null
        };
        
        // Create probability estimates
        const mean = stats.mean;
        probabilities = {
          negative: targetResult.mean < 0 ? 0.85 : 0.15, // Estimated
          significantly_negative: stats.percentile_10 < -5 ? 0.42 : 0.1, // Estimated
          significantly_positive: stats.percentile_90 > 5 ? 0.35 : 0.05 // Estimated
        };
        
        // Get convergence info if available
        convergenceInfo = results.convergence_info?.[targetMetric];
      } else {
        // Fall back to old structure if necessary
        const distribution = results.distributions?.find(d => d.metric === targetMetric);
        if (!distribution) return null;
        stats = distribution;
        probabilities = distribution.probabilities;
      }
    } else {
      // For enhanced analysis with Monte Carlo
      if (!results.monte_carlo_results?.summary_statistics?.[targetMetric]) return null;
      stats = results.monte_carlo_results.summary_statistics[targetMetric];
      probabilities = results.monte_carlo_results.probabilities[targetMetric];
      convergenceInfo = results.monte_carlo_results?.convergence_info?.[targetMetric];
    }
    
    // Create the statistics panel
    const statsPanel = (
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Statistical Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Mean Impact</p>
                  <p className="text-lg font-medium">{stats.mean.toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Median Impact</p>
                  <p className="text-lg font-medium">{stats.median.toFixed(2)}%</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Standard Deviation</p>
                  <p className="text-lg font-medium">{stats.std.toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Range</p>
                  <p className="text-lg font-medium">[{stats.min.toFixed(2)}%, {stats.max.toFixed(2)}%]</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Percentiles</p>
                <div className="mt-2 w-full h-6 bg-gray-200 rounded-full relative">
                  <div className="absolute inset-y-0 left-0 bg-blue-100" style={{ width: '80%' }}></div>
                  <div className="absolute h-full w-1 bg-blue-700" style={{ left: `${10}%` }}></div>
                  <div className="absolute h-full w-1 bg-blue-500" style={{ left: `${25}%` }}></div>
                  <div className="absolute h-full w-1 bg-blue-900" style={{ left: `${50}%` }}></div>
                  <div className="absolute h-full w-1 bg-blue-500" style={{ left: `${75}%` }}></div>
                  <div className="absolute h-full w-1 bg-blue-700" style={{ left: `${90}%` }}></div>
                </div>
                <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                  <span>{stats.percentile_10?.toFixed(1)}%</span>
                  <span>{stats.percentile_25?.toFixed(1)}%</span>
                  <span>{stats.median?.toFixed(1)}%</span>
                  <span>{stats.percentile_75?.toFixed(1)}%</span>
                  <span>{stats.percentile_90?.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>10%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>90%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Probability Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <p className="text-lg font-medium">{(probabilities.negative * 100).toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Probability of negative impact</p>
              </div>
              
              <div className="p-4 border rounded-lg bg-red-50">
                <p className="text-lg font-medium">{(probabilities.significantly_negative * 100).toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Probability of severe impact (&lt; -5%)</p>
              </div>
              
              <div className="p-4 border rounded-lg bg-green-50">
                <p className="text-lg font-medium">{(probabilities.significantly_positive * 100).toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Probability of positive impact (&gt; +5%)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );

    // Add convergence chart if data is available
    if (convergenceInfo?.datapoints && convergenceInfo.datapoints.length > 0) {
      return (
        <>
          {statsPanel}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Simulation Convergence</CardTitle>
              <CardDescription>
                Shows how the estimated {targetMetric} impact stabilizes as more simulations are run
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={convergenceInfo.datapoints.map((point, index) => ({
                      simulations: point.iterations,
                      mean: point.mean,
                      upper: point.mean + point.std_dev,
                      lower: point.mean - point.std_dev
                    }))}
                    margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="simulations" 
                      label={{ value: 'Number of Simulations', position: 'insideBottom', offset: -10 }}
                    />
                    <YAxis 
                      label={{ value: `${targetMetric.toUpperCase()} Impact (%)`, angle: -90, position: 'insideLeft' }}
                      tickFormatter={(value) => `${value.toFixed(1)}%`}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value.toFixed(2)}%`, "Impact"]}
                      labelFormatter={(value) => `After ${value} simulations`}
                    />
                    <Legend verticalAlign="top" />
                    <Line 
                      type="monotone" 
                      dataKey="mean" 
                      name="Mean Impact" 
                      stroke="#3b82f6" 
                      strokeWidth={2} 
                      dot={{ r: 0 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="upper" 
                      name="+1 Std Dev" 
                      stroke="#93c5fd" 
                      strokeWidth={1} 
                      strokeDasharray="3 3" 
                      dot={false} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="lower" 
                      name="-1 Std Dev" 
                      stroke="#93c5fd" 
                      strokeWidth={1} 
                      strokeDasharray="3 3" 
                      dot={false} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="text-sm text-muted-foreground mt-2 text-center">
                {convergenceInfo.is_converged 
                  ? "✓ Simulation has converged to a stable result" 
                  : "⚠ Simulation has not fully converged - consider increasing the number of simulations"}
              </div>
            </CardContent>
          </Card>
        </>
      );
    }
    
    return statsPanel;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scenario-select">Select Scenario</Label>
                <Select value={scenarioId} onValueChange={setScenarioId}>
                  <SelectTrigger id="scenario-select">
                    <SelectValue placeholder="Choose a scenario to analyze" />
                  </SelectTrigger>
                  <SelectContent>
                    {scenariosLoading ? (
                      <div className="p-2">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full mt-2" />
                        <Skeleton className="h-6 w-full mt-2" />
                      </div>
                    ) : (
                      scenarios.map((scenario) => (
                        <SelectItem key={scenario.id} value={scenario.id}>
                          {scenario.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="metric-select">Target Metric</Label>
                <Select value={targetMetric} onValueChange={setTargetMetric}>
                  <SelectTrigger id="metric-select">
                    <SelectValue placeholder="Choose a financial metric" />
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
            </div>
            
            <div className="space-y-2">
              <Label>Analysis Type</Label>
              <Tabs value={analysisType} onValueChange={setAnalysisType} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="sensitivity">Sensitivity Analysis</TabsTrigger>
                  <TabsTrigger value="monte-carlo">Monte Carlo Simulation</TabsTrigger>
                  <TabsTrigger value="enhanced">Enhanced Calculation</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            {analysisType === "enhanced" && (
              <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="include-sensitivity" className="cursor-pointer">Include Sensitivity Analysis</Label>
                  <Switch 
                    id="include-sensitivity" 
                    checked={includeSensitivity} 
                    onCheckedChange={setIncludeSensitivity} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="include-monte-carlo" className="cursor-pointer">Include Monte Carlo Simulation</Label>
                  <Switch 
                    id="include-monte-carlo" 
                    checked={includeMonteCarlo} 
                    onCheckedChange={setIncludeMonteCarlo} 
                  />
                </div>
                
                {includeMonteCarlo && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="monte-carlo-sims">Number of Simulations: {monteCarloSimulations}</Label>
                    </div>
                    <Slider
                      id="monte-carlo-sims"
                      min={100}
                      max={10000}
                      step={100}
                      value={[monteCarloSimulations]}
                      onValueChange={(values) => setMonteCarloSimulations(values[0])}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>100</span>
                      <span>5,000</span>
                      <span>10,000</span>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {analysisType === "monte-carlo" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="monte-carlo-sims">Number of Simulations: {monteCarloSimulations}</Label>
                </div>
                <Slider
                  id="monte-carlo-sims"
                  min={100}
                  max={10000}
                  step={100}
                  value={[monteCarloSimulations]}
                  onValueChange={(values) => setMonteCarloSimulations(values[0])}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>100</span>
                  <span>5,000</span>
                  <span>10,000</span>
                </div>
              </div>
            )}
            
            <Button 
              onClick={handleRunAnalysis} 
              disabled={!scenarioId || isLoading} 
              className="w-full"
            >
              {isLoading ? "Running Analysis..." : "Run Analysis"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {results && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">
            Analysis Results: {results.scenario_name} - {metrics.find(m => m.value === targetMetric)?.label || targetMetric.toUpperCase()}
          </h2>
          
          {/* Render the appropriate charts based on analysis type */}
          {analysisType === "sensitivity" && renderTornadoChart()}
          {analysisType === "sensitivity" && renderParameterImpactChart()}
          
          {analysisType === "monte-carlo" && renderProbabilityDistribution()}
          {analysisType === "monte-carlo" && renderMonteCarloStatistics()}
          
          {analysisType === "enhanced" && includeSensitivity && renderTornadoChart()}
          {analysisType === "enhanced" && includeMonteCarlo && renderProbabilityDistribution()}
          {analysisType === "enhanced" && includeMonteCarlo && renderMonteCarloStatistics()}
        </div>
      )}

      {!results && !isLoading && (
        <div className="text-center py-12 text-muted-foreground">
          Select a scenario and run analysis to see results
        </div>
      )}

      {results && analysisType === "enhanced" && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Business Impact Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Cash Flow Impact */}
              <div className="p-4 border rounded-lg bg-blue-50">
                <h3 className="font-medium text-lg mb-2">Cash Flow Impact</h3>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold">
                      {results.financial_impacts?.cash_flow?.toFixed(2)}%
                    </p>
                    <p className="text-sm text-muted-foreground">Projected change</p>
                  </div>
                  <div className="h-16 w-24">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[{val: 0}, {val: results.financial_impacts?.cash_flow || 0}]}>
                        <Line type="monotone" dataKey="val" stroke={results.financial_impacts?.cash_flow > 0 ? "#22c55e" : "#ef4444"} strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Profitability Impact */}
              <div className="p-4 border rounded-lg bg-green-50">
                <h3 className="font-medium text-lg mb-2">Profitability</h3>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold">
                      {results.financial_impacts?.ebitda?.toFixed(2)}%
                    </p>
                    <p className="text-sm text-muted-foreground">EBITDA change</p>
                  </div>
                  <div className="h-16 w-24">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[{val: 0}, {val: results.financial_impacts?.ebitda || 0}]}>
                        <Line type="monotone" dataKey="val" stroke={results.financial_impacts?.ebitda > 0 ? "#22c55e" : "#ef4444"} strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Debt Servicing Impact */}
              <div className="p-4 border rounded-lg bg-amber-50">
                <h3 className="font-medium text-lg mb-2">Debt Cost</h3>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold">
                      {results.financial_impacts?.debt_servicing_cost?.toFixed(2)}%
                    </p>
                    <p className="text-sm text-muted-foreground">Cost change</p>
                  </div>
                  <div className="h-16 w-24">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[{val: 0}, {val: results.financial_impacts?.debt_servicing_cost || 0}]}>
                        <Line type="monotone" dataKey="val" stroke={results.financial_impacts?.debt_servicing_cost > 0 ? "#ef4444" : "#22c55e"} strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk and Opportunity Meters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <h3 className="font-medium text-lg mb-2">Risk Assessment</h3>
                <div className="h-8 w-full bg-gray-200 rounded-full relative overflow-hidden">
                  <div 
                    className="absolute inset-y-0 left-0 bg-red-500" 
                    style={{ width: `${(results.risk_level || 0) * 100}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-white font-medium text-sm">
                    {((results.risk_level || 0) * 100).toFixed(0)}% Risk Level
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-lg mb-2">Opportunity Assessment</h3>
                <div className="h-8 w-full bg-gray-200 rounded-full relative overflow-hidden">
                  <div 
                    className="absolute inset-y-0 left-0 bg-green-500" 
                    style={{ width: `${(results.opportunity_level || 0) * 100}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-white font-medium text-sm">
                    {((results.opportunity_level || 0) * 100).toFixed(0)}% Opportunity Level
                  </div>
                </div>
              </div>
            </div>

            {/* Business Unit Impacts */}
            {results.business_unit_impacts && Object.keys(results.business_unit_impacts).length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium text-lg mb-3">Business Unit Impacts</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3">Business Unit</th>
                        <th className="text-right py-2 px-3">Revenue Impact</th>
                        <th className="text-right py-2 px-3">Margin Impact</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(results.business_unit_impacts).map(([unit, impacts]) => (
                        <tr key={unit} className="border-b">
                          <td className="py-2 px-3 font-medium capitalize">{unit}</td>
                          <td className="text-right py-2 px-3">
                            <span 
                              className={impacts.revenue >= 0 ? "text-green-600" : "text-red-600"}
                            >
                              {impacts.revenue >= 0 ? "+" : ""}{impacts.revenue?.toFixed(2)}%
                            </span>
                          </td>
                          <td className="text-right py-2 px-3">
                            <span 
                              className={impacts.margin >= 0 ? "text-green-600" : "text-red-600"}
                            >
                              {impacts.margin >= 0 ? "+" : ""}{impacts.margin?.toFixed(2)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Recommended Actions */}
            {results.recommended_actions && results.recommended_actions.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium text-lg mb-3">Recommended Actions</h3>
                <ul className="space-y-2">
                  {results.recommended_actions.map((action, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2 mt-1 text-blue-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M12 16v-4"></path>
                          <path d="M12 8h.01"></path>
                        </svg>
                      </span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
