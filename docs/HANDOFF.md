# Developer Handoff Log

This file is the durable memory for future development sessions. Update it after
each meaningful implementation slice.

## Current state (2026-07-20)

OneOps is a Vite + React + TypeScript prototype using synthetic data. It has four
interactive views: Overview, Devices, Tickets, and Integrations. Company filters,
global search, device filtering, a detail drawer, and responsive navigation work.
The production build passes.

Important files:

- `src/App.tsx`: views and interactions
- `src/styles.css`: complete responsive visual system
- `src/types.ts`: canonical UI domain types
- `src/data.ts`: fictional demo dataset
- `src/services/connectors.ts`: provider adapter contract and merge example
- `docs/ARCHITECTURE.md`: target production design and identity rules
- `docs/INTEGRATIONS.md`: official-provider research and constraints

## Decisions

- Product working name: OneOps. Ownership and final branding belong to the user.
- Local-first Hackathon demo; public hosting is not currently required.
- Read-only provider access first. No real account is connected.
- Do not authenticate by copying browser sessions or cookies.
- Keep provider mapping behind adapters; UI consumes canonical records only.
- Default GitHub visibility is private.

## Next implementation slices

1. Split the large `App.tsx` into route and component modules.
2. Add a backend workspace with OIDC, provider-secret storage, and `/api/v1`.
3. Implement Microsoft Graph adapter against a non-production tenant.
4. Add PostgreSQL models for organisations, source records, unified records,
   connector runs, and audit events.
5. Add Vitest component tests and Playwright workflow tests.
6. Add Atera adapter, followed by Snip-IP and ScreenConnect discovery spikes.
7. Build an identity reconciliation review queue.

## Known limitations

- All metrics and timestamps are static demo values.
- Header search filters device data only.
- Remote session and mutation buttons are visual placeholders.
- The chart dependency contributes most of the initial JavaScript bundle; route
  splitting should be added when the app is modularised.
- Google Fonts are loaded from the network, with Arial fallback offline.

## Verification commands

```powershell
npm.cmd install
npm.cmd run build
npm.cmd run dev
```

Before continuing, read this file, `README.md`, the current `git status`, and the
latest commits. Do not replace the unified model with provider-specific UI data.
