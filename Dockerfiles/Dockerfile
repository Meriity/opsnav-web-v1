# Stage 1: Build the Vite app
FROM node:20 AS builder

WORKDIR /app

# Copy everything
COPY . .

# Accept ENV argument for build mode (defaults to production)
ARG ENV=production
ENV NODE_ENV=$ENV

# Copy the correct .env file based on ENV argument
RUN cp .env.$ENV .env

# Clean previous installs
RUN rm -rf node_modules package-lock.json

# Install dependencies
RUN npm install

# Fix for Rollup native module issue
RUN npm install @rollup/rollup-linux-x64-gnu

# Build the Vite app
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built frontend from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration (if you have one)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
