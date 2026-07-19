import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import {
  Activity, AlertTriangle, Bell, Building2, Check, CheckCircle2, ChevronDown,
  ChevronRight, CircleHelp, Clock3, Command, ExternalLink, Gauge,
  LayoutDashboard, Laptop, Menu, MonitorUp, MoreHorizontal, PlugZap, RefreshCw,
  Search, ShieldCheck, SlidersHorizontal, TicketCheck, Users, Wifi, X, Zap,
} from 'lucide-react'
import { useSnapshot } from './hooks/useSnapshot'
import type { CompanyId, Connector, Device, DeviceStatus, SourceId, Ticket } from './types'

type View = 'overview' | 'devices' | 'tickets' | 'integrations'

const HealthChart = lazy(() => import('./components/HealthChart'))

const companyNames = { all: 'All companies', northstar: 'Northstar Group', harbour: 'Harbour Labs' }
const sourceNames: Record<SourceId, string> = { intune: 'Intune', atera: 'Atera', screenconnect: 'ScreenConnect', 'snip-ip': 'Snip-IP' }

function StatusDot({ status }: { status: DeviceStatus }) {
  return <span className={`status-dot ${status}`} aria-label={status} />
}

function SourceBadge({ source }: { source: SourceId }) {
  return <span className={`source-badge source-${source}`} title={sourceNames[source]}>{sourceNames[source].slice(0, 1)}</span>
}

function EmptyState() {
  return <div className="empty-state"><Search size={22} /><strong>No matching records</strong><span>Try a different search or company.</span></div>
}

