from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, Field, validator
import pandas as pd
from typing import List, Dict, Any, Optional, Literal
from datetime import date
import os # Added for OpenAI key check potentially
from openai import OpenAI # Added for LLM
import databutton as db # Added for secrets

# Potentially import models or functions related to financial data access
# from app.apis.data_import import ... # Example
# from app.auth import AuthorizedUser # If endpoint needs auth

# Create an API router
router = APIRouter(
    prefix="/routes/reporting/variance-analysis",
    tags=["Reporting", "Variance Analysis"]
)

# --- Models for /calculate endpoint ---
class Thresholds(BaseModel):
    absolute: Optional[float] = Field(None, description="Absolute threshold for flagging significant variance.")
    percentage: Optional[float] = Field(None, description="Percentage threshold (e.g., 0.1 for 10%) for flagging significant variance.")

    @validator('percentage')
    def check_percentage(cls, v):
        if v is not None and (v < 0 or v > 1):
             raise ValueError('Percentage threshold must be between 0 and 1')
        return v

class VarianceAnalysisRequest(BaseModel):
    entity_id: str = Field(..., description="Identifier for the business entity.")
    report_type: Literal['pnl', 'balance_sheet'] = Field(..., description="Type of financial report.")
    period_end_date: date = Field(..., description="The end date of the primary period (e.g., YYYY-MM-DD).")
    comparison_type: Literal['budget', 'prior_period', 'prior_year'] = Field(..., description="What to compare the actuals against.")
    thresholds: Thresholds = Field(..., description="Thresholds for determining significance.")
    # Optional: Add filters for specific accounts or levels later

class VarianceItem(BaseModel):
    account_name: str = Field(..., description="Name or code of the financial account/item.")
    actual_value: float = Field(..., description="The value for the primary period.")
    comparison_value: Optional[float] = Field(None, description="The value for the comparison period (budget, prior period, etc.).")
    absolute_variance: Optional[float] = Field(None, description="Actual - Comparison Value.")
    percentage_variance: Optional[float] = Field(None, description="(Actual - Comparison) / Comparison Value. Null if comparison is zero.")
    is_significant: bool = Field(False, description="True if variance exceeds defined thresholds.")
    variance_direction: Optional[Literal['favourable', 'unfavourable']] = Field(None, description="Indicates if the variance is favourable or unfavourable (context-dependent).")

class VarianceAnalysisResponse(BaseModel):
    analysis_details: Dict[str, Any] = Field(..., description="Details about the analysis performed (request echo).")
    variances: List[VarianceItem] = Field(..., description="List of calculated variances for each relevant account.")

# --- Models for /generate-narrative endpoint ---

# Input format for a single variance passed to the LLM narrative endpoint.
# This should ideally match the significant items filtered from VarianceItem.
class VarianceInput(BaseModel):
    account_name: str = Field(..., description="Name of the account with significant variance.")
    actual_value: float = Field(..., description="Actual value for the period.")
    comparison_value: Optional[float] = Field(None, description="Comparison value (budget, prior period, etc.).") # Made optional
    absolute_variance: Optional[float] = Field(None, description="The absolute variance amount.") # Made optional
    percentage_variance: Optional[float] = Field(None, description="The percentage variance.") # Made optional
    period: str = Field(..., description="Reporting period identifier (e.g., 'Q1 2024').") # Changed from date to str
    variance_direction: Optional[Literal['favourable', 'unfavourable']] = Field(None, description="Direction of variance.") # Added
    # Add other fields from VarianceItem if needed for the prompt

class NarrativeRequest(BaseModel):
    variances: List[VarianceInput] = Field(..., description="List of significant variances needing explanation.")
    context: Optional[str] = Field(None, description="Optional broader context (e.g., company strategy, market events).")

class NarrativeResponse(BaseModel):
    narrative: str = Field(..., description="The LLM-generated narrative explanation.")


import numpy as np # Needed for variance calculation potentially

# --- OpenAI Client Initialization ---

openai_api_key = db.secrets.get("OPENAI_API_KEY")
if not openai_api_key:
    print("Warning: OPENAI_API_KEY secret not found. Narrative generation will fail.")
    client = None
else:
    try:
        client = OpenAI(api_key=openai_api_key)
        print("OpenAI client initialized successfully.")
    except Exception as e:
        print(f"Error initializing OpenAI client: {e}")
        client = None

# --- Helper Functions for /calculate ---

