# OneOps Product Guide

## Problem

IT staff currently move between Microsoft Entra and Intune, Atera,
ScreenConnect, and internal inventory tools. Each product has a different login,
customer boundary, vocabulary, and device identity. The result is slow triage,
duplicate work, and incomplete context.

## Product promise

OneOps provides one calm operational view while preserving the specialist tools
behind it. An operator should be able to answer these questions in under a
minute:

1. What needs attention right now?
2. Which user, device, company, and ticket refer to the same incident?
3. Which source is authoritative for this field?
4. Where should I go to take the next action?

## Current demo

The Overview page summarises device health, compliance, ticket load, active
alerts, and provider status. Search finds devices by name, user, or IP. Selecting
a device opens a reconciled record with source coverage and recent activity.

Devices, Tickets, and Integrations offer focused workflows. The company picker
filters the shared inventory without requiring a separate login per subsidiary.

All visible people, companies, devices, IPs, and incidents are fictional.

## Safe rollout

1. Connect a non-production Microsoft tenant with read-only Graph permissions.
2. Validate reconciliation using 20 known devices.
3. Add read-only Atera data and compare ticket/device matches.
4. Add Snip-IP from an agreed OpenAPI contract.
5. Integrate ScreenConnect using a supported service/extension mechanism.
6. Run a two-week internal read-only pilot.
7. Add selected write actions behind role checks and explicit confirmations.

## Hackathon story

The demo should follow one incident: a noncompliant laptop appears in OneOps,
the operator sees the assigned person and urgent Atera ticket, verifies remote
availability from ScreenConnect, and opens the source record without switching
between four dashboards to understand the problem.
