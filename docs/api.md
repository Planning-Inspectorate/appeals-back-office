# API Back-end

Once configured, the API will run locally over the `http://localhost:3999` endpoint.

## API Documentation

The API is documented using an [OpenAPI (previously Swagger) spec](https://swagger.io/specification/v2/). The spec is generated from code comments in the Express route definitions.

To generate up-to-date documentation, run:

```shell
appeals/api> npm run gen-api-spec
```

This will re-generate the `appeals/api/src/server/swagger-output.json` file. This spec is hosted by the api, and can be found at `http://localhost:3999/api-docs/`.

## Running DB migrations

Prisma historical migrations are a set of SQL scripts that document the evolution of the database structure. To align the database to the latest structure, please run from the api folder:

```shell
appeals/api> npm run db:migrate
```

## Running DB seed

DB seed will populate the database with example data. To delete the current data and re-create it (with different IDs and seeds), please run from the api folder:

```shell
appeals/api> npm run db:seed
```

## Running the back-end

From the api folder

```shell
appeals/api> npm run dev
```

Or from the root folder:

```shell
> npm run api
```

## Environment settings

> [!IMPORTANT]
> Some of the settings to enable communication with EntraID need to be retrieved from the repository owner.

```shell
# DATABASE CONNECTION STRING
DATABASE_URL="sqlserver://127.0.0.1:1433;database=pins_bo_appeals;user=sa;password=<YourStrong@Passw0rd>;trustServerCertificate=true"

# NODE
NODE_ENV=development
PORT=3000

# USED WHEN CALLED BY AZURE FUNCTIONS
BO_BLOB_CONTAINER=document-service-uploads
BO_BLOB_STORAGE_ACCOUNT=https://127.0.0.1:10000/

# ADVANCED SETUP WHEN USING the BLOB EMULATOR
AZURE_BLOB_EMULATOR_SAS_HOST=(Use the value found in the web/.env)
AZURE_BLOB_USE_EMULATOR=true
NODE_TLS_REJECT_UNAUTHORIZED=0

# HORIZON SETTINGS
MOCK_HORIZON=true
SRV_HORIZON_URL=http://localhost:4000

# NOTIFY
TEST_MAILBOX=(received)
GOV_NOTIFY_API_KEY=(received)
```

## Adding a document folder to appeal, appellant case, or LPA questionnaire data

1. Add property for new folder to `appeals/api/src/server/endpoints/appeals.d.ts`:
   - `SingleAppealDetailsResponse` if folder belongs in the appeal data
   - `SingleAppellantCaseResponse` if folder belongs in the appellant case data
   - `SingleLPAQuestionnaireResponse` if folder belongs in the LPAQ data
2. In `packages/appeals/constants/documents.js`, import the folder's DOCTYPE from APPEAL_DOCUMENT_TYPE in the PINS data model enums file (https://github.com/Planning-Inspectorate/data-model/blob/main/src/enums.d.ts) and add it to the `FOLDERS` object. If no APPEAL_DOCUMENT_TYPE is present, the folder should not be added, as it will cause issues with integration.
3. In `appeals/api/src/server/endpoints/documents/documents.service.js`, add entry referencing the new constant (added in previous step) to either:
   - `getRootFoldersForAppeal`, if folder belongs in the appeal data
   - `getFoldersForStage`, if folder belongs in the appellant case, LPAQ, or some other place that isn't the appeal itself
4. Create an entry for the folder in the relevant formatter:
   - `formatAppeal` in `appeals/api/src/server/endpoints/appeals/appeals.formatter.js` if folder belongs in the appeal data
   - `formatAppellantCase` in `appeals/api/src/server/endpoints/appellant-cases/appellant-cases.formatter.js` in folder belongs in the appellant case data
   - `formatLpaQuestionnaire` in `appeals/api/src/server/endpoints/lpa-questionnaires/lpa-questionnaires.formatter.js` if folder belongs in the LPAQ data
5. Add the new folder to the relevant part of the `spec` object in `appeals/api/src/server/swagger.js`:
   - `SingleAppealResponse` if folder belongs in the appeal data
   - `SingleAppellantCaseResponse` if folder belongs in the appellant case data
   - `SingleLPAQuestionnaireResponse` if folder belongs in the LPAQ data
6. Run `gen-api-spec` script, which should update `appeals/api/src/server/openapi-types.ts`
7. Hit GET endpoint in swagger to check folder is being returned in the relevant data structure (eg. `GET appeals/{appealId}` if folder belongs in the appeal data)
