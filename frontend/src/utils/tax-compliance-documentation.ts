/**
 * Tax Compliance Data Models and Schema Documentation
 * 
 * This file provides a visual representation of the relationships between
 * the tax compliance data models in Lucent Analytics.
 */

// Store the ERD as a string for reference
export const TAX_COMPLIANCE_ERD = `
+----------------------+       +----------------------+       +------------------------+
|   BusinessEntity     |       |    TaxObligation    |       |      TaxReturn        |
+----------------------+       +----------------------+       +------------------------+
| id                   |<----->| entityId            |       | id                     |
| name                 |       | obligationType      |       | entityId               |
| abn                  |       | dueDate             |       | financialYear          |
| businessStructure    |       | lodgementDate       |       | status                 |
| tfn                  |       | status              |       | dueDate                |
| registeredForGST     |       | amount              |       | taxableIncome          |
| gstFrequency         |       | period              |       | taxPayable             |
+--------^-------------+       +----------------------+       | deductions             |
         |                                                    | credits                |
         |                                                    | schedules              |
+-----------------+---------------+---------------+           +------------------------+
|                |               |               |                       ^
|                |               |               |                       |
|                |               |               |                       |
+--------+       +--------+      +--------+      +--------+    +------------------+
| Company |       | Trust  |      |Partnership|  |SoleTrader|    | BASStatement    |
+--------+       +--------+      +--------+      +--------+    +------------------+
| acn     |       | trustType|   | partners |    | individual|  | id               |
| directors|      | trustee  |   | type     |    |           |  | entityId         |
| type    |       | benef.   |   |          |    |           |  | period           |
+--------+       +--------+      +--------+      +--------+    | gstCollected     |
      ^                ^              ^               ^        | gstPaid          |
      |                |              |               |        | paygWithholding  |
      |                |              |               |        +------------------+
      |                |              |               |
      |                |              |               |
      |                |              |               |
+------------+    +-----------+   +---------+  +------------+   +----------------+
|  Director  |    | Individual|   | Partner |  |TaxPlanning |   | FBTReturn      |
+------------+    +-----------+   +---------+  +------------+   +----------------+
| directorId |    | firstName |   | entityId|  | id         |   | id             |
| appoint.   |    | lastName  |   | entityType| | entityId   |   | entityId       |
| shares     |    | dob       |   | interest|  | assumptions |   | fbtYear        |
+------------+    +-----------+   +---------+  | strategies  |   | benefits       |
                                               +------------+   +----------------+
`;

/**
 * Tax Compliance Data Models - Key Entities
 */
export const TAX_COMPLIANCE_DOCUMENTATION = {
  businessEntities: {
    description: "Base and specialized business structure entities",
    types: [
      "BusinessEntity - Base entity with common fields",
      "Company - Corporate entities with directors",
      "Trust - Trust structures with trustees and beneficiaries",
      "Partnership - Partnerships with profit/loss sharing",
      "SoleTrader - Individual business operators"
    ]
  },
  
  peopleAndRoles: {
    description: "People and their roles within business entities",
    types: [
      "Individual - Natural persons with tax identifiers",
      "Director - Company directors with appointment dates",
      "Partner - Entities that form part of a partnership"
    ]
  },
  
  taxReporting: {
    description: "Tax reporting and compliance documents",
    types: [
      "TaxObligation - Upcoming or past tax obligations",
      "TaxReturn - Annual income tax returns",
      "BASStatement - Business Activity Statements",
      "FBTReturn - Fringe Benefits Tax returns"
    ]
  },
  
  taxPlanning: {
    description: "Tax planning and optimization models",
    types: [
      "TaxPlanningScenario - Projections for tax outcomes",
      "TaxStrategy - Specific tax planning approaches",
      "TaxAssumption - Financial assumptions for projections"
    ]
  },
  
  mappingToFinancialData: {
    description: "How tax models map to financial data",
    mappings: [
      "Profit & Loss → Taxable income calculations and deductions",
      "Balance Sheet → Asset declarations and liability assessments",
      "Cash Flow → Cash-based tax analyses and GST calculations"
    ]
  }
};

/**
 * Implementation Notes - These guide the implementation of the tax compliance features
 */
export const IMPLEMENTATION_NOTES = [
  "All entities have unique identifiers ('id' fields)",
  "Date ranges are used for period-based tax obligations",
  "Enums are used for standardized statuses and types",
  "Attachment support for evidence and documentation",
  "Multi-entity support for firms managing multiple clients",
  "Tax calculations consider different tax rates for different business structures",
  "Full support for Australian tax compliance requirements including ABN/ACN/TFN"
];
