#!/bin/bash

# Personality Spark API - Cloudflare Workers Secrets Setup
# This script sets up all required secrets for the Workers deployment

echo "Setting up Cloudflare Workers secrets..."

# JWT Secret for authentication
echo "Setting JWT_SECRET..."
wrangler secret put JWT_SECRET
echo "Please enter a secure random string (min 32 characters)"

# External AI API Keys (fallback)
echo -e "\nSetting OPENROUTER_API_KEY..."
wrangler secret put OPENROUTER_API_KEY
echo "Enter your OpenRouter API key (or press Enter to skip)"

echo -e "\nSetting DEEPSEEK_API_KEY..."
wrangler secret put DEEPSEEK_API_KEY
echo "Enter your DeepSeek API key (or press Enter to skip)"

# Turnstile for CAPTCHA
echo -e "\nSetting TURNSTILE_SECRET_KEY..."
wrangler secret put TURNSTILE_SECRET_KEY
echo "Enter your Cloudflare Turnstile secret key (or press Enter to skip)"

# Email configuration (optional)
echo -e "\nSetting EMAIL_API_KEY..."
wrangler secret put EMAIL_API_KEY
echo "Enter your email service API key (or press Enter to skip)"

echo -e "\n✅ Secrets setup complete!"
echo "You can update these secrets anytime using: wrangler secret put SECRET_NAME"
echo ""
echo "Required secrets:"
echo "- JWT_SECRET: Required for authentication"
echo ""
echo "Optional secrets:"
echo "- OPENROUTER_API_KEY: For AI fallback"
echo "- DEEPSEEK_API_KEY: For AI fallback"
echo "- TURNSTILE_SECRET_KEY: For CAPTCHA protection"
echo "- EMAIL_API_KEY: For email notifications"