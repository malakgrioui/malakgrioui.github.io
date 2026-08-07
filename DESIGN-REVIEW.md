# Portfolio Design Review — Apple Design Lens

> **Status: all findings in this document have been implemented.** This file is kept as the
> record of what was wrong and why each fix was made. One additional defect was found while
> testing the fixes and is noted at the end: at 320px the nav bar overflowed and the
> hamburger button was clipped off-screen, making the mobile menu unreachable on small
> phones. That was pre-existing and is now fixed.

A full pass over all 22 pages (11 EN, 10 FR, plus `style.css`) against Apple's interface
design and motion principles: response, direct manipulation, interruptibility, spring
behaviour, spatial consistency, materials and depth, typography, reduced motion, and the
eight design foundations (purpose, agency, responsibility, familiarity, flexibility,
simplicity, craft, delight).

---

## Verdict

The **visual design is genuinely good.** The restraint is real: one accent colour, one
typeface, generous whitespace, a consistent card language, negative tracking that tightens
as headings grow. That last one is a detail most portfolios get wrong, and it's right here.
Nothing is gratuitous. That's the hard part, and it's done.

What's missing is the other half of Apple's model: **the site is designed, but it isn't
built.** There is no motion system, no press feedback, no material depth, no reduced-motion
path, and no focus states. Every interactive affordance is a `:hover` rule — which means on
a phone, where most recruiters will open this, the interface has *no feedback at all*. Apple's
first principle is that response is the foundation everything else stands on. Right now
there's nothing under it.

Underneath that sit two concrete correctness problems: **the brand accent fails WCAG AA
contrast on the primary CTA and on every small label**, and **portfolio.html ships 3.8 MB of
thumbnails** for images rendered at 530×220. Both are craft failures in Apple's sense — not
taste calls, but details that read as carelessness.

Findings below are grouped by principle, then ranked into a fix order at the end.

---

## What's already right

Worth naming, because these should be preserved through any refactor.

| | |
|---|---|
| **Size-specific tracking** | `h1 -0.03em`, `h2 -0.02em`, `h3 -0.01em`, section labels `+0.12em`. Tightening large text and opening small caps text is exactly the discipline Apple's type talk describes. Most sites ship one `letter-spacing` for everything. |
| **Restraint** | One accent, one font, one card pattern, no decorative noise. Simplicity in the Apple sense — stripped to the purpose, not minimal for its own sake. |
| **Wayfinding** | Every project page opens with "← Back to all projects" and closes with the same. Sticky nav is present on all 22 pages. You are never trapped. |
| **Direct labels** | "Work" not "Home", "View Case Study" not "Learn more". Specificity creates predictability. |
| **Case study structure** | Organisation → Context & Challenge → Contributions / Methodology → Lessons Learned, identical across all 10 projects. Things that look the same behave the same. |
| **Bilingual parity** | FR mirrors EN structurally, with correct `hreflang` on most pages. |
| **Semantic bones** | `<nav>`, `<header>`, `<main>`, `<footer>` on the project pages; real heading elements; `alt` on every image. |

---

## 1. Response — the site has no feedback on touch

*Principle: respond on pointer-down, not release. Feedback must be continuous, not terminal.*

**This is the highest-impact finding.** Every interactive element on the site defines
exactly one state change, and it is `:hover`:

- `style.css:130` `.btn-primary:hover`
- `style.css:151` `.btn-outline:hover`
- `style.css:172` `.btn-outline-light:hover`
- `style.css:204` `.btn-outline-sm:hover`
- `style.css:261` `.nav-links li a:hover`
- `style.css:530` `.highlight-card:hover`
- `style.css:573` `.featured-card:hover, .project-card:hover`
- `style.css:662` `.card-link:hover`
- `style.css:796` `.project-back:hover`

There is not a single `:active` rule in 1,035 lines of CSS.

On a touch device `:hover` either never fires or fires as a sticky post-tap artifact. So the
entire feedback layer of this portfolio is invisible to phone and tablet users — the majority
of anyone opening a link from LinkedIn. Tapping "View My Work" produces nothing, then the page
changes. Apple's framing: the moment feedback lag appears, the sense of directness "falls off
a cliff." Here it isn't lag; it's absence.

**Fix.** Add a press state to every interactive class, keyed to pointer-down:

