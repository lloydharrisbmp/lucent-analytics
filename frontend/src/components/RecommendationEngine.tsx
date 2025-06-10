import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Spinner } from "components/Spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Import types from generated API client
import { ActionImpact, RecommendedAction, RecommendationResponse } from "types";

interface Props {
  recommendations: RecommendationResponse | null;
  loading: boolean;
  error: string | null;
  onRegenerateRecommendations?: () => void;
  focusCategory?: string | null;
}

const RecommendationEngine: React.FC<Props> = ({
  recommendations,
  loading,
  error,
  onRegenerateRecommendations,
  focusCategory
}) => {
  const [expandedImpacts, setExpandedImpacts] = useState<string[]>([]);

  const toggleImpactExpansion = (actionTitle: string) => {
    if (expandedImpacts.includes(actionTitle)) {
      setExpandedImpacts(expandedImpacts.filter(title => title !== actionTitle));
    } else {
      setExpandedImpacts([...expandedImpacts, actionTitle]);
    }
  };

  const getPriorityLabel = (priority: number): { label: string; color: string } => {
    switch (priority) {
      case 1:
        return { label: "Critical", color: "bg-red-500 text-white" };
      case 2:
        return { label: "High", color: "bg-orange-500 text-white" };
      case 3:
        return { label: "Medium", color: "bg-yellow-500 text-white" };
      case 4:
        return { label: "Low", color: "bg-blue-500 text-white" };
      case 5:
        return { label: "Optional", color: "bg-gray-500 text-white" };
      default:
        return { label: "Unknown", color: "bg-gray-500 text-white" };
    }
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTimeframeColor = (timeframe: string): string => {
    switch (timeframe.toLowerCase()) {
      case "short-term":
        return "bg-green-100 text-green-800";
      case "medium-term":
        return "bg-blue-100 text-blue-800";
      case "long-term":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case "Profitability":
        return "bg-emerald-100 text-emerald-800";
      case "Liquidity":
        return "bg-blue-100 text-blue-800";
      case "Leverage":
        return "bg-indigo-100 text-indigo-800";
      case "Efficiency":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filter recommendations by focus category if provided
  const filteredRecommendations = recommendations?.recommendations
    ? focusCategory
      ? recommendations.recommendations.filter(rec => rec.category === focusCategory)
      : recommendations.recommendations
    : [];

  if (loading) {
    return (
      <Card className="w-full h-64 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mb-4" />
          <p>Generating recommendations based on your financial health assessment...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error Generating Recommendations</AlertTitle>
        <AlertDescription>
          {error}
          {onRegenerateRecommendations && (
            <Button variant="outline" className="mt-2" onClick={onRegenerateRecommendations}>
              Try Again
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (!recommendations || filteredRecommendations.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>
            {focusCategory 
              ? `No recommendations available for ${focusCategory} at this time.`
              : "No recommendations available at this time."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {onRegenerateRecommendations && (
            <Button onClick={onRegenerateRecommendations}>
              Generate Recommendations
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>
              {focusCategory 
                ? `${focusCategory} Improvement Recommendations` 
                : "Prioritized Recommendations"}
            </CardTitle>
            <CardDescription>
              Implementing these actions could improve your overall financial score by approximately{" "}
              <strong>{recommendations.estimated_total_score_increase.toFixed(1)}</strong> points.
            </CardDescription>
          </div>
          {onRegenerateRecommendations && (
            <Button variant="outline" onClick={onRegenerateRecommendations}>
              Regenerate
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full">
          {filteredRecommendations.map((action, index) => {
            const priorityInfo = getPriorityLabel(action.priority);
            return (
              <AccordionItem 
                key={`${action.title}-${index}`} 
                value={`${action.title}-${index}`}
                className={`mb-4 border rounded-lg overflow-hidden ${action.priority <= 2 ? "border-red-200 bg-red-50" : ""}`}
              >
                <AccordionTrigger className="px-4 py-2 hover:no-underline">
                  <div className="flex flex-col sm:flex-row sm:items-center w-full text-left">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <Badge className={`mr-2 ${priorityInfo.color}`}>
                          {priorityInfo.label}
                        </Badge>
                        <h3 className="text-lg font-semibold">{action.title}</h3>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                      <Badge className={getCategoryColor(action.category)}>
                        {action.category}
                      </Badge>
                      <Badge className={getDifficultyColor(action.difficulty)}>
                        {action.difficulty}
                      </Badge>
                      <Badge className={getTimeframeColor(action.timeframe)}>
                        {action.timeframe}
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4">
                    <p className="text-gray-700">{action.description}</p>
                    
                    <div className="mt-4">
                      <h4 className="text-md font-semibold mb-2">Estimated Impact</h4>
                      <div className="flex items-center mb-2">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
                        <span className="text-sm">
                          Overall score increase: <strong>{action.estimated_overall_score_increase.toFixed(1)}</strong> points
                        </span>
                      </div>
                      
                      {action.impacts.length > 0 && (
                        <div>
                          <button 
                            onClick={() => toggleImpactExpansion(action.title)}
                            className="text-sm text-blue-600 hover:text-blue-800 underline mt-1"
                          >
                            {expandedImpacts.includes(action.title) ? "Hide detailed impacts" : "Show detailed impacts"}
                          </button>
                          
                          {expandedImpacts.includes(action.title) && (
                            <div className="mt-2 bg-gray-50 p-3 rounded">
                              <h5 className="text-sm font-medium mb-2">Metric-specific impacts:</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {action.impacts.map((impact, i) => (
                                  <div key={i} className="text-sm bg-white p-2 rounded border">
                                    <p className="font-medium">{impact.metric_name}</p>
                                    <div className="flex justify-between mt-1">
                                      <span>Current: {impact.current_value.toFixed(2)}</span>
                                      <span className="text-emerald-600">→</span>
                                      <span>Projected: {impact.projected_value.toFixed(2)}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {impact.improvement_percentage > 0 ? "Improvement" : "Change"}: {Math.abs(impact.improvement_percentage).toFixed(1)}%
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
        
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-semibold mb-2">How recommendations are prioritized</h4>
          <p className="text-sm text-gray-600">{recommendations.priority_explanation}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendationEngine;