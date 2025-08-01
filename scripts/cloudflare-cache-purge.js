const https = require('https');

// Cloudflare API configuration
// You need to get these values from your Cloudflare dashboard:
// 1. Zone ID: Go to your domain in Cloudflare dashboard, it's on the right sidebar
// 2. API Token: Create one at https://dash.cloudflare.com/profile/api-tokens
//    - Use "Create Custom Token"
//    - Zone:Cache Purge:Purge permission for your zone

const ZONE_ID = process.env.CLOUDFLARE_ZONE_ID || 'YOUR_ZONE_ID_HERE';
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || 'YOUR_API_TOKEN_HERE';

// Check if credentials are set
if (ZONE_ID === 'YOUR_ZONE_ID_HERE' || API_TOKEN === 'YOUR_API_TOKEN_HERE') {
  console.error('Error: Please set your Cloudflare Zone ID and API Token');
  console.error('');
  console.error('Option 1: Set environment variables:');
  console.error('  export CLOUDFLARE_ZONE_ID="your-zone-id"');
  console.error('  export CLOUDFLARE_API_TOKEN="your-api-token"');
  console.error('');
  console.error('Option 2: Edit this script and replace the placeholder values');
  console.error('');
  console.error('To find your Zone ID:');
  console.error('1. Log in to Cloudflare dashboard');
  console.error('2. Select your domain');
  console.error('3. Zone ID is shown on the right sidebar');
  console.error('');
  console.error('To create an API Token:');
  console.error('1. Go to https://dash.cloudflare.com/profile/api-tokens');
  console.error('2. Click "Create Token"');
  console.error('3. Use "Custom token" template');
  console.error('4. Add permission: Zone > Cache Purge > Purge');
  console.error('5. Select your specific zone');
  process.exit(1);
}

// Function to purge cache
function purgeCache(purgeType = 'all') {
  const data = JSON.stringify({
    purge_everything: purgeType === 'all'
  });

  const options = {
    hostname: 'api.cloudflare.com',
    path: `/client/v4/zones/${ZONE_ID}/purge_cache`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Length': data.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          resolve(response);
        } catch (error) {
          reject(new Error(`Failed to parse response: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Function to purge specific URLs
function purgeUrls(urls) {
  const data = JSON.stringify({
    files: urls
  });

  const options = {
    hostname: 'api.cloudflare.com',
    path: `/client/v4/zones/${ZONE_ID}/purge_cache`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Length': data.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          resolve(response);
        } catch (error) {
          reject(new Error(`Failed to parse response: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting Cloudflare cache purge...');
    console.log(`Zone ID: ${ZONE_ID}`);
    console.log('');

    // Get command line argument
    const args = process.argv.slice(2);
    const command = args[0];

    if (command === 'urls' && args.length > 1) {
      // Purge specific URLs
      const urls = args.slice(1);
      console.log(`Purging ${urls.length} specific URLs...`);
      urls.forEach(url => console.log(`  - ${url}`));
      
      const response = await purgeUrls(urls);
      
      if (response.success) {
        console.log('✅ Successfully purged specified URLs!');
      } else {
        console.error('❌ Failed to purge URLs:', response.errors);
      }
    } else {
      // Purge everything
      console.log('Purging entire cache...');
      const response = await purgeCache('all');
      
      if (response.success) {
        console.log('✅ Successfully purged entire cache!');
        console.log('');
        console.log('Note: It may take a few minutes for the cache to be fully cleared globally.');
      } else {
        console.error('❌ Failed to purge cache:', response.errors);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Usage instructions
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Cloudflare Cache Purge Script');
  console.log('');
  console.log('Usage:');
  console.log('  node cloudflare-cache-purge.js              # Purge entire cache');
  console.log('  node cloudflare-cache-purge.js urls [urls]  # Purge specific URLs');
  console.log('');
  console.log('Examples:');
  console.log('  node cloudflare-cache-purge.js');
  console.log('  node cloudflare-cache-purge.js urls https://example.com/page1 https://example.com/page2');
  console.log('');
  console.log('Environment variables:');
  console.log('  CLOUDFLARE_ZONE_ID     Your Cloudflare Zone ID');
  console.log('  CLOUDFLARE_API_TOKEN   Your Cloudflare API Token');
  process.exit(0);
}

// Run the script
main();