(function () {
  function isCheckoutPage() {
    return String(window.location.pathname || "").toLowerCase().includes("checkout");
  }

  function createPanel() {
    const panel = document.createElement("section");
    panel.className = "mb-payment-safe-panel";
    panel.setAttribute("data-payment-safe-panel", "true");

    panel.innerHTML = [
      '<div class="mb-payment-safe-head">',
        '<span>Pagamento seguro</span>',
        '<strong>Escolha a forma de pagamento na finalização</strong>',
        '<p>Pix, cartão ou boleto serão processados em ambiente seguro do provedor escolhido. A loja não armazena dados de cartão.</p>',
      '</div>',
      '<div class="mb-payment-safe-methods">',
        '<article>',
          '<b>Pix</b>',
          '<small>Confirmação rápida por QR Code ou copia e cola.</small>',
        '</article>',
        '<article>',
          '<b>Cartão</b>',
          '<small>Dados inseridos apenas no ambiente seguro de pagamento.</small>',
        '</article>',
        '<article>',
          '<b>Boleto</b>',
          '<small>Gerado após a confirmação do pedido.</small>',
        '</article>',
      '</div>'
    ].join("");

    return panel;
  }

  function findPaymentAnchor() {
    const headings = Array.from(document.querySelectorAll("h1, h2, h3, h4, strong, span, div"));

    return headings.find(function (node) {
      return String(node.textContent || "").trim().toLowerCase() === "pagamento";
    });
  }

  function insertPanel() {
    if (!isCheckoutPage()) return;
    if (document.querySelector("[data-payment-safe-panel]")) return;

    const panel = createPanel();
    const anchor = findPaymentAnchor();
    const form = document.querySelector(".checkout-form");

    if (anchor) {
      const block = anchor.closest("section, div, form") || anchor;
      block.insertAdjacentElement("afterend", panel);
      return;
    }

    if (form) {
      form.insertAdjacentElement("beforeend", panel);
      return;
    }

    document.body.appendChild(panel);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", insertPanel);
  } else {
    insertPanel();
  }
})();