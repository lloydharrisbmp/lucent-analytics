import React, { useState, useEffect } from "react";
import { BenchmarkComparisonResponse, MetricComparison, ComparisonMethod, CompanyMetric } from "types";
import { BenchmarkComparisonChart } from "./BenchmarkComparisonChart";
import { BenchmarkRadarChart } from "./BenchmarkRadarChart";
import { BenchmarkMetricCard } from "./BenchmarkMetricCard";
import { BenchmarkScoreGauge } from "./BenchmarkScoreGauge";
import { BenchmarkDashboard } from "./BenchmarkDashboard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import brain from "brain";

// Sample data for demonstration purposes
const sampleComparisonRequest = {
  company_name: "Sample Company",
  industry_name: "Retail Trade",
  company_metrics: [
    { name: "Gross Margin", value: 0.32, year: "2024" },
    { name: "Net Profit Margin", value: 0.085, year: "2024" },
    { name: "Current Ratio", value: 1.5, year: "2024" },
    { name: "Inventory Turnover", value: 6.2, year: "2024" },
    { name: "Return on Assets", value: 0.12, year: "2024" },
    { name: "Debt to Equity", value: 1.8, year: "2024" },
  ],
  comparison_method: ComparisonMethod.DIRECT,
  year: "2024",
};

export const BenchmarkVisualDemo = () => {
  const [loading, setLoading] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<BenchmarkComparisonResponse | null>(null);
  const [singleMetric, setSingleMetric] = useState<MetricComparison | null>(null);

  // Sample comparison request using API
  const runSampleComparison = async () => {
    setLoading(true);
    try {
      const response = await brain.compare_with_benchmarks(sampleComparisonRequest);
      const data = await response.json();
      setComparisonResult(data);
      
      // Set a single metric for individual component testing
      if (data.comparisons && data.comparisons.length > 0) {
        setSingleMetric(data.comparisons[0]);
      }
      
      toast.success("Sample comparison loaded successfully");
    } catch (error) {
      console.error("Error running sample comparison:", error);
      toast.error("Failed to run sample comparison");
      
      // Fallback to mock data if API call fails
      createMockData();
    } finally {
      setLoading(false);
    }
  };

  // Create mock data as fallback if API call fails
  const createMockData = () => {
    const mockComparisons: MetricComparison[] = [
      {
        metric_name: "Gross Margin",
        company_value: 0.32,
        benchmark_value: 0.28,
        difference: 0.04,
        difference_percent: 14.29,
        is_favorable: true,
        data_points_count: 25,
        percentile_rank: {
          percentile: 76,
          interpretation: "Strong performance - better than 76% of businesses"
        },
        description: "Your gross margin is higher than the industry average by 14.3%."
      },
      {
        metric_name: "Net Profit Margin",
        company_value: 0.085,
        benchmark_value: 0.07,
        difference: 0.015,
        difference_percent: 21.43,
        is_favorable: true,
        data_points_count: 30,
        percentile_rank: {
          percentile: 82,
          interpretation: "Strong performance - better than 82% of businesses"
        },
        description: "Your net profit margin exceeds the industry average by 21.4%."
      },
      {
        metric_name: "Current Ratio",
        company_value: 1.5,
        benchmark_value: 1.8,
        difference: -0.3,
        difference_percent: -16.67,
        is_favorable: false,
        data_points_count: 28,
        percentile_rank: {
          percentile: 35,
          interpretation: "Below average - better than 35% of businesses but room for improvement"
        },
        description: "Your current ratio is lower than the industry average by 16.7%."
      },
      {
        metric_name: "Inventory Turnover",
        company_value: 6.2,
        benchmark_value: 5.8,
        difference: 0.4,
        difference_percent: 6.9,
        is_favorable: true,
        data_points_count: 22,
        percentile_rank: {
          percentile: 65,
          interpretation: "Above average - better than 65% of businesses"
        },
        description: "Your inventory turnover is better than the industry average by 6.9%."
      },
      {
        metric_name: "Return on Assets",
        company_value: 0.12,
        benchmark_value: 0.095,
        difference: 0.025,
        difference_percent: 26.32,
        is_favorable: true,
        data_points_count: 30,
        percentile_rank: {
          percentile: 88,
          interpretation: "Strong performance - better than 88% of businesses"
        },
        description: "Your return on assets is higher than the industry average by 26.3%."
      },
      {
        metric_name: "Debt to Equity",
        company_value: 1.8,
        benchmark_value: 1.5,
        difference: 0.3,
        difference_percent: 20,
        is_favorable: false,
        data_points_count: 25,
        percentile_rank: {
          percentile: 30,
          interpretation: "Below average - better than 30% of businesses but room for improvement"
        },
        description: "Your debt to equity ratio is higher than the industry average by 20%, which may indicate higher financial risk."
      }
    ];

    const mockResponse: BenchmarkComparisonResponse = {
      company_name: "Sample Company",
      industry_name: "Retail Trade",
      benchmark_source: "ABS Australian Industry Statistics",
      year: "2024",
      comparisons: mockComparisons,
      overall_score: 65.5,
      recommendations: [
        "Consider strategies to improve liquidity metrics such as the current ratio.",
        "Evaluate debt reduction strategies to bring your debt-to-equity ratio closer to industry norms.",
        "Maintain the strong performance in gross margin and profitability metrics.",
        "Continue efficient inventory management practices that are yielding above-average turnover rates."
      ],
      metadata: {
        benchmark_data_points: 160,
        matched_metrics: 6,
        source_id: "abs_industry_stats",
        comparison_method: ComparisonMethod.DIRECT
      }
    };

    setComparisonResult(mockResponse);
    setSingleMetric(mockComparisons[0]);
    toast.success("Using demo data for visualization");
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Benchmark Visualization Demo</h2>
          <Button onClick={runSampleComparison} disabled={loading}>
            {loading ? "Loading..." : "Load Sample Data"}
          </Button>
        </div>
        
        {!comparisonResult && (
          <div className="bg-muted p-8 rounded-lg text-center">
            <p className="text-muted-foreground">Click "Load Sample Data" to see visualization components with sample benchmark data.</p>
          </div>
        )}
      </div>

      {comparisonResult && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Complete Dashboard</h3>
          <BenchmarkDashboard data={comparisonResult} />
          
          <div className="pt-6 border-t">
            <h3 className="text-lg font-medium mb-4">Individual Components</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="font-medium mb-2">Comparison Chart</p>
                <BenchmarkComparisonChart comparisons={comparisonResult.comparisons.slice(0, 4)} />
              </div>
              
              <div>
                <p className="font-medium mb-2">Radar Chart</p>
                <BenchmarkRadarChart comparisons={comparisonResult.comparisons} />
              </div>
            </div>
            
            {singleMetric && (
              <div className="mt-6">
                <p className="font-medium mb-2">Single Metric Card</p>
                <div className="max-w-sm">
                  <BenchmarkMetricCard metric={singleMetric} />
                </div>
              </div>
            )}
            
            <div className="mt-6">
              <p className="font-medium mb-2">Score Gauge</p>
              <div className="max-w-sm">
                <BenchmarkScoreGauge score={comparisonResult.overall_score || 0} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
