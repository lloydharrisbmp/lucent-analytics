import React, { useState } from "react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart,
  Area,
  ReferenceLine,
  Label,
  ReferenceArea,
  Cell,
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label as UILabel } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, ArrowRight, Calendar, DollarSign, TrendingDown, TrendingUp, Lightbulb, Download, CircleDashed } from "lucide-react";
import { formatCurrency, determineAustralianSeason, generateSampleWorkingCapitalData } from "utils/financial-data";

interface WorkingCapitalDashboardProps {
  monthlyData: {
    month: string;
    receivables: number;
    payables: number;
    inventory: number;
    cash: number;
    otherCurrentAssets: number;
    otherCurrentLiabilities: number;
    revenue: number;
    cogs: number;
    metrics: {
      dso: number;
      dpo: number;
      dio: number;
      ccc: number;
      workingCapitalRatio: number;
      quickRatio: number;
      inventoryTurnover: number;
      receivablesTurnover: number;
      payablesTurnover: number;
    };
  }[];
  benchmarkData?: {
    industry: string;
    metrics: {
      dso: number;
      dpo: number;
      dio: number;
      ccc: number;
      workingCapitalRatio: number;
      quickRatio: number;
      inventoryTurnover: number;
      receivablesTurnover: number;
      payablesTurnover: number;
    };
  };
  dateRange: string; // e.g., "Q1 2025" or "Jan 2025 - Mar 2025"
  focusArea?: "overall" | "inventory" | "receivables" | "payables";
}

export function WorkingCapitalDashboard({ 
  monthlyData, 
  benchmarkData, 
  dateRange 
}: WorkingCapitalDashboardProps) {
  // Get metrics from the latest month
  const latestMonth = monthlyData[monthlyData.length - 1];
  const metrics = {
    dso: latestMonth.metrics.dso,
    dio: latestMonth.metrics.dio,
    dpo: latestMonth.metrics.dpo,
    cashConversionCycle: latestMonth.metrics.ccc,
    workingCapital: latestMonth.receivables + latestMonth.inventory - latestMonth.payables,
    workingCapitalRatio: latestMonth.metrics.workingCapitalRatio,
    quickRatio: latestMonth.metrics.quickRatio,
    currentRatio: (latestMonth.receivables + latestMonth.inventory + latestMonth.cash + latestMonth.otherCurrentAssets) / 
                (latestMonth.payables + latestMonth.otherCurrentLiabilities)
  };
  
  const [optimizationTarget, setOptimizationTarget] = useState<string>("balanced");
  const [dsoTarget, setDsoTarget] = useState<number>(metrics.dso);
  const [dioTarget, setDioTarget] = useState<number>(metrics.dio);
  const [dpoTarget, setDpoTarget] = useState<number>(metrics.dpo);
  const [showSeasonality, setShowSeasonality] = useState<boolean>(true);
  
  // Create historical and projected data from monthlyData
  const historicalCutoff = Math.floor(monthlyData.length * 0.6);
  
  const historicalData = monthlyData.slice(0, historicalCutoff).map(month => ({
    date: month.month,
    accountsReceivable: month.receivables,
    inventory: month.inventory,
    accountsPayable: month.payables,
    netWorkingCapital: month.receivables + month.inventory - month.payables,
    projectedCashBalance: month.cash
  }));
  
  const projectedData = monthlyData.slice(historicalCutoff).map(month => ({
    date: month.month,
    accountsReceivable: month.receivables,
    inventory: month.inventory,
    accountsPayable: month.payables,
    netWorkingCapital: month.receivables + month.inventory - month.payables,
    projectedCashBalance: month.cash
  }));
  
  // Combine historical and projected data for charts
  const combinedData = [...historicalData, ...projectedData];
  
  // Determine seasonal periods to highlight
  const seasonalPeriods = combinedData.map(item => {
    const [month, year] = item.date.split(' ');
    const monthIndex = new Date(Date.parse(`${month} 1, ${year}`)).getMonth();
    const date = new Date(parseInt(year), monthIndex, 1);
    const season = determineAustralianSeason(date);
    
    return {
      date: item.date,
      season,
      isKeyPeriod: season === 'Summer' || season === 'Winter' // Highlight summer and winter as key periods
    };
  });
  
  // Group consecutive seasons for highlighting
  const seasonalHighlights = [];
  let currentGroup = { season: "", start: "", end: "", color: "" };
  
  seasonalPeriods.forEach((period, index) => {
    if (period.isKeyPeriod) {
      if (currentGroup.season !== period.season) {
        // Start a new group
        if (currentGroup.season) {
          seasonalHighlights.push({ ...currentGroup });
        }
        currentGroup = {
          season: period.season,
          start: period.date,
          end: period.date,
          color: period.season === 'Summer' ? '#fef9c3' : '#e0f2fe' // Yellow for summer, light blue for winter
        };
      } else {
        // Continue the current group
        currentGroup.end = period.date;
      }
    } else if (currentGroup.season && index > 0 && seasonalPeriods[index - 1].isKeyPeriod) {
      // End of a group
      seasonalHighlights.push({ ...currentGroup });
      currentGroup = { season: "", start: "", end: "", color: "" };
    }
  });
  
  // Add the last group if it exists
  if (currentGroup.season) {
    seasonalHighlights.push({ ...currentGroup });
  }
  
  // Generate optimized scenario data based on target adjustments
  const optimizedData = projectedData.map(item => {
    // Apply adjustments based on optimization targets
    const dsoFactor = dsoTarget / metrics.dso;
    const dioFactor = dioTarget / metrics.dio;
    const dpoFactor = dpoTarget / metrics.dpo;
    
    return {
      ...item,
      accountsReceivable: item.accountsReceivable * dsoFactor,
      inventory: item.inventory * dioFactor,
      accountsPayable: item.accountsPayable * dpoFactor,
      netWorkingCapital: (item.accountsReceivable * dsoFactor) + 
                        (item.inventory * dioFactor) - 
                        (item.accountsPayable * dpoFactor),
      projectedCashBalance: item.projectedCashBalance + 
                          (item.accountsReceivable - (item.accountsReceivable * dsoFactor)) +
                          (item.inventory - (item.inventory * dioFactor)) -
                          (item.accountsPayable - (item.accountsPayable * dpoFactor))
    };
  });
  
  // Apply preset optimization scenarios
  const applyOptimizationPreset = (preset: string) => {
    setOptimizationTarget(preset);
    
    switch(preset) {
      case "aggressive":
        // Aggressively reduce DSO and DIO, increase DPO
        setDsoTarget(Math.max(metrics.dso * 0.7, 15)); // Target 30% reduction with floor
        setDioTarget(Math.max(metrics.dio * 0.7, 15)); // Target 30% reduction with floor
        setDpoTarget(Math.min(metrics.dpo * 1.3, 90)); // Target 30% increase with ceiling
        break;
      case "balanced":
        // Moderate adjustments
        setDsoTarget(Math.max(metrics.dso * 0.85, 20)); // Target 15% reduction with floor
        setDioTarget(Math.max(metrics.dio * 0.85, 20)); // Target 15% reduction with floor
        setDpoTarget(Math.min(metrics.dpo * 1.15, 75)); // Target 15% increase with ceiling
        break;
      case "conservative":
        // Modest adjustments
        setDsoTarget(Math.max(metrics.dso * 0.95, 25)); // Target 5% reduction with floor
        setDioTarget(Math.max(metrics.dio * 0.95, 25)); // Target 5% reduction with floor
        setDpoTarget(Math.min(metrics.dpo * 1.05, 60)); // Target 5% increase with ceiling
        break;
      case "custom":
        // Keep current values
        break;
    }
  };
  
  // Calculate impact of optimizations
  const originalCCC = metrics.dso + metrics.dio - metrics.dpo;
  const optimizedCCC = dsoTarget + dioTarget - dpoTarget;
  const cccImprovement = originalCCC - optimizedCCC;
  
  // Calculate cash flow impact
  const lastProjection = projectedData[projectedData.length - 1];
  const lastOptimized = optimizedData[optimizedData.length - 1];
  const cashFlowImprovement = lastOptimized.projectedCashBalance - lastProjection.projectedCashBalance;
  
  return (
    <div className="space-y-6">
      {/* Top metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-blue-50 dark:bg-blue-950">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Working Capital</p>
                <h3 className="text-2xl font-bold">{formatCurrency(metrics.workingCapital)}</h3>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-xs">
              <Badge variant={metrics.workingCapitalRatio >= 1.2 ? "success" : metrics.workingCapitalRatio >= 1 ? "outline" : "destructive"}>
                {metrics.workingCapitalRatio.toFixed(2)}x ratio
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 dark:bg-green-950">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Days Sales Outstanding</p>
                <h3 className="text-2xl font-bold">{metrics.dso.toFixed(1)} days</h3>
              </div>
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
                          <div className="mt-2 flex items-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="mr-2"
                  onClick={() => {
                    const sampleData = generateSampleWorkingCapitalData(12);
                    console.log('Sample data generated:', sampleData);
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </div>
          </CardContent>
        </Card>
        
        <Card className="bg-amber-50 dark:bg-amber-950">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Days Inventory Outstanding</p>
                <h3 className="text-2xl font-bold">{metrics.dio.toFixed(1)} days</h3>
              </div>
              <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-full">
                <Calendar className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-xs">
              <TrendingDown className="h-3 w-3 mr-1 text-amber-600" />
              <span className="text-amber-600">Lower is better</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50 dark:bg-purple-950">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cash Conversion Cycle</p>
                <h3 className="text-2xl font-bold">{metrics.cashConversionCycle.toFixed(1)} days</h3>
              </div>
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full">
                <ArrowRight className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-xs">
              <Badge variant={metrics.cashConversionCycle <= 45 ? "success" : metrics.cashConversionCycle <= 60 ? "outline" : "destructive"}>
                {metrics.cashConversionCycle <= 45 ? "Good" : metrics.cashConversionCycle <= 60 ? "Average" : "Needs Improvement"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Working Capital Trend Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Working Capital Components Trend</CardTitle>
            <CardDescription>Historical and projected working capital components for {dateRange}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={combinedData} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), ""]} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="accountsReceivable" name="Accounts Receivable" fill="#4ade80" />
                  <Bar yAxisId="left" dataKey="inventory" name="Inventory" fill="#fb923c" />
                  <Bar yAxisId="left" dataKey="accountsPayable" name="Accounts Payable" fill="#f87171" />
                  <Line yAxisId="left" type="monotone" dataKey="netWorkingCapital" name="Net Working Capital" stroke="#8884d8" strokeWidth={2} />
                  
                  {/* Add seasonal period highlights if enabled */}
                  {showSeasonality && seasonalHighlights.map((period, index) => (
                    <ReferenceArea 
                      key={`season-${index}`}
                      x1={period.start} 
                      x2={period.end} 
                      fill={period.color} 
                      fillOpacity={0.3} 
                      ifOverflow="visible"
                    />
                  ))}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            
            {/* Seasonality toggle and legend */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button 
                  size="sm" 
                  variant={showSeasonality ? "default" : "outline"}
                  onClick={() => setShowSeasonality(!showSeasonality)}
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  {showSeasonality ? "Hide Seasonality" : "Show Seasonality"}
                </Button>
              </div>
              
              {showSeasonality && seasonalHighlights.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {seasonalHighlights.map((period, index) => (
                    <div key={`legend-${index}`} className="flex items-center text-xs">
                      <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: period.color }} />
                      <span className="font-medium">{period.season}:</span>
                      <span className="text-muted-foreground ml-1">{period.start}{period.start !== period.end ? ` → ${period.end}` : ''}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Cash Conversion Cycle Components */}
        <Card>
          <CardHeader>
            <CardTitle>Cash Conversion Cycle</CardTitle>
            <CardDescription>Current state and optimization opportunities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Days Sales Outstanding (DSO)</span>
                <span className="font-medium">{metrics.dso.toFixed(1)} days</span>
              </div>
              <div className="h-2 bg-muted rounded overflow-hidden">
                <div 
                  className="h-full bg-green-500" 
                  style={{ width: `${Math.min(100, (metrics.dso / 90) * 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Days Inventory Outstanding (DIO)</span>
                <span className="font-medium">{metrics.dio.toFixed(1)} days</span>
              </div>
              <div className="h-2 bg-muted rounded overflow-hidden">
                <div 
                  className="h-full bg-amber-500" 
                  style={{ width: `${Math.min(100, (metrics.dio / 90) * 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Days Payable Outstanding (DPO)</span>
                <span className="font-medium">{metrics.dpo.toFixed(1)} days</span>
              </div>
              <div className="h-2 bg-muted rounded overflow-hidden">
                <div 
                  className="h-full bg-red-500" 
                  style={{ width: `${Math.min(100, (metrics.dpo / 90) * 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="mt-6 p-3 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Cash Conversion Cycle</span>
                <Badge>
                  {metrics.cashConversionCycle.toFixed(1)} days
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                CCC = DSO + DIO - DPO
              </p>
              
              {metrics.cashConversionCycle > 60 && (
                <div className="mt-2 flex items-start p-2 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300 rounded-md text-xs">
                  <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                  <p>Your cash conversion cycle is higher than industry average. Consider strategies to reduce DSO and DIO or extend DPO.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Working Capital Scenario Planning */}
      <Card>
        <CardHeader>
          <CardTitle>Working Capital Optimization Scenario</CardTitle>
          <CardDescription>Simulate changes to working capital components and view impact</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="cash-impact">
            <TabsList className="mb-4">
              <TabsTrigger value="cash-impact">Cash Impact</TabsTrigger>
              <TabsTrigger value="optimization">Optimization Controls</TabsTrigger>
            </TabsList>
            
            <TabsContent value="cash-impact">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[...projectedData.map(d => ({...d, type: 'Current'})), ...optimizedData.map(d => ({...d, type: 'Optimized'}))]} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis tickFormatter={(value) => formatCurrency(value)} />
                        <Tooltip formatter={(value) => [formatCurrency(Number(value)), ""]} />
                        <Legend />
                        <Line type="monotone" dataKey="projectedCashBalance" name="Current Projection" stroke="#94a3b8" strokeWidth={2} connectNulls />
                        <Line type="monotone" dataKey="projectedCashBalance" name="Optimized Projection" stroke="#0ea5e9" strokeWidth={2} connectNulls />
                        
                        {/* Add seasonal period highlights if enabled */}
                        {showSeasonality && seasonalHighlights.map((period, index) => (
                          <ReferenceArea 
                            key={`season-${index}`}
                            x1={period.start} 
                            x2={period.end} 
                            fill={period.color} 
                            fillOpacity={0.2} 
                            ifOverflow="visible"
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 text-center text-sm font-medium">
                    <span className="text-blue-600">Cash flow projection comparison</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                    <h3 className="text-lg font-medium mb-2">Optimization Impact Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">CCC Improvement:</span>
                        <span className="font-medium text-green-600">{cccImprovement.toFixed(1)} days</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cash Flow Impact:</span>
                        <span className="font-medium text-green-600">{formatCurrency(cashFlowImprovement)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Optimization Approach:</span>
                        <Badge variant="outline" className="capitalize">{optimizationTarget}</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Original Cash Conversion Cycle:</span>
                      <Badge variant="outline">{originalCCC.toFixed(1)} days</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Optimized Cash Conversion Cycle:</span>
                      <Badge variant="success">{optimizedCCC.toFixed(1)} days</Badge>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Component Changes:</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span>DSO: {metrics.dso.toFixed(1)} days → {dsoTarget.toFixed(1)} days</span>
                          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                            {(((metrics.dso - dsoTarget) / metrics.dso) * 100).toFixed(1)}% improvement
                          </Badge>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm">
                          <span>DIO: {metrics.dio.toFixed(1)} days → {dioTarget.toFixed(1)} days</span>
                          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                            {(((metrics.dio - dioTarget) / metrics.dio) * 100).toFixed(1)}% improvement
                          </Badge>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm">
                          <span>DPO: {metrics.dpo.toFixed(1)} days → {dpoTarget.toFixed(1)} days</span>
                          <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                            {(((dpoTarget - metrics.dpo) / metrics.dpo) * 100).toFixed(1)}% increase
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="optimization">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <UILabel>Optimization Approach</UILabel>
                    <div className="flex gap-2">
                      <Button 
                        variant={optimizationTarget === "conservative" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => applyOptimizationPreset("conservative")}
                      >
                        Conservative
                      </Button>
                      <Button 
                        variant={optimizationTarget === "balanced" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => applyOptimizationPreset("balanced")}
                      >
                        Balanced
                      </Button>
                      <Button 
                        variant={optimizationTarget === "aggressive" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => applyOptimizationPreset("aggressive")}
                      >
                        Aggressive
                      </Button>
                      <Button 
                        variant={optimizationTarget === "custom" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => applyOptimizationPreset("custom")}
                      >
                        Custom
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <UILabel htmlFor="seasonality-toggle" className="flex items-center gap-2 cursor-pointer">
                      <Lightbulb className="h-4 w-4 text-amber-500" />
                      Show Seasonal Impact
                    </UILabel>
                    <Button 
                      size="sm" 
                      variant={showSeasonality ? "default" : "outline"}
                      onClick={() => setShowSeasonality(!showSeasonality)}
                    >
                      {showSeasonality ? "Hide" : "Show"}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between">
                        <UILabel>Days Sales Outstanding (DSO)</UILabel>
                        <span className="text-sm">{dsoTarget.toFixed(1)} days</span>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <Slider 
                          value={[dsoTarget]}
                          min={15}
                          max={90}
                          step={0.5}
                          onValueChange={(value) => setDsoTarget(value[0])}
                        />
                        <Input 
                          type="number" 
                          value={dsoTarget} 
                          onChange={(e) => setDsoTarget(parseFloat(e.target.value))} 
                          className="w-20" 
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between">
                        <UILabel>Days Inventory Outstanding (DIO)</UILabel>
                        <span className="text-sm">{dioTarget.toFixed(1)} days</span>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <Slider 
                          value={[dioTarget]}
                          min={15}
                          max={90}
                          step={0.5}
                          onValueChange={(value) => setDioTarget(value[0])}
                        />
                        <Input 
                          type="number" 
                          value={dioTarget} 
                          onChange={(e) => setDioTarget(parseFloat(e.target.value))} 
                          className="w-20" 
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between">
                        <UILabel>Days Payable Outstanding (DPO)</UILabel>
                        <span className="text-sm">{dpoTarget.toFixed(1)} days</span>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <Slider 
                          value={[dpoTarget]}
                          min={15}
                          max={90}
                          step={0.5}
                          onValueChange={(value) => setDpoTarget(value[0])}
                        />
                        <Input 
                          type="number" 
                          value={dpoTarget} 
                          onChange={(e) => setDpoTarget(parseFloat(e.target.value))} 
                          className="w-20" 
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Results:</span>
                      <Badge variant="outline">
                        {optimizedCCC.toFixed(1)} days CCC (vs. {originalCCC.toFixed(1)} days)
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      These optimizations would improve your cash conversion cycle by {cccImprovement.toFixed(1)} days 
                      and potentially free up {formatCurrency(cashFlowImprovement)} in cash flow.  
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
