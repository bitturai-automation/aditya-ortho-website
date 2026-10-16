/* Aditya Ortho — motion helpers: scroll progress, count-up numbers, card tilt.
   Everything here is skipped for visitors who prefer reduced motion
   (except the scroll-progress bar, which is a non-moving progress indicator). */
(() => {
  'use strict';
  const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reduce = () => mqReduce.matches;
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* Scroll progress bar */
  function progressBar() {
    const bar = document.createElement('div');
    bar.className = 'scroll-progress'; bar.setAttribute('aria-hidden', 'true');
    bar.innerHTML = '<i></i>';
    document.body.prepend(bar);
    const fill = bar.firstElementChild;
    let ticking = false;
    const update = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      fill.style.transform = `scaleX(${h > 0 ? Math.min(1, window.scrollY / h) : 0})`;
      ticking = false;
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
  }

  /* Count-up for stat numbers such as "418+", "20+", "4" — keeps any suffix text */
  function countUp() {
    const els = $$('.hero-single-proof strong, .why-v2-stats strong').filter((el) => /^\d+/.test(el.textContent.trim()));
    if (!els.length) return;
    const run = (el) => {
      const m = el.textContent.trim().match(/^(\d+)(.*)$/);
      if (!m) return;
      const target = +m[1], suffix = m[2], start = performance.now(), dur = 1400 + Math.min(target, 500);
      el.setAttribute('aria-label', el.textContent.trim());
      const tick = (now) => {
        const t = Math.min(1, (now - start) / dur), eased = 1 - Math.pow(1 - t, 4);
        el.textContent = Math.round(target * eased) + suffix;
        if (t < 1) requestAnimationFrame(tick); else { el.textContent = target + suffix; el.classList.add('count-done'); }
      };
      el.textContent = '0' + suffix;
      requestAnimationFrame(tick);
    };
    if (!('IntersectionObserver' in window)) return; // numbers simply stay as written
    const io = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { io.unobserve(en.target); run(en.target); } }), { threshold: 0.6 });
    els.forEach((el) => io.observe(el));
  }

  /* 3-D tilt + moving highlight on brand cards (mouse only) */
  function tilt() {
    if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    $$('.brand-showcase-card').forEach((card) => {
      let raf = 0;
      card.addEventListener('pointermove', (e) => {
        if (reduce()) return;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
          card.classList.add('is-tilting');
          card.style.setProperty('--ry', `${(x - 0.5) * 9}deg`);
          card.style.setProperty('--rx', `${(0.5 - y) * 7}deg`);
          card.style.setProperty('--ty', '-6px');
          card.style.setProperty('--mx', `${x * 100}%`);
          card.style.setProperty('--my', `${y * 100}%`);
        });
      });
      card.addEventListener('pointerleave', () => {
        cancelAnimationFrame(raf);
        card.classList.remove('is-tilting');
        ['--rx', '--ry', '--ty'].forEach((p) => card.style.removeProperty(p));
      });
    });
  }

  function init() {
    progressBar();
    if (!reduce()) { countUp(); tilt(); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
