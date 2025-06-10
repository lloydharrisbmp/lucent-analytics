import React, { useState, useEffect, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import brain from "brain";
import {
  CashFlowStatement,
  PeriodFinancialsInput,
  MappedAccountData,
} from "types";
import { CashFlowWaterfall } from "components/CashFlowWaterfall";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { CommentThread } from "components/CommentThread"; // Import CommentThread

// --- Placeholder Data ---
// Create realistic placeholder data matching PeriodFinancialsInput structure
const createPlaceholderData = (): PeriodFinancialsInput => {
  // Placeholder P&L Data
  const plData: MappedAccountData[] = [
    { system_category: "REVENUE_SALES", value: 100000 },
    { system_category: "COGS_MATERIAL", value: 40000 }, // Gross Profit: 60000
    { system_category: "EXPENSE_SALARIES", value: 20000 },
    { system_category: "EXPENSE_RENT", value: 5000 },
    { system_category: "DEPRECIATION_EXPENSE", value: 2000 }, // Non-cash
    { system_category: "AMORTIZATION_EXPENSE", value: 500 }, // Non-cash
    { system_category: "EXPENSE_INTEREST", value: 1000 }, // Pre-tax Profit: 31500
    // Assume 30% tax rate approx
    { system_category: "EXPENSE_TAX", value: 9450 }, // Net Income: 22050
  ];

  // Placeholder Start Balance Sheet Data
  const startBsData: MappedAccountData[] = [
    { system_category: "CASH_EQUIVALENTS", value: 10000 },
    { system_category: "ACCOUNTS_RECEIVABLE", value: 15000 },
    { system_category: "INVENTORY", value: 8000 },
    { system_category: "OTHER_CURRENT_ASSETS", value: 1000 },
    { system_category: "PPE_GROSS", value: 50000 },
    { system_category: "INTANGIBLE_ASSETS", value: 5000 },
    { system_category: "INVESTMENTS", value: 2000 },
    { system_category: "ACCOUNTS_PAYABLE", value: 7000 },
    { system_category: "OTHER_CURRENT_LIABILITIES", value: 3000 },
    { system_category: "SHORT_TERM_DEBT", value: 5000 },
    { system_category: "LONG_TERM_DEBT", value: 20000 },
    { system_category: "COMMON_STOCK", value: 10000 },
    { system_category: "ADDITIONAL_PAID_IN_CAPITAL", value: 25000 },
    { system_category: "RETAINED_EARNINGS", value: 21000 }, // Total Assets = 91000, Total Liab+Equity = 91000
  ];

  // Placeholder End Balance Sheet Data (reflecting changes based on P&L and some assumptions)
  const endBsData: MappedAccountData[] = [
    // Cash calculated by engine, but need BS value for reconciliation check
    { system_category: "CASH_EQUIVALENTS", value: 19600 }, // Target closing cash based on activities below
    { system_category: "ACCOUNTS_RECEIVABLE", value: 18000 }, // Increased
    { system_category: "INVENTORY", value: 7000 }, // Decreased
    { system_category: "OTHER_CURRENT_ASSETS", value: 1200 }, // Increased slightly
    { system_category: "PPE_GROSS", value: 58000 }, // Increased (CapEx = 8000)
    { system_category: "INTANGIBLE_ASSETS", value: 5000 }, // Unchanged
    { system_category: "INVESTMENTS", value: 1500 }, // Decreased (Sale = 500)
    { system_category: "ACCOUNTS_PAYABLE", value: 9000 }, // Increased
    { system_category: "OTHER_CURRENT_LIABILITIES", value: 2800 }, // Decreased slightly
    { system_category: "SHORT_TERM_DEBT", value: 4000 }, // Decreased (Paid down 1000)
    { system_category: "LONG_TERM_DEBT", value: 25000 }, // Increased (Borrowed 5000)
    { system_category: "COMMON_STOCK", value: 10000 }, // Unchanged
    { system_category: "ADDITIONAL_PAID_IN_CAPITAL", value: 25000 }, // Unchanged
    // Retained Earnings = Start RE + Net Income - Dividends Paid
    // Dividends Paid = Net Income - Change in RE = 22050 - (38050 - 21000) = 22050 - 17050 = 5000
    { system_category: "RETAINED_EARNINGS", value: 38050 }, // Start(21000) + NI(22050) - Dividends(5000)
    // Total Assets = 109700, Total Liab+Equity = 113850 -- discrepancy needs checking
    // Let's adjust Closing Cash for BS to balance based on Liab+Equity: 113850 - (18k+7k+1.2k+58k+5k+1.5k) = 113850 - 90700 = 23150
    // Re-setting Closing Cash to 23150 for BS balance purposes
    // { system_category: "CASH_EQUIVALENTS", value: 23150 }, // Adjusted for BS Balance
  ];
  
  // Re-calculate End Cash based on movements assumed above:
  // NI: +22050
  // Dep: +2000
  // Amort: +500
  // Change AR: -3000 (18k - 15k -> Use of cash)
  // Change Inv: +1000 (7k - 8k -> Source of cash)
  // Change OCA: -200 (1.2k - 1k -> Use of cash)
  // Change AP: +2000 (9k - 7k -> Source of cash)
  // Change OCL: -200 (2.8k - 3k -> Use of cash)
  // Op Cash Flow = 22050+2000+500-3000+1000-200+2000-200 = 24150
  //
  // Change PPE Gross: -8000 (58k - 50k -> Use of cash for purchase)
  // Change Intangibles: 0
  // Change Investments: +500 (1.5k - 2k -> Source of cash from sale)
  // Inv Cash Flow = -8000 + 500 = -7500
  //
  // Change STD: -1000 (4k - 5k -> Use of cash for repayment)
  // Change LTD: +5000 (25k - 20k -> Source of cash from borrowing)
  // Change Common Stock: 0
  // Change APIC: 0
  // Dividends Paid: -5000 (Calculated above)
  // Fin Cash Flow = -1000 + 5000 - 5000 = -1000
  //
  // Net Change = Op + Inv + Fin = 24150 - 7500 - 1000 = 15650
  // Closing Cash = Opening Cash + Net Change = 10000 + 15650 = 25650
  // Set End BS Cash to this calculated amount for consistency
   endBsData[0] = { system_category: "CASH_EQUIVALENTS", value: 25650 };

  return {
    profit_loss: plData,
    start_balance_sheet: startBsData,
    end_balance_sheet: endBsData,
  };
};

// --- Component ---

// Placeholder Entity Type (Replace with actual type if available)
interface BusinessEntity {
  id: string;
  name: string;
}

// Placeholder list of entities
const placeholderEntities: BusinessEntity[] = [
  { id: "entity1", name: "Sample Company Alpha" },
  { id: "entity2", name: "Sample Company Beta" },
  { id: "entity3", name: "Consolidated Group" },
];

const CashFlowReport: React.FC = () => {
  const [selectedEntityId, setSelectedEntityId] = useState<string | undefined>(placeholderEntities[0]?.id);
  // Using simple strings for date placeholders for now
  const [startDate, setStartDate] = useState<string>("2024-01-01"); 
  const [endDate, setEndDate] = useState<string>("2024-12-31");
  const [statementData, setStatementData] = useState<CashFlowStatement | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

    const selectedEntityName = useMemo(() => {
      return placeholderEntities.find(e => e.id === selectedEntityId)?.name || "Select Entity";
  }, [selectedEntityId]);

  // TODO: In the next step, add selectedEntityId, startDate, endDate to dependency array
  // and modify fetchData to use these values in the API call.
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedEntityId || !startDate || !endDate) {
        console.log("Skipping fetch: Missing entity or dates");
        setIsLoading(false); // Stop loading if selections are incomplete
        setError("Please select an entity and date range."); // Inform user
        setStatementData(null); // Clear any previous data
        return;
      }

      console.log(`Fetching data for Entity: ${selectedEntityId}, Start: ${startDate}, End: ${endDate}`);

      setIsLoading(true);
      setError(null);
      setStatementData(null); // Clear previous data

      try {
        // Use placeholder data for the request body
        const placeholderInput = createPlaceholderData();
        const requestBody = { period_data: placeholderInput };

        console.log("Sending request to calculate_cash_flow_endpoint with:", JSON.stringify(requestBody, null, 2));

        // Call the backend endpoint using brain client
        const response = await brain.calculate_cash_flow_endpoint(requestBody);

        if (!response.ok) {
          // Try to get error details from response body
          let errorMsg = `HTTP error! status: ${response.status}`;
          try {
              const errorBody = await response.json();
              errorMsg = errorBody.detail || JSON.stringify(errorBody) || errorMsg;
          } catch (e) {
              // Ignore if response body is not JSON or empty
          }
          throw new Error(errorMsg);
        }

        const data: CashFlowStatement = await response.json();
        setStatementData(data);
        console.log("Received cash flow statement:", data);

      } catch (err: any) {
        console.error("Failed to fetch cash flow data:", err);
        setError(err.message || "An unexpected error occurred while fetching data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedEntityId, startDate, endDate]); // Added dependencies

  // --- Rendering Logic ---

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4 p-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      );
    }

    if (error) {
      return (
         <Alert variant="destructive" className="m-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Fetching Data</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (statementData) {
      return (
        <CashFlowWaterfall
            statement={statementData}
            title="Calculated Cash Flow Statement"
            description="Generated using the indirect method from provided period data."
        />
      );
    }

    // Should not happen if not loading and no error, but as a fallback:
    return <p className="p-4 text-muted-foreground">No data available.</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Cash Flow Report</h1>

      {/* --- Selection Controls --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 border rounded-lg bg-card text-card-foreground">
        {/* Entity Selector */}
        <div className="space-y-2">
          <Label htmlFor="entity-select">Business Entity</Label>
          <Select 
            value={selectedEntityId}
            onValueChange={setSelectedEntityId}
          >
            <SelectTrigger id="entity-select">
              <SelectValue placeholder="Select Entity">{selectedEntityName}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {placeholderEntities.map((entity) => (
                <SelectItem key={entity.id} value={entity.id}>
                  {entity.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Start Date Input */}
        <div className="space-y-2">
           <Label htmlFor="start-date">Start Date</Label>
           <Input 
             id="start-date"
             type="date" // Use date type for better browser support
             value={startDate}
             onChange={(e) => setStartDate(e.target.value)}
           />
        </div>

        {/* End Date Input */}
        <div className="space-y-2">
           <Label htmlFor="end-date">End Date</Label>
           <Input 
             id="end-date"
             type="date" // Use date type for better browser support
             value={endDate}
             onChange={(e) => setEndDate(e.target.value)}
           />
        </div>
      </div>
      
      {/* --- Report Content --- */}
      <div className="mt-4">
        {renderContent()}
      </div>

      {/* --- Comment Section --- */}
      {selectedEntityId && startDate && endDate && !isLoading && !error && (
        <div className="mt-8 pt-6 border-t">
            <h2 className="text-xl font-semibold mb-4">Discussion</h2>
            <CommentThread 
                contextType="cashFlowReport" 
                contextId={`${selectedEntityId}_${startDate}_${endDate}`} 
            />
        </div>
      )}
      
    </div>
  );
};

export default CashFlowReport;
