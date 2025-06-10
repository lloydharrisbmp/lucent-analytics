import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AdvancedForecastResult, ForecastAlgorithm } from "../utils/financial-types";
import { formatCurrency } from "../utils/financial-data";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface AlgorithmComparisonProps {
  results: AdvancedForecastResult[];
}

export function AlgorithmComparison({ results }: AlgorithmComparisonProps) {
  const [focusedAlgorithm, setFocusedAlgorithm] = useState<string | null>(null);

  // Get algorithm display name
  const getAlgorithmName = (algorithm: ForecastAlgorithm): string => {
    switch (algorithm) {
      case "simple":
        return "Simple Growth";
      case "moving-average":
        return "Moving Average";
      case "exponential-smoothing":
        return "Exponential Smoothing";
      case "seasonal-adjustment":
        return "Seasonal Adjustment";
      case "regression":
        return "Linear Regression";
      case "arima":
        return "ARIMA";
      case "holt-winters":
        return "Holt-Winters";
      default:
        return algorithm;
    }
  };

  // Prepare data for the comparison chart
  const prepareChartData = () => {
    // We need to ensure all results have the same periods
    // Take the first result's periods as the base
    if (results.length === 0) return [];

    const basePeriods = results[0].periods;
    return basePeriods.map((period, index) => {
      const dataPoint: Record<string, any> = {
        name: period.label,
      };

      // Add net income for each algorithm
      results.forEach((result) => {
        if (result.periods[index]) {
          dataPoint[result.algorithm] = result.periods[index].netIncome;
        }
      });

      return dataPoint;
    });
  };

  const comparisonData = prepareChartData();

  // Calculate accuracy metrics comparison
  const compareAccuracyMetrics = () => {
    return results
      .filter((result) => result.accuracyMetrics)
      .map((result) => ({
        algorithm: result.algorithm,
        algorithmName: getAlgorithmName(result.algorithm),
        mape: result.accuracyMetrics?.mape || 0,
        rmse: result.accuracyMetrics?.rmse || 0,
        mae: result.accuracyMetrics?.mae || 0,
        r2: result.accuracyMetrics?.r2,
      }))
      .sort((a, b) => a.mape - b.mape); // Sort by MAPE (lower is better)
  };

  const accuracyComparison = compareAccuracyMetrics();

  // Generate unique colors for each algorithm
  const algorithmColors: Record<string, string> = {
    "simple": "#8884d8",
    "moving-average": "#82ca9d",
    "exponential-smoothing": "#ffc658",
    "seasonal-adjustment": "#ff7300",
    "regression": "#0088fe",
    "arima": "#00c49f",
    "holt-winters": "#ffbb28",
  };

  // Calculate forecast range (min and max values)
  const calculateRange = () => {
    let min = Infinity;
    let max = -Infinity;

    comparisonData.forEach((dataPoint) => {
      results.forEach((result) => {
        const value = dataPoint[result.algorithm];
        if (value !== undefined) {
          min = Math.min(min, value);
          max = Math.max(max, value);
        }
      });
    });

    return { min, max };
  };

  const { min, max } = calculateRange();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Algorithm Comparison</CardTitle>
        <CardDescription>
          Compare forecast results across different algorithms
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={comparisonData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis
                domain={[
                  Math.floor(min * 0.9),
                  Math.ceil(max * 1.1),
                ]}
              />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend
                onClick={(e) => {
                  setFocusedAlgorithm(
                    focusedAlgorithm === e.dataKey ? null : (e.dataKey as string)
                  );
                }}
              />
              {results.map((result) => (
                <Line
                  key={result.algorithm}
                  type="monotone"
                  dataKey={result.algorithm}
                  name={getAlgorithmName(result.algorithm)}
                  stroke={algorithmColors[result.algorithm] || "#000"}
                  strokeWidth={
                    focusedAlgorithm === result.algorithm ? 3 : focusedAlgorithm ? 1 : 2
                  }
                  opacity={focusedAlgorithm === null || focusedAlgorithm === result.algorithm ? 1 : 0.3}
                  dot={focusedAlgorithm === result.algorithm}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {accuracyComparison.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-2">Accuracy Comparison</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Lower MAPE, RMSE, and MAE values indicate better forecast accuracy. Higher R² indicates better fit.
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Algorithm</TableHead>
                  <TableHead>MAPE (%)</TableHead>
                  <TableHead>RMSE</TableHead>
                  <TableHead>MAE</TableHead>
                  <TableHead>R²</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accuracyComparison.map((item) => (
                  <TableRow key={item.algorithm}>
                    <TableCell>
                      <Badge variant="outline">{item.algorithmName}</Badge>
                    </TableCell>
                    <TableCell
                      className={`font-medium ${item.mape < 10 ? "text-green-600" : item.mape < 20 ? "text-yellow-600" : "text-red-600"}`}
                    >
                      {item.mape.toFixed(2)}
                    </TableCell>
                    <TableCell>{formatCurrency(item.rmse)}</TableCell>
                    <TableCell>{formatCurrency(item.mae)}</TableCell>
                    <TableCell>
                      {item.r2 !== undefined
                        ? item.r2.toFixed(2)
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {results.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-2">Forecast Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((result) => (
                <Card key={result.algorithm} className="border border-gray-200">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base">
                        {getAlgorithmName(result.algorithm)}
                      </CardTitle>
                      {result.seasonallyAdjusted && (
                        <Badge variant="secondary" className="text-xs">
                          Seasonal
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Net Income (Total):</span>
                        <span className="font-medium">
                          {formatCurrency(result.totals.netIncome)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Average:</span>
                        <span className="font-medium">
                          {formatCurrency(result.totals.netIncome / result.periods.length)}
                        </span>
                      </div>
                      {result.accuracyMetrics && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">MAPE:</span>
                          <span
                            className={`font-medium ${result.accuracyMetrics.mape < 10 ? "text-green-600" : result.accuracyMetrics.mape < 20 ? "text-yellow-600" : "text-red-600"}`}
                          >
                            {result.accuracyMetrics.mape.toFixed(2)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
