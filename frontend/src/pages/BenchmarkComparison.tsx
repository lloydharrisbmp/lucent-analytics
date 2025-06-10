import React, { useState } from "react";
import { BenchmarkComparisonForm } from "components/BenchmarkComparisonForm";
import { BenchmarkDashboard } from "components/BenchmarkDashboard";
import { BenchmarkComparisonRequest, BenchmarkComparisonResponse } from "brain/data-contracts";
import brain from "brain";
import { toast } from "sonner";

const BenchmarkComparison = () => {
  const [loading, setLoading] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<BenchmarkComparisonResponse | null>(null);

  const handleCompare = async (request: BenchmarkComparisonRequest) => {
    setLoading(true);
    try {
      const response = await brain.compare_with_benchmarks(request);
      const data = await response.json();
      setComparisonResult(data);
    } catch (error) {
      console.error("Error comparing with benchmarks:", error);
      toast.error("Failed to compare with benchmarks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Benchmark Comparison</h1>
        <p className="text-muted-foreground">
          Compare your company's performance against industry benchmarks to identify strengths and opportunities.
        </p>
      </div>

      <div>
        <BenchmarkComparisonForm onCompare={handleCompare} loading={loading} />
      </div>

      {comparisonResult && (
        <div className="mt-8">
          <BenchmarkDashboard data={comparisonResult} />
        </div>
      )}
    </div>
  );
};

export default BenchmarkComparison;
