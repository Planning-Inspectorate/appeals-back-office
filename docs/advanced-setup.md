# Advanced setup guide

Once the [basic setup](basic-setup.md) is complete, the application will run with the following features disabled:

1. Authentication / authorization is mocked, as there is no access to EntraID
2. User assignment is not possible, due to the above
3. Access to blob storage is disabled, for security reasons, so uploading and downloading files is not possible

This guide explains the additional configuration required on the web front-end to activate the features above.

## Self-signed certificate

A self-signed certificate is a prerequisite, and can be created by following [this guide](cert.md)

## Web front-end over HTTPS

To enable the features above, it is necessary for the front-end to run over [HTTPS](https.md), so it can securely communicate with EntraID.

## EntraID client ID, secret and groups

The front-end, which communicates with EntraID, requires [additional web environment settings](web.md).  
The back-end also requires [additional api environment settings](api.md).  
Some of these settings cannot be publicly disclosed, and need to be retrieved through the repository owner.

## Files stored in a local emulator

Direct communication with a shared Azure blob storage is not possible, for security reasons. However it is possible to run a [blob storage emulator](blob-emulator.md) locally, to enable file upload and download functionality.

## Docker compose

To use docker compose there are some differences to be aware of as docker compose communicates internally with the service name not localhost

- Create + trust a cert
- ensure pem files are in the root of web
- update env vars as per above
- `make initial-setup`
- create container, set cors, trust cert in azure storage explorer
- generate sas url
- - In web .env use localhost
- - In api .env use pins_azurite
- stop containers
- `make serve`
