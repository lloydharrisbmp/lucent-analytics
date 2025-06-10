
import databutton as db
import pandas as pd
from app.auth import AuthorizedUser
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import date
import re

from app.apis.report_definitions import ReportDefinition, get_report_definition

# Placeholder - Replace with actual import or definition from report_definitions API
# class ReportDefinition(BaseModel):
#     id: str
#     ownerId: str
#     name: str
#     dataSource: Dict[str, Any] = Field(..., description="Specifies the primary data source and scope. Expects keys like 'importId', 'organizationId', 'businessEntityId', 'dataType'.")
#     filters: Dict[str, Any]
#     rows: List[Dict[str, Any]]
#     columns: List[Dict[str, Any]]
#     # ... other fields like description, createdAt, updatedAt


class GenerateReportRequest(BaseModel):
    report_definition_id: str = Field(..., description="ID of the report definition to use.")
    # We might need organization_id and period here too, depending on how dataSource is structured
    # organization_id: str = Field(..., description="ID of the organization for context.")
    # business_entity_id: str = Field(..., description="ID of the specific business entity.")
    # report_period: date = Field(..., description="The specific period (e.g., month-end) the report is for.")


# Define a structure for the generated report data
class ReportRow(BaseModel):
    row_header: str # Or some identifier for the row
    values: Dict[str, Any] # Column Header -> Value


class ReportDataResponse(BaseModel):
    report_name: str
    report_id: str
    data: List[ReportRow] # Simple list of rows for now
    # Could enhance with column definitions, etc. later


router = APIRouter(prefix="/report-engine", tags=["Report Engine"])


def sanitize_storage_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    key = key.replace('..', '') # Avoid directory traversal
    key = re.sub(r'[^a-zA-Z0-9._-]', '_', key) # Replace disallowed chars with underscore
    return key

# Placeholder for fetching report definition logic - Ideally reuse from report_definitions API
async def get_report_definition_logic(report_id: str, user: AuthorizedUser) -> ReportDefinition:
    """Placeholder function to fetch report definition."""
    # This should ideally call or replicate the logic from the report_definitions API's
    # get_report_definition endpoint to fetch the JSON from db.storage.json
    # using the key pattern: f"report_definitions-{user.sub}-{report_id}.json"
    storage_key = sanitize_storage_key(f"report_definitions-{user.sub}-{report_id}.json")
    try:
        report_data = db.storage.json.get(storage_key)
        # Basic validation
        if not isinstance(report_data, dict) or 'id' not in report_data:
             raise FileNotFoundError("Invalid report data format.")
        # Ensure ownership matches (important!)
        if report_data.get("ownerId") != user.sub:
             raise HTTPException(status_code=403, detail="Access forbidden: Report definition belongs to another user.")
        
        # Parse into the Pydantic model (using the actual model when available)
        definition = ReportDefinition(**report_data)
        return definition
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Report definition '{report_id}' not found.") from None
    except Exception as e:
        print(f"Error fetching report definition {report_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Could not retrieve report definition: {e}") from e


