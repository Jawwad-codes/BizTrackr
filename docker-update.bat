@echo off
REM BizTrackr Docker Update Script for Windows

echo 🔄 Updating BizTrackr Docker App
echo =================================

echo 🛑 Stopping current containers...
docker compose down

echo 🧹 Removing old volumes and containers...
docker compose down -v
docker system prune -f

echo 🗄️ Recreating MongoDB volume...
docker volume rm biztrackr_mongo_data 2>nul
docker volume create biztrackr_mongo_data

echo 🔨 Rebuilding with latest code...
docker compose build --no-cache

if %errorlevel% equ 0 (
    echo ✅ Rebuild successful!
    
    echo 🚀 Starting MongoDB first...
    docker compose up -d mongo
    
    echo ⏳ Waiting for MongoDB to be ready...
    timeout /t 15 /nobreak >nul
    
    echo 🚀 Starting BizTrackr app...
    docker compose up -d app
    
    if %errorlevel% equ 0 (
        echo ✅ BizTrackr updated and running!
        echo.
        echo ⏳ Waiting for services to be ready...
        timeout /t 10 /nobreak >nul
        
        echo 🔍 Checking container status...
        docker compose ps
        
        echo.
        echo 🌐 Access your updated app at: http://localhost:3000
        echo 🗄️ MongoDB running at: mongodb://localhost:27017/BizTrackr
        echo.
        echo 🆕 New Features Available:
        echo    • Automatic Inventory Management
        echo    • Real-time Stock Updates on Sales
        echo    • Inventory Validation for Sales
        echo    • Enhanced CRUD Operations
        echo    • Improved Error Handling
        echo.
        echo 💡 Test the inventory system:
        echo    1. Create inventory items
        echo    2. Make sales - watch inventory decrease
        echo    3. Try overselling - see validation errors
    ) else (
        echo ❌ Failed to start updated containers!
        echo 📋 Checking logs...
        docker compose logs
    )
) else (
    echo ❌ Rebuild failed!
    echo 📋 Checking logs...
    docker compose logs
)

pause