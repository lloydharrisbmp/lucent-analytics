import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "components/Spinner";
import { AlertCircle, Calculator, CheckCircle, ChevronRight, Clock, DollarSign, HelpCircle, Info, Percent, Star, Strategy, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import brain from "brain";
import { useEffect } from "react";

// Define types for our component
interface WorkloadEstimate {
  hours: number;
  complexity: string;
  skills_required: string[];
  recommended_team_size: number;
}

interface ApplicationRequirement {
  requirement_id: string;
  name: string;
  description: string;
  estimated_workload: WorkloadEstimate;
  dependencies: string[];
}

interface ROICalculationResponse {
  grant_id: string;
  grant_name: string;
  expected_funding_amount: number;
  estimated_application_cost: number;
  application_time_estimate: number;
  success_probability: number;
  estimated_roi: number;
  estimated_net_benefit: number;
  payback_period_days: number;
  requirements?: ApplicationRequirement[];
  confidence_level: string;
}

interface OptimizationResponse {
  recommended_grants: string[];
  total_expected_funding: number;
  total_estimated_cost: number;
  total_estimated_time: number;
  expected_net_benefit: number;
  expected_roi: number;
  excluded_grants: string[];
}

interface GrantComparison {
  grants: ROICalculationResponse[];
  recommended_priority: string[];
  optimization_factors: Record<string, number>;
}

interface GrantProgram {
  id: string;
  name: string;
  description: string;
  provider: string;
  // Add other fields as needed
}

export function GrantROICalculator() {
  // State for the calculator
  const [activeTab, setActiveTab] = useState("calculator");
  const [selectedGrantId, setSelectedGrantId] = useState<string>("");
  const [grants, setGrants] = useState<GrantProgram[]>([]);
  const [expectedFunding, setExpectedFunding] = useState<string>("10000");
  const [successProbability, setSuccessProbability] = useState<number>(35);
  const [loading, setLoading] = useState(false);
  const [grantsLoading, setGrantsLoading] = useState(true);
  const [calculationResult, setCalculationResult] = useState<ROICalculationResponse | null>(null);
  const [showRequirements, setShowRequirements] = useState(false);
  
  // State for optimization
  const [selectedGrantIds, setSelectedGrantIds] = useState<string[]>([]);
  const [comparisonResult, setComparisonResult] = useState<GrantComparison | null>(null);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResponse | null>(null);
  const [optimizationPreference, setOptimizationPreference] = useState<string>("balanced");
  const [availableHours, setAvailableHours] = useState<string>("40");
  const [availableBudget, setAvailableBudget] = useState<string>("5000");
  const [optimizationLoading, setOptimizationLoading] = useState(false);
  
  // Fetch grants on component mount
  useEffect(() => {
    fetchGrants();
  }, []);

  // Fetch all grants
  const fetchGrants = async () => {
    setGrantsLoading(true);
    try {
      const response = await brain.list_grants();
      const data = await response.json();
      setGrants(data.grants || []);
    } catch (error) {
      console.error("Error fetching grants:", error);
      toast.error("Failed to load grants. Please try again.");
    } finally {
      setGrantsLoading(false);
    }
  };

  // Calculate ROI for a single grant
  const calculateROI = async () => {
    if (!selectedGrantId) {
      toast.error("Please select a grant to calculate ROI");
      return;
    }

    setLoading(true);
    try {
      const response = await brain.calculate_roi_for_grant({
        grant_id: selectedGrantId,
        expected_funding_amount: parseFloat(expectedFunding),
        success_probability: successProbability / 100,
        include_requirements_breakdown: true
      });
      const data = await response.json();
      setCalculationResult(data);
    } catch (error) {
      console.error("Error calculating ROI:", error);
      toast.error("Failed to calculate ROI. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Compare multiple grants
  const compareGrants = async () => {
    if (selectedGrantIds.length === 0) {
      toast.error("Please select at least one grant to compare");
      return;
    }

    setOptimizationLoading(true);
    try {
      const response = await brain.compare_grants({
        grant_ids: selectedGrantIds
      });
      const data = await response.json();
      setComparisonResult(data);
    } catch (error) {
      console.error("Error comparing grants:", error);
      toast.error("Failed to compare grants. Please try again.");
    } finally {
      setOptimizationLoading(false);
    }
  };

  // Optimize grant strategy
  const optimizeStrategy = async () => {
    if (selectedGrantIds.length === 0) {
      toast.error("Please select at least one grant to optimize");
      return;
    }

    setOptimizationLoading(true);
    try {
      const response = await brain.optimize_grant_strategy({
        grant_ids: selectedGrantIds,
        available_time_hours: parseFloat(availableHours),
        available_budget: parseFloat(availableBudget),
        optimization_preference: optimizationPreference
      });
      const data = await response.json();
      setOptimizationResult(data);
    } catch (error) {
      console.error("Error optimizing grants:", error);
      toast.error("Failed to optimize grant strategy. Please try again.");
    } finally {
      setOptimizationLoading(false);
    }
  };

  // Toggle grant selection for comparison
  const toggleGrantSelection = (grantId: string) => {
    if (selectedGrantIds.includes(grantId)) {
      setSelectedGrantIds(selectedGrantIds.filter(id => id !== grantId));
    } else {
      setSelectedGrantIds([...selectedGrantIds, grantId]);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat('en-AU', { style: 'percent', maximumFractionDigits: 1 }).format(value);
  };

  // Format days
  const formatDays = (days: number) => {
    return days === 999 ? "N/A" : `${days} days`;
  };

  // Format hours
  const formatHours = (hours: number) => {
    return `${hours} hours`;
  };

  // Get confidence level badge color
  const getConfidenceBadgeColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get complexity badge color
  const getComplexityBadgeColor = (complexity: string) => {
    switch (complexity) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get ROI badge color
  const getROIBadgeColor = (roi: number) => {
    if (roi >= 2.0) return "bg-green-100 text-green-800";
    if (roi >= 1.0) return "bg-emerald-100 text-emerald-800";
    if (roi >= 0.5) return "bg-blue-100 text-blue-800";
    if (roi >= 0) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  // Format complexity
  const formatComplexity = (complexity: string) => {
    return complexity.charAt(0).toUpperCase() + complexity.slice(1);
  };

  // Find grant name by ID
  const getGrantNameById = (grantId: string) => {
    const grant = grants.find(g => g.id === grantId);
    return grant ? grant.name : "Unknown Grant";
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calculator">
            <Calculator className="h-4 w-4 mr-2" />
            ROI Calculator
          </TabsTrigger>
          <TabsTrigger value="optimizer">
            <Strategy className="h-4 w-4 mr-2" />
            Strategy Optimizer
          </TabsTrigger>
        </TabsList>

        {/* ROI Calculator Tab */}
        <TabsContent value="calculator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Grant ROI Calculator</CardTitle>
              <CardDescription>
                Calculate the potential return on investment for grant applications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="grant-select">Select Grant</Label>
                    <Select
                      value={selectedGrantId}
                      onValueChange={setSelectedGrantId}
                      disabled={grantsLoading}
                    >
                      <SelectTrigger id="grant-select">
                        <SelectValue placeholder="Select a grant" />
                      </SelectTrigger>
                      <SelectContent>
                        {grantsLoading ? (
                          <div className="flex justify-center p-2">
                            <Spinner size="sm" />
                          </div>
                        ) : (
                          grants.map((grant) => (
                            <SelectItem key={grant.id} value={grant.id}>
                              {grant.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expected-funding">Expected Funding ($)</Label>
                    <Input
                      id="expected-funding"
                      type="number"
                      value={expectedFunding}
                      onChange={(e) => setExpectedFunding(e.target.value)}
                      min="0"
                      step="1000"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="success-probability">Success Probability: {successProbability}%</Label>
                      <div className="flex items-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setSuccessProbability(35)}
                        >
                          Reset
                        </Button>
                      </div>
                    </div>
                    <Slider
                      id="success-probability"
                      min={5}
                      max={90}
                      step={5}
                      value={[successProbability]}
                      onValueChange={(value) => setSuccessProbability(value[0])}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Unlikely (5%)</span>
                      <span>Average (35%)</span>
                      <span>Very Likely (90%)</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-end space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>About Success Probability</AlertTitle>
                    <AlertDescription>
                      The default success probability is based on historical averages for similar grants. Adjust based on your knowledge of the grant program and business fit.
                    </AlertDescription>
                  </Alert>
                  
                  <Button
                    onClick={calculateROI}
                    disabled={!selectedGrantId || loading}
                    className="mt-auto"
                  >
                    {loading ? <Spinner size="sm" className="mr-2" /> : <Calculator className="h-4 w-4 mr-2" />}
                    Calculate ROI
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {calculationResult && (
            <Card className="border-t-4" style={{ borderTopColor: "hsl(var(--primary))" }}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>ROI Analysis: {calculationResult.grant_name}</CardTitle>
                    <CardDescription>
                      Expected return on investment and application requirements
                    </CardDescription>
                  </div>
                  <Badge className={getConfidenceBadgeColor(calculationResult.confidence_level)}>
                    {calculationResult.confidence_level.charAt(0).toUpperCase() + calculationResult.confidence_level.slice(1)} Confidence
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-md flex flex-col">
                    <span className="text-sm text-muted-foreground">Expected ROI</span>
                    <div className="flex items-baseline mt-1">
                      <span className="text-2xl font-bold">
                        {formatPercentage(calculationResult.estimated_roi)}
                      </span>
                      <Badge className={`ml-2 ${getROIBadgeColor(calculationResult.estimated_roi)}`}>
                        {calculationResult.estimated_roi >= 1 ? "Positive" : "Negative"}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">
                      Net Benefit: {formatCurrency(calculationResult.estimated_net_benefit)}
                    </span>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md flex flex-col">
                    <span className="text-sm text-muted-foreground">Success Probability</span>
                    <div className="flex items-baseline mt-1">
                      <span className="text-2xl font-bold">
                        {formatPercentage(calculationResult.success_probability)}
                      </span>
                      <Percent className="h-4 w-4 ml-1 text-muted-foreground" />
                    </div>
                    <Progress 
                      value={calculationResult.success_probability * 100} 
                      className="h-2 mt-2" 
                    />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md flex flex-col">
                    <span className="text-sm text-muted-foreground">Time Investment</span>
                    <div className="flex items-baseline mt-1">
                      <span className="text-2xl font-bold">
                        {formatHours(calculationResult.application_time_estimate)}
                      </span>
                      <Clock className="h-4 w-4 ml-1 text-muted-foreground" />
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">
                      Payback Period: {formatDays(calculationResult.payback_period_days)}
                    </span>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md flex flex-col">
                    <span className="text-sm text-muted-foreground">Financial Overview</span>
                    <div className="flex items-baseline mt-1">
                      <span className="text-2xl font-bold">
                        {formatCurrency(calculationResult.expected_funding_amount)}
                      </span>
                      <DollarSign className="h-4 w-4 ml-1 text-muted-foreground" />
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">
                      Application Cost: {formatCurrency(calculationResult.estimated_application_cost)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Application Requirements</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowRequirements(!showRequirements)}
                    >
                      {showRequirements ? "Hide Details" : "Show Details"}
                    </Button>
                  </div>
                  
                  {showRequirements && calculationResult.requirements && (
                    <div className="bg-gray-50 p-4 rounded-md">
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-4">
                          {calculationResult.requirements.map((req) => (
                            <div key={req.requirement_id} className="border-b pb-4 last:border-b-0 last:pb-0">
                              <div className="flex justify-between items-start">
                                <h4 className="font-medium">{req.name}</h4>
                                <Badge className={getComplexityBadgeColor(req.estimated_workload.complexity)}>
                                  {formatComplexity(req.estimated_workload.complexity)}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{req.description}</p>
                              <div className="mt-2 grid grid-cols-2 gap-4">
                                <div>
                                  <span className="text-xs text-muted-foreground block">Estimated Workload</span>
                                  <span className="text-sm font-medium">{req.estimated_workload.hours} hours</span>
                                </div>
                                <div>
                                  <span className="text-xs text-muted-foreground block">Team Size</span>
                                  <span className="text-sm font-medium">{req.estimated_workload.recommended_team_size} people</span>
                                </div>
                              </div>
                              <div className="mt-2">
                                <span className="text-xs text-muted-foreground block">Skills Required</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {req.estimated_workload.skills_required.map((skill, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-6">
                <Button variant="outline" onClick={() => setCalculationResult(null)}>
                  Reset
                </Button>
                <Button 
                  variant="default"
                  onClick={() => {
                    if (selectedGrantId && !selectedGrantIds.includes(selectedGrantId)) {
                      setSelectedGrantIds([...selectedGrantIds, selectedGrantId]);
                    }
                    setActiveTab("optimizer");
                  }}
                >
                  Add to Strategy Optimizer
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        {/* Strategy Optimizer Tab */}
        <TabsContent value="optimizer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Grant Strategy Optimizer</CardTitle>
              <CardDescription>
                Compare multiple grants and optimize your application strategy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Selected Grants</Label>
                  <div className="border rounded-md">
                    <ScrollArea className="h-[200px] w-full">
                      <div className="p-4 space-y-2">
                        {grants.map((grant) => (
                          <div key={grant.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`grant-${grant.id}`}
                              checked={selectedGrantIds.includes(grant.id)}
                              onChange={() => toggleGrantSelection(grant.id)}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <Label htmlFor={`grant-${grant.id}`} className="cursor-pointer">
                              {grant.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="optimization-preference">Optimization Preference</Label>
                    <Select
                      value={optimizationPreference}
                      onValueChange={setOptimizationPreference}
                    >
                      <SelectTrigger id="optimization-preference">
                        <SelectValue placeholder="Select preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="balanced">Balanced Approach</SelectItem>
                        <SelectItem value="roi">Maximize ROI</SelectItem>
                        <SelectItem value="time">Minimize Time Investment</SelectItem>
                        <SelectItem value="success">Maximize Success Probability</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="available-hours">Available Time (hours)</Label>
                    <Input
                      id="available-hours"
                      type="number"
                      value={availableHours}
                      onChange={(e) => setAvailableHours(e.target.value)}
                      min="0"
                      step="10"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="available-budget">Available Budget ($)</Label>
                    <Input
                      id="available-budget"
                      type="number"
                      value={availableBudget}
                      onChange={(e) => setAvailableBudget(e.target.value)}
                      min="0"
                      step="1000"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={compareGrants}
                    disabled={selectedGrantIds.length === 0 || optimizationLoading}
                  >
                    {optimizationLoading ? <Spinner size="sm" className="mr-2" /> : <Calculator className="h-4 w-4 mr-2" />}
                    Compare Grants
                  </Button>
                  
                  <Button
                    onClick={optimizeStrategy}
                    disabled={selectedGrantIds.length === 0 || optimizationLoading}
                  >
                    {optimizationLoading ? <Spinner size="sm" className="mr-2" /> : <Strategy className="h-4 w-4 mr-2" />}
                    Optimize Strategy
                  </Button>
                </div>
              </div>

              {comparisonResult && (
                <div className="space-y-4">
                  <Separator />
                  <h3 className="text-lg font-medium">Grant Comparison Results</h3>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Priority</TableHead>
                        <TableHead>Grant Name</TableHead>
                        <TableHead>Expected Funding</TableHead>
                        <TableHead>Success</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead>ROI</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {comparisonResult.grants.map((grant, index) => (
                        <TableRow key={grant.grant_id}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>{grant.grant_name}</TableCell>
                          <TableCell>{formatCurrency(grant.expected_funding_amount)}</TableCell>
                          <TableCell>{formatPercentage(grant.success_probability)}</TableCell>
                          <TableCell>{formatHours(grant.application_time_estimate)}</TableCell>
                          <TableCell>{formatCurrency(grant.estimated_application_cost)}</TableCell>
                          <TableCell>
                            <Badge className={getROIBadgeColor(grant.estimated_roi)}>
                              {formatPercentage(grant.estimated_roi)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {optimizationResult && (
                <div className="space-y-4">
                  <Separator />
                  <h3 className="text-lg font-medium">Optimized Grant Strategy</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded-md flex flex-col">
                      <span className="text-sm text-muted-foreground">Total Expected Funding</span>
                      <span className="text-2xl font-bold mt-1">
                        {formatCurrency(optimizationResult.total_expected_funding)}
                      </span>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-md flex flex-col">
                      <span className="text-sm text-muted-foreground">Portfolio ROI</span>
                      <div className="flex items-baseline mt-1">
                        <span className="text-2xl font-bold">
                          {formatPercentage(optimizationResult.expected_roi)}
                        </span>
                        <TrendingUp className="h-4 w-4 ml-1 text-muted-foreground" />
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-md flex flex-col">
                      <span className="text-sm text-muted-foreground">Total Time Required</span>
                      <span className="text-2xl font-bold mt-1">
                        {formatHours(optimizationResult.total_estimated_time)}
                      </span>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-md flex flex-col">
                      <span className="text-sm text-muted-foreground">Total Investment</span>
                      <span className="text-2xl font-bold mt-1">
                        {formatCurrency(optimizationResult.total_estimated_cost)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Recommended Application Strategy</h4>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="space-y-4">
                        {optimizationResult.recommended_grants.length > 0 ? (
                          <div>
                            <p className="mb-2 text-sm text-muted-foreground">
                              Apply for these grants in the following priority order:
                            </p>
                            <ol className="list-decimal list-inside space-y-2">
                              {optimizationResult.recommended_grants.map((grantId, index) => (
                                <li key={grantId} className="pl-2">
                                  <span className="font-medium">{getGrantNameById(grantId)}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        ) : (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>No grants recommended</AlertTitle>
                            <AlertDescription>
                              None of the selected grants fit within your constraints. Consider increasing your available time or budget, or selecting different grants.
                            </AlertDescription>
                          </Alert>
                        )}
                        
                        {optimizationResult.excluded_grants.length > 0 && (
                          <div className="mt-4">
                            <p className="mb-2 text-sm text-muted-foreground">
                              Excluded grants (insufficient resources):
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                              {optimizationResult.excluded_grants.map((grantId) => (
                                <li key={grantId} className="pl-2">
                                  {getGrantNameById(grantId)}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
