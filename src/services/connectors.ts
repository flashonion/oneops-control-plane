import type { Connector, Device, SourceId, Ticket } from '../types'

export interface ConnectorAdapter {
  readonly id: SourceId
  health(): Promise<Connector>
  devices(): Promise<Device[]>
  tickets(): Promise<Ticket[]>
}

export interface UnifiedSnapshot {
  generatedAt: string
  connectors: Connector[]
  devices: Device[]
  tickets: Ticket[]
}

const statusRank = { healthy: 0, warning: 1, offline: 2, critical: 3 }
const complianceRank = { Compliant: 0, 'At risk': 1, Noncompliant: 2 }

export function mergeDevice(current: Device, incoming: Device): Device {
  const presence = incoming.presence
    ? { ...incoming.presence, source: current.presence ? 'combined' as const : incoming.presence.source }
    : current.presence
  return {
    ...current,
    status: statusRank[incoming.status] > statusRank[current.status] ? incoming.status : current.status,
    compliance: complianceRank[incoming.compliance] > complianceRank[current.compliance] ? incoming.compliance : current.compliance,
    risk: Math.max(current.risk, incoming.risk),
    sources: [...new Set([...current.sources, ...incoming.sources])],
    workplace: current.workplace ?? incoming.workplace,
    presence,
    remoteSessionId: incoming.remoteSessionId ?? current.remoteSessionId,
  }
}

// Production adapters implement this boundary server-side. Browser code never
// receives provider secrets or upstream session cookies.
export async function collectSnapshot(adapters: ConnectorAdapter[]): Promise<UnifiedSnapshot> {
  const [connectors, deviceGroups, ticketGroups] = await Promise.all([
    Promise.all(adapters.map((adapter) => adapter.health())),
    Promise.all(adapters.map((adapter) => adapter.devices())),
    Promise.all(adapters.map((adapter) => adapter.tickets())),
  ])

  const byId = new Map<string, Device>()
  for (const device of deviceGroups.flat()) {
    const current = byId.get(device.id)
    byId.set(device.id, current ? mergeDevice(current, device) : device)
  }

  return {
    generatedAt: new Date().toISOString(),
    connectors,
    devices: [...byId.values()],
    tickets: ticketGroups.flat(),
  }
}