function DeviceTable({ rows, onSelect }: { rows: Device[]; onSelect: (device: Device) => void }) {
  if (!rows.length) return <EmptyState />
  return (
    <div className="table-scroll">
      <table>
        <thead><tr><th>Device</th><th>User</th><th>Health</th><th>Compliance</th><th>Last seen</th><th>Sources</th><th><span className="sr-only">Open</span></th></tr></thead>
        <tbody>{rows.map((device) => (
          <tr key={device.id} onClick={() => onSelect(device)} tabIndex={0} onKeyDown={(event) => event.key === 'Enter' && onSelect(device)}>
            <td><div className="device-cell"><span className="device-icon"><Laptop size={17} /></span><span><strong>{device.name}</strong><small>{device.os}</small></span></div></td>
            <td><div className="user-cell"><span className="avatar small">{device.initials}</span><span>{device.user}</span></div></td>
            <td><span className="health-label"><StatusDot status={device.status} />{device.status[0].toUpperCase() + device.status.slice(1)}</span></td>
            <td><span className={`compliance ${device.compliance.toLowerCase().replace(' ', '-')}`}>{device.compliance}</span></td>
            <td className="muted">{device.lastSeen}</td>
            <td><div className="sources">{device.sources.map((source) => <SourceBadge key={source} source={source} />)}</div></td>
            <td><ChevronRight size={17} className="row-arrow" /></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  )
}

function DeviceDrawer({ device, onClose }: { device: Device; onClose: () => void }) {
  return <div className="drawer-layer" role="dialog" aria-modal="true" aria-label="Device details" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <aside className="drawer">
      <header className="drawer-header"><div><span className="eyebrow">Unified device record</span><h2>{device.name}</h2></div><button className="icon-btn" onClick={onClose} title="Close"><X size={19} /></button></header>
      <div className="drawer-status"><span className={`device-hero-icon ${device.status}`}><Laptop size={25} /></span><div><strong>{device.model}</strong><span>{device.os}</span></div><span className={`risk-score risk-${device.status}`}>{device.risk} risk</span></div>
      <section className="drawer-section"><h3>Overview</h3><dl className="details-grid"><div><dt>Assigned user</dt><dd>{device.user}</dd></div><div><dt>Company</dt><dd>{companyNames[device.company]}</dd></div><div><dt>IP address</dt><dd>{device.ip}</dd></div><div><dt>Last seen</dt><dd>{device.lastSeen}</dd></div><div><dt>Compliance</dt><dd>{device.compliance}</dd></div><div><dt>Asset ID</dt><dd>{device.id.toUpperCase()}</dd></div></dl></section>
      <section className="drawer-section"><h3>Source coverage</h3><div className="coverage-list">{device.sources.map((source) => <div key={source}><SourceBadge source={source} /><span><strong>{sourceNames[source]}</strong><small>Record matched and synced</small></span><CheckCircle2 size={18} /></div>)}</div></section>
      <section className="drawer-section"><h3>Recent activity</h3><div className="timeline"><div><span /><p><strong>Device inventory refreshed</strong><small>2 minutes ago via Intune</small></p></div><div><span /><p><strong>Interactive user session detected</strong><small>8 minutes ago via ScreenConnect</small></p></div><div><span /><p><strong>Compliance policy changed</strong><small>Yesterday at 4:32 PM</small></p></div></div></section>
      <footer className="drawer-footer"><button className="secondary-btn"><ExternalLink size={16} />Open source record</button><button className="primary-btn"><MonitorUp size={16} />Start remote session</button></footer>
    </aside>
  </div>
}

function TicketDrawer({ ticket, device, onClose }: { ticket: Ticket; device?: Device; onClose: () => void }) {
  return <div className="drawer-layer" role="dialog" aria-modal="true" aria-label="Ticket details" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <aside className="drawer ticket-drawer">
      <header className="drawer-header"><div><span className="eyebrow">{ticket.id}</span><h2>{ticket.title}</h2></div><button className="icon-btn" onClick={onClose} title="Close ticket"><X size={19}/></button></header>
      <div className="ticket-summary"><span className={`attention-icon ${ticket.priority === 'Urgent' ? 'critical' : 'warning'}`}><TicketCheck size={19}/></span><div><strong>{ticket.priority} priority</strong><span>Open for {ticket.age} · SLA target 4 hours</span></div><span className="priority-tag urgent">Open</span></div>
      <section className="drawer-section"><h3>Request context</h3><dl className="details-grid"><div><dt>Requester</dt><dd>{ticket.requester}</dd></div><div><dt>Company</dt><dd>{companyNames[ticket.company]}</dd></div><div><dt>Queue</dt><dd>Service Desk</dd></div><div><dt>Source</dt><dd>{sourceNames[ticket.source]}</dd></div><div><dt>Assigned to</dt><dd>Alex Stone</dd></div><div><dt>SLA status</dt><dd>{ticket.priority === 'Urgent' ? '32 min remaining' : 'On track'}</dd></div></dl></section>
      {device && <section className="drawer-section"><h3>Linked device</h3><div className="linked-device"><span className="device-icon"><Laptop size={17}/></span><span><strong>{device.name}</strong><small>{device.model} · {device.ip}</small></span><span className="health-label"><StatusDot status={device.status}/>{device.status}</span></div></section>}
      <section className="drawer-section"><h3>Activity</h3><div className="timeline"><div><span/><p><strong>Ticket triaged by OneOps</strong><small>Device and identity context attached automatically</small></p></div><div><span/><p><strong>Assigned to Alex Stone</strong><small>12 minutes ago via Atera</small></p></div><div><span/><p><strong>Request received</strong><small>{ticket.age} ago from {ticket.requester}</small></p></div></div></section>
      <section className="drawer-section response-box"><h3>Internal note</h3><textarea placeholder="Add a note for the service desk..." rows={4}/><div><button className="secondary-btn">Save draft</button><button className="primary-btn">Add note</button></div></section>
      <footer className="drawer-footer"><button className="secondary-btn"><ExternalLink size={16}/>Open in Atera</button><button className="primary-btn"><CheckCircle2 size={16}/>Resolve ticket</button></footer>
    </aside>
  </div>
}

function Overview({ filteredDevices, onSelect }: { filteredDevices: Device[]; onSelect: (d: Device) => void }) {
  const critical = filteredDevices.filter((d) => d.status === 'critical' || d.status === 'offline').length
  const complianceRate = 96
  return <>
    <div className="page-heading"><div><p className="eyebrow">Monday, 20 July</p><h1>Good morning, Alex</h1><p>Your environment is stable. {critical} devices need attention.</p></div><div className="heading-actions"><button className="secondary-btn"><SlidersHorizontal size={16} />Customise</button><button className="primary-btn"><Zap size={16} />Quick action</button></div></div>
    <section className="metric-grid" aria-label="Environment summary">
      <article className="metric"><div className="metric-top"><span className="metric-icon blue"><Laptop size={19} /></span><span className="delta positive">+18 this month</span></div><strong>1,248</strong><span>Managed devices</span><small><i className="online-dot" />1,106 online now</small></article>
      <article className="metric"><div className="metric-top"><span className="metric-icon green"><ShieldCheck size={19} /></span><span className="delta positive">+2.4%</span></div><strong>{complianceRate}%</strong><span>Device compliance</span><div className="progress"><i style={{ width: `${complianceRate}%` }} /></div></article>
      <article className="metric"><div className="metric-top"><span className="metric-icon amber"><TicketCheck size={19} /></span><span className="delta neutral">12 today</span></div><strong>38</strong><span>Open tickets</span><small>6 waiting on your team</small></article>
      <article className="metric"><div className="metric-top"><span className="metric-icon red"><AlertTriangle size={19} /></span><span className="delta negative">3 urgent</span></div><strong>17</strong><span>Active alerts</span><small>Down 8 since yesterday</small></article>
    </section>
    <div className="overview-grid">
      <section className="panel health-panel"><header className="panel-header"><div><h2>Environment health</h2><p>Compliance and availability across all companies</p></div><button className="icon-btn" title="More options"><MoreHorizontal size={19} /></button></header><Suspense fallback={<div className="chart-skeleton" aria-label="Loading environment chart" />}><HealthChart /></Suspense></section>
      <section className="panel attention-panel"><header className="panel-header"><div><h2>Needs attention</h2><p>Prioritised across every source</p></div><button className="link-btn">View all <ChevronRight size={15} /></button></header><div className="attention-list"><button onClick={() => filteredDevices[0] && onSelect(filteredDevices[0])}><span className="attention-icon critical"><ShieldCheck size={17}/></span><span><strong>3 noncompliant devices</strong><small>Encryption policy failed</small></span><span className="priority-tag urgent">Urgent</span></button><button><span className="attention-icon warning"><Wifi size={17}/></span><span><strong>4 devices offline</strong><small>For more than 2 hours</small></span><span className="priority-tag">Review</span></button><button><span className="attention-icon info"><Users size={17}/></span><span><strong>8 licenses available</strong><small>Microsoft 365 Business Premium</small></span><span className="priority-tag low">Info</span></button><button><span className="attention-icon warning"><Clock3 size={17}/></span><span><strong>6 tickets near SLA</strong><small>Next breach in 32 minutes</small></span><span className="priority-tag">Review</span></button></div></section>
    </div>
    <section className="panel device-panel"><header className="panel-header"><div><h2>Devices at risk</h2><p>Highest risk records from your connected systems</p></div><button className="link-btn">All devices <ChevronRight size={15} /></button></header><DeviceTable rows={filteredDevices.filter((d) => d.risk > 40).slice(0, 5)} onSelect={onSelect} /></section>
  </>
}

function DevicesView({ rows, onSelect }: { rows: Device[]; onSelect: (d: Device) => void }) {
  const [status, setStatus] = useState<'all' | DeviceStatus>('all')
  const visible = status === 'all' ? rows : rows.filter((d) => d.status === status)
  return <><div className="page-heading"><div><p className="eyebrow">Unified inventory</p><h1>Devices</h1><p>One record per endpoint, reconciled across every source.</p></div><button className="primary-btn"><RefreshCw size={16} />Sync inventory</button></div><div className="filter-bar"><div className="segmented">{(['all','healthy','warning','critical','offline'] as const).map((item) => <button key={item} className={status === item ? 'active' : ''} onClick={() => setStatus(item)}>{item[0].toUpperCase() + item.slice(1)}</button>)}</div><span>{visible.length} records</span></div><section className="panel full-table"><DeviceTable rows={visible} onSelect={onSelect} /></section></>
}

function TicketsView({ tickets, devices }: { tickets: Ticket[]; devices: Device[] }) {
  const [selected, setSelected] = useState<Ticket | null>(null)
  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === 'Escape' && setSelected(null)
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [])
  return <><div className="page-heading"><div><p className="eyebrow">Service desk</p><h1>Tickets</h1><p>Prioritised by SLA, user impact, and device health.</p></div><button className="primary-btn"><TicketCheck size={16} />New ticket</button></div><section className="ticket-stats"><div><strong>38</strong><span>Open</span></div><div><strong>6</strong><span>Near SLA</span></div><div><strong>14m</strong><span>First response</span></div><div><strong>92%</strong><span>SLA achieved</span></div></section><section className="panel ticket-list"><header className="panel-header"><div><h2>Priority queue</h2><p>Live from Atera, enriched with identity and device context</p></div></header>{tickets.map((ticket) => <button className="ticket-row" key={ticket.id} onClick={() => setSelected(ticket)}><span className={`ticket-priority ${ticket.priority.toLowerCase()}`} /><span className="ticket-id">{ticket.id}</span><span className="ticket-main"><strong>{ticket.title}</strong><small>{ticket.requester} · {companyNames[ticket.company]}</small></span><span className={`priority-tag ${ticket.priority === 'Urgent' ? 'urgent' : ''}`}>{ticket.priority}</span><span className="ticket-age"><Clock3 size={14}/>{ticket.age}</span><ChevronRight size={17}/></button>)}</section>{selected && <TicketDrawer ticket={selected} device={devices.find((device) => device.user === selected.requester)} onClose={() => setSelected(null)}/>}</>
}

function relativeSyncTime(value: string) {
  if (!value.includes('T')) return value
  const seconds = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 1000))
  return seconds < 60 ? `${seconds} sec ago` : `${Math.floor(seconds / 60)} min ago`
}

