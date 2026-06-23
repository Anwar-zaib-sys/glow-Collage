@echo off
cd /d "%~dp0"
echo [GlowCollage Startup] Initializing...

:: Ensure logs directory exists
if not exist logs mkdir logs

:: Clear the log file completely
copy /y nul logs\log.txt >nul

echo [GlowCollage Startup] Starting Vite Dev Server...
echo [GlowCollage Startup] App will open automatically in your browser.
echo [GlowCollage Startup] Output console logs are being redirected to logs\log.txt
echo [GlowCollage Startup] Press Ctrl+C in this terminal window to stop the server.

npm run dev -- --open >> logs\log.txt 2>&1
