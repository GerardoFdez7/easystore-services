FROM node:23-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS builder
WORKDIR /app
COPY tsconfig*.json ./
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

FROM node:23-alpine AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM prod-deps AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist

RUN addgroup -S app && adduser -S app -G app
USER app

EXPOSE 3000
CMD ["node", "dist/main.js"]
