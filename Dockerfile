FROM node:22-alpine AS base

# Install dependancies only when needed
FROM base AS deps
WORKDIR /app

# Install dependancies
COPY package*.json ./ 
RUN npm install -g pnpm
RUN npm install

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy dependancies
COPY --from=deps /app/node_modules ./node_modules

# Copy app
COPY . .
RUN npx prisma generate
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma schema and migrations
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
# Copy package.json and node_modules for Prisma CLI
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

USER nextjs

# Expose port
EXPOSE 3000

ENV PORT=3000

# Start app
ENV HOSTNAME=0.0.0.0
CMD ["sh", "-c", "npm run migrate && npm run start"]