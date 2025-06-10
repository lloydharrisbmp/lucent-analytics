import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AdvancedScenarioAnalysis as AdvancedScenarioAnalysisComponent } from "components/AdvancedScenarioAnalysis";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdvancedScenarioAnalysis = () => {
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advanced Scenario Analysis</h1>
          <p className="text-muted-foreground mt-1">
            Perform sensitivity analysis and Monte Carlo simulations for sophisticated economic modeling
          </p>
        </div>
      </div>

      <Separator className="my-6" />

      <Tabs defaultValue="advanced" className="space-y-4">
        <TabsList>
          <TabsTrigger value="advanced">Advanced Analysis Tools</TabsTrigger>
          <TabsTrigger value="sensitivity">Sensitivity Analysis</TabsTrigger>
          <TabsTrigger value="monte-carlo">Monte Carlo Simulation</TabsTrigger>
        </TabsList>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enhanced Scenario Calculation</CardTitle>
              <CardDescription>
                Combined analysis with sensitivity testing and probability simulations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdvancedScenarioAnalysisComponent />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sensitivity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Parameter Sensitivity Analysis</CardTitle>
              <CardDescription>
                Test how varying individual parameters affects your financial outcomes
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-6">
                <p>Sensitivity analysis helps you understand which factors have the greatest impact on your business. This analysis:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Identifies which variables your business outcomes are most sensitive to</li>
                  <li>Shows how changes in key parameters affect financial metrics</li>
                  <li>Helps prioritize risk management and optimization efforts</li>
                  <li>Visualizes relationships between inputs and outputs with tornado charts</li>
                </ul>
              </div>
              <AdvancedScenarioAnalysisComponent />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monte-carlo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Probabilistic Scenario Modeling</CardTitle>
              <CardDescription>
                Run thousands of simulations to generate probability distributions of outcomes
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-6">
                <p>Monte Carlo simulation allows you to understand the range and likelihood of possible outcomes by running thousands of scenarios with random variations. This powerful technique:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Creates realistic probability distributions for all key metrics</li>
                  <li>Accounts for uncertainty in multiple variables simultaneously</li>
                  <li>Calculates the likelihood of specific outcomes and thresholds</li>
                  <li>Supports better decision-making by showing confidence intervals</li>
                </ul>
              </div>
              <AdvancedScenarioAnalysisComponent />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedScenarioAnalysis;
