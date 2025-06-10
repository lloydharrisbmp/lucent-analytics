import { create } from 'zustand';
import { Client, generateSampleClients, ClientSummary, generateClientSummary } from './client-data';

interface ClientStore {
  // Client state
  clients: Client[];
  isLoading: boolean;
  error: Error | null;
  selectedClientId: string | null;
  clientSummaries: Record<string, ClientSummary>;
  
  // Client actions
  fetchClients: () => Promise<void>;
  getClient: (id: string) => Client | undefined;
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Client>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<Client>;
  deleteClient: (id: string) => Promise<void>;
  setSelectedClient: (id: string | null) => void;
  getClientSummary: (id: string) => Promise<ClientSummary>;
}

// Create the client store with Zustand
export const useClientStore = create<ClientStore>((set, get) => ({
  // Initial state
  clients: [],
  isLoading: false,
  error: null,
  selectedClientId: null,
  clientSummaries: {},
  
  // Fetch all clients
  fetchClients: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // In a real app, this would be an API call
      // For now, we'll use our sample data generator
      const clients = generateSampleClients(15);
      
      set({ 
        clients,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error : new Error('Failed to fetch clients'), 
        isLoading: false 
      });
    }
  },
  
  // Get a single client by ID
  getClient: (id: string) => {
    return get().clients.find(client => client.id === id);
  },
  
  // Add a new client
  addClient: async (clientData) => {
    set({ isLoading: true, error: null });
    
    try {
      // Generate a new ID and timestamps
      const now = new Date().toISOString();
      const id = `client-${get().clients.length + 1}`;
      
      const newClient: Client = {
        ...clientData,
        id,
        createdAt: now,
        updatedAt: now
      };
      
      // In a real app, this would be an API call
      // For now, just update the local state
      set(state => ({ 
        clients: [...state.clients, newClient],
        isLoading: false 
      }));
      
      return newClient;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error : new Error('Failed to add client'), 
        isLoading: false 
      });
      throw error;
    }
  },
  
  // Update an existing client
  updateClient: async (id, updates) => {
    set({ isLoading: true, error: null });
    
    try {
      // Find the client to update
      const client = get().getClient(id);
      
      if (!client) {
        throw new Error(`Client with ID ${id} not found`);
      }
      
      // Create the updated client with new timestamp
      const updatedClient: Client = {
        ...client,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      // In a real app, this would be an API call
      // For now, just update the local state
      set(state => ({ 
        clients: state.clients.map(c => c.id === id ? updatedClient : c),
        isLoading: false 
      }));
      
      return updatedClient;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error : new Error('Failed to update client'), 
        isLoading: false 
      });
      throw error;
    }
  },
  
  // Delete a client
  deleteClient: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      // In a real app, this would be an API call
      // For now, just update the local state
      set(state => ({ 
        clients: state.clients.filter(client => client.id !== id),
        isLoading: false 
      }));
      
      // If the deleted client was selected, clear the selection
      if (get().selectedClientId === id) {
        get().setSelectedClient(null);
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error : new Error('Failed to delete client'), 
        isLoading: false 
      });
      throw error;
    }
  },
  
  // Set the selected client
  setSelectedClient: (id) => {
    set({ selectedClientId: id });
  },
  
  // Get client summary data
  getClientSummary: async (id) => {
    try {
      // Check if we already have the summary
      if (get().clientSummaries[id]) {
        return get().clientSummaries[id];
      }
      
      // In a real app, this would be an API call
      // For now, generate sample summary data
      const summary = generateClientSummary(id);
      
      // Store the summary in the state
      set(state => ({
        clientSummaries: {
          ...state.clientSummaries,
          [id]: summary
        }
      }));
      
      return summary;
    } catch (error) {
      console.error('Failed to fetch client summary:', error);
      throw error;
    }
  }
}));
