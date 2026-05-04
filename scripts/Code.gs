// ─────────────────────────────────────────────────────────────────────────────
// RSVP Web App — paste into Google Apps Script (Extensions → Apps Script)
//
// 1. Open the Google Sheet that should receive RSVPs → Extensions → Apps Script
// 2. Replace the editor contents with this file → Save
// 3. Deploy → Manage deployments → Edit (pencil) → New version → Deploy
//    (New code does not run until you publish a new version.)
//
// Field names must match the <form> in index.html (name="...").
// If your script is NOT bound to a sheet, set SPREADSHEET_ID to the Sheet ID from the URL.
// ─────────────────────────────────────────────────────────────────────────────

const SHEET_NAME = 'RSVPs';

/** Leave '' if the script project is opened from the spreadsheet (recommended). */
const SPREADSHEET_ID = '';

const RSVP_TIMEZONE = 'Europe/Stockholm';

/** Order + headers for each column after Timestamp. Keys = form `name` attributes. */
const RSVP_COLUMNS = [
  { key: 'fname', header: 'First Name' },
  { key: 'lname', header: 'Last Name' },
  { key: 'email', header: 'Email' },
  { key: 'attendance', header: 'Attending' },
  { key: 'bringing_car', header: 'Bringing car' },
  { key: 'ride_offer_count', header: 'Ride offer (extra seats)' },
  { key: 'bus_from', header: 'Bus church → venue' },
  { key: 'drinks', header: 'Beverages' },
  { key: 'child_count', header: 'Children' },
  { key: 'highchair_count', header: 'High chairs' },
  { key: 'dietary', header: 'Dietary' },
  { key: 'song', header: 'Song request' },
  { key: 'message', header: 'Message' }
];

function getSpreadsheet_() {
  if (SPREADSHEET_ID && String(SPREADSHEET_ID).length > 10) {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error(
      'No spreadsheet: open this script from the Sheet (Extensions → Apps Script) or set SPREADSHEET_ID.'
    );
  }
  return ss;
}

function headerRow_() {
  return ['Timestamp'].concat(RSVP_COLUMNS.map(function (c) {
    return c.header;
  }));
}

function formatAttendance_(v) {
  if (v === 'yes') return 'Yes';
  if (v === 'no') return 'No';
  return v || '';
}

function ensureSheetAndHeaders_(sheet) {
  const want = headerRow_();
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(want);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, want.length).setFontWeight('bold');
    return;
  }
  var lastCol = Math.max(sheet.getLastColumn(), want.length);
  var row1 = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var mismatch = row1.length < want.length;
  if (!mismatch) {
    for (var i = 0; i < want.length; i++) {
      if (String(row1[i] || '') !== want[i]) {
        mismatch = true;
        break;
      }
    }
  }
  if (mismatch) {
    sheet.getRange(1, 1, 1, want.length).setValues([want]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, want.length).setFontWeight('bold');
  }
}

function doPost(e) {
  try {
    var ss = getSpreadsheet_();
    var sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }

    ensureSheetAndHeaders_(sheet);

    var p = (e && e.parameter) ? e.parameter : {};
    var ts = Utilities.formatDate(new Date(), RSVP_TIMEZONE, "yyyy-MM-dd HH:mm:ss");

    var row = RSVP_COLUMNS.map(function (col) {
      var raw = p[col.key];
      if (raw == null) return '';
      if (col.key === 'attendance' || col.key === 'bringing_car') return formatAttendance_(String(raw));
      return String(raw);
    });

    sheet.appendRow([ts].concat(row));

    return ContentService.createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ result: 'error', error: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput('Carolina & Amir RSVP endpoint is live ✦').setMimeType(
    ContentService.MimeType.TEXT
  );
}
