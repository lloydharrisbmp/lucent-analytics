from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional, Union, Literal
import numpy as np
from datetime import datetime, date

router = APIRouter()

# Models for request and response
class FinancialDataPoint(BaseModel):
    date: Union[str, datetime, date]
    value: float
    category: Optional[str] = None
    label: Optional[str] = None

class FinancialMetric(BaseModel):
    name: str
    current_value: float
    previous_value: Optional[float] = None
    target_value: Optional[float] = None
    unit: Optional[str] = None  # e.g., "$", "%", etc.
    data_points: Optional[List[FinancialDataPoint]] = None
    metadata: Optional[Dict[str, Any]] = None

class InsightRequest(BaseModel):
    metrics: List[FinancialMetric]
    report_type: Literal["board", "management", "investor", "custom"] = "board"
    industry: Optional[str] = None
    company_size: Optional[str] = None  # e.g., "small", "medium", "large"
    time_period: Optional[str] = None  # e.g., "Q2 2023", "FY 2023"
    context: Optional[Dict[str, Any]] = None

class Insight(BaseModel):
    title: str
    description: str
    type: Literal["information", "warning", "success", "neutral", "positive", "negative"]
    metric_name: Optional[str] = None
    recommendations: Optional[List[str]] = None
    confidence: Optional[float] = None  # 0.0 to 1.0

class InsightResponse(BaseModel):
    insights: List[Insight]
    summary: Optional[str] = None

# Helper functions for insights generation
def calculate_percentage_change(current: float, previous: float) -> float:
    """Calculate percentage change between two values."""
    if previous == 0:
        return float('inf') if current > 0 else float('-inf') if current < 0 else 0.0
    return ((current - previous) / abs(previous)) * 100.0

def identify_trend(data_points: List[FinancialDataPoint]) -> Dict[str, Any]:
    """Identify trend in a series of data points."""
    if not data_points or len(data_points) < 2:
        return {"trend": "insufficient_data"}
    
    # Sort data points by date
    sorted_points = sorted(data_points, key=lambda x: x.date if isinstance(x.date, (datetime, date)) else 
                          datetime.fromisoformat(x.date.replace('Z', '+00:00') if 'Z' in x.date else x.date))
    
    # Extract values
    values = [p.value for p in sorted_points]
    
    # Calculate simple trend
    first, last = values[0], values[-1]
    change = last - first
    percent_change = calculate_percentage_change(last, first)
    
    # Calculate average change
    changes = [values[i] - values[i-1] for i in range(1, len(values))]
    avg_change = sum(changes) / len(changes) if changes else 0
    
    # Determine trend direction
    if percent_change > 5:  # More than 5% increase
        trend = "strong_increase" if percent_change > 15 else "moderate_increase"
    elif percent_change < -5:  # More than 5% decrease
        trend = "strong_decrease" if percent_change < -15 else "moderate_decrease"
    else:  # Between -5% and 5%
        trend = "stable"
    
    # Check for volatility
    std_dev = np.std(values) if len(values) > 2 else 0
    mean = np.mean(values)
    coefficient_of_variation = (std_dev / mean) if mean != 0 else 0
    is_volatile = coefficient_of_variation > 0.15  # 15% variation
    
    return {
        "trend": trend,
        "change": change,
        "percent_change": percent_change,
        "avg_change": avg_change,
        "is_volatile": is_volatile,
        "coefficient_of_variation": coefficient_of_variation,
        "start_value": first,
        "end_value": last
    }

