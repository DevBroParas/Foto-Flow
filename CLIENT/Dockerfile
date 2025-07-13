# -------- Stage 1: Build the frontend --------
FROM node:18 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# -------- Stage 2: Just expose static files (don't run NGINX) --------
FROM alpine:3.18

WORKDIR /app
COPY --from=builder /app/dist /app

# You don’t expose or CMD anything — main NGINX will handle it
