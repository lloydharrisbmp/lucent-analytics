import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import brain from "brain";
import { BenchmarkComparisonRequest, BenchmarkComparisonResponse, CompanyMetric, MetricComparison } from "types"; // Assuming types are in 'types'

import { toast } from "sonner"; // Import toast

const BenchmarkComparisonPage = () => {
  const [companyName, setCompanyName] = useState("");
  const [industryName, setIndustryName] = useState<string | undefined>(undefined); // Use undefined for Select placeholder
  const [industries, setIndustries] = useState<string[]>([]);
  const [industriesLoading, setIndustriesLoading] = useState<boolean>(true);
  // TODO: Fetch industry list from API
  const [metrics, setMetrics] = useState<CompanyMetric[]>([
    { name: "", value: 0, year: new Date().getFullYear().toString() },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<BenchmarkComparisonResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch industries on component mount
  useEffect(() => {
    const fetchIndustries = async () => {
      setIndustriesLoading(true);
      try {
        const response = await brain.get_industry_list();
        if (!response.ok) {
          throw new Error(`Failed to fetch industries: ${response.status}`);
        }
        const data = await response.json();
        setIndustries(data.industries || []);
      } catch (err: any) {
        console.error("Error fetching industries:", err);
        toast.error("Failed to load industry list."); // Show toast on error
        setIndustries([]); // Ensure industries is an empty array on error
      } finally {
        setIndustriesLoading(false);
      }
    };

    fetchIndustries();
  }, []);

  const handleAddMetric = () => {
    setMetrics([...metrics, { name: "", value: 0, year: new Date().getFullYear().toString() }]);
  };

  const handleMetricChange = (index: number, field: keyof CompanyMetric, value: string | number) => {
    const updatedMetrics = [...metrics];
    // Ensure value is correctly typed
    if (field === 'value') {
      updatedMetrics[index][field] = Number(value) || 0;
    } else if (field === 'name' || field === 'year') {
      updatedMetrics[index][field] = String(value);
    }
    setMetrics(updatedMetrics);
  };

  const handleRemoveMetric = (index: number) => {
    const updatedMetrics = metrics.filter((_, i) => i !== index);
    setMetrics(updatedMetrics);
  };

  const handleCompare = async () => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    if (!companyName || !industryName || metrics.length === 0 || metrics.some(m => !m.name || m.value === null)) {
        setError("Please fill in Company Name, Industry, and at least one valid Metric.");
        setIsLoading(false);
        return;
    }

    const requestBody: BenchmarkComparisonRequest = {
      company_name: companyName,
      industry_name: industryName,
      company_metrics: metrics.map(m => ({ // Ensure only valid fields are sent
        name: m.name,
        value: m.value,
        year: m.year || new Date().getFullYear().toString() // Default year if missing
      })),
      // Add other optional fields if needed, e.g., benchmark_source_id, year
    };

    try {
      const response = await brain.compare_with_benchmarks(requestBody);
      // Check for non-ok status
      if (!response.ok) {
          let errorMsg = `Failed to fetch comparison data. Status: ${response.status}`;
          try {
              const errorData = await response.json();
              errorMsg = errorData.detail || errorMsg;
          } catch (jsonError) {
              // Ignore if response is not JSON
          }
          throw new Error(errorMsg);
      }
      const data: BenchmarkComparisonResponse = await response.json();
      setResults(data);
    } catch (err: any) {
      console.error("Error fetching benchmark comparison:", err);
      setError(err.message || "Failed to fetch comparison data. Please check your inputs and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Benchmark Comparison</CardTitle>
          <CardDescription>Compare your company's performance against industry benchmarks.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter your company name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industryName">Industry</Label>
              <Select onValueChange={setIndustryName} value={industryName} disabled={industriesLoading}>
                 <SelectTrigger id="industryName">
                   <SelectValue placeholder={industriesLoading ? "Loading industries..." : "Select industry..."} />
                 </SelectTrigger>
                 <SelectContent>
                   {industries.map((industry) => (
                     <SelectItem key={industry} value={industry}>
                       {industry}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
            </div>
          </div>

          {/* Metrics Input Table */}
          <div className="space-y-2">
             <Label>Company Metrics</Label>
             <Card>
                 <CardContent className="p-0">
                     <Table>
                         <TableHeader>
                             <TableRow>
                                 <TableHead>Metric Name</TableHead>
                                 <TableHead>Value</TableHead>
                                 <TableHead>Year</TableHead>
                                 <TableHead className="w-[50px]">Action</TableHead>
                             </TableRow>
                         </TableHeader>
                         <TableBody>
                             {metrics.map((metric, index) => (
                                 <TableRow key={index}>
                                     <TableCell>
                                         <Input
                                             value={metric.name}
                                             onChange={(e) => handleMetricChange(index, 'name', e.target.value)}
                                             placeholder="e.g., Revenue per FTE"
                                         />
                                     </TableCell>
                                     <TableCell>
                                         <Input
                                             type="number"
                                             value={metric.value}
                                             onChange={(e) => handleMetricChange(index, 'value', e.target.value)}
                                             placeholder="e.g., 150000"
                                         />
                                     </TableCell>
                                     <TableCell>
                                         <Input
                                             value={metric.year}
                                             onChange={(e) => handleMetricChange(index, 'year', e.target.value)}
                                             placeholder="e.g., 2023"
                                         />
                                     </TableCell>
                                     <TableCell>
                                         <Button
                                             variant="ghost"
                                             size="sm"
                                             onClick={() => handleRemoveMetric(index)}
                                             disabled={metrics.length <= 1}
                                         >
                                             Remove
                                         </Button>
                                     </TableCell>
                                 </TableRow>
                             ))}
                         </TableBody>
                     </Table>
                 </CardContent>
                 <CardFooter className="justify-end p-4">
                     <Button variant="outline" onClick={handleAddMetric}>Add Metric</Button>
                 </CardFooter>
             </Card>
          </div>


          {/* Action Button */}
          <div className="flex justify-center">
            <Button onClick={handleCompare} disabled={isLoading}>
              {isLoading ? "Comparing..." : "Compare with Benchmarks"}
            </Button>
          </div>

           {/* Error Message */}
           {error && (
            <div className="text-red-600 text-center p-2 bg-red-100 rounded border border-red-300">
                {error}
            </div>
           )}

          {/* Results Section */}
          {results && (
            <div className="space-y-4 pt-6 border-t">
              <h3 className="text-xl font-semibold">Comparison Results for {results.company_name}</h3>
              <p className="text-sm text-muted-foreground">
                Industry: {results.industry_name} | Source: {results.benchmark_source} | Year: {results.year}
              </p>
              <Card>
                  <CardContent className="p-0">
                      <Table>
                          <TableHeader>
                              <TableRow>
                                  <TableHead>Metric</TableHead>
                                  <TableHead>Your Value</TableHead>
                                  <TableHead>Benchmark</TableHead>
                                  <TableHead>Difference</TableHead>
                                  <TableHead>Percentile</TableHead>
                                  <TableHead>Interpretation</TableHead>
                                  <TableHead>Notes</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {results.comparisons.map((comp: MetricComparison, index: number) => (
                                  <TableRow key={index}>
                                      <TableCell className="font-medium">{comp.metric_name}</TableCell>
                                      <TableCell>{comp.company_value?.toLocaleString()}</TableCell>
                                      <TableCell>{comp.benchmark_value?.toLocaleString()}</TableCell>
                                      <TableCell className={comp.is_favorable === true ? "text-green-600" : comp.is_favorable === false ? "text-red-600" : ""}>
                                          {comp.difference_percent != null ? `${comp.difference_percent.toFixed(1)}%` : 'N/A'}
                                      </TableCell>
                                      <TableCell>
                                          {comp.percentile_rank?.percentile != null ? `${comp.percentile_rank.percentile.toFixed(0)}th` : 'N/A'}
                                      </TableCell>
                                      <TableCell className="text-sm">{comp.percentile_rank?.interpretation || 'N/A'}</TableCell>
                                      <TableCell className="text-xs text-muted-foreground">{comp.description}</TableCell>
                                  </TableRow>
                              ))}
                          </TableBody>
                      </Table>
                  </CardContent>
              </Card>

               {/* Recommendations */}
               {results.recommendations && results.recommendations.length > 0 && (
                    <div className="pt-4">
                        <h4 className="text-lg font-semibold mb-2">Recommendations</h4>
                        <Card>
                            <CardContent className="p-4 space-y-2 text-sm">
                                {results.recommendations.map((rec: string, index: number) => (
                                    <p key={index}>• {rec}</p>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BenchmarkComparisonPage;