```css
.btn-primary:active,
.btn-outline:active,
.btn-outline-light:active,
.btn-outline-sm:active {
  transform: scale(0.97);
  transition: transform 100ms ease-out;
}

.featured-card:active, .project-card:active { transform: scale(0.995); }
```

Also add `@media (hover: hover)` guards around the hover rules so they don't misfire as
sticky states on touch.

---

## 2. Behaviour over animation — one duration for everything

*Principle: motion is a conversation with the object, not a prescription. Reach for springs
for anything a user can touch.*

`style.css:32` defines the site's entire motion vocabulary:

```css
--transition: 0.2s ease;
```

One duration, one curve, applied to colour changes, transforms, borders, shadows, and layout
alike. Apple's model splits motion into two families:

- **Non-momentum UI** (a hover tint, a border colour) — critically damped, `damping 1.0`,
  `response 0.3–0.4s`, no overshoot.
- **Momentum-carrying interaction** (a card lifting toward the cursor, a drawer opening) —
  slight bounce, `damping ~0.8`.

Right now everything gets the same treatment, so nothing feels like it has weight. The card
lift at `style.css:573–577` (`translateY(-4px)` + shadow) is the one moment on the site that
wants a little overshoot — a physical object rising toward you — and it eases in flatly.

**Fix** (no library needed — CSS custom easing gets most of the way):

```css
:root {
  --ease-standard: cubic-bezier(0.32, 0.72, 0, 1);   /* critically-damped feel */
  --ease-spring:   cubic-bezier(0.34, 1.4, 0.64, 1); /* slight overshoot       */
  --dur-fast: 120ms;
  --dur-base: 260ms;
  --dur-slow: 400ms;
}
```

Then: colour/tint changes → `--dur-fast --ease-standard`; card lift and image scale →
`--dur-base --ease-spring`; anything entering or leaving → `--dur-slow --ease-standard`.

### The mobile menu can't animate at all

`style.css:999–1012`:

```css
.nav-links { display: none; }
.nav-links.open { display: flex; ... }
```

`display` is not animatable. The menu teleports in and teleports out. This is also the site's
only stateful interaction, so it's the one place a transition would be most felt.

It also violates spatial consistency (§7 below): the panel appears at `top: 66px` with no
relationship to the hamburger button that summoned it. Apple's rule is that a menu should
originate from its trigger — set `transform-origin` toward the button so the spatial link is
legible.

**Fix:**

```css
.nav-links {
  position: absolute; top: 66px; left: 0; right: 0;
  display: flex; flex-direction: column;
  transform-origin: top right;          /* anchored to the hamburger */
  opacity: 0; transform: scale(0.96) translateY(-8px);
  visibility: hidden;
  transition: opacity var(--dur-base) var(--ease-standard),
              transform var(--dur-base) var(--ease-spring),
              visibility var(--dur-base);
}
.nav-links.open { opacity: 1; transform: none; visibility: visible; }
```

And the hamburger itself: `style.css:295–302` declares `transition: transform, opacity` on
the three bars but **no `.open` state ever changes them**. The transition is dead code and the
icon never becomes an X — the user has no persistent signal that the menu is open. Add the
morph, and add `aria-expanded` (see §6).

---

## 3. Interruptibility — the transitions that exist can't be grabbed

*Principle: every animation must be interruptible and redirectable at any moment; always
animate from the presentation (current) value.*

There's no gesture-driven UI here, so this principle mostly applies in its milder form: CSS
transitions do animate from the current computed value, so a mouse leaving a card mid-lift
reverses correctly. That's fine.

The one place it breaks is the mobile menu, because `display` toggling means there is no
intermediate value to interrupt. Fixing §2 fixes this too.

**Worth noting for future work:** if you ever add a project-image lightbox, a swipeable case
study carousel, or a bottom-sheet contact form, that's where the full principle bites —
pointer capture, 1:1 tracking that respects the grab offset, velocity handoff at release, and
momentum projection (`current + (v/1000)·0.998/(1−0.998)`) rather than snapping from the
release point. Not needed today; needed the moment anything becomes draggable.

---

## 4. Frame-level smoothness — one layout-thrashing animation

*Principle: animate only compositor-friendly properties — `transform` and `opacity`.*

`style.css:659–662`:

```css
.card-link { transition: gap var(--transition); }
.card-link:hover { gap: 9px; }
```

