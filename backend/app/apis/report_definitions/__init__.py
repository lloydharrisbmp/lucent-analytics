
import uuid
from datetime import datetime, timezone
from typing import Any, List, Optional

import databutton as db
from app.apis.permission_utils import get_user_permissions # Import checker from utils
from fastapi import Request # Added for audit logging
from app.apis.utils import log_audit_event # CORRECT Import the audit logging function
from fastapi import APIRouter, HTTPException, status, Depends, Request as FastAPIRequest
from app.auth import AuthorizedUser # Use standard auth dependency
from pydantic import BaseModel, Field, field_validator

router = APIRouter(prefix="/report-definitions", tags=["Report Definitions"])

# --- Pydantic Models ---

class ReportDefinitionMetadataBase(BaseModel):
    name: str = Field(..., description="User-defined name for the report.")
    description: Optional[str] = Field(None, description="Optional description of the report's purpose or content.")

class ReportDefinitionBase(ReportDefinitionMetadataBase):
    budget_version_id: Optional[str] = Field(None, description="Optional ID of the budget version to compare against.")
    # Using dict/Any for complex nested structures based on MYA-94 schema
    dataSource: dict = Field(..., description="Specifies the primary data source and scope.")
    filters: dict = Field(..., description="Criteria applied to the data source before aggregation.")
    rows: List[dict] = Field(..., description="Defines the structure and content of the report rows.")
    columns: List[dict] = Field(..., description="Defines the structure and content of the report columns.")
    # Basic validation (can be expanded later based on full JSON schema)
    @field_validator('rows', 'columns', mode='before')
    @classmethod
    def check_items_are_dict(cls, v):
        if isinstance(v, list):
            for item in v:
                if not isinstance(item, dict):
                    raise ValueError('Each item in rows/columns must be a dictionary')
        return v

class ReportDefinitionCreate(ReportDefinitionBase):
    # Inherits fields from ReportDefinitionBase
    pass

class ReportDefinition(ReportDefinitionBase):
    id: str = Field(..., description="Unique identifier for this report definition.", examples=["uuid"])
    version: str = Field(default="1.0", description="Schema version.")
    createdAt: datetime = Field(..., description="Timestamp when the report definition was created.")
    updatedAt: datetime = Field(..., description="Timestamp when the report definition was last updated.")
    ownerId: str = Field(..., description="ID of the user who owns this definition.")

    model_config = {
        "from_attributes": True,  # Allows mapping from ORM objects if needed, good practice
        "json_encoders": {
            datetime: lambda v: v.isoformat()  # Ensure consistent ISO format
        }
    }

class ReportDefinitionMetadata(ReportDefinitionMetadataBase):
    id: str = Field(..., description="Unique identifier for this report definition.")
    updatedAt: datetime = Field(..., description="Timestamp when the report definition was last updated.")

    model_config = {
        "from_attributes": True,
        "json_encoders": {
            datetime: lambda v: v.isoformat()
        }
    }

# --- Helper Functions ---

def get_storage_key(user_id: str, report_id: str) -> str:
    # Basic sanitization, though user_id and report_id (UUID) should be safe
    safe_user_id = "".join(c for c in user_id if c.isalnum() or c in ['-', '_'])
    safe_report_id = "".join(c for c in report_id if c.isalnum() or c in ['-', '_'])
    # Use hyphens instead of slashes for db.storage compatibility
    return f"report_definitions-{safe_user_id}-{safe_report_id}.json"

# --- API Endpoints ---

