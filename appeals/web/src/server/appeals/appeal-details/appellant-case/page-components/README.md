# Appellant Case Page Component Mappers

## Architecture Overview

The appellant case details page renders structured summary list cards and action sections for an appeal's appellant case.

To support multiple appeal types (HAS, S78, S78 Expedited, S20, LDC, Enforcement Notice, Enforcement Listed, Adverts, CAS, CAS Advert), page components are modularized under `page-components/`.

```
appeals/web/src/server/appeals/appeal-details/appellant-case/
├── appellant-case.mapper.js             # Entry point: maps full page & delegates component generation
└── page-components/
    ├── common-sections.mapper.js        # Shared card builders (Before You Start, Appellant Details, Site Details, etc.)
    ├── adverts.mapper.js                # Advert appeal components
    ├── cas-advert.mapper.js             # CAS Advert appeal components
    ├── cas.mapper.js                    # CAS Planning appeal components
    ├── enforcement-listed.mapper.js     # Enforcement Listed Building components
    ├── enforcement-notice.mapper.js     # Enforcement Notice components
    ├── has.mapper.js                    # Householder (HAS) components
    ├── ldc.mapper.js                    # Lawful Development Certificate (LDC) components
    ├── s20.mapper.js                    # Section 20 components
    ├── s78-expedited.mapper.js          # Section 78 Expedited components
    └── s78.mapper.js                    # Section 78 components
```

---

## How Appellant Case Layout is Structured

1. `appellantCasePage()` in [appellant-case.mapper.js](../appellant-case.mapper.js) initializes and maps appeal and appellant case data (`initialiseAndMapData`).
2. It delegates to `generateCaseTypeSpecificComponents(appealDetails, appellantCaseData, mappedAppellantCaseData, userHasUpdateCasePermission)`.
3. `generateCaseTypeSpecificComponents` checks `appealDetails.appealType` (along with flags and expedited criteria) to determine which appellant case generator to use.
4. Each generator function returns an array of `PageComponent` objects representing summary cards (e.g. `before-you-start`, `appellant-details`, `site-details`, `application-summary`, `appeal-summary`, `uploaded-documents`, `additional-documents`).
5. Section numbers (e.g., `1. Appellant details`, `2. Site details`) are automatically prefixed sequentially by `appellant-case.mapper.js` to all cards except `before-you-start` and `additional-documents`.

---

## Shared Card Builders (`common-sections.mapper.js`)

