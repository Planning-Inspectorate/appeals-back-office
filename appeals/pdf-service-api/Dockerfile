FROM node:22-alpine3.20

# add chromium
RUN apk add --no-cache \
    chromium \
    freetype \
    harfbuzz \
    ttf-freefont
    # perhaps needed if we do web requests?
    # ca-certificates \
    # nss \

WORKDIR /opt

# Copy deps
COPY appeals/pdf-service-api/package*.json ./packages/pdf-service-api/
COPY package*.json ./

# Install
RUN npm ci --workspaces --if-present --omit=dev

# Copy app
WORKDIR /opt/packages/pdf-service-api
COPY appeals/pdf-service-api/src ./src

ARG GIT_SHA
ENV GIT_SHA=$GIT_SHA

EXPOSE 3000

USER node

CMD ["npm", "start"]
