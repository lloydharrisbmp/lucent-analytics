# src/app/apis/utils/__init__.py

import databutton as db
import datetime
import pytz
from typing import Optional, Dict, Any
from fastapi import APIRouter, Request # Import Request to potentially get IP

# Although this is a utility module, we need a router for it to be loaded.
# It won't necessarily have endpoints unless needed later.
router = APIRouter()

AUDIT_LOG_KEY = "audit_log.json"
DEFAULT_TIMEZONE = pytz.utc # Use UTC for consistency

def log_audit_event(
    user_identifier: str, # Can be user ID or email
    action_type: str,
    status: str, # e.g., 'SUCCESS', 'FAILURE'
    request: Optional[Request] = None, # Pass the request object to get IP
    target_object_type: Optional[str] = None,
    target_object_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
):
    """Logs an audit event to db.storage.json.

    Args:
        user_identifier: The ID or email of the user performing the action.
        action_type: A string code representing the action (e.g., 'USER_LOGIN', 'REPORT_DELETE').
        status: The outcome of the action ('SUCCESS', 'FAILURE').
        request: The FastAPI Request object (optional) to extract client IP.
        target_object_type: The type of object being acted upon (e.g., 'REPORT', 'USER').
        target_object_id: The specific ID of the object being acted upon.
        details: A dictionary containing additional context or parameters related to the event.
    """
    try:
        timestamp = datetime.datetime.now(DEFAULT_TIMEZONE).isoformat()
        ip_address = request.client.host if request and request.client else None

        log_entry = {
            "timestamp": timestamp,
            "user_identifier": user_identifier,
            "action_type": action_type,
            "status": status,
            "ip_address": ip_address,
            "target_object_type": target_object_type,
            "target_object_id": target_object_id,
            "details": details or {},
        }

        # Fetch existing logs safely
        try:
            audit_logs = db.storage.json.get(AUDIT_LOG_KEY, default=[])
            if not isinstance(audit_logs, list):
                print(f"[WARN] Audit log at '{AUDIT_LOG_KEY}' was not a list. Reinitializing.")
                audit_logs = []
        except Exception as e:
             print(f"[ERROR] Failed to get audit log '{AUDIT_LOG_KEY}': {e}. Reinitializing.")
             audit_logs = [] # Avoid appending to corrupt data

        # Append new log
        audit_logs.append(log_entry)

        # Save updated logs
        db.storage.json.put(AUDIT_LOG_KEY, audit_logs)

        print(f"[AUDIT] Logged action: {action_type} by {user_identifier} - Status: {status}")

    except Exception as e:
        # Avoid crashing the main operation due to logging failure
        print(f"[ERROR] Failed to log audit event: {e}")
