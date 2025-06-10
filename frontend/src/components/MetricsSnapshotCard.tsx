import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tooltip } from "@/components/ui/tooltip";
import { FinancialMetric, CategoryScore } from "types";
import { ArrowDownIcon, ArrowUpIcon, ArrowRightIcon } from "lucide-react";

interface Props {
  metrics: FinancialMetric[];
  categoryData: CategoryScore;
  category: string;
}

const MetricsSnapshotCard: React.FC<Props> = ({
  metrics,
  categoryData,
  category
}) => {
  // Filter metrics related to this category
  const categoryMetrics = metrics.filter(metric => 
    Object.keys(categoryData.metrics_scores).includes(metric.name)
  );
  
  // Helper function to determine the trend icon and color
  const getTrendInfo = (score: number) => {
    if (score >= 70) {
      return { icon: <ArrowUpIcon className="h-4 w-4 text-green-500" />, color: "text-green-500" };
    } else if (score >= 50) {
      return { icon: <ArrowRightIcon className="h-4 w-4 text-amber-500" />, color: "text-amber-500" };
    } else {
      return { icon: <ArrowDownIcon className="h-4 w-4 text-red-500" />, color: "text-red-500" };
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{category} Metrics</CardTitle>
        <CardDescription>
          Current values and performance scores
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categoryMetrics.map((metric) => {
            const score = categoryData.metrics_scores[metric.name] || 0;
            const trendInfo = getTrendInfo(score);
            
            return (
              <div key={metric.name} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{metric.name}</div>
                  <div className="text-sm text-gray-500">
                    Value: {metric.value.toFixed(2)}
                  </div>
                </div>
                <div className="flex items-center">
                  {trendInfo.icon}
                  <span className={`ml-1 font-medium ${trendInfo.color}`}>
                    {score.toFixed(1)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
      <CardFooter className="pt-2 border-t text-sm text-gray-500">
        {categoryData.score.toFixed(1)} overall category score
      </CardFooter>
    </Card>
  );
};

export default MetricsSnapshotCard;