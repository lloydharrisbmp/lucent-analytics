from typing import Dict, List, Any, Union, Optional, Tuple
from enum import Enum
import math
from fastapi import APIRouter
from pydantic import BaseModel, Field


# --- Shared Enums and Models for Scenarios ---

class ScenarioType(str, Enum):
    INTEREST_RATE = "INTEREST_RATE"
    EXCHANGE_RATE = "EXCHANGE_RATE"
    INFLATION = "INFLATION"
    MARKET_DEMAND = "MARKET_DEMAND"
    SUPPLY_CHAIN = "SUPPLY_CHAIN"
    REGULATORY = "REGULATORY"

class ImpactLevel(str, Enum):
    VERY_NEGATIVE = "VERY_NEGATIVE"
    NEGATIVE = "NEGATIVE"
    NEUTRAL = "NEUTRAL"
    POSITIVE = "POSITIVE"
    VERY_POSITIVE = "VERY_POSITIVE"

class TimeHorizon(str, Enum):
    SHORT_TERM = "SHORT_TERM"  # e.g., < 1 year
    MEDIUM_TERM = "MEDIUM_TERM" # e.g., 1-3 years
    LONG_TERM = "LONG_TERM"   # e.g., > 3 years

class ScenarioParameter(BaseModel):
    name: str = Field(..., description="Name of the economic parameter")
    current_value: float = Field(..., description="The value of the parameter in this scenario")

class EconomicScenario(BaseModel):
    scenario_id: str = Field(..., description="Unique identifier for the scenario")
    scenario_type: ScenarioType = Field(..., description="The type of economic scenario")
    parameters: List[ScenarioParameter] = Field(..., description="List of parameters defining the scenario")
    description: Optional[str] = Field(None, description="Description of the scenario") # Added description back
    time_horizon: Optional[TimeHorizon] = Field(None, description="Time horizon") # Added time_horizon

class ScenarioImpactResult(BaseModel):
    metric: str = Field(..., description="Financial metric impacted")
    impact_value: float = Field(..., description="Calculated impact value (e.g., percentage change)")
    impact_level: ImpactLevel = Field(..., description="Qualitative assessment of the impact")

class CalculateScenarioRequest(BaseModel):
    scenario: EconomicScenario = Field(..., description="The economic scenario to analyze")
    financial_data: Dict[str, Any] = Field(..., description="Baseline financial data for calculations")
    # Add other necessary fields, e.g., organization_id, if needed for context

# --- End Shared Definitions ---



# Initialize router (required for FastAPI even for utility modules with no endpoints)
router = APIRouter()

# Constants for impact calculations
IMPACT_LEVEL_MULTIPLIERS = {
    ImpactLevel.VERY_NEGATIVE: -2.0,
    ImpactLevel.NEGATIVE: -1.0,
    ImpactLevel.NEUTRAL: 0.0,
    ImpactLevel.POSITIVE: 1.0,
    ImpactLevel.VERY_POSITIVE: 2.0
}

# Interest Rate Impact Coefficients by Sector
# Represents how sensitive each sector is to a 1% change in interest rates
INTEREST_RATE_SECTOR_COEFFICIENTS = {
    "Real Estate": -2.5,  # 1% rate increase = -2.5% impact
    "Construction": -1.8,
    "Banking": 1.2,
    "Insurance": 0.8,
    "Retail": -1.0,
    "Manufacturing": -0.7,
    "Technology": -1.2,
    "Healthcare": -0.3,
    "Utilities": -0.5,
    "Telecommunications": -0.4,
    "Consumer Discretionary": -1.5,
    "Consumer Staples": -0.2,
    "Energy": -0.6,
    "Materials": -0.8,
    "Transportation": -0.9
}

