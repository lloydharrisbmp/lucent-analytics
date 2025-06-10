from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any, Union
import numpy as np
from app.apis.scenario_utils import (
    ScenarioType,
    ImpactLevel,
    EconomicScenario,
    ScenarioImpactResult,
    CalculateScenarioRequest
)
from app.apis.scenario_utils import (
    calculate_financial_metrics_impact,
    calculate_business_unit_impacts,
    generate_recommended_actions,
    calculate_risk_opportunity_levels
)
from app.apis.scenario_analysis import SensitivityAnalysis, MonteCarloSimulation
import uuid
import datetime

router = APIRouter()

# Request and Response models for sensitivity analysis
class SensitivityAnalysisRequest(BaseModel):
    scenario_id: str
    organization_id: str
    target_metric: str
    parameters_to_analyze: List[str] = Field(default_factory=list, description="Leave empty to analyze all parameters")
    variation_range: float = 0.2  # Default to 20% variation
    steps: int = 5
    
class ParameterSensitivity(BaseModel):
    parameter: str
    min_impact: float
    max_impact: float
    range: float

class SensitivityAnalysisResponse(BaseModel):
    scenario_id: str
    scenario_name: str
    target_metric: str
    sensitivities: List[ParameterSensitivity]
    parameter_charts: Dict[str, Dict[str, List[float]]]

# Request and Response models for Monte Carlo simulation
class ParameterDistribution(BaseModel):
    type: str
    mean: Optional[float] = None
    std: Optional[float] = None
    min: Optional[float] = None
    max: Optional[float] = None
    mode: Optional[float] = None
    values: Optional[List[float]] = None
    probabilities: Optional[List[float]] = None

class MonteCarloSimulationRequest(BaseModel):
    scenario_id: str
    organization_id: str
    parameter_distributions: Dict[str, ParameterDistribution]
    target_metrics: List[str]
    num_simulations: int = 1000

class ProbabilityThreshold(BaseModel):
    threshold: float
    probability: float
    comparison: str

class MetricDistribution(BaseModel):
    metric: str
    mean: float
    median: float
    std: float
    min: float
    max: float
    percentile_10: float
    percentile_25: float
    percentile_75: float
    percentile_90: float
    probabilities: List[ProbabilityThreshold]
    histogram: Dict[str, List[float]]

class MonteCarloSimulationResponse(BaseModel):
    scenario_id: str
    scenario_name: str
    num_simulations: int
    distributions: List[MetricDistribution]

# Enhanced request/response models for advanced scenario analysis
class AdvancedSensitivityAnalysisRequest(SensitivityAnalysisRequest):
    sector: Optional[str] = None
    business_unit: Optional[str] = None
    include_cross_dependencies: bool = False

class ParameterCrossEffect(BaseModel):
    parameter1: str
    parameter2: str
    interaction_strength: float
    description: str

class AdvancedSensitivityResponse(SensitivityAnalysisResponse):
    cross_effects: Optional[List[ParameterCrossEffect]] = None
    stress_test_results: Optional[Dict[str, float]] = None

class AdvancedMonteCarloRequest(MonteCarloSimulationRequest):
    scenario_templates: Optional[List[str]] = None
    stress_test_params: Optional[Dict[str, float]] = None
    confidence_intervals: Optional[List[float]] = Field(default_factory=lambda: [0.90, 0.95, 0.99])
    correlation_matrix: Optional[Dict[str, Dict[str, float]]] = None

class AdvancedScenarioResult(BaseModel):
    confidence_intervals: Dict[str, Dict[str, Dict[str, float]]]
    value_at_risk: Dict[str, float]
    tail_event_probabilities: Dict[str, float]
    scenario_comparison: Optional[Dict[str, Dict[str, float]]] = None

class AdvancedMonteCarloResponse(MonteCarloSimulationResponse):
    advanced_results: AdvancedScenarioResult

# Enhanced scenario calculation request/response for advanced features
class EnhancedCalculateScenarioRequest(CalculateScenarioRequest):
    include_sensitivity_analysis: bool = False
    include_monte_carlo: bool = False
    monte_carlo_simulations: int = 1000

class EnhancedScenarioImpactResult(ScenarioImpactResult):
    sensitivity_analysis: Optional[Dict[str, Any]] = None
    monte_carlo_results: Optional[Dict[str, Any]] = None

