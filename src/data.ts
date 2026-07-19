import type { Connector, Device, Ticket } from './types'

export const devices: Device[] = [
  { id: 'dev-001', name: 'SYD-LT-042', user: 'Mia Chen', initials: 'MC', company: 'northstar', os: 'Windows 11', model: 'Surface Laptop 6', status: 'critical', compliance: 'Noncompliant', lastSeen: '2 min ago', sources: ['intune', 'atera', 'screenconnect', 'snip-ip'], risk: 92, ip: '10.24.8.42' },
  { id: 'dev-002', name: 'MEL-DT-118', user: 'Oliver Smith', initials: 'OS', company: 'northstar', os: 'Windows 11', model: 'Dell OptiPlex 7020', status: 'warning', compliance: 'At risk', lastSeen: '8 min ago', sources: ['intune', 'atera', 'screenconnect'], risk: 61, ip: '10.24.12.118' },
  { id: 'dev-003', name: 'BNE-LT-207', user: 'Ava Williams', initials: 'AW', company: 'harbour', os: 'macOS 15.4', model: 'MacBook Pro 14', status: 'healthy', compliance: 'Compliant', lastSeen: 'Just now', sources: ['intune', 'screenconnect', 'snip-ip'], risk: 8, ip: '10.31.4.207' },
  { id: 'dev-004', name: 'SYD-VM-015', user: 'Shared Services', initials: 'SS', company: 'northstar', os: 'Windows Server 2022', model: 'VMware Virtual Platform', status: 'offline', compliance: 'At risk', lastSeen: '3 hr ago', sources: ['atera', 'screenconnect', 'snip-ip'], risk: 78, ip: '10.24.2.15' },
  { id: 'dev-005', name: 'PER-LT-073', user: 'Noah Brown', initials: 'NB', company: 'harbour', os: 'Windows 11', model: 'Lenovo ThinkPad T14', status: 'healthy', compliance: 'Compliant', lastSeen: '4 min ago', sources: ['intune', 'atera', 'screenconnect'], risk: 4, ip: '10.31.9.73' },
  { id: 'dev-006', name: 'ADL-LT-031', user: 'Isla Wilson', initials: 'IW', company: 'northstar', os: 'Windows 10', model: 'HP EliteBook 840', status: 'warning', compliance: 'At risk', lastSeen: '21 min ago', sources: ['intune', 'atera', 'snip-ip'], risk: 55, ip: '10.24.16.31' },
  { id: 'dev-007', name: 'MEL-LT-224', user: 'Leo Taylor', initials: 'LT', company: 'harbour', os: 'Windows 11', model: 'Surface Pro 10', status: 'healthy', compliance: 'Compliant', lastSeen: '1 min ago', sources: ['intune', 'screenconnect'], risk: 6, ip: '10.31.12.224' },
]

export const tickets: Ticket[] = [
  { id: 'INC-2841', title: 'BitLocker recovery key requested', requester: 'Mia Chen', company: 'northstar', priority: 'Urgent', age: '18m', source: 'atera' },
  { id: 'INC-2837', title: 'VPN disconnects after sleep', requester: 'Oliver Smith', company: 'northstar', priority: 'High', age: '42m', source: 'atera' },
  { id: 'REQ-1942', title: 'Adobe license assignment', requester: 'Ava Williams', company: 'harbour', priority: 'Normal', age: '1h', source: 'atera' },
  { id: 'INC-2829', title: 'Shared drive unavailable', requester: 'Shared Services', company: 'northstar', priority: 'High', age: '2h', source: 'atera' },
]

export const connectors: Connector[] = [
  { id: 'intune', name: 'Microsoft Intune', detail: 'Devices, compliance & identity', synced: '24 sec ago', status: 'Connected', records: '1,248', color: '#2563eb' },
  { id: 'atera', name: 'Atera', detail: 'Tickets, alerts & agents', synced: '41 sec ago', status: 'Connected', records: '386', color: '#13a16d' },
  { id: 'screenconnect', name: 'ScreenConnect', detail: 'Sessions & remote access', synced: '1 min ago', status: 'Connected', records: '1,106', color: '#7c5ce7' },
  { id: 'snip-ip', name: 'Snip-IP', detail: 'Network inventory & ownership', synced: '7 min ago', status: 'Attention', records: '972', color: '#e36b34' },
]

export const trend = [
  { day: 'Mon', compliant: 91, online: 89 }, { day: 'Tue', compliant: 92, online: 94 },
  { day: 'Wed', compliant: 92, online: 91 }, { day: 'Thu', compliant: 94, online: 96 },
  { day: 'Fri', compliant: 93, online: 93 }, { day: 'Sat', compliant: 95, online: 84 },
  { day: 'Sun', compliant: 96, online: 87 },
]