def _fetch_financial_data(entity_id: str, report_type: str, period_end_date: date) -> pd.DataFrame:
    """Placeholder: Fetches processed financial data for a specific entity, report, and period."""
    print(f"[Placeholder] Fetching {report_type} data for {entity_id} ending {period_end_date}")
    # TODO: Implement actual data retrieval from db.storage or other source
    #       based on how data imports (e.g., MYA-96, MYA-98) store results.
    # Example: key = f"{entity_id}_{report_type}_{period_end_date}.parquet"
    #          try:
    #              df = db.storage.dataframes.get(key)
    #          except FileNotFoundError:
    #              raise HTTPException(status_code=404, detail=f"Data not found for {key}")
    
    # Returning placeholder data for now
    if report_type == 'pnl':
         return pd.DataFrame({
            'account_name': ['Revenue', 'COGS', 'Gross Profit', 'Operating Expenses', 'Net Income'],
            'value': [100000.0, -40000.0, 60000.0, -30000.0, 30000.0]
        })
    elif report_type == 'balance_sheet':
         # Add placeholder BS data if needed for testing later
         return pd.DataFrame({'account_name': ['Cash', 'Receivables', 'Assets'], 'value': [50000.0, 20000.0, 70000.0]})
    else:
        return pd.DataFrame()

def _fetch_comparison_data(entity_id: str, report_type: str, period_end_date: date, comparison_type: str) -> pd.DataFrame:
    """Placeholder: Fetches comparison data (budget, prior period, prior year)."""
    print(f"[Placeholder] Fetching comparison data ({comparison_type}) for {entity_id}, {report_type} based on {period_end_date}")
    
    comparison_date = None
    if comparison_type == 'budget':
        # Budget data might be stored differently, maybe by period without exact date matching needed?
        print(f"[Placeholder] Needs logic to fetch budget data for period ending {period_end_date}")
        # Fetch budget data corresponding to period_end_date
        # Example key: f"{entity_id}_{report_type}_{period_end_date}_budget.parquet"
    elif comparison_type == 'prior_period':
        # This needs logic to determine the 'prior' period (e.g., previous month/quarter)
        # Requires knowing the reporting frequency (monthly, quarterly)
        # Example: Assuming monthly - subtract 1 month (approx)
        comparison_date = period_end_date - pd.DateOffset(months=1)
        print(f"[Placeholder] Calculated prior period date: {comparison_date.date()}")
        # Fetch data for comparison_date
    elif comparison_type == 'prior_year':
        comparison_date = period_end_date - pd.DateOffset(years=1)
        print(f"[Placeholder] Calculated prior year date: {comparison_date.date()}")
        # Fetch data for comparison_date
    
    # TODO: Implement actual fetching using the determined comparison date/period
    #       Similar logic to _fetch_financial_data but using comparison_date/period info
    
    # Returning placeholder data for now - specific to PnL example
    if report_type == 'pnl':
        # Simulate slightly different data based on comparison type for demo
        base_values = [95000.0, -38000.0, 57000.0, -32000.0, 25000.0]
        if comparison_type == 'prior_year':
            base_values = [v * 0.9 for v in base_values] # Simulate lower values last year
        return pd.DataFrame({
            'account_name': ['Revenue', 'COGS', 'Gross Profit', 'Operating Expenses', 'Net Income'],
            'value': base_values 
        })
    else:
        # Add placeholder BS comparison data if needed
        return pd.DataFrame({'account_name': ['Cash', 'Receivables', 'Assets'], 'value': [45000.0, 18000.0, 63000.0]})


