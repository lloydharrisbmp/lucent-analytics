from typing import List, Optional, Dict, Any, Union
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
import databutton as db
import re
import uuid
from datetime import datetime
import requests
from bs4 import BeautifulSoup
from app.apis.government_grants import GrantProgram, EligibilityCriteria, FundingDetails, ApplicationPeriod, sanitize_storage_key

router = APIRouter()

# Define data models for admin functionality
class GrantUpdateRequest(BaseModel):
    grant: GrantProgram

class GrantCreateRequest(BaseModel):
    grant: GrantProgram

class ScrapeRequest(BaseModel):
    sources: List[str] = Field(default_factory=list)
    full_scan: bool = False

class ScrapeStatus(BaseModel):
    status: str
    message: str
    new_grants: int = 0
    updated_grants: int = 0
    timestamp: str

class ScrapeSource(BaseModel):
    id: str
    name: str
    url: str
    description: str
    enabled: bool = True
    last_scraped: Optional[str] = None

# Helper function to get all grants
def get_all_grants() -> List[GrantProgram]:
    try:
        stored_data = db.storage.json.get(sanitize_storage_key('australian_government_grants'))
        return [GrantProgram(**program) for program in stored_data]
    except Exception as e:
        print(f"Error getting grants: {e}")
        # Initialize from the government_grants API if needed
        from app.apis.government_grants import initialize_grant_database
        return initialize_grant_database()

# Helper function to save all grants
def save_all_grants(grants: List[GrantProgram]):
    try:
        db.storage.json.put(
            sanitize_storage_key('australian_government_grants'),
            [program.dict() for program in grants]
        )
        return True
    except Exception as e:
        print(f"Error saving grants: {e}")
        return False

# Helper function to save grant update history
def save_grant_update_history(grant_id: str, update_type: str, user: str, details: Dict[str, Any]):
    try:
        history_key = sanitize_storage_key(f'grant_history_{grant_id}')
        
        # Get existing history or create new
        try:
            history = db.storage.json.get(history_key, default=[])
        except:
            history = []
            
        # Add new entry
        history.append({
            "timestamp": datetime.now().isoformat(),
            "update_type": update_type,  # "create", "update", "delete"
            "user": user,
            "details": details
        })
        
        # Save history
        db.storage.json.put(history_key, history)
        return True
    except Exception as e:
        print(f"Error saving grant history: {e}")
        return False

# Helper function to get scraping sources
def get_scrape_sources() -> List[ScrapeSource]:
    try:
        sources = db.storage.json.get(sanitize_storage_key('grant_scrape_sources'))
        return [ScrapeSource(**source) for source in sources]
    except:
        # Initialize default sources
        default_sources = [
            ScrapeSource(
                id="business-gov-au",
                name="Business.gov.au Grants & Programs",
                url="https://business.gov.au/grants-and-programs",
                description="Official Australian Government grants and programs for businesses"
            ),
            ScrapeSource(
                id="grants-gov-au",
                name="Grants.gov.au",
                url="https://www.grants.gov.au/",
                description="Australian Government grant opportunities"
            ),
            ScrapeSource(
                id="nsw-grants",
                name="NSW Government Grants",
                url="https://www.nsw.gov.au/grants-and-funding",
                description="New South Wales government grants"
            ),
            ScrapeSource(
                id="vic-grants",
                name="Victoria Government Grants",
                url="https://www.vic.gov.au/grants",
                description="Victoria state government grants"
            ),
            ScrapeSource(
                id="qld-grants",
                name="Queensland Government Grants",
                url="https://www.qld.gov.au/community/community-organisations-volunteering/funding-grants-resources",
                description="Queensland grants and funding programs"
            )
        ]
        
        db.storage.json.put(
            sanitize_storage_key('grant_scrape_sources'),
            [source.dict() for source in default_sources]
        )
        
        return default_sources

