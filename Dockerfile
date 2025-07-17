# Use the official Node.js Alpine image for a lightweight container
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
# Using npm install instead of npm ci for flexibility
RUN npm install --production

# Copy the rest of the application files
COPY . .

# Create a non-root user to run the application
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Change ownership of the app directory to nodejs user
RUN chown -R nodejs:nodejs /app

# Switch to the nodejs user
USER nodejs

# Expose the port (Coolify will set PORT env variable)
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]