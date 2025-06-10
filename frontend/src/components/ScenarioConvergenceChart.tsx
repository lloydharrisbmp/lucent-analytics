import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Label } from "recharts";
import { format } from "date-fns";

interface ScenarioTimeSeries {
  id: string;
  name: string;
  time_series: {
    metric: string;
    values: {
      date: string;
      value: number;
    }[];
  }[];
}

interface ScenarioConvergenceChartProps {
  scenarios: ScenarioTimeSeries[];
  targetMetric: string;
}

export const ScenarioConvergenceChart: React.FC<ScenarioConvergenceChartProps> = ({ scenarios, targetMetric }) => {
  // Filter to get only the target metric data for each scenario
  const timeSeriesDataByScenario = scenarios.map(scenario => {
    const timeSeriesForMetric = scenario.time_series?.find(ts => ts.metric === targetMetric);
    return {
      id: scenario.id,
      name: scenario.name,
      values: timeSeriesForMetric?.values || []
    };
  });

  // Prepare data for the chart by combining all scenarios' time series data
  const prepareConvergenceData = () => {
    // Get all unique dates across all scenarios
    const allDates = new Set<string>();
    timeSeriesDataByScenario.forEach(scenario => {
      scenario.values.forEach(point => {
        allDates.add(point.date);
      });
    });

    // Sort dates chronologically
    const sortedDates = Array.from(allDates).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    // Create data points for each date with values from all scenarios
    const chartData = sortedDates.map(date => {
      const dataPoint: any = { date };
      
      timeSeriesDataByScenario.forEach(scenario => {
        const point = scenario.values.find(p => p.date === date);
        dataPoint[scenario.name] = point ? point.value : null;
      });
      
      return dataPoint;
    });

    return chartData;
  };

  const convergenceData = prepareConvergenceData();

  // Determine if a value should be displayed as dollar amount or percentage
  const isPercentMetric = targetMetric.includes('margin') || targetMetric.includes('ratio') || targetMetric.includes('rate');

  // Format the value for display
  const formatValue = (value: number) => {
    if (isPercentMetric) {
      return `${(value * 100).toFixed(1)}%`;
    }
    return value.toLocaleString('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 });
  };

  // Format the date for display
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, 'MMM yyyy');
    } catch (e) {
      return dateStr;
    }
  };

  // Calculate convergence/divergence metrics
  const calculateConvergence = () => {
    if (convergenceData.length === 0 || timeSeriesDataByScenario.length < 2) {
      return { converges: false, divergenceRate: 0, convergencePoint: null };
    }

    // Look at the start and end points to determine if scenarios converge or diverge
    const firstPoint = convergenceData[0];
    const lastPoint = convergenceData[convergenceData.length - 1];

    // Calculate variance at start and end
    const startValues = timeSeriesDataByScenario.map(scenario => firstPoint[scenario.name]).filter(v => v !== null);
    const endValues = timeSeriesDataByScenario.map(scenario => lastPoint[scenario.name]).filter(v => v !== null);

    if (startValues.length < 2 || endValues.length < 2) {
      return { converges: false, divergenceRate: 0, convergencePoint: null };
    }

    const startVariance = calculateVariance(startValues);
    const endVariance = calculateVariance(endValues);

    const converges = endVariance < startVariance;
    const divergenceRate = converges ? 0 : (endVariance / startVariance) - 1;

    // Find convergence point (if scenarios converge)
    let convergencePoint = null;
    if (converges) {
      // Find the point where variance is lowest
      let minVariance = Infinity;
      let minVarianceIndex = -1;

      convergenceData.forEach((point, index) => {
        const values = timeSeriesDataByScenario
          .map(scenario => point[scenario.name])
          .filter(v => v !== null);
        
        if (values.length >= 2) {
          const variance = calculateVariance(values);
          if (variance < minVariance) {
            minVariance = variance;
            minVarianceIndex = index;
          }
        }
      });

      if (minVarianceIndex !== -1) {
        convergencePoint = convergenceData[minVarianceIndex].date;
      }
    }

    return { converges, divergenceRate, convergencePoint };
  };

  // Helper function to calculate variance of an array of numbers
  const calculateVariance = (values: number[]) => {
    if (values.length < 2) return 0;
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  };

  const convergenceMetrics = calculateConvergence();
  
  // Get y-axis domain with a 10% padding
  const getYAxisDomain = () => {
    let min = Infinity;
    let max = -Infinity;
    
    timeSeriesDataByScenario.forEach(scenario => {
      scenario.values.forEach(point => {
        min = Math.min(min, point.value);
        max = Math.max(max, point.value);
      });
    });
    
    // Add 10% padding
    const padding = (max - min) * 0.1;
    return [min - padding, max + padding];
  };

  // Format the title of the metric
  const formatMetricTitle = (metric: string) => {
    return metric
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-6">
      <div className="text-muted-foreground text-sm mb-4">
        This chart shows how different scenarios evolve over time, illustrating where they converge or diverge.
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={convergenceData} margin={{ top: 20, right: 30, left: 40, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              label={{ value: 'Time Period', position: 'insideBottom', offset: -10 }}
            />
            <YAxis 
              domain={getYAxisDomain()}
              tickFormatter={formatValue}
              label={{ value: formatMetricTitle(targetMetric), angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value: number) => [formatValue(value), ""]}
              labelFormatter={formatDate}
            />
            <Legend verticalAlign="top" />
            
            {timeSeriesDataByScenario.map((scenario, index) => (
              <Line 
                key={scenario.id}
                type="monotone"
                dataKey={scenario.name}
                stroke={`hsl(${(index * 137) % 360}, 70%, 50%)`}
                strokeWidth={2}
                connectNulls
                activeDot={{ r: 6 }}
              />
            ))}
            
            {/* Add a reference line at convergence point if scenarios converge */}
            {convergenceMetrics.convergencePoint && (
              <ReferenceLine 
                x={convergenceMetrics.convergencePoint} 
                stroke="#8884d8" 
                strokeDasharray="3 3"
              >
                <Label value="Convergence Point" position="top" />
              </ReferenceLine>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Convergence metrics summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="p-4 bg-muted rounded-md">
          <h3 className="font-semibold text-sm mb-1">Scenario Relationship</h3>
          <p className="text-lg">
            {convergenceMetrics.converges ? "Converging" : "Diverging"}
          </p>
        </div>
        
        {convergenceMetrics.converges ? (
          <div className="p-4 bg-muted rounded-md">
            <h3 className="font-semibold text-sm mb-1">Convergence Point</h3>
            <p className="text-lg">
              {convergenceMetrics.convergencePoint ? formatDate(convergenceMetrics.convergencePoint) : "N/A"}
            </p>
          </div>
        ) : (
          <div className="p-4 bg-muted rounded-md">
            <h3 className="font-semibold text-sm mb-1">Divergence Rate</h3>
            <p className="text-lg">
              {convergenceMetrics.divergenceRate > 0 ? `+${(convergenceMetrics.divergenceRate * 100).toFixed(1)}%` : "0%"}
            </p>
          </div>
        )}
        
        <div className="p-4 bg-muted rounded-md">
          <h3 className="font-semibold text-sm mb-1">Long-term Implication</h3>
          <p className="text-lg">
            {convergenceMetrics.converges 
              ? "Outcomes will align over time" 
              : "Outcomes will continue to differ"}
          </p>
        </div>
      </div>
    </div>
  );
};
