import React, { useState, useEffect } from "react";
import brain from "brain"; // Import brain client
import { AssignRoleRequest, RoleAssignment } from "types"; // Import types
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Import Input
import { toast } from "sonner";
import { Terminal, Trash2, Loader2, PlusCircle } from "lucide-react"; // Import icons

// Define scope types explicitly
type ScopeType = "Organization" | "Entity";
// Define valid roles
const VALID_ROLES = ["Admin", "Advisor", "Staff", "ReadOnly"] as const;
type RoleType = (typeof VALID_ROLES)[number];

// Placeholder data - replace with actual fetched data later
const organizations = [
  { id: "org_123", name: "Org Alpha" },
  { id: "org_456", name: "Org Beta" },
];
const entities = [
  { id: "ent_abc", name: "Entity X" },
  { id: "ent_xyz", name: "Entity Y" },
];

const RoleManagement = () => {
  const [scopeType, setScopeType] = useState<ScopeType>("Organization");
  const [selectedScopeId, setSelectedScopeId] = useState<string | null>(null);
  const [roleAssignments, setRoleAssignments] = useState<RoleAssignment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState<boolean>(false); // State for assign loading
  const [assignUserId, setAssignUserId] = useState<string>("");
  const [assignRole, setAssignRole] = useState<RoleType>("Staff"); // Default role

  // Function to fetch roles
  const fetchRoles = async () => {
    if (!selectedScopeId || !scopeType) {
      setRoleAssignments([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await brain.list_scope_roles({
        scope_type: scopeType,
        scope_id: selectedScopeId,
      });
      const data: RoleAssignment[] = await response.json();
      setRoleAssignments(data || []);
    } catch (err: any) {
      console.error("Error fetching roles:", err);
      setError(`Failed to fetch roles: ${err.message || 'Unknown error'}`);
      setRoleAssignments([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch roles effect
  useEffect(() => {
    fetchRoles();
  }, [scopeType, selectedScopeId]);

  const handleScopeTypeChange = (value: string) => {
    if (value === "Organization" || value === "Entity") {
      setScopeType(value as ScopeType);
      setSelectedScopeId(null);
      setRoleAssignments([]);
      setError(null);
      setAssignUserId(""); // Reset assign fields
    }
  };

  const handleScopeIdChange = (value: string) => {
    setSelectedScopeId(value);
    setAssignUserId(""); // Reset assign fields
    // Fetching is handled by useEffect
  };

  // Handle revoking a role
  const handleRevokeRole = async (assignmentId: string) => {
    setRevokingId(assignmentId);
    try {
      await brain.revoke_role({ role_assignment_id: assignmentId });
      toast.success("Role revoked successfully!");
      fetchRoles();
    } catch (err: any) {
      console.error("Error revoking role:", err);
      toast.error(`Failed to revoke role: ${err.message || 'Unknown error'}`);
    } finally {
      setRevokingId(null);
    }
  };

  // Handle assigning a role
  const handleAssignRole = async () => {
    if (!selectedScopeId || !assignUserId || !assignRole) {
      toast.warning("Please provide User ID and select a Role.");
      return;
    }

    setIsAssigning(true);
    try {
       const body: AssignRoleRequest = {
         scope_type: scopeType,
         scope_id: selectedScopeId,
         user_id: assignUserId,
         role: assignRole,
       }
      await brain.assign_role(body);
      toast.success(`Role '${assignRole}' assigned to user ${assignUserId} successfully!`);
      setAssignUserId(""); // Clear input field
      fetchRoles(); // Refresh the list
    } catch (err: any) {
      console.error("Error assigning role:", err);
      toast.error(`Failed to assign role: ${err.message || 'Unknown error'}`);
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Role Management</h1>

      {/* Scope Selection Card - unchanged */}
      <Card className="mb-4">
        {/* ... (scope selection content remains the same) ... */}
         <CardHeader>
          <CardTitle>Scope Selection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-2 block">Select Scope Type:</Label>
            <RadioGroup
              defaultValue={scopeType}
              onValueChange={handleScopeTypeChange}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Organization" id="r-org" />
                <Label htmlFor="r-org">Organization</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Entity" id="r-ent" />
                <Label htmlFor="r-ent">Entity</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="mb-2 block">Select Specific {scopeType}:</Label>
            <Select onValueChange={handleScopeIdChange} value={selectedScopeId ?? ""}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder={`Select a ${scopeType}...`} />
              </SelectTrigger>
              <SelectContent>
                {scopeType === "Organization" &&
                  organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name} (ID: {org.id})
                    </SelectItem>
                  ))}
                {scopeType === "Entity" &&
                  entities.map((ent) => (
                    <SelectItem key={ent.id} value={ent.id}>
                      {ent.name} (ID: {ent.id})
                    </SelectItem>
                  ))}
                {(scopeType === "Organization" && organizations.length === 0) ||
                (scopeType === "Entity" && entities.length === 0) ? (
                  <SelectItem value="loading" disabled>
                    Loading or no {scopeType.toLowerCase()}s found...
                  </SelectItem>
                ) : null}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* User Roles Card */}
      <Card>
        <CardHeader>
          <CardTitle>
            User Roles for {selectedScopeId ? `${scopeType} ${selectedScopeId}` : 'Selected Scope'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedScopeId ? (
            <p className="text-muted-foreground">Please select a scope above to view and manage roles.</p>
          ) : error ? (
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : isLoading ? (
            <p className="text-muted-foreground">Loading roles...</p>
          ) : (
            <>
              {/* Roles Table - unchanged */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roleAssignments.length > 0 ? (
                    roleAssignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell>{assignment.user_id}</TableCell>
                        <TableCell>{assignment.role}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRevokeRole(assignment.id)}
                            disabled={revokingId === assignment.id}
                          >
                            {revokingId === assignment.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="mr-2 h-4 w-4" />
                            )}
                            Revoke
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        No roles assigned in this scope yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Assign Role Section */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-medium mb-4">Assign New Role</h3>
                <div className="flex items-end space-x-2">
                  <div className="flex-1">
                    <Label htmlFor="assign-user-id">User ID</Label>
                    <Input
                      id="assign-user-id"
                      placeholder="Enter User ID"
                      value={assignUserId}
                      onChange={(e) => setAssignUserId(e.target.value)}
                      disabled={isAssigning}
                    />
                  </div>
                  <div className="w-[150px]">
                    <Label htmlFor="assign-role">Role</Label>
                    <Select
                      value={assignRole}
                      onValueChange={(value) => setAssignRole(value as RoleType)}
                      disabled={isAssigning}
                    >
                      <SelectTrigger id="assign-role">
                        <SelectValue placeholder="Select Role" />
                      </SelectTrigger>
                      <SelectContent>
                        {VALID_ROLES.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAssignRole} disabled={isAssigning || !assignUserId}>
                    {isAssigning ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <PlusCircle className="mr-2 h-4 w-4" />
                    )}
                    Assign Role
                  </Button>
                </div>
                 {/* Optional: Add validation message area here */}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleManagement;