@router.post(
    "",
    response_model=ReportDefinition,
    status_code=status.HTTP_201_CREATED,
    summary="Create Report Definition",
    description="Creates a new custom report definition for the authenticated user. Requires 'reports:create' permission."
)
async def create_report_definition(
    report_data: ReportDefinitionCreate,
    request: FastAPIRequest, # Added for audit logging
    user: AuthorizedUser, # Inject user via dependency
) -> ReportDefinition:
    """
    Creates a new report definition.

    - Performs permission check ('reports:create').
    - Generates a unique ID.
    - Sets ownership based on the authenticated user.
    - Stores the definition using db.storage.json.
    """
    # --- Permission Check ---
    required_permission = "reports:create"
    user_permissions = get_user_permissions(user.sub)
    if required_permission not in user_permissions:
        print(f"Permission denied for user {user.sub}. Missing: '{required_permission}'. Has: {user_permissions}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Insufficient permissions. Requires: {required_permission}",
        )
    # --- End Permission Check ---
    
    now = datetime.now(timezone.utc)
    report_id = str(uuid.uuid4())
    owner_id = user.sub # Get user ID from the authorized user dependency

    report_definition = ReportDefinition(
        id=report_id,
        ownerId=owner_id,
        createdAt=now,
        updatedAt=now,
        **report_data.model_dump(), # Unpack data from the request body
    )

    storage_key = get_storage_key(user_id=owner_id, report_id=report_id)

    try:
        # Convert datetime fields to ISO strings for JSON storage
        report_dict = report_definition.model_dump()
        report_dict["createdAt"] = report_definition.createdAt.isoformat()
        report_dict["updatedAt"] = report_definition.updatedAt.isoformat()

        db.storage.json.put(storage_key, report_dict)
        print(f"Successfully created report definition {report_id} for user {owner_id}")
        
        # --- Audit Log Success ---
        try:
            log_audit_event(
                user_identifier=owner_id,
                action_type="REPORT_DEFINITION_CREATE",
                status="SUCCESS",
                request=request,
                target_object_type="REPORT_DEFINITION",
                target_object_id=report_id,
                details={"name": report_definition.name} # Log basic info
            )
        except Exception as log_e:
            print(f"Failed to log audit event for REPORT_DEFINITION_CREATE success: {log_e}")
        # --- End Audit Log ---
        
        return report_definition
    except HTTPException as e:
        # --- Audit Log Failure (HTTPException) ---
        try:
            log_audit_event(
                user_identifier=user.sub if user else "unknown",
                action_type="REPORT_DEFINITION_CREATE",
                status="FAILURE",
                request=request,
                target_object_type="REPORT_DEFINITION",
                target_object_id=report_id if 'report_id' in locals() else "unknown",
                details={"error": str(e.detail), "status_code": e.status_code}
            )
        except Exception as log_e:
            print(f"Failed to log audit event for REPORT_DEFINITION_CREATE failure (HTTPException): {log_e}")
        # --- End Audit Log ---
        raise e # Re-raise HTTP exceptions (like permission denied) directly
    except Exception as e:
        print(f"Error saving report definition {report_id} for user {owner_id}: {e}")
        
        # --- Audit Log Failure (Generic Exception) ---
        try:
            log_audit_event(
                user_identifier=owner_id,
                action_type="REPORT_DEFINITION_CREATE",
                status="FAILURE",
                request=request, # Log request even on failure
                target_object_type="REPORT_DEFINITION",
                target_object_id=report_id, # report_id is generated before try block
                details={"error": str(e), "input_name": report_data.name} # Log error and input attempt
            )
        except Exception as log_e:
            print(f"Failed to log audit event for REPORT_DEFINITION_CREATE failure (Exception): {log_e}")
        # --- End Audit Log ---
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save report definition.",
        ) from None # Use 'from None' as suggested by B904 warning


# @router.get("", ...)
# def list_report_definitions(...)

