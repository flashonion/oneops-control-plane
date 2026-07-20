# Changelog

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
