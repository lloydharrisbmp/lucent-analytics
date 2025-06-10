import React from "react";
import { 
  ProfitAndLossStatement,
  PLItem,
  DateRange 
} from "utils/financial-types";
import { formatCurrency } from "utils/financial-data";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";

interface ProfitLossStatementProps {
  data: ProfitAndLossStatement;
}

export function ProfitLossStatement({ data }: ProfitLossStatementProps) {
  // Format data for the bar chart
  const chartData = [
    {
      name: "Revenue",
      amount: data.revenue.reduce((sum, item) => sum + item.amount, 0),
      fill: "#4ade80"
    },
    {
      name: "Cost of Sales",
      amount: data.costOfSales.reduce((sum, item) => sum + item.amount, 0),
      fill: "#fb7185"
    },
    {
      name: "Gross Profit",
      amount: data.grossProfit,
      fill: "#60a5fa"
    },
    {
      name: "Expenses",
      amount: data.expenses.reduce((sum, item) => sum + item.amount, 0),
      fill: "#f87171"
    },
    {
      name: "Net Income",
      amount: data.netIncome,
      fill: "#4ade80"
    }
  ];

  // Helper function to render P&L line items
  const renderLineItems = (items: PLItem[], label: string) => {
    const total = items.reduce((sum, item) => sum + item.amount, 0);
    
    return (
      <div className="space-y-2">
        <div className="font-medium text-lg">{label}</div>
        <div className="space-y-1">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span className="text-muted-foreground">{item.name}</span>
              <span>{formatCurrency(item.amount)}</span>
            </div>
          ))}
          <div className="flex justify-between font-medium pt-2 border-t">
            <span>Total {label}</span>
            <span>{formatCurrency(total)}</span>
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
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" allowDataOverflow={false} hide={false} scale="auto" xAxisId={0} />
                <YAxis tickFormatter={(value) => formatCurrency(value)} allowDataOverflow={false} hide={false} scale="auto" yAxisId={0} orientation="left" width={60} />
                <Tooltip 
                  formatter={(value) => [formatCurrency(Number(value)), ""]}
                  labelFormatter={(label) => `${label}`}
                />
                <Bar dataKey="amount" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detailed statement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6 space-y-6">
            {renderLineItems(data.revenue, "Revenue")}
            {renderLineItems(data.costOfSales, "Cost of Sales")}
            <div className="flex justify-between font-medium text-lg pt-2 border-t">
              <span>Gross Profit</span>
              <span>{formatCurrency(data.grossProfit)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-6">
            {renderLineItems(data.expenses, "Expenses")}
            <div className="flex justify-between font-medium text-lg pt-2 border-t">
              <span>Net Income</span>
              <span>{formatCurrency(data.netIncome)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
