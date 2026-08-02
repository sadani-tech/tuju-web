# Tuju — Frontend

Next.js 15 web application for the Tuju life-path platform.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15.1 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3.4 |
| State | Zustand 5 |
| HTTP | Axios 1.7 |
| UI Primitives | Radix UI (Dialog, Progress, Tabs, Toast) |
| Icons | Lucide React |
| Node | 20+ |

---

## Setup

### 1. Install

```bash
cd frontend
npm install
```

### 2. Environment

```bash
cp .env.local.example .env.local
```

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | — | `http://localhost:8000` | Backend base URL. Used in `next.config.ts` rewrite rule. Falls back to `localhost:8000` at build time if unset. |

### 3. Run

```bash
npm run dev      # development server at http://localhost:3000
npm run build    # production build
npm run start    # serve production build
npm run lint     # ESLint check
```

All `/api/v1/*` requests are proxied to the backend via a Next.js rewrite rule (`next.config.ts`), so no CORS headers are needed in the browser.

---

## Project Structure

```
frontend/src/
├── app/
│   ├── layout.tsx                # Root layout — fonts, metadata template, html lang="id"
│   ├── page.tsx                  # Landing page (public, server component, 8 sections)
│   ├── (auth)/
│   │   ├── login/page.tsx        # Login form
│   │   └── register/page.tsx     # Registration form
│   ├── (dashboard)/
│   │   ├── layout.tsx            # Sidebar + mobile bottom nav + global stores init
│   │   ├── dashboard/page.tsx    # Home overview (completeness, points, report snapshot)
│   │   ├── profile/page.tsx      # 5-section profile form (academic → goals → documents)
│   │   ├── report/page.tsx       # Life Path Report (generate + poll + display results)
│   │   ├── roadmap/page.tsx      # 3-layer task system with progress tracking
│   │   ├── chat/
│   │   │   ├── page.tsx          # Profession grid to start a chat session
│   │   │   ├── [slug]/page.tsx   # Active chat UI with SSE streaming
│   │   │   └── history/page.tsx  # Past chat sessions
│   │   ├── explore/
│   │   │   ├── page.tsx          # Grid of all 28 professions with search + filter
│   │   │   └── [slug]/page.tsx   # Profession detail (work style, education paths, match score)
│   │   ├── evolution/page.tsx    # Activity timeline
│   │   ├── points/page.tsx       # Balance, level, transactions, redeem rewards
│   │   └── settings/page.tsx     # Profile edit, password change, notifications, account delete
│   ├── api/
│   │   └── chat/stream/route.ts  # Next.js route handler — proxies SSE from backend
│   └── onboarding/page.tsx       # Segment selection after registration
├── components/
│   ├── ui/
│   │   ├── Toast.tsx             # toast(message, type) helper + ToastContainer
│   │   ├── ProgressBar.tsx       # Reusable progress bar with optional labels
│   │   ├── PillBadge.tsx         # Coloured pill: green | amber | blue | slate | indigo | red
│   │   ├── ScoreBar.tsx          # Score visualisation bar (value / max)
│   │   └── LoadingSpinner.tsx    # Spinner with size="sm" | "lg"
│   ├── gamification/
│   │   ├── PointsToast.tsx       # GamificationLayer — floating toast on points earn
│   │   └── LevelUpModal.tsx      # Modal shown on level-up event
│   ├── profile/
│   │   ├── RIASECSlider.tsx      # 0–100 slider for each RIASEC dimension
│   │   └── TagInput.tsx          # Free-text tag input (hobbies, skills, etc.)
│   ├── report/
│   │   ├── ProfessionCard.tsx    # Ranked profession card with score breakdown
│   │   ├── MajorCard.tsx         # University major recommendation card
│   │   └── TrackCard.tsx         # Highschool track recommendation card
│   └── roadmap/
│       ├── LayerSection.tsx      # One roadmap layer (header + task list)
│       └── TaskCard.tsx          # Individual task with complete button
├── lib/
│   └── api.ts                    # All API functions (see below)
├── store/
│   ├── authStore.ts              # useAuthStore — user, token, isAuthenticated
│   └── pointsStore.ts            # usePointsStore — totalPoints, level, streak
├── types/
│   └── index.ts                  # All TypeScript interfaces (User, Report, Roadmap…)
└── middleware.ts                 # Auth redirect guard (unauthenticated → /login)
```

---

## Pages

### Public
| Route | File | Description |
|---|---|---|
| `/` | `app/page.tsx` | Marketing landing page (server component) |
| `/login` | `(auth)/login/page.tsx` | Login form |
| `/register` | `(auth)/register/page.tsx` | Registration form |
| `/onboarding` | `onboarding/page.tsx` | Post-registration segment selection |

