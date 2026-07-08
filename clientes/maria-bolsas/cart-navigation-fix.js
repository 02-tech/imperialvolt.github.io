(function () {
  if (window.__MB_CART_NAV_FIX__) return;
  window.__MB_CART_NAV_FIX__ = true;

  const DEFAULT_SLUG = "bolsa-juliana";

  function getSlug() {
    try {
      const params = new URLSearchParams(window.location.search);
      const fromUrl = params.get("p");
      const fromStorage = localStorage.getItem("mb_cart_slug");
      return fromUrl || fromStorage || DEFAULT_SLUG;
    } catch {
      return DEFAULT_SLUG;
    }
  }

  function goStore() {
    window.location.href = "./index.html";
  }

  function goProduct() {
    window.location.href = "./produto.html?p=" + encodeURIComponent(getSlug());
  }

  function goCheckout() {
    window.location.href = "./checkout.html?p=" + encodeURIComponent(getSlug());
  }

  function makeLink(className, text, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = text;
    button.addEventListener("click", onClick);
    return button;
  }

  function addTopNavigation() {
    const main = document.querySelector(".cart-page-full, main");
    if (!main || document.querySelector(".mb-cart-nav-wrap")) return;

    const wrap = document.createElement("div");
    wrap.className = "mb-cart-nav-wrap";

    const back = makeLink("mb-cart-back", "← Voltar para a loja", goStore);
    const continueBtn = makeLink("mb-cart-continue", "Continuar comprando", goProduct);

    wrap.appendChild(back);
    wrap.appendChild(continueBtn);

    main.insertBefore(wrap, main.firstChild);
  }

  function fixExistingContinueText() {
    const candidates = Array.from(document.querySelectorAll("a, button, p, span, div"))
      .filter((el) => {
        const text = (el.innerText || el.textContent || "").trim().toLowerCase();
        return text === "continuar comprando";
      });

    candidates.forEach((el) => {
      if (el.tagName.toLowerCase() === "a") {
        el.href = "./produto.html?p=" + encodeURIComponent(getSlug());
        return;
      }

      el.style.cursor = "pointer";
      el.setAttribute("role", "button");
      el.setAttribute("tabindex", "0");
      el.addEventListener("click", goProduct);
      el.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          goProduct();
        }
      });
    });
  }

  function addBottomActions() {
    const cartBox = document.querySelector(".cart-box, [data-cart-page]");
    if (!cartBox || document.querySelector(".mb-cart-page-actions")) return;

    const actions = document.createElement("div");
    actions.className = "mb-cart-page-actions";

    const continueBtn = makeLink("mb-cart-continue", "Continuar comprando", goProduct);
    const checkoutBtn = makeLink("mb-cart-checkout", "Finalizar compra", goCheckout);

    actions.appendChild(continueBtn);
    actions.appendChild(checkoutBtn);

    cartBox.appendChild(actions);
  }

  function init() {
    addTopNavigation();
    fixExistingContinueText();
    addBottomActions();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.addEventListener("load", function () {
    setTimeout(init, 250);
  });
})();
