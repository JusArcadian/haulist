# Connect Haulist to Paycheck Planner (about 10 minutes)

Never install this in your **master** copy, the one you sell. Use your personal copy.

1. **Make your copy.** Open the master and go to **File → Make a copy**. Name it "My Paycheck Planner".
2. **Open Apps Script.** In your copy, go to **Extensions → Apps Script**. A code editor opens.
3. **Paste the script.** Delete everything in `Code.gs`, then paste in all of `HaulistSync.gs`.
4. **Set your key.** On this line:
   `const SECRET_KEY = 'PASTE-YOUR-SECRET-KEY-HERE';`
   Paste your secret key here: replace the placeholder with a long made-up password (20+ characters). Save with Ctrl+S.
5. **Deploy it.** Click **Deploy → New deployment**, click the gear icon, and choose **Web app**. Then set:
   - Execute as: **Me**
   - Who has access: **Anyone** (the secret key is what protects it)
   - Click **Deploy**, then **Authorize access**, and pick your Google account. If you see "Google hasn't verified this app", click **Advanced → Go to (unsafe)**. That's normal for your own scripts.
6. **Copy the Web App URL.** It ends in `/exec`.
7. **Connect Haulist.** Go to **Family → Budget sync**. Paste your Web App URL in the first box and your secret key in the second, then tap **Save & test**.
8. **Link categories.** Choose which budget category each Haulist category counts toward (e.g. Groceries → Groceries, Home Stuff → Shopping).

**Optional:** set a **Monthly goal** for each category in Setup → "5 · Your categories". Haulist then shows "$X left". Without a goal, it shows how much you've spent this month.

**Changed the script later?** Go to Deploy → Manage deployments → edit (pencil) → Version: **New version**. Doing it this way keeps the same URL.