def detect_anomalies(data_points: List[FinancialDataPoint]) -> List[Dict[str, Any]]:
    """Detect anomalies in financial data points."""
    if not data_points or len(data_points) < 3:  # Need at least 3 points for meaningful anomaly detection
        return []
    
    # Sort data points by date
    sorted_points = sorted(data_points, key=lambda x: x.date if isinstance(x.date, (datetime, date)) else 
                          datetime.fromisoformat(x.date.replace('Z', '+00:00') if 'Z' in x.date else x.date))
    
    # Extract values
    values = [p.value for p in sorted_points]
    
    # Calculate mean and standard deviation
    mean = np.mean(values)
    std_dev = np.std(values)
    
    # Identify points outside of 2 standard deviations
    anomalies = []
    threshold = 2.0  # Number of standard deviations to consider an anomaly
    
    for i, point in enumerate(sorted_points):
        z_score = (point.value - mean) / std_dev if std_dev != 0 else 0
        if abs(z_score) > threshold:
            anomalies.append({
                "index": i,
                "date": point.date,
                "value": point.value,
                "z_score": z_score,
                "deviation": (point.value - mean),
                "percent_deviation": ((point.value - mean) / mean * 100) if mean != 0 else 0
            })
    
    return anomalies

def compare_to_target(current: float, target: float) -> Dict[str, Any]:
    """Compare current value to target and provide analysis."""
    diff = current - target
    percent_diff = (diff / target * 100) if target != 0 else float('inf') if diff > 0 else float('-inf') if diff < 0 else 0
    
    # Determine achievement level
    if percent_diff >= 0:
        if percent_diff >= 20:
            achievement = "significantly_exceeded"
        elif percent_diff >= 5:
            achievement = "exceeded"
        else:
            achievement = "met"
    else:  # negative percent_diff
        if percent_diff <= -20:
            achievement = "significantly_below"
        elif percent_diff <= -5:
            achievement = "below"
        else:
            achievement = "slightly_below"
    
    return {
        "achievement": achievement,
        "difference": diff,
        "percent_difference": percent_diff
    }

def analyze_metric(metric: FinancialMetric) -> Dict[str, Any]:
    """Analyze a financial metric and return insights."""
    analysis = {
        "name": metric.name,
        "current_value": metric.current_value
    }
    
    # Calculate change if previous value is available
    if metric.previous_value is not None:
        change = metric.current_value - metric.previous_value
        percent_change = calculate_percentage_change(metric.current_value, metric.previous_value)
        analysis.update({
            "previous_value": metric.previous_value,
            "change": change,
            "percent_change": percent_change,
            "direction": "increase" if change > 0 else "decrease" if change < 0 else "unchanged"
        })
    
    # Compare to target if available
    if metric.target_value is not None:
        target_comparison = compare_to_target(metric.current_value, metric.target_value)
        analysis["target_comparison"] = target_comparison
    
    # Analyze trend if data points are available
    if metric.data_points and len(metric.data_points) > 1:
        trend_analysis = identify_trend(metric.data_points)
        analysis["trend"] = trend_analysis
        
        # Detect anomalies
        anomalies = detect_anomalies(metric.data_points)
        if anomalies:
            analysis["anomalies"] = anomalies
    
    return analysis

# Natural language generation functions
def generate_trend_narrative(trend_data: Dict[str, Any], metric_name: str) -> str:
    """Generate narrative description of a trend."""
    trend = trend_data.get("trend")
    percent_change = trend_data.get("percent_change", 0)
    is_volatile = trend_data.get("is_volatile", False)
    
    if trend == "insufficient_data":
        return f"There is insufficient historical data to identify a trend in {metric_name}."
    
    narrative = f"{metric_name} has "
    
    if trend == "strong_increase":
        narrative += f"increased significantly by {abs(percent_change):.1f}%"
    elif trend == "moderate_increase":
        narrative += f"shown a moderate increase of {abs(percent_change):.1f}%"
    elif trend == "stable":
        narrative += "remained relatively stable"
    elif trend == "moderate_decrease":
        narrative += f"decreased moderately by {abs(percent_change):.1f}%"
    elif trend == "strong_decrease":
        narrative += f"decreased significantly by {abs(percent_change):.1f}%"
    
    if is_volatile:
        narrative += " with notable volatility throughout the period"
    
    narrative += "."
    return narrative