@router.get(
    "",
    response_model=List[ReportDefinitionMetadata],
    summary="List Report Definitions",
    description="Retrieves a list of metadata for all report definitions owned by the authenticated user. Requires 'reports:read' permission."
)
async def list_report_definitions(
    request: Request, # Added for audit logging
    user: AuthorizedUser
) -> List[ReportDefinitionMetadata]:
    """
    Lists metadata for all report definitions owned by the user.

    - Performs permission check ('reports:read').
    - Lists files in the user-specific directory in db.storage.json.
    - Parses necessary metadata from each file.
    """
    # --- Permission Check ---
    required_permission = "reports:read"
    user_permissions = get_user_permissions(user.sub)
    if required_permission not in user_permissions:
        print(f"Permission denied for user {user.sub}. Missing: '{required_permission}'. Has: {user_permissions}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Insufficient permissions. Requires: {required_permission}",
        )
    # --- End Permission Check ---

    owner_id = user.sub
    # Adjust prefix to match the new key format
    user_dir_prefix = f"report_definitions-{owner_id}-"

    try:
        # List files starting with the user-specific prefix
        all_files = db.storage.json.list()
        user_files = [f for f in all_files if f.name.startswith(user_dir_prefix) and f.name.endswith(".json")]
        print(f"Found {len(user_files)} report definition files for user {owner_id} with prefix {user_dir_prefix}")

        metadata_list = []
        for file_info in user_files:
            try:
                # Fetch the full JSON to extract metadata
                report_data = db.storage.json.get(file_info.name)
                # Basic check if it looks like our report structure
                if isinstance(report_data, dict) and 'id' in report_data and 'name' in report_data and 'updatedAt' in report_data:
                    metadata_list.append(
                        ReportDefinitionMetadata(
                            id=report_data['id'],
                            name=report_data['name'],
                            description=report_data.get('description'), # Optional
                            updatedAt=datetime.fromisoformat(report_data['updatedAt'])
                        )
                    )
                else:
                    print(f"Skipping file {file_info.name} due to unexpected format.")
            except FileNotFoundError:
                print(f"File {file_info.name} listed but not found during retrieval.")
                continue # Skip this file
            except Exception as e:
                print(f"Error processing file {file_info.name}: {e}")
                continue # Skip this file on error

        # Sort by updatedAt descending
        metadata_list.sort(key=lambda x: x.updatedAt, reverse=True)
        
        # --- Audit Log Success ---
        log_audit_event(
            user_identifier=owner_id,
            action_type="REPORT_DEFINITION_LIST",
            status="SUCCESS",
            request=request,
            target_object_type="REPORT_DEFINITION", # Type being listed
            target_object_id=None, # No specific ID for list
            details={"count": len(metadata_list)}
        )
        # --- End Audit Log ---
        
        return metadata_list

    except Exception as e:
        print(f"Error listing report definitions for user {owner_id}: {e}")
        # --- Audit Log Failure ---
        log_audit_event(
            user_identifier=owner_id,
            action_type="REPORT_DEFINITION_LIST",
            status="FAILURE",
            request=request,
            target_object_type="REPORT_DEFINITION",
            target_object_id=None,
            details={"error": str(e)}
        )
        # --- End Audit Log ---
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list report definitions.",
        ) from e


# @router.get("/{report_id}", ...)
# def get_report_definition(...)

@router.get(
    "/{report_id}",
    response_model=ReportDefinition,
    summary="Get Report Definition",
    description="Retrieves the full details of a specific report definition by its ID. Requires 'reports:read' permission.",
    responses={
        404: {"description": "Report definition not found"},
        403: {"description": "User does not have permission to access this definition"},
    }
)
async def get_report_definition(
    report_id: str,
    request: Request, # Added for audit logging
    user: AuthorizedUser, # Standardize injection
) -> ReportDefinition:
    """
    Retrieves a specific report definition by its ID.

    - Performs permission check ('reports:read').
    - Verifies ownership.
    - Fetches the full definition from db.storage.json.
    """
    # --- Permission Check ---
    required_permission = "reports:read"
    user_permissions = get_user_permissions(user.sub)
    if required_permission not in user_permissions:
        print(f"Permission denied for user {user.sub}. Missing: '{required_permission}'. Has: {user_permissions}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Insufficient permissions. Requires: {required_permission}",
        )
    # --- End Permission Check ---

    owner_id = user.sub
    storage_key = get_storage_key(user_id=owner_id, report_id=report_id)

    try:
        report_data = db.storage.json.get(storage_key)
        # Attempt to parse into the Pydantic model for validation
        report_definition = ReportDefinition(**report_data)
        
        # Double-check ownership (though storage key implies it)
        if report_definition.ownerId != owner_id:
             print(f"Ownership mismatch: User {owner_id} tried to access report {report_id} owned by {report_definition.ownerId}")
             # This case should ideally not happen if storage keys are used correctly
             raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access forbidden")

        print(f"Successfully retrieved report definition {report_id} for user {owner_id}")
        
        # --- Audit Log Success ---
        log_audit_event(
            user_identifier=owner_id,
            action_type="REPORT_DEFINITION_GET",
            status="SUCCESS",
            request=request,
            target_object_type="REPORT_DEFINITION",
            target_object_id=report_id
        )
        # --- End Audit Log ---
        
        return report_definition

    except FileNotFoundError:
        print(f"Report definition {report_id} not found for user {owner_id}")
        # --- Audit Log Failure (Not Found) ---
        log_audit_event(
            user_identifier=owner_id,
            action_type="REPORT_DEFINITION_GET",
            status="FAILURE",
            request=request,
            target_object_type="REPORT_DEFINITION",
            target_object_id=report_id,
            details={"error": "Report definition not found"}
        )
        # --- End Audit Log ---
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report definition not found") from None
    except Exception as e:
        print(f"Error retrieving report definition {report_id} for user {owner_id}: {e}")
        # --- Audit Log Failure (General Error) ---
        log_audit_event(
            user_identifier=owner_id,
            action_type="REPORT_DEFINITION_GET",
            status="FAILURE",
            request=request,
            target_object_type="REPORT_DEFINITION",
            target_object_id=report_id,
            details={"error": str(e)}
        )
        # --- End Audit Log ---
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve report definition.",
        ) from e


