/* Aditya Ortho — shared catalogue helpers (used by main.js and products.js).
   One source of truth for categories, activities and WhatsApp links so the
   homepage and the catalogue page can never disagree again. */
(() => {
  'use strict';
  const WA_NUMBER = '918651128309';

  // Order matters: first match wins.
  const CATEGORY_RULES = [
    ['Bandages & Care', /bandage|tape|crepe|cast pad|cast padding|stockinette|cool pack|heating pad|heating gel|hot & cold|hot\/cold|ice bag|gym ball|exercising|gel exercise|cast cover|cool eyes|eye mask/],
    ['Knee', /knee/],
    ['Ankle & Foot', /ankle|foot|insole|arch|bunion|toe|cast shoe|walker boot|heel|metatarsal|hallux|silicone socks/],
    ['Neck', /cervical|neck|traction|head halter|collar|pillow/],
    ['Back', /back|lumbo|lumbar|sacro|tailbone|posture|taylor|hyper extension|ash.brace|\bl\.?s\.?\b|coccyx|spinal|trunk/],
    ['Wrist & Hand', /wrist|hand|finger|thumb|glove|splint|carpal|restrainer|mallet|frog/],
    ['Elbow', /elbow/],
    ['Shoulder', /shoulder|clavicle|humeral/],
    ['Arm', /arm|sling/],
    ['Abdominal & Chest', /abdominal|abs |abs$|corset|pregnancy|rib-belt|rib belt|\brib\b|binder|hernia|maternity|chest|tummy|scrotal/],
    ['Leg', /thigh|calf|leg/],
    ['Compression', /compression stocking|stocking|lymphedema|lymphoedema|flight socks|stump|sleeve/],
    ['Mobility', /crutch|walker|walking frame|walking stick|mobility|cane|wheelchair|wheel chair|commode/],
    ['Kids', /junior|kids|pediatric|paediatric/]
  ];

  const category = (title) => {
    const t = String(title || '').toLowerCase();
    for (const [name, re] of CATEGORY_RULES) if (re.test(t)) return name;
    return 'Other';
  };

  const activity = (title, cat) => {
    const t = `${title} ${cat}`.toLowerCase();
    if (/crutch|walker|cane|wheelchair|wheel chair|mobility|walking stick|walking frame|commode/.test(t)) return 'mobility';
    if (/athletic|sport|gym|fitness|resistance|sam band|hand gripper|weight cuff/.test(t)) return 'sports';
    if (/physio|exercis|therapy|nebulizer|spirometer|spriometer|traction/.test(t)) return 'physio';
    return 'daily';
  };

  const normalize = (p) => {
    const title = p.name || p.title || '';
    const cat = category(title);
    return {
      brand: p.brand || 'Other',
      title,
      category: cat,
      activity: activity(title, cat),
      sizes: Array.isArray(p.sizes) ? p.sizes : [],
      image: p.image || ''
    };
  };

  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const waLink = (p) =>
    `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hello Aditya Ortho, I want to enquire about: ${p.title} (${p.brand})`)}`;

  // Remote brand images are hot-linked: send no referrer (avoids hot-link blocking) and fall back to the logo.
  const imageTag = (p, { eager = false } = {}) => {
    if (!p.image) return '<div class="placeholder" aria-hidden="true">AO</div>';
    const remote = /^https?:/i.test(p.image);
    return `<img src="${esc(p.image)}" alt="${esc(p.title)} – ${esc(p.brand)}" width="300" height="300" ${eager ? '' : 'loading="lazy" '}decoding="async"${remote ? ' referrerpolicy="no-referrer"' : ''} onerror="this.onerror=null;this.removeAttribute('referrerpolicy');this.src='assets/images/aditya-ortho-logo-green.png';this.classList.add('img-fallback')">`;
  };

  const loadCatalogue = async () => {
    let raw = Array.isArray(window.CATALOGUE) ? window.CATALOGUE : null;
    if (!raw || !raw.length) {
      try {
        const r = await fetch('data/products.json');
        if (r.ok) raw = await r.json();
      } catch (_) { /* offline / file:// — handled below */ }
    }
    // De-duplicate on brand + name + image so genuine variants (same name, different photo) are kept.
    const seen = new Set();
    return (raw || []).map(normalize).filter((p) => {
      if (!p.title) return false;
      const k = `${p.brand}|${p.title}|${p.image}`.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  };

  window.AO = { WA_NUMBER, category, activity, normalize, esc, waLink, imageTag, loadCatalogue };
})();
