from typing import List, Optional, Dict, Any, Union, Tuple
from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel, Field
import databutton as db
import re
from datetime import datetime
from app.apis.government_grants import GrantProgram, EligibilityCriteria, FundingDetails

router = APIRouter()

# Define data models for the matcher
class BusinessProfile(BaseModel):
    """Business profile model containing characteristics relevant for grant matching"""
    id: str
    name: str
    abn: str
    business_structure: str  # company, trust, partnership, soleTrader
    industry_sector: Optional[str] = None
    annual_turnover: Optional[float] = None
    employee_count: Optional[int] = None
    years_in_business: Optional[float] = None
    location: Optional[Dict[str, str]] = None  # state, region, etc.
    has_exported: Optional[bool] = None
    export_markets: Optional[List[str]] = None
    r_and_d_activities: Optional[bool] = None
    innovation_focus: Optional[bool] = None
    sustainability_initiatives: Optional[bool] = None
    digital_adoption_level: Optional[str] = None

class MatchScore(BaseModel):
    """Score details for a grant match"""
    eligibility_score: float = Field(..., description="Score based on eligibility criteria (0-100)")
    value_score: float = Field(..., description="Score based on potential value to the business (0-100)")
    effort_score: float = Field(..., description="Score based on effort required to apply (0-100, higher is easier)")
    total_score: float = Field(..., description="Overall match score (0-100)")
    matching_factors: List[str] = Field(..., description="List of factors that contributed to the match")
    gap_factors: List[str] = Field(..., description="List of factors that could improve the match")

class GrantMatch(BaseModel):
    """Grant match with score and details"""
    grant: GrantProgram
    match_score: MatchScore

class GrantMatchRequest(BaseModel):
    """Request model for grant matching"""
    business_id: Optional[str] = None
    business_profile: Optional[BusinessProfile] = None
    min_score: Optional[float] = 0  # Minimum score threshold for returned matches
    limit: Optional[int] = 10  # Maximum number of matches to return
    include_details: bool = True  # Whether to include detailed scoring

class GrantMatchResponse(BaseModel):
    """Response model for grant matching"""
    matches: List[GrantMatch]
    business_profile: BusinessProfile
    timestamp: str

# Helper function to sanitize storage key
def sanitize_storage_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    return re.sub(r'[^a-zA-Z0-9._-]', '', key)

