from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any, Union, Tuple
from fastapi import APIRouter, HTTPException
from datetime import datetime, date
import math
from app.apis.financial_health_indicators import get_financial_health_indicators
from app.apis.financial_scoring import ScoreResponse, CompanyData, FinancialMetric, CATEGORY_WEIGHTS

router = APIRouter()

# Define models for the recommendation engine
class ActionImpact(BaseModel):
    metric_name: str
    current_value: float
    projected_value: float
    improvement_percentage: float
    score_increase: float

class RecommendedAction(BaseModel):
    title: str
    description: str
    priority: int  # 1 (highest) to 5 (lowest)
    difficulty: str  # "Easy", "Medium", "Hard"
    timeframe: str  # "Short-term", "Medium-term", "Long-term"
    category: str  # Financial category this action addresses
    impacts: List[ActionImpact]
    estimated_overall_score_increase: float

class RecommendationRequest(BaseModel):
    company_id: str
    financial_score_data: ScoreResponse
    max_recommendations: Optional[int] = 5
    focus_categories: Optional[List[str]] = None

class RecommendationResponse(BaseModel):
    company_id: str
    recommendations: List[RecommendedAction]
    priority_explanation: str
    estimated_total_score_increase: float
    recommendation_date: datetime

# Priority factors for different issues
PRIORITY_FACTORS = {
    # Critical issues get highest priority
    "critical_issue": {
        "threshold": 30,  # Scores below 30 are critical
        "priority": 1
    },
    # Severe issues get high priority
    "severe_issue": {
        "threshold": 50,  # Scores below 50 are severe
        "priority": 2
    },
    # Moderate issues get medium priority
    "moderate_issue": {
        "threshold": 70,  # Scores below 70 are moderate
        "priority": 3
    },
    # Minor issues get low priority
    "minor_issue": {
        "threshold": 85,  # Scores below 85 have minor issues
        "priority": 4
    },
    # Good performing areas get lowest priority
    "good_performance": {
        "threshold": 100,  # Scores below 100 (i.e., all) are here
        "priority": 5
    }
}

