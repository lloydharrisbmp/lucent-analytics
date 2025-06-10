from fastapi import APIRouter, Depends
from app.auth import AuthorizedUser
from pydantic import BaseModel
from typing import Dict, List, Optional
import json
import databutton as db

# Create router
router = APIRouter()

# Sample data for testing purposes
SAMPLE_DATA = [
    {
        "industry_code": "E711",
        "industry_name": "Accommodation",
        "metric_name": "Cost of sales/turnover",
        "value": 0.42,
        "year": "2023",
        "turnover_range": "$75,000 to $250,000",
        "source_id": "ato_small_business"
    },
    {
        "industry_code": "E711",
        "industry_name": "Accommodation",
        "metric_name": "Total expenses/turnover",
        "value": 0.78,
        "year": "2023",
        "turnover_range": "$75,000 to $250,000",
        "source_id": "ato_small_business"
    },
    {
        "industry_code": "E711",
        "industry_name": "Accommodation",
        "metric_name": "Rent/turnover",
        "value": 0.15,
        "year": "2023",
        "turnover_range": "$75,000 to $250,000",
        "source_id": "ato_small_business"
    },
    {
        "industry_code": "E711",
        "industry_name": "Accommodation",
        "metric_name": "Labour/turnover",
        "value": 0.22,
        "year": "2023",
        "turnover_range": "$75,000 to $250,000",
        "source_id": "ato_small_business"
    },
    {
        "industry_code": "M692",
        "industry_name": "Accounting services",
        "metric_name": "Cost of sales/turnover",
        "value": 0.08,
        "year": "2023",
        "turnover_range": "$75,000 to $250,000",
        "source_id": "ato_small_business"
    },
    {
        "industry_code": "M692",
        "industry_name": "Accounting services",
        "metric_name": "Total expenses/turnover",
        "value": 0.64,
        "year": "2023",
        "turnover_range": "$75,000 to $250,000",
        "source_id": "ato_small_business"
    },
    {
        "industry_code": "M692",
        "industry_name": "Accounting services",
        "metric_name": "Rent/turnover",
        "value": 0.09,
        "year": "2023",
        "turnover_range": "$75,000 to $250,000",
        "source_id": "ato_small_business"
    },
    {
        "industry_code": "M692",
        "industry_name": "Accounting services",
        "metric_name": "Labour/turnover",
        "value": 0.31,
        "year": "2023",
        "turnover_range": "$75,000 to $250,000",
        "source_id": "ato_small_business"
    },
    {
        "industry_code": "G411",
        "industry_name": "Retail trade",
        "metric_name": "Sales and service income",
        "value": 1250000,
        "year": "2023",
        "source_id": "abs_industry_stats"
    },
    {
        "industry_code": "G411",
        "industry_name": "Retail trade",
        "metric_name": "Operating profit before tax",
        "value": 85000,
        "year": "2023",
        "source_id": "abs_industry_stats"
    },
    {
        "industry_code": "G411",
        "industry_name": "Retail trade",
        "metric_name": "Profit margin",
        "value": 0.068,
        "year": "2023",
        "source_id": "abs_industry_stats"
    },
    {
        "industry_code": "C111",
        "industry_name": "Manufacturing",
        "metric_name": "Sales and service income",
        "value": 2850000,
        "year": "2023",
        "source_id": "abs_industry_stats"
    },
    {
        "industry_code": "C111",
        "industry_name": "Manufacturing",
        "metric_name": "Operating profit before tax",
        "value": 256500,
        "year": "2023",
        "source_id": "abs_industry_stats"
    },
    {
        "industry_code": "C111",
        "industry_name": "Manufacturing",
        "metric_name": "Profit margin",
        "value": 0.09,
        "year": "2023",
        "source_id": "abs_industry_stats"
    },
    # Added for 2022 (previous year data for comparison)
    {
        "industry_code": "E711",
        "industry_name": "Accommodation",
        "metric_name": "Cost of sales/turnover",
        "value": 0.40,
        "year": "2022",
        "turnover_range": "$75,000 to $250,000",
        "source_id": "ato_small_business"
    },
    {
        "industry_code": "M692",
        "industry_name": "Accounting services",
        "metric_name": "Cost of sales/turnover",
        "value": 0.07,
        "year": "2022",
        "turnover_range": "$75,000 to $250,000",
        "source_id": "ato_small_business"
    },
    {
        "industry_code": "G411",
        "industry_name": "Retail trade",
        "metric_name": "Profit margin",
        "value": 0.064,
        "year": "2022",
        "source_id": "abs_industry_stats"
    },
    {
        "industry_code": "C111",
        "industry_name": "Manufacturing",
        "metric_name": "Profit margin",
        "value": 0.085,
        "year": "2022",
        "source_id": "abs_industry_stats"
    }
]

# Initialize the data store with sample data
def initialize_benchmark_data():
    """Initialize the benchmark data store with sample data if it doesn't exist"""
    try:
        # Check if data already exists
        existing_data = db.storage.json.get('benchmark_data_all', default=[])
        if not existing_data:
            # Store the sample data
            db.storage.json.put('benchmark_data_all', SAMPLE_DATA)
            
            # Also store source-specific data
            ato_data = [item for item in SAMPLE_DATA if item['source_id'] == 'ato_small_business']
            abs_data = [item for item in SAMPLE_DATA if item['source_id'] == 'abs_industry_stats']
            
            db.storage.json.put('benchmark_data_ato_small_business', ato_data)
            db.storage.json.put('benchmark_data_abs_industry_stats', abs_data)
            
            print(f"Initialized benchmark data store with {len(SAMPLE_DATA)} sample records")
    except Exception as e:
        print(f"Error initializing benchmark data: {e}")

# Initialize data when the module is loaded
initialize_benchmark_data()
