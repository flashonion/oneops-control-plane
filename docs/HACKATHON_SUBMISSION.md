# Hackathon Submission Draft

## Project

**OneOps: One operational view for every IT system**

Release: **1.1.0**

## Short description

OneOps turns fragmented IT tooling into a living multi-company workplace map.
It reconciles each physical desk, employee, computer, Microsoft presence, Intune
compliance, Atera ticket, ScreenConnect session, and internal network record into
one spatial, searchable, action-oriented workspace.

## The problem

IT operators lose time and context moving between separate subscriptions. A
single incident may require four logins just to establish who owns a device,
whether it is compliant, whether it is online, and whether a ticket already
exists. Subsidiaries make the problem worse because every screen also needs the
correct company scope.

## The solution

OneOps creates a canonical record for each device while retaining links and
provenance from every source. Its Live Workplace shows exactly which desk is in
use, by whom, on which computer, for how long, and whether that endpoint needs
attention. It shows stale integration data honestly and keeps provider
credentials in the backend.

## Three-minute demo

1. Open Live Workplace and identify Northstar HQ, Level 5, active headcount, and
   the architectural floor plan.
2. Select Mia Chen at desk `A-04`; show her computer, live presence, session
   duration, risk, and provider coverage in the unified record.
3. Follow the related `INC-2841` ticket and show that the BitLocker request is
   automatically linked to `SYD-LT-042` and its critical health state.
4. Press `Ctrl/Cmd + K`, search for a hostname or requester, and show results
   spanning both devices and tickets.
5. Switch to Harbour Studio and show that its floor and staff replace Northstar.
6. Open Integrations and explain that each provider is isolated behind a common
   adapter with its own sync health.
7. Trigger refresh and show the live synchronisation timestamp.

## Technical highlights

- React and TypeScript operational UI with responsive desktop/mobile workflows
- Express API that fans out to provider adapters in parallel
- Shared in-flight requests, TTL caching, stale-on-error fallback, and explicit
  connector health
- Deterministic reconciliation that retains canonical identity and selects the
  most severe health/compliance signal
- Lazy-loaded analytics chart, reducing the main JavaScript bundle by about 60%
- Least-privilege, backend-only credential design with structured error responses
- Seventeen automated tests covering API contracts, caching, failure fallback,
  provider mapping, telemetry sanitisation, and reconciliation
- Operator review queue for ambiguous device matches instead of unsafe automatic
  merging
- Live connector operation diagnostics with sanitised error reporting
- Batched Microsoft Graph presence plus a tested read-only ScreenConnect bridge
- Floor-plan coordinates kept separate from provider-owned presence evidence

## What is real today

The full UI, local API, connector orchestration, caching, reconciliation,
polling, manual refresh, company scoping, and workflows run locally. Provider
responses are synthetic because production company accounts are intentionally
not connected during the Hackathon build. Live provider composition and
credential acquisition are implemented server-side for non-production testing.

Four task-based user-testing rounds cover a first-time judge, an on-call IT
administrator, a workplace operations lead, and a mobile service desk operator.
They include desktop and true 390x844 mobile verification. See
`docs/USER_TESTING.md` for evidence and fixes.

## Next milestone

Connect a non-production Microsoft tenant and ScreenConnect bridge, validate
twenty known desk/device/user matches, then add a read-only Atera token. Snip-IP
follows after its internal API and identity fields are confirmed.

## Responsible design

OneOps does not reuse browser cookies. Write actions such as device wipe,
password reset, or remote-control launch remain disabled until role checks,
step-up authentication, explicit confirmation, and immutable auditing are in
place.
