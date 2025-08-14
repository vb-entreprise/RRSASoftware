@echo off
echo 🚀 Starting RRSA Animal Hospital Deployment...

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

REM Run linting
echo 🔍 Running linter...
npm run lint

REM Build for production
echo 🏗️ Building for production...
npm run build

if %ERRORLEVEL% EQU 0 (
    echo ✅ Build successful!
    
    REM Create deployment package
    echo 📦 Creating deployment package...
    
    REM Create deployment folder
    if not exist "deployment" mkdir deployment
    
    REM Copy dist contents
    xcopy /s /y dist\* deployment\
    
    REM Copy .htaccess file
    copy .htaccess deployment\
    
    echo 🎉 Deployment package created in 'deployment' folder!
    echo 📋 Next steps:
    echo 1. Upload contents of 'deployment' folder to your web server
    echo 2. Ensure .htaccess file is in the root directory
    echo 3. Test the deployment at: https://shelterroutine.rrsaindia.org
    
) else (
    echo ❌ Build failed! Please fix errors and try again.
    pause
    exit /b 1
)

echo 🚀 Deployment preparation complete!
pause 