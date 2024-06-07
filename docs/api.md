# API Back-end

Once configured, the API will run locally over the `http://localhost:3000` endpoint.

## API Documentation

The API is documented using an [OpenAPI (previously Swagger) spec](https://swagger.io/specification/v2/). The spec is generated from code comments in the Express route definitions.

To generate up-to-date documentation, run:

```shell
appeals/api> npm run gen-api-spec
```

This will re-generate the `appeals/api/src/server/swagger-output.json` file. This spec is hosted by the api, and can be found at `http://localhost:3000/api-docs/`.
