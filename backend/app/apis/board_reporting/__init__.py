from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

router = APIRouter()

class MetricCategory(BaseModel):
    name: str
    description: str
    key_metrics: List[Dict[str, Any]]

class BoardReportingQuery(BaseModel):
    industry: Optional[str] = None
    entity_size: Optional[str] = None  # small, medium, large
    entity_type: Optional[str] = None  # listed, private, not-for-profit
    report_type: Optional[str] = None  # financial, strategic, compliance, risk

class BoardReportingResponse(BaseModel):
    title: str
    description: str
    best_practices: List[Dict[str, str]]
    metric_categories: List[MetricCategory]
    references: List[Dict[str, str]]

@router.post("/best-practices")
def get_board_reporting_best_practices(query: BoardReportingQuery) -> BoardReportingResponse:
    """
    Retrieve best practices for board reporting in Australia based on industry, entity size, type, and report type.
    """
    # Default response with general best practices
    best_practices = [
        {
            "title": "Clear Purpose and Scope",
            "description": "Define the purpose of each report and ensure it addresses the specific information needs of the board."
        },
        {
            "title": "Executive Summary",
            "description": "Begin with a concise executive summary highlighting key points, trends, and decisions required."
        },
        {
            "title": "Forward-Looking Information",
            "description": "Include forward-looking information and analysis, not just historical data."
        },
        {
            "title": "Strategic Context",
            "description": "Frame reporting within the strategic context and objectives of the organization."
        },
        {
            "title": "Balanced Information",
            "description": "Present a balanced view, including both positive and negative information."
        },
        {
            "title": "Data Visualization",
            "description": "Use appropriate visualizations to communicate complex information clearly and efficiently."
        },
        {
            "title": "Benchmarking",
            "description": "Include relevant benchmarks and comparisons against industry standards or competitors."
        },
        {
            "title": "Timeliness",
            "description": "Ensure reports are provided with sufficient time for review before board meetings."
        }
    ]
    
    # Default metric categories
    metric_categories = [
        MetricCategory(
            name="Financial Performance",
            description="Metrics that measure the financial health and performance of the organization",
            key_metrics=[
                {"name": "Revenue Growth", "description": "Year-over-year or quarter-over-quarter revenue growth"},
                {"name": "EBITDA Margin", "description": "Earnings before interest, taxes, depreciation, and amortization as a percentage of revenue"},
                {"name": "Net Profit Margin", "description": "Net profit as a percentage of revenue"},
                {"name": "Return on Equity (ROE)", "description": "Net income as a percentage of shareholders' equity"},
                {"name": "Return on Assets (ROA)", "description": "Net income as a percentage of total assets"},
                {"name": "Working Capital Ratio", "description": "Current assets divided by current liabilities"},
                {"name": "Cash Flow from Operations", "description": "Cash generated from normal business operations"}
            ]
        ),
        MetricCategory(
            name="Strategic Performance",
            description="Metrics that track progress against strategic objectives",
            key_metrics=[
                {"name": "Market Share", "description": "Percentage of total market sales"},
                {"name": "Customer Acquisition Cost", "description": "Cost to acquire a new customer"},
                {"name": "Customer Lifetime Value", "description": "Predicted net profit from the entire future relationship with a customer"},
                {"name": "New Product Revenue", "description": "Revenue generated from products launched in the last X period"},
                {"name": "Strategic Initiative Progress", "description": "Percentage completion of key strategic initiatives"}
            ]
        ),
        MetricCategory(
            name="Operational Performance",
            description="Metrics that measure operational efficiency and effectiveness",
            key_metrics=[
                {"name": "Capacity Utilization", "description": "Percentage of total possible production capacity being utilized"},
                {"name": "On-Time Delivery", "description": "Percentage of deliveries made on time"},
                {"name": "Quality Metrics", "description": "Defect rates, error rates, or customer complaints"},
                {"name": "Inventory Turnover", "description": "Number of times inventory is sold and replaced in a period"},
                {"name": "Employee Productivity", "description": "Output per employee or revenue per employee"}
            ]
        ),
        MetricCategory(
            name="People and Culture",
            description="Metrics related to human resources and organizational culture",
            key_metrics=[
                {"name": "Employee Engagement", "description": "Measure of employee satisfaction and commitment"},
                {"name": "Voluntary Turnover Rate", "description": "Percentage of employees who voluntarily leave the organization"},
                {"name": "Diversity Metrics", "description": "Measures of workforce diversity across various dimensions"},
                {"name": "Training Hours", "description": "Average training hours per employee"},
                {"name": "Internal Promotion Rate", "description": "Percentage of positions filled by internal candidates"}
            ]
        ),
        MetricCategory(
            name="Risk and Compliance",
            description="Metrics that track risk exposure and compliance status",
            key_metrics=[
                {"name": "Risk Exposure", "description": "Quantified exposure to various risk categories"},
                {"name": "Compliance Violations", "description": "Number and severity of compliance violations"},
                {"name": "Audit Findings", "description": "Number and severity of internal and external audit findings"},
                {"name": "Incident Reports", "description": "Number and severity of incidents, accidents, or near-misses"},
                {"name": "Business Continuity", "description": "Readiness for and resilience to business disruptions"}
            ]
        ),
        MetricCategory(
            name="Sustainability",
            description="Metrics related to environmental, social, and governance (ESG) performance",
            key_metrics=[
                {"name": "Carbon Footprint", "description": "Total greenhouse gas emissions"},
                {"name": "Energy Efficiency", "description": "Energy consumption per unit of output"},
                {"name": "Social Impact", "description": "Measures of positive social impact from operations"},
                {"name": "Governance Rating", "description": "External ratings of governance practices"},
                {"name": "Sustainable Supply Chain", "description": "Percentage of suppliers meeting sustainability criteria"}
            ]
        )
    ]
    
    # Default references
    references = [
        {"name": "Australian Institute of Company Directors (AICD)", "url": "https://aicd.companydirectors.com.au/"},
        {"name": "Governance Institute of Australia", "url": "https://www.governanceinstitute.com.au/"},
        {"name": "Australian Securities and Investments Commission (ASIC)", "url": "https://asic.gov.au/"},
        {"name": "ASX Corporate Governance Council", "url": "https://www.asx.com.au/about/corporate-governance-council"}
    ]
    
    # Customize response based on query parameters
    title = "Board Reporting Best Practices in Australia"
    description = "General best practices for effective board reporting in Australian organizations."
    
    # Industry-specific adjustments
    if query.industry:
        if query.industry.lower() == "financial_services":
            title = "Board Reporting Best Practices for Financial Services in Australia"
            description = "Best practices for effective board reporting in Australian financial services organizations."
            metric_categories.append(
                MetricCategory(
                    name="Financial Services Specific Metrics",
                    description="Metrics specifically relevant to financial services organizations",
                    key_metrics=[
                        {"name": "Net Interest Margin", "description": "Net interest income as a percentage of average interest-earning assets"},
                        {"name": "Capital Adequacy Ratio", "description": "Measure of a bank's capital in relation to its risk-weighted assets"},
                        {"name": "Loan Loss Provisions", "description": "Funds set aside to cover potential loan losses"},
                        {"name": "Cost-to-Income Ratio", "description": "Operating costs as a percentage of operating income"},
                        {"name": "Liquidity Coverage Ratio", "description": "Measure of a bank's ability to meet short-term obligations"}
                    ]
                )
            )
            references.append({"name": "Australian Prudential Regulation Authority (APRA)", "url": "https://www.apra.gov.au/"})
        
        elif query.industry.lower() == "healthcare":
            title = "Board Reporting Best Practices for Healthcare in Australia"
            description = "Best practices for effective board reporting in Australian healthcare organizations."
            metric_categories.append(
                MetricCategory(
                    name="Healthcare Specific Metrics",
                    description="Metrics specifically relevant to healthcare organizations",
                    key_metrics=[
                        {"name": "Patient Satisfaction", "description": "Measures of patient experience and satisfaction"},
                        {"name": "Clinical Outcomes", "description": "Measures of clinical effectiveness and patient outcomes"},
                        {"name": "Average Length of Stay", "description": "Average duration of patient hospitalizations"},
                        {"name": "Readmission Rates", "description": "Percentage of patients readmitted within a specified period"},
                        {"name": "Infection Rates", "description": "Rates of healthcare-associated infections"}
                    ]
                )
            )
            references.append({"name": "Australian Commission on Safety and Quality in Health Care", "url": "https://www.safetyandquality.gov.au/"})
    
    # Report type-specific adjustments
    if query.report_type:
        if query.report_type.lower() == "financial":
            best_practices.append(
                {
                    "title": "Variance Analysis",
                    "description": "Include detailed variance analysis explaining significant deviations from budget or forecast."
                }
            )
            best_practices.append(
                {
                    "title": "Cash Flow Focus",
                    "description": "Maintain a strong focus on cash flow, not just profit and loss."
                }
            )
        
        elif query.report_type.lower() == "risk":
            best_practices.append(
                {
                    "title": "Risk Appetite Alignment",
                    "description": "Ensure risk reporting is aligned with the organization's risk appetite statement."
                }
            )
            best_practices.append(
                {
                    "title": "Emerging Risks",
                    "description": "Include information on emerging risks and their potential impact."
                }
            )
        
        elif query.report_type.lower() == "compliance":
            best_practices.append(
                {
                    "title": "Regulatory Changes",
                    "description": "Highlight changes in the regulatory environment and their impact on the organization."
                }
            )
            best_practices.append(
                {
                    "title": "Compliance Metrics",
                    "description": "Include specific metrics on compliance status and breaches."
                }
            )
        
        elif query.report_type.lower() == "strategic":
            best_practices.append(
                {
                    "title": "Strategic Alignment",
                    "description": "Clearly link all reporting to strategic priorities and objectives."
                }
            )
            best_practices.append(
                {
                    "title": "Market Analysis",
                    "description": "Include relevant market and competitive analysis to provide context."
                }
            )
    
    # Entity type-specific adjustments
    if query.entity_type:
        if query.entity_type.lower() == "listed":
            best_practices.append(
                {
                    "title": "Continuous Disclosure Alignment",
                    "description": "Ensure board reporting aligns with continuous disclosure obligations."
                }
            )
            best_practices.append(
                {
                    "title": "Shareholder Analysis",
                    "description": "Include analysis of shareholder composition and engagement."
                }
            )
        
        elif query.entity_type.lower() == "not-for-profit":
            title = "Board Reporting Best Practices for Not-for-Profit Organizations in Australia"
            description = "Best practices for effective board reporting in Australian not-for-profit organizations."
            
            best_practices.append(
                {
                    "title": "Mission Impact",
                    "description": "Focus on reporting that demonstrates impact in relation to mission and purpose."
                }
            )
            best_practices.append(
                {
                    "title": "Stakeholder Reporting",
                    "description": "Include information on engagement with key stakeholders including beneficiaries and donors."
                }
            )
            
            metric_categories.append(
                MetricCategory(
                    name="Not-for-Profit Specific Metrics",
                    description="Metrics specifically relevant to not-for-profit organizations",
                    key_metrics=[
                        {"name": "Program Efficiency", "description": "Ratio of program expenses to total expenses"},
                        {"name": "Fundraising Efficiency", "description": "Cost to raise a dollar"},
                        {"name": "Mission Impact", "description": "Measures of impact related to mission and purpose"},
                        {"name": "Volunteer Engagement", "description": "Measures of volunteer recruitment, retention, and satisfaction"},
                        {"name": "Donor Retention", "description": "Percentage of donors who continue to give year over year"}
                    ]
                )
            )
            
            references.append({"name": "Australian Charities and Not-for-profits Commission (ACNC)", "url": "https://www.acnc.gov.au/"})
    
    # Entity size-specific adjustments
    if query.entity_size:
        if query.entity_size.lower() == "small":
            title = "Board Reporting Best Practices for Small Organizations in Australia"
            description = "Best practices for effective board reporting in small Australian organizations with limited resources."
            
            best_practices.append(
                {
                    "title": "Focused Reporting",
                    "description": "Keep reporting concise and focused on critical metrics due to limited resources."
                }
            )
            best_practices.append(
                {
                    "title": "Growth Metrics",
                    "description": "Include metrics that track growth and scalability potential."
                }
            )
        
        elif query.entity_size.lower() == "large":
            title = "Board Reporting Best Practices for Large Organizations in Australia"
            description = "Best practices for effective board reporting in large Australian organizations with complex operations."
            
            best_practices.append(
                {
                    "title": "Divisional Integration",
                    "description": "Ensure reporting integrates information from multiple divisions or business units in a cohesive way."
                }
            )
            best_practices.append(
                {
                    "title": "Governance Structure Alignment",
                    "description": "Align reporting with the organization's governance structure, including board committees."
                }
            )
    
    return BoardReportingResponse(
        title=title,
        description=description,
        best_practices=best_practices,
        metric_categories=metric_categories,
        references=references
    )
