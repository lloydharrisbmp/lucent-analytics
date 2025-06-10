import React, { useState, useEffect } from "react";
import { KeyMetricInsight, InsightType } from "components/KeyMetricInsight";
import { ReportSection } from "components/ReportSection";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import brain from "brain";

export interface Insight {
  title: string;
  description: string;
  type: InsightType;
  metric_name?: string;
  recommendations?: string[];
  confidence?: number;
}

export interface FinancialDataPoint {
  date: string;
  value: number;
  category?: string;
  label?: string;
}

export interface FinancialMetric {
  name: string;
  current_value: number;
  previous_value?: number;
  target_value?: number;
  unit?: string;
  data_points?: FinancialDataPoint[];
  metadata?: Record<string, any>;
}

export interface ReportInsightsProps {
  metrics: FinancialMetric[];
  reportType?: "board" | "management" | "investor" | "custom";
  industry?: string;
  timePeriod?: string;
  companySize?: string;
  className?: string;
  showSummary?: boolean;
  loading?: boolean;
}

export function ReportInsights({
  metrics,
  reportType = "board",
  industry,
  timePeriod,
  companySize,
  className = "",
  showSummary = true,
  loading = false,
}: ReportInsightsProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [summary, setSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(loading);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateInsights = async () => {
      if (!metrics || metrics.length === 0) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await brain.generate_insights({
          metrics,
          report_type: reportType,
          industry,
          time_period: timePeriod,
          company_size: companySize,
        });
        
        const data = await response.json();
        setInsights(data.insights || []);
        setSummary(data.summary || "");
      } catch (err) {
        console.error("Failed to generate insights:", err);
        setError("Failed to generate insights. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    generateInsights();
  }, [metrics, reportType, industry, timePeriod, companySize]);

  if (isLoading) {
    return (
      <div className={className}>
        <Skeleton className="h-8 w-3/4 mb-4" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full mb-4" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <KeyMetricInsight
        title="Error Generating Insights"
        description={error}
        type="warning"
        className={className}
      />
    );
  }

  if (!insights || insights.length === 0) {
    return (
      <KeyMetricInsight
        title="No Insights Available"
        description="There is insufficient data to generate meaningful insights at this time."
        type="information"
        className={className}
      />
    );
  }

  // Group insights by type for better organization
  const positiveInsights = insights.filter((i) => i.type === "positive" || i.type === "success");
  const negativeInsights = insights.filter((i) => i.type === "negative" || i.type === "warning");
  const neutralInsights = insights.filter((i) => i.type === "information" || i.type === "neutral");

  return (
    <div className={className}>
      {showSummary && summary && (
        <div className="mb-6">
          <ReportSection title="Executive Summary">
            <p className="text-base">{summary}</p>
          </ReportSection>
        </div>
      )}

      <div className="space-y-4">
        {positiveInsights.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-3">Strengths & Opportunities</h3>
            <div className="space-y-3">
              {positiveInsights.map((insight, index) => (
                <KeyMetricInsight
                  key={`positive-${index}`}
                  title={insight.title}
                  description={insight.description}
                  type={insight.type}
                  recommendations={insight.recommendations}
                />
              ))}
            </div>
          </div>
        )}

        {negativeInsights.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Areas of Concern</h3>
            <div className="space-y-3">
              {negativeInsights.map((insight, index) => (
                <KeyMetricInsight
                  key={`negative-${index}`}
                  title={insight.title}
                  description={insight.description}
                  type={insight.type}
                  recommendations={insight.recommendations}
                />
              ))}
            </div>
          </div>
        )}

        {neutralInsights.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Additional Observations</h3>
            <div className="space-y-3">
              {neutralInsights.map((insight, index) => (
                <KeyMetricInsight
                  key={`neutral-${index}`}
                  title={insight.title}
                  description={insight.description}
                  type={insight.type}
                  recommendations={insight.recommendations}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
