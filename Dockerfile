# Builder stage: install dependencies and create production build
FROM oven/bun:1.1 AS builder
WORKDIR /app

# Copy dependency manifests first for better caching
COPY bun.lock bunfig.toml package.json ./

# Copy source
COPY . .

# Install dependencies and build
RUN bun install --frozen-lockfile
RUN bun run build

# Runtime stage: lightweight Node image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy only what we need to run the server
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/config ./config
COPY --from=builder /app/static ./static

# Remove dev dependencies to shrink the image
RUN npm prune --omit=dev

EXPOSE 3000

# Start the SvelteKit adapter-node server
CMD ["node", "build/index.js"]
