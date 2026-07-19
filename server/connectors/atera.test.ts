import { describe, expect, it, vi } from 'vitest'
import { AteraConnector, mapAteraAgent, mapAteraTicket } from './atera'

const resolveCompany = () => 'northstar' as const

describe('AteraConnector', () => {
  it('maps agents and tickets into canonical records', () => {
    const device = mapAteraAgent({ AgentID: 42, MachineName: 'SYD-LT-042', LoggedUsername: 'northstar\\mia', Online: false, CustomerID: 7, OS: 'Windows', OSVersion: '11', IPAddress: '10.0.0.42' }, resolveCompany)
    const ticket = mapAteraTicket({ TicketID: 2841, TicketTitle: 'Recovery key', EndUserFirstName: 'Mia', EndUserLastName: 'Chen', TicketPriority: 'Critical', CustomerID: 7 }, resolveCompany)
    expect(device.status).toBe('offline')
    expect(device.risk).toBe(70)
    expect(ticket.priority).toBe('Urgent')
    expect(ticket.requester).toBe('Mia Chen')
  })

  it('authenticates, paginates, filters closed tickets, and shares agent requests', async () => {
    const firstPage = Array.from({ length: 50 }, (_, index) => ({ AgentID: index + 1, MachineName: `PC-${index + 1}`, Online: true }))
    const fetcher = vi.fn<typeof fetch>(async (input) => {
      const url = new URL(String(input))
      if (url.pathname.endsWith('/agents')) {
        const page = url.searchParams.get('page')
        return new Response(JSON.stringify(page === '1' ? { items: firstPage, totalItemCount: 51 } : { items: [{ AgentID: 51, MachineName: 'PC-51', Online: true }], totalItemCount: 51 }), { status: 200 })
      }
      return new Response(JSON.stringify({ Items: [{ TicketID: 1, TicketTitle: 'Open', Status: 'Open' }, { TicketID: 2, TicketTitle: 'Done', Status: 'Resolved' }] }), { status: 200 })
    })
    const connector = new AteraConnector('secret-test-key', resolveCompany, fetcher)
    const [health, devices, tickets] = await Promise.all([connector.health(), connector.devices(), connector.tickets()])
    expect(devices).toHaveLength(51)
    expect(health.records).toBe('51')
    expect(tickets).toHaveLength(1)
    expect(fetcher).toHaveBeenCalledTimes(3)
    const headers = fetcher.mock.calls[0]?.[1]?.headers as Record<string, string>
    expect(headers['X-API-KEY']).toBe('secret-test-key')
  })

  it('fails with a sanitised provider error', async () => {
    const connector = new AteraConnector('secret', resolveCompany, async () => new Response('', { status: 429 }))
    await expect(connector.devices()).rejects.toThrow('Atera /agents failed (429)')
  })
})
