/******************************************************************
 *  HAULIST SYNC for Paycheck Planner  (v0.3.0)
 *  Goes in YOUR COPY of Paycheck Planner: Extensions → Apps Script
 *  What it does:
 *    1. Sends Haulist each category's monthly goal + spent this month
 *    2. Logs finished Haulist trips onto the Spending tab
 *       (one row per budget category, like "Haulist – Groceries trip")
 ******************************************************************/

// ▼▼▼ Paste your secret key here (make up a long password, 20+ characters).
//     Paste the SAME key into Haulist → Family → Budget sync.
const SECRET_KEY = 'PASTE-YOUR-SECRET-KEY-HERE';
// ▲▲▲ That's the only line you need to change.

const SPENDING_TAB = 'Spending';
const SETUP_TAB = 'Setup';
const FIRST_ROW = 5;   // first data row on the Spending tab (row 4 = headers)
// Spending columns: B Date · C What was it? · D Category · E Amount · I Notes

/* ---------- Entry point: Haulist always POSTs (keeps the key out of URLs) ---------- */
function doPost(e) {
  let body = {};
  try { body = JSON.parse(e.postData.contents); } catch (err) {}
  if (SECRET_KEY.startsWith('PASTE') || body.key !== SECRET_KEY) {
    return out({ ok: false, error: 'Wrong or missing key' });
  }
  if (body.action === 'logTrip') return out(logTrip(body.trip));
  return out(getBudgets());
}
function doGet() { return out({ ok: true, msg: 'Haulist Sync is running. Use POST.' }); }
function out(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
const round = n => Math.round(n * 100) / 100;

/* ---------- Read categories from Setup → "5 · YOUR CATEGORIES" ---------- */
function getCategories() {
  const data = SpreadsheetApp.getActive().getSheetByName(SETUP_TAB).getDataRange().getValues();
  const header = data.findIndex(r => r[1] === 'Category' && String(r[2]).startsWith('Group'));
  const cats = [];
  for (let r = header + 1; r < data.length; r++) {
    const name = data[r][1];
    if (!name) break;                                   // stops at the first blank row
    cats.push({ name: String(name), group: String(data[r][2]), goal: Number(data[r][3]) || null });
  }
  return cats;
}

/* ---------- Budget → Haulist: goal, spent, left for this month ---------- */
function getBudgets() {
  const sh = SpreadsheetApp.getActive().getSheetByName(SPENDING_TAB);
  const last = sh.getLastRow();
  const rows = last >= FIRST_ROW ? sh.getRange(FIRST_ROW, 2, last - FIRST_ROW + 1, 4).getValues() : [];
  const now = new Date(), spent = {};
  rows.forEach(([date, what, cat, amt]) => {
    const d = new Date(date);
    if (cat && !isNaN(d) && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
      spent[cat] = (spent[cat] || 0) + (Number(amt) || 0);
    }
  });
  return {
    ok: true,
    month: Utilities.formatDate(now, Session.getScriptTimeZone(), 'MMMM yyyy'),
    categories: getCategories().map(c => ({
      ...c, spent: round(spent[c.name] || 0),
      left: c.goal == null ? null : round(c.goal - (spent[c.name] || 0)),
    })),
  };
}

/* ---------- Haulist → Budget: log a finished trip ---------- */
// trip = { id, date, shopper, lines: [{ category, label, amount, count }] }
function logTrip(trip) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);                                 // two phones finishing at once won't collide
  try {
    const props = PropertiesService.getScriptProperties();
    if (props.getProperty('trip_' + trip.id)) return { ok: true, duplicate: true };  // already logged

    const sh = SpreadsheetApp.getActive().getSheetByName(SPENDING_TAB);
    const valid = new Set(getCategories().map(c => c.name));
    const lines = (trip.lines || []).filter(l => Number(l.amount) > 0);

    // first empty row in column C ("What was it?")
    const last = Math.max(sh.getLastRow(), FIRST_ROW);
    const col = sh.getRange(FIRST_ROW, 3, last - FIRST_ROW + 1, 1).getValues();
    let row = FIRST_ROW + col.findIndex(r => r[0] === '');
    if (row < FIRST_ROW) row = last + 1;

    lines.forEach((l, k) => {
      const r = row + k;
      sh.getRange(r, 2, 1, 4).setValues([[
        new Date(trip.date),
        'Haulist – ' + l.label,
        valid.has(l.category) ? l.category : '',        // blank if the name doesn't match Setup
        round(Number(l.amount)),
      ]]);
      sh.getRange(r, 9).setValue(`${l.count} items · by ${trip.shopper} · haulist:${trip.id}`);
    });
    props.setProperty('trip_' + trip.id, '1');
    return { ok: true, logged: lines.length };
  } finally {
    lock.releaseLock();
  }
}