# Mock function to retrieve a scenario - in a real implementation this would fetch from a database
def get_mock_scenario(scenario_id: str) -> EconomicScenario:
    """Get a mock scenario for testing"""
    # This is a placeholder implementation
    return EconomicScenario(
        id=scenario_id,
        name="RBA Interest Rate Hike",
        description="Model the impact of a Reserve Bank of Australia interest rate increase",
        scenario_type=ScenarioType.INTEREST_RATE,
        time_horizon="medium_term",
        parameters=[
            {
                "name": "RBA Cash Rate",
                "description": "Reserve Bank of Australia Cash Rate",
                "current_value": 5.0,  # Example value
                "min_value": 3.0,
                "max_value": 8.0,
                "unit": "%",
                "step_size": 0.25
            }
        ],
        sector_impacts=[],
        created_at=datetime.datetime.now(),
        updated_at=datetime.datetime.now(),
        organization_id="org123"
    )

# Mock function to retrieve financial data - in a real implementation this would fetch from a database
def get_mock_financial_data(organization_id: str, financial_data_id: Optional[str] = None) -> Dict[str, Any]:
    """Get mock financial data for testing"""
    # This is a placeholder implementation
    return {
        "revenue": 10000000,  # $10M annual revenue
        "ebitda": 2000000,   # $2M EBITDA
        "cash_flow": 1500000, # $1.5M cash flow
        "debt": 5000000,     # $5M debt
        "import_ratio": 0.3,  # 30% of goods imported
        "export_ratio": 0.2,  # 20% of revenue from exports
        "business_units": {
            "retail": {"sector": "Retail", "revenue": 6000000, "margin": 0.15},
            "wholesale": {"sector": "Consumer Goods (Import)", "revenue": 4000000, "margin": 0.22},
        }
    }

