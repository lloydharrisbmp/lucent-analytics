from fastapi import APIRouter, HTTPException, Body, Path, Query, Depends
from pydantic import BaseModel, Field
from enum import Enum
from typing import List, Dict, Optional, Union, Literal, Any
from datetime import date, datetime
import databutton as db
import json
import uuid

# Import models from tax_compliance_schema
from app.apis.tax_compliance_schema import (
    BusinessStructureType,
    DateRange,
    TaxReturn,
    TaxDeduction,
    TaxCredit,
    TaxSchedule,
    Company,
    Trust,
    Partnership,
    SoleTrader
)

# Import calculation functions from tax_calculator
from app.apis.tax_calculator import (
    calculate_tax_for_business,
    calculate_gst,
    BusinessEntityRequest,
    FinancialData
)

router = APIRouter()

# Request and Response Models
class CompanyTaxDataRequest(BaseModel):
    """Company-specific tax data"""
    acn: str
    company_type: Literal["proprietary", "public", "notForProfit"]
    substituted_accounting_period: bool = False
    sap_start_date: Optional[date] = None
    sap_end_date: Optional[date] = None
    foreign_income: Optional[float] = 0
    franking_credits: Optional[float] = 0
    r_and_d_expenditure: Optional[float] = 0

class TrustTaxDataRequest(BaseModel):
    """Trust-specific tax data"""
    trust_type: Literal["discretionary", "unit", "hybrid", "fixed", "other"]
    trust_deed_date: date
    trustee_id: str
    trustee_type: Literal["individual", "company"]
    beneficiary_ids: List[str]
    distributions: Optional[List[Dict[str, Any]]] = []
    capital_gains: Optional[float] = 0

class PartnershipTaxDataRequest(BaseModel):
    """Partnership-specific tax data"""
    partnership_type: Literal["general", "limited", "jointVenture"]
    partners: List[Dict[str, Any]]
    partnership_income: Optional[float] = None
    partner_salaries: Optional[float] = 0

class SoleTraderTaxDataRequest(BaseModel):
    """Sole trader-specific tax data"""
    individual_id: str
    income_streams: Optional[List[Dict[str, Any]]] = []
    personal_deductions: Optional[List[Dict[str, Any]]] = []
    tax_offsets: Optional[List[Dict[str, Any]]] = []

class EntitySpecificTaxData(BaseModel):
    """Entity-specific tax data based on business structure"""
    company_data: Optional[CompanyTaxDataRequest] = None
    trust_data: Optional[TrustTaxDataRequest] = None
    partnership_data: Optional[PartnershipTaxDataRequest] = None
    sole_trader_data: Optional[SoleTraderTaxDataRequest] = None

class TaxReturnRequest(BaseModel):
    """Request for generating a tax return"""
    entity: BusinessEntityRequest
    financial_data: FinancialData
    financial_year: str  # e.g., "2022-2023"
    entity_specific_data: EntitySpecificTaxData
    additional_deductions: Optional[List[Dict[str, Any]]] = []
    additional_credits: Optional[List[Dict[str, Any]]] = []

# Tax return generation functions
def generate_tax_schedule(business_structure: BusinessStructureType, financial_year: str) -> List[TaxSchedule]:
    """Generate required tax schedules based on entity type"""
    schedules = []
    
    # Base schedule for all entities
    schedules.append(TaxSchedule(
        id=str(uuid.uuid4()),
        schedule_type="income",
        description="Income Statement",
        data={"status": "incomplete"},
        completed=False
    ))
    
    # Entity-specific schedules
    if business_structure == BusinessStructureType.COMPANY:
        schedules.extend([
            TaxSchedule(
                id=str(uuid.uuid4()),
                schedule_type="franking_account",
                description="Franking Account Details",
                data={"status": "incomplete"},
                completed=False
            ),
            TaxSchedule(
                id=str(uuid.uuid4()),
                schedule_type="capital_allowances",
                description="Capital Allowances",
                data={"status": "incomplete"},
                completed=False
            )
        ])
    elif business_structure == BusinessStructureType.TRUST:
        schedules.extend([
            TaxSchedule(
                id=str(uuid.uuid4()),
                schedule_type="trust_details",
                description="Trust Details",
                data={"status": "incomplete"},
                completed=False
            ),
            TaxSchedule(
                id=str(uuid.uuid4()),
                schedule_type="beneficiary_details",
                description="Beneficiary Information",
                data={"status": "incomplete"},
                completed=False
            )
        ])
    elif business_structure == BusinessStructureType.PARTNERSHIP:
        schedules.extend([
            TaxSchedule(
                id=str(uuid.uuid4()),
                schedule_type="partnership_details",
                description="Partnership Information",
                data={"status": "incomplete"},
                completed=False
            ),
            TaxSchedule(
                id=str(uuid.uuid4()),
                schedule_type="partner_details",
                description="Partner Information",
                data={"status": "incomplete"},
                completed=False
            )
        ])
    elif business_structure == BusinessStructureType.SOLE_TRADER:
        schedules.extend([
            TaxSchedule(
                id=str(uuid.uuid4()),
                schedule_type="business_income",
                description="Business Income and Expenses",
                data={"status": "incomplete"},
                completed=False
            ),
            TaxSchedule(
                id=str(uuid.uuid4()),
                schedule_type="personal_deductions",
                description="Personal Deductions",
                data={"status": "incomplete"},
                completed=False
            )
        ])
    
    return schedules

