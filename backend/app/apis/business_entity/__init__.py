from fastapi import APIRouter, HTTPException, Body, Path, Query
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
    BusinessEntityBase,
    Address,
    ContactDetails,
    GSTFrequency,
    OwnershipDetail,  # Import the new model
)

router = APIRouter()

# Request and Response Models
class BusinessEntityCreateRequest(BaseModel):
    """Request model for creating a business entity"""
    name: str
    abn: str
    business_structure: BusinessStructureType
    registered_for_gst: bool
    gst_frequency: Optional[GSTFrequency] = None
    tfn: Optional[str] = None
    acn: Optional[str] = None
    industry_code: Optional[str] = None
    description: Optional[str] = None
    established_date: Optional[date] = None
    address: Optional[Address] = None
    primary_contact: Optional[ContactDetails] = None
    parent_entity_id: Optional[str] = None  # Add relationship field
    ownership_details: Optional[List[OwnershipDetail]] = None  # Add ownership field
    local_currency: str = Field(description="Local currency code (e.g., AUD, USD)") # Added for FX

class BusinessEntityResponse(BaseModel):
    """Response model for business entity operations"""
    entity: BusinessEntityBase
    message: str

class BusinessEntityListResponse(BaseModel):
    """Response model for listing business entities"""
    entities: List[BusinessEntityBase]
    total_count: int

# Helper functions
def sanitize_storage_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    import re
    return re.sub(r'[^a-zA-Z0-9._-]', '', key)

def save_entity(entity: BusinessEntityBase) -> None:
    """Save a business entity to storage"""
    entity_key = sanitize_storage_key(f"entity_{entity.id}")
    db.storage.json.put(entity_key, entity.model_dump())

def get_entity(entity_id: str) -> Optional[BusinessEntityBase]:
    """Get a business entity from storage"""
    entity_key = sanitize_storage_key(f"entity_{entity_id}")
    try:
        entity_data = db.storage.json.get(entity_key)
        return BusinessEntityBase(**entity_data)
    except Exception as e:
        print(f"Error retrieving entity: {e}")
        return None

def list_entities() -> List[BusinessEntityBase]:
    """List all business entities from storage"""
    entities = []
    # Get all json files starting with "entity_"
    storage_files = db.storage.json.list()

    for file in storage_files:
        if file.name.startswith("entity_"):
            try:
                entity_data = db.storage.json.get(file.name)
                entities.append(BusinessEntityBase(**entity_data))
            except Exception as e:
                # Skip invalid entities
                print(f"Error parsing entity data: {e}")

    return entities

# API Endpoints
@router.post("/business-entity")
def create_entity(request: BusinessEntityCreateRequest) -> BusinessEntityResponse:
    """Create a new business entity"""
    # Generate a unique ID for the entity
    entity_id = str(uuid.uuid4())

    # Create the address if provided
    # address = request.address if request.address else Address(...)

    # Create the contact if provided
    # contact = request.primary_contact if request.primary_contact else ContactDetails(...)

    # Skip unused variables
    # _ = address
    # _ = contact
    # No tax_settings defined yet

    # Create the business entity
    entity = BusinessEntityBase(
        id=entity_id,
        name=request.name,
        abn=request.abn,
        business_structure=request.business_structure,
        registered_for_gst=request.registered_for_gst,
        gst_frequency=request.gst_frequency,
        tfn=request.tfn,
        created_at=datetime.now(),
        updated_at=datetime.now(),
        parent_entity_id=request.parent_entity_id,  # Save relationship
        ownership_details=request.ownership_details,  # Save ownership
        local_currency=request.local_currency  # Save currency
    )

    # Save the entity
    save_entity(entity)

    return BusinessEntityResponse(
        entity=entity,
        message="Business entity created successfully"
    )

@router.get("/business-entity/{entity_id}")
def get_business_entity(entity_id: str) -> BusinessEntityResponse:
    """Get a business entity by ID"""
    entity = get_entity(entity_id)
    if not entity:
        raise HTTPException(status_code=404, detail="Business entity not found")

    return BusinessEntityResponse(
        entity=entity,
        message="Business entity retrieved successfully"
    )

@router.get("/business-entities")
def list_business_entities() -> BusinessEntityListResponse:
    """List all business entities"""
    entities = list_entities()

    return BusinessEntityListResponse(
        entities=entities,
        total_count=len(entities)
    )

@router.put("/business-entity/{entity_id}")
def update_business_entity(entity_id: str, request: BusinessEntityCreateRequest) -> BusinessEntityResponse:
    """Update a business entity"""
    existing_entity = get_entity(entity_id)
    if not existing_entity:
        raise HTTPException(status_code=404, detail="Business entity not found")

    # Address, Contact, and Tax Settings are not part of BusinessEntityBase, so no update logic needed here.
    # If they were added to BusinessEntityBase later, the logic would be:
    # address = request.address if request.address else existing_entity.address
    # contact = request.primary_contact if request.primary_contact else existing_entity.primary_contact
    # tax_settings = request.tax_settings if request.tax_settings else existing_entity.tax_settings

    # Update the entity
    updated_entity = BusinessEntityBase(
        id=entity_id,
        name=request.name,
        abn=request.abn,
        business_structure=request.business_structure,
        registered_for_gst=request.registered_for_gst,
        gst_frequency=request.gst_frequency,
        tfn=request.tfn,
        created_at=existing_entity.created_at, # Keep original creation date
        updated_at=datetime.now(),
        parent_entity_id=request.parent_entity_id,  # Update relationship
        ownership_details=request.ownership_details,  # Update ownership
        local_currency=request.local_currency  # Update currency
    )

    # Save the updated entity
    save_entity(updated_entity)

    return BusinessEntityResponse(
        entity=updated_entity,
        message="Business entity updated successfully"
    )
