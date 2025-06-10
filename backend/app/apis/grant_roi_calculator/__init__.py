from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime, timedelta
import databutton as db
import re
import uuid
from app.auth import AuthorizedUser

router = APIRouter(prefix="/grant-roi-calculator")

# Models
class WorkloadEstimate(BaseModel):
    hours: float
    complexity: str = Field(..., description="low, medium, high")
    skills_required: List[str]
    recommended_team_size: int

class ApplicationRequirement(BaseModel):
    requirement_id: str
    name: str
    description: str
    estimated_workload: WorkloadEstimate
    dependencies: List[str] = []

class ROICalculationRequest(BaseModel):
    grant_id: str
    business_id: Optional[str] = None
    expected_funding_amount: float
    application_cost_estimate: Optional[float] = None
    success_probability: Optional[float] = None
    include_requirements_breakdown: bool = False

class ROICalculationResponse(BaseModel):
    grant_id: str
    grant_name: str
    expected_funding_amount: float
    estimated_application_cost: float
    application_time_estimate: float  # In hours
    success_probability: float  # 0.0 to 1.0
    estimated_roi: float
    estimated_net_benefit: float
    payback_period_days: int
    requirements: Optional[List[ApplicationRequirement]] = None
    confidence_level: str  # low, medium, high

class GrantComparisonRequest(BaseModel):
    grant_ids: List[str]
    business_id: Optional[str] = None

class GrantComparisonResponse(BaseModel):
    grants: List[ROICalculationResponse]
    recommended_priority: List[str]  # Grant IDs in recommended priority order
    optimization_factors: Dict[str, float]  # Factors used in optimization

class OptimizationRequest(BaseModel):
    grant_ids: List[str]
    business_id: Optional[str] = None
    available_time_hours: Optional[float] = None
    available_budget: Optional[float] = None
    optimization_preference: str = "balanced"  # roi, time, success, balanced

class OptimizationResponse(BaseModel):
    recommended_grants: List[str]  # Grant IDs in recommended priority order
    total_expected_funding: float
    total_estimated_cost: float
    total_estimated_time: float  # In hours
    expected_net_benefit: float
    expected_roi: float
    excluded_grants: List[str]  # Grant IDs that were excluded from the recommendation

# Helper functions
def sanitize_storage_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    return re.sub(r'[^a-zA-Z0-9._-]', '', key)

def get_grant_by_id(grant_id: str):
    """Get grant details by ID"""
    try:
        # First, try to get the grant from the grants index
        grants_index = db.storage.json.get("grants_index", default=[])
        if grant_id in grants_index:
            grant_key = f"grant_{sanitize_storage_key(grant_id)}"
            return db.storage.json.get(grant_key)
        
        # If not found in the index, scan all grants
        for g_id in grants_index:
            grant_key = f"grant_{sanitize_storage_key(g_id)}"
            grant = db.storage.json.get(grant_key)
            if grant and grant.get("id") == grant_id:
                return grant
        
        return None
    except Exception as e:
        print(f"Error getting grant: {e}")
        return None

