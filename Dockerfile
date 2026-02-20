# RGPD_PRO Frontend - Next.js (standalone)
FROM node:20-alpine AS base

# Dépendances (lockfile optionnel : si désynchronisé, pnpm install sans frozen)
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN corepack enable pnpm && (pnpm install --frozen-lockfile || pnpm install)

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Seule variable publique nécessaire au build (embarquée côté client)
ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
# Variables runtime injectées par Railway (ne pas mettre en dur ici) :
#   DATABASE_URL          — PostgreSQL Railway
#   NEXTAUTH_SECRET       — secret JWT NextAuth
#   NEXTAUTH_URL          — URL publique du frontend (ex: https://mon-app.railway.app)
#   BACKEND_JWT_SECRET    — optionnel, partagé avec le backend pour vérifier les tokens
#   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME — Cloudflare R2
CMD ["node", "server.js"]
