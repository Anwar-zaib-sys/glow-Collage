# GlowCollage — Standalone Windows Requirements

This document describes what is needed to run **GlowCollage** on another Windows PC as a fully self-contained, offline app.

---

## Quick start (recommended)

1. On your **build machine** (this project), run:
   ```powershell
   npm run package
   ```
2. Copy the entire folder:
   ```
   release/GlowCollage-standalone/
   ```
   to the target PC (USB drive, network share, zip file, etc.).
3. On the target PC, double-click:
   ```
   collage_maker_start.bat
   ```
4. The app opens in your default browser at `http://127.0.0.1:5171`.

No internet connection is required on the target PC after copying the folder.

---

## Target device requirements (standalone package)

When you use the packaged `GlowCollage-standalone` folder, the target PC needs **only**:

| Requirement | Details |
|---|---|
| **Operating system** | Windows 10 (64-bit) or Windows 11 (64-bit) |
| **Architecture** | x64 (64-bit) |
| **Disk space** | ~120 MB free (app + portable Node.js runtime) |
| **RAM** | 4 GB minimum recommended |
| **Browser** | Any modern browser already on Windows (Microsoft Edge, Chrome, Firefox, etc.) |
| **Internet** | **Not required** — all fonts and app files are bundled locally |
| **Node.js install** | **Not required** — portable Node.js is included in `runtime/node/` |
| **npm install** | **Not required** on the target PC |
| **Admin rights** | **Not required** — runs from any folder the user can write to |

### What is included in the standalone folder

```
GlowCollage-standalone/
├── collage_maker_start.bat   # Double-click to launch
├── dist/                     # Built app (React + all JS/CSS/fonts)
├── server/                   # Tiny local web server (Node built-ins only)
├── runtime/node/             # Portable Node.js (no system install)
├── logs/                     # Runtime logs
└── REQUIREMENTS.md           # This file
```

---

## Build machine requirements (only for creating the package)

You only need these on the PC where you **build** the standalone folder:

| Tool | Version used in this project |
|---|---|
| **Node.js** | v22.22.0 LTS (or compatible v22.x) |
| **npm** | v11.13.0 (bundled with Node 22) |
| **PowerShell** | 5.1 or newer (included in Windows 10/11) |
| **Internet** | Required once, to download portable Node.js during packaging |

### Build commands

```powershell
# Install project dependencies (first time only)
npm install

# Create the standalone release folder
npm run package
```

---

## Optional: run without the portable Node bundle

If the standalone folder was copied **without** `runtime/node/` (or it was deleted to save space), the launcher will try to use a system-installed Node.js instead.

In that case, install on the target PC:

| Tool | Minimum version |
|---|---|
| **Node.js** | v18.0.0 or newer (v22 LTS recommended) |
| **npm** | Comes with Node.js (no separate install needed) |

Download Node.js from: https://nodejs.org/

Then run `collage_maker_start.bat` as usual.

---

## Development mode (not for end users)

For coding and testing on a dev machine, use:

```powershell
npm install
npm run dev
```

Or double-click `collage_maker_dev.bat`.

Development mode requires Node.js and npm installed on that machine.

---

## Troubleshooting

| Problem | Solution |
|---|---|
| **"Production build not found"** | Run `npm run package` on the build machine and copy the full `GlowCollage-standalone` folder. |
| **"Node.js was not found"** | Re-run `npm run package` so `runtime/node/` is included, or install Node.js 22 LTS on the target PC. |
| **Port 5171 already in use** | Close the other GlowCollage window, or set `PORT=5172` before launching (advanced). |
| **Browser does not open** | Manually visit `http://127.0.0.1:5171` after starting the batch file. |
| **Antivirus blocks the app** | Allow `runtime/node/node.exe` and `collage_maker_start.bat` — they are standard Node.js binaries. |

---

## Privacy & offline behavior

- All image processing happens **locally in the browser**.
- No photos are uploaded to any server.
- Google Fonts are **bundled inside the app** — no external font CDN calls.
- The local server only listens on `127.0.0.1` (your own PC) and is not accessible from other devices on the network.

---

## Summary

| Scenario | Node.js needed? | npm needed? | Internet needed? |
|---|---|---|---|
| Run `GlowCollage-standalone` folder | No (bundled) | No | No |
| Run with system Node only | Yes (v18+) | No | No |
| Develop / build the project | Yes (v22 recommended) | Yes | Yes (first install + package) |
