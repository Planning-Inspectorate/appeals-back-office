FROM node:22-alpine

RUN apk add --no-cache \
    chromium \
    freetype \
    harfbuzz \
    ttf-freefont \
    nss

WORKDIR /opt

COPY package.json package-lock.json ./

COPY appeals ./appeals
COPY packages ./packages

RUN echo "Running npm ci for the entire workspace..." && \
    npm ci --omit=dev --ignore-scripts && \
    echo "npm ci completed."

WORKDIR /opt/appeals/pdf-service-api

RUN mkdir -p /opt/appeals/pdf-service-api/src/public/assets && \
    chown -R 1000:1000 /opt/appeals/pdf-service-api/src/public

ARG GIT_SHA
ENV GIT_SHA=$GIT_SHA

EXPOSE 3000

USER node

CMD ["npm", "start"]
