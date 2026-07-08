(function () {
  const CLOSED_KEY = "maria_bolsas_cadastro_notice_closed_until";
  const LAST_SHOWN_KEY = "maria_bolsas_cadastro_notice_last_shown";
  const SHOWN_COUNT_KEY = "maria_bolsas_cadastro_notice_shown_count";
  const REGISTERED_KEY = "maria_bolsas_cliente_cadastro";
  const EXIT_KEY = "maria_bolsas_exit_notice_seen";

  const MAX_SHOWN_TOTAL = 2;
  const TIME_TRIGGER_MS = 5200;
  const MIN_SCROLL_TIME_MS = 2600;
  const SCROLL_TRIGGER_RATIO = 0.16;
  const AUTO_HIDE_MS = 3000;
  const RETURN_ANIMATION_MS = 420;
  const CLOSED_COOLDOWN_MS = 45000;
  const SHOWN_COOLDOWN_MS = 14000;

  let pageStartedAt = Date.now();
  let shownThisPage = false;
  let scrollTriggered = false;

  function pageName() {
    const path = String(window.location.pathname || "").toLowerCase();

    if (path.includes("cadastro")) return "cadastro";
    if (path.includes("checkout")) return "checkout";
    if (path.includes("carrinho")) return "cart";
    if (path.includes("produto")) return "product";
    if (path.includes("produtos")) return "products";
    return "home";
  }

  function allowNoticeOnThisPage() {
    const page = pageName();

    return page === "home" || page === "products" || page === "product";
  }

  function currentReturnUrl() {
    const page = pageName();
    const file = String(window.location.pathname || "").split("/").pop() || "index.html";
    const query = String(window.location.search || "");

    if (page === "home" || page === "products") return "produto.html?p=bolsa-juliana";
    return file + query;
  }

  function cadastroHref() {
    const url = new URL("cadastro.html", window.location.href);
    url.searchParams.set("origem", pageName());
    url.searchParams.set("retorno", currentReturnUrl());

    return url.pathname.split("/").pop() + url.search;
  }

  function getStoredNumber(key) {
    try {
      return Number(window.localStorage.getItem(key) || window.sessionStorage.getItem(key) || 0);
    } catch (error) {
      return 0;
    }
  }

  function setStoredNumber(key, value, storage) {
    try {
      storage.setItem(key, String(value));
    } catch (error) {}
  }

  function clearNoticeMemory() {
    try {
      window.localStorage.removeItem(CLOSED_KEY);
      window.localStorage.removeItem(LAST_SHOWN_KEY);
      window.localStorage.removeItem(SHOWN_COUNT_KEY);
      window.sessionStorage.removeItem(EXIT_KEY);
    } catch (error) {}
  }

  function recentlyClosed() {
    const until = getStoredNumber(CLOSED_KEY);
    return until && Date.now() < until;
  }

  function recentlyShown() {
    const last = getStoredNumber(LAST_SHOWN_KEY);
    return last && Date.now() - last < SHOWN_COOLDOWN_MS;
  }

  function hasCompletedQuickRegistration() {
    try {
      return Boolean(window.localStorage.getItem(REGISTERED_KEY));
    } catch (error) {
      return false;
    }
  }

  function reachedShownLimit() {
    return getStoredNumber(SHOWN_COUNT_KEY) >= MAX_SHOWN_TOTAL;
  }

  function canShow(reason) {
    if (!allowNoticeOnThisPage()) return false;
    if (hasCompletedQuickRegistration()) return false;
    if (reachedShownLimit()) return false;

    if (reason === "exit") return true;
    if (shownThisPage) return false;
    if (recentlyClosed()) return false;
    if (recentlyShown()) return false;

    return true;
  }

  function isVisibleElement(element) {
    if (!element || !element.getBoundingClientRect) return false;

    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);

    return (
      rect.width >= 10 &&
      rect.height >= 10 &&
      rect.bottom > 0 &&
      rect.right > 0 &&
      rect.top < window.innerHeight &&
      rect.left < window.innerWidth &&
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      Number(style.opacity || 1) > 0.05
    );
  }

  function descriptor(element) {
    return [
      element.className || "",
      element.id || "",
      element.getAttribute("aria-label") || "",
      element.getAttribute("title") || "",
      element.getAttribute("href") || "",
      element.textContent || ""
    ].join(" ").toLowerCase();
  }

  function scoreAccountCandidate(element) {
    const text = descriptor(element);
    const rect = element.getBoundingClientRect();

    if (/cart|carrinho|sacola|bag|checkout|search|busca|lupa|logo|menu|whatsapp|zap|contato/i.test(text)) {
      return -1000;
    }

    let score = 0;

    if (/account|cliente|user|usuario|usuário|perfil|profile|login|entrar|conta|cadastro|person/i.test(text)) {
      score += 80;
    }

    if (element.matches("a, button, [role='button']")) score += 20;
    if (element.querySelector("svg, img") || element.matches("svg, img")) score += 18;
    if (rect.width <= 72 && rect.height <= 72) score += 16;
    if (rect.top <= 160) score += 12;

    return score;
  }

  function findAccountTarget() {
    const explicitSelectors = [
      "[data-account]",
      "[data-user]",
      "[data-customer]",
      ".account",
      ".account-icon",
      ".user",
      ".user-icon",
      ".customer",
      ".customer-icon",
      ".header-account",
      ".header-user",
      "a[href*='login']",
      "a[href*='cliente']",
      "a[href*='conta']",
      "a[href*='cadastro']"
    ];

    for (const selector of explicitSelectors) {
      const found = Array.from(document.querySelectorAll(selector)).find(isVisibleElement);
      if (found) return found.closest("a, button, [role='button']") || found;
    }

    const containers = Array.from(
      document.querySelectorAll("header, .site-header, .main-header, .header, .topbar, .nav, .navbar")
    ).filter(isVisibleElement);

    const candidates = [];

    containers.forEach(function (container) {
      Array.from(container.querySelectorAll("a, button, [role='button'], div, span, svg, img")).forEach(function (node) {
        if (!isVisibleElement(node)) return;

        const rect = node.getBoundingClientRect();

        if (rect.width > 100 || rect.height > 100) return;
        if (rect.top > 190) return;

        candidates.push(node.closest("a, button, [role='button']") || node);
      });
    });

    const unique = Array.from(new Set(candidates));

    unique.sort(function (a, b) {
      return scoreAccountCandidate(b) - scoreAccountCandidate(a);
    });

    if (unique.length && scoreAccountCandidate(unique[0]) > -50) return unique[0];

    return null;
  }

  function accountRect() {
    const target = findAccountTarget();

    if (target && isVisibleElement(target)) {
      return target.getBoundingClientRect();
    }

    return {
      left: 24,
      top: 82,
      right: 60,
      bottom: 118,
      width: 36,
      height: 36
    };
  }

  function placeToast(root) {
    const rect = accountRect();
    const toastWidth = Math.min(320, window.innerWidth - 24);

    let left = rect.left - 8;
    let top = rect.bottom + 12;

    if (rect.left > window.innerWidth / 2) {
      left = rect.right - toastWidth;
    }

    left = Math.max(12, Math.min(left, window.innerWidth - toastWidth - 12));

    if (top + 140 > window.innerHeight) {
      top = Math.max(12, rect.top - 140);
    }

    root.style.left = left + "px";
    root.style.top = top + "px";
    root.style.width = toastWidth + "px";

    const rootCenterX = left + toastWidth / 2;
    const rootCenterY = top + 52;
    const accountCenterX = rect.left + rect.width / 2;
    const accountCenterY = rect.top + rect.height / 2;

    root.style.setProperty("--mb-register-return-x", (accountCenterX - rootCenterX) + "px");
    root.style.setProperty("--mb-register-return-y", (accountCenterY - rootCenterY) + "px");
  }

  function pulseAccountTarget() {
    const target = findAccountTarget();
    if (!target) return;

    target.classList.add("mb-account-register-target");
    target.setAttribute("title", "Cadastro Maria Bolsas");

    window.setTimeout(function () {
      target.classList.remove("mb-account-register-target");
    }, 1450);
  }

  function bindAccountTarget() {
    const target = findAccountTarget();
    if (!target || target.dataset.mbCadastroBound === "true") return;

    target.dataset.mbCadastroBound = "true";
    target.classList.add("mb-account-register-clickable");
    target.setAttribute("title", "Cadastro Maria Bolsas");

    if (!target.matches("a, button, [role='button']")) {
      target.setAttribute("role", "button");
      target.setAttribute("tabindex", "0");
    }

    target.addEventListener("click", function (event) {
      event.preventDefault();
      window.location.href = cadastroHref();
    });

    target.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        window.location.href = cadastroHref();
      }
    });
  }

  function hideNotice(returnToIcon) {
    const root = document.querySelector("[data-register-notice-root]");
    if (!root) return;

    window.clearTimeout(root._hideTimer);

    if (returnToIcon) {
      placeToast(root);
      pulseAccountTarget();
      root.dataset.mode = "returning";

      window.setTimeout(function () {
        root.dataset.mode = "hidden";
      }, RETURN_ANIMATION_MS);

      return;
    }

    root.dataset.mode = "hidden";
  }

  function openNotice(reason) {
    if (!canShow(reason)) return;

    const root = document.querySelector("[data-register-notice-root]");
    if (!root) return;

    const title = root.querySelector("[data-register-notice-title]");
    const text = root.querySelector("[data-register-notice-text]");

    if (reason === "exit") {
      title.textContent = "Antes de sair";
      text.textContent = "Faça seu cadastro e receba descontos e promoções antes da finalização.";
    } else if (reason === "scroll") {
      title.textContent = "Enquanto você escolhe";
      text.textContent = "Cadastre-se conosco e receba descontos e promoções.";
    } else {
      title.textContent = "Cadastro com vantagens";
      text.textContent = "Cadastre-se conosco e receba descontos e promoções.";
    }

    bindAccountTarget();
    placeToast(root);
    pulseAccountTarget();

    root.dataset.mode = "open";
    shownThisPage = true;
    setStoredNumber(LAST_SHOWN_KEY, Date.now(), window.localStorage);
    setStoredNumber(SHOWN_COUNT_KEY, getStoredNumber(SHOWN_COUNT_KEY) + 1, window.localStorage);

    window.clearTimeout(root._hideTimer);
    root._hideTimer = window.setTimeout(function () {
      hideNotice(true);
    }, reason === "exit" ? 4800 : AUTO_HIDE_MS);
  }

  function closeNotice() {
    setStoredNumber(CLOSED_KEY, Date.now() + CLOSED_COOLDOWN_MS, window.localStorage);
    hideNotice(true);
  }

  function createNotice() {
    const root = document.createElement("div");
    root.className = "mb-register-notice-root";
    root.setAttribute("data-register-notice-root", "true");
    root.dataset.mode = "hidden";

    root.innerHTML = [
      '<section class="mb-register-toast" aria-label="Cadastro e promoções">',
        '<div class="mb-register-toast-icon" aria-hidden="true"><img src="./assets/logo-m-assinatura.png" alt=""></div>',
        '<div class="mb-register-toast-copy">',
          '<span data-register-notice-title>Cadastro com vantagens</span>',
          '<strong>Faça seu cadastro conosco</strong>',
          '<p data-register-notice-text>Cadastre-se conosco e receba descontos e promoções.</p>',
          '<a class="mb-register-toast-action" href="' + cadastroHref() + '">Fazer cadastro</a>',
        '</div>',
        '<button class="mb-register-toast-close" type="button" aria-label="Fechar aviso">×</button>',
      '</section>'
    ].join("");

    const close = root.querySelector(".mb-register-toast-close");

    if (close) {
      close.addEventListener("click", closeNotice);
    }

    return root;
  }

  function scrollRatio() {
    const doc = document.documentElement;
    const body = document.body;

    const scrollTop = window.scrollY || doc.scrollTop || body.scrollTop || 0;
    const maxScroll = Math.max(1, (doc.scrollHeight || body.scrollHeight || 1) - window.innerHeight);

    return scrollTop / maxScroll;
  }

  function initTriggers() {
    window.setTimeout(function () {
      openNotice("time");
    }, TIME_TRIGGER_MS);

    window.addEventListener("scroll", function () {
      if (scrollTriggered) return;
      if (Date.now() - pageStartedAt < MIN_SCROLL_TIME_MS) return;
      if (scrollRatio() < SCROLL_TRIGGER_RATIO) return;

      scrollTriggered = true;
      openNotice("scroll");
    }, { passive: true });

    document.addEventListener("mouseleave", function (event) {
      if (event.clientY > 0) return;

      let exitSeen = false;

      try {
        exitSeen = window.sessionStorage.getItem(EXIT_KEY) === "1";
      } catch (error) {}

      if (exitSeen) return;

      openNotice("exit");

      try {
        window.sessionStorage.setItem(EXIT_KEY, "1");
      } catch (error) {}
    });
  }

  function init() {
    if (!allowNoticeOnThisPage()) return;

    const params = new URLSearchParams(window.location.search);
    if (params.get("resetCadastroNotice") === "1") {
      clearNoticeMemory();
    }

    bindAccountTarget();

    const root = createNotice();
    document.body.appendChild(root);

    initTriggers();

    window.addEventListener("resize", function () {
      const rootNow = document.querySelector("[data-register-notice-root]");
      if (rootNow && rootNow.dataset.mode === "open") placeToast(rootNow);
    });

    window.setTimeout(bindAccountTarget, 900);
    window.setTimeout(bindAccountTarget, 1800);
    window.setTimeout(bindAccountTarget, 3000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();