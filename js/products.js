/* Aditya Ortho — catalogue page (products.html).
   Search, brand / category / activity filters, sort, shareable URLs, "load more" paging. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const { esc, imageTag, waLink } = window.AO;
  const PAGE = 48;
  const ACTIVITY_LABEL = { mobility: 'Walking & Mobility', sports: 'Sports & Athletics', physio: 'Physiotherapy', daily: 'Daily Comfort' };

  let products = [], activeCategory = 'All', activeActivity = 'All', activeBrand = 'All', shown = PAGE, current = [];

  function card(p, i) {
    return `<article class="product-card motion-child" style="--motion-index:${i % 8}"><span class="product-brand-badge">${esc(p.brand)}</span><div class="product-image">${imageTag(p)}</div><div class="product-body"><h2 class="product-title">${esc(p.title)}</h2><a class="btn btn-primary product-cta" href="${waLink(p)}" target="_blank" rel="noopener" aria-label="Enquire on WhatsApp about ${esc(p.title)}">Enquire on WhatsApp</a></div></article>`;
  }

  function renderFilters() {
    const box = $('#filterRow');
    if (!box) return;
    const cats = ['All', ...new Set(products.map((p) => p.category))].sort((a, b) => (a === 'All' ? -1 : b === 'All' ? 1 : a.localeCompare(b)));
    box.innerHTML = cats.map((c) => `<button type="button" class="${c === activeCategory ? 'active' : ''}" aria-pressed="${c === activeCategory}" data-category="${esc(c)}">${esc(c)}</button>`).join('');
    $$('button', box).forEach((btn) => btn.addEventListener('click', () => { activeCategory = btn.dataset.category || 'All'; renderFilters(); render(true); }));
  }

  function pageHeading() {
    const parts = [];
    if (activeBrand !== 'All') parts.push(activeBrand);
    if (activeCategory !== 'All') parts.push(activeCategory);
    if (activeActivity !== 'All') parts.push(ACTIVITY_LABEL[activeActivity] || activeActivity);
    return parts.join(' · ');
  }

  // Keep the URL shareable and the tab title meaningful as filters change.
  function syncUrlAndTitle() {
    const q = new URLSearchParams();
    if (activeBrand !== 'All') q.set('brand', activeBrand);
    if (activeCategory !== 'All') q.set('category', activeCategory);
    if (activeActivity !== 'All') q.set('activity', activeActivity);
    const term = ($('#searchField')?.value || '').trim();
    if (term) q.set('q', term);
    const url = location.pathname + (q.toString() ? '?' + q : '') + location.hash;
    try { history.replaceState(null, '', url); } catch (_) { /* file:// */ }
    const h = pageHeading();
    document.title = h ? `${h} Orthopedic Supports | Aditya Ortho, Bokaro` : 'Orthopedic Supports Catalogue – Knee, Back, Neck & More | Aditya Ortho';
  }

  function updateStructuredData(list) {
    let el = $('#ld-itemlist');
    if (!el) { el = document.createElement('script'); el.type = 'application/ld+json'; el.id = 'ld-itemlist'; document.head.appendChild(el); }
    const abs = (u) => { try { return new URL(u, location.href).href; } catch (_) { return u; } };
    el.textContent = JSON.stringify({
      '@context': 'https://schema.org', '@type': 'ItemList', name: pageHeading() || 'Aditya Ortho product catalogue',
      numberOfItems: list.length,
      itemListElement: list.slice(0, 30).map((p, i) => ({ '@type': 'ListItem', position: i + 1, item: { '@type': 'Product', name: p.title, brand: { '@type': 'Brand', name: p.brand }, category: p.category, image: abs(p.image) } }))
    });
  }

  function draw(append) {
    const grid = $('#productGrid'), more = $('#loadMore');
    const slice = current.slice(append ? grid.querySelectorAll('.product-card').length : 0, shown);
    const html = slice.map((p, i) => card(p, i)).join('');
    if (append) grid.insertAdjacentHTML('beforeend', html); else grid.innerHTML = html;
    const cards = $$('.product-card:not(.is-visible)', grid);
    requestAnimationFrame(() => cards.forEach((el) => { el.classList.add('product-card-ready'); requestAnimationFrame(() => el.classList.add('is-visible')); }));
    if (more) {
      const left = current.length - shown;
      more.hidden = left <= 0;
      more.textContent = `Show ${Math.min(PAGE, Math.max(left, 0))} more products`;
    }
  }

  function render(resetPage) {
    const grid = $('#productGrid'), count = $('#productCount');
    if (!grid) return;
    if (resetPage) shown = PAGE;
    const q = ($('#searchField')?.value || '').trim().toLowerCase();
    const sort = $('#sortField')?.value || 'featured';
    current = products.filter((p) =>
      (activeBrand === 'All' || p.brand === activeBrand) &&
      (activeCategory === 'All' || p.category === activeCategory) &&
      (activeActivity === 'All' || p.activity === activeActivity) &&
      (!q || `${p.title} ${p.brand} ${p.category} ${p.sizes.join(' ')}`.toLowerCase().includes(q)));
    if (sort === 'az') current.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === 'za') current.sort((a, b) => b.title.localeCompare(a.title));
    count.textContent = `${current.length} product${current.length === 1 ? '' : 's'}`;
    if (!current.length) {
      grid.innerHTML = '<div class="catalogue-empty"><strong>No matching products found.</strong><br>Try another brand, category or search term.</div>';
      const more = $('#loadMore'); if (more) more.hidden = true;
    } else draw(false);
    const h = $('#catalogueHeading'); if (h) h.textContent = pageHeading();
    syncUrlAndTitle();
    updateStructuredData(current);
  }

  async function init() {
    const search = $('#searchField'), sort = $('#sortField'), brand = $('#brandField'), ft = $('#filterToggle'), fr = $('#filterRow'), more = $('#loadMore');
    let t;
    search?.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => render(true), 120); });
    sort?.addEventListener('change', () => render(true));
    brand?.addEventListener('change', () => { activeBrand = brand.value || 'All'; render(true); });
    ft?.addEventListener('click', () => { fr?.classList.toggle('is-open'); ft.setAttribute('aria-expanded', fr?.classList.contains('is-open') ? 'true' : 'false'); });
    more?.addEventListener('click', () => { shown += PAGE; draw(true); });

    const params = new URLSearchParams(location.search);
    if (params.get('q') && search) search.value = params.get('q');
    if (params.get('category')) activeCategory = params.get('category');
    if (params.get('activity')) activeActivity = params.get('activity');
    if (params.get('brand')) { activeBrand = params.get('brand'); if (brand) brand.value = activeBrand; }

    products = await window.AO.loadCatalogue();
    const status = $('#catalogueStatus');
    if (status) status.innerHTML = products.length ? '<strong>Catalogue ready.</strong> Samson, Tynor, Dynamic Techno Medicals and UM Orthotics.' : '<strong>Catalogue could not be loaded.</strong> Please refresh, or chat with us on WhatsApp.';
    renderFilters();
    render(true);
    // header search icon links to products.html#searchField — actually focus it
    if (location.hash === '#searchField') search?.focus({ preventScroll: false });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
