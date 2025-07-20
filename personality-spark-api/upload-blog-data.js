#!/usr/bin/env node

/**
 * Script to upload blog data to Cloudflare KV
 * Run this after processing blog articles
 */

const fs = require('fs');
const path = require('path');

// Read blog data
const blogDataPath = path.join(__dirname, 'public', 'blog-data.json');
const blogData = JSON.parse(fs.readFileSync(blogDataPath, 'utf8'));

console.log(`Found ${blogData.posts.length} blog posts`);

// Create a wrangler command to upload to KV
const command = `wrangler kv:key put --namespace-id=c79fa3abb6d949d5aa540373fbb9fe4a "blog-data" '${JSON.stringify(blogData)}'`;

console.log('\nTo upload blog data to Cloudflare KV, run:');
console.log(command);
console.log('\nNote: Make sure you have wrangler authenticated first.');