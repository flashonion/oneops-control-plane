# Integration Notes

Checked against vendor documentation on 2026-07-20. Revalidate before production
because provider APIs and permissions change.

## Microsoft Entra and Intune

Use Microsoft Graph with an Entra app registration. Start with application or
delegated read-only permissions according to the deployment model.

Initial endpoint:

```http
GET https://graph.microsoft.com/v1.0/deviceManagement/managedDevices
```

The workplace map can enrich those device records with Microsoft Teams presence
in a single bounded request:

```http
POST https://graph.microsoft.com/v1.0/communications/getPresencesByUserId
Content-Type: application/json

{ "ids": ["entra-user-id"] }
```

`collectGraphPresences` implements this call with de-duplication and the documented
650-user maximum per request. It requires `Presence.Read.All`. For larger tenants,
split users into batches and move to Graph presence change notifications so the UI
does not depend on constant polling.

The stable Intune resource identifies the primary/enrolled user through `userId`.
The more precise `usersLoggedOn` signal currently lives in Microsoft Graph beta;
keep it behind an opt-in feature flag and never treat its absence as proof that a
desk is empty.

`server/connectors/microsoft-graph.ts` now implements the read-only endpoint,
pagination, canonical mapping, error handling, and shared concurrent collection.
It accepts an injected token provider and is intentionally not activated until a
non-production tenant and credential flow are available.

The least privileged permission documented for this collection is
`DeviceManagementManagedDevices.Read.All`. Additional screens may need
`User.Read.All`, `Directory.Read.All`, `Organization.Read.All`, or
`Reports.Read.All`. Request each only when its feature is implemented. Microsoft
365 usage reports are sensitive and may also require an eligible Entra admin
role for delegated access.

References:

- https://learn.microsoft.com/en-us/graph/api/intune-devices-manageddevice-list
- https://learn.microsoft.com/en-us/graph/api/resources/intune-graph-overview
- https://learn.microsoft.com/en-us/graph/reportroot-authorization

## Atera

Atera provides an HTTPS API backed by OpenAPI 3.0. Relevant domains include
agents, alerts, customers, devices, contacts, and tickets. Create a dedicated
token with custom read-only permissions, an expiry date, and an IP allowlist if
deployment networking is stable. Batch requests and throttle background exports.

`server/connectors/atera.ts` implements a read-only adapter for agents and
tickets. It supports pagination, flexible response envelopes, customer-to-company
resolution, open-ticket filtering, canonical mappings, shared concurrent calls,
and sanitised provider errors. It remains inactive until a dedicated test token
and customer mapping are supplied.

References:

- https://support.atera.com/hc/en-us/articles/219083397-Using-the-Atera-API
- https://support.atera.com/hc/en-us/articles/11071761826844-API-FAQ

## ConnectWise ScreenConnect

Do not reuse a person's browser cookie. ScreenConnect documents developer
extensions, external API calls, service methods, RESTful API Manager, and Session
Manager APIs. The exact integration surface depends on the installed version and
whether the instance is hosted or on-premises. External calls may require a
matching `Origin` and server-side access-control configuration.

For the pilot, obtain the instance version and hosting model, then build a small
read-only private extension/service that exposes only the required session
presence and machine metadata. Deep-link remote launch should remain a separate,
audited user action.

`server/connectors/screenconnect.ts` implements the OneOps side of that bridge.
It calls `GET /api/oneops/v1/sessions` with a dedicated bearer token and expects:

```json
{
  "sessions": [{
    "id": "screenconnect-session-id",
    "deviceId": "oneops-canonical-device-id",
    "machineName": "SYD-LT-042",
    "userDisplayName": "Mia Chen",
    "connected": true,
    "connectedAt": "2026-07-20T00:02:00Z",
    "lastActivityAt": "2026-07-20T01:39:00Z",
    "idleMinutes": 2,
    "operatingSystem": "Windows 11",
    "model": "Surface Laptop 6",
    "ipAddress": "10.24.8.42"
  }]
}
```

Host the bridge inside ScreenConnect as a private extension or beside the server,
restrict it by network and token scope, and return only sessions authorised for
that OneOps organisation. Do not expose ScreenConnect credentials to the browser.

References:

- https://docs.connectwise.com/ScreenConnect_Documentation/Developers
- https://docs.connectwise.com/ScreenConnect_Documentation/Developers/External_API_calls_to_ConnectWise_ScreenConnect
- https://docs.connectwise.com/ScreenConnect_Documentation/Developers/Session_events

## Snip-IP

This internal service needs an explicit contract before implementation. The
preferred deliverable is an OpenAPI 3 document covering:

- authentication and token rotation
- companies/sites and authorisation scope
- devices, stable IDs, serials, MACs, IPs, owners, and timestamps
- pagination, filtering, last-modified cursors, and rate limits
- error responses and webhook signatures, if supported

Until then, `ConnectorAdapter` is the boundary. A Snip-IP adapter must map its
responses into OneOps types without leaking internal field names into the UI.

## Configuration checklist

Never paste production credentials into chat or source control. Put local test
values in `.env.local`, use a non-production tenant, rotate credentials after
testing, and remove access when a test cycle ends.
