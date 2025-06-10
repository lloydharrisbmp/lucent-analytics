from pydantic import BaseModel, Field
from typing import Dict, List, Optional
from fastapi import APIRouter, HTTPException
import databutton as db

router = APIRouter()

class FinancialRatio(BaseModel):
    name: str
    description: str
    formula: str
    industry_benchmarks: Dict[str, Dict[str, float]] = Field(
        description="Benchmarks by industry, with sub-dictionary containing benchmarks by size (small, medium, large)"
    )
    interpretation: str
    warning_thresholds: Dict[str, float] = Field(
        description="Warning thresholds by industry"
    )
    category: str = Field(
        description="Category of ratio: Profitability, Liquidity, Leverage, Efficiency"
    )

class FailurePattern(BaseModel):
    pattern_name: str
    description: str
    warning_signs: List[str]
    affected_industries: List[str]
    affected_metrics: List[str]
    mitigation_strategies: List[str]

class IndustryBenchmark(BaseModel):
    industry_code: str
    industry_name: str
    small_business: Dict[str, float]
    medium_business: Dict[str, float]
    large_business: Dict[str, float]
    source: str
    year: str

class FinancialHealthResponse(BaseModel):
    ratios: List[FinancialRatio]
    failure_patterns: List[FailurePattern]
    industry_benchmarks: Optional[List[IndustryBenchmark]] = None

