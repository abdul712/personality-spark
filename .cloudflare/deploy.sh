#!/bin/bash
# This file is used by Cloudflare deployment

cd personality-spark-api
npm install --force
./node_modules/.bin/wrangler deploy