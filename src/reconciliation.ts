import type { CompanyId, SourceId } from './types'

export interface ReconciliationRecord {
  source: SourceId
  name: string
  identifier: string
  user: string
  lastSeen: string
}

export interface ReconciliationCandidate {
  id: string
  company: Exclude<CompanyId, 'all'>
  confidence: number
  reasons: string[]
  left: ReconciliationRecord
  right: ReconciliationRecord
}

export const reconciliationCandidates: ReconciliationCandidate[] = [
  { id: 'match-001', company: 'northstar', confidence: 94, reasons: ['Same serial number', 'Matching primary user', 'Hostname differs only by prefix'], left: { source: 'intune', name: 'SYD-LT-042', identifier: 'INT-705C034C', user: 'Mia Chen', lastSeen: '2 min ago' }, right: { source: 'atera', name: 'LAPTOP-SYD042', identifier: 'ATR-882104', user: 'northstar\\mia', lastSeen: '3 min ago' } },
  { id: 'match-002', company: 'harbour', confidence: 81, reasons: ['Same MAC address', 'Same site and operating system'], left: { source: 'screenconnect', name: 'BNE-LT-207', identifier: 'SC-55129', user: 'Ava Williams', lastSeen: 'Just now' }, right: { source: 'snip-ip', name: 'AVA-MBP', identifier: 'SIP-A1C94E', user: 'ava.w', lastSeen: '6 min ago' } },
  { id: 'match-003', company: 'northstar', confidence: 67, reasons: ['Similar hostname', 'IP address reused recently'], left: { source: 'intune', name: 'ADL-LT-031', identifier: 'INT-1A938BD2', user: 'Isla Wilson', lastSeen: '21 min ago' }, right: { source: 'snip-ip', name: 'ADL-LT-013', identifier: 'SIP-83F2A0', user: 'Unknown', lastSeen: '18 min ago' } },
]
