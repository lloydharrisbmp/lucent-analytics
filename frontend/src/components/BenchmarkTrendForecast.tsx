import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon } from "@radix-ui/react-icons";
import { Badge } from "@/components/ui/badge";
import { TrendForecast } from "../utils/benchmark-insights";



interface BenchmarkTrendForecastProps {
  forecasts: TrendForecast[];
  overallTrend: string;
  timeHorizon: string;
}

export const BenchmarkTrendForecast = ({ 
  forecasts,
  overallTrend,
  timeHorizon,
}: BenchmarkTrendForecastProps) => {
  // Format a metric name for display
  const formatMetricName = (name: string) => {
    return name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Format a value based on its magnitude
  const formatValue = (value: number): string => {
    if (value < 1) {
      // Likely a ratio or percentage
      return `${(value * 100).toFixed(2)}%`;
    } else if (value > 1000) {
      // Likely a dollar value
      return `$${value.toLocaleString("en-AU")}`; 
    } else {
      // Generic number
      return value.toFixed(2);
    }
  };

  // Helper to get trend icon and color
  const getTrendIndicator = (direction: string) => {
    switch (direction) {
      case "positive":
      case "strongly_positive":
      case "slightly_positive":
        return {
          icon: <ArrowUpIcon className="h-4 w-4" />,
          color: "text-green-500",
          badgeColor: "bg-green-100 text-green-800",
          label: "Positive",
        };
      case "negative":
      case "strongly_negative":
      case "slightly_negative":
        return {
          icon: <ArrowDownIcon className="h-4 w-4" />,
          color: "text-red-500",
          badgeColor: "bg-red-100 text-red-800",
          label: "Negative",
        };
      default:
        return {
          icon: <ArrowRightIcon className="h-4 w-4" />,
          color: "text-gray-500",
          badgeColor: "bg-gray-100 text-gray-800",
          label: "Neutral",
        };
    }
  };

  // Get overall trend description
  const getOverallTrendDescription = (trend: string) => {
    switch (trend) {
      case "strongly_positive":
        return "Your business is projected to significantly outperform industry benchmarks over the next period.";
      case "positive":
        return "Your business is projected to improve relative to industry benchmarks over the next period.";
      case "strongly_negative":
        return "Your business is projected to significantly underperform industry benchmarks over the next period without intervention.";
      case "negative":
        return "Your business is projected to underperform industry benchmarks over the next period without adjustments.";
      case "mixed":
        return "Your business shows mixed trend indicators across different metrics.";
      default:
        return "Your business is projected to maintain its current position relative to industry benchmarks.";
    }
  };

  // Get overall trend indicator
  const overallIndicator = getTrendIndicator(overallTrend);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trend Forecast</CardTitle>
        <CardDescription>
          Projected performance over the next {timeHorizon}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className={`text-lg font-medium flex items-center ${overallIndicator.color}`}>
            {overallIndicator.icon}
            <span className="ml-1">Overall Trend: {overallIndicator.label}</span>
          </div>
          <Badge className={overallIndicator.badgeColor}>
            {timeHorizon} Outlook
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground">
          {getOverallTrendDescription(overallTrend)}
        </p>

        <div className="space-y-4">
          <h4 className="text-sm font-medium">Key Metrics Forecast</h4>
          <div className="space-y-3">
            {forecasts.map((forecast, index) => {
              const indicator = getTrendIndicator(forecast.trend_direction);
              return (
                <div key={index} className="border rounded-md p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">
                        {formatMetricName(forecast.metric_name)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {forecast.explanation}
                      </div>
                    </div>
                    <Badge className={indicator.badgeColor}>
                      {indicator.label}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <div className="text-xs text-muted-foreground">Current</div>
                      <div className="font-medium">
                        {formatValue(forecast.current_value)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Projected</div>
                      <div className="font-medium flex items-center">
                        {formatValue(forecast.projected_value)}
                        <span className={`ml-2 text-xs ${indicator.color}`}>
                          {forecast.projected_change_percent > 0 ? "+" : ""}
                          {forecast.projected_change_percent.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
