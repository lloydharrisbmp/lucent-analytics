import React from 'react';
import {
  BarChart,
  Bar,
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
type DataPoint = Record<string, string | number>;

// Define the props for the BarChartWidget component
interface Props {
  title: string;
  description?: string; // Optional description below the title
  data: DataPoint[]; // Array of data points for the chart
  xAxisKey: string; // Key in DataPoint objects to use for the X axis (categories)
  barKeys: string[]; // Array of keys in DataPoint objects, each representing a bar or bar segment
  layout?: 'horizontal' | 'vertical'; // Optional layout (default: vertical)
  stacked?: boolean; // Optional: whether bars should be stacked
  isLoading?: boolean;
  className?: string;
  // Optional: Add props for custom colors, formatting, etc.
}

export const BarChartWidget: React.FC<Props> = ({
  title,
  description,
  data,
  xAxisKey,
  barKeys,
  layout = 'vertical',
  stacked = false,
  isLoading = false,
  className,
}) => {

  // Define some placeholder colors - consider making this dynamic/prop-driven
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

  // Determine which axis is the category axis and which is the value axis based on layout
  const categoryAxisProps = layout === 'vertical' ? 
    { dataKey: xAxisKey } : 
    { dataKey: xAxisKey, type: 'category' as const };
  const valueAxisProps = layout === 'vertical' ? 
    {} : 
    { type: 'number' as const };

  const XAxisComponent = layout === 'vertical' ? XAxis : YAxis;
  const YAxisComponent = layout === 'vertical' ? YAxis : XAxis;

  return (
    <Card className={cn("h-[350px] flex flex-col", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-grow pl-2 pr-4 pb-4"> {/* Adjust padding for chart */}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout={layout}
            margin={{
              top: 5,
              right: 10,
              left: 0, 
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxisComponent 
              {...categoryAxisProps} 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              // If horizontal, labels might need more space
              width={layout === 'horizontal' ? 100 : undefined} 
              interval={layout === 'horizontal' ? 0 : undefined} // Ensure all labels show in horizontal
            />
            <YAxisComponent
              {...valueAxisProps}
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
            {barKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={COLORS[index % COLORS.length]} // Cycle through colors
                stackId={stacked ? "a" : undefined} // Apply stackId if stacked is true
                radius={[4, 4, 0, 0]} // Rounded top corners for bars
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
