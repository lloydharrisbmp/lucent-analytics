import { create } from "zustand";
import { persist } from "zustand/middleware";
import { collection, doc, getDoc, getDocs, setDoc, query, where, deleteDoc, updateDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { firebaseApp } from "app";

// Create Firebase service instances directly
const firebaseAuth = getAuth(firebaseApp);
const firebaseDb = getFirestore(firebaseApp);

export interface Organization {
  id: string;
  name: string;
  description?: string;
  industry?: string;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  members: string[];
  settings?: OrganizationSettings;
}

export interface OrganizationSettings {
  fiscalYearStart?: string; // Format: MM-DD
  currency?: string;
  timezone?: string;
  dateFormat?: string;
}

export interface OrganizationState {
  organizations: Organization[];
  currentOrganizationId: string | null;
  isLoading: boolean;
  error: Error | null;
  
  // Actions
  fetchUserOrganizations: () => Promise<void>;
  createOrganization: (data: Omit<Organization, "id" | "createdAt" | "updatedAt" | "ownerId" | "members">) => Promise<string>;
  updateOrganization: (id: string, data: Partial<Omit<Organization, "id" | "createdAt" | "ownerId" | "members">>) => Promise<void>;
  deleteOrganization: (id: string) => Promise<void>;
  setCurrentOrganization: (id: string) => void;
}

const ORGANIZATIONS_COLLECTION = "organizations";

export const useOrganizationStore = create<OrganizationState>(
  persist(
    (set, get) => ({
      organizations: [],
      currentOrganizationId: null,
      isLoading: false,
      error: null,

      fetchUserOrganizations: async () => {
        const user = firebaseAuth.currentUser;
        if (!user) {
          console.error("User not authenticated when fetching organizations");
          set({ error: new Error("User not authenticated") });
          return;
        }
        
        console.log("Fetching organizations for user:", user.uid);
        set({ isLoading: true, error: null });
        try {
          // Get organizations where user is owner or member
          const ownerQuery = query(
            collection(firebaseDb, ORGANIZATIONS_COLLECTION),
            where("ownerId", "==", user.uid)
          );
          
          const memberQuery = query(
            collection(firebaseDb, ORGANIZATIONS_COLLECTION),
            where("members", "array-contains", user.uid)
          );

          // Try to execute both queries and catch any permission errors
          let ownerSnapshot, memberSnapshot;
          try {
            console.log("Executing Firestore queries for organizations...");
            ownerSnapshot = await getDocs(ownerQuery);
            console.log("Owner query completed successfully");
            memberSnapshot = await getDocs(memberQuery);
            console.log("Member query completed successfully");
          } catch (error) {
            console.error("Firestore permission error:", error);
            // Return empty results instead of failing completely
            set({ 
              error: new Error(`Firestore permission error: ${error.message}. Please ensure your Firebase security rules allow access to the organizations collection.`), 
              isLoading: false,
              // Importantly, set empty organizations but don't crash
              organizations: [] 
            });
            return;
          }

          // Combine and deduplicate results
          const organizationsMap = new Map();
          
          ownerSnapshot.forEach((doc) => {
            const data = doc.data();
            organizationsMap.set(doc.id, {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date()
            });
          });

          memberSnapshot.forEach((doc) => {
            if (!organizationsMap.has(doc.id)) {
              const data = doc.data();
              organizationsMap.set(doc.id, {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date()
              });
            }
          });

          const organizations = Array.from(organizationsMap.values());
          console.log(`Organizations fetched: ${organizations.length}, IDs: ${organizations.map(o => o.id).join(', ')}`); // More detailed log
          
          // Set current organization if not already set or if current one is no longer available
          const { currentOrganizationId } = get();
          let newCurrentOrgId = currentOrganizationId;
          console.log(`Current org ID before update: ${currentOrganizationId}`); // Log before logic

          if (
            !currentOrganizationId ||
            !organizations.some(org => org.id === currentOrganizationId)
          ) {
            if (organizations.length > 0) {
              newCurrentOrgId = organizations[0].id;
              console.log(`Setting current org ID to first available: ${newCurrentOrgId}`); // Log change
            } else {
              newCurrentOrgId = null;
              console.log("No organizations found, setting current org ID to null"); // Log change
            }
          } else {
            console.log(`Current org ID ${currentOrganizationId} is still valid.`); // Log no change
          }

          set({ organizations, isLoading: false, currentOrganizationId: newCurrentOrgId });
          console.log(`Organization store state updated. isLoading: false, currentOrgId: ${newCurrentOrgId}`); // Log final state update
        } catch (error) {
          console.error("Error fetching organizations:", error);
          set({ error: error as Error, isLoading: false });
        }
      },

      createOrganization: async (data) => {
        const user = firebaseAuth.currentUser;
        if (!user) {
          throw new Error("User not authenticated");
        }

        set({ isLoading: true, error: null });
        try {
          const newOrganization: Organization = {
            ...data,
            id: doc(collection(firebaseDb, ORGANIZATIONS_COLLECTION)).id, // Generate Firestore ID
            createdAt: new Date(),
            updatedAt: new Date(),
            ownerId: user.uid,
            members: [] // Initially empty, owner is tracked separately
          };

          // Save to Firestore
          await setDoc(
            doc(firebaseDb, ORGANIZATIONS_COLLECTION, newOrganization.id),
            newOrganization
          );

          // Update local state
          const { organizations } = get();
          set({
            organizations: [...organizations, newOrganization],
            currentOrganizationId: newOrganization.id,
            isLoading: false
          });

          return newOrganization.id;
        } catch (error) {
          console.error("Error creating organization:", error);
          set({ error: error as Error, isLoading: false });
          throw error;
        }
      },

      updateOrganization: async (id, data) => {
        const user = firebaseAuth.currentUser;
        if (!user) {
          throw new Error("User not authenticated");
        }

        set({ isLoading: true, error: null });
        try {
          const orgRef = doc(firebaseDb, ORGANIZATIONS_COLLECTION, id);
          const orgDoc = await getDoc(orgRef);

          if (!orgDoc.exists()) {
            throw new Error("Organization not found");
          }

          const orgData = orgDoc.data() as Organization;
          if (orgData.ownerId !== user.uid) {
            throw new Error("Only the owner can update the organization");
          }

          const updatedData = {
            ...data,
            updatedAt: new Date()
          };

          // Update in Firestore
          await updateDoc(orgRef, updatedData);

          // Update local state
          const { organizations } = get();
          const updatedOrganizations = organizations.map(org =>
            org.id === id ? { ...org, ...updatedData } : org
          );

          set({ organizations: updatedOrganizations, isLoading: false });
        } catch (error) {
          console.error("Error updating organization:", error);
          set({ error: error as Error, isLoading: false });
          throw error;
        }
      },

      deleteOrganization: async (id) => {
        const user = firebaseAuth.currentUser;
        if (!user) {
          throw new Error("User not authenticated");
        }

        set({ isLoading: true, error: null });
        try {
          const orgRef = doc(firebaseDb, ORGANIZATIONS_COLLECTION, id);
          const orgDoc = await getDoc(orgRef);

          if (!orgDoc.exists()) {
            throw new Error("Organization not found");
          }

          const orgData = orgDoc.data() as Organization;
          if (orgData.ownerId !== user.uid) {
            throw new Error("Only the owner can delete the organization");
          }

          // Delete from Firestore
          await deleteDoc(orgRef);

          // Update local state
          const { organizations, currentOrganizationId } = get();
          const updatedOrganizations = organizations.filter(org => org.id !== id);

          // If the deleted organization was the current one, switch to another
          let newCurrentOrgId = currentOrganizationId;
          if (currentOrganizationId === id) {
            newCurrentOrgId = updatedOrganizations.length > 0 ? updatedOrganizations[0].id : null;
          }

          set({
            organizations: updatedOrganizations,
            currentOrganizationId: newCurrentOrgId,
            isLoading: false
          });
        } catch (error) {
          console.error("Error deleting organization:", error);
          set({ error: error as Error, isLoading: false });
          throw error;
        }
      },

      setCurrentOrganization: (id) => {
        const { organizations } = get();
        const organizationExists = organizations.some(org => org.id === id);
        
        if (!organizationExists) {
          console.error(`Organization with ID ${id} not found`);
          return;
        }
        
        set({ currentOrganizationId: id });
      }
    }),
    {
      name: "lucent-organization-storage",
      partialize: (state) => ({
        currentOrganizationId: state.currentOrganizationId
      })
    }
  )
);

// Helper to get current organization data
export const useCurrentOrganization = () => {
  const { organizations, currentOrganizationId } = useOrganizationStore();
  
  if (!currentOrganizationId) {
    return null;
  }
  
  return organizations.find(org => org.id === currentOrganizationId) || null;
};