# Helper function to save scraping status
def save_scrape_status(status: ScrapeStatus):
    try:
        # Get existing statuses or create new
        try:
            statuses = db.storage.json.get(sanitize_storage_key('grant_scrape_statuses'), default=[])
        except:
            statuses = []
            
        # Add new status
        statuses.append(status.dict())
        
        # Keep only the latest 50 statuses
        if len(statuses) > 50:
            statuses = statuses[-50:]
            
        # Save statuses
        db.storage.json.put(sanitize_storage_key('grant_scrape_statuses'), statuses)
        return True
    except Exception as e:
        print(f"Error saving scrape status: {e}")
        return False

# Background task for scraping websites
async def scrape_government_websites(sources: List[str], full_scan: bool):
    status = ScrapeStatus(
        status="in_progress",
        message="Started scraping government websites",
        timestamp=datetime.now().isoformat()
    )
    save_scrape_status(status)
    
    try:
        # Get all existing grants
        existing_grants = get_all_grants()
        existing_grant_ids = {grant.id for grant in existing_grants}
        
        new_grants = []
        updated_grants = []
        
        all_sources = get_scrape_sources()
        sources_to_scrape = [source for source in all_sources if source.id in sources]
        
        for source in sources_to_scrape:
            # Update status
            status = ScrapeStatus(
                status="in_progress",
                message=f"Scraping {source.name}",
                timestamp=datetime.now().isoformat()
            )
            save_scrape_status(status)
            
            # Perform the scraping based on the source
            if source.id == "business-gov-au":
                new, updated = scrape_business_gov_au(existing_grants, existing_grant_ids, full_scan)
                new_grants.extend(new)
                updated_grants.extend(updated)
            elif source.id == "grants-gov-au":
                new, updated = scrape_grants_gov_au(existing_grants, existing_grant_ids, full_scan)
                new_grants.extend(new)
                updated_grants.extend(updated)
            # Additional sources would be handled similarly
            
            # Update the last_scraped timestamp for this source
            source.last_scraped = datetime.now().isoformat()
        
        # Save updated sources
        db.storage.json.put(
            sanitize_storage_key('grant_scrape_sources'),
            [source.dict() for source in all_sources]
        )
        
        # Add new grants to the database
        if new_grants:
            existing_grants.extend(new_grants)
        
        # Update existing grants
        if updated_grants:
            # Create a map of ids to updated grants
            updated_map = {grant.id: grant for grant in updated_grants}
            
            # Replace existing grants with updated versions
            for i, grant in enumerate(existing_grants):
                if grant.id in updated_map:
                    existing_grants[i] = updated_map[grant.id]
        
        # Save all grants if there were changes
        if new_grants or updated_grants:
            save_all_grants(existing_grants)
        
        # Final status update
        status = ScrapeStatus(
            status="completed",
            message="Scraping completed successfully",
            new_grants=len(new_grants),
            updated_grants=len(updated_grants),
            timestamp=datetime.now().isoformat()
        )
        save_scrape_status(status)
        
    except Exception as e:
        # Error status update
        status = ScrapeStatus(
            status="error",
            message=f"Error during scraping: {str(e)}",
            timestamp=datetime.now().isoformat()
        )
        save_scrape_status(status)

# Scraper for business.gov.au
def scrape_business_gov_au(existing_grants, existing_grant_ids, full_scan):
    new_grants = []
    updated_grants = []
    
    try:
        # Sample implementation
        # In a real implementation, we would:
        # 1. Fetch the main grants page
        # 2. Extract all grant links
        # 3. For each link, fetch the details page
        # 4. Parse the HTML to extract structured data
        # 5. Create or update grant objects
        
        # For demonstration, we'll just create a sample new grant
        if not full_scan:
            return new_grants, updated_grants
            
        new_grant = GrantProgram(
            id=f"federal-sample-{uuid.uuid4().hex[:8]}",
            name="Sample Scraped Grant",
            description="This is a sample grant that was automatically scraped from business.gov.au",
            provider="Australian Government",
            level="Federal",
            category=["Innovation", "Startup"],
            eligibility=EligibilityCriteria(
                business_types=["Company", "Sole Trader"],
                industry_sectors=["All"]
            ),
            funding=FundingDetails(
                funding_type="Grant",
                min_amount=10000.0,
                max_amount=50000.0,
                co_contribution_required=True,
                co_contribution_percentage=50.0
            ),
            application_period=ApplicationPeriod(
                is_ongoing=True
            ),
            website_url="https://business.gov.au/sample-grant",
            keywords=["sample", "scraped", "innovation"]
        )
        
        new_grants.append(new_grant)
        
        # Simulate updating an existing grant if any exist
        if existing_grants and full_scan:
            grant_to_update = existing_grants[0]
            updated_grant = GrantProgram(**grant_to_update.dict())
            updated_grant.description = f"{updated_grant.description} (Updated via scraping)"
            updated_grants.append(updated_grant)
    
    except Exception as e:
        print(f"Error scraping business.gov.au: {e}")
    
    return new_grants, updated_grants

