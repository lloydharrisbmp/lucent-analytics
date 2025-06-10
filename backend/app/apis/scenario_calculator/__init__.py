from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Union, Any
import numpy as np
from datetime import datetime
import json
from scipy import stats
from enum import Enum

router = APIRouter()

# Model Definitions
class DistributionType(str, Enum):
    NORMAL = "normal"
    TRIANGULAR = "triangular"
    UNIFORM = "uniform"
    CUSTOM = "custom"

class ParameterDistribution(BaseModel):
    type: DistributionType
    min: Optional[float] = None
    max: Optional[float] = None
    mean: Optional[float] = None
    std: Optional[float] = None
    mode: Optional[float] = None
    custom_values: Optional[List[float]] = None
    custom_weights: Optional[List[float]] = None

class MonteCarloSimulationRequest(BaseModel):
    scenario_id: str
    organization_id: str
    parameter_distributions: Dict[str, ParameterDistribution]
    target_metrics: List[str]
    num_simulations: int = Field(default=1000, ge=100, le=10000)

class ThresholdProbability(BaseModel):
    threshold: float
    probability: float
    comparison: str

class HistogramData(BaseModel):
    bin_centers: List[float]
    frequencies: List[int]

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
    probabilities: List[ThresholdProbability]
    histogram: HistogramData

class MonteCarloSimulationResponse(BaseModel):
    scenario_id: str
    scenario_name: str
    num_simulations: int
    distributions: List[MetricDistribution]

class SensitivityAnalysisRequest(BaseModel):
    scenario_id: str
    organization_id: str
    target_metric: str
    parameters_to_analyze: Optional[List[str]] = None  # If None, analyze all parameters
    variation_range: float = Field(default=0.2, ge=0.01, le=1.0)  # 20% by default
    steps: int = Field(default=5, ge=3, le=20)

class ParameterSensitivity(BaseModel):
    parameter: str
    min_impact: float
    max_impact: float
    range: float

class ParameterChart(BaseModel):
    parameter_values: List[float]
    impact_values: List[float]

class SensitivityAnalysisResponse(BaseModel):
    scenario_id: str
    scenario_name: str
    target_metric: str
    sensitivities: List[ParameterSensitivity]
    parameter_charts: Dict[str, ParameterChart]

class EnhancedCalculateScenarioRequest(BaseModel):
    scenario_id: str
    organization_id: str
    financial_data_id: Optional[str] = None
    include_sensitivity_analysis: bool = False
    include_monte_carlo: bool = False
    monte_carlo_simulations: int = Field(default=1000, ge=100, le=10000)

class SensitivityAnalysisData(BaseModel):
    metrics: List[str]
    tornado_data: Dict[str, List[ParameterSensitivity]]

class MetricStatistics(BaseModel):
    mean: float
    median: float
    std: float
    min: float
    max: float
    percentile_10: float
    percentile_25: float
    percentile_75: float
    percentile_90: float

class MetricProbabilities(BaseModel):
    negative: float
    significantly_negative: float
    significantly_positive: float
    histogram: HistogramData

class MonteCarloResults(BaseModel):
    summary_statistics: Dict[str, MetricStatistics]
    probabilities: Dict[str, MetricProbabilities]

class EnhancedScenarioImpactResult(BaseModel):
    scenario_id: str
    scenario_name: str
    financial_impacts: Dict[str, float]
    business_unit_impacts: Dict[str, Dict[str, float]]
    risk_level: float
    opportunity_level: float
    recommended_actions: List[str]
    sensitivity_analysis: Optional[SensitivityAnalysisData] = None
    monte_carlo_results: Optional[MonteCarloResults] = None

