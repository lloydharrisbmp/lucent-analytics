import React from "react";
import { Button } from "@/components/ui/button";

export interface Props {
  title: string;
  description: string;
  ctaLabel: string;
  ctaAction: () => void;
  secondaryCtaLabel?: string;
  secondaryCtaAction?: () => void;
}

export const CTASection = ({
  title,
  description,
  ctaLabel,
  ctaAction,
  secondaryCtaLabel,
  secondaryCtaAction,
}: Props) => {
  return (
    <div className="py-16 md:py-20 w-full bg-card border-y">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
          {description}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={ctaAction}>
            {ctaLabel}
          </Button>
          {secondaryCtaLabel && secondaryCtaAction && (
            <Button size="lg" variant="outline" onClick={secondaryCtaAction}>
              {secondaryCtaLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
