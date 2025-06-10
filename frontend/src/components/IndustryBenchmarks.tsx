import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import brain from "brain";

type BenchmarkSource = {
  id: string;
  name: string;
  url: string;
  description: string;
  last_updated: string | null;
  update_frequency: string;
  data_types: string[];
  industries: string[];
  metrics: string[];
  version_history?: { version: string; date: string; description: string }[];
};

type BenchmarkDataPoint = {
  industry_code: string;
  industry_name: string;
  metric_name: string;
  value: number;
  year: string;
  turnover_range?: string;
  source_id: string;
  version?: string;
};

type BenchmarkDataResponse = {
  data: BenchmarkDataPoint[];
  metadata: {
    total_records: number;
    filters_applied: {
      industry_code?: string;
      industry_name?: string;
      source_id?: string;
      year?: string;
      metric?: string;
    };
  };
};

interface DataCollectionStrategy {
  overview: string;
  collection_methods: {
    source: string;
    method: string;
    update_frequency: string;
    data_format: string;
  }[];
  sources: BenchmarkSource[];
  update_process: {
    automatic_updates: string;
    manual_updates: string;
    validation: string;
    versioning: string;
    file_uploads: string;
  };
  data_structure: {
    industry_classification: string;
    metrics: string;
    time_periods: string;
    versioning: string;
  };
}