# Enhanced calculation endpoint
@router.post("/calculate-scenario-impact-v2", response_model=EnhancedScenarioImpactResult)
def calculate_scenario_impact_v2(request: EnhancedCalculateScenarioRequest) -> EnhancedScenarioImpactResult:
    """Calculate the financial and business impacts of a given scenario with advanced analysis options"""
    # Get scenario and financial data (mock versions for now)
    scenario = get_mock_scenario(request.scenario_id)
    financial_data = get_mock_financial_data(request.organization_id, request.financial_data_id)
    
    # Calculate basic impacts
    financial_impacts = calculate_financial_metrics_impact(scenario, financial_data)
    business_unit_impacts = calculate_business_unit_impacts(scenario, financial_data)
    risk_level, opportunity_level = calculate_risk_opportunity_levels(scenario, financial_impacts)
    recommended_actions = generate_recommended_actions(scenario, financial_impacts)
    
    # Create result object
    result = EnhancedScenarioImpactResult(
        scenario_id=scenario.id,
        scenario_name=scenario.name,
        financial_impacts=financial_impacts,
        business_unit_impacts=business_unit_impacts,
        risk_level=risk_level,
        opportunity_level=opportunity_level,
        recommended_actions=recommended_actions
    )
    
    # Add sensitivity analysis if requested
    if request.include_sensitivity_analysis:
        # Extract parameters for sensitivity analysis
        base_parameters = {}
        for param in scenario.parameters:
            base_parameters[param.name] = param.current_value
        
        # Define impact function for sensitivity analysis
        def sensitivity_impact_function(params):
            # Create a modified scenario with these parameters
            modified_scenario = scenario.copy()
            for i, param in enumerate(modified_scenario.parameters):
                if param.name in params:
                    modified_scenario.parameters[i].current_value = params[param.name]
            
            # Calculate impacts with modified scenario
            return calculate_financial_metrics_impact(modified_scenario, financial_data)
        
        # Perform sensitivity analysis
        sensitivity = SensitivityAnalysis(base_parameters, sensitivity_impact_function)
        sensitivity.calculate_base_case()
        sensitivity.analyze_all_parameters(variation_range=0.2, steps=5)
        
        # Add to result
        result.sensitivity_analysis = {
            "metrics": list(financial_impacts.keys()),
            "tornado_data": {}
        }
        
        # Generate tornado data for each metric
        for metric in financial_impacts.keys():
            try:
                tornado_data = sensitivity.get_tornado_data(metric)
                result.sensitivity_analysis["tornado_data"][metric] = tornado_data.to_dict(orient="records")
            except ValueError:
                # Skip metrics that don't have sensitivity data
                pass
    
    # Add Monte Carlo simulation if requested
    if request.include_monte_carlo:
        # Define parameter distributions for Monte Carlo
        parameter_distributions = {}
        for param in scenario.parameters:
            # Create a reasonable distribution for each parameter
            # For simplicity, using triangular distributions centered at current value
            min_val = param.min_value
            max_val = param.max_value
            mode = param.current_value
            
            parameter_distributions[param.name] = {
                "type": "triangular",
                "min": min_val,
                "max": max_val,
                "mode": mode
            }
        
        # Define impact function for Monte Carlo simulation
        def monte_carlo_impact_function(params):
            # Create a modified scenario with these parameters
            modified_scenario = scenario.copy()
            for i, param in enumerate(modified_scenario.parameters):
                if param.name in params:
                    modified_scenario.parameters[i].current_value = params[param.name]
            
            # Calculate impacts with modified scenario
            return calculate_financial_metrics_impact(modified_scenario, financial_data)
        
        # Perform Monte Carlo simulation
        simulation = MonteCarloSimulation(parameter_distributions, monte_carlo_impact_function)
        simulation.run_simulation(num_simulations=request.monte_carlo_simulations)
        summary_stats = simulation.get_summary_statistics()
        
        # Add to result
        result.monte_carlo_results = {
            "summary_statistics": summary_stats,
            "probabilities": {}
        }
        
        # Calculate probabilities for key thresholds
        for metric in financial_impacts.keys():
            if metric in summary_stats:
                result.monte_carlo_results["probabilities"][metric] = {
                    "negative": simulation.calculate_probability(metric, 0, "<"),
                    "significantly_negative": simulation.calculate_probability(metric, -5, "<"),  # >5% drop
                    "significantly_positive": simulation.calculate_probability(metric, 5, ">")    # >5% increase
                }
                
                # Add histogram data
                bin_centers, frequencies = simulation.get_histogram_data(metric, bins=20)
                result.monte_carlo_results["probabilities"][metric]["histogram"] = {
                    "bin_centers": bin_centers,
                    "frequencies": frequencies
                }
    
    return result

# Standalone sensitivity analysis endpoint
@router.post("/scenario-sensitivity-detailed", response_model=SensitivityAnalysisResponse)
def analyze_scenario_sensitivity(request: SensitivityAnalysisRequest) -> SensitivityAnalysisResponse:
    """Perform sensitivity analysis on a scenario to identify most important variables"""
    # Get scenario and financial data (mock versions for now)
    scenario = get_mock_scenario(request.scenario_id)
    financial_data = get_mock_financial_data(request.organization_id)
    
    # Extract parameters for sensitivity analysis
    base_parameters = {}
    for param in scenario.parameters:
        if not request.parameters_to_analyze or param.name in request.parameters_to_analyze:
            base_parameters[param.name] = param.current_value
    
    # Define impact function for sensitivity analysis
    def sensitivity_impact_function(params):
        # Create a modified scenario with these parameters
        modified_scenario = scenario.copy()
        for i, param in enumerate(modified_scenario.parameters):
            if param.name in params:
                modified_scenario.parameters[i].current_value = params[param.name]
        
        # Calculate impacts with modified scenario
        return calculate_financial_metrics_impact(modified_scenario, financial_data)
    
    # Perform sensitivity analysis
    sensitivity = SensitivityAnalysis(base_parameters, sensitivity_impact_function)
    sensitivity.calculate_base_case()
    sensitivity.analyze_all_parameters(variation_range=request.variation_range, steps=request.steps)
    
    # Get tornado data for target metric
    tornado_df = sensitivity.get_tornado_data(request.target_metric)
    
    # Prepare parameter charts data
    parameter_charts = {}
    for param_name, df in sensitivity.sensitivity_results.items():
        if f"{request.target_metric}_pct_change" in df.columns:
            parameter_charts[param_name] = {
                "parameter_values": df[param_name].tolist(),
                "impact_values": df[f"{request.target_metric}_pct_change"].tolist()
            }
    
    # Convert tornado data to response format
    sensitivities = []
    for _, row in tornado_df.iterrows():
        sensitivities.append(ParameterSensitivity(
            parameter=row["parameter"],
            min_impact=row["min_impact"],
            max_impact=row["max_impact"],
            range=row["range"]
        ))
    
    return SensitivityAnalysisResponse(
        scenario_id=request.scenario_id,
        scenario_name=scenario.name,
        target_metric=request.target_metric,
        sensitivities=sensitivities,
        parameter_charts=parameter_charts
    )

