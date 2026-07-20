# Developer Handoff Log

This file is the durable memory for future development sessions. Update it after
each meaningful implementation slice.

## Current state (2026-07-20)

Release `1.1.1` is the current Hackathon submission candidate. Six user-testing
rounds are documented in `docs/USER_TESTING.md`.

OneOps is a Vite + React + TypeScript prototype using synthetic data. Live
Workplace is the default view and renders interactive, responsive architectural
floor plans from canonical workstation and presence data. It shows who is at a
desk, the assigned computer, presence/activity, online duration, and health risk.
The other views cover Overview, Devices, Tickets, Integrations, and identity
review. Company filters,
global search, device filtering, a detail drawer, and responsive navigation work.
An Express API now collects demo providers in parallel, caches snapshots, exposes
health/connector endpoints, and falls back to stale data after a failed refresh.
The ticket queue opens an enriched context drawer with its linked device. Search
covers devices and tickets, and keyboard open/close shortcuts work. The analytics
chart is lazy-loaded.
`MicrosoftGraphConnector` implements read-only Intune device pagination, mapping,
and optional batched Teams presence. `ScreenConnectConnector` consumes a
documented read-only bridge contract for endpoint sessions and activity.
`AteraConnector` now implements read-only paginated agents and tickets behind an
injected API key and company resolver. Connector operations emit sanitised run
telemetry shown on Integrations. A functional identity review queue handles
ambiguous cross-provider matches. `DATA_MODE=live` composes configured Graph,
Atera, and ScreenConnect adapters and fails closed if none are configured. The
production build, lint, and seventeen tests pass after this milestone.

Important files:

- `src/App.tsx`: views and interactions
- `src/components/HealthChart.tsx`: lazy-loaded Recharts analytics module
- `src/components/WorkplaceMap.tsx`: interactive floor plan and activity rail
- `src/workplace.ts`: versionable office zones and site definitions
- `src/styles.css`: complete responsive visual system
- `src/types.ts`: canonical UI domain types
- `src/data.ts`: fictional demo dataset
- `src/services/connectors.ts`: provider adapter contract and merge example
- `src/hooks/useSnapshot.ts`: polling, forced refresh, and stale-data client state
- `server/app.ts`: local API routes and security headers
- `server/snapshot-store.ts`: shared in-flight request and TTL cache
- `server/connectors/demo.ts`: realistic zero-credential provider simulation
- `server/connectors/microsoft-graph.ts`: tested Intune/Graph adapter awaiting a
  non-production token provider
- `server/connectors/atera.ts`: tested Atera adapter awaiting a restricted token
  and customer-to-company mapping
- `server/connectors/screenconnect.ts`: tested read-only session bridge adapter
- `server/connectors/live.ts`: live provider composition and Microsoft token cache
- `server/connector-telemetry.ts`: bounded operation diagnostics and sanitisation
- `src/reconciliation.ts`: demo identity candidates and review types
- `docs/ARCHITECTURE.md`: target production design and identity rules
- `docs/INTEGRATIONS.md`: official-provider research and constraints
- `docs/HACKATHON_SUBMISSION.md`: pitch, demo script, and technical highlights

## Decisions

- Product working name: OneOps. Ownership and final branding belong to the user.
- Local-first Hackathon demo; public hosting is not currently required.
- Read-only provider access first. No real account is connected.
- Do not authenticate by copying browser sessions or cookies.
- Keep provider mapping behind adapters; UI consumes canonical records only.
- Default GitHub visibility is private.

## Next implementation slices

1. Split the large `App.tsx` into route and component modules.
2. Add OIDC, PostgreSQL persistence, and provider-secret storage to `/api/v1`.
3. Validate Microsoft Graph presence against a non-production tenant.
4. Add PostgreSQL models for organisations, source records, unified records,
   connector runs, and audit events.
5. Add Vitest component tests and Playwright workflow tests.
6. Validate Atera and the ScreenConnect bridge against non-production accounts,
   then follow with the Snip-IP discovery spike.
7. Persist identity reconciliation decisions as audited API commands.

## Known limitations

- Demo metrics and timestamps are static; presence changes require live providers.
- Floor geometry and desk assignments are configured in source until the planned
  floor-plan editor and database persistence are added.
- Search opens ticket results at the ticket queue; selecting the exact ticket
  from search is not yet implemented.
- Remote session and mutation buttons are visual placeholders.
- The chart dependency contributes most of the initial JavaScript bundle; route
  splitting should be added when the app is modularised.
- Google Fonts are loaded from the network, with Arial fallback offline.

## Verification commands

```powershell
npm.cmd install
npm.cmd run build
npm.cmd test
npm.cmd run dev
```

Before continuing, read this file, `README.md`, the current `git status`, and the
latest commits. Do not replace the unified model with provider-specific UI data.