# Sample data based on our research
financial_ratios = [
    FinancialRatio(
        name="Gross Profit Margin",
        description="Indicates the percentage of revenue that exceeds the cost of goods sold",
        formula="(Revenue - COGS) / Revenue",
        industry_benchmarks={
            "Retail": {"small": 30.0, "medium": 28.0, "large": 25.0},
            "Manufacturing": {"small": 25.0, "medium": 27.0, "large": 30.0},
            "Construction": {"small": 20.0, "medium": 22.0, "large": 24.0},
            "Healthcare": {"small": 40.0, "medium": 42.0, "large": 45.0},
            "Professional Services": {"small": 60.0, "medium": 65.0, "large": 70.0}
        },
        interpretation="Higher ratios indicate better pricing strategies and cost control",
        warning_thresholds={
            "Retail": 20.0,
            "Manufacturing": 15.0,
            "Construction": 15.0,
            "Healthcare": 30.0,
            "Professional Services": 50.0
        },
        category="Profitability"
    ),
    FinancialRatio(
        name="Net Profit Margin",
        description="Shows the percentage of revenue remaining after all expenses",
        formula="Net Profit / Revenue",
        industry_benchmarks={
            "Retail": {"small": 4.0, "medium": 5.0, "large": 7.0},
            "Manufacturing": {"small": 7.0, "medium": 9.0, "large": 12.0},
            "Construction": {"small": 5.0, "medium": 7.0, "large": 9.0},
            "Healthcare": {"small": 10.0, "medium": 12.0, "large": 15.0},
            "Professional Services": {"small": 15.0, "medium": 20.0, "large": 25.0}
        },
        interpretation="Higher ratios indicate better overall profitability and efficiency",
        warning_thresholds={
            "Retail": 2.0,
            "Manufacturing": 4.0,
            "Construction": 3.0,
            "Healthcare": 7.0,
            "Professional Services": 10.0
        },
        category="Profitability"
    ),
    FinancialRatio(
        name="Return on Assets (ROA)",
        description="Measures how efficiently a company uses its assets to generate profit",
        formula="Net Profit / Total Assets",
        industry_benchmarks={
            "Retail": {"small": 5.0, "medium": 7.0, "large": 9.0},
            "Manufacturing": {"small": 6.0, "medium": 8.0, "large": 10.0},
            "Construction": {"small": 4.0, "medium": 6.0, "large": 8.0},
            "Healthcare": {"small": 8.0, "medium": 10.0, "large": 12.0},
            "Professional Services": {"small": 12.0, "medium": 15.0, "large": 18.0}
        },
        interpretation="Higher ratios indicate better asset utilization",
        warning_thresholds={
            "Retail": 3.0,
            "Manufacturing": 4.0,
            "Construction": 2.0,
            "Healthcare": 5.0,
            "Professional Services": 8.0
        },
        category="Profitability"
    ),
    FinancialRatio(
        name="Return on Equity (ROE)",
        description="Indicates how well a company uses investments to generate earnings growth",
        formula="Net Profit / Shareholders' Equity",
        industry_benchmarks={
            "Retail": {"small": 15.0, "medium": 18.0, "large": 20.0},
            "Manufacturing": {"small": 12.0, "medium": 15.0, "large": 18.0},
            "Construction": {"small": 15.0, "medium": 18.0, "large": 20.0},
            "Healthcare": {"small": 18.0, "medium": 20.0, "large": 22.0},
            "Professional Services": {"small": 20.0, "medium": 25.0, "large": 30.0}
        },
        interpretation="Higher ratios indicate better returns for shareholders",
        warning_thresholds={
            "Retail": 10.0,
            "Manufacturing": 8.0,
            "Construction": 10.0,
            "Healthcare": 12.0,
            "Professional Services": 15.0
        },
        category="Profitability"
    ),
    FinancialRatio(
        name="Current Ratio",
        description="Compares current assets to current liabilities",
        formula="Current Assets / Current Liabilities",
        industry_benchmarks={
            "Retail": {"small": 1.5, "medium": 1.3, "large": 1.2},
            "Manufacturing": {"small": 1.8, "medium": 1.6, "large": 1.5},
            "Construction": {"small": 1.3, "medium": 1.2, "large": 1.1},
            "Healthcare": {"small": 2.0, "medium": 1.8, "large": 1.6},
            "Professional Services": {"small": 2.5, "medium": 2.2, "large": 2.0}
        },
        interpretation="Higher ratios indicate better short-term liquidity",
        warning_thresholds={
            "Retail": 1.0,
            "Manufacturing": 1.2,
            "Construction": 1.0,
            "Healthcare": 1.5,
            "Professional Services": 1.8
        },
        category="Liquidity"
    ),
    FinancialRatio(
        name="Quick Ratio",
        description="Similar to current ratio but excludes inventory",
        formula="(Current Assets - Inventory) / Current Liabilities",
        industry_benchmarks={
            "Retail": {"small": 0.8, "medium": 0.7, "large": 0.6},
            "Manufacturing": {"small": 1.0, "medium": 0.9, "large": 0.8},
            "Construction": {"small": 1.0, "medium": 0.9, "large": 0.8},
            "Healthcare": {"small": 1.8, "medium": 1.6, "large": 1.4},
            "Professional Services": {"small": 2.2, "medium": 2.0, "large": 1.8}
        },
        interpretation="Higher ratios indicate better immediate liquidity",
        warning_thresholds={
            "Retail": 0.5,
            "Manufacturing": 0.7,
            "Construction": 0.7,
            "Healthcare": 1.3,
            "Professional Services": 1.5
        },
        category="Liquidity"
    ),
    FinancialRatio(
        name="Debt to Equity Ratio",
        description="Compares total liabilities to shareholders' equity",
        formula="Total Liabilities / Shareholders' Equity",
        industry_benchmarks={
            "Retail": {"small": 1.5, "medium": 2.0, "large": 2.5},
            "Manufacturing": {"small": 1.2, "medium": 1.5, "large": 2.0},
            "Construction": {"small": 2.0, "medium": 2.5, "large": 3.0},
            "Healthcare": {"small": 1.0, "medium": 1.5, "large": 2.0},
            "Professional Services": {"small": 0.8, "medium": 1.0, "large": 1.5}
        },
        interpretation="Lower ratios indicate less financial risk",
        warning_thresholds={
            "Retail": 3.0,
            "Manufacturing": 2.5,
            "Construction": 3.5,
            "Healthcare": 2.5,
            "Professional Services": 2.0
        },
        category="Leverage"
    ),
    FinancialRatio(
        name="Interest Coverage Ratio",
        description="Measures ability to pay interest on outstanding debt",
        formula="EBIT / Interest Expenses",
        industry_benchmarks={
            "Retail": {"small": 3.0, "medium": 4.0, "large": 5.0},
            "Manufacturing": {"small": 4.0, "medium": 5.0, "large": 6.0},
            "Construction": {"small": 2.5, "medium": 3.0, "large": 4.0},
            "Healthcare": {"small": 5.0, "medium": 6.0, "large": 7.0},
            "Professional Services": {"small": 6.0, "medium": 7.0, "large": 8.0}
        },
        interpretation="Higher ratios indicate better ability to meet interest obligations",
        warning_thresholds={
            "Retail": 1.5,
            "Manufacturing": 2.0,
            "Construction": 1.5,
            "Healthcare": 3.0,
            "Professional Services": 4.0
        },
        category="Leverage"
    ),
    FinancialRatio(
        name="Asset Turnover Ratio",
        description="Indicates how efficiently a company uses assets to generate sales",
        formula="Revenue / Total Assets",
        industry_benchmarks={
            "Retail": {"small": 2.5, "medium": 2.2, "large": 2.0},
            "Manufacturing": {"small": 1.5, "medium": 1.3, "large": 1.2},
            "Construction": {"small": 2.0, "medium": 1.8, "large": 1.5},
            "Healthcare": {"small": 1.0, "medium": 0.9, "large": 0.8},
            "Professional Services": {"small": 1.8, "medium": 1.6, "large": 1.4}
        },
        interpretation="Higher ratios indicate better asset utilization",
        warning_thresholds={
            "Retail": 1.5,
            "Manufacturing": 0.8,
            "Construction": 1.0,
            "Healthcare": 0.6,
            "Professional Services": 1.0
        },
        category="Efficiency"
    ),
    FinancialRatio(
        name="Inventory Turnover Ratio",
        description="Measures how quickly inventory is sold and replaced",
        formula="COGS / Average Inventory",
        industry_benchmarks={
            "Retail": {"small": 8.0, "medium": 10.0, "large": 12.0},
            "Manufacturing": {"small": 6.0, "medium": 8.0, "large": 10.0},
            "Construction": {"small": 5.0, "medium": 6.0, "large": 8.0},
            "Healthcare": {"small": 10.0, "medium": 12.0, "large": 15.0},
            "Professional Services": {"small": 0.0, "medium": 0.0, "large": 0.0}
        },
        interpretation="Higher ratios indicate better inventory management",
        warning_thresholds={
            "Retail": 4.0,
            "Manufacturing": 3.0,
            "Construction": 3.0,
            "Healthcare": 5.0,
            "Professional Services": 0.0
        },
        category="Efficiency"
    )
]

