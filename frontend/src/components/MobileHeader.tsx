import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChartBig, LineChart, DollarSign, Users, Settings, Menu } from "lucide-react";

const MobileHeader = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  
  const navItems = [
    { icon: <BarChartBig size={20} />, label: 'Dashboard', path: '/' },
    { icon: <LineChart size={20} />, label: 'Cash Flow', path: '/cash-flow-dashboard' },
    { icon: <DollarSign size={20} />, label: 'Financials', path: '/financials' },
    { icon: <Users size={20} />, label: 'Clients', path: '/clients' },
    { icon: <Settings size={20} />, label: 'Settings', path: '/settings' },
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

export default MobileHeader;