import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";

const FinancialRecommendationsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="container mx-auto py-8 print:py-2">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center mb-6 print:hidden">
        <div>
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-2" 
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold">Financial Recommendations</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Manage and track all your financial improvement actions
          </p>
        </div>
      </div>

      {/* Navigation */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
        <TabsList className="grid w-full md:w-auto grid-cols-3 md:inline-flex">
          <TabsTrigger value="all" className="text-sm">All Recommendations</TabsTrigger>
          <TabsTrigger value="implementation" className="text-sm">Implementation Tracker</TabsTrigger>
          <TabsTrigger value="impact" className="text-sm">Impact Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>All Recommendations</CardTitle>
              <CardDescription>
                View and access all available financial recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate("/financial-recommendations")}
                className="mb-4"
              >
                View Detailed Recommendations
              </Button>
              
              <Separator className="my-4" />
              
              <p>Access the detailed financial recommendations page to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>View all recommendations organized by category</li>
                <li>Filter recommendations by priority, difficulty, and timeframe</li>
                <li>See detailed impact analysis for each recommendation</li>
                <li>Generate recommendation reports for specific business areas</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="implementation">
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Implementation Tracker</CardTitle>
              <CardDescription>
                Track the status of your financial improvement actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate("/financial-recommendations?tab=implementation")}
                className="mb-4"
              >
                Go to Implementation Tracker
              </Button>
              
              <Separator className="my-4" />
              
              <p>Use the implementation tracker to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Mark recommendations as not started, in progress, or completed</li>
                <li>Track overall implementation progress</li>
                <li>Record actual impact of implemented changes</li>
                <li>Add notes and documentation for each action</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="impact">
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Impact Analysis</CardTitle>
              <CardDescription>
                Measure the actual impact of your implemented recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate("/financial-recommendations?tab=impact")}
                className="mb-4"
              >
                View Impact Analysis
              </Button>
              
              <Separator className="my-4" />
              
              <p>The impact analysis dashboard allows you to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Compare estimated vs. actual impact of recommendations</li>
                <li>View progress on overall financial health score</li>
                <li>Identify the most impactful recommendations</li>
                <li>Generate impact reports for stakeholders</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialRecommendationsPage;