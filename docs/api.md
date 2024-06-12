# API Back-end

Once configured, the API will run locally over the `http://localhost:3000` endpoint.

## API Documentation

The API is documented using an [OpenAPI (previously Swagger) spec](https://swagger.io/specification/v2/). The spec is generated from code comments in the Express route definitions.

To generate up-to-date documentation, run:

```shell
appeals/api> npm run gen-api-spec
```

This will re-generate the `appeals/api/src/server/swagger-output.json` file. This spec is hosted by the api, and can be found at `http://localhost:3000/api-docs/`.

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

# HORIZON SETTINGS
MOCK_HORIZON=true
SRV_HORIZON_URL=http://localhost:4000

# NOTIFY
TEST_MAILBOX=(received)
GOV_NOTIFY_API_KEY=(received)
```
