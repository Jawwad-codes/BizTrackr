@echo off
REM BizTrackr Docker Update Script for Windows

echo 🔄 Updating BizTrackr Docker App
echo =================================

echo 🛑 Stopping current containers...
docker compose down

echo 🧹 Cleaning up old images...
docker system prune -f

echo 🔨 Rebuilding with latest code...
docker compose build --no-cache

if %errorlevel% equ 0 (
    echo ✅ Rebuild successful!
    
    echo 🚀 Starting updated BizTrackr...
    docker compose up -d
    
    if %errorlevel% equ 0 (
        echo ✅ BizTrackr updated and running!
        echo.
        echo 🌐 Access your updated app at: http://localhost:3000
        echo.
        echo 🆕 New Features Available:
        echo    • Business Type Selection
        echo    • Dynamic Sales Interface
        echo    • Enhanced Profile Management
        echo    • Quantity Tracking in Sales
    ) else (
        echo ❌ Failed to start updated containers!
    )
) else (
    echo ❌ Rebuild failed!
)

pause