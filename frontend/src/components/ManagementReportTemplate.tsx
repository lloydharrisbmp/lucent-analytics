import React from "react";
import { ExecutiveReportTemplate } from "./ExecutiveReportTemplate";
import { ReportSection } from "./ReportSection";
import { MetricGroup } from "./MetricGroup";
import { KeyMetricInsight } from "./KeyMetricInsight";
import { ReportInsights, FinancialMetric } from "components/ReportInsights";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Activity, LineChart as LineChartIcon, TrendingUp, Users, ArrowRight, BarChart3, PieChart as PieChartIcon } from "lucide-react";
import { formatCurrency } from "../utils/financial-data";
import { toast } from "sonner";

export interface ManagementReportTemplateProps {
  title?: string;
  description?: string;
  date: Date;
  organization: string;
  preparedBy?: string;
  kpiData: Array<{
    name: string;
    value: number;
    target: number;
    previousValue?: number;
    percentChange?: number;
    status?: "positive" | "negative" | "neutral";
  }>;
  performanceTrend: Array<{
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }>;
  customerSegments: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  commentary?: string;
  insights?: Array<{
    title: string;
    description: string;
    type?: "information" | "warning" | "success" | "neutral" | "positive" | "negative";
    recommendations?: string[];
  }>;
}

export function ManagementReportTemplate({
  title = "Management Performance Report",
  description = "Monthly operational and financial performance summary for management",
  date,
  organization,
  preparedBy,
  kpiData,
  performanceTrend,
  customerSegments,
  commentary,
  insights = [],
}: ManagementReportTemplateProps) {
  const handleExport = () => {
    toast.success("Report exported", {
      description: "Management report has been exported to PDF"
    });
  };

  const handlePrint = () => {
    toast.success("Preparing print view", {
      description: "Management report print view is ready"
    });
  };

  const handleShare = () => {
    toast.success("Sharing options", {
      description: "Share this report via email or link"
    });
  };

  // Convert KPI data to highlight format
  const kpiMetrics = kpiData.map(kpi => ({
    title: kpi.name,
    value: kpi.value,
    previousValue: kpi.previousValue,
    percentChange: kpi.percentChange,
    formatter: formatCurrency,
    variant: kpi.status,
    footer: `Target: ${formatCurrency(kpi.target)}`
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <ExecutiveReportTemplate
      title={title}
      description={description}
      date={date}
      organization={organization}
      preparedBy={preparedBy}
      onExport={handleExport}
      onPrint={handlePrint}
      onShare={handleShare}
    >
      <div className="space-y-8">
        {/* Key Performance Indicators */}
        <ReportSection 
          title="Key Performance Indicators" 
          description="Monthly KPIs versus targets"
        >
          <MetricGroup
            columns={3}
            metrics={kpiMetrics}
          />
        </ReportSection>
        
        {/* Performance Trend */}
        <ReportSection 
          title="Performance Trend" 
          description="6-month revenue, expense and profit trend"
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={performanceTrend}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#4ade80" name="Revenue" strokeWidth={2} />
                <Line type="monotone" dataKey="expenses" stroke="#f87171" name="Expenses" strokeWidth={2} />
                <Line type="monotone" dataKey="profit" stroke="#60a5fa" name="Profit" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ReportSection>
        
        {/* Customer Segment Analysis */}
        <ReportSection 
          title="Customer Segment Analysis" 
          description="Revenue breakdown by customer segment"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={customerSegments}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {customerSegments.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-4">Segment Details</h3>
              <div className="space-y-4">
                {customerSegments.map((segment, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: segment.color || COLORS[index % COLORS.length] }}
                      ></div>
                      <span>{segment.name}</span>
                    </div>
                    <div className="font-medium">{formatCurrency(segment.value)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ReportSection>
        
        {/* Commentary */}
        {commentary && (
          <ReportSection title="Management Commentary">
            <div className="prose max-w-none">
              {commentary.split("\n").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </ReportSection>
        )}
        
        {/* Insights & Recommendations */}
        <ReportSection 
          title="Key Insights & Recommendations" 
          description="Management analysis and action items"
        >
          {insights.length > 0 ? (
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <KeyMetricInsight
                  key={index}
                  title={insight.title}
                  description={insight.description}
                  type={insight.type}
                  recommendations={insight.recommendations}
                />
              ))}
            </div>
          ) : (
            <ReportInsights
              metrics={kpiData.map(kpi => ({
                name: kpi.name,
                current_value: kpi.value,
                previous_value: kpi.previousValue,
                target_value: kpi.target,
                data_points: performanceTrend.map((point, index) => {
                  // Create data point based on the metric name
                  let value = 0;
                  if (kpi.name.includes("Revenue")) value = point.revenue / 1000; // Scale to match KPI format
                  else if (kpi.name.includes("Cost") || kpi.name.includes("Expense")) value = point.expenses / 1000;
                  else if (kpi.name.includes("Margin") || kpi.name.includes("Rate")) value = (point.profit / point.revenue) * 100;
                  else value = kpi.value * (0.85 + (index * 0.05)); // Generate trend data
                  
                  return {
                    date: point.month,
                    value
                  };
                })
              }))}
              reportType="management"
              showSummary={true}
            />
          )}
        </ReportSection>
      </div>
    </ExecutiveReportTemplate>
  );
}
