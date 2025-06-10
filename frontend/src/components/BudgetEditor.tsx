import React, { useMemo, useState, useEffect } from "react";
import { BudgetVersion, BudgetItem } from "types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  data: BudgetVersion | null;
}

export const BudgetEditor: React.FC<Props> = ({ data, onSaveSuccess }) => {
  // Memoize processed data to avoid recalculation on every render
  const processedData = useMemo(() => {
    if (!data?.items) {
      // Corrected Line: Removed stray 'undefined'
      return { accounts: [], periods: [], budgetMap: new Map() };
    }

    const accountSet = new Set<string>();
    const periodSet = new Set<string>();
    const budgetMap = new Map<string, number>(); // Key: "account_code|period", Value: amount

    data.items.forEach((item) => {
      accountSet.add(item.account_code);
      periodSet.add(item.period);
      budgetMap.set(`${item.account_code}|${item.period}`, item.amount);
    });

    const accounts = Array.from(accountSet).sort(); // Sort accounts alphabetically
    const periods = Array.from(periodSet).sort(); // Sort periods chronologically

    return { accounts, periods, budgetMap };
  }, [data]);

  const { accounts, periods, budgetMap: initialBudgetMap } = processedData;

  // State to hold the editable budget data
  const [editableBudgetMap, setEditableBudgetMap] = useState<Map<string, number>>(new Map());
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Effect to reset editable state when the input data changes
  useEffect(() => {
    setEditableBudgetMap(new Map(initialBudgetMap));
  }, [initialBudgetMap]);

  // Handler for input changes
  const handleInputChange = (
    account: string,
    period: string,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const rawValue = event.target.value;
    const numericValue = rawValue === "" ? 0 : parseFloat(rawValue);

    if (rawValue === "" || !isNaN(numericValue)) {
      const key = `${account}|${period}`;
      setEditableBudgetMap((prevMap) => {
        const newMap = new Map(prevMap);
        newMap.set(key, isNaN(numericValue) ? 0 : numericValue);
        return newMap;
      });
    }
  };

  const handleSaveChanges = async () => {
    if (!data || isSaving) return;

    setIsSaving(true);
    toast.info("Saving budget changes...");

    const updatedItems: BudgetItem[] = [];
    editableBudgetMap.forEach((amount, key) => {
      const [account_code, period] = key.split("|");
      // Only include items that were potentially edited or had an initial value
      // Avoid sending items that were never present and have amount 0? Depends on API.
      // Let's send all keys present in the editable map for now.
       updatedItems.push({ account_code, period, amount });
    });

     // Ensure all original account/period combinations exist if API requires full set
     initialBudgetMap.forEach((initialAmount, key) => {
         if (!editableBudgetMap.has(key)) {
             const [account_code, period] = key.split("|");
             // Add back if it was originally present but deleted (value set to 0/empty)
             // If the intention is that setting to 0 removes it, this logic needs adjustment
             updatedItems.push({ account_code, period, amount: 0 });
         }
     });
     // Deduplicate items (in case initial map logic added something already in editable map)
     const finalItemsMap = new Map<string, BudgetItem>();
     updatedItems.forEach(item => finalItemsMap.set(`${item.account_code}|${item.period}`, item));
     const finalItems = Array.from(finalItemsMap.values());


    const payload: BudgetVersion = {
      // Re-check what the API actually needs. Maybe just items?
      version_id: data.version_id,
      name: data.name, // Probably not editable here
      created_at: data.created_at, // Definitely not editable
      items: finalItems,
    };

    try {
      await brain.update_budget_version({ version_id: data.version_id }, payload);
      toast.success("Budget saved successfully!");

      // Update initial map state to reflect saved changes *after* successful save
       const newInitialMap = new Map<string, number>();
       finalItems.forEach(item => {
           newInitialMap.set(`${item.account_code}|${item.period}`, item.amount);
       });
       // Trigger the useEffect to reset editable map based on new initial map
       // TODO: The below approach might not work as expected because initialBudgetMap is derived from props via useMemo.
       // Directly modifying processedData.budgetMap is not the React way.
       // Instead, we should just reset the editable map to the newly saved state.
       // processedData.budgetMap = newInitialMap; // Avoid this mutation
       setEditableBudgetMap(new Map(newInitialMap)); // Reset editable state to saved state


      if (onSaveSuccess) {
        onSaveSuccess(); // Notify parent if needed
      }
    } catch (error) {
      console.error("Failed to save budget:", error);
      toast.error("Failed to save budget. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
     if (isSaving) return; // Prevent cancel while saving
    setEditableBudgetMap(new Map(initialBudgetMap)); // Revert to original loaded state
    toast.info("Changes cancelled.");
  };

  if (!data) {
    return null; // Render nothing if no data yet
  }

  // Handle case where data exists but items might be empty or processing failed
   if (!processedData || accounts.length === 0 || periods.length === 0) {
    return (
      <div className="mt-4 p-4 border rounded-md bg-muted/20 text-center text-muted-foreground">
        No budget data available for this version, or the data format is unexpected.
      </div>
    );
  }

  // Main component render
  return (
    <div className="mt-4 border rounded-md overflow-hidden relative pb-16"> {/* Add padding-bottom */}
      <div className="overflow-x-auto"> {/* Wrapper for horizontal scroll */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 bg-background z-10 w-[150px] border-r">Account</TableHead>
              {periods.map(period => (
                <TableHead key={period} className="text-right min-w-[100px]">{period}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map(account => (
              <TableRow key={account}>
                <TableCell className="font-medium sticky left-0 bg-background z-10 w-[150px] border-r">{account}</TableCell>
                {periods.map(period => {
                  const key = `${account}|${period}`;
                  // Default to 0 if not found in the editable map
                  const amount = editableBudgetMap.get(key) ?? 0;
                  // Display empty string if amount is 0 for better UX? Or keep 0? Let's keep 0 for now.
                  const displayValue = amount.toString();

                  return (
                    <TableCell key={period} className="text-right p-1">
                      <Input
                        type="number"
                        step="any" // Allow flexible steps (e.g., decimals)
                        value={displayValue} // Bind to state
                        onChange={(e) => handleInputChange(account, period, e)}
                        className="h-8 text-right w-24" // Fixed width for inputs
                        placeholder="0" // Placeholder for clarity
                      />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
       {/* Save/Cancel Buttons - Positioned at the bottom */}
      <div className="flex justify-end gap-2 p-4 border-t bg-background sticky bottom-0 z-20">
        <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button onClick={handleSaveChanges} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};
