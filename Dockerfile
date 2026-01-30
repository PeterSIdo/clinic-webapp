FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with engine-strict disabled
RUN npm ci --engine-strict=false --prefer-offline --no-audit

# Copy application files
COPY . .

# Build the web app
RUN npm run build:web

# Expose port
EXPOSE 8080

# Start the server
CMD ["node", "web-server.js"]
