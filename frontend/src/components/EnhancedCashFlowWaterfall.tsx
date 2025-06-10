import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  LabelList,
  ReferenceArea,
} from "recharts";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import { Download, Image as ImageIcon, FileText, Calendar, BarChart2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Toaster, toast } from "sonner";

// --- Data Types ---

interface SeasonalImpact {
  description: string;
  percentage: number;
  baseAmount: number;
}

interface ChartDataItem {
  name: string;
  value: number;
  fill: string;
  isTotal?: boolean; // Flag for total bars
  label?: string; // Optional label for specific bars (like start/end totals)
  stepValue?: number; // For step-line in waterfall
  seasonalImpact?: SeasonalImpact; // Optional seasonal data
}

interface TotalDataItem {
  name: string;
  value: number;
}

interface ReferenceLineItem {
  y: number;
  label: string;
  color: string;
}

// --- Helper Functions ---

// Simple currency formatter (adapt as needed)
const formatCurrency = (value: number | undefined | null, symbol = "$") => {
  if (value === null || value === undefined) return `${symbol}0.00`;
  return `${symbol}${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// --- Custom Tooltip Component ---
// Define showSeasonalImpact globally or pass it down if needed
// For now, assuming it's accessible in this scope (e.g., via props or state)
const CustomTooltip = ({ active, payload, label, showSeasonalImpact }: any) => { // Added showSeasonalImpact
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    // Ensure item exists before proceeding
    if (!item) return null;
    
    // Define defaults for seasonal impact properties
    const seasonalImpactDesc = item.seasonalImpact?.description ?? "N/A";
    const seasonalImpactBase = item.seasonalImpact?.baseAmount ?? 0;
    const seasonalImpactPerc = item.seasonalImpact?.percentage ?? 0;
    const hasSeasonalImpact = !!item.seasonalImpact; // Boolean flag

    return (
      <div className="bg-white dark:bg-gray-800 p-4 shadow-lg rounded-md border border-blue-100 dark:border-blue-900 max-w-xs">
        <div className="flex justify-between items-center mb-1">
          <p className="font-semibold">{item.name}</p>
          {/* Use boolean flag */}
          {hasSeasonalImpact && showSeasonalImpact && (
            <Badge variant="outline" className="ml-2 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              Seasonal
            </Badge>
          )}
        </div>
        
        <p className="text-lg font-bold">
          {formatCurrency(item.value)}
        </p>
        
        {/* Use boolean flag */}
        {hasSeasonalImpact && showSeasonalImpact && (
          <div className="mt-3 pt-2 border-t text-sm">
            <p className="font-medium text-blue-600 dark:text-blue-400 flex items-center mb-1">
              <Calendar className="h-3.5 w-3.5 mr-1" />
              Seasonal Impact
            </p>
            {/* Use variable */}
            <p className="text-sm">{seasonalImpactDesc}</p> 
            <div className="mt-2 flex items-center justify-between">
              <div>
                <span className="text-sm text-muted-foreground">Base Value:</span>
                 {/* Use variable */}
                <p className="font-medium">{formatCurrency(seasonalImpactBase)}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Adjustment:</span>
                {/* Use variables */}
                <p className={`font-medium ${(item.value > seasonalImpactBase) ? "text-green-600" : "text-red-600"}`}>
                  {(item.value > seasonalImpactBase) ? '+' : ''}
                  {formatCurrency(item.value - seasonalImpactBase)}
                  <span className="text-xs ml-1">({seasonalImpactPerc >= 0 ? '+' : ''}{seasonalImpactPerc.toFixed(1)}%)</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  return null;
};
// --- End Custom Tooltip Component ---

// --- Custom Label Component ---
// Custom waterfall bar labels for significant items
const CustomizedLabel = (props: any) => {
  const { x, y, width, height, value, fill, payload } = props;
  
  // Add check for payload existence
  if (!payload) {
    return null;
  }

  // Use optional chaining and nullish coalescing here for the check
  if (payload.isTotal || !payload.seasonalImpact || Math.abs(value) < 50000) {
    return null;
  }
  
  // Use optional chaining and nullish coalescing safely get percentage
  const percentage = payload.seasonalImpact?.percentage ?? 0;

  return (
    <g>
      <text 
        x={x + width / 2} 
        y={value >= 0 ? y - 6 : y + height + 15}
        textAnchor="middle"
        fill={value >= 0 ? "#047857" : "#b91c1c"}
        fontSize={10}
        fontWeight="bold"
      >
        {percentage >= 0 ? '↑' : '↓'} {Math.abs(percentage).toFixed(1)}%
      </text>
    </g>
  );
};
// --- End Custom Label Component ---

// --- Main Chart Component ---
export interface EnhancedCashFlowWaterfallProps {
  chartData?: ChartDataItem[];
  totalsData?: TotalDataItem[];
  referenceLines?: ReferenceLineItem[];
  title?: string;
  currencySymbol?: string;
  showSeasonalImpact?: boolean;
}

export const EnhancedCashFlowWaterfall = ({
  chartData = [], // Default to empty array
  totalsData = [], // Default to empty array
  referenceLines = [], // Default to empty array
  title = "Cash Flow Waterfall",
  currencySymbol = "$",
  showSeasonalImpact = false,
}: EnhancedCashFlowWaterfallProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // --- PNG Export Handler ---
  const handleExportPNG = () => {
    if (chartContainerRef.current) {
      toast.info("Generating PNG...");
      html2canvas(chartContainerRef.current, {
        backgroundColor: null, // Use transparent background
        scale: 2, // Increase scale for better resolution
      })
        .then((canvas) => {
          const link = document.createElement("a");
          link.download = `${title.replace(/\s+/g, "_")}_Chart.png`; // Sanitize filename
          link.href = canvas.toDataURL("image/png");
          link.click();
          toast.success("PNG Exported Successfully!");
        })
        .catch((err) => {
          console.error("PNG Export Error:", err);
          toast.error("Failed to export PNG.");
        });
    } else {
      console.error("Chart container ref not found for PNG export.");
      toast.error("Could not find chart element to export.");
    }
  };
  // --- End PNG Export Handler ---

  // --- CSV Export Handler ---
  const handleExportCSV = () => {
    if (!chartData || chartData.length === 0) {
      toast.warning("No data available to export.");
      return;
    }

    toast.info("Generating CSV...");

    // Define headers
    const headers = ["Category", "Value", "StepValue", "Color", "IsTotal", "SeasonalImpactDescription", "SeasonalImpactPercentage", "SeasonalImpactBaseAmount", "Label"];
    
    // Map chartData to CSV rows
    const rows = chartData.map(item => [
      `"${item.name.replace(/"/g, "''")}"`, // Escape double quotes
      item.value,
      item.stepValue ?? '', // Use empty string if undefined
      `"${item.fill}"`, // Include fill color
      item.isTotal ? 'TRUE' : 'FALSE',
      // Use optional chaining and nullish coalescing here
      item.seasonalImpact?.description ? `"${item.seasonalImpact.description.replace(/"/g, "''")}"` : '',
      item.seasonalImpact?.percentage ?? '',
      item.seasonalImpact?.baseAmount ?? '',
      item.label ? `"${item.label.replace(/"/g, "''")}"` : ''
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(",")),
    ].join("\n");

    // Create blob and download link
    try {
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${title.replace(/\s+/g, "_")}_Data.csv`); // Sanitize filename
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("CSV Exported Successfully!");
    } catch (err) {
      console.error("CSV Export Error:", err);
      toast.error("Failed to export CSV.");
    }
  };
  // --- End CSV Export Handler ---
  
  // Calculate domain for Y-axis dynamically
  const calculateYAxisDomain = () => {
    if (!chartData || chartData.length === 0) {
      return [0, 1000]; // Default domain if no data
    }

    let minY = 0;
    let maxY = 0;

    let currentTotal = 0;
    chartData.forEach((item) => {
      if (item.isTotal) {
        currentTotal = item.value; // Reset total for actual total bars
      } else {
        currentTotal += item.value; // Accumulate changes for waterfall steps
      }
      minY = Math.min(minY, currentTotal, item.value);
      maxY = Math.max(maxY, currentTotal, item.value);
    });
    
     // Include reference lines in domain calculation
    referenceLines?.forEach(line => {
      minY = Math.min(minY, line.y);
      maxY = Math.max(maxY, line.y);
    });

    // Add padding to the domain
    const padding = Math.max(Math.abs(maxY) * 0.1, Math.abs(minY) * 0.1, 500); // Ensure minimum padding
    
    const finalMin = Math.floor((minY - padding) / 1000) * 1000; // Round down to nearest 1000
    const finalMax = Math.ceil((maxY + padding) / 1000) * 1000; // Round up to nearest 1000

    // Ensure min is not positive if actual min was negative or zero
    const adjustedMin = minY <= 0 ? Math.min(0, finalMin) : finalMin;

    return [adjustedMin, finalMax];
  };

  const yDomain = calculateYAxisDomain();

  // Prepare data for stacked bars (for waterfall effect)
  const processedData = chartData.map((item, index) => {
    if (index === 0 || item.isTotal) {
      // First item and totals start from 0
      return { ...item, valueRange: [0, item.value] };
    }

    // Find the previous item's cumulative value or the last total
    let previousValue = 0;
    for (let i = index - 1; i >= 0; i--) {
       if (chartData[i].isTotal) {
         previousValue = chartData[i].value; // Base off the last actual total if available
         // Check if the item *before* the total was positive or negative to place correctly
          if (i > 0 && chartData[i-1].value < 0) {
             // If the change leading to the total was negative, the total bar itself represents the floor
             // The next positive bar should start from this total value
             previousValue = chartData[i].value;
           } else if (i > 0 && chartData[i-1].value >= 0) {
              // If the change leading to total was positive, the total bar is the ceiling
              // The next negative bar *starts* from this total value
               previousValue = chartData[i].value;
           }
         break; 
       }
        // If no total found yet, accumulate previous non-total values relative to the start
        if(i === 0) { // If we reach the beginning without finding a total
            previousValue = chartData.slice(0, index).reduce((sum, curr) => sum + (curr.isTotal ? 0 : curr.value), 0);
        }
    }
    
    // For non-total items, calculate the range based on the previous cumulative value
    if (item.value >= 0) {
      // Positive value: starts at previous value, ends at previous + current
      return { ...item, valueRange: [previousValue, previousValue + item.value] };
    } else {
      // Negative value: starts at previous + current, ends at previous value
      return { ...item, valueRange: [previousValue + item.value, previousValue] };
    }
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center">
              <BarChart2 className="h-5 w-5 mr-2 text-primary" />
              {title}
            </CardTitle>
            <CardDescription>Waterfall analysis of cash flow movements</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleExportPNG}>
              <ImageIcon className="h-4 w-4 mr-1" />
              Export PNG
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <FileText className="h-4 w-4 mr-1" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div ref={chartContainerRef} className="bg-card p-4 rounded"> {/* Added padding and bg */}
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={processedData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis
                tickFormatter={(value) => formatCurrency(value, currencySymbol)}
                domain={yDomain}
              />
              <Tooltip 
                 content={<CustomTooltip showSeasonalImpact={showSeasonalImpact} />} // Pass showSeasonalImpact
                 cursor={{ fill: 'rgba(200, 200, 200, 0.1)' }}
              />
              <Legend />
              {referenceLines?.map((line, index) => (
                 <ReferenceArea
                    key={`ref-${index}`}
                    y1={line.y}
                    y2={line.y + 1} // Make it a very thin line essentially
                    // stroke={line.color || "#ff7300"} // Use provided color or default
                    // strokeDasharray="3 3"
                    fill={line.color || "#ff7300"}
                    fillOpacity={0.1}
                    label={{ value: line.label, position: "insideTopRight", fill: line.color || "#ff7300", fontSize: 10 }}
                    // ifOverflow="visible" // Allow label to be shown outside plot area if needed
                  />
                ))}

              <Bar dataKey="valueRange" stackId="a"> {/* Use valueRange for stacked bars */}
                 {processedData.map((entry, index) => {
                      let barFill = entry.isTotal ? "#60a5fa" : (entry.value >= 0 ? "#22c55e" : "#ef4444"); // Blue for totals, Green/Red for changes

                      // Override fill based on seasonal impact if enabled and applicable
                      if (showSeasonalImpact && entry.seasonalImpact && !entry.isTotal) {
                         if ((entry.seasonalImpact?.percentage ?? 0) > 0) {
                             barFill = '#4ade80'; // Lighter Green for positive seasonal impact
                         } else if ((entry.seasonalImpact?.percentage ?? 0) < 0) {
                             barFill = '#f87171'; // Lighter Red for negative seasonal impact
                         }
                      }
                      
                      // Stroke to highlight seasonal impact bars
                       const strokeColor = showSeasonalImpact && entry.seasonalImpact && !entry.isTotal ? "#0284c7" : "transparent";
                       const strokeW = showSeasonalImpact && entry.seasonalImpact && !entry.isTotal ? 1.5 : 0;


                      return <Cell key={`cell-${index}`} fill={barFill} stroke={strokeColor} strokeWidth={strokeW} />;
                  })}
                  {/* Add LabelList for totals */}
                   <LabelList 
                      dataKey="value" 
                      position="top" 
                      formatter={(value: number, entry: any) => entry.payload.isTotal ? formatCurrency(value, currencySymbol) : null} 
                      // filter={(entry: any) => entry.isTotal} // Only apply to total bars
                      style={{ fontSize: '11px', fill: '#334155' }} // Style as needed dark:fill-gray-300
                      offset={5} // Adjust offset as needed
                   />
                   {/* Add LabelList for seasonal impact */}
                   <LabelList dataKey="value" content={<CustomizedLabel />} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <Toaster richColors />
    </Card>
  );
};
