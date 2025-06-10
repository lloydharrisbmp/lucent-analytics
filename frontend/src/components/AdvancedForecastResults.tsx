import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdvancedForecastResult, ForecastAlgorithm, ForecastVarianceAnalysis } from "../utils/financial-types";
import { formatCurrency, formatPercentage } from "../utils/financial-data";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
  Area,
  ReferenceLine,
  ScatterChart,
  Scatter,
} from "recharts";
import { Badge } from "@/components/ui/badge";

interface AdvancedForecastResultsProps {
  result: AdvancedForecastResult;
}

export function AdvancedForecastResults({ result }: AdvancedForecastResultsProps) {
  // State for selected tabs
  const [activeTab, setActiveTab] = useState("summary");

  // Prepare data for charts
  const chartData = result.periods.map((period) => {
    const revenueTotal = period.revenue.reduce(
      (sum, item) => sum + item.amount,
      0
    );
    const costOfSalesTotal = period.costOfSales.reduce(
      (sum, item) => sum + item.amount,
      0
    );
    const expensesTotal = period.expenses.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    return {
      name: period.label,
      revenue: revenueTotal,
      costOfSales: costOfSalesTotal,
      expenses: expensesTotal,
      grossProfit: period.grossProfit,
      netIncome: period.netIncome,
      // Add confidence intervals if available
      lowerBound: result.confidenceIntervals ? 
        result.confidenceIntervals.lower[period.period] : undefined,
      upperBound: result.confidenceIntervals ? 
        result.confidenceIntervals.upper[period.period] : undefined,
    };
  });

  // Get algorithm display name
  const getAlgorithmName = (algorithm: ForecastAlgorithm): string => {
    switch(algorithm) {
      case 'simple': return 'Simple Growth';
      case 'moving-average': return 'Moving Average';
      case 'exponential-smoothing': return 'Exponential Smoothing';
      case 'seasonal-adjustment': return 'Seasonal Adjustment';
      case 'regression': return 'Linear Regression';
      case 'arima': return 'ARIMA';
      case 'holt-winters': return 'Holt-Winters';
      default: return algorithm;
    }
  };

  // Prepare time series components data for visualization
  const timeSeriesData = result.timeSeriesComponents ? 
    result.timeSeriesComponents.original.map((val, idx) => ({
      index: idx,
      original: val,
      trend: result.timeSeriesComponents?.trend[idx] || null,
      seasonal: result.timeSeriesComponents?.seasonal[idx] || null,
      residual: result.timeSeriesComponents?.residual[idx] || null,
    })) : [];

  // Get impact class for variance analysis
  const getImpactClass = (impact: 'high' | 'medium' | 'low'): string => {
    switch(impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return '';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Advanced Forecast: {result.scenarioName}</CardTitle>
            <CardDescription>
              {result.periodType === "monthly"
                ? "Monthly projections"
                : result.periodType === "quarterly"
                ? "Quarterly projections"
                : "Yearly projections"} using {getAlgorithmName(result.algorithm)}
                {result.seasonallyAdjusted && " with seasonal adjustments"}
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-sm">
            {getAlgorithmName(result.algorithm)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="summary" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="seasonal">Seasonal Analysis</TabsTrigger>
            {result.varianceAnalysis && result.varianceAnalysis.length > 0 && (
              <TabsTrigger value="variance">Variance Analysis</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="summary">
            <div className="space-y-6">
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8884d8"
                      name="Revenue"
                    />
                    <Line
                      type="monotone"
                      dataKey="grossProfit"
                      stroke="#82ca9d"
                      name="Gross Profit"
                    />
                    <Line
                      type="monotone"
                      dataKey="netIncome"
                      stroke="#ffc658"
                      name="Net Income"
                      strokeWidth={2}
                    />
                    {result.confidenceIntervals && (
                      <Area
                        dataKey="upperBound"
                        stroke="rgba(255, 198, 88, 0.3)"
                        fill="rgba(255, 198, 88, 0.2)"
                        name="Upper Bound"
                      />
                    )}
                    {result.confidenceIntervals && (
                      <Area
                        dataKey="lowerBound"
                        stroke="rgba(255, 198, 88, 0.3)"
                        fill="rgba(255, 198, 88, 0.2)"
                        name="Lower Bound"
                      />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Forecast Summary</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Average</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Revenue</TableCell>
                        <TableCell>{formatCurrency(result.totals.revenue)}</TableCell>
                        <TableCell>
                          {formatCurrency(result.totals.revenue / result.periods.length)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Cost of Sales</TableCell>
                        <TableCell>
                          {formatCurrency(result.totals.costOfSales)}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(
                            result.totals.costOfSales / result.periods.length
                          )}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Gross Profit</TableCell>
                        <TableCell>
                          {formatCurrency(result.totals.grossProfit)}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(
                            result.totals.grossProfit / result.periods.length
                          )}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Expenses</TableCell>
                        <TableCell>{formatCurrency(result.totals.expenses)}</TableCell>
                        <TableCell>
                          {formatCurrency(result.totals.expenses / result.periods.length)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Net Income</TableCell>
                        <TableCell>{formatCurrency(result.totals.netIncome)}</TableCell>
                        <TableCell>
                          {formatCurrency(result.totals.netIncome / result.periods.length)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {result.accuracyMetrics && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Forecast Accuracy</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Metric</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Interpretation</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">MAPE</TableCell>
                          <TableCell>{result.accuracyMetrics.mape.toFixed(2)}%</TableCell>
                          <TableCell>
                            Mean Absolute Percentage Error
                            {result.accuracyMetrics.mape < 10 ? " (Excellent)" :
                             result.accuracyMetrics.mape < 20 ? " (Good)" :
                             result.accuracyMetrics.mape < 30 ? " (Fair)" : " (Poor)"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">MAE</TableCell>
                          <TableCell>{formatCurrency(result.accuracyMetrics.mae)}</TableCell>
                          <TableCell>Mean Absolute Error</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">RMSE</TableCell>
                          <TableCell>{formatCurrency(result.accuracyMetrics.rmse)}</TableCell>
                          <TableCell>Root Mean Square Error</TableCell>
                        </TableRow>
                        {result.accuracyMetrics.r2 !== undefined && (
                          <TableRow>
                            <TableCell className="font-medium">R²</TableCell>
                            <TableCell>{result.accuracyMetrics.r2.toFixed(2)}</TableCell>
                            <TableCell>
                              Coefficient of Determination
                              {result.accuracyMetrics.r2 > 0.8 ? " (Strong fit)" :
                               result.accuracyMetrics.r2 > 0.5 ? " (Moderate fit)" : " (Weak fit)"}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="revenue">
            <div className="space-y-6">
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={result.periods.map((period) => {
                      const items: Record<string, number> = {};
                      period.revenue.forEach((item) => {
                        items[item.id] = item.amount;
                      });
                      return {
                        name: period.label,
                        ...items,
                      };
                    })}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => formatCurrency(value as number)}
                    />
                    <Legend />
                    {result.periods[0].revenue.map((item, index) => (
                      <Bar
                        key={item.id}
                        dataKey={item.id}
                        name={item.name}
                        fill={`hsl(${index * 40}, 70%, 50%)`}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="expenses">
            <div className="space-y-6">
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={result.periods.map((period) => {
                      const items: Record<string, number> = {};
                      period.expenses.forEach((item) => {
                        items[item.id] = item.amount;
                      });
                      return {
                        name: period.label,
                        ...items,
                      };
                    })}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => formatCurrency(value as number)}
                    />
                    <Legend />
                    {result.periods[0].expenses.map((item, index) => (
                      <Bar
                        key={item.id}
                        dataKey={item.id}
                        name={item.name}
                        fill={`hsl(${index * 40 + 120}, 70%, 50%)`}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="seasonal">
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md mb-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Seasonal decomposition breaks down your time series data into trend, seasonal, and residual components.
                  Understanding these patterns allows for more accurate forecasting by accounting for cyclical business fluctuations.
                </p>
              </div>
              
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={timeSeriesData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="index" label={{ value: 'Time Period', position: 'insideBottom', offset: -5 }} />
                    <YAxis />
                    <Tooltip formatter={(value) => value !== null && typeof value === 'number' ? value.toFixed(2) : 'N/A'} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="original"
                      stroke="#8884d8"
                      name="Original Data"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="trend"
                      stroke="#82ca9d"
                      name="Trend Component"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="seasonal"
                      stroke="#ffc658"
                      name="Seasonal Component"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="residual"
                      stroke="#ff7300"
                      name="Residual"
                      dot={false}
                    />
                    <ReferenceLine y={0} stroke="#666" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">Trend Component</CardTitle>
                    <CardDescription>
                      The long-term progression of the series
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      The trend shows the underlying direction and rate of change in your data, 
                      indicating whether your business is generally growing, declining, or remaining stable 
                      over time, independent of seasonal variations.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">Seasonal Component</CardTitle>
                    <CardDescription>
                      Repeating patterns at fixed intervals
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      The seasonal component captures regular fluctuations that occur at specific time periods, 
                      such as holiday sales spikes, summer slumps, or end-of-quarter pushes. Recognizing these 
                      patterns helps in planning inventory, staffing, and cash flow management.
                    </p>
                    <div className="mt-2">
                      <span className="text-sm font-medium">Seasonality type: </span>
                      <Badge variant="outline">
                        {result.algorithm.includes("seasonal") || result.seasonallyAdjusted ? 
                          "Seasonal" : 
                          "None"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">Residual Component</CardTitle>
                    <CardDescription>
                      Unexplained variations after removing trend and seasonality
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Residuals represent random fluctuations, one-time events, or other factors not captured 
                      by the trend and seasonal components. Large residuals may indicate unusual business events 
                      or the need for a more complex forecasting model.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">Forecast Implications</CardTitle>
                    <CardDescription>
                      How seasonality affects your business planning
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Understanding seasonal patterns helps you anticipate cash flow needs, adjust inventory levels, 
                      and plan marketing campaigns to align with natural business cycles. This leads to more accurate 
                      budgeting and reduces surprises in financial performance.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {result.varianceAnalysis && (
            <TabsContent value="variance">
              <div className="space-y-6">
                <h3 className="text-lg font-medium mb-2">Forecast vs. Actual Variance Analysis</h3>
                <div className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md mb-4">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    This analysis compares forecasted values with actual results to help improve future forecasts.
                    Large variances may indicate unusual business conditions or forecasting model limitations.
                  </p>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead>Forecasted</TableHead>
                      <TableHead>Actual</TableHead>
                      <TableHead>Variance</TableHead>
                      <TableHead>Variance %</TableHead>
                      <TableHead>Impact</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.varianceAnalysis.map((item: ForecastVarianceAnalysis, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{item.periodLabel}</TableCell>
                        <TableCell>{formatCurrency(item.predicted)}</TableCell>
                        <TableCell>{formatCurrency(item.actual)}</TableCell>
                        <TableCell className={item.variance < 0 ? 'text-red-600' : 'text-green-600'}>
                          {formatCurrency(item.variance)}
                        </TableCell>
                        <TableCell className={item.variancePercent < 0 ? 'text-red-600' : 'text-green-600'}>
                          {item.variancePercent.toFixed(2)}%
                        </TableCell>
                        <TableCell>
                          <Badge className={getImpactClass(item.impact)}>
                            {item.impact.toUpperCase()}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="h-[400px] w-full">
                    <h4 className="text-md font-medium mb-2">Forecast vs. Actual Comparison</h4>
                    <ResponsiveContainer width="100%" height="90%">
                      <ComposedChart
                        data={result.varianceAnalysis.map((item) => ({
                          period: item.periodLabel,
                          forecast: item.predicted,
                          actual: item.actual,
                        }))}
                        margin={{ top: 20, right: 20, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                        <Legend />
                        <Bar dataKey="forecast" name="Forecast" fill="#8884d8" />
                        <Bar dataKey="actual" name="Actual" fill="#82ca9d" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="h-[400px] w-full">
                    <h4 className="text-md font-medium mb-2">Variance Magnitude</h4>
                    <ResponsiveContainer width="100%" height="90%">
                      <ComposedChart
                        data={result.varianceAnalysis.map((item) => ({
                          period: item.periodLabel,
                          variance: item.variance,
                          variancePct: item.variancePercent,
                        }))}
                        margin={{ top: 20, right: 20, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis yAxisId="dollar" />
                        <YAxis yAxisId="percent" orientation="right" />
                        <Tooltip formatter={(value, name) => {
                          if (name === "variance") return formatCurrency(value as number);
                          return `${(value as number).toFixed(2)}%`;
                        }} />
                        <Legend />
                        <Line 
                          yAxisId="dollar"
                          type="monotone" 
                          dataKey="variance" 
                          name="Variance ($)" 
                          stroke="#ff7300" 
                          strokeWidth={2}
                        />
                        <Line 
                          yAxisId="percent"
                          type="monotone" 
                          dataKey="variancePct" 
                          name="Variance (%)" 
                          stroke="#4ade80" 
                          strokeWidth={2}
                        />
                        <ReferenceLine yAxisId="dollar" y={0} stroke="#666" />
                        <ReferenceLine yAxisId="percent" y={0} stroke="#666" strokeDasharray="3 3" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="text-md font-medium mb-2">Accuracy Visualization</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <ScatterChart
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                      <CartesianGrid />
                      <XAxis 
                        type="number" 
                        dataKey="actual" 
                        name="Actual" 
                        unit="$" 
                        label={{ value: 'Actual Values', position: 'insideBottomRight', offset: -5 }} 
                      />
                      <YAxis 
                        type="number" 
                        dataKey="predicted" 
                        name="Forecast" 
                        unit="$" 
                        label={{ value: 'Forecast Values', angle: -90, position: 'insideLeft' }} 
                      />
                      <Tooltip 
                        cursor={{ strokeDasharray: '3 3' }}
                        formatter={(value) => formatCurrency(value as number)}
                      />
                      <ReferenceLine y={0} stroke="#666" />
                      <ReferenceLine x={0} stroke="#666" />
                      <ReferenceLine x={100} y={100} stroke="blue" strokeDasharray="8 8" />
                      <Scatter 
                        name="Values" 
                        data={result.varianceAnalysis.map((item) => ({
                          actual: item.actual,
                          predicted: item.predicted,
                          periodLabel: item.periodLabel,
                          impact: item.impact
                        }))}
                        fill={(entry) => {
                          // @ts-ignore
                          switch(entry.impact) {
                            case 'high': return '#ef4444';
                            case 'medium': return '#f59e0b';
                            case 'low': return '#22c55e';
                            default: return '#3b82f6';
                          }
                        }}
                      />
                      <Legend />
                    </ScatterChart>
                  </ResponsiveContainer>
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    Perfect forecasts would fall on the diagonal line. Points above the line represent overestimates, 
                    while points below represent underestimates.                  
                  </p>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}
