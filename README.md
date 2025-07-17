# Personality Spark

An interactive personality assessment web application that helps users discover their personality type through engaging questions.

## Deployment to Coolify

This application is ready to be deployed to Coolify using Docker.

### Prerequisites

1. A Coolify instance up and running
2. A Git repository containing this code

### Deployment Steps

1. **In Coolify Dashboard:**
   - Create a new application
   - Select "Public Repository" or connect your GitHub/GitLab account
   - Choose "Dockerfile" as the build pack

2. **Configure the Application:**
   - Repository URL: Your Git repository URL
   - Branch: `main` (or your default branch)
   - Port: Leave default (Coolify will auto-detect from Dockerfile)

3. **Environment Variables:**
   - Coolify automatically sets the `PORT` environment variable
   - No additional configuration needed

4. **Deploy:**
   - Click "Deploy" and Coolify will:
     - Clone your repository
     - Build the Docker image using the Dockerfile
     - Deploy the container with proper port mapping

### Local Development

```bash
# Install dependencies
npm install

# Run locally
npm start

# Or run with specific port
PORT=8080 npm start
```

### Features

- Interactive personality quiz interface
- Responsive design for all devices
- Lightweight Express server
- Docker-optimized for production deployment
- Automatic port configuration for Coolify

### Technical Stack

- Frontend: HTML, CSS (Bootstrap), JavaScript
- Backend: Node.js with Express
- Deployment: Docker, optimized for Coolify