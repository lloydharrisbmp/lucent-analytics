from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any, Union, Tuple
from fastapi import APIRouter, HTTPException
from datetime import datetime, date
import math
import numpy as np
from app.apis.financial_health_indicators import get_financial_health_indicators

router = APIRouter()

# Define models for the scoring API
class FinancialMetric(BaseModel):
    name: str
    value: float
    unit: str = "ratio"
    date: date

class CompanyData(BaseModel):
    company_id: str
    industry: str
    size: str = Field(..., description="Size of the business: 'small', 'medium', or 'large'")
    metrics: List[FinancialMetric]
    
class CategoryScore(BaseModel):
    category: str
    score: float
    max_score: float = 100.0
    metrics_scores: Dict[str, float]
    interpretation: str
    suggestions: List[str] = []
    
class OverallScore(BaseModel):
    score: float
    max_score: float = 100.0
    percentile: float = Field(..., description="The percentile rank compared to similar businesses")
    interpretation: str
    category_scores: Dict[str, CategoryScore]
    
class ScoreResponse(BaseModel):
    company_id: str
    industry: str
    size: str
    calculation_date: datetime
    overall_score: OverallScore
    industry_average: float
    industry_median: float
    industry_percentile: float
    trend_data: Optional[Dict[str, List[float]]] = None

class TrendAnalysisRequest(BaseModel):
    company_id: str
    start_date: date
    end_date: date

class TrendPoint(BaseModel):
    date: date
    score: float
    category_scores: Dict[str, float]

class TrendAnalysisResponse(BaseModel):
    company_id: str
    industry: str
    size: str
    trend_points: List[TrendPoint]
    trend_analysis: Dict[str, Any] = Field(..., description="Analysis of trends including slope, volatility, and interpretation")

class RelativePerformanceRequest(BaseModel):
    company_id: str
    comparison_metrics: List[str] = ["overall_score", "profitability", "liquidity", "leverage", "efficiency"]

class RelativePerformanceResponse(BaseModel):
    company_id: str
    industry: str
    size: str
    performance_metrics: Dict[str, Dict[str, float]] = Field(..., description="Metric: {company_value, industry_avg, percentile}")
    normalized_scores: Dict[str, float] = Field(..., description="Cross-industry normalized scores")

# SCORING WEIGHTS
# These weights determine the importance of each category and metric in the scoring algorithm
CATEGORY_WEIGHTS = {
    "Profitability": 0.35,  # 35% weight for profitability
    "Liquidity": 0.25,     # 25% weight for liquidity
    "Leverage": 0.20,      # 20% weight for leverage
    "Efficiency": 0.20     # 20% weight for efficiency
}

# Weights for individual metrics within each category
METRIC_WEIGHTS = {
    "Profitability": {
        "Gross Profit Margin": 0.30,
        "Net Profit Margin": 0.40,
        "Return on Assets (ROA)": 0.30
    },
    "Liquidity": {
        "Current Ratio": 0.40,
        "Quick Ratio": 0.35,
        "Cash Ratio": 0.25
    },
    "Leverage": {
        "Debt-to-Equity Ratio": 0.60,
        "Interest Coverage Ratio": 0.40
    },
    "Efficiency": {
        "Inventory Turnover": 0.50,
        "Accounts Receivable Turnover": 0.50
    }
}

# Z-score thresholds for interpreting scores
SCORE_INTERPRETATIONS = {
    "overall": {
        (90, 100): "Excellent financial health. Your business shows strong performance across all key metrics.",
        (80, 90): "Very good financial health. Your business performs well with minor areas for improvement.",
        (70, 80): "Good financial health. Your business is stable with some clear opportunities for improvement.",
        (60, 70): "Fair financial health. Several areas need attention to improve overall performance.",
        (50, 60): "Moderate financial health. Your business faces challenges that require strategic attention.",
        (40, 50): "Below average financial health. Immediate attention required in multiple areas.",
        (30, 40): "Poor financial health. Significant financial challenges that threaten stability.",
        (0, 30): "Critical financial health. Urgent intervention needed to address serious financial issues."
    },
    "Profitability": {
        (90, 100): "Exceptional profit generation relative to industry peers.",
        (70, 90): "Strong profitability with effective cost management.",
        (50, 70): "Adequate profitability but room for improvement in margin management.",
        (30, 50): "Below-average profitability requiring attention to pricing and cost structure.",
        (0, 30): "Critical profitability issues threatening business sustainability."
    },
    "Liquidity": {
        (90, 100): "Excellent liquidity with strong short-term obligation coverage.",
        (70, 90): "Good liquidity position with adequate cash reserves.",
        (50, 70): "Acceptable liquidity but limited buffer for unexpected expenses.",
        (30, 50): "Liquidity constraints that may impact ability to meet short-term obligations.",
        (0, 30): "Severe liquidity issues with high risk of cash flow problems."
    },
    "Leverage": {
        (90, 100): "Optimal debt utilization with minimal financial risk.",
        (70, 90): "Manageable debt levels with good interest coverage.",
        (50, 70): "Moderate leverage with potential constraints on additional borrowing.",
        (30, 50): "High leverage increasing financial vulnerability.",
        (0, 30): "Excessive debt burden with substantial refinancing and default risk."
    },
    "Efficiency": {
        (90, 100): "Highly efficient operations maximizing resource utilization.",
        (70, 90): "Good operational efficiency with effective asset management.",
        (50, 70): "Average operational efficiency with opportunities for process improvement.",
        (30, 50): "Inefficient operations causing drag on financial performance.",
        (0, 30): "Critical efficiency issues requiring fundamental operational restructuring."
    }
}

