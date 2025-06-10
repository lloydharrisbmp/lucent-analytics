from pydantic import BaseModel
from typing import List, Dict, Optional
from fastapi import APIRouter

# Import shared models
from app.apis.models import WidgetConfig

router = APIRouter(prefix="/cash-flow", tags=["Cash Flow"])

# --- Input Data Structures ---

class MappedAccountData(BaseModel):
    """Represents a financial data point mapped to a system category."""
    system_category: str # e.g., CASH_EQUIVALENTS, ACCOUNTS_RECEIVABLE, SALES_REVENUE
    value: float

class PeriodFinancialsInput(BaseModel):
    """Holds all necessary mapped financial data for a calculation period."""
    profit_loss: List[MappedAccountData]
    start_balance_sheet: List[MappedAccountData]
    end_balance_sheet: List[MappedAccountData]

# --- Output Data Structures ---

class CashFlowItem(BaseModel):
    """Represents a single line item within a cash flow section."""
    item_name: str
    amount: float

class CashFlowSection(BaseModel):
    """Represents a section of the cash flow statement (Operating, Investing, Financing)."""
    section_name: str
    items: List[CashFlowItem]
    sub_total: float

class CashFlowStatement(BaseModel):
    """Represents the complete cash flow statement."""
    opening_cash: float
    operating_activities: CashFlowSection
    investing_activities: CashFlowSection
    financing_activities: CashFlowSection
    net_change_in_cash: float
    closing_cash: float
    reconciliation_difference: Optional[float] = None # Difference between calculated and actual closing cash

# --- Helper Functions ---

def _get_value(data: List[MappedAccountData], category: str, default: float = 0.0) -> float:
    """Helper to find the sum of values for a specific system category."""
    return sum(item.value for item in data if item.system_category == category)

def _get_change(start_data: List[MappedAccountData], end_data: List[MappedAccountData], category: str) -> float:
    """Helper to calculate the change in value for a specific system category between start and end balance sheets."""
    start_value = _get_value(start_data, category)
    end_value = _get_value(end_data, category)
    return end_value - start_value

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime, timedelta
import random

# Removed try-except block and local WidgetConfig definition


# --- Pydantic Models for Enhanced Waterfall Data ---

class SeasonalImpactModel(BaseModel):
    description: str
    percentage: float
    baseAmount: float = Field(..., alias='baseAmount')

class ChartDataItemModel(BaseModel):
    name: str
    value: float
    fill: str
    isTotal: Optional[bool] = Field(None, alias='isTotal')
    label: Optional[str] = None
    stepValue: Optional[float] = Field(None, alias='stepValue')
    seasonalImpact: Optional[SeasonalImpactModel] = Field(None, alias='seasonalImpact')

    model_config = {"populate_by_name": True}


# --- Simulation Helper ---

