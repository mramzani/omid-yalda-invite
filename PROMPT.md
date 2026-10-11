# Task: Digital Wedding Invitation — Omid & Yalda

Build a **single-page static website** that serves as a digital wedding invitation (HTML + CSS + vanilla JS — no framework, no build step). It is inspired by jashn.link-style invitations but must be more polished, lighter and smoother.

Reference screenshots/video are in `reference/`. **Look at them first** and match their feel (especially the countdown timer animation), while following this spec.

The UI language is **Persian (Farsi)**. All user-facing text must be in Persian; the invitation text below must be used **verbatim**.

---

## Repository & workflow
- Work in this repo. Final structure:
  ```
  index.html
  css/style.css
  js/main.js
  assets/fonts/        (Vazirmatn woff2, self-hosted)
  assets/gallery/      (raw photos go in assets/gallery/raw/, optimized output next to it)
  assets/music.mp3
  assets/og.jpg
  scripts/optimize-images.(js|sh)
  deploy/nginx.conf
  README.md            (in Persian)
  reference/           (already provided)
  ```
- Add a `.gitignore` (node_modules, raw images, OS files).
- Make small, logical commits as you go (e.g. "scaffold", "envelope intro", "countdown", "gallery", "deploy config") with clear English commit messages.

## Hard constraints
- **No external requests at all** (no CDNs, no Google Fonts, no analytics, no map iframes). Guests are in Iran where many foreign services are slow or blocked. Self-host everything.
- RTL layout: `<html lang="fa" dir="rtl">`. Display **Persian digits** everywhere (dates, countdown, etc.).
- Mobile-first — most guests open the link from WhatsApp/Telegram on a phone. On desktop, show the card centered with a constrained width.
- Initial page weight (excluding gallery) **under 500 KB**. Gallery images as WebP, lazy-loaded.
- Respect `prefers-reduced-motion`.
- All editable data (texts, date/time, coordinates, map links, gallery list, music path) lives in a single `CONFIG` object at the top of `js/main.js`. Include a `CONFIG.debugNow` override (or `?now=` query param) to simulate the current time for testing.

## Visual style
**Minimal modern**: very light background (white / subtle warm off-white), one refined accent color, strong typography, generous whitespace. Animations short and soft (fade/slide-in on scroll via IntersectionObserver). No clutter, no heavy ornaments. The couple's names are the most prominent element on the page.

---

## Sections (in order)

### 1. Intro — envelope opening
- First screen: a closed envelope with a wax seal, with **«امید و یلدا»** on it, and a small hint: **«برای باز کردن لمس کنید»**.
- On tap/click: the envelope flap opens with a 3D animation, the card slides out of the envelope, then transitions into the main content.
- **Start the background music on this same tap** (browsers block autoplay without a user gesture).
- Must be keyboard accessible (Enter/Space) and have proper aria labels.

### 2. Invitation text (use exactly as written, preserving line breaks)
```
به نام عشق

در روزی که عشقم رنگ خاطره‌ای می‌گیرد
کنارمان باشید ...

امید و یلدا

دوشنبه ۲۷ مهر ۱۴۰۵
موعد دیدار ما

از ساعت ۷ بعد از ظهر
تا خاموشی ستارگان ✨

تالار فروزانی

بودن شما، زیباترین خاطره‌ای است که می‌توانیم
از این شب به یادگار داشته باشیم.
```

### 3. Countdown timer
- Target: `2026-10-19T19:00:00+03:30` (Monday, 27 Mehr 1405, 7:00 PM Tehran time). **Always compute against this absolute timestamp**, never the device's local timezone.
- Show days / hours / minutes / seconds with Persian digits and labels (روز / ساعت / دقیقه / ثانیه), with an animated digit change (flip or slide) matching the reference video.
- States:
  - Before the event day: normal countdown.
  - On the event day before 19:00: countdown plus the line **«امشب شب ماست ✨»**.
  - After 19:00 on the event day: replace the timer with **«از اینکه کنارمان بودید، سپاسگزاریم 🤍»**.

### 4. Add to calendar
A button that downloads an `.ics` file generated client-side: title «عروسی امید و یلدا», 2026-10-19 19:00–23:59 Asia/Tehran, location «تالار فروزانی». Label: «افزودن به تقویم».

### 5. Venue & directions
- Heading «تالار فروزانی» with a lightweight visual preview (a static graphic/card — **not** an embedded map iframe).
- Three buttons:
  - Neshan: `https://neshan.org/maps/places/d1102e01b0001169b90b6ff43ea9c3df`
  - Balad: a link built from coordinates `36.555, 53.124`
  - Google Maps: `https://www.google.com/maps?q=36.555,53.124`
- Coordinates are approximate; keep them in `CONFIG` so they're easy to correct.

### 6. Gallery
- Images listed in `CONFIG`, served from `assets/gallery/`.
- Minimal grid (or carousel) + full-screen lightbox: swipe on mobile, arrow keys on desktop, close with Esc / swipe down / close button.
- Write `scripts/optimize-images` (Node with `sharp`, or bash with `cwebp`) that converts everything in `assets/gallery/raw/` into WebP in two sizes (thumbnail ~600px, full ~1600px) and prints the snippet to paste into `CONFIG`.
- Until real photos are added, use tasteful neutral placeholders so the layout can be reviewed.

### 7. Closing
A short closing line and a share button using the Web Share API, with a fallback that copies the link and shows a small toast («لینک کپی شد»).

---

## Background music
- `assets/music.mp3`, looping.
- Small floating play/pause button in a corner, with a subtle animated indicator while playing.
- Pause on `visibilitychange` when the tab is hidden; resume on return **only if** the user hadn't paused it manually.
- Fail gracefully if the file is missing.

## Link previews (WhatsApp / Telegram)
Open Graph + Twitter Card meta tags:
- title: «دعوت‌نامه عروسی امید و یلدا»
- description: «دوشنبه ۲۷ مهر ۱۴۰۵ — تالار فروزانی»
- image: `assets/og.jpg`, 1200×630 (generate a clean placeholder in the site's style if none exists)
Also add a favicon and `theme-color`.

## Deployment
The site will be served by **Nginx on my own Linux server** (managed through the Pachim panel). Provide `deploy/nginx.conf` with gzip (and brotli if available, commented), long cache headers for `assets/`, `css/`, `js/` and a short/no-cache policy for `index.html`, correct MIME type for `.ics`/`.webp`/`.woff2`.

## README.md (write it in Persian)
Short and practical: where to put photos and the music file, how to run the image optimization script, how to test the countdown states with the time override, and how to upload/deploy.

---

## Definition of done — verify before finishing
1. Serve locally and check at 375px and 1440px widths.
2. Test all three countdown states using the time override.
3. Confirm the page makes **zero** requests to external domains (check the network tab or grep the code).
4. Envelope → music → content flow works on first tap, including on iOS Safari.
5. Lighthouse (mobile): Performance ≥ 90, Accessibility ≥ 90.
6. Summarize anything I still need to provide (photos, music, real coordinates, OG image).
