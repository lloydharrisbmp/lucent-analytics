// ui/src/utils/mockUserData.ts

// Define a simple UserProfile interface for mock data
// Note: If a global UserProfile type exists, prefer that.
export interface MockUserProfile {
  userId: string;
  displayName: string;
  email: string;
  role: 'Admin' | 'Advisor' | 'Staff' | 'Client Portal User' | 'ReadOnly';
}

export const mockUsers: MockUserProfile[] = [
  // Internal Users
  {
    userId: "user_internal_admin_01",
    displayName: "Alice Admin",
    email: "alice.admin@internal.com",
    role: "Admin",
  },
  {
    userId: "user_internal_advisor_01",
    displayName: "Bob Advisor",
    email: "bob.advisor@internal.com",
    role: "Advisor",
  },
  {
    userId: "user_internal_staff_01",
    displayName: "Charlie Staff",
    email: "charlie.staff@internal.com",
    role: "Staff",
  },
  // Portal Users (Clients)
  {
    userId: "user_portal_client_01",
    displayName: "David Client",
    email: "david.client@external.com",
    role: "Client Portal User",
  },
  {
    userId: "user_portal_client_02",
    displayName: "Eve External",
    email: "eve.external@business.com",
    role: "Client Portal User",
  },
  {
    userId: "user_portal_client_03",
    displayName: "Frank Finance",
    email: "frank.finance@clientco.com",
    role: "Client Portal User",
  },
   {
    userId: "user_portal_client_04",
    displayName: "Grace General",
    email: "grace.general@domain.org",
    role: "Client Portal User",
  },
   {
    userId: "user_readonly_viewer_01",
    displayName: "Ivy Intern",
    email: "ivy.intern@internal.com",
    role: "ReadOnly",
  },
];

// Helper function to get just the portal users from the mock list
export const getMockPortalUsers = (): MockUserProfile[] => {
  return mockUsers.filter(user => user.role === 'Client Portal User');
};
