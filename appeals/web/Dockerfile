# Stage 1/2 - Builder
FROM node:20-alpine AS pins-web-builder

RUN apk update

# TODO: Remove this once these get fixed:
# - https://github.com/vercel/turborepo/issues/1097
# - https://github.com/vercel/turborepo/issues/1103
RUN apk add git

WORKDIR /usr/src/app

COPY package.json .
COPY package-lock.json .
COPY turbo.json .

COPY packages ./packages
COPY appeals/web ./appeals/web

RUN npm ci --loglevel notice

ENV NODE_ENV=production
ENV APP_RELEASE=true

RUN npm run build:release

# --------------------------------

# Stage 2/2 - App run
FROM node:20-alpine

WORKDIR /usr/src/app

COPY --from=pins-web-builder /usr/src/app ./

WORKDIR /usr/src/app/appeals/web

ENV NODE_ENV=production
ENV APP_RELEASE=true

# TODO: Perhaps use `RUN npm ci --production` to shrink the size of the container

EXPOSE 8080

ENTRYPOINT npm run start
