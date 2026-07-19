import { describe, expect, it } from 'vitest'
import { mergeDevice } from './connectors'
import type { Device } from '../types'

const base: Device = {
  id: 'device-1', name: 'SYD-LT-001', user: 'Demo User', initials: 'DU',
  company: 'northstar', os: 'Windows 11', model: 'Demo Model', status: 'healthy',
  compliance: 'Compliant', lastSeen: 'now', sources: ['intune'], risk: 8,
  ip: '10.0.0.1',
}

describe('device reconciliation', () => {
  it('preserves canonical identity while selecting the worst health signals', () => {
    const merged = mergeDevice(base, {
      ...base,
      name: 'provider-specific-name',
      status: 'critical',
      compliance: 'Noncompliant',
      risk: 91,
      sources: ['atera'],
    })

    expect(merged.name).toBe('SYD-LT-001')
    expect(merged.status).toBe('critical')
    expect(merged.compliance).toBe('Noncompliant')
    expect(merged.risk).toBe(91)
    expect(merged.sources).toEqual(['intune', 'atera'])
  })
})
