import React, { useState } from "react";
import { 
  SeasonalCashFlowStatement,
  SeasonalCashFlowItem,
  SeasonalPattern,
  SeasonType,
  DateRange 
} from "utils/financial-types";
import { formatCurrency, determineAustralianSeason } from "utils/financial-data";
import {
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
  LineChart,
  Line
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info, TrendingUp, TrendingDown, BarChart3, Calendar } from "lucide-react";

interface SeasonalCashFlowReportProps {
  data: SeasonalCashFlowStatement;
}

export function SeasonalCashFlowReport({ data }: SeasonalCashFlowReportProps) {
  const [showSeasonalAdjustments, setShowSeasonalAdjustments] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState<SeasonType>(determineAustralianSeason(new Date()));
  
  // Format data for the waterfall chart (with or without seasonal adjustments)
  const getChartData = () => {
    if (showSeasonalAdjustments) {
      return [
        {
          name: "Beginning Balance",
          value: data.beginningCashBalance,
          fill: "#60a5fa"
        },
        {
          name: "Operating Activities",
          value: data.operatingActivities.reduce((sum, item) => sum + item.amount, 0),
          fill: "#4ade80"
        },
        {
          name: "Investing Activities",
          value: data.investingActivities.reduce((sum, item) => sum + item.amount, 0),
          fill: data.investingActivities.reduce((sum, item) => sum + item.amount, 0) >= 0 ? "#4ade80" : "#f87171"
        },
        {
          name: "Financing Activities",
          value: data.financingActivities.reduce((sum, item) => sum + item.amount, 0),
          fill: data.financingActivities.reduce((sum, item) => sum + item.amount, 0) >= 0 ? "#4ade80" : "#f87171"
        },
        {
          name: "Ending Balance",
          value: data.endingCashBalance,
          fill: "#60a5fa"
        }
      ];
    } else {
      // Calculate unadjusted values using the base amounts
      const getBaseTotal = (items: SeasonalCashFlowItem[]) => {
        return items.reduce((sum, item) => sum + (item.seasonalAdjustment?.baseAmount || item.amount), 0);
      };
      
      const opTotal = getBaseTotal(data.operatingActivities);
      const invTotal = getBaseTotal(data.investingActivities);
      const finTotal = getBaseTotal(data.financingActivities);
      const netChange = opTotal + invTotal + finTotal;
      const endingBalance = data.beginningCashBalance + netChange;
      
      return [
        {
          name: "Beginning Balance",
          value: data.beginningCashBalance,
          fill: "#60a5fa"
        },
        {
          name: "Operating Activities",
          value: opTotal,
          fill: "#4ade80"
        },
        {
          name: "Investing Activities",
          value: invTotal,
          fill: invTotal >= 0 ? "#4ade80" : "#f87171"
        },
        {
          name: "Financing Activities",
          value: finTotal,
          fill: finTotal >= 0 ? "#4ade80" : "#f87171"
        },
        {
          name: "Ending Balance",
          value: endingBalance,
          fill: "#60a5fa"
        }
      ];
    }
  };
  
  // Helper function to render cash flow line items with seasonal adjustments
  const renderLineItems = (items: SeasonalCashFlowItem[], label: string) => {
    const total = items.reduce((sum, item) => sum + item.amount, 0);
    const baseTotal = items.reduce((sum, item) => sum + (item.seasonalAdjustment?.baseAmount || item.amount), 0);
    
    return (
      <div className="space-y-2">
        <div className="font-medium text-lg">{label}</div>
        <div className="space-y-1">
          {items.map((item) => {
            const baseAmount = item.seasonalAdjustment?.baseAmount || item.amount;
            const adjustedAmount = showSeasonalAdjustments ? item.amount : baseAmount;
            const hasAdjustment = item.seasonalAdjustment?.applied && baseAmount !== adjustedAmount;
            
            return (
              <div key={item.id} className="flex justify-between items-center">
                <span className="text-muted-foreground">{item.name}</span>
                <div className="flex items-center gap-2">
                  {hasAdjustment && showSeasonalAdjustments && (
                    <span className="text-xs text-muted-foreground">
                      ({formatCurrency(baseAmount)}
                      <span className={adjustedAmount > baseAmount ? "text-green-600 ml-1" : "text-red-600 ml-1"}>
                        {adjustedAmount > baseAmount ? "+" : ""}
                        {((adjustedAmount / baseAmount) - 1) * 100 > 0 ? "+" : ""}
                        {(((adjustedAmount / baseAmount) - 1) * 100).toFixed(1)}%
                      </span>
                      )
                    </span>
                  )}
                  <span className={adjustedAmount >= 0 ? "text-green-600" : "text-red-600"}>
                    {adjustedAmount >= 0 ? "+" : ""}{formatCurrency(adjustedAmount)}
                  </span>
                </div>
              </div>
            );
          })}
          <div className="flex justify-between font-medium pt-2 border-t">
            <span>Net {label}</span>
            <span className={total >= 0 ? "text-green-600" : "text-red-600"}>
              {total >= 0 ? "+" : ""}{formatCurrency(showSeasonalAdjustments ? total : baseTotal)}
            </span>
          </div>
        </div>
      </div>
    );
  };
  
  // Generate historical trend data for visualization
  const getHistoricalTrendData = () => {
    // Combine trends from all cash flow items
    const allItems = [...data.operatingActivities, ...data.investingActivities, ...data.financingActivities];
    const trendItems = allItems.filter(item => item.historicalTrend?.pastYears.length);
    
    // Get unique years
    const years = new Set<number>();
    trendItems.forEach(item => {
      item.historicalTrend?.pastYears.forEach(yearData => {
        years.add(yearData.year);
      });
    });
    
    // Group by activity type
    const chartData = Array.from(years).map(year => {
      const yearData: any = { year };
      
      // Operating activities
      const opTotal = data.operatingActivities
        .filter(item => item.historicalTrend)
        .reduce((sum, item) => {
          const yearAmount = item.historicalTrend?.pastYears.find(y => y.year === year)?.amount || 0;
          return sum + yearAmount;
        }, 0);
      
      // Investing activities
      const invTotal = data.investingActivities
        .filter(item => item.historicalTrend)
        .reduce((sum, item) => {
          const yearAmount = item.historicalTrend?.pastYears.find(y => y.year === year)?.amount || 0;
          return sum + yearAmount;
        }, 0);
      
      // Financing activities
      const finTotal = data.financingActivities
        .filter(item => item.historicalTrend)
        .reduce((sum, item) => {
          const yearAmount = item.historicalTrend?.pastYears.find(y => y.year === year)?.amount || 0;
          return sum + yearAmount;
        }, 0);
      
      yearData.operating = opTotal;
      yearData.investing = invTotal;
      yearData.financing = finTotal;
      yearData.netCashFlow = opTotal + invTotal + finTotal;
      
      return yearData;
    });
    
    // Add current year projection
    const currentYear = new Date().getFullYear();
    chartData.push({
      year: currentYear,
      operating: data.operatingActivities.reduce((sum, item) => sum + item.amount, 0),
      investing: data.investingActivities.reduce((sum, item) => sum + item.amount, 0),
      financing: data.financingActivities.reduce((sum, item) => sum + item.amount, 0),
      netCashFlow: data.netCashFlow,
      isPrediction: true
    });
    
    // Sort by year
    return chartData.sort((a, b) => a.year - b.year);
  };
  
  // Get current season pattern
  const currentPattern = data.seasonalPatterns.find(
    pattern => pattern.season.includes(selectedSeason)
  ) || data.seasonalPatterns[0];
  
  // Calculate impact of seasonality
  const seasonalImpact = data.seasonalityImpact;
  const impactPercentage = (seasonalImpact / data.netCashFlow) * 100;
  
  return (
    <div className="space-y-8">
      {/* Seasonality Controls */}
      <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-4">
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Seasonal Analysis Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="seasonal-toggle" 
                  checked={showSeasonalAdjustments} 
                  onCheckedChange={setShowSeasonalAdjustments}
                />
                <Label htmlFor="seasonal-toggle">Apply Seasonal Adjustments</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Label htmlFor="season-select">View Season:</Label>
                <Select value={selectedSeason} onValueChange={(value) => setSelectedSeason(value as SeasonType)}>
                  <SelectTrigger className="w-[140px]" id="season-select">
                    <SelectValue placeholder="Select season" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Summer">Summer (Dec-Feb)</SelectItem>
                    <SelectItem value="Autumn">Autumn (Mar-May)</SelectItem>
                    <SelectItem value="Winter">Winter (Jun-Aug)</SelectItem>
                    <SelectItem value="Spring">Spring (Sep-Nov)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <Info className="h-4 w-4 mr-2" />
              Current Seasonal Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Industry:</span>
                <Badge variant="outline">{data.industry}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Current Season:</span>
                <Badge variant="outline">{data.currentSeason}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Seasonality Impact:</span>
                <Badge 
                  variant={seasonalImpact >= 0 ? "success" : "destructive"}
                  className={`flex items-center ${seasonalImpact >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                >
                  {seasonalImpact >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {seasonalImpact >= 0 ? "+" : ""}{formatCurrency(seasonalImpact)} ({impactPercentage.toFixed(1)}%)
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Seasonal Pattern Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <BarChart3 className="h-5 w-5 mr-2" />
            {currentPattern.season} Pattern
          </CardTitle>
          <CardDescription>
            {currentPattern.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-md p-4">
                <h4 className="font-medium mb-2">Cash Receipt Adjustment</h4>
                <div className="flex items-center">
                  <span className="text-xl font-semibold text-green-600">
                    +{((currentPattern.seasonalFactors?.cashReceiptsAdjustment || 0) * 100).toFixed(1)}%
                  </span>
                  <span className="text-muted-foreground ml-2">
                    from baseline
                  </span>
                </div>
              </div>
              <div className="border rounded-md p-4">
                <h4 className="font-medium mb-2">Cash Disbursement Adjustment</h4>
                <div className="flex items-center">
                  <span className="text-xl font-semibold text-amber-600">
                    +{((currentPattern.seasonalFactors?.cashDisbursementsAdjustment || 0) * 100).toFixed(1)}%
                  </span>
                  <span className="text-muted-foreground ml-2">
                    from baseline
                  </span>
                </div>
              </div>
            </div>
            
            {data.keyDates.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Key Cash Flow Dates</h4>
                <div className="space-y-2">
                  {data.keyDates.map((keyDate, index) => (
                    <div key={index} className="flex justify-between items-center border-b pb-1">
                      <div>
                        <span className="font-medium">{keyDate.event}</span>
                        <p className="text-sm text-muted-foreground">{keyDate.date}</p>
                      </div>
                      {keyDate.cashFlowImpact && (
                        <Badge 
                          variant="outline"
                          className={keyDate.cashFlowImpact.type === 'disbursement' ? 'text-red-500' : 
                                   keyDate.cashFlowImpact.type === 'receipt' ? 'text-green-500' : 'text-blue-500'}
                        >
                          {keyDate.cashFlowImpact.type === 'disbursement' ? 'Outflow' : 
                           keyDate.cashFlowImpact.type === 'receipt' ? 'Inflow' : 'Mixed'}
                          {' - '}{keyDate.cashFlowImpact.relativeImpact} Impact
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="waterfall">
        <TabsList className="mb-4">
          <TabsTrigger value="waterfall">Cash Flow Waterfall</TabsTrigger>
          <TabsTrigger value="historical">Historical Trends</TabsTrigger>
          <TabsTrigger value="details">Detailed Statement</TabsTrigger>
        </TabsList>
        
        <TabsContent value="waterfall">
          <Card>
            <CardContent className="pt-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={getChartData()}
                    margin={{ top: 20, right: 30, left: 30, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} width={70} />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(Number(value)), ""]}
                      labelFormatter={(label) => `${label}`}
                    />
                    <ReferenceLine y={0} stroke="#666" />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.8} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-center text-sm font-medium">
                {showSeasonalAdjustments ? (
                  <span className="text-blue-600">Showing seasonally adjusted cash flow</span>
                ) : (
                  <span className="text-muted-foreground">Showing baseline cash flow (without seasonal adjustments)</span>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="historical">
          <Card>
            <CardContent className="pt-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={getHistoricalTrendData()}
                    margin={{ top: 20, right: 30, left: 30, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} width={70} />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(Number(value)), ""]}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="operating" 
                      name="Operating Activities"
                      stroke="#4ade80" 
                      strokeWidth={2} 
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="investing" 
                      name="Investing Activities"
                      stroke="#f87171" 
                      strokeWidth={2} 
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="financing" 
                      name="Financing Activities"
                      stroke="#60a5fa" 
                      strokeWidth={2} 
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="netCashFlow" 
                      name="Net Cash Flow"
                      stroke="#8884d8" 
                      strokeWidth={3} 
                      dot={{ r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-center text-sm">
                <span className="font-medium text-blue-600">Historical Analysis:</span>{" "}
                <span className="text-muted-foreground">Showing trends from previous years with current year projection</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="details">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="flex justify-between font-medium text-lg">
                  <span>Beginning Cash Balance</span>
                  <span>{formatCurrency(data.beginningCashBalance)}</span>
                </div>
                {renderLineItems(data.operatingActivities, "Operating Activities")}
                {renderLineItems(data.investingActivities, "Investing Activities")}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-6">
                {renderLineItems(data.financingActivities, "Financing Activities")}
                <div className="flex justify-between font-medium text-lg pt-2 border-t">
                  <span>Net Change in Cash</span>
                  <span className={data.netCashFlow >= 0 ? "text-green-600" : "text-red-600"}>
                    {data.netCashFlow >= 0 ? "+" : ""}{formatCurrency(data.netCashFlow)}
                  </span>
                </div>
                <div className="flex justify-between font-medium text-lg pt-2 border-t">
                  <span>Ending Cash Balance</span>
                  <span>{formatCurrency(data.endingCashBalance)}</span>
                </div>
                
                {showSeasonalAdjustments && (
                  <div className="pt-4 mt-4 border-t">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">Seasonal Impact</span>
                      <Badge className={data.seasonalityImpact >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {data.seasonalityImpact >= 0 ? "+" : ""}{formatCurrency(data.seasonalityImpact)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Adjustment due to {data.currentSeason} seasonal patterns for {data.industry}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
