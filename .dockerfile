
FROM node:18-alpine AS builder
WORKDIR /app

# Install all dependencies (including dev dependencies needed for TS compilation)
COPY package.json package-lock.json ./
RUN npm ci

# Install frontend deps
COPY web/package.json web/package-lock.json ./web/
RUN npm --prefix web ci

# Copy source code
COPY . .

# Clean previous outputs, build frontend into api/web-dist, then transpile the API
RUN npm run clean && npm run build


FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy compiled API code and frontend static assets
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/api/web-dist ./dist/web-dist

# Copy Prisma schema & migrations so we can run seed at startup
COPY --from=builder /app/api/prisma ./prisma

# Copy package manifests to install runtime deps
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy environment variables file for database connection
COPY api/.env .env

# Expose HTTP port
EXPOSE 4000

# At container start: apply any pending migrations, run Prisma seed to populate the database,
# then launch the Node.js server.
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && node dist/index.js"]
