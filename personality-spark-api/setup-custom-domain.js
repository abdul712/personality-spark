#!/usr/bin/env node

const { execSync } = require('child_process');

// Get account details
const accountId = '79c03e5169d22c2c869d0d3c80932187';
const workerName = 'personality-spark-api';

console.log('Setting up custom domains for personality-spark-api...\n');

// First, let's check if we need to get the zone ID
async function getZoneId() {
  try {
    // Get API token from wrangler config
    const config = execSync('wrangler config list', { encoding: 'utf8' });
    
    // List zones to find personalityspark.com
    console.log('Looking for personalityspark.com zone...');
    const zones = execSync(`curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=personalityspark.com" \
      -H "Authorization: Bearer $(wrangler config get-token)" \
      -H "Content-Type: application/json"`, { encoding: 'utf8' });
    
    const zonesData = JSON.parse(zones);
    if (zonesData.result && zonesData.result.length > 0) {
      return zonesData.result[0].id;
    }
    
    throw new Error('Zone not found');
  } catch (error) {
    console.error('Error getting zone ID:', error.message);
    return null;
  }
}

// Add custom domain via Workers Routes
async function setupCustomDomain() {
  try {
    // Method 1: Try to add via wrangler routes
    console.log('Adding routes for custom domains...\n');
    
    // Add route for apex domain
    console.log('Adding route for personalityspark.com...');
    try {
      execSync(`wrangler route add personalityspark.com/* ${workerName}`, { stdio: 'inherit' });
      console.log('✓ Added route for personalityspark.com');
    } catch (e) {
      console.log('Route might already exist or needs manual configuration');
    }
    
    // Add route for www subdomain
    console.log('\nAdding route for www.personalityspark.com...');
    try {
      execSync(`wrangler route add www.personalityspark.com/* ${workerName}`, { stdio: 'inherit' });
      console.log('✓ Added route for www.personalityspark.com');
    } catch (e) {
      console.log('Route might already exist or needs manual configuration');
    }
    
  } catch (error) {
    console.error('Error setting up routes:', error.message);
  }
}

// Main execution
async function main() {
  console.log('=== Cloudflare Workers Custom Domain Setup ===\n');
  
  // Check if zone exists
  const zoneId = await getZoneId();
  if (!zoneId) {
    console.log('\n⚠️  Could not find zone automatically.');
    console.log('Please ensure personalityspark.com is added to your Cloudflare account.\n');
  }
  
  // Try to set up routes
  await setupCustomDomain();
  
  console.log('\n=== Manual Steps Required ===\n');
  console.log('1. Go to: https://dash.cloudflare.com');
  console.log('2. Navigate to Workers & Pages > personality-spark-api');
  console.log('3. Click on "Settings" tab');
  console.log('4. Find "Custom Domains" section');
  console.log('5. Click "Add Custom Domain"');
  console.log('6. Add: personalityspark.com');
  console.log('7. Add: www.personalityspark.com');
  console.log('\nCloudflare will automatically update DNS records and handle SSL.\n');
  
  console.log('=== Alternative: Update DNS Manually ===\n');
  console.log('1. Go to your domain DNS settings');
  console.log('2. Delete A records pointing to Cloudways');
  console.log('3. The Worker routes will handle the traffic\n');
}

main().catch(console.error);