# Exchange Rate Impact Coefficients by Sector
# Represents how sensitive each sector is to a 10% change in AUD/USD exchange rate
EXCHANGE_RATE_SECTOR_COEFFICIENTS = {
    "Tourism": -8.0,  # 10% AUD appreciation = -8% impact (negative for inbound tourism)
    "Education (International)": -7.5,
    "Mining": -6.0,
    "Agriculture (Export)": -5.5,
    "Manufacturing (Export)": -4.5,
    "Retail (Import)": 3.0,  # 10% AUD appreciation = +3% impact (positive for importers)
    "Technology": -1.0,
    "Healthcare": -0.5,
    "Consumer Goods (Import)": 4.0,
    "Transport & Logistics": -2.0,
    "Professional Services": -1.0,
    "Financial Services": -1.5
}

# Inflation Impact Coefficients by Sector
# Represents how sensitive each sector is to a 1% change in inflation rate
INFLATION_SECTOR_COEFFICIENTS = {
    "Retail": -1.2,  # 1% inflation increase = -1.2% impact
    "Consumer Staples": -0.4,
    "Consumer Discretionary": -1.5,
    "Utilities": 0.8,  # Often can pass on costs
    "Real Estate": 1.0,  # Assets often hedge against inflation
    "Banking": -0.5,
    "Insurance": -0.7,
    "Healthcare": -0.3,
    "Technology": -0.9,
    "Telecommunications": -0.6,
    "Energy": 0.9,  # Energy prices often rise with inflation
    "Materials": 0.7,
    "Transportation": -0.8,
    "Manufacturing": -1.0
}

def calculate_interest_rate_impact(sector: str, rate_change: float) -> float:
    """Calculate the impact of an interest rate change on a specific sector
    
    Args:
        sector: The business sector
        rate_change: The change in interest rate in percentage points (e.g., 0.25 for 0.25%)
        
    Returns:
        Estimated percentage impact on the sector
    """
    coefficient = INTEREST_RATE_SECTOR_COEFFICIENTS.get(sector, -0.5)  # Default if sector not found
    return coefficient * rate_change

def calculate_exchange_rate_impact(sector: str, pct_change: float) -> float:
    """Calculate the impact of an exchange rate change on a specific sector
    
    Args:
        sector: The business sector
        pct_change: The percentage change in exchange rate (e.g., 10.0 for 10%)
                   Positive = AUD appreciation, Negative = AUD depreciation
        
    Returns:
        Estimated percentage impact on the sector
    """
    coefficient = EXCHANGE_RATE_SECTOR_COEFFICIENTS.get(sector, -1.0)  # Default if sector not found
    # Convert to decimal (e.g., 10% -> 0.1) and calculate impact
    return coefficient * (pct_change / 10.0)  # Coefficients are based on 10% change

def calculate_inflation_impact(sector: str, inflation_change: float) -> float:
    """Calculate the impact of an inflation change on a specific sector
    
    Args:
        sector: The business sector
        inflation_change: The change in inflation rate in percentage points
        
    Returns:
        Estimated percentage impact on the sector
    """
    coefficient = INFLATION_SECTOR_COEFFICIENTS.get(sector, -0.8)  # Default if sector not found
    return coefficient * inflation_change

