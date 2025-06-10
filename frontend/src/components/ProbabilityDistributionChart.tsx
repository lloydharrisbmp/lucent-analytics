import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar, ReferenceLine } from "recharts";

interface Percentiles {
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
}

interface ProbabilityDistribution {
  values: number[];
  percentiles: Percentiles;
}

interface Scenario {
  id: string;
  name: string;
  probability_distributions: Record<string, ProbabilityDistribution>;
}

interface ProbabilityDistributionChartProps {
  scenarios: Scenario[];
  targetMetric: string;
}

export const ProbabilityDistributionChart: React.FC<ProbabilityDistributionChartProps> = ({ scenarios, targetMetric }) => {
  const [chartType, setChartType] = useState<"density" | "cumulative" | "histogram">("density");

  // Prepares the data for the density plot (PDF)
  const prepareDensityData = () => {
    // Calculate histogram bins for each scenario
    const histogramData: Record<string, any[]> = {};

    scenarios.forEach(scenario => {
      const distribution = scenario.probability_distributions[targetMetric];
      if (!distribution) return;

      const values = [...distribution.values].sort((a, b) => a - b);
      
      // Get min and max across all scenarios
      const min = Math.min(...values);
      const max = Math.max(...values);
      
      // Create bins
      const binCount = 30;
      const binSize = (max - min) / binCount;
      const bins = Array(binCount).fill(0);
      
      // Fill bins
      values.forEach(value => {
        const binIndex = Math.min(binCount - 1, Math.floor((value - min) / binSize));
        bins[binIndex]++;
      });
      
      // Normalize to create a density
      const totalValues = values.length;
      const normalizedBins = bins.map(count => count / totalValues / binSize);
      
      // Create data points for the chart
      histogramData[scenario.id] = normalizedBins.map((density, index) => {
        const binStart = min + index * binSize;
        return {
          value: binStart + binSize / 2, // Use bin midpoint as x value
          [scenario.name]: density
        };
      });
    });

    // Merge all scenario data points
    const mergedData: any[] = [];
    Object.values(histogramData).forEach((scenarioData, index) => {
      scenarioData.forEach((dataPoint, i) => {
        if (!mergedData[i]) {
          mergedData[i] = { value: dataPoint.value };
        }
        Object.entries(dataPoint).forEach(([key, value]) => {
          if (key !== 'value') {
            mergedData[i][key] = value;
          }
        });
      });
    });
    
    return mergedData;
  };

  // Prepares the data for the cumulative distribution function (CDF)
  const prepareCumulativeData = () => {
    const cdfData: Record<string, any[]> = {};

    scenarios.forEach(scenario => {
      const distribution = scenario.probability_distributions[targetMetric];
      if (!distribution) return;

      const values = [...distribution.values].sort((a, b) => a - b);
      const totalValues = values.length;
      
      // Create CDF points
      cdfData[scenario.id] = values.map((value, index) => ({
        value,
        [scenario.name]: (index + 1) / totalValues
      }));
    });

    // Merge all scenario data points - for CDF, we need more granular representation
    let allValues: number[] = [];
    scenarios.forEach(scenario => {
      const distribution = scenario.probability_distributions[targetMetric];
      if (distribution) {
        allValues = [...allValues, ...distribution.values];
      }
    });
    
    // Sort all values and remove duplicates
    allValues = [...new Set(allValues)].sort((a, b) => a - b);
    
    // Create unified data points
    const mergedData = allValues.map(value => {
      const dataPoint: any = { value };
      
      scenarios.forEach(scenario => {
        const distribution = scenario.probability_distributions[targetMetric];
        if (!distribution) return;
        
        // Find the CDF value for this scenario at this value point
        const values = [...distribution.values].sort((a, b) => a - b);
        const totalValues = values.length;
        const countBelow = values.filter(v => v <= value).length;
        
        dataPoint[scenario.name] = countBelow / totalValues;
      });
      
      return dataPoint;
    });
    
    return mergedData;
  };

  // Prepares the data for the histogram
  const prepareHistogramData = () => {
    // Calculate histogram bins for each scenario
    const histogramData: any[] = [];

    // Find global min and max across all scenarios
    let globalMin = Infinity;
    let globalMax = -Infinity;
    
    scenarios.forEach(scenario => {
      const distribution = scenario.probability_distributions[targetMetric];
      if (!distribution) return;

      const values = distribution.values;
      globalMin = Math.min(globalMin, Math.min(...values));
      globalMax = Math.max(globalMax, Math.max(...values));
    });
    
    // Create uniform bins across all scenarios
    const binCount = 20;
    const binSize = (globalMax - globalMin) / binCount;
    
    // Prepare bin edges
    const binEdges = Array(binCount + 1).fill(0).map((_, i) => globalMin + i * binSize);
    
    // Fill histogram data
    for (let i = 0; i < binCount; i++) {
      const binStart = binEdges[i];
      const binEnd = binEdges[i + 1];
      const binCenter = (binStart + binEnd) / 2;
      
      const dataPoint: any = {
        binCenter,
        binRange: `${binStart.toFixed(0)} - ${binEnd.toFixed(0)}`,
      };
      
      // Count values in this bin for each scenario
      scenarios.forEach(scenario => {
        const distribution = scenario.probability_distributions[targetMetric];
        if (!distribution) {
          dataPoint[scenario.name] = 0;
          return;
        }
        
        const count = distribution.values.filter(
          value => value >= binStart && value < binEnd
        ).length;
        
        dataPoint[scenario.name] = count;
      });
      
      histogramData.push(dataPoint);
    }
    
    return histogramData;
  };

  // Get data based on selected chart type
  const getChartData = () => {
    switch (chartType) {
      case "density":
        return prepareDensityData();
      case "cumulative":
        return prepareCumulativeData();
      case "histogram":
        return prepareHistogramData();
      default:
        return [];
    }
  };

  // Format the tooltip value based on chart type
  const formatTooltipValue = (value: number, name: string, chartType: string) => {
    if (chartType === "density") {
      return [value.toExponential(2), "Probability Density"];
    } else if (chartType === "cumulative") {
      return [`${(value * 100).toFixed(1)}%`, "Cumulative Probability"];
    } else {
      return [value, "Count"];
    }
  };

  // Format metric value for display
  const formatMetricValue = (value: number) => {
    if (targetMetric.includes("margin")) {
      return `${(value * 100).toFixed(1)}%`;
    }
    return value.toLocaleString('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 });
  };

  // Format axis label based on targetMetric
  const getAxisLabel = () => {
    const metricLabels: Record<string, string> = {
      revenue: "Revenue",
      ebitda: "EBITDA",
      cash_flow: "Cash Flow",
      gross_margin: "Gross Margin",
      debt_servicing_cost: "Debt Servicing Cost",
      net_profit: "Net Profit",
      working_capital: "Working Capital"
    };
    
    return metricLabels[targetMetric] || targetMetric;
  };

  const chartData = getChartData();

  // Generate percentile markers for each scenario
  const percentileMarkers = scenarios.map(scenario => {
    const distribution = scenario.probability_distributions[targetMetric];
    if (!distribution) return null;
    
    return {
      name: scenario.name,
      percentiles: distribution.percentiles
    };
  }).filter(Boolean);

  return (
    <div className="space-y-6">
      <Tabs value={chartType} onValueChange={(value) => setChartType(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="density">Probability Density</TabsTrigger>
          <TabsTrigger value="cumulative">Cumulative Probability</TabsTrigger>
          <TabsTrigger value="histogram">Histogram</TabsTrigger>
        </TabsList>
        
        <TabsContent value="density" className="pt-4">
          <div className="text-sm text-muted-foreground mb-4">
            This chart shows the probability density function (PDF) for each scenario,
            illustrating the relative likelihood of different {getAxisLabel()} outcomes.
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="value" 
                  label={{ value: getAxisLabel(), position: "insideBottomRight", offset: -10 }} 
                  tickFormatter={formatMetricValue}
                />
                <YAxis label={{ value: "Probability Density", angle: -90, position: "insideLeft" }} />
                <Tooltip 
                  formatter={(value: number, name: string) => formatTooltipValue(value, name, "density")}
                  labelFormatter={(label) => formatMetricValue(label as number)}
                />
                <Legend />
                
                {scenarios.map((scenario, index) => (
                  <Line 
                    key={scenario.id}
                    type="monotone"
                    dataKey={scenario.name}
                    stroke={`hsl(${(index * 137) % 360}, 70%, 50%)`}
                    dot={false}
                  />
                ))}
                
                {/* Add percentile markers */}
                {percentileMarkers.map((marker, markerIndex) => (
                  <React.Fragment key={`marker-${markerIndex}`}>
                    <ReferenceLine 
                      x={marker?.percentiles.p50} 
                      stroke={`hsl(${(markerIndex * 137) % 360}, 70%, 50%)`} 
                      strokeDasharray="3 3" 
                      label={{ value: `${marker?.name} Median`, position: "top" }}
                    />
                  </React.Fragment>
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
        
        <TabsContent value="cumulative" className="pt-4">
          <div className="text-sm text-muted-foreground mb-4">
            This chart shows the cumulative distribution function (CDF) for each scenario,
            indicating the probability that {getAxisLabel()} will be less than or equal to a given value.
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="value" 
                  label={{ value: getAxisLabel(), position: "insideBottomRight", offset: -10 }} 
                  tickFormatter={formatMetricValue}
                />
                <YAxis 
                  label={{ value: "Cumulative Probability", angle: -90, position: "insideLeft" }} 
                  tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => formatTooltipValue(value, name, "cumulative")}
                  labelFormatter={(label) => formatMetricValue(label as number)}
                />
                <Legend />
                
                {scenarios.map((scenario, index) => (
                  <Line 
                    key={scenario.id}
                    type="monotone"
                    dataKey={scenario.name}
                    stroke={`hsl(${(index * 137) % 360}, 70%, 50%)`}
                    dot={false}
                  />
                ))}
                
                {/* Add reference line at 50% */}
                <ReferenceLine y={0.5} stroke="#888" strokeDasharray="3 3" label="50%" />
                
                {/* Add reference lines at 10% and 90% */}
                <ReferenceLine y={0.1} stroke="#888" strokeDasharray="3 3" label="10%" />
                <ReferenceLine y={0.9} stroke="#888" strokeDasharray="3 3" label="90%" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
        
        <TabsContent value="histogram" className="pt-4">
          <div className="text-sm text-muted-foreground mb-4">
            This histogram shows the frequency distribution of {getAxisLabel()} values
            across simulation runs for each scenario.
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="binCenter" 
                  tickFormatter={formatMetricValue}
                  label={{ value: getAxisLabel(), position: "insideBottomRight", offset: -10 }}
                />
                <YAxis label={{ value: "Frequency", angle: -90, position: "insideLeft" }} />
                <Tooltip 
                  formatter={(value: number, name: string) => formatTooltipValue(value, name, "histogram")}
                  labelFormatter={(label) => label ? formatMetricValue(label as number) : ""}
                />
                <Legend />
                
                {scenarios.map((scenario, index) => (
                  <Bar 
                    key={scenario.id}
                    dataKey={scenario.name}
                    fill={`hsl(${(index * 137) % 360}, 70%, 50%)`}
                    opacity={0.7}
                  />
                ))}
                
                {/* Add percentile markers */}
                {percentileMarkers.map((marker, markerIndex) => (
                  <ReferenceLine 
                    key={`p50-${markerIndex}`}
                    x={marker?.percentiles.p50} 
                    stroke={`hsl(${(markerIndex * 137) % 360}, 70%, 50%)`} 
                    strokeDasharray="3 3" 
                    label={{ value: `${marker?.name} Median`, position: "top" }}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Percentile summary statistics */}
      <div className="pt-4">
        <h3 className="font-semibold mb-2">Percentile Summary</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="py-2 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Scenario</th>
                <th className="py-2 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">10th %</th>
                <th className="py-2 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">25th %</th>
                <th className="py-2 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Median</th>
                <th className="py-2 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">75th %</th>
                <th className="py-2 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">90th %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {percentileMarkers.map((marker, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="py-2 px-4 text-sm font-medium">{marker?.name}</td>
                  <td className="py-2 px-4 text-sm">{formatMetricValue(marker?.percentiles.p10 ?? 0)}</td>
                  <td className="py-2 px-4 text-sm">{formatMetricValue(marker?.percentiles.p25 ?? 0)}</td>
                  <td className="py-2 px-4 text-sm font-medium">{formatMetricValue(marker?.percentiles.p50 ?? 0)}</td>
                  <td className="py-2 px-4 text-sm">{formatMetricValue(marker?.percentiles.p75 ?? 0)}</td>
                  <td className="py-2 px-4 text-sm">{formatMetricValue(marker?.percentiles.p90 ?? 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
