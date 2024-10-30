# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1.1.33 AS base
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
COPY package.json bun.lockb vite.config.ts svelte.config.js /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
# RUN mkdir -p /temp/prod
# COPY package.json bun.lockb vite.config.ts svelte.config.js /temp/prod/
# RUN cd /temp/prod && bun install --frozen-lockfile --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# [optional] tests & build
ENV NODE_ENV=production
# RUN bun test
RUN bun run build

# copy production dependencies and source code into final image
FROM base AS release
ENV NODE_ENV=production
# COPY --from=install /temp/prod/node_modules node_modules
COPY --from=install /temp/dev/node_modules node_modules
COPY --from=prerelease /usr/src/app/build build
COPY --from=prerelease /usr/src/app/package.json .

# run the app
USER bun
EXPOSE 3000/tcp
RUN ORIGIN=$ORIGIN bun run ./build
# ENTRYPOINT [ "bun", "run", "./build" ]