def calculate_financial_metrics_impact(scenario: EconomicScenario, 
                                        financial_data: Dict[str, Any]) -> Dict[str, float]:
    """Calculate the impact of a scenario on financial metrics
    
    Args:
        scenario: The economic scenario to analyze
        financial_data: Current financial data to base calculations on
        
    Returns:
        Dictionary of financial metrics with projected percentage changes
    """
    # This is a simplified implementation - a real version would be more complex
    # and consider interactions between various factors
    
    impacts = {}
    
    if scenario.scenario_type == ScenarioType.INTEREST_RATE:
        # Extract interest rate parameter change
        for param in scenario.parameters:
            if param.name == "RBA Cash Rate":
                rate_change = param.current_value - 4.35  # Assuming 4.35% is baseline
                
                # Calculate impacts on different financial metrics
                impacts["revenue"] = -0.5 * rate_change  # 0.5% decrease per 1% rate increase
                impacts["ebitda"] = -0.8 * rate_change
                impacts["cash_flow"] = -1.0 * rate_change
                impacts["debt_servicing_cost"] = 5.0 * rate_change  # 5% increase per 1% rate increase
                
    elif scenario.scenario_type == ScenarioType.EXCHANGE_RATE:
        # Extract exchange rate parameter change
        for param in scenario.parameters:
            if "Exchange Rate" in param.name:
                # Calculate percentage change from baseline (e.g. 0.65 AUD/USD)
                baseline = 0.65  # Assuming AUD/USD baseline of 0.65
                pct_change = ((param.current_value - baseline) / baseline) * 100
                
                # Example impacts based on import/export ratio in financial data
                import_ratio = financial_data.get("import_ratio", 0.3)  # Default 30%
                export_ratio = financial_data.get("export_ratio", 0.2)  # Default 20%
                
                # For companies that import more than they export, AUD appreciation is positive
                net_exposure = export_ratio - import_ratio
                
                impacts["revenue"] = -net_exposure * pct_change * 0.5
                impacts["cogs"] = -import_ratio * pct_change * 0.7
                impacts["gross_margin"] = (export_ratio * pct_change * -0.5) + (import_ratio * pct_change * 0.7)
                impacts["ebitda"] = impacts.get("gross_margin", 0) * 0.8
    
    elif scenario.scenario_type == ScenarioType.INFLATION:
        # Extract inflation parameter change
        for param in scenario.parameters:
            if "Inflation" in param.name:
                inflation_change = param.current_value - 2.5  # Assuming 2.5% is baseline
                
                # Calculate impacts
                impacts["revenue"] = 0.7 * inflation_change  # Revenue rises with inflation
                impacts["cogs"] = 0.9 * inflation_change  # Costs rise faster than revenue
                impacts["gross_margin"] = -0.2 * inflation_change  # Margin compression
                impacts["ebitda"] = -0.3 * inflation_change
                impacts["cash_flow"] = -0.4 * inflation_change
                
    # Handle other scenario types as needed...
    
    return impacts

def calculate_business_unit_impacts(scenario: EconomicScenario, 
                                   financial_data: Dict[str, Any]) -> Dict[str, Dict[str, float]]:
    """Calculate the impact of a scenario on different business units
    
    Args:
        scenario: The economic scenario to analyze
        financial_data: Current financial data to base calculations on
        
    Returns:
        Dictionary of business units with their projected metric impacts
    """
    # Simplified implementation
    business_units = financial_data.get("business_units", {})
    unit_impacts = {}
    
    for unit_name, unit_data in business_units.items():
        unit_impacts[unit_name] = {}
        
        # Get primary sector for this business unit
        sector = unit_data.get("sector", "Retail")
        
        if scenario.scenario_type == ScenarioType.INTEREST_RATE:
            # Extract interest rate parameter change
            for param in scenario.parameters:
                if param.name == "RBA Cash Rate":
                    rate_change = param.current_value - 4.35  # Assuming 4.35% is baseline
                    
                    # Calculate sector-specific impact
                    sector_impact = calculate_interest_rate_impact(sector, rate_change)
                    
                    # Apply to business unit metrics
                    unit_impacts[unit_name]["revenue"] = sector_impact * 0.5
                    unit_impacts[unit_name]["margin"] = sector_impact * 0.7
        
        elif scenario.scenario_type == ScenarioType.EXCHANGE_RATE:
            # Similar implementation for exchange rate impacts
            for param in scenario.parameters:
                if "Exchange Rate" in param.name:
                    baseline = 0.65  # Assuming AUD/USD baseline of 0.65
                    pct_change = ((param.current_value - baseline) / baseline) * 100
                    
                    # Calculate sector-specific impact
                    sector_impact = calculate_exchange_rate_impact(sector, pct_change)
                    
                    # Apply to business unit metrics
                    unit_impacts[unit_name]["revenue"] = sector_impact * 0.8
                    unit_impacts[unit_name]["margin"] = sector_impact * 0.6
        
        # Handle other scenario types as needed...
    
    return unit_impacts

