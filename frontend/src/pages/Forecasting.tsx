import React, { useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ForecastScenario, ForecastAssumption } from "../utils/financial-types";
import { generateForecastResults } from "../utils/financial-data";
import { ScenarioManager } from "components/ScenarioManager";
import { ForecastAssumptionsEditor } from "components/ForecastAssumptionsEditor";
import { ForecastResults } from "components/ForecastResults";

export default function Forecasting() {
  const [selectedScenario, setSelectedScenario] = useState<ForecastScenario | null>(null);
  const [currentAssumptions, setCurrentAssumptions] = useState<ForecastAssumption[]>([]);
  const [isProjectionsVisible, setIsProjectionsVisible] = useState(false);
  const [forecastResult, setForecastResult] = useState(null);

  const handleSelectScenario = (scenario: ForecastScenario) => {
    setSelectedScenario(scenario);
    setCurrentAssumptions(scenario.assumptions);
    setIsProjectionsVisible(false); // Hide projections when selecting a new scenario
  };

  const handleAssumptionsChange = (assumptions: ForecastAssumption[]) => {
    setCurrentAssumptions(assumptions);
  };

  const generateForecast = () => {
    if (selectedScenario) {
      const scenarioWithUpdatedAssumptions = {
        ...selectedScenario,
        assumptions: currentAssumptions,
      };
      const result = generateForecastResults(scenarioWithUpdatedAssumptions);
      setForecastResult(result);
      setIsProjectionsVisible(true);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center mb-8 justify-between">
        <h1 className="text-3xl font-bold">Financial Forecasting</h1>
      </div>
      
      <Tabs defaultValue="scenarios" className="w-full space-y-8">
        <TabsList className="mb-6">
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="projections">Projections</TabsTrigger>
        </TabsList>
        
        <TabsContent value="scenarios" className="space-y-8">
          <ScenarioManager 
            onSelectScenario={handleSelectScenario} 
            selectedScenarioId={selectedScenario?.id} 
          />
          
          {selectedScenario && (
            <div className="space-y-8">
              <ForecastAssumptionsEditor 
                scenario={selectedScenario}
                onAssumptionsChange={handleAssumptionsChange}
              />
              
              <div className="flex justify-end">
                <Button onClick={generateForecast} size="lg">
                  Generate Forecast
                </Button>
              </div>
            </div>
          )}
          
          {!selectedScenario && (
            <Alert>
              <AlertTitle>No scenario selected</AlertTitle>
              <AlertDescription>
                Please select a forecast scenario from the list above to begin working with assumptions
                and generating projections.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
        
        <TabsContent value="projections">
          {forecastResult && isProjectionsVisible ? (
            <ForecastResults result={forecastResult} />
          ) : (
            <Alert>
              <AlertTitle>No projections available</AlertTitle>
              <AlertDescription>
                Please select a scenario and generate a forecast to view projections. You can do this
                from the Scenarios tab.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
