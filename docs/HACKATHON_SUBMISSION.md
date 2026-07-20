# Hackathon Submission Draft

## Project

**OneOps: One operational view for every IT system**

Release: **1.0.0**

## Short description

OneOps turns fragmented IT tooling into a unified multi-company control plane.
It reconciles device health, Microsoft Intune compliance, Atera tickets,
ScreenConnect availability, and internal network inventory into one searchable,
action-oriented workspace.

## The problem

IT operators lose time and context moving between separate subscriptions. A
single incident may require four logins just to establish who owns a device,
whether it is compliant, whether it is online, and whether a ticket already
exists. Subsidiaries make the problem worse because every screen also needs the
correct company scope.

## The solution

OneOps creates a canonical record for each device while retaining links and
provenance from every source. It prioritises urgent work, shows stale integration
data honestly, and keeps provider credentials in the backend. Operators use one
search and one company switcher, then deep-link into specialist products only
when an action requires them.

## Three-minute demo

1. Open Overview and point out the environment-level health, compliance, ticket,
   and alert summaries.
2. Select the urgent noncompliant-device item and show the unified device record,
   source coverage, risk score, user, IP, and timeline.
3. Open Tickets, select `INC-2841`, and show that the urgent BitLocker request is
   automatically linked to `SYD-LT-042` and its critical health state.
4. Press `Ctrl/Cmd + K`, search for a hostname or requester, and show results
   spanning both devices and tickets.
5. Switch company scope and show the inventory boundary change immediately.
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
- Thirteen automated tests covering API contracts, caching, failure fallback,
  provider mapping, telemetry sanitisation, and reconciliation
- Operator review queue for ambiguous device matches instead of unsafe automatic
  merging
- Live connector operation diagnostics with sanitised error reporting

## What is real today

The full UI, local API, connector orchestration, caching, reconciliation,
polling, manual refresh, company scoping, and workflows run locally. Provider
responses are synthetic because production company accounts are intentionally
not connected during the Hackathon build.

Two task-based user-testing rounds cover a first-time judge on desktop and an
on-call IT administrator at a 390x844 mobile viewport. The first round produced
a direct device-to-ticket navigation improvement; the second round completed
without release-blocking findings. See `docs/USER_TESTING.md` for evidence.

## Next milestone

Connect a non-production Microsoft tenant through Graph, validate twenty known
devices, then add a read-only Atera token. ScreenConnect and Snip-IP follow after
their instance-specific API and identity fields are confirmed.

## Responsible design

OneOps does not reuse browser cookies. Write actions such as device wipe,
password reset, or remote-control launch remain disabled until role checks,
step-up authentication, explicit confirmation, and immutable auditing are in
place.
