# OneOps 1.1

OneOps is a local-first IT operations control plane that reconciles devices,
people, tickets, compliance, and remote-support presence across multiple
companies and providers.

The Hackathon release is a polished, interactive full-stack demo. It uses
synthetic data and does not connect to production accounts.

## Judge quick start

```powershell
npm.cmd install
npm.cmd run dev
```

Open `http://localhost:4173`. The first screen is the **Live workplace**: choose
an office, select desk `A-04`, and follow Mia Chen's unified device record to the
urgent service desk ticket. This demonstrates the complete spatial-to-incident
journey across ScreenConnect, Microsoft, Atera, and Snip-IP.

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

To run the production build in Docker:

```powershell
docker build -t oneops:1.1.0 .
docker run --rm -p 4174:4174 oneops:1.1.0
```

Open `http://localhost:4174` for the production-served application.

## What works

- Multi-company workspace switching
- Interactive office floor plans with desk, employee, device, presence, and risk
- Desktop and mobile workplace filters with direct device investigation
- Unified environment dashboard and health trend
- Global device search
- Device inventory filtering and unified record drawer
- Prioritised service desk queue
- Integration health and coverage view
- Responsive desktop and mobile layouts
- Provider-neutral connector contract in `src/services/connectors.ts`
- Local Express API with parallel connector collection and snapshot caching
- Microsoft Graph batch presence and ScreenConnect bridge adapters
- Real `DATA_MODE=live` provider composition with explicit configuration failure
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
- [User testing report](docs/USER_TESTING.md)
- [Release checklist](docs/RELEASE_CHECKLIST.md)
- [Security policy](SECURITY.md)
- [Changelog](CHANGELOG.md)

## Repository status

This is an early Hackathon prototype. Remote-control launches, password resets,
device actions, and ticket writes are intentionally represented as UI only until
authentication, authorisation, and audit controls are tested with a non-production
tenant.
