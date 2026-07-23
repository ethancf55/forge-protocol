# Forge Protocol — project structure

```
forge-protocol/
├── prisma/
│   ├── schema.prisma          # DB models (source of truth)
│   ├── migrations/            # SQLite migrations
│   └── dev.db                 # Local database
├── src/
│   ├── app/
│   │   ├── (app)/             # Authenticated routes + AppShell
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   ├── log/
│   │   │   ├── history/
│   │   │   ├── guides/
│   │   │   ├── reminders/
│   │   │   └── chat/
│   │   ├── actions/           # Server actions (auth, logs, reminders)
│   │   ├── api/               # Auth + AI chat routes
│   │   ├── login/ signup/
│   │   ├── layout.tsx         # Root layout (fonts, providers)
│   │   ├── page.tsx           # Marketing landing
│   │   └── globals.css
│   ├── components/
│   │   ├── layout/app-shell.tsx   # Sidebar (md+) + bottom nav (mobile)
│   │   ├── ui/                    # Button, Input, Card
│   │   ├── log/ charts/ chat/ reminders/ auth/
│   │   └── providers.tsx
│   ├── lib/
│   │   ├── db.ts auth.ts session.ts ai.ts utils.ts
│   │   └── content/guides.ts  # Static educational content
│   └── types/
├── ARCHITECTURE.md
└── package.json
```

## Models (Prisma)

| Model | Purpose |
|--------|---------|
| `User` | Accounts |
| `TrainingLog` | Training sessions |
| `BodyMetric` | Body metrics (weight MVP) |
| `SupplementLog` | Supplements |
| `CompoundLog` | Self-reported compounds only |
| `Note` | Free-form notes |
| `Reminder` | Simple daily reminders |
| `ChatMessage` | AI history (optional) |
