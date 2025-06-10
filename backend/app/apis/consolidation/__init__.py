"""
API for financial consolidation calculations.
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field, validator
from typing import List, Dict, Optional, Any, Tuple # Added missing imports, Added Tuple
from collections import defaultdict # Added for P&L mapping
import databutton as db # Added
import re # Added
import math # Added for rounding
import pandas as pd # Added for FX
from enum import Enum # Added
import uuid # Added
from datetime import datetime # Ensure datetime is imported directly for default_factory

# --- Configurable Constants (for Intercompany Eliminations) ---
# TODO: Make these configurable per organization/consolidation group later
# Define IC account ranges (replace hardcoded lists)
IC_RECEIVABLE_RANGE_START = "1400" # Example for Assets: Intercompany Receivables
IC_RECEIVABLE_RANGE_END = "1499"   # Example
IC_PAYABLE_RANGE_START = "2400"   # Example for Liabilities: Intercompany Payables
IC_PAYABLE_RANGE_END = "2499"     # Example
# Add more ranges as needed for Revenue/Expenses
# IC_REVENUE_RANGE_START = "4500"
# IC_REVENUE_RANGE_END = "4599"
# IC_EXPENSE_RANGE_START = "5500"
# IC_EXPENSE_RANGE_END = "5599"

# Assuming we have access to the entity structure defined elsewhere
# from app.apis.entities import BusinessEntityBase # Hypothetical import

# Import necessary components from other APIs/schemas
from app.apis.business_entity import list_entities # Function to get all entities
from app.apis.fx_rates import load_fx_rates_df # Added for FX
from app.apis.tax_compliance_schema import BusinessEntityBase, OwnershipDetail # Models


# --- Helper Functions ---

def sanitize_storage_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    return re.sub(r'[^a-zA-Z0-9._-]', '', key)

def get_account_type(account_code: str) -> str:
    """Determine account type based on code range (simplistic)."""
    # TODO: Replace with proper Chart of Accounts lookup
    code_prefix = account_code[:1] # First digit
    if code_prefix in ['1', '2', '3']: # Assets, Liabilities, Equity
        return 'BS' # Balance Sheet
    elif code_prefix in ['4', '5']: # Revenue, Expenses
        return 'PL' # Profit & Loss
    else:
        return 'Unknown' # Or handle other ranges/types

def get_fx_rate(fx_df: pd.DataFrame, from_curr: str, to_curr: str, rate_type: str) -> Optional[float]:
    """Get a specific FX rate from the loaded DataFrame."""
    if fx_df.empty:
        return None
    try:
        # Filter for the specific rate
        rate_row = fx_df[
            (fx_df['from_currency'] == from_curr) & 
            (fx_df['to_currency'] == to_curr) & 
            (fx_df['rate_type'].str.lower() == rate_type.lower())
        ]
        if not rate_row.empty:
            return rate_row['rate'].iloc[0]
        else:
            # Try inverse rate if direct rate not found
            inverse_rate_row = fx_df[
                (fx_df['from_currency'] == to_curr) & 
                (fx_df['to_currency'] == from_curr) & 
                (fx_df['rate_type'].str.lower() == rate_type.lower())
            ]
            if not inverse_rate_row.empty:
                inverse_rate = inverse_rate_row['rate'].iloc[0]
                if inverse_rate != 0:
                    return 1.0 / inverse_rate
    except Exception as e:
        print(f"Error looking up FX rate ({from_curr}->{to_curr}, {rate_type}): {e}")
    return None

# --- Main API Functions / Classes ---

class AccountBalance(BaseModel):
    account_code: str # Assuming 'account_code' for consistency
    balance: float
    currency: Optional[str] = None

class EntityFinancialData(BaseModel):
    entity_id: str
    # Using a dictionary for simplicity: {account_code: balance}
    # A list of AccountBalance might be better for more detail later
    trial_balance: Dict[str, float] 
    # Could also include transaction lists here

class EntityStructure(BaseModel):
    """Explicit model for entity structure, mirroring get_entity_structure output"""
    entities: List[Dict[str, Any]] # List of entity dicts (id, name, etc.)

    ownership: Dict[str, List[Dict[str, Any]]] # {parent_id: [{owned_entity_id, percentage}, ...]}

    # Add a mapping for quick currency lookup
    _entity_currency_map: Dict[str, str] = {}

    def get_entity_currency(self, entity_id: str) -> Optional[str]:
        """Helper to get currency for an entity ID quickly."""
        if not self._entity_currency_map:
            # Build the map on first access
            self._entity_currency_map = {entity.get('id'): entity.get('local_currency') 
                                          for entity in self.entities if entity.get('id') and entity.get('local_currency')}
        return self._entity_currency_map.get(entity_id)

class ConsolidationRequest(BaseModel):

    # ID for the group of entities being consolidated (e.g., top-level parent ID)
    consolidation_group_id: str 
    organization_id: str # Added: ID of the overarching organization
    period: str # Period for consolidation (e.g., "2024-12", "2024-Q4")
    data_type: str # Added: Type of financial data to consolidate (e.g., 'trial_balance')
    # Removed entity_data: List[EntityFinancialData]
    
    # Optional overrides for testing purposes
    entity_structure_override: Optional[EntityStructure] = None
    entity_financial_data_override: Optional[Dict[str, List[Dict]]] = None # {entity_id: [financial records]}
    coa_mapping_id: Optional[str] = None # Added to specify CoA mapping for statements

class ConsolidatedFinancials(BaseModel):
    period: str
    reporting_currency: str
    consolidated_trial_balance: Dict[str, float]
    elimination_details: Optional[Dict[str, float]] = None
    elimination_mismatch: Optional[Dict[str, float]] = None
    non_controlling_interest: Optional[Dict[str, float]] = None # NCI adjustments per account
    currency_translation_adjustment: Optional[float] = None
    account_level_entity_contributions: Optional[Dict[str, Dict[str, float]]] = None # {account_code: {entity_id: contribution_amount_in_reporting_currency}}
    # Later: P&L, Balance Sheet, Cash Flow structured models

class FinancialStatementLineItem(BaseModel):
    """Represents a single line item in a financial statement."""
    description: str
    amount: float
    currency: Optional[str] = None # Currency of the amount
    details: Optional[Dict[str, Any]] = None # For notes, breakdowns, etc.

class ProfitAndLossSection(BaseModel):
    """Represents a section within the P&L (e.g., Revenue, Operating Expenses)."""
    section_title: str
    line_items: List[FinancialStatementLineItem]
    section_total: float

class ConsolidatedProfitAndLossStatement(BaseModel):
    """Consolidated Profit and Loss Statement."""
    period: str
    reporting_currency: str
    
    revenue: ProfitAndLossSection
    cost_of_sales: Optional[ProfitAndLossSection] = None
    gross_profit: FinancialStatementLineItem # Calculated: Revenue - CoS
    
    operating_expenses: ProfitAndLossSection
    other_operating_income: Optional[ProfitAndLossSection] = None
    operating_income: FinancialStatementLineItem # Calculated: Gross Profit - OpEx + Other OpIncome
    
    finance_income: Optional[ProfitAndLossSection] = None
    finance_costs: Optional[ProfitAndLossSection] = None
    net_finance_cost_or_income: FinancialStatementLineItem # Calculated
    
    share_of_profit_from_associates: Optional[ProfitAndLossSection] = None
    
    profit_before_tax: FinancialStatementLineItem # Calculated
    income_tax_expense: Optional[ProfitAndLossSection] = None
    profit_for_the_period: FinancialStatementLineItem # Calculated
    
    # Attributable to:
    profit_attributable_to_owners_of_parent: Optional[FinancialStatementLineItem] = None
    profit_attributable_to_non_controlling_interests: Optional[FinancialStatementLineItem] = None

class BalanceSheetSection(BaseModel):
    """Represents a section within the Balance Sheet (e.g., Current Assets)."""
    section_title: str
    line_items: List[FinancialStatementLineItem]
    section_total: float

class ConsolidatedBalanceSheet(BaseModel):
    """Consolidated Balance Sheet."""
    as_at_date: str # e.g., "2024-12-31"
    reporting_currency: str

    # Assets
    non_current_assets: BalanceSheetSection
    current_assets: BalanceSheetSection
    total_assets: FinancialStatementLineItem # Calculated

    # Equity and Liabilities
    equity_attributable_to_owners_of_parent: BalanceSheetSection
    non_controlling_interests_equity: Optional[BalanceSheetSection] = None
    total_equity: FinancialStatementLineItem # Calculated
    
    non_current_liabilities: BalanceSheetSection
    current_liabilities: BalanceSheetSection
    total_liabilities: FinancialStatementLineItem # Calculated
    
    total_equity_and_liabilities: FinancialStatementLineItem # Calculated, should match Total Assets

class CashFlowActivitySection(BaseModel):
    """Represents a section for a cash flow activity (Operating, Investing, Financing)."""
    activity_title: str # e.g., "Cash flows from operating activities"
    line_items: List[FinancialStatementLineItem]
    net_cash_from_activity: FinancialStatementLineItem

class ConsolidatedCashFlowStatement(BaseModel):
    """Consolidated Cash Flow Statement for a period."""
    period: str
    reporting_currency: str

    cash_flows_from_operating_activities: CashFlowActivitySection
    cash_flows_from_investing_activities: CashFlowActivitySection
    cash_flows_from_financing_activities: CashFlowActivitySection

    net_increase_decrease_in_cash: FinancialStatementLineItem # Calculated
    cash_at_beginning_of_period: FinancialStatementLineItem
    effect_of_fx_rate_changes_on_cash: Optional[FinancialStatementLineItem] = None
    cash_at_end_of_period: FinancialStatementLineItem # Calculated, should match BS cash

# --- End of existing Pydantic Models for Statements ---

# TODO: Consider moving CoA mapping models and logic to a separate API (e.g., coa_mappings.py) if it grows too large.

class FinancialStatementCategory(str, Enum):
    REVENUE = "Revenue"
    COST_OF_SALES = "Cost_of_Sales"
    OPERATING_EXPENSES = "Operating_Expenses"
    OTHER_INCOME = "Other_Income"
    OTHER_EXPENSES = "Other_Expenses"
    FINANCE_INCOME = "Finance_Income"
    FINANCE_COSTS = "Finance_Costs"
    INCOME_TAX_EXPENSE = "Income_Tax_Expense"
    # Balance Sheet Categories
    NON_CURRENT_ASSETS = "Non_Current_Assets"
    CURRENT_ASSETS = "Current_Assets"
    EQUITY = "Equity"
    NON_CURRENT_LIABILITIES = "Non_Current_Liabilities"
    CURRENT_LIABILITIES = "Current_Liabilities"
    # Cash Flow Categories (simplified - direct method items or indirect adjustments)
    CASH_INFLOW_OPERATING = "Cash_Inflow_Operating"
    CASH_OUTFLOW_OPERATING = "Cash_Outflow_Operating"
    CASH_INFLOW_INVESTING = "Cash_Inflow_Investing"
    CASH_OUTFLOW_INVESTING = "Cash_Outflow_Investing"
    CASH_INFLOW_FINANCING = "Cash_Inflow_Financing"
    CASH_OUTFLOW_FINANCING = "Cash_Outflow_Financing"

class CoAMapRule(BaseModel):
    rule_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    map_to_category: FinancialStatementCategory
    # More specific target, e.g., "interest_expense" under FINANCE_COSTS. 
    # Could align with keys in P&L/BS/CF statement models for direct population.
    map_to_line_item_key: str 
    description: Optional[str] = None
    # Define how accounts are matched. At least one must be provided.
    account_codes: Optional[List[str]] = None # Exact match
    account_code_starts_with: Optional[List[str]] = None # Prefix match
    # account_code_range: Optional[Tuple[str, str]] = None # TODO: Implement range matching later if needed
    is_contra_account: bool = False # e.g., Accumulated Depreciation (BS), Sales Returns (P&L)
    notes: Optional[str] = None

    @validator('account_codes', 'account_code_starts_with', always=True)
    def check_at_least_one_matcher(cls, v, values):
        if not values.get('account_codes') and not values.get('account_code_starts_with'):
            raise ValueError("At least one of account_codes or account_code_starts_with must be provided.")
        # This validator is tricky with 'always=True' if the field itself is None.
        # It runs even if 'account_codes' is not provided. Let's adjust.
        # The actual check needs to consider if *both* are None.
        if values.get('account_codes') is None and values.get('account_code_starts_with') is None:
             # This condition is now correctly inside the validator logic that checks for presence of either.
             # The original raise ValueError was fine, this comment clarifies the logic.
             pass # Original logic was fine, just ensuring clarity.
        return v

class CoAMapping(BaseModel):
    mapping_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    organization_id: str # Associated organization
    rules: List[CoAMapRule] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    def get_rule_for_account(self, account_code: str) -> Optional[CoAMapRule]:
        """Finds the first matching rule for a given account code."""
        for rule in self.rules:
            if rule.account_codes and account_code in rule.account_codes:
                return rule
            if rule.account_code_starts_with:
                for prefix in rule.account_code_starts_with:
                    if account_code.startswith(prefix):
                        return rule
        return None

# --- API Router ---
router = APIRouter(prefix="/consolidation", tags=["Consolidation"])

# Endpoint to manage Chart of Accounts Mappings
COA_MAPPING_STORAGE_PREFIX = "coa_mapping_"

class CoAMappingCreatePayload(BaseModel):
    name: str
    organization_id: str # This field is only for creation, cannot be updated via PUT
    rules: List[CoAMapRule] = []

class CoAMappingUpdatePayload(BaseModel):
    name: Optional[str] = None
    rules: Optional[List[CoAMapRule]] = None

class CoAMappingListResponse(BaseModel):
    mappings: List[CoAMapping]

@router.post("/coa-mappings/", response_model=CoAMapping, status_code=201)
def create_coa_mapping(payload: CoAMappingCreatePayload):
    mapping_id = str(uuid.uuid4())
    now = datetime.utcnow()
    
    coa_mapping = CoAMapping(
        mapping_id=mapping_id,
        name=payload.name,
        organization_id=payload.organization_id,
        rules=payload.rules,
        created_at=now,
        updated_at=now
    )
    storage_key = f"{COA_MAPPING_STORAGE_PREFIX}{coa_mapping.mapping_id}"
    try:
        db.storage.json.put(sanitize_storage_key(storage_key), coa_mapping.dict())
        print(f"Saved CoA Mapping {coa_mapping.mapping_id} for org {coa_mapping.organization_id}")
    except Exception as e:
        print(f"Error saving CoA mapping {coa_mapping.mapping_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Could not save CoA mapping: {str(e)}")
    return coa_mapping

@router.get("/coa-mappings/{mapping_id}", response_model=CoAMapping)
def get_coa_mapping(mapping_id: str):
    storage_key = f"{COA_MAPPING_STORAGE_PREFIX}{mapping_id}"
    try:
        mapping_data = db.storage.json.get(sanitize_storage_key(storage_key))
        return CoAMapping(**mapping_data)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"CoA Mapping with ID '{mapping_id}' not found.")
    except Exception as e:
        print(f"Error retrieving CoA mapping {mapping_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Could not retrieve CoA mapping: {str(e)}")

@router.put("/coa-mappings/{mapping_id}", response_model=CoAMapping)
def update_coa_mapping(mapping_id: str, payload: CoAMappingUpdatePayload):
    storage_key = f"{COA_MAPPING_STORAGE_PREFIX}{mapping_id}"
    try:
        # Get existing mapping
        try:
            existing_mapping_data = db.storage.json.get(sanitize_storage_key(storage_key))
            existing_mapping = CoAMapping(**existing_mapping_data)
        except FileNotFoundError:
            raise HTTPException(status_code=404, detail=f"CoA Mapping with ID '{mapping_id}' not found for update.")

        # Update fields if provided in payload
        update_data = payload.dict(exclude_unset=True)
        if "name" in update_data:
            existing_mapping.name = update_data["name"]
        if "rules" in update_data:
            # Validate new rules if necessary, or assume they are valid CoAMapRule instances
            existing_mapping.rules = [CoAMapRule(**rule) for rule in update_data["rules"]]
        
        existing_mapping.updated_at = datetime.utcnow()
        
        db.storage.json.put(sanitize_storage_key(storage_key), existing_mapping.dict())
        print(f"Updated CoA Mapping {existing_mapping.mapping_id}")
        return existing_mapping

    except HTTPException as http_exc: # Re-raise HTTP exceptions (like 404)
        raise http_exc
    except Exception as e:
        print(f"Error updating CoA mapping {mapping_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Could not update CoA mapping: {str(e)}")

@router.delete("/coa-mappings/{mapping_id}", status_code=204)
def delete_coa_mapping(mapping_id: str):
    storage_key = f"{COA_MAPPING_STORAGE_PREFIX}{mapping_id}"
    try:
        # Check if file exists before attempting delete to provide a 404 if not found
        # db.storage.json.get will raise FileNotFoundError if it doesn't exist.
        db.storage.json.get(sanitize_storage_key(storage_key)) # This line checks existence
        db.storage.json.delete(sanitize_storage_key(storage_key))
        print(f"Deleted CoA Mapping {mapping_id}")
        # No content to return, FastAPI handles 204
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"CoA Mapping with ID '{mapping_id}' not found for deletion.")
    except Exception as e:
        print(f"Error deleting CoA mapping {mapping_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Could not delete CoA mapping: {str(e)}")

@router.get("/coa-mappings/organization/{organization_id}", response_model=CoAMappingListResponse)
def list_coa_mappings_for_organization(organization_id: str):
    org_mappings: List[CoAMapping] = []
    try:
        all_mapping_keys = db.storage.json.list()
    except Exception as e:
        print(f"Error listing CoA mapping keys from storage: {e}")
        raise HTTPException(status_code=500, detail="Could not list CoA mappings from storage.")

    for item in all_mapping_keys:
        key = item.name 
        if key.startswith(COA_MAPPING_STORAGE_PREFIX):
            try:
                mapping_data = db.storage.json.get(sanitize_storage_key(key))
                coa_mapping = CoAMapping(**mapping_data)
                if coa_mapping.organization_id == organization_id:
                    org_mappings.append(coa_mapping)
            except FileNotFoundError:
                print(f"Listed CoA mapping key {key} not found during retrieval.")
                continue
            except Exception as e:
                print(f"Error processing CoA mapping key {key} for organization {organization_id}: {e}")
                continue
                
    return CoAMappingListResponse(mappings=org_mappings)

# --- Helper Functions ---

def get_entity_structure(group_id: str):
    """
    Fetches the entity relationship structure from storage.
    Returns a structure representing entities and ownership.
    Ignores group_id for now, returns the full structure.
    """
    print(f"Fetching full entity structure (group_id '{group_id}' ignored for now)")
    
    all_entities_base: List[BusinessEntityBase] = list_entities()

    entities_output = []
    ownership_output = {} # {parent_id: [{"owned_entity_id": child_id, "percentage": p}, ...]}

    for entity in all_entities_base:
        # Add core entity details
        entities_output.append({
            "id": entity.id,
            "name": entity.name,
            "local_currency": entity.local_currency, # Added for FX translation
            # Include other relevant fields from BusinessEntityBase if needed later
            # e.g., entity.abn, entity.business_structure
        })

        # Process ownership details if a parent exists
        if entity.parent_entity_id:
            parent_id = entity.parent_entity_id
            percentage = 100.0  # Default if no specific detail found
            owner_detail_found = False

            if entity.ownership_details:
                for detail in entity.ownership_details:
                    # Assuming OwnershipDetail model has owner_entity_id and percentage fields
                    if hasattr(detail, 'owner_entity_id') and hasattr(detail, 'percentage'):
                        if detail.owner_entity_id == parent_id:
                            percentage = detail.percentage
                            owner_detail_found = True
                            break # Found the relevant ownership detail for this parent
                    else:
                        print(f"Warning: OwnershipDetail for entity {entity.id} lacks expected fields.")
            
            if not owner_detail_found and entity.ownership_details:
                print(f"Warning: Ownership details found for entity {entity.id}, but none match parent {parent_id}. Assuming 100%.")
            
            # Add to ownership structure
            if parent_id not in ownership_output:
                ownership_output[parent_id] = []

            ownership_output[parent_id].append({
                "owned_entity_id": entity.id,
                "percentage": percentage
            })

    if not all_entities_base:
        print("Warning: No entities found by list_entities().")

    return {
        "entities": entities_output,
        "ownership": ownership_output
    }


def perform_consolidation(request: ConsolidationRequest):
    """
    Main function to perform the consolidation calculation.
    """
    print(f"Starting consolidation for group {request.consolidation_group_id} period {request.period}")

    # 0. Load FX Rates for the period
    print(f"Loading FX rates for organization {request.organization_id} around period {request.period}...")
    try:
        # load_fx_rates_df should handle fetching appropriate rates (e.g., Average, Closing for the period)
        fx_rates_df = load_fx_rates_df() # Corrected: Call with no arguments as per error
        print(f"Loaded {len(fx_rates_df)} FX rates.")
        if fx_rates_df.empty:
             print("Warning: No FX rates loaded. Currency translation will not be possible.")
    except Exception as e:
        print(f"Error loading FX rates: {e}. Proceeding without currency translation.")
        fx_rates_df = pd.DataFrame() # Ensure df exists but is empty


    # 1. Fetch or use override entity structure
    if request.entity_structure_override:
        print("Using provided entity_structure_override for testing.")
        # Use parse_obj to properly initialize the model with the nested dict and build the map
        structure = EntityStructure.parse_obj(request.entity_structure_override.dict()) 
    else:
        print("Fetching entity structure from storage...")
        structure_dict = get_entity_structure(request.consolidation_group_id)
        if not structure_dict or not structure_dict.get("entities"):
            raise HTTPException(status_code=404, detail="Entity structure not found or empty.")
        structure = EntityStructure.parse_obj(structure_dict)
        
    # Get the reporting currency (parent's currency)
    reporting_currency = structure.get_entity_currency(request.consolidation_group_id)
    if not reporting_currency:
         raise HTTPException(status_code=400, detail=f"Could not determine reporting currency for parent entity {request.consolidation_group_id}")
    print(f"Reporting Currency: {reporting_currency}")

    # 2. Fetch or use override financial data for each relevant entity
    entity_financial_data: Dict[str, List[Dict]] = {} # {entity_id: [financial records]}
    # Get entity IDs from the parsed structure object
    entity_ids = [entity['id'] for entity in structure.entities] # Use dict access
    print(f"Entity IDs required: {entity_ids}")

    if request.entity_financial_data_override:
        print("Using provided entity_financial_data_override for testing.")
        entity_financial_data = request.entity_financial_data_override
        # Basic validation: Check if provided data covers required entities
        missing_override_data = [eid for eid in entity_ids if eid not in entity_financial_data]
        if missing_override_data:
            print(f"Warning: entity_financial_data_override missing data for entities: {missing_override_data}")
            # Allow proceeding, but consolidation might be incomplete
    else:
        print(f"Fetching financial data for period {request.period} and type {request.data_type} from storage...")
        all_files = db.storage.json.list()
        found_data_count = 0

        for entity_id in entity_ids:
            found_match = False
            prefix = sanitize_storage_key(f"{request.organization_id}_{entity_id}_{request.data_type}")
            # print(f"Searching for prefix: {prefix}") # Reduced verbosity

            for file_info in all_files:
                if file_info.name.startswith(prefix):
                    try:
                        file_content = db.storage.json.get(file_info.name)
                        if file_content and file_content.get("date") == request.period:
                            print(f"  Found matching file for entity {entity_id}: {file_info.name}")
                            data_list = file_content.get("data", [])
                            if data_list:
                               entity_financial_data[entity_id] = data_list
                               found_data_count += 1
                               found_match = True
                               break 
                            else:
                                print(f"  Warning: Matching file {file_info.name} has no 'data' field.")
                    except FileNotFoundError:
                        print(f"  Warning: File {file_info.name} listed but not found on fetch.")
                    except Exception as e:
                        print(f"  Error fetching or parsing file {file_info.name}: {e}")
            
            if not found_match:
                print(f"Warning: No matching financial data found in storage for entity {entity_id} for period {request.period} and type {request.data_type}")

        if found_data_count == 0:
             raise HTTPException(status_code=404, detail=f"No financial data found in storage for any relevant entity for period {request.period} and type {request.data_type}")


    # 3. Aggregate data, applying FX translation and ownership
    consolidated_tb: Dict[str, float] = {}
    account_contributions_by_entity: Dict[str, Dict[str, float]] = {} # For drill-down: {account_code: {entity_id: contribution_amount}}
    is_intercompany_map: Dict[str, bool] = {} # Map to track if account had intercompany flag
    print("Aggregating financial data with FX translation and ownership...")
    ownership_details = structure.ownership
    parent_id = request.consolidation_group_id

    for entity_id, financial_records in entity_financial_data.items():
        entity_currency = structure.get_entity_currency(entity_id)
        print(f"Processing entity: {entity_id} (Currency: {entity_currency})")
        
        if not entity_currency:
            print(f"  Warning: Currency not found for entity {entity_id}. Skipping translation for this entity.")
            needs_translation = False
        elif entity_currency == reporting_currency:
            needs_translation = False
        else:
            needs_translation = True

        ownership_percentage = 1.0 # Default to 100%
        is_parent = (entity_id == parent_id)

        if not is_parent:
            parent_ownership_list = ownership_details.get(parent_id, [])
            found_ownership = False
            for ownership_info in parent_ownership_list:
                if ownership_info.get("owned_entity_id") == entity_id:
                    percentage_val = ownership_info.get("percentage", 100.0)
                    ownership_percentage = percentage_val / 100.0
                    print(f"  Entity {entity_id} owned by {parent_id} at {percentage_val}%")
                    found_ownership = True
                    break
            if not found_ownership:
                 print(f"  Warning: Ownership details for entity {entity_id} under parent {parent_id} not found. Assuming 100% contribution.")
                 ownership_percentage = 1.0 
        else:
             print(f"  Entity {entity_id} is the parent ({parent_id}). Contribution is 100%.")

        # Aggregate based on record format, applying translation and ownership
        for record in financial_records:
             account = None
             balance_local = 0.0
             record_is_intercompany = False
             
             if isinstance(record, dict):
                 account = record.get('account_code') or record.get('item_name') 
                 balance_local = float(record.get('balance') or record.get('amount', 0.0))
                 record_is_intercompany = record.get('is_intercompany', False)
             else:
                 print(f"  Warning: Skipping unrecognized record format in entity {entity_id}: {record}")
                 continue 
            
             if account is not None:
                 balance_reporting = balance_local
                 # --- Apply FX Translation ---
                 if needs_translation:
                     account_type = get_account_type(account)
                     rate_type = 'Closing' if account_type == 'BS' else 'Average'
                     
                     rate = get_fx_rate(fx_rates_df, entity_currency, reporting_currency, rate_type)
                     
                     if rate is not None:
                         balance_reporting = balance_local * rate
                         # print(f"    Translating {account}: {balance_local:.2f} {entity_currency} -> {balance_reporting:.2f} {reporting_currency} (Type: {account_type}, RateType: {rate_type}, Rate: {rate:.4f})") # Verbose
                     else:
                         print(f"    Warning: Missing FX rate ({entity_currency}->{reporting_currency}, {rate_type}) for account {account}. Using original balance.")
                         balance_reporting = balance_local # Fallback to local if rate missing
                 # --- End Translation ---

                 # Apply ownership percentage *after* translation
                 contribution = balance_reporting * ownership_percentage
                 
                 # Add to consolidated total
                 consolidated_tb[account] = consolidated_tb.get(account, 0) + contribution
                 
                 # Store entity-specific contribution for drill-down
                 if account not in account_contributions_by_entity:
                     account_contributions_by_entity[account] = {}
                 account_contributions_by_entity[account][entity_id] = \
                     account_contributions_by_entity[account].get(entity_id, 0) + contribution
                 
                 # Update intercompany map if flag is True in source record
                 if record_is_intercompany:
                      is_intercompany_map[account] = True

    # 5. Calculate Non-Controlling Interest (NCI)
    # NCI represents the portion of equity in a subsidiary not attributable to the parent company.
    # It's calculated *after* the subsidiary's results are fully included (at 100%) initially,
    # and then the non-owned portion is backed out.
    # For a trial balance, we calculate NCI share for each account from partially owned subs.
    print("Calculating Non-Controlling Interest...")
    nci_adjustments: Dict[str, float] = {}
    # total_nci_adjustment = 0.0 # Removed unused placeholder

    for entity_id, financial_records in entity_financial_data.items():
        is_parent = (entity_id == parent_id)
        if is_parent:
            continue # NCI only applies to subsidiaries

        # Find ownership percentage again (could optimize this)
        ownership_percentage = 1.0
        parent_ownership_list = ownership_details.get(parent_id, [])
        found_ownership = False
        for ownership_info in parent_ownership_list:
            if ownership_info.get("owned_entity_id") == entity_id:
                percentage_val = ownership_info.get("percentage", 100.0)
                ownership_percentage = percentage_val / 100.0
                found_ownership = True
                break
        

        if not found_ownership:
            # Should not happen if aggregation worked, but good practice to check
            print(f"  Warning: Ownership for NCI calc not found for sub {entity_id}. Skipping NCI.")
            continue
            
        nci_percentage = 1.0 - ownership_percentage
        
        if nci_percentage > 0.0001: # Check if there is a non-controlling interest (allow for float issues)
            print(f"  Calculating NCI for {entity_id} ({nci_percentage*100:.2f}%)...")
            
            entity_currency = structure.get_entity_currency(entity_id)
            needs_translation = entity_currency != reporting_currency if entity_currency else False

            for record in financial_records:
                 account = None
                 balance_local = 0.0
                 if isinstance(record, dict):
                     account = record.get('account_code') or record.get('item_name')
                     balance_local = float(record.get('balance') or record.get('amount', 0.0))
                 else:
                     continue # Skip unrecognized formats

                 if account is not None:
                     # Apply NCI % to relevant accounts (Equity/P&L for now)
                     account_type = get_account_type(account)
                     if account_type in ['BS', 'PL']: 
                         balance_reporting = balance_local
                         if needs_translation and entity_currency:
                             rate_type = 'Closing' if account_type == 'BS' else 'Average'
                             rate = get_fx_rate(fx_rates_df, entity_currency, reporting_currency, rate_type)
                             if rate is not None:
                                 balance_reporting = balance_local * rate
                             else:
                                 print(f"    Warning: Missing rate for NCI calc on {account}. Skipping NCI for this account.")
                                 continue 
                                 
                         # NCI adjustment is the non-owned portion of the sub's translated balance
                         nci_adj = balance_reporting * nci_percentage
                         
                         # Adjust sign based on account type (Needs Refinement)
                         if account_type == 'BS' and account[0] == '3': # Equity
                             nci_adjustments[account] = nci_adjustments.get(account, 0) - nci_adj 
                         elif account_type == 'PL' and account[0] == '4': # Revenue
                             nci_adjustments[account] = nci_adjustments.get(account, 0) - nci_adj 
                         elif account_type == 'PL' and account[0] == '5': # Expense
                             nci_adjustments[account] = nci_adjustments.get(account, 0) + nci_adj

    # 5. Identify and Perform Intercompany Eliminations (Moved after NCI calculation base)
    print("Identifying and performing intercompany eliminations based on flags and ranges...")
    eliminations_made: Dict[str, float] = {} # {account_code: total_elimination_applied}
    elimination_mismatches: Dict[str, float] = {} # {pair_type: mismatch_amount}

    # 1. Eliminate Intercompany Receivables vs Payables using flags and ranges
    total_ic_receivable = 0.0
    total_ic_payable = 0.0

    # Iterate through aggregated balances
    for acc, balance in consolidated_tb.items():
        if is_intercompany_map.get(acc, False): # Check if flagged as intercompany during aggregation
            if IC_RECEIVABLE_RANGE_START <= acc <= IC_RECEIVABLE_RANGE_END:
                total_ic_receivable += balance
            elif IC_PAYABLE_RANGE_START <= acc <= IC_PAYABLE_RANGE_END:
                total_ic_payable += balance
            # TODO: Add Revenue/Expense ranges checks here later if needed

    print(f"  Pre-elimination Total IC Receivable (flagged, range {IC_RECEIVABLE_RANGE_START}-{IC_RECEIVABLE_RANGE_END}): {total_ic_receivable:.2f}")
    print(f"  Pre-elimination Total IC Payable (flagged, range {IC_PAYABLE_RANGE_START}-{IC_PAYABLE_RANGE_END}): {total_ic_payable:.2f}")

    # Ideal state: total_ic_receivable + total_ic_payable = 0
    # Calculate mismatch (deviation from zero)
    receivable_payable_mismatch = round(total_ic_receivable + total_ic_payable, 2)
    elimination_mismatches["ReceivablePayable"] = receivable_payable_mismatch
    print(f"  Receivable/Payable Mismatch: {receivable_payable_mismatch:.2f}")

    # Eliminate the balance. We eliminate the *smaller* absolute balance against the larger,
    # effectively zeroing out one side and leaving the mismatch on the other.
    elimination_amount_rec_pay = 0.0
    if abs(total_ic_receivable) <= abs(total_ic_payable):
        if abs(total_ic_receivable) > 1e-9: # Avoid eliminating zero against zero
             elimination_amount_rec_pay = -total_ic_receivable # Amount needed to zero out receivables
    else:
         if abs(total_ic_payable) > 1e-9:
             elimination_amount_rec_pay = -total_ic_payable # Amount needed to zero out payables
    
    print(f"  Calculated elimination amount for Rec/Pay: {elimination_amount_rec_pay:.2f}")

    # Apply elimination to flagged accounts within the relevant ranges
    # The goal is to zero out each identified intercompany account balance.
    if abs(total_ic_receivable) > 1e-9 or abs(total_ic_payable) > 1e-9:
        # Store pre-adjustment balances to calculate adjustments correctly
        pre_elimination_balances = consolidated_tb.copy()

        for acc, balance in pre_elimination_balances.items(): # Iterate using original balances
            if is_intercompany_map.get(acc, False):
                adjustment = 0.0
                # Check if the account falls into any defined intercompany range
                is_ic_receivable = IC_RECEIVABLE_RANGE_START <= acc <= IC_RECEIVABLE_RANGE_END
                is_ic_payable = IC_PAYABLE_RANGE_START <= acc <= IC_PAYABLE_RANGE_END
                # TODO: Add checks for other ranges (Revenue/Expense) if defined

                if is_ic_receivable or is_ic_payable:
                    # The correct adjustment to zero out this specific account is -balance
                    adjustment = -balance
                    
                    if abs(adjustment) > 1e-9:
                        # Apply adjustment to the main consolidated_tb
                        consolidated_tb[acc] = consolidated_tb.get(acc, 0) + adjustment # Apply to the live dict
                        eliminations_made[acc] = eliminations_made.get(acc, 0) + adjustment
                        print(f"    Adjusting IC Account {acc} by {adjustment:.2f} (Original: {balance:.2f}). New balance: {consolidated_tb[acc]:.2f}")

    # TODO: Add similar logic for Intercompany Sales vs COGS/Expenses if configured
    # Calculate totals for flagged Revenue/Expense accounts
    # Calculate mismatch
    # Calculate elimination amount
    # Apply elimination adjustment

    # --- End Intercompany Elimination Logic ---

    # 6. Calculate Currency Translation Adjustment (CTA)
    # This adjustment balances the BS due to using different FX rates for BS (Closing) and P&L (Average)
    print("Calculating Currency Translation Adjustment (CTA)...")
    cta_account_code = "3999" # Define a specific account for CTA within Equity
    # Sum the trial balance *after* eliminations but *before* NCI is applied to TB
    current_tb_sum = sum(consolidated_tb.values())
    cta_amount = -current_tb_sum # CTA plugs the imbalance
    print(f"  Calculated CTA: {cta_amount:.2f} {reporting_currency}")

    # Add CTA to the consolidated trial balance
    consolidated_tb[cta_account_code] = consolidated_tb.get(cta_account_code, 0) + cta_amount
    # Ensure the account exists even if CTA is zero
    if cta_account_code not in consolidated_tb:
        consolidated_tb[cta_account_code] = 0.0

    # Verify balance after plugging CTA (optional debug check)
    final_tb_sum_pre_nci_apply = sum(consolidated_tb.values())
    if abs(final_tb_sum_pre_nci_apply) > 0.01: # Allow for small rounding differences
        print(f"  Warning: Trial Balance still unbalanced after CTA: {final_tb_sum_pre_nci_apply:.2f}")

    # 7. Apply NCI Adjustments to Final TB
    print("Applying NCI adjustments to final Trial Balance...")
    for account, nci_adj in nci_adjustments.items():
        consolidated_tb[account] = consolidated_tb.get(account, 0) + nci_adj
        # Note: We report the detailed nci_adjustments, not just a single NCI equity line yet.

    # 8. Finalize Consolidated Figures
    print("Finalizing consolidated figures...")

    # Optional: Create a single NCI Equity line adjustment
    # This typically involves summing NCI adjustments for Equity accounts (e.g., Retained Earnings, Share Capital)
    # and potentially reversing NCI adjustments on P&L accounts into a single NCI Share of Profit line.
    # For now, we just report the per-account NCI calculations.

    # Return results
    # Round final balances for cleaner output
    final_consolidated_tb = {acc: round(bal, 2) for acc, bal in consolidated_tb.items()}
    
    return ConsolidatedFinancials(
        period=request.period,
        reporting_currency=reporting_currency, # Added missing reporting_currency
        consolidated_trial_balance=final_consolidated_tb,
        elimination_details=eliminations_made or None,
        elimination_mismatch=elimination_mismatches or None,
        non_controlling_interest=nci_adjustments or None,
        currency_translation_adjustment=round(cta_amount, 2),
        account_level_entity_contributions=account_contributions_by_entity or None
    )



def _generate_cash_flow_statement(
    consolidated_tb: Dict[str, float],
    reporting_currency: str,
    period: str, # e.g., "2024-12"
    profit_for_period: float, # From P&L
    current_balance_sheet: ConsolidatedBalanceSheet, # To get cash at end
    # previous_balance_sheet: Optional[ConsolidatedBalanceSheet], # For cash at start and changes
    coa_mapping: Optional[CoAMapping] = None
) -> ConsolidatedCashFlowStatement:
    """
    Generates a simplified Consolidated Cash Flow Statement.
    Currently uses placeholders and basic logic. Full indirect method from TB is complex.
    """
    print(f"Generating Cash Flow Statement for period {period} in {reporting_currency}")

    # Initialize sections
    operating_activities_items: List[FinancialStatementLineItem] = []
    investing_activities_items: List[FinancialStatementLineItem] = []
    financing_activities_items: List[FinancialStatementLineItem] = []

    total_operating_cash_flow = 0.0
    total_investing_cash_flow = 0.0
    total_financing_cash_flow = 0.0

    # Placeholder for cash at beginning (requires prior period BS or specific opening balance logic)
    cash_at_beginning_amount = 0.0 # Placeholder

    # Try to get cash at end from current BS
    cash_at_end_amount = 0.0
    # Assuming 'Cash and Cash Equivalents' is a line item in current_assets
    # Search for typical cash account descriptions
    cash_account_keywords = ["cash", "bank", "equivalents"]
    if current_balance_sheet and current_balance_sheet.current_assets:
        for item in current_balance_sheet.current_assets.line_items:
            if any(keyword in item.description.lower() for keyword in cash_account_keywords):
                cash_at_end_amount += item.amount
                # If mapped data is simple, might break here. If detailed, might sum multiple.
                # For now, assume one primary line or sum if multiple match.
    
    if cash_at_end_amount == 0 and current_balance_sheet and current_balance_sheet.current_assets and current_balance_sheet.current_assets.line_items:
        print("Warning: Could not definitively identify cash at end from BS via keywords. Summing all current asset accounts mapped as 'Cash' if CoA mapping allows, otherwise using 0.")
        # If a CoA mapping is present, it might provide more specific cash accounts.
        # This part is tricky without knowing the exact structure of 'map_to_line_item_key' for cash.

    if coa_mapping:
        print(f"Attempting to generate Cash Flow Statement using CoA Mapping: {coa_mapping.name}")
        temp_operating_inflows = defaultdict(float)
        temp_operating_outflows = defaultdict(float)
        temp_investing_inflows = defaultdict(float)
        temp_investing_outflows = defaultdict(float)
        temp_financing_inflows = defaultdict(float)
        temp_financing_outflows = defaultdict(float)

        for acc_code, balance in consolidated_tb.items():
            rule = coa_mapping.get_rule_for_account(acc_code)
            if rule:
                # This logic is highly dependent on how CoA rules are defined for CF.
                # A direct TB to CF mapping is non-trivial. Typically CF items are derived.
                # The 'balance' from TB for BS accounts represents a closing balance, not a flow.
                # P&L accounts are flows for the period.
                # For simplicity, this example assumes rules directly map TB accounts to CF lines,
                # which is a strong simplification.
                
                # Sign convention: Inflows positive, Outflows positive in their sections (but deduct from total CF).
                # This needs careful thought based on TB debit/credit nature and desired CF presentation.
                # Assuming positive 'balance' in TB for an expense (debit) is an outflow.
                # Assuming negative 'balance' in TB for revenue (credit) is an inflow (after sign flip).
                
                cf_amount = balance # Placeholder, real logic is more complex
                
                # Flip sign for contra accounts if necessary or handle based on category
                # if rule.is_contra_account: cf_amount *= -1 

                if rule.map_to_category == FinancialStatementCategory.CASH_INFLOW_OPERATING:
                    # Example: Revenue accounts might map here. If TB balance is -100 (credit), map as +100 inflow.
                    temp_operating_inflows[rule.map_to_line_item_key] += -balance if balance < 0 else balance # Simplified
                elif rule.map_to_category == FinancialStatementCategory.CASH_OUTFLOW_OPERATING:
                    # Example: Expense accounts. If TB balance is +50 (debit), map as +50 outflow.
                    temp_operating_outflows[rule.map_to_line_item_key] += balance if balance > 0 else -balance # Simplified
                elif rule.map_to_category == FinancialStatementCategory.CASH_INFLOW_INVESTING:
                    temp_investing_inflows[rule.map_to_line_item_key] += -balance if balance < 0 else balance
                elif rule.map_to_category == FinancialStatementCategory.CASH_OUTFLOW_INVESTING:
                    # E.g. Purchase of PPE (Asset account increases - debit in TB). Change in asset.
                    # This mapping from TB balance directly is hard. Usually it's (Asset_End - Asset_Start).
                    temp_investing_outflows[rule.map_to_line_item_key] += balance if balance > 0 else -balance
                elif rule.map_to_category == FinancialStatementCategory.CASH_INFLOW_FINANCING:
                    temp_financing_inflows[rule.map_to_line_item_key] += -balance if balance < 0 else balance
                elif rule.map_to_category == FinancialStatementCategory.CASH_OUTFLOW_FINANCING:
                    temp_financing_outflows[rule.map_to_line_item_key] += balance if balance > 0 else -balance
        
        for key, amount in temp_operating_inflows.items():
            operating_activities_items.append(FinancialStatementLineItem(description=key.replace("_", " ").title(), amount=amount, currency=reporting_currency))
            total_operating_cash_flow += amount
        for key, amount in temp_operating_outflows.items(): # Outflows are positive numbers in items, but reduce total
            operating_activities_items.append(FinancialStatementLineItem(description=key.replace("_", " ").title(), amount=amount, currency=reporting_currency))
            total_operating_cash_flow -= amount 
        
        for key, amount in temp_investing_inflows.items():
            investing_activities_items.append(FinancialStatementLineItem(description=key.replace("_", " ").title(), amount=amount, currency=reporting_currency))
            total_investing_cash_flow += amount
        for key, amount in temp_investing_outflows.items():
            investing_activities_items.append(FinancialStatementLineItem(description=key.replace("_", " ").title(), amount=amount, currency=reporting_currency))
            total_investing_cash_flow -= amount

        for key, amount in temp_financing_inflows.items():
            financing_activities_items.append(FinancialStatementLineItem(description=key.replace("_", " ").title(), amount=amount, currency=reporting_currency))
            total_financing_cash_flow += amount
        for key, amount in temp_financing_outflows.items():
            financing_activities_items.append(FinancialStatementLineItem(description=key.replace("_", " ").title(), amount=amount, currency=reporting_currency))
            total_financing_cash_flow -= amount
    else:
        # Highly Simplified Indirect Method starting point
        print("No CoA Mapping for Cash Flow. Using highly simplified indirect method placeholders.")
        operating_activities_items.append(
            FinancialStatementLineItem(description="Profit for the period", amount=profit_for_period, currency=reporting_currency)
        )
        total_operating_cash_flow = profit_for_period 

        operating_activities_items.append(FinancialStatementLineItem(description="Adjustments for non-cash items (e.g., Depreciation - Placeholder)", amount=0, currency=reporting_currency))
        operating_activities_items.append(FinancialStatementLineItem(description="Changes in working capital (Placeholder)", amount=0, currency=reporting_currency))
        
        investing_activities_items.append(FinancialStatementLineItem(description="Purchase/Sale of PPE (Net - Placeholder)", amount=0, currency=reporting_currency))
        total_investing_cash_flow = 0

        financing_activities_items.append(FinancialStatementLineItem(description="Proceeds from/Repayment of borrowings (Net - Placeholder)", amount=0, currency=reporting_currency))
        total_financing_cash_flow = 0

    op_section = CashFlowActivitySection(
        activity_title="Cash flows from operating activities",
        line_items=operating_activities_items,
        net_cash_from_activity=FinancialStatementLineItem(description="Net cash from operating activities", amount=round(total_operating_cash_flow, 2), currency=reporting_currency)
    )
    inv_section = CashFlowActivitySection(
        activity_title="Cash flows from investing activities",
        line_items=investing_activities_items,
        net_cash_from_activity=FinancialStatementLineItem(description="Net cash from investing activities", amount=round(total_investing_cash_flow, 2), currency=reporting_currency)
    )
    fin_section = CashFlowActivitySection(
        activity_title="Cash flows from financing activities",
        line_items=financing_activities_items,
        net_cash_from_activity=FinancialStatementLineItem(description="Net cash from financing activities", amount=round(total_financing_cash_flow, 2), currency=reporting_currency)
    )

    net_increase_decrease = total_operating_cash_flow + total_investing_cash_flow + total_financing_cash_flow
    
    # Reconciliation: Cash at End = Cash at Beginning + Net Increase/Decrease + FX Effect
    # For now, cash_at_end_amount is taken from BS. cash_at_beginning_amount is a placeholder.
    # A more robust solution would calculate one based on the others if two are known.
    # If cash_at_end_amount was identified from BS:
    # cash_at_beginning_amount = cash_at_end_amount - net_increase_decrease - (effect_of_fx_rate_changes_on_cash if provided)
    
    # If cash at end was not found from BS, this CF statement will not balance with BS without more data.

    return ConsolidatedCashFlowStatement(
        period=period,
        reporting_currency=reporting_currency,
        cash_flows_from_operating_activities=op_section,
        cash_flows_from_investing_activities=inv_section,
        cash_flows_from_financing_activities=fin_section,
        net_increase_decrease_in_cash=FinancialStatementLineItem(description="Net increase/(decrease) in cash and cash equivalents", amount=round(net_increase_decrease, 2), currency=reporting_currency),
        cash_at_beginning_of_period=FinancialStatementLineItem(description="Cash and cash equivalents at beginning of period", amount=round(cash_at_beginning_amount, 2), currency=reporting_currency),
        effect_of_fx_rate_changes_on_cash=FinancialStatementLineItem(description="Effect of exchange rate changes on cash (Placeholder)", amount=0, currency=reporting_currency), # Placeholder
        cash_at_end_of_period=FinancialStatementLineItem(description="Cash and cash equivalents at end of period", amount=round(cash_at_end_amount, 2), currency=reporting_currency) 
    )

# --- End Cash Flow Statement Generation ---


@router.post("/financial-statements", response_model=Dict[str, Any]) # Placeholder response
async def get_consolidated_financial_statements(request: ConsolidationRequest):
    """
    Processes a consolidated trial balance and returns structured financial statements
    (Profit & Loss, Balance Sheet, Cash Flow Statement).
    
    NOTE: Balance Sheet and Cash Flow are placeholders. P&L is an initial implementation.
    """
    print(f"Initiating structured financial statements for group {request.consolidation_group_id}, period {request.period}")

    # 1. Perform the base consolidation to get the trial balance
    try:
        # Assuming perform_consolidation is synchronous and can be called directly.
        # If it were async, it would be: consolidated_data = await perform_consolidation(request)
        consolidated_data = perform_consolidation(request)
        trial_balance = consolidated_data.consolidated_trial_balance
        reporting_currency = consolidated_data.reporting_currency # Use currency from consolidated_data

    except HTTPException as http_exc:
        raise http_exc # Re-raise HTTP exceptions from perform_consolidation
    except Exception as e:
        print(f"Error during base consolidation call: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching trial balance for statements: {str(e)}")

    # 2. Attempt to load the specified CoA mapping if ID is provided
    loaded_coa_map: Optional[CoAMapping] = None
    if request.coa_mapping_id:
        try:
            map_storage_key = f"{COA_MAPPING_STORAGE_PREFIX}{request.coa_mapping_id}"
            map_data = db.storage.json.get(sanitize_storage_key(map_storage_key))
            loaded_coa_map = CoAMapping(**map_data)
            print(f"Successfully loaded CoA Mapping ID: {request.coa_mapping_id} for statement generation.")
        except FileNotFoundError:
            # Consider if this should be a 404 or a 400 if a mapping is specified but not found
            raise HTTPException(status_code=400, detail=f"Specified CoA Mapping with ID '{request.coa_mapping_id}' not found.")
        except Exception as e:
            print(f"Error loading CoA Mapping ID {request.coa_mapping_id}: {e}")
            raise HTTPException(status_code=500, detail=f"Could not load CoA Mapping: {str(e)}")

    # Initialize P&L statement structure
    profit_and_loss_statement: ConsolidatedProfitAndLossStatement

    # Pre-calculate entity contributions for summary lines to simplify FinancialStatementLineItem construction
    entity_contributions_map_for_pnl = consolidated_data.account_level_entity_contributions or {}

    if loaded_coa_map:
        print(f"Processing P&L with CoA Mapping ID: {loaded_coa_map.mapping_id}")
        pnl_values: Dict[str, float] = defaultdict(float)
        # Standard convention: Revenue/Income (Credit normal balance) is positive on P&L.
        # Expenses (Debit normal balance) are positive on P&L (and subtracted for NI).
        # Assuming trial balance (TB) from perform_consolidation: Debits are positive, Credits are negative.

        for acc_code, balance in trial_balance.items():
            if not balance: # Skip zero balances
                continue
            rule = loaded_coa_map.get_rule_for_account(acc_code)
            if rule:
                is_pl_category = rule.map_to_category in [
                    FinancialStatementCategory.REVENUE, FinancialStatementCategory.COST_OF_SALES,
                    FinancialStatementCategory.OPERATING_EXPENSES, FinancialStatementCategory.OTHER_INCOME,
                    FinancialStatementCategory.OTHER_EXPENSES, FinancialStatementCategory.FINANCE_INCOME,
                    FinancialStatementCategory.FINANCE_COSTS, FinancialStatementCategory.INCOME_TAX_EXPENSE
                ]
                if is_pl_category:
                    value_to_add = 0.0
                    if rule.map_to_category in [FinancialStatementCategory.REVENUE,
                                                FinancialStatementCategory.OTHER_INCOME,
                                                FinancialStatementCategory.FINANCE_INCOME]:
                        value_to_add = -balance # Convert credit balance (negative in TB) to positive for P&L
                        if rule.is_contra_account:
                            value_to_add = balance
                    elif rule.map_to_category in [FinancialStatementCategory.COST_OF_SALES,
                                                    FinancialStatementCategory.OPERATING_EXPENSES,
                                                    FinancialStatementCategory.OTHER_EXPENSES,
                                                    FinancialStatementCategory.FINANCE_COSTS,
                                                    FinancialStatementCategory.INCOME_TAX_EXPENSE]:
                        value_to_add = balance # Debit balance (positive in TB) is positive for P&L expense
                        if rule.is_contra_account:
                            value_to_add = -balance
                    pnl_values[rule.map_to_line_item_key] += value_to_add

        total_revenue_val = pnl_values.get("TOTAL_REVENUE", 0.0)
        cogs_val = pnl_values.get("COST_OF_SALES", 0.0)
        opex_val = pnl_values.get("OPERATING_EXPENSES", 0.0)
        other_income_val = pnl_values.get("OTHER_INCOME", 0.0)
        other_expenses_val = pnl_values.get("OTHER_EXPENSES", 0.0)
        finance_income_val = pnl_values.get("FINANCE_INCOME", 0.0)
        finance_costs_val = pnl_values.get("FINANCE_COSTS", 0.0)
        income_tax_val = pnl_values.get("INCOME_TAX_EXPENSE", 0.0)

        gross_profit_calc = total_revenue_val - cogs_val
        operating_income_calc = gross_profit_calc - opex_val + other_income_val - other_expenses_val
        net_finance_calc = finance_income_val - finance_costs_val
        income_before_tax_calc = operating_income_calc + net_finance_calc
        net_income_calc = income_before_tax_calc - income_tax_val

        # Entity contributions calculation using the helper
        rev_contribs = _get_entity_contributions_for_mapped_line("TOTAL_REVENUE", loaded_coa_map, entity_contributions_map_for_pnl, trial_balance)
        cogs_contribs = _get_entity_contributions_for_mapped_line("COST_OF_SALES", loaded_coa_map, entity_contributions_map_for_pnl, trial_balance)
        opex_contribs = _get_entity_contributions_for_mapped_line("OPERATING_EXPENSES", loaded_coa_map, entity_contributions_map_for_pnl, trial_balance)
        other_income_contribs = _get_entity_contributions_for_mapped_line("OTHER_INCOME", loaded_coa_map, entity_contributions_map_for_pnl, trial_balance)
        other_expenses_contribs = _get_entity_contributions_for_mapped_line("OTHER_EXPENSES", loaded_coa_map, entity_contributions_map_for_pnl, trial_balance)
        fin_income_contribs = _get_entity_contributions_for_mapped_line("FINANCE_INCOME", loaded_coa_map, entity_contributions_map_for_pnl, trial_balance)
        fin_costs_contribs = _get_entity_contributions_for_mapped_line("FINANCE_COSTS", loaded_coa_map, entity_contributions_map_for_pnl, trial_balance)
        tax_contribs = _get_entity_contributions_for_mapped_line("INCOME_TAX_EXPENSE", loaded_coa_map, entity_contributions_map_for_pnl, trial_balance)

        gp_entity_contributions = {entity: round(rev_contribs.get(entity, 0) - cogs_contribs.get(entity, 0), 2) for entity in set(rev_contribs.keys()) | set(cogs_contribs.keys())}
        op_income_entity_contributions = {entity: round(gp_entity_contributions.get(entity, 0) - opex_contribs.get(entity, 0) + other_income_contribs.get(entity, 0) - other_expenses_contribs.get(entity, 0), 2) for entity in set(gp_entity_contributions.keys()) | set(opex_contribs.keys()) | set(other_income_contribs.keys()) | set(other_expenses_contribs.keys())}
        net_fin_entity_contributions = {entity: round(fin_income_contribs.get(entity, 0) - fin_costs_contribs.get(entity, 0), 2) for entity in set(fin_income_contribs.keys()) | set(fin_costs_contribs.keys())}
        pbt_entity_contributions = {entity: round(op_income_entity_contributions.get(entity, 0) + net_fin_entity_contributions.get(entity, 0), 2) for entity in set(op_income_entity_contributions.keys()) | set(net_fin_entity_contributions.keys())}
        net_income_entity_contributions = {entity: round(pbt_entity_contributions.get(entity, 0) - tax_contribs.get(entity, 0), 2) for entity in set(pbt_entity_contributions.keys()) | set(tax_contribs.keys())}

        profit_and_loss_statement = ConsolidatedProfitAndLossStatement(
            period=request.period,
            reporting_currency=reporting_currency,
            revenue=ProfitAndLossSection(section_title="Revenue", line_items=[FinancialStatementLineItem(description="Total Revenue", amount=round(total_revenue_val,2), currency=reporting_currency, details={"entity_contributions": rev_contribs})], section_total=round(total_revenue_val, 2)),
            cost_of_sales=ProfitAndLossSection(section_title="Cost of Sales", line_items=[FinancialStatementLineItem(description="Total Cost of Sales", amount=round(cogs_val,2), currency=reporting_currency, details={"entity_contributions": cogs_contribs})], section_total=round(cogs_val, 2)),
            gross_profit=FinancialStatementLineItem(description="Gross Profit", amount=round(gross_profit_calc, 2), currency=reporting_currency, details={"entity_contributions": gp_entity_contributions}),
            operating_expenses=ProfitAndLossSection(section_title="Operating Expenses", line_items=[FinancialStatementLineItem(description="Total Operating Expenses", amount=round(opex_val,2), currency=reporting_currency, details={"entity_contributions": opex_contribs})], section_total=round(opex_val, 2)),
            other_operating_income=ProfitAndLossSection(section_title="Other Operating Income", line_items=[FinancialStatementLineItem(description="Total Other Operating Income", amount=round(other_income_val,2), currency=reporting_currency, details={"entity_contributions": other_income_contribs})], section_total=round(other_income_val,2)),
            operating_income=FinancialStatementLineItem(description="Operating Income", amount=round(operating_income_calc, 2), currency=reporting_currency, details={"entity_contributions": op_income_entity_contributions}),
            finance_income=ProfitAndLossSection(section_title="Finance Income", line_items=[FinancialStatementLineItem(description="Total Finance Income",amount=round(finance_income_val,2), currency=reporting_currency, details={"entity_contributions": fin_income_contribs})], section_total=round(finance_income_val,2)),
            finance_costs=ProfitAndLossSection(section_title="Finance Costs", line_items=[FinancialStatementLineItem(description="Total Finance Costs",amount=round(finance_costs_val,2), currency=reporting_currency, details={"entity_contributions": fin_costs_contribs})], section_total=round(finance_costs_val,2)),
            net_finance_cost_or_income=FinancialStatementLineItem(description="Net Finance Cost/Income", amount=round(net_finance_calc, 2), currency=reporting_currency, details={"entity_contributions": net_fin_entity_contributions}),
            profit_before_tax=FinancialStatementLineItem(description="Profit Before Tax", amount=round(income_before_tax_calc, 2), currency=reporting_currency, details={"entity_contributions": pbt_entity_contributions}),
            income_tax_expense=ProfitAndLossSection(section_title="Income Tax Expense", line_items=[FinancialStatementLineItem(description="Total Income Tax Expense",amount=round(income_tax_val,2),currency=reporting_currency,details={"entity_contributions": tax_contribs})], section_total=round(income_tax_val,2)),
            profit_for_the_period=FinancialStatementLineItem(description="Profit for the Period", amount=round(net_income_calc, 2), currency=reporting_currency, details={"entity_contributions": net_income_entity_contributions})
        )
    else:
        # Create a placeholder P&L if no CoA mapping is provided
        print("No CoA Mapping provided. Generating a placeholder P&L statement.")
        profit_and_loss_statement = ConsolidatedProfitAndLossStatement(
            period=request.period,
            reporting_currency=reporting_currency,
            revenue=ProfitAndLossSection(section_title="Revenue (Generic)", line_items=[FinancialStatementLineItem(description="Total Revenue", amount=0.0, currency=reporting_currency)], section_total=0.0),
            gross_profit=FinancialStatementLineItem(description="Gross Profit (Generic)", amount=0.0, currency=reporting_currency),
            operating_expenses=ProfitAndLossSection(section_title="Operating Expenses (Generic)", line_items=[FinancialStatementLineItem(description="Total Operating Expenses", amount=0.0, currency=reporting_currency)], section_total=0.0),
            operating_income=FinancialStatementLineItem(description="Operating Income (Generic)", amount=0.0, currency=reporting_currency),
            net_finance_cost_or_income=FinancialStatementLineItem(description="Net Finance Cost/Income (Generic)", amount=0.0, currency=reporting_currency),
            profit_before_tax=FinancialStatementLineItem(description="Profit Before Tax (Generic)", amount=0.0, currency=reporting_currency),
            profit_for_the_period=FinancialStatementLineItem(description="Profit for the Period (Generic)", amount=0.0, currency=reporting_currency)
        )

    # This was 'entity_contributions_map', changed to avoid conflict if used differently for BS/CF
    final_entity_contributions_map = consolidated_data.account_level_entity_contributions or {}

    # profit_for_the_period is already available from pnl_statement
    current_profit_for_period = profit_and_loss_statement.profit_for_the_period.amount

    # Generate Balance Sheet (using the already generated profit_and_loss_statement for profit)
    balance_sheet_statement = _generate_balance_sheet_statement(
        account_level_entity_contributions=entity_contributions_map,
        consolidated_tb=trial_balance, # Use the initially fetched trial_balance
        reporting_currency=reporting_currency,
        as_at_date=request.period, 
        profit_for_current_period=current_profit_for_period,
        coa_mapping=loaded_coa_map
    )

    # Generate Cash Flow Statement
    cash_flow_statement = _generate_cash_flow_statement(
        account_level_entity_contributions=entity_contributions_map,
        consolidated_tb=trial_balance, # Use the initially fetched trial_balance
        reporting_currency=reporting_currency,
        period=request.period,
        profit_for_period=current_profit_for_period,
        current_balance_sheet=balance_sheet_statement, 
        coa_mapping=loaded_coa_map
    )

    return {
        "message": "P&L, BS, and CF transformation complete.",
        "profit_and_loss_statement": profit_and_loss_statement,
        "balance_sheet_statement": balance_sheet_statement,
        "cash_flow_statement": cash_flow_statement
    }

# --- API Endpoints ---



def _run_internal_test() -> ConsolidatedFinancials:
    """Helper function to run a predefined internal test scenario."""
    print("Running internal consolidation test with multi-currency setup...")
    
    # Define Currencies
    parent_curr = "USD"
    sub_full_curr = "CAD"
    sub_part_curr = "EUR"
    
    test_structure = EntityStructure(
        entities=[
            {"id": "parent_co", "name": "Parent Co", "local_currency": parent_curr},
            {"id": "sub_full", "name": "Sub Full", "local_currency": sub_full_curr},
            {"id": "sub_part", "name": "Sub Part", "local_currency": sub_part_curr}
        ],
        ownership={
            "parent_co": [
                {"owned_entity_id": "sub_full", "percentage": 100.0},
                {"owned_entity_id": "sub_part", "percentage": 80.0}
            ]
        }
    )

    # Assuming balances are in local currency
    test_data = {
        "parent_co": [ # USD
            {"account_code": "1000", "account_name": "Cash", "balance": 10000.0},
            {"account_code": "1450", "account_name": "IC Trade Rec", "balance": 500.0, "is_intercompany": True},
            {"account_code": "1460", "account_name": "IC Loan Rec", "balance": 1000.0, "is_intercompany": True},
            {"account_code": "3000", "account_name": "Equity", "balance": -11500.0} # Balance Parent BS
        ],
        "sub_full": [ # CAD
            {"account_code": "1000", "account_name": "Cash", "balance": 2000.0},
            {"account_code": "2450", "account_name": "IC Trade Pay", "balance": -650.0, "is_intercompany": True}, # -500 USD @ 1.3
            {"account_code": "2460", "account_name": "IC Loan Pay", "balance": -1300.0, "is_intercompany": True}, # -1000 USD @ 1.3
            {"account_code": "3000", "account_name": "Equity", "balance": -130.0}, # Balances Sub Full BS (excl P&L)
            {"account_code": "4000", "account_name": "Revenue", "balance": -500.0}, # Add P&L
            {"account_code": "5000", "account_name": "Expenses", "balance": 300.0}  # Add P&L 
        ],
        "sub_part": [ # EUR
            {"account_code": "1000", "account_name": "Cash", "balance": 3000.0},
            {"account_code": "3000", "account_name": "Equity", "balance": -3000.0} # Balance Sub Part BS
        ]
    }
    
    # Create dummy FX rates for the test period
    org_id = "org_test"
    period = "2024-Q4"
    fx_key = sanitize_storage_key(f"fx_rates_{org_id}_{period}.parquet")
    print(f"Creating dummy FX rates in storage: {fx_key}")
    fx_data = {
        'from_currency': [sub_full_curr, sub_full_curr, sub_part_curr, sub_part_curr],
        'to_currency': [parent_curr, parent_curr, parent_curr, parent_curr],
        'rate_type': ['Average', 'Closing', 'Average', 'Closing'],
        'rate': [1.35, 1.40, 0.90, 0.95] # Example rates CAD->USD and EUR->USD
    }
    fx_df = pd.DataFrame(fx_data)
    try:
        db.storage.dataframes.put(fx_key, fx_df)
        print("Dummy FX rates saved successfully.")
    except Exception as e:
         print(f"Error saving dummy FX rates: {e}. Test may fail on translation.")


    test_request = ConsolidationRequest(
        consolidation_group_id="parent_co",
        organization_id=org_id,
        period=period,
        data_type="trial_balance",
        entity_structure_override=test_structure,
        entity_financial_data_override=test_data
    )

    return perform_consolidation(test_request)



@router.get("/test-internal", response_model=ConsolidatedFinancials)
def run_consolidation_internal_test():
    """
    INTERNAL USE ONLY: Runs a hardcoded consolidation test scenario.
    Used to bypass test_endpoint limitations with complex JSON.
    """
    try:
        result = _run_internal_test()
        return result
    except Exception as e:
        print(f"Error during internal test: {e}")
        raise HTTPException(status_code=500, detail=f"Internal test failed: {str(e)}") from e


@router.post("/calculate", response_model=ConsolidatedFinancials)
async def calculate_consolidation(request: ConsolidationRequest):
    """
    Calculates consolidated financials for a given group of entities and period.
    
    Requires financial data (trial balance) for each entity involved.
    """
    try:
        consolidated_result = perform_consolidation(request)
        return consolidated_result
    except HTTPException as http_exc:
        # Re-raise HTTP exceptions directly
        raise http_exc
    except Exception as e:
        print(f"Error during consolidation calculation: {e}")
        # Use 'from e' to preserve original exception context
        raise HTTPException(status_code=500, detail=f"Internal server error during consolidation: {str(e)}") from e

"""
# Example Usage (for testing locally or via endpoint call):
# POST /consolidation/calculate
# Body:
# {
#   "consolidation_group_id": "parent_co_group",
#   "period": "2024-Q1",
#   "entity_data": [
#     {
#       "entity_id": "parent",
#       "trial_balance": { "1000": 10000.0, "2000": -5000.0, "3000": 1000.0 } 
#     },
#     {
#       "entity_id": "sub1",
#       "trial_balance": { "1000": 5000.0, "2000": -2000.0, "3000": 500.0 }
#     },
#     {
#       "entity_id": "sub2",
#       "trial_balance": { "1000": 8000.0, "2000": -4000.0, "3000": 800.0 }
#     }
#   ]
# }
"""
