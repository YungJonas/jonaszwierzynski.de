# Jonas Portfolio — Claude Context

Zero-dependency static site (HTML/CSS/JS). No build step, no frameworks.

## Local development

```bash
python -m http.server 8000
# or: npx serve .
```

Open http://localhost:8000.

## Architecture

```
index.html              # Homepage: nav, hero, about, work list, contact, footer
projects/*.html         # One file per case study
css/main.css            # Design tokens + all homepage components
css/case-study.css      # Case-study-only components (header, process list, results grid, figure styles, bottom nav)
js/main.js              # Single IIFE: nav scroll, mobile menu, fade-in observer, smooth scroll, footer year
images/                 # Project images
```

**Key relationship:** `case-study.css` inherits tokens from `main.css` via the shared `:root`. Case study pages link both CSS files; `index.html` links only `main.css`.

## Adding a case study

1. Copy `projects/fintech-app-redesign.html` → new file in `projects/`
2. Update `<header class="cs-header">` meta block and section content
3. Add images to `images/`

Figures use `onerror="this.style.display='none'"` — missing images fall back to the `background: #111112` placeholder.

## Design tokens (`css/main.css` `:root`)

| Category | Variables |
|----------|-----------|
| Colors   | `--c-bg`, `--c-border`, `--c-text`, `--c-muted`, `--c-dim`, `--c-accent` |
| Fonts    | `--font-display` (Satoshi Garamond, serif) |
| Layout   | `--max-w: 1200px`, `--gutter: clamp(1.5rem, 5vw, 5rem)` |

## Animation system

Add `data-animate` to any element to opt into fade-in-on-scroll. Stagger siblings with `data-delay="100"` / `"200"` / `"300"`.

`js/main.js` uses a single `IntersectionObserver` (6% threshold) that adds `.is-visible` (opacity 1) when the element enters the viewport.


# Jonas Zwierzynski — Portfolio Website
