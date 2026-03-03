# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Build frontend
WORKDIR /app/frontend
RUN npm ci && npm run build

# Runtime stage  
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy backend source
COPY Backed ./Backed
COPY prisma ./prisma

# Copy built frontend
COPY --from=builder /app/frontend/dist ./public

# Expose port
EXPOSE 3000

# Seed database and start (production mode)
CMD ["npm", "start"]