# Improvement suggestions based on score ranges for each category
IMPROVEMENT_SUGGESTIONS = {
    "Profitability": {
        (70, 100): [
            "Consider strategic price optimization for top-performing products/services",
            "Explore adjacent market opportunities to leverage existing strengths"
        ],
        (50, 70): [
            "Analyze product/service mix to identify highest margin offerings",
            "Implement targeted cost reduction initiatives for underperforming areas"
        ],
        (30, 50): [
            "Conduct comprehensive pricing strategy review",
            "Pursue aggressive cost restructuring to improve margins",
            "Consider discontinuing lowest-margin offerings"
        ],
        (0, 30): [
            "Urgent restructuring of business model required",
            "Seek professional financial turnaround assistance",
            "Consider significant operational downsizing or pivot strategy"
        ]
    },
    "Liquidity": {
        (70, 100): [
            "Optimize cash management to maximize returns on excess liquidity",
            "Consider strategic investments with available liquid assets"
        ],
        (50, 70): [
            "Implement more rigorous cash flow forecasting",
            "Review credit terms with customers and suppliers"
        ],
        (30, 50): [
            "Accelerate accounts receivable collection",
            "Negotiate extended payment terms with suppliers",
            "Establish emergency credit facilities"
        ],
        (0, 30): [
            "Immediate focus on cash conservation measures",
            "Consider asset liquidation to meet short-term obligations",
            "Develop debt restructuring plan with creditors"
        ]
    },
    "Leverage": {
        (70, 100): [
            "Evaluate opportunities to use strategic debt for expansion",
            "Consider capital structure optimization for tax efficiency"
        ],
        (50, 70): [
            "Review debt portfolio to optimize interest rates",
            "Establish clear debt reduction targets"
        ],
        (30, 50): [
            "Implement strict capital expenditure controls",
            "Prioritize debt reduction in financial planning",
            "Consider equity financing for new initiatives"
        ],
        (0, 30): [
            "Urgent debt restructuring required",
            "Consider asset sales to reduce debt burden",
            "Explore debt-to-equity conversion with major creditors"
        ]
    },
    "Efficiency": {
        (70, 100): [
            "Fine-tune inventory management with advanced analytics",
            "Explore automation to further improve operational efficiency"
        ],
        (50, 70): [
            "Implement just-in-time inventory practices",
            "Review accounts receivable process for improvement opportunities"
        ],
        (30, 50): [
            "Conduct comprehensive operational audit",
            "Implement structured inventory reduction program",
            "Overhaul receivables management processes"
        ],
        (0, 30): [
            "Radical operational restructuring needed",
            "Consider outsourcing non-core functions",
            "Implement stringent inventory controls and aged receivables management"
        ]
    }
}

