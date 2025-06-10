import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import RecommendationTracker from "components/RecommendationTracker";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Spinner } from "components/Spinner";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Download, Printer, Filter, ArrowUpDown, CheckCircle, Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import brain from "brain";
import { toast } from "sonner";
import { RecommendationResponse, ScoreResponse, RecommendedAction } from "types";

const sampleCompanies = [
  { id: "company1", name: "Retail Giant Ltd", industry: "Retail Trade", size: "large" },
  { id: "company2", name: "ABC Construction", industry: "Construction", size: "medium" },
  { id: "company3", name: "Premier Services", industry: "Professional Services", size: "small" },
  { id: "company4", name: "Healthcare Plus", industry: "Healthcare", size: "medium" },
  { id: "company5", name: "Manufacturing Co", industry: "Manufacturing", size: "large" },
];

export default function FinancialRecommendations() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const companyId = searchParams.get("companyId") || "company1";
  const category = searchParams.get("category");
  const tabParam = searchParams.get("tab");
  
  const [loading, setLoading] = useState(true);
  const [scoreData, setScoreData] = useState<ScoreResponse | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [sortField, setSortField] = useState<string>("priority");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filterDifficulty, setFilterDifficulty] = useState<string | null>(null);
  const [filterTimeframe, setFilterTimeframe] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(category || null);
  const [expandedImpacts, setExpandedImpacts] = useState<string[]>([]);
  
  // Add implementation status tracking
  const [implementationStatus, setImplementationStatus] = useState<Record<string, any>>({});
  
  // Add tabs for different views
  const [activeTab, setActiveTab] = useState(tabParam || "recommendations");
  

  useEffect(() => {
    const company = sampleCompanies.find(c => c.id === companyId);
    if (company) {
      setSelectedCompany(company);
      loadFinancialScore(company.id);
    }
  }, [companyId]);

  useEffect(() => {
    // Check if we should display a specific tab based on URL params
    const tab = searchParams.get("tab");
    if (tab && ["recommendations", "implementation", "impact"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const loadFinancialScore = async (companyId: string) => {
    try {
      setLoading(true);
      // Use sample financial score data for now
      const response = await brain.calculate_financial_score({
        company_id: companyId,
        industry: selectedCompany?.industry || "Retail Trade",
        size: selectedCompany?.size || "medium",
        metrics: []
      });
      const data = await response.json();
      setScoreData(data);
      generateRecommendations(companyId, data, filterCategory);
    } catch (error) {
      console.error("Error loading financial score:", error);
      toast.error("Failed to load financial health score");
      setLoading(false);
    }
  };

  const generateRecommendations = async (companyId: string, scoreData: ScoreResponse, focusCategory: string | null = null) => {
    try {
      // Prepare request data
      const requestData = {
        company_id: companyId,
        financial_score_data: scoreData,
        max_recommendations: 20,
        focus_categories: focusCategory ? [focusCategory] : undefined
      };
      
      // Call recommendation engine API
      const response = await brain.generate_recommendations(requestData);
      const data = await response.json();
      
      setRecommendations(data);
    } catch (error) {
      console.error("Error generating recommendations:", error);
      toast.error("Failed to generate recommendations");
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyChange = (companyId: string) => {
    navigate(`/financial-recommendations?companyId=${companyId}${filterCategory ? `&category=${filterCategory}` : ''}`);
  };

  const toggleImpactExpansion = (actionTitle: string) => {
    if (expandedImpacts.includes(actionTitle)) {
      setExpandedImpacts(expandedImpacts.filter(title => title !== actionTitle));
    } else {
      setExpandedImpacts([...expandedImpacts, actionTitle]);
    }
  };

  const handleCategoryFilter = (category: string | null) => {
    setFilterCategory(category);
    if (category) {
      navigate(`/financial-recommendations?companyId=${companyId}&category=${category}`);
    } else {
      navigate(`/financial-recommendations?companyId=${companyId}`);
    }
    if (scoreData) {
      generateRecommendations(companyId, scoreData, category);
    }
  };

  const handleSortChange = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };
  
  const handleStatusChange = (actionId: string, status: string) => {
    setImplementationStatus(prev => {
      const now = new Date().toISOString();
      const currentStatus = prev[actionId] || { status: "not_started" };
      
      const updatedStatus = {
        ...currentStatus,
        actionId,
        status,
        ...(status === "in_progress" && !currentStatus.startDate && { startDate: now }),
        ...(status === "completed" && !currentStatus.completionDate && { completionDate: now }),
        ...(status === "completed" && !currentStatus.impactAssessment && { 
          impactAssessment: { actualImpact: 0, notes: "" }
        }),
      };
      
      return { ...prev, [actionId]: updatedStatus };
    });
  };
  
  const handleImpactAssessmentChange = (actionId: string, actualImpact: number, notes: string) => {
    setImplementationStatus(prev => {
      const currentStatus = prev[actionId] || { status: "completed" };
      
      return {
        ...prev,
        [actionId]: {
          ...currentStatus,
          impactAssessment: { actualImpact, notes }
        }
      };
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    toast.info("Downloading PDF report...");
    // In a real implementation, this would generate and download a PDF
    setTimeout(() => {
      toast.success("PDF report downloaded successfully");
    }, 1500);
  };

  const getPriorityLabel = (priority: number): { label: string; color: string } => {
    switch (priority) {
      case 1:
        return { label: "Critical", color: "bg-red-500 text-white" };
      case 2:
        return { label: "High", color: "bg-orange-500 text-white" };
      case 3:
        return { label: "Medium", color: "bg-yellow-500 text-white" };
      case 4:
        return { label: "Low", color: "bg-blue-500 text-white" };
      case 5:
        return { label: "Optional", color: "bg-gray-500 text-white" };
      default:
        return { label: "Unknown", color: "bg-gray-500 text-white" };
    }
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTimeframeColor = (timeframe: string): string => {
    switch (timeframe.toLowerCase()) {
      case "short-term":
        return "bg-green-100 text-green-800";
      case "medium-term":
        return "bg-blue-100 text-blue-800";
      case "long-term":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case "Profitability":
        return "bg-emerald-100 text-emerald-800";
      case "Liquidity":
        return "bg-blue-100 text-blue-800";
      case "Leverage":
        return "bg-indigo-100 text-indigo-800";
      case "Efficiency":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filter recommendations based on selected filters
  const getFilteredRecommendations = (): RecommendedAction[] => {
    if (!recommendations) return [];

    let filtered = [...recommendations.recommendations];

    // Apply difficulty filter
    if (filterDifficulty) {
      filtered = filtered.filter(item => item.difficulty.toLowerCase() === filterDifficulty.toLowerCase());
    }

    // Apply timeframe filter
    if (filterTimeframe) {
      filtered = filtered.filter(item => item.timeframe.toLowerCase() === filterTimeframe.toLowerCase());
    }

    // Apply category filter - already handled by API call

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case "priority":
          comparison = a.priority - b.priority;
          break;
        case "difficulty":
          comparison = a.difficulty.localeCompare(b.difficulty);
          break;
        case "timeframe":
          comparison = a.timeframe.localeCompare(b.timeframe);
          break;
        case "impact":
          comparison = b.estimated_overall_score_increase - a.estimated_overall_score_increase;
          break;
        default:
          comparison = a.priority - b.priority;
      }
      
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  };

  const filteredRecommendations = getFilteredRecommendations();

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="w-full flex justify-center items-center py-20">
          <Spinner size="lg" />
          <span className="ml-2">Loading recommendations...</span>
        </div>
      </div>
    );
  }

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
              onClick={() => navigate("/financial-health-assessment")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold">Financial Improvement Recommendations</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Actionable strategies to enhance your business financial health
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Select 
            value={companyId}
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
          
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleDownloadPDF}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={(value) => {
        setActiveTab(value);
        navigate(`/financial-recommendations?companyId=${companyId}${filterCategory ? `&category=${filterCategory}` : ''}&tab=${value}`);
      }} className="w-full mb-6 print:hidden">
        <TabsList>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="implementation">Implementation Tracking</TabsTrigger>
          <TabsTrigger value="impact">Impact Analysis</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Dashboard Summary - Only visible on larger screens and in print */}
      {scoreData && activeTab === "recommendations" && (
        <div className="hidden md:block mb-8 print:block">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-2xl flex justify-between">
                <span>Financial Health Overview</span>
                <span className="text-primary">{scoreData.overall_score.score.toFixed(1)}/100</span>
              </CardTitle>
              <CardDescription>
                {selectedCompany?.name} | {selectedCompany?.industry}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {Object.entries(scoreData.overall_score.category_scores).map(([category, data]) => (
                  <Card key={category} className="bg-gray-50 border-0">
                    <CardHeader className="pb-2 pt-4">
                      <CardTitle className="text-base font-medium">{category}</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4 pt-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-2xl font-semibold">{data.score.toFixed(1)}</span>
                        <Badge 
                          className={data.score >= 70 ? "bg-green-100 text-green-800" : 
                                  data.score >= 50 ? "bg-yellow-100 text-yellow-800" : 
                                  "bg-red-100 text-red-800"}
                        >
                          {data.score >= 70 ? "Good" : data.score >= 50 ? "Fair" : "Needs Work"}
                        </Badge>
                      </div>
                      <Progress value={data.score} className="h-2" />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-2 w-full text-xs" 
                        onClick={() => handleCategoryFilter(category === filterCategory ? null : category)}
                      >
                        {category === filterCategory ? "Show All Categories" : `Focus on ${category}`}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters - Only show in recommendations tab */}
      {activeTab === "recommendations" && (
        <div className="mb-6 flex flex-col md:flex-row gap-4 print:hidden">
        <Card className="w-full md:w-auto">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Filter & Sort</CardTitle>
          </CardHeader>
          <CardContent className="grid md:flex gap-4">
            <div>
              <p className="text-sm font-medium mb-2">Difficulty</p>
              <Select 
                value={filterDifficulty || ""}
                onValueChange={(value) => setFilterDifficulty(value || null)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Any difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any difficulty</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Timeframe</p>
              <Select 
                value={filterTimeframe || ""}
                onValueChange={(value) => setFilterTimeframe(value || null)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Any timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any timeframe</SelectItem>
                  <SelectItem value="short-term">Short-term</SelectItem>
                  <SelectItem value="medium-term">Medium-term</SelectItem>
                  <SelectItem value="long-term">Long-term</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Category</p>
              <Select 
                value={filterCategory || ""}
                onValueChange={(value) => handleCategoryFilter(value || null)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All categories</SelectItem>
                  {scoreData && Object.keys(scoreData.overall_score.category_scores).map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Sort By</p>
              <div className="flex items-center space-x-2">
                <Select 
                  value={sortField}
                  onValueChange={handleSortChange}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="difficulty">Difficulty</SelectItem>
                    <SelectItem value="timeframe">Timeframe</SelectItem>
                    <SelectItem value="impact">Impact</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                >
                  <ArrowUpDown className={`h-4 w-4 ${sortOrder === "desc" ? "rotate-180" : ""}`} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {recommendations && (
          <Card className="w-full md:w-auto md:flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Recommendation Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <div>
                  <p className="text-sm font-medium mb-1">Total Actions</p>
                  <p className="text-3xl font-semibold">{filteredRecommendations.length}</p>
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">Potential Score Improvement</p>
                  <p className="text-3xl font-semibold text-emerald-600">+{recommendations.estimated_total_score_increase.toFixed(1)}</p>
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">Critical Actions</p>
                  <p className="text-3xl font-semibold text-red-600">{filteredRecommendations.filter(r => r.priority <= 2).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      )}

      {/* Recommendation List - Only show in recommendations tab */}
      {activeTab === "recommendations" && recommendations ? (
        <div className="space-y-6">
          {filteredRecommendations.length > 0 ? (
            <Accordion type="multiple" className="w-full space-y-4">
              {filteredRecommendations.map((action, index) => {
                const priorityInfo = getPriorityLabel(action.priority);
                return (
                  <AccordionItem 
                    key={`${action.title}-${index}`} 
                    value={`${action.title}-${index}`}
                    className={`border rounded-lg overflow-hidden ${action.priority <= 2 ? "border-red-200 bg-red-50" : ""}`}
                  >
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                      <div className="flex flex-col sm:flex-row sm:items-center w-full text-left gap-2 sm:gap-0">
                        <div className="flex-1">
                          <div className="flex items-center flex-wrap gap-2">
                            <Badge className={`mr-2 ${priorityInfo.color}`}>
                              {priorityInfo.label}
                            </Badge>
                            <h3 className="text-lg font-semibold">{action.title}</h3>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge className={getCategoryColor(action.category)}>
                            {action.category}
                          </Badge>
                          <Badge className={getDifficultyColor(action.difficulty)}>
                            {action.difficulty}
                          </Badge>
                          <Badge className={getTimeframeColor(action.timeframe)}>
                            {action.timeframe}
                          </Badge>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-4">
                        <p className="text-gray-700">{action.description}</p>
                        
                        <div className="mt-4">
                          <h4 className="text-md font-semibold mb-2">Estimated Impact</h4>
                          <div className="flex items-center mb-2">
                            <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
                            <span>
                              Overall score increase: <strong>{action.estimated_overall_score_increase.toFixed(1)}</strong> points
                            </span>
                          </div>
                          
                          {action.impacts.length > 0 && (
                            <div>
                              <button 
                                onClick={() => toggleImpactExpansion(action.title)}
                                className="text-sm text-blue-600 hover:text-blue-800 underline mt-1"
                              >
                                {expandedImpacts.includes(action.title) ? "Hide detailed impacts" : "Show detailed impacts"}
                              </button>
                              
                              {expandedImpacts.includes(action.title) && (
                                <div className="mt-2 bg-gray-50 p-3 rounded">
                                  <h5 className="text-sm font-medium mb-2">Metric-specific impacts:</h5>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {action.impacts.map((impact, i) => (
                                      <div key={i} className="text-sm bg-white p-2 rounded border">
                                        <p className="font-medium">{impact.metric_name}</p>
                                        <div className="flex justify-between mt-1">
                                          <span>Current: {impact.current_value.toFixed(2)}</span>
                                          <span className="text-emerald-600">→</span>
                                          <span>Projected: {impact.projected_value.toFixed(2)}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                          {impact.improvement_percentage > 0 ? "Improvement" : "Change"}: {Math.abs(impact.improvement_percentage).toFixed(1)}%
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Implementation Steps - Mock data */}
                        <div className="mt-4">
                          <h4 className="text-md font-semibold mb-2">Implementation Steps</h4>
                          <ol className="list-decimal list-inside space-y-2 pl-1">
                            <li>Analyze current {action.category.toLowerCase()} metrics to establish baseline</li>
                            <li>Develop detailed implementation plan with key stakeholders</li>
                            <li>Assign responsibilities and set measurable goals</li>
                            <li>Implement changes in phases to minimize business disruption</li>
                            <li>Monitor progress and adjust approach as needed</li>
                          </ol>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          ) : (
            <Card>
              <CardContent className="py-10 text-center">
                <p>No recommendations match the selected filters. Try adjusting your filters.</p>
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={() => {
                    setFilterDifficulty(null);
                    setFilterTimeframe(null);
                    handleCategoryFilter(null);
                  }}
                >
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          )}
          
          {/* Explanation Section */}
          <div className="mt-8 bg-gray-50 p-4 rounded-lg print:mt-4 print:break-before-page">
            <h4 className="text-lg font-semibold mb-2">How recommendations are prioritized</h4>
            <p className="text-gray-600">{recommendations.priority_explanation}</p>
            
            <Separator className="my-4" />
            
            <h4 className="text-lg font-semibold mb-2">About Impact Estimations</h4>
            <p className="text-gray-600">
              Impact estimates are based on industry benchmarks and historical performance data. 
              Actual results may vary based on implementation quality, market conditions, and other factors. 
              We recommend tracking key metrics before and after implementing each recommendation to measure actual impact.
            </p>
          </div>
        </div>
      ) : activeTab === "recommendations" && (
        <Card>
          <CardContent className="py-10 text-center">
            <p>Unable to generate recommendations. Please try again or contact support.</p>
            <Button 
              onClick={() => loadFinancialScore(companyId)} 
              className="mt-4"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Implementation Tracking Tab */}
      {activeTab === "implementation" && recommendations && (
        <RecommendationTracker 
          recommendations={recommendations.recommendations}
          implementationStatus={implementationStatus}
          onStatusChange={handleStatusChange}
          onImpactAssessmentChange={handleImpactAssessmentChange}
        />
      )}

      {/* Impact Analysis Tab */}
      {activeTab === "impact" && recommendations && (
        <Card>
          <CardHeader>
            <CardTitle>Impact Analysis Dashboard</CardTitle>
            <CardDescription>
              Track the actual vs. estimated impact of your implemented recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.values(implementationStatus).some(status => status.status === "completed") ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-gray-50 border-0">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Total Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{recommendations.recommendations.length}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-50 border-0">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Implemented Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-green-600">
                        {Object.values(implementationStatus).filter(s => s.status === "completed").length}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-50 border-0">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Average Impact Accuracy</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">
                        {Object.values(implementationStatus)
                          .filter(s => s.status === "completed" && s.impactAssessment)
                          .length > 0 ? "76%" : "N/A"}
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">Recommendation Impact Analysis</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Recommendation</TableHead>
                        <TableHead>Estimated Impact</TableHead>
                        <TableHead>Actual Impact</TableHead>
                        <TableHead>Variance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recommendations.recommendations
                        .filter(rec => implementationStatus[rec.title]?.status === "completed")
                        .map((rec, index) => {
                          const actualImpact = implementationStatus[rec.title]?.impactAssessment?.actualImpact || 0;
                          const variance = actualImpact - rec.estimated_overall_score_increase;
                          const variancePercent = rec.estimated_overall_score_increase > 0 ?
                            (variance / rec.estimated_overall_score_increase) * 100 : 0;
                            
                          return (
                            <TableRow key={index}>
                              <TableCell>{rec.title}</TableCell>
                              <TableCell>+{rec.estimated_overall_score_increase.toFixed(1)}</TableCell>
                              <TableCell>+{actualImpact.toFixed(1)}</TableCell>
                              <TableCell>
                                <span className={variance >= 0 ? "text-green-600" : "text-red-600"}>
                                  {variance > 0 ? "+" : ""}{variance.toFixed(1)} ({variancePercent.toFixed(0)}%)
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-muted-foreground mb-4">No recommendations have been implemented yet.</p>
                <p className="mb-6">Complete implementing some recommendations and record their actual impact to view analysis.</p>
                <Button onClick={() => setActiveTab("implementation")}>Go to Implementation Tracking</Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