# Advanced tornado analysis endpoint
@router.post("/analyze-scenario-sensitivity-advanced", response_model=AdvancedSensitivityResponse)
def analyze_scenario_sensitivity_advanced(request: AdvancedSensitivityAnalysisRequest) -> AdvancedSensitivityResponse:
    """Perform advanced sensitivity analysis with cross-dependencies and stress testing"""
    # Start with basic sensitivity analysis
    base_response = analyze_scenario_sensitivity(SensitivityAnalysisRequest(
        scenario_id=request.scenario_id,
        organization_id=request.organization_id,
        target_metric=request.target_metric,
        parameters_to_analyze=request.parameters_to_analyze,
        variation_range=request.variation_range,
        steps=request.steps
    ))
    
    # Get scenario and financial data
    scenario = get_mock_scenario(request.scenario_id)
    financial_data = get_mock_financial_data(request.organization_id)
    
    # Initialize the advanced response
    advanced_response = AdvancedSensitivityResponse(
        scenario_id=base_response.scenario_id,
        scenario_name=base_response.scenario_name,
        target_metric=base_response.target_metric,
        sensitivities=base_response.sensitivities,
        parameter_charts=base_response.parameter_charts,
        cross_effects=[],
        stress_test_results={}
    )
    
    # Add cross-dependency analysis if requested
    if request.include_cross_dependencies:
        # Extract parameters from sensitivities
        parameters = [s.parameter for s in base_response.sensitivities]
        
        # Define known cross-dependencies for Australian economic variables
        known_dependencies = [
            # Interest rates impact exchange rates
            ("interest_rate", "exchange_rate", 0.6, "Higher interest rates tend to strengthen the AUD"),
            # Interest rates impact economic growth
            ("interest_rate", "economic_growth", -0.5, "Higher interest rates typically slow economic growth"),
            # Economic growth impacts inflation
            ("economic_growth", "inflation_rate", 0.4, "Stronger growth tends to increase inflationary pressures"),
            # Inflation impacts interest rates (policy response)
            ("inflation_rate", "interest_rate", 0.7, "Higher inflation typically leads to interest rate increases"),
            # Exchange rate impacts import/export costs
            ("exchange_rate", "material_costs", -0.55, "AUD depreciation increases import costs"),
            # Labor costs impact inflation
            ("labor_costs", "inflation_rate", 0.5, "Higher wage growth typically feeds into inflation"),
            # Economic growth impacts labor costs
            ("economic_growth", "labor_costs", 0.4, "Stronger growth typically leads to wage pressures")
        ]
        
        # Filter to dependencies that are relevant to the analyzed parameters
        for param1, param2, strength, description in known_dependencies:
            if param1 in parameters and param2 in parameters:
                advanced_response.cross_effects.append(ParameterCrossEffect(
                    parameter1=param1,
                    parameter2=param2,
                    interaction_strength=strength,
                    description=description
                ))
    
    # Add stress test scenarios
    stress_scenarios = {
        "recession": {
            "interest_rate": 7.5,  # High interest rates
            "economic_growth": 0.5,  # Very low growth
            "inflation_rate": 2.0,   # Disinflation
            "exchange_rate": 0.65,   # AUD weakness
            "labor_costs": 2.0       # Cost pressures
        },
        "inflation_shock": {
            "interest_rate": 8.0,    # Very high interest rates
            "economic_growth": 1.5,   # Slowed growth
            "inflation_rate": 6.5,    # High inflation
            "exchange_rate": 0.68,    # AUD pressure
            "labor_costs": 5.0        # Wage-price spiral
        },
        "supply_chain_disruption": {
            "material_costs": 5.0,    # Sharp cost increases
            "inflation_rate": 4.5,     # Increased inflation
            "economic_growth": 1.8,    # Slowed growth
            "exchange_rate": 0.67      # Some currency pressure
        }
    }
    
    # Extract parameters for sensitivity analysis
    base_parameters = {}
    for param in scenario.parameters:
        if not request.parameters_to_analyze or param.name in request.parameters_to_analyze:
            base_parameters[param.name] = param.current_value
    
    # Define impact function for sensitivity analysis
    def stress_impact_function(params):
        # Create a modified scenario with these parameters
        modified_scenario = scenario.copy()
        for i, param in enumerate(modified_scenario.parameters):
            if param.name in params:
                modified_scenario.parameters[i].current_value = params[param.name]
        
        # Calculate impacts with modified scenario
        impacts = calculate_financial_metrics_impact(modified_scenario, financial_data)
        return impacts.get(request.target_metric, 0)
    
    # Calculate impacts for stress scenarios
    for scenario_name, stress_params in stress_scenarios.items():
        # Combine baseline parameters with stress parameters
        test_params = base_parameters.copy()
        for param, value in stress_params.items():
            if param in test_params:
                test_params[param] = value
        
        # Calculate impact for this stress scenario
        impact = stress_impact_function(test_params)
        advanced_response.stress_test_results[scenario_name] = impact
    
    return advanced_response

