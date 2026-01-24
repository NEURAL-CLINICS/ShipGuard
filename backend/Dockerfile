FROM node:22-alpine AS builder

WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/package.json

RUN pnpm install --frozen-lockfile

COPY backend ./backend
RUN pnpm --filter @shipguard/backend build

FROM node:22-alpine

WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/package.json

RUN pnpm install --prod --frozen-lockfile --filter @shipguard/backend...

COPY --from=builder /app/backend/dist ./backend/dist

ENV NODE_ENV=production
CMD ["node", "backend/dist/index.js"]
