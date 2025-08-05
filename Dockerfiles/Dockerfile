# Stage 1: Build the Vite app
FROM node:20 AS builder

WORKDIR /app
COPY . .

# Accept ENV TYPE ARG
ARG ENV_TYPE=development

# Use corresponding .env file
RUN cp .env.${ENV_TYPE} .env

RUN npm install
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