# @router.put("/{report_id}", ...)
# def update_report_definition(...)

@router.put(
    "/{report_id}",
    response_model=ReportDefinition,
    summary="Update Report Definition",
    description="Updates an existing report definition by its ID. Requires 'reports:update' permission.",
    responses={
        404: {"description": "Report definition not found"},
        403: {"description": "User does not have permission to update this definition"},
    }
)
async def update_report_definition(
    report_id: str,
    report_update_data: ReportDefinitionCreate, # Use Create model, as it contains all updatable fields
    request: Request, # Added for audit logging
    user: AuthorizedUser, # Standardize injection
) -> ReportDefinition:
    """
    Updates an existing report definition.

    - Performs permission check ('reports:update').
    - Verifies ownership and existence by attempting to fetch first.
    - Updates the content and the updatedAt timestamp.
    - Saves the updated definition back to db.storage.json.
    """
    # --- Permission Check ---
    required_permission = "reports:update"
    user_permissions = get_user_permissions(user.sub)
    if required_permission not in user_permissions:
        print(f"Permission denied for user {user.sub}. Missing: '{required_permission}'. Has: {user_permissions}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Insufficient permissions. Requires: {required_permission}",
        )
    # --- End Permission Check ---
    
    owner_id = user.sub
    storage_key = get_storage_key(user_id=owner_id, report_id=report_id)

    try:
        # Fetch existing to ensure it exists and check ownership (implicitly via storage_key)
        existing_data = db.storage.json.get(storage_key)
        existing_report = ReportDefinition(**existing_data)

        # Double check ownerId just in case
        if existing_report.ownerId != owner_id:
             print(f"Ownership mismatch on update: User {owner_id} tried to update report {report_id} owned by {existing_report.ownerId}")
             raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access forbidden")

        # Create the updated report object
        # Preserve original id, ownerId, createdAt
        updated_report = ReportDefinition(
            id=existing_report.id,
            ownerId=existing_report.ownerId,
            createdAt=existing_report.createdAt,
            updatedAt=datetime.now(timezone.utc), # Update timestamp
            version=existing_report.version, # Keep original version for now, could be updated
            **report_update_data.model_dump() # Apply updates from request
        )

        # Save the updated definition after converting datetimes
        updated_report_dict = updated_report.model_dump()
        updated_report_dict["createdAt"] = updated_report.createdAt.isoformat()
        updated_report_dict["updatedAt"] = updated_report.updatedAt.isoformat()

        db.storage.json.put(storage_key, updated_report_dict)
        print(f"Successfully updated report definition {report_id} for user {owner_id}")
        
        # --- Audit Log Success ---
        log_audit_event(
            user_identifier=owner_id,
            action_type="REPORT_DEFINITION_UPDATE",
            status="SUCCESS",
            request=request,
            target_object_type="REPORT_DEFINITION",
            target_object_id=report_id,
            details={"name": updated_report.name} # Log basic info
        )
        # --- End Audit Log ---
        
        return updated_report

    except FileNotFoundError:
        print(f"Report definition {report_id} not found for update by user {owner_id}")
        # --- Audit Log Failure (Not Found) ---
        log_audit_event(
            user_identifier=owner_id,
            action_type="REPORT_DEFINITION_UPDATE",
            status="FAILURE",
            request=request,
            target_object_type="REPORT_DEFINITION",
            target_object_id=report_id,
            details={"error": "Report definition not found"}
        )
        # --- End Audit Log ---
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report definition not found") from None
    except Exception as e:
        print(f"Error updating report definition {report_id} for user {owner_id}: {e}")
        # --- Audit Log Failure (General Error) ---
        log_audit_event(
            user_identifier=owner_id,
            action_type="REPORT_DEFINITION_UPDATE",
            status="FAILURE",
            request=request,
            target_object_type="REPORT_DEFINITION",
            target_object_id=report_id, # Include ID even on failure if available
            details={"error": str(e)}
        )
        # --- End Audit Log ---
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update report definition.",
        ) from e

# @router.delete("/{report_id}", ...)
# def delete_report_definition(...)

