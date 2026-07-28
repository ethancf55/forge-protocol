# Substance education system

## Single-substance pages

**Control file:** `src/content/education/template.ts`

| Field | Purpose |
|--------|---------|
| `id` | JSON key (camelCase) |
| `appliesTo` | `["supplement"]`, `["compound"]`, or both |
| `required` | Always generate when kind matches |
| `shape` | `"text"` · `"string[]"` · `"aaRatio"` |
| `mustCover` | What the AI must include |
| `neverInclude` | Section bans |

**Anabolic:Androgenic ratio** is a compound-only section (`shape: "aaRatio"`). When the compound is androgenic and a standard teaching ratio is known, the page shows it prominently.

## Multi-substance (Stack Observations)

**Control file:** `src/content/education/stack-template.ts`

When a user has **2+ distinct** logged substances, the app generates:

1. **Mechanism overlaps & synergies** — why effects may combine/overlap
2. **Stack Observations** — educational patterns across the log set

Cached per user + hash of their substance set (`UserStackEducation`).

Shown on:
- Each substance education page (synergies involving that substance highlighted)
- `/learn` library

## Safety

Educational only. No dosing, no “you should take X”, no sources, no protocols.

## Quality examples

`example-output.ts` — Creatine, Testosterone (with A:A 100:100), and stack synergy samples.