`common-sections.mapper.js` provides reusable builder functions and helper functions. If changes are needed to be made for individual appeals from these functions dedicated mapper functions should be used within each appeal specific mapper file, see [Overriding Card Builders for Appeal-Specific Needs](#2-overriding-card-builders-for-appeal-specific-needs).

### Core Helper: `buildSummaryListCard`
```javascript
buildSummaryListCard(id, title, rows, options = {})
```
- **Filter logic:** Filters out `null`/`undefined` row elements automatically. Returns `null` if no valid rows exist (unless `options.actions` is defined).
- **Output:** Standard GOV.UK summary list card component schema.

---

## Adding or Modifying Appellant Case Pages

### 1. Modifying Existing Appeal Type Rows / Cards
To add, remove, or reorder summary rows for a specific appeal type:
- Locate the specific mapper (e.g. [has.mapper.js](has.mapper.js) or [s78.mapper.js](s78.mapper.js)).
- Modify the `rows` array inside the card builder or pass additional row elements.
- Ensure conditional rows (e.g., based on date thresholds or optional data) evaluate to `null` when inactive; `buildSummaryListCard` will filter them out.

### 2. Overriding Card Builders for Appeal-Specific Needs
If an appeal type requires custom rows in standard sections (e.g. `site-details` or `application-summary`), you can either:
- Pass extra row instructions using `additionalRows` parameter on `buildSiteDetailsCard` / `buildApplicationDetailsCard`. Or add this functionality to other mappers where appropriate.
- Define an appeal-specific builder function in the appeal's mapper module (e.g., `buildHASUploadedDocumentsCard` in `has.mapper.js` or `buildLdcSiteDetailsCard` in `ldc.mapper.js`) 
- Taking a common section builder and applying manipulations should always be avoided.

### 3. Adding a New Appeal Type
1. Create a new mapper module in `page-components/<appeal-type>.mapper.js`.
2. Export `generate<AppealType>Components(appealDetails, appellantCaseData, mappedAppellantCaseData, userHasUpdateCasePermission)`.
3. Compose and return card components using `common-sections.mapper.js` builders or custom card builders.
4. Import and add a `case` branch in `generateCaseTypeSpecificComponents` inside [appellant-case.mapper.js](../appellant-case.mapper.js).
5. Add unit test coverage in `__tests__/appellant-case.test.js` or component-specific test suites.

## Reusable Card Builders (`common-sections.mapper.js`)

> Note: Auto-generated from `common-sections.mapper.js`. Re-run `npm run generate-docs` to update.

- **`buildSummaryListCard(id, title, rows, options = {})`**
- **`buildBeforeYouStartCard(mappedAppellantCaseData, options = {})`** – Builds the "Before you start" section card component.
- **`buildAppellantDetailsCard(appealDetails, mappedAppellantCaseData)`** – Builds the "Appellant details" section card component.
- **`buildSiteDetailsCard(mappedAppellantCaseData, additionalRows = [])`** – Builds the "Site details" section card component.
- **`buildApplicationDetailsCard(mappedAppellantCaseData, additionalRows = [])`** – Builds the "Application details" section card component.
- **`buildAppealDetailsCard(mappedAppellantCaseData, additionalRows = [])`** – Builds the "Appeal details" section card component.
- **`buildAdditionalDocumentsCard(appellantCaseData, mappedAppellantCaseData, userHasUpdateCasePermission)`** – Builds the "Additional documents" section card component.
- **`buildFullPlanningApplicationDetailsCard(mappedAppellantCaseData)`** – Builds the Full Planning (S20 & S78) "Application details" section card component.
- **`buildFullPlanningAppealDetailsCard(mappedAppellantCaseData)`** – Builds the Full Planning (S20 & S78) "Appeal details" section card component.
- **`buildFullPlanningUploadedDocumentsCard(mappedAppellantCaseData)`** – Builds the Full Planning (S20 & S78) "Uploaded documents" section card component.
- **`buildEnforcementBeforeYouStartCard(mappedAppellantCaseData)`** – Builds the Enforcement "Before you start" section card component.
- **`buildEnforcementAppellantDetailsCard(appealDetails, mappedAppellantCaseData)`** – Builds the Enforcement "Appellant details" section card component.
- **`buildEnforcementLandDetailsCard(mappedAppellantCaseData)`** – Builds the Enforcement "Land" section card component.
- **`buildEnforcementApplicationDetailsCard(mappedAppellantCaseData)`** – Builds the Enforcement "Application details" section card component.
- **`buildAdvertSiteDetailsCard(mappedAppellantCaseData)`** – Builds the Advert "Site details" section card component.
- **`buildAdvertApplicationDetailsCard(mappedAppellantCaseData)`** – Builds the Advert "Application details" section card component.

---

## Auto-Generated Rendered Rows by Appeal Type

> Note: Auto-generated from component mapper contracts. Re-run `npm run generate-docs` or `node scripts/generate-appellant-case-docs.js` to update.
> Note: This list displays all rows rendered when full mapped data is present. Dynamic conditional logic (such as application date cutoffs or optional data checks) is handled within individual mapper functions and is not annotated here.

### Adverts
- **Before you start**
  - Local planning authority
  - Application type
  - Application decision
  - Application decision date
  - LPA application reference number
- **Appellant details**
  - Appellant name
- **Site details**
  - Site address
  - Highway land
  - Advertisement in position
  - Green belt
  - Site ownership
  - Owners known
  - Inspector access
  - Safety risks
  - Landowner permission
- **Application details**
  - Application date
  - Advertisement description
  - Related appeals
  - Decision letter
- **Appeal details**
  - Procedure preference
  - Procedure preference details
  - Procedure preference duration
  - Inquiry number of witnesses
- **Upload documents**
  - Application form
  - Appeal statement
  - Application for a award of costs
  - Other new supporting documents

### CAS Advert
- **Before you start**
  - Local planning authority
  - Application type
  - Application decision
  - Application decision date
  - LPA application reference number
- **Appellant details**
  - Appellant name
- **Site details**
  - Site address
  - Highway land
  - Advertisement in position
  - Green belt
  - Site ownership
  - Owners known
  - Inspector access
  - Safety risks
  - Landowner permission
- **Application details**
  - Application date
  - Advertisement description
  - Related appeals
  - Decision letter
- **Upload documents**
  - Application form
  - Appeal statement
  - Application for a award of costs
  - Other new supporting documents

### CAS Planning
- **Before you start**
  - Local planning authority
  - Application type
  - Application decision
  - Application decision date
  - LPA application reference number
- **Appellant details**
  - Appellant name
- **Site details**
  - Site address
  - Site area
  - Green belt
  - Site ownership
  - Owners known
  - Inspector access
  - Safety risks
- **Application details**
  - Application date
  - Development description
  - Related appeals
  - Decision letter
- **Upload documents**
  - Application form
  - Appeal statement
  - Application for a award of costs
  - Other new supporting documents

### Enforcement Listed
- **Before you start**
  - Local planning authority
  - Application type
  - Enforcement notice date
  - Effective date of enforcement notice
  - Date planning inspectorate contacted
  - Enforcement reference
- **Appellant details**
  - Appellant name
  - Other appellants
- **Land**
  - Site address
  - Contact address
  - Interest in land
  - Written or verbal permission
  - Inspector access
  - Safety risks
- **Grounds and facts**
  - Facts for grounds
  - Supporting documents for grounds
- **Application details**
  - Related appeals
- **Appeal details**
  - Procedure preference
  - Procedure preference details
  - Procedure preference duration
  - Inquiry number of witnesses
- **Upload documents**
  - Status of planning obligation
  - Planning obligation
  - Application for a award of costs
  - Other new supporting documents
- **Additional documents**
  - Additional documents

### Enforcement Notice
- **Before you start**
  - Local planning authority
  - Application type
  - Enforcement notice date
  - Effective date of enforcement notice
  - Date planning inspectorate contacted
  - Enforcement reference
- **Appellant details**
  - Appellant name
  - Other appellants
- **Land**
  - Site address
  - Contact address
  - Interest in land
  - Written or verbal permission
  - Inspector access
  - Safety risks
- **Grounds and facts**
  - Facts for grounds
  - Supporting documents for grounds
  - LPA application reference number
  - Application date
  - Development description
  - Application decision
  - Application decision date
- **Application details**
  - Related appeals
- **Appeal details**
  - Procedure preference
  - Procedure preference details
  - Procedure preference duration
  - Inquiry number of witnesses
- **Upload documents**
  - Application form
  - Decision letter
  - Status of planning obligation
  - Planning obligation
  - Application for a award of costs
  - Other new supporting documents
- **Additional documents**
  - Additional documents

### Householder (HAS)
- **Before you start**
  - Local planning authority
  - Application type
  - Application decision
  - Application decision date
  - LPA application reference number
- **Appellant details**
  - Appellant name
- **Site details**
  - Site address
  - Site area
  - Green belt
  - Site ownership
  - Owners known
  - Inspector access
  - Safety risks
- **Application details**
  - Application date
  - Development description
  - Related appeals
  - Decision letter
- **Upload documents**
  - Application form
  - Appeal statement
  - Application for a award of costs
- **Additional documents**
  - Additional documents

### LDC
- **Before you start**
  - Local planning authority
  - Application type
  - Application decision
  - Application decision date
  - LPA application reference number
- **Appellant details**
  - Appellant name
- **Site details**
  - Site address
  - Inspector access
  - Safety risks
- **Application details**
  - Application date
  - Development description
  - Related appeals
- **Appeal details**
  - Procedure preference
  - Procedure preference details
  - Procedure preference duration
  - Inquiry number of witnesses
- **Upload documents**
  - Application form
  - Appeal statement
  - Application for a award of costs
  - Other new supporting documents
  - Draft statement of common ground
  - New plans or drawings
  - Decision letter
  - Other new supporting documents

### S20
- **Before you start**
  - Local planning authority
  - Application type
  - Application decision
  - Application decision date
  - LPA application reference number
- **Appellant details**
  - Appellant name
- **Site details**
  - Site address
  - Site area
  - Green belt
  - Site ownership
  - Owners known
  - Inspector access
  - Safety risks
- **Application details**
  - Application date
  - Development description
  - Related appeals
  - Development type
- **Appeal details**
  - Procedure preference
  - Procedure preference details
  - Procedure preference duration
  - Inquiry number of witnesses
- **Upload documents**
  - Application form
  - Decision letter
  - Appeal statement
  - Status of planning obligation
  - Planning obligation
  - Draft statement of common ground
  - Ownership certificate
  - Application for a award of costs
  - Design and access statement
  - Other new supporting documents
  - New plans or drawings
  - Other new supporting documents
- **Additional documents**
  - Additional documents

### S78 Expedited
- **Before you start**
  - Local planning authority
  - Application type
  - Application decision
  - Application decision date
  - LPA application reference number
- **Appellant details**
  - Appellant name
- **Site details**
  - Site address
  - Site area
  - Green belt
  - Site ownership
  - Owners known
  - Inspector access
  - Safety risks
- **Application details**
  - Application date
  - Development description
  - Related appeals
  - Development type
- **Appeal details**
  - Procedure preference
  - Procedure preference details
  - Procedure preference duration
  - Inquiry number of witnesses
- **Upload documents**
  - Application form
  - Decision letter
  - Status of planning obligation
  - Planning obligation
  - Draft statement of common ground
  - Ownership certificate
  - Application for a award of costs
  - Design and access statement
  - Other new supporting documents
  - New plans or drawings
  - Other new supporting documents
- **Additional documents**
  - Additional documents

### S78 Standard
- **Before you start**
  - Local planning authority
  - Application type
  - Application decision
  - Application decision date
  - LPA application reference number
- **Appellant details**
  - Appellant name
- **Site details**
  - Site address
  - Site area
  - Green belt
  - Site ownership
  - Owners known
  - Inspector access
  - Safety risks
- **Application details**
  - Application date
  - Development description
  - Related appeals
  - Development type
- **Appeal details**
  - Procedure preference
  - Procedure preference details
  - Procedure preference duration
  - Inquiry number of witnesses
- **Upload documents**
  - Application form
  - Decision letter
  - Appeal statement
  - Status of planning obligation
  - Planning obligation
  - Draft statement of common ground
  - Ownership certificate
  - Application for a award of costs
  - Design and access statement
  - Other new supporting documents
  - New plans or drawings
  - Other new supporting documents
- **Additional documents**
  - Additional documents

