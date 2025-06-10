import React, { useState, useEffect } from "react";
import { useUserGuardContext } from "app"; // Use context to get user, safe in protected pages
import brain from "brain";
// Removed ContentPermissionResponse import, using UserPermissionsResponse structure implicitly
import { UserPermissionsResponse } from "types"; // Import the actual type
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, List } from "lucide-react"; // Using Loader2 for loading spinner
import { toast } from "sonner";

const PortalLanding = () => {
  // Removed UserGuard wrapper as the route itself is protected
  // and we can use useUserGuardContext safely.
  const { user } = useUserGuardContext(); // Get user context
  const [permissions, setPermissions] = useState<string[]>([]); // Store strings like "dashboard:id1"
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!user) return; // Should not happen in protected route, but good practice

      setIsLoading(true);
      setError(null);
      try {
        console.log("Fetching content permissions for user:", user.uid);
        // Assuming get_content_permissions fetches for the logged-in user
        if (!user?.uid) {
          throw new Error("User ID not available.");
        }
        console.log("Fetching user permissions for user:", user.uid);
        // Use get_user_permissions with the current user's ID
        const response = await brain.get_user_permissions({ userId: user.uid });
        const data: UserPermissionsResponse = await response.json(); // Expect UserPermissionsResponse structure
        console.log("Received accessible content strings:", data.accessible_content);
        setPermissions(data.accessible_content || []); // Store the array of strings
      } catch (err: any) {
        console.error("Error fetching content permissions:", err);
        const errorMsg = `Failed to load shared content: ${err.message || 'Unknown error'}`;
        setError(errorMsg);
        toast.error(errorMsg);
        setPermissions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPermissions();
  }, [user]); // Rerun if user changes (though unlikely in this context)

  return (
    <div className="container mx-auto p-4">
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Client Portal - Shared Content</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Welcome! Here is the content shared with you:</p>

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="ml-2 text-muted-foreground">Loading shared content...</p>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isLoading && !error && permissions.length === 0 && (
            <p className="text-muted-foreground text-center py-4">No content has been shared with you yet.</p>
          )}

          {!isLoading && !error && permissions.length > 0 && (
            <ul className="space-y-2">
              {permissions.map((contentRef) => {
                // Parse the string "contentType:contentId"
                const [contentType, contentId] = contentRef.split(':');
                // Generate a unique key - combining type and id is safe here
                const key = `${contentType}-${contentId}`;
                
                return (
                  <li key={key} className="flex items-center p-3 border rounded-md hover:bg-accent">
                    <List className="h-4 w-4 mr-2 text-muted-foreground" />
                    {/* Displaying ID for now, name lookup is not available here */}
                    <span className="flex-grow font-medium">{contentId}</span> 
                    <span className="text-sm text-muted-foreground ml-2">({contentType})</span>
                    {/* Add link or action button here later if needed */}
                  </li>
                );
              })}
            </ul>
          )}

        </CardContent>
      </Card>
    </div>
  );
};

export default PortalLanding;