def _get_simulated_financial_data(start_date_str: str, end_date_str: str) -> PeriodFinancialsInput:
    """
    Generates semi-randomized P&L and Balance Sheet data for simulation.
    Uses MappedAccountData format.
    Replace this with actual data fetching logic later.
    """
    print(f"Simulating financial data between {start_date_str} and {end_date_str}")
    # Basic simulation - values will vary slightly on each run
    
    # --- Balance Sheet Simulation ---
    start_cash = random.uniform(50000, 150000)
    end_cash = start_cash + random.uniform(-20000, 50000) # Simulate some change
    
    start_bs = [
        MappedAccountData(system_category="CASH_EQUIVALENTS", value=start_cash),
        MappedAccountData(system_category="ACCOUNTS_RECEIVABLE", value=random.uniform(30000, 80000)),
        MappedAccountData(system_category="INVENTORY", value=random.uniform(20000, 60000)),
        MappedAccountData(system_category="PPE_GROSS", value=random.uniform(100000, 300000)),
        MappedAccountData(system_category="ACCUMULATED_DEPRECIATION", value=-random.uniform(20000, 80000)),
        MappedAccountData(system_category="ACCOUNTS_PAYABLE", value=random.uniform(15000, 40000)),
        MappedAccountData(system_category="SHORT_TERM_DEBT", value=random.uniform(0, 50000)),
        MappedAccountData(system_category="LONG_TERM_DEBT", value=random.uniform(50000, 150000)),
        MappedAccountData(system_category="COMMON_STOCK", value=random.uniform(10000, 20000)),
        MappedAccountData(system_category="RETAINED_EARNINGS", value=random.uniform(50000, 200000)),
    ]
    
    # Simulate changes for end BS
    end_bs = []
    for item in start_bs:
        change_factor = random.uniform(0.9, 1.15) # +/- 10-15% change
        new_value = item.value * change_factor
        if item.system_category == "CASH_EQUIVALENTS":
            new_value = end_cash # Use pre-calculated end cash
        elif item.system_category == "ACCUMULATED_DEPRECIATION":
             # Depreciation increases (becomes more negative)
            new_value = item.value * random.uniform(1.05, 1.2) 
            
        end_bs.append(MappedAccountData(system_category=item.system_category, value=new_value))

    # --- Profit & Loss Simulation ---
    revenue = random.uniform(100000, 500000)
    cogs = revenue * random.uniform(0.4, 0.6)
    gross_profit = revenue - cogs
    
    op_expenses = gross_profit * random.uniform(0.3, 0.5)
    depreciation = abs(_get_value(end_bs, "ACCUMULATED_DEPRECIATION") - _get_value(start_bs, "ACCUMULATED_DEPRECIATION"))
    
    pl = [
        MappedAccountData(system_category="REVENUE_SALES", value=revenue),
        MappedAccountData(system_category="COGS_MATERIAL", value=cogs * 0.7),
        MappedAccountData(system_category="COGS_LABOR", value=cogs * 0.3),
        MappedAccountData(system_category="EXPENSE_SALARIES", value=op_expenses * 0.5),
        MappedAccountData(system_category="EXPENSE_RENT", value=op_expenses * 0.2),
        MappedAccountData(system_category="EXPENSE_MARKETING", value=op_expenses * 0.15),
        MappedAccountData(system_category="EXPENSE_OTHER", value=op_expenses * 0.15),
        MappedAccountData(system_category="DEPRECIATION_EXPENSE", value=depreciation),
        # Add other P&L items like interest, tax if needed for more complex simulation
    ]

    return PeriodFinancialsInput(
        profit_loss=pl,
        start_balance_sheet=start_bs,
        end_balance_sheet=end_bs
    )


# --- Main Function for Enhanced Waterfall ---