def estimate_application_requirements(grant_id: str, business_id: Optional[str] = None) -> List[ApplicationRequirement]:
    """Estimate the detailed requirements for a grant application"""
    grant = get_grant_by_id(grant_id)
    if not grant:
        return []
    
    # Get the base requirements structure from storage or create default set
    try:
        requirements_key = f"grant_requirements_{sanitize_storage_key(grant_id)}"
        stored_requirements = db.storage.json.get(requirements_key, default=None)
        
        if stored_requirements:
            return [ApplicationRequirement(**req) for req in stored_requirements]
    except Exception as e:
        print(f"Error retrieving stored requirements: {e}")
    
    # Generate default requirements based on grant type and complexity
    requirements = []
    req_id_counter = 1
    
    # Basic information requirement - almost all grants have this
    requirements.append(ApplicationRequirement(
        requirement_id=f"req_{req_id_counter}",
        name="Business Information",
        description="Basic business details, ABN, contact information, and business structure",
        estimated_workload=WorkloadEstimate(
            hours=2.0,
            complexity="low",
            skills_required=["administrative"],
            recommended_team_size=1
        ),
        dependencies=[]
    ))
    req_id_counter += 1
    
    # Determine complexity based on grant amount and category
    is_complex = any(cat in ["Research & Development", "Innovation", "Commercialization"] for cat in grant.get("category", []))
    funding_amount = grant.get("funding", {}).get("amount_range", "0-10000")
    max_amount = int(funding_amount.split("-")[1].replace(",", "")) if "-" in funding_amount else 10000
    
    # Project description - complexity varies by grant type
    requirements.append(ApplicationRequirement(
        requirement_id=f"req_{req_id_counter}",
        name="Project Description",
        description="Detailed description of the project or activity for which funding is sought",
        estimated_workload=WorkloadEstimate(
            hours=4.0 if is_complex else 2.0,
            complexity="medium" if is_complex else "low",
            skills_required=["writing", "project planning"],
            recommended_team_size=1
        ),
        dependencies=[f"req_1"]
    ))
    req_id_counter += 1
    
    # Budget and financial information
    requirements.append(ApplicationRequirement(
        requirement_id=f"req_{req_id_counter}",
        name="Budget and Financials",
        description="Detailed project budget, financial projections, and costing information",
        estimated_workload=WorkloadEstimate(
            hours=6.0 if max_amount > 100000 else 3.0,
            complexity="high" if max_amount > 100000 else "medium",
            skills_required=["financial", "budgeting", "accounting"],
            recommended_team_size=2 if max_amount > 100000 else 1
        ),
        dependencies=[f"req_2"]
    ))
    req_id_counter += 1
    
    # Supporting documentation
    requirements.append(ApplicationRequirement(
        requirement_id=f"req_{req_id_counter}",
        name="Supporting Documentation",
        description="Collection and preparation of supporting documents, evidence, and attachments",
        estimated_workload=WorkloadEstimate(
            hours=3.0,
            complexity="medium",
            skills_required=["administrative", "document management"],
            recommended_team_size=1
        ),
        dependencies=[f"req_1"]
    ))
    req_id_counter += 1
    
    # Add research requirement for R&D grants
    if any(cat in ["Research & Development"] for cat in grant.get("category", [])):
        requirements.append(ApplicationRequirement(
            requirement_id=f"req_{req_id_counter}",
            name="Research Documentation",
            description="Detailed research methodology, literature review, and technical documentation",
            estimated_workload=WorkloadEstimate(
                hours=12.0,
                complexity="high",
                skills_required=["research", "technical writing", "subject matter expertise"],
                recommended_team_size=2
            ),
            dependencies=[f"req_2"]
        ))
        req_id_counter += 1
    
    # Add business case for larger grants
    if max_amount > 50000:
        requirements.append(ApplicationRequirement(
            requirement_id=f"req_{req_id_counter}",
            name="Business Case",
            description="Comprehensive business case including market analysis and competitive advantage",
            estimated_workload=WorkloadEstimate(
                hours=8.0 if max_amount > 200000 else 4.0,
                complexity="high" if max_amount > 200000 else "medium",
                skills_required=["business strategy", "market analysis", "financial modeling"],
                recommended_team_size=2 if max_amount > 200000 else 1
            ),
            dependencies=[f"req_1", f"req_3"]
        ))
        req_id_counter += 1
    
    # Add compliance requirement for all federal grants and some state grants
    if grant.get("level") == "Federal" or max_amount > 100000:
        requirements.append(ApplicationRequirement(
            requirement_id=f"req_{req_id_counter}",
            name="Compliance Documentation",
            description="Regulatory compliance documentation, certifications, and eligibility evidence",
            estimated_workload=WorkloadEstimate(
                hours=6.0,
                complexity="high",
                skills_required=["legal", "compliance", "administrative"],
                recommended_team_size=1
            ),
            dependencies=[f"req_1", f"req_4"]
        ))
        req_id_counter += 1
    
    # Application review and submission
    requirements.append(ApplicationRequirement(
        requirement_id=f"req_{req_id_counter}",
        name="Review and Submission",
        description="Final review, quality control, and submission of the complete application",
        estimated_workload=WorkloadEstimate(
            hours=4.0 if is_complex or max_amount > 100000 else 2.0,
            complexity="medium",
            skills_required=["quality control", "project management"],
            recommended_team_size=2 if is_complex or max_amount > 100000 else 1
        ),
        dependencies=[req.requirement_id for req in requirements]
    ))
    
    return requirements

