# HTTPS

In order to run the web front-end over HTTPS (this is required to enable secure features), ensure you have created a [self-signed certificate](cert.md).

You can then update the web front-end environment settings in `appeals/web/.env` to add the following settings:

```shell
# Enable the https protocol for the web server.
HTTPS_ENABLED=true

# The web server port when running under http protocol.
# HTTP_PORT=8080

# The web server port when running under https protocol.
HTTPS_PORT=8080

# The path to the SSL certificate file – required when https is enabled.
SSL_CERT_FILE="../../certificate.pem"

# The path to the SSL certificate key file – required when https is enabled.
SSL_KEY_FILE="../../certificate-key.pem"
```

Once the settings are saved, the web front-end will be available on `https://localhost:8080`
