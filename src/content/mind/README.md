# Mind pillar

Equal weight to training: **Discipline** + **Learning**.

## Routes

| Path | Purpose |
|------|---------|
| `/mind` | Hub — both pillars, snapshot, previews |
| `/mind/discipline` | Daily check-ins, 7-day consistency, practices, reflection |
| `/mind/discipline/[slug]` | Practice essays |
| `/mind/learning` | Paths + lesson library |
| `/mind/learning/[slug]` | Individual lessons |

## Add a discipline habit

Edit `discipline/habits.ts` — add a unique `key` and metadata.

## Add a discipline practice

Edit `discipline/practices.ts` — use the `practice()` helper with Markdown.

## Add a learning lesson

1. Open `learning/index.ts`
2. Add a `lesson({...}, \`markdown\`)` entry
3. Append its `slug` to a path’s `lessonSlugs`
4. Save — it appears under `/mind/learning`

## Add a learning path

Add an object to `LEARNING_PATHS` with `lessonSlugs: []`, then attach lessons.

## Data (Prisma)

- `DisciplineCheckIn` — daily habit completion
- `MindReflection` — optional short reflections

Long-form training science stays in `src/content/guides/` and links from Mind when useful.