def normalize_ratio(value: float, benchmark: float, warning_threshold: float, is_higher_better: bool = True) -> float:
    """Normalize a financial ratio to a 0-100 scale based on industry benchmarks
    
    Args:
        value: The actual ratio value
        benchmark: The industry benchmark value
        warning_threshold: The warning threshold value
        is_higher_better: True if higher values are better, False otherwise
    
    Returns:
        Normalized score between 0 and 100
    """
    if value is None or math.isnan(value):
        return 50.0  # Default to middle score for missing values
        
    # Handle metrics where lower values are better (like Debt-to-Equity)
    if not is_higher_better:
        # Swap values to invert the scoring
        temp = value
        value = benchmark
        benchmark = temp
        
    # Calculate distance from warning threshold to benchmark (the "safe zone")
    safe_zone = abs(benchmark - warning_threshold)
    
    if safe_zone == 0:  # Prevent division by zero
        safe_zone = 0.01
        
    # Calculate how far the actual value is from the benchmark
    if is_higher_better:
        # For metrics where higher is better
        if value >= benchmark:
            # Above benchmark is good, can score above 75
            deviation = (value - benchmark) / benchmark
            # Cap the maximum positive deviation at 100% of benchmark
            deviation = min(deviation, 1.0)
            return 75 + (deviation * 25)  # 75-100 range for above benchmark
        else:
            # Below benchmark but above warning is 50-75
            if value >= warning_threshold:
                position_in_safe_zone = (value - warning_threshold) / safe_zone
                return 50 + (position_in_safe_zone * 25)  # 50-75 range
            else:
                # Below warning threshold is 0-50
                # The further below, the worse
                if warning_threshold == 0:
                    # Special case to avoid division by zero
                    return max(0, 50 - 50 * (1 - value / 0.01))
                else:
                    ratio = max(0, value / warning_threshold)
                    return max(0, 50 * ratio)  # 0-50 range
    else:
        # For metrics where lower is better (already swapped above)
        # Logic follows the same pattern as above
        if value >= benchmark:
            deviation = (value - benchmark) / benchmark
            deviation = min(deviation, 1.0)
            return 75 + (deviation * 25)
        else:
            if value >= warning_threshold:
                position_in_safe_zone = (value - warning_threshold) / safe_zone
                return 50 + (position_in_safe_zone * 25)
            else:
                if warning_threshold == 0:
                    return max(0, 50 - 50 * (1 - value / 0.01))
                else:
                    ratio = max(0, value / warning_threshold)
                    return max(0, 50 * ratio)

def get_interpretation_and_suggestions(score: float, category: str) -> Tuple[str, List[str]]:
    """Get interpretation and improvement suggestions based on score"""
    interpretation = ""
    suggestions = []
    
    # Get category-specific or overall interpretations
    interpretations = SCORE_INTERPRETATIONS.get(category, SCORE_INTERPRETATIONS["overall"])
    
    # Find the right interpretation based on score range
    for score_range, text in interpretations.items():
        if score_range[0] <= score < score_range[1]:
            interpretation = text
            break
    
    # Get improvement suggestions if available for this category
    if category in IMPROVEMENT_SUGGESTIONS:
        for score_range, suggestion_list in IMPROVEMENT_SUGGESTIONS[category].items():
            if score_range[0] <= score < score_range[1]:
                suggestions = suggestion_list
                break
                
    return interpretation, suggestions

def calculate_category_score(metrics: List[FinancialMetric], industry: str, size: str, category: str) -> CategoryScore:
    """Calculate score for a specific category based on its metrics"""
    # Get the financial health indicators
    indicators = get_financial_health_indicators()
    
    # Filter ratios for this category
    category_ratios = [r for r in indicators.ratios if r.category == category]
    
    # Calculate scores for each metric
    metric_scores = {}
    total_weighted_score = 0
    total_weight = 0
    
    for metric in metrics:
        # Find matching ratio in our financial health indicators
        matching_ratio = next((r for r in category_ratios if r.name == metric.name), None)
        
        if matching_ratio:
            # Get the benchmark and warning threshold for this industry and size
            benchmark = matching_ratio.industry_benchmarks.get(industry, {}).get(size.lower(), 0)
            warning = matching_ratio.warning_thresholds.get(industry, 0)
            
            # Determine if higher values are better based on the category and metric
            is_higher_better = True
            # Exception for debt ratios where lower is generally better
            if category == "Leverage" and "Debt" in metric.name:
                is_higher_better = False
                
            # Calculate normalized score
            score = normalize_ratio(metric.value, benchmark, warning, is_higher_better)
            metric_scores[metric.name] = score
            
            # Apply metric weight within category
            weight = METRIC_WEIGHTS.get(category, {}).get(metric.name, 1.0)
            total_weighted_score += score * weight
            total_weight += weight
    
    # Calculate overall category score
    if total_weight > 0:
        category_score = total_weighted_score / total_weight
    else:
        category_score = 50.0  # Default middle score if no weights
        
    # Get interpretation and suggestions
    interpretation, suggestions = get_interpretation_and_suggestions(category_score, category)
    
    return CategoryScore(
        category=category,
        score=category_score,
        metrics_scores=metric_scores,
        interpretation=interpretation,
        suggestions=suggestions
    )

