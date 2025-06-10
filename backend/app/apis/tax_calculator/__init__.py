from fastapi import APIRouter, HTTPException, Body, Path, Query
from pydantic import BaseModel, Field
from enum import Enum
from typing import List, Dict, Optional, Union, Literal, Any
from datetime import date, datetime
import databutton as db
import json

# Importing models from tax_compliance_schema
from app.apis.tax_compliance_schema import (
    BusinessStructureType,
    Company,
    Trust,
    Partnership,
    SoleTrader,
    DateRange,
    TaxReturn,
    BASStatement,
    FBTReturn,
    TaxObligation,
    TaxPlanningScenario,
    TaxAssumption,
    TaxStrategy,
    ProjectedTaxOutcome
)

router = APIRouter()

# Request and Response Models
class FinancialData(BaseModel):
    """Financial data for tax calculations"""
    revenue: List[Dict[str, Any]]
    cost_of_sales: List[Dict[str, Any]]
    expenses: List[Dict[str, Any]]
    gross_profit: float
    net_income: float

class BusinessEntityRequest(BaseModel):
    """Business entity data for tax calculations"""
    id: str
    name: str
    abn: str
    business_structure: BusinessStructureType
    registered_for_gst: bool
    gst_frequency: Optional[Literal["monthly", "quarterly", "annually"]] = None

class TaxCalculationRequest(BaseModel):
    """Request model for tax calculations"""
    entity: BusinessEntityRequest
    financial_data: FinancialData
    period: DateRange
    adjustments: Optional[List[Dict[str, Any]]] = []
    
class TaxCalculationResponse(BaseModel):
    """Response model for tax calculations"""
    taxable_income: float
    tax_payable: float
    effective_tax_rate: float
    deductions: List[Dict[str, Any]]
    tax_credits: List[Dict[str, Any]]
    tax_summary: Dict[str, Any]

class GSTCalculationRequest(BaseModel):
    """Request model for GST calculations"""
    entity: BusinessEntityRequest
    financial_data: FinancialData
    period: DateRange

class GSTCalculationResponse(BaseModel):
    """Response model for GST calculations"""
    gst_collected: float
    gst_paid: float
    gst_net_amount: float
    gst_summary: Dict[str, Any]

class BASGenerationRequest(BaseModel):
    """Request model for BAS generation"""
    entity: BusinessEntityRequest
    financial_data: FinancialData
    period: DateRange
    payg_withholding: float = 0
    payg_installments: float = 0
    additional_data: Optional[Dict[str, Any]] = None

class TaxPlanningRequest(BaseModel):
    """Request model for tax planning scenarios"""
    entity: BusinessEntityRequest
    financial_data: FinancialData
    base_financial_year: str
    projection_period: DateRange
    assumptions: List[Dict[str, Any]]
    strategies: List[Dict[str, Any]]

class TaxPlanningResponse(BaseModel):
    """Response model for tax planning calculations"""
    scenario_id: str
    entity_id: str
    projected_tax_outcome: Dict[str, Any]
    strategy_outcomes: List[Dict[str, Any]]
    comparison: Dict[str, Any]

# Tax calculation functions
def calculate_company_tax(taxable_income: float) -> float:
    """Calculate company tax based on Australian tax rates"""
    # Base company tax rate is 25% for small/medium businesses
    # Note: This is a simplified calculation - actual rates may vary based on aggregated turnover
    return taxable_income * 0.25

def calculate_individual_tax(taxable_income: float) -> float:
    """Calculate individual tax based on Australian tax rates (for sole traders/individuals)"""
    # 2022-2023 Australian individual tax rates
    if taxable_income <= 18200:
        return 0
    elif taxable_income <= 45000:
        return (taxable_income - 18200) * 0.19
    elif taxable_income <= 120000:
        return 5092 + (taxable_income - 45000) * 0.325
    elif taxable_income <= 180000:
        return 29467 + (taxable_income - 120000) * 0.37
    else:
        return 51667 + (taxable_income - 180000) * 0.45

def calculate_gst(financial_data: FinancialData) -> Dict[str, float]:
    """Calculate GST collected, paid, and net amount"""
    # In Australia, GST is 10% and calculated as 1/11th of GST-inclusive amounts
    # This is a simplified calculation - in reality, not all revenue/expenses include GST
    total_revenue = sum(item["amount"] for item in financial_data.revenue)
    total_expenses = sum(item["amount"] for item in financial_data.cost_of_sales) + \
                     sum(item["amount"] for item in financial_data.expenses)
    
    # GST collected (output tax) is 1/11th of GST-inclusive revenue
    gst_collected = total_revenue * (1/11)
    
    # GST paid (input tax credits) is 1/11th of GST-inclusive expenses
    gst_paid = total_expenses * (1/11)
    
    # Net GST is the difference (positive means payable, negative means refundable)
    gst_net = gst_collected - gst_paid
    
    return {
        "gst_collected": gst_collected,
        "gst_paid": gst_paid,
        "gst_net_amount": gst_net
    }

