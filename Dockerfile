# Production image: Fastify API + Socket.IO + Vite SPA (static files in apps/backend/public).
# Cloud Run: set env vars from apps/backend/.env.example (MONGO_URI, secrets, Google, OAuth URLs).

FROM node:22.14-bookworm-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/
COPY apps/frontend/package.json apps/frontend/
COPY packages/shared/package.json packages/shared/

RUN npm ci --ignore-scripts

COPY . .

RUN npm rebuild bcrypt --workspace=@team-link/backend

ENV NODE_ENV=production \
    VITE_APP_NODE_ENV=production \
    VITE_API_PATH=/api/v1

RUN npm run build:shared \
  && npm run build -w apps/frontend \
  && rm -rf apps/backend/public \
  && mkdir -p apps/backend/public \
  && cp -r apps/frontend/build/. apps/backend/public/ \
  && npm run build -w apps/backend

RUN npm prune --omit=dev

FROM node:22.14-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production \
    APP_HOST=0.0.0.0 \
    APP_PORT=8080

COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/apps/backend/package.json ./apps/backend/
COPY --from=builder /app/apps/frontend/package.json ./apps/frontend/
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=builder /app/packages/shared/build ./packages/shared/build
COPY --from=builder /app/apps/backend/build ./apps/backend/build
COPY --from=builder /app/apps/backend/public ./apps/backend/public

EXPOSE 8080

WORKDIR /app/apps/backend

CMD ["node", "build/index.js"]