# Standalone Monte Carlo simulation endpoint
@router.post("/scenario-monte-carlo-simulation-detailed", response_model=MonteCarloSimulationResponse)
def run_scenario_monte_carlo_simulation(request: MonteCarloSimulationRequest) -> MonteCarloSimulationResponse:
    """Run a Monte Carlo simulation for a scenario to generate probability distributions"""
    # Implementation in this function remains unchanged
    # Get scenario and financial data (mock versions for now)
    scenario = get_mock_scenario(request.scenario_id)
    financial_data = get_mock_financial_data(request.organization_id)
    
    # Standard Australian economic parameters with realistic values
    # These will be used as defaults if not provided in the request
    default_parameters = {
        "interest_rate": {
            "type": "triangular",
            "min": 3.5,  # Lower bound based on RBA baseline
            "max": 8.0,  # Upper bound for severe tightening
            "mode": 5.0   # Current neutral rate
        },
        "exchange_rate": {
            "type": "normal",
            "mean": 0.72, # Current AUD/USD level
            "std": 0.05   # Typical currency volatility
        },
        "economic_growth": {
            "type": "triangular",
            "min": 0.8,   # Recessionary scenario
            "max": 4.0,   # Strong growth scenario
            "mode": 2.5    # Most likely moderate growth
        },
        "GDP_growth": {  # Alias for economic_growth with same defaults
            "type": "triangular",
            "min": 0.8,   # Recessionary scenario
            "max": 4.0,   # Strong growth scenario
            "mode": 2.5    # Most likely moderate growth
        },
        "inflation_rate": {
            "type": "normal",
            "mean": 3.0,  # RBA target band midpoint
            "std": 0.7    # Inflation volatility
        },
        "labor_costs": {
            "type": "triangular",
            "min": 3.0,   # Current baseline
            "max": 5.0,   # Significant increase possible
            "mode": 3.5   # Most likely outcome
        },
        "material_costs": {
            "type": "triangular",
            "min": 2.5,   # Current baseline
            "max": 4.5,   # Supply constraints scenario
            "mode": 2.8   # Most likely outcome
        },
        "debt_to_equity": {
            "type": "normal",
            "mean": 0.6,  # Australian corporate average
            "std": 0.15   # Variation across businesses
        },
        "market_growth": {
            "type": "triangular",
            "min": 0.5,   # Stagnant market
            "max": 3.5,   # High growth market
            "mode": 1.8   # Typical growth
        },
        "marketing_spend": {
            "type": "normal",
            "mean": 2.0,  # Baseline marketing budget
            "std": 0.4    # Typical budget variability
        },
        "tax_rate": {
            "type": "triangular",
            "min": 25.0,  # Potential corporate tax reduction
            "max": 35.0,  # Potential corporate tax increase
            "mode": 30.0  # Current Australian corporate tax rate
        }
    }
    
    # Convert parameter distributions from request format to the format expected by MonteCarloSimulation
    parameter_distributions = {}
    
    # First populate with defaults for any missing parameters
    for param_name, default_dist in default_parameters.items():
        if param_name not in request.parameter_distributions:
            parameter_distributions[param_name] = default_dist
    
    # Then override with any parameters from the request
    for param_name, dist in request.parameter_distributions.items():
        # Create a complete parameter entry using defaults where needed
        param_entry = {
            "type": dist.type if dist.type else default_parameters.get(param_name, {}).get("type", "triangular"),
            "mean": dist.mean if dist.mean is not None else default_parameters.get(param_name, {}).get("mean", 0),
            "std": dist.std if dist.std is not None else default_parameters.get(param_name, {}).get("std", 0.1),
            "min": dist.min if dist.min is not None else default_parameters.get(param_name, {}).get("min", 0),
            "max": dist.max if dist.max is not None else default_parameters.get(param_name, {}).get("max", 0),
            "mode": dist.mode if dist.mode is not None else default_parameters.get(param_name, {}).get("mode", 0),
            "values": dist.values if dist.values else [0, 1, 2],  # Default discrete values
            "probabilities": dist.probabilities if dist.probabilities else [0.3, 0.4, 0.3]  # Default probabilities
        }
        parameter_distributions[param_name] = param_entry
    
    # Define impact function for Monte Carlo simulation that handles Australian economic factors
    def monte_carlo_impact_function(params):
        # Create a modified scenario with these parameters
        modified_scenario = scenario.copy()
        for i, param in enumerate(modified_scenario.parameters):
            if param.name in params:
                modified_scenario.parameters[i].current_value = params[param.name]
        
        # Calculate impacts with modified scenario
        base_impacts = calculate_financial_metrics_impact(modified_scenario, financial_data)
        
        # Apply Australian economic factor adjustments
        adjusted_impacts = {}
        
        for metric, value in base_impacts.items():
            # Start with the base impact
            adjusted_value = value
            
            # Apply Australian economic adjustments based on the scenario
            if "interest_rate_hike" in request.scenario_id.lower():
                # Australian businesses typically have higher sensitivity to interest rates
                interest_factor = params.get("interest_rate", 5.0) - 5.0
                debt_factor = params.get("debt_to_equity", 0.6)
                
                if metric == "ebitda":
                    adjusted_value *= (1.0 - 0.05 * interest_factor * debt_factor)  # 5% per point above 5%
                elif metric == "cash_flow":
                    adjusted_value *= (1.0 - 0.08 * interest_factor * debt_factor)  # 8% per point above 5%
            
            elif "exchange_rate" in request.scenario_id.lower() or "aud" in request.scenario_id.lower():
                # Export/import effects for Australian businesses
                exchange_rate = params.get("exchange_rate", 0.72)
                exchange_factor = (exchange_rate - 0.72) / 0.72  # % change from baseline
                
                if metric == "revenue":
                    # Positive for exporters, negative for importers (assume mixed)
                    adjusted_value *= (1.0 + 0.15 * exchange_factor)  # 15% effect per 10% change
                elif metric == "gross_margin":
                    # Generally negative for importers (common in Australia)
                    adjusted_value *= (1.0 - 0.2 * exchange_factor)  # 20% effect per 10% change
            
            # Store the adjusted impact
            adjusted_impacts[metric] = adjusted_value
        
        return adjusted_impacts
    
    # Perform Monte Carlo simulation
    simulation = MonteCarloSimulation(parameter_distributions, monte_carlo_impact_function)
    simulation.run_simulation(num_simulations=request.num_simulations)
    summary_stats = simulation.get_summary_statistics()
    
    # Prepare response distributions for each requested metric
    distributions = []
    for metric in request.target_metrics:
        if metric in summary_stats:
            stats = summary_stats[metric]
            
            # Calculate probabilities for key thresholds
            thresholds = [
                ProbabilityThreshold(threshold=0, probability=simulation.calculate_probability(metric, 0, "<"), comparison="<"),
                ProbabilityThreshold(threshold=-5, probability=simulation.calculate_probability(metric, -5, "<"), comparison="<"),
                ProbabilityThreshold(threshold=5, probability=simulation.calculate_probability(metric, 5, ">"), comparison=">")
            ]
            
            # Get histogram data
            bin_centers, frequencies = simulation.get_histogram_data(metric, bins=20)
            
            # Create MetricDistribution object
            distributions.append(MetricDistribution(
                metric=metric,
                mean=stats["mean"],
                median=stats["median"],
                std=stats["std"],
                min=stats["min"],
                max=stats["max"],
                percentile_10=stats.get("10th_percentile", 0),
                percentile_25=stats.get("25th_percentile", 0),
                percentile_75=stats.get("75th_percentile", 0),
                percentile_90=stats.get("90th_percentile", 0),
                probabilities=thresholds,
                histogram={
                    "bin_centers": bin_centers,
                    "frequencies": frequencies
                }
            ))
    
    return MonteCarloSimulationResponse(
        scenario_id=request.scenario_id,
        scenario_name=scenario.name,
        num_simulations=request.num_simulations,
        distributions=distributions
    )

