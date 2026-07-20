import type { ConnectorAdapter } from '../../src/services/connectors'
import type { AppConfig } from '../config'
import { AteraConnector } from './atera'
import { MicrosoftGraphConnector } from './microsoft-graph'
import { ScreenConnectConnector } from './screenconnect'

interface TokenResponse {
  access_token: string
  expires_in?: number
}

function createMicrosoftTokenProvider(config: AppConfig, fetchImpl: typeof fetch = fetch) {
  let cached: { value: string; expiresAt: number } | null = null
  return async () => {
    if (cached && cached.expiresAt > Date.now() + 60_000) return cached.value
    const response = await fetchImpl(`https://login.microsoftonline.com/${config.MS_GRAPH_TENANT_ID}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: config.MS_GRAPH_CLIENT_ID!,
        client_secret: config.MS_GRAPH_CLIENT_SECRET!,
        scope: 'https://graph.microsoft.com/.default',
        grant_type: 'client_credentials',
      }),
    })
    if (!response.ok) throw new Error(`Microsoft identity token request failed (${response.status})`)
    const token = await response.json() as TokenResponse
    cached = { value: token.access_token, expiresAt: Date.now() + (token.expires_in ?? 3_600) * 1_000 }
    return cached.value
  }
}

export function createLiveConnectors(config: AppConfig): ConnectorAdapter[] {
  const adapters: ConnectorAdapter[] = []
  if (config.MS_GRAPH_TENANT_ID && config.MS_GRAPH_CLIENT_ID && config.MS_GRAPH_CLIENT_SECRET) {
    adapters.push(new MicrosoftGraphConnector(createMicrosoftTokenProvider(config), 'northstar', fetch, config.MICROSOFT_GRAPH_PRESENCE_ENABLED))
  }
  if (config.ATERA_API_KEY) {
    adapters.push(new AteraConnector(config.ATERA_API_KEY, () => 'northstar'))
  }
  if (config.SCREENCONNECT_BRIDGE_URL && config.SCREENCONNECT_API_TOKEN) {
    adapters.push(new ScreenConnectConnector(config.SCREENCONNECT_BRIDGE_URL, config.SCREENCONNECT_API_TOKEN, 'northstar'))
  }
  if (!adapters.length) throw new Error('DATA_MODE=live requires at least one configured provider')
  return adapters
}
