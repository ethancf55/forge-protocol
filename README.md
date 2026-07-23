# Forge Protocol

Premium MVP web app for serious young lifters: logging, progress, guides, reminders, and a safe AI chat.

## Stack

- Next.js (App Router) + Tailwind CSS
- Prisma + SQLite
- Auth.js credentials
- Recharts
- SpaceXAI / xAI for optional chat (`XAI_API_KEY`)

## Run locally

```bash
cd Projects/forge-protocol
npm install
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Copy `.env.example` → `.env` and set:

- `AUTH_SECRET` — required for auth
- `DATABASE_URL` — default `file:./dev.db`
- `XAI_API_KEY` — optional; enables AI chat

## Safety

- No auto-dosing or protocol recommendations
- Compound logging is self-report only
- AI system prompt forbids dosing / stacks / sources

See `ARCHITECTURE.md` for full structure.
