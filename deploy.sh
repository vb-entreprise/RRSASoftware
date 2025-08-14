#!/bin/bash

# RRSA Animal Hospital - Production Deployment Script
# Usage: ./deploy.sh

echo "🚀 Starting RRSA Animal Hospital Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

# Run linting
echo -e "${BLUE}🔍 Running linter...${NC}"
npm run lint

# Build for production
echo -e "${BLUE}🏗️  Building for production...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful!${NC}"
    
    # Create deployment package
    echo -e "${BLUE}📦 Creating deployment package...${NC}"
    
    # Create deployment folder
    mkdir -p deployment
    
    # Copy dist contents
    cp -r dist/* deployment/
    
    # Copy .htaccess file
    cp .htaccess deployment/
    
    # Create zip file for easy upload
    cd deployment
    zip -r ../shelterroutine-deployment.zip .
    cd ..
    
    echo -e "${GREEN}🎉 Deployment package created: shelterroutine-deployment.zip${NC}"
    echo -e "${YELLOW}📋 Next steps:${NC}"
    echo "1. Upload contents of 'deployment' folder to your web server"
    echo "2. Or upload 'shelterroutine-deployment.zip' and extract it on your server"
    echo "3. Ensure .htaccess file is in the root directory"
    echo "4. Test the deployment at: https://shelterroutine.rrsaindia.org"
    
else
    echo -e "${RED}❌ Build failed! Please fix errors and try again.${NC}"
    exit 1
fi

echo -e "${GREEN}🚀 Deployment preparation complete!${NC}" 