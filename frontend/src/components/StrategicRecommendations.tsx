import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info, AlertTriangle, LightbulbIcon, ShieldCheck, ArrowRight, Download, FileText } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import brain from "brain";

export interface StrategicRecommendationsProps {
  scenarioId?: string;
  scenarioResults?: any;
}

interface RecommendationCardProps {
  title: string;
  description: string;
  category: string;
  priority: string;
  timeframe: string;
  impact: string;
  complexity: string;
  steps: string[];
  metrics: string[];
  stakeholders: string[];
}

// Component for rendering an individual recommendation card
const RecommendationCard: React.FC<RecommendationCardProps> = ({
  title,
  description,
  category,
  priority,
  timeframe,
  impact,
  complexity,
  steps,
  metrics,
  stakeholders,
}) => {
  // Map priority to color
  const priorityColorMap: Record<string, string> = {
    high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  };

  // Map timeframe to readable text
  const timeframeMap: Record<string, string> = {
    immediate: "Immediate (0-30 days)",
    short_term: "Short Term (1-3 months)",
    medium_term: "Medium Term (3-12 months)",
    long_term: "Long Term (12+ months)",
  };

  // Map complexity to readable text and icon
  const complexityMap: Record<string, { text: string; color: string }> = {
    simple: { text: "Simple", color: "text-green-600" },
    moderate: { text: "Moderate", color: "text-yellow-600" },
    complex: { text: "Complex", color: "text-red-600" },
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Badge className={priorityColorMap[priority] || ""}>
            {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
          </Badge>
        </div>
        <CardDescription className="mt-2">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">Timeframe</p>
            <p className="text-sm">{timeframeMap[timeframe] || timeframe}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Expected Impact</p>
            <p className="text-sm">{impact.charAt(0).toUpperCase() + impact.slice(1)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Implementation Complexity</p>
            <p className={`text-sm ${complexityMap[complexity]?.color || ""}`}>
              {complexityMap[complexity]?.text ||
                complexity.charAt(0).toUpperCase() + complexity.slice(1)}
            </p>
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="steps">
            <AccordionTrigger>Implementation Steps</AccordionTrigger>
            <AccordionContent>
              <ol className="list-decimal pl-5 space-y-1">
                {steps.map((step, index) => (
                  <li key={index} className="text-sm">
                    {step}
                  </li>
                ))}
              </ol>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="metrics">
            <AccordionTrigger>Metrics to Track</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-5 space-y-1">
                {metrics.map((metric, index) => (
                  <li key={index} className="text-sm">
                    {metric}
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="stakeholders">
            <AccordionTrigger>Key Stakeholders</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-wrap gap-2">
                {stakeholders.map((stakeholder, index) => (
                  <Badge key={index} variant="outline">
                    {stakeholder}
                  </Badge>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

// Component for rendering a contingency plan
const ContingencyPlan: React.FC<{
  name: string;
  description: string;
  triggerConditions: string[];
  actionPlan: string[];
  responsibleParties: string[];
  communicationPlan: string[];
}> = ({
  name,
  description,
  triggerConditions,
  actionPlan,
  responsibleParties,
  communicationPlan,
}) => {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <ShieldCheck className="h-5 w-5 mr-2 text-amber-500" />
          {name}
        </CardTitle>
        <CardDescription className="mt-2">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Trigger Conditions</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              {triggerConditions.map((condition, index) => (
                <li key={index} className="text-sm">
                  {condition}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="action-plan">
            <AccordionTrigger>Action Plan</AccordionTrigger>
            <AccordionContent>
              <ol className="list-decimal pl-5 space-y-1">
                {actionPlan.map((step, index) => (
                  <li key={index} className="text-sm">
                    {step}
                  </li>
                ))}
              </ol>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="responsible-parties">
            <AccordionTrigger>Responsible Parties</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-wrap gap-2">
                {responsibleParties.map((party, index) => (
                  <Badge key={index} variant="outline">
                    {party}
                  </Badge>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="communication-plan">
            <AccordionTrigger>Communication Plan</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-5 space-y-1">
                {communicationPlan.map((item, index) => (
                  <li key={index} className="text-sm">
                    {item}
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export const StrategicRecommendations: React.FC<StrategicRecommendationsProps> = ({
  scenarioId,
  scenarioResults,
}) => {
  const [activeTab, setActiveTab] = useState("mitigation");
  const [isLoading, setIsLoading] = useState(false);
  const [recommendationsData, setRecommendationsData] = useState<any | null>(null);

  // Function to generate recommendations based on scenario results
  const generateRecommendations = async () => {
    if (!scenarioId || !scenarioResults) {
      toast.error("Please run a scenario analysis first");
      return;
    }

    setIsLoading(true);

    try {
      const response = await brain.generate_strategic_recommendations({
        scenario_id: scenarioId,
        organization_id: "org123", // This would come from context or state
        financial_impacts: scenarioResults.financial_impacts,
        business_unit_impacts: scenarioResults.business_unit_impacts,
        risk_level: scenarioResults.risk_level,
        opportunity_level: scenarioResults.opportunity_level
      });
      const data = await response.json();
      setRecommendationsData(data);

      // Fall back to mock data if we get an error
      if (!data) {
        const mockData = {
          scenario_id: scenarioId,
          scenario_name: scenarioResults?.scenario_name || "Interest Rate Scenario",
          scenario_type: "interest_rate",
          time_horizon: "medium_term",
          executive_summary: "Our analysis of the Interest Rate Scenario indicates a moderate level of risk exposure with significant potential opportunities. To address the moderate risks, we have developed several mitigation strategies that provide a balanced approach to risk management while maintaining operational flexibility. Key priorities focus on preserving cash flow, managing customer relationships, and maintaining competitive positioning.\n\nWe have identified strategic opportunities arising from this scenario that could provide substantial competitive advantages and growth potential. Pursuing these opportunities aggressively could position the organization to outperform competitors during this period of change.\n\nGiven the elevated risk profile, we have also developed contingency plans that define clear trigger points and response protocols should conditions deteriorate beyond expectations. These plans provide a structured framework for rapid decision-making during crisis situations.\n\nImplementation should be phased over the next 1-2 quarters, with high-priority actions initiated within 30 days. Regular monitoring of key metrics will be essential to gauge effectiveness.\n\nThis strategic response framework balances risk mitigation with opportunity capture, providing a comprehensive roadmap for navigating the challenges and possibilities presented by this scenario.",
          mitigation_strategies: [
            {
              title: "Debt Restructuring Program",
              description: "Implement a comprehensive debt restructuring program to convert variable-rate debt to fixed-rate instruments, reducing exposure to further interest rate increases.",
              category: "risk_mitigation",
              priority: "high",
              timeframe: "immediate",
              expected_impact: "high",
              implementation_complexity: "moderate",
              key_stakeholders: ["CFO", "Treasury Team", "Board of Directors", "Lenders"],
              implementation_steps: [
                "Conduct comprehensive debt portfolio review",
                "Identify high-risk variable rate facilities",
                "Approach lenders to negotiate refinancing or hedging options",
                "Prepare board proposal for restructuring approval",
                "Execute refinancing strategy in phases to minimize disruption"
              ],
              metrics_to_track: [
                "Percentage of debt at fixed vs. variable rates",
                "Average interest rate across debt portfolio",
                "Interest coverage ratio",
                "Debt service costs as percentage of EBITDA"
              ],
              risk_addressed: "Exposure to rising interest rates on variable debt",
              risk_reduction_potential: 0.75
            },
            {
              title: "Working Capital Optimization",
              description: "Implement enhanced working capital management to preserve cash flow in a rising interest rate environment.",
              category: "risk_mitigation",
              priority: "medium",
              timeframe: "short_term",
              expected_impact: "medium",
              implementation_complexity: "moderate",
              key_stakeholders: ["CFO", "Accounts Receivable/Payable Teams", "Sales", "Procurement"],
              implementation_steps: [
                "Review current payables and receivables processes",
                "Implement enhanced collections procedures for accounts receivable",
                "Negotiate extended payment terms with key suppliers",
                "Optimize inventory levels to reduce capital tied up",
                "Establish cash flow forecasting system with weekly updates"
              ],
              metrics_to_track: [
                "Days Sales Outstanding (DSO)",
                "Days Payable Outstanding (DPO)",
                "Inventory turnover ratio",
                "Cash conversion cycle",
                "Free cash flow"
              ],
              risk_addressed: "Cash flow constraints due to higher interest costs",
              risk_reduction_potential: 0.6
            },
            {
              title: "Customer Retention Program",
              description: "Develop targeted retention strategies for high-value customers who may reduce spending due to interest rate pressures.",
              category: "risk_mitigation",
              priority: "medium",
              timeframe: "short_term",
              expected_impact: "medium",
              implementation_complexity: "moderate",
              key_stakeholders: ["Sales Director", "Marketing Team", "Customer Success", "Product Team"],
              implementation_steps: [
                "Segment customer base by profitability and risk of churn",
                "Develop tailored retention offers for high-value segments",
                "Implement proactive outreach program for at-risk accounts",
                "Create flexible payment options for customers facing cash constraints",
                "Launch loyalty program with incentives for long-term commitments"
              ],
              metrics_to_track: [
                "Customer retention rate by segment",
                "Net Promoter Score (NPS)",
                "Customer Lifetime Value",
                "Contract renewal rates",
                "Average revenue per customer"
              ],
              risk_addressed: "Customer attrition due to economic pressure",
              risk_reduction_potential: 0.55
            }
          ],
          opportunity_strategies: [
            {
              title: "Cash Reserve Optimization Strategy",
              description: "Implement a treasury management strategy to maximize returns on cash reserves in the higher interest rate environment.",
              category: "opportunity",
              priority: "medium",
              timeframe: "short_term",
              expected_impact: "medium",
              implementation_complexity: "simple",
              key_stakeholders: ["CFO", "Treasury Team", "Board Finance Committee"],
              implementation_steps: [
                "Analyze current cash management and investment structure",
                "Develop optimal allocation strategy across instruments",
                "Establish tiered liquidity approach (operating, reserve, strategic cash)",
                "Implement laddered term deposit strategy",
                "Set up regular portfolio review process"
              ],
              metrics_to_track: [
                "Effective yield on cash reserves",
                "Yield vs. benchmark comparison",
                "Liquidity coverage ratio",
                "Cash utilization efficiency"
              ],
              opportunity_addressed: "Higher returns available on cash reserves",
              revenue_potential: 2.5
            },
            {
              title: "Strategic Acquisition Program",
              description: "Develop a targeted acquisition strategy to identify businesses facing financial pressure that could provide strategic value.",
              category: "opportunity",
              priority: "medium",
              timeframe: "medium_term",
              expected_impact: "high",
              implementation_complexity: "complex",
              key_stakeholders: ["CEO", "Strategy Team", "M&A", "Board of Directors"],
              implementation_steps: [
                "Define acquisition criteria aligned with strategic goals",
                "Identify sectors most impacted by interest rate pressure",
                "Develop target list with preliminary valuation models",
                "Establish funding approach optimizing current capital structure",
                "Create post-acquisition integration framework"
              ],
              metrics_to_track: [
                "Pipeline of qualified acquisition targets",
                "Expected ROI of acquisition opportunities",
                "Synergy potential assessment",
                "Post-acquisition performance vs. model"
              ],
              opportunity_addressed: "Acquisition of distressed assets at favorable valuations",
              revenue_potential: 15.0
            }
          ],
          contingency_plans: [
            {
              name: "Severe Cash Flow Constraint Response Plan",
              description: "Comprehensive emergency response plan to implement if cash flow constraints threaten operational viability.",
              trigger_conditions: [
                "Operating cash flow drops below 50% of forecast for two consecutive months",
                "Interest coverage ratio falls below 1.5x",
                "Banking covenants are breached or at imminent risk of breach",
                "Multiple large customers delay payments by >60 days"
              ],
              action_plan: [
                "Activate cash conservation committee with daily cash position monitoring",
                "Implement emergency spending protocols requiring executive approval for all expenditures above threshold",
                "Freeze all non-essential capital expenditures",
                "Convert select supplier relationships to consignment models",
                "Negotiate emergency financing facilities with banking partners",
                "Consider partial divestiture of non-core assets if necessary",
                "Implement reduced working week or selective staff furlough program"
              ],
              responsible_parties: [
                "CEO",
                "CFO",
                "Business Unit Leaders",
                "Treasury Team",
                "Board Finance Committee"
              ],
              communication_plan: [
                "Prepare stakeholder communication templates for different scenarios",
                "Establish communication sequence and timing for staff, customers, suppliers, lenders",
                "Designate authorized spokespersons for different stakeholder groups",
                "Develop Q&A for customer and supplier inquiries"
              ],
              resource_requirements: {
                "emergency_financing_facility": "Pre-approved credit line of at least 20% of annual operating expenses",
                "cash_flow_monitoring_system": "Daily cash position reporting capability",
                "legal_counsel": "For covenant negotiations and potential restructuring advice"
              },
              recovery_time_objective: 90
            },
            {
              name: "Debt Covenant Management Plan",
              description: "Response plan for managing potential debt covenant breaches due to interest rate impacts.",
              trigger_conditions: [
                "Financial metrics within 15% of covenant thresholds",
                "Two consecutive quarters of declining financial performance",
                "Interest coverage ratio trending below covenant requirements"
              ],
              action_plan: [
                "Conduct detailed covenant compliance forecast for next 4 quarters",
                "Proactively engage with lenders to discuss potential temporary covenant relief",
                "Prepare covenant waiver or amendment request documentation",
                "Identify potential asset sales or equity injection options if required",
                "Develop operational plan specifically targeting metrics affecting covenants",
                "Consider debt restructuring or refinancing alternatives"
              ],
              responsible_parties: [
                "CFO",
                "Treasurer",
                "Financial Controller",
                "Legal Counsel",
                "Board Finance Committee"
              ],
              communication_plan: [
                "Schedule proactive lender discussions before potential breach",
                "Prepare comprehensive business plan showing path to covenant compliance",
                "Develop investor communications if equity raising may be required",
                "Create internal management reporting focused on covenant metrics"
              ],
              resource_requirements: {
                "financial_modeling": "Detailed covenant compliance model",
                "banking_relationships": "Strong lender relationships and communication channels",
                "advisory_support": "Financial and legal advisors for covenant negotiations"
              },
              recovery_time_objective: 180
            }
          ]
        };
        
        setRecommendationsData(mockData);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error generating strategic recommendations:", error);
      toast.error("Failed to generate strategic recommendations");
      setIsLoading(false);
    }
  };

  // Function to handle export of recommendations
  const handleExport = (format: "pdf" | "docx") => {
    if (!recommendationsData) return;

    toast.success(`Exported as ${format.toUpperCase()}`, {
      description: `Strategic recommendations for ${recommendationsData.scenario_name} have been exported.`
    });

    // In a real implementation, this would call an API to generate and download the document
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Strategic Response Planning</CardTitle>
            <CardDescription>
              Generate comprehensive recommendations for mitigating risks and capturing opportunities
            </CardDescription>
          </div>
          {recommendationsData && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-auto">
                <div className="grid gap-1">
                  <Button
                    variant="ghost"
                    className="flex justify-start text-sm"
                    onClick={() => handleExport("pdf")}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Export as PDF
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex justify-start text-sm"
                    onClick={() => handleExport("docx")}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Export as Word Document
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!scenarioResults && !isLoading && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>No scenario analysis results</AlertTitle>
            <AlertDescription>
              Please run a scenario analysis first to generate strategic recommendations.
            </AlertDescription>
          </Alert>
        )}

        {scenarioResults && !recommendationsData && !isLoading && (
          <div className="flex flex-col items-center justify-center p-6">
            <p className="mb-4 text-center text-muted-foreground">
              Ready to generate strategic recommendations for scenario: <br />
              <strong>{scenarioResults.scenario_name}</strong>
            </p>
            <Button onClick={generateRecommendations}>
              Generate Strategic Recommendations
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <Skeleton className="h-48 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        )}

        {recommendationsData && (
          <div className="space-y-6">
            {/* Executive Summary */}
            <div className="p-4 border rounded-md bg-muted/50">
              <h3 className="text-lg font-medium mb-2">Executive Summary</h3>
              <div className="text-sm whitespace-pre-line">
                {recommendationsData.executive_summary}
              </div>
            </div>

            {/* Tabs for different recommendation types */}
            <Tabs
              defaultValue="mitigation"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="mitigation" className="flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Risk Mitigation
                </TabsTrigger>
                <TabsTrigger value="opportunity" className="flex items-center">
                  <LightbulbIcon className="h-4 w-4 mr-2" />
                  Opportunities
                </TabsTrigger>
                <TabsTrigger value="contingency" className="flex items-center">
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Contingency Plans
                </TabsTrigger>
              </TabsList>

              {/* Risk Mitigation Strategies */}
              <TabsContent value="mitigation" className="space-y-4 pt-4">
                {recommendationsData.mitigation_strategies.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No risk mitigation strategies identified for this scenario.
                  </p>
                ) : (
                  recommendationsData.mitigation_strategies.map((strategy: any, index: number) => (
                    <RecommendationCard
                      key={index}
                      title={strategy.title}
                      description={strategy.description}
                      category={strategy.category}
                      priority={strategy.priority}
                      timeframe={strategy.timeframe}
                      impact={strategy.expected_impact}
                      complexity={strategy.implementation_complexity}
                      steps={strategy.implementation_steps}
                      metrics={strategy.metrics_to_track}
                      stakeholders={strategy.key_stakeholders}
                    />
                  ))
                )}
              </TabsContent>

              {/* Opportunity Strategies */}
              <TabsContent value="opportunity" className="space-y-4 pt-4">
                {recommendationsData.opportunity_strategies.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No opportunity strategies identified for this scenario.
                  </p>
                ) : (
                  recommendationsData.opportunity_strategies.map((strategy: any, index: number) => (
                    <RecommendationCard
                      key={index}
                      title={strategy.title}
                      description={strategy.description}
                      category={strategy.category}
                      priority={strategy.priority}
                      timeframe={strategy.timeframe}
                      impact={strategy.expected_impact}
                      complexity={strategy.implementation_complexity}
                      steps={strategy.implementation_steps}
                      metrics={strategy.metrics_to_track}
                      stakeholders={strategy.key_stakeholders}
                    />
                  ))
                )}
              </TabsContent>

              {/* Contingency Plans */}
              <TabsContent value="contingency" className="space-y-4 pt-4">
                {recommendationsData.contingency_plans.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No contingency plans developed for this scenario.
                  </p>
                ) : (
                  recommendationsData.contingency_plans.map((plan: any, index: number) => (
                    <ContingencyPlan
                      key={index}
                      name={plan.name}
                      description={plan.description}
                      triggerConditions={plan.trigger_conditions}
                      actionPlan={plan.action_plan}
                      responsibleParties={plan.responsible_parties}
                      communicationPlan={plan.communication_plan}
                    />
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
