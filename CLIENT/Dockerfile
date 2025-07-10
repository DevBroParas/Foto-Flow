# -------- Stage 1: Build the frontend --------
FROM node:18 AS builder

WORKDIR /app

# Copy only package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the code
COPY . .

# Build the frontend (output goes to /app/dist)
RUN npm run build


# -------- Stage 2: Serve with Nginx --------
FROM nginx:stable-alpine

# Clean default nginx page
RUN rm -rf /usr/share/nginx/html/*

# Copy build files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config (optional, for SPA routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]
