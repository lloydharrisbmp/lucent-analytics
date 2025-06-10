import React, { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import { Download, Image as ImageIcon, FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "components/Spinner";
import { Button } from "@/components/ui/button"; // Add Button import
import { Toaster } from "sonner"; // Add Toaster import
import { TrendAnalysisResponse } from "types";
import { 
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { format, subMonths } from "date-fns";
import brain from "brain";


interface Props {
  companyId: string;
  companyName: string;
}

const ScoreTrendAnalysis: React.FC<Props> = ({ companyId, companyName }) => {
  const [loading, setLoading] = useState(false);
  const [trendData, setTrendData] = useState<TrendAnalysisResponse | null>(null);
  const [activeSubTab, setActiveSubTab] = useState("overall");
  const cardRef = useRef<HTMLDivElement>(null); // Ref for the card element

  useEffect(() => {
    fetchTrendData();
  }, [companyId]);

  const fetchTrendData = async () => {
    try {
      setLoading(true);
      
      // Set date range to last 6 months
      const endDate = new Date();
      const startDate = subMonths(endDate, 6);
      
      const response = await brain.analyze_score_trends({
        company_id: companyId,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      });
      
      const data = await response.json();
      setTrendData(data);
    } catch (error) {
      console.error("Error fetching trend data:", error);
      toast.error("Failed to load trend analysis");
    } finally {
      setLoading(false);
    }
  };

  // Prepare trend data for charts
  const prepareTrendChartData = () => {
    if (!trendData || !trendData.trend_points || trendData.trend_points.length === 0) {
      return [];
    }
    
    return trendData.trend_points.map(point => ({
      date: format(new Date(point.date), 'MMM dd'),
      score: point.score,
      ...point.category_scores
    }));
  };

  // Determine score direction and color
  const getScoreDirection = () => {
    if (!trendData || !trendData.trend_analysis) return { text: "Stable", color: "#eab308" };
    
    const direction = trendData.trend_analysis.direction;
    
    if (direction === "Improving") {
      return { text: "Improving", color: "#16a34a" };
    } else if (direction === "Declining") {
      return { text: "Declining", color: "#ef4444" };
    } else {
      return { text: "Stable", color: "#eab308" };
    }
  };

  const scoreDirection = getScoreDirection();

  // --- PNG Export Handler ---
  const handleExportPNG = () => {
    if (cardRef.current) {
      toast.info("Generating PNG...");
      html2canvas(cardRef.current, {
        backgroundColor: null, // Use transparent background or specify card bg
        scale: 2, // Increase resolution
        useCORS: true, // Handle potential CORS issues with images/styles
        logging: false, // Suppress console logging from html2canvas
        onclone: (document) => {
          // Ensure ResponsiveContainer charts are rendered correctly before capture
          // This might need adjustments based on specific chart behavior
        }
      })
        .then((canvas) => {
          const link = document.createElement("a");
          link.download = `${companyName}_Score_Trend_Analysis_${activeSubTab}.png`.replace(/\s+/g, "_");
          link.href = canvas.toDataURL("image/png");
          link.click();
          toast.success("PNG Exported Successfully!");
        })
        .catch((err) => {
          console.error("PNG Export Error:", err);
          toast.error("Failed to export PNG. Check console for details.");
        });
    } else {
      console.error("Card ref not found for PNG export.");
      toast.error("Could not find card element to export.");
    }
  };
  // --- End PNG Export Handler ---

  // --- CSV Export Handler ---
  const handleExportCSV = () => {
    const chartData = prepareTrendChartData();
    if (!trendData || !chartData || chartData.length === 0) {
      toast.warning("No trend data available to export.");
      return;
    }

    toast.info(`Generating CSV for ${activeSubTab} view...`);

    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    const formatValue = (value: any): string => {
        if (typeof value === 'number') return value.toFixed(2);
        if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`; // Escape quotes
        return '';
    };

    if (activeSubTab === "overall") {
      headers = ["Date", "Overall Score"];
      rows = chartData.map(point => [point.date, point.score]);
    } else if (activeSubTab === "categories") {
      // Dynamically get category keys from the first data point if available
      const firstPointCategories = chartData[0] ? Object.keys(chartData[0]).filter(key => key !== 'date' && key !== 'score') : [];
      headers = ["Date", ...firstPointCategories]; // Use dynamic keys
      rows = chartData.map(point => [
          point.date, 
          ...firstPointCategories.map(cat => point[cat] ?? '') // Handle missing category data
      ]);
    } else if (activeSubTab === "forecast") {
      headers = ["Period", "Score"];
      // Historical Data
      rows = chartData.map(point => [point.date, point.score]);
      // Forecast Data (assuming the forecast calculation logic used for the chart is accessible)
      const lastHistoricalPoint = chartData[chartData.length - 1];
      if (lastHistoricalPoint && trendData.trend_analysis) {
          const forecastScore = lastHistoricalPoint.score + (trendData.trend_analysis.slope * 3);
          rows.push(["Forecast (3 Months)", forecastScore]);
      }
    } else {
        toast.error("Unknown tab selected for CSV export.");
        return;
    }

    // Convert rows to string format with proper escaping
    const csvRows = rows.map(row => row.map(formatValue).join(","));

    const csvContent = [
      headers.join(","),
      ...csvRows,
    ].join("\n");

    try {
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${companyName}_Score_Trend_Data_${activeSubTab}.csv`.replace(/\s+/g, "_"));
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("CSV Exported Successfully!");
    } catch (err) {
      console.error("CSV Export Error:", err);
      toast.error("Failed to export CSV. Check console for details.");
    }
  };
  // --- End CSV Export Handler ---

  return (
    <Card className="w-full" ref={cardRef}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Score Trend Analysis</CardTitle>
          </div>
           <div className="flex space-x-2">
            <Button variant="outline" size="icon" onClick={handleExportPNG} title="Export Chart as PNG">
              <ImageIcon className="h-4 w-4" />
              <span className="sr-only">Export PNG</span>
            </Button>
            <Button variant="outline" size="icon" onClick={handleExportCSV} title="Export Data as CSV">
              <FileText className="h-4 w-4" />
              <span className="sr-only">Export CSV</span>
            </Button>
          </div>
        </div>
        <CardDescription>
          Analyzing financial health trends for {companyName} over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Spinner />
            <span className="ml-2">Loading trend data...</span>
          </div>
        ) : trendData ? (
          <div className="space-y-6">
            {/* Trend Summary Card */}
            <Card className="bg-gray-50">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">TREND DIRECTION</h3>
                    <p className="text-2xl font-bold" style={{ color: scoreDirection.color }}>
                      {scoreDirection.text}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">MONTHLY CHANGE</h3>
                    <p className="text-2xl font-bold" style={{ 
                      color: trendData.trend_analysis.slope > 0 ? "#16a34a" : 
                             trendData.trend_analysis.slope < 0 ? "#ef4444" : "#eab308"
                    }}>
                      {trendData.trend_analysis.slope > 0 ? "+" : ""}
                      {trendData.trend_analysis.slope.toFixed(2)} pts
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">VOLATILITY</h3>
                    <p className="text-2xl font-bold" style={{ 
                      color: trendData.trend_analysis.volatility < 3 ? "#16a34a" : 
                             trendData.trend_analysis.volatility < 7 ? "#eab308" : "#ef4444"
                    }}>
                      {trendData.trend_analysis.volatility.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-gray-600">{trendData.trend_analysis.interpretation}</p>
                </div>
              </CardContent>
            </Card>

            {/* Trend Charts */}
            <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="overall">Overall Score</TabsTrigger>
                <TabsTrigger value="categories">Categories</TabsTrigger>
                <TabsTrigger value="forecast">Forecast</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overall" className="pt-4">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Overall Score Trend</h3>
                  <p className="text-gray-600 mb-4">
                    Six-month history of your overall financial health score
                  </p>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={prepareTrendChartData()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="score" 
                          name="Overall Score" 
                          stroke="#4f46e5" 
                          fillOpacity={1} 
                          fill="url(#colorScore)" 
                          activeDot={{ r: 8 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="categories" className="pt-4">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Category Score Trends</h3>
                  <p className="text-gray-600 mb-4">
                    Comparing trends across different financial categories
                  </p>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={prepareTrendChartData()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="Profitability" 
                          stroke="#16a34a" 
                          activeDot={{ r: 8 }}
                          strokeWidth={2}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="Liquidity" 
                          stroke="#2563eb" 
                          activeDot={{ r: 8 }}
                          strokeWidth={2}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="Leverage" 
                          stroke="#9333ea" 
                          activeDot={{ r: 8 }}
                          strokeWidth={2}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="Efficiency" 
                          stroke="#f97316" 
                          activeDot={{ r: 8 }}
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="forecast" className="pt-4">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Score Forecast</h3>
                  <p className="text-gray-600 mb-4">
                    Projected financial health score based on current trends
                  </p>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          type="category"
                          allowDuplicatedCategory={false}
                        />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Line 
                          data={prepareTrendChartData()}
                          type="monotone" 
                          dataKey="score" 
                          name="Historical" 
                          stroke="#4f46e5" 
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 7 }}
                        />
                        <Line 
                          data={[...prepareTrendChartData().slice(-1), { 
                            date: "Forecast", 
                            score: prepareTrendChartData().slice(-1)[0]?.score + (trendData.trend_analysis.slope * 3)
                          }]}
                          type="monotone" 
                          dataKey="score" 
                          name="Forecast (3 Months)" 
                          stroke="#f97316" 
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={{ r: 3 }}
                          activeDot={{ r: 7 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg mt-6">
                    <h4 className="font-medium mb-2">Forecast Methodology</h4>
                    <p className="text-sm text-gray-600">
                      This forecast is based on historical trend analysis using linear regression to project future
                      performance. The forecast accounts for detected trend direction and volatility but does not
                      consider potential external market factors or planned strategic changes.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-12">
            <p>No trend data available.</p>
          </div>
        )}
      </CardContent>
      <Toaster richColors /> {/* Add Toaster for notifications */}
    </Card>
  );
};

export default ScoreTrendAnalysis;