# Advanced Monte Carlo simulation with correlated variables and multiple scenarios
@router.post("/run-monte-carlo-simulation-advanced", response_model=AdvancedMonteCarloResponse)
def run_monte_carlo_simulation_advanced(request: AdvancedMonteCarloRequest) -> AdvancedMonteCarloResponse:
    """Run advanced Monte Carlo simulations with correlated variables and stress testing"""
    # First get the base Monte Carlo simulation results
    base_response = run_scenario_monte_carlo_simulation(MonteCarloSimulationRequest(
        scenario_id=request.scenario_id,
        organization_id=request.organization_id,
        parameter_distributions=request.parameter_distributions,
        target_metrics=request.target_metrics,
        num_simulations=request.num_simulations
    ))
    
    # Get scenario and financial data
    scenario = get_mock_scenario(request.scenario_id)
    financial_data = get_mock_financial_data(request.organization_id)
    
    # Initialize advanced results
    advanced_results = AdvancedScenarioResult(
        confidence_intervals={},
        value_at_risk={},
        tail_event_probabilities={},
        scenario_comparison={}
    )
    
    # Create a MonteCarloSimulation with correlated variables if specified
    # This would normally use numpy's multivariate_normal to generate correlated samples
    # or a method like Cholesky decomposition to transform uncorrelated samples
    
    # For this implementation, we'll simulate the correlation effects
    
    # Convert parameter distributions from request format to the expected format
    parameter_distributions = {}
    for param_name, dist in request.parameter_distributions.items():
        parameter_distributions[param_name] = {
            "type": dist.type,
            "mean": dist.mean,
            "std": dist.std,
            "min": dist.min,
            "max": dist.max,
            "mode": dist.mode,
            "values": dist.values,
            "probabilities": dist.probabilities
        }
    
    # Define impact function for Monte Carlo simulation
    def advanced_impact_function(params):
        # Apply correlation adjustments if specified
        if request.correlation_matrix:
            # This is a simplified simulation of correlation effects
            for param1, correlations in request.correlation_matrix.items():
                if param1 in params:
                    # For each correlated parameter
                    for param2, corr_strength in correlations.items():
                        if param2 in params and corr_strength != 0:
                            # Adjust param2 based on correlation with param1
                            # This is a simplified approach - real implementation would use proper joint distributions
                            param_dist = request.parameter_distributions.get(param2)
                            if param_dist and param_dist.std:
                                # Add a correlated adjustment
                                mean = param_dist.mean or 0
                                std = param_dist.std
                                params[param2] += corr_strength * std * ((params[param1] - (request.parameter_distributions.get(param1).mean or 0)) / 
                                                                         (request.parameter_distributions.get(param1).std or 1))
        
        # Create a modified scenario with these parameters
        modified_scenario = scenario.copy()
        for i, param in enumerate(modified_scenario.parameters):
            if param.name in params:
                modified_scenario.parameters[i].current_value = params[param.name]
        
        # Calculate impacts with modified scenario
        impact_metrics = calculate_financial_metrics_impact(modified_scenario, financial_data)
        
        # Filter to only the requested metrics if specified
        if request.target_metrics:
            impact_metrics = {k: v for k, v in impact_metrics.items() if k in request.target_metrics}
        
        return impact_metrics
    
    # Run advanced simulation with the correlation-aware impact function
    simulation = MonteCarloSimulation(parameter_distributions, advanced_impact_function)
    simulation.run_simulation(num_simulations=request.num_simulations)
    
    # Calculate confidence intervals
    confidence_intervals = {}
    for metric in request.target_metrics:
        if metric in simulation.simulation_results.columns:
            ci_data = {}
            for confidence in request.confidence_intervals or [0.90, 0.95, 0.99]:
                lower = (1 - confidence) / 2
                upper = 1 - lower
                ci_data[f"{int(confidence*100)}%"] = {
                    "lower": float(simulation.simulation_results[metric].quantile(lower)),
                    "upper": float(simulation.simulation_results[metric].quantile(upper))
                }
            confidence_intervals[metric] = ci_data
    
    # Calculate Value at Risk (VaR) at 95% confidence level
    # In finance, this is typically a negative number representing potential loss
    value_at_risk = {}
    for metric in request.target_metrics:
        if metric in simulation.simulation_results.columns:
            var_95 = float(simulation.simulation_results[metric].quantile(0.05))  # 5th percentile
            value_at_risk[metric] = var_95
    
    # Calculate tail event probabilities (e.g., chance of extreme negative outcomes)
    tail_probabilities = {}
    for metric in request.target_metrics:
        if metric in simulation.simulation_results.columns:
            # Calculate probability of significant negative outcome (below -10%)
            severe_negative_prob = (simulation.simulation_results[metric] < -10).mean()
            # Calculate probability of extreme negative outcome (below -20%)
            extreme_negative_prob = (simulation.simulation_results[metric] < -20).mean()
            
            tail_probabilities[metric] = {
                "severe_negative": float(severe_negative_prob),
                "extreme_negative": float(extreme_negative_prob)
            }
    
    # Scenario comparison if templates are provided
    scenario_comparison = {}
    if request.scenario_templates:
        template_scenarios = {
            "recession": {
                "interest_rate": 7.5,  # High interest rates
                "economic_growth": 0.5,  # Very low growth
                "inflation_rate": 2.0,   # Disinflation
                "exchange_rate": 0.65    # AUD weakness
            },
            "stagflation": {
                "interest_rate": 6.5,    # High interest rates
                "economic_growth": 1.0,   # Slow growth
                "inflation_rate": 6.0,    # High inflation
                "exchange_rate": 0.68     # AUD weakness
            },
            "boom": {
                "interest_rate": 5.5,     # Moderate interest rates
                "economic_growth": 4.0,    # Strong growth
                "inflation_rate": 3.5,     # Moderate inflation
                "exchange_rate": 0.78      # Strong AUD
            },
            "china_slowdown": {
                "exchange_rate": 0.66,     # AUD weakness (commodity impact)
                "economic_growth": 1.8,    # Slowed growth
                "material_costs": 2.4      # Lower commodity prices
            },
            "supply_chain_disruption": {
                "material_costs": 4.5,     # Higher costs
                "inflation_rate": 4.0       # Higher inflation
            }
        }
        
        # Compare impacts across templates
        for template_name in request.scenario_templates:
            if template_name in template_scenarios:
                template_params = template_scenarios[template_name]
                
                # Create a set of parameters for this template scenario
                test_params = {}
                for param_name, dist in parameter_distributions.items():
                    if param_name in template_params:
                        test_params[param_name] = template_params[param_name]
                    else:
                        # Use mean or mode for other parameters
                        test_params[param_name] = dist.get("mean") or dist.get("mode") or dist.get("min", 0)
                
                # Calculate impacts for this template
                template_impacts = advanced_impact_function(test_params)
                scenario_comparison[template_name] = template_impacts
    
    # Combine all advanced results
    advanced_results = AdvancedScenarioResult(
        confidence_intervals=confidence_intervals,
        value_at_risk=value_at_risk,
        tail_event_probabilities=tail_probabilities,
        scenario_comparison=scenario_comparison
    )
    
    # Create and return the advanced response
    return AdvancedMonteCarloResponse(
        scenario_id=base_response.scenario_id,
        scenario_name=base_response.scenario_name,
        num_simulations=base_response.num_simulations,
        distributions=base_response.distributions,
        advanced_results=advanced_results
    )