@router.delete(
    "/{report_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Report Definition",
    description="Deletes a specific report definition by its ID. Requires 'reports:delete' permission.",
    responses={
        404: {"description": "Report definition not found"},
        403: {"description": "User does not have permission to delete this definition"},
        204: {"description": "Report definition successfully deleted"}, # Explicitly mention 204
    }
)
async def delete_report_definition(
    report_id: str, 
    request: Request, # Added for audit logging
    user: AuthorizedUser
) -> None:
    """
    Deletes a specific report definition.

    - Performs permission check ('reports:delete').
    - Verifies ownership by checking the storage key.
    - Checks existence before attempting deletion.
    - Removes the definition file from db.storage.json.
    """
    # --- Permission Check ---
    required_permission = "reports:delete"
    user_permissions = get_user_permissions(user.sub)
    if required_permission not in user_permissions:
        print(f"Permission denied for user {user.sub}. Missing: '{required_permission}'. Has: {user_permissions}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Insufficient permissions. Requires: {required_permission}",
        )
    # --- End Permission Check ---
    
    owner_id = user.sub
    storage_key = get_storage_key(user_id=owner_id, report_id=report_id)

    try:
        # Check if the file exists first by trying to get it
        # This also implicitly checks ownership via the storage key path
        existing_report = db.storage.json.get(storage_key)

        # If get succeeds without FileNotFoundError, proceed to delete
        db.storage.json.delete(storage_key)
        print(f"Successfully deleted report definition {report_id} for user {owner_id}")
        
        # --- Audit Log Success ---
        try:
            log_audit_event(
                user_identifier=owner_id,
                action_type="REPORT_DEFINITION_DELETE",
                status="SUCCESS",
                request=request,
                target_object_type="REPORT_DEFINITION",
                target_object_id=report_id,
                details={"name": existing_report.get("name", "N/A")} # Log name if available
            )
        except Exception as log_e:
            print(f"Failed to log audit event for REPORT_DEFINITION_DELETE success: {log_e}")
        # --- End Audit Log ---
        
        # Return None with 204 status code (FastAPI handles this)
        return None 

    except FileNotFoundError:
        # File didn't exist in the first place
        print(f"Report definition {report_id} not found for deletion by user {owner_id}")
        # --- Audit Log Failure (Not Found) ---
        try:
            log_audit_event(
                user_identifier=owner_id,
                action_type="REPORT_DEFINITION_DELETE",
                status="FAILURE",
                request=request,
                target_object_type="REPORT_DEFINITION",
                target_object_id=report_id,
                details={"error": "Report definition not found"}
            )
        except Exception as log_e:
            print(f"Failed to log audit event for REPORT_DEFINITION_DELETE failure (NotFound): {log_e}")
        # --- End Audit Log ---
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Report definition not found"
        ) from None
    except HTTPException as e:
        # Re-raise HTTP exceptions directly
        # --- Audit Log Failure (HTTPException) ---
        try:
            log_audit_event(
                user_identifier=owner_id,
                action_type="REPORT_DEFINITION_DELETE",
                status="FAILURE",
                request=request,
                target_object_type="REPORT_DEFINITION",
                target_object_id=report_id,
                details={"error": str(e.detail), "status_code": e.status_code}
            )
        except Exception as log_e:
            print(f"Failed to log audit event for REPORT_DEFINITION_DELETE failure (HTTPException): {log_e}")
        # --- End Audit Log ---
        raise e
    except Exception as e:
        # Catch potential errors during delete operation
        print(f"Error deleting report definition {report_id} for user {owner_id}: {e}")
        # --- Audit Log Failure (General Error) ---
        try:
            log_audit_event(
                user_identifier=owner_id,
                action_type="REPORT_DEFINITION_DELETE",
                status="FAILURE",
                request=request,
                target_object_type="REPORT_DEFINITION",
                target_object_id=report_id, # Include ID even on failure
                details={"error": str(e)}
            )
        except Exception as log_e:
            print(f"Failed to log audit event for REPORT_DEFINITION_DELETE failure (Exception): {log_e}")
        # --- End Audit Log ---
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete report definition.",
        ) from e

# @router.get("/{report_id}", ...)
# def get_report_definition(...)

# @router.put("/{report_id}", ...)
# def update_report_definition(...)

# @router.delete("/{report_id}", ...)
# def delete_report_definition(...)

# @router.post("", ...)
# def create_report_definition(...)

# @router.get("", ...)
# def list_report_definitions(...)

# @router.get("/{report_id}", ...)
# def get_report_definition(...)

# @router.put("/{report_id}", ...)
# def update_report_definition(...)

# @router.delete("/{report_id}", ...)
# def delete_report_definition(...)