# Define recommendation templates
RECOMMENDATION_TEMPLATES = {
    "Profitability": {
        "critical": [
            {
                "title": "Urgent Pricing Strategy Overhaul",
                "description": "Implement immediate price adjustments on core products/services based on contribution margin analysis. Focus on eliminating unprofitable offerings and enhancing high-margin items.",
                "difficulty": "Hard",
                "timeframe": "Short-term",
                "impact_factor": 0.15  # Potential percentage improvement to category score
            },
            {
                "title": "Critical Cost Reduction Program",
                "description": "Launch an emergency cost-cutting initiative targeting at least 15% reduction in non-essential expenses. Prioritize overhead costs and discretionary spending.",
                "difficulty": "Medium",
                "timeframe": "Short-term",
                "impact_factor": 0.12
            }
        ],
        "severe": [
            {
                "title": "Strategic Margin Enhancement",
                "description": "Conduct a detailed cost-to-serve analysis for all customers and products. Restructure offerings to eliminate negative margin activities and enhance profitable segments.",
                "difficulty": "Medium",
                "timeframe": "Medium-term",
                "impact_factor": 0.10
            },
            {
                "title": "Revenue Stream Diversification",
                "description": "Develop 2-3 new complementary revenue streams that leverage existing infrastructure and customer relationships to improve overall margin mix.",
                "difficulty": "Hard",
                "timeframe": "Medium-term",
                "impact_factor": 0.08
            }
        ],
        "moderate": [
            {
                "title": "Value-Based Pricing Implementation",
                "description": "Transition from cost-plus to value-based pricing for premium offerings. Conduct customer surveys to identify price sensitivity and value perception.",
                "difficulty": "Medium",
                "timeframe": "Medium-term",
                "impact_factor": 0.06
            },
            {
                "title": "Operational Efficiency Program",
                "description": "Implement process improvements targeting 5-8% cost reduction in core operational activities through waste elimination and automation of routine tasks.",
                "difficulty": "Medium",
                "timeframe": "Medium-term",
                "impact_factor": 0.05
            }
        ],
        "minor": [
            {
                "title": "Profit Margin Fine-Tuning",
                "description": "Review and optimize product mix to emphasize higher-margin offerings in marketing and sales efforts.",
                "difficulty": "Easy",
                "timeframe": "Short-term",
                "impact_factor": 0.03
            },
            {
                "title": "Premium Service Tier Introduction",
                "description": "Develop premium service options with enhanced features that can command higher prices and improve overall margin.",
                "difficulty": "Medium",
                "timeframe": "Medium-term",
                "impact_factor": 0.04
            }
        ]
    },
    "Liquidity": {
        "critical": [
            {
                "title": "Emergency Cash Flow Management",
                "description": "Implement daily cash monitoring and weekly cash flow forecasting. Prioritize payments to critical vendors and negotiate extended terms with others.",
                "difficulty": "Medium",
                "timeframe": "Short-term",
                "impact_factor": 0.15
            },
            {
                "title": "Accelerated Receivables Collection",
                "description": "Revise credit terms, implement early payment incentives, and assign dedicated staff to follow up on overdue accounts to convert receivables to cash faster.",
                "difficulty": "Medium",
                "timeframe": "Short-term",
                "impact_factor": 0.14
            }
        ],
        "severe": [
            {
                "title": "Working Capital Restructuring",
                "description": "Implement comprehensive working capital optimization including inventory reduction, supplier term renegotiation, and credit policy review.",
                "difficulty": "Hard",
                "timeframe": "Medium-term",
                "impact_factor": 0.12
            },
            {
                "title": "Payment Cycle Optimization",
                "description": "Restructure payment timing to align better with cash inflows while maintaining vendor relationships. Consider supply chain financing options.",
                "difficulty": "Medium",
                "timeframe": "Medium-term",
                "impact_factor": 0.10
            }
        ],
        "moderate": [
            {
                "title": "Cash Reserve Planning",
                "description": "Establish a systematic approach to building and maintaining adequate cash reserves based on seasonal patterns and business cycle.",
                "difficulty": "Medium",
                "timeframe": "Medium-term",
                "impact_factor": 0.08
            },
            {
                "title": "Inventory Management Optimization",
                "description": "Implement just-in-time inventory practices and ABC analysis to reduce capital tied up in slow-moving inventory.",
                "difficulty": "Medium",
                "timeframe": "Medium-term",
                "impact_factor": 0.07
            }
        ],
        "minor": [
            {
                "title": "Liquidity Monitoring Enhancement",
                "description": "Improve cash flow forecasting accuracy through better sales projections and expense tracking.",
                "difficulty": "Easy",
                "timeframe": "Short-term",
                "impact_factor": 0.04
            },
            {
                "title": "Seasonal Cash Planning",
                "description": "Develop detailed cash management plans for seasonal fluctuations to ensure adequate liquidity throughout the year.",
                "difficulty": "Easy",
                "timeframe": "Medium-term",
                "impact_factor": 0.03
            }
        ]
    },
    "Leverage": {
        "critical": [
            {
                "title": "Debt Restructuring Plan",
                "description": "Negotiate with lenders to restructure debt, potentially extending terms, adjusting interest rates, or converting some debt to equity to improve debt service capacity.",
                "difficulty": "Hard",
                "timeframe": "Medium-term",
                "impact_factor": 0.18
            },
            {
                "title": "Asset Liquidation Strategy",
                "description": "Identify non-core or underperforming assets that can be sold to reduce debt burden and improve leverage ratios.",
                "difficulty": "Medium",
                "timeframe": "Short-term",
                "impact_factor": 0.15
            }
        ],
        "severe": [
            {
                "title": "Debt Consolidation Program",
                "description": "Consolidate high-interest debt to lower overall interest expenses and simplify debt management.",
                "difficulty": "Medium",
                "timeframe": "Medium-term",
                "impact_factor": 0.12
            },
            {
                "title": "Capital Structure Revision",
                "description": "Evaluate options for equity injection through new investors, existing shareholder contributions, or convertible instruments to strengthen balance sheet.",
                "difficulty": "Hard",
                "timeframe": "Medium-term",
                "impact_factor": 0.10
            }
        ],
        "moderate": [
            {
                "title": "Debt Service Capacity Improvement",
                "description": "Focus on improving EBITDA through operational efficiencies to enhance interest coverage ratio and debt service capability.",
                "difficulty": "Medium",
                "timeframe": "Medium-term",
                "impact_factor": 0.08
            },
            {
                "title": "Financial Covenant Management",
                "description": "Proactively manage financial covenants with lenders, potentially renegotiating terms to avoid breaches and maintain financial flexibility.",
                "difficulty": "Medium",
                "timeframe": "Short-term",
                "impact_factor": 0.07
            }
        ],
        "minor": [
            {
                "title": "Debt Portfolio Optimization",
                "description": "Review existing debt arrangements to identify refinancing opportunities at more favorable terms.",
                "difficulty": "Easy",
                "timeframe": "Short-term",
                "impact_factor": 0.05
            },
            {
                "title": "Leverage Ratio Monitoring",
                "description": "Implement regular monitoring of key leverage ratios with early warning triggers for proactive management.",
                "difficulty": "Easy",
                "timeframe": "Short-term",
                "impact_factor": 0.03
            }
        ]
    },
    "Efficiency": {
        "critical": [
            {
                "title": "Process Reengineering Initiative",
                "description": "Conduct comprehensive review of core business processes to eliminate bottlenecks, redundancies, and inefficiencies impacting operational performance.",
                "difficulty": "Hard",
                "timeframe": "Medium-term",
                "impact_factor": 0.16
            },
            {
                "title": "Asset Utilization Overhaul",
                "description": "Implement capacity utilization analysis and optimization plan to maximize returns from existing assets and minimize idle resources.",
                "difficulty": "Hard",
                "timeframe": "Medium-term",
                "impact_factor": 0.14
            }
        ],
        "severe": [
            {
                "title": "Inventory Management System Implementation",
                "description": "Deploy advanced inventory management system with forecast-based ordering to improve turnover rates and reduce carrying costs.",
                "difficulty": "Medium",
                "timeframe": "Medium-term",
                "impact_factor": 0.12
            },
            {
                "title": "Accounts Receivable Process Enhancement",
                "description": "Redesign credit assessment, invoicing, and collection processes to accelerate cash conversion cycle and reduce days sales outstanding.",
                "difficulty": "Medium",
                "timeframe": "Short-term",
                "impact_factor": 0.10
            }
        ],
        "moderate": [
            {
                "title": "Operational Metrics Implementation",
                "description": "Establish key performance indicators for operational efficiency with regular reporting and accountability for improvement.",
                "difficulty": "Medium",
                "timeframe": "Short-term",
                "impact_factor": 0.08
            },
            {
                "title": "Supply Chain Optimization",
                "description": "Review and optimize supplier relationships, order quantities, and delivery schedules to improve overall efficiency and reduce costs.",
                "difficulty": "Medium",
                "timeframe": "Medium-term",
                "impact_factor": 0.07
            }
        ],
        "minor": [
            {
                "title": "Efficiency Monitoring Dashboard",
                "description": "Develop a real-time dashboard tracking key efficiency metrics to enable faster management response to emerging issues.",
                "difficulty": "Easy",
                "timeframe": "Short-term",
                "impact_factor": 0.04
            },
            {
                "title": "Staff Training Program",
                "description": "Implement targeted training to enhance employee productivity and efficiency in key operational areas.",
                "difficulty": "Easy",
                "timeframe": "Short-term",
                "impact_factor": 0.03
            }
        ]
    }
}

