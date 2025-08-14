# 🚀 PM2 Deployment Guide for shelterroutine.rrsaindia.org

## 🏗️ Advanced Deployment with PM2 on Linux/WHM/cPanel

Since you have PM2 available on your Linux server, this is the **RECOMMENDED** deployment method for superior performance, scalability, and management.

## 🔋 PM2 Advantages

### **Why PM2 is Better:**
- ✅ **Process Management**: Automatic restarts, clustering, monitoring
- ✅ **Zero Downtime**: Hot reloads without service interruption  
- ✅ **Load Balancing**: Multi-core CPU utilization with clustering
- ✅ **Memory Management**: Automatic restart on memory leaks
- ✅ **Logging**: Advanced log management and rotation
- ✅ **Monitoring**: Real-time performance monitoring
- ✅ **Production Ready**: Enterprise-grade process management

## 📋 Prerequisites

### **Server Requirements:**
- ✅ Linux server with WHM/cPanel
- ✅ Node.js (v16+ recommended)
- ✅ PM2 installed globally
- ✅ SSH access to server
- ✅ Domain configured: `shelterroutine.rrsaindia.org`

### **Check Your Setup:**
```bash
# Check Node.js version
node --version

# Check PM2 installation
pm2 --version

# If PM2 not installed:
npm install -g pm2
```

## 🚀 Deployment Methods

### **Method 1: Automated Deployment (Recommended)**

#### **Step 1: Local Build**
```bash
# Make script executable
chmod +x deploy-pm2.sh

# Build and prepare deployment package
./deploy-pm2.sh local
```

#### **Step 2: Upload to Server**
```bash
# Upload deployment package (replace with your details)
scp shelterroutine-pm2.tar.gz username@yourserver.com:~/

# Or use cPanel File Manager to upload shelterroutine-pm2.tar.gz
```

#### **Step 3: Deploy on Server**
```bash
# SSH to your server
ssh username@yourserver.com

# Run server deployment
./deploy-pm2.sh server
```

### **Method 2: Manual Deployment**

#### **Step 1: Prepare Files**
```bash
# Build the application
npm run build

# Install server dependencies
npm install --production
```

#### **Step 2: Upload Files**
Upload these files to `/home/yourusername/public_html/shelterroutine/`:
- All contents of `dist/` folder
- `package.json`
- `package-lock.json`
- `server.js`
- `ecosystem.config.js`
- `.env`

#### **Step 3: Start with PM2**
```bash
# SSH to your server
cd /home/yourusername/public_html/shelterroutine

# Install dependencies
npm install --production

# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup auto-start on boot
pm2 startup
```

## 🔧 Configuration

### **ecosystem.config.js Settings**

Key configurations for your setup:
```javascript
{
  name: 'shelterroutine-rrsaindia',
  script: 'server.js',
  instances: 'max',          // Use all CPU cores
  exec_mode: 'cluster',      // Cluster mode for load balancing
  env: {
    NODE_ENV: 'production',
    PORT: 3000               // Internal port for PM2
  }
}
```

### **server.js Features**
- ✅ Express.js server for serving React SPA
- ✅ Security middleware (Helmet, CORS)
- ✅ Gzip compression for faster loading
- ✅ Static file serving with caching
- ✅ Health check endpoint (`/health`)
- ✅ Graceful shutdown handling

## 🌐 Server Configuration Options

### **Option A: Direct Port Access**
Configure your domain to point directly to port 3000:
```
shelterroutine.rrsaindia.org:3000
```

### **Option B: Apache Reverse Proxy (Recommended)**
Configure Apache to proxy requests to PM2:

**In .htaccess or Apache virtual host:**
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
```

### **Option C: Nginx Reverse Proxy**
If you have Nginx available, use the included `nginx.conf`:
```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

## 🎛️ PM2 Management Commands

### **Essential Commands:**
```bash
# Check application status
pm2 status

# View real-time logs
pm2 logs shelterroutine-rrsaindia

# Monitor performance
pm2 monit

# Restart application (zero downtime)
pm2 restart shelterroutine-rrsaindia

# Reload application (zero downtime)
pm2 reload shelterroutine-rrsaindia

# Stop application
pm2 stop shelterroutine-rrsaindia

# Delete application from PM2
pm2 delete shelterroutine-rrsaindia
```

### **NPM Scripts Available:**
```bash
# Start with PM2
npm run pm2:start

# Restart application
npm run pm2:restart

# View logs
npm run pm2:logs

# Monitor performance
npm run pm2:monit

# Quick deploy (build + reload)
npm run deploy
```

