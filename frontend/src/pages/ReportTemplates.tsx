import React, { useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BoardReportTemplate } from "components/BoardReportTemplate";
import { ManagementReportTemplate } from "components/ManagementReportTemplate";
import { InvestorReportTemplate } from "components/InvestorReportTemplate";
import { ExecutiveReportTemplate } from "components/ExecutiveReportTemplate";
import { ReportSection } from "components/ReportSection";
import { MetricGroup } from "components/MetricGroup";
import { FinancialHighlight } from "components/FinancialHighlight";
import { KeyMetricInsight } from "components/KeyMetricInsight";
import { generateSampleProfitAndLoss, generateSampleBalanceSheet, generateSampleCashFlow } from "utils/financial-data";
import { DateRange } from "utils/financial-types";
import { Clipboard, FileText, LayoutDashboard, PieChart, Users } from "lucide-react";

export default function ReportTemplates() {
  const today = new Date();
  const dateRange: DateRange = {
    type: "month",
    startDate: new Date(today.getFullYear(), today.getMonth(), 1),
    endDate: today,
    label: `${today.toLocaleString('default', { month: 'long' })} ${today.getFullYear()}`
  };

  // Sample data
  const profitAndLossData = generateSampleProfitAndLoss(dateRange);
  const balanceSheetData = generateSampleBalanceSheet(today);
  const cashFlowData = generateSampleCashFlow(dateRange);
  
  // Financial highlights for board report
  const boardMetrics = {
    revenue: 7862300,
    prevRevenue: 7245000,
    revenueChange: 8.5,
    profit: 1984500,
    prevProfit: 1845000,
    profitChange: 7.6,
    cashBalance: 3245000,
    prevCashBalance: 2984000,
    cashChange: 8.7,
    operatingExpenses: 3541200,
    prevOperatingExpenses: 3625000,
    expensesChange: -2.3
  };

  // Board insights
  const boardInsights = [
    {
      title: "Strong revenue growth in enterprise segment",
      description: "Enterprise segment revenue increased by 15.3% compared to the previous quarter, driven by new client acquisitions and expansion of existing accounts.",
      type: "positive" as const,
      recommendations: [
        "Allocate additional resources to enterprise sales team",
        "Expand enterprise product features in Q3 roadmap"
      ]
    },
    {
      title: "Cash flow improvement due to operational efficiencies",
      description: "The 8.7% increase in cash balance was primarily driven by improved collections processes and reduced operational costs.",
      type: "positive" as const
    },
    {
      title: "Supply chain cost pressures emerging",
      description: "Recent supplier negotiations indicate a potential 5-7% cost increase in raw materials starting next quarter.",
      type: "warning" as const,
      recommendations: [
        "Evaluate alternative suppliers",
        "Consider strategic inventory buildup",
        "Review pricing strategy to potentially offset increased costs"
      ]
    }
  ];

  // Management KPIs
  const managementKPIs = [
    {
      name: "Monthly Recurring Revenue",
      value: 654200,
      target: 650000,
      previousValue: 632000,
      percentChange: 3.5,
      status: "positive" as const
    },
    {
      name: "Customer Acquisition Cost",
      value: 1250,
      target: 1200,
      previousValue: 1345,
      percentChange: -7.1,
      status: "positive" as const
    },
    {
      name: "Average Revenue Per User",
      value: 89,
      target: 95,
      previousValue: 82,
      percentChange: 8.5,
      status: "positive" as const
    },
    {
      name: "Churn Rate",
      value: 3.2,
      target: 3.0,
      previousValue: 3.6,
      percentChange: -11.1,
      status: "positive" as const
    },
    {
      name: "Operating Margin",
      value: 28.5,
      target: 30.0,
      previousValue: 26.8,
      percentChange: 6.3,
      status: "positive" as const
    },
    {
      name: "Customer Satisfaction",
      value: 4.7,
      target: 4.8,
      previousValue: 4.5,
      percentChange: 4.4,
      status: "positive" as const
    }
  ];

  // Performance trend for management report
  const performanceTrend = [
    { month: "Jan", revenue: 620000, expenses: 450000, profit: 170000 },
    { month: "Feb", revenue: 635000, expenses: 460000, profit: 175000 },
    { month: "Mar", revenue: 648000, expenses: 465000, profit: 183000 },
    { month: "Apr", revenue: 672000, expenses: 475000, profit: 197000 },
    { month: "May", revenue: 685000, expenses: 480000, profit: 205000 },
    { month: "Jun", revenue: 702000, expenses: 485000, profit: 217000 }
  ];

  // Customer segments
  const customerSegments = [
    { name: "Enterprise", value: 350000, color: "#4ade80" },
    { name: "SMB", value: 285000, color: "#60a5fa" },
    { name: "Startup", value: 120000, color: "#f472b6" },
    { name: "Individual", value: 65000, color: "#f59e0b" }
  ];

  // Management commentary
  const managementCommentary = "The second quarter showed strong performance across most key metrics. Revenue growth exceeded expectations, primarily driven by our enterprise segment which saw a 15.3% increase compared to Q1. This was fueled by both new customer acquisition and expansion within existing accounts.\n\nOperating expenses remained well controlled, decreasing 2.3% quarter-over-quarter due to efficiencies gained from our new automated customer onboarding system. This contributed to an improved operating margin of 28.5%, up from 26.8% in the previous quarter.\n\nThe sales pipeline for Q3 looks robust, with several large enterprise deals in the final stages of negotiation. However, we're monitoring potential supply chain cost pressures that may impact our hardware-related product lines in the coming months.";

  // Management insights
  const managementInsights = [
    {
      title: "Customer acquisition efficiency improving",
      description: "CAC has decreased by 7.1% while ARPU has increased by 8.5%, indicating improved acquisition efficiency and higher quality customers.",
      type: "positive" as const,
      recommendations: [
        "Continue optimization of digital marketing channels",
        "Analyze high-performing customer segments for targeted acquisition efforts"
      ]
    },
    {
      title: "Potential resource constraints in customer success",
      description: "With recent growth, each customer success manager is now handling 23% more accounts than our target ratio.",
      type: "warning" as const,
      recommendations: [
        "Accelerate hiring of 3 additional CSMs in Q3",
        "Implement interim automation for lower-tier support inquiries",
        "Review account distribution to ensure strategic accounts maintain high-touch support"
      ]
    }
  ];

  // Investor report data
  const financialHighlights = {
    revenue: 2085000,
    prevRevenue: 1925000,
    revenueChange: 8.3,
    profit: 625000,
    prevProfit: 578000,
    profitChange: 8.1,
    eps: 1.45,
    prevEps: 1.32,
    epsChange: 9.8,
    dividendYield: 2.5,
    prevDividendYield: 2.4
  };

  // Quarterly performance
  const quarterlyPerformance = [
    { quarter: "Q1", revenue: 1925000, expenses: 1347000, profit: 578000, targetRevenue: 1900000 },
    { quarter: "Q2", revenue: 2085000, expenses: 1460000, profit: 625000, targetRevenue: 2000000 },
    { quarter: "Q3", revenue: 0, expenses: 0, profit: 0, targetRevenue: 2150000 },
    { quarter: "Q4", revenue: 0, expenses: 0, profit: 0, targetRevenue: 2350000 }
  ];

  // Future projections
  const futureProjections = [
    { period: "Q3 2023", projected: 2150000, conservative: 2050000, optimistic: 2250000 },
    { period: "Q4 2023", projected: 2350000, conservative: 2200000, optimistic: 2500000 },
    { period: "Q1 2024", projected: 2450000, conservative: 2300000, optimistic: 2650000 },
    { period: "Q2 2024", projected: 2600000, conservative: 2400000, optimistic: 2800000 }
  ];

  // Key initiatives
  const keyInitiatives = [
    {
      name: "International Expansion",
      status: "in-progress" as const,
      completion: 65,
      description: "Expansion into European markets with localized product offerings and sales teams."
    },
    {
      name: "Product Line Extension",
      status: "in-progress" as const,
      completion: 40,
      description: "Development of new enterprise product suite with advanced analytics capabilities."
    },
    {
      name: "Digital Transformation",
      status: "completed" as const,
      completion: 100,
      description: "Migration of internal systems to cloud infrastructure for improved scalability."
    },
    {
      name: "Sustainability Initiative",
      status: "not-started" as const,
      completion: 0,
      description: "Implementation of company-wide carbon footprint reduction and sustainability reporting."
    }
  ];

  // Investor updates
  const investorUpdates = [
    {
      title: "Share Repurchase Program",
      description: "The board has approved a $10M share repurchase program to be executed over the next 12 months as part of our capital allocation strategy.",
      type: "information" as const
    },
    {
      title: "New Board Member Appointment",
      description: "Jane Smith, former CFO of TechCorp Inc., has joined our board of directors, bringing over 20 years of financial and technology industry experience.",
      type: "information" as const
    }
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">Report Templates</h1>
        <div>
          <Button>Create Custom Report</Button>
        </div>
      </div>

      {/* Component Demo */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Report Builder Components</CardTitle>
          <CardDescription>
            Use these modular components to build custom executive reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="templates">
            <TabsList className="mb-4">
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="sections">Sections</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="templates">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Executive Report Template</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Base template with header, export options, and optional footer
                    </p>
                    <div className="flex items-center text-sm">
                      <Clipboard className="h-4 w-4 mr-1" />
                      <code className="text-xs">ExecutiveReportTemplate</code>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Board Report</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Financial performance summary for board of directors
                    </p>
                    <div className="flex items-center text-sm">
                      <Clipboard className="h-4 w-4 mr-1" />
                      <code className="text-xs">BoardReportTemplate</code>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Management Report</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Operational KPIs and performance metrics for leadership
                    </p>
                    <div className="flex items-center text-sm">
                      <Clipboard className="h-4 w-4 mr-1" />
                      <code className="text-xs">ManagementReportTemplate</code>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Investor Report</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Financial results and forecasts for shareholders
                    </p>
                    <div className="flex items-center text-sm">
                      <Clipboard className="h-4 w-4 mr-1" />
                      <code className="text-xs">InvestorReportTemplate</code>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="sections">
              <div className="space-y-4">
                <ReportSection 
                  title="Example Report Section" 
                  description="Organize report content into logical sections"
                >
                  <p className="text-muted-foreground mb-4">
                    Use the ReportSection component to group related content together. 
                    Sections can be collapsible for better organization of lengthy reports.
                  </p>
                  <div className="flex items-center text-sm mb-2">
                    <Clipboard className="h-4 w-4 mr-1" />
                    <code className="text-xs">ReportSection</code>
                  </div>
                </ReportSection>

                <ReportSection 
                  title="Collapsible Section Example" 
                  description="This section can be collapsed to save space"
                  collapsible
                >
                  <p className="text-muted-foreground">
                    Add the collapsible prop to create a section that can be expanded and collapsed.
                    This is useful for long reports with detailed information that isn't always needed.
                  </p>
                </ReportSection>
              </div>
            </TabsContent>

            <TabsContent value="metrics">
              <div className="space-y-8">
                <div>
                  <h3 className="font-medium text-lg mb-3">Financial Highlight Components</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FinancialHighlight
                      title="Revenue"
                      value={1250000}
                      previousValue={1150000}
                      percentChange={8.7}
                      formatter={(val) => `$${Number(val).toLocaleString()}`}
                      variant="positive"
                    />
                    <FinancialHighlight
                      title="Customer Churn"
                      value={2.3}
                      previousValue={3.1}
                      percentChange={-25.8}
                      formatter={(val) => `${val}%`}
                      variant="positive"
                    />
                    <FinancialHighlight
                      title="Operating Expenses"
                      value={645000}
                      previousValue={620000}
                      percentChange={4.0}
                      formatter={(val) => `$${Number(val).toLocaleString()}`}
                      variant="negative"
                    />
                    <FinancialHighlight
                      title="User Growth"
                      value={12500}
                      previousValue={10800}
                      percentChange={15.7}
                      formatter={(val) => Number(val).toLocaleString()}
                      footer="Target: 13,000"
                      variant="primary"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-lg mb-3">Metric Groups</h3>
                  <MetricGroup
                    title="Key Performance Indicators"
                    columns={3}
                    metrics={[
                      {
                        title: "Sales",
                        value: 548000,
                        previousValue: 520000,
                        percentChange: 5.4,
                        formatter: (val) => `$${Number(val).toLocaleString()}`,
                        variant: "positive"
                      },
                      {
                        title: "Gross Margin",
                        value: 42.5,
                        previousValue: 41.8,
                        percentChange: 1.7,
                        formatter: (val) => `${val}%`,
                        variant: "positive"
                      },
                      {
                        title: "New Customers",
                        value: 127,
                        previousValue: 115,
                        percentChange: 10.4,
                        variant: "positive"
                      }
                    ]}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="insights">
              <div className="space-y-4">
                <KeyMetricInsight
                  title="Revenue Growth Acceleration"
                  description="Revenue growth rate has increased to 8.7% compared to 6.5% in the previous quarter, indicating market share gains and successful product initiatives."
                  type="positive"
                  recommendations={[
                    "Increase investment in top-performing marketing channels",
                    "Accelerate expansion of sales team in high-growth regions"
                  ]}
                />

                <KeyMetricInsight
                  title="Cash Conversion Cycle Improvement"
                  description="The cash conversion cycle has decreased from 45 days to 38 days, improving operational liquidity."
                  type="success"
                  additionalInfo="This improvement is primarily due to better inventory management and accounts receivable collection efforts."
                />

                <KeyMetricInsight
                  title="Supply Chain Risk"
                  description="Recent supplier disruptions could impact product availability in the coming quarter."
                  type="warning"
                  recommendations={[
                    "Identify alternative suppliers for critical components",
                    "Increase safety stock for high-demand products",
                    "Develop contingency plan for shipping delays"
                  ]}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Report Template Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Report Template Examples</CardTitle>
          <CardDescription>
            Preview different report templates for various stakeholders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="board">
            <TabsList className="mb-6">
              <TabsTrigger value="board">Board Report</TabsTrigger>
              <TabsTrigger value="management">Management Report</TabsTrigger>
              <TabsTrigger value="investor">Investor Report</TabsTrigger>
            </TabsList>

            <TabsContent value="board">
              <BoardReportTemplate
                date={today}
                organization="Lucent Analytics, Inc."
                preparedBy="John Smith, CFO"
                profitAndLossData={profitAndLossData}
                balanceSheetData={balanceSheetData}
                cashFlowData={cashFlowData}
                keyMetrics={boardMetrics}
                insights={boardInsights}
              />
            </TabsContent>

            <TabsContent value="management">
              <ManagementReportTemplate
                date={today}
                organization="Lucent Analytics, Inc."
                preparedBy="Jane Wilson, COO"
                kpiData={managementKPIs}
                performanceTrend={performanceTrend}
                customerSegments={customerSegments}
                commentary={managementCommentary}
                insights={managementInsights}
              />
            </TabsContent>

            <TabsContent value="investor">
              <InvestorReportTemplate
                date={today}
                organization="Lucent Analytics, Inc."
                preparedBy="Michael Johnson, CEO"
                financialHighlights={financialHighlights}
                quarterlyPerformance={quarterlyPerformance}
                futureProjections={futureProjections}
                keyInitiatives={keyInitiatives}
                investorUpdates={investorUpdates}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