def _calculate_and_merge_variances(
    actual_df: pd.DataFrame, comparison_df: pd.DataFrame
) -> List[VarianceItem]:
    """
    Merges actual and comparison data, calculates variances.
    """
    # Ensure columns are named consistently for merging
    actual_df = actual_df.rename(columns={'value': 'actual_value'})
    comparison_df = comparison_df.rename(columns={'value': 'comparison_value'})

    # Outer merge to keep all accounts from both dataframes
    merged_df = pd.merge(
        actual_df[['account_name', 'actual_value']],
        comparison_df[['account_name', 'comparison_value']],
        on='account_name',
        how='outer'
    )

    # Fill missing values with 0 for calculation where appropriate
    merged_df['actual_value'] = merged_df['actual_value'].fillna(0)
    # Comparison missing means we can't calculate variance effectively, keep NaN marker for logic

    # Calculate absolute variance
    # If comparison is NaN, variance is effectively the actual value (subtracted 0)
    merged_df['absolute_variance'] = merged_df['actual_value'] - merged_df['comparison_value'].fillna(0)

    # Calculate percentage variance, handle division by zero or NaN comparison
    merged_df['percentage_variance'] = merged_df.apply(
        lambda row: (
            (row['absolute_variance'] / row['comparison_value'])
            if pd.notna(row['comparison_value']) and row['comparison_value'] != 0
            else None # Represent impossible calculation as None
        ),
        axis=1
    )

    # Convert DataFrame rows to VarianceItem models
    variance_items: List[VarianceItem] = []
    for _, row in merged_df.iterrows():
        # Convert NaN/NaT potentially introduced by pandas to None for Pydantic
        comparison_value = row['comparison_value'] if pd.notna(row['comparison_value']) else None
        absolute_variance = row['absolute_variance'] if pd.notna(row['absolute_variance']) else None
        percentage_variance = row['percentage_variance'] if pd.notna(row['percentage_variance']) else None

        # TODO: Add logic for 'favourable'/'unfavourable' based on account type/context later
        variance_direction = None # Placeholder

        variance_items.append(
            VarianceItem(
                account_name=row['account_name'],
                actual_value=row['actual_value'], # Already filled NaN with 0
                comparison_value=comparison_value,
                absolute_variance=absolute_variance,
                percentage_variance=percentage_variance,
                is_significant=False,  # Will be set in the next step
                variance_direction=variance_direction # Placeholder
            )
        )

    return variance_items


def _apply_thresholds(variance_items: List[VarianceItem], thresholds: Thresholds) -> None:
    """
    Applies significance thresholds to a list of VarianceItems in place.
    """
    abs_threshold = thresholds.absolute
    pct_threshold = thresholds.percentage

    for item in variance_items:
        significant = False
        # Check absolute threshold
        if abs_threshold is not None and item.absolute_variance is not None:
            if abs(item.absolute_variance) >= abs_threshold:
                significant = True

        # Check percentage threshold (only if not already flagged by absolute)
        if not significant and pct_threshold is not None and item.percentage_variance is not None:
             # Check if comparison value is non-zero before applying percentage threshold
             # (Percentage variance is None if comparison is 0 or NaN)
            if item.comparison_value is not None and item.comparison_value != 0:
                if abs(item.percentage_variance) >= pct_threshold:
                    significant = True

        item.is_significant = significant
    # No need to return, list is modified in place


# --- Endpoints ---

@router.post("/calculate", response_model=VarianceAnalysisResponse)
async def calculate_variances(
    payload: VarianceAnalysisRequest,
    # user: AuthorizedUser = Depends() # Uncomment if endpoint needs authentication
) -> VarianceAnalysisResponse:
    """
    Calculates financial variances based on the provided request parameters.
    Fetches actual and comparison data (budget, prior period, prior year),
    computes absolute and percentage variances, and flags significant items.

    Args:
        payload (VarianceAnalysisRequest): Parameters specifying the analysis.
        # user (AuthorizedUser): The authenticated user (if required).

    Returns:
        VarianceAnalysisResponse: The results of the variance analysis.
    """
    print(f"Received variance analysis request for entity {payload.entity_id}, period {payload.period_end_date}, comparison {payload.comparison_type}")

    # 1. Fetch Actual Data
    actual_data_df = _fetch_financial_data(
        payload.entity_id, payload.report_type, payload.period_end_date
    )
    if actual_data_df.empty:
         raise HTTPException(status_code=404, detail="Actual data not found for the specified criteria.")

    # 2. Fetch Comparison Data
    comparison_data_df = _fetch_comparison_data(
        payload.entity_id, payload.report_type, payload.period_end_date, payload.comparison_type
    )
    if comparison_data_df.empty:
        # Allow analysis even if comparison data is missing, variances will be null
        print(f"Warning: Comparison data not found for {payload.comparison_type}. Variances will be limited.")
        # Create an empty df with expected columns to avoid merge errors later
        comparison_data_df = pd.DataFrame(columns=['account_name', 'value'])


    # 3. Perform Variance Calculation
    calculated_variances = _calculate_and_merge_variances(actual_data_df, comparison_data_df)

    # 4. Apply Significance Thresholds
    _apply_thresholds(calculated_variances, payload.thresholds)

    print(f"Applied thresholds. Processed {len(calculated_variances)} items.")

    # Construct response
    response = VarianceAnalysisResponse(
        analysis_details=payload.dict(), # Echo request params
        variances=calculated_variances
    )

    return response


