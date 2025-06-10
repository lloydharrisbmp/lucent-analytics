import React, { useState, useEffect } from "react";
import DashboardLayout from 'components/DashboardLayout';
import { ClientForm } from "components/ClientForm";
import { useClientStore } from "utils/client-store";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CircleAlertIcon } from "lucide-react";

// Type for the form values - must match the schema in ClientForm
type ClientFormValues = {
  name: string;
  industry: string;
  businessType: string;
  location: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  annualRevenue: number;
  taxFileNumber: string;
  abn: string;
  status: 'active' | 'inactive' | 'pending';
  notes?: string;
};

export default function EditClient() {
  const navigate = useNavigate();
  const { clientId } = useParams<{ clientId: string }>();
  const { getClient, updateClient, clients, fetchClients } = useClientStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [client, setClient] = useState<ClientFormValues | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load client data on mount
  useEffect(() => {
    if (!clientId) {
      setError(new Error('Client ID is required'));
      setIsLoading(false);
      return;
    }
    
    const loadClient = async () => {
      try {
        // If clients aren't loaded yet, fetch them
        if (clients.length === 0) {
          await fetchClients();
        }
        
        // Get the client with the given ID
        const foundClient = getClient(clientId);
        
        if (!foundClient) {
          throw new Error(`Client with ID ${clientId} not found`);
        }
        
        // Extract only the fields needed for the form
        const { 
          name, industry, businessType, location,
          contactName, contactEmail, contactPhone,
          annualRevenue, taxFileNumber, abn, status, notes 
        } = foundClient;
        
        // We get the creation date from the client record
        // Set the last updated date to right now
        const updatedAt = new Date().toISOString();
        
        setClient({
          name, industry, businessType, location,
          contactName, contactEmail, contactPhone,
          annualRevenue, taxFileNumber, abn, status, notes
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load client'));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadClient();
  }, [clientId, clients.length, fetchClients, getClient]);
  
  // Handle form submission
  const handleSubmit = async (data: ClientFormValues) => {
    if (!clientId) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Call the updateClient method from the store
      await updateClient(clientId, data);
      
      // Navigate to the client detail page
      navigate(`/client/${clientId}`);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update client'));
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <span className="ml-3">Loading client data...</span>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      {/* Breadcrumb navigation */}
      <Breadcrumb className="mb-6">
        <BreadcrumbItem>
          <BreadcrumbLink href="/clients">Clients</BreadcrumbLink>
        </BreadcrumbItem>
        {client && (
          <BreadcrumbItem>
            <BreadcrumbLink href={`/client/${clientId}`}>{client.name}</BreadcrumbLink>
          </BreadcrumbItem>
        )}
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>Edit</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {client ? `Edit ${client.name}` : 'Edit Client'}
        </h1>
        <p className="text-muted-foreground mt-1">
          Update client information and details
        </p>
      </div>
      
      {/* Error display */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <CircleAlertIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error.message}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Client form */}
      {client && (
        <ClientForm 
          defaultValues={client}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
      )}
    </DashboardLayout>
  );
}