failure_patterns = [
    FailurePattern(
        pattern_name="Cash Flow Crisis",
        description="Inadequate cash flow despite profitability",
        warning_signs=[
            "Declining cash reserves",
            "Increasing days sales outstanding",
            "Inability to pay suppliers on time",
            "Reliance on short-term debt for operations"
        ],
        affected_industries=["Construction", "Retail", "Manufacturing"],
        affected_metrics=["Current Ratio", "Quick Ratio", "Days Sales Outstanding"],
        mitigation_strategies=[
            "Improve invoicing processes",
            "Negotiate better payment terms with suppliers",
            "Implement stricter credit control",
            "Consider factoring or invoice financing"
        ]
    ),
    FailurePattern(
        pattern_name="Strategic Misalignment",
        description="Business strategy not aligned with market conditions or capabilities",
        warning_signs=[
            "Declining market share",
            "High customer acquisition costs",
            "Low customer retention",
            "Consistently missing targets"
        ],
        affected_industries=["Retail", "Technology", "Professional Services"],
        affected_metrics=["Revenue Growth", "Customer Acquisition Cost", "Customer Lifetime Value"],
        mitigation_strategies=[
            "Conduct market research",
            "Review and update business strategy",
            "Invest in customer experience",
            "Consider pivoting to adjacent markets"
        ]
    ),
    FailurePattern(
        pattern_name="Operational Inefficiency",
        description="High operational costs relative to revenue",
        warning_signs=[
            "Declining gross profit margin",
            "Rising overhead costs",
            "Increasing cost of goods sold",
            "Low employee productivity"
        ],
        affected_industries=["Manufacturing", "Hospitality", "Healthcare"],
        affected_metrics=["Gross Profit Margin", "Operating Expense Ratio", "Revenue per Employee"],
        mitigation_strategies=[
            "Implement lean processes",
            "Automate repetitive tasks",
            "Renegotiate supplier contracts",
            "Consider outsourcing non-core functions"
        ]
    ),
    FailurePattern(
        pattern_name="Excessive Leverage",
        description="Unsustainable debt levels relative to earnings",
        warning_signs=[
            "Increasing debt to equity ratio",
            "Declining interest coverage ratio",
            "Deteriorating credit terms",
            "Reliance on refinancing"
        ],
        affected_industries=["Real Estate", "Construction", "Retail"],
        affected_metrics=["Debt to Equity Ratio", "Interest Coverage Ratio", "EBITDA to Debt"],
        mitigation_strategies=[
            "Restructure debt",
            "Sell non-core assets",
            "Consider equity financing",
            "Implement stricter capital allocation processes"
        ]
    ),
    FailurePattern(
        pattern_name="Market Disruption",
        description="Business model rendered obsolete by market changes or competition",
        warning_signs=[
            "Declining customer base",
            "Increasing customer acquisition costs",
            "New competitors with different models",
            "Changing customer preferences"
        ],
        affected_industries=["Retail", "Media", "Technology"],
        affected_metrics=["Market Share", "Revenue Growth", "Customer Retention"],
        mitigation_strategies=[
            "Invest in innovation",
            "Diversify product/service offerings",
            "Consider acquisitions or partnerships",
            "Refocus on core strengths"
        ]
    )
]

