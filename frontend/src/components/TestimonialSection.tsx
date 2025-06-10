import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
}

export interface Props {
  title: string;
  testimonials: Testimonial[];
}

export const TestimonialSection = ({ title, testimonials }: Props) => {
  return (
    <div className="py-16 md:py-20 w-full bg-muted/50">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <Card key={index} className="h-full border-none bg-card shadow-sm">
            <CardContent className="pt-6">
              <blockquote className="text-lg italic mb-6">
                "{testimonial.quote}"
              </blockquote>
              <div className="flex flex-col">
                <span className="font-semibold">{testimonial.author}</span>
                <span className="text-muted-foreground text-sm">
                  {testimonial.role}, {testimonial.company}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
