import numpy as np
import pandas as pd
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, List, Tuple, Any, Optional, Callable, Union
from enum import Enum
from scipy.stats import norm, uniform, triang, lognorm

router = APIRouter()

class DistributionType(str, Enum):
    NORMAL = "normal"
    UNIFORM = "uniform"
    TRIANGULAR = "triangular"
    LOGNORMAL = "lognormal"
    CUSTOM = "custom"

class SensitivityAnalysis:
    """Class for performing sensitivity analysis on financial models"""
    
    def __init__(self, base_parameters: Dict[str, float], impact_function: Callable):
        """Initialize with base parameters and impact calculation function
        
        Args:
            base_parameters: Dictionary of parameter names to their base values
            impact_function: Function that takes parameters dict and returns dict of metrics
        """
        self.base_parameters = base_parameters
        self.impact_function = impact_function
        self.results = {}
    
    def analyze_parameter(self, parameter_name: str, variation_range: float = 0.2, steps: int = 5) -> pd.DataFrame:
        """Analyze a single parameter's impact by varying it across a range
        
        Args:
            parameter_name: The parameter to vary
            variation_range: How far to vary the parameter (as a fraction of base value)
            steps: Number of steps to use across the range
            
        Returns:
            DataFrame containing parameter values and resulting metrics
        """
        if parameter_name not in self.base_parameters:
            raise ValueError(f"Parameter {parameter_name} not found in base parameters")
        
        base_value = self.base_parameters[parameter_name]
        
        # Create range of values to test
        if base_value == 0:
            # Handle case where base value is zero
            values = np.linspace(-0.1, 0.1, steps)
        else:
            # Set range as percentage of base value
            min_val = base_value * (1 - variation_range)
            max_val = base_value * (1 + variation_range)
            values = np.linspace(min_val, max_val, steps)
        
        results_data = []
        
        # Calculate impact for each value
        for value in values:
            # Create a copy of parameters with this value changed
            params = self.base_parameters.copy()
            params[parameter_name] = value
            
            # Calculate impact
            impact = self.impact_function(params)
            
            # Add parameter value to results
            result = {parameter_name: value}
            result.update(impact)
            
            results_data.append(result)
        
        # Convert to DataFrame
        results_df = pd.DataFrame(results_data)
        
        # Store results
        self.results[parameter_name] = results_df
        
        return results_df
    
    def analyze_all_parameters(self, variation_range: float = 0.2, steps: int = 5) -> Dict[str, pd.DataFrame]:
        """Analyze all parameters by varying each one
        
        Args:
            variation_range: How far to vary the parameters (as a fraction of base value)
            steps: Number of steps to use across the range
            
        Returns:
            Dictionary of parameter names to DataFrames with results
        """
        for param in self.base_parameters.keys():
            self.analyze_parameter(param, variation_range, steps)
        
        return self.results
    
    def get_tornado_data(self, metric: str) -> pd.DataFrame:
        """Create data for tornado chart showing parameter sensitivity
        
        Args:
            metric: The metric to analyze sensitivity for
            
        Returns:
            DataFrame with min/max impact and range for each parameter
        """
        if not self.results:
            raise ValueError("No analysis results found. Run analyze_parameter or analyze_all_parameters first.")
        
        # Calculate base case result
        base_result = self.impact_function(self.base_parameters)
        base_value = base_result[metric]
        
        tornado_data = []
        
        for param, df in self.results.items():
            if metric not in df.columns:
                continue
            
            # Find min and max impact relative to base case
            min_impact = df[metric].min() - base_value
            max_impact = df[metric].max() - base_value
            
            # Ensure min_impact is actually the smaller value
            if min_impact > max_impact:
                min_impact, max_impact = max_impact, min_impact
                
            # Calculate range
            impact_range = max_impact - min_impact
            
            tornado_data.append({
                "parameter": param,
                "min_impact": min_impact,
                "max_impact": max_impact,
                "range": impact_range
            })
        
        # Convert to DataFrame and sort by range
        tornado_df = pd.DataFrame(tornado_data)
        tornado_df = tornado_df.sort_values("range", ascending=False)
        
        return tornado_df

