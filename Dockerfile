FROM node:22-alpine3.20
WORKDIR /src/app

ARG NODE_ENV=test
ARG DATABASE_URL

COPY package*.json ./
COPY packages ./packages
COPY appeals/api appeals/api

RUN npm ci

WORKDIR /src/app/appeals/api
RUN npm run db:migrate
