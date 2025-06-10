/**
 * Utility functions for mapping financial data to tax-specific data
 */
import { 
  ProfitAndLossStatement, 
  BalanceSheet,
  CashFlowStatement,
  PLItem,
  BSItem,
  CFItem
} from './financial-types';

import {
  TaxReturn,
  TaxDeduction,
  TaxCredit,
  TaxAdjustment,
  TaxAssumption,
  BusinessEntity
} from './tax-compliance-types';

/**
 * Generate initial tax deductions from profit and loss statement
 * This maps expense items to potential tax deductions
 */
export function mapExpensesToTaxDeductions(profitAndLoss: ProfitAndLossStatement): TaxDeduction[] {
  // Mock implementation - in a real system this would use configured mapping rules
  return profitAndLoss.expenses.map((expense, index) => ({
    id: `deduction-${index + 1}`,
    category: mapExpenseCategoryToTaxCategory(expense.name),
    description: expense.name,
    amount: expense.amount,
    evidence: [] // Would need to be populated with actual attachments
  }));
}

/**
 * Map expense category names to standard tax deduction categories
 */
function mapExpenseCategoryToTaxCategory(expenseName: string): string {
  // This would be a more comprehensive mapping in a real implementation
  const mapping: Record<string, string> = {
    'Sales & Marketing': 'Advertising and Marketing',
    'Research & Development': 'Research and Development',
    'General & Administrative': 'General Administration',
    'Depreciation & Amortization': 'Depreciation',
    'Interest Expense': 'Interest',
    // Add more mappings as needed
  };
  
  return mapping[expenseName] || 'Other Deductions';
}

/**
 * Calculate estimated taxable income based on financial data
 * This is a simplified implementation for demonstration purposes
 */
export function calculateEstimatedTaxableIncome(
  profitAndLoss: ProfitAndLossStatement,
  adjustments: TaxAdjustment[] = []
): number {
  // Start with net income from P&L
  let taxableIncome = profitAndLoss.netIncome;
  
  // Apply any tax adjustments
  adjustments.forEach(adjustment => {
    if (adjustment.direction === 'add') {
      taxableIncome += adjustment.amount;
    } else {
      taxableIncome -= adjustment.amount;
    }
  });
  
  return taxableIncome;
}

/**
 * Calculate estimated tax payable based on taxable income
 * This uses simplified Australian company tax rates
 */
export function calculateEstimatedTaxPayable(
  taxableIncome: number,
  businessEntity: BusinessEntity
): number {
  // Different tax rates based on business structure
  if (businessEntity.businessStructure === 'company') {
    // Company tax rate (simplified)
    return taxableIncome * 0.25; // 25% company tax rate
  } else if (businessEntity.businessStructure === 'trust' || 
             businessEntity.businessStructure === 'partnership') {
    // Trust and partnerships typically distribute income to beneficiaries/partners
    // who pay tax at their individual rates
    // For estimation purposes, using a sample rate
    return taxableIncome * 0.30; // Estimate based on average individual rate
  } else {
    // Sole trader - progressive tax rates (simplified)
    if (taxableIncome <= 18200) {
      return 0;
    } else if (taxableIncome <= 45000) {
      return (taxableIncome - 18200) * 0.19;
    } else if (taxableIncome <= 120000) {
      return 5092 + (taxableIncome - 45000) * 0.325;
    } else if (taxableIncome <= 180000) {
      return 29467 + (taxableIncome - 120000) * 0.37;
    } else {
      return 51667 + (taxableIncome - 180000) * 0.45;
    }
  }
}

/**
 * Calculate GST collected from revenue items
 * This is a simplified calculation assuming all revenue is GST-applicable
 */
export function calculateGSTCollected(profitAndLoss: ProfitAndLossStatement): number {
  // GST is 10% of revenue in Australia
  // This is simplified - in reality, not all revenue might include GST
  const totalRevenue = profitAndLoss.revenue.reduce((sum, item) => sum + item.amount, 0);
  return totalRevenue * (1/11); // GST component is 1/11th of GST-inclusive amount
}

/**
 * Calculate GST paid on expenses
 * This is a simplified calculation assuming all expenses include GST
 */
export function calculateGSTPaid(profitAndLoss: ProfitAndLossStatement): number {
  // Simplified - in reality, not all expenses include GST or are GST-deductible
  const totalExpenses = [
    ...profitAndLoss.costOfSales,
    ...profitAndLoss.expenses
  ].reduce((sum, item) => sum + item.amount, 0);
  
  return totalExpenses * (1/11); // GST component is 1/11th of GST-inclusive amount
}

/**
 * Map financial data to initial tax return structure
 */
export function createInitialTaxReturn(
  entityId: string,
  financialYear: string,
  profitAndLoss: ProfitAndLossStatement,
  businessEntity: BusinessEntity,
  adjustments: TaxAdjustment[] = []
): TaxReturn {
  const taxableIncome = calculateEstimatedTaxableIncome(profitAndLoss, adjustments);
  const taxPayable = calculateEstimatedTaxPayable(taxableIncome, businessEntity);
  
  // Map expense items to deductions
  const deductions = mapExpensesToTaxDeductions(profitAndLoss);
  
  return {
    id: `tax-return-${entityId}-${financialYear}`,
    entityId,
    financialYear,
    status: 'notStarted',
    dueDate: new Date(), // Would be calculated based on business type and financial year
    taxableIncome,
    taxPayable,
    deductions,
    credits: [],
    schedules: [],
    attachments: []
  };
}

/**
 * Create initial BAS statement from financial data
 */
export function createInitialBASStatement(
  entityId: string,
  period: { startDate: Date; endDate: Date; label: string },
  profitAndLoss: ProfitAndLossStatement
) {
  const gstCollected = calculateGSTCollected(profitAndLoss);
  const gstPaid = calculateGSTPaid(profitAndLoss);
  const gstNetAmount = gstCollected - gstPaid;
  
  // This is a simplified implementation - actual BAS has more components
  return {
    id: `bas-${entityId}-${period.startDate.toISOString().split('T')[0]}`,
    entityId,
    period: {
      startDate: period.startDate,
      endDate: period.endDate,
      label: period.label
    },
    status: 'notStarted',
    dueDate: new Date(), // Would be calculated based on period end date
    gstCollected,
    gstPaid,
    gstNetAmount,
    salesTotal: profitAndLoss.revenue.reduce((sum, item) => sum + item.amount, 0),
    purchasesTotal: [
      ...profitAndLoss.costOfSales,
      ...profitAndLoss.expenses
    ].reduce((sum, item) => sum + item.amount, 0),
    paygWithholding: 0, // Would be calculated from payroll data
    paygInstallments: 0, // Would be based on previous tax assessment or estimates
    totalPayable: gstNetAmount > 0 ? gstNetAmount : 0,
    totalRefundable: gstNetAmount < 0 ? Math.abs(gstNetAmount) : 0,
    attachments: []
  };
}
