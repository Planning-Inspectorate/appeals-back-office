FROM node:22-alpine3.20

RUN apk add --no-cache \
    chromium \
    freetype \
    harfbuzz \
    ttf-freefont \
    nss # Often needed by Chromium

WORKDIR /opt

COPY package.json package-lock.json ./

RUN mkdir -p ./appeals/pdf-service-api/
COPY appeals/pdf-service-api/package.json ./appeals/pdf-service-api/

RUN echo "Running npm ci..." && \
    npm ci --omit=dev --ignore-scripts && \
    echo "npm ci completed."


WORKDIR /opt/appeals/pdf-service-api
COPY appeals/pdf-service-api/src ./src
COPY appeals/pdf-service-api/src/assets ./src/assets

ARG GIT_SHA
ENV GIT_SHA=$GIT_SHA

EXPOSE 3000

USER node

CMD ["npm", "start"]
