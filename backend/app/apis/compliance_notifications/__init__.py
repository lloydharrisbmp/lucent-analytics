from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any, Union
from datetime import datetime, timedelta
import databutton as db
import uuid
import json

router = APIRouter(prefix="/notifications")

class NotificationCreate(BaseModel):
    userId: str
    entityId: Optional[str] = None
    type: str = Field(..., description="Type of notification: deadline, compliance, anomaly, etc.")
    severity: str = Field(..., description="Severity level: info, warning, error")
    title: str
    message: str
    actionRequired: bool = False
    actionLink: Optional[str] = None
    expiresAt: Optional[datetime] = None
    data: Optional[Dict[str, Any]] = None

class Notification(NotificationCreate):
    id: str
    createdAt: datetime
    readAt: Optional[datetime] = None
    dismissedAt: Optional[datetime] = None

class NotificationUpdate(BaseModel):
    readAt: Optional[datetime] = None
    dismissedAt: Optional[datetime] = None

class NotificationResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    data: Optional[Any] = None

# Storage keys
NOTIFICATIONS_KEY = "notifications"

# Helper functions for storage
def sanitize_storage_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    import re
    return re.sub(r'[^a-zA-Z0-9._-]', '', key)

def store_notifications(notifications: List[Dict]) -> None:
    """Store notifications in storage"""
    db.storage.json.put(sanitize_storage_key(NOTIFICATIONS_KEY), notifications)

def get_notifications() -> List[Dict]:
    """Get notifications from storage"""
    try:
        return db.storage.json.get(NOTIFICATIONS_KEY, default=[])
    except:
        return []

# Get all notifications, with filtering options
@router.get("/list")
def list_notifications(
    user_id: str,
    entity_id: Optional[str] = None,
    type: Optional[str] = None,
    severity: Optional[str] = None,
    unread_only: bool = False,
    active_only: bool = True,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
) -> Dict:
    all_notifications = get_notifications()
    
    # Filter notifications
    filtered = []
    for notif in all_notifications:
        # Filter by user ID (required)
        if notif.get("userId") != user_id:
            continue
            
        # Apply optional filters
        if entity_id and notif.get("entityId") != entity_id:
            continue
            
        if type and notif.get("type") != type:
            continue
            
        if severity and notif.get("severity") != severity:
            continue
            
        if unread_only and notif.get("readAt"):
            continue
            
        if active_only:
            # Skip dismissed notifications
            if notif.get("dismissedAt"):
                continue
                
            # Skip expired notifications
            expires_at = notif.get("expiresAt")
            if expires_at and datetime.fromisoformat(expires_at.replace("Z", "+00:00")) < datetime.now():
                continue
        
        filtered.append(notif)
    
    # Sort by creation date (newest first)
    filtered.sort(key=lambda x: x.get("createdAt", ""), reverse=True)
    
    # Apply pagination
    paginated = filtered[offset:offset + limit]
    
    return {
        "total": len(filtered),
        "notifications": paginated,
        "unreadCount": sum(1 for n in filtered if not n.get("readAt"))
    }

# Create a new notification
# Internal function to create and store a notification
def _create_and_store_notification(notification: NotificationCreate) -> Dict:
    """Creates a notification object, adds it to storage, and returns it."""
    all_notifications = get_notifications()
    
    # Create new notification object
    new_notification = notification.dict()
    new_notification["id"] = str(uuid.uuid4())
    new_notification["createdAt"] = datetime.now().isoformat()
    # Ensure optional fields that aren't set are None or handled appropriately
    # (Pydantic v1 models handle this by default when converting dict -> model)
    
    # Add to storage
    all_notifications.append(new_notification)
    store_notifications(all_notifications)
    
    return new_notification # Return the full notification dict

# Create a new notification (API Endpoint)
@router.post("/create")
def create_notification(notification: NotificationCreate) -> NotificationResponse:
    """API endpoint to create a new notification."""
    try:
        created_notification = _create_and_store_notification(notification)
        return NotificationResponse(
            success=True,
            message="Notification created successfully",
            data={"id": created_notification["id"]} # Return only the ID in the response
        )
    except Exception as e:
        print(f"Error creating notification via API: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create notification: {e}")

