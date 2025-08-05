# Stage 1: Build the Vite app
FROM node:18 AS builder

WORKDIR /app
COPY . .

# Accept ENV_TYPE to choose env file
ARG ENV_TYPE=development
RUN cp .env.${ENV_TYPE} .env

# Optional: Disable native rollup issues (just in case)
ENV ROLLUP_NO_NATIVE=true

RUN npm install
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
