import crypto from 'node:crypto'
import type { ConnectorAdapter } from '../src/services/connectors'
import type { ConnectorRun } from '../src/types'

function safeError(error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown connector error'
  return message.replace(/(api[_-]?key|token|secret)=?[^\s&]*/gi, '$1=[redacted]').slice(0, 180)
}

export class ConnectorTelemetry {
  private readonly runs: ConnectorRun[] = []

  constructor(private readonly limit = 100) {}

  instrument(adapter: ConnectorAdapter): ConnectorAdapter {
    const measured = async <T>(operation: ConnectorRun['operation'], action: () => Promise<T>, count: (value: T) => number | undefined) => {
      const started = Date.now()
      try {
        const value = await action()
        this.add({ id: crypto.randomUUID(), connectorId: adapter.id, operation, status: 'success', startedAt: new Date(started).toISOString(), durationMs: Date.now() - started, recordCount: count(value) })
        return value
      } catch (error) {
        this.add({ id: crypto.randomUUID(), connectorId: adapter.id, operation, status: 'failed', startedAt: new Date(started).toISOString(), durationMs: Date.now() - started, error: safeError(error) })
        throw error
      }
    }

    return {
      id: adapter.id,
      health: () => measured('health', () => adapter.health(), () => 1),
      devices: () => measured('devices', () => adapter.devices(), (items) => items.length),
      tickets: () => measured('tickets', () => adapter.tickets(), (items) => items.length),
    }
  }

  private add(run: ConnectorRun) {
    this.runs.unshift(run)
    this.runs.splice(this.limit)
  }

  list() {
    return this.runs.map((run) => ({ ...run }))
  }
}
