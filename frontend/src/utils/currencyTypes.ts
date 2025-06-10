import { Timestamp } from "firebase/firestore";

/**
 * Defines the structure for storing currency exchange rates needed for
 * multi-currency consolidation and reporting.
 */
export interface CurrencyExchangeRate {
  id: string; // Firestore document ID
  organizationId?: string; // Optional: Scope rates to an organization
  rateDate: Timestamp; // The date the exchange rate is applicable
  fromCurrency: string; // Source currency code (ISO 4217)
  toCurrency: string; // Target currency code (ISO 4217)
  rate: number; // Exchange rate (units of toCurrency per 1 unit of fromCurrency)
  rateType: 'Average' | 'Spot' | 'Closing' | 'Historical' | 'Budget'; // Type of rate for accounting treatment
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
