import databutton as db
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field, field_validator
from typing import List, Dict, Any, Optional, Annotated
from datetime import datetime
import uuid
import re

from app.auth import AuthorizedUser
# Import shared models
from app.apis.models import DashboardLayoutItem, WidgetDataSource, WidgetConfiguration

router = APIRouter(prefix="/dashboards", tags=["Dashboards"])

# --- Constants ---
STORAGE_KEY_PREFIX = "dashboard_config-"
MAX_KEY_LEN = 255 # Max length for storage keys

# --- Helper Function ---
def sanitize_storage_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    # Replace potentially dangerous sequences first
    key = key.replace('..', '_') # Avoid directory traversal attempts
    key = key.replace('/', '_') # Replace slashes
    # Replace any remaining non-allowed characters with underscore
    key = re.sub(r'[^a-zA-Z0-9._-]', '_', key)
    # Ensure key is not excessively long (optional, but good practice)
    if len(key) > MAX_KEY_LEN:
        key = key[:MAX_KEY_LEN]
    return key

def create_dashboard_storage_key(user_id: str, dashboard_id: str) -> str:
    """Generates a sanitized storage key for a dashboard."""
    return sanitize_storage_key(f"{STORAGE_KEY_PREFIX}{user_id}-{dashboard_id}.json")

# --- Pydantic Models (Using imported shared models) ---

# Removed local DashboardLayoutItem definition
# Removed local WidgetDataSource definition
# Removed local WidgetConfiguration definition

class DashboardConfigurationBase(BaseModel):
    name: str = Field(..., max_length=100, description="User-defined name for the dashboard")
    description: Optional[str] = Field(None, max_length=500, description="Optional description")
    layout: List[DashboardLayoutItem] = Field(default_factory=list) # Uses imported DashboardLayoutItem
    widgets: List[WidgetConfiguration] = Field(default_factory=list) # Uses imported WidgetConfiguration

    @field_validator('name')
    @classmethod
    def name_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Name must not be empty')
        return v

class DashboardConfiguration(DashboardConfigurationBase):
    dashboardId: str = Field(..., description="Unique identifier for the dashboard")
    ownerId: str = Field(..., description="ID of the user who owns this dashboard")

    class Config:
        # If loading from Firestore, allow population by field name (though Firestore uses dict keys)
        # Might not be necessary depending on how data is fetched/parsed
        # from_attributes = True # Pydantic v2 equivalent of orm_mode
        pass

# Model for updating a dashboard (only mutable fields)
class DashboardUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    layout: Optional[List[DashboardLayoutItem]] = None # Uses imported DashboardLayoutItem
    widgets: Optional[List[WidgetConfiguration]] = None # Uses imported WidgetConfiguration

    @field_validator('name')
    @classmethod
    def name_must_not_be_empty_if_provided(cls, v):
        if v is not None and not v.strip():
            raise ValueError('Name must not be empty')
        return v

# Model for list response (summary)
class DashboardSummary(BaseModel):
    dashboardId: str
    name: str
    description: Optional[str] = None

# Model for full dashboard response
class DashboardResponse(DashboardConfiguration):
    # Inherits all fields from DashboardConfiguration
    pass

# Model for creating a dashboard (excludes server-generated IDs)
class DashboardCreate(DashboardConfigurationBase):
    # Inherits fields from base, excludes dashboardId and ownerId
    pass

# --- Internal Helper Functions ---

async def _get_dashboard_doc(user_id: str, dashboard_id: str) -> Optional[Dict[str, Any]]:
    """Fetches a dashboard configuration document from storage."""
    storage_key = create_dashboard_storage_key(user_id, dashboard_id)
    try:
        doc = db.storage.json.get(storage_key)
        return doc
    except FileNotFoundError:
        return None
    except Exception as e:
        print(f"Error reading dashboard {dashboard_id} for user {user_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to read dashboard data")

async def _save_dashboard_doc(user_id: str, dashboard_id: str, config_dict: Dict[str, Any]):
    """Saves a dashboard configuration document to storage."""
    storage_key = create_dashboard_storage_key(user_id, dashboard_id)
    try:
        db.storage.json.put(storage_key, config_dict)
    except Exception as e:
        print(f"Error saving dashboard {dashboard_id} for user {user_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to save dashboard data")

async def _delete_dashboard_doc(user_id: str, dashboard_id: str):
    """Deletes a dashboard configuration document from storage."""
    storage_key = create_dashboard_storage_key(user_id, dashboard_id)
    try:
        db.storage.json.delete(storage_key)
    except FileNotFoundError:
        # If already deleted, consider it a success for idempotency
        pass
    except Exception as e:
        print(f"Error deleting dashboard {dashboard_id} for user {user_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to delete dashboard data")

