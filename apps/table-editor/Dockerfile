# Pruner
FROM node:18-alpine AS pruner

RUN apk add --no-cache libc6-compat

# Set working directory
WORKDIR /app

COPY . .

RUN yarn global add turbo
RUN turbo prune --scope=table-editor --docker

# builder
# Add lockfile and package.json's of isolated subworkspace
FROM node:18-alpine AS builder

# The ethereum npm package requires git
RUN apk add --no-cache libc6-compat git build-base python3
RUN npm install -g pnpm@7.26.0

WORKDIR /app

COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY .gitignore .gitignore
COPY .npmrc .npmrc
COPY --from=pruner /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Copy out src.
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/full/ .
RUN pnpm install

COPY turbo.json turbo.json
RUN pnpm run build --filter=table-editor

COPY scripts/trace-file.mjs scripts/trace-file.mjs
RUN node scripts/trace-file.mjs --file=apps/table-editor/src/server.js --outDir=out/ --rootDir=apps/table-editor/

# Runner
FROM node:18-alpine as runner

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY --from=builder /app/out .
COPY --from=builder /app/apps/table-editor/dist ./dist

# Install lmdb — vercel/nft doesn't like this. ..
RUN cd .. \
  && mkdir temp \
  && cd temp \
  && npm install lmdb \
  && cp -r node_modules/* /app/node_modules/ \
  && rm -r node_modules/* \
  && cd /app 

# Ensure tsx is installed already
RUN npx --yes --quiet tsx --help

ENV NODE_ENV=production
EXPOSE 4000

CMD ["npx", "--yes", "tsx", "apps/table-editor/src/server.js"]
