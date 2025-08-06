# Stage 1: Build the Vite app
FROM node:20 AS builder

WORKDIR /app
COPY . .

# Clean existing modules and lockfiles to avoid cache issues
RUN rm -rf node_modules package-lock.json

# Fresh install to ensure all deps and optional deps get resolved properly
RUN npm install

# Fix: Manually install missing native dependency
RUN npm install @rollup/rollup-linux-x64-gnu

RUN npm run build

# Stage 2: Serve with Nginx (Alpine is fine here)
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
