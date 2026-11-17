# Haulist Study Guide

## Ch.1 — How the prototype is built (v0.1.0)
- **One file**: HTML (structure) + CSS (look) + JavaScript (behavior) all in index.html.
- **State object**: `state` holds every list/item. Actions change `state`, then call `render()` to redraw. (Same idea React uses.)
- **Template strings**: screens are built with backtick strings like `` `<div>${item.name}</div>` ``.
- **CSS variables**: colors live in `:root` (`--accent`, etc.); the `.light` class swaps them = dark mode toggle.
- **parseLink()**: uses `new URL()` to read the hostname (→ store) and the longest dashed path piece (→ product name).
- **aisleFor()**: keyword lookup to sort groceries into aisles.
- Next stage replaces `state` with a Supabase database so changes sync live.

## Ch.2 — v0.2.0 changes
- **Why no price from a link?** A web page can't read another site (browser security rule called CORS). `parseLink()` only sees the URL text. Stage 3 adds a server function that fetches the page and reads its price tags.
- **Data change**: `lists` + `grocery` merged into `categories[]`; each has `gift:true/false`. Gift = claim button, otherwise = checkbox.
- **shoppable()**: `flatMap` gathers items from every non-gift category into one array → that's the whole Begin Shopping page.
- **Progress ring**: an SVG circle; `stroke-dashoffset = C*(1-pct)` hides the unfinished part.
- **esc()**: swaps `< > " ' &` for safe codes so typed text can't inject HTML (security habit: XSS prevention).
- **confetti()**: makes 60 small divs with a CSS falling animation, removes them after ~4s.

## Ch.3 — Budget sync (v0.3.0)
- **Apps Script web app** = free mini-server living inside your Google Sheet. `doPost(e)` runs whenever Haulist sends data.
- **Flow**: Haulist `fetch(url,{method:'POST', body:JSON})` → script checks `SECRET_KEY` → `getBudgets()` or `logTrip()` → returns JSON.
- **text/plain trick**: sending JSON as `text/plain` skips the CORS "preflight" request Apps Script can't answer.
- **LockService**: if two phones finish at once, one waits, so rows don't overwrite each other.
- **PropertiesService**: stores `trip_<id>` so a retried trip isn't logged twice (idempotency).
- **map**: `state.budget.map = {c1:'Groceries'}` links a Haulist category to a Setup category name — names must match exactly.

## Ch.4 — Saving on the device (v0.3.1)
- `localStorage.setItem(key, JSON.stringify(state))` turns the state object into text and saves it in the browser on every `render()`.
- On load, `JSON.parse(localStorage.getItem(key))` turns it back into an object. Wrapped in try/catch because some browsers block storage.
- Device-only: other phones do not see it. Stage 2 (Supabase) is what shares data.

## Ch.5 — Link-first adding (v0.4.0)
- `navigator.clipboard.readText()` reads what you copied. Browsers only allow it after a tap, and some block it, so it is wrapped in try/catch with a "long-press and Paste" fallback.
- `/^https?:\/\//i.test(text)` is a regex that checks "does this start with http:// or https://".
- `state.storeCat[store] = categoryId` is a small lookup table that remembers your choice per store.

## Errors — "left is not a function" (v0.4.1)
- **Shadowing**: `const left = all.filter(...)` inside homeView reused the name of the global function `left()`. Inside that function, `left` meant the array, so `left(...)` crashed.
- Fix: give variables and functions different names (`todo` vs `left`).

## Ch.6 — Live sync (v0.5.0)
- **Database layout**: `cats/<id>`, `items/<id>` (has `cat` field), `members/<userId>`, `settings/main`, `trips/<id>`.
- **onSnapshot**: subscribe once; it fires on every change from any phone → `rebuild()` turns the rows into `state.categories` → `render()`.
- **Write pattern**: change local state (feels instant) → `putItem()` saves to the database → everyone's snapshot updates.
- **docChanges()** lists what changed. That's how the "Mom added Milk" pop-up works.
- **Presence**: `members/<me>.shopping` + `since` timestamp, which expires after 3 hours so stale "shopping now" badges vanish.
- **Demo vs live**: `claude.use('db')` returns null outside the hosted page → app falls back to local demo data.

## Ch.7 — Free hosting (v0.6.0)
- **Supabase** = Postgres database + logins + realtime. **GitHub Pages** = free static website hosting.
- **RLS (Row Level Security)**: `is_member(family_id)` runs on every query, so the database itself blocks other families' rows, even though the anon key is public. (Cyber concept: never trust the client; enforce access server-side.)
- **security definer functions** (`create_family`, `join_family`): run with extra rights but only do one safe thing, so users never insert themselves into a family directly.
- **Realtime**: `sb.channel().on('postgres_changes', ...)` fires on any change → `loadTable()` re-reads it → `rebuild()`.
- **PWA**: `manifest.json` (name, icon, share target) + `sw.js` (caches the app). That's what "Add to Home Screen" uses.
- **share_target**: Android passes the shared link as `?url=` / `?text=`; `handleShare()` finds the `https://` link and opens the Add sheet.

## Ch.8 — Accounts polish (v0.6.1)
- `resetPasswordForEmail(email, {redirectTo})` emails a link; opening it fires `onAuthStateChange("PASSWORD_RECOVERY")` → `updateUser({password})`.
- `encodeURIComponent(q)` makes search text safe inside a URL (spaces → %20).
- Bump `VERSION` in sw.js on every upload so phones drop the old cached app.
