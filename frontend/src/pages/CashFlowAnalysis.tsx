import React, { useState } from "react";
import { WorkingCapitalDashboard } from "components/WorkingCapitalDashboard";
import { CashFlowScenarioComparison } from "components/CashFlowScenarioComparison";
import { EnhancedCashFlowWaterfall } from "components/EnhancedCashFlowWaterfall";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarRange, LineChart, TrendingUp } from "lucide-react";

// Sample mock data for the working capital dashboard
const workingCapitalMetrics = {
  dso: 45.2,
  dio: 38.7,
  dpo: 30.5,
  cashConversionCycle: 53.4,
  currentRatio: 1.4,
  quickRatio: 0.9,
  workingCapital: 840000,
  workingCapitalRatio: 1.2
};

const workingCapitalHistoricalData = [
  {
    date: "Jan 2025",
    accountsReceivable: 620000,
    inventory: 450000,
    accountsPayable: 380000,
    netWorkingCapital: 690000,
    projectedCashBalance: 540000
  },
  {
    date: "Feb 2025",
    accountsReceivable: 650000,
    inventory: 480000,
    accountsPayable: 360000,
    netWorkingCapital: 770000,
    projectedCashBalance: 620000
  },
  {
    date: "Mar 2025",
    accountsReceivable: 680000,
    inventory: 460000,
    accountsPayable: 370000,
    netWorkingCapital: 770000,
    projectedCashBalance: 650000
  }
];

const workingCapitalProjectedData = [
  {
    date: "Apr 2025",
    accountsReceivable: 710000,
    inventory: 490000,
    accountsPayable: 380000,
    netWorkingCapital: 820000,
    projectedCashBalance: 680000
  },
  {
    date: "May 2025",
    accountsReceivable: 730000,
    inventory: 510000,
    accountsPayable: 400000,
    netWorkingCapital: 840000,
    projectedCashBalance: 710000
  },
  {
    date: "Jun 2025",
    accountsReceivable: 750000,
    inventory: 530000,
    accountsPayable: 420000,
    netWorkingCapital: 860000,
    projectedCashBalance: 750000
  }
];

// Sample mock data for cash flow scenarios
const cashFlowScenarios = [
  {
    id: "baseline",
    name: "Baseline",
    description: "Standard forecast based on current trends and historical data",
    assumptions: [
      { label: "Revenue Growth", value: "5% year-over-year" },
      { label: "Operating Expenses", value: "3% increase" },
      { label: "Capital Expenditures", value: "$80,000 quarterly" }
    ],
    probabilityRating: "high" as const,
    monthlyProjections: [
      {
        month: "Apr 2025",
        operatingCashFlow: 120000,
        investingCashFlow: -80000,
        financingCashFlow: -20000,
        netCashFlow: 20000,
        endingCashBalance: 700000
      },
      {
        month: "May 2025",
        operatingCashFlow: 130000,
        investingCashFlow: -70000,
        financingCashFlow: -25000,
        netCashFlow: 35000,
        endingCashBalance: 735000
      },
      {
        month: "Jun 2025",
        operatingCashFlow: 125000,
        investingCashFlow: -85000,
        financingCashFlow: -20000,
        netCashFlow: 20000,
        endingCashBalance: 755000
      }
    ],
    metrics: {
      averageMonthlyBurn: 77333,
      peakNegativeCashFlow: -85000,
      runwayMonths: 9.8,
      lowestCashBalance: 700000,
      highestCashBalance: 755000
    }
  },
  {
    id: "optimistic",
    name: "Optimistic",
    description: "Accelerated growth scenario with increased sales and improved operational efficiency",
    assumptions: [
      { label: "Revenue Growth", value: "8% year-over-year" },
      { label: "Operating Expenses", value: "2.5% increase" },
      { label: "Capital Expenditures", value: "$75,000 quarterly" }
    ],
    probabilityRating: "medium" as const,
    monthlyProjections: [
      {
        month: "Apr 2025",
        operatingCashFlow: 145000,
        investingCashFlow: -75000,
        financingCashFlow: -20000,
        netCashFlow: 50000,
        endingCashBalance: 730000
      },
      {
        month: "May 2025",
        operatingCashFlow: 155000,
        investingCashFlow: -70000,
        financingCashFlow: -25000,
        netCashFlow: 60000,
        endingCashBalance: 790000
      },
      {
        month: "Jun 2025",
        operatingCashFlow: 160000,
        investingCashFlow: -80000,
        financingCashFlow: -20000,
        netCashFlow: 60000,
        endingCashBalance: 850000
      }
    ],
    metrics: {
      averageMonthlyBurn: 73333,
      peakNegativeCashFlow: -80000,
      runwayMonths: 11.6,
      lowestCashBalance: 730000,
      highestCashBalance: 850000
    }
  },
  {
    id: "conservative",
    name: "Conservative",
    description: "Cautious scenario accounting for potential market challenges and delayed collections",
    assumptions: [
      { label: "Revenue Growth", value: "3% year-over-year" },
      { label: "Operating Expenses", value: "3.5% increase" },
      { label: "Capital Expenditures", value: "$85,000 quarterly" }
    ],
    probabilityRating: "low" as const,
    monthlyProjections: [
      {
        month: "Apr 2025",
        operatingCashFlow: 105000,
        investingCashFlow: -85000,
        financingCashFlow: -20000,
        netCashFlow: 0,
        endingCashBalance: 680000
      },
      {
        month: "May 2025",
        operatingCashFlow: 110000,
        investingCashFlow: -80000,
        financingCashFlow: -25000,
        netCashFlow: 5000,
        endingCashBalance: 685000
      },
      {
        month: "Jun 2025",
        operatingCashFlow: 100000,
        investingCashFlow: -90000,
        financingCashFlow: -20000,
        netCashFlow: -10000,
        endingCashBalance: 675000
      }
    ],
    metrics: {
      averageMonthlyBurn: 85000,
      peakNegativeCashFlow: -90000,
      runwayMonths: 7.9,
      lowestCashBalance: 675000,
      highestCashBalance: 685000
    }
  }
];

