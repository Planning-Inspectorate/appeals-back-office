# Creating a self-signed certificate

When developing locally, a self-signed certificate to run the web front-end over HTTPS, and access secure features such as connection to EntraID / Microsoft Graph (which is necessary when working on user permission and assignment features) or file management.

A local self-signed certificate can be created either using OS built-in tools, or using tools such as `mkcert (https://github.com/FiloSottile/mkcert)`. This tool will create a certificate for the ip address(es) or domains passed as input, e.g.: `mkcert localhost 127.0.0.1`.

Once a certificate is created, it can be put in the root of the solution, and referenced when configuring the site over HTTPS.

Make sure the certificate files are named as certificate.pem and certificate-key.pem so they match the docker command when emulating blob storage.

> [!IMPORTANT]
> Ensure the certificate created will validate against both `localhost` and `127.0.0.1`

#### Windows-specific

Run the following command to generate the pem files:

```
&"C:\Program Files\Git\usr\bin\openssl" req -newkey rsa:2048 -x509 -nodes -keyout key.pem -new -out cert.pem -sha256 -days 365 -addext "subjectAltName=IP:127.0.0.1" -subj "/C=CO/ST=ST/L=LO/O=OR/OU=OU/CN=CN"
```

Then run the following command to add the certificate to the `Trusted Root Certification Authorities`:

```
certutil –addstore -enterprise –f "Root" cert.pem
```
