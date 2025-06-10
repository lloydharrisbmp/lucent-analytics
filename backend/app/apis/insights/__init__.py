from fastapi import APIRouter
from typing import List, Dict, Any, Optional, Tuple
import databutton as db
from datetime import datetime
import statistics
import re
from app.apis.models import MetricComparison, PercentileRank

# Create router
router = APIRouter()

# Helper functions for insights generation

def analyze_performance_gaps(comparisons: List[MetricComparison]) -> Dict[str, Any]:
    """
    Analyze performance gaps to identify the most significant areas for improvement
    
    Args:
        comparisons: List of metric comparisons from benchmark data
        
    Returns:
        Dictionary with performance gap analysis
    """
    # Group metrics into categories
    categories = {
        "profitability": [],
        "efficiency": [],
        "liquidity": [],
        "solvency": [],
        "growth": [],
        "other": []
    }
    
    # Categorize metrics
    for comp in comparisons:
        metric_lower = comp.metric_name.lower()
        
        if any(term in metric_lower for term in ["profit", "margin", "income", "return", "ebit", "ebitda"]):
            categories["profitability"].append(comp)
        elif any(term in metric_lower for term in ["turnover", "inventory", "asset", "utilization", "efficiency"]):
            categories["efficiency"].append(comp)
        elif any(term in metric_lower for term in ["current", "quick", "cash", "liquid"]):
            categories["liquidity"].append(comp)
        elif any(term in metric_lower for term in ["debt", "equity", "leverage", "coverage"]):
            categories["solvency"].append(comp)
        elif any(term in metric_lower for term in ["growth", "increase", "trend"]):
            categories["growth"].append(comp)
        else:
            categories["other"].append(comp)
    
    # Calculate average performance by category
    category_analysis = {}
    for category, metrics in categories.items():
        if not metrics:
            continue
            
        # Calculate average percentile and difference
        percentiles = [m.percentile_rank.percentile for m in metrics if m.percentile_rank]
        differences = [m.difference_percent for m in metrics]
        
        if not percentiles and not differences:
            continue
            
        avg_percentile = sum(percentiles) / len(percentiles) if percentiles else None
        avg_difference = sum(differences) / len(differences) if differences else None
        
        # Find worst performing metrics in this category
        sorted_by_performance = sorted(metrics, key=lambda m: m.percentile_rank.percentile if m.percentile_rank else 100)
        worst_performers = [m.metric_name for m in sorted_by_performance[:min(3, len(sorted_by_performance))]] 
        
        category_analysis[category] = {
            "avg_percentile": avg_percentile,
            "avg_difference": avg_difference,
            "metrics_count": len(metrics),
            "worst_performers": worst_performers
        }
    
    # Determine the weakest areas (categories with lowest percentiles)
    weakest_areas = sorted(
        [c for c in category_analysis.keys() if category_analysis[c]["avg_percentile"] is not None],
        key=lambda c: category_analysis[c]["avg_percentile"]
    )
    
    return {
        "category_analysis": category_analysis,
        "weakest_areas": weakest_areas[:min(3, len(weakest_areas))],
        "strongest_areas": weakest_areas[-min(3, len(weakest_areas)):] if weakest_areas else []
    }

