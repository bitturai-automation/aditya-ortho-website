/* Aditya Ortho — site-wide behaviour (loaded on every page).
   Header / mega menus / mobile drawer / reveal-on-scroll / homepage featured products. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- Featured products (homepage only) ---------- */
  let homeProducts = [], activeFeatured = 'All';

  function productCard(p) {
    const { esc, imageTag, waLink } = window.AO;
    return `<article class="home-product-card"><span class="product-brand-badge">${esc(p.brand)}</span><div class="product-image">${imageTag(p)}</div><div class="product-body"><h3 class="product-title">${esc(p.title)}</h3><a class="btn btn-primary product-cta" href="${waLink(p)}" target="_blank" rel="noopener" aria-label="Enquire on WhatsApp about ${esc(p.title)}">Enquire on WhatsApp</a></div></article>`;
  }

  function renderFeatured() {
    const grid = $('#bestProducts');
    if (!grid) return;
    const withImg = homeProducts.filter((p) => p.image);
    let list;
    if (activeFeatured === 'All') {
      // round-robin across brands so every brand is represented
      const by = {};
      withImg.forEach((p) => (by[p.brand] = by[p.brand] || []).push(p));
      const brands = Object.keys(by);
      list = [];
      for (let i = 0; list.length < 8 && i < 8; i++) brands.forEach((b) => { if (by[b][i] && list.length < 8) list.push(by[b][i]); });
    } else {
      list = withImg.filter((p) => p.brand === activeFeatured).slice(0, 8);
    }
    grid.innerHTML = list.length ? list.map(productCard).join('') : '<div class="empty">Products coming soon.</div>';
    grid.dispatchEvent(new CustomEvent('ao:rendered', { bubbles: true }));
  }

  function setupFeaturedTabs() {
    const row = $('#featuredTabs');
    if (!row) return;
    row.setAttribute('role', 'group');
    row.setAttribute('aria-label', 'Filter featured products by brand');
    $$('button', row).forEach((button) => {
      button.setAttribute('aria-pressed', button.classList.contains('active') ? 'true' : 'false');
      button.addEventListener('click', () => {
        activeFeatured = button.dataset.brand || 'All';
        $$('button', row).forEach((b) => { const on = b === button; b.classList.toggle('active', on); b.setAttribute('aria-pressed', String(on)); });
        renderFeatured();
      });
    });
  }

  async function initCataloguePreview() {
    if (!$('#bestProducts')) return;
    homeProducts = await window.AO.loadCatalogue();
    renderFeatured();
  }

  /* ---------- Header: mega menus ---------- */
  function setupDropdowns() {
    const items = $$('.desktop-nav .nav-dropdown');
    const backdrop = $('#megaBackdrop');
    let closeTimer = null;
    // Hover-open only on real hover devices; on touch, mouseenter fires just before click and used to open-then-close.
    const canHover = () => window.matchMedia('(hover:hover) and (pointer:fine)').matches;
    const setBackdrop = (v) => { if (backdrop) { backdrop.classList.toggle('is-visible', v); backdrop.setAttribute('aria-hidden', v ? 'false' : 'true'); } };
    const cancelClose = () => { if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; } };
    const setOpen = (item, open) => {
      item.classList.toggle('is-open', open);
      $('.dropdown-trigger', item)?.setAttribute('aria-expanded', String(open));
    };
    const closeAll = (except = null) => {
      cancelClose();
      items.forEach((item) => { if (item !== except) setOpen(item, false); });
      setBackdrop(items.some((i) => i.classList.contains('is-open')));
    };
    const scheduleClose = (item) => {
      cancelClose();
      closeTimer = setTimeout(() => { setOpen(item, false); setBackdrop(items.some((x) => x.classList.contains('is-open'))); closeTimer = null; }, 260);
    };
    items.forEach((item) => {
      const button = $('.dropdown-trigger', item);
      const menu = $('.mega-menu', item);
      if (!button) return;
      const openIt = () => { cancelClose(); closeAll(item); setOpen(item, true); setBackdrop(true); };
      item.addEventListener('mouseenter', () => { if (canHover()) openIt(); });
      item.addEventListener('mouseleave', () => { if (canHover()) scheduleClose(item); });
      menu?.addEventListener('mouseenter', cancelClose);
      menu?.addEventListener('mouseleave', () => { if (canHover()) scheduleClose(item); });
      button.addEventListener('focus', () => { if (canHover() && button.matches(':focus-visible')) openIt(); });
      button.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation(); cancelClose();
        const wasOpen = item.classList.contains('is-open');
        closeAll();
        if (!wasOpen) openIt();
      });
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAll(); });
    document.addEventListener('click', (e) => { if (!e.target.closest('.desktop-nav .nav-dropdown')) closeAll(); });
  }

  /* ---------- Mobile drawer ---------- */
  function setupDrawer() {
    const drawer = $('#mobileDrawer'), toggle = $('#menuToggle');
    if (!drawer || !toggle) return;
    const open = () => { drawer.classList.add('is-open'); drawer.setAttribute('aria-hidden', 'false'); toggle.setAttribute('aria-expanded', 'true'); toggle.setAttribute('aria-label', 'Close menu'); document.body.classList.add('no-scroll'); };
    const close = () => { drawer.classList.remove('is-open'); drawer.setAttribute('aria-hidden', 'true'); toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Open menu'); document.body.classList.remove('no-scroll'); };
    toggle.addEventListener('click', open);
    $$('[data-close-drawer]', drawer).forEach((el) => el.addEventListener('click', close));
    $$('.mobile-nav a', drawer).forEach((link) => link.addEventListener('click', close));
  }

  function setupScrollHeader() {
    const header = $('#siteHeader');
    if (!header) return;
    let ticking = false;
    const update = () => { header.classList.toggle('scrolled', window.scrollY > 12); ticking = false; };
    update();
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  }

  /* ---------- Reveal on scroll ---------- */
  function setupReveal() {
    const motionTargets = $$('.section,.final-cta,.brand-logo-card,.category-discovery-card,.discovery-v2-card,.support-v2-card,.catalogue-product-card,.home-product-card,.brand-card,.support-quick,.faq-item,.local-card');
    motionTargets.forEach((el) => {
      if (!el.classList.contains('reveal') && !el.classList.contains('hero')) el.classList.add('motion-ready');
      [...el.children].slice(0, 10).forEach((child, i) => {
        if (child.classList.contains('reveal') || child.classList.contains('motion-child')) return;
        if (['DIV', 'ARTICLE', 'LI', 'A'].includes(child.tagName)) { child.classList.add('motion-child'); child.style.setProperty('--motion-index', i); }
      });
    });
    const all = [...new Set([...$$('.reveal'), ...$$('.motion-ready')])];
    if (!('IntersectionObserver' in window)) { all.forEach((el) => el.classList.add('is-visible')); return; }
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
    }), { threshold: 0.01, rootMargin: '0px 0px -45px' });
    all.forEach((el) => io.observe(el));
    // Safety net: IntersectionObserver can miss elements on very fast flick-scrolls or anchor jumps.
    // Anything the visitor has already scrolled to (or past) must never stay invisible.
    let pending = false;
    const sweep = () => {
      pending = false;
      const limit = window.innerHeight;
      all.forEach((el) => { if (!el.classList.contains('is-visible') && el.getBoundingClientRect().top < limit) { el.classList.add('is-visible'); io.unobserve(el); } });
    };
    const queue = () => { if (!pending) { pending = true; requestAnimationFrame(sweep); } };
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('load', queue);
    window.addEventListener('hashchange', queue);
    // Newly rendered product cards (featured tabs) reveal themselves.
    document.addEventListener('ao:rendered', (e) => $$('.home-product-card', e.target).forEach((c) => { c.classList.add('motion-ready'); requestAnimationFrame(() => c.classList.add('is-visible')); }));
  }

  /* ---------- Offer banner (remember dismissal) ---------- */
  function setupOffer() {
    const b = $('#offerBanner'), x = $('#dismissOffer');
    if (!b || !x) return;
    try { if (sessionStorage.getItem('ao-offer-closed') === '1') b.classList.add('is-hidden'); } catch (_) { /* private mode */ }
    x.addEventListener('click', () => { b.classList.add('is-hidden'); try { sessionStorage.setItem('ao-offer-closed', '1'); } catch (_) { /* ignore */ } });
  }

  /* ---------- Homepage category carousel arrows ---------- */
  function setupCategoryCarousel() {
    const track = $('#categoryRoundTrack'), prev = $('#categoryRoundPrev'), next = $('#categoryRoundNext');
    if (!track || !prev || !next) return;
    const step = () => { const item = $('.category-round-item', track); return item ? item.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 20) : 240; };
    prev.addEventListener('click', () => track.scrollBy({ left: -step() * 2, behavior: 'smooth' }));
    next.addEventListener('click', () => track.scrollBy({ left: step() * 2, behavior: 'smooth' }));
  }

  function init() {
    setupOffer(); setupDropdowns(); setupDrawer(); setupScrollHeader(); setupReveal();
    setupFeaturedTabs(); setupCategoryCarousel(); initCataloguePreview();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