def generate_enhanced_waterfall_data(config: WidgetConfig) -> List[ChartDataItemModel]: # Uses imported WidgetConfig
    """
    Generates data for the Enhanced Cash Flow Waterfall based on widget config.
    Uses calculate_cash_flow_indirect with simulated financial data for now.
    Transforms the CashFlowStatement output into ChartDataItemModel list.
    """
    print(f"Generating enhanced waterfall data using indirect calculation with config: {config.dict(by_alias=True)}")

    # Determine date range (use defaults if not provided)
    # TODO: Use these dates when fetching REAL data
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=90) # Default to last 90 days
    if config.endDate:
        try:
            end_date = datetime.fromisoformat(config.endDate.replace('Z', '+00:00'))
        except ValueError:
            print(f"Warning: Invalid endDate format '{config.endDate}', using default.")
    if config.startDate:
         try:
            start_date = datetime.fromisoformat(config.startDate.replace('Z', '+00:00'))
         except ValueError:
            print(f"Warning: Invalid startDate format '{config.startDate}', using default.")
            start_date = end_date - timedelta(days=90) # Fallback if start is invalid but end is valid
             
    # Ensure start is before end
    if start_date >= end_date:
        print("Warning: Start date is not before end date, adjusting start date.")
        start_date = end_date - timedelta(days=90)

    start_date_str = start_date.isoformat()
    end_date_str = end_date.isoformat()
    
    # --- Get Simulated Input Data ---
    # !!! Replace this call with actual data fetching based on config.entityId, dates etc. !!!
    print(f"Using SIMULATED financial data between {start_date_str} and {end_date_str} as input.")
    simulated_input_data = _get_simulated_financial_data(start_date_str, end_date_str)

    # --- Calculate Cash Flow Statement (Indirect Method) ---
    try:
        cash_flow_statement = calculate_cash_flow_indirect(simulated_input_data)
    except Exception as e:
        print(f"Error calculating cash flow statement: {e}")
        # Return empty list or a specific error indicator if calculation fails
        return []

    # --- Transform CashFlowStatement to ChartDataItemModel List ---
    chart_data = [
        ChartDataItemModel(name="Starting Balance", value=cash_flow_statement.opening_cash, fill="#60a5fa", isTotal=True),
    ]

    # Operating Activities (Combine all items into one bar for simplicity)
    # A more detailed waterfall could break this down further based on cash_flow_statement.operating_activities.items
    op_total = cash_flow_statement.operating_activities.sub_total
    if abs(op_total) > 0.01:
        # Determine fill based on positive (inflow) or negative (outflow)
        op_fill = "#4ade80" if op_total >= 0 else "#f87171" 
        
        # Placeholder for seasonal impact - can be refined later
        seasonal_impact = None
        if config.showSeasonalImpact and abs(op_total) > 1000: # Arbitrary condition
             try:
                 # Simulate a base amount (needs actual historical data for real calculation)
                 base_factor = random.uniform(1.1, 1.3) if op_total >=0 else random.uniform(0.7, 0.9)
                 base_amount = op_total / base_factor 
                 percentage = (op_total / base_amount - 1) * 100 if base_amount != 0 else 0
                 seasonal_impact=SeasonalImpactModel(
                     description="Simulated seasonal impact", 
                     percentage=percentage, 
                     baseAmount=base_amount
                 )
             except ZeroDivisionError:
                 seasonal_impact = None # Avoid division by zero if base_amount is 0
                 
        chart_data.append(ChartDataItemModel(
            name="Operating Activities", 
            value=op_total, 
            fill=op_fill,
            seasonalImpact=seasonal_impact
        ))

    # Investing Activities
    inv_total = cash_flow_statement.investing_activities.sub_total
    if abs(inv_total) > 0.01:
        # Typically an outflow (negative), but handle inflows too
        inv_fill = "#fbbf24" # Amber/Yellow generally used for investing
        chart_data.append(ChartDataItemModel(name="Investing Activities", value=inv_total, fill=inv_fill))

    # Financing Activities
    fin_total = cash_flow_statement.financing_activities.sub_total
    if abs(fin_total) > 0.01:
        # Can be inflow (debt/equity raised) or outflow (debt repayment/dividends)
        fin_fill = "#8b5cf6" # Purple generally used for financing
        chart_data.append(ChartDataItemModel(name="Financing Activities", value=fin_total, fill=fin_fill))

    # Ending Balance (Calculated Closing Cash from the statement)
    chart_data.append(ChartDataItemModel(name="Ending Balance", value=cash_flow_statement.closing_cash, fill="#60a5fa", isTotal=True))

    # Optional: Add reconciliation difference if significant
    if cash_flow_statement.reconciliation_difference is not None and abs(cash_flow_statement.reconciliation_difference) > 1.0:
        print(f"Note: Waterfall includes reconciliation difference: {cash_flow_statement.reconciliation_difference:.2f}")
        chart_data.insert(-1, ChartDataItemModel(name="Reconciliation", value=cash_flow_statement.reconciliation_difference, fill="#a8a29e"))
        # Adjust the final 'Ending Balance' bar to reflect the *actual* closing cash if reconciliation is shown
        chart_data[-1].value = cash_flow_statement.opening_cash + cash_flow_statement.net_change_in_cash + cash_flow_statement.reconciliation_difference


    return chart_data

# --- Main Calculation Function (Indirect Method) ---

