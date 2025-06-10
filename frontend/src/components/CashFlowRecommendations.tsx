import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CalendarDays, AlertTriangle, TrendingUp, DollarSign, Clock } from "lucide-react";
import { 
  CashFlowOptimizationResponse,
  formatCurrency,
  formatDate,
  formatImpact,
  formatDaysShift,
  getEntityTypeColor,
  getSeverityColor,
  getDifficultyColor,
  getTimeframeColor,
  getCategoryColor
} from "utils/cashFlowOptimization";

interface Props {
  data: CashFlowOptimizationResponse;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function CashFlowRecommendations({ data, isLoading = false, onRefresh }: Props) {
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Cash Flow Optimization</CardTitle>
          <CardDescription>Loading recommendations...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center min-h-[300px]">
          <div className="animate-pulse flex flex-col gap-4 w-full">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-20 bg-gray-200 rounded w-full"></div>
            <div className="h-20 bg-gray-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Determine if we have alerts that need attention
  const hasCriticalAlerts = data.cash_shortfall_alerts.some(alert => 
    alert.severity === "high" || alert.severity === "critical"
  );
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Cash Flow Optimization</CardTitle>
            <CardDescription>
              Recommendations as of {formatDate(data.recommendation_date)}
            </CardDescription>
          </div>
          {onRefresh && (
            <Button variant="outline" onClick={onRefresh}>
              Refresh
            </Button>
          )}
        </div>
        
        {hasCriticalAlerts && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Cash Flow Alert</AlertTitle>
            <AlertDescription>
              You have {data.cash_shortfall_alerts.filter(a => a.severity === "critical" || a.severity === "high").length} high priority cash flow {data.cash_shortfall_alerts.length === 1 ? "alert" : "alerts"} that need your attention.
            </AlertDescription>
          </Alert>
        )}
        
