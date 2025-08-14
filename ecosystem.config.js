module.exports = {
  apps: [
    {
      name: 'shelterroutine-rrsaindia',
      script: 'server.js',
      cwd: '/home/yourusername/public_html/shelterroutine',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '0.0.0.0'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      // Logging
      log_file: '/home/yourusername/logs/shelterroutine-combined.log',
      out_file: '/home/yourusername/logs/shelterroutine-out.log',
      error_file: '/home/yourusername/logs/shelterroutine-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      
      // Auto-restart configuration
      watch: false,
      max_memory_restart: '1G',
      restart_delay: 4000,
      
      // Advanced PM2 features
      min_uptime: '10s',
      max_restarts: 5,
      autorestart: true,
      
      // Environment variables for production
      env_file: '.env'
    }
  ],

  deploy: {
    production: {
      user: 'yourusername',
      host: 'yourserver.com',
      ref: 'origin/main',
      repo: 'git@github.com:yourusername/RRSASoftware.git',
      path: '/home/yourusername/shelterroutine',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
}; 