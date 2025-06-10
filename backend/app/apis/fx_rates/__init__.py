"""
API for managing Foreign Exchange (FX) Rates.
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import List, Optional
from datetime import date
import pandas as pd
import databutton as db
import io

router = APIRouter(prefix="/fx-rates", tags=["FX Rates"])

FX_RATES_STORAGE_KEY = "fx_rates_historical.parquet"

# --- Pydantic Models ---

class FXRateEntry(BaseModel):
    """Represents a single FX rate entry."""
    rate_date: date # Changed from 'date' to avoid clash with datetime.date type hint
    from_currency: str
    to_currency: str
    rate: float

class FXRateUploadResponse(BaseModel):
    """Response after uploading FX rates."""
    message: str
    rows_added: int
    total_rows_after_upload: int

class FXRateListResponse(BaseModel):
    """Response for listing FX rates."""
    rates: List[FXRateEntry]

class FXRateFilterParams(BaseModel):
    """Optional query parameters for filtering FX rates."""
    start_date: Optional[date] = Query(None, description="Filter rates from this date onwards (YYYY-MM-DD)")
    end_date: Optional[date] = Query(None, description="Filter rates up to this date (YYYY-MM-DD)")
    from_currency: Optional[str] = Query(None, description="Filter by the source currency code (e.g., USD)")
    to_currency: Optional[str] = Query(None, description="Filter by the target currency code (e.g., AUD)")


# --- Helper Functions ---

def load_fx_rates_df() -> pd.DataFrame:
    """Loads the FX rates DataFrame from storage, ensuring date column is correct type."""
    try:
        df = db.storage.dataframes.get(FX_RATES_STORAGE_KEY, default=pd.DataFrame())
        if not df.empty and 'rate_date' in df.columns:
            # Ensure rate_date is datetime after loading
            df['rate_date'] = pd.to_datetime(df['rate_date']).dt.date
        elif df.empty:
             # Define columns for an empty DataFrame to avoid future errors
             df = pd.DataFrame(columns=['rate_date', 'from_currency', 'to_currency', 'rate'])
             df['rate_date'] = pd.to_datetime(df['rate_date']).dt.date # Ensure correct dtype even when empty
        return df
    except Exception as e:
        print(f"Error loading FX rates: {e}")
        # Return empty DataFrame with correct schema on error
        df = pd.DataFrame(columns=['rate_date', 'from_currency', 'to_currency', 'rate'])
        df['rate_date'] = pd.to_datetime(df['rate_date']).dt.date
        return df


def save_fx_rates_df(df: pd.DataFrame):
    """Saves the FX rates DataFrame to storage."""
    try:
        # Ensure date is just date, not datetime, before saving if needed (Parquet handles date well)
        if 'rate_date' in df.columns:
             df['rate_date'] = pd.to_datetime(df['rate_date']).dt.date
        db.storage.dataframes.put(FX_RATES_STORAGE_KEY, df)
    except Exception as e:
        print(f"Error saving FX rates: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save FX rates: {e}")

# --- API Endpoints ---

@router.post("/upload", response_model=FXRateUploadResponse)
async def upload_fx_rates(file: UploadFile = File(...)):
    """
    Uploads FX rates from a CSV file.
    Expects columns: date, from_currency, to_currency, rate.
    Appends to existing rates, removes duplicates (keeping latest), and sorts.
    """
    # Placeholder implementation
    print(f"Received file: {file.filename}")
    # TODO: Implement CSV parsing, DataFrame merging, deduplication, sorting, and saving.
    
    # Read existing data
    existing_df = load_fx_rates_df()
    
    # Read uploaded data
    content = await file.read()
    try:
        # Assuming CSV format, adjust parameters as needed (e.g., separator)
        new_df = pd.read_csv(io.BytesIO(content))
        # Basic validation - check required columns exist
        required_columns = ['date', 'from_currency', 'to_currency', 'rate']
        if not all(col in new_df.columns for col in required_columns):
             raise ValueError(f"CSV must contain columns: {', '.join(required_columns)}")
        
        # Rename 'date' column to 'rate_date' for consistency
        new_df = new_df.rename(columns={'date': 'rate_date'})
        
        # Convert date column and ensure it's date type
        new_df['rate_date'] = pd.to_datetime(new_df['rate_date']).dt.date

        rows_before = len(existing_df)
        rows_in_upload = len(new_df)

        # Combine, deduplicate, and sort
        combined_df = pd.concat([existing_df, new_df], ignore_index=True)
        # Keep the last entry for each date/currency pair
        combined_df = combined_df.sort_values(by='rate_date').drop_duplicates(
            subset=['rate_date', 'from_currency', 'to_currency'], 
            keep='last'
        )
        # Sort final result for consistency
        combined_df = combined_df.sort_values(by=['rate_date', 'from_currency', 'to_currency']).reset_index(drop=True)

        # Save back to storage
        save_fx_rates_df(combined_df)
        
        rows_after = len(combined_df)
        rows_added = rows_after - rows_before # Approximates net additions

        return FXRateUploadResponse(
            message=f"Successfully uploaded and processed {file.filename}",
            rows_added=rows_added, # This is approximate if duplicates were removed/updated
            total_rows_after_upload=rows_after
        )

    except pd.errors.EmptyDataError:
         raise HTTPException(status_code=400, detail="Uploaded CSV file is empty.")
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=f"Error processing CSV: {ve}")
    except Exception as e:
        print(f"Error during FX rate upload: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error processing file: {e}")


@router.get("", response_model=FXRateListResponse)
def get_fx_rates(filters: FXRateFilterParams = Depends()):
    """
    Retrieves FX rates, optionally filtering by date range and currencies.
    """
    # Placeholder implementation
    # TODO: Implement loading from storage and filtering based on 'filters' dependency.
    
    df = load_fx_rates_df()
    
    if df.empty:
        return FXRateListResponse(rates=[])

    # Apply filters
    if filters.start_date:
        df = df[df['rate_date'] >= filters.start_date]
    if filters.end_date:
        df = df[df['rate_date'] <= filters.end_date]
    if filters.from_currency:
        df = df[df['from_currency'].str.upper() == filters.from_currency.upper()]
    if filters.to_currency:
        df = df[df['to_currency'].str.upper() == filters.to_currency.upper()]
        
    # Convert DataFrame rows to list of Pydantic models
    rates_list = df.to_dict(orient='records')
    
    # Validate and return using the Pydantic model
    # Note: Pydantic will automatically convert the dicts if fields match
    return FXRateListResponse(rates=rates_list)

