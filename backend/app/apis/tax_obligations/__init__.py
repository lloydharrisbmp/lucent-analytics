from fastapi import APIRouter, HTTPException, Body, Path, Query, Depends
from pydantic import BaseModel, Field
from enum import Enum
from typing import List, Dict, Optional, Union, Literal, Any
from datetime import date, datetime, timedelta
import databutton as db
import json
import uuid

# Import models from tax_compliance_schema
from app.apis.tax_compliance_schema import (
    BusinessStructureType,
    DateRange,
    BASStatement,
    TaxObligation,
    BusinessEntityBase
)

# Import calculation functions from tax_calculator
from app.apis.tax_calculator import (
    calculate_gst,
    BusinessEntityRequest,
    FinancialData,
    GSTCalculationRequest,
    BASGenerationRequest,
    generate_bas_statement
)

router = APIRouter()

# Constants for BAS reporting
BAS_CATEGORIES = {
    "G1": "Total sales",
    "G2": "Export sales",
    "G3": "Other GST-free sales",
    "G10": "Capital purchases",
    "G11": "Non-capital purchases",
    "W1": "Total salary, wages and other payments",
    "W2": "Amount withheld from payments shown at W1",
    "W4": "Other amounts withheld",
    "F1": "PAYG instalment income",
    "T1": "PAYG instalment",
    "T2": "Estimated tax",
    "T3": "Credit from PAYG income tax installment variation"
}

# Request and Response Models
class DetailedFinancialData(BaseModel):
    """Detailed financial data for BAS calculations"""
    sales: Dict[str, float] = Field(default_factory=dict)
    export_sales: float = 0
    gst_free_sales: float = 0
    capital_purchases: float = 0
    non_capital_purchases: float = 0
    payroll: Dict[str, float] = Field(default_factory=dict)
    other_withholding: float = 0
    instalment_income: float = 0

class EnhancedBASRequest(BaseModel):
    """Enhanced request for BAS generation with detailed financial data"""
    entity: BusinessEntityRequest
    period: DateRange
    financial_data: DetailedFinancialData
    report_method: Literal["standard", "calculation_worksheet", "GST_instalment"] = "standard"
    payment_method: Literal["direct_credit", "bpay", "card", "other"] = "direct_credit"
    additional_notes: Optional[str] = None

class BASFieldValue(BaseModel):
    """A value for a specific BAS field with metadata"""
    field_code: str
    field_name: str
    amount: float
    section: Literal["G", "W", "F", "T"]
    calculation_notes: Optional[str] = None

class EnhancedBASResponse(BaseModel):
    """Enhanced BAS response with detailed breakdown and fields"""
    bas_id: str
    entity_id: str
    period: DateRange
    status: str
    due_date: date
    fields: List[BASFieldValue]
    totals: Dict[str, float]
    payment_required: bool
    refund_due: bool
    net_amount: float
    generation_date: datetime
    submission_date: Optional[datetime] = None
    attachments: List[str] = []

class TaxObligationRequest(BaseModel):
    """Request to get tax obligations for an entity"""
    entity_id: str
    year: int
    include_completed: bool = False

class TaxObligationSummary(BaseModel):
    """Summary of tax obligations by type and status"""
    total_count: int
    due_within_month: int
    overdue: int
    completed: int
    by_type: Dict[str, int]
    estimated_total_amount: float
    next_due: Optional[Dict[str, Any]] = None

class TaxObligationResponse(BaseModel):
    """Response with tax obligations for an entity"""
    entity_id: str
    year: int
    obligations: List[TaxObligation]
    summary: TaxObligationSummary

