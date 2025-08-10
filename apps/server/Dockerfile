# # syntax=docker/dockerfile:1

# # Comments are provided throughout this file to help you get started.
# # If you need more help, visit the Dockerfile reference guide at
# # https://docs.docker.com/go/dockerfile-reference/

# # Want to help us make this template better? Share your feedback here: https://forms.gle/ybq9Krt8jtBL3iCk7

# ARG NODE_VERSION=22.9.0
# ARG PNPM_VERSION=9.12.3

# FROM node:${NODE_VERSION}-alpine

# # Use production node environment by default.
# ENV NODE_ENV production

# # Install pnpm.
# RUN --mount=type=cache,target=/root/.npm \
#     npm install -g pnpm@${PNPM_VERSION}

# WORKDIR /usr/src/app

# # Download dependencies as a separate step to take advantage of Docker's caching.
# # Leverage a cache mount to /root/.local/share/pnpm/store to speed up subsequent builds.
# # Leverage a bind mounts to package.json and pnpm-lock.yaml to avoid having to copy them into
# # into this layer.
# RUN --mount=type=bind,source=package.json,target=package.json \
#     --mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml \
#     --mount=type=cache,target=/root/.local/share/pnpm/store \
#     pnpm install --prod --frozen-lockfile

# # Run the application as a non-root user.
# USER node

# # Copy the rest of the source files into the image.
# COPY . .

# # Expose the port that the application listens on.
# EXPOSE 3000

# # Build the application.
# RUN ["pnpm", "build"]

# # Run the application.
# CMD ["pnpm", "start"]

FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /usr/src/app
WORKDIR /usr/src/app

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

FROM base
COPY --from=prod-deps /usr/src/app/node_modules /usr/src/app/node_modules
COPY --from=build /usr/src/app/dist /usr/src/app/dist
EXPOSE 3000
CMD [ "pnpm", "start" ]