def calculate_cash_flow_indirect(input_data: PeriodFinancialsInput) -> CashFlowStatement:
    """
    Calculates the cash flow statement using the indirect method based on mapped P&L and Balance Sheet data.
    Relies on system categories defined during CoA mapping (see MYA-124 design).
    """
    pl = input_data.profit_loss
    start_bs = input_data.start_balance_sheet
    end_bs = input_data.end_balance_sheet

    # --- 1. Opening and Closing Cash ---
    opening_cash = _get_value(start_bs, "CASH_EQUIVALENTS")
    actual_closing_cash = _get_value(end_bs, "CASH_EQUIVALENTS")

    # --- 2. Operating Activities ---
    op_items: List[CashFlowItem] = []
    
    # Start with Net Income (Placeholder - requires mapping sum of Revenue/Expense categories)
    # TODO: Calculate Net Income from P&L items
    # Assume Revenue categories start with 'REVENUE' and Expense/COGS with 'EXPENSE' or 'COGS'
    total_revenue = sum(item.value for item in pl if item.system_category.startswith("REVENUE"))
    total_expenses = sum(item.value for item in pl if item.system_category.startswith("EXPENSE") or item.system_category.startswith("COGS"))
    net_income = total_revenue - total_expenses # Note: Expenses are typically positive values in P&L data
    op_items.append(CashFlowItem(item_name="Net Income", amount=net_income))

    # Adjustments for Non-Cash Items (Examples)
    # TODO: Add logic for Amortization, Gain/Loss on Sale based on mapped P&L categories
    depreciation = _get_value(pl, "DEPRECIATION_EXPENSE", 0.0)
    if depreciation != 0:
         op_items.append(CashFlowItem(item_name="Depreciation", amount=depreciation)) # Added back

    amortization = _get_value(pl, "AMORTIZATION_EXPENSE", 0.0)
    if amortization != 0:
        op_items.append(CashFlowItem(item_name="Amortization", amount=amortization)) # Added back

    gain_loss_sale = _get_value(pl, "GAIN_LOSS_ASSET_SALE", 0.0)
    if gain_loss_sale != 0:
        # Add back losses (positive value), subtract gains (negative value)
        op_items.append(CashFlowItem(item_name="Gain/Loss on Sale of Assets", amount=-gain_loss_sale))

    # Adjustments for Changes in Working Capital (Examples)
    # Assets: Decrease adds cash (+), Increase uses cash (-) -> Invert the change
    # Liabilities: Increase adds cash (+), Decrease uses cash (-) -> Use change directly
    change_ar = _get_change(start_bs, end_bs, "ACCOUNTS_RECEIVABLE")
    if change_ar != 0:
        op_items.append(CashFlowItem(item_name="Change in Accounts Receivable", amount=-change_ar)) 

    change_inv = _get_change(start_bs, end_bs, "INVENTORY")
    if change_inv != 0:
        op_items.append(CashFlowItem(item_name="Change in Inventory", amount=-change_inv))
        
    change_oca = _get_change(start_bs, end_bs, "OTHER_CURRENT_ASSETS")
    if change_oca != 0:
        op_items.append(CashFlowItem(item_name="Change in Other Current Assets", amount=-change_oca))

    change_ap = _get_change(start_bs, end_bs, "ACCOUNTS_PAYABLE")
    if change_ap != 0:
        op_items.append(CashFlowItem(item_name="Change in Accounts Payable", amount=change_ap))
        
    change_ocl = _get_change(start_bs, end_bs, "OTHER_CURRENT_LIABILITIES")
    if change_ocl != 0:
        op_items.append(CashFlowItem(item_name="Change in Other Current Liabilities", amount=change_ocl))
    
    # TODO: Add other specific working capital adjustments if needed (e.g., Prepaid Expenses, Accrued Revenue)

    operating_subtotal = sum(item.amount for item in op_items)
    operating_section = CashFlowSection(section_name="Cash Flow from Operating Activities", items=op_items, sub_total=operating_subtotal)

    # --- 3. Investing Activities ---
    inv_items: List[CashFlowItem] = []
    
    # Calculate Purchases/Sales of PP&E, Intangibles, Investments based on changes in mapped BS accounts
    # Note: This is simplified. Assumes change in Gross Asset account reflects cash flow.
    # Increase in asset = Outflow (-). Decrease = Inflow (+), but usually needs adjustment for depreciation/sales proceeds.
    
    change_ppe_gross = _get_change(start_bs, end_bs, "PPE_GROSS")
    if change_ppe_gross != 0:
         # Increase in Gross PP&E implies cash outflow for purchases
         inv_items.append(CashFlowItem(item_name="Purchase of Property, Plant & Equipment", amount=-change_ppe_gross))

    change_intangibles = _get_change(start_bs, end_bs, "INTANGIBLE_ASSETS")
    if change_intangibles != 0:
        # Increase implies cash outflow for purchases
        inv_items.append(CashFlowItem(item_name="Purchase of Intangible Assets", amount=-change_intangibles))
        
    change_investments = _get_change(start_bs, end_bs, "INVESTMENTS")
    if change_investments != 0:
        # Increase implies cash outflow for purchases
        inv_items.append(CashFlowItem(item_name="Purchase/Sale of Investments", amount=-change_investments))

    # TODO: Refine investing activities, e.g., explicitly handle proceeds from asset sales if data available

    investing_subtotal = sum(item.amount for item in inv_items)
    investing_section = CashFlowSection(section_name="Cash Flow from Investing Activities", items=inv_items, sub_total=investing_subtotal)

    # --- 4. Financing Activities ---
    fin_items: List[CashFlowItem] = []

    # Calculate changes in Debt, Equity, Dividends based on changes in mapped BS accounts
    # Increases in Liabilities/Equity = Inflow (+). Decreases = Outflow (-).
    
    change_short_term_debt = _get_change(start_bs, end_bs, "SHORT_TERM_DEBT")
    if change_short_term_debt != 0:
         fin_items.append(CashFlowItem(item_name="Change in Short Term Debt", amount=change_short_term_debt))
         
    change_long_term_debt = _get_change(start_bs, end_bs, "LONG_TERM_DEBT")
    if change_long_term_debt != 0:
         fin_items.append(CashFlowItem(item_name="Change in Long Term Debt", amount=change_long_term_debt))

    change_common_stock = _get_change(start_bs, end_bs, "COMMON_STOCK")
    if change_common_stock != 0:
         fin_items.append(CashFlowItem(item_name="Issuance/Repurchase of Common Stock", amount=change_common_stock))
         
    change_add_paid_in_capital = _get_change(start_bs, end_bs, "ADDITIONAL_PAID_IN_CAPITAL")
    if change_add_paid_in_capital != 0:
        fin_items.append(CashFlowItem(item_name="Change in Additional Paid-in Capital", amount=change_add_paid_in_capital))

    # Calculate Dividends Paid (Net Income - Change in Retained Earnings)
    change_retained_earnings = _get_change(start_bs, end_bs, "RETAINED_EARNINGS")
    # Ensure net_income is available from Operating Activities calculation above
    dividends_paid = net_income - change_retained_earnings # If NI increases RE, but RE didn't increase by full NI amount, difference is dividends
    if dividends_paid != 0:
        # Dividends paid are an outflow, hence should be negative in cash flow statement
        fin_items.append(CashFlowItem(item_name="Dividends Paid", amount=-dividends_paid))

    financing_subtotal = sum(item.amount for item in fin_items)
    financing_section = CashFlowSection(section_name="Cash Flow from Financing Activities", items=fin_items, sub_total=financing_subtotal)

    # --- 5. Summary and Reconciliation ---
    net_change_in_cash = operating_subtotal + investing_subtotal + financing_subtotal
    calculated_closing_cash = opening_cash + net_change_in_cash
    reconciliation_difference = actual_closing_cash - calculated_closing_cash

    return CashFlowStatement(
        opening_cash=opening_cash,
        operating_activities=operating_section,
        investing_activities=investing_section,
        financing_activities=financing_section,
        net_change_in_cash=net_change_in_cash,
        closing_cash=calculated_closing_cash, # Report the calculated closing cash
        reconciliation_difference=reconciliation_difference
    )


# --- API Endpoint ---

class CalculateCashFlowRequest(BaseModel):
    """Request body for the cash flow calculation endpoint."""
    period_data: PeriodFinancialsInput

@router.post("/calculate-indirect", response_model=CashFlowStatement)
def calculate_cash_flow_endpoint(request: CalculateCashFlowRequest) -> CashFlowStatement:
    """
    API endpoint to calculate the cash flow statement using the indirect method.
    Takes mapped financial data for a period and returns the calculated statement.
    """
    return calculate_cash_flow_indirect(request.period_data)
