import type { ConnectorAdapter } from '../../src/services/connectors'
import type { Device } from '../../src/types'

interface GraphManagedDevice {
  id: string
  deviceName?: string
  userDisplayName?: string
  userPrincipalName?: string
  operatingSystem?: string
  osVersion?: string
  model?: string
  complianceState?: string
  lastSyncDateTime?: string
  wiFiMacAddress?: string
}

interface GraphPage<T> {
  value: T[]
  '@odata.nextLink'?: string
}

type TokenProvider = () => Promise<string>

function initials(value: string) {
  return value.split(/[\s.@_-]+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'NA'
}

function lastSeen(value?: string) {
  if (!value) return 'Unknown'
  const minutes = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 60_000))
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min ago`
  if (minutes < 1_440) return `${Math.floor(minutes / 60)} hr ago`
  return `${Math.floor(minutes / 1_440)} days ago`
}

export function mapManagedDevice(item: GraphManagedDevice, company: Device['company']): Device {
  const compliance = item.complianceState === 'compliant' ? 'Compliant' : item.complianceState === 'noncompliant' ? 'Noncompliant' : 'At risk'
  const syncAge = item.lastSyncDateTime ? Date.now() - new Date(item.lastSyncDateTime).getTime() : Number.POSITIVE_INFINITY
  const status = compliance === 'Noncompliant' ? 'critical' : syncAge > 24 * 60 * 60 * 1_000 ? 'offline' : compliance === 'At risk' ? 'warning' : 'healthy'
  const user = item.userDisplayName || item.userPrincipalName || 'Unassigned'

  return {
    id: item.id,
    name: item.deviceName || `INTUNE-${item.id.slice(0, 8).toUpperCase()}`,
    user,
    initials: initials(user),
    company,
    os: [item.operatingSystem, item.osVersion].filter(Boolean).join(' ') || 'Unknown OS',
    model: item.model || 'Unknown model',
    status,
    compliance,
    lastSeen: lastSeen(item.lastSyncDateTime),
    sources: ['intune'],
    risk: status === 'critical' ? 90 : status === 'offline' ? 70 : status === 'warning' ? 45 : 5,
    ip: 'Not reported',
  }
}

export class MicrosoftGraphConnector implements ConnectorAdapter {
  readonly id = 'intune' as const
  private inFlight: Promise<Device[]> | null = null

  constructor(
    private readonly tokenProvider: TokenProvider,
    private readonly company: Device['company'],
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  private async collectDevices() {
    const token = await this.tokenProvider()
    const fields = 'id,deviceName,userDisplayName,userPrincipalName,operatingSystem,osVersion,model,complianceState,lastSyncDateTime,wiFiMacAddress'
    let url: string | undefined = `https://graph.microsoft.com/v1.0/deviceManagement/managedDevices?$select=${fields}`
    const records: GraphManagedDevice[] = []

    while (url) {
      const response = await this.fetchImpl(url, { headers: { authorization: `Bearer ${token}`, accept: 'application/json' } })
      if (!response.ok) throw new Error(`Microsoft Graph managedDevices failed (${response.status})`)
      const page = await response.json() as GraphPage<GraphManagedDevice>
      records.push(...page.value)
      url = page['@odata.nextLink']
    }

    return records.map((item) => mapManagedDevice(item, this.company))
  }

  private loadDevices() {
    this.inFlight ??= this.collectDevices().finally(() => { this.inFlight = null })
    return this.inFlight
  }

  async health() {
    const records = await this.loadDevices()
    return { id: this.id, name: 'Microsoft Intune', detail: 'Devices, compliance & identity', synced: new Date().toISOString(), status: 'Connected' as const, records: records.length.toLocaleString('en-AU'), color: '#2563eb' }
  }

  devices() {
    return this.loadDevices()
  }

  async tickets() {
    return []
  }
}