def generate_trend_forecast(comparisons: List[MetricComparison]) -> Dict[str, Any]:
    """
    Generate trend forecasts based on current benchmark positioning
    
    Args:
        comparisons: List of metric comparisons from benchmark data
        
    Returns:
        Dictionary with trend forecasts for key metrics
    """
    forecasts = []
    
    for comp in comparisons:
        # Skip if no percentile rank available
        if not comp.percentile_rank:
            continue
            
        metric_name = comp.metric_name
        current_value = comp.company_value
        percentile = comp.percentile_rank.percentile
        difference = comp.difference_percent
        is_favorable = comp.is_favorable
        
        # Determine trend direction based on current positioning
        trend_direction = "neutral"
        if is_favorable is False and difference < -10:
            trend_direction = "negative"
        elif is_favorable is False and difference >= -10:
            trend_direction = "slightly_negative"
        elif is_favorable is True and difference > 10:
            trend_direction = "positive"
        elif is_favorable is True and difference <= 10:
            trend_direction = "slightly_positive"
        
        # Calculate projected value (simplified model)
        # In a real scenario, this would use more sophisticated time series analysis
        momentum_factor = 0.05  # 5% change per period
        
        if trend_direction == "negative":
            projected_change = -abs(difference * momentum_factor)
        elif trend_direction == "slightly_negative":
            projected_change = -abs(difference * momentum_factor * 0.5)
        elif trend_direction == "positive":
            projected_change = abs(difference * momentum_factor)
        elif trend_direction == "slightly_positive":
            projected_change = abs(difference * momentum_factor * 0.5)
        else:
            projected_change = 0
        
        # Calculate projected value
        projected_value = current_value * (1 + projected_change/100)
        
        # Generate forecast explanation
        explanation = ""
        if trend_direction == "negative":
            explanation = f"This metric is likely to continue declining without intervention as it's currently significantly underperforming benchmarks."
        elif trend_direction == "slightly_negative":
            explanation = f"This metric shows signs of slight underperformance and may gradually decline without attention."
        elif trend_direction == "positive":
            explanation = f"This metric is trending positively and likely to continue outperforming benchmarks."
        elif trend_direction == "slightly_positive":
            explanation = f"This metric shows slight positive momentum but may benefit from additional focus."
        else:
            explanation = f"This metric is stable relative to benchmarks and likely to maintain current performance."
        
        forecasts.append({
            "metric_name": metric_name,
            "current_value": current_value,
            "trend_direction": trend_direction,
            "projected_value": projected_value,
            "projected_change_percent": projected_change,
            "explanation": explanation
        })
    
    # Sort forecasts by the magnitude of projected change
    forecasts.sort(key=lambda x: abs(x["projected_change_percent"]), reverse=True)
    
    return {
        "forecasts": forecasts[:min(5, len(forecasts))],  # Return top 5 most significant forecasts
        "overall_trend": determine_overall_trend(forecasts) if forecasts else "neutral",
        "time_horizon": "12 months",  # Assuming a 12-month forecast period
        "methodology": "Simple momentum-based projection based on current benchmark comparison"
    }

def determine_overall_trend(forecasts: List[Dict[str, Any]]) -> str:
    """
    Determine the overall trend direction based on individual metric forecasts
    
    Args:
        forecasts: List of metric forecasts
        
    Returns:
        Overall trend direction as a string
    """
    if not forecasts:
        return "neutral"
        
    # Count trend directions
    directions = [f["trend_direction"] for f in forecasts]
    positive_count = directions.count("positive") + 0.5 * directions.count("slightly_positive")
    negative_count = directions.count("negative") + 0.5 * directions.count("slightly_negative")
    
    total = len(forecasts)
    positive_ratio = positive_count / total
    negative_ratio = negative_count / total
    
    if positive_ratio > 0.6:
        return "strongly_positive"
    elif positive_ratio > 0.4:
        return "positive"
    elif negative_ratio > 0.6:
        return "strongly_negative"
    elif negative_ratio > 0.4:
        return "negative"
    else:
        return "mixed"

