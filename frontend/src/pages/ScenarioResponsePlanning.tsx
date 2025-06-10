import React, { useState, useEffect } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Info } from "lucide-react";
import { StrategicRecommendations } from "components/StrategicRecommendations";
import { toast } from "sonner";

export default function ScenarioResponsePlanning() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | undefined>();
  const [scenarioResults, setScenarioResults] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [scenariosLoading, setScenariosLoading] = useState(true);

  // Fetch available scenarios on component mount
  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        setScenariosLoading(true);
        const response = await brain.list_scenario_templates();
        const data = await response.json();
        setScenarios(data);
        setScenariosLoading(false);
        
        // If no scenarios are returned, fall back to mock data
        if (!data || data.length === 0) {
          setScenarios([{
            id: "scenario-123",
            name: "Custom Interest Rate Scenario"
          },{
            id: "template-interest-rate-hike",
            name: "RBA Interest Rate Hike"
          },{
            id: "template-aud-depreciation",
            name: "AUD Depreciation"
          },{
            id: "template-labor-cost-increase",
            name: "Labor Cost Increase"
          },{
            id: "template-supply-chain-disruption",
            name: "Supply Chain Disruption"
          }]);
          setScenariosLoading(false);
        }
      } catch (error) {
        console.error("Error fetching scenarios:", error);
        toast.error("Failed to load scenarios");
        setScenariosLoading(false);
      }
    };

    fetchScenarios();
  }, []);

  // Fetch scenario results when a scenario is selected
  const fetchScenarioResults = async (scenarioId: string) => {
    if (!scenarioId) return;

    setIsLoading(true);
    setScenarioResults(null);

    try {
      const response = await brain.calculate_scenario_impact_v2({
        scenario_id: scenarioId,
        organization_id: "org123" // This would come from context or state in real app
      });
      const data = await response.json();
      setScenarioResults(data);
      setIsLoading(false);
      
      // If we don't get data back, fallback to mock data
      if (!data) {
        const scenario = scenarios.find(s => s.id === scenarioId);
        
        const mockResults = {
          scenario_id: scenarioId,
          scenario_name: scenario?.name || "Unknown Scenario",
          financial_impacts: {
            revenue: Math.random() * 1000000 + 500000,
            ebitda: Math.random() * 200000 + 100000,
            net_profit: Math.random() * 150000 + 50000,
            cash_flow: Math.random() * 300000 + 150000,
            gross_margin: Math.random() * 0.15 + 0.3, // as percentage
            debt_servicing_cost: Math.random() * 50000 + 20000,
            working_capital: Math.random() * 400000 + 200000
          },
          business_unit_impacts: {
            operations: { impact: Math.random() * 0.2 - 0.1 },
            finance: { impact: Math.random() * 0.2 - 0.1 },
            sales: { impact: Math.random() * 0.2 - 0.1 },
            marketing: { impact: Math.random() * 0.2 - 0.1 },
            hr: { impact: Math.random() * 0.2 - 0.1 }
          },
          risk_level: Math.random() * 0.8 + 0.2, // 0.2 to 1.0
          opportunity_level: Math.random() * 0.8 + 0.2 // 0.2 to 1.0
        };

        setScenarioResults(mockResults);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching scenario results:", error);
      toast.error("Failed to fetch scenario results");
      setIsLoading(false);
    }
  };

  const handleScenarioChange = (scenarioId: string) => {
    setSelectedScenarioId(scenarioId);
    fetchScenarioResults(scenarioId);
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Strategic Response Planning</h1>
      </div>

      <div className="space-y-8">
        {/* Scenario Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Scenario</CardTitle>
            <CardDescription>
              Choose a scenario to generate strategic responses and action plans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4 items-end">
              <div className="flex-1">
                <Select
                  value={selectedScenarioId}
                  onValueChange={handleScenarioChange}
                  disabled={scenariosLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a scenario" />
                  </SelectTrigger>
                  <SelectContent>
                    {scenarios.map((scenario) => (
                      <SelectItem key={scenario.id} value={scenario.id}>
                        {scenario.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button variant="outline" onClick={() => {
                if (selectedScenarioId) {
                  fetchScenarioResults(selectedScenarioId);
                }
              }}>
                Refresh Analysis
              </Button>
            </div>

            {scenariosLoading && (
              <div className="mt-4">
                <Skeleton className="h-10 w-full" />
              </div>
            )}
            
            {!selectedScenarioId && !scenariosLoading && (
              <Alert className="mt-4">
                <Info className="h-4 w-4" />
                <AlertTitle>No scenario selected</AlertTitle>
                <AlertDescription>
                  Please select a scenario from the dropdown above to begin strategic response planning.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Strategic Recommendations Component */}
        {selectedScenarioId && (
          <StrategicRecommendations 
            scenarioId={selectedScenarioId} 
            scenarioResults={scenarioResults} 
          />
        )}
      </div>
    </DashboardLayout>
  );
}
