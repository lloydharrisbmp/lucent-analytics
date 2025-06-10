import React from "react";
import { 
  BalanceSheet,
  BSItem,
  DateRange 
} from "utils/financial-types";
import { formatCurrency } from "utils/financial-data";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";

interface BalanceSheetReportProps {
  data: BalanceSheet;
}

export function BalanceSheetReport({ data }: BalanceSheetReportProps) {
  // Format data for the pie charts
  const assetData = data.assets.map(item => ({
    name: item.name,
    value: item.amount
  }));
  
  const liabEquityData = [
    ...data.liabilities.map(item => ({
      name: item.name,
      value: item.amount,
      type: 'Liabilities'
    })),
    ...data.equity.map(item => ({
      name: item.name,
      value: item.amount,
      type: 'Equity'
    }))
  ];

  // Colors for pie charts
  const ASSET_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  const LIAB_EQUITY_COLORS = {
    'Liabilities': ['#ff0000', '#ff3333', '#ff6666', '#ff9999', '#ffcccc'],
    'Equity': ['#00cc00', '#33cc33', '#66cc66', '#99cc99']
  };

  // Helper function to render balance sheet line items
  const renderLineItems = (items: BSItem[], label: string) => {
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

  // Custom tooltip for pie charts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow-sm">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm">{formatCurrency(payload[0].value)}</p>
          {payload[0].payload.type && (
            <p className="text-xs text-muted-foreground">{payload[0].payload.type}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Chart visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-lg font-medium mb-2 text-center">Assets Distribution</div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assetData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => entry.name}
                  >
                    {assetData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={ASSET_COLORS[index % ASSET_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-lg font-medium mb-2 text-center">Liabilities & Equity</div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={liabEquityData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => entry.name}
                  >
                    {liabEquityData.map((entry, index) => {
                      const colorType = entry.type === 'Liabilities' ? 'Liabilities' : 'Equity';
                      const colorIndex = entry.type === 'Liabilities' ?
                        index % LIAB_EQUITY_COLORS['Liabilities'].length :
                        (index - data.liabilities.length) % LIAB_EQUITY_COLORS['Equity'].length;
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={LIAB_EQUITY_COLORS[colorType][colorIndex]} 
                        />
                      );
                    })}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed statement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6 space-y-6">
            {renderLineItems(data.assets, "Assets")}
            <div className="flex justify-between font-medium text-lg pt-2 border-t">
              <span>Total Assets</span>
              <span>{formatCurrency(data.totalAssets)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-6">
            {renderLineItems(data.liabilities, "Liabilities")}
            {renderLineItems(data.equity, "Equity")}
            <div className="flex justify-between font-medium text-lg pt-2 border-t">
              <span>Total Liabilities & Equity</span>
              <span>{formatCurrency(data.totalLiabilities + data.totalEquity)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
