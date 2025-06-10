import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ScenarioCreator } from "components/ScenarioCreator";
import { PageHeader } from 'components/PageHeader';
import { ScenarioList } from "components/ScenarioList";
import { ScenarioImpactAnalysis } from "components/ScenarioImpactAnalysis";
import { AdvancedScenarioAnalysis } from "components/AdvancedScenarioAnalysis";
import { ScenarioComparison } from "components/ScenarioComparison";
import { GitCompare } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ScenarioModeling = () => {
  const [activeTab, setActiveTab] = useState("templates");
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
  const navigate = useNavigate();
  
  const handleSelectScenarioForComparison = (scenarioId: string) => {
    if (selectedScenarios.includes(scenarioId)) {
      setSelectedScenarios(selectedScenarios.filter(id => id !== scenarioId));
    } else {
      setSelectedScenarios([...selectedScenarios, scenarioId]);
    }
  };

  return (
    <div className="container py-6 space-y-6">
      <PageHeader 
        title="Scenario Modeling" 
        description="Model the impact of economic changes on your business"
        actions={
          <Button 
            variant="outline" 
            onClick={() => navigate('/ScenarioComparison')}
          >
            <GitCompare className="h-4 w-4 mr-2" />
            Advanced Comparison
          </Button>
        }
      />
      
      <Alert>
        <AlertDescription>
          Scenario modeling helps you understand how changes in economic factors could affect your business.
          Create scenarios based on our templates or build your own custom scenarios.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates">Scenario Templates</TabsTrigger>
          <TabsTrigger value="custom">Custom Scenarios</TabsTrigger>
          <TabsTrigger value="analysis">Impact Analysis</TabsTrigger>
          <TabsTrigger value="comparison">Scenario Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Scenario Templates</CardTitle>
              <CardDescription>
                Start with pre-built scenarios relevant to Australian businesses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScenarioList isTemplates={true} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Scenario</CardTitle>
              <CardDescription>
                Build a custom scenario to model specific economic changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScenarioCreator />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Scenario Impact Analysis</CardTitle>
              <CardDescription>
                Analyze the potential impact of scenarios on your business
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScenarioImpactAnalysis />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Advanced Analysis Tools</CardTitle>
              <CardDescription>
                Use sensitivity analysis and Monte Carlo simulations for deeper scenario insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdvancedScenarioAnalysis />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle>Scenario Comparison</CardTitle>
              <CardDescription>
                Compare multiple scenarios side-by-side to evaluate their impact on key financial metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScenarioComparison initialScenarioIds={selectedScenarios} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScenarioModeling;
