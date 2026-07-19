import { connectors, devices, tickets } from '../../src/data'
import type { ConnectorAdapter } from '../../src/services/connectors'
import type { Connector, SourceId } from '../../src/types'

const latency: Record<SourceId, number> = {
  intune: 85,
  atera: 110,
  screenconnect: 70,
  'snip-ip': 145,
}

const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds))

export class DemoConnector implements ConnectorAdapter {
  constructor(public readonly id: SourceId) {}

  async health(): Promise<Connector> {
    await wait(latency[this.id])
    const connector = connectors.find((item) => item.id === this.id)
    if (!connector) throw new Error(`Missing demo connector: ${this.id}`)
    return { ...connector, synced: new Date().toISOString() }
  }

  async devices() {
    await wait(latency[this.id])
    return devices
      .filter((device) => device.sources.includes(this.id))
      .map((device) => ({ ...device, sources: [this.id] }))
  }

  async tickets() {
    await wait(latency[this.id])
    return tickets.filter((ticket) => ticket.source === this.id)
  }
}

export function createDemoConnectors(): ConnectorAdapter[] {
  return (['intune', 'atera', 'screenconnect', 'snip-ip'] as const).map((id) => new DemoConnector(id))
}