// Sample mock data for waterfall chart
const waterfallData = [
  {
    name: "Starting Balance",
    value: 680000,
    fill: "#60a5fa",
    isTotal: true
  },
  {
    name: "Operating Receipts",
    value: 425000,
    fill: "#4ade80",
    seasonalImpact: {
      description: "Higher than typical for Winter due to end of financial year activity",
      percentage: 12.5,
      baseAmount: 377778
    }
  },
  {
    name: "Operating Disbursements",
    value: -305000,
    fill: "#f87171",
    seasonalImpact: {
      description: "Slightly higher expenses due to year-end purchases",
      percentage: 8.2,
      baseAmount: -281887
    }
  },
  {
    name: "Capital Expenditures",
    value: -85000,
    fill: "#f87171"
  },
  {
    name: "Financing Activities",
    value: -20000,
    fill: "#f87171"
  },
  {
    name: "Tax Payments",
    value: -45000,
    fill: "#f87171",
    seasonalImpact: {
      description: "Quarterly BAS payment",
      percentage: 0,
      baseAmount: -45000
    }
  },
  {
    name: "Ending Balance",
    value: 650000,
    fill: "#60a5fa",
    isTotal: true
  }
];

const keyDates = [
  {
    date: "28 Jul 2025",
    event: "Quarterly BAS Due",
    description: "Goods and services tax payment due for Q2",
    cashFlowImpact: {
      type: "disbursement" as const,
      relativeImpact: "medium" as const,
      estimatedAmount: 45000
    }
  },
  {
    date: "15 Aug 2025",
    event: "Major Client Payment",
    description: "Expected payment from ABC Corp for Q2 services",
    cashFlowImpact: {
      type: "receipt" as const,
      relativeImpact: "high" as const,
      estimatedAmount: 120000
    }
  },
  {
    date: "30 Aug 2025",
    event: "Equipment Purchase",
    description: "Planned capex for production equipment",
    cashFlowImpact: {
      type: "disbursement" as const,
      relativeImpact: "high" as const,
      estimatedAmount: 85000
    }
  },
  {
    date: "15 Sep 2025",
    event: "Loan Payment",
    description: "Quarterly principal and interest payment",
    cashFlowImpact: {
      type: "disbursement" as const,
      relativeImpact: "low" as const,
      estimatedAmount: 20000
    }
  }
];