def generate_target_comparison_narrative(comparison: Dict[str, Any], metric_name: str) -> str:
    """Generate narrative about target comparison."""
    achievement = comparison.get("achievement")
    percent_diff = comparison.get("percent_difference", 0)
    
    narrative = f"{metric_name} "
    
    if achievement == "significantly_exceeded":
        narrative += f"significantly exceeded the target by {abs(percent_diff):.1f}%"
    elif achievement == "exceeded":
        narrative += f"exceeded the target by {abs(percent_diff):.1f}%"
    elif achievement == "met":
        narrative += "met the target"
    elif achievement == "slightly_below":
        narrative += f"is slightly below target by {abs(percent_diff):.1f}%"
    elif achievement == "below":
        narrative += f"is below target by {abs(percent_diff):.1f}%"
    elif achievement == "significantly_below":
        narrative += f"is significantly below target by {abs(percent_diff):.1f}%"
    
    narrative += "."
    return narrative

def generate_change_narrative(analysis: Dict[str, Any], metric_name: str) -> str:
    """Generate narrative about change from previous period."""
    if "change" not in analysis:
        return ""
        
    change = analysis.get("change")
    percent_change = analysis.get("percent_change", 0)
    direction = analysis.get("direction")
    
    if direction == "unchanged":
        return f"{metric_name} remained unchanged from the previous period."
    
    narrative = f"{metric_name} has {direction}d by {abs(percent_change):.1f}% compared to the previous period."
    return narrative

def generate_anomaly_narrative(anomalies: List[Dict[str, Any]], metric_name: str) -> str:
    """Generate narrative about anomalies."""
    if not anomalies:
        return ""
    
    if len(anomalies) == 1:
        anomaly = anomalies[0]
        date_str = anomaly["date"] if isinstance(anomaly["date"], str) else anomaly["date"].strftime("%B %Y")
        percent_dev = anomaly["percent_deviation"]
        direction = "above" if percent_dev > 0 else "below"
        
        return f"An unusual {direction} average value for {metric_name} was detected in {date_str}, " \
               f"deviating by {abs(percent_dev):.1f}% from the normal range."
    else:
        return f"{len(anomalies)} unusual values were detected for {metric_name}, indicating potential inconsistencies or seasonal effects."

def generate_recommendations(analysis: Dict[str, Any], metric_name: str, report_type: str) -> List[str]:
    """Generate recommendations based on analysis."""
    recommendations = []
    
    # For negative trends
    if analysis.get("direction") == "decrease" or ("trend" in analysis and analysis["trend"].get("trend") in ["moderate_decrease", "strong_decrease"]):
        if "Revenue" in metric_name or "Sales" in metric_name:
            recommendations.append("Review pricing strategy and sales channels to address the declining revenue.")
            recommendations.append("Investigate competitor activities that might be impacting market share.")
        elif "Profit" in metric_name or "Margin" in metric_name:
            recommendations.append("Conduct cost structure analysis to identify opportunities for efficiency.")
            recommendations.append("Evaluate product/service mix to focus on higher-margin offerings.")
        elif "Cash" in metric_name:
            recommendations.append("Review accounts receivable processes to improve collection efficiency.")
            recommendations.append("Consider adjusting inventory levels to optimize working capital.")
    
    # For target misses
    if "target_comparison" in analysis and analysis["target_comparison"].get("achievement") in ["below", "significantly_below"]:
        recommendations.append(f"Revisit forecasting assumptions related to {metric_name} to ensure targets are realistic.")
        recommendations.append("Develop an action plan with specific initiatives to bridge the performance gap.")
    
    # For volatility
    if "trend" in analysis and analysis["trend"].get("is_volatile"):
        recommendations.append(f"Implement more frequent monitoring of {metric_name} to better manage volatility.")
        recommendations.append("Consider hedging strategies or contractual agreements to reduce future volatility.")
    
    # For anomalies
    if "anomalies" in analysis and analysis["anomalies"]:
        recommendations.append(f"Investigate specific factors that contributed to unusual patterns in {metric_name}.")
        recommendations.append("Establish early warning indicators to identify potential anomalies in the future.")
    
    # Limit recommendations based on report type
    max_recommendations = 3 if report_type == "board" else 4 if report_type == "management" else 2
    return recommendations[:max_recommendations]

