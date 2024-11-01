# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM denoland/deno:alpine AS base
ARG NODE_ENV=production
ARG DATABASE_URL
ARG JWT_SECRET
ARG ALLOWED_EMAILS
ARG ORIGIN
ENV ORIGIN=$ORIGIN

WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json deno.lock vite.config.ts svelte.config.js /temp/dev/
RUN cd /temp/dev && deno install --frozen-lockfile

# install with --production (exclude devDependencies)
# RUN mkdir -p /temp/prod
# COPY package.json deno.lock vite.config.ts svelte.config.js /temp/prod/
# RUN cd /temp/prod && deno install --frozen-lockfile --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# [optional] tests & build
ENV NODE_ENV=production
# RUN deno test
RUN deno task build

# copy production dependencies and source code into final image
FROM node:20-alpine AS release
ENV NODE_ENV=production
# COPY --from=install /temp/prod/node_modules node_modules
COPY --from=install /temp/dev/node_modules node_modules
COPY --from=prerelease /usr/src/app/build build
COPY --from=prerelease /usr/src/app/package.json .

# run the app
USER node:node
EXPOSE 3000/tcp
ENTRYPOINT ORIGIN=$ORIGIN node ./build