import './styles.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initMotifs, initDraw, renderMotif } from './utils/draw.js';
import { initDateScratch } from './date-scratch.js';

gsap.registerPlugin(ScrollTrigger);

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Fitting the cornice band ─────────────────────────────────────────────
   A sliced band crops wherever the viewport happens to fall, so the cornice
   ended mid-step at both ends and read as a torn strip rather than a run of
   masonry. Both of its ends are on screen at once, so that crop is the whole
   impression.

   Instead: work out how many viewBox units are visible across the host at the
   scale its height sets, take the repeat count nearest the motif's natural
   4:1, and divide the span by it. The viewBox then measures exactly what is
   visible, so nothing crops in either axis and the band always begins and
   ends on a whole ziggurat. The period stretches by a few percent to make it
   land, which is invisible; a half-step hanging off each end is not. */
function fitBands() {
  $$('[data-motif="decoRule"]').forEach((host) => {
    const box = host.getBoundingClientRect();
    if (!box.width || !box.height) return;
    const visible = (box.width * 30) / box.height;
    const units = Math.max(2, Math.round(visible / 120));
    host.dataset.motifUnits = String(units);
    host.dataset.motifPeriod = (visible / units).toFixed(3);
  });
}

// Measured before injection: the hosts are sized by CSS, so their boxes are
// already correct while they are still empty.
fitBands();
initMotifs();
initDraw(reduceMotion);
initDateScratch();

/* Re-fit on resize. The redraw is painted finished rather than re-animated —
   a band that re-dashes itself every time an address bar collapses is noise. */
let fitTimer;
window.addEventListener('resize', () => {
  window.clearTimeout(fitTimer);
  fitTimer = window.setTimeout(() => {
    $$('[data-motif="decoRule"]').forEach((host) => {
      const before = host.dataset.motifPeriod;
      fitBands();
      if (host.dataset.motifPeriod === before) return;
      host.dataset.motifDraw = 'false';
      renderMotif(host);
    });
  }, 180);
});

/* ── The gate ─────────────────────────────────────────────────────────────
   The scroll lock is set from script rather than from the markup: if the
   bundle never runs, the page is a long scrollable invitation with a card
   sitting over the top of it, not a dead screen. */
const opener = $('#opener');
const openButton = $('#open-invitation');
const main = $('#main');
let invitationOpened = false;

document.body.classList.add('is-locked');

const finishOpening = () => {
  opener.hidden = true;
  document.body.classList.remove('is-locked');
  main.focus({ preventScroll: true });
  ScrollTrigger.refresh();
};

const revealInvitation = () => {
  if (invitationOpened) return;
  invitationOpened = true;

  // The click is the user gesture the browser wants before any audio plays,
  // so the band starts here and the control appears with it.
  if (musicToggle) musicToggle.hidden = false;
  setMusicPlaying(true);

  if (reduceMotion) {
    finishOpening();
    return;
  }

  const timeline = gsap.timeline({
    defaults: { ease: 'power3.inOut' },
    onComplete: finishOpening,
  });

  timeline
    .to('.opener__card', { y: -24, opacity: 0, duration: 0.45, ease: 'power2.in' })
    .to('.opener__panel--left', { xPercent: -102, duration: 1.4 }, '-=0.06')
    .to('.opener__panel--right', { xPercent: 102, duration: 1.4 }, '<')
    /* The black ground belongs to .opener, not to the panels, so it does not
       travel with them. Left alone it hangs over the revealed hero until the
       opener is hidden, and the whole thing reads as a cut. This is the
       recurring bug on every site in this set. */
    .to('.opener', { backgroundColor: 'rgba(11, 12, 11, 0)', duration: 0.6, ease: 'power2.in' }, '<')
    .fromTo('.hero__title', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.95, ease: 'power3.out' }, '-=0.6')
    .fromTo('.hero__dek', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, '-=0.65')
    .fromTo('.hero__meta', { opacity: 0 }, { opacity: 1, duration: 0.6, stagger: 0.09 }, '<')
    .fromTo('.hero__frame', { opacity: 0, scale: 1.04 }, { opacity: 1, scale: 1, duration: 0.9 }, '-=0.8');
};

openButton.addEventListener('click', revealInvitation);

/* ── The signature move: bilateral convergence ────────────────────────────
   Deco is symmetry before it is anything else. Every facade, grille and fan
   on this page folds down its own centre line, so the page assembles the same
   way: paired blocks come in from opposite edges and meet on the axis. The
   other five sites all rise from below; this one closes inward.

   Transform only, no opacity. If a trigger never updates, the content is
   merely un-offset rather than invisible. */
