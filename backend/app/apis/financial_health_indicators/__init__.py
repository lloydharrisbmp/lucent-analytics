from pydantic import BaseModel
from typing import Dict, List, Optional
from fastapi import APIRouter, HTTPException

router = APIRouter()


class FinancialRatio(BaseModel):
    name: str
    description: str
    formula: str
    industry_benchmarks: Dict[str, Dict[str, float]]
    interpretation: str
    warning_thresholds: Dict[str, float]
    category: str


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
    industry_benchmarks: List[IndustryBenchmark]


@router.get("/financial-health-indicators")
def get_financial_health_indicators() -> FinancialHealthResponse:
    """
    Get comprehensive Australian financial health indicators including ratios, benchmarks, and failure patterns.
    """
    # Financial ratios organized by category
    ratios = [
        # Profitability Ratios
        FinancialRatio(
            name="Gross Profit Margin",
            description="Measures the percentage of revenue that exceeds the cost of goods sold",
            formula="(Revenue - Cost of Goods Sold) / Revenue × 100",
            industry_benchmarks={
                "Retail Trade": {"small": 42.5, "medium": 38.2, "large": 35.8},
                "Construction": {"small": 29.4, "medium": 26.7, "large": 24.5},
                "Manufacturing": {"small": 31.6, "medium": 33.8, "large": 36.2},
                "Professional Services": {"small": 65.3, "medium": 61.5, "large": 58.7},
                "Healthcare": {"small": 58.7, "medium": 54.3, "large": 52.1}
            },
            interpretation="Higher values indicate better pricing strategies, purchasing policies, or manufacturing efficiency",
            warning_thresholds={
                "Retail Trade": 25.0,
                "Construction": 18.0,
                "Manufacturing": 20.0,
                "Professional Services": 40.0,
                "Healthcare": 35.0
            },
            category="Profitability"
        ),
        FinancialRatio(
            name="Net Profit Margin",
            description="Shows how much of each dollar collected as revenue translates into profit",
            formula="Net Profit / Revenue × 100",
            industry_benchmarks={
                "Retail Trade": {"small": 4.5, "medium": 3.8, "large": 3.2},
                "Construction": {"small": 7.1, "medium": 6.3, "large": 5.8},
                "Manufacturing": {"small": 8.2, "medium": 7.5, "large": 6.9},
                "Professional Services": {"small": 15.3, "medium": 13.7, "large": 12.4},
                "Healthcare": {"small": 11.2, "medium": 9.8, "large": 8.5}
            },
            interpretation="Indicates overall financial health and business model sustainability",
            warning_thresholds={
                "Retail Trade": 2.0,
                "Construction": 3.5,
                "Manufacturing": 4.0,
                "Professional Services": 8.0,
                "Healthcare": 6.0
            },
            category="Profitability"
        ),
        FinancialRatio(
            name="Return on Assets (ROA)",
            description="Measures how efficiently a business uses its assets to generate profits",
            formula="Net Profit / Total Assets × 100",
            industry_benchmarks={
                "Retail Trade": {"small": 7.8, "medium": 6.9, "large": 6.2},
                "Construction": {"small": 9.3, "medium": 8.1, "large": 7.4},
                "Manufacturing": {"small": 8.9, "medium": 7.8, "large": 7.2},
                "Professional Services": {"small": 18.4, "medium": 16.2, "large": 14.5},
                "Healthcare": {"small": 13.5, "medium": 11.7, "large": 10.2}
            },
            interpretation="Higher values indicate better asset utilization",
            warning_thresholds={
                "Retail Trade": 4.0,
                "Construction": 5.0,
                "Manufacturing": 4.5,
                "Professional Services": 9.0,
                "Healthcare": 7.0
            },
            category="Profitability"
        ),
        # Liquidity Ratios
        FinancialRatio(
            name="Current Ratio",
            description="Measures the ability to pay short-term obligations",
            formula="Current Assets / Current Liabilities",
            industry_benchmarks={
                "Retail Trade": {"small": 1.8, "medium": 1.6, "large": 1.4},
                "Construction": {"small": 1.5, "medium": 1.3, "large": 1.2},
                "Manufacturing": {"small": 2.1, "medium": 1.9, "large": 1.7},
                "Professional Services": {"small": 2.4, "medium": 2.2, "large": 2.0},
                "Healthcare": {"small": 2.2, "medium": 2.0, "large": 1.8}
            },
            interpretation="Values below 1 indicate negative working capital; generally 1.5-2.0 is considered healthy",
            warning_thresholds={
                "Retail Trade": 1.2,
                "Construction": 1.1,
                "Manufacturing": 1.3,
                "Professional Services": 1.5,
                "Healthcare": 1.4
            },
            category="Liquidity"
        ),
        FinancialRatio(
            name="Quick Ratio",
            description="More stringent measure of short-term liquidity that excludes inventory",
            formula="(Current Assets - Inventory) / Current Liabilities",
            industry_benchmarks={
                "Retail Trade": {"small": 0.8, "medium": 0.7, "large": 0.6},
                "Construction": {"small": 1.2, "medium": 1.1, "large": 1.0},
                "Manufacturing": {"small": 1.1, "medium": 1.0, "large": 0.9},
                "Professional Services": {"small": 2.2, "medium": 2.0, "large": 1.8},
                "Healthcare": {"small": 1.8, "medium": 1.6, "large": 1.5}
            },
            interpretation="Ratio of 1.0 or higher indicates good short-term financial strength",
            warning_thresholds={
                "Retail Trade": 0.5,
                "Construction": 0.8,
                "Manufacturing": 0.7,
                "Professional Services": 1.2,
                "Healthcare": 1.0
            },
            category="Liquidity"
        ),
        FinancialRatio(
            name="Cash Ratio",
            description="Most conservative liquidity ratio, considering only cash and cash equivalents",
            formula="(Cash + Cash Equivalents) / Current Liabilities",
            industry_benchmarks={
                "Retail Trade": {"small": 0.4, "medium": 0.3, "large": 0.25},
                "Construction": {"small": 0.5, "medium": 0.4, "large": 0.35},
                "Manufacturing": {"small": 0.6, "medium": 0.5, "large": 0.4},
                "Professional Services": {"small": 1.2, "medium": 1.0, "large": 0.9},
                "Healthcare": {"small": 0.8, "medium": 0.7, "large": 0.6}
            },
            interpretation="Measures ability to cover short-term liabilities with immediate cash resources",
            warning_thresholds={
                "Retail Trade": 0.2,
                "Construction": 0.25,
                "Manufacturing": 0.3,
                "Professional Services": 0.6,
                "Healthcare": 0.4
            },
            category="Liquidity"
        ),
        # Leverage Ratios
        FinancialRatio(
            name="Debt-to-Equity Ratio",
            description="Measures the proportion of debt compared to equity",
            formula="Total Debt / Total Equity",
            industry_benchmarks={
                "Retail Trade": {"small": 1.2, "medium": 1.5, "large": 1.8},
                "Construction": {"small": 1.8, "medium": 2.1, "large": 2.4},
                "Manufacturing": {"small": 1.5, "medium": 1.7, "large": 2.0},
                "Professional Services": {"small": 0.8, "medium": 1.1, "large": 1.3},
                "Healthcare": {"small": 1.0, "medium": 1.3, "large": 1.6}
            },
            interpretation="Higher values indicate greater financial risk and lower borrowing capacity",
            warning_thresholds={
                "Retail Trade": 2.5,
                "Construction": 3.0,
                "Manufacturing": 2.5,
                "Professional Services": 2.0,
                "Healthcare": 2.2
            },
            category="Leverage"
        ),
        FinancialRatio(
            name="Interest Coverage Ratio",
            description="Measures how easily a company can pay interest on its outstanding debt",
            formula="EBIT / Interest Expense",
            industry_benchmarks={
                "Retail Trade": {"small": 3.5, "medium": 3.0, "large": 2.8},
                "Construction": {"small": 3.2, "medium": 2.8, "large": 2.5},
                "Manufacturing": {"small": 4.0, "medium": 3.5, "large": 3.2},
                "Professional Services": {"small": 5.2, "medium": 4.8, "large": 4.5},
                "Healthcare": {"small": 4.5, "medium": 4.0, "large": 3.7}
            },
            interpretation="Higher values indicate stronger debt servicing capability",
            warning_thresholds={
                "Retail Trade": 1.5,
                "Construction": 1.5,
                "Manufacturing": 2.0,
                "Professional Services": 2.5,
                "Healthcare": 2.0
            },
            category="Leverage"
        ),
        # Efficiency Ratios
        FinancialRatio(
            name="Inventory Turnover",
            description="Measures how quickly inventory is sold and replaced",
            formula="Cost of Goods Sold / Average Inventory",
            industry_benchmarks={
                "Retail Trade": {"small": 8.5, "medium": 10.2, "large": 12.5},
                "Construction": {"small": 6.8, "medium": 8.3, "large": 10.1},
                "Manufacturing": {"small": 7.2, "medium": 8.5, "large": 10.3},
                "Professional Services": {"small": 0.0, "medium": 0.0, "large": 0.0},
                "Healthcare": {"small": 12.5, "medium": 14.8, "large": 16.5}
            },
            interpretation="Higher values indicate efficient inventory management",
            warning_thresholds={
                "Retail Trade": 4.0,
                "Construction": 3.5,
                "Manufacturing": 4.0,
                "Professional Services": 0.0,
                "Healthcare": 8.0
            },
            category="Efficiency"
        ),
        FinancialRatio(
            name="Accounts Receivable Turnover",
            description="Measures how quickly a company collects payment from customers",
            formula="Net Credit Sales / Average Accounts Receivable",
            industry_benchmarks={
                "Retail Trade": {"small": 12.5, "medium": 13.8, "large": 15.2},
                "Construction": {"small": 8.2, "medium": 9.5, "large": 10.8},
                "Manufacturing": {"small": 9.5, "medium": 10.7, "large": 12.1},
                "Professional Services": {"small": 6.8, "medium": 7.5, "large": 8.3},
                "Healthcare": {"small": 7.5, "medium": 8.7, "large": 9.8}
            },
            interpretation="Higher values indicate efficient collection of outstanding invoices",
            warning_thresholds={
                "Retail Trade": 8.0,
                "Construction": 5.0,
                "Manufacturing": 6.0,
                "Professional Services": 4.0,
                "Healthcare": 5.0
            },
            category="Efficiency"
        ),
    ]
    
    # Common failure patterns in Australian businesses
    failure_patterns = [
        FailurePattern(
            pattern_name="Cash Flow Crisis",
            description="Persistent negative operating cash flow despite reported profits, often due to poor receivables management, excessive inventory, or unrealistic growth rates",
            warning_signs=[
                "Consistently negative operating cash flow",
                "Extending payables beyond terms",
                "Using tax payments to fund operations",
                "Declining current ratio over multiple periods",
                "Increasing day sales outstanding ratio"
            ],
            affected_industries=[
                "Construction",
                "Retail Trade",
                "Manufacturing"
            ],
            affected_metrics=[
                "Current Ratio",
                "Quick Ratio",
                "Cash Ratio",
                "Days Sales Outstanding"
            ],
            mitigation_strategies=[
                "Implement strict credit control procedures",
                "Optimize inventory management",
                "Negotiate better supplier terms",
                "Consider invoice factoring for immediate cash flow",
                "Develop rolling 13-week cash flow forecasts"
            ]
        ),
        FailurePattern(
            pattern_name="Unsustainable Debt Burden",
            description="Excessive leverage relative to earnings capacity, often accompanied by declining interest coverage ratios and increasing financial stress",
            warning_signs=[
                "Debt-to-EBITDA ratio exceeding industry norms",
                "Interest coverage ratio below 1.5",
                "Refinancing existing debt to extend terms",
                "Using new debt to pay existing obligations",
                "Increasing reliance on non-traditional financing"
            ],
            affected_industries=[
                "Real Estate",
                "Construction",
                "Manufacturing",
                "Retail Trade"
            ],
            affected_metrics=[
                "Debt-to-Equity Ratio",
                "Interest Coverage Ratio",
                "Debt-to-EBITDA Ratio"
            ],
            mitigation_strategies=[
                "Restructure debt to better match cash flow timing",
                "Consider debt-to-equity conversion",
                "Implement strict capital expenditure controls",
                "Develop asset rationalization strategy",
                "Consider sale and leaseback arrangements"
            ]
        ),
        FailurePattern(
            pattern_name="Revenue Concentration Risk",
            description="Excessive dependence on a small number of customers, suppliers, or products, creating vulnerability to external shocks",
            warning_signs=[
                "More than 20-30% of revenue from a single customer",
                "High switching costs for customers",
                "Declining industry or niche market share",
                "Increasing customer acquisition costs",
                "Emergence of disruptive competitors"
            ],
            affected_industries=[
                "Professional Services",
                "Information Technology",
                "Construction",
                "Manufacturing"
            ],
            affected_metrics=[
                "Customer Concentration Ratio",
                "Gross Profit Margin",
                "Customer Acquisition Cost"
            ],
            mitigation_strategies=[
                "Diversify customer base through targeted marketing",
                "Develop new product/service offerings",
                "Create long-term contracts with key customers",
                "Invest in innovation to maintain competitive advantage",
                "Consider strategic acquisitions to access new markets"
            ]
        ),
        FailurePattern(
            pattern_name="Margin Compression",
            description="Persistent decline in gross or net profit margins due to pricing pressure, rising costs, or inefficient operations",
            warning_signs=[
                "Consecutive quarters of margin decline",
                "Increasing COGS as percentage of revenue",
                "Rising SG&A expenses without proportional revenue growth",
                "Inability to pass on cost increases to customers",
                "Increasing discounting to maintain sales volume"
            ],
            affected_industries=[
                "Retail Trade",
                "Manufacturing",
                "Healthcare",
                "Professional Services"
            ],
            affected_metrics=[
                "Gross Profit Margin",
                "Net Profit Margin",
                "Operating Expense Ratio"
            ],
            mitigation_strategies=[
                "Conduct cost-structure analysis to identify inefficiencies",
                "Implement strategic pricing reviews",
                "Renegotiate supplier contracts",
                "Automate manual processes where possible",
                "Consider product mix optimization"
            ]
        ),
        FailurePattern(
            pattern_name="Working Capital Mismanagement",
            description="Inefficient management of the cash conversion cycle resulting in capital being unnecessarily tied up in operations",
            warning_signs=[
                "Increasing days inventory outstanding",
                "Growing days sales outstanding",
                "Decreasing days payable outstanding",
                "Widening cash conversion cycle",
                "Inventory build-up without corresponding sales growth"
            ],
            affected_industries=[
                "Retail Trade",
                "Manufacturing",
                "Construction",
                "Wholesale Trade"
            ],
            affected_metrics=[
                "Cash Conversion Cycle",
                "Inventory Turnover",
                "Accounts Receivable Turnover"
            ],
            mitigation_strategies=[
                "Implement just-in-time inventory systems",
                "Review and update credit policies",
                "Negotiate extended payment terms with suppliers",
                "Introduce early payment incentives for customers",
                "Consider inventory consignment arrangements"
            ]
        )
    ]
    
    # Industry benchmarks for Australian businesses
    industry_benchmarks = [
        IndustryBenchmark(
            industry_code="ANZSIC-G",
            industry_name="Retail Trade",
            small_business={
                "Gross Profit Margin": 42.5,
                "Net Profit Margin": 4.5,
                "ROA": 7.8,
                "Current Ratio": 1.8,
                "Debt-to-Equity": 1.2,
                "Inventory Turnover": 8.5
            },
            medium_business={
                "Gross Profit Margin": 38.2,
                "Net Profit Margin": 3.8,
                "ROA": 6.9,
                "Current Ratio": 1.6,
                "Debt-to-Equity": 1.5,
                "Inventory Turnover": 10.2
            },
            large_business={
                "Gross Profit Margin": 35.8,
                "Net Profit Margin": 3.2,
                "ROA": 6.2,
                "Current Ratio": 1.4,
                "Debt-to-Equity": 1.8,
                "Inventory Turnover": 12.5
            },
            source="Australian Bureau of Statistics",
            year="2023"
        ),
        IndustryBenchmark(
            industry_code="ANZSIC-E",
            industry_name="Construction",
            small_business={
                "Gross Profit Margin": 29.4,
                "Net Profit Margin": 7.1,
                "ROA": 9.3,
                "Current Ratio": 1.5,
                "Debt-to-Equity": 1.8,
                "Working Capital Turnover": 4.2
            },
            medium_business={
                "Gross Profit Margin": 26.7,
                "Net Profit Margin": 6.3,
                "ROA": 8.1,
                "Current Ratio": 1.3,
                "Debt-to-Equity": 2.1,
                "Working Capital Turnover": 5.1
            },
            large_business={
                "Gross Profit Margin": 24.5,
                "Net Profit Margin": 5.8,
                "ROA": 7.4,
                "Current Ratio": 1.2,
                "Debt-to-Equity": 2.4,
                "Working Capital Turnover": 6.3
            },
            source="Australian Bureau of Statistics",
            year="2023"
        ),
        IndustryBenchmark(
            industry_code="ANZSIC-C",
            industry_name="Manufacturing",
            small_business={
                "Gross Profit Margin": 31.6,
                "Net Profit Margin": 8.2,
                "ROA": 8.9,
                "Current Ratio": 2.1,
                "Debt-to-Equity": 1.5,
                "Inventory Turnover": 7.2
            },
            medium_business={
                "Gross Profit Margin": 33.8,
                "Net Profit Margin": 7.5,
                "ROA": 7.8,
                "Current Ratio": 1.9,
                "Debt-to-Equity": 1.7,
                "Inventory Turnover": 8.5
            },
            large_business={
                "Gross Profit Margin": 36.2,
                "Net Profit Margin": 6.9,
                "ROA": 7.2,
                "Current Ratio": 1.7,
                "Debt-to-Equity": 2.0,
                "Inventory Turnover": 10.3
            },
            source="Australian Bureau of Statistics",
            year="2023"
        ),
        IndustryBenchmark(
            industry_code="ANZSIC-Q",
            industry_name="Healthcare",
            small_business={
                "Gross Profit Margin": 58.7,
                "Net Profit Margin": 11.2,
                "ROA": 13.5,
                "Current Ratio": 2.2,
                "Debt-to-Equity": 1.0,
                "Days in A/R": 42.5
            },
            medium_business={
                "Gross Profit Margin": 54.3,
                "Net Profit Margin": 9.8,
                "ROA": 11.7,
                "Current Ratio": 2.0,
                "Debt-to-Equity": 1.3,
                "Days in A/R": 38.2
            },
            large_business={
                "Gross Profit Margin": 52.1,
                "Net Profit Margin": 8.5,
                "ROA": 10.2,
                "Current Ratio": 1.8,
                "Debt-to-Equity": 1.6,
                "Days in A/R": 35.6
            },
            source="Australian Bureau of Statistics",
            year="2023"
        ),
        IndustryBenchmark(
            industry_code="ANZSIC-M",
            industry_name="Professional Services",
            small_business={
                "Gross Profit Margin": 65.3,
                "Net Profit Margin": 15.3,
                "ROA": 18.4,
                "Current Ratio": 2.4,
                "Debt-to-Equity": 0.8,
                "Utilization Rate": 68.5
            },
            medium_business={
                "Gross Profit Margin": 61.5,
                "Net Profit Margin": 13.7,
                "ROA": 16.2,
                "Current Ratio": 2.2,
                "Debt-to-Equity": 1.1,
                "Utilization Rate": 72.3
            },
            large_business={
                "Gross Profit Margin": 58.7,
                "Net Profit Margin": 12.4,
                "ROA": 14.5,
                "Current Ratio": 2.0,
                "Debt-to-Equity": 1.3,
                "Utilization Rate": 75.8
            },
            source="Australian Bureau of Statistics",
            year="2023"
        )
    ]
    
    return FinancialHealthResponse(
        ratios=ratios,
        failure_patterns=failure_patterns,
        industry_benchmarks=industry_benchmarks
    )


