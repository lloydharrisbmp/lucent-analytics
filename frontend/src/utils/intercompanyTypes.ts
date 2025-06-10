import { Timestamp } from "firebase/firestore";

/**
 * Defines the structure for tracking transactions between related entities
 * within the same organization. These are necessary for consolidation eliminations.
 */
export interface IntercompanyTransaction {
  id: string; // Firestore document ID
  organizationId: string; // Parent organization ID
  transactionDate: Timestamp; // Date the transaction occurred
  description: string; // Description of the transaction
  amount: number; // Transaction amount
  currency: string; // Currency of the transaction (ISO 4217 code)
  debitEntityId: string; // ID of the entity recording the debit
  creditEntityId: string; // ID of the entity recording the credit
  
  // Optional: Link to specific accounts if Chart of Accounts is detailed
  // debitAccountId?: string; 
  // creditAccountId?: string;

  status: 'Recorded' | 'Pending Elimination' | 'Eliminated'; // Status of the transaction in the consolidation process
  eliminationDate?: Timestamp | null; // Date the transaction was eliminated
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