def calculate_due_date(financial_year: str, business_structure: BusinessStructureType) -> date:
    """Calculate tax return due date based on entity type and financial year"""
    # Extract the end year from the financial year (e.g., "2023" from "2022-2023")
    end_year = int(financial_year.split("-")[1])
    
    # Different due dates based on entity type
    if business_structure == BusinessStructureType.COMPANY or business_structure == BusinessStructureType.TRUST:
        # Companies and trusts typically due by 2nd Sunday in May or 15 May
        # Simplified to just use May 15
        return date(end_year, 5, 15)
    elif business_structure == BusinessStructureType.PARTNERSHIP:
        # Partnerships typically due by October 31
        return date(end_year, 10, 31)
    elif business_structure == BusinessStructureType.SOLE_TRADER:
        # Sole traders typically due by October 31
        return date(end_year, 10, 31)
    else:
        # Default to end of financial year + 4 months
        return date(end_year, 10, 31)

def process_company_tax_return(request: TaxReturnRequest, base_tax_calc: Dict[str, Any]) -> TaxReturn:
    """Process tax return for a company"""
    if not request.entity_specific_data.company_data:
        raise HTTPException(status_code=400, detail="Company-specific data required for company tax return")
    
    company_data = request.entity_specific_data.company_data
    
    # Calculate taxable income with company-specific adjustments
    taxable_income = base_tax_calc["taxable_income"]
    
    # Apply R&D tax incentive if applicable
    r_and_d_offset = 0
    if company_data.r_and_d_expenditure and company_data.r_and_d_expenditure > 0:
        # R&D tax incentive (simplified calculation)
        r_and_d_offset = company_data.r_and_d_expenditure * 0.435  # 43.5% refundable tax offset for eligible entities
    
    # Apply franking credits
    franking_credit_offset = company_data.franking_credits or 0
    
    # Apply foreign income tax offset for foreign income (simplified)
    foreign_tax_offset = 0
    if company_data.foreign_income and company_data.foreign_income > 0:
        foreign_tax_offset = company_data.foreign_income * 0.15  # Simplified rate
        # Cap the foreign income tax offset
        foreign_tax_offset = min(foreign_tax_offset, base_tax_calc["tax_payable"] * 0.2)
    
    # Tax credits
    tax_credits = [
        TaxCredit(
            id=str(uuid.uuid4()),
            category="R&D Tax Incentive",
            description="Research and Development Tax Incentive",
            amount=r_and_d_offset,
            evidence=[]
        ),
        TaxCredit(
            id=str(uuid.uuid4()),
            category="Franking Credits",
            description="Franking Credits on Dividends Received",
            amount=franking_credit_offset,
            evidence=[]
        ),
        TaxCredit(
            id=str(uuid.uuid4()),
            category="Foreign Income Tax Offset",
            description="Tax Paid on Foreign Income",
            amount=foreign_tax_offset,
            evidence=[]
        )
    ]
    
    # Add any additional credits
    for credit in request.additional_credits or []:
        tax_credits.append(TaxCredit(
            id=str(uuid.uuid4()),
            category=credit.get("category", "Other"),
            description=credit.get("description", "Additional Credit"),
            amount=credit.get("amount", 0),
            evidence=[]
        ))
    
    # Calculate total credits
    total_credits = sum(credit.amount for credit in tax_credits)
    
    # Final tax calculation
    tax_payable = max(0, base_tax_calc["tax_payable"] - total_credits)
    
    # Convert deductions
    deductions = [
        TaxDeduction(
            id=deduction.get("id", str(uuid.uuid4())),
            category=deduction.get("category", ""),
            description=deduction.get("description", ""),
            amount=deduction.get("amount", 0),
            evidence=[]
        ) for deduction in base_tax_calc["deductions"]
    ]
    
    # Add additional deductions
    for deduction in request.additional_deductions or []:
        deductions.append(TaxDeduction(
            id=str(uuid.uuid4()),
            category=deduction.get("category", "Other"),
            description=deduction.get("description", "Additional Deduction"),
            amount=deduction.get("amount", 0),
            evidence=[]
        ))
    
    # Generate schedules
    schedules = generate_tax_schedule(BusinessStructureType.COMPANY, request.financial_year)
    
    # Calculate due date
    due_date = calculate_due_date(request.financial_year, BusinessStructureType.COMPANY)
    
    # Create tax return
    return TaxReturn(
        id=f"tax-return-{request.entity.id}-{request.financial_year}",
        entity_id=request.entity.id,
        financial_year=request.financial_year,
        status="notStarted",
        due_date=due_date,
        taxable_income=taxable_income,
        tax_payable=tax_payable,
        deductions=deductions,
        credits=tax_credits,
        schedules=schedules,
        attachments=[]
    )