# Helper functions
def determine_category_severity(score):
    """Determine the severity level based on score"""
    if score < 30:
        return "critical"
    elif score < 50:
        return "severe"
    elif score < 70:
        return "moderate"
    else:
        return "minor"

def calculate_priority(category_score):
    """Calculate priority based on score thresholds"""
    for factor_name, factor in PRIORITY_FACTORS.items():
        if category_score < factor["threshold"]:
            return factor["priority"]
    return 5  # Default to lowest priority

def estimate_impact(current_score, impact_factor, max_score=100):
    """Estimate the impact of an action on the score"""
    # Cap improvement to not exceed max score
    potential_improvement = (max_score - current_score) * impact_factor
    return min(potential_improvement, max_score - current_score)

def generate_action_impacts(category, category_score, metrics, recommendation_template):
    """Generate detailed impact estimations for specific metrics"""
    # Get impact factor from the template
    impact_factor = recommendation_template["impact_factor"]
    
    # Calculate how this improvement would distribute across metrics in this category
    # We'll use a simplified approach where the impact is distributed proportionally
    # to how far each metric is from its ideal score
    impacts = []
    
    # Find all metrics in this category
    category_metrics = [m for m in metrics if m.name in category_score.metrics_scores]
    
    if not category_metrics:
        return [], 0
    
    # Calculate potential improvement based on category score
    category_improvement = estimate_impact(category_score.score, impact_factor)
    
    # Distribute improvement across metrics
    for metric in category_metrics:
        metric_score = category_score.metrics_scores.get(metric.name, 50)
        
        # Calculate proportional improvement for this metric
        metric_gap = 100 - metric_score
        total_gap = sum([100 - s for s in category_score.metrics_scores.values()])
        
        if total_gap == 0:  # Prevent division by zero
            metric_proportion = 1.0 / len(category_metrics)
        else:
            metric_proportion = metric_gap / total_gap
        
        # Apply improvement to metric
        metric_improvement = category_improvement * metric_proportion
        
        # Estimate the value improvement
        # This is a simplified approach - in a real system, you would have more
        # sophisticated models for how score improvements translate to metric values
        current_value = metric.value
        
        # Estimate improved value based on metric type
        # Different metrics improve in different directions and scales
        # This is a simplified approach - would need more specific logic per metric
        if "Ratio" in metric.name:
            # For ratios, we'll assume higher is better except for Debt ratios
            is_higher_better = "Debt" not in metric.name
            
            if is_higher_better:
                # If higher is better, increase by 5-15% depending on impact
                improvement_percentage = 0.05 + (impact_factor * 0.6)  # 5-15% improvement
                projected_value = current_value * (1 + improvement_percentage)
            else:
                # If lower is better (like debt ratios), decrease by 5-15%
                improvement_percentage = 0.05 + (impact_factor * 0.6)  # 5-15% improvement
                projected_value = current_value * (1 - improvement_percentage)
        else:
            # For margins and returns, increase by percentage points
            improvement_percentage = 0.01 + (impact_factor * 0.05)  # 1-6 percentage points
            projected_value = current_value + (improvement_percentage * 100)
        
        # Create impact object
        impacts.append(ActionImpact(
            metric_name=metric.name,
            current_value=current_value,
            projected_value=projected_value,
            improvement_percentage=improvement_percentage * 100,  # Convert to percentage
            score_increase=metric_improvement
        ))
    
    return impacts, category_improvement

