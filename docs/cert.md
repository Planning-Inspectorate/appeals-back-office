# Creating a self-signed certificate

When developing locally, a self-signed certificate to run the web front-end over HTTPS, and access secure features such as connection to EntraID / Microsoft Graph (which is necessary when working on user permission and assignment features) or file management.

A local self-signed certificate can be created either using OS built-in tools, or using tools such as `mkcert (https://github.com/FiloSottile/mkcert)`.
The common pattern would be to, independently from the operating system, to:

1. create the certificate
2. trust the certificate on the local machine

Once a certificate is created, it can be put in the root of the solution, and referenced when configuring the site over HTTPS.

Make sure the certificate files are named as certificate.pem and certificate-key.pem so they match the docker command when emulating blob storage. The location of the stored certificates is also important when referencing from the web application and blob storage.

> [!IMPORTANT]
> Ensure the certificate created will validate against both `localhost` and `127.0.0.1`

#### Windows-specific

Run the following command to generate the pem files:

```shell
&"C:\Program Files\Git\usr\bin\openssl" req -newkey rsa:2048 -x509 -nodes -keyout certificate-key.pem -new -out certificate.pem -sha256 -days 365 -addext "subjectAltName=IP:127.0.0.1" -subj "/C=CO/ST=ST/L=LO/O=OR/OU=OU/CN=CN"
```

Then run the following command to add the certificate to the `Trusted Root Certification Authorities`:

```shell
certutil –addstore -enterprise –f "Root" certificate.pem
```

#### MacOS-specific

Run the following command to generate the pem files:

```shell
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout certificate-key.pem -out certificate.pem -subj "/C=UK/ST=./L=./O=./CN=localhost" \
-addext "subjectAltName=DNS:localhost,IP:127.0.0.1" \
-addext "keyUsage=digitalSignature,keyEncipherment" \
-addext "extendedKeyUsage=serverAuth,clientAuth"
```

Then run the following command to add the certificate to the `Trusted Root Certification Authorities`:

```shell
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ~/certificate.pem
```
