import { Check, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Feature {
  name: string;
  available: boolean;
  tooltip?: string;
}

export interface SubscriptionPlan {
  tier: string;
  name: string;
  description: string;
  price: number;
  priceId: string;
  features: string[];
  entityLimit: number;
  isRecommended: boolean;
}

interface SubscriptionCardProps {
  plan: SubscriptionPlan;
  currentPlan?: string;
  onSelectPlan: (priceId: string) => void;
  isLoading?: boolean;
}

export function SubscriptionCard({
  plan,
  currentPlan,
  onSelectPlan,
  isLoading = false,
}: SubscriptionCardProps) {
  const isCurrentPlan = currentPlan === plan.tier;

  return (
    <Card className={`flex flex-col h-full ${plan.isRecommended ? 'border-primary shadow-md' : ''}`}>
      <CardHeader className="pb-8">
        {plan.isRecommended && (
          <Badge className="mb-2 w-fit self-start" variant="default">
            Recommended
          </Badge>
        )}
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <CardDescription className="min-h-[40px]">{plan.description}</CardDescription>
        <div className="mt-4">
          <span className="text-3xl font-bold">
            ${plan.price === 0 ? "0" : plan.price.toFixed(2)}
          </span>
          {plan.price > 0 && <span className="text-muted-foreground ml-1">/month</span>}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-4">
          <div className="font-medium text-sm text-muted-foreground">
            What's included:
          </div>
          <ul className="space-y-2.5">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <Check className="h-4 w-4 text-primary mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
            <li className="flex items-start">
              <Check className="h-4 w-4 text-primary mt-0.5 mr-2 flex-shrink-0" />
              <span className="text-sm flex items-center">
                {plan.entityLimit === 0 ? "Unlimited organizations" : `Up to ${plan.entityLimit} organization${plan.entityLimit > 1 ? 's' : ''}`}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground ml-1" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-[200px] text-xs">
                        {plan.entityLimit === 0 
                          ? "Create and manage an unlimited number of organizations" 
                          : `Create and manage up to ${plan.entityLimit} distinct organization${plan.entityLimit > 1 ? 's' : ''}`}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </span>
            </li>
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          variant={isCurrentPlan ? "outline" : plan.isRecommended ? "default" : "outline"}
          disabled={isCurrentPlan || isLoading}
          onClick={() => onSelectPlan(plan.priceId)}
        >
          {isLoading ? "Loading..." : isCurrentPlan ? "Current Plan" : "Subscribe"}
        </Button>
      </CardFooter>
    </Card>
  );
}