function IntegrationsView({ connectors }: { connectors: Connector[] }) {
  return <><div className="page-heading"><div><p className="eyebrow">Data fabric</p><h1>Integrations</h1><p>Monitor provider health, coverage, and synchronisation.</p></div><button className="primary-btn"><PlugZap size={16} />Add connection</button></div><section className="connector-grid">{connectors.map((connector) => <article className="connector-card" key={connector.id}><div className="connector-head"><span className="connector-mark" style={{ background: connector.color }}>{connector.name.slice(0, 1)}</span><button className="icon-btn"><MoreHorizontal size={18}/></button></div><h2>{connector.name}</h2><p>{connector.detail}</p><dl><div><dt>Status</dt><dd className={connector.status === 'Connected' ? 'ok-text' : 'warn-text'}><i />{connector.status}</dd></div><div><dt>Records</dt><dd>{connector.records}</dd></div><div><dt>Last sync</dt><dd>{relativeSyncTime(connector.synced)}</dd></div></dl><button className="secondary-btn full-width">Manage connection <ChevronRight size={16}/></button></article>)}</section><section className="integration-callout"><span><ShieldCheck size={22}/></span><div><strong>Secrets stay server-side</strong><p>Provider credentials are encrypted at rest and never exposed to the browser.</p></div><button className="secondary-btn">Security settings</button></section></>
}

