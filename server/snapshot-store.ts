import { collectSnapshot, type ConnectorAdapter, type UnifiedSnapshot } from '../src/services/connectors'

export interface SnapshotEnvelope {
  data: UnifiedSnapshot
  cached: boolean
  stale: boolean
  ageMs: number
}

export class SnapshotStore {
  private current: UnifiedSnapshot | null = null
  private collectedAt = 0
  private inFlight: Promise<UnifiedSnapshot> | null = null

  constructor(
    private readonly adapters: ConnectorAdapter[],
    private readonly ttlMs: number,
  ) {}

  async get(force = false): Promise<SnapshotEnvelope> {
    const ageMs = Date.now() - this.collectedAt
    if (!force && this.current && ageMs < this.ttlMs) {
      return { data: this.current, cached: true, stale: false, ageMs }
    }

    try {
      this.inFlight ??= collectSnapshot(this.adapters).finally(() => { this.inFlight = null })
      const data = await this.inFlight
      this.current = data
      this.collectedAt = Date.now()
      return { data, cached: false, stale: false, ageMs: 0 }
    } catch (error) {
      if (this.current) {
        return { data: this.current, cached: true, stale: true, ageMs }
      }
      throw error
    }
  }
}
