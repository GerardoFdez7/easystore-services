FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./

# Development build stage
FROM base AS development
COPY . .                     
RUN npm install
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Production build stage
FROM base AS production
COPY . .                    
RUN npm install --omit=dev
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
