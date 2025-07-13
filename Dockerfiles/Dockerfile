# Stage 1: Build the Vite app
FROM node:18 AS builder
WORKDIR /app
COPY . .

# Install dependencies and build the app
RUN npm install
RUN npm run build

# Stage 2: Serve with Nginx (Alpine is fine here as it's just serving static files)
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config to handle SPA routes
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