def generate_actionable_recommendations(comparisons: List[MetricComparison], company_name: str, industry_name: str) -> Dict[str, Any]:
    """
    Generate detailed, actionable recommendations based on benchmark comparisons
    
    Args:
        comparisons: List of metric comparisons from benchmark data
        company_name: Name of the company being analyzed
        industry_name: Name of the industry being compared against
        
    Returns:
        Dictionary with prioritized recommendations
    """
    # Analyze performance gaps
    gap_analysis = analyze_performance_gaps(comparisons)
    
    # Generate recommendations for each category needing improvement
    category_recommendations = {}
    for category in gap_analysis["weakest_areas"]:
        category_analysis = gap_analysis["category_analysis"][category]
        worst_metrics = category_analysis["worst_performers"]
        
        # Get specific recommendations for this category
        actions = get_category_specific_recommendations(category, worst_metrics, industry_name)
        
        category_recommendations[category] = {
            "priority": "high" if category_analysis["avg_percentile"] < 30 else "medium",
            "avg_percentile": category_analysis["avg_percentile"],
            "actions": actions,
            "metrics": worst_metrics
        }
    
    # Get metric-specific recommendations for the worst performing metrics
    unfavorable_comparisons = [c for c in comparisons if c.is_favorable is False]
    sorted_by_performance = sorted(unfavorable_comparisons, key=lambda c: abs(c.difference_percent), reverse=True)
    
    metric_recommendations = []
    for comp in sorted_by_performance[:min(5, len(sorted_by_performance))]:
        metric_name = comp.metric_name
        metric_display = metric_name.replace("_", " ").title()
        difference = abs(comp.difference_percent)
        recommendations = get_metric_specific_recommendations(comp, industry_name)
        
        metric_recommendations.append({
            "metric_name": metric_name,
            "display_name": metric_display,
            "difference_percent": difference,
            "recommendations": recommendations,
            "priority": "high" if difference > 20 else "medium" if difference > 10 else "low"
        })
    
    # Create consolidated recommendations
    consolidated = []
    for category, data in category_recommendations.items():
        for action in data["actions"]:
            consolidated.append({
                "recommendation": action,
                "category": category.title(),
                "priority": data["priority"],
                "affected_metrics": data["metrics"]
            })
    
    # Add some overall business strategy recommendations
    business_recommendations = get_business_strategy_recommendations(
        gap_analysis["strongest_areas"],
        gap_analysis["weakest_areas"], 
        industry_name
    )
    
    for rec in business_recommendations:
        consolidated.append({
            "recommendation": rec,
            "category": "Business Strategy",
            "priority": "strategic",
            "affected_metrics": []
        })
    
    # Sort by priority
    priority_order = {"high": 0, "medium": 1, "low": 2, "strategic": 3}
    consolidated.sort(key=lambda x: priority_order[x["priority"]])
    
    return {
        "category_recommendations": category_recommendations,
        "metric_recommendations": metric_recommendations,
        "consolidated_recommendations": consolidated,
        "priority_focus_areas": gap_analysis["weakest_areas"],
        "competitive_advantages": gap_analysis["strongest_areas"]
    }

def get_category_specific_recommendations(category: str, metrics: List[str], industry_name: str) -> List[str]:
    """
    Get category-specific recommendations
    
    Args:
        category: Business category to generate recommendations for
        metrics: List of metrics in this category
        industry_name: Industry name for context
        
    Returns:
        List of recommendations
    """
    recommendations = []
    industry_lower = industry_name.lower()
    
    if category == "profitability":
        recommendations = [
            "Conduct a detailed cost analysis to identify areas where expenses can be reduced without affecting quality or output",
            "Review pricing strategy and consider price adjustments based on value proposition and competitive positioning",
            "Implement a contribution margin analysis by product line to focus on high-margin offerings"
        ]
        # Add industry-specific recommendations
        if "retail" in industry_lower:
            recommendations.append("Optimize inventory levels to reduce carrying costs while maintaining service levels")
        elif "professional" in industry_lower or "service" in industry_lower:
            recommendations.append("Review billing rates and utilization targets to ensure optimal resource allocation")
        elif "manufacturing" in industry_lower:
            recommendations.append("Evaluate production processes for efficiency improvements to reduce cost of goods sold")
        
    elif category == "efficiency":
        recommendations = [
            "Implement workflow analysis to identify and eliminate bottlenecks in key business processes",
            "Consider technology investments to automate repetitive tasks and reduce manual processing",
            "Review asset utilization and identify underperforming or underutilized assets"
        ]
        if "retail" in industry_lower:
            recommendations.append("Analyze sales per square foot and consider layout optimization")
        elif "manufacturing" in industry_lower:
            recommendations.append("Implement lean manufacturing principles to reduce waste and improve throughput")
            
    elif category == "liquidity":
        recommendations = [
            "Develop a detailed cash flow forecast to anticipate potential liquidity challenges",
            "Review accounts receivable processes and consider incentives for early payment",
            "Evaluate inventory management practices to optimize working capital"
        ]
        
    elif category == "solvency":
        recommendations = [
            "Review debt structure and explore refinancing options to improve terms or reduce interest costs",
            "Develop a debt reduction strategy aligned with business growth objectives",
            "Consider a capital structure review to ensure optimal balance between debt and equity"
        ]
        
    elif category == "growth":
        recommendations = [
            "Identify high-potential market segments for targeted growth initiatives",
            "Review product/service development pipeline to ensure alignment with market opportunities",
            "Consider strategic partnerships or acquisitions to accelerate growth in key areas"
        ]
        
    else:  # Other categories
        recommendations = [
            "Conduct a comprehensive business review to identify specific improvement opportunities",
            "Benchmark internal processes against industry leaders to identify best practices",
            "Develop clear KPIs for this area and implement regular monitoring and reporting"
        ]
    
    return recommendations

