import type { ConnectorAdapter } from '../../src/services/connectors'
import type { Device } from '../../src/types'

export interface ScreenConnectSession {
  id: string
  deviceId?: string
  machineName: string
  userDisplayName?: string
  userName?: string
  connected: boolean
  connectedAt?: string
  lastConnectedAt?: string
  lastActivityAt?: string
  idleMinutes?: number
  operatingSystem?: string
  model?: string
  ipAddress?: string
}

interface SessionEnvelope {
  sessions: ScreenConnectSession[]
}

type DeviceIdResolver = (session: ScreenConnectSession) => string

function initials(value: string) {
  return value.split(/[\s.@_-]+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'NA'
}

function elapsed(value?: string) {
  if (!value) return 'Unknown'
  const minutes = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 60_000))
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min ago`
  return `${Math.floor(minutes / 60)} hr ago`
}

export function mapScreenConnectSession(session: ScreenConnectSession, company: Device['company'], resolveDeviceId: DeviceIdResolver): Device {
  const user = session.userDisplayName || session.userName || 'Unassigned'
  const active = session.connected && (session.idleMinutes ?? 0) < 15
  const away = session.connected && !active
  return {
    id: resolveDeviceId(session),
    name: session.machineName,
    user,
    initials: initials(user),
    company,
    os: session.operatingSystem || 'Reported by ScreenConnect',
    model: session.model || 'Unknown model',
    status: session.connected ? 'healthy' : 'offline',
    compliance: 'At risk',
    lastSeen: session.connected ? 'Just now' : elapsed(session.lastConnectedAt),
    sources: ['screenconnect'],
    risk: session.connected ? 5 : 65,
    ip: session.ipAddress || 'Not reported',
    remoteSessionId: session.id,
    presence: {
      state: active ? 'online' : away ? 'away' : 'offline',
      activity: active ? 'Interactive session' : away ? 'Session idle' : 'Disconnected',
      since: active ? elapsed(session.connectedAt).replace(' ago', '') : elapsed(session.lastActivityAt),
      observedAt: new Date().toISOString(),
      source: 'screenconnect',
    },
  }
}

export class ScreenConnectConnector implements ConnectorAdapter {
  readonly id = 'screenconnect' as const
  private inFlight: Promise<Device[]> | null = null

  constructor(
    private readonly bridgeUrl: string,
    private readonly apiToken: string,
    private readonly company: Device['company'],
    private readonly resolveDeviceId: DeviceIdResolver = (session) => session.deviceId || session.id,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  private async collectSessions() {
    const response = await this.fetchImpl(`${this.bridgeUrl.replace(/\/$/, '')}/api/oneops/v1/sessions`, {
      headers: { authorization: `Bearer ${this.apiToken}`, accept: 'application/json' },
    })
    if (!response.ok) throw new Error(`ScreenConnect bridge failed (${response.status})`)
    const payload = await response.json() as SessionEnvelope
    return payload.sessions.map((session) => mapScreenConnectSession(session, this.company, this.resolveDeviceId))
  }

  private loadDevices() {
    this.inFlight ??= this.collectSessions().finally(() => { this.inFlight = null })
    return this.inFlight
  }

  async health() {
    const records = await this.loadDevices()
    return { id: this.id, name: 'ScreenConnect', detail: 'Presence, sessions & remote access', synced: new Date().toISOString(), status: 'Connected' as const, records: records.length.toLocaleString('en-AU'), color: '#7c5ce7' }
  }

  devices() {
    return this.loadDevices()
  }

  async tickets() {
    return []
  }
}
