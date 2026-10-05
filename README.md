# NeuroLearn — frontend

The React interface of NeuroLearn, an adaptive learning platform built on a
knowledge graph and a student model. It is the client for the Django backend
in `neuro_dj`; the model itself — BKT with bounded guess and slip, Elo on
ability and item difficulty, prerequisite-aware priors, readiness and the
trajectory — runs there. This app renders what the API reports and never
recomputes it.

## Requirements

- Node.js 20+ and npm
- The backend running and reachable (default `http://localhost:8000`)

## Running it

```sh
npm install
cp .env.example .env     # then edit if the backend is not on :8000
npm run dev              # http://localhost:8080
```

| Script | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build |
| `npm run lint` | ESLint over the whole project |
| `npm test` | Vitest once |
| `npm run test:watch` | Vitest in watch mode |
| `npm run screenshots` | The interface screenshots of section 3.1 (see below) |

Type checking is not a separate script; run `npx tsc -p tsconfig.app.json
--noEmit`.

## Screenshots for the thesis

Section 3.1 of the thesis shows the interface, so every page needs a shot at a
fixed width in Uzbek (addendum 2.11, D41). `scripts/screenshots.mjs` takes
them with Playwright, which is not a dependency of the app:

```sh
npm i -D playwright && npx playwright install chromium
# the backend on :8000 with a database seeded by `manage.py seed_thesis_demo`,
# and `npm run dev` on :8080
npm run screenshots -- --email you@example.org --password '…' \
                      --out ~/Desktop/neuro_dj/docs/ui
```

Files land in `<out>/<lang>/<page>-<width>.png` next to a `manifest.json` that
records the settings, the topic id, the commit and anything skipped — so a
figure in the thesis can be traced to the run that produced it. Instructor and
admin pages need an account with the role (D15); with a student account they
are skipped, so the script is run twice. `npm run screenshots -- --list`
prints the page names, and `--help` is in the script's header.

The run is deliberately deterministic: a fixed viewport and device scale, the
light colour scheme whatever the machine prefers, animations off, and a wait
for the network and the app's own spinner before each shot. The graph pages
use the `lev` layout, which is deterministic, so the same graph always looks
the same — a figure in the thesis must be reproducible at the defence.

## Environment

| Variable | Default | Meaning |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000` | Backend origin. The client sends credentials, so this origin must be in the backend's `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS`. |
| `VITE_ENABLE_TUTOR` | unset (off) | The AI tutor is outside the thesis scope (D17, D24). Only `"true"` enables its route and menu entry; its code is kept but not bundled otherwise. |

## Authentication

The access token is held in memory only, and the refresh token is an
`HttpOnly` cookie the browser sends on its own (D16) — neither is in
`localStorage`, which is what audit 7.3 flagged. A reload therefore has no
token: the app asks `POST /api/accounts/token/refresh/` once on start and
signs the learner in silently if the cookie is still valid.

Because the cookie travels automatically, every unsafe request carries a CSRF
token. The client fetches it from `GET /api/accounts/csrf/` and sends it back
as `X-CSRFToken`; this is why `withCredentials` is on and why the backend
origin must trust this one.

## Layout

```
src/
  api/          one module per backend area, plus shared domain types
  components/
    common/     status badge, legend, k / n ratio, trajectory, missing prerequisites
    learning-path/  React Flow nodes: a topic and a course/section frame
    topic/      the "how this was calculated" panel
    instructor/ the curriculum builder's parts, including the prerequisite editor
    ui/         shadcn primitives (vendor)
  hooks/        react-query data hooks (D19), the adaptive quiz, graph layout
  lib/          format, status palette, reason codes, KB errors, i18n
  locales/      uz.json and en.json — every string in the interface (D20)
  pages/        one file per route, all lazily loaded
```

Three modules are worth knowing before changing anything:

- **`lib/format.ts`** — the only place numbers become text. Probabilities
  (`p_mastery`, `accuracy`, p̂) are in [0, 1] and render as percentages; a test
  grade is already a percentage. Mixing the two produced both of the scale
  bugs the audit found ("0.8%" and "100%").
- **`lib/status.ts`** — the one palette for the five statuses (D21), used by
  graph nodes, cards, the heatmap and the legend alike.
- **`lib/reasons.ts`** — the backend returns `{code, params}` and never a
  sentence; this maps a code to its key in the locale files.

## Language

Uzbek (Latin) is the primary language and English is optional (D20). Every
string lives in `src/locales/*.json`; a test keeps the two files at exact key
parity, so a missing translation fails the suite rather than leaking a key
into the interface.

## Notes

- Routes are code-split with `React.lazy`. The entry chunk is ~182 kB
  (~59 kB gzipped); three.js, recharts and React Flow load with the pages that
  need them.
- `data-testid` is set on the elements an end-to-end suite needs: graph nodes
  and containers, status badges, trajectory items, quiz choices, the
  prerequisite editor and its warnings panel.
