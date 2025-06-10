"""
API for detecting anomalies in financial time series data.
"""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field, validator
import pandas as pd
from prophet import Prophet
from typing import List, Dict, Any, Optional
from datetime import date
import numpy as np

# Create an API router
router = APIRouter(
    prefix="/tax-compliance/anomaly-detection",
    tags=["Tax & Compliance", "Anomaly Detection"]
)

# --- Models ---
class TimeSeriesPoint(BaseModel):
    ds: date = Field(..., description="The date of the data point (YYYY-MM-DD)")
    y: float = Field(..., description="The numeric value of the data point")

class TimeSeriesData(BaseModel):
    data: List[TimeSeriesPoint] = Field(..., description="List of time series data points")
    # Optional parameters for Prophet can be added here later, e.g., seasonality settings

    @validator('data')
    def check_min_data_points(cls, v):
        if len(v) < 3:
            raise ValueError('At least 3 data points are required for anomaly detection')
        return v

class Anomaly(BaseModel):
    ds: date = Field(..., description="Date of the detected anomaly")
    y: float = Field(..., description="Value at the time of the anomaly")
    anomaly_type: str = Field(..., description="Type of anomaly ('outlier' or 'changepoint')")
    details: Optional[Dict[str, Any]] = Field(None, description="Additional details, e.g., forecast value, interval")

class AnomalyDetectionResponse(BaseModel):
    anomalies: List[Anomaly] = Field(..., description="List of detected anomalies")


# --- Endpoints ---
@router.post("/detect", response_model=AnomalyDetectionResponse)
async def detect_tax_anomalies(payload: TimeSeriesData) -> AnomalyDetectionResponse:
    """
    Detects anomalies (outliers, level shifts, trend changes) in the provided financial time series data.

    Uses Facebook Prophet model to identify anomalies based on deviations from expected patterns
    and significant changepoints.

    Args:
        payload (TimeSeriesData): The input time series data.

    Returns:
        AnomalyDetectionResponse: A list of detected anomalies.
    """
    print(f"Received request to detect anomalies for {len(payload.data)} data points.")
    
    detected_anomalies: List[Anomaly] = []

    try:
        # 1. Convert payload to DataFrame
        df = pd.DataFrame([p.dict() for p in payload.data])
        df['ds'] = pd.to_datetime(df['ds']) # Ensure ds is datetime
        df = df.sort_values(by='ds')

        # 2. Initialize and fit Prophet model
        # Consider making interval_width, changepoint_prior_scale configurable later
        model = Prophet(interval_width=0.95, changepoint_prior_scale=0.05)
        # TODO: Potentially add seasonality detection/configuration later
        model.fit(df)

        # 3. Make predictions (forecast)
        # We predict on the historical dates to get the intervals
        forecast = model.predict(df[['ds']])

        # 4. Merge forecast with actual data
        results = pd.merge(df, forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']], on='ds')

        # 5. Identify Outliers
        results['is_outlier'] = (results['y'] < results['yhat_lower']) | (results['y'] > results['yhat_upper'])
        outliers = results[results['is_outlier']]

        for _, row in outliers.iterrows():
            detected_anomalies.append(
                Anomaly(
                    ds=row['ds'].date(),
                    y=row['y'],
                    anomaly_type='outlier',
                    details={
                        'yhat': row['yhat'],
                        'yhat_lower': row['yhat_lower'],
                        'yhat_upper': row['yhat_upper']
                    }
                )
            )

        # 6. Identify Significant Changepoints
        # Prophet automatically detects changepoints during fitting.
        # We filter them based on the magnitude of the change (delta).

        significant_changepoints_dates = []
        if len(model.changepoints) > 0:
             # Create a Series pairing changepoint dates with their delta magnitudes
            deltas = model.params['delta'].squeeze() # Get delta values as a Series/array

            # Ensure deltas has the same length as changepoints before creating Series
            if len(deltas) == len(model.changepoints):
                changepoint_deltas = pd.Series(deltas, index=model.changepoints)

                # Calculate the threshold based on absolute delta magnitude
                # Avoid quantile calculation if there are no deltas or only one delta
                if len(changepoint_deltas) > 0:
                    abs_deltas = np.abs(changepoint_deltas)
                    if len(abs_deltas) > 1:
                         delta_threshold = np.quantile(abs_deltas, 0.8) # Top 20% magnitude
                    else:
                         delta_threshold = abs_deltas.iloc[0] # Use the single value if only one

                    # Filter the changepoint_deltas Series
                    significant_changepoints_series = changepoint_deltas[abs_deltas >= delta_threshold]

                    # Get the dates (index) of the significant changepoints
                    significant_changepoints_dates = significant_changepoints_series.index.tolist()
                else:
                    print("No delta values found for changepoints.")
            else:
                print(f"Warning: Mismatch between number of changepoints ({len(model.changepoints)}) and deltas ({len(deltas)}). Skipping changepoint significance filtering.")


        # Fetch the original y value for the significant changepoint dates
        changepoint_data = df[df['ds'].isin(significant_changepoints_dates)]

        for _, row in changepoint_data.iterrows():
             detected_anomalies.append(
                Anomaly(
                    ds=row['ds'].date(),
                    y=row['y'],
                    anomaly_type='changepoint',
                    details={ # Add changepoint specific details if needed
                        # 'delta': model.params['delta'][model.changepoints == row['ds']].iloc[0] # Example
                    }
                )
            )
            
        # Sort anomalies by date
        detected_anomalies.sort(key=lambda a: a.ds)

    except Exception as e:
        print(f"Error during anomaly detection: {e}")
        # Consider more specific error handling
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Anomaly detection failed: {str(e)}"
        )

    print(f"Anomaly detection complete. Found {len(detected_anomalies)} anomalies.")
    return AnomalyDetectionResponse(anomalies=detected_anomalies)


