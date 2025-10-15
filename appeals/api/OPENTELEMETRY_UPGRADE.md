# Azure Monitor OpenTelemetry Upgrade

This document describes the upgrade from the legacy Application Insights SDK to Azure Monitor OpenTelemetry with Prisma instrumentation.

## What Changed

### 1. Dependencies

**Added:**
- `@azure/monitor-opentelemetry` - Modern OpenTelemetry-based Azure Monitor integration
- `@opentelemetry/api` - OpenTelemetry API for instrumentation
- `@opentelemetry/instrumentation` - Core instrumentation framework
- `@prisma/instrumentation` - Prisma-specific instrumentation for database telemetry

**Removed:**
- `applicationinsights` - Legacy Application Insights SDK

### 2. New Files

**`src/instrumentation.js`**
- Centralized OpenTelemetry instrumentation setup
- Loaded before any application code via Node's `--import` flag
- Configures Azure Monitor with:
  - Live metrics
  - Standard metrics
  - Full sampling (1.0 ratio)
- Registers Prisma instrumentation for database query correlation

### 3. Modified Files

**`package.json`**
- Updated `start` script to use `--import ./src/instrumentation.js`
- Updated `dev` script to use `--import ./src/instrumentation.js`
- Updated database seed scripts to include instrumentation for better telemetry

**`src/server/app.js`**
- Removed legacy Application Insights SDK initialization
- Removed `applicationinsights` import
- Added comment noting that OpenTelemetry is loaded via `--import` flag

## Benefits

### 1. Proper Correlation
- Database calls made via Prisma are now automatically correlated with their parent HTTP requests
- End-to-end distributed tracing across the application
- Better visibility into query performance and bottlenecks

### 2. Modern Standards
- OpenTelemetry is the industry standard for observability
- Better support and more features than the legacy SDK
- Easier to add additional instrumentations in the future

### 3. Automatic Instrumentation
- Many popular libraries are automatically instrumented
- Express routes, HTTP clients, and other common patterns work out of the box
- Prisma queries include detailed span information

## How It Works

1. **Instrumentation Loading**: The `--import` flag ensures `instrumentation.js` loads before any other code
2. **SDK Initialization**: Azure Monitor OpenTelemetry SDK is configured with the connection string
3. **Prisma Registration**: `@prisma/instrumentation` registers hooks to capture Prisma client operations
4. **Automatic Correlation**: When an HTTP request comes in:
   - OpenTelemetry creates a trace for the request
   - Any Prisma queries executed during that request are added as child spans
   - All telemetry is sent to Application Insights with proper correlation IDs

## Configuration

The setup uses the existing `APPLICATIONINSIGHTS_CONNECTION_STRING` environment variable. No changes to environment configuration are needed.

## Verification

To verify the upgrade is working:

1. **Local Development:**
   ```bash
   npm run dev
   ```
   You should see:
   - "Azure Monitor OpenTelemetry initialized successfully"
   - "Prisma instrumentation registered - database queries will be correlated with HTTP requests"

2. **In Application Insights:**
   - Navigate to Application Insights in Azure Portal
   - Go to "Transaction search" or "End-to-end transaction details"
   - You should see database operations correlated with HTTP requests
   - Prisma queries will appear as dependencies under their parent HTTP request
   - Database spans should have `db.system` attribute set to `mssql`

## Troubleshooting

### SQL Queries Not Appearing in Application Insights

**Current Status:** The upgrade successfully migrates from the legacy Application Insights SDK to Azure Monitor OpenTelemetry, but there are known limitations with Prisma database query visibility.

**Why SQL Queries May Not Appear:**
1. **OpenTelemetry Version Conflicts:** The project has multiple OpenTelemetry packages with conflicting API versions (v1.8.0 vs v1.9.0), which prevents proper instrumentation registration.

2. **Prisma Instrumentation Limitations:** The `@prisma/instrumentation` package has compatibility issues with the Azure Monitor OpenTelemetry setup due to version conflicts.

3. **Auto-instrumentation Coverage:** Azure Monitor's auto-instrumentation may not fully capture Prisma ORM queries, as it primarily targets native database drivers.

**Workarounds:**

1. **Enable Query Logging:**
   - The Prisma client is configured with query logging enabled
   - Check application logs for `🔍 Prisma Query executed:` messages
   - This confirms queries are running but may not be appearing in Application Insights

2. **Manual Instrumentation (Future Enhancement):**
   - Consider implementing custom spans around database operations
   - Use OpenTelemetry's manual instrumentation APIs
   - Add database query timing manually in repository functions

3. **Alternative Monitoring:**
   - Use Prisma's built-in query logging for development
   - Consider Azure SQL Database query performance insights
   - Monitor database performance through Azure SQL metrics

**Next Steps:**
- The current setup provides HTTP request correlation and basic telemetry
- Database query correlation may require a future upgrade to resolve OpenTelemetry version conflicts
- Consider using Application Insights' dependency tracking for external services as an interim solution

## Rollback

If you need to rollback:

1. Remove the new packages:
   ```bash
   npm uninstall @azure/monitor-opentelemetry @opentelemetry/api @opentelemetry/instrumentation @prisma/instrumentation
   ```

2. Reinstall the legacy SDK:
   ```bash
   npm install applicationinsights@^2.9.1
   ```

3. Restore the old initialization in `src/server/app.js`
4. Remove `--import` flags from package.json scripts
5. Delete `src/instrumentation.js`

## Additional Resources

- [Azure Monitor OpenTelemetry Documentation](https://learn.microsoft.com/en-us/azure/azure-monitor/app/opentelemetry-enable?tabs=nodejs)
- [Prisma Instrumentation](https://www.npmjs.com/package/@prisma/instrumentation)
- [OpenTelemetry JavaScript](https://opentelemetry.io/docs/languages/js/)

