from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, Query, Request
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum
import datetime
import json
import re
import databutton as db
import uuid # Added for UUID generation
import tempfile # Added for download
import os # Added for download
from fastapi.responses import FileResponse, JSONResponse # Added for download
from app.auth import AuthorizedUser
from app.apis.utils import log_audit_event

router = APIRouter(prefix="/report-distribution")

# --- Enums ---
class ReportFormat(str, Enum):
    PDF = "pdf"
    POWERPOINT = "pptx"
    EXCEL = "xlsx"
    CSV = "csv"
    IMAGE = "png"

class ReportType(str, Enum):
    BOARD = "board"
    MANAGEMENT = "management"
    INVESTOR = "investor"
    EXECUTIVE = "executive"
    CUSTOM = "custom"

class ScheduleFrequency(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    ANNUALLY = "annually"
    ONCE = "once"

class DeliveryMethod(str, Enum):
    EMAIL = "email"
    NOTIFICATION = "notification"
    DOWNLOAD = "download"

class ReportStatus(str, Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    DELIVERED = "delivered"
    PENDING = "pending" # Added for export status

# --- Pydantic Models ---
class Recipient(BaseModel):
    email: str
    name: Optional[str] = None

class FeedbackQuestion(BaseModel):
    id: str
    question: str
    questionType: str = "rating"  # rating, text, boolean

class ScheduleRequest(BaseModel):
    reportType: ReportType
    reportName: str
    description: Optional[str] = None
    frequency: ScheduleFrequency
    startDate: datetime.date
    endDate: Optional[datetime.date] = None
    deliveryMethods: List[DeliveryMethod]
    recipients: List[Recipient]
    formats: List[ReportFormat] = [ReportFormat.PDF]
    parameters: Optional[Dict[str, Any]] = None
    feedbackQuestions: Optional[List[FeedbackQuestion]] = None

class ScheduleResponse(BaseModel):
    scheduleId: str
    reportName: str
    nextDeliveryDate: datetime.date
    status: ReportStatus = ReportStatus.SCHEDULED

class UpdateScheduleRequest(BaseModel):
    reportName: Optional[str] = None
    description: Optional[str] = None
    frequency: Optional[ScheduleFrequency] = None
    startDate: Optional[datetime.date] = None
    endDate: Optional[datetime.date] = None
    deliveryMethods: Optional[List[DeliveryMethod]] = None
    recipients: Optional[List[Recipient]] = None
    formats: Optional[List[ReportFormat]] = None
    parameters: Optional[Dict[str, Any]] = None
    feedbackQuestions: Optional[List[FeedbackQuestion]] = None
    status: Optional[ReportStatus] = None

class ReportFeedback(BaseModel):
    reportId: str
    questionId: str
    response: Any
    comments: Optional[str] = None
    submittedBy: Optional[str] = None

class ExportRequest(BaseModel):
    reportType: ReportType
    reportName: Optional[str] = None
    format: ReportFormat = ReportFormat.PDF
    parameters: Optional[Dict[str, Any]] = None

class ExportResponse(BaseModel):
    reportId: str
    downloadUrl: str
    expiresAt: datetime.datetime

class ReportSchedule(BaseModel):
    scheduleId: str
    reportType: ReportType
    reportName: str
    description: Optional[str] = None
    frequency: ScheduleFrequency
    startDate: datetime.date
    endDate: Optional[datetime.date] = None
    deliveryMethods: List[DeliveryMethod]
    recipients: List[Recipient]
    formats: List[ReportFormat]
    parameters: Optional[Dict[str, Any]] = None
    feedbackQuestions: Optional[List[FeedbackQuestion]] = None
    status: ReportStatus
    nextDeliveryDate: datetime.date
    lastDeliveryDate: Optional[datetime.date] = None
    createdBy: str
    createdAt: datetime.datetime
    updatedAt: datetime.datetime

class ReportDelivery(BaseModel):
    deliveryId: str
    scheduleId: str
    reportType: ReportType
    reportName: str
    deliveryDate: datetime.datetime
    deliveryMethods: List[DeliveryMethod]
    recipients: List[Recipient]
    formats: List[ReportFormat]
    status: ReportStatus
    downloadUrls: Dict[ReportFormat, str] = {}
    feedbackResponses: int = 0

# --- Helper Functions ---
def sanitize_storage_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    return re.sub(r'[^a-zA-Z0-9._-]', '', key)

def calculate_next_delivery_date(frequency: ScheduleFrequency, start_date: datetime.date) -> datetime.date:
    today = datetime.date.today()
    if start_date > today:
        return start_date
    if frequency == ScheduleFrequency.DAILY:
        return today + datetime.timedelta(days=1)
    elif frequency == ScheduleFrequency.WEEKLY:
        days_ahead = start_date.weekday() - today.weekday()
        if days_ahead <= 0: days_ahead += 7
        return today + datetime.timedelta(days=days_ahead)
    elif frequency == ScheduleFrequency.MONTHLY:
        month, year = (today.month + 1, today.year) if today.month < 12 else (1, today.year + 1)
        day = min(start_date.day, 28) # Simplify for month end
        try:
            return datetime.date(year, month, day)
        except ValueError: # Handle invalid days like Feb 30
            return datetime.date(year, month, 28)
    elif frequency == ScheduleFrequency.QUARTERLY:
        current_quarter = (today.month - 1) // 3
        next_quarter_month = (current_quarter * 3) + 4
        year = today.year
        if next_quarter_month > 12:
            next_quarter_month -= 12
            year += 1
        day = min(start_date.day, 28)
        try:
             return datetime.date(year, next_quarter_month, day)
        except ValueError:
            return datetime.date(year, next_quarter_month, 28)
    elif frequency == ScheduleFrequency.ANNUALLY:
        year = today.year
        if (today.month > start_date.month) or (today.month == start_date.month and today.day >= start_date.day):
            year += 1
        day = min(start_date.day, 28)
        try:
            return datetime.date(year, start_date.month, day)
        except ValueError:
            return datetime.date(year, start_date.month, 28) 
    else: # ONCE
        return start_date # If it's in the past, it won't run anyway

def get_content_type(format: ReportFormat) -> str:
    content_types = {
        ReportFormat.PDF: "application/pdf",
        ReportFormat.POWERPOINT: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        ReportFormat.EXCEL: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ReportFormat.CSV: "text/csv",
        ReportFormat.IMAGE: "image/png"
    }
    return content_types.get(format, "application/octet-stream")

# --- API Endpoints ---
@router.post("/schedule", response_model=ScheduleResponse)
async def schedule_report(schedule_request_body: ScheduleRequest, user: AuthorizedUser, request: Request):
    """Schedule a report for periodic delivery"""
    schedule_id = f"schedule-{uuid.uuid4()}"
    action_type = "REPORT_SCHEDULE_CREATE"
    target_object_type = "REPORT_SCHEDULE"
    log_details = {
        "report_type": schedule_request_body.reportType.value,
        "report_name": schedule_request_body.reportName,
        "frequency": schedule_request_body.frequency.value,
        "user_id": user.sub
    }
    try:
        next_delivery_date = calculate_next_delivery_date(schedule_request_body.frequency, schedule_request_body.startDate)
        schedule = ReportSchedule(
            scheduleId=schedule_id,
            reportType=schedule_request_body.reportType,
            reportName=schedule_request_body.reportName,
            description=schedule_request_body.description,
            frequency=schedule_request_body.frequency,
            startDate=schedule_request_body.startDate,
            endDate=schedule_request_body.endDate,
            deliveryMethods=schedule_request_body.deliveryMethods,
            recipients=schedule_request_body.recipients,
            formats=schedule_request_body.formats,
            parameters=schedule_request_body.parameters,
            feedbackQuestions=schedule_request_body.feedbackQuestions,
            status=ReportStatus.SCHEDULED,
            nextDeliveryDate=next_delivery_date,
            createdBy=user.sub,
            createdAt=datetime.datetime.now(datetime.timezone.utc),
            updatedAt=datetime.datetime.now(datetime.timezone.utc)
        )
        try:
            schedules_data = db.storage.json.get("report_schedules")
        except FileNotFoundError:
            schedules_data = []
        schedules_data.append(schedule.dict())
        db.storage.json.put(sanitize_storage_key("report_schedules"), schedules_data)
        log_details["schedule_id"] = schedule_id
        log_audit_event(
            user_identifier=user.sub,
            action_type=action_type,
            status="SUCCESS",
            request=request,
            target_object_type=target_object_type,
            target_object_id=schedule_id,
            details=log_details
        )
        return ScheduleResponse(
            scheduleId=schedule_id,
            reportName=schedule_request_body.reportName,
            nextDeliveryDate=next_delivery_date,
            status=ReportStatus.SCHEDULED
        )
    except Exception as e:
        error_msg = f"Failed to schedule report: {str(e)}"
        log_audit_event(
            user_identifier=user.sub,
            action_type=action_type,
            status="FAILURE",
            request=request,
            target_object_type=target_object_type,
            target_object_id=None,
            error_message=error_msg,
            status_code=500,
            details=log_details
        )
        raise HTTPException(status_code=500, detail=error_msg) from e

@router.get("/schedules", response_model=List[ReportSchedule])
async def list_schedules(user: AuthorizedUser, request: Request):
    """List all scheduled reports for the user"""
    action_type = "REPORT_SCHEDULE_LIST"
    try:
        try:
            schedules_data = db.storage.json.get("report_schedules")
        except FileNotFoundError:
            return [] # Not an error, just no schedules
        schedules = [ReportSchedule(**schedule) for schedule in schedules_data 
                    if schedule.get("createdBy") == user.sub]
        # No audit log for list success by default
        return schedules
    except Exception as e:
        error_msg = f"Failed to retrieve schedules: {str(e)}"
        log_audit_event(
            user_identifier=user.sub,
            action_type=action_type,
            status="FAILURE",
            request=request,
            target_object_type="REPORT_SCHEDULE",
            error_message=error_msg,
            status_code=500,
            details={"user_id": user.sub}
        )
        raise HTTPException(status_code=500, detail=error_msg) from e

@router.get("/schedule/{schedule_id}", response_model=ReportSchedule)
async def get_schedule(schedule_id: str, user: AuthorizedUser, request: Request):
    """Get details of a specific report schedule"""
    action_type = "REPORT_SCHEDULE_GET"
    target_object_type = "REPORT_SCHEDULE"
    try:
        try:
            schedules_data = db.storage.json.get("report_schedules")
        except FileNotFoundError:
            raise HTTPException(status_code=404, detail="Schedule data file not found")
        schedule_dict = next((s for s in schedules_data 
                         if s.get("scheduleId") == schedule_id and s.get("createdBy") == user.sub), None)
        if not schedule_dict:
            raise HTTPException(status_code=404, detail="Schedule not found or access denied")
        schedule = ReportSchedule(**schedule_dict)
        # No audit log for get success by default
        return schedule
    except HTTPException as http_exc:
        log_audit_event(
            user_identifier=user.sub,
            action_type=action_type,
            status="FAILURE",
            request=request,
            target_object_type=target_object_type,
            target_object_id=schedule_id,
            error_message=http_exc.detail,
            status_code=http_exc.status_code,
            details={"user_id": user.sub}
        )
        raise http_exc
    except Exception as e:
        error_msg = f"Failed to retrieve schedule: {str(e)}"
        log_audit_event(
            user_identifier=user.sub,
            action_type=action_type,
            status="FAILURE",
            request=request,
            target_object_type=target_object_type,
            target_object_id=schedule_id,
            error_message=error_msg,
            status_code=500,
            details={"user_id": user.sub}
        )
        raise HTTPException(status_code=500, detail=error_msg) from e

@router.put("/schedule/{schedule_id}", response_model=ReportSchedule)
async def update_schedule(schedule_id: str, update_request_body: UpdateScheduleRequest, user: AuthorizedUser, request: Request):
    """Update an existing report schedule"""
    action_type = "REPORT_SCHEDULE_UPDATE"
    target_object_type = "REPORT_SCHEDULE"
    updated_fields = list(update_request_body.dict(exclude_unset=True).keys())
    log_details = {"updated_fields": updated_fields, "user_id": user.sub}
    try:
        try:
            schedules_data = db.storage.json.get("report_schedules")
        except FileNotFoundError:
            raise HTTPException(status_code=404, detail="Schedule data file not found")
        schedule_index = next((i for i, s in enumerate(schedules_data) 
                            if s.get("scheduleId") == schedule_id and s.get("createdBy") == user.sub), None)
        if schedule_index is None:
            raise HTTPException(status_code=404, detail="Schedule not found or access denied")
        schedule = schedules_data[schedule_index]
        update_data = update_request_body.dict(exclude_unset=True)
        for key, value in update_data.items():
            if value is not None:
                # Ensure enums are stored as their values if updated
                if isinstance(value, Enum):
                     schedule[key] = value.value
                else:
                     schedule[key] = value
        if "frequency" in update_data or "startDate" in update_data:
            freq_val = schedule.get("frequency")
            start_val = schedule.get("startDate")
            if isinstance(start_val, str):
                start_date_obj = datetime.date.fromisoformat(start_val)
            elif isinstance(start_val, datetime.date):
                 start_date_obj = start_val
            else:
                raise ValueError("Invalid startDate format") # Should not happen with pydantic
            schedule["nextDeliveryDate"] = calculate_next_delivery_date(ScheduleFrequency(freq_val), start_date_obj).isoformat()
        schedule["updatedAt"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
        db.storage.json.put(sanitize_storage_key("report_schedules"), schedules_data)
        log_audit_event(
            user_identifier=user.sub,
            action_type=action_type,
            status="SUCCESS",
            request=request,
            target_object_type=target_object_type,
            target_object_id=schedule_id,
            details=log_details
        )
        return ReportSchedule(**schedule)
    except HTTPException as http_exc:
        log_audit_event(
            user_identifier=user.sub,
            action_type=action_type,
            status="FAILURE",
            request=request,
            target_object_type=target_object_type,
            target_object_id=schedule_id,
            error_message=http_exc.detail,
            status_code=http_exc.status_code,
            details=log_details
        )
        raise http_exc
    except Exception as e:
        error_msg = f"Failed to update schedule: {str(e)}"
        log_details["error"] = error_msg
        log_audit_event(
            user_identifier=user.sub,
            action_type=action_type,
            status="FAILURE",
            request=request,
            target_object_type=target_object_type,
            target_object_id=schedule_id,
            error_message=error_msg,
            status_code=500,
            details=log_details
        )
        raise HTTPException(status_code=500, detail=error_msg) from e

@router.delete("/schedule/{schedule_id}", status_code=204)
async def delete_schedule(schedule_id: str, user: AuthorizedUser, request: Request):
    """Delete a report schedule"""
    action_type = "REPORT_SCHEDULE_DELETE"
    target_object_type = "REPORT_SCHEDULE"
    log_details = {"user_id": user.sub}
    try:
        try:
            schedules_data = db.storage.json.get("report_schedules")
        except FileNotFoundError:
            raise HTTPException(status_code=404, detail="Schedule data file not found")
        schedule_index = next((i for i, s in enumerate(schedules_data) 
                            if s.get("scheduleId") == schedule_id and s.get("createdBy") == user.sub), None)
        if schedule_index is None:
            raise HTTPException(status_code=404, detail="Schedule not found or access denied")
        schedule_info = schedules_data.pop(schedule_index)
        log_details["deleted_report_name"] = schedule_info.get("reportName")
        db.storage.json.put(sanitize_storage_key("report_schedules"), schedules_data)
        log_audit_event(
            user_identifier=user.sub,
            action_type=action_type,
            status="SUCCESS",
            request=request,
            target_object_type=target_object_type,
            target_object_id=schedule_id,
            details=log_details
        )
        return None
    except HTTPException as http_exc:
        log_audit_event(
            user_identifier=user.sub,
            action_type=action_type,
            status="FAILURE",
            request=request,
            target_object_type=target_object_type,
            target_object_id=schedule_id,
            error_message=http_exc.detail,
            status_code=http_exc.status_code,
            details=log_details
        )
        raise http_exc
    except Exception as e:
        error_msg = f"Failed to delete schedule: {str(e)}"
        log_details["error"] = error_msg
        log_audit_event(
            user_identifier=user.sub,
            action_type=action_type,
            status="FAILURE",
            request=request,
            target_object_type=target_object_type,
            target_object_id=schedule_id,
            error_message=error_msg,
            status_code=500,
            details=log_details
        )
        raise HTTPException(status_code=500, detail=error_msg) from e

@router.post("/export", response_model=ExportResponse)
async def export_report(
    export_request_body: ExportRequest, 
    background_tasks: BackgroundTasks, 
    user: AuthorizedUser,
    request: Request
):
    """Export a report in the specified format"""
    report_id = f"report-{uuid.uuid4()}"
    action_type = "REPORT_EXPORT_REQUEST"
    target_object_type = "REPORT_EXPORT"
    log_details = {
        "report_type": export_request_body.reportType.value,
        "report_name": export_request_body.reportName,
        "format": export_request_body.format.value,
        "user_id": user.sub,
    }
    try:
        expires_hours = 24
        expires_at = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=expires_hours)
        # Assuming API is mounted at /api - adjust if different
        download_url = f"/api{router.prefix}/download/{report_id}?format={export_request_body.format.value}"
        export_data = {
            "reportId": report_id,
            "reportType": export_request_body.reportType.value,
            "reportName": export_request_body.reportName or f"{export_request_body.reportType.capitalize()} Report",
            "format": export_request_body.format.value,
            "parameters": export_request_body.parameters,
            "expiresAt": expires_at.isoformat(),
            "createdBy": user.sub,
            "createdAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "status": ReportStatus.PENDING.value
        }
        try:
            exports_data = db.storage.json.get("report_exports")
        except FileNotFoundError:
            exports_data = {}
        exports_data[report_id] = export_data
        db.storage.json.put(sanitize_storage_key("report_exports"), exports_data)
        background_tasks.add_task(generate_report, report_id, export_request_body.reportType, export_request_body.format, export_request_body.parameters)
        log_details.update({
            "export_id": report_id,
            "download_url": download_url,
            "expires_at": expires_at.isoformat()
        })
        log_audit_event(
            user_identifier=user.sub,
            action_type=action_type,
            status="SUCCESS",
            request=request,
            target_object_type=target_object_type,
            target_object_id=report_id,
            details=log_details
        )
        return ExportResponse(
            reportId=report_id,
            downloadUrl=download_url,
            expiresAt=expires_at
        )
    except Exception as e:
        error_msg = f"Failed to initiate report export: {str(e)}"
        log_details["error"] = error_msg
        log_audit_event(
            user_identifier=user.sub,
            action_type=action_type,
            status="FAILURE",
            request=request,
            target_object_type=target_object_type,
            target_object_id=None, # report_id might not be fully registered
            error_message=error_msg,
            status_code=500,
            details=log_details
        )
        raise HTTPException(status_code=500, detail=error_msg) from e

@router.get("/download/{report_id}")
async def download_report(
    report_id: str, 
    format: ReportFormat, 
    user: AuthorizedUser,
    request: Request
):
    """Download a previously exported report"""
    action_type = "REPORT_DOWNLOAD"
    target_object_type = "REPORT_EXPORT"
    log_details = {"report_id": report_id, "format": format.value, "user_id": user.sub}
    try:
        try:
            exports_data = db.storage.json.get("report_exports")
        except FileNotFoundError:
            raise HTTPException(status_code=404, detail="Report export data not found")
        if report_id not in exports_data:
            raise HTTPException(status_code=404, detail="Report export record not found")
        export_info = exports_data[report_id]
        # Check ownership - Optional: Depends if downloads should be restricted to creator
        # if export_info.get("createdBy") != user.sub:
        #     raise HTTPException(status_code=403, detail="Access denied to download this report")
        expires_at = datetime.datetime.fromisoformat(export_info["expiresAt"]) # Assumes stored in UTC
        if datetime.datetime.now(datetime.timezone.utc) > expires_at:
            raise HTTPException(status_code=410, detail="Export link has expired")
        # Check format match
        if export_info.get("format") != format.value:
             export_format = export_info.get("format")
             raise HTTPException(status_code=400, detail=f"Requested format '{format.value}' does not match export format '{export_format}'")
        try:
            report_data = db.storage.binary.get(sanitize_storage_key(f"report_{report_id}"))
        except FileNotFoundError:
            log_audit_event(
                user_identifier=user.sub,
                action_type=action_type,
                status="INFO",
                request=request,
                target_object_type=target_object_type,
                target_object_id=report_id,
                details={"message": "Report generation in progress", **log_details}
            )
            return JSONResponse({"status": "processing", "message": "Report is still being generated."}, status_code=202)
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{format.value}") as tmp:
            tmp.write(report_data)
            tmp_path = tmp.name
        filename = f"{export_info.get('reportName', 'report').replace(' ', '_')}_{datetime.datetime.now().strftime('%Y%m%d')}.{format.value}"
        log_details["filename"] = filename
        log_audit_event(
            user_identifier=user.sub,
            action_type=action_type,
            status="SUCCESS",
            request=request,
            target_object_type=target_object_type,
            target_object_id=report_id,
            details=log_details
        )
        # Ensure BackgroundTasks is initialized correctly
        bg_tasks = BackgroundTasks()
        bg_tasks.add_task(lambda p: os.unlink(p) if os.path.exists(p) else None, tmp_path)
        return FileResponse(
            path=tmp_path,
            filename=filename,
            media_type=get_content_type(format),
            background=bg_tasks
        )
    except HTTPException as http_exc:
        log_audit_event(
            user_identifier=user.sub,
            action_type=action_type,
            status="FAILURE",
            request=request,
            target_object_type=target_object_type,
            target_object_id=report_id,
            error_message=http_exc.detail,
            status_code=http_exc.status_code,
            details=log_details
        )
        raise http_exc
    except Exception as e:
        error_msg = f"Failed to download report: {str(e)}"
        log_details["error"] = error_msg
        log_audit_event(
            user_identifier=user.sub,
            action_type=action_type,
            status="FAILURE",
            request=request,
            target_object_type=target_object_type,
            target_object_id=report_id,
            error_message=error_msg,
            status_code=500,
            details=log_details
        )
        raise HTTPException(status_code=500, detail=error_msg) from e

@router.post("/feedback")
async def submit_feedback(feedback_body: ReportFeedback, user: AuthorizedUser, request: Request):
    """Submit feedback for a delivered report"""
    action_type = "REPORT_FEEDBACK_SUBMIT"
    target_object_type = "REPORT_FEEDBACK"
    log_details = {
        "report_id": feedback_body.reportId,
        "question_id": feedback_body.questionId,
        "user_id": user.sub
    }
    try:
        feedback_data = feedback_body.dict()
        feedback_data["submittedBy"] = user.sub
        feedback_data["submittedAt"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
        try:
            all_feedback = db.storage.json.get("report_feedback")
        except FileNotFoundError:
            all_feedback = []
        all_feedback.append(feedback_data)
        db.storage.json.put(sanitize_storage_key("report_feedback"), all_feedback)
        log_audit_event(
            user_identifier=user.sub,
            action_type=action_type,
            status="SUCCESS",
            request=request,
            target_object_type=target_object_type,
            target_object_id=feedback_body.reportId, # Maybe compound ID: f"{reportId}-{questionId}"
            details=log_details
        )
        return {"message": "Feedback submitted successfully"}
    except Exception as e:
        error_msg = f"Failed to submit feedback: {str(e)}"
        log_details["error"] = error_msg
        log_audit_event(
            user_identifier=user.sub,
            action_type=action_type,
            status="FAILURE",
            request=request,
            target_object_type=target_object_type,
            target_object_id=feedback_body.reportId,
            error_message=error_msg,
            status_code=500,
            details=log_details
        )
        raise HTTPException(status_code=500, detail=error_msg) from e

# --- Background Tasks ---
async def generate_report(report_id: str, report_type: ReportType, format: ReportFormat, parameters: Optional[Dict[str, Any]] = None):
    """(Background Task) Generate a report and store it"""
    action_type = "REPORT_GENERATE_TASK"
    target_object_type = "REPORT_EXPORT"
    log_details = {"report_id": report_id, "report_type": report_type.value, "format": format.value}
    exports_data = {}
    try:
        try:
            exports_data = db.storage.json.get("report_exports")
            if report_id in exports_data:
                exports_data[report_id]["status"] = ReportStatus.IN_PROGRESS.value
                db.storage.json.put(sanitize_storage_key("report_exports"), exports_data)
        except Exception as status_e:
            print(f"Audit Log (generate_report): Failed to update status to IN_PROGRESS for {report_id}: {status_e}")
        # Placeholder generation logic
        report_data = b"Placeholder report data"
        if format == ReportFormat.PDF:
             report_data = b"%PDF-1.7... (Sample PDF data)"
        elif format == ReportFormat.CSV:
            report_data = b"Header1,Header2\nValue1,Value2"
        # ... add more format placeholders ...
        db.storage.binary.put(sanitize_storage_key(f"report_{report_id}"), report_data)
        if report_id in exports_data:
            exports_data[report_id]["status"] = ReportStatus.COMPLETED.value
            db.storage.json.put(sanitize_storage_key("report_exports"), exports_data)
        log_audit_event(
            user_identifier="background_task",
            action_type=action_type,
            status="SUCCESS",
            target_object_type=target_object_type,
            target_object_id=report_id,
            details=log_details
        )
    except Exception as e:
        error_msg = f"Report generation failed: {str(e)}"
        log_details["error"] = error_msg
        print(f"Audit Log (generate_report): {error_msg}")
        try:
            if report_id in exports_data:
                exports_data[report_id]["status"] = ReportStatus.FAILED.value
                exports_data[report_id]["error"] = error_msg
                db.storage.json.put(sanitize_storage_key("report_exports"), exports_data)
        except Exception as status_e:
             print(f"Audit Log (generate_report): Failed to update status to FAILED for {report_id}: {status_e}")
        log_audit_event(
            user_identifier="background_task",
            action_type=action_type,
            status="FAILURE",
            target_object_type=target_object_type,
            target_object_id=report_id,
            error_message=error_msg,
            details=log_details
        )

@router.post("/deliver/{schedule_id}")
async def manual_deliver_report(schedule_id: str, background_tasks: BackgroundTasks, user: AuthorizedUser, request: Request):
    """Manually trigger delivery of a scheduled report"""
    action_type = "REPORT_DELIVERY_TRIGGER"
    target_object_type = "REPORT_SCHEDULE"
    log_details = {"schedule_id": schedule_id, "triggered_by": user.sub}
    try:
        try:
            schedules_data = db.storage.json.get("report_schedules")
        except FileNotFoundError:
            raise HTTPException(status_code=404, detail="Schedule data file not found")
        schedule = next((s for s in schedules_data if s.get("scheduleId") == schedule_id and s.get("createdBy") == user.sub), None)
        if not schedule:
            raise HTTPException(status_code=404, detail="Schedule not found or access denied")
        background_tasks.add_task(deliver_report, schedule_id)
        log_audit_event(
            user_identifier=user.sub,
            action_type=action_type,
            status="SUCCESS",
            request=request,
            target_object_type=target_object_type,
            target_object_id=schedule_id,
            details=log_details
        )
        return {"message": "Report delivery triggered"}
    except HTTPException as http_exc:
        log_audit_event(
            user_identifier=user.sub,
            action_type=action_type,
            status="FAILURE",
            request=request,
            target_object_type=target_object_type,
            target_object_id=schedule_id,
            error_message=http_exc.detail,
            status_code=http_exc.status_code,
            details=log_details
        )
        raise http_exc
    except Exception as e:
        error_msg = f"Failed to trigger report delivery: {str(e)}"
        log_details["error"] = error_msg
        log_audit_event(
            user_identifier=user.sub,
            action_type=action_type,
            status="FAILURE",
            request=request,
            target_object_type=target_object_type,
            target_object_id=schedule_id,
            error_message=error_msg,
            status_code=500,
            details=log_details
        )
        raise HTTPException(status_code=500, detail=error_msg) from e

async def deliver_report(schedule_id: str):
    """(Background Task) Generate and deliver a report based on a schedule"""
    action_type = "REPORT_DELIVERY_TASK"
    target_object_type = "REPORT_DELIVERY"
    delivery_id = f"delivery-{uuid.uuid4()}"
    log_details = {"schedule_id": schedule_id, "delivery_id": delivery_id}
    schedules_data = []
    schedule_index = -1
    try:
        try:
            schedules_data = db.storage.json.get("report_schedules")
            schedule_index = next((i for i, s in enumerate(schedules_data) if s.get("scheduleId") == schedule_id), -1)
            if schedule_index == -1:
                raise ValueError(f"Schedule {schedule_id} not found during delivery task")
            schedule = schedules_data[schedule_index]
        except Exception as e:
            raise ValueError(f"Error retrieving schedule {schedule_id}: {e}") from e
        # Update status to IN_PROGRESS
        schedule["status"] = ReportStatus.IN_PROGRESS.value
        db.storage.json.put(sanitize_storage_key("report_schedules"), schedules_data)
        download_urls = {}
        generated_report_ids = []
        for format_val in schedule.get("formats", []):
            format_enum = ReportFormat(format_val)
            report_id = f"report-{uuid.uuid4()}"
            generated_report_ids.append(report_id)
            await generate_report(report_id, ReportType(schedule["reportType"]), format_enum, schedule.get("parameters"))
            download_urls[format_val] = f"/api{router.prefix}/download/{report_id}?format={format_val}"
        delivery_data = ReportDelivery(
            deliveryId=delivery_id,
            scheduleId=schedule_id,
            reportType=ReportType(schedule["reportType"]),
            reportName=schedule["reportName"],
            deliveryDate=datetime.datetime.now(datetime.timezone.utc),
            deliveryMethods=[DeliveryMethod(m) for m in schedule.get("deliveryMethods", [])],
            recipients=[Recipient(**r) for r in schedule.get("recipients", [])],
            formats=[ReportFormat(f) for f in schedule.get("formats", [])],
            status=ReportStatus.DELIVERED, # Assume success initially
            downloadUrls=download_urls
        ).dict()
        try:
            deliveries_data = db.storage.json.get("report_deliveries")
        except FileNotFoundError:
            deliveries_data = []
        deliveries_data.append(delivery_data)
        db.storage.json.put(sanitize_storage_key("report_deliveries"), deliveries_data)
        # --- Actual Delivery Logic (Simulated) ---
        for method_val in schedule.get("deliveryMethods", []):
            method = DeliveryMethod(method_val)
            if method == DeliveryMethod.EMAIL:
                for recipient in schedule.get("recipients", []):
                    print(f"Simulating email to {recipient.get('email')} for delivery {delivery_id}")
                    # db.notify.email(...)
            elif method == DeliveryMethod.NOTIFICATION:
                 # Generate in-app notifications (requires user lookup)
                 print(f"Simulating in-app notification for delivery {delivery_id}")
                 # db.storage.json.put("notifications", ...)
        # Update schedule status and next date
        schedule["lastDeliveryDate"] = datetime.datetime.now(datetime.timezone.utc).date().isoformat()
        schedule["status"] = ReportStatus.DELIVERED.value
        if ScheduleFrequency(schedule["frequency"]) != ScheduleFrequency.ONCE:
            start_date_obj = datetime.date.fromisoformat(schedule["startDate"]) if isinstance(schedule["startDate"], str) else schedule["startDate"]
            next_date = calculate_next_delivery_date(ScheduleFrequency(schedule["frequency"]), start_date_obj)
            schedule["nextDeliveryDate"] = next_date.isoformat()
        else:
            schedule["status"] = ReportStatus.COMPLETED.value
        db.storage.json.put(sanitize_storage_key("report_schedules"), schedules_data)
        log_audit_event(
            user_identifier="background_task",
            action_type=action_type,
            status="SUCCESS",
            target_object_type=target_object_type,
            target_object_id=delivery_id,
            details=log_details
        )
    except Exception as e:
        error_msg = f"Error during report delivery task {delivery_id}: {str(e)}"
        log_details["error"] = error_msg
        print(f"Audit Log (deliver_report): {error_msg}")
        try:
            # Update schedule status to FAILED
            if schedule_index != -1 and schedules_data:
                schedules_data[schedule_index]["status"] = ReportStatus.FAILED.value
                db.storage.json.put(sanitize_storage_key("report_schedules"), schedules_data)
            # Update delivery record status to FAILED if it exists
            try:
                deliveries_data = db.storage.json.get("report_deliveries")
                delivery_index = next((i for i, d in enumerate(deliveries_data) if d.get("deliveryId") == delivery_id), -1)
                if delivery_index != -1:
                    deliveries_data[delivery_index]["status"] = ReportStatus.FAILED.value
                    db.storage.json.put(sanitize_storage_key("report_deliveries"), deliveries_data)
            except Exception as delivery_status_e:
                 print(f"Audit Log (deliver_report): Failed to update delivery record {delivery_id} status to FAILED: {delivery_status_e}")
        except Exception as final_status_e:
             print(f"Audit Log (deliver_report): Critical error updating status to FAILED for schedule {schedule_id}: {final_status_e}")
        log_audit_event(
            user_identifier="background_task",
            action_type=action_type,
            status="FAILURE",
            target_object_type=target_object_type,
            target_object_id=delivery_id,
            error_message=error_msg,
            details=log_details
        )