# Scraper for grants.gov.au
def scrape_grants_gov_au(existing_grants, existing_grant_ids, full_scan):
    # Similar implementation to business.gov.au scraper
    return [], []  # Placeholder return

# API Endpoints
@router.post("/grants")
def create_grant(request: GrantCreateRequest):
    """Create a new grant in the database"""
    try:
        # Get all existing grants
        existing_grants = get_all_grants()
        
        # Ensure the ID is unique
        new_grant = request.grant
        if not new_grant.id:
            new_grant.id = f"custom-{uuid.uuid4().hex[:8]}"
        
        # Check for duplicate ID
        if any(grant.id == new_grant.id for grant in existing_grants):
            raise HTTPException(status_code=400, detail="Grant with this ID already exists")
        
        # Add to existing grants and save
        existing_grants.append(new_grant)
        success = save_all_grants(existing_grants)
        
        if success:
            # Record the creation in history
            save_grant_update_history(
                grant_id=new_grant.id,
                update_type="create",
                user="admin",  # In a real system, this would be the authenticated user
                details={"grant_name": new_grant.name}
            )
            
            return {"status": "success", "message": "Grant created successfully", "grant_id": new_grant.id}
        else:
            raise HTTPException(status_code=500, detail="Failed to save grant to database")
    
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating grant: {str(e)}")

@router.put("/grants/{grant_id}")
def update_grant(grant_id: str, request: GrantUpdateRequest):
    """Update an existing grant in the database"""
    try:
        # Get all existing grants
        existing_grants = get_all_grants()
        
        # Find the grant to update
        grant_index = None
        for i, grant in enumerate(existing_grants):
            if grant.id == grant_id:
                grant_index = i
                break
        
        if grant_index is None:
            raise HTTPException(status_code=404, detail="Grant not found")
        
        # Ensure the ID matches
        updated_grant = request.grant
        if updated_grant.id != grant_id:
            raise HTTPException(status_code=400, detail="Grant ID in body does not match URL parameter")
        
        # Record changes for history
        old_grant = existing_grants[grant_index]
        changes = {}
        for field_name, field_value in updated_grant.dict().items():
            old_value = getattr(old_grant, field_name)
            if field_value != old_value:
                changes[field_name] = {"old": old_value, "new": field_value}
        
        # Update the grant and save
        existing_grants[grant_index] = updated_grant
        success = save_all_grants(existing_grants)
        
        if success:
            # Record the update in history
            save_grant_update_history(
                grant_id=grant_id,
                update_type="update",
                user="admin",  # In a real system, this would be the authenticated user
                details={"changes": changes}
            )
            
            return {"status": "success", "message": "Grant updated successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to save updated grant to database")
    
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating grant: {str(e)}")

