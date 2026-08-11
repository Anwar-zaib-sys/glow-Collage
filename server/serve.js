import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST_DIR = path.resolve(__dirname, '..', 'dist')
const PORT = Number(process.env.PORT) || 5171
const HOST = process.env.HOST || '127.0.0.1'

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json',
}

function send(res, statusCode, body, contentType = 'text/plain; charset=utf-8') {
  res.writeHead(statusCode, {
    'Content-Type': contentType,
    'Cache-Control': 'no-cache',
  })
  res.end(body)
}

function resolveFile(requestPath) {
  const safePath = path
    .normalize(requestPath)
    .replace(/^(\.\.[/\\])+/, '')
    .replace(/^[/\\]+/, '')

  const filePath = path.join(DIST_DIR, safePath)

  if (!filePath.startsWith(DIST_DIR)) {
    return null
  }

  return filePath
}

function serveFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      send(res, 404, 'Not found')
      return
    }

    const ext = path.extname(filePath).toLowerCase()
    const contentType = MIME_TYPES[ext] || 'application/octet-stream'
    send(res, 200, data, contentType)
  })
}

if (!fs.existsSync(DIST_DIR)) {
  console.error(`[GlowCollage] Missing build output at: ${DIST_DIR}`)
  console.error('[GlowCollage] Run "npm run package" on the build machine first.')
  process.exit(1)
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host}`)
  let requestPath = decodeURIComponent(url.pathname)

  if (requestPath.endsWith('/')) {
    requestPath += 'index.html'
  }

  const filePath = resolveFile(requestPath)

  if (!filePath) {
    send(res, 403, 'Forbidden')
    return
  }

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      serveFile(res, filePath)
      return
    }

    const indexPath = path.join(DIST_DIR, 'index.html')
    serveFile(res, indexPath)
  })
})

server.listen(PORT, HOST, () => {
  const url = `http://${HOST}:${PORT}`
  console.log(`[GlowCollage] Server running at ${url}`)
  console.log('[GlowCollage] Press Ctrl+C to stop.')
})
