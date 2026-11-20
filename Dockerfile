# syntax=docker/dockerfile:1
# GigAI Tools website: Next.js builds a static export (out/), nginx serves it.
#
#   docker build -t gigai-tools-web .
#   docker run --rm -p 8080:80 gigai-tools-web
#
# NEXT_PUBLIC_* settings are baked in at build time: pass them as --build-arg.

FROM node:20-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN apk add --no-cache libc6-compat
# scripts/ first: npm's postinstall copies the ffmpeg core out of node_modules.
COPY package.json package-lock.json .npmrc ./
COPY scripts ./scripts
RUN npm ci
COPY . .
ARG NEXT_PUBLIC_SITE_URL=http://localhost:8080
ARG NEXT_PUBLIC_API_URL=http://localhost:8000/api
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

FROM nginx:1.27-alpine
COPY ops/nginx/static-site.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/out /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s CMD wget -q --spider http://localhost/ || exit 1
