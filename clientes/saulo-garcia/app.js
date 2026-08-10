(() => {
  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const setHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 24);
  const closeMenu = () => {
    toggle?.setAttribute('aria-expanded', 'false');
    toggle?.querySelector('.sr-only')?.replaceChildren('Abrir menu');
    menu?.classList.remove('is-open');
    header?.classList.remove('menu-active');
    document.body.classList.remove('menu-open');
  };

  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.sr-only')?.replaceChildren(open ? 'Fechar menu' : 'Abrir menu');
    menu?.classList.toggle('is-open', open);
    header?.classList.toggle('menu-active', open);
    document.body.classList.toggle('menu-open', open);
  });

  menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  window.addEventListener('scroll', setHeader, { passive: true });
  window.addEventListener('resize', () => { if (window.innerWidth > 980) closeMenu(); });
  setHeader();

  const items = document.querySelectorAll('[data-reveal]');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -45px' });
    items.forEach((item) => observer.observe(item));
  }

  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
})();
