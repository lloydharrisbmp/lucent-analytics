from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

router = APIRouter()

class MetricDetail(BaseModel):
    name: str
    description: str
    calculation: Optional[str] = None
    importance: str
    typical_target: Optional[str] = None

class MetricCategory(BaseModel):
    category: str
    description: str
    metrics: List[MetricDetail]

class MetricsQuery(BaseModel):
    entity_type: Optional[str] = None  # company, trust, partnership, NFP
    company_size: Optional[str] = None  # small, medium, large, listed
    industry: Optional[str] = None
    governance_area: Optional[str] = None  # board, financial, risk, compliance, sustainability

class GovernanceMetricsResponse(BaseModel):
    title: str
    description: str
    metric_categories: List[MetricCategory]
    references: List[Dict[str, str]]

@router.post("/key-metrics")
def get_governance_metrics(query: MetricsQuery) -> GovernanceMetricsResponse:
    """
    Retrieve key governance and reporting metrics based on entity type, size, industry, and governance area.
    """
    # Default title and description
    title = "Key Corporate Governance Metrics"
    description = "Essential metrics for monitoring and reporting on corporate governance performance."
    
    # Default references
    references = [
        {"name": "Australian Institute of Company Directors (AICD)", "url": "https://aicd.companydirectors.com.au/"},
        {"name": "Governance Institute of Australia", "url": "https://www.governanceinstitute.com.au/"},
        {"name": "Australian Securities and Investments Commission (ASIC)", "url": "https://asic.gov.au/"},
        {"name": "ASX Corporate Governance Council", "url": "https://www.asx.com.au/about/corporate-governance-council"}
    ]
    
    # Define metric categories based on query
    metric_categories = []
    
    # Board effectiveness metrics
    if not query.governance_area or query.governance_area.lower() == "board":
        metric_categories.append(
            MetricCategory(
                category="Board Effectiveness",
                description="Metrics to evaluate board performance and effectiveness",
                metrics=[
                    MetricDetail(
                        name="Board Meeting Attendance",
                        description="Percentage of board meetings attended by each director",
                        calculation="Number of meetings attended / Total number of meetings",
                        importance="High attendance indicates engaged directors and proper oversight",
                        typical_target=">90%"
                    ),
                    MetricDetail(
                        name="Board Skills Matrix Coverage",
                        description="Assessment of how well the current board skills cover the required skills matrix",
                        calculation="Assessment of skills present vs. skills required (usually qualitative)",
                        importance="Ensures the board has the right mix of skills and experience",
                        typical_target="No significant gaps in required skills"
                    ),
                    MetricDetail(
                        name="Board Independence Ratio",
                        description="Proportion of independent directors on the board",
                        calculation="Number of independent directors / Total number of directors",
                        importance="Higher independence can lead to better oversight and reduced conflicts of interest",
                        typical_target=">50% for listed companies"
                    ),
                    MetricDetail(
                        name="Board Diversity Metrics",
                        description="Measures of diversity across various dimensions (gender, age, ethnicity, etc.)",
                        calculation="Various percentages and ratios based on board composition",
                        importance="Diverse boards often make better decisions and consider wider perspectives",
                        typical_target="Varies by organization and industry"
                    ),
                    MetricDetail(
                        name="Board Evaluation Scores",
                        description="Results from annual board performance evaluations",
                        calculation="Typically based on structured assessment frameworks",
                        importance="Identifies strengths and areas for improvement in board performance",
                        typical_target="Improvement year-over-year"
                    )
                ]
            )
        )
    
    # Financial governance metrics
    if not query.governance_area or query.governance_area.lower() == "financial":
        metric_categories.append(
            MetricCategory(
                category="Financial Governance",
                description="Metrics related to financial oversight and reporting quality",
                metrics=[
                    MetricDetail(
                        name="Audit Committee Meeting Frequency",
                        description="Number of audit committee meetings per year",
                        importance="Regular meetings indicate proper oversight of financial reporting",
                        typical_target="4-6 meetings per year"
                    ),
                    MetricDetail(
                        name="Financial Statement Restatements",
                        description="Number of financial statement restatements in recent years",
                        importance="Fewer restatements indicate higher quality financial reporting",
                        typical_target="0"
                    ),
                    MetricDetail(
                        name="Material Weaknesses in Internal Controls",
                        description="Number of material weaknesses identified in internal controls",
                        importance="Indicates the quality of financial processes and controls",
                        typical_target="0"
                    ),
                    MetricDetail(
                        name="Variance Between Budget and Actual Results",
                        description="Percentage variance between budgeted and actual financial results",
                        calculation="(Actual - Budget) / Budget × 100%",
                        importance="Indicates quality of financial planning and execution",
                        typical_target="<5%"
                    ),
                    MetricDetail(
                        name="Time to Close Books",
                        description="Number of days required to close the financial books after period end",
                        importance="Efficient closing processes indicate strong financial management",
                        typical_target="<10 business days"
                    )
                ]
            )
        )
    
    # Risk governance metrics
    if not query.governance_area or query.governance_area.lower() == "risk":
        metric_categories.append(
            MetricCategory(
                category="Risk Governance",
                description="Metrics related to risk management and oversight",
                metrics=[
                    MetricDetail(
                        name="Risk Policy Review Frequency",
                        description="How often risk policies and frameworks are reviewed and updated",
                        importance="Regular reviews ensure risk policies remain relevant",
                        typical_target="Annually"
                    ),
                    MetricDetail(
                        name="Risk Appetite Statement Compliance",
                        description="Percentage of risk metrics within defined risk appetite",
                        calculation="Number of metrics within appetite / Total number of risk metrics",
                        importance="Indicates adherence to established risk tolerance levels",
                        typical_target=">90%"
                    ),
                    MetricDetail(
                        name="Risk Incident Reporting",
                        description="Number and severity of risk incidents reported",
                        importance="Tracks actual risk events and response effectiveness",
                        typical_target="Trending downward"
                    ),
                    MetricDetail(
                        name="Risk Training Completion",
                        description="Percentage of staff who have completed required risk training",
                        calculation="Staff completed training / Total staff required to complete training",
                        importance="Indicates risk awareness throughout the organization",
                        typical_target="100%"
                    ),
                    MetricDetail(
                        name="Emerging Risk Assessment",
                        description="Frequency and quality of emerging risk assessments",
                        importance="Demonstrates forward-looking risk management",
                        typical_target="Quarterly assessments"
                    )
                ]
            )
        )
    
    # Compliance metrics
    if not query.governance_area or query.governance_area.lower() == "compliance":
        metric_categories.append(
            MetricCategory(
                category="Compliance",
                description="Metrics related to regulatory compliance and governance requirements",
                metrics=[
                    MetricDetail(
                        name="Compliance Breaches",
                        description="Number and severity of compliance breaches",
                        importance="Indicates effectiveness of compliance program",
                        typical_target="0 material breaches"
                    ),
                    MetricDetail(
                        name="Regulatory Audit Findings",
                        description="Number and severity of findings from regulatory audits",
                        importance="Direct feedback from regulators on compliance",
                        typical_target="0 material findings"
                    ),
                    MetricDetail(
                        name="Compliance Training Completion",
                        description="Percentage of staff who have completed required compliance training",
                        calculation="Staff completed training / Total staff required to complete training",
                        importance="Indicates compliance awareness throughout the organization",
                        typical_target="100%"
                    ),
                    MetricDetail(
                        name="Time to Remediate Compliance Issues",
                        description="Average time to resolve identified compliance issues",
                        importance="Indicates responsiveness to compliance problems",
                        typical_target="Varies by severity, but trending downward"
                    ),
                    MetricDetail(
                        name="Whistleblower Reports",
                        description="Number and types of whistleblower reports received and investigated",
                        importance="Indicates effectiveness of speak-up culture and investigation processes",
                        typical_target="All reports properly investigated"
                    )
                ]
            )
        )
    
    # Sustainability metrics
    if not query.governance_area or query.governance_area.lower() == "sustainability":
        metric_categories.append(
            MetricCategory(
                category="Sustainability Governance",
                description="Metrics related to environmental, social, and governance (ESG) performance",
                metrics=[
                    MetricDetail(
                        name="Carbon Emissions",
                        description="Total greenhouse gas emissions and trends",
                        calculation="Typically measured in tonnes of CO2 equivalent",
                        importance="Key indicator of environmental impact",
                        typical_target="Reduction targets aligned with industry standards"
                    ),
                    MetricDetail(
                        name="Gender Pay Gap",
                        description="Difference in average pay between men and women",
                        calculation="(Average male salary - Average female salary) / Average male salary × 100%",
                        importance="Indicates commitment to workplace equality",
                        typical_target="<5% and trending toward 0%"
                    ),
                    MetricDetail(
                        name="Workplace Health and Safety Incidents",
                        description="Number and severity of workplace injuries and incidents",
                        importance="Indicates effectiveness of safety programs",
                        typical_target="Zero serious incidents"
                    ),
                    MetricDetail(
                        name="Community Investment",
                        description="Amount invested in community programs and initiatives",
                        calculation="Typically measured as a percentage of profit or revenue",
                        importance="Indicates commitment to social responsibility",
                        typical_target="Varies by industry and organization"
                    ),
                    MetricDetail(
                        name="ESG Rating",
                        description="Ratings from external ESG rating agencies",
                        importance="External validation of ESG performance",
                        typical_target="Above industry average"
                    )
                ]
            )
        )
    
    # Stakeholder communication metrics always included
    metric_categories.append(
        MetricCategory(
            category="Stakeholder Communication",
            description="Metrics related to communication with shareholders and other stakeholders",
            metrics=[
                MetricDetail(
                    name="Shareholder Engagement Rate",
                    description="Percentage of shareholders participating in AGMs or responding to communications",
                    calculation="Number of shareholders engaged / Total number of shareholders",
                    importance="Indicates effectiveness of shareholder communication strategies",
                    typical_target=">50% and trending upward"
                ),
                MetricDetail(
                    name="Analyst Coverage",
                    description="Number of analysts covering the company (for listed entities)",
                    importance="Broader coverage increases information availability to the market",
                    typical_target="Appropriate for company size and industry"
                ),
                MetricDetail(
                    name="Media Sentiment",
                    description="Sentiment analysis of media coverage of the organization",
                    importance="Indicates public perception and communication effectiveness",
                    typical_target="Neutral to positive"
                ),
                MetricDetail(
                    name="Investor Relations Response Time",
                    description="Average time to respond to investor inquiries",
                    importance="Indicates responsiveness to investor concerns",
                    typical_target="<48 hours"
                ),
                MetricDetail(
                    name="Corporate Communications Effectiveness",
                    description="Measured through surveys of key stakeholders on clarity and usefulness of communications",
                    importance="Indicates whether communications are meeting stakeholder needs",
                    typical_target=">80% satisfaction"
                )
            ]
        )
    )
    
    # Adjustments based on entity type
    if query.entity_type:
        if query.entity_type.lower() == "nfp" or query.entity_type.lower() == "not-for-profit":
            title = "Key Governance Metrics for Not-for-Profit Organizations"
            description = "Essential metrics for monitoring and reporting on governance performance in not-for-profit organizations."
            
            # Add NFP-specific metrics
            metric_categories.append(
                MetricCategory(
                    category="Mission Effectiveness",
                    description="Metrics related to achievement of organizational mission and purpose",
                    metrics=[
                        MetricDetail(
                            name="Mission Alignment of Activities",
                            description="Assessment of how well activities align with organizational mission",
                            importance="Ensures focus on core purpose",
                            typical_target="High alignment across all activities"
                        ),
                        MetricDetail(
                            name="Program Outcomes and Impact",
                            description="Measures of program effectiveness and impact",
                            importance="Demonstrates achievement of mission",
                            typical_target="Positive trend in impact metrics"
                        ),
                        MetricDetail(
                            name="Stakeholder Satisfaction",
                            description="Satisfaction levels of key stakeholders (beneficiaries, donors, etc.)",
                            importance="Indicates effectiveness in meeting stakeholder needs",
                            typical_target=">80% satisfaction"
                        ),
                        MetricDetail(
                            name="Administrative Cost Ratio",
                            description="Percentage of expenses used for administration versus programs",
                            calculation="Administrative expenses / Total expenses × 100%",
                            importance="Indicates efficiency in resource allocation",
                            typical_target="<15-20%"
                        ),
                        MetricDetail(
                            name="Fundraising Efficiency",
                            description="Return on investment for fundraising activities",
                            calculation="Funds raised / Cost of fundraising",
                            importance="Indicates effectiveness of fundraising efforts",
                            typical_target=">3:1 ratio"
                        )
                    ]
                )
            )
            
            references.append({"name": "Australian Charities and Not-for-profits Commission (ACNC)", "url": "https://www.acnc.gov.au/"})
    
    # Adjustments based on company size
    if query.company_size and query.company_size.lower() == "listed":
        title = "Key Corporate Governance Metrics for Listed Companies"
        description = "Essential metrics for monitoring and reporting on corporate governance performance in listed companies."
        
        # Add listed company-specific metrics
        metric_categories.append(
            MetricCategory(
                category="Market and Shareholder Metrics",
                description="Metrics related to market performance and shareholder engagement",
                metrics=[
                    MetricDetail(
                        name="Total Shareholder Return",
                        description="Combination of share price appreciation and dividends",
                        calculation="(End price - Start price + Dividends) / Start price × 100%",
                        importance="Key measure of shareholder value creation",
                        typical_target="Above market or sector average"
                    ),
                    MetricDetail(
                        name="Dividend Payout Ratio",
                        description="Proportion of earnings paid out as dividends",
                        calculation="Dividends paid / Net income × 100%",
                        importance="Indicates balance between returning capital and reinvestment",
                        typical_target="Varies by industry and growth phase"
                    ),
                    MetricDetail(
                        name="Shareholder Voting Patterns",
                        description="Voting results on key resolutions at general meetings",
                        importance="Indicates shareholder sentiment and engagement",
                        typical_target="Strong support for board recommendations"
                    ),
                    MetricDetail(
                        name="Analyst Coverage",
                        description="Number of analysts covering the company",
                        importance="Indicates market interest and information availability",
                        typical_target="Appropriate for company size and industry"
                    ),
                    MetricDetail(
                        name="Proxy Advisor Recommendations",
                        description="Recommendations from proxy advisory firms on key votes",
                        importance="Influences institutional shareholder voting",
                        typical_target="Favorable recommendations"
                    )
                ]
            )
        )
    
    # Adjust for industry specifics if needed
    if query.industry and query.industry.lower() == "financial_services":
        references.append({"name": "Australian Prudential Regulation Authority (APRA)", "url": "https://www.apra.gov.au/"})
        
        # Add financial services-specific metrics
        metric_categories.append(
            MetricCategory(
                category="Financial Services Governance",
                description="Metrics specifically relevant to governance in financial services organizations",
                metrics=[
                    MetricDetail(
                        name="Regulatory Capital Adequacy",
                        description="Measures of capital adequacy relative to regulatory requirements",
                        importance="Critical for financial stability and regulatory compliance",
                        typical_target="Above regulatory minimums with buffer"
                    ),
                    MetricDetail(
                        name="Conduct Risk Incidents",
                        description="Number and severity of conduct risk incidents",
                        importance="Indicates effectiveness of conduct risk management",
                        typical_target="Zero material incidents"
                    ),
                    MetricDetail(
                        name="Customer Complaints",
                        description="Number, type, and resolution time for customer complaints",
                        importance="Indicator of fair treatment of customers",
                        typical_target="Low and trending downward"
                    ),
                    MetricDetail(
                        name="Financial Crime Metrics",
                        description="Measures related to fraud, money laundering, etc.",
                        importance="Indicates effectiveness of financial crime controls",
                        typical_target="Strong detection and prevention metrics"
                    ),
                    MetricDetail(
                        name="Responsible Lending Metrics",
                        description="Measures of lending practices and outcomes",
                        importance="Indicates adherence to responsible lending principles",
                        typical_target="Low levels of delinquency and hardship"
                    )
                ]
            )
        )
    
    return GovernanceMetricsResponse(
        title=title,
        description=description,
        metric_categories=metric_categories,
        references=references
    )
