import databutton as db
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Any, Optional
from enum import Enum
from pydantic import BaseModel, Field
from dataclasses import dataclass
from fastapi import APIRouter, HTTPException

# Enums and models
class DistributionType(str, Enum):
    NORMAL = "normal"
    TRIANGULAR = "triangular"
    UNIFORM = "uniform"
    DISCRETE = "discrete"

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
    parameter_charts: Optional[Dict[str, ParameterChart]] = None

class ParameterDistribution(BaseModel):
    type: str
    min: Optional[float] = None
    max: Optional[float] = None
    mean: Optional[float] = None
    std: Optional[float] = None
    mode: Optional[float] = None
    values: Optional[List[float]] = None
    probabilities: Optional[List[float]] = None

class ThresholdProbability(BaseModel):
    threshold: float
    probability: float
    comparison: str  # "<", ">", "<=", ">="

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
    negative: float  # Probability of negative impact
    significantly_negative: float  # Probability of impact worse than -5%
    significantly_positive: float  # Probability of impact better than +5%
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

# Core calculation classes

class SensitivityAnalysis:
    """
    SensitivityAnalysis performs what-if analysis by varying individual parameters
    one at a time while holding others constant, to determine the impact on a target metric.
    """
    def __init__(
        self, 
        parameters: Dict[str, float],
        base_values: Dict[str, float],
        target_metric: str,
        variation_range: float = 0.2,  # Default 20% variation
        steps: int = 5
    ):
        """
        Initialize the sensitivity analysis.
        
        Args:
            parameters: Dictionary of parameters to analyze with their base values
            base_values: Dictionary of all parameters with their base values
            target_metric: The metric to analyze sensitivity for
            variation_range: How much to vary parameters (as a decimal, e.g., 0.2 = 20%)
            steps: Number of variation steps to use for each parameter
        """
        self.parameters = parameters
        self.base_values = base_values
        self.target_metric = target_metric
        self.variation_range = variation_range
        self.steps = steps
    
    def _calculate_impact(self, modified_params: Dict[str, float]) -> float:
        """
        Calculate the impact on the target metric given a set of parameter values.
        This is a simplified model and would be replaced with a real financial model in production.
        
        Args:
            modified_params: Modified parameter values
            
        Returns:
            Percentage impact on the target metric
        """
        # In a real system, this would use a more sophisticated model
        # For demonstration purposes, we'll use a simplified model where each parameter
        # has a weight representing its impact on the target metric.
        
        # Define parameter weights for each metric
        weights = {
            "revenue": {
                "interest_rate": -0.2,
                "economic_growth": 0.8,
                "inflation_rate": -0.3,
                "exchange_rate": 0.4,
                "market_growth": 0.9,
                "marketing_spend": 0.5,
                "labor_costs": -0.2,
                "material_costs": -0.4,
                "tax_rate": 0.0,
                "debt_to_equity": -0.1
            },
            "ebitda": {
                "interest_rate": -0.1,
                "economic_growth": 0.6,
                "inflation_rate": -0.5,
                "exchange_rate": 0.3,
                "market_growth": 0.7,
                "marketing_spend": 0.2,
                "labor_costs": -0.6,
                "material_costs": -0.7,
                "tax_rate": 0.0,
                "debt_to_equity": -0.1
            },
            "cash_flow": {
                "interest_rate": -0.6,
                "economic_growth": 0.5,
                "inflation_rate": -0.4,
                "exchange_rate": 0.2,
                "market_growth": 0.6,
                "marketing_spend": -0.1,
                "labor_costs": -0.5,
                "material_costs": -0.4,
                "tax_rate": -0.3,
                "debt_to_equity": -0.7
            },
            "gross_margin": {
                "interest_rate": -0.1,
                "economic_growth": 0.3,
                "inflation_rate": -0.6,
                "exchange_rate": 0.5,
                "market_growth": 0.4,
                "marketing_spend": 0.1,
                "labor_costs": -0.7,
                "material_costs": -0.8,
                "tax_rate": 0.0,
                "debt_to_equity": 0.0
            },
            "debt_servicing_cost": {
                "interest_rate": 0.9,
                "economic_growth": -0.2,
                "inflation_rate": 0.5,
                "exchange_rate": -0.3,
                "market_growth": -0.1,
                "marketing_spend": 0.0,
                "labor_costs": 0.0,
                "material_costs": 0.0,
                "tax_rate": 0.0,
                "debt_to_equity": 0.8
            }
        }
        
        # Add additional metrics
        weights["net_profit"] = {
            "interest_rate": -0.5,
            "economic_growth": 0.7,
            "inflation_rate": -0.4,
            "exchange_rate": 0.3,
            "market_growth": 0.8,
            "marketing_spend": 0.3,
            "labor_costs": -0.6,
            "material_costs": -0.5,
            "tax_rate": -0.7,
            "debt_to_equity": -0.2
        }
        
        weights["working_capital"] = {
            "interest_rate": -0.3,
            "economic_growth": 0.4,
            "inflation_rate": -0.5,
            "exchange_rate": 0.2,
            "market_growth": 0.3,
            "marketing_spend": -0.2,
            "labor_costs": -0.3,
            "material_costs": -0.6,
            "tax_rate": -0.1,
            "debt_to_equity": -0.4
        }
        
        impact = 0.0
        # Loop through each parameter and calculate its contribution to the impact
        for param, value in modified_params.items():
            if param in weights.get(self.target_metric, {}):
                # Calculate the percentage change in the parameter
                base_value = self.base_values.get(param, 1.0)  # Default to 1.0 if not found
                if base_value != 0:  # Avoid division by zero
                    pct_change = (value - base_value) / base_value
                    # Multiply by the parameter's weight to get its contribution
                    impact += pct_change * weights[self.target_metric][param] * 100
        
        # Add some non-linearity to make it more realistic
        impact = impact * (1 + abs(impact) * 0.01)
        
        return impact

    def analyze(self) -> Tuple[List[ParameterSensitivity], Dict[str, ParameterChart]]:
        """
        Perform sensitivity analysis on each parameter.
        
        Returns:
            Tuple of (sensitivities, parameter_charts)
        """
        sensitivities = []
        parameter_charts = {}
        
        # For each parameter, vary it and observe the impact
        for param, base_value in self.parameters.items():
            # Skip if parameter has zero or invalid value
            if base_value == 0 or not isinstance(base_value, (int, float)):
                continue
                
            # Define variation range for this parameter
            min_value = base_value * (1 - self.variation_range)
            max_value = base_value * (1 + self.variation_range)
            step_size = (max_value - min_value) / (self.steps - 1) if self.steps > 1 else 0
            
            # Generate parameter values
            param_values = [min_value + i * step_size for i in range(self.steps)]
            impact_values = []
            
            # Calculate impact for each parameter value
            min_impact = float('inf')
            max_impact = float('-inf')
            
            for param_value in param_values:
                # Create modified parameters (keep all other params at base values)
                modified_params = self.base_values.copy()
                modified_params[param] = param_value
                
                # Calculate the impact
                impact = self._calculate_impact(modified_params)
                impact_values.append(impact)
                
                min_impact = min(min_impact, impact)
                max_impact = max(max_impact, impact)
            
            # Store results
            sensitivities.append(
                ParameterSensitivity(
                    parameter=param,
                    min_impact=min_impact,
                    max_impact=max_impact,
                    range=abs(max_impact - min_impact)
                )
            )
            
            parameter_charts[param] = ParameterChart(
                parameter_values=param_values,
                impact_values=impact_values
            )
        
        # Sort sensitivities by range (most sensitive first)
        sensitivities.sort(key=lambda x: x.range, reverse=True)
        
        return sensitivities, parameter_charts