# Mark notification as read
@router.post("/{notification_id}/read")
def mark_notification_read(notification_id: str) -> NotificationResponse:
    all_notifications = get_notifications()
    
    updated = False
    for notif in all_notifications:
        if notif.get("id") == notification_id and not notif.get("readAt"):
            notif["readAt"] = datetime.now().isoformat()
            updated = True
            break
    
    if updated:
        store_notifications(all_notifications)
        return NotificationResponse(success=True, message="Notification marked as read")
    else:
        return NotificationResponse(success=False, message="Notification not found or already read")

# Mark notification as dismissed
@router.post("/{notification_id}/dismiss")
def dismiss_notification(notification_id: str) -> NotificationResponse:
    all_notifications = get_notifications()
    
    updated = False
    for notif in all_notifications:
        if notif.get("id") == notification_id and not notif.get("dismissedAt"):
            notif["dismissedAt"] = datetime.now().isoformat()
            # Also mark as read if not already
            if not notif.get("readAt"):
                notif["readAt"] = datetime.now().isoformat()
            updated = True
            break
    
    if updated:
        store_notifications(all_notifications)
        return NotificationResponse(success=True, message="Notification dismissed")
    else:
        return NotificationResponse(success=False, message="Notification not found or already dismissed")

# Bulk update notifications
@router.post("/bulk-update")
def bulk_update_notifications(
    action: str = Query(..., description="Action to perform: mark_read, dismiss"),
    user_id: str = Query(...),
    notification_ids: Optional[List[str]] = None,
    entity_id: Optional[str] = None,
    type: Optional[str] = None
) -> NotificationResponse:
    all_notifications = get_notifications()
    
    update_count = 0
    now_iso = datetime.now().isoformat()
    
    for notif in all_notifications:
        # Skip if not for this user
        if notif.get("userId") != user_id:
            continue
            
        # Apply filters if specified
        if notification_ids and notif.get("id") not in notification_ids:
            continue
            
        if entity_id and notif.get("entityId") != entity_id:
            continue
            
        if type and notif.get("type") != type:
            continue
        
        # Apply action
        if action == "mark_read" and not notif.get("readAt"):
            notif["readAt"] = now_iso
            update_count += 1
        elif action == "dismiss" and not notif.get("dismissedAt"):
            notif["dismissedAt"] = now_iso
            # Also mark as read if not already
            if not notif.get("readAt"):
                notif["readAt"] = now_iso
            update_count += 1
    
    if update_count > 0:
        store_notifications(all_notifications)
        return NotificationResponse(
            success=True, 
            message=f"{update_count} notifications updated",
            data={"count": update_count}
        )
    else:
        return NotificationResponse(
            success=True, 
            message="No notifications were updated",
            data={"count": 0}
        )

