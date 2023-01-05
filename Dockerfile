FROM node:18 as builder
WORKDIR /app

RUN corepack enable pnpm

COPY pnpm-lock.yaml ./
RUN pnpm fetch

COPY package.json ./
RUN pnpm install -r --offline

COPY ./ ./
RUN pnpm build

RUN pnpm prune --prod

FROM node:18-alpine
WORKDIR /app

COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/server.js ./src/server.js

ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "src/server.js"]