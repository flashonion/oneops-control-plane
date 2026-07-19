import { describe, expect, it } from 'vitest'
import type { ConnectorAdapter } from '../src/services/connectors'
import { ConnectorTelemetry } from './connector-telemetry'

const adapter: ConnectorAdapter = {
  id: 'atera',
  health: async () => ({ id: 'atera', name: 'Atera', detail: '', synced: 'now', status: 'Connected', records: '0', color: '#000' }),
  devices: async () => [],
  tickets: async () => { throw new Error('token=should-not-leak provider failed') },
}

describe('ConnectorTelemetry', () => {
  it('captures success metrics and sanitised failures', async () => {
    const telemetry = new ConnectorTelemetry()
    const instrumented = telemetry.instrument(adapter)
    await instrumented.devices()
    await expect(instrumented.tickets()).rejects.toThrow('provider failed')
    const runs = telemetry.list()
    expect(runs).toHaveLength(2)
    expect(runs[1]?.recordCount).toBe(0)
    expect(runs[0]?.status).toBe('failed')
    expect(runs[0]?.error).not.toContain('should-not-leak')
  })
})
