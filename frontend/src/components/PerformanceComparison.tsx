import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "components/Spinner";
import { ScoreResponse, RelativePerformanceResponse } from "types";
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart,
  Line
} from "recharts";
import brain from "brain";
import { toast } from "sonner";

interface Props {
  companyId: string;
  companyName: string;
  industry: string;
  size: string;
  scoreData: ScoreResponse;
}

const PerformanceComparison: React.FC<Props> = ({ 
  companyId, 
  companyName,
  industry,
  size, 
  scoreData 
}) => {
  const [loading, setLoading] = useState(false);
  const [relativePerformance, setRelativePerformance] = useState<RelativePerformanceResponse | null>(null);
  const [activeSubTab, setActiveSubTab] = useState("radar");

  useEffect(() => {
    fetchRelativePerformance();
  }, [companyId]);

  const fetchRelativePerformance = async () => {
    try {
      setLoading(true);
      
      const response = await brain.calculate_relative_performance({
        company_id: companyId,
        comparison_metrics: ["overall_score", "profitability", "liquidity", "leverage", "efficiency"]
      });
      
      const data = await response.json();
      setRelativePerformance(data);
    } catch (error) {
      console.error("Error fetching relative performance:", error);
      toast.error("Failed to load comparison data");
    } finally {
      setLoading(false);
    }
  };

  // Prepare radar chart data
  const prepareRadarData = () => {
    if (!relativePerformance) return [];
    
    return [
      {
        subject: "Overall",
        company: relativePerformance.performance_metrics.overall_score.company_value,
        industry: relativePerformance.performance_metrics.overall_score.industry_avg,
        fullMark: 100
      },
      {
        subject: "Profitability",
        company: relativePerformance.performance_metrics.profitability.company_value,
        industry: relativePerformance.performance_metrics.profitability.industry_avg,
        fullMark: 100
      },
      {
        subject: "Liquidity",
        company: relativePerformance.performance_metrics.liquidity.company_value,
        industry: relativePerformance.performance_metrics.liquidity.industry_avg,
        fullMark: 100
      },
      {
        subject: "Leverage",
        company: relativePerformance.performance_metrics.leverage.company_value,
        industry: relativePerformance.performance_metrics.leverage.industry_avg,
        fullMark: 100
      },
      {
        subject: "Efficiency",
        company: relativePerformance.performance_metrics.efficiency.company_value,
        industry: relativePerformance.performance_metrics.efficiency.industry_avg,
        fullMark: 100
      }
    ];
  };

  // Prepare bar chart data
  const prepareBarData = () => {
    if (!relativePerformance) return [];
    
    return Object.entries(relativePerformance.performance_metrics).map(([metric, data]) => ({
      name: metric === "overall_score" ? "Overall" : metric.charAt(0).toUpperCase() + metric.slice(1),
      company: data.company_value,
      industry: data.industry_avg,
      percentile: data.percentile
    }));
  };

  // Get normalized data
  const prepareNormalizedData = () => {
    if (!relativePerformance) return [];
    
    return Object.entries(relativePerformance.normalized_scores).map(([metric, score]) => ({
      name: metric === "overall_score" ? "Overall" : metric.charAt(0).toUpperCase() + metric.slice(1),
      score: score
    }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Performance Comparison</CardTitle>
        <CardDescription>
          Comparing {companyName} against {industry} industry benchmarks
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Spinner />
            <span className="ml-2">Loading comparison data...</span>
          </div>
        ) : relativePerformance ? (
          <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="radar">Radar Chart</TabsTrigger>
              <TabsTrigger value="bar">Bar Comparison</TabsTrigger>
              <TabsTrigger value="percentile">Percentile Ranking</TabsTrigger>
              <TabsTrigger value="normalized">Cross-Industry</TabsTrigger>
            </TabsList>
            
            <TabsContent value="radar" className="pt-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Radar Performance Comparison</h3>
                <p className="text-gray-600 mb-4">
                  This chart shows how your business compares to industry averages across all key financial dimensions.
                </p>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart outerRadius={150} data={prepareRadarData()}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar
                        name={companyName}
                        dataKey="company"
                        stroke="#4f46e5"
                        fill="#4f46e5"
                        fillOpacity={0.6}
                      />
                      <Radar
                        name="Industry Average"
                        dataKey="industry"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.4}
                      />
                      <Legend />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="bar" className="pt-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Bar Chart Comparison</h3>
                <p className="text-gray-600 mb-4">
                  Direct comparison of your scores against industry averages for each financial dimension.
                </p>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={prepareBarData()} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={0} />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="company" name={companyName} fill="#4f46e5" />
                      <Bar dataKey="industry" name="Industry Average" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="percentile" className="pt-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Percentile Ranking</h3>
                <p className="text-gray-600 mb-4">
                  Shows where your business ranks compared to peers in your industry by percentile.
                </p>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={prepareBarData()} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" orientation="left" domain={[0, 100]} />
                      <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="company" name={`${companyName} Score`} fill="#4f46e5" />
                      <Bar yAxisId="left" dataKey="industry" name="Industry Average" fill="#10b981" />
                      <Line yAxisId="right" type="monotone" dataKey="percentile" name="Percentile Rank" stroke="#ff7300" strokeWidth={2} dot={{ r: 5 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="normalized" className="pt-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Cross-Industry Normalized Scores</h3>
                <p className="text-gray-600 mb-4">
                  Scores normalized to enable comparison across different industries, accounting for industry-specific factors.
                </p>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={prepareNormalizedData()} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="score" name="Normalized Score" fill="#4f46e5" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg mt-6">
                  <h4 className="font-medium mb-2">What is normalization?</h4>
                  <p className="text-sm text-gray-600">
                    Normalized scores adjust for the varying difficulty levels across different industries and metrics.
                    This makes it possible to meaningfully compare performance across sectors that have different
                    inherent challenges and structural characteristics. For example, retail typically has lower profit margins
                    than professional services, so normalization accounts for these differences.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-12">
            <p>No comparison data available.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PerformanceComparison;