import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CompanyMetric, BenchmarkComparisonRequest, ComparisonMethod } from "types";
import { toast } from "sonner";
import { XCircle } from "lucide-react";
import brain from "brain";

interface BenchmarkComparisonFormProps {
  onCompare: (request: BenchmarkComparisonRequest) => void;
  loading: boolean;
}

export const BenchmarkComparisonForm = ({
  onCompare,
  loading,
}: BenchmarkComparisonFormProps) => {
  const [sources, setSources] = useState<Array<{ id: string; name: string }>>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [loadingSources, setLoadingSources] = useState(false);
  const [loadingIndustries, setLoadingIndustries] = useState(false);
  const [years, setYears] = useState(["2025", "2024", "2023", "2022", "2021"]);
  
  // Form data
  const [companyName, setCompanyName] = useState("");
  const [selectedSourceId, setSelectedSourceId] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [comparisonMethod, setComparisonMethod] = useState<ComparisonMethod>(ComparisonMethod.DIRECT);
  const [metrics, setMetrics] = useState<CompanyMetric[]>([]);
  const [turnoverRange, setTurnoverRange] = useState<string>("");
  
  // New metric form
  const [newMetricName, setNewMetricName] = useState("");
  const [newMetricValue, setNewMetricValue] = useState("");

  // Load sources and industries on mount
  useEffect(() => {
    fetchBenchmarkSources();
    fetchIndustryList();
  }, []);

  const fetchBenchmarkSources = async () => {
    setLoadingSources(true);
    try {
      const response = await brain.list_benchmark_sources();
      const data = await response.json();
      // Ensure data.sources is an array before mapping
      const sourcesData = Array.isArray(data?.sources) ? data.sources : [];
      setSources(sourcesData.map((source: any) => ({ id: source.id, name: source.name })));
    } catch (error) {
      console.error("Error fetching benchmark sources:", error);
      toast.error("Failed to load benchmark sources");
    } finally {
      setLoadingSources(false);
    }
  };

  const fetchIndustryList = async () => {
    setLoadingIndustries(true);
    try {
      const response = await brain.get_industry_list();
      const data = await response.json();
      // Ensure data.industries is an array
      setIndustries(Array.isArray(data?.industries) ? data.industries : []);
    } catch (error) {
      console.error("Error fetching industry list:", error);
      toast.error("Failed to load industry list");
    } finally {
      setLoadingIndustries(false);
    }
  };

  const addMetric = () => {
    if (!newMetricName || !newMetricValue || isNaN(parseFloat(newMetricValue))) {
      toast.error("Please enter a valid metric name and numeric value");
      return;
    }

    const newMetric: CompanyMetric = {
      name: newMetricName,
      value: parseFloat(newMetricValue),
      year: selectedYear,
    };

    setMetrics([...metrics, newMetric]);
    setNewMetricName("");
    setNewMetricValue("");
  };

  const removeMetric = (index: number) => {
    const updatedMetrics = [...metrics];
    updatedMetrics.splice(index, 1);
    setMetrics(updatedMetrics);
  };

  const handleSubmit = () => {
    if (!companyName) {
      toast.error("Please enter a company name");
      return;
    }

    if (!selectedIndustry) {
      toast.error("Please select an industry");
      return;
    }

    if (metrics.length === 0) {
      toast.error("Please add at least one metric");
      return;
    }

    const request: BenchmarkComparisonRequest = {
      company_name: companyName,
      industry_name: selectedIndustry,
      company_metrics: metrics,
      comparison_method: comparisonMethod,
      year: selectedYear,
    };

    if (selectedSourceId) {
      request.benchmark_source_id = selectedSourceId;
    }

    if (turnoverRange) {
      request.turnover_range = turnoverRange;
    }

    onCompare(request);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compare with Industry Benchmarks</CardTitle>
        <CardDescription>
          Enter your company's metrics to compare against industry standards
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">Company Name</Label>
            <Input
              id="company-name"
              placeholder="Enter company name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
              <SelectTrigger id="industry">
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {loadingIndustries ? (
                  <SelectItem value="loading" disabled>
                    Loading industries...
                  </SelectItem>
                ) : (
                  industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="source">Benchmark Source</Label>
            <Select value={selectedSourceId} onValueChange={setSelectedSourceId}>
              <SelectTrigger id="source">
                <SelectValue placeholder="Select source (optional)" />
              </SelectTrigger>
              <SelectContent>
                {loadingSources ? (
                  <SelectItem value="loading" disabled>
                    Loading sources...
                  </SelectItem>
                ) : (
                  sources.map((source) => (
                    <SelectItem key={source.id} value={source.id}>
                      {source.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger id="year">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comparison-method">Comparison Method</Label>
            <Select 
              value={comparisonMethod} 
              onValueChange={(value) => setComparisonMethod(value as ComparisonMethod)}
            >
              <SelectTrigger id="comparison-method">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="direct">Exact Match</SelectItem>
                <SelectItem value="fuzzy">Fuzzy Match</SelectItem>
                <SelectItem value="derived">Derived Match</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="turnover-range">Turnover Range (Optional)</Label>
          <Input
            id="turnover-range"
            placeholder="e.g. $0 - $200k or $200k - $500k"
            value={turnoverRange}
            onChange={(e) => setTurnoverRange(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Company Metrics</Label>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric Name</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-4">
                    No metrics added yet. Add your first metric below.
                  </TableCell>
                </TableRow>
              ) : (
                metrics.map((metric, index) => (
                  <TableRow key={index}>
                    <TableCell>{metric.name}</TableCell>
                    <TableCell className="text-right font-medium">
                      {metric.value.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeMetric(index)}
                      >
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="metric-name">Metric Name</Label>
              <Input
                id="metric-name"
                placeholder="e.g. Gross Margin or Profit Margin"
                value={newMetricName}
                onChange={(e) => setNewMetricName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="metric-value">Value</Label>
              <div className="flex space-x-2">
                <Input
                  id="metric-value"
                  placeholder="e.g. 0.25 or 25000"
                  value={newMetricValue}
                  onChange={(e) => setNewMetricValue(e.target.value)}
                  type="number"
                  step="0.01"
                />
                <Button onClick={addMetric}>Add</Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSubmit} 
          className="w-full" 
          disabled={loading || metrics.length === 0 || !companyName || !selectedIndustry}
        >
          {loading ? "Comparing..." : "Compare with Benchmarks"}
        </Button>
      </CardFooter>
    </Card>
  );
};
