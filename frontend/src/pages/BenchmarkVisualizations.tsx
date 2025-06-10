import React from "react";
import { BenchmarkVisualDemo } from "components/BenchmarkVisualDemo";

const BenchmarkVisualizationsPage = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Benchmark Visualizations</h1>
        <p className="text-muted-foreground">
          Interactive visualization components for comparing company performance with industry benchmarks.
        </p>
      </div>

      <BenchmarkVisualDemo />
    </div>
  );
};

export default BenchmarkVisualizationsPage;
