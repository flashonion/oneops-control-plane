# Changelog

## 1.1.1 - 2026-07-20

### Fixed

- Added stable accessible names to the compact mobile navigation, company,
  search, and profile controls
- Verified public, anonymous access to both published GitHub releases

### Verified

- Added two end-to-end user-testing rounds for the judge and mobile operator
  journeys

## 1.1.0 - 2026-07-20

### Added

- Live Workplace as the default OneOps experience
- Interactive architectural floor plans for Northstar HQ and Harbour Studio
- Desk-level employee, computer, presence, activity duration, and device risk
- Office, presence, and company filters with responsive mobile panning
- Microsoft Graph batch presence collection using `getPresencesByUserId`
- Read-only ScreenConnect bridge adapter with canonical session mapping
- Live provider composition for Graph, Atera, and ScreenConnect
- Privacy and data-freshness guidance for workplace presence

### Changed

- Device records now retain workstation, presence, and remote-session evidence
- Live mode fails closed when no provider has been configured
- The device drawer shows workstation and live-presence context

## 1.0.0 - 2026-07-20

### Added

- Multi-company IT operations dashboard with responsive desktop and mobile UI
- Unified device inventory, risk details, source coverage, and related tickets
- Service desk queue with enriched ticket context and linked devices
- Global device and ticket search with `Ctrl/Cmd + K`
- Connector health, forced refresh, stale-data fallback, and run diagnostics
- Identity reconciliation review queue for uncertain cross-provider matches
- Read-only Microsoft Graph/Intune and Atera adapter implementations
- Hackathon quick-action journey and explicit demo/read-only feedback
- Express API, production static serving, and Docker packaging
- Thirteen automated tests and GitHub continuous integration

### Security

- Provider credentials remain server-side
- Connector errors are sanitised before reaching diagnostics
- Production write actions remain disabled until authentication, RBAC, and audit
  controls are implemented
