import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import brain from "brain";
import { toast } from "sonner";

const FinancialHealthIndicators = () => {
  // Handler for clicking on a bar in the chart
  const handleBarClick = (data: any, index: number) => {
    console.log("Bar clicked:", { data, index });
    // TODO: Implement actual drilldown logic here (e.g., show modal, filter data)
    toast.info(`Clicked on bar: ${data.payload.industry} - ${data.dataKey}`);
  };

  const [ratios, setRatios] = useState([]);
  const [failurePatterns, setFailurePatterns] = useState([]);
  const [industryBenchmarks, setIndustryBenchmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndustry, setSelectedIndustry] = useState("Retail Trade");
  const [selectedCategory, setSelectedCategory] = useState("Profitability");

  useEffect(() => {
    const fetchFinancialHealth = async () => {
      try {
        setLoading(true);
        const response = await brain.get_financial_health_indicators();
        const data = await response.json();
        setRatios(data.ratios);
        setFailurePatterns(data.failure_patterns);
        setIndustryBenchmarks(data.industry_benchmarks);
      } catch (error) {
        console.error("Error fetching financial health data:", error);
        toast.error("Failed to load financial health indicators");
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialHealth();
  }, []);

  // Filter ratios by category
  const filteredRatios = ratios.filter(ratio => ratio.category === selectedCategory);
  
  // Get the selected industry benchmark
  const selectedBenchmark = industryBenchmarks.find(benchmark => benchmark.industry_name === selectedIndustry);

  // Format data for ratio charts
  const prepareRatioChartData = (ratio) => {
    if (!ratio || !ratio.industry_benchmarks) return [];
    
    return Object.entries(ratio.industry_benchmarks).map(([industry, sizes]) => ({
      industry,
      small: sizes.small,
      medium: sizes.medium,
      large: sizes.large,
    }));
  };

  // Format data for industry benchmark chart
  const prepareBenchmarkChartData = (benchmark) => {
    if (!benchmark) return [];
    
    return Object.entries(benchmark.small_business).map(([metric, value]) => ({
      metric,
      small: benchmark.small_business[metric],
      medium: benchmark.medium_business[metric],
      large: benchmark.large_business[metric],
    }));
  };

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Financial Health Indicators</h1>
        <p className="text-lg text-gray-600">
          Comprehensive financial benchmarks and indicators for Australian businesses
        </p>
      </div>

      <Tabs defaultValue="ratios" className="mt-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ratios">Financial Ratios</TabsTrigger>
          <TabsTrigger value="benchmarks">Industry Benchmarks</TabsTrigger>
          <TabsTrigger value="patterns">Failure Patterns</TabsTrigger>
        </TabsList>

        {/* Financial Ratios Tab */}
        <TabsContent value="ratios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Critical Financial Ratios</CardTitle>
              <CardDescription>
                Key financial ratios used to assess business health in Australian industries
              </CardDescription>
              
              <div className="mt-4">
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="Profitability">Profitability Ratios</option>
                  <option value="Liquidity">Liquidity Ratios</option>
                  <option value="Leverage">Leverage Ratios</option>
                  <option value="Efficiency">Efficiency Ratios</option>
                </select>
              </div>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading financial ratios...</div>
              ) : (
                <div className="space-y-8">
                  {filteredRatios.map((ratio) => (
                    <div key={ratio.name} className="space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold">{ratio.name}</h3>
                        <p className="text-gray-600">{ratio.description}</p>
                        <div className="flex flex-wrap mt-2 gap-4">
                          <div className="bg-gray-100 p-2 rounded">
                            <span className="font-medium">Formula:</span> {ratio.formula}
                          </div>
                          <div className="bg-gray-100 p-2 rounded">
                            <span className="font-medium">Interpretation:</span> {ratio.interpretation}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Industry Benchmarks</h4>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={prepareRatioChartData(ratio)} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="industry" angle={-45} textAnchor="end" height={70} />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="small" name="Small Business" fill="#8884d8" onClick={handleBarClick} />
                              <Bar dataKey="medium" name="Medium Business" fill="#82ca9d" onClick={handleBarClick} />
                              <Bar dataKey="large" name="Large Business" fill="#ffc658" onClick={handleBarClick} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Warning Thresholds by Industry</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Industry</TableHead>
                              <TableHead>Warning Threshold</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {Object.entries(ratio.warning_thresholds).map(([industry, threshold]) => (
                              <TableRow key={industry}>
                                <TableCell>{industry}</TableCell>
                                <TableCell>{threshold}%</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      
                      <Separator className="my-6" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Industry Benchmarks Tab */}
        <TabsContent value="benchmarks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Industry Benchmarks</CardTitle>
              <CardDescription>
                Financial benchmarks for Australian industries by business size
              </CardDescription>
              
              <div className="mt-4">
                <select 
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  {industryBenchmarks.map((benchmark) => (
                    <option key={benchmark.industry_code} value={benchmark.industry_name}>
                      {benchmark.industry_name}
                    </option>
                  ))}
                </select>
              </div>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading industry benchmarks...</div>
              ) : selectedBenchmark ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold">{selectedBenchmark.industry_name}</h3>
                    <div className="text-sm text-gray-500 mt-1">
                      Industry Code: {selectedBenchmark.industry_code} • Source: {selectedBenchmark.source} • Year: {selectedBenchmark.year}
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Key Metrics by Business Size</h4>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={prepareBenchmarkChartData(selectedBenchmark)} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="metric" angle={-45} textAnchor="end" height={70} />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="small" name="Small Business" fill="#8884d8" />
                          <Bar dataKey="medium" name="Medium Business" fill="#82ca9d" />
                          <Bar dataKey="large" name="Large Business" fill="#ffc658" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Small Business</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableBody>
                            {Object.entries(selectedBenchmark.small_business).map(([key, value]) => (
                              <TableRow key={key}>
                                <TableCell className="font-medium">{key}</TableCell>
                                <TableCell>{value}%</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Medium Business</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableBody>
                            {Object.entries(selectedBenchmark.medium_business).map(([key, value]) => (
                              <TableRow key={key}>
                                <TableCell className="font-medium">{key}</TableCell>
                                <TableCell>{value}%</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Large Business</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableBody>
                            {Object.entries(selectedBenchmark.large_business).map(([key, value]) => (
                              <TableRow key={key}>
                                <TableCell className="font-medium">{key}</TableCell>
                                <TableCell>{value}%</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">No benchmark data available for the selected industry</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Failure Patterns Tab */}
        <TabsContent value="patterns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Common Failure Patterns</CardTitle>
              <CardDescription>
                Warning signs and common failure patterns in Australian businesses
              </CardDescription>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading failure patterns...</div>
              ) : (
                <div className="space-y-6">
                  {failurePatterns.map((pattern) => (
                    <div key={pattern.pattern_name} className="space-y-4">
                      <Alert>
                        <AlertTitle className="text-lg font-semibold">{pattern.pattern_name}</AlertTitle>
                        <AlertDescription>
                          <p className="mt-1">{pattern.description}</p>
                          
                          <div className="mt-4">
                            <span className="font-medium">Affected Industries:</span>{" "}
                            {pattern.affected_industries.join(", ")}
                          </div>
                          
                          <div className="mt-4">
                            <span className="font-medium">Affected Metrics:</span>{" "}
                            {pattern.affected_metrics.join(", ")}
                          </div>
                        </AlertDescription>
                      </Alert>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Warning Signs</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="list-disc pl-5 space-y-1">
                              {pattern.warning_signs.map((sign, index) => (
                                <li key={index}>{sign}</li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Mitigation Strategies</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="list-disc pl-5 space-y-1">
                              {pattern.mitigation_strategies.map((strategy, index) => (
                                <li key={index}>{strategy}</li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <Separator className="my-6" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialHealthIndicators;
