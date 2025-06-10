import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

export interface ScenarioCreatorProps {
  onScenarioCreated?: (scenarioId: string) => void;
}

export const ScenarioCreator: React.FC<ScenarioCreatorProps> = ({ onScenarioCreated }) => {
  const [scenarioType, setScenarioType] = useState<string>("");
  const [timeHorizon, setTimeHorizon] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [parameters, setParameters] = useState<Array<any>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // These would be fetched from the API in a real implementation
  const scenarioTypes = [
    { value: "interest_rate", label: "Interest Rate Changes" },
    { value: "exchange_rate", label: "Exchange Rate Fluctuations" },
    { value: "inflation", label: "Inflation Rate Changes" },
    { value: "market_demand", label: "Market Demand Shifts" },
    { value: "supply_chain", label: "Supply Chain Disruptions" },
    { value: "custom", label: "Custom Scenario" },
  ];

  const horizons = [
    { value: "short_term", label: "Short Term (0-6 months)" },
    { value: "medium_term", label: "Medium Term (6-18 months)" },
    { value: "long_term", label: "Long Term (18+ months)" },
  ];

  const getDefaultParameters = (type: string) => {
    switch (type) {
      case "interest_rate":
        return [
          {
            name: "RBA Cash Rate",
            description: "Reserve Bank of Australia Cash Rate",
            current_value: 4.35,
            min_value: 3.0,
            max_value: 8.0,
            unit: "%",
            step_size: 0.25
          }
        ];
      case "exchange_rate":
        return [
          {
            name: "AUD/USD Exchange Rate",
            description: "Australian Dollar to US Dollar Exchange Rate",
            current_value: 0.65,
            min_value: 0.50,
            max_value: 0.80,
            unit: "USD",
            step_size: 0.01,
            base_currency: "AUD",
            target_currency: "USD"
          }
        ];
      case "inflation":
        return [
          {
            name: "CPI Inflation Rate",
            description: "Consumer Price Index Annual Inflation Rate",
            current_value: 3.4,
            min_value: 0.0,
            max_value: 10.0,
            unit: "%",
            step_size: 0.1,
            category: "CPI"
          }
        ];
      default:
        return [];
    }
  };

  const handleScenarioTypeChange = (value: string) => {
    setScenarioType(value);
    setParameters(getDefaultParameters(value));
  };

  const handleParameterChange = (index: number, field: string, value: any) => {
    const updatedParameters = [...parameters];
    updatedParameters[index] = { ...updatedParameters[index], [field]: value };
    setParameters(updatedParameters);
  };

  const handleSubmit = async () => {
    if (!name || !description || !scenarioType || !timeHorizon) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      // This would be a real API call in a production implementation
      // const response = await brain.create_scenario({
      //   name,
      //   description,
      //   scenario_type: scenarioType,
      //   time_horizon: timeHorizon,
      //   parameters,
      //   sector_impacts: [],
      //   organization_id: "org123" // This would come from context or state
      // });
      
      // Mock response
      setTimeout(() => {
        const mockScenarioId = `scenario-${Math.floor(Math.random() * 1000)}`;
        
        toast.success("Scenario created successfully");
        if (onScenarioCreated) {
          onScenarioCreated(mockScenarioId);
        }
        
        // Reset form
        setName("");
        setDescription("");
        setScenarioType("");
        setTimeHorizon("");
        setParameters([]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error creating scenario:", error);
      toast.error("Failed to create scenario");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Scenario Name</Label>
          <Input
            id="name"
            placeholder="e.g., RBA Rate Hike Q2 2025"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="scenario-type">Scenario Type</Label>
          <Select value={scenarioType} onValueChange={handleScenarioTypeChange}>
            <SelectTrigger id="scenario-type">
              <SelectValue placeholder="Select scenario type" />
            </SelectTrigger>
            <SelectContent>
              {scenarioTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe the scenario and its potential impacts"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="time-horizon">Time Horizon</Label>
        <Select value={timeHorizon} onValueChange={setTimeHorizon}>
          <SelectTrigger id="time-horizon">
            <SelectValue placeholder="Select time horizon" />
          </SelectTrigger>
          <SelectContent>
            {horizons.map((horizon) => (
              <SelectItem key={horizon.value} value={horizon.value}>
                {horizon.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {parameters.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Scenario Parameters</h3>
          
          {parameters.map((param, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <Label>{param.name}</Label>
                    <p className="text-sm text-muted-foreground">{param.description}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">{param.min_value}{param.unit}</span>
                      <span className="font-medium">{param.current_value}{param.unit}</span>
                      <span className="text-sm">{param.max_value}{param.unit}</span>
                    </div>
                    <Slider 
                      min={param.min_value} 
                      max={param.max_value} 
                      step={param.step_size}
                      value={[param.current_value]}
                      onValueChange={(values) => handleParameterChange(index, "current_value", values[0])}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
        {isLoading ? "Creating Scenario..." : "Create Scenario"}
      </Button>
    </div>
  );
};
