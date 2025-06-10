
import datetime
from typing import Any, Dict, List, Optional

from app.auth import AuthorizedUser  # Import authentication dependency
# from app.firebase_config import db  # Import Firestore client instance - Temporarily Disabled
from fastapi import APIRouter, HTTPException
# from google.cloud import firestore  # Import Firestore library elements (Commented out as API is disabled)
from pydantic import BaseModel, Field

router = APIRouter(prefix="/business-plans", tags=["Business Plans"])

# --- Pydantic Models ---

# Nested models for sections (matching Firestore structure)
# Add more detail/fields to these as specific UI inputs are defined later
class ExecutiveSummaryModel(BaseModel):
    content: Optional[str] = None

class CompanyDescriptionModel(BaseModel):
    mission: Optional[str] = None
    vision: Optional[str] = None
    values: Optional[List[str]] = None
    legalStructure: Optional[str] = None
    history: Optional[str] = None

class MarketAnalysisModel(BaseModel):
    targetMarket: Optional[str] = None
    marketSize: Optional[str] = None
    trends: Optional[str] = None
    competitors: Optional[List[Dict[str, Any]]] = None # Example: [{"name": "Comp A", "analysis": "..."}]

class OrganizationManagementModel(BaseModel):
    teamStructure: Optional[str] = None
    keyPersonnel: Optional[List[Dict[str, Any]]] = None # Example: [{"name": "Jane Doe", "role": "CEO", "bio": "..."}]
    advisoryBoard: Optional[str] = None

class ProductsServicesModel(BaseModel):
    description: Optional[str] = None
    lifecycle: Optional[str] = None
    intellectualProperty: Optional[str] = None
    researchDevelopment: Optional[str] = None

class MarketingSalesStrategyModel(BaseModel):
    positioning: Optional[str] = None
    pricing: Optional[str] = None
    promotion: Optional[str] = None
    distribution: Optional[str] = None
    salesProcess: Optional[str] = None

class FinancialProjectionsModel(BaseModel):
    startupCosts: Optional[List[Dict[str, Any]]] = None # Example: [{"item": "Rent", "amount": 5000}]
    historicalSummary: Optional[str] = None
    salesForecast: Optional[List[Dict[str, Any]]] = None # Example: [{"year": 1, "revenue": 100000}]
    fundingRequest: Optional[Dict[str, Any]] = None # Example: {"amount": 50000, "purpose": "..."}

class AppendixModel(BaseModel):
    documents: Optional[List[Dict[str, Any]]] = None # Example: [{"name": "Survey.pdf", "url": "gs://..."}]

# Main model for Business Plan Data (used for saving/loading full plan)
class BusinessPlanData(BaseModel):
    planName: str = Field(..., example="My Startup Plan v1")
    planType: str = Field(..., example="new") # "new" or "existing"
    versionNotes: Optional[str] = Field(None, example="Initial draft focusing on market")
    executiveSummary: Optional[ExecutiveSummaryModel] = None
    companyDescription: Optional[CompanyDescriptionModel] = None
    marketAnalysis: Optional[MarketAnalysisModel] = None
    organizationManagement: Optional[OrganizationManagementModel] = None
    productsServices: Optional[ProductsServicesModel] = None
    marketingSalesStrategy: Optional[MarketingSalesStrategyModel] = None
    financialProjections: Optional[FinancialProjectionsModel] = None
    appendix: Optional[AppendixModel] = None
    # Timestamps and userId are handled server-side, planId is path/response

# Model for listing plans (metadata only)
class BusinessPlanMetadata(BaseModel):
    planId: str
    planName: str
    planType: str
    lastSavedAt: datetime.datetime
    versionNotes: Optional[str] = None

class SavePlanResponse(BaseModel):
    planId: str
    message: str

# --- API Endpoints ---

