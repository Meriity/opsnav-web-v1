# Stage 1: Build the Vite app
FROM node:20 AS builder

WORKDIR /app

# Copy everything
COPY . .

ARG ENV=production
ENV NODE_ENV=$ENV

# Copy the correct .env file
RUN cp .env.$ENV .env

# Clean previous installs
RUN rm -rf node_modules package-lock.json

# Install dependencies from package.json
RUN npm install

# Add the missing plugin so Vite finds it
RUN npm install --save-dev @vitejs/plugin-react

# Fix for Rollup native module issue
RUN npm install @rollup/rollup-linux-x64-gnu

# Build the Vite app
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built frontend from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Optional: Custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
