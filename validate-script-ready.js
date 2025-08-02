#!/usr/bin/env node

// Validation script to check if single-article-update.js is ready to run
const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Single Article Update Script Readiness\n');

// Check 1: Verify script exists
const scriptPath = './scripts/single-article-update.js';
if (!fs.existsSync(scriptPath)) {
  console.log('❌ Script not found:', scriptPath);
  process.exit(1);
}
console.log('✅ Script found:', scriptPath);

// Check 2: Verify JSON files exist
const jsonFiles = [
  'backend/data/blog-articles.json',
  'apps/web/react-app/public/blog-data.json',
  'apps/web/react-app/public/blog-data-1.json',
  'apps/web/react-app/public/blog-data-2.json',
  'apps/web/react-app/public/blog-data-3.json',
  'apps/web/react-app/public/blog-data-4.json',
  'apps/web/react-app/public/blog-data-5.json',
  'apps/web/react-app/public/blog-data-6.json',
  'personality-spark-api/public/blog-data.json',
  'personality-spark-api/public/blog-data-1.json',
  'personality-spark-api/public/blog-data-2.json',
  'personality-spark-api/public/blog-data-3.json',
  'personality-spark-api/public/blog-data-4.json',
  'personality-spark-api/public/blog-data-5.json',
  'personality-spark-api/public/blog-data-6.json'
];

let existingFiles = 0;
let missingFiles = 0;

console.log('\n📂 Checking JSON files:');
jsonFiles.forEach((file, index) => {
  const fullPath = path.resolve(file);
  const exists = fs.existsSync(fullPath);
  console.log(`${String(index + 1).padStart(2)}. ${file.padEnd(50)} ${exists ? '✅' : '❌'}`);
  if (exists) existingFiles++;
  else missingFiles++;
});

console.log(`\n📊 File Status: ${existingFiles} found, ${missingFiles} missing`);

// Check 3: Search for target article
const targetArticle = 'signs-your-twin-flame-misses-you';
console.log(`\n🎯 Searching for article: "${targetArticle}"`);

let articleFound = false;
for (const file of jsonFiles) {
  const fullPath = path.resolve(file);
  if (fs.existsSync(fullPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      let articles = [];
      
      if (Array.isArray(data)) {
        articles = data;
      } else if (data.articles && Array.isArray(data.articles)) {
        articles = data.articles;
      }
      
      const found = articles.find(a => a.id === targetArticle || a.slug === targetArticle);
      if (found) {
        console.log(`✅ Found in: ${file}`);
        console.log(`   Title: "${found.title}"`);
        console.log(`   Current content length: ${found.content.length} chars`);
        articleFound = true;
        break;
      }
    } catch (error) {
      console.log(`⚠️  Error reading ${file}: ${error.message}`);
    }
  }
}

if (!articleFound) {
  console.log('❌ Target article not found in any JSON file');
}

// Check 4: Verify Node.js modules
console.log('\n📦 Checking required modules:');
const requiredModules = ['fs', 'path'];
requiredModules.forEach(module => {
  try {
    require(module);
    console.log(`✅ ${module} available`);
  } catch (error) {
    console.log(`❌ ${module} not available`);
  }
});

// Summary
console.log('\n🎯 READINESS ASSESSMENT:');
console.log(`✅ Script exists: ${fs.existsSync(scriptPath) ? 'YES' : 'NO'}`);
console.log(`✅ JSON files available: ${existingFiles}/${jsonFiles.length}`);
console.log(`✅ Target article found: ${articleFound ? 'YES' : 'NO'}`);
console.log(`✅ Node.js modules: Available`);

if (fs.existsSync(scriptPath) && existingFiles > 0 && articleFound) {
  console.log('\n🚀 READY TO RUN! Execute with:');
  console.log(`   node scripts/single-article-update.js ${targetArticle}`);
} else {
  console.log('\n⚠️  NOT READY - resolve issues above first');
}