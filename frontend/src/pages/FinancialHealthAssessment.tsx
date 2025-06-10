          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            {hasValidScoreData ? (
              <div>
                {/* If no recommendations have been generated yet, show a prompt */}
                {!recommendations && !loadingRecommendations && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Action Recommendations</CardTitle>
                      <CardDescription>
                        Generate personalized recommendations to improve your financial health score.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="py-6 text-center">
                      <p className="mb-4">Get tailored recommendations based on your financial health assessment.</p>
                      <Button onClick={() => handleGetRecommendations()} className="mb-2 mr-2">
                        Get Overall Recommendations
                      </Button>
                      
                      {selectedCategory && (
                        <Button 
                          onClick={() => handleGetRecommendations(selectedCategory)} 
                          variant="outline"
                        >
                          Focus on {selectedCategory}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
                
                {/* Recommendation Results */}
                <RecommendationEngine
                  recommendations={recommendations}
                  loading={loadingRecommendations}
                  error={recommendationError}
                  onRegenerateRecommendations={() => handleGetRecommendations(selectedCategory)}
                  focusCategory={selectedCategory}
                />
              </div>
            ) : (
              <Card>
                <CardContent className="py-10 text-center">
                  <p>Please calculate your financial health score first to get recommendations.</p>
                </CardContent>
              </Card>
            )}
            
            {recommendations && (
              <div className="mt-4 text-right">
                <Button 
                  variant="outline"
                  asChild
                >
                  <Link to={`/financial-recommendations?companyId=${selectedCompany.id}${selectedCategory ? `&category=${selectedCategory}` : ''}`}>
                    View Comprehensive Action Plan
                  </Link>
                </Button>
              </div>
            )}
          </TabsContent>
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "components/Spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import brain from "brain";
import { toast } from "sonner";
import FinancialHealthScoreCard from "components/FinancialHealthScoreCard";
import CategoryScoreDetail from "components/CategoryScoreDetail";
import PerformanceComparison from "components/PerformanceComparison";
import ScoreTrendAnalysis from "components/ScoreTrendAnalysis";
import RecommendationEngine from "components/RecommendationEngine";
import { ScoreResponse, CompanyData, FinancialMetric, RecommendationResponse } from "types";

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

const FinancialHealthAssessment = () => {
  const navigate = useNavigate();
  const [selectedCompany, setSelectedCompany] = useState(sampleCompanies[0]);
  const [scoreData, setScoreData] = useState<ScoreResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);

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

      // If no category is selected yet, select the first one
      if (!selectedCategory && data?.overall_score?.category_scores) {
        setSelectedCategory(Object.keys(data.overall_score.category_scores)[0]);
      }
      
      // Clear any existing recommendations when company changes
      setRecommendations(null);
    } catch (error) {
      console.error("Error calculating financial score:", error);
      toast.error("Failed to calculate financial health score");
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = async (focusCategory?: string | null) => {
    if (!scoreData) {
      toast.error("Please calculate the financial score first");
      return;
    }

    try {
      setLoadingRecommendations(true);
      setRecommendationError(null);
      
      // Prepare request data
      const requestData = {
        company_id: selectedCompany.id,
        financial_score_data: scoreData,
        max_recommendations: 10,
        focus_categories: focusCategory ? [focusCategory] : undefined
      };
      
      // Call recommendation engine API
      const response = await brain.generate_recommendations(requestData);
      const data = await response.json();
      
      setRecommendations(data);
      if (focusCategory) {
        setActiveTab("recommendations");
      }
    } catch (error) {
      console.error("Error generating recommendations:", error);
      setRecommendationError("Failed to generate recommendations. Please try again.");
      toast.error("Failed to generate recommendations");
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleCompanyChange = (companyId: string) => {
    const company = sampleCompanies.find(c => c.id === companyId);
    if (company) {
      setSelectedCompany(company);
    }
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setActiveTab("categories");
  };
  
  const handleGetRecommendations = (category: string | null = null) => {
    generateRecommendations(category);
  };

  // Check if we have score data and it's valid
  const hasValidScoreData = scoreData && 
    scoreData.overall_score && 
    scoreData.overall_score.category_scores && 
    Object.keys(scoreData.overall_score.category_scores).length > 0;

  return (

    <div className="container mx-auto py-8">
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Financial Health Assessment</h1>
          <p className="text-lg text-gray-600">
            Comprehensive analysis of your business financial health
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
            onClick={() => navigate('/financial-health-indicators')}
            variant="outline"
          >
            View Industry Benchmarks
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="w-full flex justify-center items-center py-20">
          <Spinner size="lg" />
          <span className="ml-2">Calculating financial health score...</span>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="comparisons">Industry Comparison</TabsTrigger>
            <TabsTrigger value="trends">Trends & Forecasting</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {hasValidScoreData ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Score Overview Card */}
                <div className="md:col-span-1">
                  <FinancialHealthScoreCard 
                    scoreData={scoreData} 
                    companyName={selectedCompany.name}
                    onCategorySelect={handleCategorySelect}
                  />
                </div>

                {/* Key Insights Card */}
                <div className="md:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Key Insights</CardTitle>
                      <CardDescription>
                        Analysis of your financial health performance
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Top strengths and weaknesses */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Top Strengths</h3>
                          <ul className="space-y-2">
                            {Object.entries(scoreData.overall_score.category_scores)
                              .sort((a, b) => b[1].score - a[1].score)
                              .slice(0, 2)
                              .map(([category, data]) => (
                                <li key={category} className="flex items-center">
                                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                                  <span className="font-medium">{category}:</span>
                                  <span className="ml-1">{data.score.toFixed(1)}</span>
                                </li>
                              ))}
                          </ul>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Areas for Improvement</h3>
                          <ul className="space-y-2">
                            {Object.entries(scoreData.overall_score.category_scores)
                              .sort((a, b) => a[1].score - b[1].score)
                              .slice(0, 2)
                              .map(([category, data]) => (
                                <li key={category} className="flex items-center">
                                  <div className="w-2 h-2 rounded-full bg-amber-500 mr-2"></div>
                                  <span className="font-medium">{category}:</span>
                                  <span className="ml-1">{data.score.toFixed(1)}</span>
                                </li>
                              ))}
                          </ul>
                        </div>
                      </div>

                      <Separator />

                      {/* Industry Position */}
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Industry Position</h3>
                        <p className="mb-2">Your business ranks in the <strong>{scoreData.industry_percentile.toFixed(0)}th percentile</strong> among similar {selectedCompany.industry} businesses.</p>
                        
                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>0%</span>
                            <span>50%</span>
                            <span>100%</span>
                          </div>
                          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-600 rounded-full" 
                              style={{ width: `${scoreData.industry_percentile}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs mt-1 text-gray-500">
                            <span>Below Average</span>
                            <span>Average</span>
                            <span>Above Average</span>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Key Recommendations */}
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Key Recommendations</h3>
                        <Alert>
                          <AlertTitle>Primary Focus Area: {Object.entries(scoreData.overall_score.category_scores)
                            .sort((a, b) => a[1].score - b[1].score)[0][0]}</AlertTitle>
                          <AlertDescription>
                            {Object.entries(scoreData.overall_score.category_scores)
                              .sort((a, b) => a[1].score - b[1].score)[0][1].suggestions[0]}
                          </AlertDescription>
                        </Alert>
                        <div className="mt-4">
                          <Button 
                            onClick={() => handleGetRecommendations(Object.entries(scoreData.overall_score.category_scores)
                              .sort((a, b) => a[1].score - b[1].score)[0][0])}
                          >
                            Get Recommendations
                          </Button>
                          <Button 
                            variant="outline"
                            className="ml-2"
                            onClick={() => navigate(`/financial-recommendations?companyId=${selectedCompany.id}&category=${Object.entries(scoreData.overall_score.category_scores)
                              .sort((a, b) => a[1].score - b[1].score)[0][0]}`)}
                          >
                            View Detailed Action Plan
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="py-10 text-center">
                  <p>No financial health data available. Please select a company to analyze.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            {hasValidScoreData ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Category Selector */}
                <div className="md:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle>Financial Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(scoreData.overall_score.category_scores).map(([category, data]) => (
                          <div 
                            key={category}
                            className={`p-3 rounded-lg cursor-pointer hover:bg-gray-100 ${selectedCategory === category ? 'bg-gray-100 border border-gray-300' : ''}`}
                            onClick={() => setSelectedCategory(category)}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{category}</span>
                              <span className="font-bold">{data.score.toFixed(1)}</span>
                            </div>
                            <Progress value={data.score} className="h-2 mt-1" />
                            <div className="flex justify-end mt-1">
                              <button 
                                className="text-xs text-blue-600 hover:underline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleGetRecommendations(category);
                                }}
                              >
                                Get recommendations
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Category Detail */}
                <div className="md:col-span-3">
                  {selectedCategory && (
                    <CategoryScoreDetail 
                      category={selectedCategory}
                      categoryData={scoreData.overall_score.category_scores[selectedCategory]}
                      metrics={getCompanyMetrics(selectedCompany.id)}
                      industry={selectedCompany.industry}
                    />
                  )}
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="py-10 text-center">
                  <p>No category data available. Please select a company to analyze.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Industry Comparison Tab */}
          <TabsContent value="comparisons" className="space-y-6">
            {hasValidScoreData ? (
              <PerformanceComparison 
                companyId={selectedCompany.id}
                companyName={selectedCompany.name}
                industry={selectedCompany.industry}
                size={selectedCompany.size}
                scoreData={scoreData}
              />
            ) : (
              <Card>
                <CardContent className="py-10 text-center">
                  <p>No comparison data available. Please select a company to analyze.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            {hasValidScoreData ? (
              <ScoreTrendAnalysis 
                companyId={selectedCompany.id}
                companyName={selectedCompany.name}
              />
            ) : (
              <Card>
                <CardContent className="py-10 text-center">
                  <p>No trend data available. Please select a company to analyze.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default FinancialHealthAssessment;