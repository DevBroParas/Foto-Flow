# Stage 1: Build the TypeScript project
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the Prisma schema and generate the client
COPY prisma ./prisma
RUN npx prisma generate

# Copy the rest of the backend source code
COPY . .

# Build the TypeScript project
RUN npm run build

# Stage 2: Create a smaller runtime image
FROM node:18-alpine

WORKDIR /app

# Copy built files and node_modules from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# If using Prisma at runtime (e.g., migrations), copy prisma client and schema
COPY --from=builder /app/prisma ./prisma

# Copy .env file if used (make sure it's in .dockerignore if sensitive)
COPY .env .env

# Expose the backend port
EXPOSE 8080

# Start the backend server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
