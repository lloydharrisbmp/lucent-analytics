import React from "react";

export interface Props {
  className?: string;
}

export const Logo = ({ className = "" }: Props) => {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center mr-2">
        <span className="text-primary-foreground font-bold text-lg">B</span>
      </div>
      <span className="font-bold text-xl">BMP Spotlight Pro</span>
    </div>
  );
};