# Detailed BAS calculation functions
def calculate_field_values(entity: BusinessEntityRequest, data: DetailedFinancialData) -> List[BASFieldValue]:
    """Calculate values for individual BAS fields"""
    fields = []
    
    # Sales and GST on sales
    total_sales = sum(data.sales.values())
    fields.append(BASFieldValue(
        field_code="G1",
        field_name="Total sales",
        amount=total_sales,
        section="G",
        calculation_notes="Sum of all sales including GST"
    ))
    
    # GST on sales (1/11th of total GST-inclusive sales)
    gst_on_sales = total_sales / 11
    fields.append(BASFieldValue(
        field_code="1A",
        field_name="GST on sales",
        amount=gst_on_sales,
        section="G",
        calculation_notes="1/11th of G1 (Total sales)"
    ))
    
    # Export sales (GST-free)
    fields.append(BASFieldValue(
        field_code="G2",
        field_name="Export sales",
        amount=data.export_sales,
        section="G",
        calculation_notes="Export sales (GST-free)"
    ))
    
    # Other GST-free sales
    fields.append(BASFieldValue(
        field_code="G3",
        field_name="Other GST-free sales",
        amount=data.gst_free_sales,
        section="G",
        calculation_notes="Other GST-free sales"
    ))
    
    # Capital purchases
    fields.append(BASFieldValue(
        field_code="G10",
        field_name="Capital purchases",
        amount=data.capital_purchases,
        section="G",
        calculation_notes="Capital purchases including GST"
    ))
    
    # GST on capital purchases
    gst_on_capital = data.capital_purchases / 11
    
    # Non-capital purchases
    fields.append(BASFieldValue(
        field_code="G11",
        field_name="Non-capital purchases",
        amount=data.non_capital_purchases,
        section="G",
        calculation_notes="Non-capital purchases including GST"
    ))
    
    # GST on non-capital purchases
    gst_on_non_capital = data.non_capital_purchases / 11
    
    # GST on purchases (combined)
    gst_on_purchases = gst_on_capital + gst_on_non_capital
    fields.append(BASFieldValue(
        field_code="1B",
        field_name="GST on purchases",
        amount=gst_on_purchases,
        section="G",
        calculation_notes="1/11th of (G10 + G11)"
    ))
    
    # Net GST
    net_gst = gst_on_sales - gst_on_purchases
    fields.append(BASFieldValue(
        field_code="1C",
        field_name="Net GST",
        amount=net_gst,
        section="G",
        calculation_notes="1A - 1B (GST on sales - GST on purchases)"
    ))
    
    # PAYG withholding
    total_payroll = sum(data.payroll.values())
    fields.append(BASFieldValue(
        field_code="W1",
        field_name="Total salary, wages and other payments",
        amount=total_payroll,
        section="W",
        calculation_notes="Total of payments subject to withholding"
    ))
    
    # PAYG withholding amount (approximate calculation)
    # In a real system, this would be calculated based on actual withholding rates
    # or taken from payroll system data
    payg_withholding = total_payroll * 0.2  # Simplified approximation
    fields.append(BASFieldValue(
        field_code="W2",
        field_name="Amount withheld from payments shown at W1",
        amount=payg_withholding,
        section="W",
        calculation_notes="Withheld taxes from payroll"
    ))
    
    # Other withholding
    fields.append(BASFieldValue(
        field_code="W4",
        field_name="Other amounts withheld",
        amount=data.other_withholding,
        section="W",
        calculation_notes="Withholding from payments to contractors etc."
    ))
    
    # Total PAYG withholding
    total_withholding = payg_withholding + data.other_withholding
    fields.append(BASFieldValue(
        field_code="W5",
        field_name="Total amounts withheld",
        amount=total_withholding,
        section="W",
        calculation_notes="W2 + W4"
    ))
    
    # PAYG instalment income
    fields.append(BASFieldValue(
        field_code="F1",
        field_name="PAYG instalment income",
        amount=data.instalment_income,
        section="F",
        calculation_notes="Instalment income for the period"
    ))
    
    # PAYG instalment amount (simplified calculation)
    # In a real system, this would be based on rate or amount from previous assessment
    payg_instalment = data.instalment_income * 0.05  # Simplified approximation
    fields.append(BASFieldValue(
        field_code="T1",
        field_name="PAYG instalment",
        amount=payg_instalment,
        section="T",
        calculation_notes="Instalment calculated on instalment income"
    ))
    
    return fields

def calculate_bas_totals(fields: List[BASFieldValue]) -> Dict[str, float]:
    """Calculate totals for the BAS statement"""
    # Extract values by field code
    field_values = {field.field_code: field.amount for field in fields}
    
    # Calculate key totals
    net_gst = field_values.get("1C", 0)  # Net GST
    total_withholding = field_values.get("W5", 0)  # Total PAYG withholding
    payg_instalment = field_values.get("T1", 0)  # PAYG instalment
    
    # Calculate activity statement totals
    summary = {
        "gst_collected": field_values.get("1A", 0),
        "gst_credits": field_values.get("1B", 0),
        "net_gst": net_gst,
        "payg_withholding": total_withholding,
        "payg_instalment": payg_instalment,
        "total_payable": max(0, net_gst) + total_withholding + payg_instalment,
        "total_refundable": abs(min(0, net_gst))
    }
    
    return summary

def determine_bas_due_date(period_end: date) -> date:
    """Determine BAS due date based on period end date"""
    # For monthly lodgers: 21st of the following month
    # For quarterly lodgers: generally 28th of the month following the quarter
    
    # For simplicity, we'll use 28th of the following month
    month = period_end.month + 1
    year = period_end.year
    
    if month > 12:
        month = 1
        year += 1
    
    # Use the 28th of the month
    return date(year, month, 28)

