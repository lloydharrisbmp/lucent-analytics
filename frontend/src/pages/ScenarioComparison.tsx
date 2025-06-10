import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PageHeader } from 'components/PageHeader';
import { ScenarioComparison as ScenarioComparisonComponent } from "components/ScenarioComparison";
import { ScenarioImpactHeatmap } from "components/ScenarioImpactHeatmap";
import { ProbabilityDistributionChart } from "components/ProbabilityDistributionChart";
import { ScenarioInsightsSummary } from "components/ScenarioInsightsSummary";
import { Download, FileSpreadsheet, FileText, Share2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";

export default function ScenarioComparison() {
  const [activeTab, setActiveTab] = useState("sideBySide");
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader 
        title="Scenario Comparison" 
        description="Compare multiple scenarios to evaluate their impact on your business"
        actions={
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-56">
                <div className="grid gap-1">
                  <Button 
                    variant="ghost" 
                    className="flex justify-start text-sm"
                    onClick={() => {
                      toast.success("Exported to Excel", {
                        description: "Scenario comparison data has been exported to Excel"
                      });
                    }}
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Export to Excel
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="flex justify-start text-sm"
                    onClick={() => {
                      toast.success("Exported to PDF", {
                        description: "Scenario comparison report has been generated"
                      });
                    }}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Export to PDF
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        }
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
          <CardDescription>
            Summary of important findings from scenario comparison
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-6">
            Select scenarios in the comparison tool below to generate insights
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Multi-Scenario Analysis</CardTitle>
          <CardDescription>
            Select and compare different scenarios side-by-side to identify optimal strategies
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <ScenarioComparisonComponent />
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Business Impact Analysis</CardTitle>
            <CardDescription>
              Visualize the impact of different scenarios on business units
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-10">
              Select scenarios in the comparison tool above to visualize business impacts
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Financial Impact Summary</CardTitle>
            <CardDescription>
              Key financial metrics comparison across selected scenarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-10">
              Select scenarios in the comparison tool above to visualize financial impacts
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Probability Distribution Analysis</CardTitle>
          <CardDescription>
            Understand the range of possible outcomes for each scenario
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-10">
            Select scenarios in the comparison tool above to visualize probability distributions
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