def calculate_cross_industry_normalized_score(score: float, industry: str, metric: str) -> float:
    """Normalize a score for cross-industry comparison using statistical normalization"""
    # Industry difficulty factors (based on statistical analysis of industry performance)
    # Higher values mean the industry is generally more challenging
    INDUSTRY_DIFFICULTY = {
        "Retail Trade": 1.2,
        "Construction": 1.3,
        "Manufacturing": 1.1,
        "Healthcare": 0.9,
        "Professional Services": 0.8
    }
    
    # Metric volatility factors (higher means more volatile across industries)
    METRIC_VOLATILITY = {
        "overall_score": 1.0,
        "profitability": 1.4,
        "liquidity": 1.1,
        "leverage": 1.3,
        "efficiency": 1.2
    }
    
    # Get difficulty factor for this industry (default to 1.0 if not found)
    difficulty = INDUSTRY_DIFFICULTY.get(industry, 1.0)
    
    # Get volatility factor for this metric (default to 1.0 if not found)
    volatility = METRIC_VOLATILITY.get(metric.lower(), 1.0)
    
    # Apply normalization formula: score * difficulty / volatility
    # This makes scores in difficult industries worth more, and highly volatile
    # metrics less significant in the cross-industry comparison
    normalized_score = score * difficulty / volatility
    
    # Ensure the normalized score is still in the 0-100 range
    return max(0, min(100, normalized_score))

@router.post("/calculate-financial-score")
def calculate_financial_score(company_data: CompanyData) -> ScoreResponse:
    """Calculate financial health score based on company metrics"""
    # Validate company size
    if company_data.size.lower() not in ["small", "medium", "large"]:
        raise HTTPException(status_code=400, detail="Company size must be 'small', 'medium', or 'large'")
        
    # Group metrics by category
    metrics_by_category = {}
    for metric in company_data.metrics:
        # Get the financial health indicators to categorize metrics
        indicators = get_financial_health_indicators()
        
        # Find the category for this metric
        category = next((r.category for r in indicators.ratios if r.name == metric.name), None)
        
        if category:
            if category not in metrics_by_category:
                metrics_by_category[category] = []
            metrics_by_category[category].append(metric)
    
    # Calculate score for each category
    category_scores = {}
    overall_weighted_score = 0
    total_weight = 0
    
    for category, metrics in metrics_by_category.items():
        category_score = calculate_category_score(metrics, company_data.industry, company_data.size, category)
        category_scores[category] = category_score
        
        # Apply category weight to overall score
        weight = CATEGORY_WEIGHTS.get(category, 0.25)  # Default equal weight if not specified
        overall_weighted_score += category_score.score * weight
        total_weight += weight
    
    # Calculate overall score
    if total_weight > 0:
        overall_score_value = overall_weighted_score / total_weight
    else:
        overall_score_value = 50.0  # Default middle score if no weights
        
    # Set arbitrary industry values for demonstration
    # In a real scenario, these would be calculated from a database of companies
    industry_average = 65.0
    industry_median = 62.5
    industry_percentile = min(100, max(0, (overall_score_value - industry_median) * 2 + 50))
    
    # Get overall interpretation
    overall_interpretation, _ = get_interpretation_and_suggestions(overall_score_value, "overall")
    
    # Create response
    overall = OverallScore(
        score=overall_score_value,
        percentile=industry_percentile,
        interpretation=overall_interpretation,
        category_scores=category_scores
    )
    
    return ScoreResponse(
        company_id=company_data.company_id,
        industry=company_data.industry,
        size=company_data.size,
        calculation_date=datetime.now(),
        overall_score=overall,
        industry_average=industry_average,
        industry_median=industry_median,
        industry_percentile=industry_percentile,
        # Trend data would be populated from historical calculations
        trend_data=None
    )