`gap` is a layout property. Animating it forces reflow on every frame of the transition, on
every card, and it's the single most-repeated interactive element on the site (10 cards on
portfolio.html). It's a small jank, but it's jank in the one moment the user is deciding
whether to click through to your work.

**Fix** — move the arrow instead of the box:

```css
.card-link { gap: 5px; }
.card-link .arrow {
  display: inline-block;
  transition: transform var(--dur-base) var(--ease-standard);
}
.card-link:hover .arrow { transform: translateX(4px); }
```

(Requires wrapping the `→` in each card link — 20 files, mechanical.)

Two more:

- `style.css:47` `scroll-behavior: smooth` is unconditional. For a user with a vestibular
  disorder, a smooth-scrolled jump to `#contact` is exactly the motion they've asked the
  system to suppress. Move it inside `@media (prefers-reduced-motion: no-preference)`.
- `style.css:56` `overflow-x: hidden` on `<body>` is a band-aid over an unfound overflow
  source (likely the `.hero::before` blob at `right: -5%`). It can also break
  `position: sticky` in some engines. Better: `overflow-x: clip` on `body`, or contain the
  blobs properly with `overflow: hidden` on `.hero` — which is already there at
  `style.css:314`, so the body rule may be removable outright.

---

## 5. Materials & depth — the translucency is declared but defeated

*Principle: translucent chrome is a floating functional layer with content scrolling beneath;
weight encodes hierarchy; use scroll edge effects, not hard dividers.*

`style.css:212–223`:

```css
.site-nav {
  background-color: rgba(255,255,255,0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--gray-100);
}
```

Three issues, all in four lines:

1. **The blur is wasted.** At 95% opacity there is essentially nothing behind the bar to
   blur. You pay the compositing cost of `backdrop-filter` and get an opaque bar. Apple's
   materials sit around 60–72% so the content underneath reads as *present but pushed back*.
2. **No `saturate()`.** Apple's materials boost saturation as they blur, which is what makes
   glass read as glass rather than as fog. `blur(20px) saturate(180%)` is the canonical pair.
3. **A hard 1px divider.** Apple replaced these with scroll edge effects — a short gradient
   fade where content meets floating chrome — precisely because a hairline rule reads as a
   seam between two flat planes, while a fade reads as depth.

**Fix:**

```css
.site-nav {
  background-color: rgba(255,255,255,0.72);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(255,255,255,0.5); /* bright edge = light catching glass */
}
/* scroll edge effect instead of a hairline */
.site-nav::after {
  content: ''; position: absolute; top: 100%; left: 0; right: 0; height: 12px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.05), transparent);
  pointer-events: none;
}
```

**Shadow scale doesn't encode size.** `--shadow-sm` / `--shadow` / `--shadow-lg`
(`style.css:29–31`) are a reasonable ramp, but they're applied by importance rather than by
surface area. Apple's rule: *bigger surfaces read as thicker* — a large project card should
carry a deeper, softer shadow than a small highlight tile. Currently `.highlight-card`
(small, `style.css:531`) and `.featured-card` (large, `style.css:573`) differ in shadow, which
is right, but the reasoning isn't encoded anywhere and will drift as new components appear.

**Missing: `prefers-reduced-transparency`.** See §6.

---

## 6. Accessibility & reduced motion — nothing is implemented

*Principle: reduced motion means a gentler equivalent, not no feedback. Respond to three
independent signals.*

`style.css` contains **zero** of these queries:

- `@media (prefers-reduced-motion: reduce)` — absent
- `@media (prefers-reduced-transparency: reduce)` — absent
- `@media (prefers-contrast: more)` — absent
- `:focus-visible` — absent

The last one is the most serious. **There is no visible focus indicator anywhere on the
site.** A keyboard user tabbing through portfolio.html has no idea which of the 10 project
links they're on. Browsers do supply a default outline, but several rules here will visually
swallow it, and no styling reinforces it.

**Fix:**

```css
:where(a, button, select, [tabindex]):focus-visible {
  outline: 2px solid var(--accent-text);
  outline-offset: 3px;
  border-radius: var(--radius-sm);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .featured-card:hover, .project-card:hover { transform: none; }
}

@media (prefers-reduced-transparency: reduce) {
  .site-nav { background-color: #fff; backdrop-filter: none; }
}

@media (prefers-contrast: more) {
  .featured-card, .project-card, .highlight-card, .detail-card {
    border-color: var(--gray-600);
  }
}
```

