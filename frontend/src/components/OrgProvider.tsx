import React from 'react';
import { createContext, useContext } from 'react';
import { useOrganizationStore, Organization } from 'utils/organizationStore';

// Define the context type
type OrgContextType = {
  organizations: Organization[];
  currentOrganization: Organization | null;
  setCurrentOrganization: (id: string) => void;
  isLoading: boolean;
  error: Error | null;
};

// Create the context with null as initial value
const OrgContext = createContext<OrgContextType | null>(null);

// Props type for the provider component
type OrgProviderProps = {
  children: React.ReactNode;
};

// The provider component
export const OrgProvider = ({ children }: OrgProviderProps) => {
  const store = useOrganizationStore();
  
  // Find current organization
  const currentOrganization = store.organizations.find(
    (org) => org.id === store.currentOrganizationId
  ) || null;
  
  // Create the context value
  const value = {
    organizations: store.organizations,
    currentOrganization,
    setCurrentOrganization: store.setCurrentOrganization,
    isLoading: store.isLoading,
    error: store.error,
  };

  return (
    <OrgContext.Provider value={value}>
      {children}
    </OrgContext.Provider>
  );
};

// Custom hook to use the context
export const useOrg = () => {
  const context = useContext(OrgContext);
  if (!context) {
    throw new Error('useOrg must be used within an OrgProvider');
  }
  return context;
};