@router.delete("/grants/{grant_id}")
def delete_grant(grant_id: str):
    """Delete a grant from the database"""
    try:
        # Get all existing grants
        existing_grants = get_all_grants()
        
        # Find the grant to delete
        grant_index = None
        grant_name = None
        for i, grant in enumerate(existing_grants):
            if grant.id == grant_id:
                grant_index = i
                grant_name = grant.name
                break
        
        if grant_index is None:
            raise HTTPException(status_code=404, detail="Grant not found")
        
        # Remove the grant and save
        deleted_grant = existing_grants.pop(grant_index)
        success = save_all_grants(existing_grants)
        
        if success:
            # Record the deletion in history
            save_grant_update_history(
                grant_id=grant_id,
                update_type="delete",
                user="admin",  # In a real system, this would be the authenticated user
                details={"grant_name": grant_name}
            )
            
            return {"status": "success", "message": "Grant deleted successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to save changes to database")
    
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting grant: {str(e)}")

@router.post("/grants/scrape")
def scrape_grants(background_tasks: BackgroundTasks, request: ScrapeRequest):
    """Start a background task to scrape government websites for grants"""
    try:
        # Get the sources to scrape
        sources = request.sources
        if not sources:
            # If no sources specified, use all enabled sources
            all_sources = get_scrape_sources()
            sources = [source.id for source in all_sources if source.enabled]
        
        # Start the background task
        background_tasks.add_task(scrape_government_websites, sources, request.full_scan)
        
        return {
            "status": "success", 
            "message": f"Started scraping {len(sources)} sources",
            "sources": sources
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error starting scraping task: {str(e)}")

@router.get("/grants/scrape/status")
def get_scrape_status():
    """Get the status of recent scraping operations"""
    try:
        try:
            statuses = db.storage.json.get(sanitize_storage_key('grant_scrape_statuses'), default=[])
        except:
            statuses = []
        
        return {"statuses": statuses}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving scrape status: {str(e)}")

@router.get("/grants/scrape/sources")
def list_scrape_sources():
    """List all available scraping sources"""
    try:
        sources = get_scrape_sources()
        return {"sources": [source.dict() for source in sources]}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving scrape sources: {str(e)}")

@router.put("/grants/scrape/sources/{source_id}")
def update_scrape_source(source_id: str, source: ScrapeSource):
    """Update a scraping source"""
    try:
        if source_id != source.id:
            raise HTTPException(status_code=400, detail="Source ID in body does not match URL parameter")
        
        # Get all sources
        sources = get_scrape_sources()
        
        # Find the source to update
        source_index = None
        for i, s in enumerate(sources):
            if s.id == source_id:
                source_index = i
                break
        
        if source_index is None:
            raise HTTPException(status_code=404, detail="Source not found")
        
        # Update the source
        sources[source_index] = source
        
        # Save sources
        db.storage.json.put(
            sanitize_storage_key('grant_scrape_sources'),
            [s.dict() for s in sources]
        )
        
        return {"status": "success", "message": "Source updated successfully"}
    
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating source: {str(e)}")

@router.post("/grants/scrape/sources")
def create_scrape_source(source: ScrapeSource):
    """Create a new scraping source"""
    try:
        # Get all sources
        sources = get_scrape_sources()
        
        # Check for duplicate ID
        if any(s.id == source.id for s in sources):
            raise HTTPException(status_code=400, detail="Source with this ID already exists")
        
        # Add the new source
        sources.append(source)
        
        # Save sources
        db.storage.json.put(
            sanitize_storage_key('grant_scrape_sources'),
            [s.dict() for s in sources]
        )
        
        return {"status": "success", "message": "Source created successfully", "source_id": source.id}
    
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating source: {str(e)}")

@router.delete("/grants/scrape/sources/{source_id}")
def delete_scrape_source(source_id: str):
    """Delete a scraping source"""
    try:
        # Get all sources
        sources = get_scrape_sources()
        
        # Find the source to delete
        source_index = None
        for i, s in enumerate(sources):
            if s.id == source_id:
                source_index = i
                break
        
        if source_index is None:
            raise HTTPException(status_code=404, detail="Source not found")
        
        # Remove the source
        sources.pop(source_index)
        
        # Save sources
        db.storage.json.put(
            sanitize_storage_key('grant_scrape_sources'),
            [s.dict() for s in sources]
        )
        
        return {"status": "success", "message": "Source deleted successfully"}
    
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting source: {str(e)}")
