from fastapi import APIRouter, HTTPException, Body, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union, Literal
from datetime import date, datetime
from enum import Enum

router = APIRouter()

# Business Structure Type Enum
class BusinessStructureType(str, Enum):
    COMPANY = "company"
    TRUST = "trust"
    PARTNERSHIP = "partnership"
    SOLE_TRADER = "soleTrader"

# GST Frequency Enum
class GSTFrequency(str, Enum):
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    ANNUALLY = "annually"

# Base Models
class Address(BaseModel):
    line1: str
    line2: Optional[str] = None
    suburb: str
    state: str
    postcode: str
    country: str

class ContactDetails(BaseModel):
    email: str
    phone: Optional[str] = None
    address: Address
    postal_address: Optional[Address] = None

class Individual(BaseModel):
    id: str
    first_name: str
    last_name: str
    date_of_birth: date
    tfn: str
    residency_status: Literal["resident", "foreignResident", "workingHolidayMaker", "other"]
    contact_details: ContactDetails

class Shareholding(BaseModel):
    share_class: str
    number_of_shares: int
    percentage_owned: float
    paid_value: float
    unpaid_value: float

class Director(BaseModel):
    id: str
    first_name: str
    last_name: str
    date_of_birth: date
    tfn: str
    residency_status: Literal["resident", "foreignResident", "workingHolidayMaker", "other"]
    contact_details: ContactDetails
    director_id: str
    appointment_date: date
    cessor_date: Optional[date] = None
    shareholding: Optional[List[Shareholding]] = None

# Ownership Detail
class OwnershipDetail(BaseModel):
    owned_entity_id: str = Field(description="ID of the entity that is owned")
    percentage: float = Field(gt=0, le=100, description="Ownership percentage")

# Business Entities
class BusinessEntityBase(BaseModel):
    id: str
    name: str
    abn: str
    business_structure: BusinessStructureType
    tfn: str
    registered_for_gst: bool
    gst_frequency: Optional[GSTFrequency] = None
    local_currency: str = Field(description="Local currency code (e.g., AUD, USD)") # Added for FX
    created_at: datetime
    updated_at: datetime
    parent_entity_id: Optional[str] = Field(None, description="ID of the parent entity in a hierarchy")
    ownership_details: Optional[List[OwnershipDetail]] = Field(None, description="Details of entities owned by this entity")

class Company(BusinessEntityBase):
    business_structure: Literal[BusinessStructureType.COMPANY]
    acn: str
    directors: List[Director]
    company_type: Literal["proprietary", "public", "notForProfit"]
    substituted_accounting_period: bool
    sap_start_date: Optional[date] = None
    sap_end_date: Optional[date] = None

class Partner(BaseModel):
    entity_id: str
    entity_type: Literal["individual", "company", "trust"]
    partnership_interest: float
    profit_sharing_ratio: float
    loss_sharing_ratio: float

class Partnership(BusinessEntityBase):
    business_structure: Literal[BusinessStructureType.PARTNERSHIP]
    partners: List[Partner]
    partnership_type: Literal["general", "limited", "jointVenture"]

class Trust(BusinessEntityBase):
    business_structure: Literal[BusinessStructureType.TRUST]
    trust_type: Literal["discretionary", "unit", "hybrid", "fixed", "other"]
    trust_deed_date: date
    trustee_id: str
    trustee_type: Literal["individual", "company"]
    beneficiary_ids: List[str]

class SoleTrader(BusinessEntityBase):
    business_structure: Literal[BusinessStructureType.SOLE_TRADER]
    individual_id: str

# Date Range
class DateRange(BaseModel):
    start_date: date
    end_date: date
    label: Optional[str] = None

# Tax Obligations and Reporting
class Attachment(BaseModel):
    id: str
    file_name: str
    file_type: str
    file_size: int
    upload_date: datetime
    url: str
    description: Optional[str] = None

class TaxObligation(BaseModel):
    id: str
    entity_id: str
    obligation_type: Literal["income", "bas", "ias", "payg", "fbt", "superannuation", "other"]
    due_date: date
    lodgement_date: Optional[date] = None
    payment_due_date: date
    payment_date: Optional[date] = None
    status: Literal["upcoming", "due", "overdue", "lodged", "paid", "deferred"]
    amount: float
    description: Optional[str] = None
    period: DateRange
    attachments: Optional[List[Attachment]] = None

class TaxDeduction(BaseModel):
    id: str
    category: str
    description: str
    amount: float
    evidence: List[Attachment] = []

class TaxCredit(BaseModel):
    id: str
    category: str
    description: str
    amount: float
    evidence: List[Attachment] = []

class TaxSchedule(BaseModel):
    id: str
    schedule_type: str
    description: str
    data: Dict[str, Any]
    completed: bool

class TaxReturn(BaseModel):
    id: str
    entity_id: str
    financial_year: str
    status: Literal["notStarted", "inProgress", "readyForReview", "reviewed", "lodged", "processed"]
    due_date: date
    lodgement_date: Optional[date] = None
    assessment_date: Optional[date] = None
    assessment_amount: Optional[float] = None
    taxable_income: float
    tax_payable: float
    refund_amount: Optional[float] = None
    deductions: List[TaxDeduction] = []
    credits: List[TaxCredit] = []
    schedules: List[TaxSchedule] = []
    attachments: List[Attachment] = []

