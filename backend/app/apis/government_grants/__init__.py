from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Query
from pydantic import BaseModel
import databutton as db
import re

router = APIRouter()

# Define data models
class EligibilityCriteria(BaseModel):
    business_types: List[str]
    turnover_range: Optional[str] = None
    employee_count_range: Optional[str] = None
    industry_sectors: Optional[List[str]] = None
    location_requirements: Optional[List[str]] = None
    years_in_business: Optional[str] = None
    additional_requirements: Optional[List[str]] = None

class FundingDetails(BaseModel):
    min_amount: Optional[float] = None
    max_amount: Optional[float] = None
    co_contribution_required: Optional[bool] = None
    co_contribution_percentage: Optional[float] = None
    funding_type: str  # Grant, Loan, Tax Incentive, Rebate, Voucher

class ApplicationPeriod(BaseModel):
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_ongoing: bool = False
    next_round_expected: Optional[str] = None

class GrantProgram(BaseModel):
    id: str
    name: str
    description: str
    provider: str
    level: str  # Federal, State, Local
    state: Optional[str] = None  # For state and local programs
    region: Optional[str] = None  # For local programs
    category: List[str]  # R&D, Export, Innovation, etc.
    eligibility: EligibilityCriteria
    funding: FundingDetails
    application_period: ApplicationPeriod
    website_url: str
    contact_information: Optional[Dict[str, str]] = None
    keywords: List[str] = []  # For improved searchability

# Helper function to sanitize storage key
def sanitize_storage_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    return re.sub(r'[^a-zA-Z0-9._-]', '', key)

