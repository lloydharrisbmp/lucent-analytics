"""API for querying Audit Logs"""
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime, timezone

from app.auth import AuthorizedUser

# Use the standard sync client for the main query
from app.apis.permission_utils import get_firestore_client

# Use the async client and role check logic from the roles API for permissions
from app.apis.roles import (
    get_firestore_db as get_roles_async_db, # Correct function name
    ROLES_COLLECTION, # Correct constant name
    RoleAssignment # Import RoleAssignment model if needed, though not strictly necessary for the check
)
from google.cloud import firestore # Import firestore for type hinting

# --- Models ---

class AuditLogEntryResponse(BaseModel):

    logId: str
    timestamp: datetime
    userId: str
    action: str
    entityType: Optional[str] = None
    entityId: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    status: str
    clientInfo: Optional[Dict[str, Any]] = None

class QueryAuditLogsResponse(BaseModel):
    logs: List[AuditLogEntryResponse]
    total_count: Optional[int] = None # Optional: Add if pagination needs total
    # Add next_page_token or similar if using cursor-based pagination

# --- API Router ---

router = APIRouter(
    prefix="/audit-logs",
    tags=["Audit Logs"],
    # dependencies=[Depends(check_admin_role)] # Add permission check later
)

# --- Permission Dependency ---
async def require_global_admin_role(
    user: AuthorizedUser,
    # Remove Depends from here, db client will be passed in
    roles_db: firestore.AsyncClient
):
    """
    Dependency to ensure the user has the 'Admin' role in at least one 'Organization'.
    This acts as a global admin check for accessing audit logs.
    """
    is_admin = False
    try:
        # Query all roles for the user in the correct collection
        roles_query = roles_db.collection(ROLES_COLLECTION).where("userId", "==", user.sub)
        async for doc in roles_query.stream():
            role_data = doc.to_dict()
            # Check if the role name is 'Admin' and the scope is 'Organization'
            if role_data.get("roleName") == "Admin" and role_data.get("scopeType") == "Organization": # Use roleName
                is_admin = True
                break # Found an Admin role, no need to check further
                
    except Exception as e:
        print(f"Error checking user roles for admin access: {e}")
        raise HTTPException(status_code=500, detail="Failed to verify user permissions")

    # If the loop completes without finding an Admin role, raise exception
    if not is_admin:
        raise HTTPException(
            status_code=403, 
            detail="User requires 'Admin' role in an Organization to access audit logs."
        )
    # No return value needed, just successfully passing the dependency check


# Add these imports at the top
from datetime import timedelta
from google.cloud.firestore_v1.async_client import AsyncClient # For type hinting
from google.cloud.firestore_v1.base_query import FieldFilter # For modern Firestore queries


# --- Purge Endpoint ---

class PurgeResponse(BaseModel):
    message: str
    deleted_count: int


@router.post("/purge", response_model=PurgeResponse)
async def purge_old_audit_logs(
    user: AuthorizedUser,
    roles_db: firestore.AsyncClient = Depends(get_roles_async_db)
):
    """
    Deletes audit log entries older than the defined retention period (180 days).
    Requires global admin role.
    """
    # Correctly placed inside the function
    await require_global_admin_role(user=user, roles_db=roles_db)

    # Use the already injected async client for the purge logic
    db: AsyncClient = roles_db

    retention_days = 180
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=retention_days)
    deleted_count = 0
    batch_size = 200 # Firestore recommended batch size for deletes

    print(f"[AUDIT PURGE] Starting purge for logs older than {cutoff_date.isoformat()}")

    try:
        # Query for old logs using FieldFilter
        # Note: Firestore requires an index for this query: (timestamp ASC) or (timestamp DESC)
        # Ensure this index exists in your Firestore console.
        query = db.collection("audit_logs").where(filter=FieldFilter("timestamp", "<", cutoff_date)).limit(batch_size)

        while True:
            # Execute the query to get a batch of documents
            docs_snapshot = await query.get()
            batch_docs_list = [doc for doc in docs_snapshot]

            if not batch_docs_list:
                print("[AUDIT PURGE] No more old logs found to delete.")
                break # No more documents to delete

            print(f"[AUDIT PURGE] Found {len(batch_docs_list)} logs to delete in this batch.")

            # Create a batch delete operation
            batch = db.batch()
            for doc in batch_docs_list:
                batch.delete(doc.reference)

            # Commit the batch
            await batch.commit() # Use await for async batch commit
            deleted_count += len(batch_docs_list)
            print(f"[AUDIT PURGE] Deleted batch. Total deleted so far: {deleted_count}")

            # Firestore's limit applies per query, so we repeat the query to get the next batch
            # If the number of docs is less than batch_size, it means we processed the last batch
            if len(batch_docs_list) < batch_size:
                print("[AUDIT PURGE] Processed the last batch.")
                break

    except Exception as e:
        print(f"[AUDIT PURGE] Error during purge operation: {e}")
        # Use raise from e for better traceback in logs
        raise HTTPException(status_code=500, detail=f"Audit log purge failed: {e}") from e

    final_message = f"Audit log purge completed. Deleted {deleted_count} entries older than {retention_days} days."
    print(f"[AUDIT PURGE] {final_message}")
    return PurgeResponse(message=final_message, deleted_count=deleted_count)

