import { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom'; // Import useLocation
import { useOrg } from 'components/OrgProvider';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { firebaseAuth, useCurrentUser } from 'app';
import { Bell, Menu, X, ChevronRight, LayoutDashboard, BarChart3, FileText, Settings, CalendarClock, Home, LineChart, User, File, TrendingUp, FileSpreadsheet, Landmark, Building2, Cloud, ShieldAlert, HeartPulse, PenTool, NotebookText, BuildingIcon, Target, DraftingCompass, CircleDollarSign, Users, LogOut, HelpCircle, ChevronLeft } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
undefined
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from '@/hooks/use-theme';
import { getInitials } from 'utils/string-utils';
import { Organization, useOrganizationContext } from 'components/OrganizationContext';
import { Badge } from "@/components/ui/badge";
import NotificationCenter from "components/NotificationCenter";
import { useNotificationsStore } from "utils/notificationsStore";

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

function NavLink({ to, icon, label, active }: NavLinkProps) {
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${active ? 'bg-secondary' : 'hover:bg-secondary/50'}`}
    >
      {icon}
      {label}
    </Link>
  );
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [open, setOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { user } = useCurrentUser();
  const { currentOrganization, isLoading: orgLoading } = useOrg(); // Get loading state
  const navigate = useNavigate();
  const location = useLocation(); // Use the hook here
  const { unreadCount, fetchNotifications } = useNotificationsStore();

  useEffect(() => {
    console.log(`DashboardLayout useEffect triggered. Path: ${location.pathname}, OrgLoading: ${orgLoading}, CurrentOrg: ${currentOrganization ? currentOrganization.id : 'null'}`); // Detailed log
    // Wait until organization loading is finished
    if (orgLoading) {
      console.log("DashboardLayout useEffect: Org still loading, returning."); // Log condition
      return;
    }

    // If not on /organizations and no current organization, redirect
    if (location.pathname !== '/organizations' && !currentOrganization) {
      console.log(`DashboardLayout useEffect: Redirecting to /organizations. Current path: ${location.pathname}, Current Org: ${currentOrganization ? currentOrganization.id : 'null'}`); // Log redirect
      navigate('/organizations');
    } else {
      console.log("DashboardLayout useEffect: Redirect condition not met."); // Log no redirect
    }
    // Dependency array includes location.pathname and currentOrganization
  }, [currentOrganization, navigate, location.pathname, orgLoading]);

  useEffect(() => {
    // Fetch initial notification count when layout mounts and user is available
    if (user && !orgLoading && currentOrganization) { // Also ensure org is loaded
      fetchNotifications(user.uid, currentOrganization.id); 
    }
  }, [user, fetchNotifications, orgLoading, currentOrganization]); // Add orgLoading and currentOrganization

  // Get user initials for avatar (simplified)
  const getInitials = () => {
    if (!user || !user.displayName) return 'U';
    return user.displayName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Lucent Analytics</h2>
        </div>

        <div className="flex-1 py-6 px-3 space-y-1">
          <NavLink 
            to="/dashboard" 
            icon={<Home className="h-4 w-4" />} 
            label="Dashboard" 
            active={location.pathname === '/dashboard'}
          />
          {/* Entity Relationship Management Link */}
          <NavLink 
            to="/entityrelationshipmanagement" 
            icon={<BuildingIcon className="h-4 w-4" />} 
            label="Entity Management" 
            active={location.pathname === '/entityrelationshipmanagement'}
          />
          <NavLink 
            to="/reports" 
            icon={<FileText className="h-4 w-4" />} 
            label="Reports" 
            active={location.pathname === '/reports'}
          />
          <NavLink 
            to="/report-templates" 
            icon={<FileText className="h-4 w-4" />} 
            label="Report Templates" 
            active={location.pathname === '/report-templates'}
          />
          <NavLink 
            to="/report-builder" 
            icon={<PenTool className="h-4 w-4" />} 
            label="Report Builder" 
            active={location.pathname === '/report-builder'}
          />
          <NavLink 
            to="/forecasting" 
            icon={<TrendingUp className="h-4 w-4" />} 
            label="Forecasting" 
            active={location.pathname === '/forecasting'}
          />
          <NavLink 
            to="/advanced-forecasting" 
            icon={<TrendingUp className="h-4 w-4" />} 
            label="Advanced Forecasting" 
            active={location.pathname === '/advanced-forecasting'}
          />
          <NavLink 
            to="/business-planning" 
            icon={<NotebookText className="h-4 w-4" />} 
            label="Business Planning" 
            active={location.pathname === '/business-planning'}
          />
          <NavLink 
            to="/scenario-response-planning" 
            icon={<ShieldAlert className="h-4 w-4" />} 
            label="Response Planning" 
            active={location.pathname === '/scenario-response-planning'}
          />
          <NavLink 
            to="/visualizations" 
            icon={<BarChart3 className="h-4 w-4" />} 
            label="Visualizations" 
            active={location.pathname === '/visualizations'}
          />
          <NavLink 
            to="/benchmarks" 
            icon={<LineChart className="h-4 w-4" />} 
            label="Benchmarks" 
            active={location.pathname === '/benchmarks'}
          />
          <NavLink 
            to="/FinancialHealthDashboard" 
            icon={<HeartPulse className="h-4 w-4" />} 
            label="Financial Health" 
            active={location.pathname === '/FinancialHealthDashboard'}
          />
          <NavLink 
            to="/business-seasonality" 
            icon={<Landmark className="h-4 w-4" />} 
            label="Seasonality" 
            active={location.pathname === '/business-seasonality'}
          />
          <NavLink 
            to="/seasonal-analysis" 
            icon={<Cloud className="h-4 w-4" />} 
            label="Seasonal Analysis" 
            active={location.pathname === '/seasonal-analysis'}
          />
          <NavLink 
            to="/clients" 
            icon={<User className="h-4 w-4" />} 
            label="Clients" 
            active={location.pathname === '/clients'}
          />
          {/* Add new link here */}
          <NavLink 
            to="/coa-mapping" 
            icon={<Settings className="h-4 w-4" />} 
            label="CoA Cash Flow Mapping" 
            active={location.pathname === '/coa-mapping'}
          />
          <NavLink 
            to="/imports" 
            icon={<FileSpreadsheet className="h-4 w-4" />} 
            label="Imports" 
            active={location.pathname === '/imports'}
          />
          <NavLink 
            to="/organizations" 
            icon={<Building2 className="h-4 w-4" />} 
            label="Organizations" 
            active={location.pathname === '/organizations'}
          />
          <NavLink 
            to="/data-imports" 
            icon={<FileSpreadsheet className="h-4 w-4" />} 
            label="Data Imports" 
            active={location.pathname === '/data-imports'}
          />
          <NavLink 
            to="/budgetmanagement" 
            icon={<CircleDollarSign className="h-4 w-4" />} 
            label="Budget Management" 
            active={location.pathname === '/budgetmanagement'}
          />
          <NavLink 
            to="/budget-management" 
            icon={<CircleDollarSign className="h-4 w-4" />} 
            label="Budget Management" 
            active={location.pathname === '/budget-management'}
          />
          <NavLink 
            to="/BudgetingPage" 
            icon={<Target className="h-4 w-4" />} 
            label="Budgeting" 
            active={location.pathname === '/BudgetingPage'}
          />
          {/* Scenario Management Link */}
          <NavLink 
            to="/ScenarioManagementPage" 
            icon={<DraftingCompass className="h-4 w-4" />} 
            label="Scenario Management" 
            active={location.pathname === '/ScenarioManagementPage'}
          />
          <NavLink 
            to="/settings" 
            icon={<Settings className="h-4 w-4" />} 
            label="Settings" 
            active={location.pathname === '/settings'}
          />
        </div>

        <div className="p-3 border-t">
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar>
              <AvatarFallback>{getInitials()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.displayName || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header + Content */}
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center lg:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="p-4 border-b flex items-center justify-between">
                  <h2 className="text-xl font-bold">Lucent Analytics</h2>
                  <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <ScrollArea className="h-[calc(100vh-8rem)]">
                  <div className="py-6 px-3 space-y-1">
                    <NavLink 
                      to="/dashboard" // Changed from "/"
                      icon={<LayoutDashboard className="h-4 w-4" />} 
                      label="Dashboard" 
                      active={location.pathname === '/dashboard'} // Changed from "/"
                    />
                    <NavLink 
                      to="/reports" 
                      icon={<BarChart3 className="h-4 w-4" />} 
                      label="Reports" 
                      active={location.pathname === '/reports'}
                    />
                    <NavLink 
                      to="/business-seasonality" 
                      icon={<CalendarClock className="h-4 w-4" />} 
                      label="Seasonality" 
                      active={location.pathname === '/business-seasonality'}
                    />
                    <NavLink 
                      to="/report-builder" 
                      icon={<PenTool className="h-4 w-4" />} 
                      label="Report Builder" 
                      active={location.pathname === '/report-builder'}
                    />
                    <NavLink 
                      to="/business-planning" 
                      icon={<NotebookText className="h-4 w-4" />} 
                      label="Business Planning" 
                      active={location.pathname === '/business-planning'}
                    />
                    <NavLink 
                      to="/imports" 
                      icon={<FileText className="h-4 w-4" />} 
                      label="Imports" 
                      active={location.pathname === '/imports'}
                    />
                    <NavLink 
                      to="/organizations" 
                      icon={<Settings className="h-4 w-4" />} 
                      label="Organizations" 
                      active={location.pathname === '/organizations'}
                    />
                    <NavLink 
                      to="/BudgetingPage" 
                      icon={<Target className="h-4 w-4" />} 
                      label="Budgeting" 
                      active={location.pathname === '/BudgetingPage'}
                    />
                  </div>
                </ScrollArea>
                <div className="p-3 border-t">
                  <div className="flex items-center gap-3 px-3 py-2">
                    <Avatar>
                      <AvatarFallback>{getInitials()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-medium truncate">{user?.displayName || 'User'}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <div className="ml-3 lg:hidden">
              <h1 className="text-lg font-bold">Lucent Analytics</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsNotificationsOpen(true)}
              className="relative"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-4 w-4 justify-center rounded-full p-0 text-xs"
                >
                  {unreadCount > 0 ? unreadCount : ''} {/* Display count if > 0 */}
                </Badge>
              )}
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
        <NotificationCenter 
          isOpen={isNotificationsOpen} 
          onClose={() => setIsNotificationsOpen(false)}
          entityId={currentOrganization?.id} // Pass entityId if available
        />
      </div>
    </div>
  );
}