# Function to store the initial database
def initialize_grant_database():
    # Federal Government Programs
    federal_programs = [
        GrantProgram(
            id="federal-rd-tax-incentive",
            name="Research and Development Tax Incentive",
            description="A tax incentive to encourage companies to engage in R&D benefiting Australia by providing a tax offset for eligible R&D activities.",
            provider="Australian Taxation Office",
            level="Federal",
            category=["Research & Development", "Tax Incentive"],
            eligibility=EligibilityCriteria(
                business_types=["Company"],
                industry_sectors=["All"],
                additional_requirements=["Must be conducting eligible R&D activities"]
            ),
            funding=FundingDetails(
                funding_type="Tax Incentive",
                co_contribution_required=True
            ),
            application_period=ApplicationPeriod(
                is_ongoing=True
            ),
            website_url="https://business.gov.au/grants-and-programs/research-and-development-tax-incentive",
            contact_information={
                "phone": "13 28 66",
                "email": "R&DTaxIncentive@industry.gov.au"
            },
            keywords=["R&D", "innovation", "tax", "research", "development"]
        ),
        GrantProgram(
            id="federal-emdg",
            name="Export Market Development Grant",
            description="Financial assistance for current and aspiring exporters of Australian goods and services.",
            provider="Austrade",
            level="Federal",
            category=["Export", "Market Development"],
            eligibility=EligibilityCriteria(
                business_types=["Company", "Partnership", "Sole Trader", "Trust"],
                turnover_range="Under $20 million",
                additional_requirements=["Must be promoting export of eligible goods or services"]
            ),
            funding=FundingDetails(
                funding_type="Grant",
                co_contribution_required=True,
                co_contribution_percentage=50.0
            ),
            application_period=ApplicationPeriod(
                is_ongoing=True
            ),
            website_url="https://www.austrade.gov.au/australian/export/export-grants",
            contact_information={
                "phone": "13 28 78",
                "email": "emdg.help@austrade.gov.au"
            },
            keywords=["export", "international", "market", "development"]
        ),
        GrantProgram(
            id="federal-accelerating-commercialisation",
            name="Accelerating Commercialisation",
            description="Helps Australian entrepreneurs, researchers and small and medium businesses commercialize novel products, processes and services.",
            provider="Department of Industry, Science, Energy and Resources",
            level="Federal",
            category=["Innovation", "Commercialization"],
            eligibility=EligibilityCriteria(
                business_types=["Company", "Partnership", "Trust"],
                additional_requirements=["Have a novel product, process or service to commercialize", "Turnover of less than $20 million in each of the last three years"]
            ),
            funding=FundingDetails(
                funding_type="Grant",
                min_amount=20000.0,
                max_amount=1000000.0,
                co_contribution_required=True,
                co_contribution_percentage=50.0
            ),
            application_period=ApplicationPeriod(
                is_ongoing=True
            ),
            website_url="https://business.gov.au/grants-and-programs/accelerating-commercialisation",
            contact_information={
                "phone": "13 28 46"
            },
            keywords=["commercialization", "innovation", "product development"]
        )
    ]
    
    # NSW State Programs
    nsw_programs = [
        GrantProgram(
            id="nsw-small-business-innovation",
            name="Small Business Innovation & Research Program",
            description="Provides competitive grants to small businesses to find and commercialize innovative solutions to NSW Government challenges.",
            provider="NSW Treasury",
            level="State",
            state="New South Wales",
            category=["Innovation", "Research & Development"],
            eligibility=EligibilityCriteria(
                business_types=["Company"],
                employee_count_range="Less than 200 employees",
                location_requirements=["New South Wales"]
            ),
            funding=FundingDetails(
                funding_type="Grant",
                min_amount=10000.0,
                max_amount=100000.0,
                co_contribution_required=False
            ),
            application_period=ApplicationPeriod(
                is_ongoing=False,
                next_round_expected="Check website for upcoming rounds"
            ),
            website_url="https://www.innovation.nsw.gov.au/nsw-government-small-business-innovation-research-program",
            keywords=["innovation", "research", "small business", "NSW"]
        ),
        GrantProgram(
            id="nsw-jobs-plus",
            name="Jobs Plus Program",
            description="Support for businesses to establish and expand their footprint in NSW, creating new jobs.",
            provider="Investment NSW",
            level="State",
            state="New South Wales",
            category=["Job Creation", "Business Expansion"],
            eligibility=EligibilityCriteria(
                business_types=["Company"],
                additional_requirements=["Creating at least 30 new FTE jobs"],
                location_requirements=["New South Wales"]
            ),
            funding=FundingDetails(
                funding_type="Grant",
                co_contribution_required=False
            ),
            application_period=ApplicationPeriod(
                is_ongoing=True
            ),
            website_url="https://www.investment.nsw.gov.au/grants-and-rebates/jobs-plus-program",
            keywords=["jobs", "employment", "business growth", "expansion", "NSW"]
        )
    ]
    
    # Victoria State Programs
    vic_programs = [
        GrantProgram(
            id="vic-breakthrough-victoria-fund",
            name="Breakthrough Victoria Fund",
            description="Invests in innovations with commercial potential to transform industries in Victoria.",
            provider="Breakthrough Victoria",
            level="State",
            state="Victoria",
            category=["Innovation", "Commercialization", "Research & Development"],
            eligibility=EligibilityCriteria(
                business_types=["Company", "Research Institution"],
                location_requirements=["Victoria"],
                additional_requirements=["Focus areas: Health & Life Sciences, Agri-Food, Advanced Manufacturing, Clean Economy, Digital Technologies"]
            ),
            funding=FundingDetails(
                funding_type="Investment",
                min_amount=500000.0,
                max_amount=30000000.0,
                co_contribution_required=True
            ),
            application_period=ApplicationPeriod(
                is_ongoing=True
            ),
            website_url="https://breakthroughvictoria.com",
            keywords=["innovation", "research", "commercialization", "Victoria", "investment"]
        ),
        GrantProgram(
            id="vic-regional-jobs-fund",
            name="Regional Jobs Fund",
            description="Supports business expansion, relocation and growth in regional Victoria.",
            provider="Regional Development Victoria",
            level="State",
            state="Victoria",
            category=["Job Creation", "Regional Development", "Business Expansion"],
            eligibility=EligibilityCriteria(
                business_types=["Company"],
                location_requirements=["Regional Victoria"],
                additional_requirements=["Creating or retaining jobs in regional Victoria"]
            ),
            funding=FundingDetails(
                funding_type="Grant",
                co_contribution_required=True,
                co_contribution_percentage=50.0
            ),
            application_period=ApplicationPeriod(
                is_ongoing=True
            ),
            website_url="https://www.rdv.vic.gov.au/grants-and-programs/regional-jobs-fund",
            keywords=["regional", "jobs", "employment", "business growth", "Victoria"]
        )
    ]
    
    # Queensland State Programs
    qld_programs = [
        GrantProgram(
            id="qld-business-growth-fund",
            name="Business Growth Fund",
            description="Provides funding for small and medium businesses to purchase specialized equipment to help them scale and grow.",
            provider="Queensland Government",
            level="State",
            state="Queensland",
            category=["Business Growth", "Equipment Purchase"],
            eligibility=EligibilityCriteria(
                business_types=["Company"],
                turnover_range="$500,000 - $100 million",
                employee_count_range="3-200 employees",
                location_requirements=["Queensland"],
                years_in_business="Trading for at least 3 years"
            ),
            funding=FundingDetails(
                funding_type="Grant",
                min_amount=50000.0,
                max_amount=200000.0,
                co_contribution_required=True,
                co_contribution_percentage=25.0
            ),
            application_period=ApplicationPeriod(
                is_ongoing=False,
                next_round_expected="Check website for upcoming rounds"
            ),
            website_url="https://www.business.qld.gov.au/starting-business/advice-support/grants/growth-fund",
            keywords=["growth", "equipment", "expansion", "Queensland"]
        ),
        GrantProgram(
            id="qld-ignite-ideas",
            name="Ignite Ideas Fund",
            description="Supports startups and small to medium Queensland businesses to commercialize innovative products, processes or services.",
            provider="Advance Queensland",
            level="State",
            state="Queensland",
            category=["Innovation", "Commercialization", "Startup"],
            eligibility=EligibilityCriteria(
                business_types=["Company", "Trust", "Partnership"],
                turnover_range="Less than $50 million",
                location_requirements=["Queensland"],
                additional_requirements=["Have a developed product, process or service that is at minimum viable product stage"]
            ),
            funding=FundingDetails(
                funding_type="Grant",
                min_amount=100000.0,
                max_amount=200000.0,
                co_contribution_required=True,
                co_contribution_percentage=20.0
            ),
            application_period=ApplicationPeriod(
                is_ongoing=False,
                next_round_expected="Check website for upcoming rounds"
            ),
            website_url="https://advance.qld.gov.au/entrepreneurs-and-startups/ignite-ideas-fund",
            keywords=["innovation", "commercialization", "startup", "Queensland"]
        )
    ]
    
    # Western Australia State Programs
    wa_programs = [
        GrantProgram(
            id="wa-capability-fund",
            name="Local Capability Fund",
            description="Provides funding to small and medium enterprises to improve their capability and competitiveness as suppliers of goods and services.",
            provider="Department of Jobs, Tourism, Science and Innovation",
            level="State",
            state="Western Australia",
            category=["Business Capability", "Supply Chain"],
            eligibility=EligibilityCriteria(
                business_types=["Company", "Trust", "Partnership", "Sole Trader"],
                employee_count_range="Less than 200 employees",
                location_requirements=["Western Australia"]
            ),
            funding=FundingDetails(
                funding_type="Grant",
                max_amount=50000.0,
                co_contribution_required=True,
                co_contribution_percentage=50.0
            ),
            application_period=ApplicationPeriod(
                is_ongoing=False,
                next_round_expected="Check website for upcoming rounds"
            ),
            website_url="https://www.wa.gov.au/service/commerce/industry-development/apply-local-capability-fund",
            keywords=["capability", "competitiveness", "supply chain", "Western Australia"]
        ),
        GrantProgram(
            id="wa-enterprise-support",
            name="Enterprise Support Program",
            description="Supports agribusinesses in implementing innovative agricultural technologies and practices.",
            provider="Department of Primary Industries and Regional Development",
            level="State",
            state="Western Australia",
            category=["Agriculture", "Innovation", "Technology Adoption"],
            eligibility=EligibilityCriteria(
                business_types=["Company", "Trust", "Partnership", "Sole Trader"],
                industry_sectors=["Agriculture", "Food Production", "Agribusiness"],
                location_requirements=["Western Australia"]
            ),
            funding=FundingDetails(
                funding_type="Grant",
                max_amount=600000.0,
                co_contribution_required=True
            ),
            application_period=ApplicationPeriod(
                is_ongoing=True
            ),
            website_url="https://www.agric.wa.gov.au/enterprise-support-program",
            keywords=["agriculture", "innovation", "technology", "Western Australia"]
        )
    ]
    
    # South Australia State Programs
    sa_programs = [
        GrantProgram(
            id="sa-research-innovation-fund",
            name="Research and Innovation Fund",
            description="Supports researchers and businesses to accelerate innovation and research commercialization.",
            provider="Department of State Development",
            level="State",
            state="South Australia",
            category=["Research & Development", "Innovation", "Commercialization"],
            eligibility=EligibilityCriteria(
                business_types=["Company", "Research Institution"],
                location_requirements=["South Australia"]
            ),
            funding=FundingDetails(
                funding_type="Grant",
                co_contribution_required=True
            ),
            application_period=ApplicationPeriod(
                is_ongoing=False,
                next_round_expected="Check website for upcoming rounds"
            ),
            website_url="https://statedevelopment.sa.gov.au/department/programs-and-initiatives",
            keywords=["research", "innovation", "commercialization", "South Australia"]
        ),
        GrantProgram(
            id="sa-seed-start",
            name="Seed-Start Program",
            description="Provides grant funding to innovative, early-stage startups for commercialization of products or services.",
            provider="Department of State Development",
            level="State",
            state="South Australia",
            category=["Startup", "Innovation", "Commercialization"],
            eligibility=EligibilityCriteria(
                business_types=["Company"],
                location_requirements=["South Australia"],
                additional_requirements=["Early-stage startup with innovative product/service"]
            ),
            funding=FundingDetails(
                funding_type="Grant",
                co_contribution_required=True
            ),
            application_period=ApplicationPeriod(
                is_ongoing=False,
                next_round_expected="Check website for upcoming rounds"
            ),
            website_url="https://statedevelopment.sa.gov.au/department/programs-and-initiatives",
            keywords=["startup", "early-stage", "innovation", "South Australia"]
        )
    ]
    
    # Tasmania State Programs
    tas_programs = [
        GrantProgram(
            id="tas-advanced-manufacturing",
            name="Advanced Manufacturing Productivity Grant Program",
            description="Provides funding for Tasmanian-based advanced manufacturing enterprises to enhance productivity.",
            provider="Department of State Growth",
            level="State",
            state="Tasmania",
            category=["Manufacturing", "Productivity"],
            eligibility=EligibilityCriteria(
                business_types=["Company"],
                industry_sectors=["Manufacturing"],
                location_requirements=["Tasmania"]
            ),
            funding=FundingDetails(
                funding_type="Grant",
                max_amount=450000.0,
                co_contribution_required=True
            ),
            application_period=ApplicationPeriod(
                is_ongoing=False,
                next_round_expected="Check website for upcoming rounds"
            ),
            website_url="https://www.stategrowth.tas.gov.au/grants_and_funding_opportunities",
            keywords=["manufacturing", "productivity", "technology", "Tasmania"]
        ),
        GrantProgram(
            id="tas-business-growth",
            name="Business Growth Loan Scheme",
            description="Supports businesses in developing and transitioning to sustainable operating models post-COVID.",
            provider="Department of State Growth",
            level="State",
            state="Tasmania",
            category=["Business Growth", "COVID Recovery"],
            eligibility=EligibilityCriteria(
                business_types=["Company", "Trust", "Partnership", "Sole Trader"],
                location_requirements=["Tasmania"]
            ),
            funding=FundingDetails(
                funding_type="Loan",
                co_contribution_required=False
            ),
            application_period=ApplicationPeriod(
                is_ongoing=True
            ),
            website_url="https://www.stategrowth.tas.gov.au/grants_and_funding_opportunities",
            keywords=["growth", "recovery", "loan", "Tasmania"]
        )
    ]
    
    # Northern Territory State Programs
    nt_programs = [
        GrantProgram(
            id="nt-business-growth",
            name="Business Growth Program",
            description="Funding for small businesses to access professional advice, services, and systems.",
            provider="Northern Territory Government",
            level="State",
            state="Northern Territory",
            category=["Business Growth", "Professional Services"],
            eligibility=EligibilityCriteria(
                business_types=["Company", "Trust", "Partnership", "Sole Trader"],
                location_requirements=["Northern Territory"]
            ),
            funding=FundingDetails(
                funding_type="Grant",
                min_amount=2000.0,
                max_amount=10000.0,
                co_contribution_required=True,
                co_contribution_percentage=50.0
            ),
            application_period=ApplicationPeriod(
                is_ongoing=True
            ),
            website_url="https://nt.gov.au/industry/business-grants-funding/business-growth-program",
            keywords=["growth", "advice", "services", "Northern Territory"]
        ),
        GrantProgram(
            id="nt-aboriginal-tourism",
            name="Aboriginal Tourism Grant Program",
            description="Supports the development of Aboriginal tourism businesses in the Northern Territory.",
            provider="Tourism NT",
            level="State",
            state="Northern Territory",
            category=["Tourism", "Aboriginal Business"],
            eligibility=EligibilityCriteria(
                business_types=["Company", "Trust", "Partnership", "Sole Trader", "Aboriginal Corporation"],
                location_requirements=["Northern Territory"],
                additional_requirements=["Aboriginal owned or operated business"]
            ),
            funding=FundingDetails(
                funding_type="Grant",
                co_contribution_required=True
            ),
            application_period=ApplicationPeriod(
                is_ongoing=False,
                next_round_expected="Check website for upcoming rounds"
            ),
            website_url="https://tourismnt.com.au/industry-toolkit/grants-funding",
            keywords=["tourism", "aboriginal", "indigenous", "Northern Territory"]
        )
    ]
    
    # ACT State Programs
    act_programs = [
        GrantProgram(
            id="act-icon-grants",
            name="Innovation Connect (ICON) Grants",
            description="Provides matched funding for early-stage entrepreneurs and start-ups to help kick-start their business journey.",
            provider="ACT Government",
            level="State",
            state="Australian Capital Territory",
            category=["Startup", "Innovation"],
            eligibility=EligibilityCriteria(
                business_types=["Company", "Partnership", "Sole Trader"],
                location_requirements=["Australian Capital Territory"]
            ),
            funding=FundingDetails(
                funding_type="Grant",
                min_amount=10000.0,
                max_amount=30000.0,
                co_contribution_required=True,
                co_contribution_percentage=50.0
            ),
            application_period=ApplicationPeriod(
                is_ongoing=False,
                next_round_expected="Check website for upcoming rounds"
            ),
            website_url="https://www.act.gov.au/business/grow-your-business/apply-for-grants-and-funding",
            keywords=["startup", "innovation", "early-stage", "ACT"]
        ),
        GrantProgram(
            id="act-social-enterprise",
            name="Social Enterprise Grants",
            description="Matched funding for social entrepreneurs creating social impact in the ACT.",
            provider="ACT Government",
            level="State",
            state="Australian Capital Territory",
            category=["Social Enterprise", "Social Impact"],
            eligibility=EligibilityCriteria(
                business_types=["Company", "Partnership", "Sole Trader", "Cooperative", "Not-for-profit"],
                location_requirements=["Australian Capital Territory"],
                additional_requirements=["Creating social impact"]
            ),
            funding=FundingDetails(
                funding_type="Grant",
                min_amount=10000.0,
                max_amount=30000.0,
                co_contribution_required=True,
                co_contribution_percentage=50.0
            ),
            application_period=ApplicationPeriod(
                is_ongoing=False,
                next_round_expected="Check website for upcoming rounds"
            ),
            website_url="https://www.act.gov.au/business/grow-your-business/apply-for-grants-and-funding",
            keywords=["social enterprise", "social impact", "ACT"]
        )
    ]
    
    # Local Government Programs
    local_programs = [
        GrantProgram(
            id="local-melbourne-small-business",
            name="City of Melbourne Small Business Grants",
            description="Provides funding to small businesses in the City of Melbourne to help them start up, expand or innovate.",
            provider="City of Melbourne",
            level="Local",
            state="Victoria",
            region="Melbourne",
            category=["Small Business", "Startup", "Business Expansion", "Innovation"],
            eligibility=EligibilityCriteria(
                business_types=["Company", "Partnership", "Sole Trader", "Trust"],
                location_requirements=["City of Melbourne"]
            ),
            funding=FundingDetails(
                funding_type="Grant",
                max_amount=20000.0,
                co_contribution_required=True,
                co_contribution_percentage=50.0
            ),
            application_period=ApplicationPeriod(
                is_ongoing=False,
                next_round_expected="Check website for upcoming rounds"
            ),
            website_url="https://www.melbourne.vic.gov.au/small-business-grants",
            keywords=["small business", "startup", "expansion", "innovation", "Melbourne"]
        ),
        GrantProgram(
            id="local-sydney-business-support",
            name="City of Sydney Business Support Grants",
            description="Provides support for businesses in the City of Sydney to grow and adapt to changing market conditions.",
            provider="City of Sydney",
            level="Local",
            state="New South Wales",
            region="Sydney",
            category=["Business Growth", "Adaptation", "Resilience"],
            eligibility=EligibilityCriteria(
                business_types=["Company", "Partnership", "Sole Trader", "Trust", "Not-for-profit"],
                location_requirements=["City of Sydney"]
            ),
            funding=FundingDetails(
                funding_type="Grant",
                co_contribution_required=True
            ),
            application_period=ApplicationPeriod(
                is_ongoing=False,
                next_round_expected="Check website for upcoming rounds"
            ),
            website_url="https://www.cityofsydney.nsw.gov.au/business-support-funding",
            keywords=["business support", "growth", "adaptation", "Sydney"]
        )
    ]
    
    # Combine all programs
    all_programs = (
        federal_programs +
        nsw_programs +
        vic_programs +
        qld_programs +
        wa_programs +
        sa_programs +
        tas_programs +
        nt_programs +
        act_programs +
        local_programs
    )
    
    # Store the data in Databutton storage
    db.storage.json.put(
        sanitize_storage_key('australian_government_grants'),
        [program.dict() for program in all_programs]
    )
    
    return all_programs