# Helper functions for matching algorithm
def calculate_eligibility_score(business: BusinessProfile, grant: GrantProgram) -> Tuple[float, List[str], List[str]]:
    """Calculate how well a business matches a grant's eligibility criteria"""
    score = 0.0
    max_possible_score = 0.0
    matching_factors = []
    gap_factors = []
    
    # Check business structure/type
    if business.business_structure and grant.eligibility.business_types:
        max_possible_score += 20
        business_type_map = {
            "company": ["Company"],
            "trust": ["Trust"],
            "partnership": ["Partnership"],
            "soleTrader": ["Sole Trader"]
        }
        
        mapped_structure = business_type_map.get(business.business_structure.lower(), [])
        if any(bt.lower() in [m.lower() for m in mapped_structure] for bt in grant.eligibility.business_types):
            score += 20
            matching_factors.append(f"Business structure ({business.business_structure}) is eligible")
        else:
            gap_factors.append(f"Business structure ({business.business_structure}) may not be eligible - grant requires {', '.join(grant.eligibility.business_types)}")
    
    # Check turnover range
    if business.annual_turnover is not None and grant.eligibility.turnover_range:
        max_possible_score += 15
        turnover_match = False
        
        # Parse turnover range like "Under $20 million" or "$2-10 million"
        if "under" in grant.eligibility.turnover_range.lower():
            # Extract the number from text like "Under $20 million"
            threshold = float(re.search(r'\d+', grant.eligibility.turnover_range).group()) * 1_000_000
            if business.annual_turnover <= threshold:
                turnover_match = True
        elif "-" in grant.eligibility.turnover_range:
            # Extract range from text like "$2-10 million"
            range_match = re.search(r'(\d+)\s*-\s*(\d+)', grant.eligibility.turnover_range)
            if range_match:
                lower_bound = float(range_match.group(1)) * 1_000_000
                upper_bound = float(range_match.group(2)) * 1_000_000
                if lower_bound <= business.annual_turnover <= upper_bound:
                    turnover_match = True
        
        if turnover_match:
            score += 15
            matching_factors.append(f"Annual turnover (${business.annual_turnover:,.2f}) meets the requirement")
        else:
            gap_factors.append(f"Annual turnover (${business.annual_turnover:,.2f}) outside the required range ({grant.eligibility.turnover_range})")
    
    # Check employee count
    if business.employee_count is not None and grant.eligibility.employee_count_range:
        max_possible_score += 15
        employee_match = False
        
        # Parse employee range like "Less than 200 employees" or "5-50 employees"
        if "less than" in grant.eligibility.employee_count_range.lower():
            threshold = int(re.search(r'\d+', grant.eligibility.employee_count_range).group())
            if business.employee_count < threshold:
                employee_match = True
        elif "-" in grant.eligibility.employee_count_range:
            range_match = re.search(r'(\d+)\s*-\s*(\d+)', grant.eligibility.employee_count_range)
            if range_match:
                lower_bound = int(range_match.group(1))
                upper_bound = int(range_match.group(2))
                if lower_bound <= business.employee_count <= upper_bound:
                    employee_match = True
        
        if employee_match:
            score += 15
            matching_factors.append(f"Employee count ({business.employee_count}) meets the requirement")
        else:
            gap_factors.append(f"Employee count ({business.employee_count}) outside the required range ({grant.eligibility.employee_count_range})")
    
    # Check industry sectors
    if business.industry_sector and grant.eligibility.industry_sectors:
        max_possible_score += 15
        if "All" in grant.eligibility.industry_sectors or any(sector.lower() == business.industry_sector.lower() for sector in grant.eligibility.industry_sectors):
            score += 15
            matching_factors.append(f"Industry sector ({business.industry_sector}) is eligible")
        else:
            gap_factors.append(f"Industry sector ({business.industry_sector}) may not be eligible - grant targets {', '.join(grant.eligibility.industry_sectors)}")
    
    # Check location requirements
    if business.location and grant.eligibility.location_requirements:
        max_possible_score += 15
        business_state = business.location.get("state")
        business_region = business.location.get("region")
        
        location_match = False
        if business_state and any(loc.lower() == business_state.lower() for loc in grant.eligibility.location_requirements):
            location_match = True
        elif business_region and any(loc.lower() == business_region.lower() for loc in grant.eligibility.location_requirements):
            location_match = True
        elif "Australia" in grant.eligibility.location_requirements:
            location_match = True
            
        if location_match:
            score += 15
            matching_factors.append("Business location meets requirements")
        else:
            gap_factors.append(f"Business location may not be eligible - grant requires {', '.join(grant.eligibility.location_requirements)}")
    
    # Check years in business
    if business.years_in_business is not None and grant.eligibility.years_in_business:
        max_possible_score += 10
        years_match = False
        
        # Parse requirement like "At least 2 years" or "1-5 years"
        if "at least" in grant.eligibility.years_in_business.lower():
            threshold = float(re.search(r'\d+', grant.eligibility.years_in_business).group())
            if business.years_in_business >= threshold:
                years_match = True
        elif "-" in grant.eligibility.years_in_business:
            range_match = re.search(r'(\d+)\s*-\s*(\d+)', grant.eligibility.years_in_business)
            if range_match:
                lower_bound = float(range_match.group(1))
                upper_bound = float(range_match.group(2))
                if lower_bound <= business.years_in_business <= upper_bound:
                    years_match = True
        
        if years_match:
            score += 10
            matching_factors.append(f"Years in business ({business.years_in_business}) meets requirements")
        else:
            gap_factors.append(f"Years in business ({business.years_in_business}) doesn't meet requirements ({grant.eligibility.years_in_business})")
    
    # Check additional requirements
    if grant.eligibility.additional_requirements:
        relevant_requirements = 0
        matched_requirements = 0
        
        for req in grant.eligibility.additional_requirements:
            req_lower = req.lower()
            
            # Export-related requirements
            if any(keyword in req_lower for keyword in ["export", "international", "overseas", "global market"]):
                relevant_requirements += 1
                if business.has_exported:
                    matched_requirements += 1
                    matching_factors.append("Business has export experience (required for this grant)")
                else:
                    gap_factors.append("Grant requires export experience but business has none")
            
            # R&D-related requirements
            elif any(keyword in req_lower for keyword in ["r&d", "research and development", "research & development"]):
                relevant_requirements += 1
                if business.r_and_d_activities:
                    matched_requirements += 1
                    matching_factors.append("Business conducts R&D activities (required for this grant)")
                else:
                    gap_factors.append("Grant requires R&D activities but business has none")
            
            # Innovation-related requirements
            elif any(keyword in req_lower for keyword in ["innovat", "novel", "new product"]):
                relevant_requirements += 1
                if business.innovation_focus:
                    matched_requirements += 1
                    matching_factors.append("Business has innovation focus (required for this grant)")
                else:
                    gap_factors.append("Grant requires innovation focus but business has none")
            
            # Sustainability-related requirements
            elif any(keyword in req_lower for keyword in ["sustainab", "environment", "green", "carbon"]):
                relevant_requirements += 1
                if business.sustainability_initiatives:
                    matched_requirements += 1
                    matching_factors.append("Business has sustainability initiatives (required for this grant)")
                else:
                    gap_factors.append("Grant requires sustainability focus but business has none")
        
        if relevant_requirements > 0:
            max_possible_score += 10
            additional_req_score = (matched_requirements / relevant_requirements) * 10
            score += additional_req_score
    
    # Calculate final percentage score
    final_score = (score / max_possible_score * 100) if max_possible_score > 0 else 0
    return final_score, matching_factors, gap_factors