def get_metric_specific_recommendations(comparison: MetricComparison, industry_name: str) -> List[str]:
    """
    Get recommendations specific to a particular metric
    
    Args:
        comparison: Metric comparison with benchmark
        industry_name: Industry name for context
        
    Returns:
        List of specific recommendations for this metric
    """
    metric_name = comparison.metric_name.lower()
    recommendations = []
    
    # Profitability metrics
    if "gross margin" in metric_name:
        recommendations = [
            "Review direct costs and identify opportunities for negotiating better supplier terms",
            "Analyze product mix to focus on higher-margin products",
            "Evaluate pricing strategy particularly for low-margin products"
        ]
    elif "net profit margin" in metric_name:
        recommendations = [
            "Conduct a detailed expense analysis to identify opportunities for overhead reduction",
            "Review operational efficiency to improve conversion of gross profit to net profit",
            "Consider strategic price increases for products with inelastic demand"
        ]
    elif "return on assets" in metric_name:
        recommendations = [
            "Identify underperforming assets that can be optimized or divested",
            "Review asset utilization rates and implement strategies to improve output per asset",
            "Consider asset-light approaches for future expansion"
        ]
    elif "return on equity" in metric_name:
        recommendations = [
            "Review capital structure to ensure optimal use of equity",
            "Consider share buybacks if appropriate for your business situation",
            "Evaluate dividend policy in relation to growth investments"
        ]
        
    # Liquidity metrics
    elif "current ratio" in metric_name:
        recommendations = [
            "Review short-term cash management practices",
            "Identify opportunities to convert excess inventory to cash",
            "Evaluate accounts receivable aging and implement collection improvement strategies"
        ]
    elif "quick ratio" in metric_name:
        recommendations = [
            "Develop more rigorous cash management procedures",
            "Review credit terms with customers and suppliers",
            "Consider establishing or increasing a line of credit for emergency liquidity"
        ]
        
    # Efficiency metrics
    elif "inventory turnover" in metric_name:
        recommendations = [
            "Implement demand forecasting to optimize inventory levels",
            "Identify slow-moving inventory items for potential discounting or liquidation",
            "Consider just-in-time inventory approaches where appropriate"
        ]
    elif "asset turnover" in metric_name:
        recommendations = [
            "Review capacity utilization across all major assets",
            "Consider sale-leaseback for underutilized assets",
            "Implement preventive maintenance to maximize asset uptime"
        ]
    elif "days sales outstanding" in metric_name:
        recommendations = [
            "Review credit policies and customer onboarding processes",
            "Implement automated reminders for overdue accounts",
            "Consider early payment incentives for larger customers"
        ]
        
    # Solvency metrics
    elif "debt to equity" in metric_name:
        recommendations = [
            "Develop a structured debt reduction plan",
            "Review interest rates and terms of existing debt for refinancing opportunities",
            "Consider alternative financing structures for future capital needs"
        ]
    elif "interest coverage" in metric_name:
        recommendations = [
            "Prioritize improving operational earnings to better cover interest obligations",
            "Review debt structure to minimize interest expenses",
            "Consider debt consolidation to improve terms"
        ]
        
    # Other common metrics
    elif "operating expense" in metric_name:
        recommendations = [
            "Conduct zero-based budgeting exercise for major expense categories",
            "Implement procurement best practices and vendor consolidation",
            "Review personnel allocation and productivity"
        ]
    elif "revenue per employee" in metric_name:
        recommendations = [
            "Review team structure and responsibilities to optimize productivity",
            "Invest in training and tools to improve employee output",
            "Consider automation for routine tasks to free up employee time for value-adding activities"
        ]
    
    # If no specific recommendations are available, provide generic ones
    if not recommendations:
        recommendations = [
            f"Benchmark internal processes related to {comparison.metric_name.replace('_', ' ')} against industry leaders",
            f"Develop a specific improvement plan targeting {comparison.metric_name.replace('_', ' ')}",
            f"Consult with industry specialists about best practices for improving {comparison.metric_name.replace('_', ' ')}"
        ]
    
    return recommendations

