import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, AlertTriangle, CheckCircle, HelpCircle, TrendingUp, TrendingDown } from "lucide-react";

export type InsightType = "information" | "warning" | "success" | "neutral" | "positive" | "negative";

export interface KeyMetricInsightProps {
  title: string;
  description: string;
  type?: InsightType;
  additionalInfo?: string;
  recommendations?: string[];
  className?: string;
}

export function KeyMetricInsight({
  title,
  description,
  type = "information",
  additionalInfo,
  recommendations,
  className = "",
}: KeyMetricInsightProps) {
  const getIcon = () => {
    switch (type) {
      case "information":
        return <Info className="h-5 w-5" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5" />;
      case "success":
        return <CheckCircle className="h-5 w-5" />;
      case "positive":
        return <TrendingUp className="h-5 w-5" />;
      case "negative":
        return <TrendingDown className="h-5 w-5" />;
      default:
        return <HelpCircle className="h-5 w-5" />;
    }
  };

  const getVariant = () => {
    switch (type) {
      case "information":
        return "default";
      case "warning":
        return "destructive";
      case "success":
      case "positive":
        return "success";
      case "negative":
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <Alert variant={getVariant() as any} className={className}>
      <div className="flex">
        {getIcon()}
        <div className="ml-3 w-full">
          <AlertTitle className="font-medium mb-1">{title}</AlertTitle>
          <AlertDescription className="text-sm">
            <p>{description}</p>
            
            {additionalInfo && (
              <p className="mt-2 text-sm">{additionalInfo}</p>
            )}
            
            {recommendations && recommendations.length > 0 && (
              <div className="mt-2">
                <p className="font-medium text-sm">Recommendations:</p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  {recommendations.map((recommendation, index) => (
                    <li key={index} className="text-sm">{recommendation}</li>
                  ))}
                </ul>
              </div>
            )}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}