def calculate_value_score(business: BusinessProfile, grant: GrantProgram) -> float:
    """Calculate the potential value of a grant to the business"""
    # Base score starting point
    score = 50.0
    
    # Value based on funding amount
    if grant.funding.max_amount:
        # Adjust score based on grant size relative to business turnover
        if business.annual_turnover and business.annual_turnover > 0:
            # Higher score if grant is significant relative to turnover (up to 20% of turnover)
            relative_value = min(grant.funding.max_amount / business.annual_turnover, 0.2)
            score += relative_value * 100 * 1.5  # Can add up to 30 points
        else:
            # If no turnover data, score based on absolute amount
            if grant.funding.max_amount > 1_000_000:
                score += 30
            elif grant.funding.max_amount > 500_000:
                score += 25
            elif grant.funding.max_amount > 100_000:
                score += 20
            elif grant.funding.max_amount > 50_000:
                score += 15
            elif grant.funding.max_amount > 10_000:
                score += 10
    
    # Adjust score down if co-contribution is required
    if grant.funding.co_contribution_required:
        if grant.funding.co_contribution_percentage:
            # Higher co-contribution = lower score
            score -= min(grant.funding.co_contribution_percentage / 2, 15)  # Up to -15 points
        else:
            score -= 10  # Default penalty if percentage not specified
    
    # Adjust score based on grant type
    if grant.funding.funding_type == "Grant":
        score += 10  # Direct grants are most valuable
    elif grant.funding.funding_type == "Tax Incentive":
        score += 5  # Tax incentives are valuable but require profit
    elif grant.funding.funding_type == "Rebate":
        score += 7  # Rebates are good but require upfront spending
    
    # Cap score between 0-100
    return max(0, min(100, score))

