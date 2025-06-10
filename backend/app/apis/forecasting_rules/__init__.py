from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field, validator
from typing import List, Literal, Optional, Dict, Any
import databutton as db
from app.auth import AuthorizedUser
from google.cloud import firestore
import google.auth.credentials
import json
from datetime import datetime, timezone
import uuid # For generating IDs
# import re # Re-enable if using regex validation

# --- Firestore Client (similar setup as roles API) ---
try:
    # Attempt to get credentials from secrets
    service_account_info_json = db.secrets.get("FIREBASE_SERVICE_ACCOUNT_JSON")
    if not service_account_info_json:
        raise ValueError("FIREBASE_SERVICE_ACCOUNT_JSON secret not found.")
    service_account_info = json.loads(service_account_info_json)
    credentials = google.oauth2.service_account.Credentials.from_service_account_info(service_account_info)
    firestore_client = firestore.AsyncClient(credentials=credentials)
    print("Firestore async client initialized successfully for forecasting_rules.")
except Exception as e:
    print(f"Failed to initialize Firestore async client using service account: {e}. Falling back to default credentials.")
    try:
        # Fallback to default credentials
        firestore_client = firestore.AsyncClient()
        print("Firestore async client initialized successfully using default credentials.")
    except Exception as e_default:
        print(f"Failed to initialize Firestore async client using default credentials: {e_default}")
        firestore_client = None # Indicate failure

# Helper to check Firestore async client
def get_firestore_db() -> firestore.AsyncClient:
    if firestore_client is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Firestore async client is not initialized. Check service account configuration.",
        )
    return firestore_client

# --- Constants ---
DRIVERS_COLLECTION = "forecastingDrivers"
RULES_COLLECTION = "forecastingRules"
RULE_TYPES = Literal["formula", "lookup", "manual"] # Added 'manual' for direct input
# FORMULA_PATTERN = r"^[a-zA-Z0-9_.\s*+/-()]+$" # Basic validation pattern (re-enable if needed)

# --- Pydantic Models ---

# Driver Models
class DriverBase(BaseModel):
    organizationId: str = Field(..., description="ID of the organization this driver belongs to.")
    name: str = Field(..., min_length=1, max_length=100, description="Unique name of the driver within the organization.")
    unit: str = Field(..., max_length=50, description="Unit of measurement (e.g., 'Headcount', 'Units Sold', 'Visits', 'USD', '%').")
    description: Optional[str] = Field(None, max_length=500, description="Optional description of the driver.")

class DriverCreate(DriverBase):
    pass

class DriverUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    unit: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = Field(None, max_length=500)

class Driver(DriverBase):
    id: str = Field(..., description="Unique ID of the driver.")
    createdAt: str = Field(..., description="ISO timestamp of creation.")
    updatedAt: str = Field(..., description="ISO timestamp of last update.")

# Forecasting Rule Models
class RuleBase(BaseModel):
    organizationId: str = Field(..., description="ID of the organization this rule belongs to.")
    name: str = Field(..., min_length=1, max_length=100, description="Name of the forecasting rule.")
    description: Optional[str] = Field(None, max_length=500, description="Optional description of the rule.")
    targetAccountId: str = Field(..., description="ID of the financial account this rule forecasts for (e.g., from Chart of Accounts).")
    ruleType: RULE_TYPES = Field(..., description="Type of the rule: formula, lookup, or manual.")
    formulaDefinition: Optional[str] = Field(None, description="Formula string referencing driver IDs (e.g., 'driver_sales_units * driver_avg_price'). Required if ruleType is 'formula'.")
    lookupDefinition: Optional[Dict[str, Any]] = Field(None, description="Definition for lookup table (e.g., based on driver value ranges). Required if ruleType is 'lookup'. Structure TBD.")

    @validator('formulaDefinition', always=True)
    def check_formula(cls, v, values):
        if values.get('ruleType') == 'formula' and not v:
            raise ValueError('formulaDefinition is required when ruleType is formula')
        # Basic check - can be enhanced
        # if v and not re.match(FORMULA_PATTERN, v):
        #     raise ValueError('formulaDefinition contains invalid characters')
        return v

    @validator('lookupDefinition', always=True)
    def check_lookup(cls, v, values):
        if values.get('ruleType') == 'lookup' and not v:
            raise ValueError('lookupDefinition is required when ruleType is lookup')
        return v

class RuleCreate(RuleBase):
    pass

class RuleUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    targetAccountId: Optional[str] = Field(None)
    ruleType: Optional[RULE_TYPES] = Field(None)
    formulaDefinition: Optional[str] = Field(None)
    lookupDefinition: Optional[Dict[str, Any]] = Field(None)

class ForecastingRule(RuleBase):
    id: str = Field(..., description="Unique ID of the forecasting rule.")
    createdAt: str = Field(..., description="ISO timestamp of creation.")
    updatedAt: str = Field(..., description="ISO timestamp of last update.")


# --- API Router ---
router = APIRouter(prefix="/forecasting", tags=["Forecasting Rules & Drivers"])

# --- Helper Functions (Placeholder for Auth Checks) ---
async def _verify_org_access(org_id: str, user: AuthorizedUser, db_client: firestore.AsyncClient):
    # Placeholder: Implement actual check if user belongs to/has rights for the org
    print(f"Auth Check: User {user.sub} accessing Org {org_id} - Currently allowing all.")
    # Example check (needs refinement based on actual role structure):
    # roles_ref = db_client.collection('roleAssignments')
    # query = roles_ref.where('userId', '==', user.sub).where('scopeType', '==', 'Organization').where('scopeId', '==', org_id).limit(1)
    # docs_stream = query.stream() # Use stream() for async iteration
    # async for doc in docs_stream:
    #     if doc.exists:
    #         return # User has a role in the org
    # raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User does not have access to this organization.")
    pass # Currently allowing all

# --- Driver Endpoints (Implementation Pending) ---

@router.post("/drivers", response_model=Driver, status_code=status.HTTP_201_CREATED)
async def create_driver(
    driver_data: DriverCreate,
    current_user: AuthorizedUser, # Parameter order corrected
    db_client: firestore.AsyncClient = Depends(get_firestore_db)
):
    """Creates a new forecasting driver."""
    await _verify_org_access(driver_data.organizationId, current_user, db_client)

    # Check for duplicate driver name within the organization before creating
    try:
        drivers_ref = db_client.collection(DRIVERS_COLLECTION)
        query = drivers_ref.where("organizationId", "==", driver_data.organizationId).where("name", "==", driver_data.name).limit(1)
        docs_stream = query.stream()
        async for doc in docs_stream:
             if doc.exists:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"A driver with the name '{driver_data.name}' already exists in this organization."
                )
    except Exception as e:
        print(f"Error checking for duplicate driver name: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error checking for existing driver.") from e

    # Generate a unique ID and timestamps
    driver_id = str(uuid.uuid4())
    now_utc = datetime.now(timezone.utc)
    now_iso = now_utc.isoformat()

    # Prepare the data for Firestore using model_dump()
    driver_doc_data = driver_data.model_dump()
    driver_doc_data["id"] = driver_id
    driver_doc_data["createdAt"] = now_iso
    driver_doc_data["updatedAt"] = now_iso

    try:
        # Create the document in Firestore
        doc_ref = db_client.collection(DRIVERS_COLLECTION).document(driver_id)
        await doc_ref.set(driver_doc_data)
        print(f"Driver {driver_id} created successfully for org {driver_data.organizationId}.")

        # Return the created driver object, ensuring it matches the Driver model
        return Driver(**driver_doc_data)

    except Exception as e:
        print(f"Error creating driver {driver_id} for org {driver_data.organizationId}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create forecasting driver."
        ) from e


@router.get("/drivers", response_model=List[Driver])
async def list_drivers(
    organization_id: str, # Require organization_id for listing
    current_user: AuthorizedUser, # Parameter order corrected
    db_client: firestore.AsyncClient = Depends(get_firestore_db)
):
    """Lists all forecasting drivers for a given organization."""
    await _verify_org_access(organization_id, current_user, db_client)

    drivers_list = []
    try:
        drivers_ref = db_client.collection(DRIVERS_COLLECTION)
        query = drivers_ref.where("organizationId", "==", organization_id)
        docs_stream = query.stream()

        async for doc in docs_stream:
            driver_data = doc.to_dict()
            if driver_data: # Ensure data exists
                try:
                    # Validate data against the Pydantic model
                    drivers_list.append(Driver(**driver_data))
                except Exception as validation_error:
                    # Log validation error but continue processing others
                    print(f"Warning: Skipping driver {doc.id} due to validation error: {validation_error}")
            else:
                 print(f"Warning: Skipping driver {doc.id} because it has no data.")

        # Optionally sort the list, e.g., by name or creation date
        drivers_list.sort(key=lambda d: d.name.lower()) # Sort by name case-insensitively

        return drivers_list

    except Exception as e:
        print(f"Error listing drivers for organization {organization_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list forecasting drivers."
        ) from e


