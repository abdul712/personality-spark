# Use official nginx image for better compatibility with Coolify
FROM nginx:alpine

# Copy the HTML file to nginx default location
COPY index.html /usr/share/nginx/html/index.html
COPY test.html /usr/share/nginx/html/test.html

# Create a custom nginx config that listens on port 80
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ =404; \
    } \
    location /health { \
        access_log off; \
        return 200 "healthy\n"; \
        add_header Content-Type text/plain; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Remove the default nginx config
RUN rm -f /etc/nginx/sites-enabled/default

# Expose port 80 (Coolify expects this)
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]