industry_benchmarks = [
    IndustryBenchmark(
        industry_code="G",
        industry_name="Retail Trade",
        small_business={
            "Cost of Sales to Turnover": 70.0,
            "Labor to Turnover": 10.0,
            "Rent to Turnover": 8.0,
            "Net Profit Margin": 4.0
        },
        medium_business={
            "Cost of Sales to Turnover": 72.0,
            "Labor to Turnover": 8.0,
            "Rent to Turnover": 6.0,
            "Net Profit Margin": 5.0
        },
        large_business={
            "Cost of Sales to Turnover": 75.0,
            "Labor to Turnover": 6.0,
            "Rent to Turnover": 4.0,
            "Net Profit Margin": 7.0
        },
        source="ATO Small Business Benchmarks",
        year="2024"
    ),
    IndustryBenchmark(
        industry_code="E",
        industry_name="Construction",
        small_business={
            "Cost of Sales to Turnover": 30.0,
            "Labor to Turnover": 40.0,
            "Motor Vehicle to Turnover": 6.0,
            "Net Profit Margin": 5.0
        },
        medium_business={
            "Cost of Sales to Turnover": 35.0,
            "Labor to Turnover": 35.0,
            "Motor Vehicle to Turnover": 5.0,
            "Net Profit Margin": 7.0
        },
        large_business={
            "Cost of Sales to Turnover": 40.0,
            "Labor to Turnover": 30.0,
            "Motor Vehicle to Turnover": 4.0,
            "Net Profit Margin": 9.0
        },
        source="ATO Small Business Benchmarks",
        year="2024"
    ),
    IndustryBenchmark(
        industry_code="C",
        industry_name="Manufacturing",
        small_business={
            "Cost of Sales to Turnover": 55.0,
            "Labor to Turnover": 20.0,
            "Rent to Turnover": 5.0,
            "Net Profit Margin": 7.0
        },
        medium_business={
            "Cost of Sales to Turnover": 58.0,
            "Labor to Turnover": 18.0,
            "Rent to Turnover": 4.0,
            "Net Profit Margin": 9.0
        },
        large_business={
            "Cost of Sales to Turnover": 60.0,
            "Labor to Turnover": 15.0,
            "Rent to Turnover": 3.0,
            "Net Profit Margin": 12.0
        },
        source="ATO Small Business Benchmarks",
        year="2024"
    ),
    IndustryBenchmark(
        industry_code="Q",
        industry_name="Healthcare and Social Assistance",
        small_business={
            "Cost of Sales to Turnover": 25.0,
            "Labor to Turnover": 35.0,
            "Rent to Turnover": 7.0,
            "Net Profit Margin": 10.0
        },
        medium_business={
            "Cost of Sales to Turnover": 20.0,
            "Labor to Turnover": 40.0,
            "Rent to Turnover": 6.0,
            "Net Profit Margin": 12.0
        },
        large_business={
            "Cost of Sales to Turnover": 18.0,
            "Labor to Turnover": 45.0,
            "Rent to Turnover": 5.0,
            "Net Profit Margin": 15.0
        },
        source="ATO Small Business Benchmarks",
        year="2024"
    ),
    IndustryBenchmark(
        industry_code="M",
        industry_name="Professional, Scientific and Technical Services",
        small_business={
            "Cost of Sales to Turnover": 10.0,
            "Labor to Turnover": 45.0,
            "Rent to Turnover": 5.0,
            "Net Profit Margin": 15.0
        },
        medium_business={
            "Cost of Sales to Turnover": 8.0,
            "Labor to Turnover": 50.0,
            "Rent to Turnover": 4.0,
            "Net Profit Margin": 20.0
        },
        large_business={
            "Cost of Sales to Turnover": 5.0,
            "Labor to Turnover": 55.0,
            "Rent to Turnover": 3.0,
            "Net Profit Margin": 25.0
        },
        source="ATO Small Business Benchmarks",
        year="2024"
    )
]

