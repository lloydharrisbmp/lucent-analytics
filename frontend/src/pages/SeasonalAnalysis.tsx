import React, { useState, useEffect } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "components/DateRangePicker";
import { SeasonalCashFlowReport } from "components/SeasonalCashFlowReport";
import { generateDateRanges, generateSampleSeasonalCashFlow } from "utils/financial-data";
import { DateRange } from "utils/financial-types";
import { Calendar, TrendingUp, LineChart } from "lucide-react";

export default function SeasonalAnalysis() {
  // Available industries for analysis
  const industries = [
    { id: "default", name: "General Australian Business" },
    { id: "retail", name: "Retail" },
    { id: "hospitality", name: "Hospitality" },
    { id: "agriculture", name: "Agriculture" },
    { id: "construction", name: "Construction" },
    { id: "professional_services", name: "Professional Services" },
    { id: "tourism", name: "Tourism" }
  ];
  
  // Available regions for analysis
  const regions = [
    { id: "", name: "National Average" },
    { id: "Northern Australia", name: "Northern Australia" },
    { id: "Southern Australia", name: "Southern Australia" },
    { id: "Tourist areas", name: "Tourist Areas" },
    { id: "Major CBDs", name: "Major CBDs" },
    { id: "Rural areas", name: "Rural Areas" }
  ];
  
  // State for selected options
  const [selectedIndustry, setSelectedIndustry] = useState("default");
  const [selectedRegion, setSelectedRegion] = useState("");
  
  // Get predefined date ranges and set default to current quarter
  const dateRanges = generateDateRanges();
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>(dateRanges[2]); // Current quarter by default
  
  // Generate seasonal cash flow data based on selections
  const [cashFlowData, setCashFlowData] = useState(generateSampleSeasonalCashFlow(selectedDateRange, selectedIndustry, selectedRegion));
  
  // Update cash flow data when selections change
  useEffect(() => {
    setCashFlowData(generateSampleSeasonalCashFlow(selectedDateRange, selectedIndustry, selectedRegion));
  }, [selectedDateRange, selectedIndustry, selectedRegion]);
  
  // Handle date range change
  const handleDateRangeChange = (newRange: DateRange) => {
    setSelectedDateRange(newRange);
  };
  
  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">Seasonal Cash Flow Analysis</h1>
        <DateRangePicker value={selectedDateRange} onChange={handleDateRangeChange} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium flex items-center">
              <LineChart className="h-5 w-5 mr-2" />
              Industry Selection
            </CardTitle>
            <CardDescription>Select the industry to analyze</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
              <SelectTrigger>
                <SelectValue placeholder="Select an industry" />
              </SelectTrigger>
              <SelectContent>
                {industries.map(industry => (
                  <SelectItem key={industry.id} value={industry.id}>
                    {industry.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Regional Variations
            </CardTitle>
            <CardDescription>Regional factors affect seasonal patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger>
                <SelectValue placeholder="Select a region" />
              </SelectTrigger>
              <SelectContent>
                {regions.map(region => (
                  <SelectItem key={region.id} value={region.id}>
                    {region.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Seasonal Intelligence
            </CardTitle>
            <CardDescription>Understand seasonal cash flow patterns</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center">
            <Button 
              variant="outline" 
              onClick={() => {
                // In a real app, this would navigate to documentation or guides
                alert("This would provide documentation on how to interpret seasonal data");
              }}
            >
              View Seasonal Insights
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Seasonal Cash Flow Analysis</CardTitle>
          <CardDescription>
            Understand how {industries.find(i => i.id === selectedIndustry)?.name} businesses 
            are affected by seasonal patterns {selectedRegion ? 
              `in ${selectedRegion}` : "across Australia"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SeasonalCashFlowReport data={cashFlowData} />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
