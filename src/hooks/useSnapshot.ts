import { useCallback, useEffect, useRef, useState } from 'react'
import { connectors, devices, tickets } from '../data'
import type { UnifiedSnapshot } from '../services/connectors'
import type { ConnectorRun } from '../types'

interface SnapshotEnvelope {
  data: UnifiedSnapshot
  cached: boolean
  stale: boolean
  ageMs: number
  runs?: ConnectorRun[]
}

const initialSnapshot: UnifiedSnapshot = {
  generatedAt: new Date().toISOString(),
  connectors,
  devices,
  tickets,
}

export function useSnapshot() {
  const [snapshot, setSnapshot] = useState(initialSnapshot)
  const [stale, setStale] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [runs, setRuns] = useState<ConnectorRun[]>([])
  const mounted = useRef(true)

  const refresh = useCallback(async (force = false) => {
    setSyncing(true)
    try {
      const response = await fetch(`/api/v1/snapshot${force ? '?refresh=true' : ''}`, {
        headers: { accept: 'application/json' },
      })
      if (!response.ok) throw new Error(`Snapshot request failed (${response.status})`)
      const envelope = await response.json() as SnapshotEnvelope
      if (!mounted.current) return
      setSnapshot(envelope.data)
      setRuns(envelope.runs || [])
      setStale(envelope.stale)
      setError(null)
    } catch (requestError) {
      if (!mounted.current) return
      setStale(true)
      setError(requestError instanceof Error ? requestError.message : 'Unable to reach the OneOps API')
    } finally {
      if (mounted.current) setSyncing(false)
    }
  }, [])

  useEffect(() => {
    mounted.current = true
    const initialRefresh = window.setTimeout(() => void refresh(), 0)
    const interval = window.setInterval(() => void refresh(), 30_000)
    return () => {
      mounted.current = false
      window.clearTimeout(initialRefresh)
      window.clearInterval(interval)
    }
  }, [refresh])

  return { snapshot, runs, stale, syncing, error, refresh }
}
