# Horizon

Horizon is the legacy system that will be progressively replaced by the new Appeals Back-Office.

Until a full decommissioning of Horizon, appeals are going to be partitioned across the legacy and new system, depending on parameters such as appeal types and the Local Planning Authorities involved in the appeal. In this hybrid setup, appeals across the two systems could be linked, related or transferred across, requiring a connection to the Horizon web services to query the validity of cases handled in Horizon.

The Horizon API will be mocked for appeals in local development due to connection restrictions. In order to achieve this, some additional settings are required in the api back-end and the web front-end.

In `appeals/api/.env`, please add:

```shell
MOCK_HORIZON=true
SRV_HORIZON_URL=http://localhost:4000
```

Also ensure the api is configured to run in development mode, as this will trigger the mock API:

```
NODE_ENV=development
```
