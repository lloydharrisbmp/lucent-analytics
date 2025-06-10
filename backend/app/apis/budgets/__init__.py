from fastapi import APIRouter, HTTPException, Path, Body, Depends, Request # Add Request
from pydantic import BaseModel, Field
from typing import List, Optional
import databutton as db
from datetime import datetime
import uuid
import re # Import re for sanitization
from app.auth import AuthorizedUser # Assuming protected endpoints

router = APIRouter(prefix="/budgets", tags=["Budgets"])

# --- Pydantic Models ---

class BudgetItem(BaseModel):
    """Represents a single line item within a budget version."""
    account_code: str = Field(..., description="The account code this budget item relates to.")
    period: str = Field(..., description="The time period (e.g., 'YYYY-MM' or 'YYYY-Q#') this amount applies to.")
    amount: float = Field(..., description="The budgeted amount.")
    description: Optional[str] = Field(None, description="Optional description for the budget item.")
    # Add other relevant fields from MYA-100 schema if needed (e.g., department, project)

class BudgetVersionMetadata(BaseModel):
    """Metadata describing a budget version, used for listing."""
    version_id: str = Field(..., description="Unique identifier for the budget version.")
    name: str = Field(..., description="User-friendly name for the version (e.g., 'Initial 2024', 'Q1 Revised').")
    created_at: datetime = Field(..., description="Timestamp when the version was created.")
    # Add other metadata if needed: created_by (user_id), source (e.g., 'upload', 'manual'), etc.

class BudgetVersion(BudgetVersionMetadata):
    """Represents a complete budget version, including all items."""
    items: List[BudgetItem] = Field(..., description="The list of budget line items for this version.")

class CreateBudgetVersionRequest(BaseModel):
    """Request body for creating a new budget version."""
    name: str = Field(..., description="Name for the new version.")
    items: List[BudgetItem] = Field(..., description="List of budget items.")

class UpdateBudgetVersionRequest(BaseModel):
    """Request body for updating/replacing a budget version."""
    name: Optional[str] = Field(None, description="Optional new name for the version.")
    items: List[BudgetItem] = Field(..., description="The complete list of new budget items for this version.")


# --- Helper Functions ---
def sanitize_storage_key_part(part: str) -> str:
    """Sanitize storage key part to only allow alphanumeric and ._- symbols"""
    return re.sub(r'[^a-zA-Z0-9._-]', '_', part) # Replace invalid chars with underscore

def get_budget_storage_key(organization_id: str, version_id: str) -> str:
    """Generates the storage key for a specific budget version JSON file."""
    org_id_safe = sanitize_storage_key_part(organization_id)
    version_id_safe = sanitize_storage_key_part(version_id)
    key = f"budgets_{org_id_safe}_{version_id_safe}.json" # Use underscores instead of slashes
    return key

def get_budget_index_key(organization_id: str) -> str:
    """Generates the storage key for the budget index file for an organization."""
    org_id_safe = sanitize_storage_key_part(organization_id)
    key = f"budgets_{org_id_safe}__index.json" # Use underscores instead of slashes
    return key


# --- API Endpoints ---

