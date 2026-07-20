# User Testing Report

Date: 2026-07-20  
Release candidate: OneOps 1.1.0
Environment: local demo API with synthetic company data

## Method

Two task-based usability rounds were executed in fresh browser tabs. Each round
used a different target persona and checked task completion, visible feedback,
layout overflow, and browser console errors. A product change was made after the
first round before the second round began.

## Round 1: First-time Hackathon judge

Persona: a technical judge who has not read the repository documentation.  
Viewport: 1280px desktop.  
Goal: understand the product and demonstrate the cross-platform incident story
without verbal coaching.

Tasks:

1. Recognise that the workspace contains safe demo data.
2. Find the primary demo entry point.
3. Investigate the highest-risk device.
4. Find and open the related BitLocker ticket.

Results:

- Demo badge, quick action, device drawer, search, and exact ticket drawer all
  completed successfully.
- Full workflow completed in approximately 18 seconds of automated interaction.
- No console errors and no horizontal overflow at 1280px.

Finding: the unified device record showed four provider sources but did not make
its related service desk ticket directly visible. The judge had to infer that
search was the next step.

Change made: added a prominent related-ticket section to the device drawer with
one-click navigation to the enriched ticket record.

## Round 2: On-call IT administrator

Persona: an IT administrator investigating an incident while away from a desk.  
Viewports: 390x844 mobile plus desktop company-scope verification.  
Goal: move from alert to device to ticket, understand disabled production
actions, and confirm subsidiary isolation.

Tasks:

1. Open the quick-action journey on mobile.
2. Inspect the highest-risk device and its four source records.
3. Open the newly linked ticket directly from the device.
4. Attempt a write action and confirm clear read-only feedback.
5. Switch to Harbour Labs and verify that only its three demo devices appear.

Results:

- All five tasks completed successfully.
- Quick-action dialog width was 360px and device drawer width was 375px inside a
  390px viewport.
- Harbour Labs correctly displayed three devices.
- No browser console errors or document-level horizontal overflow.
- The disabled Resolve action clearly explained that writes are unavailable in
  the read-only Hackathon build.

No release-blocking issues remained after round two.

## Round 3: Workplace operations lead

Persona: an operations lead locating a staff member and assessing a device issue
without knowing which management platform owns the source record.
Viewport: 1280px desktop.
Goal: move from a physical office view to an actionable unified record.

Tasks:

1. Identify the selected office, floor, assigned desks, and active headcount.
2. Locate Mia Chen at desk A-04 and confirm her computer name and online duration.
3. Open the desk and verify the unified device drawer.
4. Switch to Harbour Studio and locate Ava Williams and Leo Taylor.

Results:

- All tasks completed successfully without instructions outside the UI.
- The floor plan showed rooms, circulation, desks, presence states, and device
  risk while retaining a readable activity rail.
- Selecting A-04 opened the correct Mia Chen / SYD-LT-042 device record.
- Switching location showed only Harbour Studio people and desks.

Finding: the already-running local API process was serving the previous schema,
causing the map to show zero assigned desks. This was an environment issue, but
it demonstrated the need for an explicit production-build verification rather
than relying on hot reload.

Change made: production validation now starts the newly built API on an isolated
port and verifies located-device and presence counts before browser testing.

## Round 4: Mobile service desk operator

Persona: an on-call operator using a phone while away from the service desk.
Viewport: true 390x844 mobile viewport.
Goal: scan the live floor, pan the plan, and retain access to desk details.

Tasks:

1. Open Live Workplace as the first screen.
2. Review office totals and change the presence filter.
3. Pan the fixed-format floor plan without moving the surrounding page.
4. Select a visible workstation and open device context.

Results:

- Document width remained within the 375px browser client width.
- The architectural plan retained its stable dimensions and provided contained
  horizontal and vertical panning.
- Site selection, presence controls, desk buttons, and the device drawer remained
  available without desktop-only interactions.
- No release-blocking mobile layout issue was found.

## Residual risks

- Testing used synthetic data rather than real provider latency and field
  variation.
- Floor coordinates still require configuration from each company's actual plan.
- Workplace presence must be reviewed against employee privacy and retention
  policy before historical reporting is enabled.
- Screen-reader and keyboard-only testing should be broadened before production.
- Real authentication, RBAC, and destructive-action confirmation remain outside
  the Hackathon release scope.
