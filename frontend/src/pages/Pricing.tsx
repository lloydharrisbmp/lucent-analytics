import React, { useState, useEffect } from "react";
import DashboardLayout from "components/DashboardLayout";
import { SubscriptionCard, SubscriptionPlan } from "components/SubscriptionCard";
import { useCurrentUser } from "app";
import { useOrg } from "components/OrgProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { Info, AlertCircle } from "lucide-react";
import brain from "brain";

export default function Pricing() {
  const { user } = useCurrentUser();
  const { currentOrganization, isLoading: orgLoading, error } = useOrg();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [stripePublishableKey, setStripePublishableKey] = useState("");
  const [firebaseError, setFirebaseError] = useState<Error | null>(null);

  // Fetch subscription plans
  useEffect(() => {
    fetchSubscriptionPlans();
  }, []);

  // Fetch current subscription when organization changes
  useEffect(() => {
    if (currentOrganization) {
      fetchCurrentSubscription();
    } else {
      setCurrentSubscription(null);
    }
  }, [currentOrganization]);

  // Check for Firebase errors when they occur in the context
  useEffect(() => {
    if (error) {
      setFirebaseError(error);
    }
  }, [error]);

  const fetchSubscriptionPlans = async () => {
    setIsLoading(true);
    try {
      const response = await brain.get_subscription_plans();
      const data = await response.json();
      
      // Transform the response data to the format expected by SubscriptionCard
      const transformedPlans: SubscriptionPlan[] = data.plans.map((plan: any) => ({
        tier: plan.tier,
        name: plan.name,
        description: plan.description,
        price: plan.price,
        priceId: plan.price_id,
        features: plan.features,
        entityLimit: plan.entity_limit,
        isRecommended: plan.is_recommended
      }));
      
      setPlans(transformedPlans);
      setStripePublishableKey(data.publishable_key);
    } catch (error) {
      console.error("Failed to fetch subscription plans:", error);
      toast.error("Failed to load subscription plans");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurrentSubscription = async () => {
    if (!currentOrganization) return;
    
    try {
      const response = await brain.get_organization_subscription({ organization_id: currentOrganization.id });
      const subscription = await response.json();
      setCurrentSubscription(subscription);
    } catch (error) {
      console.error("Failed to fetch current subscription:", error);
      // Don't show error toast as this is a background operation
    }
  };

  const handleSelectPlan = async (priceId: string) => {
    if (!currentOrganization) {
      toast.error("Please select or create an organization first");
      return;
    }

    if (!user) {
      toast.error("Please sign in to subscribe");
      return;
    }

    setIsCheckoutLoading(true);
    try {
      const response = await brain.create_checkout_session({
        price_id: priceId,
        organization_id: currentOrganization.id
      });
      
      const result = await response.json();
      
      // Redirect to Stripe checkout or success page
      if (result.redirect_url) {
        window.location.href = result.redirect_url;
      }
    } catch (error) {
      console.error("Failed to create checkout session:", error);
      toast.error("Failed to start checkout process");
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!currentSubscription || !currentSubscription.customer_id) {
      toast.error("No active subscription found");
      return;
    }

    setIsCheckoutLoading(true);
    try {
      const response = await brain.create_portal_session({
        customer_id: currentSubscription.customer_id
      });
      
      const result = await response.json();
      
      // Redirect to Stripe customer portal
      if (result.redirect_url) {
        window.location.href = result.redirect_url;
      }
    } catch (error) {
      console.error("Failed to create portal session:", error);
      toast.error("Failed to open subscription management portal");
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const getSubscriptionStatusBadge = () => {
    if (!currentSubscription) return null;

    let status = currentSubscription.status;
    let color = "bg-gray-100 text-gray-800";
    
    switch (status) {
      case "active":
        color = "bg-green-100 text-green-800";
        break;
      case "past_due":
      case "unpaid":
        color = "bg-amber-100 text-amber-800";
        break;
      case "canceled":
        color = "bg-red-100 text-red-800";
        break;
      default:
        color = "bg-gray-100 text-gray-800";
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">Subscription Plans</h1>
            <p className="text-muted-foreground">
              Choose the right plan for your business needs
            </p>
          </div>
        </div>

        {firebaseError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Database Connection Error</AlertTitle>
            <AlertDescription>
              There was an error connecting to the database. Please try again later.
            </AlertDescription>
          </Alert>
        )}

        {currentSubscription && (
          <Card className="mb-8">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">Current Subscription</CardTitle>
                  <CardDescription>
                    {currentOrganization?.name || "Your organization"}
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end">
                  {getSubscriptionStatusBadge()}
                  {currentSubscription.cancel_at_period_end && (
                    <span className="text-xs text-muted-foreground mt-1">
                      Cancels at end of billing period
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">
                    {plans.find(p => p.tier === currentSubscription.tier)?.name || "Unknown Plan"}
                  </p>
                  {currentSubscription.current_period_end && (
                    <p className="text-sm text-muted-foreground">
                      {currentSubscription.status === "canceled" ? "Ended" : "Renews"} on{" "}
                      {new Date(currentSubscription.current_period_end * 1000).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {currentSubscription.status === "active" && (
                  <Button onClick={handleManageSubscription} disabled={isCheckoutLoading}>
                    Manage Subscription
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {!user && (
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertTitle>Sign in required</AlertTitle>
            <AlertDescription>
              Please sign in to subscribe to a plan.
            </AlertDescription>
          </Alert>
        )}

        {!currentOrganization && (
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertTitle>Organization required</AlertTitle>
            <AlertDescription>
              Please select or create an organization to subscribe to a plan.
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="h-[450px]">
                <CardHeader className="pb-8">
                  <div className="h-5 w-1/3 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 w-2/3 bg-muted rounded animate-pulse mt-2"></div>
                  <div className="mt-4 h-8 w-1/2 bg-muted rounded animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-4 w-2/3 bg-muted rounded animate-pulse"></div>
                    <div className="space-y-2">
                      {[...Array(5)].map((_, j) => (
                        <div key={j} className="flex items-center">
                          <div className="h-4 w-4 bg-muted rounded-full mr-2"></div>
                          <div className="h-4 flex-1 bg-muted rounded animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="h-10 w-full bg-muted rounded animate-pulse"></div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <SubscriptionCard
                key={plan.tier}
                plan={plan}
                currentPlan={currentSubscription?.tier}
                onSelectPlan={handleSelectPlan}
                isLoading={isCheckoutLoading}
              />
            ))}
          </div>
        )}

        <div className="mt-12 border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">How do the organization limits work?</h3>
              <p className="text-muted-foreground text-sm">
                Each subscription plan allows you to create and manage a specific number of 
                organizations. Organizations are separate entities with their own financial 
                data, reports, and team members.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Can I change my plan later?</h3>
              <p className="text-muted-foreground text-sm">
                Yes, you can upgrade or downgrade your subscription plan at any time. 
                When upgrading, you'll be charged the prorated amount for the remainder of your 
                billing cycle. When downgrading, the change will take effect at the end of your 
                current billing cycle.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">How does billing work?</h3>
              <p className="text-muted-foreground text-sm">
                Subscriptions are billed monthly or annually, depending on your preference. 
                You can cancel at any time, and your subscription will remain active until the 
                end of your current billing period.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Do you offer refunds?</h3>
              <p className="text-muted-foreground text-sm">
                We offer a 14-day money-back guarantee for all paid plans. If you're not 
                satisfied with your subscription, contact our support team within 14 days of 
                your purchase for a full refund.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
