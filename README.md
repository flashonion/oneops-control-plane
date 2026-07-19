# OneOps

OneOps is a local-first IT operations control plane that reconciles devices,
people, tickets, compliance, and remote-support presence across multiple
companies and providers.

The current release is a polished, interactive full-stack demo. It uses
synthetic data and does not connect to production accounts.

## Run locally

Requirements: Node.js 20 or newer.

```powershell
npm.cmd install
npm.cmd run dev
```

Open the URL printed by Vite. Create a production build with:

```powershell
npm.cmd run build
```

`npm.cmd run dev` starts both the OneOps API on port 4174 and the web app on
port 4173. Run `npm.cmd test` for the API test suite.

## What works

- Multi-company workspace switching
- Unified environment dashboard and health trend
- Global device search
- Device inventory filtering and unified record drawer
- Prioritised service desk queue
- Integration health and coverage view
- Responsive desktop and mobile layouts
- Provider-neutral connector contract in `src/services/connectors.ts`
- Local Express API with parallel connector collection and snapshot caching
- Explicit stale-data fallback and background refresh handling

## Data and security

OneOps runs in demo mode by default. Copy `.env.example` to `.env.local` only
when a server-side connector is being tested. Never commit that file.

Provider tokens, cookies, and client secrets must remain in a backend process or
secret manager. They must never use a `VITE_` prefix because Vite exposes those
values to the browser bundle. Production connections should start read-only,
use least-privilege permissions, and produce an audit event for every action.

## Documentation

- [Product guide](docs/PRODUCT.md)
- [Architecture and data model](docs/ARCHITECTURE.md)
- [Integration implementation notes](docs/INTEGRATIONS.md)
- [Developer handoff log](docs/HANDOFF.md)
- [Hackathon submission draft](docs/HACKATHON_SUBMISSION.md)
- [Security policy](SECURITY.md)

## Repository status

This is an early Hackathon prototype. Remote-control launches, password resets,
device actions, and ticket writes are intentionally represented as UI only until
authentication, authorisation, and audit controls are tested with a non-production
tenant.