@router.get("/financial-ratios-by-category/{category}")
def get_ratios_by_category(category: str) -> List[FinancialRatio]:
    """
    Get financial ratios filtered by category.
    """
    all_ratios = get_financial_health_indicators().ratios
    filtered_ratios = [ratio for ratio in all_ratios if ratio.category.lower() == category.lower()]
    
    if not filtered_ratios:
        raise HTTPException(status_code=404, detail=f"No ratios found for category: {category}")
    
    return filtered_ratios


@router.get("/financial-failure-patterns")
def get_failure_patterns() -> List[FailurePattern]:
    """
    Get common business failure patterns in Australian businesses.
    """
    return get_financial_health_indicators().failure_patterns


@router.get("/industry-benchmarks")
def get_industry_benchmarks() -> List[IndustryBenchmark]:
    """
    Get financial benchmarks for Australian industries by business size.
    """
    return get_financial_health_indicators().industry_benchmarks


@router.get("/industry-benchmark/{industry_code}")
def get_industry_benchmark_by_code(industry_code: str) -> IndustryBenchmark:
    """
    Get financial benchmarks for a specific Australian industry by code.
    """
    all_benchmarks = get_financial_health_indicators().industry_benchmarks
    benchmark = next((b for b in all_benchmarks if b.industry_code == industry_code), None)
    
    if not benchmark:
        raise HTTPException(status_code=404, detail=f"No benchmark found for industry code: {industry_code}")
    
    return benchmark