def generate_recommended_actions(scenario: EconomicScenario, 
                                impacts: Dict[str, float]) -> List[str]:
    """Generate recommended actions based on scenario impacts
    
    Args:
        scenario: The economic scenario
        impacts: Calculated financial impacts
        
    Returns:
        List of recommended actions
    """
    recommendations = []
    
    # Interest rate scenario recommendations
    if scenario.scenario_type == ScenarioType.INTEREST_RATE:
        debt_impact = impacts.get("debt_servicing_cost", 0)
        
        if debt_impact > 10:
            recommendations.append("Urgently review debt structure to minimize impact of rate increases")
            recommendations.append("Consider fixed rate refinancing options")
        elif debt_impact > 5:
            recommendations.append("Review debt structure to minimize impact of rate increases")
            recommendations.append("Consider hedging strategies for variable rate loans")
        
        cash_flow_impact = impacts.get("cash_flow", 0)
        if cash_flow_impact < -3:
            recommendations.append("Develop cash conservation strategy")
            recommendations.append("Review and potentially delay capital expenditure plans")
        
        revenue_impact = impacts.get("revenue", 0)
        if revenue_impact < -2:
            recommendations.append("Evaluate pricing strategy to maintain margins")
            recommendations.append("Focus on customer retention programs")
    
    # Exchange rate scenario recommendations
    elif scenario.scenario_type == ScenarioType.EXCHANGE_RATE:
        for param in scenario.parameters:
            if "Exchange Rate" in param.name:
                baseline = 0.65  # Assuming AUD/USD baseline of 0.65
                pct_change = ((param.current_value - baseline) / baseline) * 100
                
                if pct_change > 5:  # AUD appreciation
                    recommendations.append("Review import sourcing strategy to take advantage of stronger AUD")
                    recommendations.append("Consider hedging against future AUD depreciation")
                    recommendations.append("Evaluate pricing strategy for export markets")
                elif pct_change < -5:  # AUD depreciation
                    recommendations.append("Review pricing strategy for imported goods")
                    recommendations.append("Consider expanding export markets to take advantage of weaker AUD")
                    recommendations.append("Evaluate local sourcing alternatives to reduce import costs")
    
    # Add more scenario types here...
    
    return recommendations

def calculate_risk_opportunity_levels(scenario: EconomicScenario, 
                                       impacts: Dict[str, float]) -> Tuple[float, float]:
    """Calculate risk and opportunity levels based on scenario impacts
    
    Args:
        scenario: The economic scenario
        impacts: Calculated financial impacts
        
    Returns:
        Tuple of (risk_level, opportunity_level) as floats between 0-1
    """
    # Extract relevant impacts
    revenue_impact = impacts.get("revenue", 0)
    ebitda_impact = impacts.get("ebitda", 0)
    cash_flow_impact = impacts.get("cash_flow", 0)
    
    # Calculate risk level (higher for negative impacts)
    risk_components = [
        max(0, -revenue_impact / 10),  # 10% revenue drop would be risk of 1.0
        max(0, -ebitda_impact / 15),   # 15% EBITDA drop would be risk of 1.0
        max(0, -cash_flow_impact / 20) # 20% cash flow drop would be risk of 1.0
    ]
    risk_level = min(1.0, sum(risk_components) / len(risk_components))
    
    # Calculate opportunity level (higher for positive impacts)
    opportunity_components = [
        max(0, revenue_impact / 10),    # 10% revenue increase would be opportunity of 1.0
        max(0, ebitda_impact / 15),    # 15% EBITDA increase would be opportunity of 1.0
        max(0, cash_flow_impact / 20)  # 20% cash flow increase would be opportunity of 1.0
    ]
    opportunity_level = min(1.0, sum(opportunity_components) / len(opportunity_components))
    
    return risk_level, opportunity_level