@router.post("/save", response_model=SavePlanResponse)
async def save_business_plan(
    plan_data: BusinessPlanData,
    user: AuthorizedUser  # Inject authorized user
):
    """
    Saves a new version of the business plan to Firestore for the logged-in user.
    Each save creates a new document, providing basic versioning.
    (Temporarily Disabled)
    """
    raise HTTPException(status_code=501, detail="Save functionality temporarily disabled")
    # try:
    #     user_id = user.sub
    #     plan_dict = plan_data.model_dump(exclude_unset=True) # Use model_dump for Pydantic v2+
    #
    #     # Add server-side metadata
    #     plan_dict['userId'] = user_id
    #     plan_dict['createdAt'] = firestore.SERVER_TIMESTAMP
    #     plan_dict['lastSavedAt'] = firestore.SERVER_TIMESTAMP
    #
    #     # Add to the user's subcollection - add() creates a new doc with auto-ID
    #     _, doc_ref = db.collection('users').document(user_id).collection('business_plans').add(plan_dict)
    #
    #     print(f"Saved business plan {doc_ref.id} for user {user_id}")
    #     return SavePlanResponse(planId=doc_ref.id, message="Business plan saved successfully")
    #
    # except Exception as e:
    #     print(f"Error saving business plan for user {user_id}: {e}")
    #     raise HTTPException(status_code=500, detail="Failed to save business plan")


@router.get("/list", response_model=List[BusinessPlanMetadata])
async def list_business_plans(
    user: AuthorizedUser  # Inject authorized user
):
    """
    Lists all saved business plans (metadata only) for the logged-in user,
    ordered by last saved date descending.
    (Temporarily Disabled)
    """
    raise HTTPException(status_code=501, detail="List functionality temporarily disabled")
    # try:
    #     user_id = user.sub
    #     plans_ref = db.collection('users').document(user_id).collection('business_plans')
    #     query = plans_ref.order_by('lastSavedAt', direction=firestore.Query.DESCENDING)
    #     docs = query.stream()
    #
    #     plan_list = []
    #     for doc in docs:
    #         data = doc.to_dict()
    #         # Ensure lastSavedAt exists and is a datetime before adding
    #         if 'lastSavedAt' in data and isinstance(data.get('lastSavedAt'), datetime.datetime):
    #             plan_list.append(
    #                 BusinessPlanMetadata(
    #                     planId=doc.id,
    #                     planName=data.get('planName', 'Untitled Plan'),
    #                     planType=data.get('planType', 'unknown'),
    #                     lastSavedAt=data['lastSavedAt'],
    #                     versionNotes=data.get('versionNotes')
    #                 )
    #             )
    #         else:
    #             # Handle cases where lastSavedAt might be missing or not yet converted (e.g., during initial save lag)
    #             # Optionally log this or provide default values
    #             print(f"Skipping plan {doc.id} due to missing or invalid lastSavedAt field.")
    #
    #
    #     print(f"Retrieved {len(plan_list)} plans for user {user_id}")
    #     return plan_list
    #
    # except Exception as e:
    #     print(f"Error listing business plans for user {user_id}: {e}")
    #     raise HTTPException(status_code=500, detail="Failed to list business plans")


@router.get("/load/{plan_id}", response_model=BusinessPlanData)
async def load_business_plan(
    plan_id: str,
    user: AuthorizedUser  # Inject authorized user
):
    """
    Loads the full data for a specific business plan belonging to the logged-in user.
    (Temporarily Disabled)
    """
    raise HTTPException(status_code=501, detail="Load functionality temporarily disabled")
    # try:
    #     user_id = user.sub
    #     doc_ref = db.collection('users').document(user_id).collection('business_plans').document(plan_id)
    #     doc = doc_ref.get()
    #
    #     if not doc.exists:
    #         print(f"Plan {plan_id} not found for user {user_id}")
    #         raise HTTPException(status_code=404, detail="Business plan not found")
    #
    #     plan_data = doc.to_dict()
    #     # Add planId to the response if needed by frontend, although it's in the URL
    #     # plan_data['planId'] = doc.id
    #     print(f"Loaded plan {plan_id} for user {user_id}")
    #     # Pydantic will validate the loaded dictionary against the BusinessPlanData model
    #     return BusinessPlanData(**plan_data)
    #
    # except Exception as e:
    #     print(f"Error loading business plan {plan_id} for user {user_id}: {e}")
    #     # Re-raise specific exceptions if needed, otherwise generic 500
    #     if isinstance(e, HTTPException):
    #          raise e
    #     raise HTTPException(status_code=500, detail="Failed to load business plan")

