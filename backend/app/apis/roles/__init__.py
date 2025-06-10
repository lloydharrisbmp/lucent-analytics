# Corrected full content for src/app/apis/roles/__init__.py
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field
from typing import List, Literal, Optional
import databutton as db
from app.auth import AuthorizedUser # Import AuthorizedUser
from google.cloud import firestore
import google.auth.credentials
import json # Re-add json import
from datetime import datetime, timezone

# --- Firestore Async Client Initialization ---
try:
    # Attempt to get credentials from secrets
    service_account_info = json.loads(db.secrets.get("FIREBASE_SERVICE_ACCOUNT_JSON"))
    credentials = google.oauth2.service_account.Credentials.from_service_account_info(service_account_info)
    firestore_client = firestore.AsyncClient(credentials=credentials) # Use AsyncClient
    print("Firestore async client initialized successfully using service account.")
except Exception as e:
    print(f"Failed to initialize Firestore async client using service account: {e}. Falling back to default credentials.")
    try:
        # Fallback to default credentials (useful in some environments)
        firestore_client = firestore.AsyncClient() # Use AsyncClient
        print("Firestore async client initialized successfully using default credentials.")
    except Exception as e_default:
        print(f"Failed to initialize Firestore async client using default credentials: {e_default}")
        firestore_client = None # Indicate failure

# Helper to check Firestore async client
def get_firestore_db() -> firestore.AsyncClient: # Return AsyncClient
    if firestore_client is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Firestore async client is not initialized. Check service account configuration.", # Updated detail
        )
    return firestore_client

# --- Helper Function for Authorization Check ---
async def _check_user_role(
    db_client: firestore.AsyncClient, # Expect AsyncClient
    user_id: str,
    required_role: Literal["Admin", "Advisor", "Viewer"],
    scope_type: Literal["Organization", "Entity"],
    scope_id: str
) -> bool:
    """Checks if a user has a specific role within a given scope."""
    try:
        query = db_client.collection(ROLES_COLLECTION) \
                        .where("userId", "==", user_id) \
                        .where("roleName", "==", required_role) \
                        .where("scopeType", "==", scope_type) \
                        .where("scopeId", "==", scope_id) \
                        .limit(1) # We only need to know if at least one exists

        docs = query.stream()
        async for doc in docs: # Check if any document matches
            return True # Role found
        return False # No matching role found
    except Exception as e:
        print(f"Error checking user role: {e}")
        # In case of error, deny access by default
        return False


# --- Constants ---
ROLES_COLLECTION = "roleAssignments"
STANDARD_ROLES = Literal["Admin", "Advisor", "Viewer", "Client Portal User"] # Added Client Portal User
SCOPE_TYPES = Literal["Organization", "Entity"]

# --- Pydantic Models ---
class RoleAssignmentBase(BaseModel):
    userId: str = Field(..., description="The ID of the user being assigned the role.")
    roleName: STANDARD_ROLES = Field(..., description="The name of the role being assigned.")
    scopeType: SCOPE_TYPES = Field(..., description="The type of scope (Organization or Entity).")
    scopeId: str = Field(..., description="The ID of the Organization or Entity.")

class RoleAssignmentCreate(RoleAssignmentBase):
    pass # No additional fields for creation yet

class RoleAssignment(RoleAssignmentBase):
    id: str = Field(..., description="The unique ID of the role assignment document.")
    assignedAt: str = Field(..., description="ISO timestamp of when the role was assigned.")

class RevokeRoleRequest(BaseModel):
    assignmentId: Optional[str] = Field(None, description="The ID of the specific assignment document to revoke.")
    userId: Optional[str] = Field(None, description="User ID for revocation (used with roleName, scopeType, scopeId if assignmentId is not provided).")
    roleName: Optional[STANDARD_ROLES] = Field(None, description="Role name for revocation.")
    scopeType: Optional[SCOPE_TYPES] = Field(None, description="Scope type for revocation.")
    scopeId: Optional[str] = Field(None, description="Scope ID for revocation.")

# --- API Router ---
router = APIRouter(prefix="/roles", tags=["Roles & Permissions"])

# --- Endpoints ---

