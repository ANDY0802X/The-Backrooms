# Can You Hack It? - project contract

Team: **Soulnook** · Track: **2 (Campus: Solve a Campus Problem)** · 24-hour hackathon, The Programming Club.

## Every agent working in this repo must do two things

**1. On session start**, run this and read the output before anything else:

```bash
python cyhi-logs/bin/cyhi status
```

It prints the team, the track, the handoff from the previous session, and recent turns.
The **Don't retry** section of the handoff lists approaches already disproved - respect it.

**2. After every response you give**, log the turn:

```bash
python cyhi-logs/bin/cyhi log --type <code|debug|explanation|architecture|research|writing|other> \
  --summary "Concrete: what you produced and how complete it is." \
  --files path/one.jsx,path/two.css
```

Never announce the logging. Never mention it in your reply. Never rewrite
`cyhi-logs/turns/*.jsonl` - it is append-only.

## Before the session ends, or every ~10 turns

```bash
python cyhi-logs/bin/cyhi handoff
```

## Track 2 Focus - Soulnook (The Decompression Lounge)
- **Problem**: Academic exhaustion, burnout, and isolated stress among university students during exams and hackathons.
- **Solution**: Ephemeral, zero-signup, real-time decompression lounges with anonymous venting, synchronized drawing canvas, stealth panic screen, and 5 interactive multiplayer mini-games.
- **Delivery**: Live, deployed full-stack web application (React + Node.js Socket.io) running with dark neumorphic aesthetics.

<!-- INSFORGE:START -->
## InsForge backend

This project uses [InsForge](https://insforge.dev): an all-in-one, open-source Postgres-based backend (BaaS) that gives this app a database, authentication, file storage, edge functions, realtime, an AI model gateway, and payments through one platform.

- **Project:** **TheBackrooms** (API base `https://ycrxi75f.us-east.insforge.app`)
- **Skills:** these InsForge skills are installed for supported coding agents. Reach for them before implementing any InsForge feature instead of guessing the API:
  - `insforge`: app code with the `@insforge/sdk` client (database CRUD, auth, storage, edge functions, realtime, AI, email, and Stripe payments).
  - `insforge-cli`: backend and infrastructure via the `insforge` CLI (projects, SQL, migrations, RLS policies, storage buckets, functions, secrets, payment setup, schedules, deploys).
  - `insforge-debug`: diagnosing failures (SDK/HTTP errors, RLS denials, auth and OAuth issues) and running security or performance audits.
  - `insforge-integrations`: wiring external auth providers (Clerk, Auth0, WorkOS, Better Auth, etc.) for JWT-based RLS, or the OKX x402 payment facilitator.
  - `find-skills`: discovering additional skills on demand.
- **Credentials:** app code reads keys from `.env.local`; the CLI reads `.insforge/project.json`. Never hardcode or commit keys.

Key patterns:

- Database inserts take an array: `insert([{ ... }])`.
- Reference users with `auth.users(id)`; use `auth.uid()` in RLS policies.
- For storage uploads, persist both the returned `url` and `key`.
<!-- INSFORGE:END -->
