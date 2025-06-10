import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { AlertCircle, ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface ScenarioImpactAnalysisProps {
  scenarioId?: string;
}

export const ScenarioImpactAnalysis: React.FC<ScenarioImpactAnalysisProps> = ({ scenarioId: initialScenarioId }) => {
  const [scenarioId, setScenarioId] = useState<string | undefined>(initialScenarioId);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<string>("financial");
  
  // This would be fetched from the API in a real implementation
  const mockScenarios = [
    { id: "scenario-123", name: "Custom Interest Rate Scenario" },
    { id: "template-interest-rate-hike", name: "RBA Interest Rate Hike" },
    { id: "template-aud-depreciation", name: "AUD Depreciation" },
  ];

  const handleRunAnalysis = async () => {
    if (!scenarioId) return;
    
    setIsLoading(true);
    
    try {
      // This would be a real API call in a production implementation
      // const response = await brain.calculate_scenario_impact({
      //   scenario_id: scenarioId,
      //   organization_id: "org123" // This would come from context or state
      // });
      // setResults(await response.json());
      
      // Mock response
      setTimeout(() => {
        setResults({
          scenario_id: scenarioId,
          scenario_name: mockScenarios.find(s => s.id === scenarioId)?.name || "Unknown Scenario",
          financial_impacts: {
            "revenue": -2.5,  // Percentage change
            "ebitda": -3.8,
            "cash_flow": -4.2,
            "debt_servicing_cost": 15.0,
            "gross_margin": -1.8
          },
          business_unit_impacts: {
            "retail": {"revenue": -3.1, "margin": -1.5},
            "wholesale": {"revenue": -2.0, "margin": -0.8},
            "manufacturing": {"revenue": -1.2, "margin": -2.2},
            "services": {"revenue": -1.8, "margin": -1.0}
          },
          risk_level: 0.65,
          opportunity_level: 0.25,
          recommended_actions: [
            "Review debt structure to minimize impact of rate increases",
            "Consider hedging strategies for variable rate loans",
            "Evaluate pricing strategy to maintain margins",
            "Focus on customer retention to mitigate revenue impact"
          ]
        });
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error running scenario analysis:", error);
      setIsLoading(false);
    }
  };

  // Format financial impact data for charts
  const formatFinancialData = (financialImpacts: Record<string, number>) => {
    return Object.entries(financialImpacts).map(([metric, value]) => ({
      metric: formatMetricName(metric),
      impact: value,
      fill: value >= 0 ? "#22c55e" : "#ef4444"
    }));
  };

  // Format business unit data for charts
  const formatBusinessUnitData = (businessUnitImpacts: Record<string, Record<string, number>>) => {
    // Transform into format suitable for stacked bar chart
    return Object.keys(businessUnitImpacts[Object.keys(businessUnitImpacts)[0]] || {}).map(metric => {
      const data: any = { metric: formatMetricName(metric) };
      
      Object.entries(businessUnitImpacts).forEach(([unit, impacts]) => {
        data[unit] = impacts[metric];
      });
      
      return data;
    });
  };

  // Helper to format metric names for display
  const formatMetricName = (metric: string) => {
    const words = metric.split('_');
    return words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Compute bar colors based on value
  const getBarColor = (value: number) => {
    return value >= 0 ? "#22c55e" : "#ef4444";
  };

  // Render risk/opportunity indicators
  const renderRiskOpportunityIndicators = () => {
    if (!results) return null;
    
    const { risk_level, opportunity_level } = results;
    
    return (
      <div className="grid grid-cols-2 gap-4 mt-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="text-red-500" />
              <h3 className="font-medium">Risk Level</h3>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-red-500 h-2.5 rounded-full" 
                  style={{ width: `${risk_level * 100}%` }}
                ></div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {risk_level < 0.3 ? "Low" : risk_level < 0.7 ? "Medium" : "High"} risk exposure
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Lightbulb className="text-green-500" />
              <h3 className="font-medium">Opportunity Level</h3>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-green-500 h-2.5 rounded-full" 
                  style={{ width: `${opportunity_level * 100}%` }}
                ></div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {opportunity_level < 0.3 ? "Limited" : opportunity_level < 0.7 ? "Moderate" : "Significant"} opportunities
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Render recommended actions
  const renderRecommendedActions = () => {
    if (!results?.recommended_actions?.length) return null;
    
    return (
      <div className="mt-6">
        <h3 className="font-medium text-lg mb-3">Recommended Actions</h3>
        <ul className="space-y-2">
          {results.recommended_actions.map((action: string, index: number) => (
            <li key={index} className="flex items-start">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary mr-2 mt-0.5 text-sm">
                {index + 1}
              </span>
              <span>{action}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex-1 space-y-2">
          <Label htmlFor="scenario-select">Select Scenario</Label>
          <Select value={scenarioId} onValueChange={setScenarioId}>
            <SelectTrigger id="scenario-select">
              <SelectValue placeholder="Choose a scenario to analyze" />
            </SelectTrigger>
            <SelectContent>
              {mockScenarios.map((scenario) => (
                <SelectItem key={scenario.id} value={scenario.id}>
                  {scenario.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleRunAnalysis} disabled={!scenarioId || isLoading}>
          {isLoading ? "Analyzing..." : "Run Analysis"}
        </Button>
      </div>

      {results && (
        <div className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Impact Analysis: {results.scenario_name}</h2>
            <div className="flex space-x-2">
              <Badge 
                variant="outline" 
                className="cursor-pointer"
                onClick={() => setActiveTab("financial")}
              >
                Financial Impact
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer"
                onClick={() => setActiveTab("business")}
              >
                Business Units
              </Badge>
            </div>
          </div>
          
          {activeTab === "financial" && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-4">Projected Financial Impact (%)</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={formatFinancialData(results.financial_impacts)}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 150, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tickFormatter={(value) => `${value}%`} />
                      <YAxis dataKey="metric" type="category" width={150} />
                      <Tooltip formatter={(value) => [`${value}%`, "Impact"]} />
                      <Bar dataKey="impact" fill="#8884d8" name="Impact (%)" radius={[0, 4, 4, 0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
          
          {activeTab === "business" && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-4">Business Unit Impact (%)</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={formatBusinessUnitData(results.business_unit_impacts)}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tickFormatter={(value) => `${value}%`} />
                      <YAxis dataKey="metric" type="category" width={100} />
                      <Tooltip formatter={(value) => [`${value}%`, "Impact"]} />
                      <Legend />
                      {Object.keys(results.business_unit_impacts).map((unit, index) => (
                        <Bar 
                          key={unit} 
                          dataKey={unit} 
                          name={formatMetricName(unit)}
                          fill={`hsl(${index * 50}, 70%, 50%)`}
                          radius={[0, 4, 4, 0]}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
          
          {renderRiskOpportunityIndicators()}
          {renderRecommendedActions()}
        </div>
      )}

      {!results && !isLoading && (
        <div className="text-center py-12 text-muted-foreground">
          Select a scenario and run analysis to see projected impacts
        </div>
      )}
    </div>
  );
};