if (!reduceMotion) {
  const pairs = [
    ...$$('.converge--left').map((el) => [el, -1]),
    ...$$('.converge--right').map((el) => [el, 1]),
  ];

  pairs.forEach(([element, direction]) => {
    gsap.fromTo(
      element,
      { x: direction * Math.min(window.innerWidth * 0.09, 88) },
      {
        x: 0,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: element.parentElement ?? element,
          start: 'top 86%',
          end: 'top 44%',
          scrub: 0.7,
        },
      },
    );
  });

  // The programme rows alternate their entry side, so the list assembles on
  // the same axis as everything above it.
  $$('.programme__list li').forEach((row, index) => {
    gsap.from(row, {
      x: index % 2 === 0 ? -34 : 34,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: { trigger: row, start: 'top 90%', once: true },
    });
  });

  gsap.to('.hero__art', {
    yPercent: 8,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.8 },
  });

  gsap.to('.venue__rule', {
    xPercent: -6,
    ease: 'none',
    scrollTrigger: { trigger: '.venue', start: 'top bottom', end: 'bottom top', scrub: 0.9 },
  });
}

/* ── Music ────────────────────────────────────────────────────────────────
   Arthur Schutt's "Bluin' the Black Keys", 1926 — a piano novelty from the
   decade the building went up, and the closest thing to what a hotel courtyard
   in Saddar would actually have had a band playing.

   It starts on the gate click, because that is the one gesture the browser
   will accept as consent to make noise, and the control appears at the same
   moment. If autoplay is refused anyway the button is still there and still
   correct — the catch is the whole error handling. */
const music = $('#site-music');
const musicToggle = $('#music-toggle');
const musicLabel = musicToggle?.querySelector('.music-toggle__label');

if (music) music.volume = 0.26;

function syncMusicControl() {
  if (!music || !musicToggle) return;
  const playing = !music.paused;
  musicToggle.setAttribute('aria-pressed', String(playing));
  musicToggle.setAttribute('aria-label', playing ? 'Pause background music' : 'Play background music');
  if (musicLabel) musicLabel.textContent = playing ? 'Pause music' : 'Play music';
}

async function setMusicPlaying(shouldPlay) {
  if (!music) return;
  if (!shouldPlay) {
    music.pause();
    syncMusicControl();
    return;
  }
  try {
    await music.play();
  } catch {
    // Autoplay declined. The control stays available and honest.
  }
  syncMusicControl();
}

musicToggle?.addEventListener('click', () => setMusicPlaying(music?.paused ?? true));
music?.addEventListener('play', syncMusicControl);
music?.addEventListener('pause', syncMusicControl);

/* ── Countdown ──────────────────────────────────────────────────────────── */
const weddingTime = new Date('2026-10-17T19:00:00+05:00').getTime();
const countdownFields = {
  days: $('[data-countdown="days"]'),
  hours: $('[data-countdown="hours"]'),
  minutes: $('[data-countdown="minutes"]'),
  seconds: $('[data-countdown="seconds"]'),
};

const updateCountdown = () => {
  const distance = Math.max(0, weddingTime - Date.now());
  const days = Math.floor(distance / 86_400_000);
  const hours = Math.floor((distance / 3_600_000) % 24);
  const minutes = Math.floor((distance / 60_000) % 60);
  const seconds = Math.floor((distance / 1000) % 60);

  countdownFields.days.textContent = String(days).padStart(2, '0');
  countdownFields.hours.textContent = String(hours).padStart(2, '0');
  countdownFields.minutes.textContent = String(minutes).padStart(2, '0');
  countdownFields.seconds.textContent = String(seconds).padStart(2, '0');
};

updateCountdown();
window.setInterval(updateCountdown, 1000);

/* ── Calendar ───────────────────────────────────────────────────────────── */
const venueAddress = 'Beach Luxury Hotel, M. T. Khan Road, Karachi';
const actionStatus = $('#action-status');

$('#add-calendar').addEventListener('click', () => {
  const calendar = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Noor and Zayn//Wedding Invitation//EN',
    'BEGIN:VEVENT',
    'UID:noor-zayn-20261017@karachi-deco',
    'DTSTAMP:20260908T000000Z',
    'DTSTART:20261017T140000Z',
    'DTEND:20261017T190000Z',
    'SUMMARY:Noor and Zayn / The wedding',
    `LOCATION:${venueAddress}`,
    'DESCRIPTION:Doors at seven. Dinner at half past eight.',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([calendar], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'noor-zayn-wedding.ics';
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
  actionStatus.textContent = 'Saved to your calendar file.';
});

/* ── Reply ──────────────────────────────────────────────────────────────── */
const dialog = $('#rsvp-dialog');
const rsvpForm = $('#rsvp-form');
const formStatus = $('#form-status');
let lastDialogTrigger;

$('#open-rsvp').addEventListener('click', () => {
  lastDialogTrigger = document.activeElement;
  formStatus.textContent = '';
  dialog.showModal();
});

dialog.addEventListener('click', (event) => {
  // A native dialog's backdrop belongs to the dialog element itself, so a
  // click landing on the element rather than on its contents is a backdrop click.
  if (event.target === dialog) dialog.close('cancel');
});

// method="dialog" does the closing; returnValue says which button did it.
dialog.addEventListener('close', () => {
  if (dialog.returnValue === 'send') {
    const name = new FormData(rsvpForm).get('name');
    const first = name ? String(name).trim().split(' ')[0] : '';
    actionStatus.textContent = `Thank you${first ? `, ${first}` : ''}. We have your reply.`;
  }
  rsvpForm.reset();
  lastDialogTrigger?.focus();
});

window.addEventListener('load', () => {
  ScrollTrigger.refresh();
});
