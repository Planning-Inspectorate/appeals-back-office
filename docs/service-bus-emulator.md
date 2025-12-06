# Azure Service Bus Emulator Setup

## Overview

The Azure Service Bus emulator enables local development and testing of message-based integrations between the Appeals Back-Office and Front-Office applications without requiring a live Azure subscription.

## Architecture

The Service Bus emulator setup consists of:

1. **servicebus_sql** - SQL Server backend for Service Bus data storage (port 1435)
2. **servicebus_emulator** - Azure Service Bus emulator (AMQP port 5672)
3. **6 Service Bus Topics** configured for Back-Office ↔ Front-Office communication

## Topics and Subscriptions

### Inbound Topics (Front-Office → Back-Office)

| Topic Name                          | Subscription                            | Purpose                                |
| ----------------------------------- | --------------------------------------- | -------------------------------------- |
| `appeal-fo-appellant-submission`    | `appeal-fo-appellant-submission-bo-sub` | New appeal submissions from appellants |
| `appeal-fo-lpa-response-submission` | `back-office-processor`                 | LPA questionnaire responses            |

### Outbound Topics (Back-Office → Front-Office)

| Topic Name        | Subscription            | Purpose                      |
| ----------------- | ----------------------- | ---------------------------- |
| `appeal-has`      | `front-office-listener` | Appeal data broadcasts       |
| `appeal-document` | `front-office-listener` | Document data broadcasts     |
| `service-user`    | `front-office-listener` | Service user data broadcasts |
| `event`           | `front-office-listener` | Event data broadcasts        |

## Starting the Service Bus Emulator

The Service Bus emulator is included in the `all` profile and will start automatically with:

```bash
make serve
```

Or to start just the Service Bus components:

```bash
docker compose --profile servicebus up
```

## Verifying Service Bus is Running

Check that both containers are running:

```bash
docker ps | grep servicebus
```

You should see:

- `servicebus_sql` - Running on port 1435
- `servicebus_emulator` - Running on port 5672

Check the emulator logs:

```bash
docker logs servicebus_emulator
```

Look for messages indicating topics were created successfully.

## Azure Functions Configuration

The Azure Functions in `appeals/functions/casedata-import/` are configured to connect to the Service Bus emulator via the `ServiceBusConnection` setting in `local.settings.json`.

### Running Azure Functions Locally

1. Navigate to the functions directory:

   ```bash
   cd appeals/functions/casedata-import
   ```

2. Install dependencies (if not already done):

   ```bash
   npm install
   ```

3. Start the Azure Functions runtime:
   ```bash
   npm start
   ```

The functions will automatically connect to the Service Bus emulator and listen for messages on the configured topics.

## Connection Strings

### For Docker Containers (API Service)

```
Endpoint=sb://servicebus_emulator;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=SAS_KEY_VALUE;UseDevelopmentEmulator=true;
```

### For Local Development (Azure Functions)

```
Endpoint=sb://localhost:5672;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=SAS_KEY_VALUE;UseDevelopmentEmulator=true;
```

## Testing Message Flow

### 1. Send a Test Message

You can send test messages using the Azure Service Bus SDK or Azure Functions.

### 2. Verify Message Processing

1. Check Azure Functions logs for message processing
2. Check API logs for appeal creation
3. Verify data in the database

## Troubleshooting

### Service Bus Emulator Won't Start

**Check SQL Server is running:**

```bash
docker logs servicebus_sql
```

**Check emulator logs:**

```bash
docker logs servicebus_emulator
```

### Azure Functions Can't Connect

**Verify connection string** in `local.settings.json` uses `localhost:5672`

**Check emulator is listening:**

```bash
docker ps | grep servicebus_emulator
```

### Messages Not Being Processed

**Verify subscription names** match between:

- `servicebus-config.json`
- Azure Functions `src/app.js`

**Check Azure Functions are running:**

```bash
cd appeals/functions/casedata-import
npm start
```

## Limitations

> [!WARNING] > **Data is NOT Persistent**
>
> The Service Bus emulator does not persist messages or entities between container restarts. All data will be lost when the container stops.

> [!NOTE] > **Emulator-Only Features**
>
> Some Azure Service Bus features are not available in the emulator:
>
> - Partitioned entities
> - JMS protocol streaming
> - On-the-fly management operations
> - Azure Portal integration
> - Metrics and alerting

## Configuration Files

- **docker-compose.yml** - Service Bus container definitions
- **servicebus-config.json** - Topics and subscriptions configuration
- **appeals/functions/casedata-import/local.settings.json** - Azure Functions connection settings

## Next Steps

1. Start the Service Bus emulator with `make serve`
2. Start Azure Functions with `cd appeals/functions/casedata-import && npm start`
3. Configure Front-Office to send messages to the emulator
4. Test end-to-end message flow
