import React from "react";
import DashboardLayout from "components/DashboardLayout";
import { GrantROICalculator } from "components/GrantROICalculator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { ChevronRight, Calculator, Lightbulb } from "lucide-react";

export default function GrantRoiAnalysis() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <Breadcrumb>
            <BreadcrumbItem>
              <BreadcrumbLink href="/government-grants">Government Grants</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href="/grant-roi-analysis">ROI Analysis</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
          
          <h1 className="text-3xl font-bold">Grant ROI Analysis & Optimization</h1>
          <p className="text-muted-foreground">
            Analyze the return on investment for grant applications and optimize your grant strategy
          </p>
        </div>

        <Card>
          <CardHeader className="bg-muted/40">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Cost-Benefit Analysis Tools</CardTitle>
            </div>
            <CardDescription>
              Make data-driven decisions about which grants to pursue based on potential return on investment, 
              workload requirements, and optimization of your limited resources.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm">
                <strong>ROI Calculator:</strong> Assess the potential return on investment for specific grant 
                applications, taking into account funding amount, success probability, and application costs.
              </p>
              <p className="text-sm">
                <strong>Strategy Optimizer:</strong> Compare multiple grants and receive recommendations on which 
                grants to prioritize based on your available time, budget, and optimization preferences.
              </p>
            </div>
          </CardContent>
        </Card>

        <GrantROICalculator />
      </div>
    </DashboardLayout>
  );
}