        {data.expected_cash_impact > 0 && (
          <Alert className="mt-4 bg-emerald-50 text-emerald-800 border-emerald-200">
            <TrendingUp className="h-4 w-4" />
            <AlertTitle>Potential Improvement</AlertTitle>
            <AlertDescription>
              Implementing these recommendations could improve your cash position by approximately {formatCurrency(data.expected_cash_impact)}.
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timing">
              Timing
              {data.timing_recommendations.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {data.timing_recommendations.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="capital">
              Capital
              {data.working_capital_recommendations.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {data.working_capital_recommendations.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="alerts">
              Alerts
              {data.cash_shortfall_alerts.length > 0 && (
                <Badge variant={hasCriticalAlerts ? "destructive" : "secondary"} className="ml-2">
                  {data.cash_shortfall_alerts.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Timing Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{data.timing_recommendations.length}</div>
                  <p className="text-sm text-muted-foreground">
                    {data.timing_recommendations.length === 0 
                      ? "No timing adjustments needed" 
                      : `${data.timing_recommendations.filter(r => r.entity_type === "customer").length} receivables, ${data.timing_recommendations.filter(r => r.entity_type === "vendor").length} payables`}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Working Capital</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{data.working_capital_recommendations.length}</div>
                  <p className="text-sm text-muted-foreground">
                    {data.working_capital_recommendations.length === 0 
                      ? "No recommendations available" 
                      : `${data.working_capital_recommendations.filter(r => r.implementation_difficulty === "low").length} easy-to-implement opportunities`}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Cash Flow Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{data.cash_shortfall_alerts.length}</div>
                  <p className="text-sm text-muted-foreground">
                    {data.cash_shortfall_alerts.length === 0 
                      ? "No cash flow issues detected" 
                      : `${data.cash_shortfall_alerts.filter(a => a.severity === "high" || a.severity === "critical").length} critical alerts`}
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-4">
              {data.cash_shortfall_alerts.filter(a => a.severity === "critical" || a.severity === "high").length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Critical Alerts</h3>
                  <div className="space-y-2">
                    {data.cash_shortfall_alerts
                      .filter(a => a.severity === "critical" || a.severity === "high")
                      .slice(0, 2)
                      .map((alert, index) => (
                        <Alert key={index} className={`${getSeverityColor(alert.severity)} border-0`}>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle className="flex items-center gap-2">
                            Cash shortfall on {formatDate(alert.alert_date)}
                            <Badge className="ml-auto">{alert.severity}</Badge>
                          </AlertTitle>
                          <AlertDescription>
                            <div className="font-medium">{formatCurrency(alert.shortfall_amount)} below minimum threshold</div>
                            <div className="mt-1 text-sm">{alert.contributing_factors[0]}</div>
                          </AlertDescription>
                        </Alert>
                      ))}
                    {data.cash_shortfall_alerts.filter(a => a.severity === "critical" || a.severity === "high").length > 2 && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-1 w-full"
                        onClick={() => setActiveTab("alerts")}
                      >
                        View all alerts
                      </Button>
                    )}
                  </div>
                </div>
              )}
              
              {data.timing_recommendations.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Top Payment Timing Opportunities</h3>
                  <div className="space-y-2">
                    {data.timing_recommendations
                      .sort((a, b) => b.impact - a.impact)
                      .slice(0, 2)
                      .map((rec, index) => (
                        <div key={index} className="flex items-start p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <span className="font-medium">{rec.entity_name}</span>
                              <Badge className={`ml-2 ${getEntityTypeColor(rec.entity_type)}`}>
                                {rec.entity_type}
                              </Badge>
                            </div>
                            <div className="text-sm mt-1">
                              <span className="inline-flex items-center gap-1">
                                <CalendarDays className="h-3 w-3" /> 
                                {formatDate(rec.original_date)} → {formatDate(rec.recommended_date)} ({formatDaysShift(rec.days_shift)})
                              </span>
                            </div>
                            <div className="text-sm mt-1">{rec.reasoning}</div>
                          </div>
                          <div className="ml-4 text-right">
                            <div className="font-semibold text-emerald-600">{formatImpact(rec.impact)}</div>
                            <div className="text-xs text-muted-foreground mt-1">Impact</div>
                          </div>
                        </div>
                      ))}
                    {data.timing_recommendations.length > 2 && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-1 w-full"
                        onClick={() => setActiveTab("timing")}
                      >
                        View all timing recommendations
                      </Button>
                    )}
                  </div>
                </div>
              )}
              
              {data.working_capital_recommendations.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Top Working Capital Opportunities</h3>
                  <div className="space-y-2">
                    {data.working_capital_recommendations
                      .sort((a, b) => b.potential_impact - a.potential_impact)
                      .slice(0, 2)
                      .map((rec, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{rec.title}</div>
                            <Badge className={`${getCategoryColor(rec.category)}`}>
                              {rec.category}
                            </Badge>
                          </div>
                          <div className="text-sm mt-1">{rec.description}</div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={getDifficultyColor(rec.implementation_difficulty)}>
                                {rec.implementation_difficulty}
                              </Badge>
                              <Badge variant="outline" className={getTimeframeColor(rec.timeframe)}>
                                {rec.timeframe}
                              </Badge>
                            </div>
                            <div className="font-semibold text-emerald-600">
                              {formatCurrency(rec.potential_impact)}
                            </div>
                          </div>
                        </div>
                      ))}
                    {data.working_capital_recommendations.length > 2 && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-1 w-full"
                        onClick={() => setActiveTab("capital")}
                      >
                        View all working capital recommendations
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="timing" className="pt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Payment & Collection Timing Recommendations</h3>
            </div>
            
            {data.timing_recommendations.length === 0 ? (
              <div className="text-center py-8 border rounded-lg">
                <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="mt-2 text-lg font-medium">No Timing Recommendations</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your current payment and collection schedules appear to be optimized.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.timing_recommendations.sort((a, b) => b.impact - a.impact).map((rec, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-start">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <span className="text-lg font-medium">{rec.entity_name}</span>
                            <Badge className={`ml-2 ${getEntityTypeColor(rec.entity_type)}`}>
                              {rec.entity_type}
                            </Badge>
                            <Badge variant="outline" className="ml-2">
                              {formatDaysShift(rec.days_shift)}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Original Date</p>
                              <p className="font-medium">{formatDate(rec.original_date)}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Recommended Date</p>
                              <p className="font-medium">{formatDate(rec.recommended_date)}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Amount</p>
                              <p className="font-medium">{formatCurrency(rec.amount)}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Cash Flow Impact</p>
                              <p className="font-medium text-emerald-600">{formatImpact(rec.impact)}</p>
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <p className="text-sm font-medium text-muted-foreground">Reasoning</p>
                            <p className="text-sm">{rec.reasoning}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="capital" className="pt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Working Capital Recommendations</h3>
            </div>
            
            {data.working_capital_recommendations.length === 0 ? (
              <div className="text-center py-8 border rounded-lg">
                <DollarSign className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="mt-2 text-lg font-medium">No Working Capital Recommendations</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your working capital strategy appears to be optimized.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.working_capital_recommendations.sort((a, b) => b.potential_impact - a.potential_impact).map((rec, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-lg font-medium">{rec.title}</span>
                            <Badge className={getCategoryColor(rec.category)}>
                              {rec.category}
                            </Badge>
                          </div>
                          <p className="mt-2">{rec.description}</p>
                          
                          <div className="flex items-center gap-3 mt-4">
                            <div>
                              <Badge variant="outline" className={getDifficultyColor(rec.implementation_difficulty)}>
                                {rec.implementation_difficulty} difficulty
                              </Badge>
                            </div>
                            <div>
                              <Badge variant="outline" className={getTimeframeColor(rec.timeframe)}>
                                {rec.timeframe}
                              </Badge>
                            </div>
                            <div>
                              <Badge variant="outline">
                                {Math.round(rec.confidence * 100)}% confidence
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-bold text-emerald-600">
                            {formatCurrency(rec.potential_impact)}
                          </div>
                          <div className="text-xs text-muted-foreground">Potential Impact</div>
                        </div>
                      </div>
                      
                      {rec.action_items.length > 0 && (
                        <div className="mt-6">
                          <p className="font-medium">Action Items:</p>
                          <ul className="mt-2 space-y-1">
                            {rec.action_items.map((item, i) => (
                              <li key={i} className="flex items-start">
                                <span className="mr-2">•</span>
                                <span className="text-sm">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="alerts" className="pt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Cash Flow Alerts</h3>
            </div>
            
            {data.cash_shortfall_alerts.length === 0 ? (
              <div className="text-center py-8 border rounded-lg">
                <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="mt-2 text-lg font-medium">No Cash Flow Alerts</p>
                <p className="text-sm text-muted-foreground mt-1">
                  No cash flow issues have been detected at this time.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.cash_shortfall_alerts
                  .sort((a, b) => {
                    // Sort by severity first, then by date
                    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
                      return severityOrder[a.severity] - severityOrder[b.severity];
                    }
                    return new Date(a.alert_date).getTime() - new Date(b.alert_date).getTime();
                  })
                  .map((alert, index) => (
                    <Card key={index} className={`border-l-4 ${getSeverityColor(alert.severity)} border-l-${alert.severity === "critical" ? "red" : alert.severity === "high" ? "orange" : alert.severity === "medium" ? "yellow" : "blue"}-500`}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-medium">Cash Shortfall Predicted</span>
                              <Badge className={getSeverityColor(alert.severity)}>
                                {alert.severity}
                              </Badge>
                            </div>
                            
                            <div className="mt-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Date</p>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <p className="font-medium">{formatDate(alert.alert_date)}</p>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Shortfall Amount</p>
                                  <p className="font-medium text-red-600">{formatCurrency(alert.shortfall_amount)}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <p className="font-medium">Contributing Factors:</p>
                          <ul className="mt-2 space-y-1">
                            {alert.contributing_factors.map((factor, i) => (
                              <li key={i} className="flex items-start">
                                <span className="mr-2">•</span>
                                <span className="text-sm">{factor}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="mt-4">
                          <p className="font-medium">Mitigation Options:</p>
                          <ul className="mt-2 space-y-1">
                            {alert.mitigation_options.map((option, i) => (
                              <li key={i} className="flex items-start">
                                <span className="mr-2">•</span>
                                <span className="text-sm">{option}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}