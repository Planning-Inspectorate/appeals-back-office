# Building, running and operations

## Building the docker image
From the root folder, execute:

```shell
docker build . -f appeals/pdf-service-api/Dockerfile -t pins/pdf-service-api:local
```


## Running a container with the built image
From a new terminal (to view logs), execute:

```shell
docker run -p 3998:3998 pins/pdf-service-api:local
```

Or to install in detached mode

```shell
docker run -p 3998:3998 --name pins_pdfgen -d pins/pdf-service-api:local
```
### when changing anything to do with pdf-service-api: please do the following in root directory of back office
docker build --no-cache -f appeals/pdf-service-api/Dockerfile -t pins/pdf-service-api:local .
docker stop pins_pdfgen && docker rm pins_pdfgen
docker run -p 3998:3998 --name pins_pdfgen -d pins/pdf-service-api:local

## Operations
### Check health
Open in a browser [the health check](http://localhost:3998/health)

### Generate a PDF
From `appeals/pdf-service-api`, run

```shell
curl -X POST -d '{"html" : "<html><title>My page</title><body>This is the content of my page</body></html>"}' -H "Content-type: application/json" http://localhost:3998/api/v1/generate --output appeals/pdf-service-api/generated/generated.pdf
```

The command will generate `appeals/pdf-service-api/generated/generated.pdf`.
