import React, { useState, useEffect, useCallback } from "react";
import brain from "brain";
import { ConnectionOutput } from "types"; // Assuming types are generated here
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner"; // Import sonner toast
import AddConnectionDialog from "components/AddConnectionDialog"; // Import the new component


// Define the structure of the error if needed, e.g., for specific API error messages
interface ApiError {
  message: string;
  // Add other potential error fields if the API returns structured errors
}

const DataConnections: React.FC = () => {
  const [connections, setConnections] = useState<ConnectionOutput[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  // State for delete confirmation
  const [connectionToDelete, setConnectionToDelete] = useState<ConnectionOutput | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false); // For loading state on delete button

  // State for testing connection
  const [testingConnectionId, setTestingConnectionId] = useState<string | null>(null);

  const fetchConnections = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    console.log("Fetching data connections...");
    try {
      const response = await brain.list_connections({}); // Pass empty object if no params needed
      const data = await response.json();
      console.log("Connections fetched:", data);
      if (response.ok) {
        // Ensure data is an array, default to empty array if not
        setConnections(Array.isArray(data) ? data : []);
      } else {
        // Try to parse error message from response
        const errorData = data as ApiError;
        const errorMessage = errorData?.message || `HTTP error! status: ${response.status}`;
        console.error("Error fetching connections:", errorMessage, data);
        setError({ message: errorMessage });
        setConnections([]); // Clear connections on error
      }
    } catch (err) {
      console.error("Network or parsing error fetching connections:", err);
      setError({
        message:
          err instanceof Error ? err.message : "An unknown error occurred",
      });
      setConnections([]); // Clear connections on error
    } finally {
      setIsLoading(false);
      console.log("Finished fetching connections.");
    }
  }, []);

  const handleDelete = async (connectionId: string) => {
    if (!connectionId) return;
    console.log(`Attempting to delete connection: ${connectionId}`);
    setIsDeleting(true);
    try {
      const response = await brain.delete_connection({ connection_id: connectionId });
      if (response.ok) {
        toast.success("Connection deleted successfully!");
        setConnectionToDelete(null); // Close dialog if open
        fetchConnections(); // Refresh the list
      } else {
        const errorData = await response.json();
        const errorMessage = errorData?.detail || `Failed to delete connection. Status: ${response.status}`;
        console.error("Error deleting connection:", errorMessage, errorData);
        toast.error(errorMessage);
      }
    } catch (err) {
      console.error("Network or parsing error deleting connection:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown network error occurred during deletion.";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTest = async (connectionId: string) => {
    if (!connectionId) return;
    console.log(`Attempting to test connection: ${connectionId}`);
    setTestingConnectionId(connectionId);
    try {
      const response = await brain.test_connection({ connection_id: connectionId });
      const result = await response.json(); // Assuming endpoint returns ConnectionTestResult
      if (response.ok && result.success) {
        toast.success(`Connection test successful: ${result.message}`);
      } else {
        const errorMessage = result?.message || `Connection test failed. Status: ${response.status}`;
        console.error("Error testing connection:", errorMessage, result);
        toast.error(`Connection test failed: ${errorMessage}`);
      }
    } catch (err) {
      console.error("Network or parsing error testing connection:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown network error occurred during testing.";
      toast.error(errorMessage);
    } finally {
      setTestingConnectionId(null);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  // Placeholder for Add Connection Modal state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  return (
    <div className="p-4 md:p-8 lg:p-12">
      <Card>
        <CardHeader>
          <CardTitle>Data Source Connections</CardTitle>
          <CardDescription>
            Manage your connections to external accounting systems like Xero,
            MYOB, and Sage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-end">
            <Button onClick={() => setIsAddDialogOpen(true)}>
              Add Connection
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error Fetching Connections</AlertTitle>
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                {/* <TableHead>Last Used</TableHead> */}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Skeleton Loader Rows
                Array.from({ length: 3 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    {/* <TableCell><Skeleton className="h-4 w-32" /></TableCell> */}
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-24 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : connections.length === 0 && !error ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No connections found. Add your first connection!
                  </TableCell>
                </TableRow>
              ) : (
                connections.map((conn) => (
                  <TableRow key={conn.id}>
                    <TableCell className="font-medium">
                      {conn.source_type}
                    </TableCell>
                    <TableCell>{conn.status}</TableCell>
                    <TableCell>
                      {conn.created_at
                        ? new Date(conn.created_at).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    {/* <TableCell>
                      {conn.last_used_at ? new Date(conn.last_used_at).toLocaleString() : 'Never'}
                    </TableCell> */}
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTest(conn.id)}
                        disabled={testingConnectionId === conn.id || isDeleting}
                      >
                        {testingConnectionId === conn.id ? "Testing..." : "Test"}
                      </Button>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setConnectionToDelete(conn)} // Set connection to delete on click
                          disabled={isDeleting && connectionToDelete?.id === conn.id} // Disable specific button while deleting
                        >
                          {isDeleting && connectionToDelete?.id === conn.id ? "Deleting..." : "Delete"}
                        </Button>
                      </AlertDialogTrigger>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Placeholder for Add Connection Dialog */}
          {/* <AddConnectionDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onConnectionAdded={fetchConnections} /> */}
          {/* Render the Add Connection Dialog */}
          <AddConnectionDialog
            open={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            onConnectionAdded={fetchConnections} // Pass fetchConnections as the callback
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!connectionToDelete} // Controlled by connectionToDelete state
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setConnectionToDelete(null); // Clear on close
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              connection for "{connectionToDelete?.source_type}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => connectionToDelete && handleDelete(connectionToDelete.id)}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Connection"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DataConnections;
