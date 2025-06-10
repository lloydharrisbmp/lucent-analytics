import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface ScenarioListProps {
  isTemplates?: boolean;
}

export const ScenarioList: React.FC<ScenarioListProps> = ({ isTemplates = false }) => {
  // These would be fetched from the API in a real implementation
  const mockScenarios = isTemplates ? [
    // Template scenarios
    {
      id: "template-interest-rate-hike",
      name: "RBA Interest Rate Hike",
      description: "Model the impact of a Reserve Bank of Australia interest rate increase on your business",
      scenario_type: "interest_rate",
      time_horizon: "medium_term",
    },
    {
      id: "template-aud-depreciation",
      name: "AUD Depreciation",
      description: "Analyze the effects of Australian dollar depreciation on import costs and export revenues",
      scenario_type: "exchange_rate",
      time_horizon: "short_term",
    },
    {
      id: "template-inflation-surge",
      name: "Inflation Surge",
      description: "Evaluate how higher inflation rates would impact costs, pricing, and margins",
      scenario_type: "inflation",
      time_horizon: "medium_term",
    },
    {
      id: "template-supply-chain-disruption",
      name: "Supply Chain Disruption",
      description: "Assess the impact of global supply chain disruptions on inventory and operations",
      scenario_type: "supply_chain",
      time_horizon: "short_term",
    },
  ] : [
    // Custom scenarios (would be empty if none created yet)
    {
      id: "scenario-123",
      name: "Custom Interest Rate Scenario",
      description: "Our custom scenario for Q3 planning with 5.5% interest rates",
      scenario_type: "interest_rate",
      time_horizon: "medium_term",
      created_at: "2025-04-15T10:30:00Z",
    }
  ];

  const getScenarioTypeBadge = (type: string) => {
    const types: Record<string, { label: string, variant: "default" | "outline" | "secondary" | "destructive" }> = {
      "interest_rate": { label: "Interest Rate", variant: "default" },
      "exchange_rate": { label: "Exchange Rate", variant: "secondary" },
      "inflation": { label: "Inflation", variant: "outline" },
      "market_demand": { label: "Market Demand", variant: "default" },
      "supply_chain": { label: "Supply Chain", variant: "destructive" },
      "custom": { label: "Custom", variant: "outline" },
    };
    
    const typeConfig = types[type] || { label: type, variant: "outline" };
    
    return (
      <Badge variant={typeConfig.variant}>{typeConfig.label}</Badge>
    );
  };

  const getTimeHorizonBadge = (horizon: string) => {
    const horizons: Record<string, { label: string, variant: "default" | "outline" | "secondary" }> = {
      "short_term": { label: "0-6 months", variant: "outline" },
      "medium_term": { label: "6-18 months", variant: "secondary" },
      "long_term": { label: "18+ months", variant: "default" },
    };
    
    const horizonConfig = horizons[horizon] || { label: horizon, variant: "outline" };
    
    return (
      <Badge variant={horizonConfig.variant}>{horizonConfig.label}</Badge>
    );
  };

  const handleUseTemplate = (templateId: string) => {
    console.log(`Using template ${templateId}`);
    // In a real implementation, this would navigate to scenario creation with template pre-filled
  };

  const handleRunAnalysis = (scenarioId: string) => {
    console.log(`Running analysis for ${scenarioId}`);
    // In a real implementation, this would navigate to the analysis tab with this scenario selected
  };

  return (
    <div className="space-y-4">
      {mockScenarios.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          {isTemplates 
            ? "No scenario templates available" 
            : "You haven't created any custom scenarios yet"}
        </p>
      ) : (
        mockScenarios.map((scenario) => (
          <Card key={scenario.id}>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-2">
                  <h3 className="font-medium text-lg">{scenario.name}</h3>
                  <p className="text-muted-foreground mt-1">{scenario.description}</p>
                  
                  {!isTemplates && scenario.created_at && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Created: {new Date(scenario.created_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {getScenarioTypeBadge(scenario.scenario_type)}
                    {getTimeHorizonBadge(scenario.time_horizon)}
                  </div>
                </div>
                
                <div className="flex items-center justify-end space-x-2">
                  {isTemplates ? (
                    <Button onClick={() => handleUseTemplate(scenario.id)}>
                      Use Template
                    </Button>
                  ) : (
                    <Button onClick={() => handleRunAnalysis(scenario.id)}>
                      Run Analysis
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};