# API Endpoints
@router.get("/grants")
def list_grants(
    level: Optional[str] = None,
    state: Optional[str] = None,
    category: Optional[str] = None,
    business_type: Optional[str] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    funding_type: Optional[str] = None,
    q: Optional[str] = None
):
    """List government grants and incentives with optional filtering"""
    try:
        # Get the stored data
        stored_data = db.storage.json.get(sanitize_storage_key('australian_government_grants'))
        programs = [GrantProgram(**program) for program in stored_data]
    except:
        # If data doesn't exist, initialize it
        programs = initialize_grant_database()
    
    # Apply filters
    if level:
        programs = [p for p in programs if p.level.lower() == level.lower()]
    
    if state:
        programs = [p for p in programs if p.state and p.state.lower() == state.lower()]
    
    if category:
        programs = [p for p in programs if any(cat.lower() == category.lower() for cat in p.category)]
    
    if business_type:
        programs = [p for p in programs if any(bt.lower() == business_type.lower() for bt in p.eligibility.business_types)]
    
    if min_amount is not None:
        programs = [p for p in programs if p.funding.min_amount is None or p.funding.min_amount >= min_amount]
    
    if max_amount is not None:
        programs = [p for p in programs if p.funding.max_amount is None or p.funding.max_amount <= max_amount]
    
    if funding_type:
        programs = [p for p in programs if p.funding.funding_type.lower() == funding_type.lower()]
    
    if q:  # Text search
        q = q.lower()
        filtered_programs = []
        for p in programs:
            # Search in name, description, and keywords
            if (
                q in p.name.lower() or
                q in p.description.lower() or
                any(q in kw.lower() for kw in p.keywords)
            ):
                filtered_programs.append(p)
        programs = filtered_programs
    
    return {"grants": [p.dict() for p in programs]}

