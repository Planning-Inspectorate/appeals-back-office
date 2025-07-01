FROM node:22-alpine3.20

RUN apk add --no-cache \
    chromium \
    freetype \
    harfbuzz \
    ttf-freefont \
    nss

WORKDIR /opt

COPY package.json package-lock.json ./

RUN mkdir -p ./appeals/pdf-service-api/
COPY appeals/pdf-service-api/package.json ./appeals/pdf-service-api/

RUN echo "Running npm ci..." && \
    npm ci --omit=dev --ignore-scripts && \
    echo "npm ci completed."


	WORKDIR /opt/appeals/pdf-service-api
COPY appeals/pdf-service-api/src ./src

# *** CRUCIAL PERMISSION FIX FOR SERVER SIDE FIX BO ***
# Ensure the 'public' directory exists for static assets
# Change its owner to the 'node' user's UID and GID (1000)
RUN mkdir -p /opt/appeals/pdf-service-api/src/public/assets && \
    chown -R 1000:1000 /opt/appeals/pdf-service-api/src/public

# Copy assets explicitly
COPY appeals/pdf-service-api/src/assets ./src/assets

ARG GIT_SHA
ENV GIT_SHA=$GIT_SHA

EXPOSE 3000

USER node

CMD ["npm", "start"]
