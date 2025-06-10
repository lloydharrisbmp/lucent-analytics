from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any, Literal
from enum import Enum
import datetime
from app.apis.scenario_utils import ScenarioType, ImpactLevel, TimeHorizon, EconomicScenario

router = APIRouter()

class RecommendationCategory(str, Enum):
    RISK_MITIGATION = "risk_mitigation"
    OPPORTUNITY = "opportunity"
    CONTINGENCY = "contingency"

class RecommendationPriority(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class TimeFrame(str, Enum):
    IMMEDIATE = "immediate"  # 0-30 days
    SHORT_TERM = "short_term"  # 1-3 months
    MEDIUM_TERM = "medium_term"  # 3-12 months
    LONG_TERM = "long_term"  # 12+ months

class RecommendationImpact(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class ImplementationComplexity(str, Enum):
    SIMPLE = "simple"
    MODERATE = "moderate"
    COMPLEX = "complex"

class StrategicRecommendation(BaseModel):
    id: Optional[str] = None
    title: str
    description: str
    category: RecommendationCategory
    priority: RecommendationPriority
    timeframe: TimeFrame
    expected_impact: RecommendationImpact
    implementation_complexity: ImplementationComplexity
    key_stakeholders: List[str]
    implementation_steps: List[str]
    metrics_to_track: List[str]
    resource_requirements: Optional[Dict[str, Any]] = None

class MitigationStrategy(StrategicRecommendation):
    risk_addressed: str
    risk_reduction_potential: float  # 0-1 scale

class OpportunityStrategy(StrategicRecommendation):
    opportunity_addressed: str
    revenue_potential: Optional[float] = None  # Estimated revenue impact in percentage
    cost_savings_potential: Optional[float] = None  # Estimated cost savings in percentage

class ContingencyPlan(BaseModel):
    id: Optional[str] = None
    name: str
    description: str
    trigger_conditions: List[str]
    action_plan: List[str]
    responsible_parties: List[str]
    communication_plan: List[str]
    resource_requirements: Dict[str, Any]
    recovery_time_objective: Optional[int] = None  # in days

class ScenarioResponseRequest(BaseModel):
    scenario_id: str
    organization_id: str
    financial_impacts: Dict[str, float]
    business_unit_impacts: Dict[str, Dict[str, float]]
    risk_level: float
    opportunity_level: float

class ScenarioResponseRecommendations(BaseModel):
    scenario_id: str
    scenario_name: str
    scenario_type: ScenarioType
    time_horizon: TimeHorizon
    mitigation_strategies: List[MitigationStrategy]
    opportunity_strategies: List[OpportunityStrategy]
    contingency_plans: List[ContingencyPlan]
    executive_summary: str

@router.post("/generate-recommendations", response_model=ScenarioResponseRecommendations)
def generate_strategic_recommendations(request: ScenarioResponseRequest) -> ScenarioResponseRecommendations:
    """
    Generate comprehensive strategic recommendations for responding to a scenario,
    including risk mitigation strategies, opportunity identification, and contingency planning.
    """
    # In a real implementation, we would fetch the scenario from the database using the scenario_id
    # For now, we'll create a mock scenario based on the request
    
    # Mock scenario retrieval (in production, this would be from database)
    mock_scenario = {
        "id": request.scenario_id,
        "name": "RBA Interest Rate Hike",
        "description": "Analysis of impact from Reserve Bank of Australia increasing interest rates",
        "scenario_type": ScenarioType.INTEREST_RATE,
        "time_horizon": TimeHorizon.MEDIUM_TERM,
    }
    
    mitigation_strategies = generate_mitigation_strategies(
        request.scenario_id, 
        mock_scenario["scenario_type"],
        request.financial_impacts,
        request.business_unit_impacts,
        request.risk_level
    )
    
    opportunity_strategies = generate_opportunity_strategies(
        request.scenario_id, 
        mock_scenario["scenario_type"],
        request.financial_impacts,
        request.business_unit_impacts,
        request.opportunity_level
    )
    
    contingency_plans = generate_contingency_plans(
        request.scenario_id, 
        mock_scenario["scenario_type"],
        request.financial_impacts,
        request.risk_level
    )
    
    # Generate an executive summary
    executive_summary = generate_executive_summary(
        mock_scenario,
        request.risk_level,
        request.opportunity_level,
        len(mitigation_strategies),
        len(opportunity_strategies)
    )
    
    return ScenarioResponseRecommendations(
        scenario_id=request.scenario_id,
        scenario_name=mock_scenario["name"],
        scenario_type=mock_scenario["scenario_type"],
        time_horizon=mock_scenario["time_horizon"],
        mitigation_strategies=mitigation_strategies,
        opportunity_strategies=opportunity_strategies,
        contingency_plans=contingency_plans,
        executive_summary=executive_summary
    )

def generate_mitigation_strategies(
    scenario_id: str, 
    scenario_type: ScenarioType, 
    financial_impacts: Dict[str, float],
    business_unit_impacts: Dict[str, Dict[str, float]],
    risk_level: float
) -> List[MitigationStrategy]:
    """
    Generate risk mitigation strategies tailored to the scenario and its impacts
    """
    strategies = []
    
    # Interest rate scenario mitigations
    if scenario_type == ScenarioType.INTEREST_RATE:
        # Check for debt servicing impact
        debt_impact = financial_impacts.get("debt_servicing_cost", 0)
        cash_flow_impact = financial_impacts.get("cash_flow", 0)
        revenue_impact = financial_impacts.get("revenue", 0)
        
        # Debt management strategies
        if debt_impact > 10:
            strategies.append(MitigationStrategy(
                title="Debt Restructuring Program",
                description="Implement a comprehensive debt restructuring program to convert variable-rate debt to fixed-rate instruments, reducing exposure to further interest rate increases.",
                category=RecommendationCategory.RISK_MITIGATION,
                priority=RecommendationPriority.HIGH,
                timeframe=TimeFrame.IMMEDIATE,
                expected_impact=RecommendationImpact.HIGH,
                implementation_complexity=ImplementationComplexity.MODERATE,
                key_stakeholders=["CFO", "Treasury Team", "Board of Directors", "Lenders"],
                implementation_steps=[
                    "Conduct comprehensive debt portfolio review",
                    "Identify high-risk variable rate facilities",
                    "Approach lenders to negotiate refinancing or hedging options",
                    "Prepare board proposal for restructuring approval",
                    "Execute refinancing strategy in phases to minimize disruption"
                ],
                metrics_to_track=[
                    "Percentage of debt at fixed vs. variable rates",
                    "Average interest rate across debt portfolio",
                    "Interest coverage ratio",
                    "Debt service costs as percentage of EBITDA"
                ],
                resource_requirements={
                    "financial_advisor": True,
                    "legal_counsel": True,
                    "upfront_fees": "Medium"
                },
                risk_addressed="Exposure to rising interest rates on variable debt",
                risk_reduction_potential=0.75
            ))
        
        # Cash flow management strategies
        if cash_flow_impact < -3:
            strategies.append(MitigationStrategy(
                title="Working Capital Optimization",
                description="Implement enhanced working capital management to preserve cash flow in a rising interest rate environment.",
                category=RecommendationCategory.RISK_MITIGATION,
                priority=RecommendationPriority.HIGH if cash_flow_impact < -5 else RecommendationPriority.MEDIUM,
                timeframe=TimeFrame.SHORT_TERM,
                expected_impact=RecommendationImpact.MEDIUM,
                implementation_complexity=ImplementationComplexity.MODERATE,
                key_stakeholders=["CFO", "Accounts Receivable/Payable Teams", "Sales", "Procurement"],
                implementation_steps=[
                    "Review current payables and receivables processes",
                    "Implement enhanced collections procedures for accounts receivable",
                    "Negotiate extended payment terms with key suppliers",
                    "Optimize inventory levels to reduce capital tied up",
                    "Establish cash flow forecasting system with weekly updates"
                ],
                metrics_to_track=[
                    "Days Sales Outstanding (DSO)",
                    "Days Payable Outstanding (DPO)",
                    "Inventory turnover ratio",
                    "Cash conversion cycle",
                    "Free cash flow"
                ],
                resource_requirements={
                    "process_redesign": True,
                    "software_tools": True
                },
                risk_addressed="Cash flow constraints due to higher interest costs",
                risk_reduction_potential=0.6
            ))
            
            # Capital expenditure review for severe cash flow impacts
            if cash_flow_impact < -5:
                strategies.append(MitigationStrategy(
                    title="Capital Expenditure Prioritization Framework",
                    description="Develop a robust capital allocation framework to prioritize essential investments and delay discretionary spending.",
                    category=RecommendationCategory.RISK_MITIGATION,
                    priority=RecommendationPriority.HIGH,
                    timeframe=TimeFrame.IMMEDIATE,
                    expected_impact=RecommendationImpact.HIGH,
                    implementation_complexity=ImplementationComplexity.SIMPLE,
                    key_stakeholders=["Executive Team", "Department Heads", "Project Managers"],
                    implementation_steps=[
                        "Review all planned capital projects for next 12-18 months",
                        "Categorize projects as essential, strategic, or discretionary",
                        "Develop ROI hurdle rates adjusted for new interest rate environment",
                        "Implement stage-gate process for project funding approval",
                        "Create quarterly capital allocation review committee"
                    ],
                    metrics_to_track=[
                        "Capital expenditure as percentage of revenue/cash flow",
                        "ROI of approved projects",
                        "Maintenance capex vs. growth capex ratio",
                        "Project completion on time/on budget percentage"
                    ],
                    resource_requirements={
                        "project_management_office": True,
                        "financial_analysis_tools": True
                    },
                    risk_addressed="Cash flow strain from non-essential capital projects",
                    risk_reduction_potential=0.8
                ))
        
        # Revenue protection strategies
        if revenue_impact < -2:
            strategies.append(MitigationStrategy(
                title="Customer Retention Program",
                description="Develop targeted retention strategies for high-value customers who may reduce spending due to interest rate pressures.",
                category=RecommendationCategory.RISK_MITIGATION,
                priority=RecommendationPriority.MEDIUM,
                timeframe=TimeFrame.SHORT_TERM,
                expected_impact=RecommendationImpact.MEDIUM,
                implementation_complexity=ImplementationComplexity.MODERATE,
                key_stakeholders=["Sales Director", "Marketing Team", "Customer Success", "Product Team"],
                implementation_steps=[
                    "Segment customer base by profitability and risk of churn",
                    "Develop tailored retention offers for high-value segments",
                    "Implement proactive outreach program for at-risk accounts",
                    "Create flexible payment options for customers facing cash constraints",
                    "Launch loyalty program with incentives for long-term commitments"
                ],
                metrics_to_track=[
                    "Customer retention rate by segment",
                    "Net Promoter Score (NPS)",
                    "Customer Lifetime Value",
                    "Contract renewal rates",
                    "Average revenue per customer"
                ],
                resource_requirements={
                    "crm_system_enhancements": True,
                    "customer_success_team": True,
                    "retention_budget": "Medium"
                },
                risk_addressed="Customer attrition due to economic pressure",
                risk_reduction_potential=0.55
            ))
            
            # Pricing strategy review
            strategies.append(MitigationStrategy(
                title="Value-Based Pricing Strategy",
                description="Revise pricing strategy to emphasize value delivery rather than cost, maintaining margins while addressing customer price sensitivity.",
                category=RecommendationCategory.RISK_MITIGATION,
                priority=RecommendationPriority.MEDIUM,
                timeframe=TimeFrame.MEDIUM_TERM,
                expected_impact=RecommendationImpact.MEDIUM,
                implementation_complexity=ImplementationComplexity.MODERATE,
                key_stakeholders=["Product Management", "Marketing", "Sales", "Finance"],
                implementation_steps=[
                    "Conduct value perception research with key customer segments",
                    "Analyze price elasticity across product/service lines",
                    "Develop value-based messaging and sales enablement materials",
                    "Test revised pricing strategies in selected markets",
                    "Roll out new pricing structure with comprehensive sales training"
                ],
                metrics_to_track=[
                    "Price realization percentage",
                    "Gross margin by product/service",
                    "Win/loss rate analysis",
                    "Price exception requests",
                    "Customer acquisition cost"
                ],
                resource_requirements={
                    "market_research": True,
                    "pricing_consultant": True,
                    "sales_training": True
                },
                risk_addressed="Margin erosion from price competition",
                risk_reduction_potential=0.5
            ))
    
    # Exchange rate scenario mitigations
    elif scenario_type == ScenarioType.EXCHANGE_RATE:
        # Implement exchange rate specific strategies
        # Import/export strategies based on AUD movement direction
        margin_impact = financial_impacts.get("gross_margin", 0)
        revenue_impact = financial_impacts.get("revenue", 0)
        cogs_impact = financial_impacts.get("cogs", 0)
        
        # For significant negative margin impact
        if margin_impact < -3:
            strategies.append(MitigationStrategy(
                title="Currency Hedging Program",
                description="Implement a structured foreign exchange hedging program to reduce volatility in cash flows and protect margins.",
                category=RecommendationCategory.RISK_MITIGATION,
                priority=RecommendationPriority.HIGH,
                timeframe=TimeFrame.IMMEDIATE,
                expected_impact=RecommendationImpact.HIGH,
                implementation_complexity=ImplementationComplexity.MODERATE,
                key_stakeholders=["CFO", "Treasury", "Procurement", "International Sales"],
                implementation_steps=[
                    "Map all foreign currency exposures and cash flows",
                    "Develop hedging policy with coverage ratios and instruments",
                    "Engage banking partners for hedging facilities",
                    "Implement hedge accounting procedures",
                    "Establish regular exposure reporting and hedge effectiveness monitoring"
                ],
                metrics_to_track=[
                    "Percentage of exposure hedged",
                    "Effective exchange rates achieved",
                    "Margin protection percentage",
                    "Hedging costs vs. benefits"
                ],
                resource_requirements={
                    "treasury_management_system": True,
                    "banking_facilities": True,
                    "fx_advisory": True
                },
                risk_addressed="Foreign exchange volatility impact on margins",
                risk_reduction_potential=0.7
            ))
        
        # For supply chain impacts with increased import costs
        if cogs_impact > 3:
            strategies.append(MitigationStrategy(
                title="Supply Chain Diversification",
                description="Diversify supply chain to include more domestic suppliers, reducing reliance on imports affected by exchange rate fluctuations.",
                category=RecommendationCategory.RISK_MITIGATION,
                priority=RecommendationPriority.MEDIUM,
                timeframe=TimeFrame.MEDIUM_TERM,
                expected_impact=RecommendationImpact.MEDIUM,
                implementation_complexity=ImplementationComplexity.COMPLEX,
                key_stakeholders=["Operations Director", "Procurement Team", "Quality Assurance", "Finance"],
                implementation_steps=[
                    "Identify high-impact imported components/materials",
                    "Research and qualify domestic supplier alternatives",
                    "Conduct cost-benefit analysis including fx volatility factor",
                    "Pilot local sourcing for selected components",
                    "Develop phased transition plan with dual-sourcing period"
                ],
                metrics_to_track=[
                    "Percentage of domestic vs. imported supply",
                    "Supply chain fx exposure",
                    "Total landed cost comparison",
                    "Supply chain resilience score",
                    "Supplier performance metrics"
                ],
                resource_requirements={
                    "supplier_development": True,
                    "quality_management": True,
                    "contract_renegotiation": True
                },
                risk_addressed="Supply chain cost volatility from import dependency",
                risk_reduction_potential=0.6
            ))
    
    # Inflation scenario mitigations
    elif scenario_type == ScenarioType.INFLATION:
        # Implement inflation hedging strategies
        pass
    
    # Additional scenarios and strategies can be implemented here...
    
    return strategies

def generate_opportunity_strategies(
    scenario_id: str, 
    scenario_type: ScenarioType, 
    financial_impacts: Dict[str, float],
    business_unit_impacts: Dict[str, Dict[str, float]],
    opportunity_level: float
) -> List[OpportunityStrategy]:
    """
    Generate opportunity strategies to capitalize on positive aspects of the scenario
    """
    strategies = []
    
    # Interest rate scenario opportunities
    if scenario_type == ScenarioType.INTEREST_RATE:
        # Banking sector opportunities with rising rates
        banking_impact = None
        for unit, impacts in business_unit_impacts.items():
            if "banking" in unit.lower() or "financial" in unit.lower():
                banking_impact = impacts.get("margin", 0)
        
        if banking_impact is not None and banking_impact > 0:
            strategies.append(OpportunityStrategy(
                title="High-Yield Product Expansion",
                description="Develop and promote high-yield deposit products to attract funds seeking better returns in the rising rate environment.",
                category=RecommendationCategory.OPPORTUNITY,
                priority=RecommendationPriority.HIGH,
                timeframe=TimeFrame.SHORT_TERM,
                expected_impact=RecommendationImpact.HIGH,
                implementation_complexity=ImplementationComplexity.MODERATE,
                key_stakeholders=["Product Development", "Marketing", "Retail Banking", "Treasury"],
                implementation_steps=[
                    "Analyze competitive landscape of deposit products",
                    "Design tiered product structure with appropriate rates",
                    "Develop marketing campaign highlighting yield advantages",
                    "Train customer-facing staff on new product benefits",
                    "Implement customer acquisition tracking system"
                ],
                metrics_to_track=[
                    "New account growth rate",
                    "Deposit balance increase",
                    "Customer acquisition cost",
                    "Net interest margin",
                    "Cross-sell ratio for new customers"
                ],
                resource_requirements={
                    "product_development": True,
                    "marketing_budget": "Medium",
                    "staff_training": True
                },
                opportunity_addressed="Growing demand for higher-yield savings products",
                revenue_potential=7.5
            ))
        
        # For companies with excess cash reserves
        strategies.append(OpportunityStrategy(
            title="Cash Reserve Optimization Strategy",
            description="Implement a treasury management strategy to maximize returns on cash reserves in the higher interest rate environment.",
            category=RecommendationCategory.OPPORTUNITY,
            priority=RecommendationPriority.MEDIUM,
            timeframe=TimeFrame.SHORT_TERM,
            expected_impact=RecommendationImpact.MEDIUM,
            implementation_complexity=ImplementationComplexity.SIMPLE,
            key_stakeholders=["CFO", "Treasury Team", "Board Finance Committee"],
            implementation_steps=[
                "Analyze current cash management and investment structure",
                "Develop optimal allocation strategy across instruments",
                "Establish tiered liquidity approach (operating, reserve, strategic cash)",
                "Implement laddered term deposit strategy",
                "Set up regular portfolio review process"
            ],
            metrics_to_track=[
                "Effective yield on cash reserves",
                "Yield vs. benchmark comparison",
                "Liquidity coverage ratio",
                "Cash utilization efficiency"
            ],
            resource_requirements={
                "treasury_management_software": True,
                "banking_relationships": True
            },
            opportunity_addressed="Higher returns available on cash reserves",
            revenue_potential=2.5
        ))
        
        # Acquisition opportunities from businesses facing pressure
        if opportunity_level > 0.4:
            strategies.append(OpportunityStrategy(
                title="Strategic Acquisition Program",
                description="Develop a targeted acquisition strategy to identify businesses facing financial pressure that could provide strategic value.",
                category=RecommendationCategory.OPPORTUNITY,
                priority=RecommendationPriority.MEDIUM,
                timeframe=TimeFrame.MEDIUM_TERM,
                expected_impact=RecommendationImpact.HIGH,
                implementation_complexity=ImplementationComplexity.COMPLEX,
                key_stakeholders=["CEO", "Strategy Team", "M&A", "Board of Directors"],
                implementation_steps=[
                    "Define acquisition criteria aligned with strategic goals",
                    "Identify sectors most impacted by interest rate pressure",
                    "Develop target list with preliminary valuation models",
                    "Establish funding approach optimizing current capital structure",
                    "Create post-acquisition integration framework"
                ],
                metrics_to_track=[
                    "Pipeline of qualified acquisition targets",
                    "Expected ROI of acquisition opportunities",
                    "Synergy potential assessment",
                    "Post-acquisition performance vs. model"
                ],
                resource_requirements={
                    "m&a_advisor": True,
                    "due_diligence_team": True,
                    "integration_resources": True
                },
                opportunity_addressed="Acquisition of distressed assets at favorable valuations",
                revenue_potential=15.0
            ))
    
    # Exchange rate scenario opportunities
    elif scenario_type == ScenarioType.EXCHANGE_RATE:
        # AUD depreciation opportunities for exporters
        export_impact = financial_impacts.get("revenue", 0)
        if export_impact > 0:
            strategies.append(OpportunityStrategy(
                title="Export Market Expansion",
                description="Accelerate export market development to capitalize on enhanced price competitiveness from favorable exchange rates.",
                category=RecommendationCategory.OPPORTUNITY,
                priority=RecommendationPriority.HIGH,
                timeframe=TimeFrame.MEDIUM_TERM,
                expected_impact=RecommendationImpact.HIGH,
                implementation_complexity=ImplementationComplexity.MODERATE,
                key_stakeholders=["International Sales", "Marketing", "Product Development", "Logistics"],
                implementation_steps=[
                    "Identify target export markets with highest potential",
                    "Develop market entry or expansion strategies",
                    "Align product offerings with international market needs",
                    "Establish distribution partnerships or direct channels",
                    "Create targeted marketing campaigns highlighting competitive pricing"
                ],
                metrics_to_track=[
                    "Export revenue growth",
                    "Market share in target countries",
                    "Customer acquisition cost by market",
                    "Product margin by market",
                    "Percentage of revenue from exports"
                ],
                resource_requirements={
                    "market_research": True,
                    "international_staff": True,
                    "trade_show_participation": True,
                    "marketing_localization": True
                },
                opportunity_addressed="Improved export competitiveness from favorable exchange rates",
                revenue_potential=12.0
            ))
        
        # AUD appreciation opportunities for importers
        import_impact = financial_impacts.get("cogs", 0)
        if import_impact < 0:  # Negative impact means cost reduction for importers
            strategies.append(OpportunityStrategy(
                title="Strategic Inventory Build",
                description="Accelerate import purchases to build strategic inventory while exchange rates are favorable.",
                category=RecommendationCategory.OPPORTUNITY,
                priority=RecommendationPriority.MEDIUM,
                timeframe=TimeFrame.IMMEDIATE,
                expected_impact=RecommendationImpact.MEDIUM,
                implementation_complexity=ImplementationComplexity.MODERATE,
                key_stakeholders=["Procurement", "Operations", "Finance", "Sales"],
                implementation_steps=[
                    "Identify products with favorable cost dynamics under current exchange rates",
                    "Analyze demand forecasts and storage capacity",
                    "Negotiate volume discounts with international suppliers",
                    "Develop inventory financing strategy if needed",
                    "Implement enhanced inventory management for increased volumes"
                ],
                metrics_to_track=[
                    "Average product cost reduction",
                    "Inventory holding costs",
                    "Cash-to-cash cycle impact",
                    "Gross margin improvement"
                ],
                resource_requirements={
                    "working_capital": "High",
                    "warehouse_capacity": True,
                    "inventory_management": True
                },
                opportunity_addressed="Lower import costs from favorable exchange rates",
                cost_savings_potential=8.5
            ))
    
    # Add more opportunity strategies for other scenario types here...
    
    return strategies

def generate_contingency_plans(
    scenario_id: str, 
    scenario_type: ScenarioType, 
    financial_impacts: Dict[str, float],
    risk_level: float
) -> List[ContingencyPlan]:
    """
    Generate contingency plans for different risk levels and scenarios
    """
    plans = []
    
    # Only generate detailed contingency plans for high-risk scenarios
    if risk_level < 0.5:
        return plans
    
    # Interest rate scenario contingency plans
    if scenario_type == ScenarioType.INTEREST_RATE:
        # Severe cash flow contingency
        cash_flow_impact = financial_impacts.get("cash_flow", 0)
        debt_impact = financial_impacts.get("debt_servicing_cost", 0)
        
        if cash_flow_impact < -5 or debt_impact > 15:
            plans.append(ContingencyPlan(
                name="Severe Cash Flow Constraint Response Plan",
                description="Comprehensive emergency response plan to implement if cash flow constraints threaten operational viability.",
                trigger_conditions=[
                    "Operating cash flow drops below 50% of forecast for two consecutive months",
                    "Interest coverage ratio falls below 1.5x",
                    "Banking covenants are breached or at imminent risk of breach",
                    "Multiple large customers delay payments by >60 days"
                ],
                action_plan=[
                    "Activate cash conservation committee with daily cash position monitoring",
                    "Implement emergency spending protocols requiring executive approval for all expenditures above threshold",
                    "Freeze all non-essential capital expenditures",
                    "Convert select supplier relationships to consignment models",
                    "Negotiate emergency financing facilities with banking partners",
                    "Consider partial divestiture of non-core assets if necessary",
                    "Implement reduced working week or selective staff furlough program"
                ],
                responsible_parties=[
                    "CEO",
                    "CFO",
                    "Business Unit Leaders",
                    "Treasury Team",
                    "Board Finance Committee"
                ],
                communication_plan=[
                    "Prepare stakeholder communication templates for different scenarios",
                    "Establish communication sequence and timing for staff, customers, suppliers, lenders",
                    "Designate authorized spokespersons for different stakeholder groups",
                    "Develop Q&A for customer and supplier inquiries"
                ],
                resource_requirements={
                    "emergency_financing_facility": "Pre-approved credit line of at least 20% of annual operating expenses",
                    "cash_flow_monitoring_system": "Daily cash position reporting capability",
                    "legal_counsel": "For covenant negotiations and potential restructuring advice"
                },
                recovery_time_objective=90  # Days to restore normal operations
            ))
            
            # Debt covenant breach contingency
            plans.append(ContingencyPlan(
                name="Debt Covenant Management Plan",
                description="Response plan for managing potential debt covenant breaches due to interest rate impacts.",
                trigger_conditions=[
                    "Financial metrics within 15% of covenant thresholds",
                    "Two consecutive quarters of declining financial performance",
                    "Interest coverage ratio trending below covenant requirements"
                ],
                action_plan=[
                    "Conduct detailed covenant compliance forecast for next 4 quarters",
                    "Proactively engage with lenders to discuss potential temporary covenant relief",
                    "Prepare covenant waiver or amendment request documentation",
                    "Identify potential asset sales or equity injection options if required",
                    "Develop operational plan specifically targeting metrics affecting covenants",
                    "Consider debt restructuring or refinancing alternatives"
                ],
                responsible_parties=[
                    "CFO",
                    "Treasurer",
                    "Financial Controller",
                    "Legal Counsel",
                    "Board Finance Committee"
                ],
                communication_plan=[
                    "Schedule proactive lender discussions before potential breach",
                    "Prepare comprehensive business plan showing path to covenant compliance",
                    "Develop investor communications if equity raising may be required",
                    "Create internal management reporting focused on covenant metrics"
                ],
                resource_requirements={
                    "financial_modeling": "Detailed covenant compliance model",
                    "banking_relationships": "Strong lender relationships and communication channels",
                    "advisory_support": "Financial and legal advisors for covenant negotiations"
                },
                recovery_time_objective=180  # Days to restore covenant compliance
            ))
    
    # Exchange rate scenario contingency plans
    elif scenario_type == ScenarioType.EXCHANGE_RATE:
        # Severe exchange rate contingency
        margin_impact = financial_impacts.get("gross_margin", 0)
        
        if margin_impact < -5:
            plans.append(ContingencyPlan(
                name="Extreme Exchange Rate Volatility Response",
                description="Emergency response plan for scenarios with extreme currency volatility affecting business viability.",
                trigger_conditions=[
                    "Currency movement exceeds 20% in 30-day period",
                    "Gross margins fall below minimum viability threshold",
                    "Forward exchange contracts cannot be secured at reasonable rates",
                    "Import/export price competitiveness fundamentally altered"
                ],
                action_plan=[
                    "Activate currency crisis management team",
                    "Implement emergency pricing surcharges for affected products/services",
                    "Accelerate sourcing shifts to adjust to new exchange rate reality",
                    "Temporarily suspend fixed-price contracts or trigger force majeure clauses",
                    "Rationalize product lines to focus on those with viable margins",
                    "Accelerate accounts receivable collection and extend payables where possible"
                ],
                responsible_parties=[
                    "CFO",
                    "Sales Director",
                    "Procurement Director",
                    "Legal Counsel",
                    "Executive Committee"
                ],
                communication_plan=[
                    "Prepare customer communications regarding pricing changes",
                    "Develop supplier negotiation strategy and talking points",
                    "Create internal communications explaining business impact and response",
                    "Schedule key client executive meetings to maintain relationships during changes"
                ],
                resource_requirements={
                    "pricing_analysis": "Dynamic pricing model based on exchange rate triggers",
                    "contract_review": "Legal review of all contracts for change clauses",
                    "fx_advisory": "Currency risk management expertise"
                },
                recovery_time_objective=120  # Days to establish new equilibrium
            ))
    
    # Add more contingency plans for other scenarios here...
    
    return plans

def generate_executive_summary(
    scenario: Dict[str, Any],
    risk_level: float,
    opportunity_level: float,
    mitigation_count: int,
    opportunity_count: int
) -> str:
    """
    Generate an executive summary of the strategic response recommendations
    """
    scenario_name = scenario["name"]
    scenario_type = scenario["scenario_type"]
    time_horizon = scenario["time_horizon"]
    
    # Categorize the risk and opportunity levels
    risk_category = "low" if risk_level < 0.3 else "moderate" if risk_level < 0.7 else "high"
    opportunity_category = "limited" if opportunity_level < 0.3 else "moderate" if opportunity_level < 0.7 else "significant"
    
    summary_sections = [
        f"Executive Summary: Strategic Response to {scenario_name}",
        "",
        f"Our analysis of the {scenario_name} scenario indicates a {risk_category} level of risk exposure with {opportunity_category} potential opportunities. "
    ]
    
    # Risk summary section
    if risk_level >= 0.3:
        risk_section = f"To address the {risk_category} risks, we have developed {mitigation_count} mitigation strategies "
        if risk_level >= 0.7:
            risk_section += "that should be implemented urgently to protect financial stability and business continuity. "
            risk_section += "These strategies focus on strengthening the organization's resilience against the most severe potential impacts."
        else:
            risk_section += "that provide a balanced approach to risk management while maintaining operational flexibility. "
            risk_section += "Key priorities focus on preserving cash flow, managing customer relationships, and maintaining competitive positioning."
        summary_sections.append(risk_section)
    
    # Opportunity summary section
    if opportunity_level >= 0.2:
        opportunity_section = f"We have identified {opportunity_count} strategic opportunities arising from this scenario "
        if opportunity_level >= 0.6:
            opportunity_section += "that could provide substantial competitive advantages and growth potential. "
            opportunity_section += "Pursuing these opportunities aggressively could position the organization to outperform competitors during this period of change."
        else:
            opportunity_section += "that could help offset some negative impacts and create incremental value. "
            opportunity_section += "These opportunities represent targeted initiatives that can be pursued with moderate investment and manageable risk."
        summary_sections.append(opportunity_section)
    
    # Contingency planning section if high risk
    if risk_level >= 0.5:
        summary_sections.append("Given the elevated risk profile, we have also developed contingency plans that define clear trigger points and response protocols should conditions deteriorate beyond expectations. These plans provide a structured framework for rapid decision-making during crisis situations.")
    
    # Implementation guidance
    implementation_section = "Implementation should be "
    if risk_level >= 0.7:
        implementation_section += "prioritized immediately with regular progress reviews. We recommend establishing a dedicated scenario response team to coordinate actions across departments."
    elif risk_level >= 0.4 or opportunity_level >= 0.5:
        implementation_section += "phased over the next 1-2 quarters, with high-priority actions initiated within 30 days. Regular monitoring of key metrics will be essential to gauge effectiveness."
    else:
        implementation_section += "incorporated into regular strategic and operational planning cycles, with quarterly reviews to assess changing conditions and response effectiveness."
    summary_sections.append(implementation_section)
    
    # Conclusion
    summary_sections.append("This strategic response framework balances risk mitigation with opportunity capture, providing a comprehensive roadmap for navigating the challenges and possibilities presented by this scenario.")
    
    return "\n\n".join(summary_sections)