@router.post("/trend-analysis")
def analyze_score_trends(request: TrendAnalysisRequest) -> TrendAnalysisResponse:
    """Analyze trends in financial health scores over time"""
    # In a real implementation, this would query a database of historical scores
    # For this demo, we'll create synthetic data
    
    # Number of days in the range
    days = (request.end_date - request.start_date).days + 1
    
    # Ensure there's at least one day in the range
    if days < 1:
        raise HTTPException(status_code=400, detail="End date must be after start date")
    
    # Generate synthetic trend data
    trend_points = []
    
    # Base values - in a real implementation, these would come from the database
    base_overall = 65.0
    base_profitability = 70.0
    base_liquidity = 60.0
    base_leverage = 75.0
    base_efficiency = 68.0
    
    # Generate points with some realistic random variation and trend
    import random
    random.seed(hash(request.company_id))  # Make it deterministic per company
    
    # Add a subtle trend direction
    trend_direction = 0.05  # Small upward trend
    
    for i in range(days):
        current_date = request.start_date.replace(day=request.start_date.day + i)
        
        # Add some random variation and a small trend
        noise = random.uniform(-3.0, 3.0)
        trend = i * trend_direction
        
        # Calculate scores with variation
        overall = min(100, max(0, base_overall + noise + trend))
        profitability = min(100, max(0, base_profitability + noise * 1.2 + trend))
        liquidity = min(100, max(0, base_liquidity + noise * 0.8 + trend * 0.5))
        leverage = min(100, max(0, base_leverage + noise * 0.9 + trend * 1.2))
        efficiency = min(100, max(0, base_efficiency + noise * 1.1 + trend * 0.8))
        
        # Add point to trend
        trend_points.append(TrendPoint(
            date=current_date,
            score=overall,
            category_scores={
                "Profitability": profitability,
                "Liquidity": liquidity,
                "Leverage": leverage,
                "Efficiency": efficiency
            }
        ))
    
    # Calculate trend analysis metrics
    
    # Extract time series data
    dates = [point.date.toordinal() for point in trend_points]
    scores = [point.score for point in trend_points]
    
    # Calculate slope using numpy if more than one point
    slope = 0
    if len(dates) > 1:
        slope, _ = np.polyfit(dates, scores, 1)
        # Convert to meaningful units (points per month)
        slope *= 30  # Approximate days per month
    
    # Calculate volatility (standard deviation)
    volatility = np.std(scores) if len(scores) > 1 else 0
    
    # Determine trend direction
    if slope > 0.5:
        trend_direction = "Improving"
    elif slope < -0.5:
        trend_direction = "Declining"
    else:
        trend_direction = "Stable"
    
    # Create trend analysis dictionary
    trend_analysis = {
        "slope": slope,
        "volatility": volatility,
        "direction": trend_direction,
        "interpretation": f"Financial health is {trend_direction.lower()} at a rate of {abs(slope):.2f} points per month with {volatility:.2f} points of volatility."
    }
    
    return TrendAnalysisResponse(
        company_id=request.company_id,
        industry="Retail Trade",  # Would be fetched from company data in real implementation
        size="small",  # Would be fetched from company data in real implementation
        trend_points=trend_points,
        trend_analysis=trend_analysis
    )

@router.post("/relative-performance")
def calculate_relative_performance(request: RelativePerformanceRequest) -> RelativePerformanceResponse:
    """Calculate company performance relative to industry benchmarks with cross-industry normalization"""
    # In a real implementation, this would query actual company data
    # For this demo, we'll create synthetic data
    
    # Simulate company metrics
    company_industry = "Retail Trade"  # Would be fetched in real implementation
    company_size = "small"  # Would be fetched in real implementation
    
    # Create performance metrics dictionary
    performance_metrics = {}
    normalized_scores = {}
    
    for metric in request.comparison_metrics:
        # Generate synthetic data
        if metric == "overall_score":
            company_value = 72.5
            industry_avg = 65.0
        elif metric == "profitability":
            company_value = 68.0
            industry_avg = 64.0
        elif metric == "liquidity":
            company_value = 75.0
            industry_avg = 62.0
        elif metric == "leverage":
            company_value = 80.0
            industry_avg = 70.0
        elif metric == "efficiency":
            company_value = 71.0
            industry_avg = 67.0
        else:
            company_value = 65.0
            industry_avg = 65.0
            
        # Calculate percentile (simplified calculation)
        percentile = min(100, max(0, (company_value - industry_avg) * 3 + 50))
        
        # Store metrics
        performance_metrics[metric] = {
            "company_value": company_value,
            "industry_avg": industry_avg,
            "percentile": percentile
        }
        
        # Calculate cross-industry normalized score
        normalized = calculate_cross_industry_normalized_score(company_value, company_industry, metric)
        normalized_scores[metric] = normalized
    
    return RelativePerformanceResponse(
        company_id=request.company_id,
        industry=company_industry,
        size=company_size,
        performance_metrics=performance_metrics,
        normalized_scores=normalized_scores
    )
