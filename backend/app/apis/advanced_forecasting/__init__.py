from fastapi import APIRouter, Body
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union, Literal
from datetime import datetime, date
import numpy as np
from statsmodels.tsa.seasonal import seasonal_decompose
from statsmodels.tsa.holtwinters import ExponentialSmoothing
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA
import warnings

# Suppress binary incompatibility warnings
warnings.filterwarnings("ignore", message="numpy.dtype size changed")
warnings.filterwarnings("ignore", message="numpy.ufunc size changed")

# Try to import pmdarima, but fallback to simpler models if it fails
try:
    import pmdarima as pm
    from statsmodels.tsa.stattools import adfuller
    PMDARIMA_AVAILABLE = True
except (ImportError, ValueError) as e:
    print(f"Warning: pmdarima import error: {e}")
    print("Advanced ARIMA models will not be available, falling back to simpler forecasting methods")
    PMDARIMA_AVAILABLE = False

router = APIRouter()

# Data models
class PLItem(BaseModel):
    id: str
    name: str
    amount: float

class ForecastAssumption(BaseModel):
    id: str
    name: str
    category: Literal["revenue", "costOfSales", "expenses"]
    itemId: str
    growthType: Literal["linear", "percentage", "manual"]
    growthRate: float
    manualValues: Optional[List[float]] = None

class ForecastPLStatement(BaseModel):
    revenue: List[PLItem]
    costOfSales: List[PLItem]
    expenses: List[PLItem]

class TimeSeriesComponents(BaseModel):
    trend: List[float]
    seasonal: List[float]
    residual: List[float]
    original: List[float]
    cyclical: Optional[List[float]] = None

class ForecastPeriodData(BaseModel):
    period: int
    date: date
    label: str
    revenue: List[PLItem]
    costOfSales: List[PLItem]
    expenses: List[PLItem]
    grossProfit: float
    netIncome: float

class ForecastAccuracyMetrics(BaseModel):
    mape: float  # Mean Absolute Percentage Error
    rmse: float  # Root Mean Square Error
    mae: float   # Mean Absolute Error
    r2: Optional[float] = None  # R-squared

class ForecastVarianceAnalysis(BaseModel):
    periodLabel: str
    predicted: float
    actual: float
    variance: float
    variancePercent: float
    impact: Literal["high", "medium", "low"]
    factors: Optional[List[str]] = None

class AdvancedForecastResult(BaseModel):
    scenarioId: str
    scenarioName: str
    periodType: Literal["monthly", "quarterly", "yearly"]
    startDate: date
    periods: List[ForecastPeriodData]
    totals: Dict[str, float]
    algorithm: str
    seasonallyAdjusted: bool
    timeSeriesComponents: Optional[TimeSeriesComponents] = None
    accuracyMetrics: Optional[ForecastAccuracyMetrics] = None
    varianceAnalysis: Optional[List[ForecastVarianceAnalysis]] = None
    confidenceIntervals: Optional[Dict[str, Any]] = None