def calculate_application_cost(requirements: List[ApplicationRequirement]) -> float:
    """Calculate the estimated cost to prepare the application based on requirements"""
    if not requirements:
        return 1000.0  # Default cost if no requirements available
    
    # Hourly rates by complexity
    hourly_rates = {
        "low": 75.0,
        "medium": 125.0,
        "high": 200.0
    }
    
    total_cost = 0.0
    for req in requirements:
        workload = req.estimated_workload
        rate = hourly_rates.get(workload.complexity, 100.0)
        # Adjust for team size - larger teams are slightly more efficient
        team_efficiency = 0.9 if workload.recommended_team_size > 1 else 1.0
        req_cost = workload.hours * rate * workload.recommended_team_size * team_efficiency
        total_cost += req_cost
    
    # Add overhead for management and coordination (15%)
    total_cost *= 1.15
    
    return round(total_cost, 2)

def calculate_total_hours(requirements: List[ApplicationRequirement]) -> float:
    """Calculate the total hours required based on requirements"""
    if not requirements:
        return 20.0  # Default hours if no requirements available
    
    total_hours = 0.0
    for req in requirements:
        # Adjust for team size - larger teams can work in parallel
        parallelism_factor = 1.0 / req.estimated_workload.recommended_team_size
        team_hours = req.estimated_workload.hours * parallelism_factor
        total_hours += team_hours
    
    return round(total_hours, 1)

def estimate_success_probability(grant: dict, business_id: Optional[str] = None) -> float:
    """Estimate the probability of success for the grant application"""
    # Base probability
    base_probability = 0.35  # Average grant success rate
    
    # Adjust based on grant competition level
    funding_type = grant.get("funding", {}).get("funding_type", "")
    if "competitive" in funding_type.lower():
        base_probability *= 0.8  # More competitive means lower probability
    
    # Adjust based on grant amount - larger grants are harder to get
    funding_amount = grant.get("funding", {}).get("amount_range", "0-10000")
    max_amount = int(funding_amount.split("-")[1].replace(",", "")) if "-" in funding_amount else 10000
    
    if max_amount > 500000:
        base_probability *= 0.7
    elif max_amount > 200000:
        base_probability *= 0.8
    elif max_amount > 50000:
        base_probability *= 0.9
    elif max_amount <= 10000:
        base_probability *= 1.2  # Easier to get smaller grants
    
    # Adjust based on grant complexity
    is_complex = any(cat in ["Research & Development", "Innovation", "Commercialization"] for cat in grant.get("category", []))
    if is_complex:
        base_probability *= 0.9  # Complex grants are harder to get
    
    # TODO: If business_id is provided, adjust probability based on business fit with grant
    
    # Ensure probability is between 0.05 and 0.9
    probability = max(0.05, min(0.9, base_probability))
    
    return round(probability, 2)

def calculate_roi(funding_amount: float, application_cost: float, success_probability: float) -> float:
    """Calculate the Return on Investment for a grant application"""
    expected_value = funding_amount * success_probability
    roi = (expected_value - application_cost) / application_cost if application_cost > 0 else 0
    return round(roi, 2)

@router.post("/calculate")
async def calculate_roi_for_grant(request: ROICalculationRequest, user: AuthorizedUser) -> ROICalculationResponse:
    """Calculate the ROI for a specific grant application"""
    grant = get_grant_by_id(request.grant_id)
    if not grant:
        raise HTTPException(status_code=404, detail=f"Grant with ID {request.grant_id} not found")
    
    # Get detailed requirements
    requirements = estimate_application_requirements(request.grant_id, request.business_id)
    
    # Calculate application cost
    application_cost = request.application_cost_estimate or calculate_application_cost(requirements)
    
    # Calculate total hours
    total_hours = calculate_total_hours(requirements)
    
    # Estimate success probability
    success_probability = request.success_probability or estimate_success_probability(grant, request.business_id)
    
    # Calculate ROI
    roi = calculate_roi(request.expected_funding_amount, application_cost, success_probability)
    
    # Calculate net benefit
    net_benefit = (request.expected_funding_amount * success_probability) - application_cost
    
    # Calculate payback period in days (assuming 8-hour workdays)
    payback_days = int((total_hours / 8) * (1 / success_probability)) if success_probability > 0 else 999
    
    # Determine confidence level
    confidence_level = "high" if success_probability > 0.6 else "medium" if success_probability > 0.3 else "low"
    
    return ROICalculationResponse(
        grant_id=request.grant_id,
        grant_name=grant.get("name", "Unknown Grant"),
        expected_funding_amount=request.expected_funding_amount,
        estimated_application_cost=application_cost,
        application_time_estimate=total_hours,
        success_probability=success_probability,
        estimated_roi=roi,
        estimated_net_benefit=net_benefit,
        payback_period_days=payback_days,
        requirements=requirements if request.include_requirements_breakdown else None,
        confidence_level=confidence_level
    )

