# Stage 1/2 - Builder
FROM node:22-alpine AS pins-web-builder

ARG GIT_SHA

WORKDIR /usr/src/app

COPY package.json .
COPY package-lock.json .

COPY packages ./packages
COPY appeals/web ./appeals/web

RUN npm ci --loglevel notice --workspace=@pins/appeals.web

ENV NODE_ENV=production
ENV APP_RELEASE=true
ENV GIT_SHA=$GIT_SHA

RUN npm run build:release --workspace=@pins/appeals.web
# used to shrink the size of the final container:
RUN npm prune --omit=dev --workspace=@pins/appeals.web

# --------------------------------

# Stage 2/2 - App run
FROM node:22-alpine

ARG GIT_SHA

WORKDIR /usr/src/app

COPY --from=pins-web-builder /usr/src/app ./

WORKDIR /usr/src/app/appeals/web

ENV NODE_ENV=production
ENV APP_RELEASE=true
ENV GIT_SHA=$GIT_SHA

EXPOSE 8080

ENTRYPOINT ["npm", "run start"]
