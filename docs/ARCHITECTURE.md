# Architecture

## Current prototype

```text
React UI
  -> unified Device / Ticket / Connector types
  -> demo dataset
  -> connector adapter contract
```

The prototype is deliberately local and contains no secrets. The adapter
contract in `src/services/connectors.ts` demonstrates parallel collection and
record merging.

## Target architecture

```text
Browser
  -> OneOps API (OIDC session, RBAC, tenant scope)
      -> query cache / reconciliation service
          -> Microsoft Graph adapter
          -> Atera adapter
          -> ScreenConnect adapter
          -> Snip-IP adapter
      -> PostgreSQL (normalised records, source links, audit log)
      -> Redis / job queue (polling, backoff, webhook processing)
      -> secret manager (provider credentials)
```

The browser talks only to the OneOps API. Provider credentials never enter the
browser. Polling and webhook events update a normalised cache; UI requests do
not fan out directly to four slow providers.

## Core identity rules

Records are not merged on device name alone. The reconciliation service scores
stable identifiers in this order:

1. Intune/Entra device IDs and provider agent GUIDs explicitly linked earlier
2. Serial number plus company
3. Hardware UUID plus company
4. Normalised hostname plus company, treated as a candidate only
5. User email, IP address, and MAC address as supporting evidence only

Every unified record retains `sourceRefs`, field provenance, `observedAt`, and a
confidence score. Ambiguous records enter a review queue rather than merging.

## Tenant isolation

Every domain row includes `organisationId`. API queries derive organisation
scope from the authenticated user's role, never from a browser-supplied filter
alone. A parent organisation can access authorised subsidiaries; subsidiary
admins cannot cross that boundary.

Initial roles:

- `viewer`: read dashboards and inventory
- `operator`: viewer plus approved operational actions
- `tenant_admin`: manage users and connections for allowed companies
- `platform_admin`: configure the OneOps installation

## Sync strategy

- Poll fast-changing presence every 30-60 seconds where provider limits allow.
- Poll device inventory and compliance every 5-15 minutes.
- Use incremental or last-modified endpoints where available.
- Honour pagination, `Retry-After`, exponential backoff, and provider quotas.
- Show stale data explicitly; never silently convert sync failure into “offline”.
- Record connector runs with counts, duration, cursor, and sanitised error detail.

## Write actions

Remote access, password changes, device retire/wipe, and ticket mutation are out
of scope for the first production pilot. Later actions require server-side RBAC,
step-up authentication for sensitive operations, confirmation text describing
impact, idempotency keys, and immutable audit records.
