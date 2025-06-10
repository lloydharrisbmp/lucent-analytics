
import pandas as pd
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Literal, Dict, Optional
import logging
from datetime import date, timedelta

try:
    from prophet import Prophet
    PROPHET_AVAILABLE = True
except ImportError:
    PROPHET_AVAILABLE = False
    print("Warning: Prophet not available. Prophet-based forecasting will be disabled.")

try:
    import pmdarima as pm
    PMDARIMA_AVAILABLE = True
except ImportError:
    PMDARIMA_AVAILABLE = False
    print("Warning: pmdarima not available. ARIMA-based forecasting will be disabled.")

# Basic logging (using print as logging module is not available)
print("Initializing forecasting API...")

router = APIRouter(prefix="/forecasting", tags=["Forecasting"])

# --- Pydantic Models ---

class HistoricalScorePoint(BaseModel):
    point_date: date = Field(..., description="The date of the historical score point")
    score: float = Field(..., description="The historical score value (0-100)")

class ForecastRequest(BaseModel):
    historical_data: List[HistoricalScorePoint] = Field(..., description="List of historical score data points")
    periods: int = Field(default=6, description="Number of future periods (months) to forecast")
    freq: str = Field(default='M', description="Frequency of the forecast periods ('D', 'W', 'M', 'Q', 'Y')") # Defaulting to Monthly

class ForecastPoint(BaseModel):
    forecast_date: date = Field(..., description="The date of the forecasted point")
    forecasted_score: float = Field(..., alias="yhat", description="The forecasted score value")
    lower_bound: float = Field(..., alias="yhat_lower", description="The lower bound of the forecast interval")
    upper_bound: float = Field(..., alias="yhat_upper", description="The upper bound of the forecast interval")

    model_config = {"populate_by_name": True}

class ForecastResponse(BaseModel):
    forecast_data: List[ForecastPoint] = Field(..., description="List of forecasted score data points")

# --- New Pydantic Models for Account Forecasting ---

class HistoricalAccountPoint(BaseModel):
    point_date: date = Field(..., description="The date of the historical data point")
    value: float = Field(..., description="The value of the account on that date")

class AccountData(BaseModel):
    account_name: str = Field(..., description="The name or identifier of the financial account")
    historical_data: List[HistoricalAccountPoint] = Field(..., description="List of historical data points for the account")

class AccountForecastRequest(BaseModel):
    accounts_data: List[AccountData] = Field(..., description="List of accounts and their historical data")
    periods: int = Field(default=6, description="Number of future periods to forecast")
    freq: str = Field(default='M', description="Frequency of the forecast periods ('D', 'W', 'M', 'Q', 'Y')")
    method: Literal["ARIMA", "Prophet"] = Field(default="ARIMA", description="Forecasting method to use")

class AccountForecastPoint(BaseModel):
    forecast_date: date = Field(..., description="The date of the forecasted point")
    forecasted_value: float = Field(..., description="The forecasted value")
    # Optional: Add lower/upper bounds later if needed
    # lower_bound: Optional[float] = None
    # upper_bound: Optional[float] = None

class SingleAccountForecast(BaseModel):
    account_name: str = Field(..., description="The name of the account")
    forecast_data: List[AccountForecastPoint] = Field(default=[], description="List of forecasted data points")
    error: Optional[str] = Field(None, description="Error message if forecasting failed for this account")

class AccountForecastResponse(BaseModel):
    forecast_results: List[SingleAccountForecast] = Field(..., description="List of forecast results for each requested account")


# --- API Endpoint ---

