
from app.apis.utils import log_audit_event # Import audit logging function
from fastapi import APIRouter, HTTPException, Depends, Request as FastAPIRequest # Import Request
from pydantic import BaseModel, Field
from typing import List, Literal, Dict
import databutton as db
from app.auth import AuthorizedUser

router = APIRouter(prefix="/sharing", tags=["Sharing"])

STORAGE_KEY = "sharing_permissions_v1" # Use a versioned key

# Define allowed content types
ContentType = Literal["dashboard", "report", "forecast", "budget"]

# --- Pydantic Models ---

class ShareActionRequest(BaseModel):
    content_type: ContentType = Field(..., description="The type of content being shared (e.g., 'dashboard', 'report').")
    content_id: str = Field(..., description="The unique identifier of the content item.")
    user_ids: List[str] = Field(..., description="List of external user IDs (Client Viewers) to grant/revoke access for.")

class ContentPermissionsResponse(BaseModel):
    user_ids: List[str] = Field(..., description="List of user IDs who have access to the specified content.")

class UserPermissionsResponse(BaseModel):
    accessible_content: List[str] = Field(..., description="List of content references (e.g., 'dashboard:id1') accessible by the user.")

class PermissionsStorage(BaseModel):
    content_permissions: Dict[str, List[str]] = Field(default_factory=dict) # Key: "content_type:content_id", Value: [user_id]
    user_permissions: Dict[str, List[str]] = Field(default_factory=dict)    # Key: "user_id", Value: ["content_type:content_id"]

# --- Helper Functions (To be implemented) ---

def _load_permissions() -> PermissionsStorage:
    """Loads the permissions dictionary from db.storage.json."""
    try:
        permissions_dict = db.storage.json.get(STORAGE_KEY)
        # Validate and parse the loaded dict into the Pydantic model
        return PermissionsStorage(**permissions_dict)
    except FileNotFoundError:
        print(f"Permissions file {STORAGE_KEY} not found. Returning empty structure.")
        return PermissionsStorage() # Return default empty structure
    except Exception as e:
        # Catch potential Pydantic validation errors or other issues
        print(f"Error loading or parsing permissions from {STORAGE_KEY}: {e}. Returning empty structure.")
        # Depending on policy, could re-raise or log more severely
        return PermissionsStorage()


def _save_permissions(permissions: PermissionsStorage):
    """Saves the permissions dictionary to db.storage.json."""
    try:
        # Convert Pydantic model to dict before saving
        db.storage.json.put(STORAGE_KEY, permissions.dict())
        print(f"Permissions saved successfully to {STORAGE_KEY}.")
    except Exception as e:
        print(f"Error saving permissions to {STORAGE_KEY}: {e}")
        # Depending on requirements, might want to raise an exception here
        # For now, just log the error to avoid breaking the request flow entirely
        # Consider adding more robust error handling/retry logic if needed.


# --- API Endpoints (To be implemented) ---

@router.post("/grants", status_code=204)
async def grant_access(
    share_request: ShareActionRequest,
    request: FastAPIRequest, # Added for audit logging
    internal_user: AuthorizedUser # Ensures only logged-in internal users can call this
):
    """Grants access for specified external users to a piece of content."""
    granting_user_id = internal_user.sub
    content_type = share_request.content_type
    content_id = share_request.content_id
    target_user_ids = share_request.user_ids
    content_ref = f"{content_type}:{content_id}"
    print(f"User {granting_user_id} attempting to grant access for users {target_user_ids} to {content_ref}")

    try:
        permissions = _load_permissions()

        # Update content_permissions
        if content_ref not in permissions.content_permissions:
            permissions.content_permissions[content_ref] = []
        
        existing_users = set(permissions.content_permissions[content_ref])
        users_to_add = set(target_user_ids)
        updated_users = sorted(list(existing_users.union(users_to_add)))
        permissions.content_permissions[content_ref] = updated_users

        # Update user_permissions
        for user_id in users_to_add: # Only update for newly added users
            if user_id not in permissions.user_permissions:
                permissions.user_permissions[user_id] = []
            if content_ref not in permissions.user_permissions[user_id]:
                permissions.user_permissions[user_id].append(content_ref)
                permissions.user_permissions[user_id] = sorted(permissions.user_permissions[user_id])

        _save_permissions(permissions)

        print(f"Access granted successfully for {len(users_to_add)} users to {content_ref}.")
        
        # --- Audit Log Success ---
        try:
            # Log one event per user granted access for better granularity
            for target_user_id in users_to_add:
                 log_audit_event(
                    user_identifier=granting_user_id,
                    action_type="CONTENT_ACCESS_GRANT",
                    status="SUCCESS",
                    request=request,
                    target_object_type=content_type,
                    target_object_id=content_id,
                    target_user_id=target_user_id, # Log the specific user granted access
                    details={
                        "granted_to_user_id": target_user_id,
                        "content_ref": content_ref
                    }
                )
        except Exception as log_e:
            print(f"Failed to log audit event for CONTENT_ACCESS_GRANT success: {log_e}")
        # --- End Audit Log ---
            
        # No return body needed due to status_code=204
        return # Explicit return for clarity

    except Exception as e:
        print(f"Error granting access to {content_ref} by {granting_user_id}: {e}")
        # --- Audit Log Failure ---
        try:
            # Attempt to log failure, potentially multiple times if multiple users were involved
            # Or log a single summary failure event
             log_audit_event(
                user_identifier=granting_user_id,
                action_type="CONTENT_ACCESS_GRANT",
                status="FAILURE",
                request=request,
                target_object_type=content_type,
                target_object_id=content_id,
                error_message=str(e),
                status_code=500, 
                details={
                    "attempted_granted_to_user_ids": target_user_ids,
                    "content_ref": content_ref
                }
            )
        except Exception as log_e:
             print(f"Failed to log audit event for CONTENT_ACCESS_GRANT failure: {log_e}")
        # --- End Audit Log ---
        raise HTTPException(status_code=500, detail=f"Internal server error while granting access: {e}")


