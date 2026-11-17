# Haulist — Patch Notes

## v0.6.1 — Clearer for everyday users (2026-11-17)
### Features
- Sign-in screen split into **Sign in / Create account** tabs, with Show password
- **Forgot password?** sends a reset email → link opens "Set a new password"
- One-time **Welcome** card (Add things · Begin Shopping · Invite family)
- Search now opens real store searches (Target, Walmart, Amazon, Publix, Costco) instead of a fake catalog
- Instacart: **Copy list** + **Open Instacart**
### Changes
- Removed "e.g." example text from inputs and all "Prototype" wording
- "Wrong email or password" instead of the technical error

## v0.6.0 — Free hosting: Supabase + GitHub Pages (2026-11-17)
### Features
- Standalone web app in `web/`: no Claude account needed for family members
- Email + password accounts (Supabase Auth); real **invite codes** (HAUL-XXXX) to join a family; Admin can make a new code
- Live sync via Supabase Realtime: every change re-reads that table on all phones
- Installable app (PWA): manifest, app icon, offline app shell (service worker)
- Paycheck Planner sync works again (the hosted app can reach Apps Script); sheet URL/key are shared with the family
### YES AND extras
- **Android Share menu**: Target/Amazon app → Share → Haulist opens the item ready to add
- Starter categories + budget links set up automatically when you create a family
- Database security: Row Level Security so only family members see family data
### Bug fixes
- Member names/colors are now escaped before display
### Notes
- The claude.ai Haulist page stays as the demo/preview version

## v0.5.0 — Live family sync (2026-11-17)
### Features
- **Live shared lists**: categories, items, budget and members are stored in the Haulist page's own database. Every change shows up on everyone's phone in seconds.
- Real family members: names come from each person's Claude account; you join the family the first time you open the page.
- Invite = share the Haulist page by email as **Editor**
- Budget screen: edit monthly goals in the app + "Start a new month"
- Finished trips are saved to the database (trip history)
### YES AND extras
- 📍 **I'm shopping** button: family sees "Mom is shopping at Target" on Home (clears after Finish trip or 3h)
- Live pop-ups when someone else adds an item ("Jordan added Milk")
### Notes
- Opening Haulist.html as a plain file still runs Demo mode (saves on that device only)
- Paycheck Planner Apps Script sync can't run inside the page yet; budgets are tracked in Haulist for now

## v0.4.1 — Hotfix (2026-11-17)
### Bug fixes
- Home crashed with "left is not a function": a local variable named `left` hid the budget helper `left()`. Renamed it to `todo`.

## v0.4.0 — Link-first adding, gift lists removed (2026-11-17)
### Features
- 📋 **Paste** button on the Add sheet: one tap reads the link you copied in Target/Amazon/etc.
- "Found something in a store app?" card on Home opens the link flow
- Paste a link into any category's add box → it switches to the link flow automatically
- ↗ button on link-added items opens the product at the store
### YES AND extras
- Remembers which category you use per store (Target links → Home Stuff, etc.)
- Same-category default when you add from inside a category
### Removed
- Gift lists, "I've got it" claiming and the Gift list toggle (not part of Haulist)
- Sample "Holiday Wishlist" replaced with "Wants"
### Notes
- Save key changed to haulist_v2 so testers get the new sample data

## v0.3.1 — Test build (2026-11-17)
### Features
- Saves your lists on this device (localStorage), so changes survive a reload
- "Reset to sample data" button on the Family tab

## v0.3.0 — Budget sync with Paycheck Planner (2026-11-17)
### Features
- **HaulistSync.gs** (Google Apps Script for your COPY of Paycheck Planner): sends each category's goal/spent/left; logs finished trips to the Spending tab, one row per budget category
- Budget meters on category pages and in Begin Shopping ("$142 left → $104 after this cart"), red when over
- Finish trip shows the budget lines it will log + a "Log to Paycheck Planner" toggle (ON by default, so nobody forgets)
- Family → **Budget sync** screen: paste Web App URL + secret key, link each Haulist category to a budget category
- New category sheet asks which budget category it counts toward
### YES AND extras
- Offline/failed syncs wait in a queue with a Retry button
- Duplicate guard: each trip has an ID, so the script never logs the same trip twice
- Secret key + POST-only so the sheet can't be read or written by anyone with just the URL
### Known limits
- Preview can't reach Google (artifact blocks outside requests) → demo numbers until Stage 2 hosting

## v0.2.0 — Family circle, categories, Begin Shopping (2026-11-17)
### Features
- **Family (Life360-style)**: invite code (HAUL-XXXX) with Copy + New code, member list with roles and live status, "Join another family"
- **Categories** replace separate lists/grocery tab: colorful tile grid with progress bars; create your own (name, icon, color, Gift list toggle)
- **Begin Shopping** mode (Shop tab / big hero button): every item on one page, progress ring, cart total, filters by category or store, grouped by aisle, Finish trip summary + confetti
- **Buy again** chips per category (items from past trips)
- Tap any price to edit it or remove the item
### YES AND extras
- "Mom is shopping at Target right now" live banner on Home
- "Shop just this category" button + shop-by-store filter
### Bug fixes
- Pasting a link left price blank with no explanation → now shows a note and jumps to the price box (real price reading comes in Stage 3)
- Text is now escaped before display (stops odd characters breaking the layout)

## v0.1.0 — Stage 1: Clickable prototype (2026-11-17)
### Features
- Lists tab: wishlist-style lists with item cards (store, price, who added it)
- "I've got it" claiming (can't claim someone else's item; tap again to unclaim)
- Add sheet: Paste link (auto-detects store + product name from the URL), Search (demo catalog with "Best price" badge), Grocery quick add
- Groceries tab: auto-sorts items into aisles, tap to check off, Staples chips to re-add, Clear checked
- Send to Instacart (mock screen showing what will be sent)
- Deals tab: price-drop list with savings
- Family tab: switch who you're acting as (for testing), dark/light mode
### YES AND extras
- "Still unclaimed" total per list
- Duplicate guard on groceries (won't add "Milk" twice)
### Known limits (prototype)
- Sample data only, resets on reload; no logins, no real link reading, no real Instacart