@router.post("/compare")
async def compare_grants(request: GrantComparisonRequest, user: AuthorizedUser) -> GrantComparisonResponse:
    """Compare ROI and other metrics for multiple grants"""
    grants_results = []
    optimization_factors = {
        "roi_weight": 0.4,
        "time_weight": 0.2,
        "probability_weight": 0.3,
        "funding_weight": 0.1
    }
    
    for grant_id in request.grant_ids:
        grant = get_grant_by_id(grant_id)
        if not grant:
            continue
        
        # Get expected funding amount from grant data
        funding_amount = grant.get("funding", {}).get("amount_range", "0-10000")
        max_amount = int(funding_amount.split("-")[1].replace(",", "")) if "-" in funding_amount else 10000
        expected_funding = max_amount * 0.8  # Conservative estimate at 80% of maximum
        
        # Estimate application requirements
        requirements = estimate_application_requirements(grant_id, request.business_id)
        
        # Calculate application cost
        application_cost = calculate_application_cost(requirements)
        
        # Calculate total hours
        total_hours = calculate_total_hours(requirements)
        
        # Estimate success probability
        success_probability = estimate_success_probability(grant, request.business_id)
        
        # Calculate ROI
        roi = calculate_roi(expected_funding, application_cost, success_probability)
        
        # Calculate net benefit
        net_benefit = (expected_funding * success_probability) - application_cost
        
        # Calculate payback period in days (assuming 8-hour workdays)
        payback_days = int((total_hours / 8) * (1 / success_probability)) if success_probability > 0 else 999
        
        # Determine confidence level
        confidence_level = "high" if success_probability > 0.6 else "medium" if success_probability > 0.3 else "low"
        
        grants_results.append(ROICalculationResponse(
            grant_id=grant_id,
            grant_name=grant.get("name", "Unknown Grant"),
            expected_funding_amount=expected_funding,
            estimated_application_cost=application_cost,
            application_time_estimate=total_hours,
            success_probability=success_probability,
            estimated_roi=roi,
            estimated_net_benefit=net_benefit,
            payback_period_days=payback_days,
            requirements=None,  # Don't include detailed requirements in comparison
            confidence_level=confidence_level
        ))
    
    # Calculate a priority score for each grant based on optimization factors
    grants_with_scores = []
    for grant_result in grants_results:
        # Normalize metrics
        max_roi = max([g.estimated_roi for g in grants_results]) if grants_results else 1.0
        min_time = min([g.application_time_estimate for g in grants_results]) if grants_results else 1.0
        max_funding = max([g.expected_funding_amount for g in grants_results]) if grants_results else 1.0
        
        # Normalize ROI (higher is better)
        roi_score = grant_result.estimated_roi / max_roi if max_roi > 0 else 0
        
        # Normalize time (lower is better)
        time_score = min_time / grant_result.application_time_estimate if grant_result.application_time_estimate > 0 else 0
        
        # Probability score (higher is better)
        probability_score = grant_result.success_probability
        
        # Funding score (higher is better)
        funding_score = grant_result.expected_funding_amount / max_funding if max_funding > 0 else 0
        
        # Calculate weighted score
        weighted_score = (
            roi_score * optimization_factors["roi_weight"] +
            time_score * optimization_factors["time_weight"] +
            probability_score * optimization_factors["probability_weight"] +
            funding_score * optimization_factors["funding_weight"]
        )
        
        grants_with_scores.append((grant_result, weighted_score))
    
    # Sort by score (highest first)
    grants_with_scores.sort(key=lambda x: x[1], reverse=True)
    
    # Get sorted grants and priority list
    sorted_grants = [g[0] for g in grants_with_scores]
    priority_list = [g.grant_id for g in sorted_grants]
    
    return GrantComparisonResponse(
        grants=sorted_grants,
        recommended_priority=priority_list,
        optimization_factors=optimization_factors
    )