@router.get("/drivers/{driver_id}", response_model=Driver)
async def get_driver(
    driver_id: str,
    current_user: AuthorizedUser, # Parameter order corrected
    db_client: firestore.AsyncClient = Depends(get_firestore_db)
):
    """Gets a specific forecasting driver by its ID."""
    try:
        doc_ref = db_client.collection(DRIVERS_COLLECTION).document(driver_id)
        doc_snapshot = await doc_ref.get()

        if not doc_snapshot.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Forecasting driver with ID '{driver_id}' not found."
            )

        driver_data = doc_snapshot.to_dict()

        # Verify organization access using the fetched data
        await _verify_org_access(driver_data["organizationId"], current_user, db_client)

        # Validate and return the data
        return Driver(**driver_data)

    except HTTPException as http_exc: # Re-raise HTTP exceptions
        raise http_exc
    except Exception as e:
        print(f"Error fetching driver {driver_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch forecasting driver."
        ) from e


@router.put("/drivers/{driver_id}", response_model=Driver)
async def update_driver(
    driver_id: str,
    update_data: DriverUpdate,
    current_user: AuthorizedUser, # Parameter order corrected
    db_client: firestore.AsyncClient = Depends(get_firestore_db)
):
    """Updates an existing forecasting driver."""
    try:
        doc_ref = db_client.collection(DRIVERS_COLLECTION).document(driver_id)
        doc_snapshot = await doc_ref.get()

        if not doc_snapshot.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Forecasting driver with ID '{driver_id}' not found."
            )

        existing_data = doc_snapshot.to_dict()

        # Verify organization access
        await _verify_org_access(existing_data["organizationId"], current_user, db_client)

        # Check for name conflict if name is being updated to a new value
        if update_data.name and update_data.name != existing_data.get("name"):
            try:
                drivers_ref = db_client.collection(DRIVERS_COLLECTION)
                query = drivers_ref.where("organizationId", "==", existing_data["organizationId"])\
                                   .where("name", "==", update_data.name)\
                                   .limit(1)
                docs_stream = query.stream()
                async for doc in docs_stream:
                     if doc.exists and doc.id != driver_id: # Check if the conflicting doc is not the current one
                        raise HTTPException(
                            status_code=status.HTTP_409_CONFLICT,
                            detail=f"Another driver with the name '{update_data.name}' already exists in this organization."
                        )
            except HTTPException as http_exc:
                 raise http_exc
            except Exception as e:
                print(f"Error checking for duplicate driver name during update: {e}")
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error checking for existing driver name.") from e

        # Prepare the update dictionary, excluding unset fields
        update_payload = update_data.model_dump(exclude_unset=True)

        # Only update if there are changes
        if not update_payload:
             # Return existing data if no changes provided (or raise error? TBD)
            print(f"No update data provided for driver {driver_id}. Returning existing data.")
            return Driver(**existing_data)

        # Add updatedAt timestamp
        update_payload["updatedAt"] = datetime.now(timezone.utc).isoformat()

        # Perform the update in Firestore
        await doc_ref.update(update_payload)
        print(f"Driver {driver_id} updated successfully.")

        # Fetch the updated document to return
        updated_doc_snapshot = await doc_ref.get()
        updated_data = updated_doc_snapshot.to_dict()

        return Driver(**updated_data)

    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print(f"Error updating driver {driver_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update forecasting driver."
        ) from e


@router.delete("/drivers/{driver_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_driver(
    driver_id: str,
    current_user: AuthorizedUser, # Parameter order corrected
    db_client: firestore.AsyncClient = Depends(get_firestore_db)
):
    """Deletes a forecasting driver."""
    try:
        doc_ref = db_client.collection(DRIVERS_COLLECTION).document(driver_id)
        doc_snapshot = await doc_ref.get()

        if not doc_snapshot.exists:
            # Return 204 even if not found, as the state matches the desired outcome
            print(f"Attempted to delete non-existent driver {driver_id}. Returning 204.")
            return

        existing_data = doc_snapshot.to_dict()

        # Verify organization access
        await _verify_org_access(existing_data["organizationId"], current_user, db_client)

        # --- IMPORTANT: Check if driver is used in any forecasting rules --- #
        # TODO: Implement a check against the RULES_COLLECTION
        # Query RULES_COLLECTION where organizationId matches and formulaDefinition or lookupDefinition contains the driver_id
        # If any rules are found, raise HTTP 409 Conflict
        # rules_ref = db_client.collection(RULES_COLLECTION)
        # query = rules_ref.where("organizationId", "==", existing_data["organizationId"])
        # This part is tricky as Firestore doesn't easily support 'contains' on strings or complex objects.
        # Might need to structure rules differently or perform client-side filtering/secondary query.
        # For now, we'll proceed with deletion, but this check is crucial.
        print(f"WARNING: Usage check for driver {driver_id} in forecasting rules is not yet implemented.")

        # Delete the document
        await doc_ref.delete()
        print(f"Driver {driver_id} deleted successfully.")

        # No content to return on successful delete
        return

    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print(f"Error deleting driver {driver_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete forecasting driver."
        ) from e


