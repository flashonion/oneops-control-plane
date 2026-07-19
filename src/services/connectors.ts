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
    byId.set(device.id, current ? { ...current, ...device, sources: [...new Set([...current.sources, ...device.sources])] } : device)
  }

  return {
    generatedAt: new Date().toISOString(),
    connectors,
    devices: [...byId.values()],
    tickets: ticketGroups.flat(),
  }
}
