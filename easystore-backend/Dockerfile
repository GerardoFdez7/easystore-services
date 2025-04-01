FROM node:18-alpine AS base

WORKDIR /app

COPY package*.json ./

# Development build stage
FROM base AS development
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Production build stage
FROM base AS production
RUN npm install --omit=dev
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
