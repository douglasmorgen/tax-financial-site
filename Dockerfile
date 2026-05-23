# syntax=docker/dockerfile:1.7
FROM node:22-bookworm-slim AS base

ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

FROM base AS deps

COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci --include=optional

FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN --mount=type=secret,id=NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY \
    --mount=type=secret,id=CLERK_PUBLISHABLE_KEY \
    --mount=type=secret,id=NEXT_PUBLIC_RECAPTCHA_SITE_KEY \
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="$(cat /run/secrets/NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)" \
    CLERK_PUBLISHABLE_KEY="$(cat /run/secrets/CLERK_PUBLISHABLE_KEY)" \
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY="$(cat /run/secrets/NEXT_PUBLIC_RECAPTCHA_SITE_KEY)" \
    npm run build

FROM base AS runner

ENV NODE_ENV=production
ENV PORT=3000

COPY package.json package-lock.json ./
COPY --from=deps /app/node_modules ./node_modules
RUN npm prune --omit=dev && npm cache clean --force

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["npm", "run", "start"]
