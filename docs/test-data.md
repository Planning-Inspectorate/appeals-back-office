# Test data generation

The API provides an endpoint to generate realistic test appeals with documents, representations and attachments. This was originally written to support the Operational Data Warehouse (ODW) by providing a high volume of realistic appeal data for testing data pipelines and reporting. It is also useful for load testing and populating test environments with data.

## Endpoint

```
GET /appeals/generate-appeals
```

## Query parameters

| Parameter  | Type   | Default | Description                                           |
| ---------- | ------ | ------- | ----------------------------------------------------- |
| `type`     | string | `has`   | Type of appeal to generate (`has` or `s78`)           |
| `count`    | number | `1`     | Number of appeals to generate                         |
| `docCount` | number | `25`    | Number of additional documents to generate per appeal |

## Example usage

Generate 5 HAS appeals with 10 additional documents each:

```
GET /appeals/generate-appeals?type=has&count=5&docCount=10
```

Generate 100 S78 appeals with default document counts:

```
GET /appeals/generate-appeals?type=s78&count=100
```

## What gets created

Each generated appeal includes:

- **Appeal record** with randomised appellant case data, statuses, address and LPA questionnaire (HAS only)
- **Folder structure** matching the full set of 80 document folders used in production
- **Case documents** in the appellant case folders:
  - Application form (`originalApplicationForm`)
  - Decision letter (`applicationDecisionLetter`)
  - Plans and drawings (`plansDrawings`)
  - Additional documents (`appellantCaseCorrespondence`) - quantity controlled by `docCount`
- **Representation** with attachments - quantity controlled by `docCount`

All generated documents are marked as virus-scanned, so they appear as safe in the UI rather than showing a "Virus scanning" status.

Appeals are created in batches of 10 with a 1-second pause between batches to avoid overwhelming the database.

## Swagger

The endpoint is documented in the OpenAPI spec. To regenerate after changes:

```shell
appeals/api> npm run gen-api-spec
```

## Files

- `appeals/api/src/server/endpoints/test-data/test-data.routes.js` - route definition and swagger comments
- `appeals/api/src/server/endpoints/test-data/test-data.controller.js` - request handling and parameter parsing
- `appeals/api/src/server/endpoints/test-data/test-data.service.js` - appeal and document generation logic
- `appeals/api/src/server/endpoints/test-data/test-data.repository.js` - database operations