# Define router
router = APIRouter(prefix="/calculation-engine")


# Request models
class SensitivityAnalysisRequest(BaseModel):
    scenario_id: str
    scenario_name: str
    parameters: Dict[str, float]
    base_values: Dict[str, float]
    target_metric: str
    variation_range: Optional[float] = 0.2
    steps: Optional[int] = 5


class MonteCarloSimulationRequest(BaseModel):
    scenario_id: str
    scenario_name: str
    parameter_distributions: Dict[str, ParameterDistribution]
    target_metrics: List[str]
    num_simulations: Optional[int] = 1000


class MonteCarloSimulation:
    """
    MonteCarloSimulation performs Monte Carlo simulations by sampling from parameter
    distributions and calculating the resulting distribution of target metrics.
    """
    def __init__(
        self,
        parameter_distributions: Dict[str, ParameterDistribution],
        target_metrics: List[str],
        num_simulations: int = 1000
    ):
        """
        Initialize the Monte Carlo simulation.
        
        Args:
            parameter_distributions: Dictionary of parameter names and their distributions
            target_metrics: List of target metrics to analyze
            num_simulations: Number of Monte Carlo simulations to run
        """
        self.parameter_distributions = parameter_distributions
        self.target_metrics = target_metrics
        self.num_simulations = num_simulations
    
    def _sample_from_distribution(self, dist: ParameterDistribution) -> float:
        """
        Sample a value from the specified distribution.
        
        Args:
            dist: Parameter distribution
            
        Returns:
            Sampled value
        """
        if dist.type == DistributionType.NORMAL:
            # Normal distribution requires mean and std
            if dist.mean is None or dist.std is None:
                raise ValueError("Normal distribution requires mean and std")
            return float(np.random.normal(dist.mean, dist.std))
        
        elif dist.type == DistributionType.TRIANGULAR:
            # Triangular distribution requires min, max, and mode
            if dist.min is None or dist.max is None or dist.mode is None:
                raise ValueError("Triangular distribution requires min, max, and mode")
            return float(np.random.triangular(dist.min, dist.mode, dist.max))
        
        elif dist.type == DistributionType.UNIFORM:
            # Uniform distribution requires min and max
            if dist.min is None or dist.max is None:
                raise ValueError("Uniform distribution requires min and max")
            return float(np.random.uniform(dist.min, dist.max))
        
        elif dist.type == DistributionType.DISCRETE:
            # Discrete distribution requires values and probabilities
            if dist.values is None or dist.probabilities is None:
                raise ValueError("Discrete distribution requires values and probabilities")
            return float(np.random.choice(dist.values, p=dist.probabilities))
        
        else:
            raise ValueError(f"Unknown distribution type: {dist.type}")
    
    def _calculate_metrics(self, params: Dict[str, float]) -> Dict[str, float]:
        """
        Calculate the target metrics given a set of parameter values.
        This is a simplified model and would be replaced with a real financial model in production.
        
        Args:
            params: Parameter values
            
        Returns:
            Dictionary of metric names and their values
        """
        # Similar to sensitivity analysis, we'll use a simplified model
        # In a real system, this would be a more sophisticated financial model
        
        # Define parameter weights for each metric (as in sensitivity analysis)
        weights = {
            "revenue": {
                "interest_rate": -0.2,
                "economic_growth": 0.8,
                "inflation_rate": -0.3,
                "exchange_rate": 0.4,
                "market_growth": 0.9,
                "marketing_spend": 0.5,
                "labor_costs": -0.2,
                "material_costs": -0.4,
                "tax_rate": 0.0,
                "debt_to_equity": -0.1
            },
            "ebitda": {
                "interest_rate": -0.1,
                "economic_growth": 0.6,
                "inflation_rate": -0.5,
                "exchange_rate": 0.3,
                "market_growth": 0.7,
                "marketing_spend": 0.2,
                "labor_costs": -0.6,
                "material_costs": -0.7,
                "tax_rate": 0.0,
                "debt_to_equity": -0.1
            },
            "cash_flow": {
                "interest_rate": -0.6,
                "economic_growth": 0.5,
                "inflation_rate": -0.4,
                "exchange_rate": 0.2,
                "market_growth": 0.6,
                "marketing_spend": -0.1,
                "labor_costs": -0.5,
                "material_costs": -0.4,
                "tax_rate": -0.3,
                "debt_to_equity": -0.7
            },
            "gross_margin": {
                "interest_rate": -0.1,
                "economic_growth": 0.3,
                "inflation_rate": -0.6,
                "exchange_rate": 0.5,
                "market_growth": 0.4,
                "marketing_spend": 0.1,
                "labor_costs": -0.7,
                "material_costs": -0.8,
                "tax_rate": 0.0,
                "debt_to_equity": 0.0
            },
            "debt_servicing_cost": {
                "interest_rate": 0.9,
                "economic_growth": -0.2,
                "inflation_rate": 0.5,
                "exchange_rate": -0.3,
                "market_growth": -0.1,
                "marketing_spend": 0.0,
                "labor_costs": 0.0,
                "material_costs": 0.0,
                "tax_rate": 0.0,
                "debt_to_equity": 0.8
            }
        }
        
        # Add additional metrics
        weights["net_profit"] = {
            "interest_rate": -0.5,
            "economic_growth": 0.7,
            "inflation_rate": -0.4,
            "exchange_rate": 0.3,
            "market_growth": 0.8,
            "marketing_spend": 0.3,
            "labor_costs": -0.6,
            "material_costs": -0.5,
            "tax_rate": -0.7,
            "debt_to_equity": -0.2
        }
        
        weights["working_capital"] = {
            "interest_rate": -0.3,
            "economic_growth": 0.4,
            "inflation_rate": -0.5,
            "exchange_rate": 0.2,
            "market_growth": 0.3,
            "marketing_spend": -0.2,
            "labor_costs": -0.3,
            "material_costs": -0.6,
            "tax_rate": -0.1,
            "debt_to_equity": -0.4
        }
        
        # Base values (standard values for parameters)
        base_values = {
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
        
        results = {}
        
        # Calculate impact for each target metric
        for metric in self.target_metrics:
            impact = 0.0
            if metric in weights:
                # Loop through each parameter and calculate its contribution
                for param, value in params.items():
                    if param in weights[metric]:
                        # Calculate the percentage change in the parameter
                        base_value = base_values.get(param, 1.0)  # Default to 1.0 if not found
                        if base_value != 0:  # Avoid division by zero
                            pct_change = (value - base_value) / base_value
                            # Multiply by the parameter's weight to get its contribution
                            impact += pct_change * weights[metric][param] * 100
                
                # Add some non-linearity and randomness
                impact = impact * (1 + abs(impact) * 0.01)
                impact += np.random.normal(0, 1.5)  # Add some noise to simulate other factors
            
            results[metric] = impact
        
        return results
    
    def run(self) -> List[MetricDistribution]:
        """
        Run the Monte Carlo simulation for each target metric.
        
        Returns:
            List of MetricDistribution objects for each target metric
        """
        # Dictionary to store simulation results for each metric
        all_results = {metric: [] for metric in self.target_metrics}
        
        # Run simulations
        for _ in range(self.num_simulations):
            # Sample parameter values from their distributions
            params = {}
            for param_name, dist in self.parameter_distributions.items():
                params[param_name] = self._sample_from_distribution(dist)
            
            # Calculate metrics for this simulation
            metrics = self._calculate_metrics(params)
            
            # Store results
            for metric, value in metrics.items():
                if metric in all_results:
                    all_results[metric].append(value)
        
        # Process results for each metric
        distribution_results = []
        for metric, values in all_results.items():
            # Convert to numpy array for easier calculations
            np_values = np.array(values)
            
            # Calculate statistics
            mean = float(np.mean(np_values))
            median = float(np.median(np_values))
            std = float(np.std(np_values))
            min_val = float(np.min(np_values))
            max_val = float(np.max(np_values))
            p10 = float(np.percentile(np_values, 10))
            p25 = float(np.percentile(np_values, 25))
            p75 = float(np.percentile(np_values, 75))
            p90 = float(np.percentile(np_values, 90))
            
            # Calculate probabilities for specific thresholds
            prob_negative = float(np.mean(np_values < 0))
            prob_sig_negative = float(np.mean(np_values < -5))
            prob_sig_positive = float(np.mean(np_values > 5))
            
            # Create histogram
            hist, bin_edges = np.histogram(np_values, bins=20)
            bin_centers = [(bin_edges[i] + bin_edges[i+1]) / 2 for i in range(len(bin_edges)-1)]
            
            # Create threshold probabilities
            thresholds = [
                ThresholdProbability(threshold=0, probability=prob_negative, comparison="<"),
                ThresholdProbability(threshold=-5, probability=prob_sig_negative, comparison="<"),
                ThresholdProbability(threshold=5, probability=prob_sig_positive, comparison=">")
            ]
            
            # Create histogram data
            histogram = HistogramData(
                bin_centers=bin_centers,
                frequencies=hist.tolist()
            )
            
            # Create metric distribution
            distribution = MetricDistribution(
                metric=metric,
                mean=mean,
                median=median,
                std=std,
                min=min_val,
                max=max_val,
                percentile_10=p10,
                percentile_25=p25,
                percentile_75=p75,
                percentile_90=p90,
                probabilities=thresholds,
                histogram=histogram
            )
            
            distribution_results.append(distribution)
        
        return distribution_results


# API Endpoints
@router.post("/analyze-sensitivity", response_model=SensitivityAnalysisResponse)
def analyze_engine_sensitivity(request: SensitivityAnalysisRequest):
    """Perform sensitivity analysis on a scenario"""
    try:
        # Initialize sensitivity analysis
        sensitivity = SensitivityAnalysis(
            parameters=request.parameters,
            base_values=request.base_values,
            target_metric=request.target_metric,
            variation_range=request.variation_range,
            steps=request.steps
        )
        
        # Run analysis
        sensitivities, parameter_charts = sensitivity.analyze()
        
        # Create response
        return SensitivityAnalysisResponse(
            scenario_id=request.scenario_id,
            scenario_name=request.scenario_name,
            target_metric=request.target_metric,
            sensitivities=sensitivities,
            parameter_charts=parameter_charts
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error performing sensitivity analysis: {str(e)}") from e


@router.post("/run-monte-carlo", response_model=MonteCarloSimulationResponse)
def run_monte_carlo_simulation(request: MonteCarloSimulationRequest):
    """Run Monte Carlo simulation on a scenario without enhancement"""
    try:
        # Initialize Monte Carlo simulation
        monte_carlo = MonteCarloSimulation(
            parameter_distributions=request.parameter_distributions,
            target_metrics=request.target_metrics,
            num_simulations=request.num_simulations
        )
        
        # Run simulation
        distributions = monte_carlo.run()
        
        # Create response
        return MonteCarloSimulationResponse(
            scenario_id=request.scenario_id,
            scenario_name=request.scenario_name,
            num_simulations=request.num_simulations,
            distributions=distributions
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error running Monte Carlo simulation: {str(e)}") from e
