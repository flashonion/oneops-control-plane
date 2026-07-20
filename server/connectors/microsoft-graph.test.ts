import { describe, expect, it, vi } from 'vitest'
import { collectGraphPresences, mapManagedDevice, MicrosoftGraphConnector } from './microsoft-graph'

describe('MicrosoftGraphConnector', () => {
  it('maps Intune compliance into the canonical risk model', () => {
    const device = mapManagedDevice({
      id: 'abc-123', deviceName: 'SYD-LT-900', userDisplayName: 'Jamie Lee',
      operatingSystem: 'Windows', osVersion: '11', complianceState: 'noncompliant',
      lastSyncDateTime: new Date().toISOString(), model: 'Surface Laptop',
    }, 'northstar')

    expect(device.name).toBe('SYD-LT-900')
    expect(device.initials).toBe('JL')
    expect(device.status).toBe('critical')
    expect(device.risk).toBe(90)
  })

  it('follows Graph pagination and shares collection between adapter methods', async () => {
    const token = vi.fn(async () => 'test-token')
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify({ value: [{ id: 'one', deviceName: 'ONE', complianceState: 'compliant', lastSyncDateTime: new Date().toISOString() }], '@odata.nextLink': 'https://graph.microsoft.com/page-2' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ value: [{ id: 'two', deviceName: 'TWO', complianceState: 'compliant', lastSyncDateTime: new Date().toISOString() }] }), { status: 200 }))
    const connector = new MicrosoftGraphConnector(token, 'northstar', fetcher)

    const [health, devices] = await Promise.all([connector.health(), connector.devices()])

    expect(devices).toHaveLength(2)
    expect(health.records).toBe('2')
    expect(token).toHaveBeenCalledTimes(1)
    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  it('collects Microsoft presence in one bounded batch', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ value: [{ id: 'user-1', availability: 'Busy', activity: 'InACall' }] }), { status: 200 }))
    const result = await collectGraphPresences(['user-1', 'user-1'], 'test-token', fetcher)
    expect(result.get('user-1')?.activity).toBe('InACall')
    expect(fetcher).toHaveBeenCalledWith('https://graph.microsoft.com/v1.0/communications/getPresencesByUserId', expect.objectContaining({ method: 'POST', body: JSON.stringify({ ids: ['user-1'] }) }))
  })
})
