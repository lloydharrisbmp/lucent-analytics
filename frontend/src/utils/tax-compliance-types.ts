/**
 * Types and interfaces for tax compliance data
 */

import { DateRange } from './financial-types';

// Business Structure Types
export type BusinessStructureType = 'company' | 'trust' | 'partnership' | 'soleTrader';

// Base Business Entity Interface
export interface BusinessEntity {
  id: string;
  name: string;
  abn: string; // Australian Business Number
  businessStructure: BusinessStructureType;
  tfn: string; // Tax File Number
  registeredForGST: boolean;
  gstFrequency?: 'monthly' | 'quarterly' | 'annually';
  createdAt: Date;
  updatedAt: Date;
}

// Company-specific information
export interface Company extends BusinessEntity {
  businessStructure: 'company';
  acn: string; // Australian Company Number
  directors: Director[];
  companyType: 'proprietary' | 'public' | 'notForProfit';
  substitutedAccountingPeriod: boolean;
  sapStartDate?: Date;
  sapEndDate?: Date;
}

// Trust-specific information
export interface Trust extends BusinessEntity {
  businessStructure: 'trust';
  trustType: 'discretionary' | 'unit' | 'hybrid' | 'fixed' | 'other';
  trustDeedDate: Date;
  trustee: Company | Individual;
  beneficiaries: (Company | Individual)[];
}

// Partnership-specific information
export interface Partnership extends BusinessEntity {
  businessStructure: 'partnership';
  partners: Partner[];
  partnershipType: 'general' | 'limited' | 'jointVenture';
}

// Sole Trader-specific information
export interface SoleTrader extends BusinessEntity {
  businessStructure: 'soleTrader';
  individual: Individual;
}

// Person or Individual
export interface Individual {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  tfn: string; // Tax File Number
  residencyStatus: 'resident' | 'foreignResident' | 'workingHolidayMaker' | 'other';
  contactDetails: ContactDetails;
}

// Director information
export interface Director extends Individual {
  directorId: string;
  appointmentDate: Date;
  cessorDate?: Date;
  shareholding?: Shareholding[];
}

// Partner information
export interface Partner {
  entityId: string;
  entityType: 'individual' | 'company' | 'trust';
  entity: Individual | Company | Trust;
  partnershipInterest: number; // Percentage
  profitSharingRatio: number; // Percentage
  lossSharingRatio: number; // Percentage
}

// Shareholding information
export interface Shareholding {
  shareClass: string;
  numberOfShares: number;
  percentageOwned: number;
  paidValue: number;
  unpaidValue: number;
}

// Contact details
export interface ContactDetails {
  email: string;
  phone?: string;
  address: Address;
  postalAddress?: Address;
}

// Address information
export interface Address {
  line1: string;
  line2?: string;
  suburb: string;
  state: string;
  postcode: string;
  country: string;
}

// Tax Obligation and lodgement information
export interface TaxObligation {
  id: string;
  entityId: string;
  obligationType: 'income' | 'bas' | 'ias' | 'payg' | 'fbt' | 'superannuation' | 'other';
  dueDate: Date;
  lodgementDate?: Date;
  paymentDueDate: Date;
  paymentDate?: Date;
  status: 'upcoming' | 'due' | 'overdue' | 'lodged' | 'paid' | 'deferred';
  amount: number;
  description?: string;
  period: DateRange;
  attachments?: Attachment[];
}

// Document/Attachment Information
export interface Attachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: Date;
  url: string;
  description?: string;
}

// Tax Return Information
export interface TaxReturn {
  id: string;
  entityId: string;
  financialYear: string; // e.g., "2023-2024"
  status: 'notStarted' | 'inProgress' | 'readyForReview' | 'reviewed' | 'lodged' | 'processed';
  dueDate: Date;
  lodgementDate?: Date;
  assessmentDate?: Date;
  assessmentAmount?: number;
  taxableIncome: number;
  taxPayable: number;
  refundAmount?: number;
  deductions: TaxDeduction[];
  credits: TaxCredit[];
  schedules: TaxSchedule[];
  attachments: Attachment[];
}