@router.post("/{organization_id}/versions", response_model=BudgetVersionMetadata, status_code=201)
async def create_budget_version(
    user: AuthorizedUser,  # Protect endpoint
    organization_id: str = Path(..., description="ID of the organization"),
    request_body: CreateBudgetVersionRequest = Body(...),
):
    """Creates a new budget version for an organization."""
    # 1. Generate version_id and timestamp
    version_id = str(uuid.uuid4())
    created_at = datetime.utcnow()
    created_at_iso = created_at.isoformat() # Convert datetime to ISO string early

    # 2. Create BudgetVersion object (Pydantic model for structure)
    budget_version_data = BudgetVersion(
        version_id=version_id,
        name=request_body.name,
        created_at=created_at, # Keep as datetime in Pydantic model for now
        items=request_body.items,
    )

    # 3. Prepare data for JSON storage (convert Pydantic model to dict)
    data_to_save = budget_version_data.model_dump()  # Use .model_dump() for Pydantic v2
    # Ensure the datetime string is used for storage
    data_to_save['created_at'] = created_at_iso

    # 4. Save BudgetVersion data to db.storage.json
    storage_key = get_budget_storage_key(organization_id, version_id)
    try:
        db.storage.json.put(storage_key, data_to_save)
        print(
            f"Saved budget version {version_id} for org {organization_id} to {storage_key}"
        )
    except Exception as e:
        print(f"Error saving budget version {version_id} to {storage_key}: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to save budget version data: {e}"
        ) from e

    # 5. Update/create index file
    index_key = get_budget_index_key(organization_id)
    try:
        # Get existing index or create new list
        index_data = []
        try:
            index_data = db.storage.json.get(index_key, default=[])
        except FileNotFoundError:
            index_data = [] # Explicitly start with empty list if not found

        # Prepare new metadata entry for the index (as a dictionary)
        new_metadata_entry = {
            "version_id": version_id,
            "name": request_body.name,
            "created_at": created_at_iso, # Use ISO string for the index as well
        }
        index_data.append(new_metadata_entry)

        # Save updated index
        db.storage.json.put(index_key, index_data)
        print(f"Updated budget index for org {organization_id} at {index_key}")

    except Exception as e:
        print(f"Error updating budget index {index_key}: {e}")
        # Consider cleanup logic if index update fails after version save
        pass # For now, just log the error

    # 6. Return BudgetVersionMetadata (using the original datetime object for the response model)
    return BudgetVersionMetadata(
        version_id=version_id, name=request_body.name, created_at=created_at
    )

@router.get("/{organization_id}/versions", response_model=List[BudgetVersionMetadata])
async def list_budget_versions(
    user: AuthorizedUser, # Ensure user is logged in to list
    organization_id: str = Path(..., description="ID of the organization"),
):
    """Lists metadata for all available budget versions for an organization."""
    index_key = get_budget_index_key(organization_id)
    try:
        index_data = db.storage.json.get(index_key, default=[])
        # Validate data format - Pydantic will implicitly do this on return
        return index_data
    except FileNotFoundError:
        return [] # No index file means no versions
    except Exception as e:
        print(f"Error reading budget index {index_key}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve budget versions list.") from e

@router.get("/{organization_id}/versions/{version_id}", response_model=BudgetVersion)
async def get_budget_version(
    user: AuthorizedUser, # Ensure user is logged in to read details
    organization_id: str = Path(..., description="ID of the organization"),
    version_id: str = Path(..., description="ID of the budget version to retrieve"),
):
    """Retrieves a specific budget version, including all its items."""
    storage_key = get_budget_storage_key(organization_id, version_id)
    try:
        budget_data = db.storage.json.get(storage_key)
        # Validate data format - Pydantic will implicitly do this on return
        return budget_data
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Budget version '{version_id}' not found for organization '{organization_id}'.") from None
    except Exception as e:
        print(f"Error reading budget version {storage_key}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve budget version data.") from e

