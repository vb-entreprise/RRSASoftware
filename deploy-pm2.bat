@echo off
echo 🚀 Starting PM2 Deployment for shelterroutine.rrsaindia.org...

REM Colors are limited in Windows batch, but we'll make it clear
echo.
echo ========================================
echo    RRSA Animal Hospital - PM2 Deploy
echo ========================================
echo.

REM Check if we're doing local build or server deployment
if "%1"=="local" goto LOCAL_BUILD
if "%1"=="server" goto SERVER_DEPLOY
goto SHOW_USAGE

:LOCAL_BUILD
echo [LOCAL] Running local build and preparation...
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo [INFO] Installing dependencies...
    npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Run linting
echo [INFO] Running linter...
npm run lint
if errorlevel 1 (
    echo [WARNING] Linting found issues, but continuing...
)

REM Build for production
echo [INFO] Building for production...
npm run build
if errorlevel 1 (
    echo [ERROR] Build failed! Please fix errors and try again.
    pause
    exit /b 1
)

echo [SUCCESS] Build successful!

REM Create deployment package
echo [INFO] Creating deployment package...

REM Create deployment folder
if not exist "deployment-pm2" mkdir deployment-pm2

REM Copy production files
echo [INFO] Copying files...
xcopy /s /y dist\* deployment-pm2\ >nul
copy package.json deployment-pm2\ >nul
copy package-lock.json deployment-pm2\ >nul
copy server.js deployment-pm2\ >nul
copy ecosystem.config.js deployment-pm2\ >nul
copy .env deployment-pm2\ >nul

REM Create zip file for upload (requires PowerShell)
echo [INFO] Creating deployment archive...
powershell -Command "Compress-Archive -Path 'deployment-pm2\*' -DestinationPath 'shelterroutine-pm2.zip' -Force"

echo.
echo [SUCCESS] Deployment package created: shelterroutine-pm2.zip
echo.
echo ========================================
echo    NEXT STEPS:
echo ========================================
echo 1. Upload shelterroutine-pm2.zip to your server
echo 2. Extract it to /home/yourusername/public_html/shelterroutine/
echo 3. SSH to server and run: npm install --production
echo 4. Start with PM2: pm2 start ecosystem.config.js --env production
echo.
goto END

:SERVER_DEPLOY
echo [SERVER] This should be run on your Linux server via SSH
echo.
echo Instructions for server deployment:
echo 1. Upload shelterroutine-pm2.zip to your server
echo 2. SSH to your server
echo 3. Extract: unzip shelterroutine-pm2.zip -d /home/yourusername/public_html/shelterroutine/
echo 4. cd /home/yourusername/public_html/shelterroutine
echo 5. npm install --production
echo 6. pm2 start ecosystem.config.js --env production
echo 7. pm2 save
echo 8. pm2 startup
echo.
goto END

:SHOW_USAGE
echo ========================================
echo    USAGE:
echo ========================================
echo Local build:    deploy-pm2.bat local
echo Server info:    deploy-pm2.bat server
echo.
echo ========================================
echo    COMPLETE DEPLOYMENT PROCESS:
echo ========================================
echo 1. Run: deploy-pm2.bat local
echo 2. Upload: shelterroutine-pm2.zip to your server
echo 3. SSH to server and extract + install
echo 4. Start with PM2
echo.
echo ========================================
echo    PM2 MANAGEMENT COMMANDS (on server):
echo ========================================
echo Status:     pm2 status
echo Logs:       pm2 logs shelterroutine-rrsaindia
echo Monitor:    pm2 monit
echo Restart:    pm2 restart shelterroutine-rrsaindia
echo Stop:       pm2 stop shelterroutine-rrsaindia
echo Reload:     pm2 reload shelterroutine-rrsaindia
echo.

:END
echo ========================================
echo    PM2 Deployment Script Complete!
echo ========================================
pause 