Note the reduced-motion block keeps the shadow and border-colour changes on card hover — the
feedback survives, only the vestibular part is dropped. That's the correct interpretation.

### Other accessibility findings

**No skip link.** Every page forces a keyboard user through the full nav before reaching
content. One-line fix in each `<body>`.

**`aria-expanded` never set.** `index.html:41`, and the identical markup in all 22 pages:

```html
<button class="nav-toggle" id="nav-toggle" aria-label="Toggle menu">
```

The button reports no state. The inline script (`index.html:198–202`) only toggles a class:

```js
toggle.addEventListener('click', () => { links.classList.toggle('open'); });
```

A screen reader user cannot tell whether the menu is open. Add
`aria-expanded="false"` to the markup and sync it in the handler. While there: the menu can't
be closed with Escape, and focus isn't moved into it.

**The language switcher is a `<select>` with inline navigation** (`index.html:35–38`):

```html
<select class="language-select" onchange="location = this.value;" aria-label="Language">
```

Two problems. First, in several browsers arrow-keying through a native `<select>` fires
`change` on each option, so a keyboard user navigating the list is **navigated away before
they've chosen**. Second, a language switch is navigation, not form input — Apple's
familiarity principle says use the control people already understand for the job. Two
links, or a small segmented control, both fix it.

**Missing `<main>` landmark** on `index.html`, `portfolio.html`, `fr/index.html`,
`fr/portfolio.html`. Present on all 18 project pages. Inconsistent, and it costs those four
pages the "skip to main content" affordance screen readers offer for free.

**Heading order skips a level** on portfolio.html: `<h1>My Work</h1>` in the header, then
`<h3>` in every card, with no `<h2>` between. Same in `fr/portfolio.html`.

**No `lang` on the language options** and no `hreflang` on portfolio.html (see §9).

---

## 7. Colour & contrast — the brand accent fails AA

*Principle (craft): colours that adapt, and hold up. Every value is a deliberate choice you
can defend.*

`--accent: #0d9488` (`style.css:5`) is the identity of this site. Measured against WCAG 2.1:

| Usage | Pair | Ratio | Required | |
|---|---|---|---|---|
| **`.btn-primary` — the primary CTA** | `#fff` on `#0d9488` | **3.74** | 4.5 | ❌ |
| `.section-label` (0.73rem caps) | `#0d9488` on `#fff` | **3.74** | 4.5 | ❌ |
| `.card-link` "View Case Study →" | `#0d9488` on `#fff` | **3.74** | 4.5 | ❌ |
| `.tags span` (0.7rem) | `#0d9488` on `#f0fdfa` | **3.59** | 4.5 | ❌ |
| `.hero-label` | `#0d9488` on `#f0fdfa` | **3.59** | 4.5 | ❌ |
| `.highlight-number`, `.project-section h2`, `.detail-card h3` | `#0d9488` on light | **3.6–3.7** | 4.5 | ❌ |
| **`.site-footer p`** | `#fff @35%` on `#134e4a` | **2.56** | 4.5 | ❌ |
| `.site-footer a` | `#fff @50%` on `#134e4a` | **3.63** | 4.5 | ❌ |
| `.btn-outline-light` border (contact) | `#fff @40%` on `#134e4a` | **2.89** | 3.0 | ❌ |
| `.contact-inner p` | `#fff @60%` on `#134e4a` | 4.54 | 4.5 | ✅ (barely) |
| Body text `#1e293b` on white | | 14.63 | 4.5 | ✅ |
| `--text-muted #64748b` on white | | 4.76 | 4.5 | ✅ |
| `.section-label.light #99f6e4` on `#134e4a` | | 7.52 | 4.5 | ✅ |

The primary call-to-action on every page of the portfolio is below AA. So is every section
label, every tag, and every "View Case Study" link.

**Fix — split the token.** Keep `#0d9488` for decorative fills, borders, and the conic ring;
introduce a darker sibling for anything that carries text:

```css
:root {
  --accent:      #0d9488;  /* decorative: borders, rings, gradient blobs */
  --accent-text: #0f766e;  /* 5.47:1 on white, 5.25:1 on #f0fdfa — all text + CTA fills */
  --accent-hover:#115e59;  /* 7.58:1 */
}
```