class MonteCarloSimulation:
    """Class for running Monte Carlo simulations for financial scenario analysis"""
    
    def __init__(self):
        self.variables = {}
        self.correlations = []
        self.correlation_matrix = None
        self.simulation_results = None
        
    def add_variable(self, name: str, distribution_type: str, **params):
        """Add a variable with a specific probability distribution"""
        self.variables[name] = {
            "type": distribution_type,
            "params": params
        }
        
    def add_custom_variable(self, name: str, values: List[float], weights: Optional[List[float]] = None):
        """Add a variable with a custom probability distribution"""
        if weights is None:
            weights = [1.0/len(values)] * len(values)
        self.variables[name] = {
            "type": "custom",
            "params": {
                "values": values,
                "weights": weights
            }
        }
        
    def add_correlation(self, var1: str, var2: str, coefficient: float):
        """Add correlation between two variables"""
        if var1 not in self.variables or var2 not in self.variables:
            raise ValueError(f"Variables {var1} and {var2} must be added before correlating them")
            
        if coefficient < -1.0 or coefficient > 1.0:
            raise ValueError("Correlation coefficient must be between -1 and 1")
            
        self.correlations.append({
            "var1": var1,
            "var2": var2,
            "coefficient": coefficient
        })
    
    def _build_correlation_matrix(self):
        """Build the correlation matrix for all variables"""
        var_names = list(self.variables.keys())
        n_vars = len(var_names)
        
        # Start with identity matrix (all variables uncorrelated)
        corr_matrix = np.identity(n_vars)
        
        # Fill in correlations
        for corr in self.correlations:
            i = var_names.index(corr["var1"])
            j = var_names.index(corr["var2"])
            corr_matrix[i, j] = corr["coefficient"]
            corr_matrix[j, i] = corr["coefficient"]  # Matrix is symmetric
        
        self.correlation_matrix = corr_matrix
        return corr_matrix
    
    def _generate_correlated_samples(self, n_samples: int):
        """Generate correlated random samples for all variables"""
        if not self.variables:
            raise ValueError("No variables defined for simulation")
            
        var_names = list(self.variables.keys())
        n_vars = len(var_names)
        
        # Build correlation matrix if not already built
        if self.correlation_matrix is None:
            self._build_correlation_matrix()
        
        # Generate uncorrelated standard normal samples
        uncorrelated = np.random.normal(0, 1, size=(n_samples, n_vars))
        
        # Apply Cholesky decomposition to create correlation
        try:
            L = np.linalg.cholesky(self.correlation_matrix)
            correlated_normal = uncorrelated @ L.T
        except np.linalg.LinAlgError:
            # If correlation matrix is not positive definite, use nearest approximation
            print("Warning: Correlation matrix is not positive definite. Using nearest approximation.")
            # Simple approach: set all non-diagonal elements to 0.9 * their value
            for i in range(n_vars):
                for j in range(n_vars):
                    if i != j:
                        self.correlation_matrix[i, j] *= 0.9
            L = np.linalg.cholesky(self.correlation_matrix)
            correlated_normal = uncorrelated @ L.T
        
        # Transform to desired distributions
        samples = {}
        for i, var_name in enumerate(var_names):
            var = self.variables[var_name]
            dist_type = var["type"]
            params = var["params"]
            
            # Get standard normal samples for this variable
            z = correlated_normal[:, i]
            
            if dist_type == "normal":
                mean = params.get("mean", 0)
                std_dev = params.get("std_dev", 1)
                samples[var_name] = z * std_dev + mean
                
            elif dist_type == "uniform":
                min_val = params.get("min_val", 0)
                max_val = params.get("max_val", 1)
                # Convert standard normal to uniform [0, 1] using CDF
                u = norm.cdf(z)
                # Scale to desired range
                samples[var_name] = min_val + u * (max_val - min_val)
                
            elif dist_type == "triangular":
                min_val = params.get("min_val", 0)
                max_val = params.get("max_val", 1)
                mode = params.get("mode", (min_val + max_val) / 2)
                # Convert to uniform [0, 1]
                u = norm.cdf(z)
                # Apply inverse CDF of triangular
                c = (mode - min_val) / (max_val - min_val)  # Calculate c parameter
                samples[var_name] = np.zeros_like(u)
                
                # Apply triangular distribution inverse CDF
                mask1 = u < c
                mask2 = ~mask1
                samples[var_name][mask1] = min_val + np.sqrt(u[mask1] * (max_val - min_val) * (mode - min_val))
                samples[var_name][mask2] = max_val - np.sqrt((1 - u[mask2]) * (max_val - min_val) * (max_val - mode))
                
            elif dist_type == "lognormal":
                mean = params.get("mean", 0)
                sigma = params.get("sigma", 1)
                # For lognormal, we directly use the correlated normal samples
                samples[var_name] = np.exp(mean + sigma * z)
                
            elif dist_type == "custom":
                values = params.get("values", [])
                weights = params.get("weights", [])
                
                if not values:
                    raise ValueError(f"Custom distribution for {var_name} has no values")
                    
                # Convert to uniform [0, 1]
                u = norm.cdf(z)
                
                # Create cumulative weights
                cum_weights = np.cumsum(weights)
                cum_weights = cum_weights / cum_weights[-1]  # Normalize to [0, 1]
                
                # Initialize samples
                samples[var_name] = np.zeros_like(u)
                
                # For each sample, find which bin it falls into
                for j in range(len(values)):
                    if j == 0:
                        mask = u <= cum_weights[j]
                    else:
                        mask = (u > cum_weights[j-1]) & (u <= cum_weights[j])
                    samples[var_name][mask] = values[j]
        
        return samples
    
    def run_simulation(self, n_iterations: int = 1000, impact_function: Optional[Callable] = None) -> Dict:
        """Run the Monte Carlo simulation
        
        Args:
            n_iterations: Number of simulation iterations
            impact_function: Optional function to calculate financial metrics from the simulated variables
            
        Returns:
            Dictionary containing simulation results
        """
        # Generate samples
        samples = self._generate_correlated_samples(n_iterations)
        
        # Initialize results object
        results = {
            "variables": samples,
            "summary": {}
        }
        
        # If impact function provided, calculate metrics
        if impact_function:
            metrics = []
            for i in range(n_iterations):
                # Extract input values for this iteration
                inputs = {var: samples[var][i] for var in samples}
                # Calculate metrics
                iteration_metrics = impact_function(inputs)
                metrics.append(iteration_metrics)
            
            # Combine all iterations
            metric_names = metrics[0].keys() if metrics else []
            for metric in metric_names:
                values = np.array([iteration[metric] for iteration in metrics])
                
                # Calculate summary statistics
                results["summary"][metric] = {
                    "mean": float(np.mean(values)),
                    "median": float(np.median(values)),
                    "std": float(np.std(values)),
                    "min": float(np.min(values)),
                    "max": float(np.max(values)),
                    "percentile_10": float(np.percentile(values, 10)),
                    "percentile_25": float(np.percentile(values, 25)),
                    "percentile_75": float(np.percentile(values, 75)),
                    "percentile_90": float(np.percentile(values, 90)),
                }
        
        self.simulation_results = results
        return results
    
    def analyze_convergence(self, confidence_level: float = 0.95) -> Dict:
        """Analyze convergence of the simulation
        
        Args:
            confidence_level: Confidence level for convergence analysis
            
        Returns:
            Dictionary containing convergence analysis results
        """
        if self.simulation_results is None:
            raise ValueError("No simulation results. Run simulation first.")
            
        convergence_info = {}
        
        for metric, stats in self.simulation_results.get("summary", {}).items():
            all_values = np.array([iteration[metric] for iteration in self.simulation_results.get("metrics", [])])
            
            if len(all_values) == 0:
                continue
                
            # Calculate running mean
            running_mean = np.cumsum(all_values) / np.arange(1, len(all_values) + 1)
            
            # Calculate confidence intervals
            alpha = 1 - confidence_level
            z = norm.ppf(1 - alpha/2)  # Z-score for confidence level
            
            running_std = np.array([np.std(all_values[:i+1]) for i in range(len(all_values))])
            running_se = running_std / np.sqrt(np.arange(1, len(all_values) + 1))
            
            ci_lower = running_mean - z * running_se
            ci_upper = running_mean + z * running_se
            
            # Determine if convergence has been reached
            # Simple criterion: if the last 10% of running means are within 1% of final mean
            n = len(running_mean)
            final_mean = running_mean[-1]
            cutoff_index = int(0.9 * n)
            converged = all(abs(running_mean[cutoff_index:] - final_mean) / abs(final_mean) < 0.01) if abs(final_mean) > 1e-10 else True
            iterations_to_converge = min(range(cutoff_index, n), key=lambda i: abs(running_mean[i] - final_mean))  # index where convergence occurs
            
            convergence_info[metric] = {
                "converged": converged,
                "iterations_to_converge": iterations_to_converge,
                "running_mean": running_mean.tolist(),
                "ci_lower": ci_lower.tolist(),
                "ci_upper": ci_upper.tolist()
            }
        
        return convergence_info