def process_trust_tax_return(request: TaxReturnRequest, base_tax_calc: Dict[str, Any]) -> TaxReturn:
    """Process tax return for a trust"""
    if not request.entity_specific_data.trust_data:
        raise HTTPException(status_code=400, detail="Trust-specific data required for trust tax return")
    
    trust_data = request.entity_specific_data.trust_data
    
    # For trusts, tax is generally paid by beneficiaries
    # The trust return calculates the trust's income/loss and allocates to beneficiaries
    
    # Add in any capital gains
    capital_gains = trust_data.capital_gains or 0
    taxable_income = base_tax_calc["taxable_income"] + capital_gains
    
    # For most trusts, tax payable by the trust is zero unless there is undistributed income
    # or special cases like non-resident beneficiaries
    tax_payable = 0
    
    # Check if there are distributions
    total_distributions = 0
    for distribution in trust_data.distributions or []:
        total_distributions += distribution.get("amount", 0)
    
    # If undistributed income, trustee pays tax at highest marginal rate (47%)
    undistributed = max(0, taxable_income - total_distributions)
    if undistributed > 0:
        tax_payable = undistributed * 0.47
    
    # Convert deductions
    deductions = [
        TaxDeduction(
            id=deduction.get("id", str(uuid.uuid4())),
            category=deduction.get("category", ""),
            description=deduction.get("description", ""),
            amount=deduction.get("amount", 0),
            evidence=[]
        ) for deduction in base_tax_calc["deductions"]
    ]
    
    # Add additional deductions
    for deduction in request.additional_deductions or []:
        deductions.append(TaxDeduction(
            id=str(uuid.uuid4()),
            category=deduction.get("category", "Other"),
            description=deduction.get("description", "Additional Deduction"),
            amount=deduction.get("amount", 0),
            evidence=[]
        ))
    
    # Generate schedules
    schedules = generate_tax_schedule(BusinessStructureType.TRUST, request.financial_year)
    
    # Calculate due date
    due_date = calculate_due_date(request.financial_year, BusinessStructureType.TRUST)
    
    # Create tax return
    return TaxReturn(
        id=f"tax-return-{request.entity.id}-{request.financial_year}",
        entity_id=request.entity.id,
        financial_year=request.financial_year,
        status="notStarted",
        due_date=due_date,
        taxable_income=taxable_income,
        tax_payable=tax_payable,
        deductions=deductions,
        credits=[],  # Trusts typically don't claim credits directly
        schedules=schedules,
        attachments=[]
    )

