# Stage 1: Build the Vite app
FROM node:20 AS builder

WORKDIR /app
COPY . .

# Use build argument to specify environment mode
ARG MODE=production
ENV MODE=$MODE

# Install dependencies
RUN rm -rf node_modules package-lock.json
RUN npm install --ignore-platform
RUN npm install @rollup/rollup-linux-x64-gnu

# Build with specified mode
RUN npm run build -- --mode $MODE

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
