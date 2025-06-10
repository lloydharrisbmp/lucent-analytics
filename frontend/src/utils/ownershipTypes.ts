import { Timestamp } from "firebase/firestore";

/**
 * Defines the structure for tracking ownership percentages between entities
 * within an organization. Crucial for consolidation calculations (e.g., NCI).
 */
export interface Ownership {
  id: string; // Firestore document ID
  organizationId: string; // Parent organization ID
  ownerEntityId: string; // ID of the entity owning the stake
  ownedEntityId: string; // ID of the entity being owned
  ownershipPercentage: number; // Percentage of direct ownership (e.g., 80 for 80%)
  effectiveDate: Timestamp; // Date the ownership percentage becomes effective
  endDate?: Timestamp | null; // Date the ownership percentage ceases (null if currently effective)
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
