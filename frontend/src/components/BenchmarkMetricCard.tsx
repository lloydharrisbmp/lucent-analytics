import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MetricComparison } from "brain/data-contracts";
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from "lucide-react";

interface BenchmarkMetricCardProps {
  metric: MetricComparison;
}

export const BenchmarkMetricCard = ({ metric }: BenchmarkMetricCardProps) => {
  // Format values based on magnitude
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

  // Determine icon and color based on favorability
  const getStatusInfo = () => {
    if (metric.is_favorable === true) {
      return {
        icon: <ArrowUpIcon className="h-4 w-4" />,
        color: "text-green-500",
        bgColor: "bg-green-50",
      };
    } else if (metric.is_favorable === false) {
      return {
        icon: <ArrowDownIcon className="h-4 w-4" />,
        color: "text-red-500",
        bgColor: "bg-red-50",
      };
    }
    return {
      icon: <MinusIcon className="h-4 w-4" />,
      color: "text-gray-500",
      bgColor: "bg-gray-50",
    };
  };

  const { icon, color, bgColor } = getStatusInfo();

  return (
    <Card className="overflow-hidden">
      <CardHeader className={`${bgColor} pb-2`}>
        <CardTitle className="text-sm font-medium">{metric.metric_name}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Your Value</p>
            <p className="text-xl font-bold">{formatValue(metric.company_value)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Benchmark</p>
            <p className="text-xl font-medium">{formatValue(metric.benchmark_value)}</p>
          </div>
          <div className={`flex items-center gap-1 ${color}`}>
            {icon}
            <span className="font-bold">
              {metric.difference_percent > 0 ? "+" : ""}
              {metric.difference_percent.toFixed(1)}%
            </span>
          </div>
        </div>
        
        {metric.percentile_rank && (
          <div className="mt-3 text-xs">
            <p className="font-medium">Percentile Rank</p>
            <p>{metric.percentile_rank.interpretation}</p>
          </div>
        )}
        
        {metric.description && (
          <p className="mt-2 text-xs text-muted-foreground">{metric.description}</p>
        )}
        
        <p className="mt-2 text-xs text-muted-foreground">
          Based on {metric.data_points_count} data points
        </p>
      </CardContent>
    </Card>
  );
};
