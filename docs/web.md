# Web Front-end

Once configured, the API will run locally over the `http://localhost:8080` endpoint (or a configured HTTPS endpoint).

## Running the front-end

From the web folder

```shell
appeals/web> npm run dev
```

Or from the root folder:

```shell
> npm run web
```

## Environment settings

> [!IMPORTANT]
> Some of the settings to enable communication with EntraID need to be retrieved from the repository owner.

```shell
# The client ID (configured in Azure) used for the web front-end to communicate with EntraID.
AUTH_CLIENT_ID=(retrieved)

# The tenant uuid used by the MSAL authority (which is a url that indicates a
# directory that MSAL can request tokens from).
AUTH_TENANT_ID=(retrieved)

# This secret is provided by the EntraID during app registration.
AUTH_CLIENT_SECRET=(retrieved)

# This default post-login redirect, should be the local web front-end endpoint.
AUTH_REDIRECT_URI=https://localhost:8080/auth/redirect

# A flag to indicate whether integration with MSAL is disabled on this
# environment. This is only used during development. When true, the MSAL client
# configuration data (above) is not required.
 AUTH_DISABLED=false

 # When auth is disabled (see above), you can add a fixed fake user id. If not set, a new one will be randomly created on a new session
 AUTH_DISABLED_USER_ID=c5fe3768-3b40-45db-85ba-ede4deec92b3

## ACTIVE DIRECTORY ###########################################################

# The uuids of the groups within Azure AD that users are assigned to for
# accessing the different domains.

APPEALS_CASE_OFFICER_GROUP_ID=(retrieved)
APPEALS_INSPECTOR_GROUP_ID=(retrieved)
APPEALS_LEGAL_TEAM_GROUP_ID=(retrieved)
APPEALS_CS_TEAM_GROUP_ID=(retrieved)
APPEALS_PADS_GROUP_ID=(retrieved)
APPEALS_READERS_GROUP_ID=(retrieved)

## HTTP #######################################################################

# The api endpoint
API_HOST=http://localhost:3999

# Enable the https protocol for the web server.
HTTPS_ENABLED=true

# The web server port when running under http protocol.
# HTTP_PORT=8080

# The web server port when running under https protocol.
HTTPS_PORT=8080

# The path to the SSL certificate file – required when https is enabled.
SSL_CERT_FILE="certificate.pem"

# The path to the SSL certificate key file – required when https is enabled.
SSL_KEY_FILE="certificate-key.pem"


## LOGGING ####################################################################
# The logging level for the server.log
# Options: trace, debug, info, warn, error, fatal, silent
LOG_LEVEL_FILE=debug

# The logging level for the stdout.
# Options: trace, debug, info, warn, error, fatal, silent
LOG_LEVEL_STDOUT=debug

## SERVICE COMMON  ####################################################################
# Common settings
OS_PLACES_API_KEY=os_places_api_key
SESSION_SECRET=(any)

## BLOB STORAGE (EMULATOR) ############################################################
AZURE_BLOB_STORE_HOST=https://127.0.0.1:10000/devstoreaccount1/
AZURE_BLOB_DEFAULT_CONTAINER=document-service-uploads
AZURE_BLOB_EMULATOR_SAS_HOST=(retrieve from emulator)
AZURE_BLOB_USE_EMULATOR=true
NODE_TLS_REJECT_UNAUTHORIZED=0
APP_HOSTNAME=localhost:8080

## REDIS ###################################################
DISABLE_REDIS=true
REDIS_CONNECTION_STRING="localhost:6379,password=,ssl=false,abortConnect=false"

```
