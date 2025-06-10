import React from "react";
import { GrantsExplorer } from "components/GrantsExplorer";
import { GrantMatcher } from "components/GrantMatcher";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GrantApplicationTracker } from "components/GrantApplicationTracker";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";

export default function GovernmentGrants() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Australian Government Grants & Incentives</h1>
      <p className="text-gray-600 mb-8">
        Explore available federal, state, and local government grants and incentives for Australian businesses. 
        Use the filters to find programs that match your business type, location, and funding needs.
      </p>

      <div className="flex justify-end mb-4">
        <Button variant="outline" asChild>
          <Link to="/grant-roi-analysis">
            <Calculator className="h-4 w-4 mr-2" />
            ROI Analysis & Strategy
          </Link>
        </Button>
      </div>
      
      <Tabs defaultValue="explore" className="">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="explore">Explore Grants</TabsTrigger>
          <TabsTrigger value="match">Find Matching Grants</TabsTrigger>
          <TabsTrigger value="applications">Application Tracker</TabsTrigger>
        </TabsList>
        
        <TabsContent value="explore">
          <GrantsExplorer />
        </TabsContent>
        
        <TabsContent value="match">
          <GrantMatcher />
        </TabsContent>
        
        <TabsContent value="applications">
          <GrantApplicationTracker />
        </TabsContent>
      </Tabs>
    </div>
  );
}
