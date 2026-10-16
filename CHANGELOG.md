# Changelog & Developer Notes – Aditya Ortho

Open `run_website.bat` to preview (needs Python), or upload the whole folder to any static hosting.

Products live in `data/products.json` and `data/products.js` (same data - edit both).
Each product: brand, name, image. Images are in `assets/products/`.
Every product has an "Enquire on WhatsApp" button (number set in `js/main.js` and `js/products.js`).


Homepage update: added two responsive side-by-side promotional banners below the hero using the supplied images. On mobile they stack vertically. Both banners link to the product catalogue.

UI redesign: a unified green-and-white design system now lives in `css/redesign.css` (loaded last on both pages), with product cards in `css/product-card-theme.css` + `css/product-card-reference.css` and the brand section in `css/brand-showcase-concept.css`. Header, mega menus and footer markup are identical on `index.html` and `products.html`. Animations (`animations.css`) were left untouched.


## Responsive pass (mobile / tablet / laptop / desktop)

All responsive behaviour now lives in **`css/responsive-final.css`**, loaded last on both pages.
`redesign.css` and the product-card / brand-showcase files define desktop layouts with almost no media
queries and load after `responsive.css`, so they overrode the older mobile rules - the new file re-states
every layout per breakpoint (>1100 desktop, 981-1100 small laptop, 701-980 tablet, <=700 phone, <=480, <=330).
Edit this file for any future layout tweaks; `responsive.css` is now mostly superseded.

- `js/nav-enhance.js` (new): Escape closes drawer/menus, focus handling, single-open drawer accordion,
  auto-close on resize, and the catalogue "Filters" button label shows the active category.
- `js/main.js`: mega menus only hover-open on real hover devices (fixes tap-open-then-instantly-close on
  iPad/touch); scroll-reveal observer no longer stalls on very tall sections.
- HTML: `viewport-fit=cover`, footer "Shop by body part" link now points at `#shop-categories`
  (the old `#categories` anchor did not exist), header search icon jumps to the catalogue search box,
  width/height on logos and promo banners (no layout shift).

Note: 150 catalogue products (50 Samson, 100 Tynor) hotlink images from samsonorthotics.com / tynorstore.com.
If those sites change or block hotlinking, those cards fall back to the Aditya Ortho logo. Downloading the
images into `assets/products/` and updating `data/products.json` + `data/products.js` would remove that dependency.


---
## Audit & upgrade pass (16 Oct 2026)

**Before you publish:** run `python set_domain.py https://your-real-domain.com` — canonical, Open Graph, JSON-LD,
`sitemap.xml` and `robots.txt` currently contain the placeholder `https://YOUR-DOMAIN.com`.

### Bugs fixed
- Hallux-valgus (bunion) splints were categorised under *Wrist & Hand*; commode chairs, walking stick, metatarsal pads, ice/heat bags etc. fell into "Other". Rules rewritten.
- Category rules were copy-pasted differently in `main.js` and `products.js` (8 products disagreed between pages). Now one source: `js/shared.js`.
- The catalogue dropped a real Tynor variant ("Ankle Support (Neo)", two different photos) as a "duplicate" → showed 417 instead of 418.
- `products.html` had its own cut-down menu/drawer code; it now uses the same `main.js` as the homepage (hover menus, backdrop, etc.).
- Header search icon now actually focuses the search box; `?q=` search links work.
- Filters/search now update the URL and page title (shareable links, better browser history).
- Reveal-on-scroll could leave sections invisible after a fast scroll/anchor jump → safety sweep added; no-JS visitors now see everything.
- Offer banner remembers dismissal for the session.

### SEO
Unique titles/descriptions, canonical, Open Graph + Twitter cards (`assets/images/og-image.jpg`), favicon set + web manifest,
JSON-LD (Store/LocalBusiness, WebSite, FAQPage, BreadcrumbList, dynamic ItemList on the catalogue), `robots.txt`, `sitemap.xml`,
hero image preload, outdated "Samson only" copy corrected, nav headings no longer pollute the heading outline,
`<noscript>` fallback on the catalogue.

### Accessibility
Removed incorrect `role="menu"`/`role="tablist"`, added `aria-pressed` to filter buttons, skip-link + `#main` on the catalogue page,
live region for results, descriptive WhatsApp button labels, visible focus ring, drawer label updates.

### Performance
Catalogue renders 48 products at a time ("Show more"), search is debounced, remote images send no referrer and fall back to the logo,
scripts are deferred, images have intrinsic sizes.

### Animation (`css/motion.css`, `js/motion.js`)
Hero entrance sequence, count-up stats, scroll-progress bar, button shine + arrow nudge, image zoom on card hover, 3-D tilt on brand cards,
WhatsApp attention ring, mega-menu/drawer cascades, smooth FAQ open/close, floating orbs, skeleton shimmer, cross-page fade (View Transitions).
All movement is opt-in via `prefers-reduced-motion: no-preference`; reduced-motion visitors get short fades only.
