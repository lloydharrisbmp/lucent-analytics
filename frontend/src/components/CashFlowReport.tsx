import React from "react";
import { 
  CashFlowStatement,
  CFItem,
  DateRange 
} from "utils/financial-types";
import { formatCurrency } from "utils/financial-data";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";

interface CashFlowReportProps {
  data: CashFlowStatement;
}

export function CashFlowReport({ data }: CashFlowReportProps) {
  // Format data for the waterfall chart
  const cashFlowWaterfall = [
    {
      name: "Beginning Balance",
      value: data.beginningCashBalance,
      fill: "#60a5fa"
    },
    {
      name: "Operating Activities",
      value: data.operatingActivities.reduce((sum, item) => sum + item.amount, 0),
      fill: "#4ade80"
    },
    {
      name: "Investing Activities",
      value: data.investingActivities.reduce((sum, item) => sum + item.amount, 0),
      fill: data.investingActivities.reduce((sum, item) => sum + item.amount, 0) >= 0 ? "#4ade80" : "#f87171"
    },
    {
      name: "Financing Activities",
      value: data.financingActivities.reduce((sum, item) => sum + item.amount, 0),
      fill: data.financingActivities.reduce((sum, item) => sum + item.amount, 0) >= 0 ? "#4ade80" : "#f87171"
    },
    {
      name: "Ending Balance",
      value: data.endingCashBalance,
      fill: "#60a5fa"
    }
  ];

  // Helper function to render cash flow line items
  const renderLineItems = (items: CFItem[], label: string) => {
    const total = items.reduce((sum, item) => sum + item.amount, 0);
    
    return (
      <div className="space-y-2">
        <div className="font-medium text-lg">{label}</div>
        <div className="space-y-1">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span className="text-muted-foreground">{item.name}</span>
              <span className={item.amount >= 0 ? "text-green-600" : "text-red-600"}>
                {item.amount >= 0 ? "+" : ""}{formatCurrency(item.amount)}
              </span>
            </div>
          ))}
          <div className="flex justify-between font-medium pt-2 border-t">
            <span>Net {label}</span>
            <span className={total >= 0 ? "text-green-600" : "text-red-600"}>
              {total >= 0 ? "+" : ""}{formatCurrency(total)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Chart visualization */}
      <Card>
        <CardContent className="pt-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={cashFlowWaterfall}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" allowDataOverflow={false} hide={false} scale="auto" xAxisId={0} />
                <YAxis tickFormatter={(value) => formatCurrency(value)} allowDataOverflow={false} hide={false} scale="auto" yAxisId={0} orientation="left" width={60} />
                <Tooltip 
                  formatter={(value) => [formatCurrency(Number(value)), ""]}
                  labelFormatter={(label) => `${label}`}
                />
                <ReferenceLine y={0} stroke="#666" alwaysShow={false} isFront={false} ifOverflow="none" />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  fill="#8884d8" 
                  stroke="#8884d8"
                  fillOpacity={0.8} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detailed statement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="flex justify-between font-medium text-lg">
              <span>Beginning Cash Balance</span>
              <span>{formatCurrency(data.beginningCashBalance)}</span>
            </div>
            {renderLineItems(data.operatingActivities, "Operating Activities")}
            {renderLineItems(data.investingActivities, "Investing Activities")}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-6">
            {renderLineItems(data.financingActivities, "Financing Activities")}
            <div className="flex justify-between font-medium text-lg pt-2 border-t">
              <span>Net Change in Cash</span>
              <span className={data.netCashFlow >= 0 ? "text-green-600" : "text-red-600"}>
                {data.netCashFlow >= 0 ? "+" : ""}{formatCurrency(data.netCashFlow)}
              </span>
            </div>
            <div className="flex justify-between font-medium text-lg pt-2 border-t">
              <span>Ending Cash Balance</span>
              <span>{formatCurrency(data.endingCashBalance)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