export const IndustryBenchmarks = () => {
  const [sources, setSources] = useState<BenchmarkSource[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<string[]>([]);
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkDataPoint[]>([]);
  const [dataStrategy, setDataStrategy] = useState<DataCollectionStrategy | null>(null);
  const [loading, setLoading] = useState({
    sources: false,
    data: false,
    industries: false,
    metrics: false,
    strategy: false,
    update: false,
  });

  // Filter states
  const [selectedSource, setSelectedSource] = useState<string>("all_sources");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("all_industries");
  const [selectedMetric, setSelectedMetric] = useState<string>("all_metrics");
  const [selectedYear, setSelectedYear] = useState<string>("all_years");

  // Years - normally would come from API, but for now just hardcode recent years
  const years = ["2025", "2024", "2023", "2022", "2021", "2020"];

  // Fetch sources on component mount
  useEffect(() => {
    fetchBenchmarkSources();
    fetchIndustryList();
  }, []);

  // Fetch metrics when industry changes
  useEffect(() => {
    if (selectedIndustry) {
      fetchIndustryMetrics(selectedIndustry);
    }
  }, [selectedIndustry]);

  // Fetch data when filters change
  useEffect(() => {
    if (selectedSource !== "all_sources" || selectedIndustry !== "all_industries" || 
        selectedMetric !== "all_metrics" || selectedYear !== "all_years") {
      fetchBenchmarkData();
    }
  }, [selectedSource, selectedIndustry, selectedMetric, selectedYear]);

  const fetchBenchmarkSources = async () => {
    setLoading((prev) => ({ ...prev, sources: true }));
    try {
      const response = await brain.list_benchmark_sources();
      const data = await response.json();
      setSources(data.sources);
    } catch (error) {
      console.error("Error fetching benchmark sources:", error);
      toast.error("Failed to load benchmark sources");
    } finally {
      setLoading((prev) => ({ ...prev, sources: false }));
    }
  };

  const fetchIndustryList = async () => {
    setLoading((prev) => ({ ...prev, industries: true }));
    try {
      const response = await brain.get_industry_list();
      const data = await response.json();
      setIndustries(data.industries);
    } catch (error) {
      console.error("Error fetching industry list:", error);
      toast.error("Failed to load industry list");
    } finally {
      setLoading((prev) => ({ ...prev, industries: false }));
    }
  };

  const fetchIndustryMetrics = async (industryName: string) => {
    setLoading((prev) => ({ ...prev, metrics: true }));
    try {
      const response = await brain.get_industry_metrics({ industry_name: industryName });
      const data = await response.json();
      setMetrics(data.metrics);
    } catch (error) {
      console.error("Error fetching industry metrics:", error);
      toast.error("Failed to load industry metrics");
    } finally {
      setLoading((prev) => ({ ...prev, metrics: false }));
    }
  };

  const fetchBenchmarkData = async () => {
    setLoading((prev) => ({ ...prev, data: true }));
    try {
      const response = await brain.get_benchmark_data_endpoint({
        source_id: selectedSource === "all_sources" ? undefined : selectedSource,
        industry_name: selectedIndustry === "all_industries" ? undefined : selectedIndustry,
        metric: selectedMetric === "all_metrics" ? undefined : selectedMetric,
        year: selectedYear === "all_years" ? undefined : selectedYear,
      });
      const data: BenchmarkDataResponse = await response.json();
      setBenchmarkData(data.data);
    } catch (error) {
      console.error("Error fetching benchmark data:", error);
      toast.error("Failed to load benchmark data");
    } finally {
      setLoading((prev) => ({ ...prev, data: false }));
    }
  };

  const fetchDataStrategy = async () => {
    setLoading((prev) => ({ ...prev, strategy: true }));
    try {
      const response = await brain.get_data_collection_strategy();
      const data = await response.json();
      setDataStrategy(data);
    } catch (error) {
      console.error("Error fetching data collection strategy:", error);
      toast.error("Failed to load data collection strategy");
    } finally {
      setLoading((prev) => ({ ...prev, strategy: false }));
    }
  };

  const handleUpdateBenchmark = async (sourceId: string) => {
    setLoading((prev) => ({ ...prev, update: true }));
    try {
      const response = await brain.update_benchmark_data({
        source_id: sourceId,
        force_update: true,
      });
      const data = await response.json();
      if (data.success) {
        toast.success(`Benchmark data for ${data.updated_source.name} updated successfully`);
        // Refresh data
        fetchBenchmarkSources();
        fetchBenchmarkData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error updating benchmark data:", error);
      toast.error("Failed to update benchmark data");
    } finally {
      setLoading((prev) => ({ ...prev, update: false }));
    }
  };

  const formatValue = (value: number): string => {
    // Format the value based on its magnitude (percentage, currency, etc.)
    if (value < 1) {
      // Likely a ratio or percentage
      return `${(value * 100).toFixed(2)}%`;
    } else if (value > 1000) {
      // Likely a dollar value
      return `$${value.toLocaleString("en-AU")}`;  
    } else {
      // Generic number
      return value.toFixed(2);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Industry Benchmarks</CardTitle>
        <CardDescription>
          Compare your financial performance against industry standards and competitors
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="data">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="data">Benchmark Data</TabsTrigger>
            <TabsTrigger value="sources">Data Sources</TabsTrigger>
            <TabsTrigger value="strategy" onClick={fetchDataStrategy}>Collection Strategy</TabsTrigger>
          </TabsList>

          <TabsContent value="data" className="space-y-4">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="source">Source</Label>
                <Select
                  value={selectedSource}
                  onValueChange={setSelectedSource}
                >
                  <SelectTrigger id="source">
                    <SelectValue placeholder="All sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_sources">All sources</SelectItem>
                    {sources.map((source) => (
                      <SelectItem key={source.id} value={source.id}>
                        {source.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select
                  value={selectedIndustry}
                  onValueChange={setSelectedIndustry}
                >
                  <SelectTrigger id="industry">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_industries">All industries</SelectItem>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metric">Metric</Label>
                <Select
                  value={selectedMetric}
                  onValueChange={setSelectedMetric}
                  disabled={!selectedIndustry}
                >
                  <SelectTrigger id="metric">
                    <SelectValue placeholder="Select metric" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_metrics">All metrics</SelectItem>
                    {metrics.map((metric) => (
                      <SelectItem key={metric} value={metric}>
                        {metric}
                      </SelectItem>
                    ))}
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
                    <SelectItem value="all_years">All years</SelectItem>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Industry</TableHead>
                    <TableHead>Metric</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead className="text-right">Year</TableHead>
                    <TableHead>Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading.data ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        Loading benchmark data...
                      </TableCell>
                    </TableRow>
                  ) : benchmarkData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        No benchmark data available for the selected filters. Try adjusting your selection.
                      </TableCell>
                    </TableRow>
                  ) : (
                    benchmarkData.map((dataPoint, index) => {
                      const source = sources.find(s => s.id === dataPoint.source_id);
                      return (
                        <TableRow key={index}>
                          <TableCell>{dataPoint.industry_name}</TableCell>
                          <TableCell>{dataPoint.metric_name}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatValue(dataPoint.value)}
                          </TableCell>
                          <TableCell className="text-right">{dataPoint.year}</TableCell>
                          <TableCell>
                            {source?.name || dataPoint.source_id}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="sources">
            <div className="space-y-4">
              {loading.sources ? (
                <div className="text-center py-8">Loading benchmark sources...</div>
              ) : (
                sources.map((source) => (
                  <Card key={source.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{source.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {source.description}
                          </CardDescription>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleUpdateBenchmark(source.id)}
                          disabled={loading.update}
                        >
                          Update Data
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Data Types</div>
                          <div className="flex flex-wrap gap-1">
                            {source.data_types.map((type) => (
                              <Badge key={type} variant="outline">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Update Frequency</div>
                          <div>{source.update_frequency}</div>
                        </div>
                      </div>

                      <Separator className="my-3" />

                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Key Metrics</div>
                        <div className="flex flex-wrap gap-1">
                          {source.metrics.slice(0, 5).map((metric) => (
                            <Badge key={metric} variant="secondary" className="mb-1">
                              {metric}
                            </Badge>
                          ))}
                          {source.metrics.length > 5 && (
                            <Badge variant="secondary" className="mb-1">
                              +{source.metrics.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="mt-3">
                        <a 
                          href={source.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Visit source website
                        </a>
                      </div>

                      {source.last_updated && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Last updated: {new Date(source.last_updated).toLocaleDateString()}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="strategy">
            {loading.strategy ? (
              <div className="text-center py-8">Loading data collection strategy...</div>
            ) : dataStrategy ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Overview</h3>
                  <p>{dataStrategy.overview}</p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-medium">Collection Methods</h3>
                  {dataStrategy.collection_methods.map((method, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{method.source}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="font-medium">Method</div>
                            <div>{method.method}</div>
                          </div>
                          <div>
                            <div className="font-medium">Update Frequency</div>
                            <div>{method.update_frequency}</div>
                          </div>
                          <div>
                            <div className="font-medium">Data Format</div>
                            <div>{method.data_format}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Update Process</h3>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <div className="font-medium">Automatic Updates</div>
                          <div className="text-sm">{dataStrategy.update_process.automatic_updates}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="font-medium">Manual Updates</div>
                          <div className="text-sm">{dataStrategy.update_process.manual_updates}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="font-medium">Validation</div>
                          <div className="text-sm">{dataStrategy.update_process.validation}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Data Structure</h3>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <div className="font-medium">Industry Classification</div>
                          <div className="text-sm">{dataStrategy.data_structure.industry_classification}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="font-medium">Metrics</div>
                          <div className="text-sm">{dataStrategy.data_structure.metrics}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="font-medium">Time Periods</div>
                          <div className="text-sm">{dataStrategy.data_structure.time_periods}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p>Failed to load data strategy.</p>
                <Button 
                  onClick={fetchDataStrategy} 
                  className="mt-2"
                  variant="outline"
                >
                  Retry
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