# --- Forecasting Rule Endpoints (Implementation Pending) ---

@router.post("/rules", response_model=ForecastingRule, status_code=status.HTTP_201_CREATED)
async def create_forecasting_rule(
    rule_data: RuleCreate,
    current_user: AuthorizedUser, # Parameter order corrected
    db_client: firestore.AsyncClient = Depends(get_firestore_db)
):
    """Creates a new forecasting rule."""
    await _verify_org_access(rule_data.organizationId, current_user, db_client)

    # TODO: Validate referenced driver IDs exist if ruleType is formula/lookup
    # This requires parsing formulaDefinition or checking lookupDefinition keys
    # and querying DRIVERS_COLLECTION. Deferring complex validation for now.
    if rule_data.ruleType == "formula" and rule_data.formulaDefinition:
        print(f"INFO: Formula definition provided: {rule_data.formulaDefinition}. Driver ID validation TODO.")
    elif rule_data.ruleType == "lookup" and rule_data.lookupDefinition:
        print(f"INFO: Lookup definition provided. Driver ID validation TODO.")

    # TODO: Check targetAccountId validity against Chart of Accounts?

    # Check for duplicate rule name within the organization
    try:
        rules_ref = db_client.collection(RULES_COLLECTION)
        query = rules_ref.where("organizationId", "==", rule_data.organizationId).where("name", "==", rule_data.name).limit(1)
        docs_stream = query.stream()
        async for doc in docs_stream:
             if doc.exists:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"A forecasting rule with the name '{rule_data.name}' already exists in this organization."
                )
    except Exception as e:
        print(f"Error checking for duplicate rule name: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error checking for existing rule name.") from e

    # Generate ID and timestamps
    rule_id = str(uuid.uuid4())
    now_iso = datetime.now(timezone.utc).isoformat()

    # Prepare data for Firestore
    rule_doc_data = rule_data.model_dump()
    rule_doc_data["id"] = rule_id
    rule_doc_data["createdAt"] = now_iso
    rule_doc_data["updatedAt"] = now_iso

    try:
        # Create document
        doc_ref = db_client.collection(RULES_COLLECTION).document(rule_id)
        await doc_ref.set(rule_doc_data)
        print(f"Forecasting rule {rule_id} created successfully for org {rule_data.organizationId}.")

        # Return created object
        return ForecastingRule(**rule_doc_data)

    except Exception as e:
        print(f"Error creating forecasting rule {rule_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create forecasting rule."
        ) from e


@router.get("/rules", response_model=List[ForecastingRule])
async def list_forecasting_rules(
    organization_id: str, # Require organization_id
    current_user: AuthorizedUser, # Parameter order corrected
    target_account_id: Optional[str] = None, # Optional filter
    db_client: firestore.AsyncClient = Depends(get_firestore_db)
):
    """Lists forecasting rules for an organization, optionally filtered by target account."""
    await _verify_org_access(organization_id, current_user, db_client)

    rules_list = []
    try:
        rules_ref = db_client.collection(RULES_COLLECTION)
        # Start query with mandatory organization filter
        query = rules_ref.where("organizationId", "==", organization_id)

        # Add optional target account filter
        if target_account_id:
            query = query.where("targetAccountId", "==", target_account_id)

        docs_stream = query.stream()

        async for doc in docs_stream:
            rule_data = doc.to_dict()
            if rule_data:
                try:
                    rules_list.append(ForecastingRule(**rule_data))
                except Exception as validation_error:
                    print(f"Warning: Skipping rule {doc.id} due to validation error: {validation_error}")
            else:
                print(f"Warning: Skipping rule {doc.id} because it has no data.")

        # Optionally sort the list
        rules_list.sort(key=lambda r: r.name.lower()) # Sort by name

        return rules_list

    except Exception as e:
        print(f"Error listing forecasting rules for organization {organization_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list forecasting rules."
        ) from e


