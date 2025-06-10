import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useOrg } from 'components/OrgProvider'; // Import useOrg
import brain from 'brain';
import DashboardLayout from 'components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusIcon, Loader2, Share2, Users } from 'lucide-react'; // Added Users icon
import { toast } from 'sonner';
import { DashboardListResponse, DashboardListItem } from 'types';
import { SharingModal } from 'components/SharingModal'; // Import SharingModal
import { Badge } from "@/components/ui/badge"; // Import Badge
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';

type ContentType = 'report' | 'dashboard';

const Dashboards: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSharingModalOpen, setIsSharingModalOpen] = useState(false);
  const [sharingContentType, setSharingContentType] = useState<ContentType | null>(null);
  const [sharingContentId, setSharingContentId] = useState<string | null>(null);
  const [sharingContentName, setSharingContentName] = useState<string | null>(null);
  const { currentOrganization } = useOrg(); // Get current organization
  const queryClient = useQueryClient(); // For potentially invalidating queries after update

  // Mock permissions state to determine if dashboard is shared
  const [mockPermissions, setMockPermissions] = useState<Record<string, string[]>>({});

  const { data: dashboards, isLoading, error } = useQuery<DashboardListItem[], Error>({
    queryKey: ['dashboards'],
    queryFn: async () => {
      try {
        const response = await brain.list_dashboards();
        const result: DashboardListResponse = await response.json();
        // Ensure result.dashboards is always an array
        return result.dashboards ?? [];
      } catch (err) {
        console.error("Failed to list dashboards:", err);
        toast.error("Failed to load dashboards.");
        throw new Error("Failed to load dashboards");
      }
    },
    placeholderData: [], // Provide empty array initially
  });

  const handleCreateDashboard = async () => {
    try {
        // For now, maybe just navigate to a creation page or open a dialog
        // If creating directly:
        // const response = await brain.create_dashboard({ name: "New Dashboard", /* other default settings */ });
        // const newDashboard = await response.json();
        // navigate(`/dashboards/${newDashboard.id}`); // Or refetch list
        toast.info("Create dashboard functionality not fully implemented yet.");
        // Example: Navigate to a builder/editor page if it exists
        // navigate('/dashboard-builder');
    } catch (err) {
        console.error("Failed to create dashboard:", err);
        toast.error("Failed to create new dashboard.");
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleViewDashboard = (dashboardId: string) => {
    // Navigate to dashboard viewer
    navigate(`/dashboard?id=${dashboardId}`);
  };

  // Sharing Modal Handlers
  const handleOpenShareModal = (contentType: ContentType, contentId: string, contentName: string) => {
    console.log(`Opening share modal for: ${contentType} - ${contentId} - ${contentName}`);
    setSharingContentType(contentType);
    setSharingContentId(contentId);
    setSharingContentName(contentName);
    setIsSharingModalOpen(true);
  };

  const handleSharingModalClose = () => {
    setIsSharingModalOpen(false);
  };

  // Initialize mock permissions for sample dashboards
  useEffect(() => {
    // In a real app, this would come from an API call
    setMockPermissions({
      // Example: These IDs would be the actual dashboard IDs
      "dashboard-1": ["user1", "user2"],
      "dashboard-3": ["user3"]
    });
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2">Loading Dashboards...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-red-600 p-4">Error loading dashboards: {error instanceof Error ? error.message : String(error)}</div>
      </DashboardLayout>
    );
  }

  const filteredDashboards = dashboards ? dashboards.filter(
    (dashboard) =>
      dashboard.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Dashboards</h1>
        <Button onClick={handleCreateDashboard}>
          <PlusIcon className="mr-2 h-4 w-4" /> Create Dashboard
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search dashboards by name..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-8 w-full md:w-1/3"
          />
        </div>
      </div>

      {dashboards && dashboards.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredDashboards.map((dashboard) => {
            console.log('Rendering dashboard:', JSON.stringify(dashboard, null, 2)); // Added detailed log
            return (
            <Card key={dashboard.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle 
                    className="text-xl cursor-pointer hover:underline flex items-center" 
                    onClick={() => handleViewDashboard(dashboard.id)}
                  >
                    {String(dashboard.name || 'Untitled Dashboard')}
                    {mockPermissions[dashboard.id]?.length > 0 && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        <Users className="mr-1 h-3 w-3" /> Shared
                      </span>
                    )}
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (!currentOrganization?.id) {
                      toast.error("Organization context is missing. Cannot open sharing.");
                      return;
                    }
                    handleOpenShareModal('dashboard', dashboard.id, dashboard.name);
                  }}
                  aria-label={`Share ${dashboard.name}`}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {String(dashboard.description || "No description provided.")}
                </p>
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleViewDashboard(dashboard.id)}
                  >
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
          })}
          {filteredDashboards.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground">No dashboards found matching your search.</p>
          )}
        </div>
      ) : (
        <div className="text-center py-10 border border-dashed rounded-lg">
          <h3 className="text-lg font-medium text-muted-foreground">No Dashboards Yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Get started by creating your first dashboard.</p>
          <Button onClick={handleCreateDashboard}>
            <PlusIcon className="h-4 w-4 mr-1" /> Create Dashboard
          </Button>
        </div>
      )}

      {/* Sharing Modal Instance */}
      <SharingModal
        isOpen={isSharingModalOpen}
        onOpenChange={handleSharingModalClose}
        contentType={sharingContentType}
        contentId={sharingContentId}
        contentName={
            sharingContentName ?? "Selected Dashboard"
          }
        organizationId={currentOrganization?.id} // Pass organization ID
        onSharingUpdate={() => {
          // Optional: Refetch dashboard list or update local state if needed
          // Example: Invalidate permissions query if needed, or refetch dashboard list
          // queryClient.invalidateQueries(['permissions', sharingContentType, sharingContentId]);
          console.log("Sharing updated for dashboard");
        }}
      />
    </DashboardLayout>
  );
}