@router.post("/assign", response_model=RoleAssignment, status_code=status.HTTP_201_CREATED)
async def assign_role( # Make async
    assignment_data: RoleAssignmentCreate,
    current_user: AuthorizedUser,
    db_client: firestore.AsyncClient = Depends(get_firestore_db) # Expect AsyncClient
):
    """Assigns a specific role to a user within a given scope (Organization or Entity)."""
    # TODO: Check if assignment already exists to prevent duplicates?
    # TODO: Validate user ID, scope ID exist?

    # Authorization Check: Only Admins of the target scope can assign roles
    is_authorized = await _check_user_role(
        db_client=db_client,
        user_id=current_user.sub,
        required_role="Admin",
        scope_type=assignment_data.scopeType,
        scope_id=assignment_data.scopeId
    )
    if not is_authorized:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User does not have permission to assign roles in this scope."
        )

    collection_ref = db_client.collection(ROLES_COLLECTION)

    # Optional: Check if the exact assignment already exists
    # query = collection_ref.where("userId", "==", assignment_data.userId) \
    #                       .where("roleName", "==", assignment_data.roleName) \
    #                       .where("scopeType", "==", assignment_data.scopeType) \
    #                       .where("scopeId", "==", assignment_data.scopeId)
    # existing_assignments = []
    # async for doc in query.stream(): # Use async for
    #    existing_assignments.append(doc)
    # if existing_assignments:
    #     raise HTTPException(
    #         status_code=status.HTTP_409_CONFLICT,
    #         detail="This role assignment already exists.",
    #     )

    # Prepare data for Firestore
    assignment_dict = assignment_data.model_dump()
    assignment_dict["assignedAt"] = datetime.now(timezone.utc).isoformat()

    try:
        # Add the new assignment document
        update_time, doc_ref = await collection_ref.add(assignment_dict) # Use await

        # Prepare the response model
        created_assignment = RoleAssignment(
            id=doc_ref.id,
            **assignment_dict
        )
        return created_assignment
    except Exception as e:
        print(f"Error assigning role in Firestore: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to assign role: {e}",
        ) from e # Add from e for better tracebacks

@router.delete("/revoke", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_role( # Make async
    revoke_request: RevokeRoleRequest,
    current_user: AuthorizedUser,
    db_client: firestore.AsyncClient = Depends(get_firestore_db) # Expect AsyncClient
):
    """Revokes a specific role assignment for a user."""
    # Find assignment(s) and determine scope for authorization check
    collection_ref = db_client.collection(ROLES_COLLECTION)
    docs_to_delete_refs = []
    target_scope_type = None
    target_scope_id = None

    if revoke_request.assignmentId:
        # Case 1: Revoke by specific assignment ID
        doc_ref = collection_ref.document(revoke_request.assignmentId)
        assignment_doc = await doc_ref.get() # Use await for async client
        if assignment_doc.exists:
            assignment_data = assignment_doc.to_dict()
            target_scope_type = assignment_data.get("scopeType")
            target_scope_id = assignment_data.get("scopeId")
            docs_to_delete_refs.append(doc_ref)
        else:
            # Assignment not found, proceed idempotently
            print(f"Assignment ID {revoke_request.assignmentId} not found, nothing to revoke.")

    elif revoke_request.userId and revoke_request.roleName and revoke_request.scopeType and revoke_request.scopeId:
        # Case 2: Revoke by combination - scope is known from request
        target_scope_type = revoke_request.scopeType
        target_scope_id = revoke_request.scopeId
        query = collection_ref.where("userId", "==", revoke_request.userId) \
                              .where("roleName", "==", revoke_request.roleName) \
                              .where("scopeType", "==", revoke_request.scopeType) \
                              .where("scopeId", "==", revoke_request.scopeId)

        existing_assignments = query.stream() # stream() is async iterable with AsyncClient
        async for doc in existing_assignments: # Use async for
            docs_to_delete_refs.append(doc.reference)

        if not docs_to_delete_refs:
             print(f"No matching assignments found for user {revoke_request.userId}, role {revoke_request.roleName}, scope {revoke_request.scopeType}/{revoke_request.scopeId}. Nothing to revoke.")

    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either assignmentId or the combination of userId, roleName, scopeType, and scopeId must be provided."
        )

    # Authorization Check: Only Admins of the target scope can revoke roles
    if not target_scope_type or not target_scope_id:
        # If scope couldn't be determined (e.g., assignmentId didn't exist), cannot authorize
        # This path is hit only if revoking by a non-existent assignmentId and we proceed idempotently
        if revoke_request.assignmentId and not docs_to_delete_refs:
             pass # Allow idempotency, deletion logic will handle empty list
        else:
             # Should not happen if request validation works, but as a safeguard:
             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Could not determine scope for authorization.")
    else:
        # Perform the authorization check only if a scope was determined
        is_authorized = await _check_user_role(
            db_client=db_client,
            user_id=current_user.sub,
            required_role="Admin",
            scope_type=target_scope_type,
            scope_id=target_scope_id
        )
        if not is_authorized:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User does not have permission to revoke roles in this scope."
            )

    # Perform deletions in a batch for efficiency
    if docs_to_delete_refs:
        batch = db_client.batch()
        deleted_count = 0
        for doc_ref in docs_to_delete_refs:
            batch.delete(doc_ref)
            deleted_count += 1

        try:
            await batch.commit() # Use await for async client
            print(f"Successfully revoked {deleted_count} role assignment(s).")
        except Exception as e:
            print(f"Error revoking role assignment(s) in Firestore batch: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to revoke role assignment(s): {e}",
            ) from e # Add from e
    # No return needed for 204 No Content status