# Pydantic models for API requests and responses
class VariableDefinition(BaseModel):
    name: str
    distribution: DistributionType
    params: Dict[str, float]
    description: Optional[str] = None

class MonteCarloSimulationRequest(BaseModel):
    scenario_id: str
    variables: List[VariableDefinition]
    iterations: int = 1000
    confidence_level: float = 0.95
    include_raw_data: bool = False
    correlated_variables: Optional[List[Dict[str, Any]]] = None

class SimulationResult(BaseModel):
    variable: str
    mean: float
    median: float
    std_dev: float
    min_value: float
    max_value: float
    percentiles: Dict[str, float]
    distribution_data: Optional[Dict[str, List[float]]] = None

class MonteCarloSimulationResponse(BaseModel):
    scenario_id: str
    results: List[SimulationResult]
    summary_stats: Dict[str, Any]
    convergence_info: Optional[Dict[str, Any]] = None
    raw_data: Optional[Dict[str, List[float]]] = None

class SensitivityAnalysisRequest(BaseModel):
    scenario_id: str
    target_metric: str
    variation_range: float = 0.2
    steps: int = 5
    parameters_to_analyze: Optional[List[str]] = None

class ParameterSensitivity(BaseModel):
    parameter: str
    min_impact: float
    max_impact: float
    range: float