export default function App() {
  const { snapshot, stale, syncing, error, refresh } = useSnapshot()
  const [view, setView] = useState<View>('overview')
  const [company, setCompany] = useState<CompanyId>('all')
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [companyOpen, setCompanyOpen] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)

  const filteredDevices = useMemo(() => snapshot.devices.filter((device) => (company === 'all' || device.company === company) && (!query || `${device.name} ${device.user} ${device.ip}`.toLowerCase().includes(query.toLowerCase()))), [company, query, snapshot.devices])
  const filteredTickets = useMemo(() => snapshot.tickets.filter((ticket) => (company === 'all' || ticket.company === company) && (!query || `${ticket.id} ${ticket.title} ${ticket.requester}`.toLowerCase().includes(query.toLowerCase()))), [company, query, snapshot.tickets])
  const runSync = () => void refresh(true)
  const navigate = (next: View) => { setView(next); setMobileNav(false) }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen(true)
      }
      if (event.key === 'Escape') {
        setSearchOpen(false)
        setCompanyOpen(false)
        setSelectedDevice(null)
        setMobileNav(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const nav = [
    { id: 'overview' as View, label: 'Overview', icon: LayoutDashboard },
    { id: 'devices' as View, label: 'Devices', icon: Laptop, count: 17 },
    { id: 'tickets' as View, label: 'Tickets', icon: TicketCheck, count: 38 },
    { id: 'integrations' as View, label: 'Integrations', icon: PlugZap },
  ]

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? 'mobile-open' : ''}`}>
      <div className="brand"><span><Activity size={21}/></span><strong>OneOps</strong><button className="mobile-close icon-btn" onClick={() => setMobileNav(false)}><X size={18}/></button></div>
      <nav>{nav.map((item) => <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => navigate(item.id)}><item.icon size={18}/><span>{item.label}</span>{item.count && <em>{item.count}</em>}</button>)}</nav>
      <div className="sidebar-label">Workspace</div>
      <nav><button><Users size={18}/><span>People</span></button><button><ShieldCheck size={18}/><span>Compliance</span></button><button><Gauge size={18}/><span>Reports</span></button></nav>
      <div className="sidebar-spacer" />
      <div className={`sync-status ${stale ? 'is-stale' : ''}`}><div className="sync-heading"><span><i />{stale ? 'Using cached data' : 'All systems operational'}</span><button className={`icon-btn ${syncing ? 'spin' : ''}`} onClick={runSync} title="Sync now"><RefreshCw size={15}/></button></div><small>{syncing ? 'Synchronising providers...' : `Last synced ${relativeSyncTime(snapshot.generatedAt)}`}</small></div>
      <nav className="sidebar-bottom"><button><CircleHelp size={18}/><span>Help & support</span></button></nav>
    </aside>
    {mobileNav && <button className="nav-scrim" aria-label="Close navigation" onClick={() => setMobileNav(false)} />}
    <div className="main-column">
      <header className="topbar"><button className="mobile-menu icon-btn" onClick={() => setMobileNav(true)}><Menu size={20}/></button><div className="company-picker"><button onClick={() => setCompanyOpen(!companyOpen)}><span className="company-logo"><Building2 size={16}/></span><span><small>Workspace</small><strong>{companyNames[company]}</strong></span><ChevronDown size={15}/></button>{companyOpen && <div className="company-menu">{(Object.keys(companyNames) as CompanyId[]).map((id) => <button key={id} onClick={() => { setCompany(id); setCompanyOpen(false) }}><span><strong>{companyNames[id]}</strong><small>{id === 'all' ? '2 companies' : id === 'northstar' ? '824 devices' : '424 devices'}</small></span>{company === id && <Check size={16}/>}</button>)}</div>}</div><button className="global-search" onClick={() => setSearchOpen(true)}><Search size={17}/><span>Search devices, people or tickets</span><kbd><Command size={11}/> K</kbd></button><div className="top-actions"><button className="icon-btn notification" title="Notifications"><Bell size={19}/><i /></button><span className="top-divider"/><button className="profile"><span className="avatar">AS</span><span><strong>Alex Stone</strong><small>IT Administrator</small></span><ChevronDown size={14}/></button></div></header>
      <main>{error && <div className="data-notice"><AlertTriangle size={16}/><span><strong>Live sync unavailable.</strong> Showing the most recent local data.</span><button onClick={() => void refresh(true)}>Retry</button></div>}{view === 'overview' && <Overview filteredDevices={filteredDevices} onSelect={setSelectedDevice}/>} {view === 'devices' && <DevicesView rows={filteredDevices} onSelect={setSelectedDevice}/>} {view === 'tickets' && <TicketsView tickets={company === 'all' ? snapshot.tickets : filteredTickets} devices={snapshot.devices}/>} {view === 'integrations' && <IntegrationsView connectors={snapshot.connectors}/>}</main>
    </div>
    {searchOpen && <div className="modal-layer" onMouseDown={(e) => e.target === e.currentTarget && setSearchOpen(false)}><div className="command-modal"><div className="command-input"><Search size={19}/><input autoFocus placeholder="Search across your entire environment..." value={query} onChange={(e) => setQuery(e.target.value)}/><button onClick={() => setSearchOpen(false)}><kbd>ESC</kbd></button></div><div className="command-results"><span className="result-label">{query ? 'Matching devices' : 'Suggested devices'}</span>{filteredDevices.slice(0, 4).map((device) => <button key={device.id} onClick={() => { setSelectedDevice(device); setSearchOpen(false) }}><span className="device-icon"><Laptop size={16}/></span><span><strong>{device.name}</strong><small>{device.user} · {companyNames[device.company]}</small></span><span className="result-meta"><StatusDot status={device.status}/>{device.lastSeen}</span></button>)}<span className="result-label">Matching tickets</span>{filteredTickets.slice(0, 3).map((ticket) => <button key={ticket.id} onClick={() => { setView('tickets'); setSearchOpen(false) }}><span className="device-icon"><TicketCheck size={16}/></span><span><strong>{ticket.id} · {ticket.title}</strong><small>{ticket.requester} · {companyNames[ticket.company]}</small></span><span className={`priority-tag ${ticket.priority === 'Urgent' ? 'urgent' : ''}`}>{ticket.priority}</span></button>)}{!filteredDevices.length && !filteredTickets.length && <EmptyState/>}</div><footer><span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span><span><kbd>↵</kbd> Open</span></footer></div></div>}
    {selectedDevice && <DeviceDrawer device={selectedDevice} onClose={() => setSelectedDevice(null)}/>} 
  </div>
}
