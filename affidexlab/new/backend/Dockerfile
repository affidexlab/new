FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy source code
COPY src ./src

# Install cron for automated tasks
RUN apk add --no-cache dcron

# Expose port
EXPOSE 3000

# Default command
CMD ["node", "src/server.js"]
