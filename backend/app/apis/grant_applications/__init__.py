from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
import databutton as db
import json
import re
import uuid
from app.auth import AuthorizedUser

router = APIRouter()

# Models
class Document(BaseModel):
    id: str
    name: str
    type: str
    uploaded_at: datetime
    file_key: str
    status: str = 'pending'  # pending, approved, rejected
    notes: Optional[str] = None

class ApplicationStep(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    status: str = 'not_started'  # not_started, in_progress, completed
    due_date: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    documents: List[Document] = []
    notes: Optional[str] = None

class GrantApplication(BaseModel):
    id: str
    grant_id: str
    user_id: str
    business_id: Optional[str] = None
    status: str = 'draft'  # draft, submitted, in_review, approved, rejected
    created_at: datetime
    updated_at: datetime
    submitted_at: Optional[datetime] = None
    grant_name: str
    provider: str
    funding_type: str
    max_amount: Optional[float] = None
    steps: List[ApplicationStep] = []
    documents: List[Document] = []
    notes: Optional[str] = None
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    
class ApplicationStatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = None

class StepStatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = None
    due_date: Optional[datetime] = None

class CreateApplicationRequest(BaseModel):
    grant_id: str
    business_id: Optional[str] = None
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    notes: Optional[str] = None

class DocumentUploadRequest(BaseModel):
    name: str
    type: str
    step_id: Optional[str] = None

class DocumentUploadResponse(BaseModel):
    document_id: str
    upload_url: str

class ApplicationResponse(BaseModel):
    application: GrantApplication

class ApplicationListResponse(BaseModel):
    applications: List[GrantApplication]

class ApplicationStepListResponse(BaseModel):
    steps: List[ApplicationStep]

class DocumentListResponse(BaseModel):
    documents: List[Document]

# Helper functions
def sanitize_storage_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    return re.sub(r'[^a-zA-Z0-9._-]', '', key)

def get_applications_for_user(user_id: str) -> List[GrantApplication]:
    """Get all applications for a user"""
    try:
        # Get the applications index
        applications_key = f"applications_index_{sanitize_storage_key(user_id)}"
        applications_index = db.storage.json.get(applications_key, default=[])
        
        # Load each application
        applications = []
        for app_id in applications_index:
            app_key = f"application_{sanitize_storage_key(app_id)}"
            app_data = db.storage.json.get(app_key, default=None)
            if app_data:
                # Convert string dates to datetime objects
                app_data['created_at'] = datetime.fromisoformat(app_data['created_at'])
                app_data['updated_at'] = datetime.fromisoformat(app_data['updated_at'])
                
                if app_data.get('submitted_at'):
                    app_data['submitted_at'] = datetime.fromisoformat(app_data['submitted_at'])
                
                # Convert step dates
                for step in app_data.get('steps', []):
                    if step.get('due_date'):
                        step['due_date'] = datetime.fromisoformat(step['due_date'])
                    if step.get('completed_at'):
                        step['completed_at'] = datetime.fromisoformat(step['completed_at'])
                
                # Convert document dates
                for doc in app_data.get('documents', []):
                    doc['uploaded_at'] = datetime.fromisoformat(doc['uploaded_at'])
                
                for step in app_data.get('steps', []):
                    for doc in step.get('documents', []):
                        doc['uploaded_at'] = datetime.fromisoformat(doc['uploaded_at'])
                
                applications.append(GrantApplication(**app_data))
        
        return applications
    except Exception as e:
        print(f"Error getting applications: {e}")
        return []

def save_application(application: GrantApplication) -> None:
    """Save an application"""
    try:
        # Convert to dict for storage
        app_data = application.dict()
        
        # Convert datetime objects to ISO format strings
        app_data['created_at'] = app_data['created_at'].isoformat()
        app_data['updated_at'] = app_data['updated_at'].isoformat()
        
        if app_data.get('submitted_at'):
            app_data['submitted_at'] = app_data['submitted_at'].isoformat()
        
        # Convert step dates
        for step in app_data.get('steps', []):
            if step.get('due_date'):
                step['due_date'] = step['due_date'].isoformat()
            if step.get('completed_at'):
                step['completed_at'] = step['completed_at'].isoformat()
        
        # Convert document dates
        for doc in app_data.get('documents', []):
            doc['uploaded_at'] = doc['uploaded_at'].isoformat()
        
        for step in app_data.get('steps', []):
            for doc in step.get('documents', []):
                doc['uploaded_at'] = doc['uploaded_at'].isoformat()
        
        # Save the application
        app_key = f"application_{sanitize_storage_key(application.id)}"
        db.storage.json.put(app_key, app_data)
        
        # Update the user's applications index
        applications_key = f"applications_index_{sanitize_storage_key(application.user_id)}"
        applications_index = db.storage.json.get(applications_key, default=[])
        
        if application.id not in applications_index:
            applications_index.append(application.id)
            db.storage.json.put(applications_key, applications_index)
    except Exception as e:
        print(f"Error saving application: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save application: {str(e)}")

def delete_application(application_id: str, user_id: str) -> bool:
    """Delete an application"""
    try:
        # Remove from user's applications index
        applications_key = f"applications_index_{sanitize_storage_key(user_id)}"
        applications_index = db.storage.json.get(applications_key, default=[])
        
        if application_id in applications_index:
            applications_index.remove(application_id)
            db.storage.json.put(applications_key, applications_index)
        
        # Delete the application
        app_key = f"application_{sanitize_storage_key(application_id)}"
        try:
            # This will raise an exception if the file doesn't exist
            db.storage.json.get(app_key)
            # If we got here, the file exists, so delete it
            db.storage.json.delete(app_key)
            return True
        except Exception:
            # File doesn't exist
            return False
    except Exception as e:
        print(f"Error deleting application: {e}")
        return False

def get_default_steps(grant_name: str) -> List[ApplicationStep]:
    """Generate default steps for a grant application"""
    return [
        ApplicationStep(
            id=str(uuid.uuid4()),
            name="Initial Eligibility Check",
            description="Confirm eligibility requirements for the grant.",
            status="not_started"
        ),
        ApplicationStep(
            id=str(uuid.uuid4()),
            name="Gather Required Documents",
            description=f"Collect all documentation required for {grant_name} application.",
            status="not_started"
        ),
        ApplicationStep(
            id=str(uuid.uuid4()),
            name="Complete Application Form",
            description="Fill out the official application form.",
            status="not_started"
        ),
        ApplicationStep(
            id=str(uuid.uuid4()),
            name="Review & Submit",
            description="Final review of application before submission.",
            status="not_started"
        ),
        ApplicationStep(
            id=str(uuid.uuid4()),
            name="Follow Up",
            description="Follow up on application status.",
            status="not_started"
        ),
    ]

# Endpoints
@router.post("/applications")
def create_application(request: CreateApplicationRequest, user: AuthorizedUser):
    """Create a new grant application"""
    # Get the grant details
    try:
        # Fetch the grant from the government_grants API
        from app.apis.government_grants import get_grant
        grant = get_grant(request.grant_id)
        
        # Check if grant was found - it could come as a dict with error or as None
        if not grant or (isinstance(grant, dict) and "error" in grant):
            raise HTTPException(status_code=404, detail="Grant not found")
        
        # Create a new application
        application_id = str(uuid.uuid4())
        now = datetime.now()
        
        # Get user ID from the authenticated user object
        user_id = user.sub
        
        application = GrantApplication(
            id=application_id,
            grant_id=request.grant_id,
            user_id=user_id,
            business_id=request.business_id,
            status="draft",
            created_at=now,
            updated_at=now,
            grant_name=grant["name"],
            provider=grant["provider"],
            funding_type=grant["funding"]["funding_type"],
            max_amount=grant["funding"].get("max_amount"),
            steps=get_default_steps(grant["name"]),
            documents=[],
            notes=request.notes,
            contact_name=request.contact_name,
            contact_email=request.contact_email,
            contact_phone=request.contact_phone
        )
        
        # Save the application
        save_application(application)
        
        return ApplicationResponse(application=application)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create application: {str(e)}") from e

@router.get("/applications")
def list_applications(user: AuthorizedUser, status: Optional[str] = None, grant_id: Optional[str] = None):
    """List all applications for a user"""
    try:
        # Get user ID from the authenticated user
        user_id = user.sub
            
        applications = get_applications_for_user(user_id)
        
        # Apply filters
        if status:
            applications = [app for app in applications if app.status == status]
        
        if grant_id:
            applications = [app for app in applications if app.grant_id == grant_id]
        
        # Sort by updated_at date (most recent first)
        applications.sort(key=lambda x: x.updated_at, reverse=True)
        
        return ApplicationListResponse(applications=applications)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list applications: {str(e)}") from e

@router.get("/applications/{application_id}")
def get_application(application_id: str, user: AuthorizedUser):
    """Get a specific application"""
    try:
        # Get user ID from the authenticated user
        user_id = user.sub
            
        applications = get_applications_for_user(user_id)
        for app in applications:
            if app.id == application_id:
                return ApplicationResponse(application=app)
        
        raise HTTPException(status_code=404, detail="Application not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get application: {str(e)}") from e

@router.put("/applications/{application_id}")
def update_application(application_id: str, update: ApplicationStatusUpdate, user: AuthorizedUser):
    """Update an application status"""
    try:
        # Get user ID from the authenticated user
        user_id = user.sub
            
        applications = get_applications_for_user(user_id)
        for i, app in enumerate(applications):
            if app.id == application_id:
                # Update the application
                applications[i].status = update.status
                applications[i].updated_at = datetime.now()
                
                if update.notes is not None:
                    applications[i].notes = update.notes
                
                # If status is changing to submitted, set submitted_at
                if update.status == "submitted" and applications[i].submitted_at is None:
                    applications[i].submitted_at = datetime.now()
                
                save_application(applications[i])
                return ApplicationResponse(application=applications[i])
        
        raise HTTPException(status_code=404, detail="Application not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update application: {str(e)}") from e

@router.delete("/applications/{application_id}")
def delete_application_endpoint(application_id: str, user: AuthorizedUser):
    """Delete an application"""
    try:
        # Get user ID from the authenticated user
        user_id = user.sub
            
        success = delete_application(application_id, user_id)
        if success:
            return {"message": "Application deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Application not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete application: {str(e)}") from e

@router.put("/applications/{application_id}/steps/{step_id}")
def update_application_step(application_id: str, step_id: str, update: StepStatusUpdate, user: AuthorizedUser):
    """Update an application step"""
    try:
        # Get user ID from the authenticated user
        user_id = user.sub
            
        applications = get_applications_for_user(user_id)
        for app_index, app in enumerate(applications):
            if app.id == application_id:
                for step_index, step in enumerate(app.steps):
                    if step.id == step_id:
                        # Update the step
                        applications[app_index].steps[step_index].status = update.status
                        applications[app_index].updated_at = datetime.now()
                        
                        if update.notes is not None:
                            applications[app_index].steps[step_index].notes = update.notes
                        
                        if update.due_date is not None:
                            applications[app_index].steps[step_index].due_date = update.due_date
                        
                        # If status is changing to completed, set completed_at
                        if update.status == "completed" and applications[app_index].steps[step_index].completed_at is None:
                            applications[app_index].steps[step_index].completed_at = datetime.now()
                        
                        save_application(applications[app_index])
                        return ApplicationStepListResponse(steps=applications[app_index].steps)
                
                raise HTTPException(status_code=404, detail="Step not found")
        
        raise HTTPException(status_code=404, detail="Application not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update step: {str(e)}") from e

@router.post("/applications/{application_id}/steps")
def add_application_step(application_id: str, step: ApplicationStep, user: AuthorizedUser):
    """Add a new step to an application"""
    try:
        # Get user ID from the authenticated user
        user_id = user.sub
            
        applications = get_applications_for_user(user_id)
        for i, app in enumerate(applications):
            if app.id == application_id:
                # Generate a new ID if not provided
                if not step.id:
                    step.id = str(uuid.uuid4())
                
                # Add the step
                applications[i].steps.append(step)
                applications[i].updated_at = datetime.now()
                
                save_application(applications[i])
                return ApplicationStepListResponse(steps=applications[i].steps)
        
        raise HTTPException(status_code=404, detail="Application not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add step: {str(e)}") from e

@router.delete("/applications/{application_id}/steps/{step_id}")
def delete_application_step(application_id: str, step_id: str, user: AuthorizedUser):
    """Delete a step from an application"""
    try:
        # Get user ID from the authenticated user
        user_id = user.sub
            
        applications = get_applications_for_user(user_id)
        for i, app in enumerate(applications):
            if app.id == application_id:
                # Find and remove the step
                for j, step in enumerate(app.steps):
                    if step.id == step_id:
                        applications[i].steps.pop(j)
                        applications[i].updated_at = datetime.now()
                        
                        save_application(applications[i])
                        return ApplicationStepListResponse(steps=applications[i].steps)
                
                raise HTTPException(status_code=404, detail="Step not found")
        
        raise HTTPException(status_code=404, detail="Application not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete step: {str(e)}") from e

@router.post("/applications/{application_id}/documents")
def prepare_document_upload(application_id: str, request: DocumentUploadRequest, user: AuthorizedUser):
    """Prepare for document upload and return upload URL"""
    try:
        # Get user ID from the authenticated user
        user_id = user.sub
            
        # Validate the application exists
        applications = get_applications_for_user(user_id)
        application = None
        for app in applications:
            if app.id == application_id:
                application = app
                break
        
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
        
        # Generate document ID and prepare storage key
        document_id = str(uuid.uuid4())
        file_key = f"application_docs/{sanitize_storage_key(user.sub)}/{sanitize_storage_key(application_id)}/{sanitize_storage_key(document_id)}"
        
        # Generate a pre-signed URL for upload (implement according to your storage mechanism)
        # This is a placeholder - implement actual URL generation
        upload_url = f"/api/upload-document?key={file_key}"
        
        return DocumentUploadResponse(document_id=document_id, upload_url=upload_url)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to prepare document upload: {str(e)}") from e

@router.post("/applications/{application_id}/documents/{document_id}/confirm")
def confirm_document_upload(application_id: str, document_id: str, request: DocumentUploadRequest, user: AuthorizedUser):
    """Confirm document upload and add to the application"""
    try:
        # Get user ID from the authenticated user
        user_id = user.sub
            
        # Validate the application exists
        applications = get_applications_for_user(user_id)
        application_index = None
        for i, app in enumerate(applications):
            if app.id == application_id:
                application_index = i
                break
        
        if application_index is None:
            raise HTTPException(status_code=404, detail="Application not found")
        
        # Create the document object
        file_key = f"application_docs/{sanitize_storage_key(user.sub)}/{sanitize_storage_key(application_id)}/{sanitize_storage_key(document_id)}"
        document = Document(
            id=document_id,
            name=request.name,
            type=request.type,
            uploaded_at=datetime.now(),
            file_key=file_key,
            status="pending"
        )
        
        # Add document to application or step
        if request.step_id:
            step_found = False
            for i, step in enumerate(applications[application_index].steps):
                if step.id == request.step_id:
                    applications[application_index].steps[i].documents.append(document)
                    step_found = True
                    break
            
            if not step_found:
                raise HTTPException(status_code=404, detail="Step not found")
        else:
            applications[application_index].documents.append(document)
        
        applications[application_index].updated_at = datetime.now()
        save_application(applications[application_index])
        
        return document
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to confirm document upload: {str(e)}") from e

@router.get("/applications/{application_id}/documents")
def list_documents(application_id: str, user: AuthorizedUser, step_id: Optional[str] = None):
    """List documents for an application or step"""
    try:
        # Get user ID from the authenticated user
        user_id = user.sub
            
        # Validate the application exists
        applications = get_applications_for_user(user_id)
        application = None
        for app in applications:
            if app.id == application_id:
                application = app
                break
        
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
        
        # Return documents for step or application
        if step_id:
            for step in application.steps:
                if step.id == step_id:
                    return DocumentListResponse(documents=step.documents)
            raise HTTPException(status_code=404, detail="Step not found")
        else:
            return DocumentListResponse(documents=application.documents)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list documents: {str(e)}") from e

@router.delete("/applications/{application_id}/documents/{document_id}")
def delete_document(application_id: str, document_id: str, user: AuthorizedUser, step_id: Optional[str] = None):
    """Delete a document from an application or step"""
    try:
        # Get user ID from the authenticated user
        user_id = user.sub
            
        # Validate the application exists
        applications = get_applications_for_user(user_id)
        application_index = None
        for i, app in enumerate(applications):
            if app.id == application_id:
                application_index = i
                break
        
        if application_index is None:
            raise HTTPException(status_code=404, detail="Application not found")
        
        # Delete document from step or application
        if step_id:
            step_found = False
            for i, step in enumerate(applications[application_index].steps):
                if step.id == step_id:
                    for j, doc in enumerate(step.documents):
                        if doc.id == document_id:
                            applications[application_index].steps[i].documents.pop(j)
                            applications[application_index].updated_at = datetime.now()
                            save_application(applications[application_index])
                            return {"message": "Document deleted successfully"}
                    step_found = True
                    break
            
            if step_found:
                raise HTTPException(status_code=404, detail="Document not found")
            else:
                raise HTTPException(status_code=404, detail="Step not found")
        else:
            for i, doc in enumerate(applications[application_index].documents):
                if doc.id == document_id:
                    applications[application_index].documents.pop(i)
                    applications[application_index].updated_at = datetime.now()
                    save_application(applications[application_index])
                    return {"message": "Document deleted successfully"}
            
            raise HTTPException(status_code=404, detail="Document not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete document: {str(e)}") from e