`#0f766e` is already in the file as `--accent-hover`, so the visual language doesn't change —
it just shifts one step down the ramp. Then swap `--accent` → `--accent-text` on:
`.btn-primary` background, `.section-label`, `.card-link`, `.tags span`, `.hero-label`,
`.highlight-number`, `.project-section h2`, `.detail-card h3`, `.lessons-card h2`,
`.company-badge-dark`, `.text-accent`, `.project-back:hover`, `.nav-brand span`.

Footer: raise `rgba(255,255,255,0.35)` → `0.7` (5.56:1) and the link `0.5` → `0.85`.
Contact outline button border: `0.4` → `0.6` (4.54:1).

### No dark mode

Apple's craft principle names "colours that adapt to light and dark" explicitly. The site
declares no `color-scheme`, no `prefers-color-scheme` block. On a phone in dark mode at night
this portfolio is a full-brightness white flash. The token structure is already clean enough
that dark mode is a ~40-line addition — every colour is already a variable.

Minimum viable version: add `<meta name="color-scheme" content="light dark">` and redefine the
grey ramp + `--white`/`--hero-bg` under `@media (prefers-color-scheme: dark)`. The teal ramp
inverts naturally (use `--accent-muted #99f6e4` as the dark-mode text accent — 7.52:1 on the
dark ground, already measured above).

---

## 8. Typography — good instincts, no system

*Principle: hierarchy from weight + size + leading as a set. Respect the user's text size.
Tracking is size-specific.*

The tracking work is right, as noted. Three gaps:

**No type scale.** Font sizes across the stylesheet: `0.7, 0.72, 0.73, 0.75, 0.8, 0.83, 0.86,
0.87, 0.88, 0.9, 0.92, 0.93, 0.97, 1, 1.05, 1.2, 1.8` rem — seventeen distinct values, most of
them within 0.03rem of a neighbour. `0.86` vs `0.87` vs `0.88` is not a hierarchy; it's drift.
The Apple standard is that every value is a choice you can defend. A 6-step scale (`0.75, 0.875,
1, 1.125, 1.25, 1.5` rem plus display clamps) covers everything here.

**Everything is in `px`, so nothing respects the user's text-size setting.** Padding, gaps,
and margins are all fixed pixels — `padding: 88px 0`, `gap: 24px`, `padding: 13px 26px`. A user
who has bumped their browser font size gets larger text inside identically-sized boxes, and
the layout tightens until it breaks. Apple's Dynamic Type equivalent on the web is spacing in
`rem`/`em` so the layout scales *with* the text. Mechanical conversion, high payoff.

**Body leading is loose for the measure.** `body { line-height: 1.7 }` (`style.css:55`) and
`p { line-height: 1.8 }` (`style.css:81`). At the 860px case-study measure that's a lot of air
between lines — the eye loses the return sweep. Leading should track size *inversely*: 1.05–1.2
on the display headings (correct here), ~1.6 on body. The `.detail-card li` at 1.6
(`style.css:903`) is closer to right than the paragraphs are.

**Small text is too small.** `.tags span` at `0.7rem` = 11.2px (`style.css:627`), `.company-badge`
and several labels at `0.72rem` = 11.5px. Below ~12px, and combined with the contrast failures
above, these are effectively decorative. 0.75rem floor.

**`Plus Jakarta Sans` weight 300 is loaded on all 22 pages and used nowhere.** Drop it from
the Google Fonts URL — free byte savings, and one less font file blocking render.

**Consider `system-ui` first.** Apple's guidance is to default to the platform font unless
there's a reason — it ships optical sizing, tracking tables, and legibility tuning you can't
replicate. Plus Jakarta Sans is a defensible choice for a personal brand, so this is a taste
call rather than a finding; but the render-blocking `<link>` to fonts.googleapis.com on every
page has a real cost. At minimum, self-host or add `<link rel="preload">`.

---

## 9. Purpose & simplicity — content integrity issues

*Principle: decide what not to build; every element earns its place; things that look the
same behave the same.*

**Two orphaned case studies.** `booster.html` and `sherpa.html` exist, are fully written, and
are **linked from nowhere** — not from `portfolio.html`, not from `index.html`, not from
anything. They're only reachable by typing the URL. They also have no FR translations, unlike
all 8 linked projects.

