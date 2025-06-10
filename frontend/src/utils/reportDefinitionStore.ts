import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuidv4 } from 'uuid';

// Define types for rows and columns
export interface ReportRow {
  id: string;
  type: 'account' | 'group' | 'total'; // Expandable later
  label: string; // e.g., Account Name, "Gross Profit", etc.
  // For 'account' type, we'll need account details later
  accountId?: string;
  accountCode?: string; 
  // For 'group' or 'total', we might need calculation logic
}

export interface ReportColumn {
  id: string;
  type: 'period' | 'comparison' | 'value' | 'budget_value' | 'variance'; // Added budget/variance types
  label: string; // e.g., "Jan 2025", "Actual vs Budget"
  // Specific properties based on type
  period?: string; // e.g., "2025-01"
  field?: string; // e.g., "balance" for value/variance types
  comparisonDetails?: any; // Placeholder
}

interface ReportDefinitionState {
  rows: ReportRow[];
  columns: ReportColumn[];
  addRow: (type: ReportRow['type'], label: string, accountId?: string) => void;
  removeRow: (id: string) => void;
  updateRow: (id: string, updates: Partial<ReportRow>) => void;
  addColumn: (type: ReportColumn['type'], label: string, options?: { period?: string; field?: string }) => void;
  removeColumn: (id: string) => void;
  updateColumn: (id: string, updates: Partial<ReportColumn>) => void;
}

export const useReportDefinitionStore = create<ReportDefinitionState>()(
  immer((set) => ({
    rows: [],
    columns: [],

    // Row Actions
    addRow: (type, label, accountId) => {
      set((state) => {
        const newRow: ReportRow = {
          id: uuidv4(),
          type,
          label,
          accountId: type === 'account' ? accountId : undefined,
        };
        state.rows.push(newRow);
      });
    },
    removeRow: (id) => {
      set((state) => {
        state.rows = state.rows.filter((row) => row.id !== id);
      });
    },
    updateRow: (id, updates) => {
      set((state) => {
        const rowIndex = state.rows.findIndex((row) => row.id === id);
        if (rowIndex !== -1) {
          state.rows[rowIndex] = { ...state.rows[rowIndex], ...updates };
        }
      });
    },

    // Column Actions
    addColumn: (type, label, options) => {
      set((state) => {
        const newColumn: ReportColumn = {
          id: uuidv4(),
          type,
          label,
          period: options?.period,
          field: options?.field,
          // comparisonDetails: type === 'comparison' ? {} : undefined, // Keep placeholder if needed
        };
        state.columns.push(newColumn);
      });
    },
    removeColumn: (id) => {
      set((state) => {
        state.columns = state.columns.filter((col) => col.id !== id);
      });
    },
    updateColumn: (id, updates) => {
      set((state) => {
        const colIndex = state.columns.findIndex((col) => col.id === id);
        if (colIndex !== -1) {
          state.columns[colIndex] = { ...state.columns[colIndex], ...updates };
        }
      });
    },
  }))
);
