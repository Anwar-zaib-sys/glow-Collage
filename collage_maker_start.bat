@echo off
setlocal EnableExtensions
cd /d "%~dp0"

echo [GlowCollage] Starting standalone app...

if not exist logs mkdir logs
copy /y nul logs\log.txt >nul

set "NODE_EXE="
if exist "runtime\node\node.exe" (
  set "NODE_EXE=%~dp0runtime\node\node.exe"
) else (
  where node >nul 2>&1
  if not errorlevel 1 (
    set "NODE_EXE=node"
  )
)

if not defined NODE_EXE (
  echo [GlowCollage] ERROR: Node.js was not found.
  echo [GlowCollage] Run scripts\prepare-standalone.ps1 on the build machine first,
  echo [GlowCollage] or install Node.js 22 LTS on this device.
  echo.
  pause
  exit /b 1
)

if not exist "dist\index.html" (
  echo [GlowCollage] ERROR: Production build not found.
  echo [GlowCollage] Run "npm run package" on the build machine, then copy the release folder.
  echo.
  pause
  exit /b 1
)

set "PORT=5171"
set "APP_URL=http://127.0.0.1:%PORT%"

echo [GlowCollage] Using Node: %NODE_EXE%
echo [GlowCollage] Opening %APP_URL% in your default browser...
echo [GlowCollage] Logs are written to logs\log.txt
echo [GlowCollage] Press Ctrl+C in this window to stop the server.

start "" "%APP_URL%"

"%NODE_EXE%" "%~dp0server\serve.js" >> logs\log.txt 2>&1
