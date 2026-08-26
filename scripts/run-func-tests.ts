/**
 * Functional (Playwright) test runner.
 *
 * Boots a throwaway MongoDB via `docker-compose.e2e.yml` when nothing is
 * already listening on 127.0.0.1:27017, then delegates to Playwright.
 *
 * Env:
 *   E2E_SKIP_DOCKER_MONGO=1  Never touch Docker (Atlas / already-running Mongo)
 */
import { spawn, spawnSync } from 'node:child_process'
import { createConnection } from 'node:net'
import { existsSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import dotenv from 'dotenv'

dotenv.config({ path: '.env', quiet: true })
dotenv.config({ path: '.env.local', override: true, quiet: true })

const COMPOSE_FILE = 'docker-compose.e2e.yml'
const MONGO_HOST = '127.0.0.1'
const MONGO_PORT = 27017

const log = (message: string) => console.log(`[func-tests] ${message}`)

const isPortOpen = (host: string, port: number, timeoutMs = 1000) =>
  new Promise<boolean>((resolve) => {
    const socket = createConnection({ host, port })
    const finish = (open: boolean) => {
      socket.destroy()
      resolve(open)
    }

    socket.setTimeout(timeoutMs)
    socket.once('connect', () => finish(true))
    socket.once('timeout', () => finish(false))
    socket.once('error', () => finish(false))
  })

const hasDocker = () => {
  const result = spawnSync('docker', ['--version'], {
    stdio: 'ignore',
    shell: true
  })
  return result.status === 0
}

const composeCommand = (args: string[]) =>
  spawnSync('docker', ['compose', '-f', COMPOSE_FILE, ...args], {
    stdio: 'inherit',
    shell: true
  })

const waitForMongo = async (attempts = 30) => {
  for (let attempt = 0; attempt < attempts; attempt++) {
    if (await isPortOpen(MONGO_HOST, MONGO_PORT)) return true
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
  return false
}

const startDockerMongo = async () => {
  if (process.env.E2E_SKIP_DOCKER_MONGO === '1') {
    log('E2E_SKIP_DOCKER_MONGO=1 — using the configured MONGODB_URI as-is.')
    return null
  }

  if (await isPortOpen(MONGO_HOST, MONGO_PORT)) {
    log(`MongoDB already reachable on ${MONGO_HOST}:${MONGO_PORT}.`)
    return null
  }

  if (!existsSync(path.resolve(process.cwd(), COMPOSE_FILE))) {
    log(`${COMPOSE_FILE} not found — continuing without a local MongoDB.`)
    return null
  }

  if (!hasDocker()) {
    log('Docker is unavailable — continuing without a local MongoDB.')
    return null
  }

  log('Starting MongoDB via Docker Compose...')
  const up = composeCommand(['up', '-d'])

  if (up.status !== 0) {
    log('Docker Compose failed to start MongoDB — continuing anyway.')
    return null
  }

  if (!(await waitForMongo())) {
    log('MongoDB did not become reachable in time — continuing anyway.')
  }

  return () => {
    log('Stopping Docker MongoDB...')
    composeCommand(['down'])
  }
}

const runPlaywright = (args: string[]) =>
  new Promise<number>((resolve) => {
    const child = spawn('yarn', ['playwright', 'test', ...args], {
      stdio: 'inherit',
      shell: true
    })
    child.on('close', (code) => resolve(code ?? 1))
  })

const main = async () => {
  // `yarn test:e2e:ui -- --ui` forwards a bare `--` separator; drop it.
  const forwardedArgs = process.argv.slice(2).filter((arg) => arg !== '--')

  const stopMongo = await startDockerMongo()

  try {
    const exitCode = await runPlaywright(forwardedArgs)
    process.exitCode = exitCode
  } finally {
    stopMongo?.()
  }
}

main().catch((error) => {
  console.error('[func-tests] Unexpected failure:', error)
  process.exitCode = 1
})