class BASStatement(BaseModel):
    id: str
    entity_id: str
    period: DateRange
    status: Literal["notStarted", "inProgress", "readyForReview", "reviewed", "lodged", "processed"]
    due_date: date
    lodgement_date: Optional[date] = None
    gst_collected: float
    gst_paid: float
    gst_net_amount: float
    sales_total: float
    purchases_total: float
    payg_withholding: float
    payg_installments: float
    total_payable: float
    total_refundable: float
    payment_date: Optional[date] = None
    payment_method: Optional[str] = None
    attachments: List[Attachment] = []

class FBTBenefit(BaseModel):
    id: str
    benefit_type: Literal["car", "housing", "expense", "loan", "debtWaiver", "meal", "other"]
    description: str
    employee_id: Optional[str] = None
    gross_value: float
    taxable_value: float
    gst_amount: Optional[float] = None
    evidence: List[Attachment] = []

class FBTReturn(BaseModel):
    id: str
    entity_id: str
    fbt_year: str
    status: Literal["notStarted", "inProgress", "readyForReview", "reviewed", "lodged", "processed"]
    due_date: date
    lodgement_date: Optional[date] = None
    total_gross_value: float
    total_taxable: float
    total_exempt: float
    fbt_payable: float
    benefits: List[FBTBenefit] = []
    attachments: List[Attachment] = []

# Tax Planning and Adjustments
class TaxAdjustment(BaseModel):
    id: str
    description: str
    amount: float
    adjustment_type: Literal["permanent", "timing"]
    category: str
    direction: Literal["add", "subtract"]
    workpapers: List[Attachment] = []

class TaxReportingSchema(BaseModel):
    entity_id: str
    reporting_year: str
    account_code_to_tax_item_mappings: Dict[str, str]
    financial_to_tax_category_mappings: Dict[str, str]
    custom_adjustments: List[TaxAdjustment] = []

class TaxAssumption(BaseModel):
    id: str
    category: str
    description: str
    assumption_type: Literal["revenue", "expense", "deduction", "credit", "rate"]
    base_value: float
    projected_value: float
    growth_rate: Optional[float] = None
    notes: Optional[str] = None

class TaxStrategy(BaseModel):
    id: str
    name: str
    description: str
    implementation_steps: List[str]
    risk_level: Literal["low", "medium", "high"]
    estimated_savings: float
    timing_impact: Literal["immediate", "shortTerm", "longTerm"]
    approval_status: Literal["proposed", "approved", "implemented", "rejected"]

class ProjectedTaxOutcome(BaseModel):
    taxable_income: float
    tax_payable: float
    effective_tax_rate: float
    cashflow_impact: float

class CompareToBaseline(BaseModel):
    tax_savings: float
    cashflow_improvement: float

class TaxPlanningScenario(BaseModel):
    id: str
    entity_id: str
    name: str
    description: str
    base_financial_year: str
    projection_period: DateRange
    assumptions: List[TaxAssumption] = []
    projected_tax_outcome: ProjectedTaxOutcome
    strategies: List[TaxStrategy] = []
    compare_to_baseline: CompareToBaseline
    created_at: datetime
    updated_at: datetime

# Example endpoints (placeholders for implementation)
@router.get("/business-entities/{entity_id}")
def get_business_entity2(entity_id: str):
    """Get a business entity by ID"""
    # Implementation would retrieve entity from database
    return {"message": f"Retrieved entity {entity_id}"}

@router.post("/business-entities/")
def create_business_entity2(entity_type: BusinessStructureType, entity: Union[Company, Trust, Partnership, SoleTrader] = Body(...)):
    """Create a new business entity"""
    # Implementation would save entity to database
    return {"message": f"Created {entity_type} entity", "id": "new-entity-id"}

@router.get("/tax-obligations/{entity_id}")
def get_tax_obligations(entity_id: str, period_start: Optional[date] = None, period_end: Optional[date] = None):
    """Get tax obligations for an entity"""
    # Implementation would retrieve obligations from database
    return {"message": f"Retrieved obligations for {entity_id}"}

@router.post("/tax-returns/")
def create_tax_return(tax_return: TaxReturn):
    """Create a new tax return"""
    # Implementation would save tax return to database
    return {"message": "Created tax return", "id": tax_return.id}

@router.post("/bas-statements/")
def create_bas_statement(bas_statement: BASStatement):
    """Create a new BAS statement"""
    # Implementation would save BAS statement to database
    return {"message": "Created BAS statement", "id": bas_statement.id}

@router.post("/tax-planning/scenarios/")
def create_tax_planning_scenario(scenario: TaxPlanningScenario):
    """Create a new tax planning scenario"""
    # Implementation would save tax planning scenario to database
    return {"message": "Created tax planning scenario", "id": scenario.id}
