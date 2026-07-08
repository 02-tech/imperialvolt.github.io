(function () {
  if (window.__MB_REVEAL_SCROLL_SAFE__) return;
  window.__MB_REVEAL_SCROLL_SAFE__ = true;

  const path = window.location.pathname.toLowerCase();

  const CRITICAL_PAGE =
    path.includes("checkout") ||
    path.includes("carrinho") ||
    path.includes("cart");

  const TARGET_SELECTORS = [
    ".product-card",
    ".category-card",
    ".benefit",
    ".benefit-card",
    ".trust-card",
    ".trust-item",
    ".feature",
    ".feature-card",
    ".institutional",
    ".section-title",
    ".hero-content",
    ".juliana-highlight",
    ".product-gallery"
  ];

  const BLOCKED_SELECTORS = [
    "header",
    ".site-header",
    ".header",
    ".main-header",
    ".store-header",
    ".topbar",
    ".nav-wrapper",

    "button",
    ".btn",
    ".button",
    "a[class*='btn']",
    "a[class*='button']",

    "form",
    "input",
    "select",
    "textarea",
    "label",

    ".price",
    ".product-price",
    ".old-price",
    ".installments",
    ".total",
    ".subtotal",
    ".shipping",
    ".frete",
    ".cart",
    ".cart-drawer",
    ".cart-item",
    ".checkout",
    ".checkout-card",
    ".checkout-step",
    ".summary",
    ".summary-card",
    ".order-summary",
    ".payment",
    ".payment-method",
    ".product-actions",
    ".buy-actions",
    ".quantity"
  ];

  function isBlocked(el) {
    return BLOCKED_SELECTORS.some((selector) => {
      try {
        return el.matches(selector) || Boolean(el.closest(selector));
      } catch {
        return false;
      }
    });
  }

  function collectTargets() {
    if (CRITICAL_PAGE) return [];

    const found = new Set();

    for (const selector of TARGET_SELECTORS) {
      document.querySelectorAll(selector).forEach((el) => {
        if (!el || found.has(el)) return;
        if (isBlocked(el)) return;
        if (el.closest(".mb-no-reveal")) return;

        const rect = el.getBoundingClientRect();

        if (rect.width < 80 || rect.height < 30) return;

        found.add(el);
      });
    }

    return Array.from(found);
  }

  function tuneImages() {
    const images = Array.from(document.images);

    images.forEach((img, index) => {
      img.setAttribute("decoding", "async");

      const rect = img.getBoundingClientRect();
      const isTopImage = rect.top < window.innerHeight * 0.85 || index < 2;

      if (!isTopImage && !img.hasAttribute("loading")) {
        img.setAttribute("loading", "lazy");
      }

      if (isTopImage && !img.hasAttribute("fetchpriority")) {
        img.setAttribute("fetchpriority", "high");
      }
    });
  }

  function animateOnce(el, delay = 0) {
    if (el.dataset.mbRevealDone === "1") return;

    el.dataset.mbRevealDone = "1";

    window.setTimeout(() => {
      el.classList.add("mb-quiet-reveal-run");
    }, delay);
  }

  function initReveal() {
    tuneImages();

    const targets = collectTargets();

    if (!("IntersectionObserver" in window)) {
      targets.forEach((el, index) => animateOnce(el, Math.min(index * 25, 120)));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const el = entry.target;
          const index = Number(el.dataset.mbRevealIndex || 0);
          const delay = Math.min((index % 4) * 35, 105);

          animateOnce(el, delay);
          observer.unobserve(el);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -6% 0px"
      }
    );

    targets.forEach((el, index) => {
      el.dataset.mbRevealIndex = String(index);
      observer.observe(el);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initReveal);
  } else {
    initReveal();
  }

  window.addEventListener("load", function () {
    setTimeout(tuneImages, 250);
  });
})();
