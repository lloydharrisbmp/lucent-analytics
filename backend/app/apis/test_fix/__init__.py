# Test script to verify the advanced forecasting API fix
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from pydantic import BaseModel
from typing import List, Dict, Optional
from fastapi import APIRouter

# Initialize router (required for FastAPI modules)
router = APIRouter()

# Define minimal test models
class ForecastPeriod(BaseModel):
    netIncome: float
    revenue: float
    expenses: float
    date: str

class ForecastBaselineData(BaseModel):
    revenue: List[float]
    costOfSales: List[float]
    expenses: List[float]

class ForecastScenario(BaseModel):
    name: str
    baseline: ForecastBaselineData
    periods: int = 6
    startsAt: str = "2025-01-01"
    intervalMonths: int = 1

class HistoricalData(BaseModel):
    revenue: List[float]
    expenses: List[float]

class AdvancedForecastRequest(BaseModel):
    scenario: ForecastScenario
    algorithm: str = "arima"
    seasonalPeriod: int = 12
    useHistoricalData: bool = True
    historicalData: Optional[HistoricalData] = None

class TestForecast:
    def run_test(self):
        print("\n===== Testing Advanced Forecasting API Fix =====\n")
        
        # Test with the ARIMA algorithm that had issues
        test_request = AdvancedForecastRequest(
            scenario=ForecastScenario(
                name="Test Scenario",
                baseline=ForecastBaselineData(
                    revenue=[100000, 110000, 115000, 120000, 125000, 130000],
                    costOfSales=[40000, 42000, 45000, 48000, 50000, 52000],
                    expenses=[30000, 32000, 33000, 35000, 36000, 37000]
                ),
                periods=6
            ),
            algorithm="arima",
            useHistoricalData=True,
            historicalData=HistoricalData(
                revenue=[98000, 99000, 100000, 102000, 105000, 108000],
                expenses=[28000, 29000, 30000, 31000, 32000, 33000]
            )
        )
        
        # Import the API module
        import sys
        import os
        sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        
        try:
            # Test if the module imports properly
            from advanced_forecasting import create_advanced_forecast, PMDARIMA_AVAILABLE
            print("Module imported successfully.")
            print(f"PMDARIMA_AVAILABLE = {PMDARIMA_AVAILABLE}")
            
            # Try to run a forecast
            result = create_advanced_forecast(test_request)
            print("\nForecast generated successfully!")
            print(f"Algorithm used: {result.algorithm}")
            print(f"Number of forecast periods: {len(result.forecast)}")
            return True
        except Exception as e:
            print(f"\nError testing forecasting: {e}")
            import traceback
            traceback.print_exc()
            return False

if __name__ == "__main__":
    test = TestForecast()
    success = test.run_test()
    print(f"\nTest {'passed' if success else 'failed'}")
