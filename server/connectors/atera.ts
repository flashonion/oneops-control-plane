import type { ConnectorAdapter } from '../../src/services/connectors'
import type { CompanyId, Device, Ticket } from '../../src/types'

type TenantCompany = Exclude<CompanyId, 'all'>
type CompanyResolver = (customerId?: number | string, customerName?: string) => TenantCompany

interface AteraAgent {
  AgentID?: number | string
  MachineID?: number | string
  DeviceGuid?: string
  MachineName?: string
  ComputerName?: string
  CustomerID?: number | string
  CustomerName?: string
  OS?: string
  OSVersion?: string
  Vendor?: string
  ProductName?: string
  LastSeen?: string
  LastSeenTime?: string
  Online?: boolean
  IsOnline?: boolean
  LoggedUsername?: string
  CurrentUser?: string
  IPAddress?: string
  IPAddresses?: string[] | string
}

interface AteraTicket {
  TicketID?: number | string
  TicketTitle?: string
  Title?: string
  EndUserFirstName?: string
  EndUserLastName?: string
  EndUserEmail?: string
  CustomerID?: number | string
  CustomerName?: string
  TicketPriority?: string | number
  Priority?: string | number
  TicketStatus?: string
  Status?: string
  CreatedDate?: string
  TicketCreatedDate?: string
}

interface AteraPage<T> {
  items?: T[]
  Items?: T[]
  value?: T[]
  totalItemCount?: number
  TotalItemCount?: number
}

const PAGE_SIZE = 50

function recordsFrom<T>(payload: T[] | AteraPage<T>) {
  if (Array.isArray(payload)) return payload
  return payload.items || payload.Items || payload.value || []
}

function totalFrom<T>(payload: T[] | AteraPage<T>) {
  return Array.isArray(payload) ? payload.length : payload.totalItemCount ?? payload.TotalItemCount
}

function relativeAge(value?: string) {
  if (!value) return 'Unknown'
  const minutes = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 60_000))
  if (minutes < 60) return `${minutes}m`
  if (minutes < 1_440) return `${Math.floor(minutes / 60)}h`
  return `${Math.floor(minutes / 1_440)}d`
}

function displayName(ticket: AteraTicket) {
  const fullName = [ticket.EndUserFirstName, ticket.EndUserLastName].filter(Boolean).join(' ')
  return fullName || ticket.EndUserEmail || 'Unknown requester'
}

function priority(value?: string | number): Ticket['priority'] {
  const normalized = String(value ?? '').toLowerCase()
  if (normalized === 'critical' || normalized === 'urgent' || normalized === '1') return 'Urgent'
  if (normalized === 'high' || normalized === '2') return 'High'
  if (normalized === 'low' || normalized === '4') return 'Low'
  return 'Normal'
}

export function mapAteraAgent(agent: AteraAgent, resolveCompany: CompanyResolver): Device {
  const id = String(agent.DeviceGuid || agent.AgentID || agent.MachineID || crypto.randomUUID())
  const user = agent.LoggedUsername || agent.CurrentUser || 'Unassigned'
  const online = agent.Online ?? agent.IsOnline ?? false
  const rawIp = Array.isArray(agent.IPAddresses) ? agent.IPAddresses[0] : agent.IPAddresses
  return {
    id,
    name: agent.MachineName || agent.ComputerName || `ATERA-${id.slice(0, 8).toUpperCase()}`,
    user,
    initials: user.split(/[\\/@._ -]+/).filter(Boolean).slice(-2).map((part) => part[0]?.toUpperCase()).join('') || 'NA',
    company: resolveCompany(agent.CustomerID, agent.CustomerName),
    os: [agent.OS, agent.OSVersion].filter(Boolean).join(' ') || 'Unknown OS',
    model: [agent.Vendor, agent.ProductName].filter(Boolean).join(' ') || 'Unknown model',
    status: online ? 'healthy' : 'offline',
    compliance: online ? 'Compliant' : 'At risk',
    lastSeen: relativeAge(agent.LastSeen || agent.LastSeenTime),
    sources: ['atera'],
    risk: online ? 10 : 70,
    ip: rawIp || agent.IPAddress || 'Not reported',
  }
}

export function mapAteraTicket(ticket: AteraTicket, resolveCompany: CompanyResolver): Ticket {
  return {
    id: String(ticket.TicketID || 'ATERA-UNKNOWN'),
    title: ticket.TicketTitle || ticket.Title || 'Untitled ticket',
    requester: displayName(ticket),
    company: resolveCompany(ticket.CustomerID, ticket.CustomerName),
    priority: priority(ticket.TicketPriority ?? ticket.Priority),
    age: relativeAge(ticket.CreatedDate || ticket.TicketCreatedDate),
    source: 'atera',
  }
}

export class AteraConnector implements ConnectorAdapter {
  readonly id = 'atera' as const
  private agentsInFlight: Promise<Device[]> | null = null
  private ticketsInFlight: Promise<Ticket[]> | null = null

  constructor(
    private readonly apiKey: string,
    private readonly resolveCompany: CompanyResolver,
    private readonly fetchImpl: typeof fetch = fetch,
    private readonly baseUrl = 'https://app.atera.com/api/v3',
  ) {}

  private async paged<T>(path: string) {
    const records: T[] = []
    for (let page = 1; page <= 100; page += 1) {
      const url = new URL(`${this.baseUrl}${path}`)
      url.searchParams.set('page', String(page))
      url.searchParams.set('itemsInPage', String(PAGE_SIZE))
      const response = await this.fetchImpl(url, { headers: { 'X-API-KEY': this.apiKey, accept: 'application/json' } })
      if (!response.ok) throw new Error(`Atera ${path} failed (${response.status})`)
      const payload = await response.json() as T[] | AteraPage<T>
      const batch = recordsFrom(payload)
      records.push(...batch)
      const total = totalFrom(payload)
      if (batch.length < PAGE_SIZE || (total !== undefined && records.length >= total)) break
    }
    return records
  }

  private agents() {
    this.agentsInFlight ??= this.paged<AteraAgent>('/agents')
      .then((items) => items.map((item) => mapAteraAgent(item, this.resolveCompany)))
      .finally(() => { this.agentsInFlight = null })
    return this.agentsInFlight
  }

  private ticketRecords() {
    this.ticketsInFlight ??= this.paged<AteraTicket>('/tickets')
      .then((items) => items.filter((item) => !['closed', 'resolved'].includes(String(item.TicketStatus || item.Status).toLowerCase())).map((item) => mapAteraTicket(item, this.resolveCompany)))
      .finally(() => { this.ticketsInFlight = null })
    return this.ticketsInFlight
  }

  async health() {
    const agents = await this.agents()
    return { id: this.id, name: 'Atera', detail: 'Tickets, alerts & agents', synced: new Date().toISOString(), status: 'Connected' as const, records: agents.length.toLocaleString('en-AU'), color: '#13a16d' }
  }

  devices() { return this.agents() }
  tickets() { return this.ticketRecords() }
}