### Dashboard (requires auth)
| Route | Description |
|---|---|
| `/dashboard` | Overview: completeness widget, points, report snapshot, roadmap preview |
| `/profile` | Profile form with 5 sections. Each save awards +10 pts |
| `/report` | Generate and view Life Path Report. Polls status every 3s during generation |
| `/roadmap` | 3-layer task system. Layers unlock as previous layer reaches 50% completion |
| `/chat` | Browse 28 professions. Resume or start a chat session |
| `/chat/[slug]` | Live chat with AI persona. Streamed via SSE |
| `/chat/history` | All past chat sessions |
| `/explore` | Browse all professions with search + category filter. Shows ⭐ badge for report recommendations |
| `/explore/[slug]` | Profession detail: work style bars, education timeline, academic requirements, match score |
| `/evolution` | Chronological activity log with point events |
| `/points` | Points balance, level progress, earn guide, reward redemption, transaction history |
| `/settings` | Account settings: profile edit, password change, notification toggles, danger zone |

---

## API Client (`src/lib/api.ts`)

All calls go through a single Axios instance that:
- Reads `tuju_token` from `localStorage` and injects `Authorization: Bearer ...`
- On 401 response: clears token and redirects to `/login`

```ts
import { authApi, profileApi, reportApi, roadmapApi, pointsApi,
         evolutionApi, chatApi, professionsApi, settingsApi,
         rewardsApi, streamChat } from "@/lib/api";
```

| Export | Methods |
|---|---|
| `authApi` | `register`, `login`, `me`, `onboarding` |
| `profileApi` | `me`, `getCompleteness`, `updateSegment`, `updateAcademic`, `updatePersonality`, `updateWorkStyle`, `updateInterests`, `updateGoals` |
| `reportApi` | `generate`, `getLatest`, `getStatus`, `getLayered`, `getHistory` |
| `roadmapApi` | `init`, `get`, `completeTask`, `updateMilestone` |
| `pointsApi` | `get`, `transactions`, `redeem` |
| `rewardsApi` | `list`, `redeem` |
| `evolutionApi` | `list`, `summary` |
| `chatApi` | `getProfessions`, `startSession`, `getSessions`, `getMessages` |
| `professionsApi` | `list`, `categories`, `detail` |
| `settingsApi` | `get`, `updateProfile`, `updatePassword`, `updateNotifications`, `deleteAccount` |
| `streamChat` | SSE streaming handler with callbacks: `onChunk`, `onDone`, `onPointsAwarded`, `onError` |

---

## State Management

Two global Zustand stores, initialised in the dashboard layout on every page load:

### `useAuthStore`
```ts
const { user, meData, token, isAuthenticated, setAuth, setMeData, logout } = useAuthStore();
```
- `setAuth(user, token)` — called after login/register; persists token to `localStorage`
- `setMeData(data)` — called after `GET /auth/me`; populates name, segment, completeness
- `logout()` — clears state + `localStorage`

### `usePointsStore`
```ts
const { totalPoints, currentLevel, currentStreak, nextLevel, pointsToNext } = usePointsStore();
```
- `setPoints(data)` — syncs from `GET /points`
- `addPoints(amount)` — local optimistic update after earning/redeeming
- `getLevelInfo(pts)` — returns `{ name, stars, progress, nextName, nextMin }`

Both stores are hydrated in the dashboard layout's `<LayoutInit />` component via parallel API calls.

---

## Sidebar Navigation

Desktop: fixed 56px sidebar. Mobile: bottom navigation bar (5 icons).

| Icon | Label | Route | Mobile |
|---|---|---|---|
| 🏠 | Dashboard | `/dashboard` | ✅ |
| 🎯 | Life Path | `/report` | ✅ |
| 👤 | Profil | `/profile` | ✅ |
| 🗺️ | Roadmap | `/roadmap` | — |
| ✨ | Perjalanan | `/evolution` | — |
| 🤖 | AI Expert | `/chat` | ✅ |
| 🔍 | Eksplorasi | `/explore` | ✅ |
| 🏆 | Poin & Level | `/points` | — |
| ⚙️ | Pengaturan | `/settings` | — |

---

## SSE Chat Streaming

The chat uses Server-Sent Events routed through a Next.js API route handler:

```
Browser → POST /api/chat/stream (Next.js route)
        → POST /api/v1/chat/stream (FastAPI backend)
        ← SSE events: { type: "chunk" | "done" | "points_awarded" | "error" }
```

The Next.js route handler (`app/api/chat/stream/route.ts`) proxies the request to avoid CORS issues, forwarding the `Authorization` header.

`streamChat()` in `lib/api.ts` reads the `ReadableStream`, parses `data:` lines, and dispatches to four callbacks.

---

## Key Design Patterns

**Auth guard** — `middleware.ts` runs on every `/(dashboard)` route; redirects to `/login` if no `tuju_token` in cookies.

**Loading states** — every data-fetching page starts with `loading = true` and renders a spinner or skeleton grid.

**Toast notifications** — `toast(message, "success" | "error" | "info")` from `components/ui/Toast.tsx`. Auto-dismisses after 3.5s.

**Optimistic updates** — points balance updates locally via `addPoints()` before the API response confirms, then syncs from server.

**Report polling** — report page polls `GET /report/{id}/status` every 3 seconds until status is `done` or `failed`.
