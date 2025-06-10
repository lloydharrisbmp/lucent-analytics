import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table"; // Added Table imports
import { toast } from "sonner";
import brain from "brain";
import {
  BusinessEntityBase,
  ConsolidatedFinancials,
} from "types";

// Helper component to render dictionary data in a table
interface DictTableProps {
  title: string;
  data: { [key: string]: number } | null | undefined;
  keyHeader?: string;
  valueHeader?: string;
  formatValue?: (value: number) => string | number;
}

const DictTable: React.FC<DictTableProps> = ({
  title,
  data,
  keyHeader = "Item",
  valueHeader = "Amount",
  formatValue = (value) => value.toFixed(2), // Default formatting
}) => {
  if (!data || Object.keys(data).length === 0) {
    return <p className="text-muted-foreground text-sm">No {title.toLowerCase()} data available.</p>;
  }

  return (
    <Table>
      <TableCaption>{title}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>{keyHeader}</TableHead>
          <TableHead className="text-right">{valueHeader}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Object.entries(data).map(([key, value]) => (
          <TableRow key={key}>
            <TableCell className="font-medium">{key}</TableCell>
            <TableCell className="text-right">{formatValue(value)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};


const ConsolidationPage = () => {
  const [consolidationGroupId, setConsolidationGroupId] = useState<string>("");
  const [period, setPeriod] = useState<string>("");
  const [dataType, setDataType] = useState<string>("trial_balance");
  const [possibleGroups, setPossibleGroups] = useState<BusinessEntityBase[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetchingGroups, setIsFetchingGroups] = useState<boolean>(true);
  const [results, setResults] = useState<ConsolidatedFinancials | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEntities = async () => {
      setIsFetchingGroups(true);
      try {
        const response = await brain.list_business_entities();
        const data = await response.json();
        const groups = data.entities.filter((entity: BusinessEntityBase) => !entity.parent_entity_id);
        setPossibleGroups(groups);
        setError(null);
      } catch (err) {
        console.error("Error fetching entities:", err);
        setError("Failed to load potential consolidation groups.");
        toast.error("Failed to load potential consolidation groups.");
      } finally {
        setIsFetchingGroups(false);
      }
    };
    fetchEntities();
  }, []);

  const handleRunConsolidation = async () => {
    if (!consolidationGroupId || !period) {
      toast.warning("Please select a group and enter a period.");
      return;
    }
    setIsLoading(true);
    setResults(null);
    setError(null);

    try {
      const organizationId = "org_test"; // Placeholder - NEEDS TO BE DYNAMIC

      const response = await brain.calculate_consolidation({
        consolidation_group_id: consolidationGroupId,
        organization_id: organizationId,
        period: period,
        data_type: dataType,
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data: ConsolidatedFinancials = await response.json();
      setResults(data);
      toast.success("Consolidation successful!");

    } catch (err: any) {
      console.error("Error running consolidation:", err);
      const errorMessage = err.message || "An unexpected error occurred during consolidation.";
      setError(errorMessage);
      toast.error(`Consolidation failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate total mismatch for styling
  const totalMismatch = results?.elimination_mismatch
    ? Object.values(results.elimination_mismatch).reduce((sum, val) => sum + Math.abs(val), 0)
    : 0;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Financial Consolidation</h1>

      {/* Input Card - No changes needed */}
      <Card>
         <CardHeader>
           <CardTitle>Run Consolidation</CardTitle>
           <CardDescription>
             Select the parent entity, period, and data type to consolidate.
           </CardDescription>
         </CardHeader>
         <CardContent className="space-y-4">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div>
               <Label htmlFor="consolidation-group">Consolidation Group (Parent)</Label>
               <Select
                 value={consolidationGroupId}
                 onValueChange={setConsolidationGroupId}
                 disabled={isLoading || isFetchingGroups || possibleGroups.length === 0}
               >
                 <SelectTrigger id="consolidation-group">
                   <SelectValue placeholder="Select group..." />
                 </SelectTrigger>
                 <SelectContent>
                   {possibleGroups.map((group) => (
                     <SelectItem key={group.id} value={group.id}>
                       {group.name}
                     </SelectItem>
                   ))}
                   {possibleGroups.length === 0 && !isFetchingGroups && (
                      <SelectItem value="no-groups" disabled>No groups found</SelectItem>
                   )}
                    {isFetchingGroups && (
                      <SelectItem value="loading" disabled>Loading groups...</SelectItem>
                   )}
                 </SelectContent>
               </Select>
             </div>
             <div>
               <Label htmlFor="period">Period</Label>
               <Input
                 id="period"
                 placeholder="e.g., 2024-Q4 or 2024-12"
                 value={period}
                 onChange={(e) => setPeriod(e.target.value)}
                 disabled={isLoading}
               />
             </div>
              <div>
               <Label htmlFor="data-type">Data Type</Label>
                <Select
                 value={dataType}
                 onValueChange={setDataType}
                 disabled={isLoading}
               >
                 <SelectTrigger id="data-type">
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="trial_balance">Trial Balance</SelectItem>
                 </SelectContent>
               </Select>
             </div>
           </div>
         </CardContent>
         <CardFooter>
           <Button onClick={handleRunConsolidation} disabled={isLoading || isFetchingGroups}>
             {isLoading ? "Running..." : "Run Consolidation"}
           </Button>
         </CardFooter>
       </Card>

      {/* Error Card - No changes needed */}
      {error && (
        <Card className="border-destructive bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Results Display */}
      {results && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Consolidation Results for {results.period}</CardTitle>
              <CardDescription>Consolidated Trial Balance</CardDescription>
            </CardHeader>
            <CardContent>
              <DictTable
                title="Consolidated Trial Balance"
                data={results.consolidated_trial_balance}
                keyHeader="Account Code"
                valueHeader="Balance"
              />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className={totalMismatch > 0.01 ? "border-orange-500 bg-orange-50" : ""}>
              <CardHeader>
                <CardTitle>Eliminations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <DictTable
                    title="Elimination Adjustments"
                    data={results.elimination_details}
                    keyHeader="Account Code"
                    valueHeader="Adjustment Amount"
                 />
                 <div>
                    <h4 className="font-semibold mb-2">Elimination Mismatch</h4>
                    <DictTable
                      title="Mismatch Breakdown"
                      data={results.elimination_mismatch}
                      keyHeader="Mismatch Type"
                      valueHeader="Amount"
                   />
                   {totalMismatch > 0.01 && (
                      <p className="text-sm text-orange-700 mt-2">Note: A mismatch indicates intercompany balances do not net to zero.</p>
                   )}
                 </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Non-Controlling Interest (NCI)</CardTitle>
                <CardDescription>Portion attributable to minority shareholders.</CardDescription>
              </CardHeader>
              <CardContent>
                <DictTable
                    title="NCI Calculation"
                    data={results.non_controlling_interest}
                    keyHeader="Account Code"
                    valueHeader="NCI Amount"
                 />
              </CardContent>
            </Card>

            {/* CTA Display Card */}
            <Card>
              <CardHeader>
                <CardTitle>Currency Translation Adjustment (CTA)</CardTitle>
                <CardDescription>Impact of exchange rate fluctuations on equity.</CardDescription>
              </CardHeader>
              <CardContent>
                {results.currency_translation_adjustment !== null && results.currency_translation_adjustment !== undefined ? (
                  <p className="text-lg font-semibold">{results.currency_translation_adjustment.toFixed(2)}</p>
                ) : (
                  <p className="text-muted-foreground text-sm">No CTA calculated.</p>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      )}
    </div>
  );
};

export default ConsolidationPage;
