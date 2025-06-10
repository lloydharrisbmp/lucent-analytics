import React, { useState } from "react";
import { useReportDefinitionStore, ReportRow, ReportColumn } from "utils/reportDefinitionStore";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const COLUMN_TYPES: ReportColumn['type'][] = ['value', 'budget_value', 'variance', 'period', 'comparison'];



const ReportBuilder = () => {
  const { rows, columns, addRow, removeRow, addColumn, removeColumn } = useReportDefinitionStore();

  // Simple state for adding new items (can be expanded later)
  const [newRowLabel, setNewRowLabel] = useState("");

  const [newColumnType, setNewColumnType] = useState<ReportColumn['type']>('value');
  const [newColumnField, setNewColumnField] = useState(""); // For 'value' and 'variance' types


  const handleAddRow = () => {
    if (newRowLabel.trim()) {
      // For now, default to 'account' type for simplicity
      addRow('account', newRowLabel);
      setNewRowLabel(""); // Reset input
    }
  };

  const handleAddColumn = () => {

    if (newColumnLabel.trim()) {
      const options: { field?: string; period?: string } = {};
      if ((newColumnType === 'value' || newColumnType === 'variance') && newColumnField.trim()) {
        options.field = newColumnField.trim();
      } else if (newColumnType === 'period') {
        // Placeholder for actual period logic
        options.period = `period-${Date.now()}`;
      }
      // Add more conditions for other types like 'comparison' if needed

      addColumn(newColumnType, newColumnLabel.trim(), options);

      // Reset form
      setNewColumnLabel("");
      setNewColumnType('value');
      setNewColumnField("");
    }
  };
  
  const [newColumnLabel, setNewColumnLabel] = useState("");

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Report Builder</h1>

      {/* Rows Section */}
      <Card>
        <CardHeader>
          <CardTitle>Report Rows</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {rows.length === 0 ? (
            <p className="text-muted-foreground">No rows defined yet.</p>
          ) : (
            rows.map((row: ReportRow) => (
              <div key={row.id} className="flex items-center justify-between p-2 border rounded">
                <span>{row.label} ({row.type})</span>
                <Button variant="ghost" size="sm" onClick={() => removeRow(row.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
        <CardFooter className="flex items-end space-x-2">
          <div className="flex-grow">
            <Label htmlFor="new-row-label">New Row Label</Label>
            <Input
              id="new-row-label"
              value={newRowLabel}
              onChange={(e) => setNewRowLabel(e.target.value)}
              placeholder="e.g., Sales Revenue or Account 4000"
            />
          </div>
          <Button onClick={handleAddRow}>Add Row</Button>
        </CardFooter>
      </Card>

      {/* Columns Section */}
      <Card>
        <CardHeader>
          <CardTitle>Report Columns</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {columns.length === 0 ? (
            <p className="text-muted-foreground">No columns defined yet.</p>
          ) : (
            columns.map((col: ReportColumn) => (
              <div key={col.id} className="flex items-center justify-between p-2 border rounded">
                <span>{col.label} ({col.type})</span>
                <Button variant="ghost" size="sm" onClick={() => removeColumn(col.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </CardContent>

        <CardFooter className="flex flex-col items-stretch space-y-4 pt-4">
          <div className="flex items-end space-x-2">
             <div className="flex-grow space-y-1">
               <Label htmlFor="new-col-label">Column Label</Label>
               <Input
                 id="new-col-label"
                 value={newColumnLabel}
                 onChange={(e) => setNewColumnLabel(e.target.value)}
                 placeholder="e.g., Jan 2025 Actual or Variance"
               />
             </div>
             <div className="space-y-1">
                <Label htmlFor="new-col-type">Column Type</Label>
                 <Select value={newColumnType} onValueChange={(value) => setNewColumnType(value as ReportColumn['type'])}>
                  <SelectTrigger id="new-col-type" className="w-[180px]">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {COLUMN_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {/* Capitalize first letter for display */}
                        {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
             </div>
          </div>
          {(newColumnType === 'value' || newColumnType === 'variance') && (
            <div className="space-y-1">
              <Label htmlFor="new-col-field">Data Field (for Actual)</Label>
              <Input
                id="new-col-field"
                value={newColumnField}
                onChange={(e) => setNewColumnField(e.target.value)}
                placeholder="e.g., balance, debit, credit (from imported data)"
              />
               <p className="text-xs text-muted-foreground">Specify the field from your financial data source to use for 'Actual' values.</p>
            </div>
          )}
           {/* Add inputs for other types like 'period' selection if needed */}
          <Button onClick={handleAddColumn} className="self-end">Add Column</Button>
        </CardFooter>
      </Card>

      {/* TODO: Add controls for saving/loading definitions */}
      {/* TODO: Add preview of the report structure */}
    </div>
  );
};

export default ReportBuilder;
