import React, { useState, useEffect, useCallback } from "react";
import { PageHeader } from "components/PageHeader"; // Import PageHeader
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Import Card components
import brain from "brain"; // Import brain client
import { DateRange } from "utils/financial-types"; // Import DateRange type
import { DateRangePicker } from "components/DateRangePicker";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Import Shadcn table components
import { format } from "date-fns"; // Import date-fns for formatting
import { Button } from "@/components/ui/button"; // Import Shadcn Button
import { Loader2 } from "lucide-react"; // Import Loader
import { AuditLogEntryResponse, QueryAuditLogsResponse } from "types"; // Import the log type

// Define interfaces for state shapes
interface Filters {
  startDate: string | null;
  endDate: string | null;
  userId: string | null;
  action: string | null;
  entityType: string | null;
  entityId: string | null;
  // Add other filter fields as needed
}

interface Pagination {
  limit: number;
  offset: number;
}

const AuditLogPage = () => {
  // --- State Variables ---
  const [logs, setLogs] = useState<AuditLogEntryResponse[]>([]);
  const [filters, setFilters] = useState<Filters>({
    startDate: null,
    endDate: null,
    userId: null,
    action: null,
    entityType: null,
    entityId: null,
  });
  const [pagination, setPagination] = useState<Pagination>({
    limit: 50, // Default limit
    offset: 0, // Start at the beginning
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0); // Add totalCount state

  // --- Filter State ---
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [userIdFilter, setUserIdFilter] = useState<string>("");
  const [entityIdFilter, setEntityIdFilter] = useState<string>("");
  const [actionFilter, setActionFilter] = useState<string>("");
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>("");

  // --- Fetch Logs Function ---
  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setLogs([]); // Clear previous logs

    // Prepare query parameters for the API call
    const queryParams = {
      startDate: filters.startDate,
      endDate: filters.endDate,
      userId: filters.userId,
      action: filters.action,
      entityType: filters.entityType,
      entityId: filters.entityId,
      limit: pagination.limit,
      offset: pagination.offset,
    };

    try {
      const response = await brain.query_audit_logs(queryParams);
      const data: QueryAuditLogsResponse = await response.json();
      setLogs(data.logs || []); // Ensure logs is always an array
      setTotalCount(data.total_count || 0); // Update totalCount state
    } catch (err: any) {
      console.error("Failed to fetch audit logs:", err);
      setError(err.message || "An unknown error occurred while fetching logs.");
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination]); // Re-fetch if filters or pagination change

  // --- Initial Fetch on Mount ---
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]); // fetchLogs is memoized by useCallback

  // --- Filter Update Handlers ---

  // Update filters when date range changes
  useEffect(() => {
    setFilters(prevFilters => ({
      ...prevFilters,
      startDate: dateRange?.startDate ? dateRange.startDate.toISOString() : null,
      endDate: dateRange?.endDate ? dateRange.endDate.toISOString() : null,
    }));
    setPagination(prev => ({ ...prev, offset: 0 })); // Reset pagination
  }, [dateRange]);

  // Update filters when User ID changes (Consider adding debounce later)
  useEffect(() => {
    setFilters(prevFilters => ({
      ...prevFilters,
      userId: userIdFilter || null, // Use null if empty
    }));
     setPagination(prev => ({ ...prev, offset: 0 })); // Reset pagination
  }, [userIdFilter]);

  // Update filters when Entity ID changes (Consider adding debounce later)
  useEffect(() => {
    setFilters(prevFilters => ({
      ...prevFilters,
      entityId: entityIdFilter || null, // Use null if empty
    }));
     setPagination(prev => ({ ...prev, offset: 0 })); // Reset pagination
  }, [entityIdFilter]);

  // Update filters when Action changes
  useEffect(() => {
    setFilters(prevFilters => ({
      ...prevFilters,
      action: actionFilter === "all" ? null : actionFilter || null, // Use null for 'all' or empty
    }));
     setPagination(prev => ({ ...prev, offset: 0 })); // Reset pagination
  }, [actionFilter]);

  // Update filters when Entity Type changes
  useEffect(() => {
    setFilters(prevFilters => ({
      ...prevFilters,
      entityType: entityTypeFilter === "all" ? null : entityTypeFilter || null, // Use null for 'all' or empty
    }));
     setPagination(prev => ({ ...prev, offset: 0 })); // Reset pagination
  }, [entityTypeFilter]);


  // --- Pagination Handlers ---
  const handlePreviousPage = () => {
    setPagination((prev) => ({
      ...prev,
      offset: Math.max(0, prev.offset - prev.limit),
    }));
  };

  const handleNextPage = () => {
    setPagination((prev) => ({
      ...prev,
      // Ensure offset doesn't exceed the last possible page start
      offset: Math.min(prev.offset + prev.limit, Math.max(0, totalCount - 1)),
      // We check if offset + limit < totalCount before enabling the button,
      // so this min check is mainly a safeguard.
    }));
  };


  // --- TODO: Add handlers for updating filters ---

  // --- Render ---
  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Audit Logs" />
      <div className="flex-grow p-6 space-y-6 overflow-auto">
        {/* Filter Section */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4"> {/* Removed mb-6, p-4, border etc from here */}
              {/* Date Range Filter */}
        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="date-range">Date Range</Label>
          <DateRangePicker
            value={dateRange ? dateRange : { type: "custom", label: "Select Range", startDate: undefined, endDate: undefined }} // Provide a default shape if null
            onChange={setDateRange} // Update state on change
            // We might need an ID prop if the component supports it, or wrap Label differently
          />
        </div>

        {/* User ID Filter */}
        <div className="flex-1 min-w-[150px]">
          <Label htmlFor="user-id">User ID</Label>
          <Input
            id="user-id"
            placeholder="Enter User ID..."
            value={userIdFilter}
            onChange={(e) => setUserIdFilter(e.target.value)}
          />
        </div>

        {/* Entity ID Filter */}
        <div className="flex-1 min-w-[150px]">
          <Label htmlFor="entity-id">Entity ID</Label>
          <Input
            id="entity-id"
            placeholder="Enter Entity ID..."
            value={entityIdFilter}
            onChange={(e) => setEntityIdFilter(e.target.value)}
          />
        </div>

        {/* Action Filter */}
        <div className="flex-1 min-w-[150px]">
          <Label htmlFor="action">Action</Label>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger id="action">
              <SelectValue placeholder="Select Action..." />
            </SelectTrigger>
            <SelectContent>
              {/* Common action types - Can be expanded */}
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="login">Login</SelectItem>
              <SelectItem value="logout">Logout</SelectItem>
              <SelectItem value="create">Create</SelectItem>
              <SelectItem value="read">Read</SelectItem>
              <SelectItem value="update">Update</SelectItem>
              <SelectItem value="delete">Delete</SelectItem>
              <SelectItem value="export">Export</SelectItem>
              <SelectItem value="import">Import</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Entity Type Filter */}
        <div className="flex-1 min-w-[150px]">
          <Label htmlFor="entity-type">Entity Type</Label>
          <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
            <SelectTrigger id="entity-type">
              <SelectValue placeholder="Select Entity Type..." />
            </SelectTrigger>
            <SelectContent>
              {/* Common entity types - Can be expanded */}
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="organization">Organization</SelectItem>
              <SelectItem value="report_definition">Report Definition</SelectItem>
              <SelectItem value="dashboard">Dashboard</SelectItem>
              <SelectItem value="scenario">Scenario</SelectItem>
              <SelectItem value="budget">Budget</SelectItem>
              <SelectItem value="grant">Grant</SelectItem>
              <SelectItem value="application">Grant Application</SelectItem>
              <SelectItem value="business_entity">Business Entity</SelectItem>
              <SelectItem value="connection">Data Connection</SelectItem>
              <SelectItem value="comment">Comment</SelectItem>
              {/* Add other relevant entity types */}
            </SelectContent>
          </Select>
        </div>

            </div>
          </CardContent>
        </Card>

        {/* Log Table Section */}
        <Card>
          <CardHeader>
            <CardTitle>Log Entries</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Loading and Error States */}
            {isLoading && (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
            {error && (
              <div className="text-red-500 text-center p-8">Error: {error}</div>
            )}

            {/* Audit Log Table */}
            {!isLoading && !error && (
              <div className="border rounded">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Entity Type</TableHead>
                      <TableHead>Entity ID</TableHead>
                      <TableHead>Status</TableHead>
                      {/* Add other headers if needed, e.g., Details */}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.length > 0 ? (
                      logs.map((log) => (
                        <TableRow key={log.logId}>
                          <TableCell>
                            {format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss")}
                          </TableCell>
                          <TableCell>{log.userId}</TableCell>
                          <TableCell>{log.action}</TableCell>
                          <TableCell>{log.entityType || "N/A"}</TableCell>
                          <TableCell>{log.entityId || "N/A"}</TableCell>
                          <TableCell>{log.status}</TableCell>
                          {/* Add other cells if needed */}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          No audit logs found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination Controls - Placed outside table card, but inside main content div */}
        {!isLoading && !error && logs.length > 0 && (
          <div className="flex justify-between items-center pt-4">
            <span>
              Showing {pagination.offset + 1} -{" "}
              {Math.min(pagination.offset + pagination.limit, totalCount)} of{" "}
              {totalCount}
            </span>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage} // Connect handler
                disabled={pagination.offset === 0} // Previous disabled if offset is 0
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage} // Connect handler
                // Next disabled if we are showing the last page
                disabled={pagination.offset + pagination.limit >= totalCount}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogPage;
