# Building, running and operations

## Environment & Configuration

Ensure `.env` exists in `appeals/pdf-service-api` (copied from `.env.example`):

```shell
cp appeals/pdf-service-api/.env.example appeals/pdf-service-api/.env
```

Key environment variables and defaults:

| Variable | Default | Description |
| --- | --- | --- |
| `SERVER_PORT` | `3010` | Port the API runs on (mapped to `3010` in `docker-compose.dev.yaml`). |
| `LOGGER_LEVEL` | `info` | Pino log verbosity level (`info`, `debug`, `error`). |
| `CREATE_HTML_FILE` | `false` | When `true`, dumps generated HTML to a temporary folder for debugging. |

## Running for Local Development (Recommended)

From the root of the repository, run:

```shell
npm run pdf-service:dev
```

This runs `docker compose -f appeals/pdf-service-api/docker-compose.dev.yaml up --build`. It starts the PDF service on port `3010` with live reloading (`node --watch`) enabled via volume mounts (`./appeals/pdf-service-api/src` and `./packages`). Code changes take effect automatically without needing manual rebuilds.

### Running natively (without Docker)

If you prefer running the Node process directly on your host machine:

```shell
npm run pdf-service
```

*(Note: Requires dependencies like Chromium/Puppeteer set up locally on your machine).*

## Docker Compose manual commands

From the root directory:

```shell
# Start container
docker compose -f appeals/pdf-service-api/docker-compose.dev.yaml up -d

# Rebuild container image
docker compose -f appeals/pdf-service-api/docker-compose.dev.yaml up --build -d

# View logs
docker compose -f appeals/pdf-service-api/docker-compose.dev.yaml logs -f
```

## Operations

### Check health
Open in a browser [http://localhost:3010/health](http://localhost:3010/health) or run:

```shell
curl http://localhost:3010/health
```

### Generate a PDF

From `appeals/pdf-service-api`:

```shell
curl -X POST -d '{"html" : "<html><title>My page</title><body>This is the content of my page</body></html>"}' -H "Content-type: application/json" http://localhost:3010/api/v1/generate --output generated/generated.pdf
```

The command will generate `appeals/pdf-service-api/generated/generated.pdf`.
