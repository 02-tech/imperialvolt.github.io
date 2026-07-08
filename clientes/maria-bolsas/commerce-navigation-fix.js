(function () {
  if (window.__MB_COMMERCE_NAV_FIX__) return;
  window.__MB_COMMERCE_NAV_FIX__ = true;

  const DEFAULT_SLUG = "bolsa-juliana";

  function currentPageName() {
    const path = window.location.pathname || "";
    return path.split("/").pop() || "index.html";
  }

  function getQuerySlug() {
    try {
      return new URLSearchParams(window.location.search).get("p") || "";
    } catch {
      return "";
    }
  }

  function cleanSlug(value) {
    const slug = String(value || "").trim();
    return slug || DEFAULT_SLUG;
  }

  function extractSlugFromOnclick(el) {
    const raw = el?.getAttribute?.("onclick") || "";
    const match = raw.match(/adicionarCarrinho\(['"]([^'"]+)['"]\)/i);
    return match ? match[1] : "";
  }

  function getStoredSlug() {
    try {
      return localStorage.getItem("mb_cart_slug") || "";
    } catch {
      return "";
    }
  }

  function storeSlug(slug) {
    try {
      localStorage.setItem("mb_cart_slug", cleanSlug(slug));
    } catch {}
  }

  function resolveSlug(slug, el) {
    return cleanSlug(
      slug ||
      extractSlugFromOnclick(el) ||
      getQuerySlug() ||
      getStoredSlug() ||
      DEFAULT_SLUG
    );
  }

  function resetOriginalDrawer() {
    document.body.classList.add("mb-control-commerce");

    const drawer = document.getElementById("cartDrawer");
    const overlay = document.getElementById("overlay");

    if (drawer) {
      drawer.classList.remove("open");
      drawer.removeAttribute("open");
      drawer.setAttribute("aria-hidden", "true");
      drawer.style.removeProperty("display");
      drawer.style.removeProperty("visibility");
      drawer.style.removeProperty("opacity");
      drawer.style.removeProperty("transform");
    }

    if (overlay) {
      overlay.classList.remove("open");
      overlay.removeAttribute("open");
      overlay.setAttribute("aria-hidden", "true");
      overlay.style.removeProperty("display");
      overlay.style.removeProperty("visibility");
      overlay.style.removeProperty("opacity");
    }

    document.body.style.removeProperty("overflow");
  }

  function goCart(slug, el) {
    const finalSlug = resolveSlug(slug, el);
    storeSlug(finalSlug);
    resetOriginalDrawer();
    window.location.href = "./carrinho.html?p=" + encodeURIComponent(finalSlug);
  }

  function cadastroHref() {
    const file = currentPageName() || "index.html";
    const query = window.location.search || "";

    const url = new URL("cadastro.html", window.location.href);
    url.searchParams.set("origem", "conta");
    url.searchParams.set("retorno", file + query);

    return url.pathname.split("/").pop() + url.search;
  }

  function goAccountCadastro() {
    resetOriginalDrawer();
    window.location.href = cadastroHref();
  }

  function isCartTarget(el) {
    if (!el) return false;

    return Boolean(
      el.closest(".cart-icon") ||
      el.closest(".mb-refined-cart") ||
      el.closest(".mb-mini-icon[aria-label='Carrinho']") ||
      el.closest(".add-cart")
    );
  }

  function isAccountTarget(el) {
    if (!el) return false;

    return Boolean(
      el.closest(".account-icon") ||
      el.closest(".mb-refined-account") ||
      el.closest(".mb-mini-icon[aria-label='Minha conta']")
    );
  }

  /*
    Sobrescreve funções antigas do app.
    Assim qualquer onclick antigo deixa de abrir drawer branco.
  */
  window.abrirCarrinho = function () {
    goCart(resolveSlug());
  };

  window.adicionarCarrinho = function (slug) {
    goCart(slug || DEFAULT_SLUG);
  };

  window.fecharCarrinho = function () {
    resetOriginalDrawer();
  };

  document.addEventListener("click", function (event) {
    const target = event.target;

    if (isCartTarget(target)) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      const clickable = target.closest("button, a, [role='button']");
      goCart(null, clickable);
      return;
    }

    if (isAccountTarget(target)) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      goAccountCadastro();
    }
  }, true);

  document.addEventListener("DOMContentLoaded", function () {
    resetOriginalDrawer();

    document.querySelectorAll(".account-icon").forEach(function (el) {
      el.setAttribute("href", "./cadastro.html");
      el.setAttribute("aria-label", "Acessar cadastro Maria Bolsas");
    });

    document.querySelectorAll(".cart-icon").forEach(function (el) {
      el.setAttribute("aria-label", "Abrir carrinho");
    });
  });

  window.addEventListener("load", function () {
    resetOriginalDrawer();
  });

  window.addEventListener("pageshow", function () {
    resetOriginalDrawer();
  });
})();
