import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TaxObligation } from "../utils/tax-compliance-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, FileTextIcon, AlertTriangleIcon, CheckCircleIcon } from "lucide-react";

interface Props {
  obligations: TaxObligation[];
  onObligationSelect?: (obligation: TaxObligation) => void;
  className?: string;
}

const statusColors = {
  upcoming: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  due: "bg-amber-100 text-amber-800 hover:bg-amber-200",
  overdue: "bg-red-100 text-red-800 hover:bg-red-200",
  lodged: "bg-green-100 text-green-800 hover:bg-green-200",
  paid: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
  deferred: "bg-purple-100 text-purple-800 hover:bg-purple-200",
};

const statusIcons = {
  upcoming: <CalendarIcon className="w-4 h-4 mr-1" />, 
  due: <FileTextIcon className="w-4 h-4 mr-1" />, 
  overdue: <AlertTriangleIcon className="w-4 h-4 mr-1" />, 
  lodged: <CheckCircleIcon className="w-4 h-4 mr-1" />, 
  paid: <CheckCircleIcon className="w-4 h-4 mr-1" />, 
  deferred: <CalendarIcon className="w-4 h-4 mr-1" />, 
};

const obligationTypeLabels = {
  income: "Income Tax",
  bas: "BAS",
  ias: "IAS",
  payg: "PAYG",
  fbt: "FBT",
  superannuation: "Super",
  other: "Other",
};

export function TaxObligationTimeline({ obligations, onObligationSelect, className = "" }: Props) {
  const [sortedObligations, setSortedObligations] = useState<TaxObligation[]>([]);
  const navigate = useNavigate();
  
  // Sort and filter obligations - most urgent first
  useEffect(() => {
    const sorted = [...obligations].sort((a, b) => {
      // First priority: overdue items
      if (a.status === "overdue" && b.status !== "overdue") return -1;
      if (a.status !== "overdue" && b.status === "overdue") return 1;
      
      // Second priority: due items
      if (a.status === "due" && b.status !== "due") return -1;
      if (a.status !== "due" && b.status === "due") return 1;
      
      // Then sort by due date
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
    
    setSortedObligations(sorted);
  }, [obligations]);
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  
  const getDaysRemaining = (dueDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`;
    } else if (diffDays === 0) {
      return "Due today";
    } else if (diffDays === 1) {
      return "Due tomorrow";
    } else {
      return `${diffDays} days remaining`;
    }
  };
  
  const handleObligationClick = (obligation: TaxObligation) => {
    if (onObligationSelect) {
      onObligationSelect(obligation);
    }
  };
  
  if (sortedObligations.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Tax Obligations</CardTitle>
          <CardDescription>No upcoming tax obligations found</CardDescription>
        </CardHeader>
        <CardContent className="py-2">
          <div className="flex justify-center items-center p-6 text-muted-foreground">
            <span>No tax obligations to display. Check back later.</span>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Tax Obligations Timeline</CardTitle>
        <CardDescription>Upcoming and overdue tax obligations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {sortedObligations.map((obligation) => (
            <div 
              key={obligation.id} 
              className="relative pl-6 pb-5 border-l-2 border-muted last:border-0 last:pb-0"
              onClick={() => handleObligationClick(obligation)}
            >
              <div 
                className={`absolute -left-[9px] top-0 h-[18px] w-[18px] rounded-full border-4 border-background ${obligation.status === "overdue" ? "bg-red-500" : obligation.status === "due" ? "bg-amber-500" : "bg-blue-500"}`} 
              />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-base font-medium leading-none">
                    {obligationTypeLabels[obligation.obligationType as keyof typeof obligationTypeLabels]} - {obligation.description || obligation.period.label}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Due: {formatDate(obligation.dueDate)}
                  </p>
                  <p className="text-sm font-medium mt-1">
                    ${obligation.amount.toLocaleString("en-AU", {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </p>
                </div>
                <div className="flex flex-col sm:items-end gap-2">
                  <Badge className={`${statusColors[obligation.status as keyof typeof statusColors]} flex items-center self-start sm:self-auto`}> 
                    {statusIcons[obligation.status as keyof typeof statusIcons]} 
                    {obligation.status.charAt(0).toUpperCase() + obligation.status.slice(1)}
                  </Badge>
                  <span className={`text-xs ${obligation.status === "overdue" ? "text-red-600 font-medium" : "text-muted-foreground"}`}> 
                    {getDaysRemaining(obligation.dueDate)} 
                  </span> 
                </div> 
              </div> 
            </div> 
          ))} 
        </div> 
      </CardContent> 
    </Card> 
  ); 
}
