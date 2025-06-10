import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CashFlowStatement, CashFlowItem } from "types"; // Assuming these types are generated

// --- Helper Functions ---

// Basic currency formatter (customize as needed)
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-AU", { // Adjust locale as needed
    style: "currency",
    currency: "AUD", // Adjust currency as needed
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// --- Component Props ---

interface Props {
  statement: CashFlowStatement | null;
  title?: string;
  description?: string;
}

// --- Sub-Components (Optional, for better structure) ---

interface CashFlowSectionDisplayProps {
  sectionName: string;
  items: CashFlowItem[];
  subTotal: number;
}

const CashFlowSectionDisplay: React.FC<CashFlowSectionDisplayProps> = ({ sectionName, items, subTotal }) => (
  <div>
    <h3 className="font-semibold text-lg mb-2">{sectionName}</h3>
    <div className="space-y-1 text-sm pl-4 border-l ml-2 mb-2">
      {items.map((item, index) => (
        <div key={`${sectionName}-${index}-${item.item_name}`} className="flex justify-between">
          <span>{item.item_name}</span>
          <span>{formatCurrency(item.amount)}</span>
        </div>
      ))}
    </div>
    <div className="flex justify-between font-medium border-t pt-1 mt-1">
      <span>Subtotal {sectionName.replace("Cash Flow from ", "")}</span>
      <span>{formatCurrency(subTotal)}</span>
    </div>
  </div>
);


// --- Main Component ---

export const CashFlowWaterfall: React.FC<Props> = ({
  statement,
  title = "Cash Flow Statement",
  description = "Summary of cash inflows and outflows for the period.",
}) => {
  if (!statement) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No cash flow data available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Opening Cash */}
        <div className="flex justify-between font-medium text-lg">
           <span>Opening Cash Balance</span>
           <span>{formatCurrency(statement.opening_cash)}</span>
        </div>

        {/* Operating Activities */}
        <CashFlowSectionDisplay 
            sectionName={statement.operating_activities.section_name}
            items={statement.operating_activities.items}
            subTotal={statement.operating_activities.sub_total}
        />

        {/* Investing Activities */}
        <CashFlowSectionDisplay 
            sectionName={statement.investing_activities.section_name}
            items={statement.investing_activities.items}
            subTotal={statement.investing_activities.sub_total}
        />

        {/* Financing Activities */}
        <CashFlowSectionDisplay 
            sectionName={statement.financing_activities.section_name}
            items={statement.financing_activities.items}
            subTotal={statement.financing_activities.sub_total}
        />

        {/* Summary Section */}
         <div className="border-t pt-4 mt-6 space-y-2">
            <div className="flex justify-between font-semibold text-lg">
             <span>Net Change in Cash</span>
             <span>{formatCurrency(statement.net_change_in_cash)}</span>
           </div>
            <div className="flex justify-between font-bold text-xl border-t pt-2 mt-2">
             <span>Closing Cash Balance (Calculated)</span>
             <span>{formatCurrency(statement.closing_cash)}</span>
           </div>
            {statement.reconciliation_difference != null && statement.reconciliation_difference !== 0 && (
             <div className="flex justify-between text-sm text-destructive pt-1 font-medium">
               <span>(Reconciliation Difference)</span>
               <span>({formatCurrency(statement.reconciliation_difference)})</span>
             </div>
           )}
         </div>

      </CardContent>
      {/* <CardFooter>
         Optional footer content
      </CardFooter> */}
    </Card>
  );
};

// Default export for lazy loading or standard imports
export default CashFlowWaterfall;
