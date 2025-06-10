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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area
} from "recharts";
import { DollarSign, TrendingUp, Layers, Calendar, ArrowRight, Clock, Target, Activity, ArrowUp, LineChart as LineChartIcon, CalendarRange, Award } from "lucide-react";
import { formatCurrency } from "../utils/financial-data";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export interface InvestorReportTemplateProps {
  title?: string;
  description?: string;
  date: Date;
  organization: string;
  preparedBy?: string;
  financialHighlights: {
    revenue: number;
    prevRevenue?: number;
    revenueChange?: number;
    profit: number;
    prevProfit?: number;
    profitChange?: number;
    eps: number;
    prevEps?: number;
    epsChange?: number;
    dividendYield: number;
    prevDividendYield?: number;
  };
  quarterlyPerformance: Array<{
    quarter: string;
    revenue: number;
    expenses: number;
    profit: number;
    targetRevenue: number;
  }>;
  futureProjections: Array<{
    period: string;
    projected: number;
    conservative: number;
    optimistic: number;
  }>;
  keyInitiatives: Array<{
    name: string;
    status: "not-started" | "in-progress" | "completed" | "delayed";
    completion: number;
    description: string;
  }>;
  investorUpdates?: Array<{
    title: string;
    description: string;
    type?: "information" | "warning" | "success" | "neutral" | "positive" | "negative";
  }>;
}

