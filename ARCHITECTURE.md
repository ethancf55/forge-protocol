# Forge Protocol — MVP Architecture

Premium logging + education app for serious young lifters (18–28).

## Product principles

- **Log, don’t prescribe** — users record what they already do; the app never auto-doses or designs protocols.
- **Education over hype** — static guides + AI that organizes and explains, never recommends compounds/doses.
- **Premium dark mobile-first UI** — sparse, high contrast, zero clutter.

## Stack

| Layer | Choice | Why |
|--------|--------|-----|
| Framework | Next.js App Router | Fast UI + API routes in one repo |
| Styling | Tailwind CSS | Rapid premium dark design |
| DB | SQLite + Prisma | Simple local MVP; swap URL for Postgres later |
| Auth | Auth.js (NextAuth v5) credentials + JWT | Clean email/password accounts |
| Charts | Recharts | Lightweight progress history |
| AI | SpaceXAI / xAI (`api.x.ai`, `XAI_API_KEY`) | Organizational + educational chat only |

## App structure

```
src/
  app/
    (marketing)/          # Landing
    (auth)/login|signup
    (app)/                # Authenticated shell
      dashboard/
      log/                # Training, weight, supplements, compounds, notes
      history/            # Charts + recent entries
      guides/             # Static educational content
      reminders/
      chat/               # Lightweight AI
    api/auth|logs|chat|reminders
  components/ui|layout|log|charts
  lib/auth|db|ai|content|validations
  generated/prisma        # Prisma client
```

## Domain model (MVP)

- **User** — email, name, passwordHash, bodyweightUnit
- **WorkoutLog** — date, title, durationMin?, notes?, exercisesJson
- **BodyWeightLog** — date, weight, unit
- **SupplementLog** — date, name, amountNote (free text), notes?
- **CompoundLog** — date, name, notes? (self-reported log only; UI disclaimer)
- **NoteLog** — date, body
- **Reminder** — title, hourLocal (0–23), enabled
- **ChatMessage** — role user|assistant, content

## Screens (this phase)

1. **Landing** — product pitch + CTA  
2. **Signup / Login**  
3. **Dashboard** — today snapshot, quick log, streak-ish summary  
4. **Log hub** — tabs: Training · Weight · Supplements · Compounds · Notes  
5. **History** — weight chart + recent activity  
6. **Guides** — static starter programs + educational articles  
7. **Reminders** — simple daily time-based reminders  
8. **AI Chat** — system prompt locked to no dosing / no protocols  

## Safety rails

- Compound logging UI shows permanent disclaimer  
- AI system prompt forbids dosing, stacks, sources, protocols  
- No “recommended stack” or auto-fill doses  

## Local run

```bash
cd Projects/forge-protocol
cp .env.example .env   # set AUTH_SECRET, optional XAI_API_KEY
npx prisma migrate dev
npm run dev
```

## Roadmap (post-MVP)

- Push notifications / email reminders  
- Export CSV  
- Postgres + hosted deploy  
- Photo progress (optional)  
- Coach multi-client (out of scope for MVP)
