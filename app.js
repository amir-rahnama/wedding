/* ── Navigation ── */
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav-link');

function showPage(id) {
  pages.forEach(p => p.classList.toggle('active', p.id === `page-${id}`));
  navLinks.forEach(l => l.classList.toggle('active', l.dataset.page === id));
  window.scrollTo({ top: 0, behavior: 'smooth' });
  // Reset RSVP to form view on re-visit
  if (id === 'rsvp') {
    document.getElementById('rsvp-form-wrap').style.display = '';
    document.getElementById('rsvp-success').classList.add('hidden');
  }
}

// Nav links
navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    showPage(link.dataset.page);
  });
});

// Any button with data-page
document.addEventListener('click', e => {
  const btn = e.target.closest('[data-page]');
  if (btn && !btn.classList.contains('nav-link')) {
    showPage(btn.dataset.page);
  }
});

/* ── Countdown ── */
const weddingDate = new Date('2026-06-14T16:00:00');

function updateCountdown() {
  const now = new Date();
  const diff = weddingDate - now;

  if (diff <= 0) {
    ['days', 'hours', 'mins', 'secs'].forEach(k =>
      document.getElementById(`cd-${k}`).textContent = '0'
    );
    return;
  }

  const days = Math.floor(diff / 864e5);
  const hours = Math.floor((diff % 864e5) / 36e5);
  const mins = Math.floor((diff % 36e5) / 6e4);
  const secs = Math.floor((diff % 6e4) / 1e3);

  document.getElementById('cd-days').textContent = String(days);
  document.getElementById('cd-hours').textContent = String(hours).padStart(2, '0');
  document.getElementById('cd-mins').textContent = String(mins).padStart(2, '0');
  document.getElementById('cd-secs').textContent = String(secs).padStart(2, '0');
}

updateCountdown();
setInterval(updateCountdown, 1000);

/* ── Show/hide attendance-only fields ── */
const attendanceInputs = document.querySelectorAll('input[name="attendance"]');
const attendanceOnlyRows = document.querySelectorAll('.attendance-only');

function toggleAttendanceFields() {
  const attending = document.querySelector('input[name="attendance"]:checked')?.value === 'yes';
  attendanceOnlyRows.forEach(el => {
    el.style.display = attending ? '' : 'none';
  });
}

// Hide on load until a choice is made
toggleAttendanceFields();
attendanceInputs.forEach(i => i.addEventListener('change', toggleAttendanceFields));

/* ── Show/hide high chair based on child answer ── */
const childInputs    = document.querySelectorAll('input[name="child"]');
const highchairRow   = document.getElementById('highchair-row');

function toggleHighchair() {
  const hasChild = document.querySelector('input[name="child"]:checked')?.value === 'yes';
  highchairRow.style.display = hasChild ? '' : 'none';
}

toggleHighchair();
childInputs.forEach(i => i.addEventListener('change', toggleHighchair));

/* ── RSVP form submit ── */

// Paste your Google Apps Script Web App URL here after deploying:
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbyMF5-UAD1fuG8rAwkrNCuw5q8kNXf0jf9crpMTKgGy7nwi7yEeDUJ_e4nRCPEVpR-f/exec';

const form = document.getElementById('rsvp-form');
const formWrap = document.getElementById('rsvp-form-wrap');
const successEl = document.getElementById('rsvp-success');
const successMsg = document.getElementById('success-msg');
const submitBtn = form.querySelector('[type="submit"]');

form.addEventListener('submit', async e => {
  e.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const attendance = document.querySelector('input[name="attendance"]:checked')?.value;
  const fname = document.getElementById('fname').value.trim();

  // Send to Google Sheet (fire-and-forget — no-cors means we can't read the
  // response, but the data lands in the sheet as long as the URL is set)
  if (SHEET_URL !== 'PASTE_YOUR_SCRIPT_URL_HERE') {
    submitBtn.textContent = 'Sending…';
    submitBtn.disabled = true;
    try {
      await fetch(SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: new URLSearchParams(new FormData(form))
      });
    } catch (_) {
      // Network hiccup — still show success so the guest isn't blocked
    }
    submitBtn.disabled = false;
  }

  if (attendance === 'yes') {
    successMsg.textContent =
      `We've received your RSVP, ${fname}! We can't wait to celebrate with you on June 14th. ✦`;
  } else {
    successMsg.textContent =
      `Thank you for letting us know, ${fname}. You'll be missed — we'll be thinking of you!`;
  }

  formWrap.style.display = 'none';
  successEl.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