This also explains the "9+ Projects Delivered" stat card (`index.html:107`, `fr/index.html:106`)
against 8 projects actually shown. Either link them (making it 10) or remove them.

**Footer copyright drift.** 7 pages say © 2024, 15 say © 2025:

```
2024: booster, dositrace, earthwallet, forestscan, kobotoolbox, schoolaboration, sherpa
2025: everything else
```

Same footer, same site, two different years. Small, but it's exactly the kind of detail Apple's
craft principle says reads as carelessness — and a portfolio for a *product manager* is judged
on precisely this.

**The README is the upstream template's, unmodified.** It documents `about-me.html`,
`skill-set.html`, `style-about-me.css`, and `style-portfolio.css` — none of which exist here —
tells the reader to clone `iluskaland/portfolio-template`, and points "Contact" at someone
else's GitHub. Anyone who visits the repo (recruiters do) sees a template README rather than
this project. Rewrite it as a short description of *this* site.

**Language switcher targets are inconsistent.** Three different patterns across the site:

- `index.html:36` — EN option value `/`
- `portfolio.html:27–29` — EN value `/`, so switching to EN from the FR portfolio page lands on the *homepage*, not the English portfolio
- `gmt-backbone.html:28` — EN value `gmt-backbone.html` with `selected`
- `booster.html:26` — FR value `fr/portfolio.html`, pointing at a page that isn't a translation of booster at all

Switching language should always land on the same page in the other language. Right now it
sometimes dumps you at the homepage, and once at an unrelated page.

**SEO/meta coverage is uneven.** Open Graph tags exist only on `index.html` and
`fr/index.html`. All 9 other EN project pages except `gearbank` and `gmt-backbone` have no
`canonical` and no `hreflang`, while every FR page has both. So links to English case studies
shared on LinkedIn render without a preview card, and Google doesn't know the EN/FR pages are
translations of each other. Also missing: `sitemap.xml`, `robots.txt`, a 404 page.

---

## 10. Performance as craft

Not a separate Apple principle — it's craft, and it's the most measurable failure here.

**portfolio.html loads 3.8 MB of thumbnails.** Eight images, rendered at roughly 530×220 CSS
pixels each:

| File | Size |
|---|---|
| `gearbank.jpg` | 1,139 KB |
| `earthwallet.png` | 1,062 KB |
| `forestscan.png` | 811 KB |
| `schoolaboration.png` | 483 KB |
| `dositrace.png` | 213 KB |
| `kobotoolbox.png` | 39 KB |
| `hackathon.svg` + `gmt-backbone.svg` | 22 KB |

Photographs shipped as PNG (`earthwallet`, `forestscan`, `schoolaboration`) are the main
offender — PNG is the wrong format for photographic content and is costing roughly 10× the
bytes. Resized to 2× display size and served as WebP, this set should land near 250 KB total —
a **~93% reduction**. On a phone on cellular, that's the difference between a portfolio that
loads and one that doesn't.

`index.html` also loads `profile-pic.png` at 403 KB for a 340px circle.

**No `loading="lazy"`** on any image in any of the 22 pages — all 8 portfolio thumbnails are
fetched eagerly, including the six below the fold.

**No `width`/`height` attributes** on any image, so every one contributes cumulative layout
shift as it arrives. The CSS fixes the container height (`.project-card-img { height: 220px }`)
which mitigates it inside cards, but the hero photo will still jump.

