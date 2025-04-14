# Building, running and operations

## Building the docker image
From the root folder, execute:

```shell
docker build . -f appeals/pdf-service-api/Dockerfile -t pins/pdf-service-api:local
```


## Running a container with the built image
From a new terminal (to view logs), execute:

```shell
docker run -p 3001:3000 pins/pdf-service-api:local
```

Or to install in detached mode

```shell
docker run -p 3001:3000 --name pins_pdfgen -d pins/pdf-service-api:local
```


## Operations
### Check health
Open in a browser [the health check](http://localhost:3001/health)

### Generate a PDF
From `appeals/pdf-service-api`, run

```shell
curl -X POST -d '{"html" : "<html><title>My page</title><body>This is the content of my page</body></html>"}' -H "Content-type: application/json" http://localhost:3001/api/v1/generate --output generated/generated.pdf
```

The command will generate `appeals/pdf-service-api/generated/generated.pdf`.