import { describe, expect, it, vi } from 'vitest'
import type { ConnectorAdapter } from '../src/services/connectors'
import type { Connector, Device } from '../src/types'
import { SnapshotStore } from './snapshot-store'

const device: Device = {
  id: 'device-1', name: 'TEST-LT-001', user: 'Test User', initials: 'TU',
  company: 'northstar', os: 'Windows 11', model: 'Test', status: 'healthy',
  compliance: 'Compliant', lastSeen: 'now', sources: ['intune'], risk: 0,
  ip: '127.0.0.1',
}

function adapter(health: () => Promise<Connector>): ConnectorAdapter {
  return {
    id: 'intune',
    health,
    devices: async () => [device],
    tickets: async () => [],
  }
}

describe('SnapshotStore', () => {
  it('shares one collection between concurrent callers', async () => {
    const health = vi.fn(async () => ({ id: 'intune' as const, name: 'Intune', detail: '', synced: 'now', status: 'Connected' as const, records: '1', color: '#000' }))
    const store = new SnapshotStore([adapter(health)], 30_000)
    const [first, second] = await Promise.all([store.get(), store.get()])

    expect(health).toHaveBeenCalledTimes(1)
    expect(first.data).toBe(second.data)
  })

  it('returns the last snapshot as stale after a refresh failure', async () => {
    let fails = false
    const store = new SnapshotStore([adapter(async () => {
      if (fails) throw new Error('provider unavailable')
      return { id: 'intune', name: 'Intune', detail: '', synced: 'now', status: 'Connected', records: '1', color: '#000' }
    })], 30_000)

    await store.get()
    fails = true
    const fallback = await store.get(true)

    expect(fallback.stale).toBe(true)
    expect(fallback.cached).toBe(true)
    expect(fallback.data.devices).toHaveLength(1)
  })
})