class SensitivityAnalysisResponse(BaseModel):
    scenario_id: str
    target_metric: str
    sensitivities: List[ParameterSensitivity]
    parameter_data: Optional[Dict[str, Dict[str, List[float]]]] = None

@router.post("/run-monte-carlo-simulation-enhanced", response_model=MonteCarloSimulationResponse)
async def run_monte_carlo_simulation_enhanced(request: MonteCarloSimulationRequest) -> MonteCarloSimulationResponse:
    """Run an advanced Monte Carlo simulation for financial scenario analysis"""
    simulation = MonteCarloSimulation()
    
    # Set up variables with their distributions
    for var in request.variables:
        if var.distribution == DistributionType.NORMAL:
            simulation.add_variable(var.name, "normal", mean=var.params.get("mean", 0), 
                                    std_dev=var.params.get("std_dev", 1))
        elif var.distribution == DistributionType.UNIFORM:
            simulation.add_variable(var.name, "uniform", min_val=var.params.get("min", 0), 
                                    max_val=var.params.get("max", 1))
        elif var.distribution == DistributionType.TRIANGULAR:
            simulation.add_variable(var.name, "triangular", min_val=var.params.get("min", 0), 
                                    max_val=var.params.get("max", 1), 
                                    mode=var.params.get("mode", 0.5))
        elif var.distribution == DistributionType.LOGNORMAL:
            simulation.add_variable(var.name, "lognormal", mean=var.params.get("mean", 0), 
                                   sigma=var.params.get("sigma", 1))
        elif var.distribution == DistributionType.CUSTOM:
            # For custom distributions, assume we have values and weights
            simulation.add_custom_variable(var.name, var.params.get("values", []), 
                                         var.params.get("weights", []))
    
    # Handle correlations if specified
    if request.correlated_variables:
        for corr in request.correlated_variables:
            simulation.add_correlation(corr["var1"], corr["var2"], corr["coefficient"])
    
    # Define an impact function based on the variables
    # This is a simplified example - in reality, this would be based on the scenario
    def calculate_impact(params):
        # Basic financial calculation, adjust based on the actual metrics needed
        result = {}
        # Example calculations - would be customized based on specific scenario
        if "interest_rate" in params:
            result["debt_servicing_cost"] = params.get("interest_rate", 0) * 100
        if "revenue_growth" in params:
            result["revenue"] = params.get("revenue_growth", 0) * 100
        if "cogs_percentage" in params:
            result["gross_margin"] = (1 - params.get("cogs_percentage", 0)) * 100
            result["net_profit"] = result.get("gross_margin", 0) * 0.4  # simplified
        # Add more calculations as needed
        return result
    
    # Run the simulation
    results = simulation.run_simulation(request.iterations, calculate_impact)
    
    # Process results
    simulation_results = []
    raw_data = {}
    
    # Process variable samples
    for var_name, data in results["variables"].items():
        # Calculate percentiles
        percentiles = {
            "10": float(np.percentile(data, 10)),
            "25": float(np.percentile(data, 25)),
            "50": float(np.percentile(data, 50)),
            "75": float(np.percentile(data, 75)),
            "90": float(np.percentile(data, 90)),
            "95": float(np.percentile(data, 95)),
            "99": float(np.percentile(data, 99)),
        }
        
        # Create distribution data for visualization
        hist, bin_edges = np.histogram(data, bins=20, density=True)
        distribution_data = {
            "histogram": hist.tolist(),
            "bin_edges": bin_edges.tolist(),
        }
        
        simulation_results.append(SimulationResult(
            variable=var_name,
            mean=float(np.mean(data)),
            median=float(np.median(data)),
            std_dev=float(np.std(data)),
            min_value=float(np.min(data)),
            max_value=float(np.max(data)),
            percentiles=percentiles,
            distribution_data=distribution_data
        ))
        
        if request.include_raw_data:
            raw_data[var_name] = data.tolist()
    
    # Create convergence information
    convergence_info = simulation.analyze_convergence(request.confidence_level)
    
    return MonteCarloSimulationResponse(
        scenario_id=request.scenario_id,
        results=simulation_results,
        summary_stats=results.get("summary", {}),
        convergence_info=convergence_info,
        raw_data=raw_data if request.include_raw_data else None
    )