@router.post("/generate-narrative", response_model=NarrativeResponse)
async def generate_variance_narrative(request: NarrativeRequest):
    """
    Generates narrative explanations for significant financial variances using an LLM.
    Takes a list of significant variances (ideally filtered from the /calculate endpoint)
    and optional context to generate a cohesive narrative.
    """
    if not client:
        raise HTTPException(status_code=503, detail="OpenAI client not initialized. Check API key secret.") # Changed to 503
    if not request.variances:
        raise HTTPException(status_code=400, detail="No variances provided for narrative generation.")

    print(f"Received request to generate narrative for {len(request.variances)} significant variances.")

    # --- Prompt Construction (Refined based on MYA-116 components) ---
    variance_details = []
    for variance in request.variances:
        # TODO: Implement actual favourability logic based on account type/CoA structure.
        # This placeholder assumes variance_direction might be passed in, but needs real logic.
        # Example logic sketch:
        # account_type = get_account_type(variance.account_name) # Function needed
        # if account_type in ['Revenue', 'Equity', 'Liability']:
        #    favourable = variance.absolute_variance > 0
        # elif account_type in ['Expense', 'Asset']:
        #    favourable = variance.absolute_variance < 0
        # else:
        #    favourable = None # Or default
        # variance_direction_str = 'Favourable' if favourable else ('Unfavourable' if favourable is not None else 'N/A')

        favourability_hint = ""
        if variance.variance_direction:
            favourability_hint = f"(Input Direction: {variance.variance_direction})"
        else:
            # Add actual CoA-based logic here
            favourability_hint = "(Favourability N/A - Needs CoA Logic)"


        # Format variance details, handling potential None values gracefully
        comparison_value_str = f"{variance.comparison_value:.2f}" if variance.comparison_value is not None else 'N/A'
        absolute_variance_str = f"{variance.absolute_variance:.2f}" if variance.absolute_variance is not None else 'N/A'
        percentage_variance_str = f"{variance.percentage_variance:.2f}%" if variance.percentage_variance is not None else 'N/A'

        detail = (
            f"- Account: {variance.account_name}\n"
            f"  - Period: {variance.period}\n"
            f"  - Actual: {variance.actual_value:.2f}\n"
            f"  - Comparison Value: {comparison_value_str}\n"
            f"  - Variance Amount: {absolute_variance_str}\n"
            f"  - Variance Percentage: {percentage_variance_str}\n"
            f"  - Favourability Hint: {favourability_hint}"
        )
        variance_details.append(detail)

    system_prompt = """You are an expert financial analyst assistant. Your task is to provide concise, plausible explanations for significant financial variances based on the data provided.
Focus on potential business drivers or reasons for each variance. If possible, identify connections between different variances.
Consider the favourability hint provided for each variance (e.g., a positive variance for revenue is typically favourable, while a positive variance for expenses is typically unfavourable)."""

    user_prompt_lines = [
        "Please analyze the following significant financial variances and provide explanations:",
        "\n".join(variance_details)
    ]

    if request.context:
        user_prompt_lines.append(f"\nAdditional Business Context to consider: {request.context}")

    final_user_prompt = "\n".join(user_prompt_lines)

    print("\n--- Refined Prompt for LLM ---")
    print(f"System Prompt: {system_prompt}")
    print(f"User Prompt:\n{final_user_prompt}")
    print("------------------------------")

    # --- OpenAI API Call ---
    try:
        # Using gpt-4o-mini as default. Confirm model choice
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": final_user_prompt}
            ],
            # temperature=0.7, # Optional: Adjust creativity/focus
            # max_tokens=500, # Optional: Limit response length
        )

        generated_narrative = completion.choices[0].message.content
        if not generated_narrative:
             raise HTTPException(status_code=500, detail="LLM returned an empty narrative.")

        print("Successfully generated narrative from OpenAI.")
        # Return the structured response
        return NarrativeResponse(narrative=generated_narrative.strip())

    except Exception as e:
        error_message = f"Error calling OpenAI API: {str(e)}"
        print(error_message)
        # Provide a more informative error message if possible
        raise HTTPException(
            status_code=500, detail="Failed to generate narrative due to LLM API error."
        ) from e # Add 'from e' for better traceback
