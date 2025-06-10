import { useState, useEffect } from "react";
import { useUserGuardContext } from "app";
import { ComplianceDashboard } from "components/ComplianceDashboard";
import DashboardLayout from "components/DashboardLayout";

export default function TaxCompliance() {
  const { user } = useUserGuardContext();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <DashboardLayout>
      <ComplianceDashboard isLoading={isLoading} />
    </DashboardLayout>
  );
}
