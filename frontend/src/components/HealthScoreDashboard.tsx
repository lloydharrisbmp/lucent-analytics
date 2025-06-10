import React, { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScoreResponse } from "types";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import FinancialHealthScoreCard from "components/FinancialHealthScoreCard";
import PerformanceComparison from "components/PerformanceComparison";
import ScoreTrendAnalysis from "components/ScoreTrendAnalysis";
import HealthScoreExportReport from "components/HealthScoreExportReport";

interface Props {
  scoreData: ScoreResponse;
  companyName: string;
  companyId: string;
  industry: string;
  size: string;
}

const HealthScoreDashboard: React.FC<Props> = ({
  scoreData,
  companyName,
  companyId,
  industry,
  size
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Create refs for chart components for PDF export
  const trendChartRef = useRef<HTMLDivElement>(null);
  const radarChartRef = useRef<HTMLDivElement>(null);
  
  // Prepare data for category distribution pie chart
  const categoryData = Object.entries(scoreData.overall_score.category_scores).map(([name, data]) => ({
    name,
    value: data.score
  }));
  
  // Colors for pie chart segments
  const COLORS = ['#4f46e5', '#16a34a', '#eab308', '#f97316'];
  
  // Get the strength and weakness categories
  const strengths = Object.entries(scoreData.overall_score.category_scores)
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, 2);
    
  const weaknesses = Object.entries(scoreData.overall_score.category_scores)
    .sort((a, b) => a[1].score - b[1].score)
    .slice(0, 2);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview">Dashboard</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="comparison">Industry Comparison</TabsTrigger>
          <TabsTrigger value="report">Export Report</TabsTrigger>
        </TabsList>
        
        {/* Dashboard Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Score Card */}
            <div className="md:col-span-1">
              <FinancialHealthScoreCard 
                scoreData={scoreData} 
                companyName={companyName}
                onCategorySelect={() => {}}
              />
            </div>
            
            {/* Key Metrics & Distribution */}
            <div className="md:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Financial Health Distribution</CardTitle>
                  <CardDescription>
                    Breakdown of financial health category scores
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Category Distribution Chart */}
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          fill="#8884d8"
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => [`${value.toFixed(1)}`, 'Score']}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Strengths & Weaknesses */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-3">Top Strengths</h3>
                      <div className="space-y-3">
                        {strengths.map(([category, data]) => (
                          <div key={category}>
                            <div className="flex justify-between">
                              <span className="font-medium">{category}</span>
                              <span className="font-semibold">{data.score.toFixed(1)}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className="h-2 rounded-full bg-green-500" 
                                style={{ width: `${data.score}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-3">Areas to Improve</h3>
                      <div className="space-y-3">
                        {weaknesses.map(([category, data]) => (
                          <div key={category}>
                            <div className="flex justify-between">
                              <span className="font-medium">{category}</span>
                              <span className="font-semibold">{data.score.toFixed(1)}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className="h-2 rounded-full" 
                                style={{
                                  width: `${data.score}%`,
                                  backgroundColor: data.score >= 50 ? '#eab308' : '#f97316'
                                }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Key Recommendations Card */}
          <Card>
            <CardHeader>
              <CardTitle>Key Recommendations</CardTitle>
              <CardDescription>
                Actionable insights to improve your financial health
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(scoreData.overall_score.category_scores)
                  .sort((a, b) => a[1].score - b[1].score)
                  .slice(0, 2)
                  .map(([category, data]) => (
                    <Card key={category} className="bg-gray-50 border">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{category} Recommendations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {data.suggestions && data.suggestions.length > 0 ? (
                            data.suggestions.map((suggestion, index) => (
                              <div key={index} className="flex">
                                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                                  <span className="text-blue-700 text-xs font-medium">{index+1}</span>
                                </div>
                                <p>{suggestion}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500">No specific recommendations available.</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Trends Tab */}
        <TabsContent value="trends">
          <div ref={trendChartRef} className="mb-6">
            <ScoreTrendAnalysis 
              companyId={companyId}
              companyName={companyName}
            />
          </div>
        </TabsContent>
        
        {/* Industry Comparison Tab */}
        <TabsContent value="comparison">
          <div ref={radarChartRef}>
            <PerformanceComparison 
              companyId={companyId}
              companyName={companyName}
              industry={industry}
              size={size}
              scoreData={scoreData}
            />
          </div>
        </TabsContent>
        
        {/* Export Report Tab */}
        <TabsContent value="report">
          <HealthScoreExportReport 
            scoreData={scoreData}
            companyName={companyName}
            trendChartRef={trendChartRef}
            radarChartRef={radarChartRef}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HealthScoreDashboard;