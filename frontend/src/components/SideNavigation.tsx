import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BarChartBig, LineChart, DollarSign, Users, Settings, FileBarChart2 } from "lucide-react";

const SideNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const navItems = [
    { icon: <BarChartBig size={20} />, label: 'Dashboard', path: '/' },
    { icon: <LineChart size={20} />, label: 'Cash Flow', path: '/cash-flow-dashboard' },
    { icon: <FileBarChart2 size={20} />, label: 'Cash Flow Report', path: '/CashFlowReport' },
    { icon: <DollarSign size={20} />, label: 'Financials', path: '/financials' },
    { icon: <Users size={20} />, label: 'Clients', path: '/clients' },
    { icon: <Settings size={20} />, label: 'Settings', path: '/settings' },
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

export default SideNavigation;