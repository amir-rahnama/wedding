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
    document.getElementById('page-rsvp').classList.remove('rsvp-submitted');
    const calAdd = document.getElementById('rsvp-calendar-add');
    if (calAdd) calAdd.classList.add('hidden');
    const fallLayer = document.getElementById('emoji-fall-layer');
    if (fallLayer) fallLayer.innerHTML = '';
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
const weddingDate = new Date('2026-08-22T14:00:00');

function updateCountdown() {
  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minsEl = document.getElementById('cd-mins');
  const secsEl = document.getElementById('cd-secs');
  if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

  const now = new Date();
  const diff = weddingDate - now;

  if (diff <= 0) {
    daysEl.textContent = '0';
    hoursEl.textContent = '0';
    minsEl.textContent = '0';
    secsEl.textContent = '0';
    return;
  }

  const days = Math.floor(diff / 864e5);
  const hours = Math.floor((diff % 864e5) / 36e5);
  const mins = Math.floor((diff % 36e5) / 6e4);
  const secs = Math.floor((diff % 6e4) / 1e3);

  daysEl.textContent = String(days);
  hoursEl.textContent = String(hours).padStart(2, '0');
  minsEl.textContent = String(mins).padStart(2, '0');
  secsEl.textContent = String(secs).padStart(2, '0');
}

updateCountdown();
setInterval(updateCountdown, 1000);

/* ── Home hero: date block is visible in HTML (is-revealed) so it works if JS is blocked
   or errors; this enforces the class for old cached pages or edge cases. ── */
(function ensureHeroDetailsVisible() {
  const el = document.getElementById('hero-details');
  if (el) el.classList.add('is-revealed');
})();

/* ── Show/hide attendance-only fields ── */
const attendanceInputs = document.querySelectorAll('input[name="attendance"]');
const attendanceOnlyRows = document.querySelectorAll('.attendance-only');

function toggleAttendanceFields() {
  const attending = document.querySelector('input[name="attendance"]:checked')?.value === 'yes';
  attendanceOnlyRows.forEach(el => {
    el.style.display = attending ? '' : 'none';
  });
  if (!attending) {
    document.querySelectorAll('input[name="bringing_car"]').forEach(i => {
      i.checked = false;
    });
    if (rideOfferRange) {
      rideOfferRange.value = '0';
      updateRideOfferOutput();
    }
  }
  toggleCarLiftRow();
}

const carLiftRow = document.getElementById('car-lift-row');
const rideOfferRange = document.getElementById('ride-offer-range');
const rideOfferOutput = document.getElementById('ride-offer-output');

function updateRideOfferOutput() {
  if (!rideOfferRange || !rideOfferOutput) return;
  const v = Number(rideOfferRange.value);
  rideOfferOutput.textContent = String(v);
  const max = Number(rideOfferRange.max) || 4;
  rideOfferRange.style.setProperty('--range-pct', `${(v / max) * 100}%`);
}

function toggleCarLiftRow() {
  if (!carLiftRow) return;
  const attending = document.querySelector('input[name="attendance"]:checked')?.value === 'yes';
  const carYes = document.querySelector('input[name="bringing_car"]:checked')?.value === 'yes';
  const show = attending && carYes;
  carLiftRow.style.display = show ? '' : 'none';
  if (!show && rideOfferRange) {
    rideOfferRange.value = '0';
    updateRideOfferOutput();
  }
}

// Hide on load until a choice is made
toggleAttendanceFields();
attendanceInputs.forEach(i => i.addEventListener('change', toggleAttendanceFields));

document.querySelectorAll('input[name="bringing_car"]').forEach(i => {
  i.addEventListener('change', toggleCarLiftRow);
});

if (rideOfferRange) {
  rideOfferRange.addEventListener('input', updateRideOfferOutput);
  updateRideOfferOutput();
}


/* ── RSVP form submit ── */

const PARTY_EMOJIS = [
  '🎉', '🥳', '🎊', '✨', '💐', '❤️', '🍾', '💖', '🎈', '🌟', '😊', '💕', '🎂', '💫', '🤍', '🫶'
];

function triggerEmojiFall() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const layer = document.getElementById('emoji-fall-layer');
  if (!layer) return;

  layer.innerHTML = '';
  const count = Math.min(52, Math.max(28, Math.floor(window.innerWidth / 10)));

  for (let i = 0; i < count; i++) {
    const el = document.createElement('span');
    el.className = 'emoji-fall-piece';
    el.textContent = PARTY_EMOJIS[Math.floor(Math.random() * PARTY_EMOJIS.length)];
    el.style.left = `${Math.random() * 100}%`;
    el.style.animationDuration = `${2.2 + Math.random() * 2.6}s`;
    el.style.animationDelay = `${Math.random() * 1.4}s`;
    el.style.fontSize = `${15 + Math.random() * 22}px`;
    el.style.setProperty('--emoji-drift', `${(Math.random() - 0.5) * 110}px`);
    layer.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}

// Paste your Google Apps Script Web App URL here after deploying.
// When you add form fields, update your Apps Script / sheet columns (e.g. bringing_car, ride_offer_count replace bus_to) and redeploy.
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbz4D6iZ8QMaY7HJDdiWsYYSfkRoHhM-cGi6A9VjSrCsWezzx2qL7LUvCQY5V7G5GX7N/exec';

const form = document.getElementById('rsvp-form');
const formWrap = document.getElementById('rsvp-form-wrap');
const successEl = document.getElementById('rsvp-success');
const successMsg = document.getElementById('success-msg');
const submitBtn = form ? form.querySelector('[type="submit"]') : null;

if (form && submitBtn && formWrap && successEl && successMsg) {
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
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(Object.fromEntries(new FormData(form)))
        });
      } catch (_) {
        // Network hiccup — still show success so the guest isn't blocked
      }
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send RSVP';
    }

    const calAdd = document.getElementById('rsvp-calendar-add');
    const giftsPrompt = document.getElementById('rsvp-gifts-prompt');

    if (attendance === 'yes') {
      successMsg.textContent =
        `We've received your RSVP, ${fname}! We can't wait to celebrate with you on August 22nd. ✦`;
      if (calAdd) calAdd.classList.remove('hidden');
      if (giftsPrompt) giftsPrompt.classList.remove('hidden');
    } else {
      successMsg.textContent =
        `Thank you for letting us know, ${fname}. You'll be missed — we'll be thinking of you!`;
      if (calAdd) calAdd.classList.add('hidden');
      if (giftsPrompt) giftsPrompt.classList.add('hidden');
    }

    formWrap.style.display = 'none';
    successEl.classList.remove('hidden');
    document.getElementById('page-rsvp').classList.add('rsvp-submitted');
    if (attendance === 'yes') triggerEmojiFall();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
