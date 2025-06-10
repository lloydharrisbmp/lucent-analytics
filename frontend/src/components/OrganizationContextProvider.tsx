import React from 'react';
import { createContext, useContext } from 'react';
import { useOrganizationStore, Organization } from 'utils/organizationStore';

// Define context type
interface OrgContextType {
  organizations: Organization[];
  currentOrganization: Organization | null;
  setCurrentOrganization: (id: string) => void;
  isLoading: boolean;
  error: Error | null;
}

// Context API with proper typing
const OrgContext = createContext<OrgContextType | null>(null);

// Provider component with React.FC typing
type OrganizationContextProviderProps = {
  children: React.ReactNode;
};

// Provider component as const arrow function for HMR stability
export const OrganizationContextProvider: React.FC<OrganizationContextProviderProps> = ({ children }) => {
  const store = useOrganizationStore();
  
  // Find current organization
  const currentOrganization = store.organizations.find(
    (org) => org.id === store.currentOrganizationId
  ) || null;
  
  // Create value
  const value: OrgContextType = {
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

// Hook to use the context
export const useOrgContext = () => {
  const context = useContext(OrgContext);
  if (!context) {
    throw new Error('useOrgContext must be used within an OrganizationContextProvider');
  }
  return context;
};