def process_partnership_tax_return(request: TaxReturnRequest, base_tax_calc: Dict[str, Any]) -> TaxReturn:
    """Process tax return for a partnership"""
    if not request.entity_specific_data.partnership_data:
        raise HTTPException(status_code=400, detail="Partnership-specific data required for partnership tax return")
    
    partnership_data = request.entity_specific_data.partnership_data
    
    # For partnerships, the partnership itself doesn't pay tax
    # Income/loss is distributed to partners based on partnership agreement
    
    # Use the partnership's net income or provided partnership income
    partnership_income = partnership_data.partnership_income or base_tax_calc["taxable_income"]
    
    # Adjust for partner salaries if applicable
    adjusted_partnership_income = partnership_income - (partnership_data.partner_salaries or 0)
    
    # Partnership tax return shows income/loss but no tax payable (tax paid by partners)
    tax_payable = 0
    
    # Convert deductions
    deductions = [
        TaxDeduction(
            id=deduction.get("id", str(uuid.uuid4())),
            category=deduction.get("category", ""),
            description=deduction.get("description", ""),
            amount=deduction.get("amount", 0),
            evidence=[]
        ) for deduction in base_tax_calc["deductions"]
    ]
    
    # Add additional deductions
    for deduction in request.additional_deductions or []:
        deductions.append(TaxDeduction(
            id=str(uuid.uuid4()),
            category=deduction.get("category", "Other"),
            description=deduction.get("description", "Additional Deduction"),
            amount=deduction.get("amount", 0),
            evidence=[]
        ))
    
    # Generate schedules
    schedules = generate_tax_schedule(BusinessStructureType.PARTNERSHIP, request.financial_year)
    
    # Calculate due date
    due_date = calculate_due_date(request.financial_year, BusinessStructureType.PARTNERSHIP)
    
    # Create tax return
    return TaxReturn(
        id=f"tax-return-{request.entity.id}-{request.financial_year}",
        entity_id=request.entity.id,
        financial_year=request.financial_year,
        status="notStarted",
        due_date=due_date,
        taxable_income=adjusted_partnership_income,
        tax_payable=tax_payable,
        deductions=deductions,
        credits=[],  # Partnerships don't claim credits directly
        schedules=schedules,
        attachments=[]
    )

def process_sole_trader_tax_return(request: TaxReturnRequest, base_tax_calc: Dict[str, Any]) -> TaxReturn:
    """Process tax return for a sole trader"""
    if not request.entity_specific_data.sole_trader_data:
        raise HTTPException(status_code=400, detail="Sole trader-specific data required for sole trader tax return")
    
    sole_trader_data = request.entity_specific_data.sole_trader_data
    
    # Taxable income is business income plus any other personal income streams
    additional_income = 0
    for income in sole_trader_data.income_streams or []:
        additional_income += income.get("amount", 0)
    
    taxable_income = base_tax_calc["taxable_income"] + additional_income
    
    # Calculate personal deductions
    personal_deduction_total = 0
    for deduction in sole_trader_data.personal_deductions or []:
        personal_deduction_total += deduction.get("amount", 0)
    
    # Adjust taxable income for personal deductions
    taxable_income -= personal_deduction_total
    taxable_income = max(0, taxable_income)  # Can't be negative
    
    # Calculate tax based on individual tax rates
    tax_payable = 0
    if taxable_income <= 18200:
        tax_payable = 0
    elif taxable_income <= 45000:
        tax_payable = (taxable_income - 18200) * 0.19
    elif taxable_income <= 120000:
        tax_payable = 5092 + (taxable_income - 45000) * 0.325
    elif taxable_income <= 180000:
        tax_payable = 29467 + (taxable_income - 120000) * 0.37
    else:
        tax_payable = 51667 + (taxable_income - 180000) * 0.45
    
    # Apply tax offsets
    offset_total = 0
    for offset in sole_trader_data.tax_offsets or []:
        offset_total += offset.get("amount", 0)
    
    # Adjust tax payable for offsets
    tax_payable = max(0, tax_payable - offset_total)
    
    # Convert business deductions
    deductions = [
        TaxDeduction(
            id=deduction.get("id", str(uuid.uuid4())),
            category=deduction.get("category", ""),
            description=deduction.get("description", ""),
            amount=deduction.get("amount", 0),
            evidence=[]
        ) for deduction in base_tax_calc["deductions"]
    ]
    
    # Add personal deductions
    for deduction in sole_trader_data.personal_deductions or []:
        deductions.append(TaxDeduction(
            id=str(uuid.uuid4()),
            category=deduction.get("category", "Personal"),
            description=deduction.get("description", "Personal Deduction"),
            amount=deduction.get("amount", 0),
            evidence=[]
        ))
    
    # Add additional deductions
    for deduction in request.additional_deductions or []:
        deductions.append(TaxDeduction(
            id=str(uuid.uuid4()),
            category=deduction.get("category", "Other"),
            description=deduction.get("description", "Additional Deduction"),
            amount=deduction.get("amount", 0),
            evidence=[]
        ))
    
    # Create tax credits from tax offsets
    tax_credits = [
        TaxCredit(
            id=str(uuid.uuid4()),
            category=offset.get("category", "Tax Offset"),
            description=offset.get("description", "Tax Offset"),
            amount=offset.get("amount", 0),
            evidence=[]
        ) for offset in sole_trader_data.tax_offsets or []
    ]
    
    # Add additional credits
    for credit in request.additional_credits or []:
        tax_credits.append(TaxCredit(
            id=str(uuid.uuid4()),
            category=credit.get("category", "Other"),
            description=credit.get("description", "Additional Credit"),
            amount=credit.get("amount", 0),
            evidence=[]
        ))
    
    # Generate schedules
    schedules = generate_tax_schedule(BusinessStructureType.SOLE_TRADER, request.financial_year)
    
    # Calculate due date
    due_date = calculate_due_date(request.financial_year, BusinessStructureType.SOLE_TRADER)
    
    # Create tax return
    return TaxReturn(
        id=f"tax-return-{request.entity.id}-{request.financial_year}",
        entity_id=request.entity.id,
        financial_year=request.financial_year,
        status="notStarted",
        due_date=due_date,
        taxable_income=taxable_income,
        tax_payable=tax_payable,
        deductions=deductions,
        credits=tax_credits,
        schedules=schedules,
        attachments=[]
    )