def get_business_strategy_recommendations(strongest_areas: List[str], weakest_areas: List[str], industry_name: str) -> List[str]:
    """
    Generate high-level business strategy recommendations
    
    Args:
        strongest_areas: Categories where the business performs well
        weakest_areas: Categories where the business needs improvement
        industry_name: Name of the industry
        
    Returns:
        List of strategic recommendations
    """
    recommendations = []
    industry_lower = industry_name.lower()
    
    # Build on strengths
    if strongest_areas:
        if "profitability" in strongest_areas:
            recommendations.append(
                "Leverage your strong profitability position to invest in growth opportunities or innovation that competitors may not be able to fund."
            )
        if "efficiency" in strongest_areas:
            recommendations.append(
                "Your operational efficiency is a competitive advantage - consider scaling operations while maintaining this edge."
            )
        if "liquidity" in strongest_areas:
            recommendations.append(
                "With strong liquidity, consider strategic investments or acquisitions that may be available at favorable terms."
            )
    
    # Address weaknesses
    if weakest_areas:
        if "profitability" in weakest_areas:
            recommendations.append(
                "Prioritize profit improvement initiatives before expanding, as growth without profitability may exacerbate financial challenges."
            )
        if "efficiency" in weakest_areas:
            recommendations.append(
                "Consider engaging operations consultants to improve efficiency metrics, as this impacts multiple aspects of business performance."
            )
        if "liquidity" in weakest_areas:
            recommendations.append(
                "Develop a 13-week cash flow forecast and liquidity improvement plan to mitigate potential cash flow risks."
            )
    
    # Industry-specific recommendations
    if "retail" in industry_lower:
        recommendations.append(
            "Evaluate omnichannel strategy to ensure seamless customer experience across physical and digital touchpoints."
        )
    elif "manufacturing" in industry_lower:
        recommendations.append(
            "Review supply chain resilience and consider diversification of suppliers to mitigate disruption risks."
        )
    elif "professional" in industry_lower or "service" in industry_lower:
        recommendations.append(
            "Analyze client profitability and consider refocusing resources on high-value clients and services."
        )
    elif "construction" in industry_lower:
        recommendations.append(
            "Implement project-based profitability tracking to identify which types of projects yield the best returns."
        )
    
    # General strategic recommendations
    recommendations.append(
        "Develop a quarterly review process to track progress against benchmark metrics and adjust strategies accordingly."
    )
    
    return recommendations