## 📊 Monitoring & Maintenance

### **Performance Monitoring:**
```bash
# Real-time monitoring dashboard
pm2 monit

# Memory and CPU usage
pm2 status

# Detailed application info
pm2 show shelterroutine-rrsaindia

# Restart on high memory usage (configured in ecosystem)
max_memory_restart: '1G'
```

### **Log Management:**
```bash
# View logs in real-time
pm2 logs shelterroutine-rrsaindia --lines 50

# Log files location
/home/yourusername/logs/shelterroutine-*.log

# Rotate logs (prevents disk space issues)
pm2 install pm2-logrotate
```

### **Health Monitoring:**
```bash
# Health check endpoint
curl https://shelterroutine.rrsaindia.org/health

# Expected response:
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "RRSA Animal Hospital Management",
  "version": "1.0.0"
}
```

## 🔄 Updates & Deployment

### **For Future Updates:**
```bash
# 1. Local development and testing
npm run dev

# 2. Build and prepare new version
./deploy-pm2.sh local

# 3. Upload to server
scp shelterroutine-pm2.tar.gz user@server:~/

# 4. Deploy with zero downtime
./deploy-pm2.sh server
# OR manually:
pm2 reload shelterroutine-rrsaindia
```

### **Rollback Strategy:**
```bash
# Automatic backups are created in:
/home/yourusername/backups/shelterroutine/

# To rollback:
cd /home/yourusername/public_html/shelterroutine
tar -xzf /home/yourusername/backups/shelterroutine/backup-YYYYMMDD-HHMMSS.tar.gz
pm2 restart shelterroutine-rrsaindia
```

## 🛡️ Security & Performance

### **Built-in Security:**
- ✅ Helmet.js for security headers
- ✅ CORS properly configured
- ✅ Firebase security rules
- ✅ Input validation and sanitization
- ✅ Rate limiting (can be added)

### **Performance Optimizations:**
- ✅ Gzip compression enabled
- ✅ Static asset caching (1 year)
- ✅ Cluster mode for multi-core usage
- ✅ Memory management and auto-restart
- ✅ Connection pooling and keep-alive

## 🆘 Troubleshooting

### **Common Issues:**

#### **PM2 Process Not Starting:**
```bash
# Check PM2 logs
pm2 logs shelterroutine-rrsaindia

# Check if port is available
netstat -tulpn | grep :3000

# Restart PM2 daemon
pm2 kill
pm2 resurrect
```

#### **Application Not Accessible:**
```bash
# Check if application is running
pm2 status

# Test local connection
curl http://localhost:3000/health

# Check firewall/proxy settings
```

#### **High Memory Usage:**
```bash
# Monitor memory usage
pm2 monit

# Restart if needed
pm2 restart shelterroutine-rrsaindia

# Check for memory leaks in logs
pm2 logs shelterroutine-rrsaindia | grep -i memory
```

## 🎯 Production Checklist

### **Before Going Live:**
- [ ] PM2 application starts successfully
- [ ] Health check endpoint responds
- [ ] All routes work correctly
- [ ] Firebase connection established
- [ ] Admin login functions
- [ ] SSL certificate configured
- [ ] Backup system in place
- [ ] Monitoring alerts set up

### **Post-Deployment:**
- [ ] Test all application features
- [ ] Verify performance with PM2 monit
- [ ] Set up log rotation
- [ ] Configure automatic backups
- [ ] Document server access details
- [ ] Train team on PM2 commands

## 🎉 Deployment Summary

**Your PM2 deployment setup provides:**

- 🚀 **High Performance**: Multi-core clustering and optimization
- 🔒 **Enterprise Security**: Production-grade security measures
- 📊 **Advanced Monitoring**: Real-time performance tracking
- 🔄 **Zero Downtime**: Hot reloads and graceful restarts
- 📋 **Easy Management**: Simple commands for all operations
- 🛡️ **Reliability**: Automatic restarts and error recovery

**Next Steps:**
1. Run `./deploy-pm2.sh local` to build deployment package
2. Upload to your server and run `./deploy-pm2.sh server`
3. Configure domain proxy to port 3000
4. Test all functionality and monitor with `pm2 monit`
5. Enjoy your production-ready animal hospital management system!

---

**Technical Support:**
- PM2 Documentation: https://pm2.keymetrics.io/docs/
- Server logs: `/home/yourusername/logs/shelterroutine-*.log`
- Health check: `https://shelterroutine.rrsaindia.org/health`

**Version**: 1.0 PM2 Production  
**Status**: ✅ Enterprise Ready 