@router.get("/rules/{rule_id}", response_model=ForecastingRule)
async def get_forecasting_rule(
    rule_id: str,
    current_user: AuthorizedUser, # Parameter order corrected
    db_client: firestore.AsyncClient = Depends(get_firestore_db)
):
    """Gets a specific forecasting rule by ID."""
    try:
        doc_ref = db_client.collection(RULES_COLLECTION).document(rule_id)
        doc_snapshot = await doc_ref.get()

        if not doc_snapshot.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Forecasting rule with ID '{rule_id}' not found."
            )

        rule_data = doc_snapshot.to_dict()

        # Verify organization access
        await _verify_org_access(rule_data["organizationId"], current_user, db_client)

        # Validate and return
        return ForecastingRule(**rule_data)

    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print(f"Error fetching forecasting rule {rule_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch forecasting rule."
        ) from e


@router.put("/rules/{rule_id}", response_model=ForecastingRule)
async def update_forecasting_rule(
    rule_id: str,
    update_data: RuleUpdate,
    current_user: AuthorizedUser, # Parameter order corrected
    db_client: firestore.AsyncClient = Depends(get_firestore_db)
):
    """Updates an existing forecasting rule."""
    try:
        doc_ref = db_client.collection(RULES_COLLECTION).document(rule_id)
        doc_snapshot = await doc_ref.get()

        if not doc_snapshot.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Forecasting rule with ID '{rule_id}' not found."
            )

        existing_data = doc_snapshot.to_dict()

        # Verify organization access
        await _verify_org_access(existing_data["organizationId"], current_user, db_client)

        # Check for name conflict if name is being updated to a new value
        if update_data.name and update_data.name != existing_data.get("name"):
            try:
                rules_ref = db_client.collection(RULES_COLLECTION)
                query = rules_ref.where("organizationId", "==", existing_data["organizationId"])\
                                   .where("name", "==", update_data.name)\
                                   .limit(1)
                docs_stream = query.stream()
                async for doc in docs_stream:
                     if doc.exists and doc.id != rule_id:
                        raise HTTPException(
                            status_code=status.HTTP_409_CONFLICT,
                            detail=f"Another forecasting rule with the name '{update_data.name}' already exists in this organization."
                        )
            except HTTPException as http_exc:
                 raise http_exc
            except Exception as e:
                print(f"Error checking for duplicate rule name during update: {e}")
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error checking for existing rule name.")

        # Prepare the update dictionary, excluding unset fields
        update_payload = update_data.model_dump(exclude_unset=True)

        # TODO: Add validation if ruleType changes (e.g., clear irrelevant definitions, validate new ones)
        # TODO: Validate referenced driver IDs if formulaDefinition/lookupDefinition changes
        # TODO: Validate targetAccountId if it changes

        if not update_payload:
            print(f"No update data provided for rule {rule_id}. Returning existing data.")
            return ForecastingRule(**existing_data)

        # Add updatedAt timestamp
        update_payload["updatedAt"] = datetime.now(timezone.utc).isoformat()

        # Perform the update
        await doc_ref.update(update_payload)
        print(f"Forecasting rule {rule_id} updated successfully.")

        # Fetch updated document to return
        updated_doc_snapshot = await doc_ref.get()
        updated_data = updated_doc_snapshot.to_dict()

        return ForecastingRule(**updated_data)

    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print(f"Error updating forecasting rule {rule_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update forecasting rule."
        ) from e


@router.delete("/rules/{rule_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_forecasting_rule(
    rule_id: str,
    current_user: AuthorizedUser, # Parameter order corrected
    db_client: firestore.AsyncClient = Depends(get_firestore_db)
):
    """Deletes a forecasting rule."""
    try:
        doc_ref = db_client.collection(RULES_COLLECTION).document(rule_id)
        doc_snapshot = await doc_ref.get()

        if not doc_snapshot.exists:
            print(f"Attempted to delete non-existent rule {rule_id}. Returning 204.")
            return

        existing_data = doc_snapshot.to_dict()

        # Verify organization access
        await _verify_org_access(existing_data["organizationId"], current_user, db_client)

        # Delete the document
        await doc_ref.delete()
        print(f"Forecasting rule {rule_id} deleted successfully.")

        # No content to return
        return

    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print(f"Error deleting forecasting rule {rule_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete forecasting rule."
        ) from e
