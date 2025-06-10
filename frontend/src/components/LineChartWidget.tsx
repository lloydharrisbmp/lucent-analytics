import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription, // Optional description
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Define the structure for each data point in the chart
// Using a generic Record allows flexibility but consider defining more strictly if possible
type DataPoint = Record<string, string | number>;

// Define the props for the LineChartWidget component
interface Props {
  title: string;
  description?: string; // Optional description below the title
  data: DataPoint[]; // Array of data points for the chart
  xAxisKey: string; // Key in DataPoint objects to use for the X axis
  lineKeys: string[]; // Array of keys in DataPoint objects, each representing a line
  isLoading?: boolean;
  className?: string;
  // Optional: Add props for custom colors, formatting, etc.
}

export const LineChartWidget: React.FC<Props> = ({
  title,
  description,
  data,
  xAxisKey,
  lineKeys,
  isLoading = false,
  className,
}) => {

  // Define some placeholder colors for lines - consider making this dynamic/prop-driven
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE', '#00C49F'];

  if (isLoading) {
    // Render Skeleton loader if isLoading is true
    return (
      <Card className={cn("h-[350px] flex flex-col", className)}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center">
          <Skeleton className="h-[90%] w-[95%]" />
        </CardContent>
      </Card>
    );
  }
  
  if (!data || data.length === 0) {
     // Render message if no data is available
    return (
      <Card className={cn("h-[350px] flex flex-col", className)}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center">
          <p className="text-muted-foreground">No data available for this chart.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("h-[350px] flex flex-col", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-grow pl-2 pr-4 pb-4"> {/* Adjust padding for chart */} 
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 10, // Increase right margin for labels
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey={xAxisKey} 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              // Optional: Format Y-axis ticks (e.g., as currency)
              // tickFormatter={(value) => `$${value}`}
            />
            <Tooltip 
              contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  borderColor: 'hsl(var(--border))',
                  borderRadius: 'var(--radius)',
              }}
            />
            <Legend />
            {lineKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={COLORS[index % COLORS.length]} // Cycle through colors
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }} // Larger dot on hover
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