# Utility classes for calculations
class SensitivityAnalysis:
    def __init__(self, parameters, base_values, target_metric, variation_range=0.2, steps=5):
        self.parameters = parameters
        self.base_values = base_values
        self.target_metric = target_metric
        self.variation_range = variation_range
        self.steps = steps
        
    def analyze(self):
        results = []
        parameter_charts = {}
        
        # For each parameter, vary it and calculate the impact
        for param in self.parameters:
            base_value = self.base_values.get(param, 0)
            if base_value == 0:
                continue  # Skip parameters with zero base value
                
            min_value = base_value * (1 - self.variation_range)
            max_value = base_value * (1 + self.variation_range)
            
            # Calculate step values
            step_values = np.linspace(min_value, max_value, self.steps).tolist()
            impact_values = []
            
            for value in step_values:
                # Create modified parameters
                modified_params = self.base_values.copy()
                modified_params[param] = value
                
                # Calculate the impact
                impact = self._calculate_impact(modified_params)
                impact_values.append(impact)
            
            # Store the parameter chart
            parameter_charts[param] = {
                "parameter_values": step_values,
                "impact_values": impact_values
            }
            
            # Find min and max impact
            min_impact = min(impact_values)
            max_impact = max(impact_values)
            impact_range = max_impact - min_impact
            
            # Add to results
            results.append({
                "parameter": param,
                "min_impact": min_impact,
                "max_impact": max_impact,
                "range": impact_range
            })
        
        # Sort by impact range (descending)
        results.sort(key=lambda x: x["range"], reverse=True)
        
        return results, parameter_charts
    
    def _calculate_impact(self, parameters):
        # More realistic economic impact calculations
        if self.target_metric == "ebitda":
            # EBITDA affected by multiple economic factors
            interest_rate = parameters.get("interest_rate", 0)
            economic_growth = parameters.get("economic_growth", 0)
            inflation_rate = parameters.get("inflation_rate", 0)
            labor_costs = parameters.get("labor_costs", 0)
            material_costs = parameters.get("material_costs", 0)
            exchange_rate = parameters.get("exchange_rate", 0)
            
            # Higher interest rates increase debt servicing costs, reducing EBITDA
            interest_effect = -3.5 * (interest_rate - 5.0) if interest_rate > 5.0 else -1.8 * (interest_rate - 5.0)
            
            # Economic growth effects - non-linear relationship with diminishing returns
            growth_effect = 3.2 * np.log(1 + economic_growth / 2.0)
            
            # Inflation impacts costs and potentially pricing
            inflation_effect = -1.2 * (inflation_rate - 3.0) if inflation_rate > 3.0 else -0.4 * (inflation_rate - 3.0)
            
            # Labor and material costs directly impact EBITDA
            cost_effect = -2.0 * (labor_costs / 3.5 - 1) - 1.5 * (material_costs / 2.8 - 1)
            
            # Exchange rate impacts for import/export businesses
            # For businesses with higher imports, AUD depreciation is negative
            exchange_effect = -3.8 * (0.72 / exchange_rate - 1) if exchange_rate < 0.72 else -1.2 * (0.72 / exchange_rate - 1)
            
            # Combined effect with some interdependencies
            impact = interest_effect + growth_effect + inflation_effect + cost_effect + exchange_effect
            
            # Add industry-specific adjustments
            impact *= 1.0  # Would be adjusted based on industry sensitivity
            
            return impact
        
        elif self.target_metric == "revenue":
            # Revenue is affected by market conditions, exchange rates, marketing
            market_growth = parameters.get("market_growth", 0)
            exchange_rate = parameters.get("exchange_rate", 0)
            marketing_spend = parameters.get("marketing_spend", 0)
            economic_growth = parameters.get("economic_growth", 0)
            inflation_rate = parameters.get("inflation_rate", 0)
            
            # Market growth has direct impact on revenue
            market_effect = 2.4 * market_growth
            
            # Exchange rate impacts export competitiveness
            # Lower AUD is good for exporters, bad for importers
            # This assumes a slightly export-oriented business
            exchange_effect = 2.8 * (0.72 / exchange_rate - 1) if exchange_rate < 0.72 else 1.5 * (0.72 / exchange_rate - 1)
            
            # Marketing spend has diminishing returns
            marketing_effect = 1.2 * np.sqrt(marketing_spend / 2.0)
            
            # Economic factors affect consumer spending
            economic_effect = 1.5 * economic_growth - 0.8 * (inflation_rate - 3.0 if inflation_rate > 3.0 else 0)
            
            # Combined effect
            impact = market_effect + exchange_effect + marketing_effect + economic_effect
            
            return impact
        
        elif self.target_metric == "cash_flow":
            # Cash flow is affected by operational factors and financial structure
            interest_rate = parameters.get("interest_rate", 0)
            economic_growth = parameters.get("economic_growth", 0)
            debt_to_equity = parameters.get("debt_to_equity", 0)
            tax_rate = parameters.get("tax_rate", 0)
            
            # Interest rate directly impacts debt servicing costs
            interest_effect = -4.2 * debt_to_equity * (interest_rate - 5.0 if interest_rate > 5.0 else interest_rate - 5.0) 
            
            # Economic growth affects operational cash generation
            growth_effect = 2.8 * economic_growth
            
            # Tax rate impacts cash outflows
            tax_effect = -1.5 * (tax_rate - 30.0) / 30.0
            
            # Combined effect
            impact = interest_effect + growth_effect + tax_effect
            
            return impact
            
        elif self.target_metric == "debt_servicing_cost":
            # Directly tied to interest rates and debt levels
            interest_rate = parameters.get("interest_rate", 0)
            debt_to_equity = parameters.get("debt_to_equity", 0)
            
            # Direct relationship with debt level and interest rate
            # 10% increase in interest rate leads to ~10% increase in servicing costs
            # But the relationship with debt level is stronger
            impact = 18.0 * debt_to_equity * (interest_rate / 5.0 - 1.0)
            
            return impact
        
        elif self.target_metric == "gross_margin":
            # Gross margin affected by input costs and pricing power
            inflation_rate = parameters.get("inflation_rate", 0)
            exchange_rate = parameters.get("exchange_rate", 0)
            material_costs = parameters.get("material_costs", 0)
            labor_costs = parameters.get("labor_costs", 0)
            economic_growth = parameters.get("economic_growth", 0)
            
            # Cost pressures from inflation
            inflation_effect = -1.6 * (inflation_rate - 3.0) if inflation_rate > 3.0 else -0.4 * (inflation_rate - 3.0)
            
            # Import costs affected by exchange rate
            exchange_effect = -2.2 * (0.72 / exchange_rate - 1) if exchange_rate < 0.72 else -0.8 * (0.72 / exchange_rate - 1)
            
            # Direct material and labor cost impacts
            cost_effect = -1.8 * (material_costs / 2.8 - 1) - 1.2 * (labor_costs / 3.5 - 1)
            
            # Pricing power related to economic growth
            growth_effect = 0.7 * economic_growth  # Ability to pass on costs in strong economy
            
            # Combined effect
            impact = inflation_effect + exchange_effect + cost_effect + growth_effect
            
            return impact
        
        # Default fallback calculation for other metrics
        else:
            # Build a generic model based on economic principles
            # This is a simplified approach that would be customized for each metric
            interest_rate = parameters.get("interest_rate", 5.0)
            economic_growth = parameters.get("economic_growth", 2.5)
            inflation_rate = parameters.get("inflation_rate", 3.0)
            exchange_rate = parameters.get("exchange_rate", 0.72)
            
            # General economic impact formula
            impact = (
                -2.0 * (interest_rate - 5.0) +  # Interest rate effect
                1.5 * economic_growth +         # Growth effect
                -1.0 * (inflation_rate - 3.0) + # Inflation effect
                -1.5 * (0.72 / exchange_rate - 1)  # Exchange rate effect
            )
            
            return impact

