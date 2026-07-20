import { useState } from 'react'
import { Building2, ChevronDown, Clock3, Laptop, LocateFixed, Map, Maximize2, MonitorUp, Radio, Users, Wifi } from 'lucide-react'
import type { Device, PresenceState } from '../types'
import { siteDevices, workplaceSites } from '../workplace'

const presenceLabels: Record<PresenceState, string> = {
  online: 'Online',
  busy: 'In a call',
  away: 'Away',
  offline: 'Offline',
}

function PresenceDot({ state }: { state: PresenceState }) {
  return <span className={`presence-dot ${state}`} aria-label={presenceLabels[state]} />
}

function Desk({ device, onSelect }: { device: Device; onSelect: (device: Device) => void }) {
  const desk = device.workplace
  if (!desk) return null
  const state = device.presence?.state ?? (device.status === 'offline' ? 'offline' : 'away')
  return <button
    className={`floor-desk desk-${state} ${device.status === 'critical' ? 'desk-risk' : ''}`}
    style={{ left: `${desk.x}%`, top: `${desk.y}%`, '--desk-rotation': `${desk.rotation ?? 0}deg` } as React.CSSProperties}
    onClick={() => onSelect(device)}
    aria-label={`${desk.deskId}, ${device.user}, ${device.name}, ${presenceLabels[state]}`}
  >
    <span className="desk-monitor"><Laptop size={14}/><i /></span>
    <span className="desk-person"><span className="desk-avatar">{device.initials}</span><span><strong>{device.user}</strong><small>{device.name}</small></span></span>
    <span className="desk-meta"><PresenceDot state={state}/>{device.presence?.since ?? device.lastSeen}</span>
    <span className="desk-code">{desk.deskId}</span>
  </button>
}

export function WorkplaceMap({ devices, onSelect, onRemote }: { devices: Device[]; onSelect: (device: Device) => void; onRemote: (device: Device) => void }) {
  const availableSites = workplaceSites.filter((site) => devices.some((device) => device.workplace?.siteId === site.id))
  const [siteId, setSiteId] = useState(availableSites[0]?.id ?? workplaceSites[0].id)
  const [filter, setFilter] = useState<'all' | PresenceState>('all')
  const site = availableSites.find((item) => item.id === siteId) ?? availableSites[0] ?? workplaceSites[0]
  const located = siteDevices(devices, site.id)
  const visible = filter === 'all' ? located : located.filter((device) => (device.presence?.state ?? 'offline') === filter)
  const online = located.filter((device) => device.presence?.state === 'online' || device.presence?.state === 'busy').length
  const issues = located.filter((device) => device.status === 'critical' || device.status === 'warning').length
  const selected = visible.find((device) => device.presence?.state === 'online') ?? visible[0]

  return <>
    <div className="workplace-heading">
      <div><p className="eyebrow">Live workplace</p><h1>See the office as it is.</h1><p>People, workstations, presence, and device health on one operational floor.</p></div>
      <div className="map-live"><Radio size={14}/><span><strong>Live signals</strong><small>ScreenConnect + Microsoft</small></span></div>
    </div>
    <section className="workplace-toolbar" aria-label="Workplace map controls">
      <div className="site-switcher"><Building2 size={16}/><span><small>Location</small><strong>{site.name} · {site.floor}</strong></span><ChevronDown size={15}/><select value={site.id} onChange={(event) => setSiteId(event.target.value)} aria-label="Office location">{availableSites.map((item) => <option key={item.id} value={item.id}>{item.name} — {item.floor}</option>)}</select></div>
      <div className="workplace-stats"><span><strong>{located.length}</strong> assigned</span><span><i className="online"/><strong>{online}</strong> active now</span><span><i className="issue"/><strong>{issues}</strong> need attention</span></div>
      <div className="map-filter segmented">{(['all','online','busy','away','offline'] as const).map((state) => <button key={state} className={filter === state ? 'active' : ''} onClick={() => setFilter(state)}>{state === 'all' ? 'Everyone' : presenceLabels[state]}</button>)}</div>
    </section>
    <div className="workplace-layout">
      <section className="floor-shell">
        <header><span><Map size={16}/><strong>{site.city} / {site.floor}</strong></span><span className="floor-updated"><i/>Updated just now</span><button className="icon-btn" title="Fit floor plan"><Maximize2 size={16}/></button></header>
        <div className="floor-canvas">
          <div className="floor-outline" aria-label={`${site.name} floor plan`}>
            <div className="north-marker"><LocateFixed size={14}/><span>N</span></div>
            <div className="floor-entry"><span>ENTRY</span><i/></div>
            <div className="floor-corridor horizontal"/><div className="floor-corridor vertical"/>
            {site.zones.map((zone) => <div key={zone.id} className={`floor-zone zone-${zone.kind}`} style={{ left: `${zone.x}%`, top: `${zone.y}%`, width: `${zone.width}%`, height: `${zone.height}%` }}><span>{zone.label}</span></div>)}
            {visible.map((device) => <Desk key={device.id} device={device} onSelect={onSelect}/>)}
            <div className="floor-windows"><i/><i/><i/><i/><i/></div>
          </div>
        </div>
        <footer className="floor-legend"><span><PresenceDot state="online"/>Online</span><span><PresenceDot state="busy"/>In a call</span><span><PresenceDot state="away"/>Away</span><span><PresenceDot state="offline"/>Offline</span><span className="legend-risk"><i/>Device issue</span></footer>
      </section>
      <aside className="presence-rail">
        <header><div><span className="eyebrow">At a glance</span><h2>Floor activity</h2></div><span>{located.length}</span></header>
        <div className="presence-list">{located.map((device) => {
          const state = device.presence?.state ?? 'offline'
          return <button key={device.id} onClick={() => onSelect(device)}><span className="avatar small">{device.initials}</span><span><strong>{device.user}</strong><small>{device.workplace?.deskId} · {device.name}</small></span><span className="person-state"><PresenceDot state={state}/>{presenceLabels[state]}</span></button>
        })}</div>
        {selected && <div className="live-session"><div className="session-scan"><span><Wifi size={16}/></span><i/><i/><i/></div><span className="eyebrow">Active session</span><strong>{selected.user}</strong><small>{selected.name} · {selected.ip}</small><dl><div><dt><Clock3 size={13}/>Connected</dt><dd>{selected.presence?.since ?? selected.lastSeen}</dd></div><div><dt><Users size={13}/>Activity</dt><dd>{selected.presence?.activity ?? 'Unknown'}</dd></div></dl><button className="primary-btn full-width" onClick={() => onRemote(selected)}><MonitorUp size={15}/>Remote assist</button></div>}
      </aside>
    </div>
  </>
}