# Generate deadline notifications
@router.post("/generate-deadline-alerts")
def generate_deadline_alerts(user_id: str, entity_id: Optional[str] = None) -> NotificationResponse:
    """
    Automatically generate notifications for upcoming tax deadlines
    This would normally be triggered by a scheduled job
    """
    from app.apis.tax_obligations import get_tax_obligations
    
    # Get all obligations
    try:
        # In a real implementation, get obligations from the database
        # For demo purposes, we'll use the tax_obligations API
        # or mock data if that fails
        obligations = get_tax_obligations(entity_id) if entity_id else []
    except Exception as e:
        # Use some sample data for testing if the API call fails
        print(f"Error fetching tax obligations: {e}")
        # Sample mock data
        now = datetime.now()
        obligations = [
            {
                "id": "obl-1",
                "entityId": entity_id or "entity-1",
                "obligationType": "bas",
                "dueDate": (now + timedelta(days=7)).isoformat(),
                "status": "upcoming",
                "description": "Q1 BAS Statement",
            },
            {
                "id": "obl-2",
                "entityId": entity_id or "entity-1",
                "obligationType": "income",
                "dueDate": (now - timedelta(days=2)).isoformat(),
                "status": "overdue",
                "description": "Annual Income Tax Return",
            },
        ]
    
    # Current notifications
    all_notifications = get_notifications()
    
    # Track new notifications
    new_notifications = []
    now = datetime.now()
    
    # Helper to check if notification already exists
    def notification_exists(obligation_id: str, notif_type: str) -> bool:
        for notif in all_notifications:
            # Check for existing non-dismissed notification of same type
            if (
                notif.get("userId") == user_id and
                notif.get("type") == notif_type and
                notif.get("data", {}).get("obligationId") == obligation_id and
                not notif.get("dismissedAt")
            ):
                return True
        return False
    
    # Process each obligation
    for obligation in obligations:
        obligation_id = obligation.get("id")
        due_date_str = obligation.get("dueDate")
        if not due_date_str:
            continue
        
        # Convert to datetime
        due_date = datetime.fromisoformat(due_date_str.replace("Z", "+00:00")) if isinstance(due_date_str, str) else due_date_str
        
        # Skip if already lodged or paid
        if obligation.get("status") in ["lodged", "paid"]:
            continue
            
        # 1. Overdue notifications
        if due_date < now and not notification_exists(obligation_id, "overdue_deadline"):
            days_overdue = (now - due_date).days
            new_notifications.append({
                "userId": user_id,
                "entityId": obligation.get("entityId"),
                "type": "overdue_deadline",
                "severity": "error",
                "title": "Tax Obligation Overdue",
                "message": f"{obligation.get('description', 'Tax obligation')} is overdue by {days_overdue} days",
                "actionRequired": True,
                "actionLink": f"/tax-compliance?obligationId={obligation_id}",
                "data": {
                    "obligationId": obligation_id,
                    "obligationType": obligation.get("obligationType"),
                    "daysOverdue": days_overdue,
                    "dueDate": due_date_str
                }
            })
            
        # 2. Due soon notifications (7 days, 3 days, 1 day)
        days_until_due = (due_date - now).days
        if 0 < days_until_due <= 7:
            # Determine notification type based on urgency
            if days_until_due <= 1:
                notif_type = "due_tomorrow"
                message = f"{obligation.get('description', 'Tax obligation')} is due tomorrow!"
            elif days_until_due <= 3:
                notif_type = "due_soon_3days"
                message = f"{obligation.get('description', 'Tax obligation')} is due in {days_until_due} days"
            else:
                notif_type = "due_soon_week"
                message = f"{obligation.get('description', 'Tax obligation')} is due in {days_until_due} days"
                
            # Skip if notification of this type already exists
            if not notification_exists(obligation_id, notif_type):
                new_notifications.append({
                    "userId": user_id,
                    "entityId": obligation.get("entityId"),
                    "type": notif_type,
                    "severity": "warning" if days_until_due <= 3 else "info",
                    "title": "Upcoming Tax Deadline",
                    "message": message,
                    "actionRequired": True,
                    "actionLink": f"/tax-compliance?obligationId={obligation_id}",
                    "data": {
                        "obligationId": obligation_id,
                        "obligationType": obligation.get("obligationType"),
                        "daysUntilDue": days_until_due,
                        "dueDate": due_date_str
                    }
                })
                
    # Add all new notifications
    for notif in new_notifications:
        notif["id"] = str(uuid.uuid4())
        notif["createdAt"] = datetime.now().isoformat()
        all_notifications.append(notif)
        
    # Save updated notifications
    if new_notifications:
        store_notifications(all_notifications)
        
    return NotificationResponse(
        success=True,
        message=f"Generated {len(new_notifications)} deadline alerts",
        data={"count": len(new_notifications)}
    )

