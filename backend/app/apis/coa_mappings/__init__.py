"""
API endpoints for managing the mapping between Chart of Accounts (CoA)
and standard Cash Flow Statement categories (Operating, Investing, Financing).
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Dict, Literal
from datetime import datetime, timezone

# Assuming firebase_admin is initialized elsewhere and db_client is accessible
# If not, add initialization logic here or import from a shared module
from google.cloud import firestore_v1 as firestore
from app.auth import AuthorizedUser # Assuming standard auth dependency

# TODO: Refactor firestore client dependency injection if needed
# from app.database import get_firestore_db # Example if you have a shared DB dependency

router = APIRouter(prefix="/coa-mappings", tags=["CoA Mappings"])

# --- Constants ---
MAPPINGS_COLLECTION = "coaCashFlowMappings"
CashFlowCategory = Literal["OPERATING", "INVESTING", "FINANCING", "UNASSIGNED"]

# --- Pydantic Models ---

class CoaCashFlowMappingsUpdate(BaseModel):
    """Request body for updating the mappings for an organization."""
    mappings: Dict[str, CashFlowCategory] = Field(
        ...,
        description="A dictionary mapping CoA account IDs to their cash flow category."
    )

class CoaCashFlowMappingsResponse(BaseModel):
    """Response body for returning the mappings for an organization."""
    mappings: Dict[str, CashFlowCategory] = Field(
        ...,
        description="A dictionary mapping CoA account IDs to their cash flow category."
    )
    organization_id: str
    updated_at: str | None = None # ISO 8601 timestamp


# --- Firestore Client (Placeholder - Replace with proper injection) ---
# This is a basic placeholder. Use your app's standard way to get the client.
async def get_firestore_db_temp():
    # In a real app, this should likely come from Depends(get_firestore_db)
    # Ensure firebase_admin is initialized appropriately in your app's startup.
    try:
        # Attempt to get default client, assuming initialized elsewhere
        client = firestore.AsyncClient()
        # Simple check - replace with a more robust health check if needed
        await client.collection('__test_collection__').limit(1).get()
        print("Firestore client obtained successfully (temporary method).")
        return client
    except Exception as e:
        print(f"Error obtaining Firestore client (temporary method): {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not connect to the database."
        ) from e

# --- Helper Functions (Placeholder for Auth/Org Check) ---
async def _verify_org_access_placeholder(org_id: str, user: AuthorizedUser):
    # Placeholder: Implement actual organization access verification
    print(f"Placeholder: Verifying access for user {user.sub} to org {org_id}")
    if not org_id: # Basic check
         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Organization ID is required.")
    # In reality, check user's permissions against the org_id
    pass

# --- API Endpoints ---

@router.get(
    "/{organization_id}",
    response_model=CoaCashFlowMappingsResponse,
    summary="Get CoA to Cash Flow Category Mappings",
    description="Retrieves the current mapping of Chart of Accounts items to cash flow categories for a specific organization."
)
async def get_coa_mappings(
    organization_id: str,
    current_user: AuthorizedUser, # Parameter order corrected
    db_client: firestore.AsyncClient = Depends(get_firestore_db_temp) # Use temporary client
):
    await _verify_org_access_placeholder(organization_id, current_user)
    print(f"Fetching mappings for org: {organization_id}")

    try:
        doc_ref = db_client.collection(MAPPINGS_COLLECTION).document(organization_id)
        doc_snapshot = await doc_ref.get()

        if doc_snapshot.exists:
            data = doc_snapshot.to_dict()
            # Ensure mappings field exists, default to empty dict if not
            mappings = data.get("mappings", {})
            updated_at = data.get("updatedAt")
            print(f"Found existing mappings for org {organization_id}.")
        else:
            # Default response if no mapping document exists yet
            mappings = {}
            updated_at = None
            print(f"No existing mappings found for org {organization_id}, returning default.")

        return CoaCashFlowMappingsResponse(
            organization_id=organization_id,
            mappings=mappings,
            updated_at=updated_at
        )

    except Exception as e:
        print(f"Error fetching CoA mappings for organization {organization_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve CoA mappings."
        ) from e


@router.put(
    "/{organization_id}",
    response_model=CoaCashFlowMappingsResponse,
    summary="Update CoA to Cash Flow Category Mappings",
    description="Sets or replaces the entire mapping configuration for a specific organization."
)
async def update_coa_mappings(
    organization_id: str,
    update_data: CoaCashFlowMappingsUpdate,
    current_user: AuthorizedUser, # Parameter order corrected
    db_client: firestore.AsyncClient = Depends(get_firestore_db_temp) # Use temporary client
):
    await _verify_org_access_placeholder(organization_id, current_user)
    print(f"Updating mappings for org: {organization_id}")

    try:
        doc_ref = db_client.collection(MAPPINGS_COLLECTION).document(organization_id)
        now_iso = datetime.now(timezone.utc).isoformat()

        # Prepare the data to be saved - overwrite existing document
        # The document ID is the organization_id
        data_to_save = {
            "mappings": update_data.mappings,
            "updatedAt": now_iso,
            # "organization_id": organization_id # No need to store org_id in the doc itself
        }

        # Use set() to overwrite the document or create if it doesn't exist
        await doc_ref.set(data_to_save)
        print(f"Successfully updated/set CoA mappings for org {organization_id}.")

        # Return the saved data
        return CoaCashFlowMappingsResponse(
            organization_id=organization_id,
            mappings=update_data.mappings, # Return the data that was just saved
            updated_at=now_iso
        )

    except Exception as e:
        print(f"Error updating CoA mappings for organization {organization_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update CoA mappings."
        ) from e

