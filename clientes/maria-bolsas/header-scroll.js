(function () {
  if (window.__MB_HEADER_FLUIDO_LATERAL__) return;
  window.__MB_HEADER_FLUIDO_LATERAL__ = true;

  const pagePath = window.location.pathname.toLowerCase();
  const skipFluidHeader =
    pagePath.includes("checkout") ||
    pagePath.includes("carrinho") ||
    pagePath.includes("cart");

  if (skipFluidHeader) return;

  let header = null;
  let mini = null;
  let lastY = window.scrollY || 0;
  let ticking = false;
  let headerHeight = 110;
  let lastDirection = "up";
  let dockTimer = null;
  let collapseTimer = null;
  let openingHeader = false;
  let miniDockingStarted = false;
  let miniReturnToTopPending = false;

  function svgUser() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/></svg>';
  }

  function svgBag() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8h12l1 13H5L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>';
  }

  function isDarkBackground(el) {
    const bg = window.getComputedStyle(el).backgroundColor || "";
    const nums = bg.match(/\d+/g);
    if (!nums || nums.length < 3) return false;

    const r = Number(nums[0]);
    const g = Number(nums[1]);
    const b = Number(nums[2]);

    return r + g + b < 160;
  }

  function scoreElement(el) {
    const rect = el.getBoundingClientRect();
    const text = (el.innerText || "").toLowerCase();

    let score = 0;

    if (el.tagName.toLowerCase() === "header") score += 55;
    if (el.matches(".site-header, .header, .main-header, .store-header, .topbar, .header-wrapper, .nav-wrapper")) score += 45;

    if (text.includes("maria bolsas")) score += 35;
    if (text.includes("início") || text.includes("inicio")) score += 25;
    if (text.includes("produtos")) score += 25;
    if (text.includes("contato")) score += 15;
    if (text.includes("trocas")) score += 15;

    if (el.querySelector("img, svg")) score += 20;
    if (el.querySelector("nav, a")) score += 15;
    if (el.querySelector("input, form, [role='search']")) score += 10;

    if (isDarkBackground(el)) score += 25;

    if (rect.top <= 90) score += 25;
    if (rect.width >= window.innerWidth * 0.72) score += 15;
    if (rect.height >= 55 && rect.height <= 380) score += 20;

    if (rect.top > 220) score -= 90;
    if (rect.height > 500) score -= 80;

    return score;
  }

  function findHeader() {
    const selectors = [
      "header",
      ".site-header",
      ".header",
      ".main-header",
      ".store-header",
      ".topbar",
      ".header-wrapper",
      ".nav-wrapper",
      "body > div",
      "body > section"
    ].join(",");

    const candidates = Array.from(document.querySelectorAll(selectors))
      .filter(function (el) {
        const rect = el.getBoundingClientRect();
        return rect.width > 300 && rect.height > 45;
      })
      .map(function (el) {
        return { el: el, score: scoreElement(el) };
      })
      .sort(function (a, b) {
        return b.score - a.score;
      });

    return candidates.length ? candidates[0].el : null;
  }

  function getLogoInfo() {
    if (!header) {
      return { src: "", alt: "Maria Bolsas" };
    }

    const imgs = Array.from(header.querySelectorAll("img"));

    const scored = imgs.map(function (img) {
      const src = (img.getAttribute("src") || "").toLowerCase();
      const alt = (img.getAttribute("alt") || "").toLowerCase();
      const rect = img.getBoundingClientRect();

      let score = 0;

      if (src.includes("logo")) score += 40;
      if (alt.includes("maria")) score += 40;
      if (alt.includes("bolsas")) score += 30;
      if (rect.width > 80) score += 15;
      if (rect.height > 20) score += 10;

      return { img: img, score: score };
    }).sort(function (a, b) {
      return b.score - a.score;
    });

    const best = scored.length ? scored[0].img : null;

    if (!best) {
      return { src: "", alt: "Maria Bolsas" };
    }

    return {
      src: best.getAttribute("src") || "",
      alt: best.getAttribute("alt") || "Maria Bolsas",
      original: best
    };
  }

  function isSearchElement(el) {
    return Boolean(el.closest("form, [role='search'], .search, .search-form, .search-wrapper, .header-search, .form-search"));
  }

  function isNavElement(el) {
    return Boolean(el.closest("nav, .nav, .navbar, .menu, .main-menu"));
  }

  function safeHideRoot(el) {
    if (!el || !header || !header.contains(el)) return;

    let current = el;

    for (let i = 0; i < 4; i++) {
      const parent = current.parentElement;

      if (!parent || parent === header) break;
      if (parent.matches("form, [role='search'], nav, .nav, .navbar, .menu, .main-menu")) break;
      if (parent.querySelector("form, [role='search'], nav, .nav, .navbar, .menu, .main-menu")) break;

      const rect = parent.getBoundingClientRect();

      if (rect.height > 170) break;

      current = parent;
    }

    current.classList.add("mb-original-header-hidden");
  }

  function findActionCandidates(logoOriginal) {
    if (!header) return [];

    const candidates = Array.from(header.querySelectorAll("a, button"))
      .filter(function (el) {
        if (!el || el.closest(".mb-refined-topline")) return false;
        if (isSearchElement(el)) return false;
        if (isNavElement(el)) return false;
        if (logoOriginal && (el === logoOriginal || el.contains(logoOriginal) || logoOriginal.contains(el))) return false;

        const rect = el.getBoundingClientRect();
        const label = [
          el.getAttribute("href") || "",
          el.getAttribute("aria-label") || "",
          el.getAttribute("title") || "",
          el.innerText || ""
        ].join(" ").toLowerCase();

        const looksAccount =
          label.includes("conta") ||
          label.includes("login") ||
          label.includes("cadastro") ||
          label.includes("entrar") ||
          label.includes("user") ||
          label.includes("account");

        const looksCart =
          label.includes("carrinho") ||
          label.includes("sacola") ||
          label.includes("bag") ||
          label.includes("cart") ||
          label.includes("checkout");

        const hasIcon = Boolean(el.querySelector("svg, img, i")) || looksAccount || looksCart || (el.innerText || "").trim().length <= 3;

        if (!hasIcon) return false;
        if (rect.width < 6 || rect.height < 6) return false;

        return true;
      });

    return candidates;
  }

  function chooseActions(candidates) {
    let account = null;
    let cart = null;

    candidates.forEach(function (el) {
      const label = [
        el.getAttribute("href") || "",
        el.getAttribute("aria-label") || "",
        el.getAttribute("title") || "",
        el.innerText || ""
      ].join(" ").toLowerCase();

      if (!account && (
        label.includes("conta") ||
        label.includes("login") ||
        label.includes("cadastro") ||
        label.includes("entrar") ||
        label.includes("user") ||
        label.includes("account")
      )) {
        account = el;
      }

      if (!cart && (
        label.includes("carrinho") ||
        label.includes("sacola") ||
        label.includes("bag") ||
        label.includes("cart") ||
        label.includes("checkout")
      )) {
        cart = el;
      }
    });

    const sorted = candidates
      .filter(function (el) {
        return el !== account && el !== cart;
      })
      .sort(function (a, b) {
        return a.getBoundingClientRect().left - b.getBoundingClientRect().left;
      });

    if (!account) account = sorted.shift() || null;
    if (!cart) cart = sorted.pop() || sorted.shift() || null;

    return { account: account, cart: cart };
  }

  function triggerOriginal(el, fallbackHref) {
    if (el) {
      try {
        el.click();
        return;
      } catch (err) {}
    }

    if (fallbackHref) {
      window.location.href = fallbackHref;
    }
  }

  function createCleanButton(type, original) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "mb-refined-action mb-refined-" + type;

    if (type === "account") {
      btn.setAttribute("aria-label", "Minha conta");
      btn.innerHTML = svgUser();
      btn.addEventListener("click", function () {
        triggerOriginal(original, "#");
      });
    } else {
      btn.setAttribute("aria-label", "Carrinho");
      btn.innerHTML = svgBag();
      btn.addEventListener("click", function () {
        triggerOriginal(original, "carrinho.html");
      });
    }

    return btn;
  }

  function buildTopLine(logoInfo, actions) {
    const topLine = document.createElement("div");
    topLine.className = "mb-refined-topline";

    const left = document.createElement("div");
    left.className = "mb-refined-left";

    const center = document.createElement("div");
    center.className = "mb-refined-logo-wrap";

    const right = document.createElement("div");
    right.className = "mb-refined-right";

    left.appendChild(createCleanButton("account", actions.account));

    const logoLink = document.createElement("a");
    logoLink.className = "mb-refined-logo-node";
    logoLink.href = "index.html";
    logoLink.setAttribute("aria-label", "Maria Bolsas - início");

    if (logoInfo.src) {
      const img = document.createElement("img");
      img.src = logoInfo.src;
      img.alt = logoInfo.alt || "Maria Bolsas";
      logoLink.appendChild(img);
    } else {
      const span = document.createElement("span");
      span.className = "mb-refined-logo-text";
      span.textContent = "MARIA BOLSAS";
      logoLink.appendChild(span);
    }

    center.appendChild(logoLink);

    right.appendChild(createCleanButton("cart", actions.cart));

    topLine.appendChild(left);
    topLine.appendChild(center);
    topLine.appendChild(right);

    return topLine;
  }

  function refineHeader() {
    if (!header) return;
    if (header.querySelector(".mb-refined-topline")) return;

    const logoInfo = getLogoInfo();
    const logoOriginal = logoInfo.original || null;
    const candidates = findActionCandidates(logoOriginal);
    const actions = chooseActions(candidates);

    const topLine = buildTopLine(logoInfo, actions);

    if (logoOriginal) safeHideRoot(logoOriginal);
    if (actions.account) safeHideRoot(actions.account);
    if (actions.cart && actions.cart !== actions.account) safeHideRoot(actions.cart);

    header.insertBefore(topLine, header.firstChild);
    header.classList.add("mb-refined-header");
  }

  function createMini() {
    const existing = document.querySelector(".mb-floating-mini");
    if (existing) return existing;

    const logoInfo = getLogoInfo();
    const candidates = findActionCandidates(logoInfo.original || null);
    const actions = chooseActions(candidates);

    const box = document.createElement("div");
    box.className = "mb-floating-mini";
    box.setAttribute("aria-label", "Acesso rápido Maria Bolsas");

    const main = document.createElement("button");
    main.type = "button";
    main.className = "mb-mini-main";
    main.setAttribute("aria-label", "Voltar ao topo");

    if (logoInfo.src) {
      const img = document.createElement("img");
      img.src = logoInfo.src;
      img.alt = logoInfo.alt || "Maria Bolsas";
      main.appendChild(img);
    } else {
      const span = document.createElement("span");
      span.textContent = "MB";
      main.appendChild(span);
    }

    main.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
      });
    });

    const acc = document.createElement("button");
    acc.type = "button";
    acc.className = "mb-mini-icon";
    acc.setAttribute("aria-label", "Minha conta");
    acc.innerHTML = svgUser();
    acc.addEventListener("click", function () {
      triggerOriginal(actions.account, "#");
    });

    const cart = document.createElement("button");
    cart.type = "button";
    cart.className = "mb-mini-icon";
    cart.setAttribute("aria-label", "Carrinho");
    cart.innerHTML = svgBag();
    cart.addEventListener("click", function () {
      triggerOriginal(actions.cart, "carrinho.html");
    });

    box.appendChild(main);
    box.appendChild(acc);
    box.appendChild(cart);

    box.addEventListener("mouseenter", function () {
      expandMini();
    });

    box.addEventListener("mouseleave", function () {
      scheduleMiniCollapse();
    });

    /*
      Clique funcional:
      - botão de conta/carrinho mantém sua função;
      - clique no logo, no corpo preto ou no espaço vazio do mini leva ao topo;
      - o header só abre quando a rolagem chega ao topo.
    */
    box.addEventListener("click", function (event) {
      if (event.target.closest(".mb-mini-icon")) {
        return;
      }

      miniReturnToTopPending = true;

      clearTimeout(dockTimer);
      clearTimeout(collapseTimer);
      miniDockingStarted = false;

      if (mini) {
        mini.classList.remove("mb-mini-expanded");
        mini.classList.remove("mb-mini-docked");
        mini.classList.add("mb-mini-visible");
      }

      window.scrollTo({
        top: 0,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
      });
    });

    document.body.appendChild(box);

    return box;
  }

  function showMini() {
    if (!mini) return;
    if (openingHeader) return;

    clearTimeout(collapseTimer);

    /*
      Regra:
      - O mini aparece no centro só quando nasce.
      - Depois ele vai para a lateral sem reiniciar a animação.
      - Scroll rápido não pode manter o mini preso no centro.
    */
    if (mini.classList.contains("mb-mini-visible")) {
      if (
        !mini.classList.contains("mb-mini-docked") &&
        !mini.classList.contains("mb-mini-expanded") &&
        !miniDockingStarted
      ) {
        miniDockingStarted = true;

        dockTimer = window.setTimeout(function () {
          if (!mini.classList.contains("mb-mini-visible")) {
            miniDockingStarted = false;
            return;
          }

          mini.classList.add("mb-mini-docked");
          miniDockingStarted = false;
        }, 180);
      }

      return;
    }

    clearTimeout(dockTimer);
    miniDockingStarted = false;

    mini.classList.add("mb-mini-visible");
    mini.classList.remove("mb-mini-expanded");
    mini.classList.remove("mb-mini-docked");

    miniDockingStarted = true;

    dockTimer = window.setTimeout(function () {
      if (!mini.classList.contains("mb-mini-visible")) {
        miniDockingStarted = false;
        return;
      }

      mini.classList.add("mb-mini-docked");
      miniDockingStarted = false;
    }, 180);
  }

  function hideMini(force) {
    if (!mini) return;

    clearTimeout(dockTimer);
    clearTimeout(collapseTimer);
    miniDockingStarted = false;

    mini.classList.remove("mb-mini-expanded");
    mini.classList.remove("mb-mini-docked");
    mini.classList.remove("mb-mini-visible");
  }

  function expandMini() {
    if (!mini) return;

    clearTimeout(collapseTimer);
    clearTimeout(dockTimer);

    mini.classList.add("mb-mini-visible");
    mini.classList.add("mb-mini-docked");

    window.setTimeout(function () {
      mini.classList.add("mb-mini-expanded");
    }, 20);
  }

  function scheduleMiniCollapse() {
    if (!mini) return;

    clearTimeout(collapseTimer);

    collapseTimer = window.setTimeout(function () {
      mini.classList.remove("mb-mini-expanded");
      mini.classList.add("mb-mini-docked");
    }, 2000);
  }

  function markHero() {
    const candidates = Array.from(document.querySelectorAll("section, .hero, .hero-section, .banner, .main-banner, .hero-banner, div"))
      .filter(function (el) {
        const text = (el.innerText || "").toLowerCase();
        const rect = el.getBoundingClientRect();

        return text.includes("bolsa juliana") && rect.width > 300 && rect.height > 160;
      })
      .sort(function (a, b) {
        const ar = a.getBoundingClientRect();
        const br = b.getBoundingClientRect();

        return (br.width * br.height) - (ar.width * ar.height);
      });

    if (candidates[0]) {
      candidates[0].classList.add("mb-juliana-hero-frame");
    }
  }

  function measure() {
    if (!header) return;

    const rect = header.getBoundingClientRect();

    headerHeight = Math.max(70, rect.height || header.offsetHeight || 100);
  }

  function showHeader() {
    if (!header) return;
    if (openingHeader) return;

    clearTimeout(dockTimer);
    clearTimeout(collapseTimer);
    miniDockingStarted = false;

    /*
      Regra:
      - Header grande só abre no topo.
      - Se o mini estiver lateral, ele volta ao centro enquanto o header abre.
      - O header começa a aparecer imediatamente para evitar branco/flash.
    */
    if (mini && mini.classList.contains("mb-mini-visible")) {
      openingHeader = true;

      mini.classList.remove("mb-mini-expanded");
      mini.classList.remove("mb-mini-docked");

      header.classList.remove("mb-header-hidden");
      header.classList.remove("mb-header-compact");

      window.setTimeout(function () {
        hideMini(true);
        openingHeader = false;
        miniReturnToTopPending = false;
      }, 280);

      return;
    }

    header.classList.remove("mb-header-hidden");
    header.classList.remove("mb-header-compact");
    hideMini(true);
    miniReturnToTopPending = false;
  }

  function hideHeader() {
    if (!header) return;

    header.classList.add("mb-header-hidden");
    showMini();
  }

  function update() {
    ticking = false;

    const y = window.scrollY || 0;
    const delta = y - lastY;
    const nearTop = y < 18;
    const passedHeader = y > Math.max(70, headerHeight * 0.48);

    if (!header) return;

    /*
      Regra nova:
      - O header inteiro só volta quando chega no topo.
      - Ao subir devagar no meio da página, o mini continua lateral.
      - Isso evita o topo preto abrindo no meio da navegação.
    */
    if (nearTop) {
      header.classList.remove("mb-header-compact");
      showHeader();
      lastDirection = "up";
      lastY = y;
      return;
    }

    header.classList.add("mb-header-compact");

    if (passedHeader || header.classList.contains("mb-header-hidden")) {
      hideHeader();
    }

    if (delta > 7) {
      lastDirection = "down";
    } else if (delta < -5) {
      lastDirection = "up";
    }

    lastY = y;
  }

  function requestUpdate() {
    if (ticking) return;

    ticking = true;
    window.requestAnimationFrame(update);
  }

  function init() {
    header = findHeader();

    if (!header) {
      return;
    }

    header.classList.add("mb-smart-header");

    refineHeader();
    markHero();

    mini = createMini();

    measure();
    update();

    window.addEventListener("scroll", requestUpdate, { passive: true });

    window.addEventListener("resize", function () {
      measure();
      markHero();
      requestUpdate();
    });

    header.addEventListener("focusin", showHeader);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.addEventListener("load", function () {
    setTimeout(function () {
      measure();
      markHero();
      update();
    }, 250);
  });
})();



