@echo off
cd /d "%~dp0"
echo [GlowCollage Dev] Starting Vite development server...

if not exist logs mkdir logs
copy /y nul logs\log.txt >nul

where node >nul 2>&1
if errorlevel 1 (
  echo [GlowCollage Dev] ERROR: Node.js is required for development mode.
  pause
  exit /b 1
)

if not exist node_modules (
  echo [GlowCollage Dev] Installing dependencies...
  call npm install
)

echo [GlowCollage Dev] App will open automatically in your browser.
echo [GlowCollage Dev] Press Ctrl+C to stop the server.

npm run dev -- --open >> logs\log.txt 2>&1
