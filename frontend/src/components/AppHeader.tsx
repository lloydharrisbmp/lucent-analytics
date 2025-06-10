import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/internal-components/ModeToggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, CircleUser, Home, Briefcase, Building, FileText, LineChart, Target, Settings, Activity, Coins, Landmark, ShieldCheck, UserCog, Banknote, Goal, Users, Files } from "lucide-react";
import { useCurrentUser } from "app";
import OrganizationSwitcher from "./OrganizationSwitcher";
import NotificationBell from "./NotificationBell"; // Assuming path

const NavigationLinks = () => (
  <nav className="grid gap-2 text-lg font-medium">
    <Link
      to="/"
      className="flex items-center gap-2 text-lg font-semibold"
    >
      <Landmark className="h-6 w-6" />
      <span className="sr-only">Lucent Analytics</span>
    </Link>
    <Link
      to="/dashboard"
      className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
    >
      <Home className="h-5 w-5" />
      Dashboard
    </Link>
    <Link
      to="/data-management"
      className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
    >
      <Briefcase className="h-5 w-5" />
      Data Management
    </Link>
    <Link
      to="/entity-management"
      className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
    >
      <Building className="h-5 w-5" />
      Entity Management
    </Link>
     <Link
      to="/business-planning"
      className="mx-[-0.65rem] flex items-center gap-4 rounded-xl bg-muted px-3 py-2 text-foreground hover:text-foreground"
    >
      <FileText className="h-5 w-5" />
      Business Planning
    </Link>
    <Link
      to="/financial-forecasting"
      className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
    >
      <LineChart className="h-5 w-5" />
      Financial Forecasting
    </Link>
    <Link
      to="/benchmarking"
      className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
    >
      <Target className="h-5 w-5" />
      Benchmarking
    </Link>
    <Link
      to="/grant-management"
      className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
    >
      <Coins className="h-5 w-5" />
      Grant Management
    </Link>
     <Link
      to="/financial-health"
      className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
    >
      <Activity className="h-5 w-5" />
      Financial Health
    </Link>
    <Link
      to="/compliance-tax"
      className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
    >
      <ShieldCheck className="h-5 w-5" />
      Compliance & Tax
    </Link>
     <Link
      to="/reporting"
      className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
    >
      <Files className="h-5 w-5" />
      Reporting
    </Link>
    {/* <Link
      to="/administration"
      className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
    >
      <UserCog className="h-5 w-5" />
      Administration
    </Link> */}
    <Link
      to="/subscriptions"
      className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
    >
      <Banknote className="h-5 w-5" />
      Subscriptions
    </Link>
    <Link
      to="/organizations"
      className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
    >
      <Users className="h-5 w-5" />
      Organizations
    </Link>
    <Link
      to="/settings"
      className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
    >
      <Settings className="h-5 w-5" />
      Settings
    </Link>
  </nav>
);

const AppHeader = () => {
  const { user } = useCurrentUser();

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
      {/* Desktop Navigation Trigger (Hidden but keeps layout consistent) */}
      <div className="hidden md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
         <Link
          to="/"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <Landmark className="h-6 w-6" />
          <span className="sr-only">Lucent Analytics</span>
        </Link>
        {/* Other desktop nav items could go here if needed, but primary nav is sidebar */}
      </div>

      {/* Mobile Navigation */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <NavigationLinks />
        </SheetContent>
      </Sheet>

      {/* Header Right Section */}
      <div className="flex w-full items-center justify-end gap-4 md:ml-auto md:gap-2 lg:gap-4">
         <OrganizationSwitcher />
         <NotificationBell />
         <ModeToggle />
        {user ? (
          <Link to="/settings">
            <Button variant="secondary" size="icon" className="rounded-full">
              <CircleUser className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
           </Link>
        ) : (
          <Link to="/login">
             <Button variant="ghost">Login</Button>
          </Link>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
