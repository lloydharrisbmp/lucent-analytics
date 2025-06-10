import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  Timestamp 
} from 'firebase/firestore';
import { firebaseApp } from 'app'; // Assuming db is initialized here or import db directly
import { getFirestore } from 'firebase/firestore';
import { Entity } from './entityTypes'; // Import the Entity interface

const db = getFirestore(firebaseApp);
const ENTITIES_COLLECTION = 'entities';

interface EntityState {
  entities: Entity[];
  isLoading: boolean;
  error: Error | null;
  fetchEntities: (organizationId: string) => Promise<void>;
  createEntity: (organizationId: string, data: Omit<Entity, 'id' | 'createdAt' | 'updatedAt' | 'organizationId'>) => Promise<string | null>; // Returns new ID or null on error
  updateEntity: (id: string, data: Partial<Omit<Entity, 'id' | 'createdAt' | 'organizationId'>>) => Promise<boolean>; // Returns success status
  deleteEntity: (id: string) => Promise<boolean>; // Returns success status
}

export const useEntityStore = create<EntityState>()(
  // Omitting persist for now to avoid potential issues during setup, can add later
  // persist(
    (set, get) => ({
      entities: [],
      isLoading: false,
      error: null,

      // --- Fetch Entities --- 
      fetchEntities: async (organizationId: string) => {
        if (!organizationId) {
          console.log("fetchEntities: No organizationId provided, clearing entities.");
          set({ entities: [], isLoading: false, error: null });
          return;
        }
        console.log(`fetchEntities: Fetching for org ${organizationId}`);
        set({ isLoading: true, error: null });
        try {
          const entitiesRef = collection(db, ENTITIES_COLLECTION);
          const q = query(entitiesRef, where("organizationId", "==", organizationId));
          const querySnapshot = await getDocs(q);
          const fetchedEntities = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Ensure Timestamps are handled correctly if necessary, Firestore SDK usually does
          })) as Entity[];
          console.log(`fetchEntities: Found ${fetchedEntities.length} entities`);
          set({ entities: fetchedEntities, isLoading: false });
        } catch (error) {
          console.error("Error fetching entities: ", error);
          set({ isLoading: false, error: error instanceof Error ? error : new Error('Failed to fetch entities') });
        }
      },

      // --- Create Entity (Placeholder/Basic Implementation) ---
      createEntity: async (organizationId, data) => {
        console.log(`createEntity: Adding entity for org ${organizationId}`);
        set({ isLoading: true }); // Indicate loading state
        try {
          const docRef = await addDoc(collection(db, ENTITIES_COLLECTION), {
            ...data,
            organizationId: organizationId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          console.log("createEntity: Entity added with ID: ", docRef.id);
          // Refetch entities to update the list
          await get().fetchEntities(organizationId);
          // set({ isLoading: false }); // isLoading is reset by fetchEntities
          return docRef.id;
        } catch (error) {
          console.error("Error creating entity: ", error);
          set({ isLoading: false, error: error instanceof Error ? error : new Error('Failed to create entity') });
          return null;
        }
      },

      // --- Update Entity (Placeholder/Basic Implementation) ---
      updateEntity: async (id, data) => {
         console.log(`updateEntity: Updating entity ${id}`);
         set({ isLoading: true });
        try {
          const entityDocRef = doc(db, ENTITIES_COLLECTION, id);
          await updateDoc(entityDocRef, {
            ...data,
            updatedAt: serverTimestamp(),
          });
          console.log(`updateEntity: Entity ${id} updated successfully.`);
           // Refetch entities for the correct organization to update the list
          const currentEntities = get().entities;
          const entityToUpdate = currentEntities.find(e => e.id === id);
          if (entityToUpdate?.organizationId) {
             await get().fetchEntities(entityToUpdate.organizationId);
          } else {
             console.warn("updateEntity: Could not determine organizationId to refetch.");
             set({ isLoading: false }); // Manually reset loading if refetch doesn't happen
          }
          return true;
        } catch (error) {
          console.error(`Error updating entity ${id}: `, error);
          set({ isLoading: false, error: error instanceof Error ? error : new Error('Failed to update entity') });
          return false;
        }
      },

      // --- Delete Entity (Placeholder/Basic Implementation) ---
      deleteEntity: async (id) => {
        console.log(`deleteEntity: Deleting entity ${id}`);
        set({ isLoading: true });
        // Find the organization ID before deleting to allow refetching
        const currentEntities = get().entities;
        const entityToDelete = currentEntities.find(e => e.id === id);
        const organizationId = entityToDelete?.organizationId;

        try {
          const entityDocRef = doc(db, ENTITIES_COLLECTION, id);
          await deleteDoc(entityDocRef);
          console.log(`deleteEntity: Entity ${id} deleted successfully.`);
          // Refetch entities if organizationId was found
          if (organizationId) {
            await get().fetchEntities(organizationId);
          } else {
             console.warn("deleteEntity: Could not determine organizationId to refetch.");
              set({ entities: get().entities.filter(e => e.id !== id), isLoading: false }); // Optimistic UI update
          }
          return true;
        } catch (error) {
          console.error(`Error deleting entity ${id}: `, error);
          set({ isLoading: false, error: error instanceof Error ? error : new Error('Failed to delete entity') });
          return false;
        }
      },
    })
  // )
);
