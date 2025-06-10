import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils"; // Assuming utils for clsx/tailwind-merge exists

// Define the props for the KPICard component
interface Props {
  title: string;
  value: string | number;
  unit?: string; // Optional unit (e.g., $, %, items)
  change?: string; // Optional change indicator (e.g., "+5.2%", "-10")
  changeType?: 'positive' | 'negative' | 'neutral'; // Optional type for styling the change
  isLoading?: boolean;
  className?: string; // Allow passing additional class names
}

export const KPICard: React.FC<Props> = ({
  title,
  value,
  unit = '', // Default unit to empty string
  change,
  changeType = 'neutral', // Default change type
  isLoading = false,
  className,
}) => {

  if (isLoading) {
    // Render Skeleton loader if isLoading is true
    return (
      <Card className={cn("h-[120px]", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {/* Optional: Skeleton for an icon if we add one later */}
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  // Determine color class based on changeType
  const changeColorClass = 
    changeType === 'positive' ? 'text-green-600' :
    changeType === 'negative' ? 'text-red-600' :
    'text-muted-foreground';

  return (
    <Card className={cn("h-[120px]", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {/* Optional: Placeholder for an icon */}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value}{unit && <span className="text-xs font-normal text-muted-foreground ml-1">{unit}</span>}
        </div>
        {change && (
          <p className={cn("text-xs", changeColorClass)}>
            {change} vs last period {/* Or provide more context via props */}
          </p>
        )}
         {!change && <div className="h-[16px]" /> /* Placeholder to maintain height */}
      </CardContent>
    </Card>
  );
};
