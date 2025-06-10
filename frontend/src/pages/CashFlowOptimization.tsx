import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CashFlowRecommendations } from "components/CashFlowRecommendations";
import { toast } from "sonner";
import { useFirestore } from "utils/firestore";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { firebaseApp } from "app";
import { getFirestore } from "firebase/firestore";
import brain from "brain";
import { CashFlowOptimizationResponse } from "utils/cashFlowOptimization";

export default function CashFlowOptimization() {
  const [activeTab, setActiveTab] = useState("recommendations");
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [companies, setCompanies] = useState<Array<{ id: string; name: string; }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<CashFlowOptimizationResponse | null>(null);
  const db = getFirestore(firebaseApp);
  
  // Fetch companies for the dropdown
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const companiesCollection = collection(db, "companies");
        const q = query(companiesCollection, orderBy("name"));
        const querySnapshot = await getDocs(q);
        
        const companiesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
        }));
        
        setCompanies(companiesList);
        if (companiesList.length > 0 && !selectedCompany) {
          setSelectedCompany(companiesList[0].id);
        }
      } catch (error) {
        console.error("Error fetching companies:", error);
        toast.error("Failed to load companies");
      }
    };
    
    fetchCompanies();
  }, [db]);
  
  // Example data for demonstration purposes
  const generateExampleData = (companyId: string) => {
    // Current date for reference
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Generate dates relative to today
    const generateDate = (daysFromNow: number) => {
      const date = new Date();
      date.setDate(date.getDate() + daysFromNow);
      return date.toISOString().split('T')[0] + 'T00:00:00Z';
    };
    
    // Generate example receivables
    const receivables = [
      {
        customer_id: "c1",
        customer_name: "ABC Corporation",
        amount: 15000,
        due_date: generateDate(15),
        issue_date: generateDate(-15)
      },
      {
        customer_id: "c2",
        customer_name: "XYZ Industries",
        amount: 28000,
        due_date: generateDate(22),
        issue_date: generateDate(-8)
      },
      {
        customer_id: "c3",
        customer_name: "Global Services Ltd",
        amount: 42000,
        due_date: generateDate(30),
        issue_date: generateDate(-30)
      },
      {
        customer_id: "c4",
        customer_name: "Tech Solutions Inc",
        amount: 8500,
        due_date: generateDate(10),
        issue_date: generateDate(-20)
      },
      {
        customer_id: "c5",
        customer_name: "Eastern Supplies",
        amount: 12750,
        due_date: generateDate(25),
        issue_date: generateDate(-5)
      }
    ];
    
    // Generate example payables
    const payables = [
      {
        vendor_id: "v1",
        vendor_name: "Supplier Co",
        amount: 12500,
        due_date: generateDate(8),
        issue_date: generateDate(-22)
      },
      {
        vendor_id: "v2",
        vendor_name: "Manufacturing Partners",
        amount: 21000,
        due_date: generateDate(12),
        issue_date: generateDate(-18)
      },
      {
        vendor_id: "v3",
        vendor_name: "Office Supplies Inc",
        amount: 3500,
        due_date: generateDate(5),
        issue_date: generateDate(-25)
      },
      {
        vendor_id: "v4",
        vendor_name: "Logistics Services",
        amount: 9800,
        due_date: generateDate(15),
        issue_date: generateDate(-15)
      },
      {
        vendor_id: "v5",
        vendor_name: "Utility Provider",
        amount: 4200,
        due_date: generateDate(3),
        issue_date: generateDate(-27)
      },
      {
        vendor_id: "v6",
        vendor_name: "Software Solutions",
        amount: 6500,
        due_date: generateDate(6),
        issue_date: generateDate(-24)
      }
    ];
    
    return {
      company_id: companyId,
      receivables: receivables,
      payables: payables,
      cash_balance: 50000,
      min_cash_threshold: 25000,
      monthly_fixed_expenses: 35000,
    };
  };
  
  const fetchRecommendations = async () => {
    if (!selectedCompany) {
      toast.error("Please select a company");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real implementation, you would fetch real data from Firestore
      // For this demo, we're generating example data
      const data = generateExampleData(selectedCompany);
      
      // Call the cash flow optimization API
      const response = await brain.optimize_cash_flow(data);
      const recommendations = await response.json();
      
      setRecommendations(recommendations);
      toast.success("Recommendations generated successfully");
    } catch (error) {
      console.error("Error generating recommendations:", error);
      toast.error("Failed to generate recommendations");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCompanyChange = (value: string) => {
    setSelectedCompany(value);
    setRecommendations(null);
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Cash Flow Optimization</h1>
      </div>
      
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Controls</CardTitle>
              <CardDescription>Configure optimization settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-2">Company</label>
                <Select 
                  value={selectedCompany} 
                  onValueChange={handleCompanyChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                className="w-full" 
                onClick={fetchRecommendations}
                disabled={isLoading || !selectedCompany}
              >
                {isLoading ? "Generating..." : "Generate Recommendations"}
              </Button>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="mb-4">
                The Cash Flow Optimization engine analyzes your financial data to provide recommendations in three key areas:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <span className="font-medium">Payment Timing:</span> Optimal scheduling of payments and collections
                </li>
                <li>
                  <span className="font-medium">Working Capital:</span> Strategies to improve cash utilization
                </li>
                <li>
                  <span className="font-medium">Cash Shortfalls:</span> Early warnings for potential cash flow issues
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
        
        <div className="col-span-12 lg:col-span-9">
          {recommendations ? (
            <CashFlowRecommendations 
              data={recommendations} 
              onRefresh={fetchRecommendations} 
            />
          ) : (
            <Card className="w-full h-full flex justify-center items-center min-h-[400px]">
              <div className="text-center p-6">
                <h3 className="text-lg font-medium mb-2">No Recommendations Available</h3>
                <p className="text-muted-foreground mb-6">
                  Generate recommendations to see insights for improving your cash flow management.
                </p>
                <Button 
                  onClick={fetchRecommendations}
                  disabled={isLoading || !selectedCompany}
                >
                  {isLoading ? "Generating..." : "Generate Recommendations"}
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}