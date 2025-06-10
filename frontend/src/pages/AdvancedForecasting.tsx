import { useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DatePicker } from "../components/DatePicker";
import { ProfitLossStatement } from "../components/ProfitLossStatement";
import { AdvancedForecastResults } from "../components/AdvancedForecastResults";
import { AlgorithmComparison } from "../components/AlgorithmComparison";
import { generateSampleScenario, generateSampleProfitAndLossStatement, getHistoricalPLData, formatCurrency } from "../utils/financial-data";
import { ForecastScenario, ForecastAssumption, ForecastModel, ForecastPeriod, ForecastAlgorithm, AdvancedForecastResult, SeasonalAdjustmentParams } from "../utils/financial-types";
import brain from "brain";

export default function AdvancedForecasting() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("configuration");
  const [algorithm, setAlgorithm] = useState<ForecastAlgorithm>("simple");
  const [scenario, setScenario] = useState<ForecastScenario>(() => generateSampleScenario());
  const [forecastResult, setForecastResult] = useState<AdvancedForecastResult | null>(null);
  const [forecastResults, setForecastResults] = useState<AdvancedForecastResult[]>([]);
  const [seasonallyAdjusted, setSeasonallyAdjusted] = useState(false);
  const [seasonalPeriod, setSeasonalPeriod] = useState(12); // Default to 12 months for monthly data
  const [decompositionMethod, setDecompositionMethod] = useState<"multiplicative" | "additive">("multiplicative");
  const [compareAlgorithms, setCompareAlgorithms] = useState(false);
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScenario({ ...scenario, name: e.target.value });
  };
  
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScenario({ ...scenario, description: e.target.value });
  };
  
  const handlePeriodTypeChange = (value: ForecastPeriod) => {
    setScenario({ ...scenario, periodType: value });
    
    // Set default seasonal period based on periodType
    if (value === "monthly") {
      setSeasonalPeriod(12); // Annual cycle for monthly data
    } else if (value === "quarterly") {
      setSeasonalPeriod(4);  // Annual cycle for quarterly data
    } else {
      setSeasonalPeriod(5);  // 5-year business cycle for yearly data
    }
  };
  
  const handlePeriodsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const periods = parseInt(e.target.value);
    if (!isNaN(periods) && periods > 0) {
      setScenario({ ...scenario, periods });
    }
  };
  
  const handleDateChange = (date: Date) => {
    setScenario({ ...scenario, startDate: date });
  };
  
  const handleGrowthRateChange = (id: string, value: string) => {
    const growthRate = parseFloat(value);
    if (!isNaN(growthRate)) {
      const updatedAssumptions = scenario.assumptions.map(assumption => {
        if (assumption.id === id) {
          return { ...assumption, growthRate };
        }
        return assumption;
      });
      setScenario({ ...scenario, assumptions: updatedAssumptions });
    }
  };
  
  const handleGrowthTypeChange = (id: string, growthType: ForecastModel) => {
    const updatedAssumptions = scenario.assumptions.map(assumption => {
      if (assumption.id === id) {
        return { ...assumption, growthType };
      }
      return assumption;
    });
    setScenario({ ...scenario, assumptions: updatedAssumptions });
  };
  
  const generateForecast = async () => {
    setIsLoading(true);
    
    try {
      // Get historical data for time series analysis
      const historicalData = getHistoricalPLData(scenario.periodType, 24); // Get 24 periods of historical data
      
      if (compareAlgorithms) {
        // List of algorithms to compare
        const algorithmsToCompare: ForecastAlgorithm[] = [
          "simple",
          "moving-average",
          "exponential-smoothing",
          "seasonal-adjustment",
          "regression",
          "arima"
        ];
        
        const results: AdvancedForecastResult[] = [];
        
        // Generate forecasts for each algorithm
        for (const alg of algorithmsToCompare) {
          try {
            const response = await brain.create_advanced_forecast({
              scenario,
              algorithm: alg,
              seasonallyAdjusted,
              seasonalPeriod,
              decompositionMethod,
              historicalData: historicalData.map(period => period.netIncome),
              // Add some actual data for variance analysis
              actualData: historicalData.slice(-6).map(period => period.netIncome),
              periodLabels: historicalData.slice(-6).map(period => period.period.label)
            });
            
            const result = await response.json();
            results.push(result);
          } catch (error) {
            console.error(`Error generating forecast for ${alg}:`, error);
          }
        }
        
        setForecastResults(results);
        setForecastResult(results[0] || null);
      } else {
        // Generate forecast for a single algorithm
        const response = await brain.create_advanced_forecast({
          scenario,
          algorithm,
          seasonallyAdjusted,
          seasonalPeriod,
          decompositionMethod,
          historicalData: historicalData.map(period => period.netIncome),
          // Add some actual data for variance analysis
          actualData: historicalData.slice(-6).map(period => period.netIncome),
          periodLabels: historicalData.slice(-6).map(period => period.period.label)
        });
        
        const result = await response.json();
        setForecastResult(result);
        setForecastResults([result]);
      }
      
      setActiveTab("results");
    } catch (error) {
      console.error("Error generating forecast:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to get algorithm description
  const getAlgorithmDescription = (algorithm: ForecastAlgorithm): string => {
    switch(algorithm) {
      case 'simple': 
        return 'Applies basic growth models to each line item based on defined assumptions.';
      case 'moving-average': 
        return 'Uses the average of the most recent periods to predict future values.';
      case 'exponential-smoothing': 
        return 'Assigns exponentially decreasing weights to past observations.';
      case 'seasonal-adjustment': 
        return 'Incorporates seasonal patterns from historical data into forecasts.';
      case 'regression': 
        return 'Fits a linear trend to historical data to predict future values.';
      case 'arima': 
        return 'Combines autoregression, differencing, and moving average techniques for accurate time-series forecasting.';
      case 'holt-winters':
        return 'Triple exponential smoothing that captures level, trend, and seasonality in time series data.';
      default: 
        return '';
    }
  };
  
  return (
    <DashboardLayout>
      <div className="container max-w-screen-xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-semibold">Advanced Forecasting</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Create sophisticated forecasts with seasonal adjustments and time-series analysis
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="results" disabled={!forecastResult}>Results</TabsTrigger>
            <TabsTrigger value="comparison" disabled={forecastResults.length <= 1}>Algorithm Comparison</TabsTrigger>
          </TabsList>

          <TabsContent value="configuration" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Scenario Setup</CardTitle>
                  <CardDescription>
                    Define the basic parameters for your forecast scenario
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Scenario Name</Label>
                    <Input
                      id="name"
                      value={scenario.name}
                      onChange={handleNameChange}
                      placeholder="Q2 2025 Forecast"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                      id="description"
                      value={scenario.description || ""}
                      onChange={handleDescriptionChange}
                      placeholder="Forecast with seasonal adjustments"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Period Type</Label>
                    <RadioGroup
                      value={scenario.periodType}
                      onValueChange={handlePeriodTypeChange}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="monthly" id="monthly" />
                        <Label htmlFor="monthly">Monthly</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="quarterly" id="quarterly" />
                        <Label htmlFor="quarterly">Quarterly</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yearly" id="yearly" />
                        <Label htmlFor="yearly">Yearly</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="periods">Number of Periods</Label>
                      <Input
                        id="periods"
                        type="number"
                        min={1}
                        max={60}
                        value={scenario.periods}
                        onChange={handlePeriodsChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <DatePicker
                        date={scenario.startDate}
                        onDateChange={handleDateChange}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Forecasting Method</CardTitle>
                  <CardDescription>
                    Select an algorithm and configure advanced options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Forecasting Algorithm</Label>
                    <Select value={algorithm} onValueChange={value => setAlgorithm(value as ForecastAlgorithm)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select algorithm" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="simple">Simple Growth</SelectItem>
                        <SelectItem value="moving-average">Moving Average</SelectItem>
                        <SelectItem value="exponential-smoothing">Exponential Smoothing</SelectItem>
                        <SelectItem value="seasonal-adjustment">Seasonal Adjustment</SelectItem>
                        <SelectItem value="regression">Linear Regression</SelectItem>
                        <SelectItem value="arima">ARIMA</SelectItem>
                        <SelectItem value="holt-winters">Holt-Winters</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500 mt-1">
                      {getAlgorithmDescription(algorithm)}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="compare"
                        checked={compareAlgorithms}
                        onCheckedChange={setCompareAlgorithms}
                      />
                      <Label htmlFor="compare">Compare Multiple Algorithms</Label>
                    </div>
                    <p className="text-sm text-gray-500">
                      Generate forecasts using different methods for comparison
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="seasonal"
                        checked={seasonallyAdjusted}
                        onCheckedChange={setSeasonallyAdjusted}
                      />
                      <Label htmlFor="seasonal">Apply Seasonal Adjustments</Label>
                    </div>
                    <p className="text-sm text-gray-500">
                      Incorporate seasonal patterns from historical data
                    </p>
                  </div>
                  
                  {seasonallyAdjusted && (
                    <div className="space-y-4 p-4 border rounded-md">
                      <div className="space-y-2">
                        <Label htmlFor="seasonalPeriod">Seasonal Period</Label>
                        <Input
                          id="seasonalPeriod"
                          type="number"
                          min={2}
                          max={365}
                          value={seasonalPeriod}
                          onChange={e => setSeasonalPeriod(parseInt(e.target.value) || 12)}
                        />
                        <p className="text-xs text-gray-500">
                          {scenario.periodType === "monthly" ? "12 for annual seasonality" :
                           scenario.periodType === "quarterly" ? "4 for annual seasonality" :
                           "Number of periods in one seasonal cycle"}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Decomposition Method</Label>
                        <RadioGroup
                          value={decompositionMethod}
                          onValueChange={value => setDecompositionMethod(value as "multiplicative" | "additive")}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="multiplicative" id="multiplicative" />
                            <Label htmlFor="multiplicative">Multiplicative</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="additive" id="additive" />
                            <Label htmlFor="additive">Additive</Label>
                          </div>
                        </RadioGroup>
                        <p className="text-xs text-gray-500">
                          Multiplicative is better for data where seasonal variations increase with the trend
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    className="w-full mt-4" 
                    onClick={generateForecast} 
                    disabled={isLoading}
                  >
                    {isLoading ? "Generating Forecast..." : "Generate Forecast"}
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Growth Assumptions</CardTitle>
                <CardDescription>
                  Define how each financial item changes over the forecast period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Revenue Assumptions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {scenario.assumptions
                        .filter(assumption => assumption.category === "revenue")
                        .map(assumption => (
                          <Card key={assumption.id}>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-md">{assumption.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="space-y-1">
                                <Label>Growth Type</Label>
                                <Select 
                                  value={assumption.growthType} 
                                  onValueChange={value => handleGrowthTypeChange(assumption.id, value as ForecastModel)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="percentage">Percentage</SelectItem>
                                    <SelectItem value="linear">Linear</SelectItem>
                                    <SelectItem value="manual">Manual</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              {assumption.growthType !== "manual" && (
                                <div className="space-y-1">
                                  <Label>Growth Rate (%)</Label>
                                  <Input
                                    type="number"
                                    value={assumption.growthRate}
                                    onChange={e => handleGrowthRateChange(assumption.id, e.target.value)}
                                    step="0.1"
                                  />
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Cost of Sales Assumptions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {scenario.assumptions
                        .filter(assumption => assumption.category === "costOfSales")
                        .map(assumption => (
                          <Card key={assumption.id}>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-md">{assumption.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="space-y-1">
                                <Label>Growth Type</Label>
                                <Select 
                                  value={assumption.growthType} 
                                  onValueChange={value => handleGrowthTypeChange(assumption.id, value as ForecastModel)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="percentage">Percentage</SelectItem>
                                    <SelectItem value="linear">Linear</SelectItem>
                                    <SelectItem value="manual">Manual</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              {assumption.growthType !== "manual" && (
                                <div className="space-y-1">
                                  <Label>Growth Rate (%)</Label>
                                  <Input
                                    type="number"
                                    value={assumption.growthRate}
                                    onChange={e => handleGrowthRateChange(assumption.id, e.target.value)}
                                    step="0.1"
                                  />
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Expense Assumptions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {scenario.assumptions
                        .filter(assumption => assumption.category === "expenses")
                        .map(assumption => (
                          <Card key={assumption.id}>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-md">{assumption.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="space-y-1">
                                <Label>Growth Type</Label>
                                <Select 
                                  value={assumption.growthType} 
                                  onValueChange={value => handleGrowthTypeChange(assumption.id, value as ForecastModel)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="percentage">Percentage</SelectItem>
                                    <SelectItem value="linear">Linear</SelectItem>
                                    <SelectItem value="manual">Manual</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              {assumption.growthType !== "manual" && (
                                <div className="space-y-1">
                                  <Label>Growth Rate (%)</Label>
                                  <Input
                                    type="number"
                                    value={assumption.growthRate}
                                    onChange={e => handleGrowthRateChange(assumption.id, e.target.value)}
                                    step="0.1"
                                  />
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Baseline Financial Data</CardTitle>
                <CardDescription>
                  Starting point for your forecast calculations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProfitLossStatement statement={scenario.baseline} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            {forecastResult && (
              <AdvancedForecastResults result={forecastResult} />
            )}
          </TabsContent>
          
          <TabsContent value="comparison" className="space-y-6">
            {forecastResults.length > 1 && (
              <AlgorithmComparison results={forecastResults} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}