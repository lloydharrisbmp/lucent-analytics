import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CategoryRecommendation, 
  MetricRecommendation, 
  ConsolidatedRecommendation 
} from "../utils/benchmark-insights";



interface BenchmarkInsightsProps {
  performanceSummary: string;
  performanceCategory: string;
  categoryRecommendations: Record<string, CategoryRecommendation>;
  metricRecommendations: MetricRecommendation[];
  consolidatedRecommendations: ConsolidatedRecommendation[];
  priorityFocusAreas: string[];
  competitiveAdvantages: string[];
}

export const BenchmarkInsights = ({
  performanceSummary,
  performanceCategory,
  categoryRecommendations,
  metricRecommendations,
  consolidatedRecommendations,
  priorityFocusAreas,
  competitiveAdvantages,
}: BenchmarkInsightsProps) => {
  // Function to format category name
  const formatCategoryName = (name: string) => {
    return name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Get badge color based on priority
  const getPriorityBadge = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      case "strategic":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get performance category badge color
  const getPerformanceBadge = (category: string) => {
    switch (category) {
      case "industry_leader":
        return "bg-green-100 text-green-800";
      case "strong_performer":
        return "bg-emerald-100 text-emerald-800";
      case "average_performer":
        return "bg-blue-100 text-blue-800";
      case "below_average":
        return "bg-yellow-100 text-yellow-800";
      case "needs_improvement":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format performance category for display
  const formatPerformanceCategory = (category: string) => {
    switch (category) {
      case "industry_leader":
        return "Industry Leader";
      case "strong_performer":
        return "Strong Performer";
      case "average_performer":
        return "Average Performer";
      case "below_average":
        return "Below Average";
      case "needs_improvement":
        return "Needs Improvement";
      default:
        return "Unknown";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Performance Insights</CardTitle>
            <CardDescription>
              Strategic analysis and recommendations based on benchmark comparison
            </CardDescription>
          </div>
          <Badge className={getPerformanceBadge(performanceCategory)}>
            {formatPerformanceCategory(performanceCategory)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm">{performanceSummary}</p>
        </div>

        <Tabs defaultValue="recommendations">
          <TabsList className="w-full">
            <TabsTrigger value="recommendations" className="flex-1">Key Recommendations</TabsTrigger>
            <TabsTrigger value="categories" className="flex-1">Category Analysis</TabsTrigger>
            <TabsTrigger value="metrics" className="flex-1">Metric Detail</TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations" className="pt-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Priority Recommendations</h3>
              <div className="space-y-3">
                {consolidatedRecommendations.map((rec, index) => (
                  <div key={index} className="border rounded-md p-3">
                    <div className="flex justify-between items-start">
                      <div className="font-medium">{rec.category}</div>
                      <Badge className={getPriorityBadge(rec.priority)}>
                        {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-sm mt-2">{rec.recommendation}</p>
                    {rec.affected_metrics.length > 0 && (
                      <div className="mt-2">
                        <span className="text-xs text-muted-foreground">
                          Affects: {rec.affected_metrics.map(m => formatCategoryName(m)).join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="pt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-lg font-medium mb-3">Priority Focus Areas</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {priorityFocusAreas.map((area, index) => (
                      <li key={index} className="text-sm">
                        {formatCategoryName(area)}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-3">Competitive Advantages</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {competitiveAdvantages.map((area, index) => (
                      <li key={index} className="text-sm">
                        {formatCategoryName(area)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <h3 className="text-lg font-medium mt-6">Category Analysis</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {Object.entries(categoryRecommendations).map(([category, data], index) => (
                  <div key={index} className="border rounded-md p-3">
                    <div className="flex justify-between items-start">
                      <div className="font-medium">{formatCategoryName(category)}</div>
                      <Badge className={getPriorityBadge(data.priority)}>
                        {data.priority.charAt(0).toUpperCase() + data.priority.slice(1)}
                      </Badge>
                    </div>
                    
                    {data.avg_percentile && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Average Percentile: {data.avg_percentile.toFixed(1)}
                      </div>
                    )}
                    
                    <div className="mt-3">
                      <h4 className="text-sm font-medium mb-2">Recommended Actions:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {data.actions.map((action, actionIndex) => (
                          <li key={actionIndex} className="text-sm">{action}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="metrics" className="pt-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Metric-Specific Recommendations</h3>
              <div className="space-y-3">
                {metricRecommendations.map((rec, index) => (
                  <div key={index} className="border rounded-md p-3">
                    <div className="flex justify-between items-start">
                      <div className="font-medium">{rec.display_name}</div>
                      <Badge className={getPriorityBadge(rec.priority)}>
                        {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {rec.difference_percent > 0 ? "+" : ""}{rec.difference_percent.toFixed(1)}% vs benchmark
                    </div>
                    <div className="mt-3">
                      <h4 className="text-sm font-medium mb-2">Recommendations:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {rec.recommendations.map((item, recIndex) => (
                          <li key={recIndex} className="text-sm">{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