**4.9 MB of unreferenced assets** are committed to the repo — `about-me.png` (1,379 KB),
`about-me1.png` (484 KB), `github-portfolio-template-demo-dark.png` (482 KB, the template
author's screenshot), `project1/2/3.png` (871 KB combined), and 15 more. Nothing links to any
of them. They don't affect page load, but they bloat every clone and they're the template's
leftovers, not yours.

---

## 11. Structural / maintenance

**The same 5-line script is duplicated in all 22 pages.** Every nav fix — `aria-expanded`,
Escape-to-close, focus management — has to be applied 22 times. Extract to `nav.js` and
`<script defer src>` it.

**The nav markup itself is duplicated 22 times**, with the four inconsistent language-switcher
variants noted above as the direct consequence. Without a build step there's no clean fix, but
a single shared `nav.js` that also owns the language-link `href` logic would eliminate the
drift.

**Spacing has no scale.** Distinct spacing values in `style.css`: `1, 2, 3, 4, 5, 6, 7, 8, 9,
10, 11, 12, 13, 14, 16, 18, 20, 22, 24, 26, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 88` px
— thirty-two of them. `13px 26px` button padding, `7px 13px` nav links, `9px` gaps, `5px 13px`
badges. These read as hand-nudged rather than chosen. An 8pt-derived scale
(`4, 8, 12, 16, 24, 32, 48, 64, 88`) covers every case here and makes future additions
self-evident.

**Radii aren't concentric.** `--radius-sm: 6px` on buttons, `--radius: 12px` on cards,
`--radius-lg: 20px` on featured cards, `100px` on pills. A 6px-radius button sitting inside a
20px-radius card is the one visual detail Apple is most consistent about: nested corners should
be concentric — inner radius = outer radius − padding. The buttons want ~10px.

**`.about-highlights { top: 88px }`** (`style.css:519`) against a 66px nav — a 22px gap that
looks arbitrary because it is. Derive it: `top: calc(66px + var(--space-4))`.

---

## Fix order

Ranked by impact per unit of effort.

### Do first — correctness

1. **Fix the accent contrast.** Split `--accent` / `--accent-text`, swap ~13 usages, raise the
   footer and contact-button alphas. *~30 min, fixes AA on every page.*
2. **Compress the images.** Resize to 2× display, convert photos to WebP, add `loading="lazy"`
   and `width`/`height`. *~1 hour, ~93% payload reduction on the portfolio page.*
3. **Add `:focus-visible` styles.** *~5 min, unblocks keyboard navigation site-wide.*
4. **Add `:active` press states.** *~15 min, gives the site feedback on touch for the first time.*
5. **Add `prefers-reduced-motion`** (and gate `scroll-behavior: smooth`). *~10 min.*

### Do next — content integrity

6. Link or remove `booster.html` / `sherpa.html`; reconcile the "9+" stat.
7. Normalise footer years to 2025.
8. Fix the four language-switcher variants so every page maps to its own translation.
9. Rewrite the README.
10. Add `<main>` to the four pages missing it; fix the h1→h3 skip on both portfolio pages.

### Then — the design system

11. Extract `nav.js`; add `aria-expanded`, Escape-to-close, and the hamburger→X morph.
12. Replace `--transition` with the duration + easing token set; animate the mobile menu with a
    transform anchored to its trigger.
13. Fix the `gap` transition on `.card-link`.
14. Rebuild the nav as a real material — 0.72 alpha, `blur(20px) saturate(180%)`, scroll edge
    effect instead of the hairline; add `prefers-reduced-transparency`.
15. Collapse spacing to an 8pt scale and font sizes to a 6-step scale; convert spacing to `rem`.
16. Make the radii concentric.

### Finally — new capability

17. Dark mode (`color-scheme` + a `prefers-color-scheme` token block).
18. Skip links, `sitemap.xml`, `robots.txt`, a 404 page, OG tags + `hreflang` on all pages.
19. Self-host the font, or preload it; drop the unused weight 300.
20. Delete the 4.9 MB of unreferenced assets.

---

## Closing note

The gap here isn't taste — the taste is good. It's that Apple treats interaction and visual
design as one thing ("you shouldn't be able to tell where one ends and the other begins"),
and this site currently has only the visual half. The first four items on that list add the
missing half in about two hours, and items 1 and 2 alone move it from *fails accessibility
audit on the primary CTA* to *clean*.

---

## Addendum — found while testing the fixes

**The mobile menu was unreachable at 320px.** A responsive sweep across 8 viewport widths
found that `.nav-container` overflowed below ~360px: brand + language switcher + Resume
button + hamburger do not fit in 272px of usable width. The hamburger rendered at
`left: 347px` in a 320px viewport — entirely off-screen — and `overflow-x` on `<body>`
clipped it silently rather than producing a scrollbar. On an iPhone SE or any 320px-wide
device, the navigation menu could not be opened at all.

This predates this review and the original code had it too; it only surfaced under
automated testing because the symptom is invisible (no scrollbar, no error, just a missing
button).

Fixed by moving the CV/Resume link into the mobile panel as a `.nav-cv` list item, hiding
the nav-bar button below 640px, and tightening container padding below 480px. Verified at
320 / 360 / 390 / 414 / 640 / 768 / 1024 / 1440px in both themes.
