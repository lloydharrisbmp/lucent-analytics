import React, { useEffect, useState } from 'react';
import { Outlet } from "react-router-dom";
import { Toaster } from '@/components/ui/sonner';
import { useNavigate, useLocation, Route, Routes } from "react-router-dom";
import { CircleUser, BarChartBig, LineChart, DollarSign, Users, Settings, Menu, Coins, Calculator, BarChart2, Lightbulb, ListChecks } from "lucide-react";
import { firebaseApp, useCurrentUser } from 'app'; // Import useCurrentUser
import { ThemeProvider } from "@/internal-components/ThemeProvider";
import { useOrganizationStore } from "utils/organizationStore";
import { OrgProvider } from "components/OrgProvider";
import brain from "brain"; // Import brain client
// Notification components are handled by DashboardLayout

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  console.log("AppProvider rendering");
  const { user, loading: userLoading } = useCurrentUser(); // Get user state
  const orgStore = useOrganizationStore();
  const fetchUserOrganizations = orgStore.fetchUserOrganizations; // Get function reference
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    console.log("AppProvider mount/user effect triggered");
    // Fetch organizations once user is loaded and exists
    if (user && !userLoading) {
      console.log("User authenticated, fetching organizations...");
            console.log("User authenticated, fetching organizations...");
      fetchUserOrganizations();

      // Check user roles for portal redirect
      const checkRolesAndRedirect = async () => {
        try {
          console.log(`Checking roles for user: ${user.uid}`);
          const response = await brain.list_user_roles({ userId: user.uid });
          const roles = await response.json();
          console.log("User roles:", roles);

          const isPortalUser = roles.some(role => role.roleName === "Client Portal User");
          
          if (isPortalUser) {
            console.log("User is Client Portal User.");
            // Redirect only if not already on the portal landing page
            if (location.pathname !== "/portal-landing") {
              console.log(`Redirecting to /portal-landing from ${location.pathname}`);
              navigate('/portal-landing', { replace: true });
            }
          } else {
             console.log("User is not a Client Portal User.");
             // Optional: Redirect non-portal users away from portal if they land there?
             // if (location.pathname === "/portal-landing") {
             //    console.log("Non-portal user on portal page, redirecting to / ");
             //    navigate('/', { replace: true });
             // }
          }
        } catch (error) {
          console.error("Failed to fetch user roles or redirect:", error);
          // Handle error appropriately, maybe show a toast
        }
      };

      checkRolesAndRedirect();
    } else if (!userLoading) {
    } else if (!userLoading) {
      console.log("User not authenticated or still loading, not fetching organizations yet.");
    }
    // Depend on user, userLoading, and the fetch function reference
  }, [user, userLoading, fetchUserOrganizations]);

  console.log("Organizations store status:", {
    organizations: orgStore.organizations.length,
    currentOrgId: orgStore.currentOrganizationId,
    isLoading: orgStore.isLoading,
    hasError: !!orgStore.error
  });

  const SideNavigation = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const isActive = (path: string) => {
      return location.pathname === path;
    };
    
    const navItems = [
      { icon: <BarChartBig size={20} />, label: 'Dashboard', path: '/' },
      { icon: <LineChart size={20} />, label: 'Cash Flow', path: '/CashFlowDashboard' },
      { icon: <DollarSign size={20} />, label: 'Financials', path: '/Financials' },
      { icon: <Calculator size={20} />, label: 'Driver Input', path: '/ForecastDriverInput' }, // <-- Added Driver Input
      { icon: <BarChartBig size={20} />, label: 'Financial Health', path: '/FinancialHealthAssessment' },
      { icon: <BarChartBig size={20} />, label: 'Health Indicators', path: '/FinancialHealthIndicators' },
      { icon: <Users size={20} />, label: 'Clients', path: '/Clients' },
      { icon: <Coins size={20} />, label: 'Grants', path: '/GovernmentGrants' },
      { icon: <Settings size={20} />, label: 'Settings', path: '/Settings' },
      { icon: <ListChecks size={20} />, label: 'Audit Logs', path: '/AuditLogPage' }, // Added Audit Logs
      { icon: <BarChart2 size={20} />, label: 'Benchmark Comparison', path: '/BenchmarkComparison' },
      { icon: <Lightbulb size={20} />, label: 'Analysis Highlights', path: '/AnalysisHighlights' },
    ];
    
    return (
      <div className="hidden lg:flex h-screen w-60 flex-col bg-slate-50 dark:bg-slate-900 border-r border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-center mb-8 pl-2">
          <div className="h-8 w-8 rounded-full bg-primary mr-2" />
          <h1 className="text-xl font-bold">Lucent Analytics</h1>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium ${isActive(item.path) 
                ? 'bg-primary text-primary-foreground' 
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    );
  };
  
  const MobileHeader = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    
    const navItems = [
      { icon: <BarChartBig size={20} />, label: 'Dashboard', path: '/' },
      { icon: <LineChart size={20} />, label: 'Cash Flow', path: '/CashFlowDashboard' },
      { icon: <DollarSign size={20} />, label: 'Financials', path: '/Financials' },
      { icon: <Calculator size={20} />, label: 'Driver Input', path: '/ForecastDriverInput' }, // <-- Added Driver Input
      { icon: <BarChartBig size={20} />, label: 'Financial Health', path: '/FinancialHealthAssessment' },
      { icon: <BarChartBig size={20} />, label: 'Health Indicators', path: '/FinancialHealthIndicators' },
      { icon: <Users size={20} />, label: 'Clients', path: '/Clients' },
      { icon: <Coins size={20} />, label: 'Grants', path: '/GovernmentGrants' },
      { icon: <Settings size={20} />, label: 'Settings', path: '/Settings' },
    ];
    
    return (
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary mr-2" />
          <h1 className="text-xl font-bold">Lucent</h1>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-md">
          <Menu size={24} />
        </button>
        
        {isOpen && (
          <div className="absolute top-16 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-50">
            <nav className="p-4 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setIsOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    );
  };
  
  const Layout = () => {
    return (
      <div className="flex h-screen bg-background">
        <SideNavigation />
        <div className="flex-1 flex flex-col overflow-hidden">
          <MobileHeader />
          <main className="flex-1 overflow-y-auto">
            {/* Render the main content passed as children */}
            {children}
            {/* REMOVED NotificationBell and NotificationCenter from here */}
            {/* The NotificationBell is already rendered in DashboardLayout */}
            {/* NotificationCenter should likely be triggered from NotificationBell */}
          </main>
        </div>
      </div>
    );
  };

  return (
    <ThemeProvider>
      <OrgProvider>
        <Layout />
        <Toaster richColors position="top-right" />
      </OrgProvider>
    </ThemeProvider>
  );
};
