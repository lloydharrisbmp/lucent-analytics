import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ForecastResult } from "../utils/financial-types";
import { formatCurrency, formatPercentage } from "../utils/financial-data";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface ForecastResultsProps {
  result: ForecastResult;
}

export function ForecastResults({ result }: ForecastResultsProps) {
  // Prepare data for charts
  const chartData = result.periods.map((period) => {
    const revenueTotal = period.revenue.reduce(
      (sum, item) => sum + item.amount,
      0
    );
    const costOfSalesTotal = period.costOfSales.reduce(
      (sum, item) => sum + item.amount,
      0
    );
    const expensesTotal = period.expenses.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    return {
      name: period.label,
      revenue: revenueTotal,
      costOfSales: costOfSalesTotal,
      expenses: expensesTotal,
      grossProfit: period.grossProfit,
      netIncome: period.netIncome,
    };
  });

  // Prepare profit margin data
  const marginData = result.periods.map((period) => {
    const revenueTotal = period.revenue.reduce(
      (sum, item) => sum + item.amount,
      0
    );
    return {
      name: period.label,
      grossMargin: (period.grossProfit / revenueTotal) * 100,
      netMargin: (period.netIncome / revenueTotal) * 100,
    };
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Forecast Results: {result.scenarioName}</CardTitle>
        <CardDescription>
          {result.periodType === "monthly"
            ? "Monthly projections"
            : result.periodType === "quarterly"
            ? "Quarterly projections"
            : "Yearly projections"} starting {result.startDate.toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="summary">
          <TabsList className="mb-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="profit">Profit</TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <div className="space-y-6">
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" allowDataOverflow={false} hide={false} scale="auto" xAxisId={0} />
                    <YAxis allowDataOverflow={false} hide={false} scale="auto" yAxisId={0} orientation="left" width={60} />
                    <Tooltip
                      formatter={(value) => formatCurrency(value as number)}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8884d8"
                      name="Revenue"
                    />
                    <Line
                      type="monotone"
                      dataKey="grossProfit"
                      stroke="#82ca9d"
                      name="Gross Profit"
                    />
                    <Line
                      type="monotone"
                      dataKey="netIncome"
                      stroke="#ffc658"
                      name="Net Income"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Forecast Summary</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Average</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Revenue</TableCell>
                      <TableCell>{formatCurrency(result.totals.revenue)}</TableCell>
                      <TableCell>
                        {formatCurrency(result.totals.revenue / result.periods.length)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Cost of Sales</TableCell>
                      <TableCell>
                        {formatCurrency(result.totals.costOfSales)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(
                          result.totals.costOfSales / result.periods.length
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Gross Profit</TableCell>
                      <TableCell>
                        {formatCurrency(result.totals.grossProfit)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(
                          result.totals.grossProfit / result.periods.length
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Expenses</TableCell>
                      <TableCell>{formatCurrency(result.totals.expenses)}</TableCell>
                      <TableCell>
                        {formatCurrency(result.totals.expenses / result.periods.length)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Net Income</TableCell>
                      <TableCell>{formatCurrency(result.totals.netIncome)}</TableCell>
                      <TableCell>
                        {formatCurrency(result.totals.netIncome / result.periods.length)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="revenue">
            <div className="space-y-6">
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={result.periods.map((period) => {
                      const items = {};
                      period.revenue.forEach((item) => {
                        items[item.id] = item.amount;
                      });
                      return {
                        name: period.label,
                        ...items,
                      };
                    })}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" allowDataOverflow={false} hide={false} scale="auto" xAxisId={0} />
                    <YAxis allowDataOverflow={false} hide={false} scale="auto" yAxisId={0} orientation="left" width={60} />
                    <Tooltip
                      formatter={(value) => formatCurrency(value as number)}
                    />
                    <Legend />
                    {result.periods[0].revenue.map((item, index) => (
                      <Bar
                        key={item.id}
                        dataKey={item.id}
                        name={item.name}
                        fill={`hsl(${index * 40}, 70%, 50%)`}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Revenue Item</TableHead>
                      {result.periods.map((period) => (
                        <TableHead key={period.period}>{period.label}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.periods[0].revenue.map((revenueItem) => (
                      <TableRow key={revenueItem.id}>
                        <TableCell className="font-medium">
                          {revenueItem.name}
                        </TableCell>
                        {result.periods.map((period) => {
                          const item = period.revenue.find(
                            (item) => item.id === revenueItem.id
                          );
                          return (
                            <TableCell key={period.period}>
                              {item ? formatCurrency(item.amount) : "$0"}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                    <TableRow className="font-semibold">
                      <TableCell>Total Revenue</TableCell>
                      {result.periods.map((period) => (
                        <TableCell key={period.period}>
                          {formatCurrency(
                            period.revenue.reduce(
                              (sum, item) => sum + item.amount,
                              0
                            )
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="expenses">
            <div className="space-y-6">
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={result.periods.map((period) => {
                      const costItems = {};
                      const expenseItems = {};
                      period.costOfSales.forEach((item) => {
                        costItems[`cos_${item.id}`] = item.amount;
                      });
                      period.expenses.forEach((item) => {
                        expenseItems[`exp_${item.id}`] = item.amount;
                      });
                      return {
                        name: period.label,
                        ...costItems,
                        ...expenseItems,
                      };
                    })}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" allowDataOverflow={false} hide={false} scale="auto" xAxisId={0} />
                    <YAxis allowDataOverflow={false} hide={false} scale="auto" yAxisId={0} orientation="left" width={60} />
                    <Tooltip
                      formatter={(value) => formatCurrency(value as number)}
                    />
                    <Legend />
                    {result.periods[0].costOfSales.map((item, index) => (
                      <Bar
                        key={item.id}
                        dataKey={`cos_${item.id}`}
                        name={`Cost: ${item.name}`}
                        fill={`hsl(${index * 30}, 80%, 40%)`}
                      />
                    ))}
                    {result.periods[0].expenses.map((item, index) => (
                      <Bar
                        key={item.id}
                        dataKey={`exp_${item.id}`}
                        name={`Expense: ${item.name}`}
                        fill={`hsl(${index * 30 + 200}, 70%, 50%)`}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-6">
                <div className="overflow-x-auto">
                  <h3 className="text-lg font-medium mb-2">Cost of Sales</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cost Item</TableHead>
                        {result.periods.map((period) => (
                          <TableHead key={period.period}>{period.label}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.periods[0].costOfSales.map((costItem) => (
                        <TableRow key={costItem.id}>
                          <TableCell className="font-medium">
                            {costItem.name}
                          </TableCell>
                          {result.periods.map((period) => {
                            const item = period.costOfSales.find(
                              (item) => item.id === costItem.id
                            );
                            return (
                              <TableCell key={period.period}>
                                {item ? formatCurrency(item.amount) : "$0"}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                      <TableRow className="font-semibold">
                        <TableCell>Total Cost of Sales</TableCell>
                        {result.periods.map((period) => (
                          <TableCell key={period.period}>
                            {formatCurrency(
                              period.costOfSales.reduce(
                                (sum, item) => sum + item.amount,
                                0
                              )
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div className="overflow-x-auto">
                  <h3 className="text-lg font-medium mb-2">Operating Expenses</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Expense Item</TableHead>
                        {result.periods.map((period) => (
                          <TableHead key={period.period}>{period.label}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.periods[0].expenses.map((expenseItem) => (
                        <TableRow key={expenseItem.id}>
                          <TableCell className="font-medium">
                            {expenseItem.name}
                          </TableCell>
                          {result.periods.map((period) => {
                            const item = period.expenses.find(
                              (item) => item.id === expenseItem.id
                            );
                            return (
                              <TableCell key={period.period}>
                                {item ? formatCurrency(item.amount) : "$0"}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                      <TableRow className="font-semibold">
                        <TableCell>Total Expenses</TableCell>
                        {result.periods.map((period) => (
                          <TableCell key={period.period}>
                            {formatCurrency(
                              period.expenses.reduce(
                                (sum, item) => sum + item.amount,
                                0
                              )
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="profit">
            <div className="space-y-6">
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={marginData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" allowDataOverflow={false} hide={false} scale="auto" xAxisId={0} />
                    <YAxis allowDataOverflow={false} hide={false} scale="auto" yAxisId={0} orientation="left" width={60} />
                    <Tooltip
                      formatter={(value) => `${value.toFixed(2)}%`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="grossMargin"
                      stroke="#82ca9d"
                      name="Gross Margin %"
                    />
                    <Line
                      type="monotone"
                      dataKey="netMargin"
                      stroke="#ffc658"
                      name="Net Margin %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-x-auto">
                <h3 className="text-lg font-medium mb-2">Profit Summary</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Metric</TableHead>
                      {result.periods.map((period) => (
                        <TableHead key={period.period}>{period.label}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Revenue</TableCell>
                      {result.periods.map((period) => {
                        const total = period.revenue.reduce(
                          (sum, item) => sum + item.amount,
                          0
                        );
                        return (
                          <TableCell key={period.period}>
                            {formatCurrency(total)}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Cost of Sales</TableCell>
                      {result.periods.map((period) => {
                        const total = period.costOfSales.reduce(
                          (sum, item) => sum + item.amount,
                          0
                        );
                        return (
                          <TableCell key={period.period}>
                            {formatCurrency(total)}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Gross Profit</TableCell>
                      {result.periods.map((period) => (
                        <TableCell key={period.period}>
                          {formatCurrency(period.grossProfit)}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Gross Margin %</TableCell>
                      {result.periods.map((period) => {
                        const total = period.revenue.reduce(
                          (sum, item) => sum + item.amount,
                          0
                        );
                        const margin = (period.grossProfit / total) * 100;
                        return (
                          <TableCell key={period.period}>
                            {margin.toFixed(2)}%
                          </TableCell>
                        );
                      })}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Operating Expenses</TableCell>
                      {result.periods.map((period) => {
                        const total = period.expenses.reduce(
                          (sum, item) => sum + item.amount,
                          0
                        );
                        return (
                          <TableCell key={period.period}>
                            {formatCurrency(total)}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Net Income</TableCell>
                      {result.periods.map((period) => (
                        <TableCell key={period.period}>
                          {formatCurrency(period.netIncome)}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Net Margin %</TableCell>
                      {result.periods.map((period) => {
                        const total = period.revenue.reduce(
                          (sum, item) => sum + item.amount,
                          0
                        );
                        const margin = (period.netIncome / total) * 100;
                        return (
                          <TableCell key={period.period}>
                            {margin.toFixed(2)}%
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
