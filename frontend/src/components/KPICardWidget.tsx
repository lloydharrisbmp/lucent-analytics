import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react"; // Example icons

interface Props {
  title: string;
  value: string | number;
  change?: string | number;
  changeType?: "increase" | "decrease";
  description?: string; // Optional description or period
}

export const KPICardWidget: React.FC<Props> = ({
  title,
  value,
  change,
  changeType,
  description,
}) => {
  const renderChange = () => {
    if (change === undefined || change === null) return null;

    const ChangeIcon = changeType === "increase" ? ArrowUpRight : ArrowDownRight;
    const changeColor = changeType === "increase" ? "text-green-600" : "text-red-600";

    return (
      <div className={`flex items-center text-xs ${changeColor}`}>
        <ChangeIcon className="h-4 w-4 mr-1" />
        {change}
      </div>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center justify-between mt-1">
          {renderChange()}
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Example Usage (can be removed later)
/*
<KPICardWidget
  title="Total Revenue"
  value="$45,231.89"
  change="+20.1%"
  changeType="increase"
  description="from last month"
/>
<KPICardWidget
  title="Subscriptions"
  value="+2350"
  change="-180"
  changeType="decrease"
  description="from last month"
/>
<KPICardWidget
  title="Active Users"
  value="12,345"
  description="currently online"
/>
*/
