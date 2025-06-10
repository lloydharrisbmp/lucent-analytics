import React, { useState } from "react";
import DashboardLayout from 'components/DashboardLayout';
import { ClientForm } from "components/ClientForm";
import { useClientStore } from "utils/client-store";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
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

export default function AddClient() {
  const navigate = useNavigate();
  const { addClient } = useClientStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Handle form submission
  const handleSubmit = async (data: ClientFormValues) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Call the addClient method from the store
      const newClient = await addClient(data);
      
      // Navigate to the client detail page
      navigate(`/client/${newClient.id}`);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add client'));
      setIsSubmitting(false);
    }
  };
  
  return (
    <DashboardLayout>
      {/* Breadcrumb navigation */}
      <Breadcrumb className="mb-6">
        <BreadcrumbItem>
          <BreadcrumbLink href="/clients">Clients</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          {/* Render last item as text, not a link */}
          <span className="font-medium text-foreground">Add New Client</span>
        </BreadcrumbItem>
      </Breadcrumb>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Add New Client</h1>
        <p className="text-muted-foreground mt-1">
          Create a new client record with business and contact information
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
      <ClientForm 
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />
    </DashboardLayout>
  );
}