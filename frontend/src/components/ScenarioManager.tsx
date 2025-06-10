import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ForecastPeriod, ForecastScenario } from "../utils/financial-types";
import {
  generateSampleForecastScenario,
  generateSampleConservativeScenario,
} from "../utils/financial-data";

// Schema for scenario creation
const scenarioFormSchema = z.object({
  name: z.string().min(1, { message: "Scenario name is required" }),
  description: z.string().optional(),
  periods: z.number().min(1).max(60),
  periodType: z.enum(["monthly", "quarterly", "yearly"]),
});

type ScenarioFormValues = z.infer<typeof scenarioFormSchema>;

interface ScenarioManagerProps {
  onSelectScenario: (scenario: ForecastScenario) => void;
  selectedScenarioId?: string;
}

export function ScenarioManager({
  onSelectScenario,
  selectedScenarioId,
}: ScenarioManagerProps) {
  // In a real app, these would come from a database
  const [scenarios, setScenarios] = useState<ForecastScenario[]>([
    generateSampleForecastScenario(),
    generateSampleConservativeScenario(),
  ]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const form = useForm<ScenarioFormValues>({
    resolver: zodResolver(scenarioFormSchema),
    defaultValues: {
      name: "",
      description: "",
      periods: 12,
      periodType: "monthly" as ForecastPeriod,
    },
  });

  function onSubmit(data: ScenarioFormValues) {
    // In a real app, we would save to a database
    const newScenario = {
      ...generateSampleForecastScenario(),
      id: `scenario${scenarios.length + 1}`,
      name: data.name,
      description: data.description,
      periods: data.periods,
      periodType: data.periodType as ForecastPeriod,
    };

    setScenarios([...scenarios, newScenario]);
    setIsCreateDialogOpen(false);
    onSelectScenario(newScenario);
    form.reset();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Forecast Scenarios</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>New Scenario</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Scenario</DialogTitle>
              <DialogDescription>
                Set up a new financial forecast scenario with custom assumptions.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scenario Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Growth Plan 2025" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the assumptions and goals of this scenario"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="periods"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Periods</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={60}
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? parseInt(e.target.value)
                                  : ""
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="periodType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Period Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select period type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit">Create Scenario</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenarios.map((scenario) => (
          <Card
            key={scenario.id}
            className={`cursor-pointer transition-all hover:border-primary ${selectedScenarioId === scenario.id ? "border-2 border-primary" : ""}`}
            onClick={() => onSelectScenario(scenario)}
          >
            <CardHeader>
              <CardTitle>{scenario.name}</CardTitle>
              <CardDescription>
                {scenario.periodType === "monthly"
                  ? `${scenario.periods} month forecast`
                  : scenario.periodType === "quarterly"
                  ? `${scenario.periods} quarter forecast`
                  : `${scenario.periods} year forecast`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {scenario.description || "No description provided"}
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <span className="text-xs text-muted-foreground">
                Start date: {scenario.startDate.toLocaleDateString()}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  // In a real app, we would implement edit/delete functionality
                  console.log("Edit scenario", scenario.id);
                }}
              >
                Edit
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
