import React from "react";
import { KPI, KPIGroup } from "utils/financial-types";
import { formatCurrency, formatPercentage, formatDecimal } from "utils/financial-data";
import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface KPIDashboardProps {
  kpiGroups: KPIGroup[];
}

export function KPIDashboard({ kpiGroups }: KPIDashboardProps) {
  const formatKPIValue = (kpi: KPI) => {
    if (kpi.unit === "%") {
      return formatPercentage(kpi.value);
    } else if (kpi.unit === "$") {
      return formatCurrency(kpi.value);
    } else if (kpi.unit === "") {
      return formatDecimal(kpi.value, 2);
    } else {
      return `${formatDecimal(kpi.value, 2)} ${kpi.unit}`;
    }
  };

  const getChangeIcon = (status?: string) => {
    if (status === "positive") {
      return <ArrowUpIcon className="h-4 w-4 text-green-600" />;
    } else if (status === "negative") {
      return <ArrowDownIcon className="h-4 w-4 text-red-600" />;
    } else {
      return <MinusIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const getChangeColorClass = (status?: string) => {
    if (status === "positive") {
      return "text-green-600";
    } else if (status === "negative") {
      return "text-red-600";
    } else {
      return "text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      {kpiGroups.map((group, index) => (
        <div key={index} className="space-y-3">
          <h3 className="text-lg font-medium">{group.title}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {group.kpis.map((kpi, kpiIndex) => (
              <Card key={kpiIndex}>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-muted-foreground">{kpi.name}</h4>
                      <div className={`flex items-center ${getChangeColorClass(kpi.status)}`}>
                        {getChangeIcon(kpi.status)}
                        <span className="ml-1 text-sm">
                          {kpi.change ? `${kpi.change > 0 ? "+" : ""}${kpi.change}%` : "0%"}
                        </span>
                      </div>
                    </div>
                    <div className="text-2xl font-bold">{formatKPIValue(kpi)}</div>
                    {kpi.description && (
                      <p className="text-xs text-muted-foreground">{kpi.description}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
