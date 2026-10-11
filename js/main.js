/* ==========================================================================
   CONFIG — everything editable lives here.
   ========================================================================== */
const CONFIG = {
  // Absolute event time (Tehran, +03:30). Never depends on the guest's timezone.
  event: {
    start: '2026-10-19T19:00:00+03:30',
    end: '2026-10-19T23:59:00+03:30',
    calendarTitle: 'عروسی امید و یلدا',
    calendarFileName: 'omid-yalda-wedding.ics',
    calendarDescription: 'دوشنبه ۲۷ مهر ۱۴۰۵ — از ساعت ۷ بعد از ظهر',
  },

  // Venue. Coordinates are from the Balad place page.
  venue: {
    name: 'تالار فروزانی',
    lat: 36.554386,
    lng: 53.121414,
    links: {
      neshan: 'https://neshan.org/maps/places/d1102e01b0001169b90b6ff43ea9c3df',
      // null => built from lat/lng
      balad: 'https://balad.ir/p/%D8%AA%D8%A7%D9%84%D8%A7%D8%B1-%D8%B9%D8%B1%D9%88%D8%B3%DB%8C-%D9%81%D8%B1%D9%88%D8%B2%D8%A7%D9%86%DB%8C_ceremonial-services-PV2RL4A79M1Yle#17/36.554386/53.121414',
      google: 'https://www.google.com/maps/search/?api=1&query=36.554386,53.121414',
    },
  },

  // All user-facing texts. "\n" = line break.
  texts: {
    couple: 'Yalda & Omid',
    introEyebrow: 'دعوت‌نامه عروسی',
    introHint: 'برای باز کردن لمس کنید',
    opening: 'به نام عشق',
    lead: 'در روزی که عشقم رنگ خاطره‌ای می‌گیرد\nکنارمان باشید ...',
    names: 'Yalda & Omid',
    date: 'دوشنبه ۲۷ مهر ۱۴۰۵\nموعد دیدار ما',
    time: 'از ساعت ۷ بعد از ظهر\nتا خاموشی ستارگان ✨',
    venue: 'تالار فروزانی',
    note: 'بودن شما، زیباترین خاطره‌ای است که می‌توانیم\nاز این شب به یادگار داشته باشیم.',
    countdownTitle: 'تا لحظه‌ی دیدار',
    tonight: 'امشب شب ماست ✨',
    thanks: 'از اینکه کنارمان بودید، سپاسگزاریم 🤍',
    addToCalendar: 'افزودن به تقویم',
    venueName: 'تالار فروزانی',
    galleryTitle: 'قاب خاطره‌ها',
    closing: 'چشم‌انتظار حضور گرمتان هستیم',
    share: 'ارسال دعوت‌نامه برای دیگران',
    copied: 'لینک کپی شد',
    copyFailed: 'کپی نشد؛ لینک را از نوار آدرس کپی کنید',
    calendarSaved: 'فایل تقویم دریافت شد',
    musicPlay: 'پخش موسیقی',
    musicPause: 'توقف موسیقی',
  },

  // Gallery: output of `node scripts/optimize-images.js` goes here.
  // wide: true => spans the full row.
  gallery: [
    { thumb: 'assets/gallery/img_3546-600.webp', full: 'assets/gallery/img_3546-1600.webp', w: 720, h: 1280, alt: 'عکس ۱' },
    { thumb: 'assets/gallery/img_6011-600.webp', full: 'assets/gallery/img_6011-1600.webp', w: 1203, h: 1280, alt: 'عکس ۲' },
  ],

  music: {
    src: 'assets/music.mp3',
    volume: 0.7,
  },

  share: {
    title: 'دعوت‌نامه عروسی امید و یلدا',
    text: 'دوشنبه ۲۷ مهر ۱۴۰۵ — تالار فروزانی',
    url: null, // null => current page URL (without query string)
  },

  // Simulate "now" for testing, e.g. '2026-10-19T12:00:00+03:30'.
  // The ?now= query param overrides this. Presets: before | today | after
  debugNow: null,
};

/* ==========================================================================
   Helpers
   ========================================================================== */