# Generate tax obligations for a financial year
def generate_tax_obligations(entity_id: str, year: int) -> List[TaxObligation]:
    """Generate tax obligations for an entity for a financial year"""
    obligations = []
    
    # Fiscal year in Australia is July 1 to June 30
    fy_start = date(year-1, 7, 1)
    fy_end = date(year, 6, 30)
    
    # Generate BAS obligations (quarterly for this example)
    quarterly_dates = [
        (date(year-1, 7, 1), date(year-1, 9, 30)),  # Q1 (Jul-Sep)
        (date(year-1, 10, 1), date(year-1, 12, 31)),  # Q2 (Oct-Dec)
        (date(year, 1, 1), date(year, 3, 31)),        # Q3 (Jan-Mar)
        (date(year, 4, 1), date(year, 6, 30))         # Q4 (Apr-Jun)
    ]
    
    for i, (start, end) in enumerate(quarterly_dates, 1):
        due_date = determine_bas_due_date(end)
        
        # Create BAS obligation
        obligations.append(TaxObligation(
            id=f"bas-obligation-{entity_id}-Q{i}-{year}",
            entity_id=entity_id,
            obligation_type="BAS",
            due_date=due_date,
            period=DateRange(
                start_date=start,
                end_date=end
            ),
            status="pending",
            estimated_amount=5000.00,  # Placeholder
            payment_method="direct_credit",
            description=f"Quarterly BAS Q{i} {year-1}-{year}"
        ))
    
    # Income tax return obligation (due October 31 for most entities)
    obligations.append(TaxObligation(
        id=f"income-tax-obligation-{entity_id}-{year}",
        entity_id=entity_id,
        obligation_type="Income Tax Return",
        due_date=date(year, 10, 31),
        period=DateRange(
            start_date=fy_start,
            end_date=fy_end
        ),
        status="pending",
        estimated_amount=15000.00,  # Placeholder
        payment_method="direct_credit",
        description=f"Income Tax Return {year-1}-{year}"
    ))
    
    # PAYG Instalment obligations (quarterly)
    for i, (start, end) in enumerate(quarterly_dates, 1):
        due_date = determine_bas_due_date(end)
        
        # Create PAYG Instalment obligation
        obligations.append(TaxObligation(
            id=f"payg-obligation-{entity_id}-Q{i}-{year}",
            entity_id=entity_id,
            obligation_type="PAYG Instalment",
            due_date=due_date,
            period=DateRange(
                start_date=start,
                end_date=end
            ),
            status="pending",
            estimated_amount=2500.00,  # Placeholder
            payment_method="direct_credit",
            description=f"Quarterly PAYG Instalment Q{i} {year-1}-{year}"
        ))
    
    # Fringe Benefits Tax (due May 21)
    obligations.append(TaxObligation(
        id=f"fbt-obligation-{entity_id}-{year}",
        entity_id=entity_id,
        obligation_type="FBT Return",
        due_date=date(year, 5, 21),
        period=DateRange(
            start_date=date(year-1, 4, 1),
            end_date=date(year, 3, 31)
        ),
        status="pending",
        estimated_amount=3000.00,  # Placeholder
        payment_method="direct_credit",
        description=f"FBT Return {year-1}-{year}"
    ))
    
    return obligations

def generate_tax_obligation_summary(obligations: List[TaxObligation]) -> TaxObligationSummary:
    """Generate a summary of tax obligations"""
    today = date.today()
    next_month = today + timedelta(days=30)
    
    total_count = len(obligations)
    due_within_month = 0
    overdue = 0
    completed = 0
    by_type = {}
    estimated_total = 0
    
    next_due_obligation = None
    nearest_due_date = None
    
    for obligation in obligations:
        # Count by type
        if obligation.obligation_type in by_type:
            by_type[obligation.obligation_type] += 1
        else:
            by_type[obligation.obligation_type] = 1
        
        # Count by status
        if obligation.status == "completed":
            completed += 1
        elif obligation.due_date < today:
            overdue += 1
        elif obligation.due_date <= next_month:
            due_within_month += 1
        
        # Sum estimated amounts
        if obligation.estimated_amount:
            estimated_total += obligation.estimated_amount
        
        # Find next due obligation
        if obligation.status != "completed" and (nearest_due_date is None or obligation.due_date < nearest_due_date):
            nearest_due_date = obligation.due_date
            next_due_obligation = obligation
    
    # Format next due obligation data
    next_due = None
    if next_due_obligation:
        next_due = {
            "id": next_due_obligation.id,
            "type": next_due_obligation.obligation_type,
            "due_date": next_due_obligation.due_date,
            "description": next_due_obligation.description,
            "estimated_amount": next_due_obligation.estimated_amount
        }
    
    return TaxObligationSummary(
        total_count=total_count,
        due_within_month=due_within_month,
        overdue=overdue,
        completed=completed,
        by_type=by_type,
        estimated_total_amount=estimated_total,
        next_due=next_due
    )

