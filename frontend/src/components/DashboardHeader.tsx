import React from "react";
import { User } from "firebase/auth";
import { ProfileButton } from "components/ProfileButton";
import { Button } from "@/components/ui/button";
import { useTheme } from "utils/use-theme";
import { Menu, X, Moon, Sun } from "lucide-react";
import { Logo } from "components/Logo";
import { OrganizationSelector } from "components/OrganizationSelector";

interface Props {
  user: User;
  toggleSidebar: () => void;
  sidebarOpen: boolean;
}

export const DashboardHeader = ({ user, toggleSidebar, sidebarOpen }: Props) => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="mr-2"
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="hidden md:block">
            <Logo className="text-lg" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <OrganizationSelector />
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>
          <ProfileButton user={user} />
        </div>
      </div>
    </header>
  );
};
