FROM node:22-alpine3.20
WORKDIR /src/app
ARG GIT_SHA
COPY package*.json ./

COPY packages ./packages

COPY appeals/api appeals/api
ENV NODE_ENV=production
RUN npm ci

# relative to cwd
ENV SWAGGER_JSON_DIR=./src/server/openapi.json
ENV DATABASE_URL=$DATABASE_URL
ENV GIT_SHA=$GIT_SHA

WORKDIR /src/app/appeals/api
RUN npm run prisma-generate

EXPOSE 3000

ENTRYPOINT npm run start
