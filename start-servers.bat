@echo off
title PlayCast Church Presentation Studio
echo ========================================================
echo        PlayCast Studio - Starting All Servers
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/2] Starting PHP Backend on port 8000...
start "PlayCast PHP API" /min cmd /k ".\php\php.exe -S 0.0.0.0:8000 .\app\backend\index.php -c .\php\php.ini"

timeout /t 2 /nobreak >nul

echo [2/2] Starting PlayCast Frontend on port 3000...
cd app\frontend
start "PlayCast Frontend" cmd /k "npx vite --host 0.0.0.0 --port 3000"

timeout /t 3 /nobreak >nul

echo.
echo ========================================================
echo  PlayCast Studio is ready! Opening in your browser...
echo   - Presenter Studio: http://localhost:3000/
echo   - OBS Overlay Feed: http://localhost:3000/display
echo   - Projector Feed:   http://localhost:3000/projector
echo   - Stage Monitor:    http://localhost:3000/stage
echo   - Mobile Remote:    http://localhost:3000/remote
echo   - PHP REST API:     http://localhost:8000/health
echo ========================================================
start http://localhost:3000/
pause
