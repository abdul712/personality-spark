# Simple Node.js static server
FROM node:20-alpine

WORKDIR /app

# Copy all files
COPY . .

# Install dependencies
RUN npm install --production

# Expose port - Coolify will handle the actual port binding
EXPOSE 3000

# Run as node user (already exists in node:alpine)
USER node

# Start the server
CMD ["node", "server.js"]