@router.post("/optimize")
async def optimize_grant_strategy(request: OptimizationRequest, user: AuthorizedUser) -> OptimizationResponse:
    """Optimize grant application strategy based on constraints and preferences"""
    # First, get comparison data for all grants
    comparison_request = GrantComparisonRequest(
        grant_ids=request.grant_ids,
        business_id=request.business_id
    )
    comparison_result = await compare_grants(comparison_request, user)
    
    # Adjust weights based on optimization preference
    optimization_weights = {
        "roi": {"roi_weight": 0.7, "time_weight": 0.1, "probability_weight": 0.1, "funding_weight": 0.1},
        "time": {"roi_weight": 0.1, "time_weight": 0.7, "probability_weight": 0.1, "funding_weight": 0.1},
        "success": {"roi_weight": 0.1, "time_weight": 0.1, "probability_weight": 0.7, "funding_weight": 0.1},
        "balanced": {"roi_weight": 0.4, "time_weight": 0.2, "probability_weight": 0.3, "funding_weight": 0.1}
    }
    
    weights = optimization_weights.get(request.optimization_preference, optimization_weights["balanced"])
    
    # Re-score grants with the adjusted weights
    grants_with_scores = []
    for grant_result in comparison_result.grants:
        # Normalize metrics
        max_roi = max([g.estimated_roi for g in comparison_result.grants]) if comparison_result.grants else 1.0
        min_time = min([g.application_time_estimate for g in comparison_result.grants]) if comparison_result.grants else 1.0
        max_funding = max([g.expected_funding_amount for g in comparison_result.grants]) if comparison_result.grants else 1.0
        
        # Normalize ROI (higher is better)
        roi_score = grant_result.estimated_roi / max_roi if max_roi > 0 else 0
        
        # Normalize time (lower is better)
        time_score = min_time / grant_result.application_time_estimate if grant_result.application_time_estimate > 0 else 0
        
        # Probability score (higher is better)
        probability_score = grant_result.success_probability
        
        # Funding score (higher is better)
        funding_score = grant_result.expected_funding_amount / max_funding if max_funding > 0 else 0
        
        # Calculate weighted score
        weighted_score = (
            roi_score * weights["roi_weight"] +
            time_score * weights["time_weight"] +
            probability_score * weights["probability_weight"] +
            funding_score * weights["funding_weight"]
        )
        
        grants_with_scores.append((grant_result, weighted_score))
    
    # Sort grants by score (highest first)
    grants_with_scores.sort(key=lambda x: x[1], reverse=True)
    
    # Apply constraints (time and budget)
    recommended_grants = []
    excluded_grants = []
    
    total_time = 0.0
    total_cost = 0.0
    max_time = request.available_time_hours or float('inf')
    max_budget = request.available_budget or float('inf')
    
    for grant_result, _ in grants_with_scores:
        # Check if adding this grant would exceed constraints
        if (total_time + grant_result.application_time_estimate <= max_time and
            total_cost + grant_result.estimated_application_cost <= max_budget):
            # Grant fits within constraints
            recommended_grants.append(grant_result.grant_id)
            total_time += grant_result.application_time_estimate
            total_cost += grant_result.estimated_application_cost
        else:
            # Grant exceeds constraints
            excluded_grants.append(grant_result.grant_id)
    
    # Calculate expected results for the recommended grants
    total_expected_funding = 0.0
    total_net_benefit = 0.0
    
    for grant_id in recommended_grants:
        # Find the grant result
        grant_result = next((g for g in comparison_result.grants if g.grant_id == grant_id), None)
        if grant_result:
            # Add the expected funding (adjusted by success probability)
            total_expected_funding += grant_result.expected_funding_amount * grant_result.success_probability
            total_net_benefit += grant_result.estimated_net_benefit
    
    # Calculate ROI for the entire portfolio
    expected_roi = total_net_benefit / total_cost if total_cost > 0 else 0
    
    return OptimizationResponse(
        recommended_grants=recommended_grants,
        total_expected_funding=round(total_expected_funding, 2),
        total_estimated_cost=round(total_cost, 2),
        total_estimated_time=round(total_time, 1),
        expected_net_benefit=round(total_net_benefit, 2),
        expected_roi=round(expected_roi, 2),
        excluded_grants=excluded_grants
    )

@router.get("/requirements/{grant_id}")
async def get_application_requirements(grant_id: str, user: AuthorizedUser):
    """Get detailed workload and requirements breakdown for a grant application"""
    grant = get_grant_by_id(grant_id)
    if not grant:
        raise HTTPException(status_code=404, detail=f"Grant with ID {grant_id} not found")
    
    requirements = estimate_application_requirements(grant_id)
    total_hours = calculate_total_hours(requirements)
    estimated_cost = calculate_application_cost(requirements)
    
    return {
        "grant_id": grant_id,
        "grant_name": grant.get("name"),
        "total_estimated_hours": total_hours,
        "estimated_cost": estimated_cost,
        "requirements": requirements
    }
