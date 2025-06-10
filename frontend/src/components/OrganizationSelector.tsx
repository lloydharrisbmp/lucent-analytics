import React from 'react';
import { useOrg } from 'components/OrgProvider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function OrganizationSelector() {
  const { organizations, currentOrganization, setCurrentOrganization } = useOrg();

  if (organizations.length === 0) {
    return (
      <Select disabled>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="No organizations" />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select
      value={currentOrganization?.id || ''}
      onValueChange={(value) => setCurrentOrganization(value)}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue 
          placeholder="Select organization" 
          className="truncate"
        />
      </SelectTrigger>
      <SelectContent>
        {organizations.map((org) => (
          <SelectItem key={org.id} value={org.id}>
            {org.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}