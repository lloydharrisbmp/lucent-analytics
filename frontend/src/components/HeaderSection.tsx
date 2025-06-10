import React from "react";
import { Button } from "@/components/ui/button";

export interface NavItem {
  label: string;
  href: string;
}

export interface Props {
  logo?: React.ReactNode;
  navItems: NavItem[];
  ctaLabel: string;
  ctaAction: () => void;
}

export const HeaderSection = ({ logo, navItems, ctaLabel, ctaAction }: Props) => {
  return (
    <header className="w-full border-b border-border sticky top-0 bg-background/95 backdrop-blur z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            {logo && <div className="mr-8">{logo}</div>}
            <nav className="hidden md:flex space-x-8">
              {navItems.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="text-foreground/80 hover:text-foreground transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={ctaAction}>{ctaLabel}</Button>
          </div>
        </div>
      </div>
    </header>
  );
};
