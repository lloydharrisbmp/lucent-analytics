import React from "react";
import { ExecutiveReportTemplate } from "components/ExecutiveReportTemplate";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportSection } from "components/ReportSection";
import { MetricGroup } from "components/MetricGroup";
import { KeyMetricInsight } from "components/KeyMetricInsight";
import { ReportInsights, FinancialMetric } from "components/ReportInsights";
import { BalanceSheetStatement } from "components/BalanceSheetStatement";
import { ProfitLossStatement } from "components/ProfitLossStatement";
import { CashFlowStatement } from "components/CashFlowStatement";
import { formatCurrency } from "utils/financial-data";
import { toast } from "sonner";
import { Activity, BarChart3, DollarSign, TrendingUp } from "lucide-react";

export interface BoardReportTemplateProps {
  title?: string;
  description?: string;
  date: Date;
  organization: string;
  preparedBy?: string;
  profitAndLossData: any;
  balanceSheetData: any;
  cashFlowData: any;
  keyMetrics: {
    revenue: number;
    prevRevenue?: number;
    revenueChange?: number;
    profit: number;
    prevProfit?: number;
    profitChange?: number;
    cashBalance: number;
    prevCashBalance?: number;
    cashChange?: number;
    operatingExpenses: number;
    prevOperatingExpenses?: number;
    expensesChange?: number;
  };
  insights?: Array<{
    title: string;
    description: string;
    type?: "information" | "warning" | "success" | "neutral" | "positive" | "negative";
    recommendations?: string[];
  }>;
}

export function BoardReportTemplate({
  title = "Board Report",
  description = "Monthly financial performance summary for board review",
  date,
  organization,
  preparedBy,
  profitAndLossData,
  balanceSheetData,
  cashFlowData,
  keyMetrics,
  insights = [],
}: BoardReportTemplateProps) {
  const handleExport = () => {
    toast.success("Report exported", {
      description: "Board report has been exported to PDF"
    });
  };

  const handlePrint = () => {
    toast.success("Preparing print view", {
      description: "Board report print view is ready"
    });
  };

  const handleShare = () => {
    toast.success("Sharing options", {
      description: "Share this report via email or link"
    });
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
      footer={<div className="text-center">Confidential: For internal use only</div>}
    >
      <div className="space-y-8">
        {/* Key Metrics Section */}
        <ReportSection 
          title="Financial Highlights" 
          description="Key financial metrics for the current period"
        >
          <MetricGroup
            columns={4}
            metrics={[
              {
                title: "Revenue",
                value: keyMetrics.revenue,
                previousValue: keyMetrics.prevRevenue,
                percentChange: keyMetrics.revenueChange,
                formatter: formatCurrency,
                icon: <DollarSign className="h-5 w-5" />,
                variant: keyMetrics.revenueChange && keyMetrics.revenueChange > 0 ? "positive" : keyMetrics.revenueChange && keyMetrics.revenueChange < 0 ? "negative" : "default"
              },
              {
                title: "Net Profit",
                value: keyMetrics.profit,
                previousValue: keyMetrics.prevProfit,
                percentChange: keyMetrics.profitChange,
                formatter: formatCurrency,
                icon: <TrendingUp className="h-5 w-5" />,
                variant: keyMetrics.profitChange && keyMetrics.profitChange > 0 ? "positive" : keyMetrics.profitChange && keyMetrics.profitChange < 0 ? "negative" : "default"
              },
              {
                title: "Cash Balance",
                value: keyMetrics.cashBalance,
                previousValue: keyMetrics.prevCashBalance,
                percentChange: keyMetrics.cashChange,
                formatter: formatCurrency,
                icon: <BarChart3 className="h-5 w-5" />,
                variant: keyMetrics.cashChange && keyMetrics.cashChange > 0 ? "positive" : keyMetrics.cashChange && keyMetrics.cashChange < 0 ? "negative" : "default"
              },
              {
                title: "Operating Expenses",
                value: keyMetrics.operatingExpenses,
                previousValue: keyMetrics.prevOperatingExpenses,
                percentChange: keyMetrics.expensesChange,
                formatter: formatCurrency,
                icon: <Activity className="h-5 w-5" />,
                variant: keyMetrics.expensesChange && keyMetrics.expensesChange < 0 ? "positive" : keyMetrics.expensesChange && keyMetrics.expensesChange > 0 ? "negative" : "default"
              },
            ]}
          />
        </ReportSection>
        
        {/* Insights & Recommendations */}
        <ReportSection 
          title="Key Insights" 
          description="Financial analysis and recommendations"
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
              metrics={[
                {
                  name: "Revenue",
                  current_value: keyMetrics.revenue,
                  previous_value: keyMetrics.prevRevenue,
                  data_points: [
                    { date: "2025-01", value: keyMetrics.prevRevenue || 0 },
                    { date: "2025-02", value: keyMetrics.revenue }
                  ]
                },
                {
                  name: "Net Profit",
                  current_value: keyMetrics.profit,
                  previous_value: keyMetrics.prevProfit,
                  data_points: [
                    { date: "2025-01", value: keyMetrics.prevProfit || 0 },
                    { date: "2025-02", value: keyMetrics.profit }
                  ]
                },
                {
                  name: "Cash Balance",
                  current_value: keyMetrics.cashBalance,
                  previous_value: keyMetrics.prevCashBalance,
                  data_points: [
                    { date: "2025-01", value: keyMetrics.prevCashBalance || 0 },
                    { date: "2025-02", value: keyMetrics.cashBalance }
                  ]
                },
                {
                  name: "Operating Expenses",
                  current_value: keyMetrics.operatingExpenses,
                  previous_value: keyMetrics.prevOperatingExpenses,
                  data_points: [
                    { date: "2025-01", value: keyMetrics.prevOperatingExpenses || 0 },
                    { date: "2025-02", value: keyMetrics.operatingExpenses }
                  ]
                }
              ]}
              reportType="board"
              showSummary={true}
            />
          )}
        </ReportSection>
        
        {/* Detailed Financial Statements */}
        <ReportSection 
          title="Financial Statements" 
          description="Detailed financial reports for the period"
          collapsible
        >
          <Tabs defaultValue="profit-loss">
            <TabsList className="mb-4">
              <TabsTrigger value="profit-loss">P&L Statement</TabsTrigger>
              <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
              <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profit-loss">
              <Card>
                <CardContent className="pt-6">
                  <ProfitLossStatement data={profitAndLossData} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="balance-sheet">
              <Card>
                <CardContent className="pt-6">
                  <BalanceSheetReport data={balanceSheetData} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="cash-flow">
              <Card>
                <CardContent className="pt-6">
                  <CashFlowReport data={cashFlowData} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </ReportSection>
      </div>
    </ExecutiveReportTemplate>
  );
}
