#Requires -Version 5.1
$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$releaseDir = Join-Path $root 'release\GlowCollage-standalone'
$nodeVersion = '22.22.0'
$nodeZipName = "node-v$nodeVersion-win-x64.zip"
$nodeUrl = "https://nodejs.org/dist/v$nodeVersion/$nodeZipName"
$tempZip = Join-Path $env:TEMP $nodeZipName

Write-Host '[GlowCollage] Building production app...' -ForegroundColor Cyan
Push-Location $root
try {
    if (-not (Test-Path (Join-Path $root 'node_modules'))) {
        npm install
    }
    npm run build
}
finally {
    Pop-Location
}

Write-Host '[GlowCollage] Preparing standalone release folder...' -ForegroundColor Cyan
if (Test-Path $releaseDir) {
    Remove-Item $releaseDir -Recurse -Force
}

New-Item -ItemType Directory -Path $releaseDir -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $releaseDir 'runtime') -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $releaseDir 'logs') -Force | Out-Null

Copy-Item (Join-Path $root 'dist') (Join-Path $releaseDir 'dist') -Recurse
Copy-Item (Join-Path $root 'server') (Join-Path $releaseDir 'server') -Recurse
Copy-Item (Join-Path $root 'collage_maker_start.bat') $releaseDir
Copy-Item (Join-Path $root 'REQUIREMENTS.md') $releaseDir

$nodeTarget = Join-Path $releaseDir 'runtime\node'
if (-not (Test-Path (Join-Path $nodeTarget 'node.exe'))) {
    Write-Host "[GlowCollage] Downloading portable Node.js v$nodeVersion..." -ForegroundColor Cyan
    Invoke-WebRequest -Uri $nodeUrl -OutFile $tempZip
    $tempExtract = Join-Path $env:TEMP "node-v$nodeVersion-win-x64"
    if (Test-Path $tempExtract) {
        Remove-Item $tempExtract -Recurse -Force
    }
    Expand-Archive -Path $tempZip -DestinationPath $env:TEMP -Force
    Move-Item $tempExtract $nodeTarget
    Remove-Item $tempZip -Force -ErrorAction SilentlyContinue
}

$sizeMb = [math]::Round(((Get-ChildItem $releaseDir -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB), 1)
Write-Host "[GlowCollage] Standalone package ready: $releaseDir" -ForegroundColor Green
Write-Host "[GlowCollage] Package size: $sizeMb MB" -ForegroundColor Green
Write-Host '[GlowCollage] Copy the GlowCollage-standalone folder to any Windows 10/11 PC and run collage_maker_start.bat' -ForegroundColor Green
