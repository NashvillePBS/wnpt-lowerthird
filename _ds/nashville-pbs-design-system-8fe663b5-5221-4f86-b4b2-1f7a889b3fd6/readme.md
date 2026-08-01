# Nashville PBS — Design System

A design system for **Nashville PBS (WNPT)**, the PBS member station serving Middle Tennessee. It packages the brand's visual foundations, reusable UI components, and a full website UI kit so designers and agents can produce on-brand interfaces and assets quickly.

> Nashville PBS enriches Middle Tennessee by connecting our community to the wider world through the power of public media. Supported by local donors, our nonprofit offers diverse programming on the free PBS app, PBS KIDS app, and four over-the-air channels — reaching nearly 2.4 million viewers with educational, news, environmental, emergency and cultural content.

Nashville PBS inherits the **national PBS brand system** (PBS Blue, the PBS Sans typeface, the "everyman" P-head logo, the primary/accent palette) and layers on its **local lockups** and **geometric brand patterns** (Community, Insight).

---

## Sources used to build this system

- **Uploaded assets** (`uploads/`, copied + repaired into `assets/`):
  - `NashvillePBS_Logo_{Horizontal,Vertical}_{Color,White}.svg` — the four official Nashville PBS lockups.
  - `Community_Pattern_RGB_1920x1920.png`, `Insight_Pattern_RGB_1920x1920.png` — brand geometric patterns.
- **PBS national brand references** (public):
  - PBS Color Use Guidelines (Aug 2025) — exact palette hex/PMS values.
  - PBS Brand Guidelines / logo & font guidance (pbs.org/brand).

### ⚠️ Repairs & substitutions (please review)
1. **Logo fills restored.** The uploaded color/white SVGs shipped with an empty `<defs>`, so every path rendered **solid black**. Fills were restored to the official spec using explicit `fill` attributes: color logo = PBS Blue shield + wordmark with white profiles; white logo = white shield + wordmark with PBS Blue profiles. Originals are untouched in `uploads/`. **Please confirm these match your master files.**
2. **Font.** The brand face **PBS Sans** is now self-hosted from the licensed `.woff2` files in `/fonts` (upright + italic, Light→Black, plus the condensed cut via `--font-cond`). Arial is the sanctioned system fallback.ack `"PBS Sans", "Hanken Grotesk", Arial` — so dropping the real PBS Sans `.woff2` files into `tokens/` and uncommenting the `@font-face` blocks upgrades everything automatically. **Please send PBS Sans font files if you have licensed access.**
3. **UI-kit imagery** uses generic placeholder photos (picsum.photos) to stand in for program artwork. Swap for real show images in production.

---

## CONTENT FUNDAMENTALS — how Nashville PBS writes

- **Voice:** warm, welcoming, trustworthy, plainspoken. Public-service, not sales. PBS describes its tone as "warm and engaging."
- **Point of view:** speaks as **"we"/"our"** about the organization ("our nonprofit," "we provide") and **"you"/"your"** to the viewer/donor ("your membership," "your favorite shows"). Community-first — "our community," "Middle Tennessee," "those we serve."
- **Casing:** sentence case for almost everything — headlines, buttons, nav. UPPERCASE is reserved for small overline/eyebrow labels ("NOW STREAMING", "SUPPORT PUBLIC MEDIA") and badges ("LIVE", "NEW EPISODE").
- **Mission language:** leans on concrete public-service value — "free access," "educational," "trusted," "for all of Middle Tennessee," "reflects the diversity of our region."
- **CTAs** are short, active verbs: *Start Watching · My List · Donate · Become a Member · Learn more.*
- **Emoji:** not used. **Exclamation points:** rare. Numbers are used sparingly and factually ("nearly 2.4 million viewers," "four channels").
- **Vibe:** civic, inclusive, curious, calm. Never hype-y or urgent except genuine live/premiere moments.

Example copy: *"Bring the world a little closer."* · *"Free, trusted programming across the PBS app, PBS KIDS, and four broadcast channels."*

---

## VISUAL FOUNDATIONS

