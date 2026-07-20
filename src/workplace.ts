import type { Device } from './types'

export interface FloorZone {
  id: string
  label: string
  kind: 'meeting' | 'focus' | 'utility' | 'social'
  x: number
  y: number
  width: number
  height: number
}

export interface WorkplaceSite {
  id: string
  name: string
  city: string
  floor: string
  timezone: string
  zones: FloorZone[]
}

export const workplaceSites: WorkplaceSite[] = [
  {
    id: 'northstar-syd',
    name: 'Northstar HQ',
    city: 'Sydney',
    floor: 'Level 5',
    timezone: 'AEST',
    zones: [
      { id: 'boardroom', label: 'Boardroom', kind: 'meeting', x: 4, y: 5, width: 27, height: 26 },
      { id: 'focus', label: 'Focus rooms', kind: 'focus', x: 4, y: 68, width: 18, height: 25 },
      { id: 'kitchen', label: 'Kitchen + social', kind: 'social', x: 72, y: 5, width: 24, height: 26 },
      { id: 'comms', label: 'Comms', kind: 'utility', x: 82, y: 72, width: 14, height: 21 },
    ],
  },
  {
    id: 'harbour-mel',
    name: 'Harbour Studio',
    city: 'Melbourne',
    floor: 'Level 2',
    timezone: 'AEST',
    zones: [
      { id: 'lab', label: 'Prototype lab', kind: 'utility', x: 4, y: 5, width: 27, height: 27 },
      { id: 'quiet', label: 'Quiet room', kind: 'focus', x: 4, y: 69, width: 19, height: 24 },
      { id: 'project', label: 'Project room', kind: 'meeting', x: 70, y: 5, width: 26, height: 27 },
      { id: 'lounge', label: 'Team lounge', kind: 'social', x: 76, y: 70, width: 20, height: 23 },
    ],
  },
]

export function siteDevices(devices: Device[], siteId: string) {
  return devices.filter((device) => device.workplace?.siteId === siteId)
}
