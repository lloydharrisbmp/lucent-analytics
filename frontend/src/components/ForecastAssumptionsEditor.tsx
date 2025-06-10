import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ForecastAssumption, ForecastModel, ForecastScenario } from "../utils/financial-types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ForecastAssumptionsEditorProps {
  scenario: ForecastScenario;
  onAssumptionsChange: (assumptions: ForecastAssumption[]) => void;
}

export function ForecastAssumptionsEditor({
  scenario,
  onAssumptionsChange,
}: ForecastAssumptionsEditorProps) {
  const [assumptions, setAssumptions] = useState<ForecastAssumption[]>(
    scenario.assumptions
  );

  const handleGrowthTypeChange = (assumption: ForecastAssumption, value: string) => {
    const updatedAssumptions = assumptions.map((a) => {
      if (a.id === assumption.id) {
        return {
          ...a,
          growthType: value as ForecastModel,
        };
      }
      return a;
    });
    setAssumptions(updatedAssumptions);
    onAssumptionsChange(updatedAssumptions);
  };

  const handleGrowthRateChange = (assumption: ForecastAssumption, value: string) => {
    const numericValue = parseFloat(value) || 0;
    const updatedAssumptions = assumptions.map((a) => {
      if (a.id === assumption.id) {
        return {
          ...a,
          growthRate: numericValue,
        };
      }
      return a;
    });
    setAssumptions(updatedAssumptions);
    onAssumptionsChange(updatedAssumptions);
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "revenue":
        return "Revenue";
      case "costOfSales":
        return "Cost of Sales";
      case "expenses":
        return "Expenses";
      default:
        return category;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forecast Assumptions</CardTitle>
        <CardDescription>
          Adjust growth rates and models for each financial item
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Growth Model</TableHead>
              <TableHead>Growth Rate (%)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assumptions.map((assumption) => (
              <TableRow key={assumption.id}>
                <TableCell className="font-medium">{assumption.name}</TableCell>
                <TableCell>{getCategoryLabel(assumption.category)}</TableCell>
                <TableCell>
                  <Select
                    value={assumption.growthType}
                    onValueChange={(value) => handleGrowthTypeChange(assumption, value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select growth model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="linear">Linear</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.1"
                    value={assumption.growthRate}
                    onChange={(e) => handleGrowthRateChange(assumption, e.target.value)}
                    className="w-full"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-4 flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              // Reset to original assumptions
              setAssumptions(scenario.assumptions);
              onAssumptionsChange(scenario.assumptions);
            }}
          >
            Reset
          </Button>
          <Button onClick={() => onAssumptionsChange(assumptions)}>
            Apply Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
