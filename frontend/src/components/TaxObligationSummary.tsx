import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaxObligation } from "../utils/tax-compliance-types";
import { Progress } from "@/components/ui/progress";
import { BellIcon, AlertTriangleIcon, CheckCircleIcon, Calendar, CalendarClockIcon } from "lucide-react";

interface TaxSummaryStats {
  totalCount: number;
  dueWithinMonth: number;
  overdue: number;
  completed: number;
  byType: Record<string, number>;
  estimatedTotalAmount: number;
  nextDue?: {
    id: string;
    type: string;
    dueDate: Date;
    description?: string;
    estimatedAmount: number;
  };
}

interface Props {
  obligations: TaxObligation[];
  className?: string;
}

const obligationTypeLabels: Record<string, string> = {
  income: "Income Tax",
  bas: "BAS",
  ias: "IAS",
  payg: "PAYG",
  fbt: "FBT",
  superannuation: "Super",
  other: "Other",
};

const obligationTypeColors: Record<string, string> = {
  income: "#3b82f6", // blue-500
  bas: "#10b981", // emerald-500
  ias: "#8b5cf6", // violet-500
  payg: "#f59e0b", // amber-500
  fbt: "#ec4899", // pink-500
  superannuation: "#6366f1", // indigo-500
  other: "#64748b", // slate-500
};

export function TaxObligationSummary({ obligations, className = "" }: Props) {
  const [stats, setStats] = useState<TaxSummaryStats>(() => ({
    totalCount: 0,
    dueWithinMonth: 0,
    overdue: 0,
    completed: 0,
    byType: {},
    estimatedTotalAmount: 0,
  }));

  useEffect(() => {
    if (!obligations || obligations.length === 0) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const oneMonthFromNow = new Date(today);
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
    
    let dueWithinMonth = 0;
    let overdue = 0;
    let completed = 0;
    const byType: Record<string, number> = {};
    let estimatedTotalAmount = 0;
    let nextDue: TaxSummaryStats['nextDue'] | undefined;
    let closestDueDate: Date | null = null;
    
    obligations.forEach(obligation => {
      // Track by type
      const type = obligation.obligationType;
      byType[type] = (byType[type] || 0) + 1;
      
      // Track financial totals for non-completed items
      if (obligation.status !== 'lodged' && obligation.status !== 'paid') {
        estimatedTotalAmount += obligation.amount;
      }
      
      // Track by status
      const dueDate = new Date(obligation.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      
      if (obligation.status === 'lodged' || obligation.status === 'paid') {
        completed++;
      } else if (dueDate < today) {
        overdue++;
      } else if (dueDate <= oneMonthFromNow) {
        dueWithinMonth++;
        
        // Find the next due obligation
        if (!closestDueDate || dueDate < closestDueDate) {
          closestDueDate = dueDate;
          nextDue = {
            id: obligation.id,
            type: obligation.obligationType,
            dueDate: obligation.dueDate,
            description: obligation.description,
            estimatedAmount: obligation.amount,
          };
        }
      }
    });
    
    setStats({
      totalCount: obligations.length,
      dueWithinMonth,
      overdue,
      completed,
      byType,
      estimatedTotalAmount,
      nextDue,
    });
  }, [obligations]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const calculateCompletionPercentage = () => {
    if (stats.totalCount === 0) return 0;
    return Math.round((stats.completed / stats.totalCount) * 100);
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Tax Obligation Summary</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {/* Progress and overall stats */}
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Compliance Progress</div>
            <div className="text-sm text-muted-foreground">{calculateCompletionPercentage()}% Complete</div>
          </div>
          <Progress value={calculateCompletionPercentage()} className="h-2" />
          
          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="flex flex-col items-center justify-center p-2 border rounded-lg bg-amber-50">
              <div className="text-amber-600 mb-1">
                <CalendarClockIcon className="h-5 w-5" />
              </div>
              <div className="text-2xl font-bold">{stats.dueWithinMonth}</div>
              <div className="text-xs text-muted-foreground text-center">Due Soon</div>
            </div>
            
            <div className="flex flex-col items-center justify-center p-2 border rounded-lg bg-red-50">
              <div className="text-red-600 mb-1">
                <AlertTriangleIcon className="h-5 w-5" />
              </div>
              <div className="text-2xl font-bold">{stats.overdue}</div>
              <div className="text-xs text-muted-foreground text-center">Overdue</div>
            </div>
            
            <div className="flex flex-col items-center justify-center p-2 border rounded-lg bg-green-50">
              <div className="text-green-600 mb-1">
                <CheckCircleIcon className="h-5 w-5" />
              </div>
              <div className="text-2xl font-bold">{stats.completed}</div>
              <div className="text-xs text-muted-foreground text-center">Completed</div>
            </div>
          </div>
        </div>
        
        {/* Next due obligation */}
        {stats.nextDue && (
          <div className="border rounded-lg p-3 bg-blue-50">
            <div className="flex items-center gap-2 mb-1">
              <BellIcon className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-medium text-blue-600">Next Due Obligation</h3>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <p className="text-sm font-medium">
                  {obligationTypeLabels[stats.nextDue.type] || stats.nextDue.type}
                  {stats.nextDue.description && `: ${stats.nextDue.description}`}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Due: {formatDate(stats.nextDue.dueDate)}</span>
                </div>
              </div>
              <div className="text-sm font-semibold">
                {formatCurrency(stats.nextDue.estimatedAmount)}
              </div>
            </div>
          </div>
        )}
        
        {/* Distribution by type */}
        <div>
          <h3 className="text-sm font-medium mb-2">Obligations by Type</h3>
          <div className="space-y-2">
            {Object.entries(stats.byType).length > 0 ? (
              Object.entries(stats.byType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-3 w-3 rounded-full" 
                      style={{ backgroundColor: obligationTypeColors[type] || obligationTypeColors.other }}
                    />
                    <span>{obligationTypeLabels[type] || type}</span>
                  </div>
                  <div className="font-medium">{count}</div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">No obligations found</div>
            )}
          </div>
        </div>
        
        {/* Estimated total amount */}
        <div className="border-t pt-3 mt-1">
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium">Estimated Total Due</div>
            <div className="text-lg font-bold">{formatCurrency(stats.estimatedTotalAmount)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
