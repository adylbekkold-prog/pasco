import { existsSync, readFileSync } from 'node:fs'
import { createServer as createHttpServer } from 'node:http'
import { createServer as createHttpsServer } from 'node:https'
import path from 'node:path'
import next from 'next'

const projectRoot = process.cwd()
const certificateDirectory = path.join(projectRoot, '.cert')
const certificatePath = path.join(certificateDirectory, 'pasco-lab-local.pfx')
const certificateExportPath = path.join(certificateDirectory, 'pasco-lab-local.cer')
const configPath = path.join(certificateDirectory, 'local-https.json')

if (!existsSync(certificatePath) || !existsSync(configPath)) {
  console.error('Local HTTPS certificate is missing.')
  console.error('Run: npm run https:setup')
  process.exit(1)
}

const config = JSON.parse(readFileSync(configPath, 'utf8'))
const hostname = '0.0.0.0'
const httpPort = Number(process.env.PASCO_HTTP_PORT || 3000)
const httpsPort = Number(process.env.PASCO_HTTPS_PORT || 3443)
const publicHosts = new Set(['localhost', '127.0.0.1', config.ipAddress])
const tlsOptions = {
  pfx: readFileSync(certificatePath),
  passphrase: config.passphrase,
}

const httpsServer = createHttpsServer(tlsOptions)
const app = next({
  dev: false,
  dir: projectRoot,
  hostname,
  port: httpsPort,
  httpServer: httpsServer,
})
const handle = app.getRequestHandler()

function listen(server, port) {
  return new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(port, hostname, () => {
      server.off('error', reject)
      resolve()
    })
  })
}

function getRedirectHost(hostHeader) {
  const requestedHost = String(hostHeader || '').replace(/:\d+$/, '').toLowerCase()
  return publicHosts.has(requestedHost) ? requestedHost : config.ipAddress
}

await app.prepare()

httpsServer.on('request', (request, response) => {
  handle(request, response)
})

const httpServer = createHttpServer((request, response) => {
  const redirectHost = getRedirectHost(request.headers.host)
  const requestPath = request.url?.startsWith('/') ? request.url : '/'
  const pathname = requestPath.split('?')[0]

  if (pathname === '/pasco-lab-local.cer' && existsSync(certificateExportPath)) {
    const certificate = readFileSync(certificateExportPath)
    response.writeHead(200, {
      'cache-control': 'no-store',
      'content-disposition': 'attachment; filename="pasco-lab-local.cer"',
      'content-length': certificate.length,
      'content-type': 'application/x-x509-ca-cert',
    })
    response.end(certificate)
    return
  }

  const location = `https://${redirectHost}:${httpsPort}${requestPath}`

  response.writeHead(308, {
    'cache-control': 'no-store',
    location,
  })
  response.end()
})

await Promise.all([
  listen(httpsServer, httpsPort),
  listen(httpServer, httpPort),
])

console.log(`PASCO Lab HTTPS: https://${config.ipAddress}:${httpsPort}`)
console.log(`PASCO Lab redirect: http://${config.ipAddress}:${httpPort}`)

function shutdown() {
  httpServer.close()
  httpsServer.close()
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

