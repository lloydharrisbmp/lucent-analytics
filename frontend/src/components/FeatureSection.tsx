import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export interface Feature {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export interface Props {
  title: string;
  description: string;
  features: Feature[];
}

export const FeatureSection = ({ title, description, features }: Props) => {
  return (
    <div className="py-16 md:py-20 w-full">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          {description}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="h-full border border-border">
            <CardHeader>
              {feature.icon && <div className="mb-2">{feature.icon}</div>}
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