@router.get("/financial-health-indicators-legacy")
def get_financial_health_indicators_legacy() -> FinancialHealthResponse:
    """Get financial health indicators for Australian businesses (legacy endpoint)"""
    return FinancialHealthResponse(
        ratios=financial_ratios,
        failure_patterns=failure_patterns,
        industry_benchmarks=industry_benchmarks
    )

@router.get("/financial-ratios-legacy")
def get_financial_ratios_legacy() -> List[FinancialRatio]:
    """Get financial ratios and their benchmarks (legacy endpoint)"""
    return financial_ratios

@router.get("/failure-patterns-legacy")
def get_failure_patterns_legacy() -> List[FailurePattern]:
    """Get common business failure patterns and warning signs (legacy endpoint)"""
    return failure_patterns

@router.get("/industry-benchmarks-legacy")
def get_industry_benchmarks_legacy() -> List[IndustryBenchmark]:
    """Get industry benchmarks by business size (legacy endpoint)"""
    return industry_benchmarks

@router.get("/industry-benchmarks-legacy/{industry_code}")
def get_industry_benchmark_by_code_legacy(industry_code: str) -> IndustryBenchmark:
    """Get industry benchmarks for a specific industry code (legacy endpoint)"""
    for benchmark in industry_benchmarks:
        if benchmark.industry_code.lower() == industry_code.lower():
            return benchmark
    raise HTTPException(status_code=404, detail="Industry code not found")

@router.get("/financial-ratios-legacy/{category}")
def get_ratios_by_category_legacy(category: str) -> List[FinancialRatio]:
    """Get financial ratios by category (Profitability, Liquidity, Leverage, Efficiency) (legacy endpoint)"""
    filtered_ratios = [ratio for ratio in financial_ratios if ratio.category.lower() == category.lower()]
    if not filtered_ratios:
        raise HTTPException(status_code=404, detail="Category not found")
    return filtered_ratios
