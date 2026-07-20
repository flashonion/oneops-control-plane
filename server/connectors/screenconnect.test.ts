import { describe, expect, it, vi } from 'vitest'
import { mapScreenConnectSession, ScreenConnectConnector } from './screenconnect'

describe('ScreenConnectConnector', () => {
  it('maps an interactive session into canonical presence', () => {
    const device = mapScreenConnectSession({ id: 'sc-1', deviceId: 'device-1', machineName: 'SYD-LT-001', userDisplayName: 'Jamie Lee', connected: true, connectedAt: new Date().toISOString(), idleMinutes: 2 }, 'northstar', (session) => session.deviceId!)
    expect(device.id).toBe('device-1')
    expect(device.presence?.state).toBe('online')
    expect(device.remoteSessionId).toBe('sc-1')
  })

  it('uses a server-side bearer token and shares concurrent collection', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ sessions: [{ id: 'sc-2', machineName: 'SYD-LT-002', connected: false }] }), { status: 200 }))
    const connector = new ScreenConnectConnector('https://support.example.test', 'test-token', 'northstar', undefined, fetcher)
    const [health, devices] = await Promise.all([connector.health(), connector.devices()])
    expect(health.records).toBe('1')
    expect(devices[0].presence?.state).toBe('offline')
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(fetcher.mock.calls[0][1]?.headers).toMatchObject({ authorization: 'Bearer test-token' })
  })
})