(function () {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
  const toFa = (v) => String(v).replace(/\d/g, (d) => FA_DIGITS[d]);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  let toastTimer;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('is-shown');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-shown'), 2400);
  }

  /* ---------- Clock (with test override) ---------- */
  function resolveDebugNow() {
    let raw = new URLSearchParams(location.search).get('now') || CONFIG.debugNow;
    if (!raw) return null;
    const start = Date.parse(CONFIG.event.start);
    const presets = {
      before: start - (3 * 86400 + 5 * 3600 + 17 * 60 + 42) * 1000,
      today: start - (4 * 3600 + 12) * 1000,
      after: start + 3600 * 1000,
    };
    if (presets[raw] !== undefined) return presets[raw];
    raw = raw.trim().replace(' ', '+'); // "+" in a query string arrives as a space
    const t = Date.parse(raw);
    return Number.isNaN(t) ? null : t;
  }
  const debugNow = resolveDebugNow();
  const clockOffset = debugNow === null ? 0 : debugNow - Date.now();
  const now = () => Date.now() + clockOffset;

  /* ==========================================================================
     Texts & links from CONFIG
     ========================================================================== */
  function applyTexts() {
    $$('[data-text]').forEach((el) => {
      const value = CONFIG.texts[el.dataset.text];
      if (typeof value === 'string') el.textContent = value;
    });
    document.querySelectorAll('.envelope').forEach((el) => {
      el.setAttribute('aria-label', CONFIG.texts.couple + ' — باز کردن دعوت‌نامه');
    });

    const { lat, lng, links } = CONFIG.venue;
    $('#link-neshan').href = links.neshan ||
      `https://neshan.org/maps/@${lat},${lng},16z`;
    $('#link-balad').href = links.balad ||
      `https://balad.ir/location?latitude=${lat}&longitude=${lng}&zoom=16`;
    $('#link-google').href = links.google ||
      `https://www.google.com/maps?q=${lat},${lng}`;
  }

  /* ==========================================================================
     Music
     ========================================================================== */
  const music = {
    audio: $('#music'),
    btn: $('#music-toggle'),
    userPaused: false,
    autoPaused: false,
    failed: false,

    init() {
      this.audio.src = CONFIG.music.src;
      this.audio.volume = CONFIG.music.volume;
      this.audio.addEventListener('error', () => this.fail());
      this.audio.addEventListener('play', () => this.render(true));
      this.audio.addEventListener('pause', () => this.render(false));
      this.btn.addEventListener('click', () => {
        if (this.audio.paused) {
          this.userPaused = false;
          this.play();
        } else {
          this.userPaused = true;
          this.audio.pause();
        }
      });
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          if (!this.audio.paused) {
            this.autoPaused = true;
            this.audio.pause();
          }
        } else if (this.autoPaused && !this.userPaused) {
          this.autoPaused = false;
          this.play();
        }
      });
    },

    // Must be called synchronously inside a user-gesture handler (iOS).
    play() {
      if (this.failed) return;
      let p;
      try { p = this.audio.play(); } catch (e) { return; }
      if (p && p.catch) {
        p.catch((err) => {
          if (err && err.name === 'NotSupportedError') this.fail();
          else this.render(false);
        });
      }
    },

    show() {
      if (this.failed) return;
      this.btn.hidden = false;
      requestAnimationFrame(() => this.btn.classList.add('is-shown'));
    },

    fail() {
      this.failed = true;
      this.btn.hidden = true;
    },

    render(playing) {
      this.btn.classList.toggle('is-playing', playing);
      this.btn.setAttribute('aria-pressed', String(playing));
      this.btn.setAttribute('aria-label', playing ? CONFIG.texts.musicPause : CONFIG.texts.musicPlay);
    },
  };

  /* ==========================================================================
     1. Envelope intro
     ========================================================================== */
  function initIntro() {
    const intro = $('#intro');
    const envelope = $('#envelope');
    const page = $('#page');
    let opened = false;

    function open() {
      if (opened) return;
      opened = true;

      music.play(); // same gesture => allowed on iOS Safari

      intro.classList.add('is-opening');
      envelope.setAttribute('aria-expanded', 'true');
      const total = reducedMotion.matches ? 150 : 2100;

      setTimeout(() => {
        page.inert = false;
        page.removeAttribute('inert');
        document.body.classList.remove('is-locked');
        intro.classList.add('is-done');
        music.show();
        revealInitial();
        const target = $('#invitation');
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        setTimeout(() => intro.remove(), 800);
      }, total);
    }

    envelope.addEventListener('click', open);
    envelope.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        open();
      }
    });
    $('.skip-link').addEventListener('click', (e) => {
      e.preventDefault();
      open();
    });
  }

  /* ==========================================================================
     Reveal on scroll
     ========================================================================== */
  let revealObserver;
  function initReveal() {
    const items = $$('.reveal');
    // stagger siblings inside the hero
    $$('.invite .reveal').forEach((el, i) => el.style.setProperty('--d', `${i * 110}ms`));

    if (reducedMotion.matches || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
  }
  // Observing starts only once the envelope is gone, so the hero animates in.
  function revealInitial() {
    if (!revealObserver) return;
    $$('.reveal:not(.is-visible)').forEach((el) => revealObserver.observe(el));
  }

  /* ==========================================================================
     3. Countdown
     ========================================================================== */
  function createFlip(container) {
    let current = null;
    const half = (cls, val) => {
      const d = document.createElement('div');
      d.className = `flip__half ${cls}`;
      const s = document.createElement('span');
      s.textContent = val;
      d.appendChild(s);
      return d;
    };
    const top = half('flip__half--top', '');
    const bottom = half('flip__half--bottom', '');
    container.append(top, bottom);

    return function set(value) {
      const text = toFa(String(value).padStart(2, '0'));
      if (text === current) return;
      const prev = current;
      current = text;

      if (prev === null || reducedMotion.matches || document.hidden) {
        top.firstChild.textContent = text;
        bottom.firstChild.textContent = text;
        return;
      }
      // static: top shows new, bottom still shows old until the fold lands
      top.firstChild.textContent = text;
      const foldTop = half('flip__half--top flip__half--fold-top', prev);
      const foldBottom = half('flip__half--bottom flip__half--fold-bottom', text);
      container.append(foldTop, foldBottom);
      foldBottom.addEventListener('animationend', () => {
        bottom.firstChild.textContent = current;
        foldTop.remove();
        foldBottom.remove();
      }, { once: true });
    };
  }

  function initCountdown() {
    const start = Date.parse(CONFIG.event.start);
    // Event-day start in the event's own timezone (offset taken from the ISO string).
    const offset = (CONFIG.event.start.match(/([+-]\d\d:\d\d|Z)$/) || ['+03:30'])[0];
    const dayStart = Date.parse(`${CONFIG.event.start.slice(0, 10)}T00:00:00${offset}`);

    const timer = $('#timer');
    const tonight = $('#tonight');
    const thanks = $('#thanks');
    const sr = $('#timer-sr');
    const setters = {};
    $$('.unit', timer).forEach((u) => {
      setters[u.dataset.unit] = createFlip($('.flip', u));
    });

    let tick;
    let lastSrMinute = -1;
    function update() {
      const t = now();
      const diff = start - t;

      if (diff <= 0) {
        timer.hidden = true;
        tonight.hidden = true;
        thanks.hidden = false;
        $('#countdown-title').hidden = true;
        clearTimeout(tick);
        return false;
      }

      const s = Math.floor(diff / 1000);
      const days = Math.floor(s / 86400);
      const hours = Math.floor((s % 86400) / 3600);
      const minutes = Math.floor((s % 3600) / 60);
      const seconds = s % 60;
      setters.days(days);
      setters.hours(hours);
      setters.minutes(minutes);
      setters.seconds(seconds);

      tonight.hidden = t < dayStart;

      // screen-reader summary, refreshed once a minute
      const m = Math.floor(s / 60);
      if (m !== lastSrMinute) {
        lastSrMinute = m;
        sr.textContent = `${toFa(days)} روز، ${toFa(hours)} ساعت و ${toFa(minutes)} دقیقه تا مراسم`;
      }
      return true;
    }

    function loop() {
      if (!update()) return;
      tick = setTimeout(loop, 1000 - (now() % 1000) + 10);
    }
    loop();
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) { clearTimeout(tick); loop(); }
    });
  }

  /* ==========================================================================
     4. Add to calendar (.ics)
     ========================================================================== */
  function icsDate(ms) {
    return new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  }
  function icsLocal(iso) {
    // "2026-10-19T19:00:00+03:30" -> "20261019T190000"
    return iso.slice(0, 19).replace(/[-:]/g, '');
  }
  function icsEscape(s) {
    return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
  }
  // Fold lines at 75 octets (UTF-8 safe).
  function icsFold(line) {
    const enc = new TextEncoder();
    if (enc.encode(line).length <= 75) return line;
    const out = [];
    let cur = '';
    let limit = 75;
    for (const ch of line) {
      if (enc.encode(cur + ch).length > limit) {
        out.push(cur);
        cur = '';
        limit = 74; // continuation lines start with a space
      }
      cur += ch;
    }
    out.push(cur);
    return out.join('\r\n ');
  }

  function buildIcs() {
    const e = CONFIG.event;
    const v = CONFIG.venue;
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Omid & Yalda//Wedding Invitation//FA',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VTIMEZONE',
      'TZID:Asia/Tehran',
      'BEGIN:STANDARD',
      'DTSTART:19700101T000000',
      'TZOFFSETFROM:+0330',
      'TZOFFSETTO:+0330',
      'TZNAME:+0330',
      'END:STANDARD',
      'END:VTIMEZONE',
      'BEGIN:VEVENT',
      `UID:omid-yalda-${icsLocal(e.start)}@invitation`,
      `DTSTAMP:${icsDate(Date.now())}`,
      `DTSTART;TZID=Asia/Tehran:${icsLocal(e.start)}`,
      `DTEND;TZID=Asia/Tehran:${icsLocal(e.end)}`,
      `SUMMARY:${icsEscape(e.calendarTitle)}`,
      `LOCATION:${icsEscape(v.name)}`,
      `DESCRIPTION:${icsEscape(e.calendarDescription)}`,
      `GEO:${v.lat};${v.lng}`,
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${icsEscape(e.calendarTitle)}`,
      'TRIGGER:-PT3H',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ];
    return lines.map(icsFold).join('\r\n') + '\r\n';
  }

  function initCalendar() {
    $('#add-calendar').addEventListener('click', () => {
      const ics = buildIcs();
      if (isIOS) {
        // iOS Safari opens text/calendar data URLs in the native "Add to Calendar" sheet.
        location.href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics);
        return;
      }
      const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = CONFIG.event.calendarFileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      toast(CONFIG.texts.calendarSaved);
    });
  }

  /* ==========================================================================
     6. Gallery + lightbox
     ========================================================================== */
  function initGallery() {
    const grid = $('#gallery-grid');
    const items = CONFIG.gallery || [];
    if (!items.length) {
      $('#gallery').hidden = true;
      return;
    }

    items.forEach((item, i) => {
      const li = document.createElement('li');
      li.className = 'gallery__item reveal' + (item.wide ? ' gallery__item--wide' : '');
      li.style.setProperty('--d', `${(i % 2) * 90}ms`);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'gallery__btn';
      btn.setAttribute('aria-label', `بزرگ‌نمایی ${item.alt || ''}`.trim());
      const img = document.createElement('img');
      img.loading = 'lazy';
      img.decoding = 'async';
      img.alt = item.alt || '';
      img.width = 600;
      img.height = Math.round(600 * ((item.h || 4) / (item.w || 3)));
      img.addEventListener('load', () => img.classList.add('is-loaded'), { once: true });
      img.src = item.thumb;
      if (img.complete) img.classList.add('is-loaded');
      btn.appendChild(img);
      btn.addEventListener('click', () => lightbox.open(i, btn));
      li.appendChild(btn);
      grid.appendChild(li);
    });

    const lb = $('#lightbox');
    const img = $('#lb-img');
    const count = $('#lb-count');
    const stage = $('#lb-stage');

    const lightbox = {
      index: 0,
      opener: null,
      open(i, opener) {
        this.opener = opener;
        lb.hidden = false;
        requestAnimationFrame(() => lb.classList.add('is-open'));
        document.body.classList.add('is-locked');
        this.show(i);
        $('#lb-close').focus();
        document.addEventListener('keydown', onKey);
      },
      close() {
        lb.classList.remove('is-open');
        document.body.classList.remove('is-locked');
        document.removeEventListener('keydown', onKey);
        setTimeout(() => {
          lb.hidden = true;
          img.removeAttribute('src');
          img.style.transform = '';
          img.style.opacity = '';
        }, reducedMotion.matches ? 0 : 300);
        if (this.opener) this.opener.focus();
      },
      show(i) {
        this.index = (i + items.length) % items.length;
        const it = items[this.index];
        img.style.opacity = '0';
        img.onload = () => { img.style.opacity = ''; };
        img.src = it.full;
        img.alt = it.alt || '';
        img.style.transform = '';
        count.textContent = `${toFa(this.index + 1)} از ${toFa(items.length)}`;
        // warm up neighbours
        [1, -1].forEach((d) => {
          const n = items[(this.index + d + items.length) % items.length];
          if (n) { const pre = new Image(); pre.src = n.full; }
        });
      },
      next() { this.show(this.index + 1); },
      prev() { this.show(this.index - 1); },
    };

    function onKey(e) {
      if (e.key === 'Escape') lightbox.close();
      // RTL: the "next" photo sits to the left
      else if (e.key === 'ArrowLeft') lightbox.next();
      else if (e.key === 'ArrowRight') lightbox.prev();
      else if (e.key === 'Tab') {
        const f = $$('.lightbox__btn', lb).filter((b) => b.offsetParent !== null);
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }

    $('#lb-close').addEventListener('click', () => lightbox.close());
    $('#lb-next').addEventListener('click', () => lightbox.next());
    $('#lb-prev').addEventListener('click', () => lightbox.prev());
    stage.addEventListener('click', (e) => { if (e.target === stage) lightbox.close(); });

    // Swipe: horizontal => navigate, down => close
    let sx = 0, sy = 0, dx = 0, dy = 0, dragging = false, axis = null;
    lb.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' || e.target.closest('.lightbox__btn')) return;
      dragging = true; axis = null;
      sx = e.clientX; sy = e.clientY; dx = dy = 0;
      lb.classList.add('is-dragging');
    });
    lb.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      dx = e.clientX - sx;
      dy = e.clientY - sy;
      if (!axis && Math.hypot(dx, dy) > 8) axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (axis === 'x') img.style.transform = `translateX(${dx}px)`;
      else if (axis === 'y' && dy > 0) {
        img.style.transform = `translateY(${dy}px) scale(${1 - Math.min(dy, 300) / 1500})`;
        lb.style.backgroundColor = `rgba(24,20,17,${0.94 - Math.min(dy, 300) / 600})`;
      }
    });
    const end = () => {
      if (!dragging) return;
      dragging = false;
      lb.classList.remove('is-dragging');
      lb.style.backgroundColor = '';
      const w = window.innerWidth;
      if (axis === 'x' && Math.abs(dx) > Math.min(80, w * 0.18)) {
        // RTL: dragging to the right brings the next photo in from the left
        if (dx > 0) lightbox.next(); else lightbox.prev();
      } else if (axis === 'y' && dy > 110) {
        lightbox.close();
        return;
      }
      img.style.transform = '';
    };
    lb.addEventListener('pointerup', end);
    lb.addEventListener('pointercancel', end);
  }

  /* ==========================================================================
     7. Share
     ========================================================================== */
  function shareUrl() {
    if (CONFIG.share.url) return CONFIG.share.url;
    return location.origin + location.pathname;
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) { /* fall through */ }
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;opacity:0;';
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    ta.remove();
    return ok;
  }

  function initShare() {
    $('#share').addEventListener('click', async () => {
      const data = { title: CONFIG.share.title, text: CONFIG.share.text, url: shareUrl() };
      if (navigator.share) {
        try {
          await navigator.share(data);
          return;
        } catch (err) {
          if (err && err.name === 'AbortError') return;
        }
      }
      toast((await copyText(data.url)) ? CONFIG.texts.copied : CONFIG.texts.copyFailed);
    });
  }

  /* ==========================================================================
     Boot
     ========================================================================== */
  applyTexts();
  music.init();
  initGallery();
  initReveal();
  initIntro();
  initCountdown();
  initCalendar();
  initShare();
  if (debugNow !== null) {
    console.info('[invite] simulated now:', new Date(now()).toISOString());
  }
})();
