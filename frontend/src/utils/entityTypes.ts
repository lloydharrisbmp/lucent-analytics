import { Timestamp } from "firebase/firestore";

/**
 * Defines the structure for address details.
 */
export interface Address {
  street?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  country: string; // Make country mandatory for address
}

/**
 * Defines the structure for a single business entity within an organization.
 * Represents subsidiaries, branches, etc., for multi-entity consolidation.
 */
export interface Entity {
  id: string; // Firestore document ID
  organizationId: string; // Belongs to this Organization
  name: string; // Common name for display
  legalName?: string; // Official legal name
  entityType: string; // e.g., 'Subsidiary', 'Branch', 'Holding Company', 'Operating Unit'
  baseCurrency: string; // Primary functional currency (ISO 4217 code, e.g., 'USD')
  reportingCurrency: string; // Consolidation currency (ISO 4217 code), often org's default
  country: string; // Country of primary operation/registration
  address?: Address; // Physical address
  registrationNumber?: string; // Business registration number
  taxId?: string; // Tax identification number
  parentEntityId?: string | null; // ID of the direct parent entity within the org hierarchy, null if top-level
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
