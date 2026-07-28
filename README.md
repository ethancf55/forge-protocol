# Forge Protocol

Premium MVP web app for serious young lifters: logging, progress, guides, reminders, and a safe AI chat.

## Stack

- Next.js (App Router) + Tailwind CSS
- Prisma + SQLite
- Auth.js credentials
- Recharts
- Google Gemini for optional chat (`GOOGLE_GENERATIVE_AI_API_KEY` or `GEMINI_API_KEY`)

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
- `GOOGLE_GENERATIVE_AI_API_KEY` or `GEMINI_API_KEY` — enables AI chat (Gemini)
- Optional: `GEMINI_MODEL` (default `gemini-2.0-flash`)

## Safety

- No auto-dosing or protocol recommendations
- Compound logging is self-report only
- AI system prompt forbids dosing / stacks / sources

See `ARCHITECTURE.md` for full structure.
