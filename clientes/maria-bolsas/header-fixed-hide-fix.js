(function () {
  if (window.__MB_HEADER_FIXED_HIDE_FIX__) return;
  window.__MB_HEADER_FIXED_HIDE_FIX__ = true;

  let header = null;
  let observer = null;

  function findHeader() {
    return document.querySelector(".mb-smart-header");
  }

  function sync() {
    header = header || findHeader();

    if (!header) return;

    const hidden = header.classList.contains("mb-header-hidden");

    document.body.classList.toggle("mb-header-fixed-hide-active", hidden);
  }

  function watch() {
    header = findHeader();

    if (!header) {
      window.setTimeout(watch, 200);
      return;
    }

    sync();

    if (observer) {
      observer.disconnect();
    }

    observer = new MutationObserver(sync);

    observer.observe(header, {
      attributes: true,
      attributeFilter: ["class"]
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", watch);
  } else {
    watch();
  }

  window.addEventListener("load", function () {
    setTimeout(sync, 100);
    setTimeout(sync, 400);
  });

  window.addEventListener("scroll", sync, { passive: true });
})();
