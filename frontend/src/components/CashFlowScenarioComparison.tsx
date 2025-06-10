import React, { useState } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Brush,
  ComposedChart,
  Cell
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, ArrowUpDown, Calendar, CalendarDays, Layers, Lightbulb, TrendingDown, TrendingUp } from "lucide-react";
import { formatCurrency, determineAustralianSeason, generateSampleScenario } from "utils/financial-data";

interface CashFlowScenario {
  id: string;
  name: string;
  description: string;
  assumptions: {
    label: string;
    value: string;
  }[];
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

interface CashFlowComparisonProps {
  scenarios: CashFlowScenario[];
  defaultScenarioId?: string;
  comparisonScenarioId?: string;
  startingCashBalance: number;
  dateRange: string; // e.g., "Q1 2025" or "Jan 2025 - Mar 2025"
}

export function CashFlowScenarioComparison({ 
  scenarios, 
  defaultScenarioId, 
  comparisonScenarioId, 
  startingCashBalance,
  dateRange 
}: CashFlowComparisonProps) {
  // Select default scenarios
  const [baseScenarioId, setBaseScenarioId] = useState<string>(defaultScenarioId || scenarios[0].id);
  const [compareScenarioId, setCompareScenarioId] = useState<string>(comparisonScenarioId || scenarios[1]?.id);
  const [showCumulativeFlow, setShowCumulativeFlow] = useState<boolean>(true);
  const [highlightDifference, setHighlightDifference] = useState<boolean>(true);
  const [showSeasonality, setShowSeasonality] = useState<boolean>(true);
  const [visualizationType, setVisualizationType] = useState<'line' | 'area' | 'composed'>('composed');
  
  // Get selected scenarios
  const baseScenario = scenarios.find(s => s.id === baseScenarioId) || scenarios[0];
  const compareScenario = scenarios.find(s => s.id === compareScenarioId);
  
  // Define seasonal periods for highlighting
  const seasonalPeriods = baseScenario.monthlyProjections.map(item => {
    const [month, year] = item.month.split(' ');
    const date = new Date(Date.parse(`${month} 1, ${year}`));
    const season = determineAustralianSeason(date);
    return {
      month: item.month,
      name: `${season} ${year}`,
      start: item.month,
      end: item.month,
      season,
      color: season === 'Summer' ? '#fef9c3' : // Yellow for summer
             season === 'Winter' ? '#e0f2fe' : // Light blue for winter
             season === 'Autumn' ? '#fed7aa' : // Orange for autumn
             '#dcfce7', // Green for spring
      isKeyPeriod: season === 'Summer' || season === 'Winter' // Highlight summer and winter as key periods
    };
  });
  
  // Group consecutive seasons for highlighting
  const groupedSeasonalPeriods = [];
  let currentGroup = { season: "", name: "", start: "", end: "", color: "" };
  
  seasonalPeriods.forEach((period, index) => {
    if (period.isKeyPeriod) {
      if (currentGroup.season !== period.season) {
        // Start a new group
        if (currentGroup.season) {
          groupedSeasonalPeriods.push({ ...currentGroup });
        }
        currentGroup = {
          season: period.season,
          name: period.name,
          start: period.month,
          end: period.month,
          color: period.color
        };
      } else {
        // Continue the current group
        currentGroup.end = period.month;
      }
    } else if (currentGroup.season && index > 0 && seasonalPeriods[index - 1].isKeyPeriod) {
      // End of a group
      groupedSeasonalPeriods.push({ ...currentGroup });
      currentGroup = { season: "", name: "", start: "", end: "", color: "" };
    }
  });
  
  // Add the last group if it exists
  if (currentGroup.season) {
    groupedSeasonalPeriods.push({ ...currentGroup });
  }
  
  // Helper to determine if a given month is within a seasonal period
  const isWithinSeasonalPeriod = (month: string) => {
    const matchedPeriod = seasonalPeriods.find(p => p.month === month);
    return matchedPeriod?.isKeyPeriod || false;
  };
  
  // Generate comparison data
  const getComparisonData = () => {
    if (!compareScenario) return baseScenario.monthlyProjections;
    
    // Combine data from both scenarios
    return baseScenario.monthlyProjections.map((monthData, index) => {
      const compareMonthData = compareScenario.monthlyProjections[index];
      
      return {
        month: monthData.month,
        // Base scenario values
        baseOperating: monthData.operatingCashFlow,
        baseInvesting: monthData.investingCashFlow,
        baseFinancing: monthData.financingCashFlow,
        baseNet: monthData.netCashFlow,
        baseEnding: monthData.endingCashBalance,
        // Compare scenario values
        compareOperating: compareMonthData?.operatingCashFlow,
        compareInvesting: compareMonthData?.investingCashFlow,
        compareFinancing: compareMonthData?.financingCashFlow,
        compareNet: compareMonthData?.netCashFlow,
        compareEnding: compareMonthData?.endingCashBalance,
        // Difference
        diffNet: compareMonthData ? (compareMonthData.netCashFlow - monthData.netCashFlow) : 0,
        diffEnding: compareMonthData ? (compareMonthData.endingCashBalance - monthData.endingCashBalance) : 0,
        // Seasonality flag for styling
        isSeasonal: isWithinSeasonalPeriod(monthData.month)
      };
    });
  };
  
  // Get waterfall chart data
  const getWaterfallData = (scenario: CashFlowScenario) => {
    // Sum up cash flow components for the entire period
    const operatingTotal = scenario.monthlyProjections.reduce(
      (sum, month) => sum + month.operatingCashFlow, 0
    );
    
    const investingTotal = scenario.monthlyProjections.reduce(
      (sum, month) => sum + month.investingCashFlow, 0
    );
    
    const financingTotal = scenario.monthlyProjections.reduce(
      (sum, month) => sum + month.financingCashFlow, 0
    );
    
    const netChange = operatingTotal + investingTotal + financingTotal;
    const endingBalance = startingCashBalance + netChange;
    
    return [
      {
        name: "Starting Balance",
        value: startingCashBalance,
        fill: "#60a5fa"
      },
      {
        name: "Operating Activities",
        value: operatingTotal,
        fill: operatingTotal >= 0 ? "#4ade80" : "#f87171"
      },
      {
        name: "Investing Activities",
        value: investingTotal,
        fill: investingTotal >= 0 ? "#4ade80" : "#f87171"
      },
      {
        name: "Financing Activities",
        value: financingTotal,
        fill: financingTotal >= 0 ? "#4ade80" : "#f87171"
      },
      {
        name: "Ending Balance",
        value: endingBalance,
        fill: "#60a5fa"
      }
    ];
  };
  
  // Compare key metrics between scenarios
  const getMetricDifference = (metricName: keyof CashFlowScenario["metrics"]) => {
    if (!compareScenario) return 0;
    return compareScenario.metrics[metricName] - baseScenario.metrics[metricName];
  };
  
  // Calculate percentage difference
  const getMetricPercentDifference = (metricName: keyof CashFlowScenario["metrics"]) => {
    if (!compareScenario || baseScenario.metrics[metricName] === 0) return 0;
    return (getMetricDifference(metricName) / Math.abs(baseScenario.metrics[metricName])) * 100;
  };
  
  // Determine if a metric difference is favorable (positive for runway, negative for burn rate)
  const isMetricDifferenceFavorable = (metricName: keyof CashFlowScenario["metrics"]) => {
    if (!compareScenario) return false;
    const diff = getMetricDifference(metricName);
    
    switch (metricName) {
      case "averageMonthlyBurn":
      case "peakNegativeCashFlow":
        return diff < 0; // Lower is better for burn rates
      case "runwayMonths":
      case "lowestCashBalance":
      case "highestCashBalance":
        return diff > 0; // Higher is better for these
      default:
        return diff > 0;
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Scenario Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Base Scenario</CardTitle>
            <CardDescription className="text-sm">{baseScenario.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Badge variant="outline" className="capitalize">
                  {baseScenario.probabilityRating} probability
                </Badge>
                <div className="mt-2 text-sm text-muted-foreground">
                  <span className="font-medium">Runway:</span> {baseScenario.metrics.runwayMonths.toFixed(1)} months
                </div>
              </div>
              <div>
                <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                  Primary
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {compareScenario ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Comparison Scenario</CardTitle>
              <CardDescription className="text-sm">{compareScenario.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant="outline" className="capitalize">
                    {compareScenario.probabilityRating} probability
                  </Badge>
                  <div className="mt-2 text-sm text-muted-foreground">
                    <span className="font-medium">Runway:</span> {compareScenario.metrics.runwayMonths.toFixed(1)} months
                  </div>
                </div>
                <div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setCompareScenarioId("")}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center h-full py-6">
              <Layers className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-center">Select a scenario to compare</p>
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {scenarios
                  .filter(s => s.id !== baseScenarioId)
                  .map(s => (
                    <Badge 
                      key={s.id} 
                      variant="outline" 
                      className="cursor-pointer hover:bg-muted"
                      onClick={() => setCompareScenarioId(s.id)}
                    >
                      {s.name}
                    </Badge>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Visualization Controls */}
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center space-x-2">
            <Switch 
              id="cumulative-toggle" 
              checked={showCumulativeFlow} 
              onCheckedChange={setShowCumulativeFlow}
            />
            <Label htmlFor="cumulative-toggle">Show Ending Balances</Label>
          </div>
          
          {compareScenario && (
            <div className="flex items-center space-x-2">
              <Switch 
                id="difference-toggle" 
                checked={highlightDifference} 
                onCheckedChange={setHighlightDifference}
              />
              <Label htmlFor="difference-toggle">Highlight Differences</Label>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="seasonality-toggle" 
              checked={showSeasonality} 
              onCheckedChange={setShowSeasonality}
            />
            <Label htmlFor="seasonality-toggle">Show Seasonal Periods</Label>
          </div>
        </div>
        
        <div className="flex items-center">
          <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {dateRange}
          </span>
        </div>
      </div>
      
      {/* Main Visualization Section */}
      <Tabs defaultValue="comparison">
        <TabsList className="mb-4">
          <TabsTrigger value="comparison">Cash Flow Comparison</TabsTrigger>
          <TabsTrigger value="waterfall">Waterfall Analysis</TabsTrigger>
          <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="comparison">
          <Card>
            <CardContent className="pt-6">
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  {visualizationType === 'composed' ? (
                    <ComposedChart
                      data={getComparisonData()}
                      margin={{ top: 20, right: 30, left: 30, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.7} />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => formatCurrency(value)} width={80} />
                      <Tooltip 
                        formatter={(value, name) => {
                          // Custom format for the tooltip values
                          return [formatCurrency(Number(value)), name];
                        }}
                        labelFormatter={(label) => {
                          // Check if this month is in a seasonal period
                          const seasonalPeriod = seasonalPeriods.find(p => p.month === label);
                          if (seasonalPeriod && seasonalPeriod.isKeyPeriod) {
                            return `${label} (${seasonalPeriod.season} Season)`;
                          }
                          return label;
                        }}
                        wrapperStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #ccc',
                          borderRadius: '6px',
                          padding: '10px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                        }}
                      />
                      <Legend />
                      
                      {/* Seasonal periods highlight */}
                      {showSeasonality && groupedSeasonalPeriods.map((period, idx) => {
                        const months = baseScenario.monthlyProjections.map(m => m.month);
                        const startIdx = Math.max(0, months.indexOf(period.start));
                        const endIdx = Math.min(months.length - 1, months.indexOf(period.end) !== -1 ? months.indexOf(period.end) : months.length - 1);
                        
                        return (
                          <ReferenceArea 
                            key={`season-${idx}`}
                            x1={months[startIdx]} 
                            x2={months[endIdx]}
                            fill={period.color} 
                            fillOpacity={0.25} 
                            ifOverflow="visible"
                          />
                        );
                      })}
                      
                      {/* Base scenario - Area for balance */}
                      <Area
                        type="monotone"
                        dataKey={showCumulativeFlow ? "baseEnding" : "baseNet"}
                        name={`${baseScenario.name} ${showCumulativeFlow ? "Balance" : "Flow"}`}
                        fill="#0ea5e9"
                        fillOpacity={0.2}
                        stroke="#0ea5e9"
                        strokeWidth={2}
                      />
                      
                      {/* Base scenario - Line for key points */}
                      <Line
                        type="monotone"
                        dataKey={showCumulativeFlow ? "baseEnding" : "baseNet"}
                        stroke="#0ea5e9"
                        dot={{ r: 4, fill: "#0ea5e9" }}
                        activeDot={{ r: 6 }}
                        strokeWidth={0}
                      />
                      
                      {/* Comparison scenario */}
                      {compareScenario && (
                        <>
                          <Area
                            type="monotone"
                            dataKey={showCumulativeFlow ? "compareEnding" : "compareNet"}
                            name={`${compareScenario.name} ${showCumulativeFlow ? "Balance" : "Flow"}`}
                            fill="#f97316"
                            fillOpacity={0.2}
                            stroke="#f97316"
                            strokeWidth={2}
                          />
                          
                          <Line
                            type="monotone"
                            dataKey={showCumulativeFlow ? "compareEnding" : "compareNet"}
                            stroke="#f97316"
                            dot={{ r: 4, fill: "#f97316" }}
                            activeDot={{ r: 6 }}
                            strokeWidth={0}
                          />
                        </>
                      )}
                      
                      {/* Difference between scenarios */}
                      {compareScenario && highlightDifference && (
                        <Bar
                          dataKey={showCumulativeFlow ? "diffEnding" : "diffNet"}
                          name="Difference"
                          barSize={20}
                          fill="transparent"
                          stroke="#22c55e"
                          isAnimationActive={false}
                        >
                          {getComparisonData().map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={(showCumulativeFlow ? entry.diffEnding : entry.diffNet) >= 0 ? "#dcfce7" : "#fee2e2"}
                              stroke={(showCumulativeFlow ? entry.diffEnding : entry.diffNet) >= 0 ? "#22c55e" : "#ef4444"}
                            />
                          ))}
                        </Bar>
                      )}
                      
                      <ReferenceLine y={0} stroke="#888" strokeDasharray="3 3" />
                      <Brush dataKey="month" height={30} stroke="#8884d8" />
                    </ComposedChart>
                  ) : visualizationType === 'area' ? (
                    <AreaChart
                      data={getComparisonData()}
                      margin={{ top: 20, right: 30, left: 30, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => formatCurrency(value)} width={80} />
                      <Tooltip
                        formatter={(value, name) => {
                          return [formatCurrency(Number(value)), name];
                        }}
                        labelFormatter={(label) => {
                          // Check if this month is in a seasonal period
                          const seasonalPeriod = seasonalPeriods.find(p => p.month === label);
                          if (seasonalPeriod && seasonalPeriod.isKeyPeriod) {
                            return `${label} (${seasonalPeriod.season} Season)`;
                          }
                          return label;
                        }}
                      />
                      <Legend />
                      
                      {/* Seasonal periods highlight */}
                      {showSeasonality && groupedSeasonalPeriods.map((period, idx) => {
                        const months = baseScenario.monthlyProjections.map(m => m.month);
                        const startIdx = Math.max(0, months.indexOf(period.start));
                        const endIdx = Math.min(months.length - 1, months.indexOf(period.end) !== -1 ? months.indexOf(period.end) : months.length - 1);
                        
                        return (
                          <ReferenceArea 
                            key={`season-${idx}`}
                            x1={months[startIdx]} 
                            x2={months[endIdx]}
                            fill={period.color} 
                            fillOpacity={0.25} 
                            ifOverflow="visible"
                          />
                        );
                      })}
                      
                      {/* Base scenario */}
                      <Area
                        type="monotone"
                        dataKey={showCumulativeFlow ? "baseEnding" : "baseNet"}
                        name={`${baseScenario.name} ${showCumulativeFlow ? "Balance" : "Flow"}`}
                        fill="#0ea5e9"
                        fillOpacity={0.6}
                        stroke="#0ea5e9"
                        strokeWidth={2}
                      />
                      
                      {/* Comparison scenario */}
                      {compareScenario && (
                        <Area
                          type="monotone"
                          dataKey={showCumulativeFlow ? "compareEnding" : "compareNet"}
                          name={`${compareScenario.name} ${showCumulativeFlow ? "Balance" : "Flow"}`}
                          fill="#f97316"
                          fillOpacity={0.6}
                          stroke="#f97316"
                          strokeWidth={2}
                        />
                      )}
                      
                      <ReferenceLine y={0} stroke="#888" strokeDasharray="3 3" />
                    </AreaChart>
                  ) : (
                    <LineChart
                      data={getComparisonData()}
                      margin={{ top: 20, right: 30, left: 30, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => formatCurrency(value)} width={80} />
                      <Tooltip
                        formatter={(value, name) => {
                          return [formatCurrency(Number(value)), name];
                        }}
                        labelFormatter={(label) => {
                          const isSeasonal = isWithinSeasonalPeriod(label as string);
                          if (isSeasonal) {
                            return `${label} (Seasonal Period)`;
                          }
                          return label;
                        }}
                      />
                      <Legend />
                      
                      {/* Seasonal periods highlight */}
                      {showSeasonality && seasonalPeriods.map((period, idx) => {
                        const months = baseScenario.monthlyProjections.map(m => m.month);
                        const startIdx = Math.max(0, months.indexOf(period.start));
                        const endIdx = Math.min(months.length - 1, months.indexOf(period.end) !== -1 ? months.indexOf(period.end) : months.length - 1);
                        
                        return (
                          <ReferenceArea 
                            key={`season-${idx}`}
                            x1={months[startIdx]} 
                            x2={months[endIdx]}
                            fill={period.color} 
                            fillOpacity={0.2} 
                            ifOverflow="visible"
                          />
                        );
                      })}
                      
                      {/* Base scenario */}
                      <Line
                        type="monotone"
                        dataKey={showCumulativeFlow ? "baseEnding" : "baseNet"}
                        name={`${baseScenario.name} ${showCumulativeFlow ? "Balance" : "Net Flow"}`}
                        stroke="#0ea5e9"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      
                      {/* Comparison scenario */}
                      {compareScenario && (
                        <Line
                          type="monotone"
                          dataKey={showCumulativeFlow ? "compareEnding" : "compareNet"}
                          name={`${compareScenario.name} ${showCumulativeFlow ? "Balance" : "Net Flow"}`}
                          stroke="#f97316"
                          strokeWidth={3}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      )}
                      
                      {/* Difference between scenarios */}
                      {compareScenario && highlightDifference && (
                        <Area
                          type="monotone"
                          dataKey={showCumulativeFlow ? "diffEnding" : "diffNet"}
                          name="Difference"
                          fill="#22c55e"
                          fillOpacity={0.2}
                          stroke="#22c55e"
                          strokeDasharray="3 3"
                        />
                      )}
                      
                      <ReferenceLine y={0} stroke="#888" strokeDasharray="3 3" />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <Button 
                    size="sm" 
                    variant={visualizationType === 'composed' ? "default" : "outline"}
                    onClick={() => setVisualizationType('composed')}
                  >
                    <Layers className="h-4 w-4 mr-2" />
                    Combined
                  </Button>
                  <Button 
                    size="sm" 
                    variant={visualizationType === 'area' ? "default" : "outline"}
                    onClick={() => setVisualizationType('area')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                      <path d="M22 12V8c0-1.1-.9-2-2-2h-4l-2-2H8L6 6H4c-1.1 0-2 .9-2 2v4" />
                      <path d="M18 12v6c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2v-8" />
                      <path d="M8 10h8v6H8z" />
                    </svg>
                    Area
                  </Button>
                  <Button 
                    size="sm" 
                    variant={visualizationType === 'line' ? "default" : "outline"}
                    onClick={() => setVisualizationType('line')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                    Line
                  </Button>
                </div>
                
                <div className="text-sm text-center font-medium">
                  {showCumulativeFlow ? (
                    <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                      Showing cash balances
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      Showing monthly flows
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Seasonality Legend */}
              {showSeasonality && groupedSeasonalPeriods.length > 0 && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md border border-dashed">
                  <div className="flex items-center mb-2">
                    <Lightbulb className="h-4 w-4 mr-2 text-amber-500" />
                    <h4 className="text-sm font-medium">Seasonal Periods</h4>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {groupedSeasonalPeriods.map((period, idx) => (
                      <div key={idx} className="flex items-center text-xs">
                        <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: period.color }} />
                        <span className="font-medium">{period.season}:</span>
                        <span className="text-muted-foreground ml-1">{period.start}{period.start !== period.end ? ` → ${period.end}` : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="waterfall">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">{baseScenario.name} Waterfall</CardTitle>
                <CardDescription>Cash flow components for the entire period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={getWaterfallData(baseScenario)}
                      margin={{ top: 20, right: 30, left: 30, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => formatCurrency(value)} width={80} />
                      <Tooltip 
                        formatter={(value) => [formatCurrency(Number(value)), ""]}
                        labelFormatter={(label) => `${label}`}
                        wrapperStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #ccc',
                          borderRadius: '6px',
                          padding: '10px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                        }}
                      />
                      <ReferenceLine y={0} stroke="#666" />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#0ea5e9"
                        fill="#0ea5e9"
                        fillOpacity={0.8} 
                      >
                        {getWaterfallData(baseScenario).map((entry, index) => {
                          // Apply different colors based on the flow component type
                          let fill = "#0ea5e9"; // Default blue
                          if (entry.name === "Operating Cash Flow") fill = "#22c55e"; // Green
                          if (entry.name === "Investing Cash Flow") fill = "#f59e0b"; // Amber
                          if (entry.name === "Financing Cash Flow") fill = "#8b5cf6"; // Purple
                          if (entry.name === "Starting Balance") fill = "#64748b"; // Gray
                          if (entry.name === "Ending Balance") fill = "#0ea5e9"; // Blue
                          
                          return <Cell key={`cell-${index}`} fill={fill} />
                        })}
                      </Area>
                      {showSeasonality && (
                        <ReferenceArea 
                          y1={getWaterfallData(baseScenario).reduce((min, item) => Math.min(min, item.value), 0)} 
                          y2={getWaterfallData(baseScenario).reduce((max, item) => Math.max(max, item.value), 0)}
                          x1="Operating Cash Flow"
                          x2="Operating Cash Flow"
                          fill="#fef9c3"
                          fillOpacity={0.3}
                          ifOverflow="visible"
                        />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {compareScenario && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium">{compareScenario.name} Waterfall</CardTitle>
                  <CardDescription>Cash flow components for the entire period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={getWaterfallData(compareScenario)}
                        margin={{ top: 20, right: 30, left: 30, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => formatCurrency(value)} width={80} />
                        <Tooltip 
                          formatter={(value) => [formatCurrency(Number(value)), ""]}
                          labelFormatter={(label) => `${label}`}
                          wrapperStyle={{ 
                            backgroundColor: '#fff', 
                            border: '1px solid #ccc',
                            borderRadius: '6px',
                            padding: '10px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                          }}
                        />
                        <ReferenceLine y={0} stroke="#666" />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#f97316"
                          fill="#f97316"
                          fillOpacity={0.8} 
                        >
                          {getWaterfallData(compareScenario).map((entry, index) => {
                            // Apply different colors based on the flow component type
                            let fill = "#f97316"; // Default orange
                            if (entry.name === "Operating Cash Flow") fill = "#16a34a"; // Green
                            if (entry.name === "Investing Cash Flow") fill = "#d97706"; // Amber
                            if (entry.name === "Financing Cash Flow") fill = "#7c3aed"; // Purple
                            if (entry.name === "Starting Balance") fill = "#475569"; // Gray
                            if (entry.name === "Ending Balance") fill = "#f97316"; // Orange
                            
                            return <Cell key={`cell-${index}`} fill={fill} />
                          })}
                        </Area>
                        {showSeasonality && (
                          <ReferenceArea 
                            y1={getWaterfallData(compareScenario).reduce((min, item) => Math.min(min, item.value), 0)} 
                            y2={getWaterfallData(compareScenario).reduce((max, item) => Math.max(max, item.value), 0)}
                            x1="Operating Cash Flow"
                            x2="Operating Cash Flow"
                            fill="#fef9c3"
                            fillOpacity={0.3}
                            ifOverflow="visible"
                          />
                        )}
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle>Key Metrics Comparison</CardTitle>
              <CardDescription>
                Comparing important cash flow metrics between scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Metric</TableHead>
                    <TableHead>{baseScenario.name}</TableHead>
                    {compareScenario && (
                      <>
                        <TableHead>{compareScenario.name}</TableHead>
                        <TableHead className="text-right">Difference</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Average Monthly Burn</TableCell>
                    <TableCell>{formatCurrency(baseScenario.metrics.averageMonthlyBurn)}</TableCell>
                    {compareScenario && (
                      <>
                        <TableCell>{formatCurrency(compareScenario.metrics.averageMonthlyBurn)}</TableCell>
                        <TableCell className="text-right">
                          <Badge 
                            variant={isMetricDifferenceFavorable("averageMonthlyBurn") ? "success" : "destructive"}
                            className="flex items-center justify-end w-full"
                          >
                            {isMetricDifferenceFavorable("averageMonthlyBurn") ? 
                              <TrendingDown className="h-3 w-3 mr-1" /> : 
                              <TrendingUp className="h-3 w-3 mr-1" />
                            }
                            {formatCurrency(Math.abs(getMetricDifference("averageMonthlyBurn")))}
                            <span className="ml-1">({getMetricPercentDifference("averageMonthlyBurn").toFixed(1)}%)</span>
                          </Badge>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                  
                  <TableRow>
                    <TableCell className="font-medium">Peak Negative Cash Flow</TableCell>
                    <TableCell>{formatCurrency(baseScenario.metrics.peakNegativeCashFlow)}</TableCell>
                    {compareScenario && (
                      <>
                        <TableCell>{formatCurrency(compareScenario.metrics.peakNegativeCashFlow)}</TableCell>
                        <TableCell className="text-right">
                          <Badge 
                            variant={isMetricDifferenceFavorable("peakNegativeCashFlow") ? "success" : "destructive"}
                            className="flex items-center justify-end w-full"
                          >
                            {isMetricDifferenceFavorable("peakNegativeCashFlow") ? 
                              <TrendingDown className="h-3 w-3 mr-1" /> : 
                              <TrendingUp className="h-3 w-3 mr-1" />
                            }
                            {formatCurrency(Math.abs(getMetricDifference("peakNegativeCashFlow")))}
                            <span className="ml-1">({getMetricPercentDifference("peakNegativeCashFlow").toFixed(1)}%)</span>
                          </Badge>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                  
                  <TableRow>
                    <TableCell className="font-medium">Runway (Months)</TableCell>
                    <TableCell>{baseScenario.metrics.runwayMonths.toFixed(1)}</TableCell>
                    {compareScenario && (
                      <>
                        <TableCell>{compareScenario.metrics.runwayMonths.toFixed(1)}</TableCell>
                        <TableCell className="text-right">
                          <Badge 
                            variant={isMetricDifferenceFavorable("runwayMonths") ? "success" : "destructive"}
                            className="flex items-center justify-end w-full"
                          >
                            {isMetricDifferenceFavorable("runwayMonths") ? 
                              <TrendingUp className="h-3 w-3 mr-1" /> : 
                              <TrendingDown className="h-3 w-3 mr-1" />
                            }
                            {Math.abs(getMetricDifference("runwayMonths")).toFixed(1)}
                            <span className="ml-1">({getMetricPercentDifference("runwayMonths").toFixed(1)}%)</span>
                          </Badge>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                  
                  <TableRow>
                    <TableCell className="font-medium">Lowest Cash Balance</TableCell>
                    <TableCell>{formatCurrency(baseScenario.metrics.lowestCashBalance)}</TableCell>
                    {compareScenario && (
                      <>
                        <TableCell>{formatCurrency(compareScenario.metrics.lowestCashBalance)}</TableCell>
                        <TableCell className="text-right">
                          <Badge 
                            variant={isMetricDifferenceFavorable("lowestCashBalance") ? "success" : "destructive"}
                            className="flex items-center justify-end w-full"
                          >
                            {isMetricDifferenceFavorable("lowestCashBalance") ? 
                              <TrendingUp className="h-3 w-3 mr-1" /> : 
                              <TrendingDown className="h-3 w-3 mr-1" />
                            }
                            {formatCurrency(Math.abs(getMetricDifference("lowestCashBalance")))}
                            <span className="ml-1">({getMetricPercentDifference("lowestCashBalance").toFixed(1)}%)</span>
                          </Badge>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                  
                  <TableRow>
                    <TableCell className="font-medium">Highest Cash Balance</TableCell>
                    <TableCell>{formatCurrency(baseScenario.metrics.highestCashBalance)}</TableCell>
                    {compareScenario && (
                      <>
                        <TableCell>{formatCurrency(compareScenario.metrics.highestCashBalance)}</TableCell>
                        <TableCell className="text-right">
                          <Badge 
                            variant={isMetricDifferenceFavorable("highestCashBalance") ? "success" : "destructive"}
                            className="flex items-center justify-end w-full"
                          >
                            {isMetricDifferenceFavorable("highestCashBalance") ? 
                              <TrendingUp className="h-3 w-3 mr-1" /> : 
                              <TrendingDown className="h-3 w-3 mr-1" />
                            }
                            {formatCurrency(Math.abs(getMetricDifference("highestCashBalance")))}
                            <span className="ml-1">({getMetricPercentDifference("highestCashBalance").toFixed(1)}%)</span>
                          </Badge>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                </TableBody>
              </Table>
              
              {!compareScenario && (
                <div className="mt-4 p-4 bg-muted rounded-md flex items-center text-sm">
                  <AlertCircle className="h-5 w-5 mr-2 text-muted-foreground" />
                  <p className="text-muted-foreground">Select a comparison scenario to see detailed metrics comparison</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
