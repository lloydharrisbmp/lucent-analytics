import React from "react";
import { Button } from "@/components/ui/button";

export interface Props {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaAction: () => void;
}

export const HeroSection = ({
  title,
  subtitle,
  ctaLabel,
  ctaAction,
}: Props) => {
  return (
    <div className="py-16 md:py-24 flex flex-col items-center text-center">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 max-w-4xl">
        {title}
      </h1>
      <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl">
        {subtitle}
      </p>
      <Button size="lg" onClick={ctaAction}>
        {ctaLabel}
      </Button>
    </div>
  );
};
