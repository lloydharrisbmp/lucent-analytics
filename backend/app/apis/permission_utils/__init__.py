"""Permission Checking Utilities and Dependencies

Located here as shared backend utilities outside specific API endpoints.
"""
import os
from google.cloud.firestore import AsyncClient # Correct async client import
from google.oauth2 import service_account
import json
from functools import wraps
from typing import Annotated, List # Use Annotated for newer FastAPI versions

import databutton as db
from fastapi import Depends, HTTPException, status
from app.auth import AuthorizedUser



# --- Firestore Client Initialization ---

_db_async_client = None # Rename for clarity

async def get_firestore_client() -> AsyncClient: # Return direct AsyncClient type
    """
    Initializes and returns a Firestore client.
    Uses service account credentials stored in Databutton secrets 'FIREBASE_SERVICE_ACCOUNT_JSON'.
    """
    global _db_async_client
    if _db_async_client is None:
        try:
            service_account_json_str = db.secrets.get("FIREBASE_SERVICE_ACCOUNT_JSON")
            if not service_account_json_str:
                print("ERROR: FIREBASE_SERVICE_ACCOUNT_JSON secret is missing.")
                raise ValueError("Firebase service account secret not found in Databutton secrets.")

            service_account_info = json.loads(service_account_json_str)
            credentials = service_account.Credentials.from_service_account_info(service_account_info)
            _db_async_client = AsyncClient(credentials=credentials) # Initialize AsyncClient directly
            print("Firestore client initialized successfully.")

        except json.JSONDecodeError:
            print("ERROR: Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON. Check secret format.")
            raise
        except ValueError as ve:
            print(f"ERROR: Configuration Error: {ve}")
            raise
        except Exception as e:
            print(f"ERROR: Failed to initialize Firestore client: {e}")
            raise
    return _db_async_client

# --- Permission Fetching ---

async def get_user_permissions(user_id: str) -> List[str]: # Make async
    """
    Fetches permissions list for a user_id from Firestore 'users' collection.
    Returns empty list if user/permissions not found or on error.
    """
    if not user_id:
        print("Error getting permissions: user_id is empty.")
        return []
    try:
        client = await get_firestore_client() # Await async client
        user_doc_ref = client.collection("users").document(user_id)
        user_doc = await user_doc_ref.get() # Await async get

        if user_doc.exists:
            user_data = user_doc.to_dict()
            permissions = user_data.get("permissions", [])
            if isinstance(permissions, list):
                valid_permissions = [str(p) for p in permissions if isinstance(p, str)]
                if len(valid_permissions) != len(permissions):
                     print(f"Warning: Non-string items in permissions for user {user_id}. Filtered.")
                return valid_permissions
            else:
                print(f"Warning: 'permissions' field for user {user_id} is not a list.")
                return []
        else:
            # User not found in Firestore 'users' collection, implies no permissions
            return []
    except Exception as e:
        print(f"ERROR fetching permissions for user {user_id}: {e}")
        return [] # Deny permissions on error

# --- Permission Checking Dependency ---

def require_permission(required_permission: str):
    """
    FastAPI dependency factory that checks if the authenticated user has the required permission.
    
    Usage:
        @router.post("/some_endpoint", dependencies=[Depends(require_permission("permission:name"))])
        async def some_endpoint(...):
            ...
    """
    async def _permission_checker(
        # The Databutton framework should inject the correct AuthorizedUser object here
        user: AuthorizedUser 
    ):
        if not hasattr(user, 'sub') or not user.sub:
             # This case should ideally be caught by API protection itself
             print("Permission check failed: User object invalid or user.sub missing.")
             raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated or invalid user object",
            )
            
        user_id = user.sub
        user_permissions = await get_user_permissions(user_id) # Await async call

        if required_permission not in user_permissions:
            print(f"Permission denied for user {user_id}. Missing: '{required_permission}'. Has: {user_permissions}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Requires: {required_permission}",
            )
        # If check passes, dependency does nothing further
        
    return _permission_checker



