(function () {
  function cadastroHref() {
    const file = String(window.location.pathname || "").split("/").pop() || "produto.html";
    const query = String(window.location.search || "");
    const retorno = file + query;

    const url = new URL("cadastro.html", window.location.href);
    url.searchParams.set("origem", "beneficio");
    url.searchParams.set("retorno", retorno);

    return url.pathname.split("/").pop() + url.search;
  }

  function createProductBenefitCard() {
    const card = document.createElement("section");
    card.className = "mb-first-benefit-card mb-first-benefit-card--product";
    card.setAttribute("data-first-purchase-benefit", "product");

    card.innerHTML = [
      '<div class="mb-first-benefit-kicker">Cadastro com vantagens</div>',
      '<strong>Receba descontos e promoções</strong>',
      '<p>Faça seu cadastro conosco para receber vantagens disponíveis antes da finalização.</p>',
      '<a class="mb-first-benefit-link" href="' + cadastroHref() + '">Fazer cadastro</a>'
    ].join("");

    return card;
  }

  function createCheckoutFastCard() {
    const card = document.createElement("section");
    card.className = "mb-first-benefit-card mb-first-benefit-card--checkout mb-checkout-fast-card";
    card.setAttribute("data-first-purchase-benefit", "checkout");

    card.innerHTML = [
      '<div class="mb-first-benefit-kicker">Compra rápida</div>',
      '<strong>Finalize em poucos passos</strong>',
      '<p>Informe contato, entrega e pagamento. Sem cadastro extra obrigatório durante a finalização.</p>'
    ].join("");

    return card;
  }

  function insertProductBenefit() {
    if (document.querySelector('[data-first-purchase-benefit="product"]')) return;

    const cepRow = document.querySelector(".cep-row");
    const productActions =
      document.querySelector(".product-actions") ||
      document.querySelector(".product-cta") ||
      document.querySelector(".buy-now") ||
      document.querySelector("a[href*='checkout.html']");

    const card = createProductBenefitCard();

    if (cepRow) {
      cepRow.insertAdjacentElement("afterend", card);
      return;
    }

    if (productActions) {
      productActions.insertAdjacentElement("beforebegin", card);
    }
  }

  function insertCheckoutFastCard() {
    if (document.querySelector('[data-first-purchase-benefit="checkout"]')) return;

    const form = document.querySelector(".checkout-form");
    if (!form) return;

    const card = createCheckoutFastCard();
    form.insertAdjacentElement("afterbegin", card);
  }

  function initFirstPurchaseBenefit() {
    const page = String(window.location.pathname || "").toLowerCase();

    if (page.includes("produto")) {
      insertProductBenefit();
    }

    if (page.includes("checkout")) {
      insertCheckoutFastCard();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFirstPurchaseBenefit);
  } else {
    initFirstPurchaseBenefit();
  }
})();