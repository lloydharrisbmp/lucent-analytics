import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "utils/cn";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { NavItem } from "@/components/ui/nav";
import { useTheme } from "@/hooks/use-theme";
import {
  Calculator,
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  Users,
  FileSpreadsheet,
  Settings,
  Home,
  Building,
  CalendarClock,
  DollarSign,
  Banknote,
  GitCompare,
  Award,
  HeartPulse
} from "lucide-react";

interface NavItem {
  title: string;
  icon: React.ReactNode;
  path: string;
  items?: { title: string; path: string }[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: <Home className="h-5 w-5" />,
  },
  {
    title: "Government Grants",
    path: "/government-grants",
    icon: <Award className="h-5 w-5" />,
    items: [
      { title: "ROI Analysis", path: "/grant-roi-analysis" },
      { title: "Grants Admin", path: "/grants-admin" },
    ],
  },
  {
    title: "Scenario Comparison",
    path: "/ScenarioComparison",
    icon: <GitCompare className="h-5 w-5" />,
  },
  {
    title: "Organizations",
    path: "/organizations",
    icon: <Building className="h-5 w-5" />,
  },
  {
    title: "Cash Flow Analysis",
    path: "/CashFlowAnalysis",
    icon: <DollarSign className="h-5 w-5" />,
    items: [
      { title: "Dashboard", path: "/CashFlowDashboard" },
      { title: "Optimization", path: "/CashFlowOptimization" },
      { title: "Scenario Modeling", path: "/scenario-modeling" },
    ],
  },
  {
    title: "Reports",
    path: "/reports",
    icon: <FileSpreadsheet className="h-5 w-5" />,
    items: [
      { title: "Profit & Loss", path: "/reports/profit-loss" },
      { title: "Balance Sheet", path: "/reports/balance-sheet" },
      { title: "Cash Flow", path: "/reports/cash-flow" },
    ],
  },
  {
    title: "Analytics",
    path: "/analytics",
    icon: <BarChart3 className="h-5 w-5" />,
    items: [
      { title: "Performance", path: "/analytics/performance" },
      { title: "KPIs", path: "/analytics/kpis" },
    ],
  },
  {
    title: "Forecasting",
    path: "/forecasting",
    icon: <TrendingUp className="h-5 w-5" />,
    items: [
      { title: "Scenarios", path: "/forecasting/scenarios" },
      { title: "Projections", path: "/forecasting/projections" },
    ],
  },
  {
    title: "Industry Benchmarks",
    path: "/industry-benchmarks",
    icon: <BarChart3 className="h-5 w-5" />,
    items: [
      { title: "Overview", path: "/industry-benchmarks" },
      { title: "Benchmark Comparison", path: "/benchmark-comparison" },
      { title: "Visualizations", path: "/benchmark-visualizations" },
    ],
  },
  {
    title: "Tax Compliance",
    path: "/tax-compliance",
    icon: <CalendarClock className="h-5 w-5" />,
  },
  {
    title: "Financial Health",
    path: "/FinancialHealthDashboard",
    icon: <HeartPulse className="h-5 w-5" />,
    items: [
      { title: "Dashboard", path: "/FinancialHealthDashboard" },
      { title: "Assessment", path: "/financial-health-assessment" },
    ],
  },
  {
    title: "Visualizations",
    path: "/visualizations",
    icon: <PieChart className="h-5 w-5" />,
  },
  {
    title: "Clients",
    path: "/clients",
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: "Advanced Analysis",
    path: "/AdvancedScenarioAnalysis",
    icon: <Calculator className="h-5 w-5" />,
  },
  {
    title: "Settings",
    path: "/settings",
    icon: <Settings className="h-5 w-5" />,
  },
];

interface Props {
  isOpen: boolean;
}

export const Sidebar = ({ isOpen }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = React.useState<Record<string, boolean>>({});
  
  const toggleExpandItem = (title: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Handle navigation for parent items with sub-items
  const handleNavigation = (item: NavItem) => {
    if (item.items && item.items.length > 0) {
      toggleExpandItem(item.title);
      if (!expandedItems[item.title]) {
        // If expanding and it's a parent with children, navigate to first child
        navigate(item.items[0].path);
      }
    } else {
      navigate(item.path);
    }
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] w-64 border-r bg-background transition-all duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-20"
      )}
    >
      <ScrollArea className="h-full py-6">
        <nav className="grid gap-2 px-4">
          <TooltipProvider delayDuration={0}>
            {navItems.map((item) => (
              <div key={item.title} className="mb-2">
                <div className="flex flex-col">
                  {isOpen ? (
                    <Button
                      variant={isActiveRoute(item.path) ? "secondary" : "ghost"}
                      className={cn("justify-start h-10", 
                        isActiveRoute(item.path) ? "font-medium" : "font-normal"
                      )}
                      onClick={() => handleNavigation(item)}
                    >
                      {item.icon}
                      <span className="ml-3">{item.title}</span>
                      {item.items && (
                        <span className="ml-auto">
                          {expandedItems[item.title] ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                            >
                              <path d="m18 15-6-6-6 6" />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                            >
                              <path d="m6 9 6 6 6-6" />
                            </svg>
                          )}
                        </span>
                      )}
                    </Button>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={isActiveRoute(item.path) ? "secondary" : "ghost"}
                          size="icon"
                          className="h-10 w-10"
                          onClick={() => handleNavigation(item)}
                        >
                          {item.icon}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        {item.title}
                      </TooltipContent>
                    </Tooltip>
                  )}
                  
                  {isOpen && item.items && expandedItems[item.title] && (
                    <div className="ml-6 mt-2 grid gap-1">
                      {item.items.map((subItem) => (
                        <Button
                          key={subItem.path}
                          variant={isActiveRoute(subItem.path) ? "secondary" : "ghost"}
                          className={cn("justify-start h-9", 
                            isActiveRoute(subItem.path) ? "font-medium" : "font-normal"
                          )}
                          onClick={() => navigate(subItem.path)}
                        >
                          <span className="ml-2">{subItem.title}</span>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </TooltipProvider>
        </nav>
      </ScrollArea>
    </aside>
  );
};

