import React from "react";
import { FinancialHighlight, FinancialHighlightProps } from "./FinancialHighlight";

export interface MetricGroupProps {
  title?: string;
  metrics: FinancialHighlightProps[];
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function MetricGroup({
  title,
  metrics,
  columns = 3,
  className = "",
}: MetricGroupProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={className}>
      {title && <h3 className="font-medium text-lg mb-3">{title}</h3>}
      <div className={`grid ${gridCols[columns]} gap-4`}>
        {metrics.map((metric, index) => (
          <FinancialHighlight key={index} {...metric} />
        ))}
      </div>
    </div>
  );
}
