import React from "react";
import { IndustryBenchmarks } from "components/IndustryBenchmarks";
import { BenchmarkAdmin } from "components/BenchmarkAdmin";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

const IndustryBenchmarksPage = () => {
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Industry Benchmarks</h1>
          <p className="text-muted-foreground">
            Compare your business performance with industry benchmarks from official Australian sources.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Switch 
            id="admin-mode" 
            checked={showAdmin}
            onCheckedChange={setShowAdmin}
          />
          <Label htmlFor="admin-mode">Admin Mode</Label>
        </div>
      </div>
      
      <Tabs defaultValue="view">
        <TabsList>
          <TabsTrigger value="view">View Benchmarks</TabsTrigger>
          {showAdmin && <TabsTrigger value="admin">Manage Benchmark Data</TabsTrigger>}
        </TabsList>
        <TabsContent value="view">
          <IndustryBenchmarks />
        </TabsContent>
        {showAdmin && (
          <TabsContent value="admin">
            <BenchmarkAdmin />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default IndustryBenchmarksPage;