def map_expenses_to_deductions(expenses: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Map expense items to tax deductions"""
    # This would be more sophisticated in a real implementation
    # including rules for what expenses are deductible and which are not
    
    deductions = []
    for idx, expense in enumerate(expenses):
        deduction = {
            "id": f"deduction-{idx}",
            "category": map_expense_category(expense.get("name", "")),
            "description": expense.get("name", "Expense"),
            "amount": expense.get("amount", 0),
            "deductible_amount": expense.get("amount", 0) * 0.95,  # Assume 95% deductible for simplicity
        }
        deductions.append(deduction)
    
    return deductions

def map_expense_category(expense_name: str) -> str:
    """Map expense categories to standardized tax categories"""
    # Simple mapping of common expense categories
    category_mapping = {
        "Sales & Marketing": "Advertising and Marketing",
        "Research & Development": "Research and Development",
        "General & Administrative": "Administration Expenses",
        "Depreciation & Amortization": "Depreciation",
        "Interest": "Interest Expenses",
        "Rent": "Rent and Occupancy",
        "Staff": "Employee Expenses",
    }
    
    return category_mapping.get(expense_name, "Other Expenses")

def calculate_tax_for_business(entity: BusinessEntityRequest, financial_data: FinancialData,
                               adjustments: List[Dict[str, Any]] = []) -> Dict[str, Any]:
    """Calculate tax for a business entity based on its structure"""
    # Step 1: Calculate base taxable income from financial data
    taxable_income = financial_data.net_income
    
    # Step 2: Apply any tax adjustments
    for adjustment in adjustments:
        if adjustment.get("direction") == "add":
            taxable_income += adjustment.get("amount", 0)
        elif adjustment.get("direction") == "subtract":
            taxable_income -= adjustment.get("amount", 0)
    
    # Step 3: Calculate tax based on business structure
    if entity.business_structure == BusinessStructureType.COMPANY:
        tax_payable = calculate_company_tax(taxable_income)
    elif entity.business_structure == BusinessStructureType.SOLE_TRADER:
        tax_payable = calculate_individual_tax(taxable_income)
    elif entity.business_structure in [BusinessStructureType.TRUST, BusinessStructureType.PARTNERSHIP]:
        # Trusts and partnerships themselves don't pay tax - tax flows to beneficiaries/partners
        # However, for estimation purposes, we'll use a representative rate
        tax_payable = taxable_income * 0.30  # Simplified assumption
    else:
        tax_payable = 0
    
    # Step 4: Map expenses to deductions
    deductions = map_expenses_to_deductions(financial_data.expenses)
    
    # Step 5: Calculate effective tax rate
    effective_tax_rate = (tax_payable / taxable_income) * 100 if taxable_income > 0 else 0
    
    return {
        "taxable_income": taxable_income,
        "tax_payable": tax_payable,
        "effective_tax_rate": effective_tax_rate,
        "deductions": deductions,
        "tax_credits": [],  # Would be calculated based on eligible credits
        "tax_summary": {
            "income": financial_data.net_income,
            "deductions_total": sum(d["deductible_amount"] for d in deductions),
            "tax_rate_applied": effective_tax_rate,
            "entity_type": entity.business_structure,
        }
    }

# API Endpoints
@router.post("/calculate-income-tax")
def calculate_income_tax(request: TaxCalculationRequest) -> TaxCalculationResponse:
    """Calculate income tax for a business entity"""
    tax_result = calculate_tax_for_business(
        entity=request.entity,
        financial_data=request.financial_data,
        adjustments=request.adjustments
    )
    
    return TaxCalculationResponse(
        taxable_income=tax_result["taxable_income"],
        tax_payable=tax_result["tax_payable"],
        effective_tax_rate=tax_result["effective_tax_rate"],
        deductions=tax_result["deductions"],
        tax_credits=tax_result["tax_credits"],
        tax_summary=tax_result["tax_summary"]
    )

@router.post("/calculate-gst")
def calculate_gst_endpoint(request: GSTCalculationRequest) -> GSTCalculationResponse:
    """Calculate GST for a business entity"""
    # Skip calculation if not registered for GST
    if not request.entity.registered_for_gst:
        return GSTCalculationResponse(
            gst_collected=0,
            gst_paid=0,
            gst_net_amount=0,
            gst_summary={"message": "Entity not registered for GST"}
        )
    
    # Calculate GST
    gst_result = calculate_gst(request.financial_data)
    
    # Get period details for summary
    period_start = request.period.start_date.strftime("%d %b %Y")
    period_end = request.period.end_date.strftime("%d %b %Y")
    
    return GSTCalculationResponse(
        gst_collected=gst_result["gst_collected"],
        gst_paid=gst_result["gst_paid"],
        gst_net_amount=gst_result["gst_net_amount"],
        gst_summary={
            "period": f"{period_start} to {period_end}",
            "sales_total": sum(item["amount"] for item in request.financial_data.revenue),
            "purchases_total": sum(item["amount"] for item in request.financial_data.cost_of_sales) + \
                               sum(item["amount"] for item in request.financial_data.expenses),
            "reporting_frequency": request.entity.gst_frequency,
        }
    )

@router.post("/generate-bas")
def generate_bas_statement(request: BASGenerationRequest) -> BASStatement:
    """Generate a BAS statement for a business entity"""
    # Skip if not registered for GST
    if not request.entity.registered_for_gst:
        raise HTTPException(status_code=400, detail="Entity not registered for GST, cannot generate BAS")
    
    # Calculate GST
    gst_result = calculate_gst(request.financial_data)
    
    # Create a BAS statement
    bas_id = f"bas-{request.entity.id}-{request.period.start_date.strftime('%Y%m%d')}"
    
    # Determine due date (simplified, actual due date depends on lodgment method and entity size)
    # Generally 28 days after the end of the quarter
    due_date = date(request.period.end_date.year, request.period.end_date.month, 28)
    if due_date.month + 1 > 12:
        # Handle December to January transition
        due_date = date(due_date.year + 1, 1, 28)
    else:
        due_date = date(due_date.year, due_date.month + 1, 28)
    
    # Total sales for GST purposes
    sales_total = sum(item["amount"] for item in request.financial_data.revenue)
    
    # Total purchases for GST purposes
    purchases_total = sum(item["amount"] for item in request.financial_data.cost_of_sales) + \
                     sum(item["amount"] for item in request.financial_data.expenses)
    
    # Determine final payable/refundable
    gst_net = gst_result["gst_net_amount"]
    total_payable = gst_net + request.payg_withholding + request.payg_installments if gst_net > 0 else request.payg_withholding + request.payg_installments
    total_refundable = abs(gst_net) if gst_net < 0 else 0
    
    bas_statement = BASStatement(
        id=bas_id,
        entity_id=request.entity.id,
        period=request.period,
        status="readyForReview",
        due_date=due_date,
        gst_collected=gst_result["gst_collected"],
        gst_paid=gst_result["gst_paid"],
        gst_net_amount=gst_net,
        sales_total=sales_total,
        purchases_total=purchases_total,
        payg_withholding=request.payg_withholding,
        payg_installments=request.payg_installments,
        total_payable=total_payable,
        total_refundable=total_refundable,
        attachments=[]
    )
    
    return bas_statement

@router.post("/tax-planning/create-scenario")
def create_tax_planning_scenario_v2(request: TaxPlanningRequest) -> TaxPlanningResponse:
    """Create a tax planning scenario for a business entity"""
    # Base calculations
    base_tax = calculate_tax_for_business(
        entity=request.entity,
        financial_data=request.financial_data
    )
    
    # Create a unique scenario ID
    scenario_id = f"scenario-{request.entity.id}-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    # Process strategies
    strategy_outcomes = []
    for idx, strategy in enumerate(request.strategies):
        # Apply strategy (simplified implementation)
        adjusted_income = base_tax["taxable_income"] * (1 - strategy.get("estimated_impact", 0) / 100)
        
        if request.entity.business_structure == BusinessStructureType.COMPANY:
            adjusted_tax = calculate_company_tax(adjusted_income)
        elif request.entity.business_structure == BusinessStructureType.SOLE_TRADER:
            adjusted_tax = calculate_individual_tax(adjusted_income)
        else:
            adjusted_tax = adjusted_income * 0.30  # Simplified rate
        
        strategy_outcomes.append({
            "strategy_id": f"strategy-{idx}",
            "name": strategy.get("name", "Unnamed Strategy"),
            "taxable_income": adjusted_income,
            "tax_payable": adjusted_tax,
            "effective_tax_rate": (adjusted_tax / adjusted_income) * 100 if adjusted_income > 0 else 0,
            "savings": base_tax["tax_payable"] - adjusted_tax
        })
    
    # Determine best strategy
    best_strategy = None
    max_savings = 0
    for outcome in strategy_outcomes:
        if outcome["savings"] > max_savings:
            max_savings = outcome["savings"]
            best_strategy = outcome
    
    # Create projected outcome
    if best_strategy:
        projected_outcome = {
            "taxable_income": best_strategy["taxable_income"],
            "tax_payable": best_strategy["tax_payable"],
            "effective_tax_rate": best_strategy["effective_tax_rate"],
            "cashflow_impact": best_strategy["savings"]
        }
        
        comparison = {
            "tax_savings": best_strategy["savings"],
            "cashflow_improvement": best_strategy["savings"],
            "best_strategy": best_strategy["name"]
        }
    else:
        projected_outcome = {
            "taxable_income": base_tax["taxable_income"],
            "tax_payable": base_tax["tax_payable"],
            "effective_tax_rate": base_tax["effective_tax_rate"],
            "cashflow_impact": 0
        }
        
        comparison = {
            "tax_savings": 0,
            "cashflow_improvement": 0,
            "best_strategy": "No strategies applied"
        }
    
    return TaxPlanningResponse(
        scenario_id=scenario_id,
        entity_id=request.entity.id,
        projected_tax_outcome=projected_outcome,
        strategy_outcomes=strategy_outcomes,
        comparison=comparison
    )