@router.post("/analyze-scenario-sensitivity2", response_model=SensitivityAnalysisResponse)
async def analyze_scenario_sensitivity_enhanced(request: SensitivityAnalysisRequest) -> SensitivityAnalysisResponse:
    """Analyze the sensitivity of scenario outcomes to parameter changes - optimized for UI integration"""
    # Retrieve organization and scenario details would go here in production
    # For now, use mock parameters based on common financial factors in Australia
    
    base_parameters = {
        "interest_rate": 0.05,  # RBA cash rate
        "aud_exchange_rate": 0.72,  # AUD to USD
        "inflation_rate": 0.03,  # Annual inflation
        "wage_growth": 0.035,  # Annual wage growth
        "energy_price_index": 120,  # Energy price index
        "property_value_growth": 0.06,  # Property value growth
        "business_confidence_index": 105,  # Business confidence
        "supply_chain_cost_factor": 1.15,  # Supply chain cost factor
        "tax_rate": 0.30,  # Corporate tax rate
        "consumer_demand_index": 110  # Consumer demand index
    }
    
    # Define an impact function that's more economically realistic
    def calculate_impact(params):
        # Start with baseline values
        revenue = 1000000  # $1M base revenue
        cogs_percentage = 0.65  # 65% COGS
        opex_percentage = 0.20  # 20% operational expenses
        
        # Apply parameter effects to baseline
        # Revenue effects
        revenue *= (1 + (params["business_confidence_index"] - 100) / 100)  # Business confidence affects revenue
        revenue *= (1 + (params["consumer_demand_index"] - 100) / 100)  # Consumer demand affects revenue
        revenue *= (1 - (params["interest_rate"] - 0.05) * 3)  # Interest rates affect spending
        
        # Cost effects
        cogs_percentage *= params["supply_chain_cost_factor"] / 1.15  # Supply chain costs affect COGS
        cogs_percentage *= (1 + (params["energy_price_index"] - 120) / 300)  # Energy prices affect production costs
        
        opex_percentage *= (1 + (params["wage_growth"] - 0.035) * 5)  # Wage growth affects operational costs
        opex_percentage *= (1 + (params["inflation_rate"] - 0.03) * 3)  # Inflation affects all costs
        
        # Exchange rate effects (if business has international exposure)
        # Assume 30% of revenue is from exports, affected by exchange rate
        int_revenue_effect = (0.72 - params["aud_exchange_rate"]) * 0.3 * revenue
        
        # Calculate financial metrics
        gross_profit = revenue * (1 - cogs_percentage)
        ebitda = gross_profit - (revenue * opex_percentage)
        ebt = ebitda - (revenue * 0.02 * params["interest_rate"])  # Interest expense
        net_profit = ebt * (1 - params["tax_rate"])
        
        # Effect on property assets if relevant
        asset_value_effect = (params["property_value_growth"] - 0.06) * 2000000  # Assuming $2M in property assets
        
        # Return different metrics based on what was requested
        return {
            "revenue": revenue / 10000,  # Convert to percentage change relative to baseline
            "gross_margin": (gross_profit / revenue - 0.35) * 100,  # Change in margin percentage points
            "ebitda": (ebitda - 150000) / 1500,  # % change in EBITDA from baseline of $150K
            "net_profit": (net_profit - 100000) / 1000,  # % change in net profit from baseline of $100K
            "asset_value": asset_value_effect / 20000,  # % change in asset value
            "cash_flow": (net_profit - 50000) / 500,  # % change in cash flow from baseline
            "debt_servicing_cost": ((revenue * 0.02 * params["interest_rate"]) - 10000) / 100  # % change in debt cost
        }
    
    # Create and run sensitivity analysis
    sensitivity = SensitivityAnalysis(base_parameters, calculate_impact)
    
    # If specific parameters are requested, analyze only those
    if request.parameters_to_analyze and len(request.parameters_to_analyze) > 0:
        results = {}
        for param in request.parameters_to_analyze:
            if param in base_parameters:
                results[param] = sensitivity.analyze_parameter(param, request.variation_range, request.steps)
    else:
        # Otherwise analyze all parameters
        results = sensitivity.analyze_all_parameters(request.variation_range, request.steps)
    
    # Generate tornado chart data for the specific target metric
    tornado_data = sensitivity.get_tornado_data(request.target_metric)
    
    # Convert to response format
    sensitivities = []
    parameter_data = {}
    
    # Human-readable parameter names mapping
    parameter_display_names = {
        "interest_rate": "RBA Cash Rate",
        "aud_exchange_rate": "AUD/USD Exchange Rate",
        "inflation_rate": "Inflation Rate",
        "wage_growth": "Wage Growth",
        "energy_price_index": "Energy Price Index",
        "property_value_growth": "Property Value Growth",
        "business_confidence_index": "Business Confidence",
        "supply_chain_cost_factor": "Supply Chain Costs",
        "tax_rate": "Corporate Tax Rate",
        "consumer_demand_index": "Consumer Demand"
    }
    
    for _, row in tornado_data.iterrows():
        sensitivities.append(ParameterSensitivity(
            parameter=parameter_display_names.get(row["parameter"], row["parameter"]),
            min_impact=row["min_impact"],
            max_impact=row["max_impact"],
            range=row["range"]
        ))
        
        # Extract parameter data for charts
        if row["parameter"] in results:
            df = results[row["parameter"]]
            parameter_data[parameter_display_names.get(row["parameter"], row["parameter"])] = {
                "parameter_values": df[row["parameter"]].tolist(),
                "impact_values": df[request.target_metric].tolist()
            }
    
    return SensitivityAnalysisResponse(
        scenario_id=request.scenario_id,
        target_metric=request.target_metric,
        sensitivities=sensitivities,
        parameter_data=parameter_data
    )
