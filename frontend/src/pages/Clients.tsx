import React, { useEffect, useState } from "react";
import DashboardLayout from 'components/DashboardLayout';
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, CircleAlertIcon, SearchIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClientsDataTable, ClientStatusBadge, ClientActions } from "components/ClientsDataTable";
import { Client } from "utils/client-data";
import { formatCurrency } from "utils/financial-data";
import { useClientStore } from "utils/client-store";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Clients() {
  const navigate = useNavigate();
  const [clientIdToDelete, setClientIdToDelete] = useState<string | null>(null);
  const { clients, isLoading, error, fetchClients, deleteClient } = useClientStore();
  
  // Industry filter
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  
  // Get unique industries from clients
  const industries = [...new Set(clients.map(client => client.industry))];
  
  // Load clients on component mount
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);
  
  // Apply filters when clients, industry or status filters change
  useEffect(() => {
    let filtered = [...clients];
    
    // Apply industry filter
    if (industryFilter !== 'all') {
      filtered = filtered.filter(client => client.industry === industryFilter);
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(client => client.status === statusFilter);
    }
    
    setFilteredClients(filtered);
  }, [clients, industryFilter, statusFilter]);
  
  // Navigate to client details
  const handleViewClient = (client: Client) => {
    navigate(`/client/${client.id}`);
  };
  
  // Navigate to edit client
  const handleEditClient = (client: Client) => {
    navigate(`/edit-client/${client.id}`);
  };
  
  // Open delete confirmation dialog
  const handleDeleteConfirmation = (client: Client) => {
    setClientIdToDelete(client.id);
  };
  
  // Delete client and close dialog
  const confirmDelete = async () => {
    if (clientIdToDelete) {
      await deleteClient(clientIdToDelete);
      setClientIdToDelete(null);
    }
  };
  
  // Handle add new client button
  const handleAddClient = () => {
    navigate('/add-client');
  };
  
  // Table columns definition
  const columns = [
    {
      accessorKey: "name",
      header: "Client Name",
      cell: ({ row }: any) => {
        const client = row.original as Client;
        return (
          <div className="flex items-center gap-3">
            <Avatar>
              {client.profileImage ? (
                <AvatarImage src={client.profileImage} alt={client.name} />
              ) : null}
              <AvatarFallback>
                {client.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{client.name}</div>
              <div className="text-sm text-muted-foreground">{client.businessType}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "industry",
      header: "Industry",
    },
    {
      accessorKey: "location",
      header: "Location",
    },
    {
      accessorKey: "contactName",
      header: "Contact",
      cell: ({ row }: any) => {
        const client = row.original as Client;
        return (
          <div>
            <div>{client.contactName}</div>
            <div className="text-sm text-muted-foreground">{client.contactEmail}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "annualRevenue",
      header: "Annual Revenue",
      cell: ({ row }: any) => {
        return formatCurrency(row.original.annualRevenue);
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        return <ClientStatusBadge status={row.original.status} />;
      },
    },
    {
      id: "actions",
      cell: ({ row }: any) => {
        const client = row.original as Client;
        return (
          <div className="text-right">
            <ClientActions 
              client={client}
              onView={handleViewClient}
              onEdit={handleEditClient}
              onDelete={handleDeleteConfirmation}
            />
          </div>
        );
      },
    },
  ];
  
  return (
    <DashboardLayout>
      {/* Header with filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-muted-foreground mt-1">Manage your clients and their financial data</p>
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          <Select value={industryFilter} onValueChange={setIndustryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Industries</SelectItem>
              {industries.map(industry => (
                <SelectItem key={industry} value={industry}>{industry}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          
          <Button className="flex items-center gap-1" onClick={handleAddClient}>
            <PlusCircle className="h-4 w-4" />
            <span>Add Client</span>
          </Button>
        </div>
      </div>
      
      {/* Error display */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <CircleAlertIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load clients: {error.message}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Client data table */}
      <Card>
        <CardContent className="p-6">
          <ClientsDataTable 
            columns={columns} 
            data={filteredClients}
            onView={handleViewClient}
            onEdit={handleEditClient}
            onDelete={handleDeleteConfirmation}
          />
          
          {isLoading && (
            <div className="flex justify-center items-center h-12 mt-4">
              <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
              <span className="ml-2">Loading clients...</span>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Delete confirmation dialog */}
      <Dialog open={!!clientIdToDelete} onOpenChange={(open) => !open && setClientIdToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this client? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClientIdToDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