class MonteCarloSimulation:
    def __init__(self, parameter_distributions, target_metrics, num_simulations=1000):
        self.parameter_distributions = parameter_distributions
        self.target_metrics = target_metrics
        self.num_simulations = num_simulations
        self.results = {}
    
    def run(self):
        # Generate random parameter values based on their distributions
        parameter_samples = self._generate_parameter_samples()
        
        # Calculate the metric values for each set of parameter samples
        metric_results = {metric: [] for metric in self.target_metrics}
        
        for i in range(self.num_simulations):
            # Get the parameters for this simulation
            simulation_params = {param: samples[i] for param, samples in parameter_samples.items()}
            
            # Calculate each target metric
            for metric in self.target_metrics:
                value = self._calculate_metric(metric, simulation_params)
                metric_results[metric].append(value)
        
        # Process the results for each metric
        distributions = []
        for metric, values in metric_results.items():
            distribution = self._analyze_distribution(metric, values)
            distributions.append(distribution)
        
        return distributions
    
    def _generate_parameter_samples(self):
        samples = {}
        for param_name, distribution in self.parameter_distributions.items():
            if distribution.type == DistributionType.NORMAL:
                if distribution.mean is None or distribution.std is None:
                    raise ValueError(f"Normal distribution for parameter {param_name} requires mean and std")
                samples[param_name] = np.random.normal(distribution.mean, distribution.std, self.num_simulations)
            
            elif distribution.type == DistributionType.TRIANGULAR:
                if distribution.min is None or distribution.max is None or distribution.mode is None:
                    raise ValueError(f"Triangular distribution for parameter {param_name} requires min, max, and mode")
                samples[param_name] = np.random.triangular(
                    distribution.min, 
                    distribution.mode, 
                    distribution.max, 
                    self.num_simulations
                )
            
            elif distribution.type == DistributionType.UNIFORM:
                if distribution.min is None or distribution.max is None:
                    raise ValueError(f"Uniform distribution for parameter {param_name} requires min and max")
                samples[param_name] = np.random.uniform(
                    distribution.min,
                    distribution.max,
                    self.num_simulations
                )
            
            elif distribution.type == DistributionType.CUSTOM:
                if not distribution.custom_values or not distribution.custom_weights:
                    raise ValueError(f"Custom distribution for parameter {param_name} requires custom_values and custom_weights")
                
                # Normalize weights
                weights = np.array(distribution.custom_weights)
                weights = weights / np.sum(weights)
                
                # Generate samples based on the custom distribution
                samples[param_name] = np.random.choice(
                    distribution.custom_values,
                    size=self.num_simulations,
                    p=weights
                )
            
            else:
                raise ValueError(f"Unsupported distribution type: {distribution.type}")
        
        return samples
    
    def _calculate_metric(self, metric, parameters):
        # Enhanced economic impact calculations with realistic variability
        # This follows economic models with appropriate noise to simulate real-world uncertainty
        if metric == "ebitda":
            interest_rate = parameters.get("interest_rate", 5.0)
            economic_growth = parameters.get("economic_growth", 2.5)
            inflation_rate = parameters.get("inflation_rate", 3.0)
            labor_costs = parameters.get("labor_costs", 3.5)
            material_costs = parameters.get("material_costs", 2.8)
            exchange_rate = parameters.get("exchange_rate", 0.72)
            debt_to_equity = parameters.get("debt_to_equity", 0.6)
            
            # Business cycle effects - economic growth has non-linear relationship
            # with business performance (diminishing returns at high growth)
            growth_factor = 2.8 * np.log(1 + economic_growth / 2.0)
            
            # Interest rate impacts through financial leverage
            # Higher debt-to-equity ratios amplify interest rate effects
            interest_factor = -3.2 * debt_to_equity * (interest_rate - 5.0)
            
            # Cost pressures from inflation, labor and materials
            # Inflation above target has stronger negative impacts
            inflation_factor = -1.4 * (inflation_rate - 3.0) if inflation_rate > 3.0 else -0.6 * (inflation_rate - 3.0)
            cost_factor = -1.8 * (labor_costs / 3.5 - 1.0) - 1.5 * (material_costs / 2.8 - 1.0)
            
            # Exchange rate impacts - modeling import/export balance
            # Australian businesses often face stronger headwinds from AUD depreciation
            exchange_factor = -3.5 * (0.72 / exchange_rate - 1.0) if exchange_rate < 0.72 else -1.0 * (0.72 / exchange_rate - 1.0)
            
            # Combined impact with appropriate interdependencies
            # Some factors intensify during economic stress (correlation effects)
            stress_factor = 1.0
            if economic_growth < 1.5 and interest_rate > 6.0:
                stress_factor = 1.3  # Factors compound during economic stress
                
            base_impact = (growth_factor + interest_factor + inflation_factor + cost_factor + exchange_factor) * stress_factor
            
            # Add appropriate noise that scales with volatility of economic conditions
            # More extreme scenarios have higher uncertainty
            volatility = 1.0 + 0.2 * abs(interest_rate - 5.0) + 0.2 * abs(economic_growth - 2.5)
            noise = np.random.normal(0, volatility)  
            
            return base_impact + noise
        
        elif metric == "revenue":
            market_growth = parameters.get("market_growth", 1.8)
            exchange_rate = parameters.get("exchange_rate", 0.72)
            marketing_spend = parameters.get("marketing_spend", 2.0)
            economic_growth = parameters.get("economic_growth", 2.5)
            inflation_rate = parameters.get("inflation_rate", 3.0)
            
            # Market growth with industry-specific multiplier
            market_factor = 2.2 * market_growth
            
            # Economic growth affects consumer spending and B2B demand
            # Uses log function to model diminishing returns
            economic_factor = 1.8 * np.log(1 + economic_growth / 2.0)
            
            # Price effects from inflation - can be positive for revenue in short term,
            # but negative if too high (reduced purchasing power)
            inflation_factor = 0.6 * inflation_rate if inflation_rate < 4.0 else 0.6 * 4.0 - 0.8 * (inflation_rate - 4.0)
            
            # Exchange rate impacts - models a mixed import/export business
            # Lower AUD helps exporters but hurts importers
            exchange_factor = 2.4 * (0.72 / exchange_rate - 1.0) if exchange_rate < 0.72 else 1.2 * (0.72 / exchange_rate - 1.0)
            
            # Marketing effectiveness with diminishing returns
            marketing_factor = 1.5 * np.sqrt(marketing_spend / 2.0)
            
            # Calculate base impact with cross-effects between factors
            # Marketing is more effective in growing economies
            marketing_adjustment = 1.0 + 0.2 * max(0, economic_growth - 2.0)
            
            base_impact = market_factor + economic_factor + inflation_factor + exchange_factor + (marketing_factor * marketing_adjustment)
            
            # Add noise that reflects business cycle volatility
            volatility = 0.8 + 0.3 * abs(market_growth - 1.8) + 0.2 * abs(economic_growth - 2.5)
            noise = np.random.normal(0, volatility)  
            
            return base_impact + noise
        
        elif metric == "cash_flow":
            interest_rate = parameters.get("interest_rate", 5.0)
            economic_growth = parameters.get("economic_growth", 2.5)
            debt_to_equity = parameters.get("debt_to_equity", 0.6)
            inflation_rate = parameters.get("inflation_rate", 3.0)
            tax_rate = parameters.get("tax_rate", 30.0)
            
            # Operating cash flow component tied to economic growth
            operating_factor = 3.0 * economic_growth - 0.8 * max(0, inflation_rate - 3.0)
            
            # Financing cash flow component - debt servicing costs
            # Interest rate effect is amplified by leverage
            financing_factor = -4.5 * debt_to_equity * (interest_rate / 5.0)
            
            # Tax effects - progressive impact above baseline rate
            tax_factor = -1.2 * max(0, (tax_rate - 30.0) / 30.0)
            
            # Combined impact with stress amplification
            stress_factor = 1.0
            if economic_growth < 1.5 and interest_rate > 6.0:
                stress_factor = 1.4  # Cash flow suffers more in stressed conditions
                
            base_impact = (operating_factor + financing_factor + tax_factor) * stress_factor
            
            # Cash flow tends to be more volatile than earnings
            volatility = 1.2 + 0.4 * abs(economic_growth - 2.5) + 0.3 * debt_to_equity
            noise = np.random.normal(0, volatility)  
            
            return base_impact + noise
        
        elif metric == "debt_servicing_cost":
            interest_rate = parameters.get("interest_rate", 5.0)
            debt_to_equity = parameters.get("debt_to_equity", 0.6)
            
            # Direct and mostly linear relationship with interest rates
            # Magnified by leverage ratio
            rate_factor = debt_to_equity * 20.0 * (interest_rate / 5.0 - 1.0)
            
            # Some debt may be fixed rate vs. variable
            # Assuming 60% variable rate exposure
            variable_exposure = 0.6
            
            base_impact = rate_factor * variable_exposure
            
            # Relatively low noise as this relationship is more deterministic
            # than other financial metrics
            volatility = 0.5 + 0.2 * debt_to_equity
            noise = np.random.normal(0, volatility)  
            
            return base_impact + noise
            
        elif metric == "gross_margin":
            inflation_rate = parameters.get("inflation_rate", 3.0)
            exchange_rate = parameters.get("exchange_rate", 0.72)
            material_costs = parameters.get("material_costs", 2.8)
            labor_costs = parameters.get("labor_costs", 3.5)
            economic_growth = parameters.get("economic_growth", 2.5)
            
            # Cost factors - direct impact from inflation and input costs
            cost_factor = -1.8 * (material_costs / 2.8 - 1.0) - 1.4 * (labor_costs / 3.5 - 1.0)
            
            # Import cost impacts from exchange rate changes
            # Most Australian businesses are net importers
            import_factor = -2.4 * (0.72 / exchange_rate - 1.0) if exchange_rate < 0.72 else -0.9 * (0.72 / exchange_rate - 1.0)
            
            # Inflation impact on input costs vs pricing power
            # Moderate inflation can be passed through, high inflation hurts margins
            inflation_factor = -0.5 * inflation_rate if inflation_rate <= 3.0 else -0.5 * 3.0 - 1.5 * (inflation_rate - 3.0)
            
            # Pricing power from economic strength
            # Stronger economy allows more cost pass-through
            pricing_factor = 0.8 * economic_growth
            
            # Combined effect
            base_impact = cost_factor + import_factor + inflation_factor + pricing_factor
            
            # Noise component - margins have moderate volatility
            volatility = 0.7 + 0.3 * max(0, inflation_rate - 3.0)
            noise = np.random.normal(0, volatility)  
            
            return base_impact + noise
        
        # Default calculation for other metrics
        else:
            # Generic economic model with reasonable parameters
            interest_rate = parameters.get("interest_rate", 5.0)
            economic_growth = parameters.get("economic_growth", 2.5)
            inflation_rate = parameters.get("inflation_rate", 3.0)
            exchange_rate = parameters.get("exchange_rate", 0.72)
            
            # General economic impact formula
            impact = (
                -1.5 * (interest_rate - 5.0) +    # Interest rate effect
                2.0 * np.log(1 + economic_growth / 2.0) +  # Growth effect (diminishing returns)
                -1.0 * max(0, inflation_rate - 3.0) +  # Inflation effect (threshold model)
                -1.2 * (0.72 / exchange_rate - 1.0)  # Exchange rate effect
            )
            
            # Default volatility based on economic factors
            volatility = 0.8 + 0.2 * abs(economic_growth - 2.5)
            noise = np.random.normal(0, volatility)
            
            return impact + noise
    
    def _analyze_distribution(self, metric, values):
        values = np.array(values)
        
        # Calculate basic statistics
        mean_value = np.mean(values)
        median_value = np.median(values)
        std_value = np.std(values)
        min_value = np.min(values)
        max_value = np.max(values)
        
        # Calculate percentiles
        p10 = np.percentile(values, 10)
        p25 = np.percentile(values, 25)
        p75 = np.percentile(values, 75)
        p90 = np.percentile(values, 90)
        
        # Calculate probabilities for thresholds
        prob_negative = np.mean(values < 0)
        prob_sig_negative = np.mean(values < -5)
        prob_sig_positive = np.mean(values > 5)
        
        # Generate histogram
        hist, bin_edges = np.histogram(values, bins=20)
        bin_centers = [(bin_edges[i] + bin_edges[i+1]) / 2 for i in range(len(bin_edges)-1)]
        
        # Create threshold probabilities
        thresholds = [
            {"threshold": 0, "probability": float(prob_negative), "comparison": "<"},
            {"threshold": -5, "probability": float(prob_sig_negative), "comparison": "<"},
            {"threshold": 5, "probability": float(prob_sig_positive), "comparison": ">"}
        ]
        
        # Create histogram data
        histogram = {
            "bin_centers": bin_centers,
            "frequencies": hist.tolist()
        }
        
        # Create the distribution object
        distribution = {
            "metric": metric,
            "mean": float(mean_value),
            "median": float(median_value),
            "std": float(std_value),
            "min": float(min_value),
            "max": float(max_value),
            "percentile_10": float(p10),
            "percentile_25": float(p25),
            "percentile_75": float(p75),
            "percentile_90": float(p90),
            "probabilities": thresholds,
            "histogram": histogram
        }
        
        return distribution