# --- Endpoint ---

@router.get("/", response_model=QueryAuditLogsResponse)
async def query_audit_logs(
    user: AuthorizedUser,
    roles_db_for_check: firestore.AsyncClient = Depends(get_roles_async_db),
    # Move Query defaults inside the function or use Annotated for newer FastAPI versions
    start_date_query: Optional[datetime] = Query(None, description="Start timestamp (ISO 8601 format)", alias="startDate"),
    end_date_query: Optional[datetime] = Query(None, description="End timestamp (ISO 8601 format)", alias="endDate"),
    user_id_query: Optional[str] = Query(None, description="Filter by user ID (Firebase UID)", alias="userId"),
    action_query: Optional[str] = Query(None, description="Filter by action identifier"),
    entity_type_query: Optional[str] = Query(None, description="Filter by entity type", alias="entityType"),
    entity_id_query: Optional[str] = Query(None, description="Filter by entity ID", alias="entityId"),
    limit_query: int = Query(100, ge=1, le=1000, description="Maximum number of logs to return"),
    offset_query: int = Query(0, ge=0, description="Number of logs to skip (for pagination)"),
    # Use the standard sync client from permission_utils for the query
    db: firestore.Client = Depends(get_firestore_client) # Sync client for query
):
    """Query audit log entries with filters and pagination."""
    # Correctly placed inside the function
    await require_global_admin_role(user=user, roles_db=roles_db_for_check)

    # Assign query params to local variables
    start_date = start_date_query
    end_date = end_date_query
    user_id = user_id_query
    action = action_query
    entity_type = entity_type_query
    entity_id = entity_id_query
    limit = limit_query
    offset = offset_query

    # Ensure dates are timezone-aware (UTC) if provided
    if start_date and start_date.tzinfo is None:
        start_date = start_date.replace(tzinfo=timezone.utc)
    if end_date and end_date.tzinfo is None:
        end_date = end_date.replace(tzinfo=timezone.utc)

    # Use the sync client 'db' for the actual query
    query = db.collection("audit_logs")

    # Apply filters
    if start_date:
        query = query.where("timestamp", ">=", start_date)
    if end_date:
        query = query.where("timestamp", "<=", end_date)
    if user_id:
        query = query.where("userId", "==", user_id)
    if action:
        query = query.where("action", "==", action)
    if entity_type:
        query = query.where("entityType", "==", entity_type)
    if entity_id:
        query = query.where("entityId", "==", entity_id)

    # Apply ordering and pagination
    query = query.order_by("timestamp", direction="DESCENDING").order_by("logId", direction="DESCENDING")
    query = query.limit(limit).offset(offset)

    logs_data = []
    try:
        # Note: Using sync client's stream() which is synchronous
        for doc in query.stream():
            log_data = doc.to_dict()
            # Firestore Timestamps are already datetime objects, ensure timezone
            ts = log_data.get('timestamp')
            if isinstance(ts, datetime):
                if ts.tzinfo is None:
                    # Assume UTC if timezone is missing (shouldn't happen with current log_audit_event)
                    log_data['timestamp'] = ts.replace(tzinfo=timezone.utc)
            else:
                # Handle potential non-datetime values if data consistency is unsure
                print(f"Warning: Non-datetime timestamp found in audit log {doc.id}: {ts}")
                continue

            # Ensure details is a dict or None
            if 'details' in log_data and not isinstance(log_data['details'], dict):
                log_data['details'] = None # Or handle appropriately

            # Ensure clientInfo is a dict or None
            if 'clientInfo' in log_data and not isinstance(log_data['clientInfo'], dict):
                log_data['clientInfo'] = None

            try:
                logs_data.append(AuditLogEntryResponse(**log_data))
            except Exception as pydantic_error:
                 print(f"Error parsing audit log entry {doc.id}: {pydantic_error}, Data: {log_data}")
                 # Optionally skip this entry or handle error differently
    except Exception as e:
        print(f"Error querying Firestore audit logs: {e}")
        # Use raise from e for better traceback
        raise HTTPException(status_code=500, detail="Failed to query audit logs") from e

    # TODO: Implement total count if needed (requires a separate query)

    return QueryAuditLogsResponse(logs=logs_data)

