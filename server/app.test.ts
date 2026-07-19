import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { createApp } from './app'

const config = {
  NODE_ENV: 'test' as const,
  PORT: 4174,
  DATA_MODE: 'demo' as const,
  SNAPSHOT_TTL_MS: 30_000,
}

describe('OneOps API', () => {
  it('reports service health without exposing implementation headers', async () => {
    const response = await request(createApp(config)).get('/health').expect(200)
    expect(response.body.status).toBe('ok')
    expect(response.body.mode).toBe('demo')
    expect(response.headers['x-powered-by']).toBeUndefined()
    expect(response.headers['x-request-id']).toBeTruthy()
  })

  it('collects and caches a unified provider snapshot', async () => {
    const app = createApp(config)
    const first = await request(app).get('/api/v1/snapshot').expect(200)
    const second = await request(app).get('/api/v1/snapshot').expect(200)

    expect(first.body.cached).toBe(false)
    expect(first.body.data.connectors).toHaveLength(4)
    expect(first.body.data.devices).toHaveLength(7)
    expect(second.body.cached).toBe(true)
  })

  it('returns a structured 404', async () => {
    const response = await request(createApp(config)).get('/missing').expect(404)
    expect(response.body.error.code).toBe('not_found')
  })

  it('exposes sanitised connector run diagnostics', async () => {
    const app = createApp(config)
    await request(app).get('/api/v1/snapshot').expect(200)
    const response = await request(app).get('/api/v1/connector-runs').expect(200)
    expect(response.body.data).toHaveLength(12)
    expect(response.body.data[0]).toMatchObject({ status: 'success' })
    expect(response.body.data[0]).not.toHaveProperty('credentials')
  })
})
