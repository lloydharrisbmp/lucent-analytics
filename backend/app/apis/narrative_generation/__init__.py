"""
API for generating narratives and explanations using LLMs.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import date
import databutton as db
from openai import OpenAI

# Create an API router
router = APIRouter(
    prefix="/narrative-generation",
    tags=["Narrative Generation", "LLM"]
)

# --- Models ---
class NarrativeRequest(BaseModel):
    """Request model for generating a narrative for a specific variance."""
    account_name: str = Field(..., description="Name or code of the financial account/item.")
    account_type: Literal['Revenue', 'Expense', 'Asset', 'Liability', 'Equity', 'Unknown'] = Field(..., description="The classification of the account (e.g., Revenue, Expense).")
    period_end_date: date = Field(..., description="The end date of the primary period analyzed (e.g., YYYY-MM-DD).")
    comparison_type: Literal['budget', 'prior_period', 'prior_year'] = Field(..., description="What the actuals were compared against.")
    actual_value: float = Field(..., description="The value for the primary period.")
    comparison_value: Optional[float] = Field(None, description="The value for the comparison period.")
    absolute_variance: Optional[float] = Field(None, description="Actual - Comparison Value.")
    percentage_variance: Optional[float] = Field(None, description="(Actual - Comparison) / Comparison Value. Null if comparison is zero or NaN.")
    # is_significant is implied, as this endpoint is for significant variances

class NarrativeResponse(BaseModel):
    """Response model containing the generated narrative."""
    narrative: str = Field(..., description="The LLM-generated explanation for the variance.")


# --- Helper Functions ---

def _get_account_type(account_name: str) -> Literal['Revenue', 'Expense', 'Asset', 'Liability', 'Equity', 'Unknown']:
    """Placeholder function to determine account type based on name."""
    # TODO: Replace with actual chart of accounts lookup or more robust logic
    name_lower = account_name.lower()
    if 'revenue' in name_lower or 'sales' in name_lower:
        return 'Revenue'
    if 'cost of goods sold' in name_lower or 'cogs' in name_lower or 'expense' in name_lower:
        return 'Expense'
    if 'asset' in name_lower or 'cash' in name_lower or 'receivables' in name_lower:
        return 'Asset'
    if 'liability' in name_lower or 'payable' in name_lower or 'debt' in name_lower:
        return 'Liability'
    if 'equity' in name_lower or 'retained earnings' in name_lower:
        return 'Equity'
    return 'Unknown' # Default if no keywords match

def _format_narrative_prompt(data: NarrativeRequest) -> str:
    """Formats the prompt for the LLM based on MYA-116 design."""
    # Format numbers for better readability in the prompt if needed (optional)
    actual_formatted = f"{data.actual_value:,.2f}" if data.actual_value is not None else "N/A"
    comparison_formatted = f"{data.comparison_value:,.2f}" if data.comparison_value is not None else "N/A"
    abs_variance_formatted = f"{data.absolute_variance:,.2f}" if data.absolute_variance is not None else "N/A"
    pct_variance_formatted = f"{data.percentage_variance * 100:.2f}%" if data.percentage_variance is not None else "N/A"

    prompt = f"""System: You are a helpful financial analyst assistant. Your task is to provide brief, plausible explanations for significant financial variances presented to you. Focus on common business reasons and phrase explanations as possibilities, not certainties.

User:
We are analyzing the financial performance for the period ending {data.period_end_date}. A significant variance was found for the following account:

Account: {data.account_name}
Account Type: {data.account_type}
Period Actual: {actual_formatted}
Comparison ({data.comparison_type}): {comparison_formatted}
Absolute Variance: {abs_variance_formatted}
Percentage Variance: {pct_variance_formatted}

Significance: This variance exceeds the set threshold.

Guidance on Favourability:
- For Revenue/Equity/Liability accounts, higher actuals than comparison are generally favourable.
- For Expense/Asset accounts, lower actuals than comparison are generally favourable.

Instruction: Provide 1-2 concise, plausible reasons (1-2 sentences total) why this significant variance might have occurred.
"""
    return prompt


# --- Endpoints ---
@router.post("/generate-variance-narrative", response_model=NarrativeResponse)
async def generate_variance_narrative(payload: NarrativeRequest) -> NarrativeResponse:
    """
    Generates a narrative explanation for a given significant financial variance using an LLM.
    """
    print(f"Received narrative generation request for account: {payload.account_name}, period: {payload.period_end_date}")

    # Ensure Account Type is determined (even if placeholder)
    if payload.account_type == 'Unknown':
        # Optionally try placeholder lookup again if not provided in request?
        # For now, assume it's provided or handled upstream.
        print(f"Warning: Account type is 'Unknown' for {payload.account_name}. Narrative quality may be affected.")

    # Format the prompt using the helper function
    prompt_content = _format_narrative_prompt(payload)
    print("Formatted Prompt:")
    print(prompt_content) # Log the prompt for debugging

    # Initialize OpenAI client
    try:
        api_key = db.secrets.get("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OpenAI API key is not configured in secrets.")
        client = OpenAI(api_key=api_key)
    except Exception as e:
        print(f"Error initializing OpenAI client: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="LLM service is not configured or unavailable."
        )

    # Split the formatted prompt into system and user parts
    # Simple split based on the known structure from _format_narrative_prompt
    try:
        parts = prompt_content.split("\n\nUser:\n", 1)
        system_content = parts[0].replace("System: ", "", 1)
        user_content = parts[1]
    except IndexError:
        print("Error: Could not split prompt into system and user parts.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal error formatting request for LLM service."
        )

    # Call OpenAI API
    try:
        print("Calling OpenAI API...")
        completion = client.chat.completions.create(
            model="gpt-4o-mini", # Use the specified model
            messages=[
                {"role": "system", "content": system_content},
                {"role": "user", "content": user_content}
            ],
            temperature=0.5, # A balance between creativity and predictability
            max_tokens=100 # Limit response length to keep it concise
        )
        generated_text = completion.choices[0].message.content.strip()
        if not generated_text:
             generated_text = "LLM returned an empty response." # Handle empty response
        print("OpenAI call successful.")
    except Exception as e:
        print(f"Error calling OpenAI API: {e}")
        # Reraise with 'from e' to preserve original traceback
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate narrative from LLM service: {e}"
        ) from e
    
    print(f"Generated Narrative: {generated_text}")

    return NarrativeResponse(narrative=generated_text)


