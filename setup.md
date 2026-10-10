# Study Planner — Data & Setup Guide

This document explains how the Study Planner stores its data, where that code lives, and how to set the app up from scratch.

---

## 1. How data is stored (current setup)

The app does **not** use an external database. All data lives in the **browser's localStorage**, so tasks survive page reloads and browser restarts without any server or login.

### Storage keys

| Key | What it holds | Written by |
|---|---|---|
| `study-planner-v1` | One JSON object: `{ tasks, goal, days, sessions }` | `src/routes/index.tsx` |
| `study-planner-theme` | `"light"` or `"dark"` | `src/routes/index.tsx` |

### Saved data shape

```json
{
  "tasks": [
    {
      "id": "sample-0",
      "title": "Complete React hooks practice",
      "subject": "Programming",
      "priority": "High",
      "due": "2026-10-10",
      "notes": "Build a small component using useState and useEffect.",
      "created": "2026-10-10T08:00:00.000Z",
      "completed": false
    }
  ],
  "goal": 5,
  "days": ["2026-10-10"],
  "sessions": 3
}
```

- `tasks` — the full task list (see the `Task` type in `src/lib/planner.ts`)
- `goal` — daily study goal (number, capped at 50)
- `days` — list of `YYYY-MM-DD` dates on which at least one task was completed (drives the streak counter)
- `sessions` — completed focus-timer sessions

### Load code (on app start)

```ts
// src/routes/index.tsx
const raw = localStorage.getItem('study-planner-v1');
if (raw) {
  const data = JSON.parse(raw);
  if (Array.isArray(data.tasks) && data.tasks.every((t: Task) =>
    typeof t.title === 'string' &&
    typeof t.id === 'string' &&
    subjects.includes(t.subject) &&
    priorities.includes(t.priority)
  )) setTasks(data.tasks);
  else setTasks(seedTasks());
  setGoal(Number(data.goal) > 0 ? Math.min(50, Number(data.goal)) : 5);
  setDays(Array.isArray(data.days) ? data.days : []);
  setSessions(Number(data.sessions) || 0);
} else {
  setTasks(seedTasks());   // first launch: 6 sample tasks
  setDays([dayKey()]);
}
```

Corrupt or malformed saved data falls back to the sample tasks — the app never crashes on bad storage.

### Save code (runs whenever tasks/goal/days/sessions change)

```ts
// src/routes/index.tsx
localStorage.setItem(
  'study-planner-v1',
  JSON.stringify({ tasks, goal, days, sessions })
);
```

If storage is full, the app shows a notice asking the user to export a copy (CSV).

### Theme persistence

```ts
document.documentElement.classList.toggle('dark', theme === 'dark');
localStorage.setItem('study-planner-theme', theme);
```

### Supporting library code

`src/lib/planner.ts` contains the data helpers:

- `Task` type and `subjects` / `priorities` constants — the data model
- `dayKey()` — converts a date to a `YYYY-MM-DD` key using the **local** calendar
- `seedTasks()` — the 6 sample tasks shown on first launch (4 pending, 2 completed)
- `streakCount(days)` — counts consecutive completed-days going backwards from today
- `downloadCSV(tasks)` — exports the task list as a CSV file (with UTF-8 BOM so Excel opens it correctly)

---

## 2. First-launch behaviour

1. No saved data found → the app seeds 6 sample tasks and starts `days` with today.
2. The user's edits (add/edit/delete/complete, goal change, theme) are saved to localStorage immediately on every change.
3. Next visit loads the saved state instead of the samples.

To reset the app to a fresh state: clear the two storage keys (browser DevTools → Application → Local Storage → delete `study-planner-v1` and `study-planner-theme`), or run in the browser console:

```js
localStorage.removeItem('study-planner-v1');
localStorage.removeItem('study-planner-theme');
location.reload();
```

---

## 3. Local development setup

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

Then open the printed localhost URL (dev server runs on port 8080 in this workspace).

- No environment variables, API keys, or database connection strings are required — the app runs fully offline.
- Build: `npm run build`

---

## 4. Optional upgrade: a real server database

localStorage keeps data only in the current browser — clearing browser data or switching devices loses it. To sync tasks across devices or back them up server-side, connect **Lovable Cloud** in the Lovable editor (it provides the database, user logins and storage with no external accounts).

Migration steps at a high level:

1. Enable Lovable Cloud for the project.
2. Create a `tasks` table with columns matching the `Task` type above, plus a `user_id` column tied to the signed-in user.
3. Add row-level security so each user reads/writes only their own rows.
4. Replace the `localStorage.getItem`/`setItem` calls in `src/routes/index.tsx` with database reads/writes (keep localStorage as an offline cache if desired).

Until that upgrade is done, the localStorage layer above is the complete and only data layer.