def generate_insight_type(analysis: Dict[str, Any]) -> str:
    """Determine the type of insight based on analysis."""
    # Default to information
    insight_type = "information"
    
    # Check for positive indicators
    if (analysis.get("direction") == "increase" and ("Revenue" in analysis["name"] or "Profit" in analysis["name"])) or \
       (analysis.get("direction") == "decrease" and ("Cost" in analysis["name"] or "Expense" in analysis["name"])):
        insight_type = "positive"
    
    # Check for negative indicators
    if (analysis.get("direction") == "decrease" and ("Revenue" in analysis["name"] or "Profit" in analysis["name"])) or \
       (analysis.get("direction") == "increase" and ("Cost" in analysis["name"] or "Expense" in analysis["name"])):
        insight_type = "negative"
    
    # Target comparisons override
    if "target_comparison" in analysis:
        achievement = analysis["target_comparison"].get("achievement")
        if achievement in ["exceeded", "significantly_exceeded"]:
            insight_type = "success"
        elif achievement in ["significantly_below", "below"]:
            insight_type = "warning"
    
    # Anomalies override
    if "anomalies" in analysis and analysis["anomalies"]:
        insight_type = "warning"
    
    return insight_type

def generate_insight_title(analysis: Dict[str, Any]) -> str:
    """Generate an insightful title based on the analysis."""
    metric_name = analysis["name"]
    
    # For trend-based titles
    if "trend" in analysis:
        trend = analysis["trend"].get("trend")
        if trend == "strong_increase":
            return f"Significant growth in {metric_name}"
        elif trend == "moderate_increase":
            return f"Upward trend in {metric_name}"
        elif trend == "stable":
            return f"Stable performance in {metric_name}"
        elif trend == "moderate_decrease":
            return f"Declining trend in {metric_name}"
        elif trend == "strong_decrease":
            return f"Significant reduction in {metric_name}"
    
    # For target-based titles
    if "target_comparison" in analysis:
        achievement = analysis["target_comparison"].get("achievement")
        if achievement == "significantly_exceeded":
            return f"{metric_name} substantially exceeds expectations"
        elif achievement == "exceeded":
            return f"{metric_name} performs above target"
        elif achievement == "met":
            return f"{metric_name} meets planned objectives"
        elif achievement in ["slightly_below", "below"]:
            return f"{metric_name} falls short of target"
        elif achievement == "significantly_below":
            return f"Critical shortfall in {metric_name} performance"
    
    # For anomaly-based titles
    if "anomalies" in analysis and analysis["anomalies"]:
        return f"Unusual patterns detected in {metric_name}"
    
    # For simple change-based titles
    if "direction" in analysis:
        direction = analysis.get("direction")
        if direction == "increase":
            return f"{metric_name} shows improvement from previous period"
        elif direction == "decrease":
            return f"{metric_name} decreased compared to previous period"
        else:
            return f"{metric_name} remains consistent with previous period"
    
    # Default title
    return f"Analysis of {metric_name}"

def create_insight_for_metric(analysis: Dict[str, Any], report_type: str) -> Insight:
    """Create an insight object from metric analysis."""
    metric_name = analysis["name"]
    narratives = []
    
    # Generate different parts of the narrative
    if "change" in analysis:
        narratives.append(generate_change_narrative(analysis, metric_name))
    
    if "trend" in analysis and analysis["trend"].get("trend") != "insufficient_data":
        narratives.append(generate_trend_narrative(analysis["trend"], metric_name))
    
    if "target_comparison" in analysis:
        narratives.append(generate_target_comparison_narrative(analysis["target_comparison"], metric_name))
    
    if "anomalies" in analysis and analysis["anomalies"]:
        narratives.append(generate_anomaly_narrative(analysis["anomalies"], metric_name))
    
    # Combine narratives into a description
    description = " ".join(narratives)
    
    # Generate recommendations
    recommendations = generate_recommendations(analysis, metric_name, report_type)
    
    # Create a title
    title = generate_insight_title(analysis)
    
    # Determine insight type
    insight_type = generate_insight_type(analysis)
    
    return Insight(
        title=title,
        description=description,
        type=insight_type,
        metric_name=metric_name,
        recommendations=recommendations if recommendations else None,
        confidence=0.85  # Default confidence level
    )

