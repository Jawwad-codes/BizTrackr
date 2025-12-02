@echo off
echo ========================================
echo BizTrackr Docker - Complete Update
echo ========================================
echo.

echo Step 1: Stopping existing containers...
docker-compose down
echo.

echo Step 2: Rebuilding Docker image (this may take 5-10 minutes)...
docker-compose build --no-cache
echo.

echo Step 3: Starting containers...
docker-compose up -d
echo.

echo Step 4: Waiting for startup (30 seconds)...
timeout /t 30 /nobreak
echo.

echo Step 5: Checking container status...
docker-compose ps
echo.

echo Step 6: Checking application logs...
docker-compose logs --tail=20 app
echo.

echo ========================================
echo Update Complete!
echo ========================================
echo.
echo Your BizTrackr application is now running with:
echo - Enhanced AI Insights with professional reports
echo - Voice Input for sales entry
echo - Fixed sales calculations (amount x quantity)
echo - Inventory samples in insights
echo - Real-world business recommendations
echo.
echo Access your application at: http://localhost:3000
echo.
echo To view live logs: docker-compose logs -f app
echo To stop: docker-compose down
echo.
pause
