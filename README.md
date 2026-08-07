# malakgrioui.github.io

Personal portfolio of **Malak Grioui** — Product Manager working at the intersection of
technology, AI, and sustainability. Live at
[malakgrioui.github.io](https://malakgrioui.github.io).

Static site, no build step: hand-written HTML, one stylesheet, one script. Hosted on
GitHub Pages from `main`.

## Structure

```
index.html              Home — hero, about, featured work, contact
portfolio.html          All projects
<project>.html          10 case studies (hackathon, gmt-backbone, gearbank,
                        forestscan, earthwallet, kobotoolbox, dositrace,
                        schoolaboration, sherpa, booster)
404.html                Not-found page
fr/                     Full French translation, same page-for-page structure
style.css               Design tokens + all component styles
nav.js                  Shared navigation behaviour (mobile menu, a11y state)
assets/                 Images (WebP), OG share cards (JPEG), CV PDFs
sitemap.xml, robots.txt
```

Every English page has a French counterpart at the same filename under `fr/`, and the
language switcher in the nav always maps a page to its own translation.

## Design system

All values in `style.css` come from a scale rather than being set per component:

- **Spacing** — 8pt scale (`--space-1` … `--space-9`), in `rem` so the layout scales with
  the user's browser text-size setting.
- **Type** — 6 steps (`--text-xs` … `--text-2xl`) plus `clamp()` for display headings.
  Tracking is size-specific: negative on large headings, positive on small caps labels.
- **Motion** — two easings. `--ease-standard` is critically damped (no overshoot) and
  handles almost everything; `--ease-spring` carries a slight overshoot and is reserved
  for motion that follows a physical gesture, like the project-card lift.
- **Colour** — `--accent` is decorative only. `--accent-text` carries every piece of text
  and every solid button fill, because the decorative teal does not clear WCAG AA at
  small sizes.
- **Radii** — concentric: nested corners step down so inner and outer curves stay
  visually parallel.

## Accessibility

Checked and maintained:

- All text meets WCAG 2.1 AA contrast in both light and dark themes.
- Visible `:focus-visible` indicator on every interactive element; skip link on every page.
- `:active` press states, so the interface gives feedback on touch and not only on hover.
- `prefers-reduced-motion`, `prefers-reduced-transparency`, and `prefers-contrast` are all
  honoured. Reduced motion keeps colour and shadow feedback and drops only the movement.
- The mobile menu reports `aria-expanded`, closes on Escape and on outside click, and
  returns focus to its toggle.

## Local development

No dependencies. Serve the directory over HTTP so relative paths and the language
switcher behave as they do in production:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Editing `style.css` requires bumping the `?v=` query on the `<link>` in each page to bust
the browser cache.

## Images

Photographs are stored as WebP, sized to 2× their display box. Open Graph share cards are
separate 1200×630 JPEGs (`assets/og-*.jpg`) because social scrapers do not reliably
support WebP. Any new image should follow the same pattern, and every `<img>` needs
`width`, `height`, and `loading="lazy"` unless it is above the fold.

## License

Site content and case studies © Malak Grioui. The original HTML/CSS scaffold was adapted
from the MIT-licensed [portfolio-template](https://github.com/iluskaland/portfolio-template)
by iluskaland.

## Contact

[LinkedIn](https://www.linkedin.com/in/malak-grioui/) · malak.grioui@hotmail.fr
