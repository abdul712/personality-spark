#!/bin/bash

# Deploy custom domain configuration for Cloudflare Workers

echo "Configuring custom domain for personalityspark.com..."

# First, let's check if the domain is already in Cloudflare
echo "Please ensure you have:"
echo "1. Your domain (personalityspark.com) added to your Cloudflare account"
echo "2. DNS records pointing to Cloudflare nameservers"
echo ""

# The correct way to add custom domains in Wrangler 4.x
echo "To add custom domains, you need to:"
echo "1. Go to Cloudflare Dashboard > Workers & Pages"
echo "2. Select your worker: personality-spark-api"
echo "3. Go to Settings > Triggers"
echo "4. Add custom domain: personalityspark.com"
echo "5. Add custom domain: www.personalityspark.com"
echo ""
echo "Or use the Cloudflare API/Dashboard to set up the routing."

# Alternative: Update DNS records via Cloudflare Dashboard
echo ""
echo "Alternative DNS Setup:"
echo "1. Delete the A record pointing to Cloudways IP"
echo "2. Add CNAME record:"
echo "   - Name: @ (or personalityspark.com)"
echo "   - Target: personality-spark-api.mabdulrahim.workers.dev"
echo "3. Add CNAME record for www:"
echo "   - Name: www"
echo "   - Target: personality-spark-api.mabdulrahim.workers.dev"
echo ""
echo "Note: Using Custom Domains is preferred over CNAME for better performance."