@router.post("/generate-financial-recommendations")
def generate_recommendations(request: RecommendationRequest) -> RecommendationResponse:
    """Generate prioritized recommendations based on financial health assessment"""
    score_data = request.financial_score_data
    company_id = request.company_id
    
    if not score_data or not score_data.overall_score or not score_data.overall_score.category_scores:
        raise HTTPException(status_code=400, detail="Invalid financial score data provided")
    
    # Get financial health data
    category_scores = score_data.overall_score.category_scores
    
    # Filter for focus categories if provided
    if request.focus_categories:
        category_scores = {k: v for k, v in category_scores.items() if k in request.focus_categories}
    
    # Sort categories by score (ascending) to prioritize weaker areas
    sorted_categories = sorted(
        [(category, data) for category, data in category_scores.items()],
        key=lambda x: x[1].score
    )
    
    # Generate recommendations
    all_recommendations = []
    total_score_increase = 0
    
    for category, category_data in sorted_categories:
        # Determine severity level based on score
        severity = determine_category_severity(category_data.score)
        
        # Skip if no recommendations available for this category
        if category not in RECOMMENDATION_TEMPLATES or severity not in RECOMMENDATION_TEMPLATES[category]:
            continue
        
        # Get recommendation templates for this category and severity
        templates = RECOMMENDATION_TEMPLATES[category][severity]
        
        # Apply up to 2 recommendations per category, prioritizing the most impactful
        for template in templates[:2]:  # Limit to 2 recommendations per category
            # Get metrics for this category to estimate specific impacts
            metrics = []
            for metric_name in category_data.metrics_scores.keys():
                # Create a dummy metric with approximate value
                # In a real implementation, you would get actual metric values
                metrics.append(FinancialMetric(
                    name=metric_name,
                    value=75.0,  # This is a placeholder - would need real data
                    date=date.today()
                ))
            
            # Generate impacts and score increase
            impacts, score_increase = generate_action_impacts(
                category, category_data, metrics, template
            )
            
            # Create recommendation
            recommendation = RecommendedAction(
                title=template["title"],
                description=template["description"],
                priority=calculate_priority(category_data.score),
                difficulty=template["difficulty"],
                timeframe=template["timeframe"],
                category=category,
                impacts=impacts,
                estimated_overall_score_increase=score_increase * CATEGORY_WEIGHTS.get(category, 0.25)
            )
            
            all_recommendations.append(recommendation)
            total_score_increase += recommendation.estimated_overall_score_increase
            
            # Only collect up to max_recommendations
            if len(all_recommendations) >= request.max_recommendations:
                break
        
        # If we have enough recommendations, stop
        if len(all_recommendations) >= request.max_recommendations:
            break
    
    # Sort final recommendations by priority
    all_recommendations.sort(key=lambda x: x.priority)
    
    # Generate priority explanation
    priority_explanation = (
        "Recommendations are prioritized based on the severity of financial health issues "
        "with a focus on categories showing the weakest performance. Actions addressing "
        "critical issues (scores below 30) receive highest priority, followed by those "
        "addressing severe issues (scores below 50), moderate issues (scores below 70), "
        "and minor improvements (scores above 70)."
    )
    
    return RecommendationResponse(
        company_id=company_id,
        recommendations=all_recommendations,
        priority_explanation=priority_explanation,
        estimated_total_score_increase=total_score_increase,
        recommendation_date=datetime.now()
    )