const seasonalPatterns = [
  {
    season: ["Winter"] as const,
    description: "End of financial year brings increased business activity, tax planning, and equipment purchases.",
    impact: "mixed" as const,
    seasonalFactors: {
      cashReceiptsAdjustment: 0.125,
      cashDisbursementsAdjustment: 0.082
    }
  },
  {
    season: ["Spring"] as const,
    description: "Recovery period with moderate activity and preparation for summer peak.",
    impact: "positive" as const,
    seasonalFactors: {
      cashReceiptsAdjustment: 0.075,
      cashDisbursementsAdjustment: 0.02
    }
  },
  {
    season: ["Summer"] as const,
    description: "Highest sales period but also increased operational costs due to peak activity.",
    impact: "positive" as const,
    seasonalFactors: {
      cashReceiptsAdjustment: 0.18,
      cashDisbursementsAdjustment: 0.09
    }
  },
  {
    season: ["Autumn"] as const,
    description: "Slowing activity and collections, with businesses preparing for end of financial year.",
    impact: "negative" as const,
    seasonalFactors: {
      cashReceiptsAdjustment: -0.05,
      cashDisbursementsAdjustment: 0.04
    }
  }
];

export default function CashFlowAnalysis() {
  const [selectedClient, setSelectedClient] = useState<string>("all");
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("quarterly");
  
  // Calculate date ranges based on selected timeframe
  const getDateRange = () => {
    switch (selectedTimeframe) {
      case "monthly":
        return "July 2025";
      case "quarterly":
        return "Jul - Sep 2025";
      case "annual":
        return "FY 2025-2026";
      default:
        return "Jul - Sep 2025";
    }
  };
  
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cash Flow Analysis</h1>
          <p className="text-muted-foreground mt-1">Interactive cash flow visualizations and working capital management</p>
        </div>
        
        <div className="flex space-x-4">
          <div>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                <SelectItem value="client1">Acme Corporation</SelectItem>
                <SelectItem value="client2">TechStart Pty Ltd</SelectItem>
                <SelectItem value="client3">Retail Group</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="annual">Annual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Analytics overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Cash Conversion Cycle</p>
                <p className="text-2xl font-bold">{workingCapitalMetrics.cashConversionCycle.toFixed(1)} days</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <CalendarRange className="h-5 w-5 text-blue-600 dark:text-blue-300" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Net Cash Flow (Projected)</p>
                <p className="text-2xl font-bold">${cashFlowScenarios[0].monthlyProjections.reduce((sum, month) => sum + month.netCashFlow, 0).toLocaleString()}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-300" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Cash Flow Scenarios</p>
                <p className="text-2xl font-bold">{cashFlowScenarios.length}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <LineChart className="h-5 w-5 text-purple-600 dark:text-purple-300" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main content area */}
      <Tabs defaultValue="waterfall" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="waterfall">Cash Flow Waterfall</TabsTrigger>
          <TabsTrigger value="scenarios">Scenario Comparison</TabsTrigger>
          <TabsTrigger value="working-capital">Working Capital</TabsTrigger>
        </TabsList>
        
        <TabsContent value="waterfall" className="space-y-4">
          <EnhancedCashFlowWaterfall 
            data={waterfallData}
            keyDates={keyDates}
            seasonalPatterns={seasonalPatterns}
            currentSeason="Winter"
            dateRange={getDateRange()}
            industry="Professional Services"
            seasonalityImpact={40335} // Calculated from seasonal impacts in the data
          />
        </TabsContent>
        
        <TabsContent value="scenarios" className="space-y-4">
          <CashFlowScenarioComparison 
            scenarios={cashFlowScenarios}
            defaultScenarioId="baseline"
            comparisonScenarioId="optimistic" 
            startingCashBalance={680000}
            dateRange={getDateRange()}
          />
        </TabsContent>
        
        <TabsContent value="working-capital" className="space-y-4">
          <WorkingCapitalDashboard 
            metrics={workingCapitalMetrics}
            historicalData={workingCapitalHistoricalData}
            projectedData={workingCapitalProjectedData}
            dateRange={getDateRange()}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
