import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";
import { MetricComparison } from "brain/data-contracts";

interface BenchmarkRadarChartProps {
  comparisons: MetricComparison[];
  title?: string;
  description?: string;
  maxMetrics?: number;
}

export const BenchmarkRadarChart = ({
  comparisons,
  title = "Radar Performance Analysis",
  description = "Multi-dimensional view of performance metrics",
  maxMetrics = 6,
}: BenchmarkRadarChartProps) => {
  // Since radar charts work best with a limited number of metrics,
  // select the most significant ones (highest absolute difference)
  const significantMetrics = [...comparisons]
    .sort((a, b) => Math.abs(b.difference_percent) - Math.abs(a.difference_percent))
    .slice(0, maxMetrics);
  
  // Transform for radar chart - normalize values for better visualization
  const chartData = significantMetrics.map((comp) => {
    // Create normalized values for better radar chart visualization
    // Use a multiplier to ensure positive values
    const normalizedCompanyValue = comp.is_favorable ? 100 + Math.abs(comp.difference_percent) : 100 - Math.abs(comp.difference_percent);
    return {
      metric: comp.metric_name,
      company: normalizedCompanyValue,
      benchmark: 100, // Benchmark is our baseline (100%)
    };
  });

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} />
              <Radar
                name="Your Company"
                dataKey="company"
                stroke="#2563eb"
                fill="#2563eb"
                fillOpacity={0.6}
              />
              <Radar
                name="Industry Benchmark"
                dataKey="benchmark"
                stroke="#9ca3af"
                fill="#9ca3af"
                fillOpacity={0.6}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-xs text-center text-muted-foreground">
          Showing {significantMetrics.length} most significant metrics out of {comparisons.length} total
        </p>
      </CardContent>
    </Card>
  );
};
