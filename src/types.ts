export type CompanyId = 'northstar' | 'harbour' | 'all'
export type DeviceStatus = 'healthy' | 'warning' | 'critical' | 'offline'
export type SourceId = 'intune' | 'atera' | 'screenconnect' | 'snip-ip'

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
