import React, { useState, useEffect } from 'react';
import DashboardLayout from 'components/DashboardLayout';
import { SeasonalityPatterns } from 'components/SeasonalityPatterns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarClock, Info } from 'lucide-react';
import brain from 'brain';

interface SeasonalityData {
  industry: string;
  patterns: {
    season: string;
    impact: string;
    description: string;
  }[];
  key_dates: {
    date: string;
    event: string;
    description: string;
  }[];
  eofy_impact: string;
  regional_variations: {
    region: string;
    description: string;
  }[];
}

export default function BusinessSeasonality() {
  const [selectedIndustry, setSelectedIndustry] = useState<string>('default');
  const [seasonalityData, setSeasonalityData] = useState<SeasonalityData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Industry options
  const industries = [
    { value: 'default', label: 'General Australian Business' },
    { value: 'retail', label: 'Retail' },
    { value: 'hospitality', label: 'Hospitality' },
    { value: 'tourism', label: 'Tourism' },
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'construction', label: 'Construction' },
    { value: 'professional_services', label: 'Professional Services' }
  ];
  
  // Fetch seasonality data when industry changes
  useEffect(() => {
    async function fetchSeasonalityData() {
      setLoading(true);
      try {
        const response = await brain.get_industry_seasonality({ industry: selectedIndustry });
        const data = await response.json();
        setSeasonalityData(data);
      } catch (error) {
        console.error('Error fetching seasonality data:', error);
        // Fallback to default data for demo or development
        setSeasonalityData({
          industry: industries.find(i => i.value === selectedIndustry)?.label || 'General Australian Business',
          patterns: [
            { season: 'Summer (Dec-Feb)', impact: 'Variable', description: 'December busy leading up to Christmas. Significant slowdown from mid-December to late January.' },
            { season: 'Autumn (Mar-May)', impact: 'High', description: 'Full business operations resume. Easter creates a brief slowdown.' },
            { season: 'Winter (Jun-Aug)', impact: 'Variable', description: 'June extremely busy with EOFY activities. July often slower as new financial year begins.' },
            { season: 'Spring (Sep-Nov)', impact: 'High', description: 'Peak business period with few public holidays. Strong trading before Christmas.' }
          ],
          key_dates: [
            { date: 'December 25-January 26', event: 'Christmas to Australia Day', description: 'Extended period of reduced business activity' },
            { date: 'June 30', event: 'EOFY', description: 'Critical financial and tax deadline for all Australian businesses' },
            { date: 'October-November', event: 'Pre-Christmas', description: 'Planning and stock-up period before holiday season' }
          ],
          eofy_impact: 'June quarter often sees increased business spending to utilize budgets and maximize tax deductions. Cash flow planning critical around EOFY.',
          regional_variations: [
            { region: 'Northern Australia', description: 'Wet season (Nov-Apr) impacts outdoor businesses and supply chains' },
            { region: 'Tourist areas', description: 'Local economies highly synchronized with tourism patterns' }
          ]
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchSeasonalityData();
  }, [selectedIndustry]);
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Australian Business Seasonality</h1>
            <p className="text-muted-foreground mt-1">
              Understand seasonal patterns affecting cash flow and operations
            </p>
          </div>
          
          <div className="w-full md:w-64">
            <Select
              value={selectedIndustry}
              onValueChange={setSelectedIndustry}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {industries.map((industry) => (
                  <SelectItem key={industry.value} value={industry.value}>
                    {industry.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Card className="bg-muted/40">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              <CardTitle className="text-base font-medium">Why Seasonality Matters</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Understanding business seasonality is critical for accurate cash flow forecasting, inventory management, and workforce planning. Australian businesses face unique seasonal patterns influenced by the financial year ending June 30th, distinct holiday periods, and regional climate variations.</p>
          </CardContent>
        </Card>
        
        {seasonalityData && (
          <SeasonalityPatterns 
            industry={seasonalityData.industry}
            patterns={seasonalityData.patterns}
            keyDates={seasonalityData.key_dates}
            eofyImpact={seasonalityData.eofy_impact}
            regionalVariations={seasonalityData.regional_variations}
          />
        )}
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarClock className="mr-2 h-5 w-5" />
              Australian Financial Year
            </CardTitle>
            <CardDescription>
              Understanding the fiscal calendar impact on business operations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The Australian financial year runs from July 1 to June 30, creating distinct business patterns:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="p-3 pb-0">
                  <CardTitle className="text-sm font-medium">Q1: July-September</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-2">
                  <p className="text-xs text-muted-foreground">New financial year begins. Often slower start as businesses implement new budgets. September quarter BAS due in October.</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="p-3 pb-0">
                  <CardTitle className="text-sm font-medium">Q2: October-December</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-2">
                  <p className="text-xs text-muted-foreground">Increasing business activity. Pre-Christmas rush for many sectors. December quarter BAS due in February.</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="p-3 pb-0">
                  <CardTitle className="text-sm font-medium">Q3: January-March</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-2">
                  <p className="text-xs text-muted-foreground">Slow January followed by business ramp-up in February. March quarter BAS due in April. Seasonal adjustments after summer.</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="p-3 pb-0">
                  <CardTitle className="text-sm font-medium">Q4: April-June</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-2">
                  <p className="text-xs text-muted-foreground">Financial year closes. June sees increased business spending for tax purposes. June quarter BAS due in July. Critical tax planning period.</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
