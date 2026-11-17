# Put Haulist online for free (about 20 minutes)

You'll need: **Haulist-web.zip** and **supabase_setup.sql**.
- **Supabase** (free) holds the accounts and live lists.
- **GitHub Pages** (free) hosts the app at `https://jusarcadian.github.io/haulist/`.

---

## Part A: Supabase (accounts and the database)

1. **Make the project.** Go to **supabase.com**, click **Start your project**, and sign in with GitHub.
2. **Fill in the details.** Click **New project** and set:
   - Name: `haulist`
   - Database password: click **Generate** and save it in your password manager.
   - Region: **East US**
   - Plan: **Free**

   Click **Create** and wait about 2 minutes.
3. **Build the database.** In the left menu, open **SQL Editor** and click **New query**. Open `supabase_setup.sql`, copy ALL of it, paste it in, and click **Run**. You should see `Success. No rows returned`.
4. **Skip email confirmation.** Go to **Authentication → Sign In / Providers → Email** and turn OFF **Confirm email**, then click Save. Family members can then sign up without waiting for an email. The free plan only sends a few emails per hour.
5. **Get your keys.** Go to **Project Settings → API** (on some versions it's called **API Keys**). Copy these two:
   - **Project URL**, which looks like `https://abcdxyz.supabase.co`
   - The **anon public** key (a long string starting with `eyJ...`). Don't use the `service_role` key.

## Part B: Add your keys

6. **Unzip** `Haulist-web.zip` and open `config.js` in Notepad.
7. **Paste the keys:**
   - Paste your Project URL here: replace `PASTE-YOUR-PROJECT-URL-HERE`.
   - Paste your anon public key here: replace `PASTE-YOUR-ANON-KEY-HERE`.

   Keep the quote marks around each one, then save.

## Part C: GitHub Pages (the website)

8. **Make the repository.** On **github.com**, click **+ → New repository** and set:
   - Name: `haulist`
   - Visibility: **Public** (free Pages needs public)

   Click **Create repository**.
9. **Upload the files.** Click **uploading an existing file** and drag in all 7 files: `index.html`, `config.js`, `manifest.json`, `sw.js`, `icon.svg`, `icon-192.png`, `icon-512.png`. Click **Commit changes**.
10. **Turn on Pages.** Go to **Settings → Pages**. Under Source, pick **Deploy from a branch**, choose **main** and **/ (root)**, then click **Save**.
11. **Wait 1–2 minutes** and refresh. Your link appears: **https://jusarcadian.github.io/haulist/**
12. **Tell Supabase your link.** Back in Supabase, go to **Authentication → URL Configuration**. Paste your GitHub Pages link into **Site URL**, then click Save.

## Part D: Start using it

13. **Create your account.** Open the link on your phone, tap **Create account**, then **Start a new family**. You become the Admin.
14. **Invite your family.** Go to **Family → Copy invite** and text it to them. They open the link, create an account, and enter the code under **Join**.
15. **Install it like an app:**
    - iPhone (Safari): **Share → Add to Home Screen**
    - Android (Chrome): **⋮ → Install app** or **Add to Home screen**
16. **Android bonus:** once it's installed, in the Target or Amazon app tap **Share → Haulist** and the item opens ready to add.

---

## Is a public repo safe?
Yes. The code is public, but your family's data isn't. Every table has **Row Level Security**: the database only returns rows for families you belong to, and you can only join with the invite code. The anon key is meant to be public. Never put the `service_role` key anywhere in these files.

## Updating the app later
1. On GitHub, open the repo, click **Add file → Upload files**, upload the new `index.html`, and commit.
2. Open `sw.js`, change `VERSION` (e.g. `haulist-v0.6.1`), and commit. This makes phones download the update.

## Free plan limits
- Supabase pauses a free project after **7 days with nobody using it**. Normal family use keeps it awake. If it does pause, click **Restore** in the dashboard.
- The free plan covers 500 MB of data and 50,000 users a month, far more than a family needs.

## Paycheck Planner sync (works again here)
In **Family → 💰 Budget sync**, paste your Apps Script Web App URL and secret key (see `SYNC_SETUP.md`). Finished trips then log to your sheet for the whole family.