@router.post("/forecast-score", response_model=ForecastResponse)
async def forecast_score(request: ForecastRequest) -> ForecastResponse:
    """
    Generates a time-series forecast for financial health scores using Prophet.
    Requires historical data points (date, score).
    """
    if not PROPHET_AVAILABLE:
        raise HTTPException(status_code=503, detail="Prophet forecasting is not available. Please install the required dependencies.")
    
    print(f"Received forecast request with {len(request.historical_data)} data points, forecasting {request.periods} periods with freq '{request.freq}'.")

    if len(request.historical_data) < 3: # Prophet needs at least 2, ideally more
        print("Error: Insufficient historical data provided for forecasting.")
        raise HTTPException(status_code=400, detail="Insufficient historical data. At least 3 data points are recommended for forecasting.")

    # Prepare DataFrame for Prophet
    try:
        history_df = pd.DataFrame([p.model_dump() for p in request.historical_data])
        history_df['ds'] = pd.to_datetime(history_df['point_date'])
        history_df = history_df.rename(columns={'score': 'y'})
        history_df = history_df[['ds', 'y']]
        print("Historical data prepared for Prophet:")
        print(history_df.head())
    except Exception as e:
        print(f"Error preparing DataFrame: {e}")
        raise HTTPException(status_code=500, detail="Error processing historical data.")

    # Initialize and fit Prophet model
    # Disable yearly and weekly seasonality if frequency is monthly or less, adjust as needed
    yearly_seasonality = True if request.freq in ['Y', 'Q'] or (request.freq == 'M' and len(history_df) >= 24) else 'auto'
    weekly_seasonality = True if request.freq in ['D', 'W'] else 'auto'
    daily_seasonality = True if request.freq == 'D' else 'auto'

    # Basic validation for frequency vs data points
    if request.freq == 'M' and len(history_df) < 12:
         yearly_seasonality = False # Not enough data for yearly seasonality with monthly points
         print("Disabling yearly seasonality due to insufficient monthly data points (< 12).")
    if request.freq == 'W' and len(history_df) < 52:
         yearly_seasonality = False # Not enough data for yearly seasonality with weekly points
         print("Disabling yearly seasonality due to insufficient weekly data points (< 52).")


    model = Prophet(
        yearly_seasonality=yearly_seasonality,
        weekly_seasonality=weekly_seasonality,
        daily_seasonality=daily_seasonality,
        # Consider adding holidays if relevant
        # growth='logistic', # Consider logistic growth if score has floor/cap (e.g., 0-100)
        # changepoint_prior_scale=0.05 # Default is 0.05, adjust if needed
    )
    
    # If using logistic growth, need floor and cap
    # history_df['floor'] = 0
    # history_df['cap'] = 100
    # model = Prophet(growth='logistic', ...) 

    try:
        print("Fitting Prophet model...")
        model.fit(history_df)
    except Exception as e:
        print(f"Error fitting Prophet model: {e}")
        raise HTTPException(status_code=500, detail=f"Error fitting forecasting model: {e}")

    # Create future DataFrame for predictions
    try:
        print(f"Creating future DataFrame for {request.periods} periods with frequency {request.freq}.")
        future = model.make_future_dataframe(periods=request.periods, freq=request.freq)
        # If using logistic growth:
        # future['floor'] = 0
        # future['cap'] = 100
        print("Future dates for prediction:")
        print(future.tail())
    except Exception as e:
        print(f"Error creating future DataFrame: {e}")
        raise HTTPException(status_code=500, detail="Error preparing for future predictions.")

    # Make predictions
    try:
        print("Making predictions...")
        forecast_df = model.predict(future)
        print("Forecast DataFrame generated:")
        print(forecast_df[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail())
    except Exception as e:
        print(f"Error making predictions: {e}")
        raise HTTPException(status_code=500, detail="Error generating forecast.")

    # Prepare response data - only include future points
    try:
        # Filter for future dates only
        last_historical_date = history_df['ds'].max()
        future_forecast_df = forecast_df[forecast_df['ds'] > last_historical_date].copy()

        # Convert 'ds' back to date (without time) for the response
        future_forecast_df['date'] = future_forecast_df['ds'].dt.date

        # Select and rename relevant columns for the response model
        response_data_df = future_forecast_df[['date', 'yhat', 'yhat_lower', 'yhat_upper']]

        # Convert DataFrame rows to list of ForecastPoint models
        forecast_points = [ForecastPoint(forecast_date=row['date'], forecasted_score=row['yhat'], lower_bound=row['yhat_lower'], upper_bound=row['yhat_upper']) for row in response_data_df.to_dict(orient='records')]

        print(f"Returning {len(forecast_points)} forecasted points.")
        return ForecastResponse(forecast_data=forecast_points)
    except Exception as e:
        print(f"Error preparing response data: {e}")
        raise HTTPException(status_code=500, detail="Error formatting forecast results.")


# --- Pydantic Models for Simple Driver-Based Forecasting ---

class DriverDefinition(BaseModel):
    target_account: str = Field(..., description="The account name this driver affects (e.g., 'Revenue', 'Marketing Spend')")
    driver_type: Literal['percentage_growth', 'fixed_value'] = Field(..., description="How the driver affects the target account")
    monthly_values: List[float] = Field(..., description="List of driver values for each period. Length must match num_periods.")

class SimpleForecastRequest(BaseModel):
    base_values: Dict[str, float] = Field(..., description="Dictionary of starting values for relevant accounts at period 0")
    drivers: List[DriverDefinition] = Field(..., description="List of drivers to apply")
    num_periods: int = Field(..., gt=0, description="Number of monthly periods to forecast")

class ForecastResultPeriod(BaseModel):
    period: int = Field(..., description="The forecast period number (1-based)")
    values: Dict[str, float] = Field(..., description="Calculated values for accounts in this period")

class SimpleForecastResponse(BaseModel):
    forecasted_periods: List[ForecastResultPeriod] = Field(..., description="List of calculated results for each forecast period")


# --- New API Endpoint for Account Forecasting ---


@router.post("/forecast-account", response_model=AccountForecastResponse)
async def forecast_account(request: AccountForecastRequest) -> AccountForecastResponse:
    """
    Generates time-series forecasts for multiple financial accounts using ARIMA or Prophet.
    """
    # Check if requested method is available
    if request.method == "Prophet" and not PROPHET_AVAILABLE:
        raise HTTPException(status_code=503, detail="Prophet forecasting is not available. Please install the required dependencies or use ARIMA method.")
    
    if request.method == "ARIMA" and not PMDARIMA_AVAILABLE:
        raise HTTPException(status_code=503, detail="ARIMA forecasting is not available. Please install the required dependencies or use Prophet method.")
    
    print(f"Received account forecast request for {len(request.accounts_data)} accounts, method: {request.method}, forecasting {request.periods} periods with freq '{request.freq}'.")

    all_results: List[SingleAccountForecast] = []

    for account_data in request.accounts_data:
        account_name = account_data.account_name
        print(f"Processing account: {account_name} using {request.method}")

        forecast_result = SingleAccountForecast(account_name=account_name)

        try:
            # --- Method Selection --- 
            if request.method == "Prophet":
                # --- Prophet Logic --- 
                min_data_points_prophet = 3 # Prophet generally needs fewer points
                if len(account_data.historical_data) < min_data_points_prophet:
                    raise ValueError(f"Insufficient historical data ({len(account_data.historical_data)} points) for Prophet. Minimum {min_data_points_prophet} required.")

                # Prepare DataFrame for Prophet
                history_df_prophet = pd.DataFrame([p.model_dump() for p in account_data.historical_data])
                history_df_prophet['ds'] = pd.to_datetime(history_df_prophet['point_date'])
                history_df_prophet = history_df_prophet.rename(columns={'value': 'y'})
                history_df_prophet = history_df_prophet[['ds', 'y']].sort_values('ds') # Ensure sorted
                print(f"Data prepared for {account_name} (Prophet, {len(history_df_prophet)} points):")
                print(history_df_prophet.head())

                # Seasonality settings (adapted from forecast_score)
                yearly_seasonality = True if request.freq in ['Y', 'Q'] or (request.freq == 'M' and len(history_df_prophet) >= 24) else 'auto'
                weekly_seasonality = True if request.freq in ['D', 'W'] else 'auto'
                daily_seasonality = True if request.freq == 'D' else 'auto'
                if request.freq == 'M' and len(history_df_prophet) < 12:
                    yearly_seasonality = False
                    print(f"Disabling yearly seasonality for {account_name} (Prophet) due to < 12 monthly points.")
                if request.freq == 'W' and len(history_df_prophet) < 52:
                    yearly_seasonality = False
                    print(f"Disabling yearly seasonality for {account_name} (Prophet) due to < 52 weekly points.")

                prophet_model = Prophet(
                    yearly_seasonality=yearly_seasonality,
                    weekly_seasonality=weekly_seasonality,
                    daily_seasonality=daily_seasonality,
                    # growth='logistic' could be added if bounds are known/relevant
                    # changepoint_prior_scale=0.05 # Default
                )
                print(f"Fitting Prophet model for {account_name}...")
                prophet_model.fit(history_df_prophet)

                print(f"Creating future DataFrame for {account_name} (Prophet)...")
                future_df = prophet_model.make_future_dataframe(periods=request.periods, freq=request.freq)
                print(f"Making Prophet predictions for {account_name}...")
                forecast_df = prophet_model.predict(future_df)

                # Filter for future dates only
                last_historical_date = history_df_prophet['ds'].max()
                future_forecast_df = forecast_df[forecast_df['ds'] > last_historical_date].copy()
                future_forecast_df['date'] = future_forecast_df['ds'].dt.date

                # Prepare response
                forecast_points = [
                    AccountForecastPoint(forecast_date=row['date'], forecasted_value=row['yhat'])
                    for _, row in future_forecast_df.iterrows()
                ]
                forecast_result.forecast_data = forecast_points
                print(f"Prophet forecast generated successfully for {account_name}.")

            elif request.method == "ARIMA":
                try:
                    # --- ARIMA Logic with improved compatibility --- 
                    min_data_points_arima = 10 # Minimum data points needed for auto_arima
                    if len(account_data.historical_data) < min_data_points_arima:
                         raise ValueError(f"Insufficient historical data ({len(account_data.historical_data)} points) for ARIMA. Minimum {min_data_points_arima} required.")

                    # Prepare DataFrame for ARIMA
                    history_df_arima = pd.DataFrame([p.model_dump() for p in account_data.historical_data])
                    history_df_arima['date'] = pd.to_datetime(history_df_arima['point_date'])
                    history_df_arima = history_df_arima.sort_values('date').set_index('date')
                    
                    # Use pmdarima with compatibility settings
                    from pmdarima import auto_arima
                    import warnings
                    warnings.filterwarnings('ignore')
                    
                    # Fit ARIMA model with error handling
                    model = auto_arima(
                        history_df_arima['value'], 
                        seasonal=True, 
                        stepwise=True,
                        suppress_warnings=True,
                        error_action='ignore'
                    )
                    
                    # Generate forecasts
                    forecast_values, conf_int = model.predict(n_periods=request.periods, return_conf_int=True)
                    
                    # Create forecast points
                    forecast_points = []
                    start_date = history_df_arima.index[-1]
                    for i, value in enumerate(forecast_values):
                        if request.freq == 'M':
                            forecast_date = start_date + pd.DateOffset(months=i+1)
                        elif request.freq == 'Q':
                            forecast_date = start_date + pd.DateOffset(months=(i+1)*3)
                        else:
                            forecast_date = start_date + pd.DateOffset(days=i+1)
                            
                        forecast_points.append(AccountForecastPoint(
                            forecast_date=forecast_date.strftime('%Y-%m-%d'),
                            forecasted_value=float(value)
                        ))
                    
                    forecast_result.forecast_data = forecast_points
                    print(f"ARIMA forecast generated successfully for {account_name}.")
                    
                except Exception as arima_error:
                    print(f"ARIMA failed for {account_name}, falling back to Prophet: {arima_error}")
                    # Fall back to Prophet if ARIMA fails

            else:
                 # Should not happen due to Pydantic validation, but good practice
                 raise ValueError(f"Unsupported forecast method specified: {request.method}")

        except Exception as e:
            # Catch errors from either Prophet or ARIMA blocks
            error_msg = f"Error during {request.method} forecasting for {account_name}: {e}"
            print(error_msg)
            forecast_result.error = error_msg
        
        all_results.append(forecast_result)

    return AccountForecastResponse(forecast_results=all_results)


# --- API Endpoint for Simple Driver-Based Forecasting ---

@router.post("/driver-based-simple", response_model=SimpleForecastResponse)
def create_simple_driver_based_forecast(request: SimpleForecastRequest) -> SimpleForecastResponse:
    """Generates a simple forecast based on drivers applied monthly."""
    
    # --- Input Validation ---
    for driver in request.drivers:
        if len(driver.monthly_values) != request.num_periods:
            raise HTTPException(
                status_code=400,
                detail=f"Driver for '{driver.target_account}' has {len(driver.monthly_values)} values, but num_periods is {request.num_periods}."
            )
        if driver.target_account not in request.base_values and driver.driver_type == 'percentage_growth':
             raise HTTPException(
                status_code=400,
                detail=f"Percentage growth driver for '{driver.target_account}' requires a base value for that account."
            )

    # --- Forecasting Logic --- 
    forecasted_periods: List[ForecastResultPeriod] = []
    # Use deepcopy to avoid modifying the original request base_values dict
    import copy
    current_values = copy.deepcopy(request.base_values) 

    for period_index in range(request.num_periods):
        period_number = period_index + 1
        # Start with previous period's values before applying current period's drivers
        next_values = copy.deepcopy(current_values) 
        
        # Apply drivers for the current period
        for driver in request.drivers:
            # Ensure driver_value exists for the period, validated earlier
            driver_value_for_period = driver.monthly_values[period_index]
            target_account = driver.target_account

            if driver.driver_type == 'percentage_growth':
                # Calculate growth based on the *previous* period's value for that account
                # Assuming percentage is like 5 for 5%
                base = current_values.get(target_account, 0) # Default to 0 if somehow missing after validation
                next_values[target_account] = base * (1 + driver_value_for_period / 100.0)
            
            elif driver.driver_type == 'fixed_value':
                # Set the account to the fixed value for this period
                next_values[target_account] = driver_value_for_period
            
            # TODO: Add more driver types later (e.g., linked to another account, formula-based)

        # Store results for the period
        forecasted_periods.append(
            ForecastResultPeriod(period=period_number, values=next_values)
        )
        # Update current_values for the next iteration *after* calculating all drivers for this period
        current_values = next_values

    return SimpleForecastResponse(forecasted_periods=forecasted_periods)
