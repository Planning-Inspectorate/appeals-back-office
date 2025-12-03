FROM node:22-alpine3.20
WORKDIR /src/app

COPY package*.json ./
COPY packages ./packages
COPY appeals/api appeals/api
ENV NODE_ENV=test
RUN npm ci

ENV DATABASE_URL=$DATABASE_URL
WORKDIR /src/app/appeals/api
RUN npm run db:migrate