# Generate compliance issue notifications
@router.post("/generate-compliance-alerts")
def generate_compliance_alerts(
    user_id: str, 
    entity_id: Optional[str] = None,
    check_type: Optional[str] = None  # "entity", "obligations", or "anomalies"
) -> NotificationResponse:
    """
    Generate notifications based on compliance validation results
    This would normally be triggered by a scheduled job
    """
    from app.apis.compliance_validator import run_compliance_checks
    
    # Get entity and compliance data
    try:
        from app.apis.business_entity import get_business_entity
        from app.apis.tax_obligations import get_tax_obligations
        
        entity = None
        if entity_id:
            entity = get_business_entity(entity_id)
        
        # Get tax obligations
        obligations = get_tax_obligations(entity_id) if entity_id else []
        
        # Prepare financial data (simplified)
        financial_data = {
            "hasEmployees": True,  # Would normally come from payroll/HR data
            "totalSales": 1000000,
            "gstCollected": 100000,
            "netProfit": 250000,
            "taxPayable": 75000,
            "deductions": [
                {"category": "expenses", "amount": 350000},
                {"category": "depreciation", "amount": 120000}
            ],
            "totalRevenue": 1120000
        }
        
    except Exception as e:
        print(f"Error fetching data for compliance checks: {e}")
        # Return error if we can't get the data
        return NotificationResponse(
            success=False,
            message=f"Failed to fetch data for compliance checks: {str(e)}"
        )
    
    # Prepare request for compliance checks
    request_data = {}
    
    if entity and (check_type is None or check_type == "entity"):
        # Convert entity to expected format for validator
        request_data["entity"] = {
            "entity_id": entity.get("id"),
            "abn": entity.get("abn"),
            "tfn": entity.get("tfn"),
            "business_structure": entity.get("businessStructure"),
            "gst_registered": entity.get("registeredForGST"),
            "gst_frequency": entity.get("gstFrequency"),
            "additional_data": {
                "acn": entity.get("acn") if entity.get("businessStructure") == "company" else None
            }
        }
    
    if obligations and (check_type is None or check_type == "obligations"):
        request_data["obligations"] = obligations
        
    if financial_data and (check_type is None or check_type == "anomalies"):
        request_data["financial_data"] = financial_data
    
    # Run compliance checks
    compliance_results = run_compliance_checks(request_data)
    
    # Current notifications
    all_notifications = get_notifications()
    
    # New notifications
    new_notifications = []
    now = datetime.now()
    
    # Generate notifications from compliance issues
    if "all_issues" in compliance_results:
        for issue in compliance_results["all_issues"]:
            # Create notification from the issue
            issue_code = issue.get("code")
            validation_type = issue.get("validation_type")
            
            # Skip if already notified for this specific issue
            already_notified = False
            for notif in all_notifications:
                if (
                    notif.get("userId") == user_id and
                    notif.get("type") == "compliance_issue" and
                    notif.get("data", {}).get("issueCode") == issue_code and
                    notif.get("data", {}).get("validationType") == validation_type and
                    not notif.get("dismissedAt")
                ):
                    already_notified = True
                    break
                    
            if already_notified:
                continue
                
            # Create notification
            new_notif = {
                "id": str(uuid.uuid4()),
                "userId": user_id,
                "entityId": entity_id,
                "type": "compliance_issue",
                "severity": issue.get("severity", "info"),
                "title": "Compliance Alert",
                "message": issue.get("message", "Compliance issue detected"),
                "actionRequired": issue.get("severity") in ["error", "warning"],
                "actionLink": f"/tax-compliance?tab=compliance&issueCode={issue_code}",
                "createdAt": now.isoformat(),
                "data": {
                    "issueCode": issue_code,
                    "validationType": validation_type,
                    "field": issue.get("field"),
                    "details": issue.get("details"),
                    "remediation": issue.get("remediation")
                }
            }
            
            new_notifications.append(new_notif)
            all_notifications.append(new_notif)
    
    # Save updated notifications
    if new_notifications:
        store_notifications(all_notifications)
    
    return NotificationResponse(
        success=True,
        message=f"Generated {len(new_notifications)} compliance alerts",
        data={
            "count": len(new_notifications),
            "byType": {
                "entity": sum(1 for n in new_notifications if n.get("data", {}).get("validationType") == "entity_validation"),
                "obligations": sum(1 for n in new_notifications if n.get("data", {}).get("validationType") == "obligations_validation"),
                "anomalies": sum(1 for n in new_notifications if n.get("data", {}).get("validationType") == "anomaly_detection")
            }
        }
    )
