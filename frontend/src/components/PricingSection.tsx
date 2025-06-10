import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Check } from "lucide-react";

export interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: string[];
  ctaLabel: string;
  popular?: boolean;
}

export interface Props {
  title: string;
  description: string;
  tiers: PricingTier[];
}

export const PricingSection = ({ title, description, tiers }: Props) => {
  return (
    <div className="py-16 md:py-20 w-full">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          {description}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {tiers.map((tier, index) => (
          <Card 
            key={index} 
            className={`flex flex-col h-full ${tier.popular ? 'border-primary shadow-lg relative' : 'border-border'}`}
          >
            {tier.popular && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-sm font-medium py-1 px-3 rounded-full">
                Most Popular
              </div>
            )}
            <CardHeader>
              <CardTitle>{tier.name}</CardTitle>
              <div className="mt-4 mb-2">
                <span className="text-3xl font-bold">{tier.price}</span>
                {tier.price !== 'Custom' && <span className="text-muted-foreground">/month</span>}
              </div>
              <CardDescription>{tier.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-3">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="h-4 w-4 text-primary mt-1 mr-2" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className={`w-full ${tier.popular ? '' : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'}`}
                variant={tier.popular ? 'default' : 'outline'}
              >
                {tier.ctaLabel}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};
