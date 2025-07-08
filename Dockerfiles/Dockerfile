# Use Node.js 18 Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy only necessary files (exclude local dev files and .env)
COPY . .

# If using a .env file, copy it here (optional)
COPY .env .env

# Expose the app port used in Cloud Run
EXPOSE 3000

# Run the application
CMD ["npm", "run", "start"]