class ForecastScenario(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    baseline: ForecastPLStatement
    assumptions: List[ForecastAssumption]
    periods: int
    periodType: Literal["monthly", "quarterly", "yearly"]
    startDate: date

class AdvancedForecastRequest(BaseModel):
    scenario: ForecastScenario
    algorithm: str = "simple"
    seasonallyAdjusted: bool = False
    seasonalPeriod: Optional[int] = None
    decompositionMethod: Optional[Literal["multiplicative", "additive"]] = "multiplicative"
    historicalData: Optional[List[float]] = None
    actualData: Optional[List[float]] = None
    periodLabels: Optional[List[str]] = None

# Helper functions
def calculate_moving_average(data, window_size):
    """Calculate moving average for a time series"""
    if len(data) < window_size:
        return [float('nan')] * len(data)
    
    result = [float('nan')] * (window_size - 1)
    
    for i in range(window_size - 1, len(data)):
        window_sum = sum(data[i - window_size + 1:i + 1])
        result.append(window_sum / window_size)
    
    return result

def calculate_exponential_smoothing(data, alpha=0.3):
    """Calculate exponential smoothing for a time series"""
    if not data:
        return []
    
    result = [data[0]]
    
    for i in range(1, len(data)):
        smoothed = alpha * data[i] + (1 - alpha) * result[i - 1]
        result.append(smoothed)
    
    return result

def decompose_time_series(data, seasonal_period, method='multiplicative'):
    """Decompose a time series into trend, seasonal, and residual components"""
    # Convert to pandas Series for statsmodels
    if len(data) < seasonal_period * 2:
        # Not enough data for meaningful decomposition
        nans = [float('nan')] * len(data)
        return TimeSeriesComponents(
            trend=nans,
            seasonal=nans,
            residual=nans,
            original=data
        )
    
    series = pd.Series(data)
    
    # Use statsmodels for decomposition
    decomposition = seasonal_decompose(series, model=method, period=seasonal_period)
    
    return TimeSeriesComponents(
        trend=decomposition.trend.fillna(method='bfill').fillna(method='ffill').tolist(),
        seasonal=decomposition.seasonal.fillna(method='bfill').fillna(method='ffill').tolist(),
        residual=decomposition.resid.fillna(method='bfill').fillna(method='ffill').tolist(),
        original=data
    )

def apply_seasonal_adjustment(forecast, seasonal_components, method='multiplicative'):
    """Apply seasonal adjustment to forecasted data"""
    seasonal = seasonal_components.seasonal
    # Filter out NaN values
    seasonal = [x for x in seasonal if not np.isnan(x)]
    seasonal_length = len(seasonal)
    
    if seasonal_length == 0:
        return forecast
    
    result = []
    for i, value in enumerate(forecast):
        seasonal_index = i % seasonal_length
        seasonal_factor = seasonal[seasonal_index]
        
        if method == 'multiplicative':
            # Prevent extreme values in multiplicative model
            if seasonal_factor > 3.0:
                seasonal_factor = 3.0
            elif seasonal_factor < 0.3:
                seasonal_factor = 0.3
            result.append(value * seasonal_factor)
        else:  # additive
            result.append(value + seasonal_factor)
    
    return result

def calculate_forecast_accuracy(actual, predicted):
    """Calculate forecast accuracy metrics"""
    if not actual or not predicted or len(actual) < 2 or len(predicted) < 2:
        return ForecastAccuracyMetrics(mape=0, rmse=0, mae=0)
    
    n = min(len(actual), len(predicted))
    actual = actual[:n]
    predicted = predicted[:n]
    
    # Calculate errors
    errors = [a - p for a, p in zip(actual, predicted)]
    abs_errors = [abs(e) for e in errors]
    squared_errors = [e ** 2 for e in errors]
    
    # Calculate MAPE (Mean Absolute Percentage Error) with protection against zero division
    abs_percent_errors = []
    for a, p in zip(actual, predicted):
        if abs(a) > 1e-10:  # Avoid division by very small numbers
            abs_percent_errors.append(abs(a - p) / abs(a))
        else:
            if abs(p) < 1e-10:  # Both actual and predicted are very close to zero
                abs_percent_errors.append(0)
            else:  # Only actual is close to zero
                abs_percent_errors.append(1)  # 100% error when predicting non-zero for zero actual
    
    mape = (sum(abs_percent_errors) / len(abs_percent_errors)) * 100 if abs_percent_errors else 0
    mae = sum(abs_errors) / n
    rmse = (sum(squared_errors) / n) ** 0.5
    
    # Calculate R-squared (coefficient of determination)
    mean_actual = sum(actual) / n
    ss_total = sum([(a - mean_actual) ** 2 for a in actual])
    ss_residual = sum(squared_errors)
    
    r2 = None
    if ss_total > 1e-10:  # Avoid division by very small numbers
        r2 = 1 - (ss_residual / ss_total)
        # Clamp R² to a valid range
        r2 = max(-1.0, min(1.0, r2))
    
    return ForecastAccuracyMetrics(
        mape=mape,
        rmse=rmse,
        mae=mae,
        r2=r2
    )

def analyze_variance(actual, predicted, period_labels):
    """Perform variance analysis between forecasted and actual values"""
    results = []
    
    n = min(len(actual), len(predicted), len(period_labels))
    if n == 0:
        return results
    
    # Calculate variance statistics for determining impact thresholds
    variances = []
    for i in range(n):
        if abs(actual[i]) > 1e-10:  # Avoid division by very small numbers
            variance_pct = (actual[i] - predicted[i]) / actual[i] * 100
            variances.append(abs(variance_pct))
    
    if variances:
        # Use percentiles to adapt impact thresholds to the data
        variances.sort()
        low_threshold = np.percentile(variances, 33) if len(variances) >= 3 else 5.0
        high_threshold = np.percentile(variances, 66) if len(variances) >= 3 else 15.0
        
        # Ensure reasonable thresholds
        low_threshold = max(3.0, min(10.0, low_threshold))
        high_threshold = max(10.0, min(25.0, high_threshold))
    else:
        # Default thresholds if no valid variances
        low_threshold = 5.0
        high_threshold = 15.0
    
    for i in range(n):
        variance = actual[i] - predicted[i]
        if abs(actual[i]) > 1e-10:  # Avoid division by very small numbers
            variance_percent = (variance / actual[i]) * 100
        else:
            variance_percent = 0 if abs(predicted[i]) < 1e-10 else 100.0
        
        # Determine impact level based on variance percentage
        impact = "low"
        abs_variance_pct = abs(variance_percent)
        if abs_variance_pct > high_threshold:
            impact = "high"
        elif abs_variance_pct > low_threshold:
            impact = "medium"
        
        # Generate potential factors for high impact variances
        factors = None
        if impact == "high":
            factors = analyze_variance_factors(variance_percent, i, n, actual, predicted)
        
        results.append(ForecastVarianceAnalysis(
            periodLabel=period_labels[i],
            actual=actual[i],
            predicted=predicted[i],
            variance=variance,
            variancePercent=variance_percent,
            impact=impact,
            factors=factors
        ))
    
    return results


def analyze_variance_factors(variance_pct, period_idx, n, actual, predicted):
    """Analyze potential factors causing variance"""
    factors = []
    
    # Factor 1: Direction of variance
    if variance_pct > 0:
        factors.append("Actual results exceeded forecast")
    else:
        factors.append("Forecast exceeded actual results")
    
    # Factor 2: Size of variance
    if abs(variance_pct) > 20:
        factors.append("Significant deviation from expectations")
    
    # Factor 3: Pattern recognition
    if period_idx > 0 and period_idx < n - 1:
        # Check for sudden spikes or drops
        prev_actual = actual[period_idx - 1]
        current_actual = actual[period_idx]
        
        if abs(prev_actual) > 1e-10:  # Avoid division by very small numbers
            percent_change = (current_actual - prev_actual) / abs(prev_actual) * 100
            if abs(percent_change) > 30:
                if percent_change > 0:
                    factors.append("Sudden spike in actual values")
                else:
                    factors.append("Sudden drop in actual values")
    
    # Factor 4: Evaluate forecast bias
    if period_idx >= 2:
        # Check for consistent over/under forecasting
        consistent_over = all(actual[i] < predicted[i] for i in range(max(0, period_idx-2), period_idx+1))
        consistent_under = all(actual[i] > predicted[i] for i in range(max(0, period_idx-2), period_idx+1))
        
        if consistent_over:
            factors.append("Consistent overforecasting bias detected")
        elif consistent_under:
            factors.append("Consistent underforecasting bias detected")
    
    return factors

@router.post("/advanced-forecast")
def create_advanced_forecast(request: AdvancedForecastRequest) -> AdvancedForecastResult:
    scenario = request.scenario
    algorithm = request.algorithm
    seasonally_adjusted = request.seasonallyAdjusted
    seasonal_period = request.seasonalPeriod
    decomposition_method = request.decompositionMethod or "multiplicative"
    historical_data = request.historicalData or []
    actual_data = request.actualData or []
    period_labels = request.periodLabels or []
    
    # If seasonal period not specified, use sensible defaults based on periodType
    if seasonal_period is None:
        if scenario.periodType == "monthly":
            seasonal_period = 12  # Annual seasonality for monthly data
        elif scenario.periodType == "quarterly":
            seasonal_period = 4   # Annual seasonality for quarterly data
        else:
            seasonal_period = 7   # Weekly seasonality for daily data
    
    # Helper function to calculate period label
    def get_period_label(d, period_type):
        year = d.year
        month = d.month
        
        if period_type == "monthly":
            return d.strftime("%b %Y")
        elif period_type == "quarterly":
            quarter = (month - 1) // 3 + 1
            return f"Q{quarter} {year}"
        else:
            return str(year)
    
    # Helper function to advance date by period type
    def advance_date(d, period_type):
        new_date = d.replace()
        if period_type == "monthly":
            if d.month == 12:
                new_date = date(d.year + 1, 1, d.day)
            else:
                new_date = date(d.year, d.month + 1, d.day)
        elif period_type == "quarterly":
            if d.month >= 10:
                new_date = date(d.year + 1, (d.month + 3) % 12 or 12, d.day)
            else:
                new_date = date(d.year, d.month + 3, d.day)
        else:  # yearly
            new_date = date(d.year + 1, d.month, d.day)
        return new_date
    
    # Helper function to apply growth model to a value
    def apply_growth(value, assumption, period_index):
        if assumption.growthType == "percentage":
            return value * (1 + assumption.growthRate / 100) ** (period_index + 1)
        elif assumption.growthType == "linear":
            return value + (value * assumption.growthRate / 100 * (period_index + 1))
        elif assumption.growthType == "manual" and assumption.manualValues:
            return assumption.manualValues[period_index] if period_index < len(assumption.manualValues) else value
        else:
            return value
    
    # Generate data for each period using simple growth models
    def generate_simple_forecast():
        forecast_periods = []
        current_date = scenario.startDate
        
        for i in range(scenario.periods):
            # Calculate period end date
            period_end_date = advance_date(current_date, scenario.periodType)
            
            # Clone baseline data for this period
            period_revenue = [PLItem(id=item.id, name=item.name, amount=item.amount) 
                             for item in scenario.baseline.revenue]
            period_cost_of_sales = [PLItem(id=item.id, name=item.name, amount=item.amount) 
                                  for item in scenario.baseline.costOfSales]
            period_expenses = [PLItem(id=item.id, name=item.name, amount=item.amount) 
                             for item in scenario.baseline.expenses]
            
            # Apply growth assumptions to each item
            for assumption in scenario.assumptions:
                if assumption.category == "revenue":
                    for item in period_revenue:
                        if item.id == assumption.itemId:
                            item.amount = apply_growth(item.amount, assumption, i)
                elif assumption.category == "costOfSales":
                    for item in period_cost_of_sales:
                        if item.id == assumption.itemId:
                            item.amount = apply_growth(item.amount, assumption, i)
                elif assumption.category == "expenses":
                    for item in period_expenses:
                        if item.id == assumption.itemId:
                            item.amount = apply_growth(item.amount, assumption, i)
            
            # Calculate totals for this period
            period_total_revenue = sum(item.amount for item in period_revenue)
            period_total_cost_of_sales = sum(item.amount for item in period_cost_of_sales)
            period_gross_profit = period_total_revenue - period_total_cost_of_sales
            period_total_expenses = sum(item.amount for item in period_expenses)
            period_net_income = period_gross_profit - period_total_expenses
            
            # Add period data
            forecast_periods.append(ForecastPeriodData(
                period=i,
                date=period_end_date,
                label=get_period_label(period_end_date, scenario.periodType),
                revenue=period_revenue,
                costOfSales=period_cost_of_sales,
                expenses=period_expenses,
                grossProfit=period_gross_profit,
                netIncome=period_net_income
            ))
            
            # Advance to next period start date
            current_date = advance_date(current_date, scenario.periodType)
        
        return forecast_periods
    
    # Generate forecast using moving-average algorithm
    def generate_moving_average_forecast(data, window_size=3):
        if len(data) < window_size:
            return [data[-1] if data else 0] * scenario.periods
        
        last_values = data[-window_size:]
        avg_value = sum(last_values) / window_size
        
        # For simple moving average forecasting, all future periods have the same value
        return [avg_value] * scenario.periods
    
    # Generate forecast using exponential smoothing
    def generate_exponential_smoothing_forecast(data, alpha=0.3):
        if not data:
            return [0] * scenario.periods
        
        smoothed = calculate_exponential_smoothing(data, alpha)
        last_smoothed_value = smoothed[-1]
        
        # For single exponential smoothing, future values are the last smoothed value
        return [last_smoothed_value] * scenario.periods
    
    # Generate forecast with seasonal adjustments
    def generate_seasonal_forecast(data):
        if not data or len(data) < seasonal_period:
            # Use simple forecast as fallback
            return [period.netIncome for period in generate_simple_forecast()]
        
        # Decompose historical data to extract seasonal patterns
        try:
            components = decompose_time_series(data, seasonal_period, decomposition_method)
            
            # If we don't have enough seasonal components, fall back to simple forecast
            if any(np.isnan(components.seasonal)):
                return [period.netIncome for period in generate_simple_forecast()]
                
            # Check if seasonality is significant
            seasonal_std = np.std([x for x in components.seasonal if not np.isnan(x)])
            data_std = np.std([x for x in data if not np.isnan(x)])
            if seasonal_std / data_std < 0.05:  # Seasonality is less than 5% of data variation
                print("Seasonality is not significant, using trend-based forecast")
                # Use simple growth model instead
                return [period.netIncome for period in generate_simple_forecast()]
            
            # Use a simple forecast as base trend
            base_forecast = [period.netIncome for period in generate_simple_forecast()]
            
            # Apply seasonal adjustments to the base forecast
            return apply_seasonal_adjustment(base_forecast, components, decomposition_method)
        except Exception as e:
            print(f"Seasonal forecasting error: {e}")
            # Fall back to simple forecast
            return [period.netIncome for period in generate_simple_forecast()]
    
    # Generate forecast using Holt-Winters method
    def generate_holt_winters_forecast(data):
        if len(data) < seasonal_period * 2:
            # Not enough data for Holt-Winters
            return generate_exponential_smoothing_forecast(data)
        
        # Convert to pandas Series
        series = pd.Series(data)
        
        # Setup Holt-Winters model
        try:
            # Determine if we should model trend
            has_trend = len(data) > 10 and np.std(data) > np.mean(data) * 0.1
            
            model = ExponentialSmoothing(
                series,
                seasonal='multiplicative' if decomposition_method == 'multiplicative' else 'additive',
                seasonal_periods=seasonal_period,
                trend='add' if has_trend else None,
                damped_trend=has_trend
            )
            
            # Fit model with optimized parameters
            fit = model.fit(optimized=True, use_boxcox=True)
            
            # Forecast future periods
            forecast = fit.forecast(scenario.periods)
            
            # Store confidence intervals
            try:
                pred_int = fit.get_prediction(start=len(data), end=len(data) + scenario.periods - 1)
                intervals = pred_int.conf_int(alpha=0.05)  # 95% confidence interval
                
                # Store confidence intervals for later use
                nonlocal confidence_intervals
                confidence_intervals = {
                    "lower": intervals.iloc[:, 0].tolist(),
                    "upper": intervals.iloc[:, 1].tolist(),
                    "confidence": 0.95
                }
            except Exception as e:
                print(f"Failed to generate confidence intervals: {e}")
                # Create simple intervals based on historical volatility
                std_dev = np.std(data) / np.mean(data) if np.mean(data) != 0 else 0.1
                confidence_intervals = {
                    "lower": [value * (1 - std_dev) for value in forecast],
                    "upper": [value * (1 + std_dev) for value in forecast],
                    "confidence": 0.8
                }
            
            return forecast.tolist()
        except Exception as e:
            print(f"Holt-Winters forecasting error: {e}")
            # Fallback to simpler method if error
            return generate_seasonal_forecast(data)
            
    # Generate forecast using ARIMA (AutoRegressive Integrated Moving Average)
    def generate_arima_forecast(data):
        if len(data) < 10:  # Need sufficient data for ARIMA
            return generate_exponential_smoothing_forecast(data)
        
        # Check if pmdarima is available
        if not PMDARIMA_AVAILABLE:
            print("ARIMA forecast requested but pmdarima not available, using statsmodels ARIMA instead")
            return generate_statsmodels_arima_forecast(data)
        
        # Convert to pandas Series
        series = pd.Series(data)
        
        try:
            # Check if data is stationary
            is_stationary_data = is_stationary(data)
            seasonal = len(data) >= seasonal_period * 2
            
            # Use auto_arima to automatically find optimal parameters
            model = pm.auto_arima(
                series,
                start_p=0, start_q=0,
                max_p=5, max_q=5,
                start_P=0, start_Q=0,
                max_P=2, max_Q=2,
                d=None,  # Let auto_arima determine differencing
                D=1 if seasonal else 0,
                seasonal=seasonal,
                m=seasonal_period if seasonal else 1,
                error_action="ignore",
                suppress_warnings=True,
                stepwise=True,
                approximation=len(data) > 100,  # Use approximation for large datasets
                n_jobs=-1  # Use all available cores
            )
            
            # Forecast future periods
            forecast, conf_int = model.predict(n_periods=scenario.periods, return_conf_int=True, alpha=0.05)
            
            # Create confidence intervals
            lower_bound = conf_int[:, 0].tolist()
            upper_bound = conf_int[:, 1].tolist()
            
            # Store confidence intervals for later use
            nonlocal confidence_intervals
            confidence_intervals = {
                "lower": lower_bound,
                "upper": upper_bound,
                "confidence": 0.95  # 95% confidence interval
            }
            
            # Ensure no negative values for financial data that shouldn't be negative
            forecast = np.maximum(forecast, 0)
            
            # Get the order of the model for diagnostic information
            order = model.order
            seasonal_order = model.seasonal_order
            print(f"ARIMA Order: {order}, Seasonal Order: {seasonal_order}")
            
            return forecast.tolist()
        except Exception as e:
            print(f"ARIMA forecasting error: {e}")
            # Fallback to simpler method if error
            return generate_statsmodels_arima_forecast(data)

    # Fallback ARIMA implementation using statsmodels directly
    def generate_statsmodels_arima_forecast(data):
        if len(data) < 10:  # Need sufficient data for ARIMA
            return generate_exponential_smoothing_forecast(data)
        
        # Convert to pandas Series
        series = pd.Series(data)
        
        try:
            # Use a simple ARIMA(1,1,1) model as fallback
            model = ARIMA(series, order=(1, 1, 1))
            model_fit = model.fit()
            
            # Forecast future periods
            forecast = model_fit.forecast(steps=scenario.periods)
            
            # Create confidence intervals
            pred = model_fit.get_prediction(start=len(data), end=len(data) + scenario.periods - 1)
            pred_conf = pred.conf_int(alpha=0.05)
            
            # Store confidence intervals for later use
            nonlocal confidence_intervals
            confidence_intervals = {
                "lower": pred_conf.iloc[:, 0].tolist(),
                "upper": pred_conf.iloc[:, 1].tolist(),
                "confidence": 0.95  # 95% confidence interval
            }
            
            # Ensure no negative values for financial data that shouldn't be negative
            forecast = np.maximum(forecast, 0)
            
            return forecast.tolist()
        except Exception as e:
            print(f"Statsmodels ARIMA forecasting error: {e}")
            # Fallback to even simpler method if error
            return generate_exponential_smoothing_forecast(data)
            
    # Check for stationarity (required for some time series models)
    def is_stationary(data):
        if not PMDARIMA_AVAILABLE:
            # Simple alternative test for stationarity
            # Calculate if the difference between consecutive points is more stationary
            # than the original series using variance comparison
            if len(data) < 10:
                return False
                
            original_var = np.var(data)
            diff_var = np.var(np.diff(data))
            
            return diff_var < original_var
        
        try:
            result = adfuller(data)
            return result[1] <= 0.05  # p-value <= 0.05 indicates stationarity
        except Exception as e:
            print(f"Stationarity test error: {e}")
            return False
    
    # Generate forecast periods based on selected algorithm
    forecast_periods = []
    time_series_components = None
    forecast_values = []
    confidence_intervals = None
    
    if algorithm == "moving-average" and historical_data:
        forecast_values = generate_moving_average_forecast(historical_data)
        forecast_periods = generate_simple_forecast()
        
        # Override net income with moving average forecasts
        for i, period in enumerate(forecast_periods):
            if i < len(forecast_values):
                period.netIncome = forecast_values[i]
    
    elif algorithm == "exponential-smoothing" and historical_data:
        forecast_values = generate_exponential_smoothing_forecast(historical_data)
        forecast_periods = generate_simple_forecast()
        
        # Override net income with exponential smoothing forecasts
        for i, period in enumerate(forecast_periods):
            if i < len(forecast_values):
                period.netIncome = forecast_values[i]
    
    elif algorithm == "seasonal-adjustment" and historical_data:
        time_series_components = decompose_time_series(historical_data, seasonal_period, decomposition_method)
        forecast_values = generate_seasonal_forecast(historical_data)
        forecast_periods = generate_simple_forecast()
        
        # Override net income with seasonally adjusted forecasts
        for i, period in enumerate(forecast_periods):
            if i < len(forecast_values):
                period.netIncome = forecast_values[i]
    
    elif algorithm == "holt-winters" and historical_data:
        forecast_values = generate_holt_winters_forecast(historical_data)
        forecast_periods = generate_simple_forecast()
        
        # Override net income with Holt-Winters forecasts
        for i, period in enumerate(forecast_periods):
            if i < len(forecast_values):
                period.netIncome = forecast_values[i]
                
    elif algorithm == "arima" and historical_data:
        # Check if we have enough data for ARIMA
        if len(historical_data) >= 10:
            forecast_values = generate_arima_forecast(historical_data)
            forecast_periods = generate_simple_forecast()
            
            # Override net income with ARIMA forecasts
            for i, period in enumerate(forecast_periods):
                if i < len(forecast_values):
                    period.netIncome = forecast_values[i]
        else:
            # Not enough data, fallback to simple exponential smoothing
            forecast_values = generate_exponential_smoothing_forecast(historical_data)
            forecast_periods = generate_simple_forecast()
            
            for i, period in enumerate(forecast_periods):
                if i < len(forecast_values):
                    period.netIncome = forecast_values[i]
    
    elif algorithm == "regression" and historical_data:
        # Simple linear regression implementation
        x = list(range(len(historical_data)))
        y = historical_data
        
        n = len(x)
        sum_x = sum(x)
        sum_y = sum(y)
        sum_xy = sum(x_i * y_i for x_i, y_i in zip(x, y))
        sum_xx = sum(x_i * x_i for x_i in x)
        
        # Calculate slope and intercept using least squares method
        slope = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x) if (n * sum_xx - sum_x * sum_x) != 0 else 0
        intercept = (sum_y - slope * sum_x) / n
        
        # Generate forecast using linear regression
        forecast_values = [intercept + slope * (n + i) for i in range(scenario.periods)]
        forecast_periods = generate_simple_forecast()
        
        # Override net income with regression forecasts
        for i, period in enumerate(forecast_periods):
            if i < len(forecast_values):
                period.netIncome = forecast_values[i]
    
    else:  # 'simple' or fallback
        forecast_periods = generate_simple_forecast()
        forecast_values = [period.netIncome for period in forecast_periods]
    
    # Calculate forecast totals
    total_revenue = sum(sum(item.amount for item in period.revenue) for period in forecast_periods)
    total_cost_of_sales = sum(sum(item.amount for item in period.costOfSales) for period in forecast_periods)
    total_expenses = sum(sum(item.amount for item in period.expenses) for period in forecast_periods)
    total_gross_profit = total_revenue - total_cost_of_sales
    total_net_income = sum(period.netIncome for period in forecast_periods)
    
    # Calculate accuracy metrics if actual data is provided
    accuracy_metrics = None
    variance_analysis = None
    
    if actual_data and forecast_values:
        accuracy_metrics = calculate_forecast_accuracy(
            actual_data[:len(forecast_values)],
            forecast_values[:len(actual_data)]
        )
        
        actual_period_labels = period_labels or [
            period.label for period in forecast_periods[:min(len(forecast_values), len(actual_data))]
        ]
        
        variance_analysis = analyze_variance(
            actual_data[:len(forecast_values)],
            forecast_values[:len(actual_data)],
            actual_period_labels
        )
    
    # Calculate confidence intervals if not already set by an algorithm
    if forecast_values and confidence_intervals is None:
        # Calculate standard deviation of historical data for more meaningful intervals
        if historical_data and len(historical_data) > 1:
            std_dev = np.std(historical_data)
            mean_value = np.mean(historical_data)
            cv = std_dev / mean_value if mean_value != 0 else 0  # Coefficient of variation
            
            # Use coefficient of variation to scale the confidence interval width
            interval_width = max(0.1, min(0.3, cv))  # Between 10% and 30% based on historical volatility
            
            confidence_intervals = {
                "lower": [value * (1 - interval_width) for value in forecast_values],
                "upper": [value * (1 + interval_width) for value in forecast_values],
                "confidence": 0.8
            }
        else:
            # Fallback to simple 10% intervals if no historical data
            confidence_intervals = {
                "lower": [value * 0.9 for value in forecast_values],  # 10% below forecast
                "upper": [value * 1.1 for value in forecast_values],  # 10% above forecast
                "confidence": 0.8  # 80% confidence interval
            }
    
    return AdvancedForecastResult(
        scenarioId=scenario.id,
        scenarioName=scenario.name,
        periodType=scenario.periodType,
        startDate=scenario.startDate,
        periods=forecast_periods,
        totals={
            "revenue": total_revenue,
            "costOfSales": total_cost_of_sales,
            "expenses": total_expenses,
            "grossProfit": total_gross_profit,
            "netIncome": total_net_income
        },
        algorithm=algorithm,
        seasonallyAdjusted=seasonally_adjusted,
        timeSeriesComponents=time_series_components,
        accuracyMetrics=accuracy_metrics,
        varianceAnalysis=variance_analysis,
        confidenceIntervals=confidence_intervals
    )
