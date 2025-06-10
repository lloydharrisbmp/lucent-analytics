import { create } from "zustand";
import { firebaseAuth } from "app";
import { doc, getDoc, setDoc, updateDoc, getFirestore } from "firebase/firestore";
import { User } from "firebase/auth";
import { firebaseApp } from "app";

// Create Firebase service instance directly
const firebaseDb = getFirestore(firebaseApp);

interface UserData {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  createdAt?: string;
  lastLogin?: string;
  preferences?: Record<string, any>;
}

interface AuthState {
  user: User | null;
  userData: UserData | null;
  isLoading: boolean;
  error: Error | null;
  
  // Auth actions
  fetchUserData: (user: User) => Promise<void>;
  updateUserData: (data: Partial<UserData>) => Promise<void>;
  updateUserPreferences: (preferences: Record<string, any>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  userData: null,
  isLoading: false,
  error: null,

  fetchUserData: async (user: User) => {
    if (!user) return;
    
    set({ isLoading: true });
    try {
      // Check if user document exists
      const userDocRef = doc(firebaseDb, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        // User document exists, get data
        const userData = userDoc.data() as UserData;
        set({ userData, isLoading: false });
      } else {
        // User document doesn't exist, create it
        const newUserData: UserData = {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        };
        
        await setDoc(doc(firebaseDb, "users", user.uid), newUserData);
        set({ userData: newUserData, isLoading: false });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      set({ error: error as Error, isLoading: false });
    }
  },
  
  updateUserData: async (data: Partial<UserData>) => {
    const { user, userData } = get();
    if (!user || !userData) return;
    
    try {
      // Update Firestore document
      const userDocRef = doc(firebaseDb, "users", user.uid);
      await updateDoc(userDocRef, { ...data, lastLogin: new Date().toISOString() });
      
      // Update local state
      set({ userData: { ...userData, ...data } });
    } catch (error) {
      console.error("Error updating user data:", error);
      set({ error: error as Error });
    }
  },
  
  updateUserPreferences: async (preferences: Record<string, any>) => {
    const { user, userData } = get();
    if (!user || !userData) return;
    
    const updatedPreferences = { ...userData.preferences, ...preferences };
    
    try {
      // Update Firestore document with new preferences
      const userDocRef = doc(firebaseDb, "users", user.uid);
      await updateDoc(userDocRef, { preferences: updatedPreferences });
      
      // Update local state
      set({ 
        userData: { 
          ...userData, 
          preferences: updatedPreferences 
        } 
      });
    } catch (error) {
      console.error("Error updating user preferences:", error);
      set({ error: error as Error });
    }
  },
}));

// Setup auth state listener
firebaseAuth.onAuthStateChanged((user) => {
  if (user) {
    // User is signed in
    useAuthStore.setState({ user });
    useAuthStore.getState().fetchUserData(user);
  } else {
    // User is signed out
    useAuthStore.setState({ user: null, userData: null });
  }
});