# Main insights generation function
def generate_insights(comparisons: List[MetricComparison], company_name: str, industry_name: str) -> Dict[str, Any]:
    """
    Generate comprehensive insights based on benchmark comparisons
    
    Args:
        comparisons: List of metric comparisons
        company_name: Name of the company
        industry_name: Name of the industry
        
    Returns:
        Dictionary with insights and recommendations
    """
    if not comparisons:
        return {
            "error": "No comparison data available to generate insights"
        }
    
    # Generate trend forecasts
    trends = generate_trend_forecast(comparisons)
    
    # Generate actionable recommendations
    recommendations = generate_actionable_recommendations(comparisons, company_name, industry_name)
    
    # Calculate overall performance metrics
    percentiles = [c.percentile_rank.percentile for c in comparisons if c.percentile_rank]
    differences = [c.difference_percent for c in comparisons]
    
    overall_percentile = sum(percentiles) / len(percentiles) if percentiles else None
    overall_difference = sum(differences) / len(differences) if differences else None
    
    # Determine overall performance category
    performance_category = "unknown"
    if overall_percentile is not None:
        if overall_percentile >= 75:
            performance_category = "industry_leader"
        elif overall_percentile >= 60:
            performance_category = "strong_performer"
        elif overall_percentile >= 40:
            performance_category = "average_performer"
        elif overall_percentile >= 25:
            performance_category = "below_average"
        else:
            performance_category = "needs_improvement"
    
    # Generate performance summary
    summary = generate_performance_summary(
        company_name, 
        industry_name, 
        performance_category, 
        overall_percentile, 
        recommendations["priority_focus_areas"],
        recommendations["competitive_advantages"]
    )
    
    return {
        "company_name": company_name,
        "industry_name": industry_name,
        "performance_summary": summary,
        "performance_category": performance_category,
        "overall_percentile": overall_percentile,
        "overall_difference": overall_difference,
        "trend_forecast": trends,
        "recommendations": recommendations,
        "generated_at": datetime.now().isoformat(),
        "analysis_version": "1.0"
    }

def generate_performance_summary(company_name: str, industry_name: str, performance_category: str, 
                                overall_percentile: Optional[float], priority_areas: List[str], 
                                strengths: List[str]) -> str:
    """
    Generate a natural language summary of the company's performance
    
    Args:
        company_name: Company name
        industry_name: Industry name
        performance_category: Overall performance category
        overall_percentile: Overall percentile ranking
        priority_areas: List of priority focus areas
        strengths: List of company strengths
        
    Returns:
        Text summary of performance
    """
    if overall_percentile is None:
        return f"Insufficient data to generate a complete performance summary for {company_name}."
    
    percentile_text = f"{overall_percentile:.1f}" if overall_percentile is not None else "unknown"
    
    summaries = {
        "industry_leader": f"{company_name} is an industry leader in the {industry_name} sector, outperforming approximately {100-overall_percentile:.1f}% of peers. The company demonstrates exceptional performance across multiple key metrics and has established a strong competitive position.",
        
        "strong_performer": f"{company_name} is a strong performer in the {industry_name} sector, outperforming approximately {overall_percentile:.1f}% of peers. The company shows solid results across most metrics with potential to reach industry-leading status through targeted improvements.",
        
        "average_performer": f"{company_name} is performing on par with industry averages in the {industry_name} sector, at approximately the {percentile_text} percentile. While maintaining competitive position in some areas, there are several opportunities to improve performance relative to industry benchmarks.",
        
        "below_average": f"{company_name}'s performance in the {industry_name} sector is currently below industry averages, at approximately the {percentile_text} percentile. Several key metrics require attention to improve competitive positioning.",
        
        "needs_improvement": f"{company_name}'s performance in the {industry_name} sector indicates significant room for improvement, currently at approximately the {percentile_text} percentile. Immediate attention to key performance areas is recommended to enhance competitive positioning.",
        
        "unknown": f"Analysis of {company_name}'s performance in the {industry_name} sector shows mixed results. Further data would help provide a more comprehensive assessment."
    }
    
    summary = summaries.get(performance_category, summaries["unknown"])
    
    # Add information about strengths and priority areas
    if strengths:
        strengths_formatted = ", ".join([s.replace("_", " ").title() for s in strengths])
        summary += f" Notable strengths include {strengths_formatted}."
    
    if priority_areas:
        priorities_formatted = ", ".join([p.replace("_", " ").title() for p in priority_areas])
        summary += f" Priority areas for improvement include {priorities_formatted}."
    
    return summary
