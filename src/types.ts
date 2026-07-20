export type CompanyId = 'northstar' | 'harbour' | 'all'
export type DeviceStatus = 'healthy' | 'warning' | 'critical' | 'offline'
export type SourceId = 'intune' | 'atera' | 'screenconnect' | 'snip-ip'
export type PresenceState = 'online' | 'busy' | 'away' | 'offline'

export interface WorkplaceAssignment {
  siteId: string
  siteName: string
  floor: string
  deskId: string
  x: number
  y: number
  rotation?: 0 | 90 | 180 | 270
}

export interface DevicePresence {
  state: PresenceState
  activity: string
  since: string
  observedAt: string
  source: 'microsoft' | 'screenconnect' | 'combined'
}

export interface Device {
  id: string
  name: string
  user: string
  initials: string
  company: Exclude<CompanyId, 'all'>
  os: string
  model: string
  status: DeviceStatus
  compliance: 'Compliant' | 'At risk' | 'Noncompliant'
  lastSeen: string
  sources: SourceId[]
  risk: number
  ip: string
  workplace?: WorkplaceAssignment
  presence?: DevicePresence
  remoteSessionId?: string
}

export interface Ticket {
  id: string
  title: string
  requester: string
  company: Exclude<CompanyId, 'all'>
  priority: 'Urgent' | 'High' | 'Normal' | 'Low'
  age: string
  source: SourceId
}

export interface Connector {
  id: SourceId
  name: string
  detail: string
  synced: string
  status: 'Connected' | 'Attention'
  records: string
  color: string
}

export interface ConnectorRun {
  id: string
  connectorId: SourceId
  operation: 'health' | 'devices' | 'tickets'
  status: 'success' | 'failed'
  startedAt: string
  durationMs: number
  recordCount?: number
  error?: string
}
