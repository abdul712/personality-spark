# Coolify Domain 404 Error Troubleshooting Guide

## Steps to Fix Your Coolify Domain Issue

### 1. Verify Application Deployment in Coolify

Log into your Coolify dashboard and check:
- Is your application showing as "Running"?
- Are there any deployment errors in the logs?
- Check the application logs: `Application > Logs`

### 2. Correct Domain Configuration

In Coolify, ensure:

1. **Add Domain to Application**:
   - Go to your application in Coolify
   - Click on "Domains"
   - Add your domain in format: `yourdomain.com,www.yourdomain.com`
   - Save the configuration

2. **Check SSL/HTTPS Settings**:
   - Enable "Force HTTPS" if using SSL
   - Ensure "Generate SSL Certificate" is checked

### 3. DNS Configuration

Verify your DNS points to Coolify server:
```bash
# Check DNS resolution
nslookup yourdomain.com
dig yourdomain.com
```

Your DNS should point to your Coolify server's IP address.

### 4. Application Configuration

Your current setup looks correct, but ensure:

1. **Port Configuration**:
   - Coolify expects port 3000 by default
   - Your nginx is on port 80
   - In Coolify application settings, set:
     - Port: 80
     - Exposed Port: 80

2. **Build Pack**:
   - Set Build Pack to "Dockerfile"
   - Ensure Dockerfile path is correct

### 5. Quick Fix - Update Dockerfile

If still having issues, try this simplified approach:

```dockerfile
FROM nginx:alpine
COPY index.html /usr/share/nginx/html/
COPY test.html /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 6. Coolify-Specific Settings

In your Coolify application settings:

1. **General Tab**:
   - Build Pack: Dockerfile
   - Port: 80

2. **Environment Variables**:
   - Add if needed: `PORT=80`

3. **Health Check**:
   - Path: `/health`
   - Port: 80

### 7. Deployment Commands

After making changes:
1. Click "Redeploy" in Coolify
2. Monitor deployment logs
3. Check application logs after deployment

### 8. Debug URLs

Test these URLs:
- `http://your-coolify-server-ip:port` (direct access)
- `http://yourdomain.com`
- `http://yourdomain.com/test.html`
- `http://yourdomain.com/health`

### Common Issues and Solutions

1. **404 on all pages**:
   - Domain not linked to application
   - Application not running
   - Wrong port configuration

2. **502 Bad Gateway**:
   - Application crashed
   - Wrong internal port

3. **Connection Refused**:
   - Firewall blocking port
   - Wrong exposed port

### Verification Steps

1. In Coolify logs, look for:
   ```
   nginx: [emerg] bind() to 0.0.0.0:80 failed
   ```
   This means port conflict

2. Check container is running:
   - Go to "Terminal" in Coolify
   - Run: `docker ps`

3. Test nginx config:
   - In Terminal: `docker exec <container-id> nginx -t`

### If All Else Fails

1. **Simplify First**:
   - Remove docker-compose.yml
   - Use only Dockerfile
   - Deploy a simple HTML file

2. **Check Coolify Proxy**:
   - Coolify uses Traefik as reverse proxy
   - Ensure no conflicts with your nginx

3. **Alternative Approach**:
   - Use Node.js server instead of nginx
   - Coolify handles Node.js apps better

Need more help? Check:
- Coolify application logs
- Deployment logs
- Container logs