async def _list_user_dashboard_ids(user_id: str) -> List[str]:
    """Lists dashboard IDs owned by a specific user based on storage keys."""
    try:
        prefix_to_match = sanitize_storage_key(f"{STORAGE_KEY_PREFIX}{user_id}-")
        all_files = db.storage.json.list()
        dashboard_ids = []
        for file in all_files:
            if file.name.startswith(prefix_to_match) and file.name.endswith('.json'):
                # Extract dashboard ID part
                # Example key: dashboard_config-user123-dashABC.json
                try:
                    parts = file.name[len(prefix_to_match):-len('.json')]
                    # Assuming dashboard ID doesn't contain '-', this might need refinement
                    # if user_id or dashboard_id can contain hyphens themselves.
                    # For now, assume the structure is simple enough.
                    dashboard_id = parts # Simplified assumption
                    dashboard_ids.append(dashboard_id)
                except Exception as e:
                    print(f"Could not parse dashboard ID from key {file.name}: {e}")
        return dashboard_ids
    except Exception as e:
        print(f"Error listing dashboards for user {user_id}: {e}")
        return [] # Return empty list on error

# --- API Endpoints ---

@router.get("", response_model=List[DashboardSummary])
async def list_dashboards(
    user: AuthorizedUser
):
    """Lists all dashboards accessible to the authenticated user (simplified to owner for now)."""
    user_id = user.sub
    dashboard_ids = await _list_user_dashboard_ids(user_id)
    summaries = []
    for dash_id in dashboard_ids:
        doc = await _get_dashboard_doc(user_id, dash_id)
        if doc:
            try:
                # Explicitly cast to handle potential non-string types in stored data
                name_val = str(doc.get('name', 'Untitled Dashboard'))
                desc_val = str(doc.get('description', '')) if doc.get('description') is not None else None
                
                summary = DashboardSummary(
                    dashboardId=dash_id,
                    name=name_val,
                    description=desc_val
                )
                summaries.append(summary)
            except Exception as e:
                print(f"Error parsing summary for dashboard {dash_id}: {e}")
                # Optionally skip malformed dashboards in the list
                summaries.append(DashboardSummary(dashboardId=dash_id, name="[Error Loading Name]"))
    return summaries

@router.post("", response_model=DashboardResponse, status_code=status.HTTP_201_CREATED)
async def create_dashboard(
    payload: DashboardCreate,
    user: AuthorizedUser
):
    """Creates a new dashboard configuration."""
    user_id = user.sub
    dashboard_id = str(uuid.uuid4()) # Generate a unique ID
    
    # Create the full configuration object
    new_config = DashboardConfiguration(
        dashboardId=dashboard_id,
        ownerId=user_id,
        **payload.model_dump() # Unpack fields from the creation payload
    )
    
    config_dict = new_config.model_dump(by_alias=True) # Convert to dict for storage
    await _save_dashboard_doc(user_id, dashboard_id, config_dict)
    
    return DashboardResponse(**config_dict) # Return the full dashboard config

@router.get("/{dashboard_id}", response_model=DashboardResponse)
async def get_dashboard(
    dashboard_id: str,
    user: AuthorizedUser
):
    """Retrieves a specific dashboard configuration."""
    user_id = user.sub
    doc = await _get_dashboard_doc(user_id, dashboard_id)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dashboard not found")
    
    # Validate and return
    try:
        dashboard_config = DashboardConfiguration(**doc)
        # Ensure owner matches (basic auth check)
        if dashboard_config.ownerId != user_id:
             raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User does not own this dashboard")
        return DashboardResponse(**dashboard_config.model_dump(by_alias=True))
    except Exception as e:
        print(f"Error parsing dashboard {dashboard_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to parse dashboard configuration")

@router.put("/{dashboard_id}", response_model=DashboardResponse)
async def update_dashboard(
    dashboard_id: str,
    payload: DashboardUpdate,
    user: AuthorizedUser
):
    """Updates an existing dashboard configuration."""
    user_id = user.sub
    existing_doc = await _get_dashboard_doc(user_id, dashboard_id)
    if not existing_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dashboard not found")

    try:
        # Load existing config into model to verify owner
        existing_config = DashboardConfiguration(**existing_doc)
        if existing_config.ownerId != user_id:
             raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User does not own this dashboard")

        # Create updated config model by applying changes
        # Use exclude_unset=True to only apply fields present in the payload
        update_data = payload.model_dump(exclude_unset=True)
        updated_config = existing_config.copy(update=update_data)
        
        # Save the updated config
        updated_dict = updated_config.model_dump(by_alias=True)
        await _save_dashboard_doc(user_id, dashboard_id, updated_dict)
        
        return DashboardResponse(**updated_dict)

    except Exception as e:
        print(f"Error updating dashboard {dashboard_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update dashboard: {e}")

@router.delete("/{dashboard_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_dashboard(
    dashboard_id: str,
    user: AuthorizedUser
):
    """Deletes a dashboard configuration."""
    user_id = user.sub
    # First, verify ownership before deleting
    existing_doc = await _get_dashboard_doc(user_id, dashboard_id)
    if not existing_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dashboard not found")
    
    try:
        existing_config = DashboardConfiguration(**existing_doc)
        if existing_config.ownerId != user_id:
             raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User does not own this dashboard")
    except Exception as e:
         # Handle parsing error for potentially corrupt data, but still allow deletion attempt if found
         print(f"Warning: Could not fully parse dashboard {dashboard_id} before deletion: {e}")

    # Proceed with deletion
    await _delete_dashboard_doc(user_id, dashboard_id)
    # No content to return on successful deletion
    return
