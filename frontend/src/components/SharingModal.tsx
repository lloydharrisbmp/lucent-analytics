import React, { useState, useEffect } from 'react';
import brain from 'brain';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMockPortalUsers, MockUserProfile } from 'utils/mockUserData'; // Still using mock users for now
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Added Select imports
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Search, X } from 'lucide-react';
import { toast } from 'sonner';
// Import necessary types (adjust path if needed)
import { GetContentPermissionsData, GrantAccessRequest, RevokeAccessRequest } from 'types';

type ContentType = 'report' | 'dashboard';

interface Props {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  contentType: ContentType | null;
  contentId: string | null;
  contentName: string | null;
  organizationId: string | null | undefined; // Added organizationId
  onSharingUpdate?: () => void;
}

export const SharingModal: React.FC<Props> = ({
  isOpen,
  onOpenChange,
  contentType,
  contentId,
  contentName,
  organizationId,
  onSharingUpdate,
}) => {
  const [portalUsers, setPortalUsers] = useState<MockUserProfile[]>([]);
  const [sharedWithUserIds, setSharedWithUserIds] = useState<Set<string>>(new Set());
  const [initialSharedUserIds, setInitialSharedUserIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('viewer'); // Default role viewer
  const [isUpdatingPermissions, setIsUpdatingPermissions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient(); // To invalidate cache

  // Fetch mock portal users (replace with API call later)
  useEffect(() => {
    const users = getMockPortalUsers();
    // Use user.id and user.name from MockUserProfile
    setPortalUsers(users.map(u => ({...u, name: u.displayName, id: u.userId })));
  }, []);

  // Fetch current permissions when modal opens and identifiers are available
  const { isLoading: isLoadingPermissions, error: permissionsError } = useQuery<GetContentPermissionsData, Error>({
    queryKey: ['contentPermissions', organizationId, contentType, contentId],
    queryFn: async () => {
      if (!organizationId || !contentType || !contentId) {
        throw new Error('Missing required identifiers for fetching permissions.');
      }
      console.log(`Fetching permissions for org:${organizationId}, type:${contentType}, id:${contentId}`);
      const response = await brain.get_content_permissions({
        organization_id: organizationId,
        content_type: contentType,
        content_id: contentId,
      });
      const data: GetContentPermissionsData = await response.json();
      console.log('Permissions fetched:', data);
      return data;
    },
    enabled: !!isOpen && !!organizationId && !!contentType && !!contentId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1,
    onSuccess: (data) => {
      const userIds = new Set(data.map((p) => p.user_id));
      setSharedWithUserIds(userIds);
      setInitialSharedUserIds(new Set(userIds));
      setError(null);
    },
    onError: (err) => {
      console.error('Error fetching permissions:', err);
      setError(`Failed to load permissions: ${err.message}`);
      toast.error('Failed to load current sharing status.');
      setSharedWithUserIds(new Set());
      setInitialSharedUserIds(new Set());
    },
  });

  // Reset local state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setError(null);
      // sharedWithUserIds/initialSharedUserIds are reset via useQuery enable/disable
    }
  }, [isOpen]);

  const handleUserToggle = (userId: string) => {
    setSharedWithUserIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  // --- Mutation Logic for Saving Permissions ---
  const grantAccessMutation = useMutation<void, Error, GrantAccessRequest>({
    mutationFn: async (variables) => {
      console.log('Calling grant_access with:', variables);
      await brain.grant_access(variables);
    },
    onError: (error, variables) => {
      console.error('grant_access mutation failed:', error, 'Variables:', variables);
    },
  });

  const revokeAccessMutation = useMutation<void, Error, RevokeAccessRequest>({
    mutationFn: async (variables) => {
      console.log('Calling revoke_access with:', variables);
      await brain.revoke_access(variables);
    },
    onError: (error, variables) => {
      console.error('revoke_access mutation failed:', error, 'Variables:', variables);
    },
  });

  const handleSavePermissions = async () => {
    if (!organizationId || !contentType || !contentId) {
      toast.error('Cannot save permissions. Missing context.');
      return;
    }

    const usersToAdd = Array.from(sharedWithUserIds).filter((id) => !initialSharedUserIds.has(id));
    const usersToRemove = Array.from(initialSharedUserIds).filter((id) => !sharedWithUserIds.has(id));

    if (usersToAdd.length === 0 && usersToRemove.length === 0) {
      toast.info('No changes made to sharing settings.');
      onOpenChange(false);
      return;
    }

    setIsUpdatingPermissions(true);
    setError(null);
    console.log('Saving sharing changes:', { usersToAdd, usersToRemove });

    try {
      const grantPromises = usersToAdd.map((userId) =>
        grantAccessMutation.mutateAsync({
          organization_id: organizationId,
          content_type: contentType,
          content_id: contentId,
          user_id: userId,
          role: selectedRole, // Use selectedRole from state
        }),
      );
      const revokePromises = usersToRemove.map((userId) =>
        revokeAccessMutation.mutateAsync({
          organization_id: organizationId,
          content_type: contentType,
          content_id: contentId,
          user_id: userId,
        }),
      );

      const results = await Promise.allSettled([...grantPromises, ...revokePromises]);
      const failedMutations = results.filter((result) => result.status === 'rejected');

      if (failedMutations.length > 0) {
        console.error('Some permission updates failed:', failedMutations);
        const firstError = failedMutations[0].reason as Error;
        throw new Error(`Failed to update some permissions: ${firstError.message || 'Unknown error'}`);
      }

      toast.success(`Sharing updated for ${contentName || 'item'}.`);
      setInitialSharedUserIds(new Set(sharedWithUserIds)); // Update initial state
      queryClient.invalidateQueries({ queryKey: ['contentPermissions', organizationId, contentType, contentId] }); // Use object syntax for v5
      if (onSharingUpdate) onSharingUpdate();
      onOpenChange(false);

    } catch (err) {
      console.error('Failed to update permissions:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Failed to update sharing settings: ${errorMessage}`);
      toast.error(`Failed to update sharing settings: ${errorMessage}`);
    } finally {
      setIsUpdatingPermissions(false);
    }
  };

  // --- UI Rendering Logic ---
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredUsers = portalUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || // Use user.name
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (!isOpen) return null; // Don't render anything if modal is closed

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!isUpdatingPermissions) onOpenChange(open); }}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Share: {contentName || 'Item'}</DialogTitle>
          <DialogDescription>
            Select users within your organization to share this {contentType} with.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="text-red-600 text-sm p-2 bg-red-100 border border-red-300 rounded-md mt-2">
            {error}
          </div>
        )}
        {permissionsError && !error && ( // Show permissions error specifically if not overridden by save error
             <div className="text-red-600 text-sm p-2 bg-red-100 border border-red-300 rounded-md mt-2">
                Failed to load current permissions: {permissionsError.message}
             </div>
         )}

        <div className="py-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="user-search"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-8 pr-8"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 text-muted-foreground"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="role-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Permission Level
            </label>
            <Select value={selectedRole} onValueChange={setSelectedRole} disabled={isUpdatingPermissions || isLoadingPermissions}>
              <SelectTrigger id="role-select" className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer (Can view)</SelectItem>
                <SelectItem value="editor">Editor (Can view and edit)</SelectItem>
                {/* Add other roles as needed, e.g., commenter */}
              </SelectContent>
            </Select>
          </div>

          {isLoadingPermissions ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading permissions...</span>
            </div>
          ) : (
            <ScrollArea className="h-60 w-full rounded-md border">
              <div className="p-4 space-y-3">
                {filteredUsers.length === 0 ? (
                  <p className="text-center text-muted-foreground">No matching users found.</p>
                ) : (
                  filteredUsers.map((user) => (
                    // Use user.id from the mapped portalUsers
                    <div key={user.id} className="flex items-center justify-between">
                      <label htmlFor={`user-${user.id}`} className="flex flex-col flex-grow cursor-pointer mr-4">
                        <span className="font-medium text-sm">{user.name}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </label>
                      <Checkbox
                        id={`user-${user.id}`}
                        checked={sharedWithUserIds.has(user.id)}
                        onCheckedChange={() => handleUserToggle(user.id)}
                        disabled={isUpdatingPermissions}
                      />
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline" disabled={isUpdatingPermissions}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleSavePermissions} disabled={isLoadingPermissions || isUpdatingPermissions}>
            {isUpdatingPermissions && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
