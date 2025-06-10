import React from "react";
import { Progress } from "@/components/ui/progress";

interface BenchmarkScoreGaugeProps {
  score: number;
}

export const BenchmarkScoreGauge = ({ score }: BenchmarkScoreGaugeProps) => {
  // Score should be 0-100, but ensure it's in that range
  const normalizedScore = Math.max(0, Math.min(100, score));
  
  // Determine color based on score
  const getScoreColor = () => {
    if (normalizedScore >= 75) return "bg-green-500";
    if (normalizedScore >= 50) return "bg-blue-500";
    if (normalizedScore >= 25) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  // Determine text based on score
  const getScoreDescription = () => {
    if (normalizedScore >= 75) return "Excellent";
    if (normalizedScore >= 50) return "Good";
    if (normalizedScore >= 25) return "Fair";
    return "Needs Improvement";
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <span className="text-2xl font-bold">{normalizedScore.toFixed(1)}</span>
        <span className="text-sm text-muted-foreground">/100</span>
      </div>
      <Progress value={normalizedScore} className={getScoreColor()} />
      <p className="text-sm">{getScoreDescription()}</p>
    </div>
  );
};