def calculate_effort_score(grant: GrantProgram) -> float:
    """Calculate how easy/difficult it is to apply for the grant"""
    # Start with a base score
    score = 70.0
    
    # Adjust based on funding type - tax incentives often require more documentation
    if grant.funding.funding_type == "Tax Incentive":
        score -= 10
    elif grant.funding.funding_type == "Rebate":
        score -= 5
    
    # Adjust based on funding amount - larger grants typically have more complex applications
    if grant.funding.max_amount:
        if grant.funding.max_amount > 1_000_000:
            score -= 20
        elif grant.funding.max_amount > 500_000:
            score -= 15
        elif grant.funding.max_amount > 100_000:
            score -= 10
        elif grant.funding.max_amount > 50_000:
            score -= 5
    
    # Adjust based on provider - some providers have more streamlined processes
    if "ATO" in grant.provider or "Taxation Office" in grant.provider:
        score -= 5  # ATO processes can be more complex
    
    # Adjust based on level - local grants are often easier than federal ones
    if grant.level == "Local":
        score += 10
    elif grant.level == "State":
        score += 5
    
    # Cap score between 0-100
    return max(0, min(100, score))

def calculate_total_score(eligibility_score: float, value_score: float, effort_score: float) -> float:
    """Calculate the overall match score with weighted components"""
    # Weights for each component
    eligibility_weight = 0.5  # 50% - must be eligible
    value_weight = 0.35      # 35% - value is important
    effort_weight = 0.15     # 15% - effort is a factor but less important
    
    total_score = (
        eligibility_weight * eligibility_score +
        value_weight * value_score +
        effort_weight * effort_score
    )
    
    return total_score

# API Endpoints
@router.post("/match-grants")
def match_grants(request: GrantMatchRequest):
    """Match a business profile with suitable grants and return scored matches"""
    # If business_id is provided but profile isn't, load the profile
    if request.business_id and not request.business_profile:
        try:
            # Try to load the business profile from storage
            # This is a placeholder - implement actual business profile retrieval
            pass
        except Exception as e:
            raise HTTPException(status_code=404, detail=f"Business profile not found: {str(e)}")
    
    if not request.business_profile:
        raise HTTPException(status_code=400, detail="Either business_id or business_profile must be provided")
    
    business_profile = request.business_profile
    
    try:
        # Get all grant programs
        stored_data = db.storage.json.get(sanitize_storage_key('australian_government_grants'))
        grants = [GrantProgram(**program) for program in stored_data]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading grants data: {str(e)}")
    
    # Process each grant and calculate match scores
    matches = []
    for grant in grants:
        # Calculate eligibility score
        eligibility_score, matching_factors, gap_factors = calculate_eligibility_score(business_profile, grant)
        
        # Only continue if eligibility score meets minimum threshold
        if eligibility_score > 40:  # Require at least 40% eligibility match
            # Calculate value score
            value_score = calculate_value_score(business_profile, grant)
            
            # Calculate effort score
            effort_score = calculate_effort_score(grant)
            
            # Calculate total score
            total_score = calculate_total_score(eligibility_score, value_score, effort_score)
            
            # If total score is above the threshold, add to matches
            if total_score >= request.min_score:
                match_score = MatchScore(
                    eligibility_score=eligibility_score,
                    value_score=value_score,
                    effort_score=effort_score,
                    total_score=total_score,
                    matching_factors=matching_factors,
                    gap_factors=gap_factors
                )
                
                matches.append(GrantMatch(
                    grant=grant,
                    match_score=match_score
                ))
    
    # Sort matches by total score (descending)
    matches.sort(key=lambda x: x.match_score.total_score, reverse=True)
    
    # Limit the number of matches if requested
    if request.limit:
        matches = matches[:request.limit]
    
    return GrantMatchResponse(
        matches=matches,
        business_profile=business_profile,
        timestamp=datetime.now().isoformat()
    )
