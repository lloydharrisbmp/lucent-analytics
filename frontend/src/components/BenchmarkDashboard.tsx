import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BenchmarkComparisonResponse, MetricComparison } from "brain/data-contracts";
import { BenchmarkComparisonChart } from "./BenchmarkComparisonChart";
import { BenchmarkMetricCard } from "./BenchmarkMetricCard";
import { BenchmarkRadarChart } from "./BenchmarkRadarChart";
import { BenchmarkScoreGauge } from "./BenchmarkScoreGauge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BenchmarkTrendForecast } from "./BenchmarkTrendForecast";
import { BenchmarkInsights } from "./BenchmarkInsights";
import { BenchmarkInsightData } from "../utils/benchmark-insights";

interface BenchmarkDashboardProps {
  data: BenchmarkComparisonResponse;
}

export const BenchmarkDashboard = ({ data }: BenchmarkDashboardProps) => {
  // Group metrics by favorability
  const favorableMetrics = data.comparisons.filter((m) => m.is_favorable === true);
  const unfavorableMetrics = data.comparisons.filter((m) => m.is_favorable === false);
  
  // Get top performing and most concerning metrics
  const topPerforming = [...favorableMetrics].sort((a, b) => 
    Math.abs(b.difference_percent) - Math.abs(a.difference_percent)
  ).slice(0, 3);
  
  const mostConcerning = [...unfavorableMetrics].sort((a, b) => 
    Math.abs(b.difference_percent) - Math.abs(a.difference_percent)
  ).slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Overall Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BenchmarkScoreGauge score={data.overall_score || 0} />
            <p className="text-xs text-muted-foreground mt-2">
              Based on {data.comparisons.length} metrics compared to {data.industry_name}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Metrics Compared
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.comparisons.length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              From {data.benchmark_source} ({data.year})
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Favorable Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {favorableMetrics.length}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {((favorableMetrics.length / data.comparisons.length) * 100).toFixed(0)}% of all metrics
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {unfavorableMetrics.length}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {((unfavorableMetrics.length / data.comparisons.length) * 100).toFixed(0)}% of all metrics
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <BenchmarkComparisonChart 
          comparisons={data.comparisons}
          title="Performance Overview"
          description={`${data.company_name} vs. ${data.industry_name} industry benchmarks`}
        />
        
        <BenchmarkRadarChart 
          comparisons={data.comparisons}
          title="Performance Radar"
          description="Multi-dimensional view of performance metrics"
        />
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Metrics</TabsTrigger>
          <TabsTrigger value="favorable">Strengths</TabsTrigger>
          <TabsTrigger value="unfavorable">Opportunities</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Performance Metrics</CardTitle>
              <CardDescription>
                Detailed view of all benchmarked metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.comparisons.map((metric, index) => (
                    <BenchmarkMetricCard key={index} metric={metric} />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="favorable">
          <Card>
            <CardHeader>
              <CardTitle>Key Strengths</CardTitle>
              <CardDescription>
                Areas where your company outperforms industry benchmarks
              </CardDescription>
            </CardHeader>
            <CardContent>
              {favorableMetrics.length === 0 ? (
                <p className="text-center py-6 text-muted-foreground">
                  No favorable metrics identified in the comparison.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favorableMetrics.map((metric, index) => (
                    <BenchmarkMetricCard key={index} metric={metric} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="unfavorable">
          <Card>
            <CardHeader>
              <CardTitle>Improvement Opportunities</CardTitle>
              <CardDescription>
                Areas where your company underperforms compared to industry benchmarks
              </CardDescription>
            </CardHeader>
            <CardContent>
              {unfavorableMetrics.length === 0 ? (
                <p className="text-center py-6 text-muted-foreground">
                  No unfavorable metrics identified in the comparison.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {unfavorableMetrics.map((metric, index) => (
                    <BenchmarkMetricCard key={index} metric={metric} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {data.recommendations && data.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommended Actions</CardTitle>
            <CardDescription>
              Strategic recommendations based on benchmark analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 list-disc list-inside">
              {data.recommendations.map((recommendation, index) => (
                <li key={index} className="text-sm">{recommendation}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      
      {/* Enhanced Insights Display */}
      {data.metadata?.insights && (
        <div className="space-y-6">
          <BenchmarkTrendForecast 
            forecasts={(data.metadata.insights as BenchmarkInsightData).trend_forecast.forecasts}
            overallTrend={(data.metadata.insights as BenchmarkInsightData).trend_forecast.overall_trend}
            timeHorizon={(data.metadata.insights as BenchmarkInsightData).trend_forecast.time_horizon}
          />
          
          <BenchmarkInsights 
            performanceSummary={(data.metadata.insights as BenchmarkInsightData).performance_summary}
            performanceCategory={(data.metadata.insights as BenchmarkInsightData).performance_category}
            categoryRecommendations={(data.metadata.insights as BenchmarkInsightData).recommendations.category_recommendations}
            metricRecommendations={(data.metadata.insights as BenchmarkInsightData).recommendations.metric_recommendations}
            consolidatedRecommendations={(data.metadata.insights as BenchmarkInsightData).recommendations.consolidated_recommendations}
            priorityFocusAreas={(data.metadata.insights as BenchmarkInsightData).recommendations.priority_focus_areas}
            competitiveAdvantages={(data.metadata.insights as BenchmarkInsightData).recommendations.competitive_advantages}
          />
        </div>
      )}
    </div>
  );
};