@router.get("/user/{user_id}", response_model=List[RoleAssignment])
async def list_user_roles( # Make async
    user_id: str,
    current_user: AuthorizedUser,
    organization_id: Optional[str] = None,
    entity_id: Optional[str] = None,
    db_client: firestore.AsyncClient = Depends(get_firestore_db) # Expect AsyncClient
):
    """Lists all roles assigned to a specific user, optionally filtered by organization or entity.
    
    Authorization Rules:
    - A user can always list their own roles (user_id == current_user.sub).
    - An Admin of the specified organization/entity scope can list roles for the target user within that scope.
    """
    is_self = current_user.sub == user_id
    can_view_others_in_scope = False

    # Check if admin in the specified scope (if a scope filter is applied)
    if organization_id:
        can_view_others_in_scope = await _check_user_role(
            db_client, current_user.sub, "Admin", "Organization", organization_id
        )
    elif entity_id:
        can_view_others_in_scope = await _check_user_role(
            db_client, current_user.sub, "Admin", "Entity", entity_id
        )

    # Allow access if user is viewing self OR is an Admin viewing within a specified scope
    if not (is_self or (can_view_others_in_scope and (organization_id or entity_id))):
         # If viewing others without scope filter OR viewing others in a scope where not admin
         # Deny unless they are viewing themselves (which is covered by is_self)
         if not is_self:
             raise HTTPException(
                 status_code=status.HTTP_403_FORBIDDEN, 
                 detail="Permission denied. Admins can only view other users' roles within a specific organization or entity scope."
             )
         # If is_self is true, they can proceed regardless of scope filters

    try:
        collection_ref = db_client.collection(ROLES_COLLECTION)
        query = collection_ref.where("userId", "==", user_id)

        # Apply optional scope filters
        if organization_id:
            query = query.where("scopeType", "==", "Organization").where("scopeId", "==", organization_id)
        elif entity_id:
            query = query.where("scopeType", "==", "Entity").where("scopeId", "==", entity_id)

        results = []
        async for doc in query.stream(): # Use async for with AsyncClient
            assignment_data = doc.to_dict()
            assignment_data["id"] = doc.id # Add the document ID
            # Validate data against Pydantic model before appending
            try:
                results.append(RoleAssignment(**assignment_data))
            except Exception as validation_error:
                 print(f"Skipping invalid role assignment data for doc {doc.id}: {validation_error}")
                 print(f"Data: {assignment_data}")

        return results

    except Exception as e:
        print(f"Error listing user roles from Firestore: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list user roles: {e}",
        ) from e # Add from e


@router.get("/scope/{scope_type}/{scope_id}", response_model=List[RoleAssignment])
async def list_scope_roles( # Make async
    scope_type: SCOPE_TYPES,
    scope_id: str,
    current_user: AuthorizedUser,
    db_client: firestore.AsyncClient = Depends(get_firestore_db) # Expect AsyncClient
):
    """Lists all role assignments within a specific scope (Organization or Entity).
    
    Authorization Rules:
    - An Admin or Advisor within the specified scope can list all roles in that scope.
    """
    is_admin_in_scope = await _check_user_role(
        db_client, current_user.sub, "Admin", scope_type, scope_id
    )
    is_advisor_in_scope = await _check_user_role(
        db_client, current_user.sub, "Advisor", scope_type, scope_id
    )

    if not (is_admin_in_scope or is_advisor_in_scope):
       raise HTTPException(
           status_code=status.HTTP_403_FORBIDDEN, 
           detail="Permission denied. Only Admins or Advisors of this scope can list its roles."
        )

    try:
        collection_ref = db_client.collection(ROLES_COLLECTION)
        query = collection_ref.where("scopeType", "==", scope_type) \
                              .where("scopeId", "==", scope_id)

        results = []
        async for doc in query.stream(): # Use async for with AsyncClient
            assignment_data = doc.to_dict()
            assignment_data["id"] = doc.id # Add the document ID
            # Validate data against Pydantic model before appending
            try:
                results.append(RoleAssignment(**assignment_data))
            except Exception as validation_error:
                 print(f"Skipping invalid role assignment data for doc {doc.id}: {validation_error}")
                 print(f"Data: {assignment_data}")

        return results

    except Exception as e:
        print(f"Error listing scope roles from Firestore: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list scope roles: {e}",
        ) from e # Add from e


# --- Add other role/permission related endpoints as needed ---