@router.put("/{organization_id}/versions/{version_id}", response_model=BudgetVersionMetadata)
async def update_budget_version(
    user: AuthorizedUser, # Protect endpoint
    organization_id: str = Path(..., description="ID of the organization"),
    version_id: str = Path(..., description="ID of the budget version to update/replace"),
    request_body: UpdateBudgetVersionRequest = Body(...),
):
    """Updates (replaces) an existing budget version."""
    storage_key = get_budget_storage_key(organization_id, version_id)
    index_key = get_budget_index_key(organization_id)
    updated_at = datetime.utcnow() # Consider if this should be updated

    # 1. Check if version exists (read index)
    try:
        index_data = db.storage.json.get(index_key, default=[])
        existing_metadata_dict = next((item for item in index_data if item['version_id'] == version_id), None)
        if not existing_metadata_dict:
            raise HTTPException(status_code=404, detail=f"Budget version '{version_id}' not found for update.") from None
        
        # Use existing created_at time
        existing_metadata = BudgetVersionMetadata(**existing_metadata_dict)
        created_at = existing_metadata.created_at
        current_name = existing_metadata.name
        
    except FileNotFoundError:
         raise HTTPException(status_code=404, detail=f"Budget version '{version_id}' not found for update (no index).") from None
    except Exception as e:
        print(f"Error reading budget index {index_key} during update: {e}")
        raise HTTPException(status_code=500, detail="Failed to read budget index before update.") from e

    # 2. Create new BudgetVersion object to save
    new_version_name = request_body.name if request_body.name else current_name
    updated_budget_version_data = BudgetVersion(
        version_id=version_id,
        name=new_version_name,
        created_at=created_at, # Keep original creation time
        items=request_body.items
        # Maybe add an 'updated_at' field?
    )

    # 3. Overwrite file at storage_key
    try:
        db.storage.json.put(storage_key, updated_budget_version_data.model_dump())
        print(f"Updated budget version {version_id} for org {organization_id} at {storage_key}")
    except Exception as e:
        print(f"Error saving updated budget version {version_id} to {storage_key}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save updated budget version data: {e}") from e

    # 4. Update index file metadata if name changed
    if new_version_name != current_name:
        try:
            updated_index_data = []
            for item in index_data:
                if item['version_id'] == version_id:
                    item['name'] = new_version_name
                    # Update other metadata if necessary (e.g., updated_at)
                updated_index_data.append(item)
            db.storage.json.put(index_key, updated_index_data)
            print(f"Updated budget index name for {version_id} at {index_key}")
        except Exception as e:
            print(f"Error updating budget index name for {version_id} at {index_key}: {e}")
            # Log error, potentially inconsistent state
            pass

    # 5. Return updated BudgetVersionMetadata
    return BudgetVersionMetadata(
        version_id=version_id,
        name=new_version_name,
        created_at=created_at
        # Add updated_at if implemented
    )

@router.delete("/{organization_id}/versions/{version_id}", status_code=204)
async def delete_budget_version(
    user: AuthorizedUser, # Protect endpoint
    request: Request    # Add request object
    # organization_id: str = Path(..., description="ID of the organization"), # Removed
    # version_id: str = Path(..., description="ID of the budget version to delete"), # Removed
):
    """Deletes a specific budget version by removing it from the index."""
    # Get path parameters directly from the request object
    organization_id = request.path_params.get("organization_id")
    version_id = request.path_params.get("version_id")

    # Add a check in case they are somehow still missing
    if not organization_id or not version_id:
        print(f"!!! CRITICAL ERROR: Path parameters not resolved in delete request. Params: {request.path_params}")
        raise HTTPException(status_code=500, detail="Internal server error processing delete request.")

    # --- The rest of the function logic remains the same ---
    index_key = get_budget_index_key(organization_id)
    print(f"--- Attempting to delete budget version: Org={organization_id}, Version={version_id} ---")
    print(f"Using index key: {index_key}")

    # 1. Read index file
    try:
        print(f"Reading index data from {index_key}...")
        index_data = db.storage.json.get(index_key, default=[])
        print(f"Read {len(index_data)} items from index: {index_data}")
    except FileNotFoundError:
        print(f"Index file {index_key} not found. Nothing to delete.")
        # Return 204 as the item is effectively not present
        return
    except Exception as e:
        print(f"!!! ERROR reading index {index_key} during delete: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to read budget index: {e}") from e

    # 2. Filter out the version to be deleted
    original_length = len(index_data)
    updated_index_data = [item for item in index_data if item.get('version_id') != version_id]
    new_length = len(updated_index_data)
    print(f"Filtered index data. Original length: {original_length}, New length: {new_length}")
    if new_length < original_length:
        print(f"Version {version_id} found in index. Filtered list: {updated_index_data}")
    else:
        print(f"Version {version_id} was NOT found in the index. No changes needed.")
        # Return 204 as the desired state (item not listed) is already true
        return

    # 3. Save the updated index
    try:
        print(f"Attempting to save updated index ({new_length} items) back to {index_key}...")
        db.storage.json.put(index_key, updated_index_data)
        print(f"Successfully saved updated index to {index_key}.")
    except Exception as e:
        print(f"!!! ERROR saving updated index {index_key} during delete: {e}")
        # If saving fails, the deletion didn't persist. Raise 500.
        raise HTTPException(status_code=500, detail=f"Failed to save updated budget index: {e}") from e

    print(f"--- Finished delete attempt successfully for version: {version_id} ---")
    # No content to return for 204
    return

