import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface Business {
  impact: number;
}

interface Scenario {
  id: string;
  name: string;
  business_unit_impacts: Record<string, Business>;
}

interface ScenarioImpactHeatmapProps {
  scenarios: Scenario[];
  targetMetric: string;
}

export const ScenarioImpactHeatmap: React.FC<ScenarioImpactHeatmapProps> = ({ scenarios, targetMetric }) => {
  // Business units to display, could come from the data or be predefined
  const businessUnits = [
    "operations",
    "finance",
    "sales",
    "marketing",
    "hr",
    "logistics",
    "it",
    "customer_service"
  ];

  // Get color for impact value (-1 to 1 scale)
  const getImpactColor = (impact: number) => {
    // Negative impact: red, Positive impact: green, Neutral: white/gray
    if (impact < 0) {
      // Convert to 0-100 scale for red intensity (darker red = more negative)
      const intensity = Math.min(100, Math.abs(impact) * 100);
      return `rgba(255, 0, 0, ${intensity / 100})`;
    } else if (impact > 0) {
      // Convert to 0-100 scale for green intensity (darker green = more positive)
      const intensity = Math.min(100, impact * 100);
      return `rgba(0, 128, 0, ${intensity / 100})`;
    }
    return "rgba(200, 200, 200, 0.3)"; // Neutral gray
  };

  // Get text color based on background color intensity
  const getTextColor = (impact: number) => {
    const intensity = Math.abs(impact);
    return intensity > 0.4 ? "white" : "black";
  };

  // Format impact value for display
  const formatImpact = (impact: number) => {
    const percentage = (impact * 100).toFixed(1);
    return impact > 0 ? `+${percentage}%` : `${percentage}%`;
  };

  return (
    <div className="space-y-6">
      <div className="text-muted-foreground text-sm mb-4">
        This heatmap shows the impact of each scenario on different business units. 
        <br />
        Red indicates negative impact, green indicates positive impact. Darker colors represent stronger impacts.
      </div>
      
      <div className="grid grid-cols-[200px_repeat(auto-fill,minmax(120px,1fr))] gap-2">
        {/* Header row with scenario names */}
        <div className="font-semibold">Business Unit</div>
        {scenarios.map(scenario => (
          <div key={scenario.id} className="font-semibold text-center truncate" title={scenario.name}>
            {scenario.name}
          </div>
        ))}
        
        {/* Data rows */}
        {businessUnits.map(unit => (
          <React.Fragment key={unit}>
            <div className="capitalize py-2">{unit.replace('_', ' ')}</div>
            
            {scenarios.map(scenario => {
              const impact = scenario.business_unit_impacts[unit]?.impact || 0;
              return (
                <div 
                  key={`${scenario.id}-${unit}`} 
                  className="text-center p-2 flex items-center justify-center"
                  style={{ 
                    backgroundColor: getImpactColor(impact),
                    color: getTextColor(impact)
                  }}
                >
                  {formatImpact(impact)}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-center items-center space-x-6 mt-4">
        <div className="flex items-center">
          <div className="w-4 h-4 mr-2" style={{ backgroundColor: "rgba(255, 0, 0, 0.7)" }}></div>
          <span className="text-sm">Strong Negative</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 mr-2" style={{ backgroundColor: "rgba(255, 0, 0, 0.3)" }}></div>
          <span className="text-sm">Mild Negative</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 mr-2" style={{ backgroundColor: "rgba(200, 200, 200, 0.3)" }}></div>
          <span className="text-sm">Neutral</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 mr-2" style={{ backgroundColor: "rgba(0, 128, 0, 0.3)" }}></div>
          <span className="text-sm">Mild Positive</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 mr-2" style={{ backgroundColor: "rgba(0, 128, 0, 0.7)" }}></div>
          <span className="text-sm">Strong Positive</span>
        </div>
      </div>
    </div>
  );
};
