FROM node:23-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

FROM deps AS builder
WORKDIR /app
COPY tsconfig*.json nest-cli.json ./
COPY src ./src
RUN npm run generate
RUN npm run build

FROM deps AS development
WORKDIR /app
ENV NODE_ENV=development
COPY . .
RUN npm run generate
EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM node:20-alpine AS prod-deps
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force
RUN npm rebuild bcrypt --build-from-source

FROM prod-deps AS production
WORKDIR /app
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=22528"

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

RUN addgroup -S app && adduser -S app -G app
USER app

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

  CMD ["node", "dist/main.js"]