@router.delete("/grants", status_code=204)
async def revoke_access(
    share_request: ShareActionRequest,
    request: FastAPIRequest, # Added for audit logging
    internal_user: AuthorizedUser # Ensures only logged-in internal users can call this
):
    """Revokes access for specified external users from a piece of content."""
    revoking_user_id = internal_user.sub
    content_type = share_request.content_type
    content_id = share_request.content_id
    target_user_ids = share_request.user_ids
    content_ref = f"{content_type}:{content_id}"
    users_to_revoke = set(target_user_ids)
    print(f"User {revoking_user_id} attempting to revoke access for users {target_user_ids} from {content_ref}")

    try:
        permissions = _load_permissions()
        changes_made = False

        # Update content_permissions
        if content_ref in permissions.content_permissions:
            initial_users = set(permissions.content_permissions[content_ref])
            remaining_users = sorted(list(initial_users - users_to_revoke))
            if len(remaining_users) < len(initial_users):
                 changes_made = True
            if not remaining_users:
                del permissions.content_permissions[content_ref] # Clean up if no users left
                print(f"Removed content entry {content_ref} as no users have access.")
            else:
                permissions.content_permissions[content_ref] = remaining_users
        else:
             print(f"Content {content_ref} not found in content_permissions during revoke attempt.")
             # If content not found, access is effectively revoked, proceed without error

        # Update user_permissions
        for user_id in users_to_revoke:
            if user_id in permissions.user_permissions:
                if content_ref in permissions.user_permissions[user_id]:
                    permissions.user_permissions[user_id].remove(content_ref)
                    changes_made = True # Confirm change was made
                    if not permissions.user_permissions[user_id]: # Clean up if user has no permissions left
                        del permissions.user_permissions[user_id]
                        print(f"Removed user entry {user_id} as they have no accessible content.")
            else:
                print(f"User {user_id} not found in user_permissions during revoke attempt.")

        if changes_made:
            _save_permissions(permissions)
            print(f"Access revoked successfully for specified users from {content_ref}.")
        else:
             print(f"No changes needed during revoke access for users {target_user_ids} from {content_ref}.")

        # --- Audit Log Success (even if no changes needed, the state is correct) ---
        try:
            # Log one event per user revoked
            for target_user_id in users_to_revoke:
                log_audit_event(
                    user_identifier=revoking_user_id,
                    action_type="CONTENT_ACCESS_REVOKE",
                    status="SUCCESS",
                    request=request,
                    target_object_type=content_type,
                    target_object_id=content_id,
                    target_user_id=target_user_id, 
                    details={
                        "revoked_from_user_id": target_user_id,
                        "content_ref": content_ref,
                        "change_made_in_storage": changes_made # Indicate if a file write occurred
                    }
                )
        except Exception as log_e:
            print(f"Failed to log audit event for CONTENT_ACCESS_REVOKE success: {log_e}")
        # --- End Audit Log ---

        # No return body needed due to status_code=204
        return # Explicit return

    except Exception as e:
        print(f"Error revoking access from {content_ref} by {revoking_user_id}: {e}")
        # --- Audit Log Failure ---
        try:
            log_audit_event(
                user_identifier=revoking_user_id,
                action_type="CONTENT_ACCESS_REVOKE",
                status="FAILURE",
                request=request,
                target_object_type=content_type,
                target_object_id=content_id,
                error_message=str(e),
                status_code=500, 
                details={
                    "attempted_revoked_from_user_ids": target_user_ids,
                    "content_ref": content_ref
                }
            )
        except Exception as log_e:
            print(f"Failed to log audit event for CONTENT_ACCESS_REVOKE failure: {log_e}")
        # --- End Audit Log ---
        raise HTTPException(status_code=500, detail=f"Internal server error while revoking access: {e}")


@router.get("/content/{content_type}/{content_id}", response_model=ContentPermissionsResponse)
def get_content_permissions(
    content_type: ContentType,
    content_id: str,
    internal_user: AuthorizedUser # Protect this endpoint for internal use initially
):
    """Gets the list of user IDs who have access to a specific content item."""
    permissions = _load_permissions()
    content_ref = f"{content_type}:{content_id}"
    
    user_ids = permissions.content_permissions.get(content_ref, [])
    
    print(f"User {internal_user.sub} queried access for {content_ref}. Found users: {user_ids}")
    return ContentPermissionsResponse(user_ids=user_ids)


@router.get("/user/{user_id}", response_model=UserPermissionsResponse)
def get_user_permissions(
    user_id: str,
    internal_user: AuthorizedUser # Protect this endpoint for internal use initially
):
    """Gets the list of content items accessible by a specific external user."""
    permissions = _load_permissions()
    
    accessible_content = permissions.user_permissions.get(user_id, [])
    
    print(f"User {internal_user.sub} queried accessible content for external user {user_id}. Found: {accessible_content}")
    return UserPermissionsResponse(accessible_content=accessible_content)


