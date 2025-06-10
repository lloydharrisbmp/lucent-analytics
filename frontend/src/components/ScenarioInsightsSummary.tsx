import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface ScenarioInsight {
  type: "positive" | "negative" | "neutral";
  metric: string;
  description: string;
  scenarioName: string;
  value?: string | number;
  additionalContext?: string;
}

interface ScenarioInsightsSummaryProps {
  scenarios: any[];
  targetMetric: string;
}

export const ScenarioInsightsSummary: React.FC<ScenarioInsightsSummaryProps> = ({ scenarios, targetMetric }) => {
  // Generate insights based on comparison data
  const generateInsights = (): ScenarioInsight[] => {
    if (!scenarios || scenarios.length < 2) {
      return [];
    }

    const insights: ScenarioInsight[] = [];

    // Find scenario with highest target metric value
    const sortedByTargetMetric = [...scenarios]
      .sort((a, b) => {
        const aValue = a.financial_impacts[targetMetric] || 0;
        const bValue = b.financial_impacts[targetMetric] || 0;
        return bValue - aValue; // Sort descending
      });

    if (sortedByTargetMetric.length >= 2) {
      const best = sortedByTargetMetric[0];
      const bestValue = best.financial_impacts[targetMetric];
      const runnerUp = sortedByTargetMetric[1];
      const runnerUpValue = runnerUp.financial_impacts[targetMetric];
      const percentageDiff = ((bestValue - runnerUpValue) / runnerUpValue) * 100;

      insights.push({
        type: "positive",
        metric: formatMetricName(targetMetric),
        description: `${best.name} provides the highest ${formatMetricName(targetMetric)}`,
        scenarioName: best.name,
        value: formatValue(bestValue, targetMetric),
        additionalContext: `${percentageDiff.toFixed(1)}% higher than ${runnerUp.name}`
      });
    }

    // Find scenario with best overall business unit impact
    const scenariosByBusinessImpact = [...scenarios]
      .map(scenario => {
        const impacts = scenario.business_unit_impacts || {};
        const averageImpact = Object.values(impacts).reduce(
          (sum: number, unit: any) => sum + (unit.impact || 0), 
          0
        ) / Math.max(1, Object.keys(impacts).length);

        return { ...scenario, averageImpact };
      })
      .sort((a, b) => b.averageImpact - a.averageImpact);

    if (scenariosByBusinessImpact.length >= 1) {
      const best = scenariosByBusinessImpact[0];
      
      if (best.averageImpact > 0) {
        insights.push({
          type: "positive",
          metric: "Business Units",
          description: `${best.name} has the most positive overall impact on business units`,
          scenarioName: best.name,
          value: `+${(best.averageImpact * 100).toFixed(1)}%`,
        });
      } else if (best.averageImpact < 0) {
        insights.push({
          type: "negative",
          metric: "Business Units",
          description: `All scenarios have negative impacts on business units`,
          scenarioName: best.name,
          value: `${(best.averageImpact * 100).toFixed(1)}%`,
          additionalContext: `${best.name} has the least negative impact`
        });
      }
    }

    // Find scenario with highest opportunity level if available
    const scenariosByOpportunity = [...scenarios]
      .filter(s => typeof s.opportunity_level === 'number')
      .sort((a, b) => b.opportunity_level - a.opportunity_level);

    if (scenariosByOpportunity.length > 0) {
      const best = scenariosByOpportunity[0];
      insights.push({
        type: "positive",
        metric: "Opportunity",
        description: `${best.name} presents the highest opportunity level`,
        scenarioName: best.name,
        value: best.opportunity_level.toFixed(1),
      });
    }

    // Find scenario with lowest risk level if available
    const scenariosByRisk = [...scenarios]
      .filter(s => typeof s.risk_level === 'number')
      .sort((a, b) => a.risk_level - b.risk_level);

    if (scenariosByRisk.length > 0) {
      const best = scenariosByRisk[0];
      insights.push({
        type: "positive",
        metric: "Risk",
        description: `${best.name} has the lowest risk level`,
        scenarioName: best.name,
        value: best.risk_level.toFixed(1),
      });
    }

    // Add warning insight if any scenario has high risk
    const highRiskScenarios = scenarios.filter(s => s.risk_level && s.risk_level > 0.7);
    if (highRiskScenarios.length > 0) {
      insights.push({
        type: "negative",
        metric: "Risk Warning",
        description: `${highRiskScenarios.length} scenario(s) have elevated risk levels`,
        scenarioName: highRiskScenarios.map((s: any) => s.name).join(", "),
        additionalContext: "Consider detailed risk assessment"
      });
    }
    
    // Add statistical insights from probability distributions if available
    const scenariosWithDistributions = scenarios.filter(
      s => s.probability_distributions && s.probability_distributions[targetMetric]
    );
    
    if (scenariosWithDistributions.length > 0) {
      // Find scenario with highest median/p50 value
      const bestMedianScenario = [...scenariosWithDistributions].sort((a, b) => {
        const aP50 = a.probability_distributions[targetMetric].percentiles.p50;
        const bP50 = b.probability_distributions[targetMetric].percentiles.p50;
        return bP50 - aP50;
      })[0];
      
      insights.push({
        type: "neutral",
        metric: "Statistical Median",
        description: `${bestMedianScenario.name} has the highest expected ${formatMetricName(targetMetric)}`,
        scenarioName: bestMedianScenario.name,
        value: formatValue(bestMedianScenario.probability_distributions[targetMetric].percentiles.p50, targetMetric),
      });
      
      // Find scenario with lowest downside risk (highest p10)
      const lowestDownsideRiskScenario = [...scenariosWithDistributions].sort((a, b) => {
        const aP10 = a.probability_distributions[targetMetric].percentiles.p10;
        const bP10 = b.probability_distributions[targetMetric].percentiles.p10;
        return bP10 - aP10;
      })[0];
      
      insights.push({
        type: "positive",
        metric: "Downside Protection",
        description: `${lowestDownsideRiskScenario.name} offers the best downside protection`,
        scenarioName: lowestDownsideRiskScenario.name,
        value: formatValue(lowestDownsideRiskScenario.probability_distributions[targetMetric].percentiles.p10, targetMetric),
        additionalContext: "Based on 10th percentile outcomes"
      });
    }
    
    return insights;
  };

  // Format the display value based on metric type
  const formatValue = (value: number, metric: string) => {
    if (typeof value !== 'number') return value;
    
    if (metric.includes('margin') || metric.includes('rate') || metric.includes('percentage')) {
      return `${(value * 100).toFixed(1)}%`;
    }
    return value.toLocaleString('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 });
  };

  // Format metric name for display
  const formatMetricName = (metric: string) => {
    return metric
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const insights = generateInsights();

  return (
    <div className="space-y-4">
      <div className="text-muted-foreground text-sm">
        Key insights based on scenario comparison analysis:
      </div>
      
      {insights.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No insights available. Select at least two scenarios to compare.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {insights.map((insight, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  <div 
                    className={`w-full sm:w-1/4 p-4 ${insight.type === 'positive' ? 'bg-green-100 dark:bg-green-900' : 
                      insight.type === 'negative' ? 'bg-red-100 dark:bg-red-900' : 
                      'bg-blue-100 dark:bg-blue-900'}`}
                  >
                    <div className="font-medium text-sm">{insight.metric}</div>
                    <Badge 
                      className={`mt-1 ${insight.type === 'positive' ? 'bg-green-600' : 
                        insight.type === 'negative' ? 'bg-red-600' : 
                        'bg-blue-600'}`}
                    >
                      {insight.type === 'positive' ? 'Opportunity' : 
                       insight.type === 'negative' ? 'Warning' : 
                       'Information'}
                    </Badge>
                    {insight.value && (
                      <div className="text-lg font-bold mt-2">{insight.value}</div>
                    )}
                  </div>
                  
                  <div className="p-4 sm:w-3/4">
                    <h3 className="font-semibold">{insight.description}</h3>
                    {insight.additionalContext && (
                      <p className="text-muted-foreground text-sm mt-1">
                        {insight.additionalContext}
                      </p>
                    )}
                    <div className="mt-2 text-sm font-medium">
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-muted">
                        {insight.scenarioName}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
