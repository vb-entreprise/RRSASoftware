#!/bin/bash

# RRSA Animal Hospital - PM2 Production Deployment Script
# For Linux servers with WHM/cPanel and PM2

echo "🚀 Starting PM2 Deployment for shelterroutine.rrsaindia.org..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="shelterroutine-rrsaindia"
SERVER_USER="yourusername"  # Replace with your cPanel username
SERVER_HOST="yourserver.com"  # Replace with your server IP/domain
DEPLOY_PATH="/home/$SERVER_USER/public_html/shelterroutine"
BACKUP_PATH="/home/$SERVER_USER/backups/shelterroutine"

echo -e "${BLUE}📋 Deployment Configuration:${NC}"
echo -e "App Name: ${GREEN}$APP_NAME${NC}"
echo -e "Deploy Path: ${GREEN}$DEPLOY_PATH${NC}"
echo -e "Server: ${GREEN}$SERVER_HOST${NC}"
echo ""

# Check if we're running on the server or locally
if [ "$1" = "local" ]; then
    echo -e "${YELLOW}🏠 Running local build and preparation...${NC}"
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo -e "${BLUE}📦 Installing dependencies...${NC}"
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
        mkdir -p deployment-pm2
        
        # Copy production files
        cp -r dist/* deployment-pm2/
        cp package.json deployment-pm2/
        cp package-lock.json deployment-pm2/
        cp server.js deployment-pm2/
        cp ecosystem.config.js deployment-pm2/
        cp .env deployment-pm2/
        
        # Create tarball for upload
        tar -czf shelterroutine-pm2.tar.gz -C deployment-pm2 .
        
        echo -e "${GREEN}📦 Deployment package created: shelterroutine-pm2.tar.gz${NC}"
        echo -e "${YELLOW}📋 Next steps:${NC}"
        echo "1. Upload shelterroutine-pm2.tar.gz to your server"
        echo "2. Run this script on the server: ./deploy-pm2.sh server"
        echo "3. Or use SCP: scp shelterroutine-pm2.tar.gz $SERVER_USER@$SERVER_HOST:~/"
        
    else
        echo -e "${RED}❌ Build failed! Please fix errors and try again.${NC}"
        exit 1
    fi
    
elif [ "$1" = "server" ]; then
    echo -e "${PURPLE}🖥️  Running server deployment...${NC}"
    
    # Check if PM2 is installed
    if ! command -v pm2 &> /dev/null; then
        echo -e "${RED}❌ PM2 is not installed. Installing PM2...${NC}"
        npm install -g pm2
    fi
    
    # Create necessary directories
    echo -e "${BLUE}📁 Creating directories...${NC}"
    mkdir -p $DEPLOY_PATH
    mkdir -p $BACKUP_PATH
    mkdir -p /home/$SERVER_USER/logs
    
    # Backup existing deployment
    if [ -d "$DEPLOY_PATH" ] && [ "$(ls -A $DEPLOY_PATH)" ]; then
        echo -e "${BLUE}📋 Backing up existing deployment...${NC}"
        tar -czf "$BACKUP_PATH/backup-$(date +%Y%m%d-%H%M%S).tar.gz" -C "$DEPLOY_PATH" .
    fi
    
    # Extract new deployment
    if [ -f "/home/$SERVER_USER/shelterroutine-pm2.tar.gz" ]; then
        echo -e "${BLUE}📦 Extracting deployment package...${NC}"
        cd $DEPLOY_PATH
        tar -xzf /home/$SERVER_USER/shelterroutine-pm2.tar.gz
        
        # Update ecosystem config with correct paths
        sed -i "s|/home/yourusername|/home/$SERVER_USER|g" ecosystem.config.js
        sed -i "s|yourusername|$SERVER_USER|g" ecosystem.config.js
        
        # Install production dependencies
        echo -e "${BLUE}📦 Installing production dependencies...${NC}"
        npm install --production
        
        # Stop existing PM2 process if running
        echo -e "${BLUE}🛑 Stopping existing PM2 processes...${NC}"
        pm2 stop $APP_NAME 2>/dev/null || true
        pm2 delete $APP_NAME 2>/dev/null || true
        
        # Start with PM2
        echo -e "${BLUE}🚀 Starting application with PM2...${NC}"
        pm2 start ecosystem.config.js --env production
        
        # Save PM2 configuration
        pm2 save
        
        # Generate PM2 startup script
        pm2 startup
        
        echo -e "${GREEN}✅ Deployment successful!${NC}"
        echo -e "${GREEN}🎉 Application is now running with PM2${NC}"
        
        # Show status
        pm2 status
        
    else
        echo -e "${RED}❌ Deployment package not found at /home/$SERVER_USER/shelterroutine-pm2.tar.gz${NC}"
        exit 1
    fi
    
else
    echo -e "${YELLOW}🤔 Usage:${NC}"
    echo -e "${BLUE}Local build:${NC} ./deploy-pm2.sh local"
    echo -e "${BLUE}Server deploy:${NC} ./deploy-pm2.sh server"
    echo ""
    echo -e "${YELLOW}📋 Complete deployment process:${NC}"
    echo "1. Run: ./deploy-pm2.sh local"
    echo "2. Upload: scp shelterroutine-pm2.tar.gz user@server:~/"
    echo "3. SSH to server and run: ./deploy-pm2.sh server"
    echo ""
    echo -e "${YELLOW}🔧 PM2 Management Commands:${NC}"
    echo -e "${BLUE}Status:${NC} pm2 status"
    echo -e "${BLUE}Logs:${NC} pm2 logs $APP_NAME"
    echo -e "${BLUE}Monitoring:${NC} pm2 monit"
    echo -e "${BLUE}Restart:${NC} pm2 restart $APP_NAME"
    echo -e "${BLUE}Stop:${NC} pm2 stop $APP_NAME"
    echo -e "${BLUE}Reload:${NC} pm2 reload $APP_NAME"
fi

echo -e "${GREEN}🎯 PM2 Deployment Script Complete!${NC}" 