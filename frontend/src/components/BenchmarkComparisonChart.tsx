import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { MetricComparison } from "brain/data-contracts";

interface BenchmarkComparisonChartProps {
  comparisons: MetricComparison[];
  title?: string;
  description?: string;
}

export const BenchmarkComparisonChart = ({
  comparisons,
  title = "Performance Comparison",
  description = "Your company's performance compared to industry benchmarks",
}: BenchmarkComparisonChartProps) => {
  // Transform the data for the chart
  const chartData = comparisons.map((comp) => ({
    name: comp.metric_name,
    company: comp.company_value,
    benchmark: comp.benchmark_value,
    percentDiff: comp.difference_percent,
    isFavorable: comp.is_favorable,
  }));

  // Helper function to determine bar color based on favorability
  const getBarColor = (isFavorable: boolean | null) => {
    if (isFavorable === true) return "#10b981"; // Green for favorable
    if (isFavorable === false) return "#ef4444"; // Red for unfavorable
    return "#6b7280"; // Gray for neutral/unknown
  };

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={120} />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "percentDiff") {
                    return [`${value.toFixed(2)}%`, "Difference"];
                  }
                  return [value.toFixed(2), name === "company" ? "Your Company" : "Industry Benchmark"];
                }}
                labelFormatter={(value) => `Metric: ${value}`}
              />
              <Legend />
              <Bar
                dataKey="company"
                name="Your Company"
                fill="#2563eb"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="benchmark"
                name="Industry Benchmark"
                fill="#9ca3af"
                radius={[4, 4, 0, 0]}
              />
              <ReferenceLine x={0} stroke="#000" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="font-medium">Performance Summary</div>
          <div className="flex flex-wrap gap-2">
            {comparisons.map((comp, index) => (
              <Badge
                key={index}
                variant={comp.is_favorable ? "default" : "destructive"}
                className="px-2 py-1"
              >
                {comp.metric_name}:{" "}
                {comp.difference_percent > 0 ? "+" : ""}
                {comp.difference_percent.toFixed(1)}%
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
