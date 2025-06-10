import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScoreResponse } from "types";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line
} from "recharts";

interface Props {
  scoreData: ScoreResponse;
  visualizationType: "radar" | "bar" | "comparison" | "historical";
  historicalData?: {
    date: string;
    score: number;
    [key: string]: any;
  }[];
  comparisonData?: {
    name: string;
    company: number;
    industry: number;
  }[];
}

const FinancialHealthVisualization: React.FC<Props> = ({
  scoreData,
  visualizationType,
  historicalData,
  comparisonData
}) => {
  // Prepare category data for visualizations
  const categoryData = Object.entries(scoreData.overall_score.category_scores).map(([name, data]) => ({
    name,
    score: data.score,
    fill: getCategoryColor(data.score)
  }));

  // Helper function to get color based on score
  function getCategoryColor(score: number): string {
    if (score >= 80) return "#22c55e";
    if (score >= 65) return "#16a34a";
    if (score >= 50) return "#eab308";
    if (score >= 30) return "#f97316";
    return "#ef4444";
  }

  // Prepare radar data
  const radarData = Object.entries(scoreData.overall_score.category_scores).map(([name, data]) => ({
    subject: name,
    score: data.score,
    fullMark: 100
  }));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {visualizationType === "radar" && "Radar Analysis"}
          {visualizationType === "bar" && "Category Performance"}
          {visualizationType === "comparison" && "Industry Comparison"}
          {visualizationType === "historical" && "Historical Performance"}
        </CardTitle>
        <CardDescription>
          {visualizationType === "radar" && "Multidimensional view of financial health categories"}
          {visualizationType === "bar" && "Detailed breakdown of category performance"}
          {visualizationType === "comparison" && "How your business compares to industry benchmarks"}
          {visualizationType === "historical" && "Performance trends over time"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {visualizationType === "radar" && (
              <RadarChart outerRadius={100} data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#4f46e5"
                  fill="#4f46e5"
                  fillOpacity={0.6}
                />
                <Tooltip />
                <Legend />
              </RadarChart>
            )}

            {visualizationType === "bar" && (
              <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value: any) => [`${value}`, "Score"]} />
                <Legend />
                <Bar dataKey="score" name="Category Score">
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            )}

            {visualizationType === "comparison" && comparisonData && (
              <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="company" name="Your Business" fill="#4f46e5" />
                <Bar dataKey="industry" name="Industry Average" fill="#10b981" />
              </BarChart>
            )}

            {visualizationType === "historical" && historicalData && (
              <LineChart data={historicalData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="score"
                  name="Overall Score"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  dot={{ r: 5 }}
                  activeDot={{ r: 8 }}
                />
                {Object.keys(scoreData.overall_score.category_scores).map((category, index) => (
                  <Line
                    key={category}
                    type="monotone"
                    dataKey={category}
                    name={category}
                    stroke={["#16a34a", "#eab308", "#f97316", "#ef4444"][index % 4]}
                    strokeWidth={1.5}
                    dot={{ r: 3 }}
                  />
                ))}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialHealthVisualization;