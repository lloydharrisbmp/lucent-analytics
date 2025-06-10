import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { CategoryScore, FinancialMetric } from "types";

interface Props {
  category: string;
  categoryData: CategoryScore;
  metrics: FinancialMetric[];
  industry: string;
}

const CategoryScoreDetail: React.FC<Props> = ({ 
  category, 
  categoryData, 
  metrics,
  industry 
}) => {
  // Filter metrics related to this category
  const categoryMetrics = metrics.filter(metric => 
    Object.keys(categoryData.metrics_scores).includes(metric.name)
  );

  // Prepare chart data
  const chartData = Object.entries(categoryData.metrics_scores).map(([metricName, score]) => {
    // Find the actual metric value
    const actualMetric = metrics.find(m => m.name === metricName);
    const actualValue = actualMetric ? actualMetric.value : 0;
    
    return {
      name: metricName,
      score: parseFloat(score.toFixed(1)),
      value: parseFloat(actualValue.toFixed(2))
    };
  });

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{category} Analysis</CardTitle>
        <CardDescription>
          Detailed breakdown of your {category.toLowerCase()} performance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Score: {categoryData.score.toFixed(1)}/100</h3>
            <div className="px-3 py-1 rounded-full text-white text-sm font-medium" 
              style={{
                backgroundColor: 
                  categoryData.score >= 80 ? '#22c55e' : 
                  categoryData.score >= 65 ? '#16a34a' : 
                  categoryData.score >= 50 ? '#eab308' : 
                  categoryData.score >= 30 ? '#f97316' : 
                  '#ef4444'
              }}>
              {categoryData.score >= 80 ? 'Excellent' : 
               categoryData.score >= 65 ? 'Good' : 
               categoryData.score >= 50 ? 'Fair' : 
               categoryData.score >= 30 ? 'Poor' : 
               'Critical'}
            </div>
          </div>
          <p className="mt-2 text-gray-600">{categoryData.interpretation}</p>
        </div>

        <Separator />

        {/* Metric Scores Visualization */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Metric Performance</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="score" name="Score (0-100)" fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <Separator />

        {/* Detailed Metrics Table */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Detailed Metrics</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Assessment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categoryMetrics.map((metric) => {
                const score = categoryData.metrics_scores[metric.name] || 0;
                return (
                  <TableRow key={metric.name}>
                    <TableCell className="font-medium">{metric.name}</TableCell>
                    <TableCell>{metric.value.toFixed(2)}</TableCell>
                    <TableCell>{score.toFixed(1)}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-md text-xs font-medium" 
                        style={{
                          backgroundColor: 
                            score >= 80 ? '#dcfce7' : 
                            score >= 65 ? '#d1fae5' : 
                            score >= 50 ? '#fef9c3' : 
                            score >= 30 ? '#ffedd5' : 
                            '#fee2e2',
                          color: 
                            score >= 80 ? '#166534' : 
                            score >= 65 ? '#065f46' : 
                            score >= 50 ? '#854d0e' : 
                            score >= 30 ? '#9a3412' : 
                            '#b91c1c'
                        }}>
                        {score >= 80 ? 'Excellent' : 
                         score >= 65 ? 'Good' : 
                         score >= 50 ? 'Fair' : 
                         score >= 30 ? 'Poor' : 
                         'Critical'}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <Separator />

        {/* Improvement Suggestions */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Improvement Strategies</h3>
          {categoryData.suggestions.length > 0 ? (
            <div className="space-y-3">
              {categoryData.suggestions.map((suggestion, index) => (
                <Alert key={index}>
                  <AlertDescription>{suggestion}</AlertDescription>
                </Alert>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No specific improvement strategies available for this category.</p>
          )}
        </div>

        <Separator />

        {/* Industry Context */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Industry Context</h3>
          <p className="text-gray-600">
            In the {industry} industry, {category.toLowerCase()} metrics are particularly important for long-term business sustainability. 
            Businesses in this sector typically face challenges related to {category === "Profitability" ? "margin compression and cost management" : 
            category === "Liquidity" ? "cash flow management and working capital requirements" :
            category === "Leverage" ? "debt structuring and capital allocation" :
            "operational efficiency and resource utilization"}.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryScoreDetail;