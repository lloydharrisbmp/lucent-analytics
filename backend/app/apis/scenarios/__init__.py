
import databutton as db
from fastapi import APIRouter, HTTPException, Depends, status, Request # Added Request
from pydantic import BaseModel, Field, field_validator
from typing import List, Dict, Any, Optional, Literal
from datetime import datetime, timezone
import pandas as pd # Ensure pandas is imported for pd.to_datetime
import uuid
import re
import pandas as pd # Added pandas import

from app.auth import AuthorizedUser
from app.apis.utils import log_audit_event # Import the audit logger

router = APIRouter(prefix="/scenarios", tags=["Scenarios"])

# --- Constants ---
STORAGE_KEY_PREFIX = "scenario_meta-"
MAX_KEY_LEN = 255 # Max length for storage keys

# --- Helper Functions ---
def sanitize_storage_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    # Replace potentially harmful sequences first
    key = key.replace('..', '_') # Avoid directory traversal attempts
    key = key.replace('/', '_') # Replace slashes
    # Remove any characters not in the allowed set
    key = re.sub(r'[^a-zA-Z0-9._-]', '_', key)
    # Ensure the key isn't excessively long
    if len(key) > MAX_KEY_LEN:
        # Simple truncation, might need smarter handling depending on collision risk
        key = key[:MAX_KEY_LEN]
    return key

def create_scenario_storage_key(user_id: str, scenario_id: str) -> str:
    """Generates a sanitized storage key for scenario metadata."""
    # Ensure components are also sanitized individually if they come from unsafe sources
    safe_user_id = sanitize_storage_key(user_id)
    safe_scenario_id = sanitize_storage_key(scenario_id)
    return sanitize_storage_key(f"{STORAGE_KEY_PREFIX}{safe_user_id}-{safe_scenario_id}.json")

# --- Pydantic Models for Scenario Management ---

class ScenarioApplyRequest(BaseModel):
    """Request model for applying a scenario to a base forecast."""
    baseForecastId: str = Field(..., description="The ID of the base forecast/budget data (e.g., import_id)")

class ScenarioApplyResponse(BaseModel):
    """Response model after applying a scenario.
    Returns the calculated forecast data as a dictionary suitable for JSON.
    Format is compatible with pandas DataFrame.to_dict(orient='split') after reset_index().
    """
    scenarioId: str
    calculatedForecastData: Dict[str, Any] = Field(..., description="Calculated forecast data, typically {'columns': [...], 'data': [[...], ...]}")


class ScenarioAssumption(BaseModel):
    """Represents a single assumption or change within a scenario."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique identifier for the assumption within the scenario")
    type: Literal["percentage", "absolute", "driver_change"] = Field(..., description="Type of change")
    targetMetric: str = Field(..., description="The metric or account the assumption applies to (e.g., 'Revenue', 'COGS', 'Marketing Spend')")
    value: float = Field(..., description="The numerical value of the change")
    scope: Optional[str] = Field(None, description="Optional scope (e.g., specific product line, region) - currently informational")
    startDate: Optional[datetime] = Field(None, description="When the assumption starts taking effect (inclusive)")
    endDate: Optional[datetime] = Field(None, description="When the assumption stops taking effect (inclusive)")
    description: Optional[str] = Field(None, max_length=200, description="Brief description of the assumption")
    # Add more fields as needed, e.g., relatedDriverId if type is driver_change

class ScenarioMetadataBase(BaseModel):
    """Base model containing user-editable scenario metadata."""
    name: str = Field(..., max_length=100, description="User-defined name for the scenario")
    description: Optional[str] = Field(None, max_length=500, description="Optional longer description")
    baseForecastId: Optional[str] = Field(None, description="ID of the base forecast/budget this scenario is derived from")
    parentScenarioId: Optional[str] = Field(None, description="ID of the parent scenario if this is a linked/child scenario")
    assumptions: List[ScenarioAssumption] = Field(default_factory=list, description="List of assumptions defining the scenario")

    @field_validator('name')
    @classmethod
    def name_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Scenario name must not be empty')
        return v.strip() # Return stripped name

class ScenarioMetadata(ScenarioMetadataBase):
    """Full scenario metadata model including system-generated fields."""
    scenarioId: str = Field(..., description="Unique identifier for the scenario")
    ownerId: str = Field(..., description="ID of the user who owns this scenario")
    createdAt: datetime
    updatedAt: datetime

# Model for creating a scenario (ownerId, timestamps, scenarioId added by backend)
class ScenarioCreate(ScenarioMetadataBase):
    pass

# Model for updating a scenario (only mutable fields)
class ScenarioUpdate(BaseModel):
    """Model for updating specific fields of a scenario."""
    name: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    baseForecastId: Optional[str] = None # Allow changing the base
    parentScenarioId: Optional[str] = None # Allow changing the parent
    assumptions: Optional[List[ScenarioAssumption]] = None # Allow replacing all assumptions

    @field_validator('name')
    @classmethod
    def name_must_not_be_empty_if_provided(cls, v):
        if v is not None:
            if not v.strip():
                 raise ValueError('Scenario name must not be empty')
            return v.strip() # Return stripped name if provided
        return v

# Model for list response (summary)
class ScenarioSummary(BaseModel):
    """Summary model for listing scenarios."""
    scenarioId: str
    name: str
    description: Optional[str]
    baseForecastId: Optional[str]
    parentScenarioId: Optional[str]
    assumptionCount: int = Field(..., description="Number of assumptions in the scenario")
    createdAt: datetime
    updatedAt: datetime

# --- API Endpoints ---

@router.post("/", response_model=ScenarioMetadata)
async def create_scenario(
    payload: ScenarioCreate,
    user: AuthorizedUser,
    request: Request # Add Request dependency
):
    """Creates a new forecast/budget scenario for the authenticated user."""
    print(f"Received request to create scenario: {payload.name} for user {user.sub}")
    scenario_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)

    # Ensure assumptions have unique IDs if provided, generate if not
    seen_assumption_ids = set()
    for assumption in payload.assumptions:
        # Ensure assumption has an ID, generate if missing or empty string
        if not getattr(assumption, 'id', None):
             assumption.id = str(uuid.uuid4())
        elif assumption.id in seen_assumption_ids:
             # If duplicate IDs are somehow provided, generate a new one
             print(f"Warning: Duplicate assumption ID '{assumption.id}' detected in payload. Regenerating.")
             assumption.id = str(uuid.uuid4())
        seen_assumption_ids.add(assumption.id)

    scenario_data = ScenarioMetadata(
        **payload.model_dump(),
        scenarioId=scenario_id,
        ownerId=user.sub, # Use user.sub from AuthorizedUser
        createdAt=now,
        updatedAt=now
    )

    storage_key = create_scenario_storage_key(user_id=user.sub, scenario_id=scenario_id)
    log_details = {
        "scenario_name": payload.name,
        "base_forecast_id": payload.baseForecastId,
        "parent_scenario_id": payload.parentScenarioId,
        "assumption_count": len(payload.assumptions),
    }

    try:
        # Convert datetime objects to ISO strings for JSON serialization
        scenario_dict_for_storage = scenario_data.dict(exclude_none=True)
        scenario_dict_for_storage['createdAt'] = scenario_data.createdAt.isoformat()
        scenario_dict_for_storage['updatedAt'] = scenario_data.updatedAt.isoformat()
        # Convert assumption dates if they exist
        if 'assumptions' in scenario_dict_for_storage and scenario_dict_for_storage['assumptions']:
            for assumption in scenario_dict_for_storage['assumptions']:
                if assumption.get('startDate'):
                    # Safely convert to datetime before isoformat
                    start_dt = pd.to_datetime(assumption['startDate'], errors='coerce')
                    assumption['startDate'] = start_dt.isoformat() if pd.notna(start_dt) else None
                if assumption.get('endDate'):
                    end_dt = pd.to_datetime(assumption['endDate'], errors='coerce')
                    assumption['endDate'] = end_dt.isoformat() if pd.notna(end_dt) else None


        db.storage.json.put(storage_key, scenario_dict_for_storage)
        print(f"Successfully created scenario {scenario_id} for user {user.sub} at {storage_key}")

        # Log successful audit event
        log_audit_event(
            user_identifier=user.sub,
            action_type="SCENARIO_CREATE",
            status="SUCCESS",
            request=request,
            target_object_type="SCENARIO",
            target_object_id=scenario_id,
            details=log_details
        )
        return scenario_data
    except Exception as e:
        error_message = f"Failed to save scenario: {e}"
        print(f"Error saving scenario {scenario_id} for user {user.sub}: {e}")

        # Log failed audit event
        log_details["error"] = str(e) # Add error to details
        log_audit_event(
            user_identifier=user.sub,
            action_type="SCENARIO_CREATE",
            status="FAILURE",
            request=request,
            target_object_type="SCENARIO",
            target_object_id=scenario_id, # ID was generated even if save failed
            details=log_details
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error_message
        ) from e

@router.get("/", response_model=List[ScenarioSummary])
async def list_scenarios(
    user: AuthorizedUser
):
    """Lists all scenarios owned by the authenticated user."""
    print(f"Received request to list scenarios for user {user.sub}")
    scenario_summaries = []
    # Define the prefix specific to the user's scenarios
    user_scenario_prefix = sanitize_storage_key(f"{STORAGE_KEY_PREFIX}{user.sub}-")

    try:
        # List files matching the user-specific prefix
        scenario_files = db.storage.json.list()
        print(f"Found {len(scenario_files)} total json files. Filtering for prefix '{user_scenario_prefix}'")

        for file_info in scenario_files:
            # Ensure the file name starts with the correct prefix and structure
            if file_info.name.startswith(user_scenario_prefix) and file_info.name.endswith('.json'):
                try:
                    # Attempt to load the JSON data for each matching file
                    scenario_data = db.storage.json.get(file_info.name)
                    # Validate the loaded data against the full metadata model
                    metadata = ScenarioMetadata(**scenario_data)
                    # Create a summary object
                    summary = ScenarioSummary(
                        scenarioId=metadata.scenarioId,
                        name=metadata.name,
                        description=metadata.description,
                        baseForecastId=metadata.baseForecastId,
                        parentScenarioId=metadata.parentScenarioId,
                        assumptionCount=len(metadata.assumptions),
                        createdAt=metadata.createdAt,
                        updatedAt=metadata.updatedAt
                    )
                    scenario_summaries.append(summary)
                except FileNotFoundError:
                    # Should not happen if list() is accurate, but handle defensively
                    print(f"Warning: File listed but not found: {file_info.name}")
                except Exception as e:
                    # Log if a file matching the pattern fails parsing or validation
                    print(f"Error processing scenario file {file_info.name}: {e}")
                    # Optionally skip this file or raise a partial error

        print(f"Returning {len(scenario_summaries)} scenarios for user {user.sub}")
        # Sort by updatedAt descending (most recent first)
        scenario_summaries.sort(key=lambda s: s.updatedAt, reverse=True)
        return scenario_summaries

    except Exception as e:
        print(f"Error listing scenarios for user {user.sub}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list scenarios: {e}"
        ) from e

@router.get("/{scenario_id}", response_model=ScenarioMetadata)
async def get_scenario(
    scenario_id: str,
    user: AuthorizedUser
):
    """Retrieves a specific scenario by ID, ensuring ownership."""
    print(f"Received request to get scenario {scenario_id} for user {user.sub}")
    storage_key = create_scenario_storage_key(user_id=user.sub, scenario_id=scenario_id)

    try:
        scenario_data = db.storage.json.get(storage_key)
        # Validate data and ownership (redundant check, as key includes user_id, but good practice)
        metadata = ScenarioMetadata(**scenario_data)
        if metadata.ownerId != user.sub:
            # This should ideally never happen if key generation is correct
            print(f"Auth Error: User {user.sub} tried to access scenario {scenario_id} owned by {metadata.ownerId}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User does not have permission to access this scenario"
            )

        print(f"Successfully retrieved scenario {scenario_id} for user {user.sub}")
        return metadata
    except FileNotFoundError:
        print(f"Error: Scenario {scenario_id} not found for user {user.sub} at key {storage_key}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scenario with ID '{scenario_id}' not found"
        ) from None
    except Exception as e:
        print(f"Error retrieving scenario {scenario_id} for user {user.sub}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve scenario: {e}"
        ) from e

@router.put("/{scenario_id}", response_model=ScenarioMetadata)
async def update_scenario(
    scenario_id: str,
    payload: ScenarioUpdate,
    user: AuthorizedUser,
    request: Request # Add Request dependency
):
    """Updates an existing scenario, ensuring ownership."""
    print(f"Received request to update scenario {scenario_id} for user {user.sub}")
    storage_key = create_scenario_storage_key(user_id=user.sub, scenario_id=scenario_id)

    try:
        # 1. Retrieve existing scenario data (also verifies ownership indirectly)
        existing_data = db.storage.json.get(storage_key)
        existing_scenario = ScenarioMetadata(**existing_data)

        # Double check ownership explicitly
        if existing_scenario.ownerId != user.sub:
            print(f"Auth Error on Update: User {user.sub} tried to update scenario {scenario_id} owned by {existing_scenario.ownerId}")
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")

        # 2. Apply updates from payload
        update_data = payload.dict(exclude_unset=True) # Get only fields that were actually provided
        updated_scenario_data = existing_scenario.copy(update=update_data)

        # 3. Handle assumption ID uniqueness if assumptions are updated
        if 'assumptions' in update_data and updated_scenario_data.assumptions is not None:
            seen_assumption_ids = set()
            for assumption in updated_scenario_data.assumptions:
                # Ensure assumption has an ID, generate if missing or empty string
                if not getattr(assumption, 'id', None):
                     assumption.id = str(uuid.uuid4())
                     print(f"Generated new ID {assumption.id} for assumption in scenario {scenario_id}")
                elif assumption.id in seen_assumption_ids:
                    new_id = str(uuid.uuid4())
                    print(f"Warning: Duplicate assumption ID '{assumption.id}' detected during update for scenario {scenario_id}. Regenerating to {new_id}.")
                    assumption.id = new_id
                seen_assumption_ids.add(assumption.id)


        updated_scenario_data.updatedAt = datetime.now(timezone.utc)

        # Prepare details for logging before potential errors in serialization
        update_log_details = {
            "updated_fields": list(update_data.keys()), # Log which fields were included in the update request
            # Consider adding more details if needed, e.g., assumption count change
        }

        # 5. Save back to storage
        # Convert datetime objects to ISO strings for JSON serialization
        updated_scenario_dict_for_storage = updated_scenario_data.dict(exclude_none=True)
        # Ensure createdAt is included even if not updated
        updated_scenario_dict_for_storage['createdAt'] = updated_scenario_data.createdAt.isoformat()
        updated_scenario_dict_for_storage['updatedAt'] = updated_scenario_data.updatedAt.isoformat()
        # Convert assumption dates if they exist
        if 'assumptions' in updated_scenario_dict_for_storage and updated_scenario_dict_for_storage['assumptions']:
            for assumption in updated_scenario_dict_for_storage['assumptions']:
                if assumption.get('startDate'):
                     # Handle potential NaT or already stringified dates during updates
                     start_dt = pd.to_datetime(assumption['startDate'], errors='coerce')
                     assumption['startDate'] = start_dt.isoformat() if pd.notna(start_dt) else None
                if assumption.get('endDate'):
                    end_dt = pd.to_datetime(assumption['endDate'], errors='coerce')
                    assumption['endDate'] = end_dt.isoformat() if pd.notna(end_dt) else None

        db.storage.json.put(storage_key, updated_scenario_dict_for_storage)
        print(f"Successfully updated scenario {scenario_id} for user {user.sub}")

        # Log successful audit event
        log_audit_event(
            user_identifier=user.sub,
            action_type="SCENARIO_UPDATE",
            status="SUCCESS",
            request=request,
            target_object_type="SCENARIO",
            target_object_id=scenario_id,
            details=update_log_details
        )

        return updated_scenario_data

    except FileNotFoundError:
        error_message = f"Scenario with ID '{scenario_id}' not found"
        print(f"Update Error: Scenario {scenario_id} not found for user {user.sub} at key {storage_key}")
        # Log failed audit event (Not Found)
        log_audit_event(
            user_identifier=user.sub,
            action_type="SCENARIO_UPDATE",
            status="FAILURE",
            request=request,
            target_object_type="SCENARIO",
            target_object_id=scenario_id,
            details={"error": "Scenario not found", "requested_fields": list(payload.dict(exclude_unset=True).keys())}
        )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=error_message
        ) from None
    except HTTPException as http_exc: # Handle specific permission errors
        # Log failed audit event (Permission Denied - likely from the ownership check)
        if http_exc.status_code == status.HTTP_403_FORBIDDEN:
            log_audit_event(
                user_identifier=user.sub,
                action_type="SCENARIO_UPDATE",
                status="FAILURE",
                request=request,
                target_object_type="SCENARIO",
                target_object_id=scenario_id,
                details={"error": "Permission denied", "requested_fields": list(payload.dict(exclude_unset=True).keys())}
            )
        raise http_exc # Re-raise the original exception
    except Exception as e:
        error_message = f"Failed to update scenario: {e}"
        print(f"Error updating scenario {scenario_id} for user {user.sub}: {e}")
        # Log failed audit event (Internal Server Error)
        log_audit_event(
            user_identifier=user.sub,
            action_type="SCENARIO_UPDATE",
            status="FAILURE",
            request=request,
            target_object_type="SCENARIO",
            target_object_id=scenario_id,
            details={"error": str(e), "requested_fields": list(payload.dict(exclude_unset=True).keys())}
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error_message
        ) from e

@router.delete("/{scenario_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_scenario(
    scenario_id: str,
    user: AuthorizedUser,
    request: Request # Add Request dependency
):
    """Deletes a scenario, ensuring ownership."""
    print(f"Received request to delete scenario {scenario_id} for user {user.sub}")
    storage_key = create_scenario_storage_key(user_id=user.sub, scenario_id=scenario_id)

    try:
        # Optional check if file exists first to return 404 explicitly
        try:
            db.storage.json.get(storage_key) # Check if it exists before delete
        except FileNotFoundError:
             print(f"Delete Error: Scenario {scenario_id} not found for user {user.sub}.")
             raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Scenario '{scenario_id}' not found") from None

        db.storage.json.delete(storage_key)
        print(f"Successfully deleted scenario {scenario_id} for user {user.sub}")

        # Log successful audit event
        log_audit_event(
            user_identifier=user.sub,
            action_type="SCENARIO_DELETE",
            status="SUCCESS",
            request=request,
            target_object_type="SCENARIO",
            target_object_id=scenario_id,
            details=None # No extra details needed for simple delete
        )

        # Return None for 204 response
        return None

    except HTTPException as http_exc: # Re-raise specific 404 or other HTTP exceptions
        # Log failed audit event (e.g., Not Found)
        if http_exc.status_code == status.HTTP_404_NOT_FOUND:
            error_message = f"Scenario '{scenario_id}' not found"
            log_audit_event(
                user_identifier=user.sub,
                action_type="SCENARIO_DELETE",
                status="FAILURE",
                request=request,
                target_object_type="SCENARIO",
                target_object_id=scenario_id,
                details={"error": error_message}
            )
        else: # Log other HTTP errors generically
            log_audit_event(
                    user_identifier=user.sub,
                    action_type="SCENARIO_DELETE",
                    status="FAILURE",
                    request=request,
                    target_object_type="SCENARIO",
                    target_object_id=scenario_id,
                    details={"error": f"HTTP Error: {http_exc.status_code} - {http_exc.detail}"}
                )
        raise http_exc
    except Exception as e:
        # Catch any unexpected errors during the delete operation
        error_message = f"Failed to delete scenario: {e}"
        print(f"Error deleting scenario {scenario_id} for user {user.sub}: {e}")
        # Log failed audit event (Internal Server Error)
        log_audit_event(
            user_identifier=user.sub,
            action_type="SCENARIO_DELETE",
            status="FAILURE",
            request=request,
            target_object_type="SCENARIO",
            target_object_id=scenario_id,
            details={"error": str(e)}
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error_message
        ) from e

# --- Scenario Calculation Endpoint ---
@router.post("/apply/{scenario_id}", response_model=ScenarioApplyResponse)
async def apply_scenario(
    scenario_id: str,
    request: ScenarioApplyRequest,
    user: AuthorizedUser
):
    """Applies a saved scenario's assumptions to a specified base forecast."""
    print(f"Received request to apply scenario {scenario_id} to base forecast {request.baseForecastId} for user {user.sub}")

    # --- 1. Load Scenario Definition ---
    scenario_storage_key = create_scenario_storage_key(user_id=user.sub, scenario_id=scenario_id)
    try:
        scenario_dict = db.storage.json.get(scenario_storage_key)
        scenario = ScenarioMetadata(**scenario_dict)
        if scenario.ownerId != user.sub: # Double-check ownership
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied for scenario")
    except FileNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Scenario '{scenario_id}' not found") from None
    except Exception as e:
        print(f"Error loading scenario {scenario_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to load scenario definition") from e

    # --- 2. Load Base Forecast Data ---
    # Assuming baseForecastId corresponds to an import_id from financial_import
    base_forecast_storage_key = sanitize_storage_key(request.baseForecastId)
    try:
        # TODO: Confirm the actual storage key pattern if different from import_id
        base_forecast_df = db.storage.dataframes.get(base_forecast_storage_key)
        if base_forecast_df is None or base_forecast_df.empty:
            raise FileNotFoundError # Treat empty DataFrame as not found for consistency
        print(f"Successfully loaded base forecast {request.baseForecastId} with shape {base_forecast_df.shape}")
        # Basic validation: Check if it looks like a DataFrame
        if not isinstance(base_forecast_df, pd.DataFrame):
             print(f"Error: Loaded data for {request.baseForecastId} is not a Pandas DataFrame.")
             raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Invalid base forecast data format.")

    except FileNotFoundError:
        print(f"Error: Base forecast data '{request.baseForecastId}' not found at key '{base_forecast_storage_key}'")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Base forecast data '{request.baseForecastId}' not found") from None
    except Exception as e:
        print(f"Error loading base forecast {request.baseForecastId}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to load base forecast data") from e

    # --- 3. Apply Assumptions ---
    try:
        # Create a copy to avoid modifying the original base forecast in memory/storage
        calculated_df = base_forecast_df.copy()

        # Store original dtypes and columns/index for later restoration
        original_columns = calculated_df.columns.tolist()
        original_index = calculated_df.index.tolist()
        original_index_name = calculated_df.index.name
        original_column_dtype = calculated_df.columns.dtype
        original_index_dtype = calculated_df.index.dtype


        # --- Data Preprocessing ---
        # Attempt to parse columns as datetime objects for comparison
        date_columns_parsed = False
        parsed_columns_obj = None # Will hold PeriodIndex or DatetimeIndex

        try:
            # Try converting to period first (e.g., YYYY-MM), then datetime if that fails
            temp_parsed = None
            try:
                # Attempt monthly period parsing
                temp_parsed = pd.to_datetime(calculated_df.columns, errors='coerce').to_period(freq='M')
                if temp_parsed.isna().all(): # Check if period parsing failed for all
                    temp_parsed = None # Reset if all failed
            except (ValueError, TypeError): # Handle cases where columns aren't date-like or to_period fails
                 temp_parsed = None

            if temp_parsed is None: # If period parsing failed or wasn't applicable, try datetime
                temp_parsed = pd.to_datetime(calculated_df.columns, errors='coerce')

            # Check if parsing was successful for at least some columns
            if temp_parsed is not None and not pd.isna(temp_parsed).all():
                calculated_df.columns = temp_parsed
                parsed_columns_obj = calculated_df.columns # Store the parsed objects
                date_columns_parsed = True
                print(f"Successfully parsed DataFrame columns as date/period objects (type: {type(parsed_columns_obj).__name__}).")
            else:
                 print("Could not parse DataFrame columns as dates/periods. Proceeding without date filtering based on column values.")
                 # Keep original columns - calculation will apply to all columns if no date range logic hits

        except Exception as date_parse_error:
            print(f"Warning: Error attempting to parse DataFrame columns as dates/periods: {date_parse_error}. Proceeding without date filtering based on column values.")
            # Keep original columns


        # Standardize index if it contains the metrics (e.g., trim whitespace)
        if isinstance(calculated_df.index, pd.Index) and calculated_df.index.dtype == 'object':
            calculated_df.index = calculated_df.index.str.strip()
            print("Stripped whitespace from index labels for matching.")


        # Ensure the index is suitable for .loc access
        if calculated_df.index.name is None:
             print("Warning: DataFrame index is unnamed. Assuming index contains target metrics.")
             # Assign a temporary name if needed for certain pandas operations, but .loc should work

        # --- Assumption Loop ---
        print(f"Applying {len(scenario.assumptions)} assumptions to the forecast...")

        for i, assumption in enumerate(scenario.assumptions):
            # Standardize target metric for lookup (e.g., strip whitespace)
            clean_target_metric = assumption.targetMetric.strip()

            print(f"  [{i+1}/{len(scenario.assumptions)}] Processing assumption: ID {assumption.id}, Type {assumption.type}, Metric '{clean_target_metric}', Value {assumption.value}")

            # Check if cleaned target metric exists in the DataFrame index
            if clean_target_metric not in calculated_df.index:
                print(f"    - Warning: Target metric '{clean_target_metric}' (original: '{assumption.targetMetric}') not found in base forecast index. Skipping assumption.")
                continue

            # --- Determine Date Range Mask ---
            target_cols_mask = pd.Series(True, index=calculated_df.columns) # Default to all columns

            if date_columns_parsed: # Only filter by date if columns were parsed successfully
                start_date = None
                end_date = None
                try:
                    # Convert assumption dates to match the parsed column type (Period or Timestamp)
                    col_type = type(parsed_columns_obj[0]) # Get type from the first valid parsed column

                    if assumption.startDate:
                        start_dt = pd.to_datetime(assumption.startDate) # Use full datetime
                        # Ensure timezone awareness matches columns if applicable
                        col_tz = getattr(parsed_columns_obj.dtype, 'tz', None)
                        if col_tz is not None and start_dt.tzinfo is None:
                             start_dt = start_dt.replace(tzinfo=col_tz) # Make aware if columns are aware
                        elif col_tz is None and start_dt.tzinfo is not None:
                             start_dt = start_dt.replace(tzinfo=None) # Make naive if columns are naive

                        start_date = start_dt.to_period(freq='M') if col_type is pd.Period else start_dt

                    if assumption.endDate:
                        end_dt = pd.to_datetime(assumption.endDate)
                        col_tz = getattr(parsed_columns_obj.dtype, 'tz', None)
                        if col_tz is not None and end_dt.tzinfo is None:
                            end_dt = end_dt.replace(tzinfo=col_tz)
                        elif col_tz is None and end_dt.tzinfo is not None:
                            end_dt = end_dt.replace(tzinfo=None)

                        end_date = end_dt.to_period(freq='M') if col_type is pd.Period else end_dt

                except Exception as assumption_date_parse_error:
                    print(f"    - Warning: Could not parse or align assumption start/end date ({assumption.startDate} / {assumption.endDate}): {assumption_date_parse_error}. Skipping date filtering for this assumption.")
                    start_date, end_date = None, None # Reset on error

                # Create boolean masks for column selection based on dates
                start_mask = calculated_df.columns >= start_date if start_date is not None else True
                end_mask = calculated_df.columns <= end_date if end_date is not None else True
                target_cols_mask = start_mask & end_mask

                # Check if the mask results in any columns being selected
                if not target_cols_mask.any():
                     # Only print warning if dates were actually specified
                     if start_date or end_date:
                          print(f"    - Warning: No date columns matched the specified range ({start_date} - {end_date}). Skipping assumption.")
                          continue # Skip this assumption entirely if date range is specified but invalid
                     # else: No range specified, mask should be all True

                # Log the effective date range if filtering occurred and was valid
                if not target_cols_mask.all() and target_cols_mask.any():
                    filtered_cols = calculated_df.columns[target_cols_mask]
                    min_col_str = str(filtered_cols.min())
                    max_col_str = str(filtered_cols.max())
                    print(f"    - Applying to date range: {min_col_str} to {max_col_str}")
                elif (start_date or end_date) and target_cols_mask.all(): # Mask didn't filter, but dates were specified
                     print(f"    - Info: Specified date range ({start_date} - {end_date}) included all columns.")
                # else: No date range specified, using all columns is intended, no need to log range.

            elif assumption.startDate or assumption.endDate:
                # Date columns couldn't be parsed, but the assumption has date constraints
                print("    - Warning: Cannot apply date range because DataFrame columns could not be parsed as dates/periods. Applying assumption to all columns.")

            # --- Apply Assumption Logic using the mask ---
            try:
                target_row_label = clean_target_metric # Use cleaned metric name
                target_column_labels = calculated_df.columns[target_cols_mask]

                if target_column_labels.empty:
                     # This should be caught by the .any() check above, but as a safeguard:
                     print(f"    - Warning: No target columns identified after filtering for {target_row_label}. Skipping application.")
                     continue

                # Ensure target values are numeric before applying operations
                # Operate on a copy to check for non-numeric values without altering original slice yet
                values_to_modify = calculated_df.loc[target_row_label, target_column_labels].copy()
                # Attempt to convert to numeric, coercing errors to NaN
                numeric_values = pd.to_numeric(values_to_modify, errors='coerce')
                non_numeric_mask = numeric_values.isna()

                if non_numeric_mask.any():
                    affected_columns = target_column_labels[non_numeric_mask]
                    # Use .astype(str).tolist() for reliable printing of Period/DatetimeIndex
                    print(f"    - Warning: Non-numeric data found for metric '{target_row_label}' in columns {affected_columns.astype(str).tolist()}. These values will not be changed.")
                    # Identify columns that ARE numeric
                    numeric_target_column_labels = target_column_labels[~non_numeric_mask]
                    if numeric_target_column_labels.empty:
                        print("    - No numeric columns left to apply changes to. Skipping.")
                        continue
                    # Use only the numeric values and corresponding labels for calculations
                    current_values = numeric_values[~non_numeric_mask].astype(float) # Ensure float for calculations
                    target_column_labels_for_update = numeric_target_column_labels
                else:
                    # All values are numeric, proceed with original labels and coerced values
                    current_values = numeric_values.astype(float) # Ensure float
                    target_column_labels_for_update = target_column_labels

                # Apply the calculation only to the valid numeric columns
                if assumption.type == "percentage":
                    percentage_change = assumption.value / 100.0
                    calculated_df.loc[target_row_label, target_column_labels_for_update] = current_values * (1 + percentage_change)
                    print(f"    - Applied {assumption.value}% change to numeric columns.")

                elif assumption.type == "absolute":
                    calculated_df.loc[target_row_label, target_column_labels_for_update] = current_values + assumption.value
                    print(f"    - Applied absolute change of {assumption.value} to numeric columns.")

                elif assumption.type == "driver_change":
                    # Placeholder - Actual driver logic would be complex
                    print(f"    - Skipping 'driver_change' assumption type (logic not implemented).")
                    pass # Driver logic is complex and needs specific implementation details
                else:
                    print(f"    - Warning: Unknown assumption type '{assumption.type}'. Skipping.")

            except KeyError:
                 # This might happen if clean_target_metric somehow wasn't caught earlier
                 print(f"    - Error: Row label '{clean_target_metric}' not found during application. Skipping assumption.")
                 continue
            except Exception as apply_error:
                import traceback
                print(f"    - Error applying assumption {assumption.id} ({assumption.type} on {clean_target_metric}): {apply_error}")
                traceback.print_exc()
                # Continue to the next assumption rather than failing the whole request
                continue

        print("Finished applying scenario assumptions.")

        # --- Data Postprocessing ---
        # Revert columns and index to original string format/type if they were modified
        calculated_df.columns = original_columns
        calculated_df.index = original_index
        calculated_df.index.name = original_index_name
        # Attempt to restore original dtypes if possible (might be lossy)
        try:
            calculated_df = calculated_df.astype(base_forecast_df.dtypes)
        except Exception as dtype_error:
            print(f"Warning: Could not fully restore original dtypes: {dtype_error}")

        print("Restored DataFrame columns/index to original format.")

    except Exception as e:
        print(f"Critical error during scenario assumption application for scenario {scenario_id}: {e}")
        import traceback
        traceback.print_exc() # Print full traceback for debugging
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error during scenario calculation: {e}") from e

    # --- 4. Prepare Response ---
    # Convert the resulting DataFrame to a JSON-serializable format
    try:
        output_df = calculated_df.copy()
        # Determine index name, assign default if None
        index_name = output_df.index.name if output_df.index.name else 'Metric'

        # Convert period/datetime index/columns back to string for JSON compatibility
        if isinstance(output_df.index, (pd.PeriodIndex, pd.DatetimeIndex)):
             output_df.index = output_df.index.astype(str)
        if isinstance(output_df.columns, (pd.PeriodIndex, pd.DatetimeIndex)):
            output_df.columns = output_df.columns.astype(str)

        # Reset index to include the metric names as a column
        output_df = output_df.reset_index()
        # Rename the potentially generated 'index' column to the correct name
        if 'index' in output_df.columns and index_name != 'index':
             output_df = output_df.rename(columns={'index': index_name})
        elif index_name not in output_df.columns: # Handle case where index was unnamed and reset_index didn't add it properly?
             # This shouldn't happen with reset_index() but as a safeguard
             print(f"Warning: Index column '{index_name}' not found after reset_index. Adding placeholder.")
             output_df[index_name] = calculated_df.index.astype(str) # Add original index as string

        # Use 'split' format: {'columns': [...], 'data': [[...], ...]}
        # Fill NaN with None for JSON compatibility
        calculated_data_dict = output_df.fillna(value=pd.NA).to_dict(orient='split')


        # Remove the 'index' key potentially added by to_dict('split') as it's redundant after reset_index
        if 'index' in calculated_data_dict:
            del calculated_data_dict['index']

        # Ensure data list contains JSON serializable types (handle potential NaT etc.)
        if 'data' in calculated_data_dict:
             calculated_data_dict['data'] = [
                 [None if pd.isna(item) else item for item in row]
                 for row in calculated_data_dict['data']
             ]


    except Exception as serialisation_error:
         print(f"Error preparing response data for scenario {scenario_id}: {serialisation_error}")
         import traceback
         traceback.print_exc()
         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error formatting calculation results") from serialisation_error


    return ScenarioApplyResponse(
        scenarioId=scenario_id,
        calculatedForecastData=calculated_data_dict
    )

