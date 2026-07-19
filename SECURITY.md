# Security Policy

OneOps handles operational metadata that can expose people, devices, networks,
and administrative capability. Treat all provider credentials and exported data
as sensitive.

## Reporting an issue

Do not open a public issue containing credentials, tenant identifiers, customer
data, screenshots of real devices, or exploitable details. Contact the repository
owner privately and include only the minimum reproduction information required.

## Credential handling

- Never commit `.env`, tokens, browser cookies, API keys, or client secrets.
- Use dedicated non-production, read-only credentials for integration testing.
- Scope provider permissions and source IPs as narrowly as possible.
- Rotate a credential immediately if it appears in a log, commit, screenshot, or
  message. Removing it from Git history does not make the old value safe.
- Keep secrets in the server process or a secret manager. Variables prefixed with
  `VITE_` are browser-visible and must never contain secrets.

## Production readiness

The current repository is a Hackathon prototype. Do not expose it to the public
internet or connect production accounts until OIDC authentication, tenant-level
authorisation, encrypted secret storage, request rate limits, audit logging, and
deployment hardening are implemented and reviewed.