# API Endpoints
@router.post("/tax-returns/create-tax-return")
def create_tax_return2(request: TaxReturnRequest) -> TaxReturn:
    """Create a tax return for a business entity with entity-specific calculations"""
    # Start with base tax calculations
    base_tax_calc = calculate_tax_for_business(
        entity=request.entity,
        financial_data=request.financial_data
    )
    
    # Process based on business structure
    if request.entity.business_structure == BusinessStructureType.COMPANY:
        return process_company_tax_return(request, base_tax_calc)
    elif request.entity.business_structure == BusinessStructureType.TRUST:
        return process_trust_tax_return(request, base_tax_calc)
    elif request.entity.business_structure == BusinessStructureType.PARTNERSHIP:
        return process_partnership_tax_return(request, base_tax_calc)
    elif request.entity.business_structure == BusinessStructureType.SOLE_TRADER:
        return process_sole_trader_tax_return(request, base_tax_calc)
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported business structure: {request.entity.business_structure}")

@router.post("/tax-planning/create-scenario3")
def create_tax_planning_scenario3(request: TaxReturnRequest) -> Dict[str, Any]:
    """Create an advanced tax planning scenario with entity-specific optimizations"""
    # Start with current tax situation
    base_tax_return = create_tax_return2(request)
    
    # Create standard scenario
    base_scenario = {
        "scenario_id": f"scenario-base-{request.entity.id}",
        "name": "Current Tax Position",
        "taxable_income": base_tax_return.taxable_income,
        "tax_payable": base_tax_return.tax_payable,
        "effective_tax_rate": (base_tax_return.tax_payable / base_tax_return.taxable_income) * 100 if base_tax_return.taxable_income > 0 else 0
    }
    
    # Generate entity-specific optimization strategies
    optimizations = []
    
    if request.entity.business_structure == BusinessStructureType.COMPANY:
        # Company-specific optimizations
        optimizations.extend([
            {
                "strategy_id": "company-strat-1",
                "name": "Maximize Shareholder Dividends",
                "description": "Distribute profits as franked dividends to shareholders",
                "estimated_tax_saving": base_tax_return.tax_payable * 0.15,
                "complexity": "medium",
                "implementation_steps": [
                    "Declare dividends before year end",
                    "Ensure franking account has sufficient balance",
                    "Issue dividend statements to shareholders"
                ]
            },
            {
                "strategy_id": "company-strat-2",
                "name": "R&D Tax Incentive",
                "description": "Claim R&D tax incentive for eligible research activities",
                "estimated_tax_saving": base_tax_return.taxable_income * 0.08,
                "complexity": "high",
                "implementation_steps": [
                    "Document R&D activities",
                    "Register activities with AusIndustry",
                    "Claim R&D tax offset in company tax return"
                ]
            }
        ])
    elif request.entity.business_structure == BusinessStructureType.TRUST:
        # Trust-specific optimizations
        optimizations.extend([
            {
                "strategy_id": "trust-strat-1",
                "name": "Optimized Trust Distributions",
                "description": "Distribute income strategically among beneficiaries to minimize overall tax",
                "estimated_tax_saving": base_tax_return.taxable_income * 0.12,
                "complexity": "medium",
                "implementation_steps": [
                    "Analyze beneficiaries' tax positions",
                    "Prepare distribution minutes before year end",
                    "Document trustee resolutions"
                ]
            },
            {
                "strategy_id": "trust-strat-2",
                "name": "Corporate Beneficiary Strategy",
                "description": "Distribute income to corporate beneficiary to access company tax rate",
                "estimated_tax_saving": base_tax_return.taxable_income * 0.17,
                "complexity": "high",
                "implementation_steps": [
                    "Set up corporate beneficiary if needed",
                    "Update trust deed if required",
                    "Document distribution strategy"
                ]
            }
        ])
    elif request.entity.business_structure == BusinessStructureType.PARTNERSHIP:
        # Partnership-specific optimizations
        optimizations.extend([
            {
                "strategy_id": "partnership-strat-1",
                "name": "Partner Salary Agreements",
                "description": "Implement partner salary agreements to allocate income differently from partnership ratio",
                "estimated_tax_saving": base_tax_return.taxable_income * 0.07,
                "complexity": "medium",
                "implementation_steps": [
                    "Draft partner salary agreements",
                    "Get agreement from all partners",
                    "Document in partnership minutes"
                ]
            },
            {
                "strategy_id": "partnership-strat-2",
                "name": "Service Trust Arrangement",
                "description": "Establish service trust to provide services to partnership",
                "estimated_tax_saving": base_tax_return.taxable_income * 0.09,
                "complexity": "high",
                "implementation_steps": [
                    "Establish service entity",
                    "Document commercial agreements",
                    "Ensure arrangements are at market rates"
                ]
            }
        ])
    elif request.entity.business_structure == BusinessStructureType.SOLE_TRADER:
        # Sole trader-specific optimizations
        optimizations.extend([
            {
                "strategy_id": "soletrader-strat-1",
                "name": "Income Splitting",
                "description": "Consider partnership or trust structure to split business income",
                "estimated_tax_saving": base_tax_return.taxable_income * 0.15,
                "complexity": "high",
                "implementation_steps": [
                    "Evaluate alternative structures",
                    "Set up new entity if beneficial",
                    "Ensure commercial substance to arrangements"
                ]
            },
            {
                "strategy_id": "soletrader-strat-2",
                "name": "Maximize Deductions",
                "description": "Ensure all legitimate business deductions are claimed",
                "estimated_tax_saving": base_tax_return.taxable_income * 0.05,
                "complexity": "low",
                "implementation_steps": [
                    "Review expense categories",
                    "Document business purpose for expenses",
                    "Keep detailed records and receipts"
                ]
            },
            {
                "strategy_id": "soletrader-strat-3",
                "name": "Superannuation Contributions",
                "description": "Make concessional super contributions to reduce taxable income",
                "estimated_tax_saving": base_tax_return.taxable_income * 0.1,
                "complexity": "medium",
                "implementation_steps": [
                    "Calculate optimal contribution amount",
                    "Make contributions before year end",
                    "Stay within contribution caps"
                ]
            }
        ])
    
    # Add universal strategies applicable to all entities
    optimizations.extend([
        {
            "strategy_id": "universal-strat-1",
            "name": "Prepay Expenses",
            "description": "Prepay deductible expenses for up to 12 months",
            "estimated_tax_saving": base_tax_return.taxable_income * 0.03,
            "complexity": "low",
            "implementation_steps": [
                "Identify eligible expenses",
                "Make payments before year end",
                "Ensure prepayment covers period of 12 months or less"
            ]
        },
        {
            "strategy_id": "universal-strat-2",
            "name": "Asset Acquisition Timing",
            "description": "Time asset purchases to maximize depreciation benefits",
            "estimated_tax_saving": base_tax_return.taxable_income * 0.04,
            "complexity": "low",
            "implementation_steps": [
                "Identify needed business assets",
                "Purchase before year end to claim immediate deduction if eligible",
                "Document business use percentage"
            ]
        }
    ])
    
    # Find best strategy
    best_strategy = max(optimizations, key=lambda x: x["estimated_tax_saving"])
    
    return {
        "current_position": base_scenario,
        "optimization_strategies": optimizations,
        "recommended_strategy": best_strategy,
        "potential_savings": {
            "best_strategy": best_strategy["estimated_tax_saving"],
            "all_strategies": sum(strategy["estimated_tax_saving"] for strategy in optimizations) * 0.7, # Adjusted for overlap
            "percentage": (best_strategy["estimated_tax_saving"] / base_tax_return.tax_payable) * 100 if base_tax_return.tax_payable > 0 else 0
        }
    }
