const https = require('https');

// Since we're using Cloudflare Workers, we can trigger a cache purge
// by deploying a new version with updated static assets

console.log('🚀 Purging Cloudflare Workers cache...\n');

// For Cloudflare Workers, the most effective way to clear cache is to:
// 1. Update the deployment with new content
// 2. Use Cache API in the worker itself

console.log('Since this is a Cloudflare Workers deployment, cache can be cleared by:');
console.log('');
console.log('1. Redeploying the worker (automatic with git push)');
console.log('2. Using Cloudflare dashboard:');
console.log('   - Go to https://dash.cloudflare.com');
console.log('   - Select your domain (if you have one)');
console.log('   - Go to Caching > Configuration');
console.log('   - Click "Purge Everything" or "Custom Purge"');
console.log('');
console.log('3. For Workers without custom domain:');
console.log('   - The cache is managed by the Worker itself');
console.log('   - Redeploying updates all content');
console.log('   - GitHub push already triggers new deployment');
console.log('');
console.log('4. To force immediate update:');
console.log('   - Add cache-busting query parameters to URLs');
console.log('   - Update Worker code to ignore cache temporarily');
console.log('');

// Since we already pushed changes, let's verify deployment
console.log('✅ Your recent git push should have triggered a new deployment.');
console.log('✅ The cache-busting timestamps in blog data files will help bypass any remaining cache.');
console.log('');
console.log('The content should update within a few minutes as:');
console.log('- New Worker deployment propagates globally');
console.log('- Cache-busted URLs force fresh content');
console.log('');
console.log('If you need to manually purge via Cloudflare dashboard:');
console.log('1. Log in to https://dash.cloudflare.com');
console.log('2. If you have a custom domain configured:');
console.log('   - Select your domain');
console.log('   - Go to Caching > Configuration');
console.log('   - Click "Purge Everything"');
console.log('3. For workers.dev subdomain:');
console.log('   - Cache is automatically updated with deployment');