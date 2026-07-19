import crypto from 'node:crypto'
import express, { type NextFunction, type Request, type Response } from 'express'
import type { AppConfig } from './config'
import { createDemoConnectors } from './connectors/demo'
import { SnapshotStore } from './snapshot-store'
import { ConnectorTelemetry } from './connector-telemetry'

export function createApp(config: AppConfig) {
  const app = express()
  const telemetry = new ConnectorTelemetry()
  const adapters = createDemoConnectors().map((adapter) => telemetry.instrument(adapter))
  const store = new SnapshotStore(adapters, config.SNAPSHOT_TTL_MS)

  app.disable('x-powered-by')
  app.use(express.json({ limit: '100kb' }))
  app.use((request, response, next) => {
    const requestId = request.header('x-request-id') || crypto.randomUUID()
    response.setHeader('x-request-id', requestId)
    response.setHeader('x-content-type-options', 'nosniff')
    response.setHeader('referrer-policy', 'no-referrer')
    next()
  })

  app.get('/health', (_request, response) => {
    response.json({ status: 'ok', mode: config.DATA_MODE, time: new Date().toISOString() })
  })

  app.get('/api/v1/snapshot', async (request, response, next) => {
    try {
      const force = request.query.refresh === 'true'
      const snapshot = await store.get(force)
      response.setHeader('cache-control', 'private, no-store')
      response.json({ ...snapshot, runs: telemetry.list() })
    } catch (error) {
      next(error)
    }
  })

  app.get('/api/v1/connectors', async (_request, response, next) => {
    try {
      const snapshot = await store.get()
      response.json({ data: snapshot.data.connectors, stale: snapshot.stale, ageMs: snapshot.ageMs, runs: telemetry.list() })
    } catch (error) {
      next(error)
    }
  })

  app.get('/api/v1/connector-runs', (_request, response) => {
    response.json({ data: telemetry.list() })
  })

  app.use((_request, response) => response.status(404).json({ error: { code: 'not_found', message: 'Route not found' } }))
  app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
    void _next
    const message = config.NODE_ENV === 'production' ? 'Unable to complete request' : error instanceof Error ? error.message : 'Unknown error'
    response.status(500).json({ error: { code: 'internal_error', message } })
  })

  return app
}