# API Endpoints
@router.post("/scenario-sensitivity-analysis")
async def analyze_scenario_sensitivity2(request: SensitivityAnalysisRequest) -> SensitivityAnalysisResponse:
    try:
        # Import SensitivityAnalysis from scenario_analysis module
        from app.apis.scenario_analysis import SensitivityAnalysis
        
        # Get scenario name
        scenario_name = "Unknown"
        if request.scenario_id == "scenario-123":
            scenario_name = "Custom Interest Rate Scenario"
        elif request.scenario_id == "template-interest-rate-hike":
            scenario_name = "RBA Interest Rate Hike"
        elif request.scenario_id == "template-aud-depreciation":
            scenario_name = "AUD Depreciation"
        elif request.scenario_id == "template-labor-cost-increase":
            scenario_name = "Labor Cost Increase"
        elif request.scenario_id == "template-supply-chain-disruption":
            scenario_name = "Supply Chain Disruption"
        
        # Mock base parameter values
        base_parameters = {
            "interest_rate": 5.0,
            "economic_growth": 2.5,
            "inflation_rate": 3.0,
            "exchange_rate": 0.72,
            "market_growth": 1.8,
            "marketing_spend": 2.0,
            "labor_costs": 3.5,
            "material_costs": 2.8,
            "tax_rate": 30.0,
            "debt_to_equity": 0.6
        }
        
        # Filter parameters to analyze if specified
        parameters_to_analyze = request.parameters_to_analyze or list(base_parameters.keys())
        filtered_parameters = {k: v for k, v in base_parameters.items() if k in parameters_to_analyze}
        
        # Perform sensitivity analysis
        sensitivity_analyzer = SensitivityAnalysis(
            parameters=filtered_parameters,
            base_values=base_parameters,
            target_metric=request.target_metric,
            variation_range=request.variation_range,
            steps=request.steps
        )
        
        sensitivities, parameter_charts = sensitivity_analyzer.analyze()
        
        # Create response
        return SensitivityAnalysisResponse(
            scenario_id=request.scenario_id,
            scenario_name=scenario_name,
            target_metric=request.target_metric,
            sensitivities=sensitivities,
            parameter_charts=parameter_charts
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing scenario sensitivity: {str(e)}") from e

@router.post("/scenario-monte-carlo-simulation")
async def run_monte_carlo_simulation2(request: MonteCarloSimulationRequest) -> MonteCarloSimulationResponse:
    try:
        from app.apis.scenario_analysis import MonteCarloSimulation
        
        # Get scenario name
        scenario_name = "Unknown"
        if request.scenario_id == "scenario-123":
            scenario_name = "Custom Interest Rate Scenario"
        elif request.scenario_id == "template-interest-rate-hike":
            scenario_name = "RBA Interest Rate Hike"
        elif request.scenario_id == "template-aud-depreciation":
            scenario_name = "AUD Depreciation"
        elif request.scenario_id == "template-labor-cost-increase":
            scenario_name = "Labor Cost Increase"
        elif request.scenario_id == "template-supply-chain-disruption":
            scenario_name = "Supply Chain Disruption"
        
        # Run Monte Carlo simulation
        simulator = MonteCarloSimulation(
            parameter_distributions=request.parameter_distributions,
            target_metrics=request.target_metrics,
            num_simulations=request.num_simulations
        )
        
        distributions = simulator.run()
        
        # Create response
        return MonteCarloSimulationResponse(
            scenario_id=request.scenario_id,
            scenario_name=scenario_name,
            num_simulations=request.num_simulations,
            distributions=distributions
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error running Monte Carlo simulation: {str(e)}") from e

@router.post("/calculate-scenario-impact-v3")
async def calculate_scenario_impact_v3(request: EnhancedCalculateScenarioRequest) -> EnhancedScenarioImpactResult:
    try:
        # Get scenario name
        scenario_name = "Unknown"
        if request.scenario_id == "scenario-123":
            scenario_name = "Custom Interest Rate Scenario"
        elif request.scenario_id == "template-interest-rate-hike":
            scenario_name = "RBA Interest Rate Hike"
        elif request.scenario_id == "template-aud-depreciation":
            scenario_name = "AUD Depreciation"
        elif request.scenario_id == "template-labor-cost-increase":
            scenario_name = "Labor Cost Increase"
        elif request.scenario_id == "template-supply-chain-disruption":
            scenario_name = "Supply Chain Disruption"
        
        # Base financial impacts calculation with realistic Australian economic modeling
        # Customize impacts based on the scenario type
        if request.scenario_id == "template-interest-rate-hike":
            # RBA rate hike scenario - Australian business impact model
            financial_impacts = {
                "revenue": -1.2,  # Slight impact on revenue due to reduced consumer spending
                "ebitda": -3.8,   # Stronger impact on EBITDA due to higher costs
                "cash_flow": -4.5, # Significant impact on cash flow due to higher debt servicing
                "debt_servicing_cost": 15.8, # Direct impact on debt costs
                "gross_margin": -1.2, # Some pricing power to offset
                "net_profit": -5.6,  # Magnified effect on bottom line 
                "working_capital": -3.4 # Increased inventory costs and potentially longer collection periods
            }
        elif request.scenario_id == "template-aud-depreciation":
            # AUD depreciation scenario
            financial_impacts = {
                "revenue": 2.8,    # Positive for exporters, Australian export-weighted
                "ebitda": -1.5,    # Mixed effect - export benefits but import cost increases
                "cash_flow": -2.2,  # Pressure from import costs before export benefits materialize
                "debt_servicing_cost": 0.5, # Minor impact if foreign-denominated debt is small
                "gross_margin": -2.4,  # Cost pressures from imports
                "net_profit": -0.8,    # Mixed effect
                "working_capital": -4.2  # Higher inventory costs and import payments
            }
        elif request.scenario_id == "template-labor-cost-increase":
            # Labor cost increase scenario - Fair Work Commission wage decisions
            financial_impacts = {
                "revenue": 0.3,    # Slight positive from increased consumer spending power
                "ebitda": -4.2,    # Significant impact due to Australia's high labor costs
                "cash_flow": -3.8,  # Immediate impact on outflows
                "debt_servicing_cost": 0.0, # No direct effect
                "gross_margin": -3.6,  # Direct margin pressure
                "net_profit": -4.9,    # Significant bottom line impact
                "working_capital": -1.2  # Some pressure on working capital
            }
        elif request.scenario_id == "template-supply-chain-disruption":
            # Supply chain disruption - particularly relevant for island nation
            financial_impacts = {
                "revenue": -3.8,    # Lost sales from stockouts and delays
                "ebitda": -5.2,    # Higher costs and lost revenue
                "cash_flow": -4.5,  # Increased inventory costs and advance payments
                "debt_servicing_cost": 1.2, # Slight increase from working capital financing
                "gross_margin": -4.8,  # Higher input and logistics costs
                "net_profit": -6.4,    # Significant bottom line impact
                "working_capital": -7.5  # Major increase in inventory costs and buffer stocks
            }
        else:
            # Default custom scenario uses a moderate impact profile
            financial_impacts = {
                "revenue": -2.5,
                "ebitda": -3.8,
                "cash_flow": -4.2,
                "debt_servicing_cost": 15.0,
                "gross_margin": -1.8,
                "net_profit": -5.2,
                "working_capital": -3.1
            }
        
        # Business unit impacts tailored to Australian industry sectors
        if request.scenario_id == "template-interest-rate-hike":
            business_unit_impacts = {
                "retail": {"revenue": -3.5, "margin": -1.2},  # Consumer-facing, sensitive to rates
                "wholesale": {"revenue": -2.1, "margin": -0.8}, # B2B slightly less affected
                "manufacturing": {"revenue": -1.8, "margin": -2.0}, # Capital intensive but some pricing power
                "mining": {"revenue": -0.5, "margin": -0.3},  # Less sensitive to domestic rates
                "services": {"revenue": -2.7, "margin": -1.5}  # Mixed impact based on sector
            }
        elif request.scenario_id == "template-aud-depreciation":
            business_unit_impacts = {
                "retail": {"revenue": -2.8, "margin": -3.2},  # Import-heavy, cost pressures
                "wholesale": {"revenue": -1.2, "margin": -2.4}, # Mixed import/export
                "manufacturing": {"revenue": 3.5, "margin": -1.5}, # Export upside, import cost pressure
                "mining": {"revenue": 5.2, "margin": 2.8},  # Major winner - AUD-denominated costs, USD revenues
                "agriculture": {"revenue": 4.8, "margin": 2.2},  # Export oriented
                "services": {"revenue": 1.2, "margin": 0.8}  # Some export opportunities (education, tourism)
            }
        elif request.scenario_id == "template-labor-cost-increase":
            business_unit_impacts = {
                "retail": {"revenue": 0.8, "margin": -3.8},  # Higher consumer spending but labor intensive
                "wholesale": {"revenue": 0.3, "margin": -2.0}, # Less labor intensive
                "manufacturing": {"revenue": 0.2, "margin": -4.2}, # Labor intensive
                "healthcare": {"revenue": 0.6, "margin": -5.5},  # Very labor intensive
                "technology": {"revenue": 0.1, "margin": -1.2},  # Less labor intensive
                "services": {"revenue": 0.5, "margin": -4.5}  # Labor intensive
            }
        elif request.scenario_id == "template-supply-chain-disruption":
            business_unit_impacts = {
                "retail": {"revenue": -4.2, "margin": -3.5},  # Inventory shortages
                "wholesale": {"revenue": -3.8, "margin": -2.5}, # Distribution challenges
                "manufacturing": {"revenue": -5.5, "margin": -4.8}, # Component shortages
                "construction": {"revenue": -6.2, "margin": -5.5},  # Material shortages and delays
                "healthcare": {"revenue": -3.2, "margin": -2.8},  # Medical supply constraints
                "technology": {"revenue": -4.5, "margin": -3.2}  # Semiconductor and component shortages
            }
        else:
            # Default business unit impacts for custom scenarios
            business_unit_impacts = {
                "retail": {"revenue": -3.1, "margin": -1.5},
                "wholesale": {"revenue": -2.0, "margin": -0.8},
                "manufacturing": {"revenue": -1.8, "margin": -2.2}
            }
        
        # Risk assessment based on financial impacts
        risk_scores = [abs(impact) if impact < 0 else 0 for impact in financial_impacts.values()]
        risk_level = min(0.95, sum(risk_scores) / (len(risk_scores) * 10))  # Scale to max 0.95
        
        # Opportunity assessment based on financial impacts
        opp_scores = [impact if impact > 0 else 0 for impact in financial_impacts.values()]
        opportunity_level = min(0.95, sum(opp_scores) / (len(opp_scores) * 10))  # Scale to max 0.95
        
        # Generate scenario-specific recommendations with Australian economic context
        recommended_actions = []
        if request.scenario_id == "scenario-123" or request.scenario_id == "template-interest-rate-hike":
            recommended_actions = [
                "Review debt structure and consider fixing rates on loans given RBA tightening cycle",
                "Implement interest rate swaps or caps to protect against further increases",
                "Optimize working capital to reduce debt requirements and minimize cash conversion cycle",
                "Evaluate pricing strategy, particularly for non-essential goods and services",
                "Consider debt consolidation to secure lower blended rates before further increases",
                "Review property strategy - potential to capitalize on cooling commercial market"
            ]
        elif request.scenario_id == "template-aud-depreciation":
            recommended_actions = [
                "Develop currency risk management policy with clear hedging guidelines",
                "Review import procurement strategy and consider advancing purchases before further depreciation",
                "Assess export market opportunities, particularly in Asia-Pacific region",
                "Consider natural hedging through matching foreign currency revenue and expenses",
                "Evaluate pricing strategy for products with high import component - potential for dynamic pricing",
                "Review contracts for currency adjustment clauses to pass through exchange rate impacts"
            ]
        elif request.scenario_id == "template-labor-cost-increase":
            recommended_actions = [
                "Review labor efficiency metrics and implement productivity initiatives",
                "Evaluate automation and digital transformation opportunities",
                "Assess compensation structure against Fair Work awards and enterprise agreements",
                "Develop workforce planning strategy to optimize casual vs. permanent mix",
                "Create career development pathways to improve retention and reduce turnover costs",
                "Implement activity-based costing to identify labor-intensive processes for optimization"
            ]
        elif request.scenario_id == "template-supply-chain-disruption":
            recommended_actions = [
                "Map end-to-end supply chain with focus on international shipping vulnerabilities",
                "Develop alternative supplier relationships in multiple geographic regions",
                "Implement strategic inventory buffers based on criticality and lead times",
                "Evaluate nearshoring options within Asia-Pacific region",
                "Implement real-time supply chain visibility solutions with predictive analytics",
                "Review force majeure clauses in supplier contracts and strengthen where possible"
            ]
        else:
            recommended_actions = [
                "Conduct comprehensive scenario planning workshops with leadership team",
                "Develop Australian-specific key risk indicators based on RBA and ABS data",
                "Create cross-functional response team with clear escalation protocols",
                "Review business continuity plans with focus on geographic isolation challenges",
                "Implement rolling forecast process to quickly adapt to changing conditions"
            ]
        
        # Create base result
        result = EnhancedScenarioImpactResult(
            scenario_id=request.scenario_id,
            scenario_name=scenario_name,
            financial_impacts=financial_impacts,
            business_unit_impacts=business_unit_impacts,
            risk_level=risk_level,
            opportunity_level=opportunity_level,
            recommended_actions=recommended_actions
        )
        
        # Add sensitivity analysis if requested
        if request.include_sensitivity_analysis:
            # Creating Australian-specific parameter distributions for sensitivity testing
            if request.scenario_id == "template-interest-rate-hike":
                parameter_distributions = {
                    "interest_rate": ParameterDistribution(
                        type=DistributionType.TRIANGULAR,
                        min=4.35,  # RBA floor based on current cycle
                        max=7.85,   # Historical stress levels
                        mode=5.85   # Expected peak rate in current cycle
                    ),
                    "debt_to_equity": ParameterDistribution(
                        type=DistributionType.TRIANGULAR,
                        min=0.4,
                        max=1.1,
                        mode=0.65
                    ),
                    "housing_price_change": ParameterDistribution(
                        type=DistributionType.TRIANGULAR,
                        min=-12.0,  # Historical Australian housing corrections
                        max=2.0,    # Limited upside in rising rate environment 
                        mode=-6.0   # Expected correction
                    )
                }
            elif request.scenario_id == "template-aud-depreciation":
                parameter_distributions = {
                    "exchange_rate": ParameterDistribution(
                        type=DistributionType.TRIANGULAR,
                        min=0.58,  # Stress scenario - Asian financial crisis levels
                        max=0.72,  # Current trading range top
                        mode=0.65  # Expected level
                    ),
                    "import_cost_inflation": ParameterDistribution(
                        type=DistributionType.TRIANGULAR,
                        min=3.5,
                        max=12.0,
                        mode=7.5
                    ),
                    "export_volume_change": ParameterDistribution(
                        type=DistributionType.TRIANGULAR,
                        min=1.0,  # Limited increase
                        max=15.0, # Strong export response
                        mode=6.0  # Expected response
                    )
                }
            elif request.scenario_id == "template-labor-cost-increase":
                parameter_distributions = {
                    "wage_growth": ParameterDistribution(
                        type=DistributionType.TRIANGULAR,
                        min=3.5,   # Minimum award increases
                        max=8.0,   # High pressure sectors
                        mode=5.5   # Expected increases
                    ),
                    "productivity_change": ParameterDistribution(
                        type=DistributionType.TRIANGULAR,
                        min=-1.0,  # Productivity declines
                        max=3.0,   # Productivity improvements
                        mode=0.8   # Modest improvement
                    ),
                    "labor_cost_percentage": ParameterDistribution(
                        type=DistributionType.TRIANGULAR,
                        min=15.0,  # Low labor industries
                        max=45.0,  # High labor industries
                        mode=28.0  # Australian average
                    )
                }
            elif request.scenario_id == "template-supply-chain-disruption":
                parameter_distributions = {
                    "lead_time_increase": ParameterDistribution(
                        type=DistributionType.TRIANGULAR,
                        min=30.0,  # Percent increase in lead times
                        max=200.0, # Severe disruption
                        mode=80.0  # Expected scenario
                    ),
                    "alternative_sourcing_premium": ParameterDistribution(
                        type=DistributionType.TRIANGULAR,
                        min=5.0,
                        max=40.0,
                        mode=18.0
                    ),
                    "inventory_holding_cost": ParameterDistribution(
                        type=DistributionType.TRIANGULAR,
                        min=12.0,  # Percent of inventory value
                        max=30.0,  # High scenario
                        mode=20.0  # Expected level
                    )
                }
            else:     
                # Default parameter distributions for custom scenarios
                parameter_distributions = {
                    "interest_rate": ParameterDistribution(
                        type=DistributionType.TRIANGULAR,
                        min=3.0,
                        max=8.0,
                        mode=5.0
                    ),
                    "exchange_rate": ParameterDistribution(
                        type=DistributionType.TRIANGULAR,
                        min=0.6,
                        max=0.8,
                        mode=0.72
                    )
                }
            
            # Create tornado data for each metric using parameter distributions
            tornado_data = {}
            
            # Extract base values for simulation
            base_values = {}
            for param, dist in parameter_distributions.items():
                if dist.type == DistributionType.TRIANGULAR:
                    base_values[param] = dist.mode
                elif dist.type == DistributionType.NORMAL:
                    base_values[param] = dist.mean
                else:
                    base_values[param] = (dist.min + dist.max) / 2
            
            # Analyze sensitivity for key metrics
            for metric in list(financial_impacts.keys())[:3]:  # Limit to first 3 for performance
                sensitivity_analyzer = SensitivityAnalysis(
                    parameters=base_values,
                    base_values=base_values,
                    target_metric=metric,
                    variation_range=0.2,
                    steps=5
                )
                
                sensitivities, _ = sensitivity_analyzer.analyze()
                tornado_data[metric] = sensitivities
            
            # Add to result
            result.sensitivity_analysis = SensitivityAnalysisData(
                metrics=list(financial_impacts.keys()),
                tornado_data=tornado_data
            )
        
        # Add Monte Carlo simulation results if requested
        if request.include_monte_carlo:
            # Using the same parameter distributions from sensitivity analysis for consistency
            # Run Monte Carlo simulation for key metrics
            if not hasattr(result, 'monte_carlo_results'):
                result.monte_carlo_results = {}
            
            # Set up simulation parameters
            simulation_runs = 1000  # Number of Monte Carlo iterations
            
            # Calculate distribution of financial outcomes
            simulator = MonteCarloSimulation(
                parameter_distributions=parameter_distributions,
                metrics=list(financial_impacts.keys())[:3],  # Limit to first 3 for performance
                simulation_runs=simulation_runs
            )
            
            # Run the simulation
            simulation_results = simulator.simulate()
            
            # Add extra context for Australian businesses
            result.monte_carlo_results = {
                "distributions": simulation_results,
                "confidence_intervals": {},
                "australian_market_context": {}
            }
            
            # Add 90% confidence intervals for each metric
            for metric in simulation_results.keys():
                values = simulation_results[metric]
                sorted_values = sorted(values)
                lower_bound = sorted_values[int(0.05 * simulation_runs)]
                upper_bound = sorted_values[int(0.95 * simulation_runs)]
                result.monte_carlo_results["confidence_intervals"][metric] = [lower_bound, upper_bound]
            
            # Add Australian market context based on scenario
            if request.scenario_id == "template-interest-rate-hike":
                result.monte_carlo_results["australian_market_context"] = {
                    "historical_context": "The RBA has historically moved rates in cycles, with the cash rate peaking at 17.5% in 1990 but rarely exceeding 7.5% since 2000.",
                    "industry_impact": "Retail, construction, and consumer services typically see the strongest negative impacts from rate hikes in the Australian market.",
                    "typical_duration": "Rate hike cycles in Australia typically last 12-18 months before stabilizing or reversing."
                }
            elif request.scenario_id == "template-aud-depreciation":
                result.monte_carlo_results["australian_market_context"] = {
                    "historical_context": "The AUD has ranged from US$0.48 to US$1.10 over the past 30 years, with significant volatility during global crises.",
                    "industry_impact": "Mining, agriculture, education, and tourism typically benefit from AUD depreciation, while import-heavy retail suffers.",
                    "typical_duration": "Currency adjustments typically stabilize within 3-6 months before establishing a new trading range."
                }
            elif request.scenario_id == "template-labor-cost-increase":
                result.monte_carlo_results["australian_market_context"] = {
                    "historical_context": "Fair Work Commission typically mandates minimum wage increases of 2-3.5% annually, with higher adjustments during strong economic periods.",
                    "industry_impact": "Healthcare, hospitality, and retail face the greatest margin pressure from wage increases in Australia.",
                    "typical_duration": "Wage adjustment cycles typically occur annually with the greatest impact in Q3 after July 1 increases."
                }
            elif request.scenario_id == "template-supply-chain-disruption":
                result.monte_carlo_results["australian_market_context"] = {
                    "historical_context": "As an island nation, Australia is particularly vulnerable to shipping disruptions, with freight costs increasing 4-8x during recent global supply chain crises.",
                    "industry_impact": "Construction, manufacturing, and retail face the most severe impacts from supply chain disruptions due to Australia's reliance on imported inputs.",
                    "typical_duration": "Major supply chain disruptions typically take 12-24 months to fully normalize in the Australian context due to geographic isolation."
                }
            else:
                result.monte_carlo_results["australian_market_context"] = {
                    "historical_context": "The Australian economy has experienced 30+ years of growth without technical recession until 2020, demonstrating resilience to global shocks.",
                    "industry_impact": "The Australian market typically sees sector rotation rather than broad market declines during economic shifts.",
                    "typical_duration": "Economic adjustment cycles in Australia typically last 6-18 months before returning to trend growth."
                }

            # Parameter distributions for simulation
            if request.scenario_id == "template-interest-rate-hike":
                parameter_distributions = {
                    "interest_rate": ParameterDistribution(
                        type=DistributionType.TRIANGULAR,
                        min=3.5,  # Lower bound based on RBA baseline
                        max=8.0,  # Upper bound for severe tightening
                        mode=5.0   # Current neutral rate
                    ),
                    "exchange_rate": ParameterDistribution(
                        type=DistributionType.NORMAL,
                        mean=0.72, # Current AUD/USD level
                        std=0.05   # Typical currency volatility
                    ),
                    "economic_growth": ParameterDistribution(
                        type=DistributionType.TRIANGULAR,
                        min=0.8,   # Recessionary scenario
                        max=4.0,   # Strong growth scenario
                        mode=2.5    # Most likely moderate growth
                    ),
                    "inflation_rate": ParameterDistribution(
                        type=DistributionType.NORMAL,
                        mean=3.0,  # RBA target band midpoint
                        std=0.7    # Inflation volatility
                    ),
                    "debt_to_equity": ParameterDistribution(
                        type=DistributionType.NORMAL,
                        mean=0.6,  # Australian corporate average
                        std=0.15   # Variation across businesses
                    )
                }
            
            # Create Monte Carlo simulation
            simulator = MonteCarloSimulation(
                parameter_distributions=parameter_distributions,
                target_metrics=list(financial_impacts.keys())[:3],  # Limit to first 3 for performance
                num_simulations=request.monte_carlo_simulations
            )
            
            # Run simulation
            distributions = simulator.run()
            
            # Process results into the expected format
            summary_statistics = {}
            probabilities = {}
            
            for dist in distributions:
                metric = dist["metric"]
                
                summary_statistics[metric] = MetricStatistics(
                    mean=dist["mean"],
                    median=dist["median"],
                    std=dist["std"],
                    min=dist["min"],
                    max=dist["max"],
                    percentile_10=dist.get("percentile_10", dist.get("10th_percentile", 0)),
                    percentile_25=dist.get("percentile_25", dist.get("25th_percentile", 0)),
                    percentile_75=dist.get("percentile_75", dist.get("75th_percentile", 0)),
                    percentile_90=dist.get("percentile_90", dist.get("90th_percentile", 0))
                )
                
                # Find probabilities from the thresholds
                prob_negative = next((p["probability"] for p in dist["probabilities"] if p["threshold"] == 0 and p["comparison"] == "<"), 0)
                prob_sig_negative = next((p["probability"] for p in dist["probabilities"] if p["threshold"] == -5 and p["comparison"] == "<"), 0)
                prob_sig_positive = next((p["probability"] for p in dist["probabilities"] if p["threshold"] == 5 and p["comparison"] == ">"), 0)
                
                probabilities[metric] = MetricProbabilities(
                    negative=prob_negative,
                    significantly_negative=prob_sig_negative,
                    significantly_positive=prob_sig_positive,
                    histogram=HistogramData(
                        bin_centers=dist["histogram"]["bin_centers"],
                        frequencies=dist["histogram"]["frequencies"]
                    )
                )
            
            # Add to result
            result.monte_carlo_results = MonteCarloResults(
                summary_statistics=summary_statistics,
                probabilities=probabilities
            )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating enhanced scenario impact: {str(e)}") from e