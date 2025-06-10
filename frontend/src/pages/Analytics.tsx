import React from "react";
import DashboardLayout from 'components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Analytics() {
  return (
    <DashboardLayout>
      <div className="flex items-center mb-8">
        <h1 className="text-3xl font-bold">Analytics</h1>
      </div>
      
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="kpis">KPIs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>Detailed business performance metrics</CardDescription>
            </CardHeader>
            <CardContent className="h-[600px] flex items-center justify-center border border-dashed rounded-md">
              <p className="text-muted-foreground">Performance charts will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="kpis">
          <Card>
            <CardHeader>
              <CardTitle>Key Performance Indicators</CardTitle>
              <CardDescription>Track your most important metrics</CardDescription>
            </CardHeader>
            <CardContent className="h-[600px] flex items-center justify-center border border-dashed rounded-md">
              <p className="text-muted-foreground">KPI dashboard will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
