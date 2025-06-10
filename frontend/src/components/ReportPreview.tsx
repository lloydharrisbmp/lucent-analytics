import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReportComponent } from 'utils/report-builder-store';
import { BarChart3, LineChart, PieChart, DollarSign, TrendingUp, Layers, Activity, FileText } from 'lucide-react';

interface ReportPreviewProps {
  components: ReportComponent[];
  name: string;
}

const ReportPreview: React.FC<ReportPreviewProps> = ({ components, name }) => {
  // Render the components in preview mode
  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow-md print:shadow-none print:p-0">
      <div className="text-center pb-4 border-b mb-6">
        <h1 className="text-2xl font-bold">{name}</h1>
        <p className="text-muted-foreground text-sm mt-1">Generated on {new Date().toLocaleDateString()}</p>
      </div>
      
      {components.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No components added to this report yet.</p>
          <p className="text-sm mt-1">Add components to see a preview.</p>
        </div>
      ) : (
        components.map((component) => (
          <div key={component.id} className="mb-8">
            <ComponentPreview component={component} />
          </div>
        ))
      )}
      
      <div className="text-center pt-4 border-t text-xs text-muted-foreground">
        <p>Lucent Analytics • Generated with Report Builder</p>
      </div>
    </div>
  );
};

const ComponentPreview: React.FC<{ component: ReportComponent }> = ({ component }) => {
  switch (component.type) {
    case 'financialHighlights':
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <DollarSign className="h-5 w-5 mr-2 text-primary" />
              {component.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <HighlightMetric label="Revenue" value="$1,234,567" change="+12.3%" positive />
              <HighlightMetric label="Expenses" value="$876,543" change="-3.2%" positive />
              <HighlightMetric label="Profit" value="$358,024" change="+23.7%" positive />
              <HighlightMetric label="Cash Balance" value="$495,678" change="+5.4%" positive />
            </div>
          </CardContent>
        </Card>
      );
    
    case 'keyInsights':
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <TrendingUp className="h-5 w-5 mr-2 text-primary" />
              {component.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <InsightItem 
                title="Increased Revenue Growth" 
                description="Revenue has grown 12.3% compared to the same period last year, driven primarily by expansion in the eastern region." 
              />
              <InsightItem 
                title="Cost Efficiency Improvements" 
                description="Operational expenses have decreased by 3.2% due to implementation of new procurement processes and automation." 
              />
              <InsightItem 
                title="Strong Cash Position" 
                description="The current cash position represents 4.5 months of operating expenses, exceeding the industry benchmark of 3 months." 
              />
            </div>
          </CardContent>
        </Card>
      );
    
    case 'performanceTrend':
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <LineChart className="h-5 w-5 mr-2 text-primary" />
              {component.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end space-x-2">
              {[30, 45, 25, 60, 40, 80, 70].map((h, i) => (
                <div key={i} className="relative flex-1 group">
                  <div 
                    className="bg-primary/20 rounded-t w-full absolute bottom-0" 
                    style={{ height: `${h}%` }}
                  />
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-secondary px-2 py-1 rounded text-xs">
                    ${Math.floor(h * 10000)}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <div>Jan</div>
              <div>Feb</div>
              <div>Mar</div>
              <div>Apr</div>
              <div>May</div>
              <div>Jun</div>
              <div>Jul</div>
            </div>
          </CardContent>
        </Card>
      );
    
    case 'financialStatements':
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <FileText className="h-5 w-5 mr-2 text-primary" />
              {component.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Item</th>
                  <th className="text-right py-2">Current Period</th>
                  <th className="text-right py-2">Previous Period</th>
                  <th className="text-right py-2">% Change</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 font-medium">Revenue</td>
                  <td className="text-right">$1,234,567</td>
                  <td className="text-right">$1,098,765</td>
                  <td className="text-right text-green-600">+12.3%</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium">Cost of Goods</td>
                  <td className="text-right">$456,789</td>
                  <td className="text-right">$432,987</td>
                  <td className="text-right text-red-600">+5.5%</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium">Gross Profit</td>
                  <td className="text-right">$777,778</td>
                  <td className="text-right">$665,778</td>
                  <td className="text-right text-green-600">+16.8%</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium">Operating Expenses</td>
                  <td className="text-right">$419,754</td>
                  <td className="text-right">$433,654</td>
                  <td className="text-right text-green-600">-3.2%</td>
                </tr>
                <tr className="border-b font-bold">
                  <td className="py-2">Net Profit</td>
                  <td className="text-right">$358,024</td>
                  <td className="text-right">$232,124</td>
                  <td className="text-right text-green-600">+54.2%</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      );
      
    case 'metricGroup':
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Activity className="h-5 w-5 mr-2 text-primary" />
              {component.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard title="Gross Margin" value="38.4%" trend="+2.1%" />
              <MetricCard title="Operating Margin" value="17.6%" trend="+1.3%" />
              <MetricCard title="Net Profit Margin" value="12.7%" trend="+3.2%" />
            </div>
          </CardContent>
        </Card>
      );
    
    case 'cashFlow':
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Layers className="h-5 w-5 mr-2 text-primary" />
              {component.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-32 flex items-center justify-center">
                <div className="relative w-full h-px bg-primary/20">
                  <div className="absolute h-7 w-px bg-primary/60 top-0 left-0 -translate-y-1/2"></div>
                  <div className="absolute h-7 w-px bg-primary/60 top-0 left-[25%] -translate-y-1/2"></div>
                  <div className="absolute h-16 w-px bg-primary/60 bottom-0 left-[50%] translate-y-1/2"></div>
                  <div className="absolute h-7 w-px bg-primary/60 top-0 left-[75%] -translate-y-1/2"></div>
                  <div className="absolute h-7 w-px bg-primary/60 top-0 right-0 -translate-y-1/2"></div>
                  
                  <div className="absolute -top-14 left-0 text-xs text-center w-12 -ml-6">Opening<br />$250K</div>
                  <div className="absolute -top-14 left-[25%] text-xs text-center w-12 -ml-6">Revenue<br />+$350K</div>
                  <div className="absolute bottom-8 left-[50%] text-xs text-center w-12 -ml-6">Expenses<br />-$290K</div>
                  <div className="absolute -top-14 left-[75%] text-xs text-center w-12 -ml-6">Investing<br />-$80K</div>
                  <div className="absolute -top-14 right-0 text-xs text-center w-12 -ml-6">Closing<br />$230K</div>
                </div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <div>Opening Balance</div>
                <div>Closing Balance</div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    
    case 'revenueAnalysis':
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <PieChart className="h-5 w-5 mr-2 text-primary" />
              {component.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="relative w-40 h-40 mx-auto">
                  {/* Simple pie chart visualization */}
                  <div className="absolute inset-0 rounded-full border-8 border-primary/20"></div>
                  <div className="absolute inset-0 rounded-full border-8 border-transparent border-t-primary/80 border-r-primary/60"></div>
                  <div className="absolute inset-4 rounded-full bg-background flex items-center justify-center">
                    <div className="text-lg font-bold">$1.23M</div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <RevenueSource name="Product A" amount="$623,450" percentage="50.5%" color="bg-primary/80" />
                <RevenueSource name="Product B" amount="$352,123" percentage="28.5%" color="bg-primary/60" />
                <RevenueSource name="Product C" amount="$185,994" percentage="15.1%" color="bg-primary/40" />
                <RevenueSource name="Other" amount="$73,000" percentage="5.9%" color="bg-primary/20" />
              </div>
            </div>
          </CardContent>
        </Card>
      );
      
    default:
      return (
        <Card>
          <CardHeader>
            <CardTitle>{component.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground text-center py-8">
              Preview not available for this component type
            </div>
          </CardContent>
        </Card>
      );
  }
};

// Helper components for rendering specific UI elements
const HighlightMetric: React.FC<{ label: string; value: string; change: string; positive: boolean }> = ({ 
  label, value, change, positive 
}) => (
  <div className="p-4 rounded-lg border bg-card">
    <div className="text-sm text-muted-foreground">{label}</div>
    <div className="text-2xl font-bold mt-1">{value}</div>
    <div className={`text-sm mt-1 ${positive ? 'text-green-600' : 'text-red-600'}`}>
      {change}
    </div>
  </div>
);

const InsightItem: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <div className="border-l-4 border-primary/50 pl-4 py-1">
    <h3 className="font-medium text-base">{title}</h3>
    <p className="text-sm text-muted-foreground mt-1">{description}</p>
  </div>
);

const MetricCard: React.FC<{ title: string; value: string; trend: string }> = ({ title, value, trend }) => (
  <div className="p-4 rounded-lg border bg-card">
    <div className="text-sm text-muted-foreground">{title}</div>
    <div className="text-2xl font-bold mt-1">{value}</div>
    <div className="text-sm mt-1 text-green-600">{trend}</div>
  </div>
);

const RevenueSource: React.FC<{ name: string; amount: string; percentage: string; color: string }> = ({ 
  name, amount, percentage, color 
}) => (
  <div className="flex items-center">
    <div className={`w-3 h-3 rounded-full ${color} mr-2`}></div>
    <div className="flex-1">
      <div className="flex justify-between">
        <span className="font-medium">{name}</span>
        <span>{amount}</span>
      </div>
      <div className="w-full bg-muted h-1.5 rounded-full mt-1">
        <div 
          className={`h-full rounded-full ${color}`} 
          style={{ width: percentage }}
        ></div>
      </div>
    </div>
  </div>
);

export default ReportPreview;