// Tax Deduction Item
export interface TaxDeduction {
  id: string;
  category: string;
  description: string;
  amount: number;
  evidence: Attachment[];
}

// Tax Credit Item
export interface TaxCredit {
  id: string;
  category: string;
  description: string;
  amount: number;
  evidence: Attachment[];
}

// Tax Schedule (additional forms/schedules required for tax returns)
export interface TaxSchedule {
  id: string;
  scheduleType: string;
  description: string;
  data: Record<string, any>; // Schedule-specific data
  completed: boolean;
}

// Business Activity Statement (BAS)
export interface BASStatement {
  id: string;
  entityId: string;
  period: DateRange;
  status: 'notStarted' | 'inProgress' | 'readyForReview' | 'reviewed' | 'lodged' | 'processed';
  dueDate: Date;
  lodgementDate?: Date;
  gstCollected: number;
  gstPaid: number;
  gstNetAmount: number;
  salesTotal: number;
  purchasesTotal: number;
  paygWithholding: number;
  paygInstallments: number;
  totalPayable: number;
  totalRefundable: number;
  paymentDate?: Date;
  paymentMethod?: string;
  attachments: Attachment[];
}

// Fringe Benefits Tax (FBT) Return
export interface FBTReturn {
  id: string;
  entityId: string;
  fbtYear: string; // e.g., "2023-2024" (April 1 to March 31)
  status: 'notStarted' | 'inProgress' | 'readyForReview' | 'reviewed' | 'lodged' | 'processed';
  dueDate: Date;
  lodgementDate?: Date;
  totalGrossValue: number;
  totalTaxable: number;
  totalExempt: number;
  fbtPayable: number;
  benefits: FBTBenefit[];
  attachments: Attachment[];
}

// FBT Benefit Item
export interface FBTBenefit {
  id: string;
  benefitType: 'car' | 'housing' | 'expense' | 'loan' | 'debtWaiver' | 'meal' | 'other';
  description: string;
  employeeId?: string;
  grossValue: number;
  taxableValue: number;
  gstAmount?: number;
  evidence: Attachment[];
}

// Reporting Schema for Tax Data Extraction
export interface TaxReportingSchema {
  entityId: string;
  reportingYear: string;
  mappings: {
    // Map financial system account codes to tax return line items
    accountCodeToTaxItemMappings: Record<string, string>;
    // Map financial categories to tax categories
    financialToTaxCategoryMappings: Record<string, string>;
  };
  customAdjustments: TaxAdjustment[];
}

// Tax Adjustment (reconciling accounting to tax)
export interface TaxAdjustment {
  id: string;
  description: string;
  amount: number;
  adjustmentType: 'permanent' | 'timing';
  category: string;
  direction: 'add' | 'subtract';
  workpapers: Attachment[];
}

// Tax Planning Scenario
export interface TaxPlanningScenario {
  id: string;
  entityId: string;
  name: string;
  description: string;
  baseFinancialYear: string;
  projectionPeriod: DateRange;
  assumptions: TaxAssumption[];
  projectedTaxOutcome: {
    taxableIncome: number;
    taxPayable: number;
    effectiveTaxRate: number;
    cashflowImpact: number;
  };
  strategies: TaxStrategy[];
  compareToBaseline: {
    taxSavings: number;
    cashflowImprovement: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Tax Assumption for Planning
export interface TaxAssumption {
  id: string;
  category: string;
  description: string;
  assumptionType: 'revenue' | 'expense' | 'deduction' | 'credit' | 'rate';
  baseValue: number;
  projectedValue: number;
  growthRate?: number;
  notes?: string;
}

// Tax Strategy
export interface TaxStrategy {
  id: string;
  name: string;
  description: string;
  implementationSteps: string[];
  riskLevel: 'low' | 'medium' | 'high';
  estimatedSavings: number;
  timingImpact: 'immediate' | 'shortTerm' | 'longTerm';
  approvalStatus: 'proposed' | 'approved' | 'implemented' | 'rejected';
}
