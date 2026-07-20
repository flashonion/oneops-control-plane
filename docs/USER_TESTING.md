# User Testing Report

Date: 2026-07-20  
Release candidate: OneOps 1.0.0  
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

## Residual risks

- Testing used synthetic data rather than real provider latency and field
  variation.
- Screen-reader and keyboard-only testing should be broadened before production.
- Real authentication, RBAC, and destructive-action confirmation remain outside
  the Hackathon release scope.