@router.get("/grants/{grant_id}")
def get_grant(grant_id: str):
    """Get detailed information about a specific grant"""
    try:
        # Get the stored data
        stored_data = db.storage.json.get(sanitize_storage_key('australian_government_grants'))
        all_programs = [GrantProgram(**program) for program in stored_data]
        
        # Find the requested grant
        for program in all_programs:
            if program.id == grant_id:
                return program.dict()
        
        return {"error": "Grant not found"}
    except:
        # If data doesn't exist, initialize it and try again
        all_programs = initialize_grant_database()
        
        # Find the requested grant
        for program in all_programs:
            if program.id == grant_id:
                return program.dict()
        
        return {"error": "Grant not found"}

@router.get("/grants/categories")
def get_grant_categories():
    """Get a list of all grant categories"""
    try:
        # Get the stored data
        stored_data = db.storage.json.get(sanitize_storage_key('australian_government_grants'))
        all_programs = [GrantProgram(**program) for program in stored_data]
    except:
        # If data doesn't exist, initialize it
        all_programs = initialize_grant_database()
    
    # Extract and deduplicate categories
    all_categories = set()
    for program in all_programs:
        for category in program.category:
            all_categories.add(category)
    
    return {"categories": sorted(list(all_categories))}

@router.get("/grants/business-types")
def get_business_types():
    """Get a list of all business types eligible for grants"""
    try:
        # Get the stored data
        stored_data = db.storage.json.get(sanitize_storage_key('australian_government_grants'))
        all_programs = [GrantProgram(**program) for program in stored_data]
    except:
        # If data doesn't exist, initialize it
        all_programs = initialize_grant_database()
    
    # Extract and deduplicate business types
    all_business_types = set()
    for program in all_programs:
        for bt in program.eligibility.business_types:
            all_business_types.add(bt)
    
    return {"business_types": sorted(list(all_business_types))}

@router.get("/grants/states")
def get_states():
    """Get a list of all states with grants"""
    try:
        # Get the stored data
        stored_data = db.storage.json.get(sanitize_storage_key('australian_government_grants'))
        all_programs = [GrantProgram(**program) for program in stored_data]
    except:
        # If data doesn't exist, initialize it
        all_programs = initialize_grant_database()
    
    # Extract and deduplicate states
    all_states = set()
    for program in all_programs:
        if program.state:
            all_states.add(program.state)
    
    return {"states": sorted(list(all_states))}

@router.get("/grants/funding-types")
def get_funding_types():
    """Get a list of all funding types"""
    try:
        # Get the stored data
        stored_data = db.storage.json.get(sanitize_storage_key('australian_government_grants'))
        all_programs = [GrantProgram(**program) for program in stored_data]
    except:
        # If data doesn't exist, initialize it
        all_programs = initialize_grant_database()
    
    # Extract and deduplicate funding types
    all_funding_types = set()
    for program in all_programs:
        all_funding_types.add(program.funding.funding_type)
    
    return {"funding_types": sorted(list(all_funding_types))}