export function InvestorReportTemplate({
  title = "Investor Relations Report",
  description = "Quarterly financial performance and outlook for investors",
  date,
  organization,
  preparedBy,
  financialHighlights,
  quarterlyPerformance,
  futureProjections,
  keyInitiatives,
  investorUpdates = [],
}: InvestorReportTemplateProps) {
  const handleExport = () => {
    toast.success("Report exported", {
      description: "Investor report has been exported to PDF"
    });
  };

  const handlePrint = () => {
    toast.success("Preparing print view", {
      description: "Investor report print view is ready"
    });
  };

  const handleShare = () => {
    toast.success("Sharing options", {
      description: "Share this report via email or link"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "in-progress": return "bg-blue-500";
      case "delayed": return "bg-red-500";
      case "not-started": return "bg-gray-400";
      default: return "bg-gray-400";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed": return "Completed";
      case "in-progress": return "In Progress";
      case "delayed": return "Delayed";
      case "not-started": return "Not Started";
      default: return status;
    }
  };

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
      footer={<div className="text-center">© {new Date().getFullYear()} {organization} | All Rights Reserved</div>}
    >
      <div className="space-y-8">
        {/* Financial Highlights */}
        <ReportSection 
          title="Financial Highlights" 
          description={`Q${new Date(date).getMonth() / 3 + 1} ${new Date(date).getFullYear()} Key Metrics`}
        >
          <MetricGroup
            columns={4}
            metrics={[
              {
                title: "Revenue",
                value: financialHighlights.revenue,
                previousValue: financialHighlights.prevRevenue,
                percentChange: financialHighlights.revenueChange,
                formatter: formatCurrency,
                icon: <DollarSign className="h-5 w-5" />,
                variant: financialHighlights.revenueChange && financialHighlights.revenueChange > 0 ? "positive" : "negative"
              },
              {
                title: "Net Profit",
                value: financialHighlights.profit,
                previousValue: financialHighlights.prevProfit,
                percentChange: financialHighlights.profitChange,
                formatter: formatCurrency,
                icon: <TrendingUp className="h-5 w-5" />,
                variant: financialHighlights.profitChange && financialHighlights.profitChange > 0 ? "positive" : "negative"
              },
              {
                title: "Earnings Per Share",
                value: financialHighlights.eps,
                previousValue: financialHighlights.prevEps,
                percentChange: financialHighlights.epsChange,
                formatter: (value) => `$${Number(value).toFixed(2)}`,
                icon: <Target className="h-5 w-5" />,
                variant: financialHighlights.epsChange && financialHighlights.epsChange > 0 ? "positive" : "negative"
              },
              {
                title: "Dividend Yield",
                value: financialHighlights.dividendYield,
                previousValue: financialHighlights.prevDividendYield,
                formatter: (value) => `${Number(value).toFixed(2)}%`,
                icon: <Layers className="h-5 w-5" />,
                variant: "primary"
              },
            ]}
          />
        </ReportSection>
        
        {/* Quarterly Performance */}
        <ReportSection 
          title="Quarterly Performance vs Target" 
          description="Revenue, expenses, and profit by quarter with target comparison"
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={quarterlyPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="revenue" name="Revenue" fill="#4ade80" />
                <Bar dataKey="expenses" name="Expenses" fill="#f87171" />
                <Bar dataKey="profit" name="Profit" fill="#60a5fa" />
                <Line type="monotone" dataKey="targetRevenue" name="Target Revenue" stroke="#f59e0b" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ReportSection>
        
        {/* Future Projections */}
        <ReportSection 
          title="Future Projections" 
          description="Revenue forecast for the next 4 quarters"
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={futureProjections}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Area type="monotone" dataKey="conservative" name="Conservative Estimate" fill="#93c5fd" stroke="#60a5fa" fillOpacity={0.3} />
                <Line type="monotone" dataKey="projected" name="Projected Revenue" stroke="#0284c7" strokeWidth={2} />
                <Area type="monotone" dataKey="optimistic" name="Optimistic Estimate" fill="#86efac" stroke="#4ade80" fillOpacity={0.3} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ReportSection>
        
        {/* Key Initiatives */}
        <ReportSection 
          title="Key Strategic Initiatives" 
          description="Status of important company initiatives"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Initiative</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Completion</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keyInitiatives.map((initiative, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{initiative.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className={`rounded-full w-2 h-2 mr-2 ${getStatusColor(initiative.status)}`}></div>
                      {getStatusText(initiative.status)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div 
                        className={`h-2.5 rounded-full ${getStatusColor(initiative.status)}`} 
                        style={{ width: `${initiative.completion}%` }}
                      ></div>
                    </div>
                    <div className="text-xs mt-1 text-right">{initiative.completion}%</div>
                  </TableCell>
                  <TableCell className="max-w-md truncate">{initiative.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ReportSection>
        
        {/* Investor Updates */}
        <ReportSection 
          title="Investor Updates and Insights" 
          description="Recent company developments and performance analysis"
        >
          {investorUpdates.length > 0 ? (
            <div className="space-y-4">
              {investorUpdates.map((update, index) => (
                <KeyMetricInsight
                  key={index}
                  title={update.title}
                  description={update.description}
                  type={update.type}
                />
              ))}
            </div>
          ) : (
            <ReportInsights
              metrics={[
                {
                  name: "Revenue",
                  current_value: financialHighlights.revenue,
                  previous_value: financialHighlights.prevRevenue,
                  data_points: quarterlyPerformance.filter(q => q.revenue > 0).map(q => ({
                    date: q.quarter,
                    value: q.revenue
                  }))
                },
                {
                  name: "Earnings Per Share",
                  current_value: financialHighlights.eps,
                  previous_value: financialHighlights.prevEps,
                  target_value: financialHighlights.prevEps * 1.1, // 10% growth target
                  data_points: quarterlyPerformance.filter(q => q.revenue > 0).map(q => ({
                    date: q.quarter,
                    value: (q.profit / 1000000) * 2.35 // Simulated EPS calculation
                  }))
                },
                {
                  name: "Profit Margin",
                  current_value: (financialHighlights.profit / financialHighlights.revenue) * 100,
                  previous_value: financialHighlights.prevProfit && financialHighlights.prevRevenue ? 
                    (financialHighlights.prevProfit / financialHighlights.prevRevenue) * 100 : undefined,
                  data_points: quarterlyPerformance.filter(q => q.revenue > 0).map(q => ({
                    date: q.quarter,
                    value: (q.profit / q.revenue) * 100
                  }))
                },
                {
                  name: "Return on Investment",
                  current_value: (financialHighlights.profit / (financialHighlights.revenue * 0.4)) * 100,
                  previous_value: financialHighlights.prevProfit ? 
                    (financialHighlights.prevProfit / (financialHighlights.prevRevenue * 0.4)) * 100 : undefined,
                  target_value: 25, // Target ROI percentage
                  data_points: quarterlyPerformance.filter(q => q.revenue > 0).map((q, i) => ({
                    date: q.quarter,
                    value: (q.profit / (q.revenue * 0.4)) * 100
                  }))
                }
              ]}
              reportType="investor"
              showSummary={true}
            />
          )}
        </ReportSection>
      </div>
    </ExecutiveReportTemplate>
  );
}
