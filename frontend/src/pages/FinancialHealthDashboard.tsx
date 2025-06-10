import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Spinner } from "components/Spinner";
import { toast } from "sonner";
import brain from "brain";
import { CompanyData, FinancialMetric, ScoreResponse } from "types";
import HealthScoreDashboard from "components/HealthScoreDashboard";

// Sample companies for demonstration
const sampleCompanies = [
  { id: "company1", name: "Retail Giant Ltd", industry: "Retail Trade", size: "large" },
  { id: "company2", name: "ABC Construction", industry: "Construction", size: "medium" },
  { id: "company3", name: "Premier Services", industry: "Professional Services", size: "small" },
  { id: "company4", name: "Healthcare Plus", industry: "Healthcare", size: "medium" },
  { id: "company5", name: "Manufacturing Co", industry: "Manufacturing", size: "large" },
];

// Sample financial metrics data (in a real app, this would come from a database)
const getCompanyMetrics = (companyId: string): FinancialMetric[] => {
  const today = new Date();
  
  // Different metrics based on company ID to show variation
  if (companyId === "company1") {
    return [
      { name: "Gross Profit Margin", value: 35.2, date: today },
      { name: "Net Profit Margin", value: 12.8, date: today },
      { name: "Return on Assets (ROA)", value: 8.7, date: today },
      { name: "Current Ratio", value: 2.1, date: today },
      { name: "Quick Ratio", value: 1.5, date: today },
      { name: "Cash Ratio", value: 0.6, date: today },
      { name: "Debt-to-Equity Ratio", value: 0.8, date: today },
      { name: "Interest Coverage Ratio", value: 7.2, date: today },
      { name: "Inventory Turnover", value: 8.5, date: today },
      { name: "Accounts Receivable Turnover", value: 10.2, date: today },
    ];
  } else if (companyId === "company2") {
    return [
      { name: "Gross Profit Margin", value: 28.5, date: today },
      { name: "Net Profit Margin", value: 9.1, date: today },
      { name: "Return on Assets (ROA)", value: 7.2, date: today },
      { name: "Current Ratio", value: 1.8, date: today },
      { name: "Quick Ratio", value: 1.3, date: today },
      { name: "Cash Ratio", value: 0.5, date: today },
      { name: "Debt-to-Equity Ratio", value: 1.2, date: today },
      { name: "Interest Coverage Ratio", value: 5.5, date: today },
      { name: "Inventory Turnover", value: 4.8, date: today },
      { name: "Accounts Receivable Turnover", value: 7.9, date: today },
    ];
  } else {
    // Default metrics for other companies
    return [
      { name: "Gross Profit Margin", value: 30.0, date: today },
      { name: "Net Profit Margin", value: 10.0, date: today },
      { name: "Return on Assets (ROA)", value: 8.0, date: today },
      { name: "Current Ratio", value: 2.0, date: today },
      { name: "Quick Ratio", value: 1.4, date: today },
      { name: "Cash Ratio", value: 0.5, date: today },
      { name: "Debt-to-Equity Ratio", value: 1.0, date: today },
      { name: "Interest Coverage Ratio", value: 6.0, date: today },
      { name: "Inventory Turnover", value: 6.0, date: today },
      { name: "Accounts Receivable Turnover", value: 8.0, date: today },
    ];
  }
};

const FinancialHealthDashboard = () => {
  const navigate = useNavigate();
  const [selectedCompany, setSelectedCompany] = useState(sampleCompanies[0]);
  const [scoreData, setScoreData] = useState<ScoreResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedCompany) {
      calculateFinancialScore(selectedCompany.id);
    }
  }, [selectedCompany]);

  const calculateFinancialScore = async (companyId: string) => {
    try {
      setLoading(true);
      
      // Get metrics for the selected company
      const metrics = getCompanyMetrics(companyId);
      
      // Prepare request data
      const requestData: CompanyData = {
        company_id: companyId,
        industry: selectedCompany.industry,
        size: selectedCompany.size,
        metrics: metrics
      };
      
      // Call the API to calculate financial score
      const response = await brain.calculate_financial_score(requestData);
      const data = await response.json();
      setScoreData(data);
    } catch (error) {
      console.error("Error calculating financial score:", error);
      toast.error("Failed to calculate financial health score");
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyChange = (companyId: string) => {
    const company = sampleCompanies.find(c => c.id === companyId);
    if (company) {
      setSelectedCompany(company);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Financial Health Dashboard</h1>
          <p className="text-lg text-gray-600">
            Interactive visualization of your business financial health
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Select 
            value={selectedCompany.id}
            onValueChange={handleCompanyChange}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select company" />
            </SelectTrigger>
            <SelectContent>
              {sampleCompanies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={() => navigate('/financial-health-assessment')}
            variant="outline"
          >
            View Detailed Assessment
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="w-full flex justify-center items-center py-20">
          <Spinner size="lg" />
          <span className="ml-2">Loading financial health dashboard...</span>
        </div>
      ) : scoreData ? (
        <HealthScoreDashboard
          scoreData={scoreData}
          companyName={selectedCompany.name}
          companyId={selectedCompany.id}
          industry={selectedCompany.industry}
          size={selectedCompany.size}
        />
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <p>No financial health data available. Please select a company to analyze.</p>
        </div>
      )}
    </div>
  );
};

export default FinancialHealthDashboard;