# API Endpoints
@router.post("/bas/create-statement")
def create_bas_statement2(request: EnhancedBASRequest) -> EnhancedBASResponse:
    """Generate an enhanced BAS statement with detailed breakdown"""
    # Skip if not registered for GST
    if not request.entity.registered_for_gst:
        raise HTTPException(status_code=400, detail="Entity not registered for GST, cannot generate BAS")
    
    # Calculate field values
    fields = calculate_field_values(request.entity, request.financial_data)
    
    # Calculate BAS totals
    totals = calculate_bas_totals(fields)
    
    # Generate a BAS ID
    bas_id = f"bas-{request.entity.id}-{request.period.start_date.strftime('%Y%m%d')}"
    
    # Determine due date
    due_date = determine_bas_due_date(request.period.end_date)
    
    # Determine if payment is required or refund is due
    payment_required = totals["total_payable"] > 0
    refund_due = totals["total_refundable"] > 0
    net_amount = totals["total_payable"] - totals["total_refundable"]
    
    return EnhancedBASResponse(
        bas_id=bas_id,
        entity_id=request.entity.id,
        period=request.period,
        status="draft",
        due_date=due_date,
        fields=fields,
        totals=totals,
        payment_required=payment_required,
        refund_due=refund_due,
        net_amount=net_amount,
        generation_date=datetime.now(),
        attachments=[]
    )

@router.get("/tax-obligations")
def get_tax_obligations2(entity_id: str, year: int, include_completed: bool = False) -> TaxObligationResponse:
    """Get tax obligations for an entity for a specific year"""
    # Generate obligations for the entity and year
    obligations = generate_tax_obligations(entity_id, year)
    
    # Filter out completed obligations if not requested
    if not include_completed:
        obligations = [o for o in obligations if o.status != "completed"]
    
    # Generate summary
    summary = generate_tax_obligation_summary(obligations)
    
    return TaxObligationResponse(
        entity_id=entity_id,
        year=year,
        obligations=obligations,
        summary=summary
    )

@router.post("/bas/calculate-gst")
def calculate_detailed_gst(request: EnhancedBASRequest) -> Dict[str, Any]:
    """Calculate detailed GST breakdown for BAS"""
    # Validate entity is registered for GST
    if not request.entity.registered_for_gst:
        return {
            "error": "Entity not registered for GST",
            "gst_applicable": False
        }
    
    # Convert detailed financial data to format needed for calculation
    financial_data = FinancialData(
        revenue=[{"name": k, "amount": v} for k, v in request.financial_data.sales.items()],
        cost_of_sales=[], # Not used in this calculation
        expenses=[
            {"name": "Capital", "amount": request.financial_data.capital_purchases},
            {"name": "Non-capital", "amount": request.financial_data.non_capital_purchases}
        ],
        gross_profit=sum(request.financial_data.sales.values()),
        net_income=sum(request.financial_data.sales.values()) - 
                   request.financial_data.capital_purchases - 
                   request.financial_data.non_capital_purchases
    )
    
    # Remove unused variable and calculate GST components directly
    
    # Calculate period metrics
    total_taxable = sum(request.financial_data.sales.values()) - \
                   request.financial_data.export_sales - \
                   request.financial_data.gst_free_sales
    
    # Calculate GST components in more detail
    gst_on_sales = total_taxable / 11
    gst_on_capital = request.financial_data.capital_purchases / 11
    gst_on_non_capital = request.financial_data.non_capital_purchases / 11
    
    return {
        "period": {
            "start": request.period.start_date.strftime("%d %b %Y"),
            "end": request.period.end_date.strftime("%d %b %Y"),
        },
        "gst_collected": gst_on_sales,
        "gst_paid": gst_on_capital + gst_on_non_capital,
        "gst_net_amount": gst_on_sales - (gst_on_capital + gst_on_non_capital),
        "breakdown": {
            "sales": {
                "total": sum(request.financial_data.sales.values()),
                "taxable": total_taxable,
                "export": request.financial_data.export_sales,
                "gst_free": request.financial_data.gst_free_sales,
                "gst_amount": gst_on_sales
            },
            "purchases": {
                "capital": {
                    "total": request.financial_data.capital_purchases,
                    "gst_amount": gst_on_capital
                },
                "non_capital": {
                    "total": request.financial_data.non_capital_purchases,
                    "gst_amount": gst_on_non_capital
                },
                "total": request.financial_data.capital_purchases + request.financial_data.non_capital_purchases,
                "gst_amount": gst_on_capital + gst_on_non_capital
            }
        },
        "entity": {
            "id": request.entity.id,
            "name": request.entity.name,
            "abn": request.entity.abn,
            "gst_frequency": request.entity.gst_frequency
        }
    }
