import React from "react";
import DashboardLayout from 'components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Visualizations() {
  return (
    <DashboardLayout>
      <div className="flex items-center mb-8">
        <h1 className="text-3xl font-bold">Visualizations</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
            <CardDescription>Visualize revenue by category</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center border border-dashed rounded-md">
            <p className="text-muted-foreground">Revenue pie chart will appear here</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Expense Distribution</CardTitle>
            <CardDescription>Visualize expenses by category</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center border border-dashed rounded-md">
            <p className="text-muted-foreground">Expense pie chart will appear here</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
            <CardDescription>Track financial performance over time</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center border border-dashed rounded-md">
            <p className="text-muted-foreground">Trend line chart will appear here</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Forecast vs. Actual</CardTitle>
            <CardDescription>Compare projections with actual results</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center border border-dashed rounded-md">
            <p className="text-muted-foreground">Comparison bar chart will appear here</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