- **Color:** overwhelmingly **blue**. PBS Blue `#2638C4` is the signature and the default for primary elements, CTAs and links. Navy `#0A145A`, Medium Blue `#0F1E8C` and Light Blue `#486CD8` add depth and are used for dark surfaces and serious tones. **Accents — Teal `#48D3CD`, Yellow `#FFCF00`, Coral `#FE704E` — are used minimally, generally one at a time**, to flag important content (live, premieres, progress). White is a primary color. A cool, navy-tinted neutral ramp (added here) handles UI surfaces and text.
- **Type:** a **single family** (PBS Sans, self-hosted) across the whole system. Display and headings run **bold to black (700–800) with tight, slightly negative tracking**; body is regular weight with airy 1.55 line-height. Big, confident display type on covers and heroes.
- **Backgrounds:** three registers — (1) clean **white** content pages; (2) **navy** surfaces for headers/footers/dark UI; (3) **full-bleed imagery** with a blue gradient/scrim overlay for legibility. The **geometric brand patterns** (Community, Insight) appear on section headers, membership bands and cover cards, usually under a blue overlay.
- **Imagery:** natural, luminous, warm — "beauty in the details" and wide establishing context. Real photography, never heavily filtered or duotoned (the blue lives in overlays, not the photo itself).
- **Gradients:** blue-on-blue only (PBS Blue → Medium/Navy). Used for depth and as overlays on darker imagery (set ~80% opacity per PBS guidance). No rainbow or purple gradients.
- **Corner radii:** buttons are **fully pill-shaped**; cards and media use a **quiet 8–12px** radius. Nothing is sharp-cornered except full-bleed bands.
- **Cards:** white surface, 1px cool border, **restrained** cool-tinted shadow (flat by default). Interactive cards lift 2px and deepen the shadow on hover.
- **Elevation:** minimal, navy-tinted shadow scale (`xs`→`xl`). The brand reads mostly flat.
- **Borders:** 1px `--border` on surfaces; 1.5px on interactive controls (inputs, tags, secondary buttons).
- **Motion:** quick and subtle — 0.15–0.18s ease transitions on hover/focus (background, shadow, 2px lift, image scale 1.04 on media hover). No bounces or long animations.
- **Hover states:** primary button → Medium Blue; secondary/ghost → faint blue tint; media → play overlay + slight zoom. **Press:** deepens to Navy Blue.
- **Focus:** 3px light-blue (`#486CD8`) ring for accessibility.
- **Transparency & blur:** white/blue translucent chips on imagery (search field, back button, "on dark" controls). No heavy glassmorphism.
- **Layout:** 1240px max content width, 24px gutters, sticky navy header. 4px-based spacing scale.

---

## ICONOGRAPHY

- PBS/Nashville PBS use **simple, single-weight line icons** (~2px stroke, rounded joins) plus a few solid glyphs (play triangle). There is **no bespoke icon font** in the provided assets.
- **Substitution:** this system uses **inline line SVGs in the Lucide style** (search, play, plus, chevrons, user, arrows) inside the UI kit and component cards — a clean CDN-available match for the brand's stroke weight and rounded style. If Nashville PBS has a defined icon set, drop the SVGs into `assets/icons/` and reference them.
- The **P-head "everyman" mark** is the one true brand icon — it lives only inside the official logo lockups and must **never** be redrawn, recolored, rotated, or separated from the wordmark.
- **Emoji / unicode** are **not** used as UI icons.

---

## Index / manifest

**Root**
- `styles.css` — the single entry point consumers link (import list only).
- `tokens/` — `fonts.css`, `colors.css`, `typography.css`, `spacing.css`, `radius.css`, `shadows.css`.
- `assets/logos/` — four repaired Nashville PBS SVG lockups.
- `assets/patterns/` — Community + Insight brand patterns.
- `guidelines/` — foundation specimen cards (Colors, Type, Spacing, Brand).
- `thumbnail.html` — homepage tile. `SKILL.md` — Agent-Skills entry point.

**Components** (`window.NashvillePBSDesignSystem_8fe663`)
- `components/core/` — **Button**, **IconButton**, **Badge**, **Tag**, **Card**
- `components/forms/` — **Input**, **Select**, **Checkbox**, **Radio**, **Switch**
- `components/brand/` — **Logo**, **PatternPanel**
- `components/media/` — **ShowCard**

**UI kits**
- `ui_kits/website/` — interactive Nashville PBS streaming site: home (hero, content rows, membership band), browse + search with category filters, and show-detail with episodes. Composed entirely from the components above.

### Intentional additions (not in the PBS brand book)
- A cool **neutral ramp** (`--neutral-*`) for UI surfaces, borders and body text — the brand book defines only blues/accents.
- Standard **form controls** (Input, Select, Checkbox, Radio, Switch) and **Card / Badge / Tag** primitives — needed for real interfaces; styled strictly from brand tokens.
- **ShowCard** and the **Logo/PatternPanel** wrappers — brand-specific conveniences for building media UIs.