def generate_summary(insights: List[Insight], report_type: str) -> str:
    """Generate an executive summary based on insights."""
    if not insights:
        return "No significant insights were identified in the provided data."
    
    # Count insights by type
    positive_count = sum(1 for i in insights if i.type in ["positive", "success"])
    negative_count = sum(1 for i in insights if i.type in ["negative", "warning"])
    neutral_count = sum(1 for i in insights if i.type in ["information", "neutral"])
    
    # Determine overall sentiment
    if positive_count > negative_count:
        sentiment = "positive"
    elif negative_count > positive_count:
        sentiment = "challenging"
    else:
        sentiment = "mixed"
    
    # Start with a general summary
    summary = f"This {report_type} report shows {sentiment} performance overall, with "
    
    if positive_count > 0:
        summary += f"{positive_count} positive indicators" 
        if negative_count > 0 or neutral_count > 0:
            summary += ", "
    
    if negative_count > 0:
        summary += f"{negative_count} areas requiring attention"
        if neutral_count > 0:
            summary += ", and "
    
    if neutral_count > 0:
        summary += f"{neutral_count} stable metrics"
    
    summary += ". "
    
    # Add highlights from key insights
    if positive_count > 0:
        top_positive = next((i for i in insights if i.type in ["positive", "success"]), None)
        if top_positive:
            summary += f"Notable strength in {top_positive.metric_name}. "
    
    if negative_count > 0:
        top_negative = next((i for i in insights if i.type in ["negative", "warning"]), None)
        if top_negative:
            summary += f"Key concern related to {top_negative.metric_name}. "
    
    # Add closing recommendation
    if report_type == "board":
        if sentiment == "positive":
            summary += "The board may consider strategies to sustain this momentum and invest in growth opportunities."
        elif sentiment == "challenging":
            summary += "The board should review key performance gaps and evaluate strategic adjustments."
        else:  # mixed
            summary += "A balanced approach is recommended, capitalizing on strengths while addressing performance gaps."
    elif report_type == "management":
        if sentiment == "positive":
            summary += "Management should document successful initiatives and explore opportunities to replicate across other areas."
        elif sentiment == "challenging":
            summary += "Management focus should be directed to root cause analysis and implementation of corrective actions."
        else:  # mixed
            summary += "Management should maintain operational discipline while developing targeted plans for underperforming areas."
    elif report_type == "investor":
        if sentiment == "positive":
            summary += "These results support a positive outlook for continued shareholder value creation."
        elif sentiment == "challenging":
            summary += "Management has identified key action areas to address these challenges and improve future performance."
        else:  # mixed
            summary += "While navigating market uncertainties, the company is focused on strengthening performance across all key metrics."
    
    return summary

# API Endpoint
@router.post("/generate-insights", response_model=InsightResponse)
async def generate_insights(request: InsightRequest) -> InsightResponse:
    """Generate insights from financial metrics."""
    if not request.metrics:
        raise HTTPException(status_code=400, detail="No metrics provided for analysis")
    
    # Analyze each metric
    analyses = [analyze_metric(metric) for metric in request.metrics]
    
    # Generate insights from analyses
    insights = [create_insight_for_metric(analysis, request.report_type) for analysis in analyses]
    
    # Generate overall summary
    summary = generate_summary(insights, request.report_type)
    
    return InsightResponse(insights=insights, summary=summary)
