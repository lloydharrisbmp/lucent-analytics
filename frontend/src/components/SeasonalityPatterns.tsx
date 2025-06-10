import React from 'react';
import { Calendar, ArrowUp, ArrowDown, TrendingUp, TrendingDown, Minus, AlertTriangle, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';

interface SeasonalityPattern {
  season: string;
  impact: string;
  description: string;
}

interface KeyDate {
  date: string;
  event: string;
  description: string;
}

interface RegionalVariation {
  region: string;
  description: string;
}

interface SeasonalityProps {
  industry: string;
  patterns: SeasonalityPattern[];
  keyDates: KeyDate[];
  eofyImpact: string;
  regionalVariations: RegionalVariation[];
}

export const SeasonalityPatterns: React.FC<SeasonalityProps> = ({
  industry,
  patterns,
  keyDates,
  eofyImpact,
  regionalVariations
}) => {
  // Helper to render impact icon
  const renderImpactIcon = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'very high':
        return <ArrowUp className="h-5 w-5 text-emerald-600" />;
      case 'high':
        return <TrendingUp className="h-5 w-5 text-emerald-500" />;
      case 'moderate-high':
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case 'moderate':
        return <Minus className="h-5 w-5 text-blue-400" />;
      case 'low-moderate':
        return <TrendingDown className="h-5 w-5 text-orange-400" />;
      case 'low':
        return <TrendingDown className="h-5 w-5 text-orange-500" />;
      case 'very low':
        return <ArrowDown className="h-5 w-5 text-red-500" />;
      case 'variable':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      default:
        return <Minus className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            {industry} Seasonality Patterns
          </CardTitle>
          <CardDescription>
            Typical business patterns throughout the Australian financial year
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="seasonal">
            <TabsList className="mb-4">
              <TabsTrigger value="seasonal">Seasonal Patterns</TabsTrigger>
              <TabsTrigger value="key-dates">Key Dates</TabsTrigger>
              <TabsTrigger value="regional">Regional Variations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="seasonal">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Seasonal Business Patterns</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Season</TableHead>
                      <TableHead>Business Impact</TableHead>
                      <TableHead className="hidden md:table-cell">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patterns.map((pattern, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{pattern.season}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {renderImpactIcon(pattern.impact)}
                            <span className="ml-2">{pattern.impact}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{pattern.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                <h3 className="text-lg font-medium mt-6">EOFY Impact</h3>
                <div className="p-4 border rounded-md bg-muted/50">
                  <p>{eofyImpact}</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="key-dates">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Critical Business Dates</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date/Period</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead className="hidden md:table-cell">Impact</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {keyDates.map((date, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{date.date}</TableCell>
                        <TableCell>{date.event}</TableCell>
                        <TableCell className="hidden md:table-cell">{date.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="regional">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Regional Variations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {regionalVariations.map((variation, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0 text-muted-foreground" />
                          <div>
                            <h4 className="font-medium mb-1">{variation.region}</h4>
                            <p className="text-sm text-muted-foreground">{variation.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
