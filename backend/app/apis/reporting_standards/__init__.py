from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Optional

router = APIRouter()

class ReportingStandardsQuery(BaseModel):
    entity_type: Optional[str] = None  # e.g., "company", "trust", "partnership", "sole_trader"
    company_size: Optional[str] = None  # e.g., "small", "medium", "large", "listed"
    standard_type: Optional[str] = None  # e.g., "financial", "governance", "regulatory"

class StandardsResponse(BaseModel):
    title: str
    description: str
    requirements: List[Dict[str, str]]
    references: List[Dict[str, str]]

@router.post("/get-reporting-standards")
def get_reporting_standards(query: ReportingStandardsQuery) -> StandardsResponse:
    """
    Retrieve Australian reporting standards based on entity type, size, and standard type.
    """
    # Default response with overview of Australian corporate governance
    if not query.entity_type and not query.company_size and not query.standard_type:
        return StandardsResponse(
            title="Australian Corporate Governance and Reporting Framework Overview",
            description="Australia's corporate governance framework is shaped by a combination of legal rules, soft law, and market expectations.",
            requirements=[
                {
                    "name": "Corporations Act 2001",
                    "description": "Primary legislation governing corporate governance in Australia. Outlines rights of shareholders, duties of directors, and requirements for financial reporting and disclosure."
                },
                {
                    "name": "Company Constitutions",
                    "description": "Companies must adopt a constitution that outlines their internal governance rules. The Corporations Act provides default rules, but companies can modify these through their constitutions."
                },
                {
                    "name": "ASX Listing Rules",
                    "description": "Companies listed on the Australian Securities Exchange must comply with ASX Listing Rules, including requirements for continuous disclosure, corporate governance statements, and shareholder rights."
                },
                {
                    "name": "Regulatory Oversight",
                    "description": "ASIC is the primary regulator overseeing corporate governance practices in Australia. It enforces compliance with the Corporations Act and ASX Listing Rules."
                }
            ],
            references=[
                {
                    "name": "ASIC - Corporate Governance",
                    "url": "https://asic.gov.au/regulatory-resources/corporate-governance/"
                },
                {
                    "name": "Treasury.gov.au - Corporate Governance Framework",
                    "url": "https://treasury.gov.au/publication/making-transparency-transparent-an-australian-assessment/chapter-4-corporate-governance-framework"
                }
            ]
        )
    
    # Company size definitions
    if query.company_size and query.entity_type == "company":
        if query.company_size == "small":
            return StandardsResponse(
                title="Small Proprietary Companies Reporting Requirements",
                description="Small proprietary companies in Australia have streamlined reporting requirements compared to larger entities.",
                requirements=[
                    {
                        "name": "Definition",
                        "description": "A company that satisfies at least two of these criteria: less than $50 million in consolidated revenue; less than $25 million in consolidated gross assets; less than 100 employees."
                    },
                    {
                        "name": "Record Keeping",
                        "description": "Must keep sufficient financial records for 7 years to enable preparation of financial statements if required."
                    },
                    {
                        "name": "Reporting Exemptions",
                        "description": "Generally exempt from preparing and lodging financial reports unless directed by ASIC or shareholders."
                    }
                ],
                references=[
                    {
                        "name": "ASIC - Small Proprietary Companies",
                        "url": "https://asic.gov.au/regulatory-resources/financial-reporting-and-audit/preparers-of-financial-reports/small-proprietary-companies/"
                    }
                ]
            )
        elif query.company_size == "large":
            return StandardsResponse(
                title="Large Proprietary Companies Reporting Requirements",
                description="Large proprietary companies in Australia have more extensive reporting requirements.",
                requirements=[
                    {
                        "name": "Definition",
                        "description": "A company that satisfies at least two of these criteria: $50 million or more in consolidated revenue; $25 million or more in consolidated gross assets; 100 or more employees."
                    },
                    {
                        "name": "Financial Reports",
                        "description": "Must prepare and lodge annual financial reports with ASIC within four months after the end of the financial year."
                    },
                    {
                        "name": "Accounting Standards",
                        "description": "Financial reports must comply with Australian Accounting Standards."
                    },
                    {
                        "name": "Audit Requirements",
                        "description": "Financial reports must be audited."
                    }
                ],
                references=[
                    {
                        "name": "ASIC - Financial Reporting",
                        "url": "https://asic.gov.au/regulatory-resources/financial-reporting-and-audit/preparers-of-financial-reports/lodgement-of-financial-reports/"
                    }
                ]
            )
        elif query.company_size == "listed":
            return StandardsResponse(
                title="Listed Companies Reporting Requirements",
                description="Companies listed on the Australian Securities Exchange (ASX) have extensive reporting and governance requirements.",
                requirements=[
                    {
                        "name": "Continuous Disclosure",
                        "description": "Must immediately disclose any information that a reasonable person would expect to have a material effect on the price or value of the entity's securities."
                    },
                    {
                        "name": "Financial Reports",
                        "description": "Must prepare and lodge half-yearly and annual financial reports with ASIC and ASX. Annual reports must be lodged within three months after the end of the financial year."
                    },
                    {
                        "name": "Corporate Governance Statement",
                        "description": "Must publish a corporate governance statement disclosing the extent to which the entity has followed the ASX Corporate Governance Council's recommendations."
                    },
                    {
                        "name": "Audit Requirements",
                        "description": "Financial reports must be audited by a registered company auditor."
                    }
                ],
                references=[
                    {
                        "name": "ASX Listing Rules",
                        "url": "https://www.asx.com.au/regulation/rules/asx-listing-rules"
                    },
                    {
                        "name": "ASIC - Listed Companies",
                        "url": "https://asic.gov.au/regulatory-resources/markets/corporate-governance/corporate-governance-for-listed-companies/"
                    }
                ]
            )
    
    # Entity type-specific requirements
    if query.entity_type and not query.company_size:
        if query.entity_type == "trust":
            return StandardsResponse(
                title="Trust Reporting Requirements",
                description="Reporting requirements for trusts in Australia depend on whether they are managed investment schemes or private trusts.",
                requirements=[
                    {
                        "name": "Managed Investment Schemes",
                        "description": "Registered managed investment schemes must prepare and lodge audited financial statements with ASIC within three months after the end of the financial year."
                    },
                    {
                        "name": "Private Trusts",
                        "description": "Private trusts generally do not have statutory financial reporting obligations but must maintain accurate records for tax purposes."
                    }
                ],
                references=[
                    {
                        "name": "ASIC - Managed Investment Schemes",
                        "url": "https://asic.gov.au/regulatory-resources/funds-management/managed-investment-schemes/"
                    }
                ]
            )
        elif query.entity_type == "partnership":
            return StandardsResponse(
                title="Partnership Reporting Requirements",
                description="Partnerships in Australia generally do not have statutory financial reporting obligations but must maintain records for tax purposes.",
                requirements=[
                    {
                        "name": "Record Keeping",
                        "description": "Must keep accounting records for 5 years."
                    },
                    {
                        "name": "Tax Reporting",
                        "description": "Must lodge partnership tax returns with the Australian Taxation Office (ATO)."
                    },
                    {
                        "name": "Liability",
                        "description": "Unlimited liability – debt incurred by any one partner is owed by all partners."
                    }
                ],
                references=[
                    {
                        "name": "ATO - Partnerships",
                        "url": "https://www.ato.gov.au/business/starting-your-own-business/business-structure/partnership/"
                    }
                ]
            )
        elif query.entity_type == "sole_trader":
            return StandardsResponse(
                title="Sole Trader Reporting Requirements",
                description="Sole traders in Australia do not have statutory financial reporting obligations but must maintain records for tax purposes.",
                requirements=[
                    {
                        "name": "Record Keeping",
                        "description": "Must keep accounting records for 5 years."
                    },
                    {
                        "name": "Tax Reporting",
                        "description": "Must lodge individual tax returns with business schedule with the Australian Taxation Office (ATO)."
                    },
                    {
                        "name": "Liability",
                        "description": "Unlimited liability – any debts of the business are debts of the owner."
                    }
                ],
                references=[
                    {
                        "name": "ATO - Sole Traders",
                        "url": "https://www.ato.gov.au/business/starting-your-own-business/business-structure/sole-trader/"
                    }
                ]
            )
    
    # Standard type-specific requirements
    if query.standard_type and not query.entity_type and not query.company_size:
        if query.standard_type == "governance":
            return StandardsResponse(
                title="Corporate Governance Standards in Australia",
                description="Corporate governance in Australia is guided by a combination of legal requirements and best practice recommendations.",
                requirements=[
                    {
                        "name": "ASX Corporate Governance Principles",
                        "description": "The ASX Corporate Governance Council has developed principles and recommendations for listed entities. These follow an 'if not, why not' approach, requiring entities to either comply or explain why they have not complied."
                    },
                    {
                        "name": "Director Duties",
                        "description": "Directors have duties under the Corporations Act, including the duty to act in good faith, duty to act for proper purposes, duty to avoid conflicts of interest, and duty of care and diligence."
                    },
                    {
                        "name": "Board Composition",
                        "description": "Best practice recommends boards have a majority of independent directors, separate chair and CEO roles, and diverse composition."
                    }
                ],
                references=[
                    {
                        "name": "ASX Corporate Governance Council",
                        "url": "https://www.asx.com.au/about/corporate-governance-council"
                    },
                    {
                        "name": "AICD - Governance Resources",
                        "url": "https://aicd.companydirectors.com.au/resources/director-tools"
                    }
                ]
            )
        elif query.standard_type == "financial":
            return StandardsResponse(
                title="Financial Reporting Standards in Australia",
                description="Financial reporting in Australia is governed by the Australian Accounting Standards Board (AASB).",
                requirements=[
                    {
                        "name": "Australian Accounting Standards",
                        "description": "The AASB issues accounting standards that are equivalent to International Financial Reporting Standards (IFRS). These standards must be followed by reporting entities."
                    },
                    {
                        "name": "Tiers of Reporting",
                        "description": "The AASB establishes a differential reporting framework with Tier 1 (full standards) and Tier 2 (reduced disclosure requirements)."
                    },
                    {
                        "name": "Compliance",
                        "description": "Financial reports must provide a true and fair view of the entity's financial position and performance."
                    }
                ],
                references=[
                    {
                        "name": "AASB",
                        "url": "https://aasb.gov.au/"
                    }
                ]
            )
        elif query.standard_type == "regulatory":
            return StandardsResponse(
                title="Regulatory Reporting Requirements in Australia",
                description="Various regulatory bodies in Australia impose reporting requirements on different types of entities.",
                requirements=[
                    {
                        "name": "ASIC",
                        "description": "The Australian Securities and Investments Commission regulates company and financial services laws."
                    },
                    {
                        "name": "ATO",
                        "description": "The Australian Taxation Office requires various tax-related reports and returns."
                    },
                    {
                        "name": "APRA",
                        "description": "The Australian Prudential Regulation Authority regulates banks, insurance companies, and superannuation funds, requiring specific prudential reports."
                    },
                    {
                        "name": "ACNC",
                        "description": "The Australian Charities and Not-for-profits Commission regulates charities, requiring annual information statements and financial reports."
                    }
                ],
                references=[
                    {
                        "name": "ASIC",
                        "url": "https://asic.gov.au/"
                    },
                    {
                        "name": "ATO",
                        "url": "https://www.ato.gov.au/"
                    },
                    {
                        "name": "APRA",
                        "url": "https://www.apra.gov.au/"
                    },
                    {
                        "name": "ACNC",
                        "url": "https://www.acnc.gov.au/"
                    }
                ]
            )
    
    # Default fallback response
    return StandardsResponse(
        title="Australian Reporting Standards Overview",
        description="An overview of reporting standards in Australia for various entity types.",
        requirements=[
            {
                "name": "Corporations Act 2001",
                "description": "Primary legislation governing reporting requirements for companies."
            },
            {
                "name": "Australian Accounting Standards",
                "description": "Standards issued by the AASB that govern financial reporting."
            },
            {
                "name": "ASX Listing Rules",
                "description": "Requirements for companies listed on the Australian Securities Exchange."
            }
        ],
        references=[
            {
                "name": "ASIC",
                "url": "https://asic.gov.au/"
            },
            {
                "name": "AASB",
                "url": "https://aasb.gov.au/"
            },
            {
                "name": "ASX",
                "url": "https://www.asx.com.au/"
            }
        ]
    )
