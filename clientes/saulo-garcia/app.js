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

  const carousel = document.querySelector('[data-review-carousel]');
  if (carousel) {
    const slides = carousel.querySelectorAll('.review-carousel-item');
    const dots = carousel.querySelectorAll('.review-carousel-dots button');
    let index = 0;
    let timer = null;

    const show = (i) => {
      index = i;
      slides.forEach((slide, n) => slide.classList.toggle('is-active', n === i));
      dots.forEach((dot, n) => {
        dot.classList.toggle('is-active', n === i);
        dot.setAttribute('aria-selected', String(n === i));
      });
    };

    const next = () => show((index + 1) % slides.length);
    const stop = () => { if (timer) { window.clearInterval(timer); timer = null; } };
    const start = () => {
      stop();
      if (reducedMotion || slides.length < 2) return;
      timer = window.setInterval(next, 6000);
    };

    dots.forEach((dot, n) => dot.addEventListener('click', () => { show(n); start(); }));
    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    carousel.addEventListener('focusin', stop);
    carousel.addEventListener('focusout', start);

    start();
  }
})();
