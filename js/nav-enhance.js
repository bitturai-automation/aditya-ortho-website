/* Aditya Ortho — navigation enhancements shared by index.html and products.html.
   Adds to (does not replace) the drawer / dropdown code in main.js and products.js:
   · Escape closes the mobile drawer and any open mega menu
   · focus moves into the drawer when it opens and returns to the menu button on close
   · the drawer closes automatically if the window grows to desktop width (rotate / resize)
   · only one drawer accordion section is open at a time (keeps long lists on-screen)
   · keeps the "Filters" button label in sync with the active category (catalogue page) */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const drawer = $('#mobileDrawer'), toggle = $('#menuToggle');
  const isOpen = () => !!drawer && drawer.classList.contains('is-open');
  const closeDrawer = () => { if (isOpen()) { $('.drawer-backdrop', drawer)?.click(); toggle?.focus({ preventScroll: true }); } };

  if (drawer && toggle) {
    toggle.addEventListener('click', () => setTimeout(() => { if (isOpen()) $('.drawer-close', drawer)?.focus({ preventScroll: true }); }, 60));
    $$('.mobile-nav details', drawer).forEach(d => d.addEventListener('toggle', () => {
      if (d.open) $$('.mobile-nav details', drawer).forEach(o => { if (o !== d) o.open = false; });
    }));
    const mq = window.matchMedia('(min-width: 981px)');
    const onChange = e => { if (e.matches && isOpen()) { $('.drawer-backdrop', drawer)?.click(); } };
    mq.addEventListener ? mq.addEventListener('change', onChange) : mq.addListener(onChange);
  }

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    closeDrawer();
    $$('.desktop-nav .nav-dropdown.is-open').forEach(n => { n.classList.remove('is-open'); $('.dropdown-trigger', n)?.setAttribute('aria-expanded', 'false'); });
  });

  // keep aria-expanded honest when menus close by outside click on the catalogue page
  document.addEventListener('click', e => {
    if (e.target.closest('.nav-dropdown')) return;
    $$('.desktop-nav .dropdown-trigger[aria-expanded="true"]').forEach(b => { if (!b.closest('.nav-dropdown')?.classList.contains('is-open')) b.setAttribute('aria-expanded', 'false'); });
  });

  // catalogue: reflect the active category on the collapsed "Filters" button
  const ft = $('#filterToggle'), fr = $('#filterRow');
  if (ft && fr) {
    const sync = () => {
      const a = $('button.active', fr), name = a ? a.textContent.trim() : '';
      ft.textContent = name && name !== 'All' ? `Filters · ${name}` : 'Filters';
    };
    new MutationObserver(sync).observe(fr, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    sync();
  }
})();
