@echo off
REM BizTrackr Docker Setup Script for Windows

echo 🐳 BizTrackr Docker Setup
echo ========================

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

echo ✅ Docker is installed

REM Build the containers (force rebuild to include new code)
echo 🔨 Building containers with latest code...
docker compose build --no-cache

if %errorlevel% equ 0 (
    echo ✅ Build successful!
) else (
    echo ❌ Build failed!
    pause
    exit /b 1
)

REM Start the containers
echo 🚀 Starting BizTrackr...
docker compose up -d

if %errorlevel% equ 0 (
    echo ✅ BizTrackr is running!
    echo.
    echo 🌐 Access your app at: http://localhost:3000
    echo 🗄️  MongoDB is running at: mongodb://localhost:27017/BizTrackr
    echo.
    echo 📋 Useful commands:
    echo    View logs: docker compose logs -f
    echo    Stop app:  docker compose down
    echo    Rebuild:   docker compose build --no-cache
) else (
    echo ❌ Failed to start containers!
    pause
    exit /b 1
)

pause