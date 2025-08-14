# RRSA Animal Hospital - PM2 Deployment Script (PowerShell)
# For Windows development to Linux server deployment

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("local", "server", "")]
    [string]$Action = ""
)

# Colors for output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Success { Write-ColorOutput Green $args }
function Write-Info { Write-ColorOutput Cyan $args }
function Write-Warning { Write-ColorOutput Yellow $args }
function Write-Error { Write-ColorOutput Red $args }

Write-Info "🚀 Starting PM2 Deployment for shelterroutine.rrsaindia.org..."
Write-Info ""
Write-Info "========================================="
Write-Info "   RRSA Animal Hospital - PM2 Deploy"
Write-Info "========================================="
Write-Info ""

# Configuration
$AppName = "shelterroutine-rrsaindia"
$DeploymentFolder = "deployment-pm2"
$ArchiveName = "shelterroutine-pm2.zip"

if ($Action -eq "local") {
    Write-Info "[LOCAL] Running local build and preparation..."
    Write-Info ""
    
    # Check if node_modules exists
    if (-not (Test-Path "node_modules")) {
        Write-Info "[INFO] Installing dependencies..."
        & npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Error "[ERROR] Failed to install dependencies"
            Read-Host "Press Enter to continue"
            exit 1
        }
    }
    
    # Run linting
    Write-Info "[INFO] Running linter..."
    & npm run lint
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "[WARNING] Linting found issues, but continuing..."
    }
    
    # Build for production
    Write-Info "[INFO] Building for production..."
    & npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "[ERROR] Build failed! Please fix errors and try again."
        Read-Host "Press Enter to continue"
        exit 1
    }
    
    Write-Success "[SUCCESS] Build successful!"
    
    # Create deployment package
    Write-Info "[INFO] Creating deployment package..."
    
    # Remove existing deployment folder
    if (Test-Path $DeploymentFolder) {
        Remove-Item $DeploymentFolder -Recurse -Force
    }
    
    # Create deployment folder
    New-Item -ItemType Directory -Path $DeploymentFolder -Force | Out-Null
    
    # Copy production files
    Write-Info "[INFO] Copying files..."
    
    # Copy dist contents
    if (Test-Path "dist") {
        Copy-Item -Path "dist\*" -Destination $DeploymentFolder -Recurse -Force
    }
    
    # Copy server files
    $FilesToCopy = @("package.json", "package-lock.json", "server.js", "ecosystem.config.js", ".env")
    foreach ($file in $FilesToCopy) {
        if (Test-Path $file) {
            Copy-Item -Path $file -Destination $DeploymentFolder -Force
            Write-Info "  ✓ Copied $file"
        } else {
            Write-Warning "  ⚠ $file not found, skipping..."
        }
    }
    
    # Create zip file for upload
    Write-Info "[INFO] Creating deployment archive..."
    if (Test-Path $ArchiveName) {
        Remove-Item $ArchiveName -Force
    }
    
    Compress-Archive -Path "$DeploymentFolder\*" -DestinationPath $ArchiveName -Force
    
    Write-Info ""
    Write-Success "[SUCCESS] Deployment package created: $ArchiveName"
    Write-Info ""
    Write-Info "========================================="
    Write-Info "   NEXT STEPS:"
    Write-Info "========================================="
    Write-Info "1. Upload $ArchiveName to your server"
    Write-Info "2. Extract it to /home/yourusername/public_html/shelterroutine/"
    Write-Info "3. SSH to server and run: npm install --production"
    Write-Info "4. Start with PM2: pm2 start ecosystem.config.js --env production"
    Write-Info ""
    
    # Show file size and contents
    $fileSize = (Get-Item $ArchiveName).Length
    $fileSizeMB = [math]::Round($fileSize / 1MB, 2)
    Write-Info "📦 Package size: $fileSizeMB MB"
    
    Write-Info ""
    Write-Info "📁 Package contents:"
    $archive = [System.IO.Compression.ZipFile]::OpenRead((Resolve-Path $ArchiveName))
    foreach ($entry in $archive.Entries) {
        Write-Info "  - $($entry.FullName)"
    }
    $archive.Dispose()
    
} elseif ($Action -eq "server") {
    Write-Info "[SERVER] Server deployment instructions for Linux:"
    Write-Info ""
    Write-Info "Run these commands on your Linux server:"
    Write-Info ""
    Write-Info "# 1. Upload and extract"
    Write-Info "cd /home/yourusername/public_html/"
    Write-Info "mkdir -p shelterroutine"
    Write-Info "cd shelterroutine"
    Write-Info "unzip ~/shelterroutine-pm2.zip"
    Write-Info ""
    Write-Info "# 2. Install dependencies"
    Write-Info "npm install --production"
    Write-Info ""
    Write-Info "# 3. Update ecosystem config"
    Write-Info "sed -i 's|/home/yourusername|/home/\$USER|g' ecosystem.config.js"
    Write-Info "sed -i 's|yourusername|\$USER|g' ecosystem.config.js"
    Write-Info ""
    Write-Info "# 4. Start with PM2"
    Write-Info "pm2 start ecosystem.config.js --env production"
    Write-Info "pm2 save"
    Write-Info "pm2 startup"
    Write-Info ""
    
} else {
    Write-Info "========================================="
    Write-Info "   USAGE:"
    Write-Info "========================================="
    Write-Info "Local build:     .\deploy-pm2.ps1 local"
    Write-Info "Server info:     .\deploy-pm2.ps1 server"
    Write-Info ""
    Write-Info "========================================="
    Write-Info "   COMPLETE DEPLOYMENT PROCESS:"
    Write-Info "========================================="
    Write-Info "1. Run: .\deploy-pm2.ps1 local"
    Write-Info "2. Upload: shelterroutine-pm2.zip to your server"
    Write-Info "3. SSH to server and extract + install"
    Write-Info "4. Start with PM2"
    Write-Info ""
    Write-Info "========================================="
    Write-Info "   PM2 MANAGEMENT COMMANDS (on server):"
    Write-Info "========================================="
    Write-Info "Status:      pm2 status"
    Write-Info "Logs:        pm2 logs $AppName"
    Write-Info "Monitor:     pm2 monit"
    Write-Info "Restart:     pm2 restart $AppName"
    Write-Info "Stop:        pm2 stop $AppName"
    Write-Info "Reload:      pm2 reload $AppName"
    Write-Info ""
}

Write-Info "========================================="
Write-Success "   PM2 Deployment Script Complete!"
Write-Info "========================================="

if ($Action -eq "") {
    Read-Host "Press Enter to continue"
} 