@router.post("/generate-report", response_model=ReportDataResponse)
async def generate_report(
    request: GenerateReportRequest,
    user: AuthorizedUser,
):
    """
    Generates a basic report based on a definition ID.
    Fetches the definition, retrieves the corresponding processed financial data (JSON),
    and structures it according to the definition's rows/columns (basic implementation).
    """
    print(f"Generating report for definition ID: {request.report_definition_id}")

    # 1. Fetch Report Definition
    try:
        definition = get_report_definition(report_id=request.report_definition_id, user=user)
        print(f"Fetched definition: {definition.name}")
    except HTTPException as e:
        raise e  # Re-raise HTTP exceptions from fetching
    except Exception as e:
        print(f"Unexpected error fetching definition: {e}")
        raise HTTPException(status_code=500, detail="Error fetching report definition.") from e

    # 2. Determine Data Source and Fetch Financial Data JSON
    try:
        data_source_info = definition.dataSource
        # ---- Assumptions about dataSource structure ----
        # Explicitly check for assumed keys
        required_ds_keys = ["importId", "organizationId", "businessEntityId", "dataType"]
        if not all(key in data_source_info for key in required_ds_keys):
             missing_keys = [key for key in required_ds_keys if key not in data_source_info]
             raise ValueError(f"Incomplete dataSource information in report definition. Missing required keys: {', '.join(missing_keys)}")

        org_id = data_source_info["organizationId"]
        entity_id = data_source_info["businessEntityId"]
        data_type = data_source_info["dataType"]
        import_id = data_source_info["importId"] # Crucial piece

        # Construct the storage key for the processed data JSON
        financial_data_key = sanitize_storage_key(f"{org_id}_{entity_id}_{data_type}_{import_id}.json")
        print(f"Attempting to fetch financial data from key: {financial_data_key}")

        # Fetch the JSON object
        processed_data_json = db.storage.json.get(financial_data_key)
        
        # Extract the actual data list
        financial_data_list = processed_data_json.get("data")
        if financial_data_list is None or not isinstance(financial_data_list, list):
             raise ValueError(f"Financial data JSON ('{financial_data_key}') is missing the 'data' list or it's not a list.")
        
        print(f"Successfully fetched {len(financial_data_list)} financial data records.")
        
        # OPTIONAL: Convert to DataFrame for easier manipulation, though maybe overkill for simple mapping
        # financial_df = pd.DataFrame(financial_data_list)

    except FileNotFoundError:
        print(f"Error: Processed financial data not found at key: {financial_data_key}")
        raise HTTPException(status_code=404, detail=f"Required financial data (import: {import_id}) not found.") from None
    except ValueError as e:
        print(f"Error processing data source or fetched data: {e}")
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        print(f"Unexpected error fetching/processing financial data: {e}")
        raise HTTPException(status_code=500, detail="Error retrieving or processing financial data.") from e

    # 3. Fetch Budget Data (if applicable)
    budget_lookup = {}
    if definition.budget_version_id:
        print(f"Budget version ID found: {definition.budget_version_id}. Fetching budget data...")
        try:
            # Assume budget data stored similarly to how versions were listed/fetched in budgets API (MYA-101/102)
            # Key: budgets-{owner_id}-{budget_version_id}.json
            # Content: {"id": ..., "name": ..., "data": [{"account_code": ..., "budget_amount": ...}, ...]}
            budget_storage_key = sanitize_storage_key(f"budgets-{user.sub}-{definition.budget_version_id}.json")
            budget_version_data = db.storage.json.get(budget_storage_key)
            
            budget_data_list = budget_version_data.get("data")
            if budget_data_list is None or not isinstance(budget_data_list, list):
                print(f"Warning: Budget data for version {definition.budget_version_id} is missing 'data' list or invalid format. Budget columns may be empty.")
            else:
                 # Create lookup dictionary, assuming 'account_code' and 'budget_amount' fields
                budget_lookup = {
                    item.get('account_code'): item.get('budget_amount') 
                    for item in budget_data_list 
                    if 'account_code' in item and 'budget_amount' in item
                }
                print(f"Successfully processed {len(budget_lookup)} budget records.")
                
        except FileNotFoundError:
             print(f"Warning: Budget version data not found for ID: {definition.budget_version_id}. Budget columns may be empty.")
             # Continue without budget data
        except Exception as e:
             print(f"Warning: Error fetching or processing budget data for ID {definition.budget_version_id}: {e}. Budget columns may be empty.")
             # Continue without budget data


    # 4. Process Data & Structure Report Output
    report_output_data: List[ReportRow] = []

    # Convert actual financial data list to dict keyed by account_code for easier lookup
    data_lookup = {item.get('account_code'): item for item in financial_data_list if 'account_code' in item}

    for row_def in definition.rows:
        # --- Assumptions about row definition ---
        # Types: 'account', 'header', 'calculation' (calculation ignored for now)
        # 'account' type expected keys: 'accountCode', 'label'
        # 'header' type expected keys: 'label'

        row_type = row_def.get("type")
        row_label = row_def.get("label", "Unnamed Row")
        
        output_row = ReportRow(row_header=row_label, values={})

        account_code = row_def.get("accountCode") if row_type == "account" else None
        account_data = data_lookup.get(account_code) if account_code else None
        budget_value = budget_lookup.get(account_code) if account_code and budget_lookup else None
        
        for col_def in definition.columns:
            # --- Assumptions about column definition ---
            # Types: 'value', 'budget_value', 'variance'
            # 'value' expected keys: 'field' (e.g., 'balance'), 'label'
            # 'budget_value' expected keys: 'label'
            # 'variance' expected keys: 'field' (for actual value), 'label'
            
            col_type = col_def.get("type")
            col_label = col_def.get("label", "Unnamed Column")

            if row_type == "account":
                if col_type == "value":
                    field_name = col_def.get("field") # e.g., 'balance', 'debit', 'credit'
                    output_row.values[col_label] = account_data.get(field_name) if account_data and field_name else None
                
                elif col_type == "budget_value":
                    output_row.values[col_label] = budget_value # Already retrieved
                
                elif col_type == "variance":
                    field_name = col_def.get("field") # Actual value field
                    actual_value = account_data.get(field_name) if account_data and field_name else None
                    
                    # Calculate variance only if both actual and budget are numeric
                    variance = None
                    try:
                        # Attempt conversion to float, handle None/non-numeric gracefully
                        num_actual = float(actual_value) if actual_value is not None else None
                        num_budget = float(budget_value) if budget_value is not None else None

                        if num_actual is not None and num_budget is not None:
                           variance = num_actual - num_budget
                        # else: leave variance as None if either value is missing/non-numeric
                           
                    except (ValueError, TypeError):
                        print(f"Could not calculate variance for account {account_code}, column '{col_label}'. Actual: {actual_value}, Budget: {budget_value}")
                        variance = None # Ensure variance is None if conversion fails
                        
                    output_row.values[col_label] = variance
                
                else:
                    # Unknown column type for an account row
                    output_row.values[col_label] = None
            
            elif row_type == "header":
                 # For header rows, output empty string for all columns
                 output_row.values[col_label] = ""
            
            else: 
                 # For other row types (like calculation, if added later) or unexpected types
                 output_row.values[col_label] = None
                 
        report_output_data.append(output_row)

    # 4. Return Structure
    return ReportDataResponse(
        report_name=definition.name,
        report_id=definition.id,
        data=report_output_data
    )

