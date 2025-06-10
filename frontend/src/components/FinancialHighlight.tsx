import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

const highlightVariants = cva(
  "p-4 h-full",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        primary: "bg-primary/10 text-primary-foreground",
        positive: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
        negative: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
        neutral: "bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-300",
      },
      size: {
        default: "",
        sm: "text-sm",
        lg: "text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface FinancialHighlightProps extends VariantProps<typeof highlightVariants> {
  title: string;
  value: string | number;
  previousValue?: string | number;
  percentChange?: number;
  footer?: string;
  icon?: React.ReactNode;
  formatter?: (value: string | number) => string;
  className?: string;
}

export function FinancialHighlight({
  title,
  value,
  previousValue,
  percentChange,
  footer,
  icon,
  formatter = (val) => String(val),
  variant = "default",
  size = "default",
  className,
}: FinancialHighlightProps) {
  // Determine trend direction
  let TrendIcon = Minus;
  let trendLabel = "No change";
  let trendClass = "text-gray-400";
  
  if (percentChange !== undefined) {
    if (percentChange > 0) {
      TrendIcon = TrendingUp;
      trendLabel = `+${percentChange.toFixed(1)}%`;
      trendClass = "text-green-500";
    } else if (percentChange < 0) {
      TrendIcon = TrendingDown;
      trendLabel = `${percentChange.toFixed(1)}%`;
      trendClass = "text-red-500";
    }
  }

  return (
    <Card className={className}>
      <CardContent className={cn(highlightVariants({ variant, size }), "p-4")}>
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-medium">{title}</h3>
            {icon && <div className="text-muted-foreground">{icon}</div>}
          </div>
          
          <div className="my-1">
            <div className="text-2xl font-bold">{formatter(value)}</div>
            
            {(previousValue !== undefined || percentChange !== undefined) && (
              <div className="flex items-center gap-1 mt-1">
                {previousValue !== undefined && (
                  <span className="text-xs text-muted-foreground">
                    Prev: {formatter(previousValue)}
                  </span>
                )}
                
                {percentChange !== undefined && (
                  <div className={`flex items-center text-xs ${trendClass}`}>
                    <TrendIcon className="h-3 w-3 mr-1" />
                    <span>{trendLabel}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {footer && (
            <div className="mt-auto pt-2 text-xs text-muted-foreground">
              {footer}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
