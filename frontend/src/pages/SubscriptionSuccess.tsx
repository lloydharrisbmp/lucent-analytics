import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function SubscriptionSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(5);
  
  // Get session_id from URL query parameter
  const params = new URLSearchParams(location.search);
  const sessionId = params.get("session_id");
  
  // Countdown timer to redirect after 5 seconds
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      navigate("/dashboard");
    }
  }, [countdown, navigate]);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-green-100 mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Subscription Successful</CardTitle>
            <CardDescription>
              Thank you for subscribing to Lucent Analytics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Your subscription has been activated. You now have access to all the features and benefits of your chosen plan.
            </p>
            
            {sessionId && (
              <p className="text-xs text-muted-foreground">
                Transaction ID: {sessionId}
              </p>
            )}
            
            <div className="space-y-2">
              <p className="text-sm">
                Redirecting to dashboard in {countdown} seconds...
              </p>
              <Button onClick={() => navigate("/dashboard")} className="w-full">
                Go to Dashboard Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
