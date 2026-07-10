(function () {
  const STORAGE_KEY = "maria_bolsas_cep_entrega";

  function onlyDigits(value) {
    return String(value || "").replace(/\D/g, "").slice(0, 8);
  }

  function formatCep(digits) {
    if (digits.length <= 5) return digits;
    return digits.slice(0, 5) + "-" + digits.slice(5);
  }

  function isCepInput(input) {
    const text = [
      input.name || "",
      input.id || "",
      input.placeholder || "",
      input.getAttribute("aria-label") || ""
    ].join(" ").toLowerCase();

    return text.includes("cep");
  }

  function findCepInput() {
    return Array.from(document.querySelectorAll("input")).find(isCepInput) || null;
  }

  function getContext(input) {
    if (input && input.closest(".checkout-form")) return "checkout";
    if (input && input.closest(".cep-row")) return "produto";
    return "geral";
  }

  function getAnchor(input) {
    return input.closest(".cep-row") || input.closest("form") || input;
  }

  function removeStatus(input) {
    const anchor = getAnchor(input);
    const owner = input.dataset.cepAutoOwner;

    if (!owner) return;

    document
      .querySelectorAll('[data-cep-auto-status="' + owner + '"]')
      .forEach(function (node) {
        node.remove();
      });

    anchor.classList.remove("has-cep-status");
  }

  function getStatus(input) {
    const anchor = getAnchor(input);
    let owner = input.dataset.cepAutoOwner;

    if (!owner) {
      owner = "cep-" + Math.random().toString(36).slice(2);
      input.dataset.cepAutoOwner = owner;
    }

    let status = document.querySelector('[data-cep-auto-status="' + owner + '"]');

    if (!status) {
      status = document.createElement("div");
      status.setAttribute("data-cep-auto-status", owner);
      status.className = "cep-auto-status-clean";
      anchor.insertAdjacentElement("afterend", status);
    }

    anchor.classList.add("has-cep-status");
    return status;
  }

  function setStatus(input, type, html) {
    const status = getStatus(input);
    status.className = "cep-auto-status-clean" + (type ? " " + type : "");
    status.innerHTML = html;
  }

  function addressLabel(data) {
    const parts = [];

    if (data.logradouro) parts.push(data.logradouro);
    if (data.bairro) parts.push(data.bairro);

    const cityUf = [data.localidade, data.uf].filter(Boolean).join(" - ");
    if (cityUf) parts.push(cityUf);

    return parts.join(" • ");
  }

  let lastFilledCepDigits = "";

  function addressFieldInput(field) {
    return document.querySelector('[data-field="' + field + '"]');
  }

  function isProtectedFromOverwrite(input, digits) {
    return input.dataset.mbManualEdit === "true" && input.dataset.mbManualEditCep === digits;
  }

  function clearManualEditMark(input) {
    delete input.dataset.mbManualEdit;
    delete input.dataset.mbManualEditCep;
  }

  function bindAddressFieldTracking() {
    ["endereco", "bairro", "cidade", "uf"].forEach(function (field) {
      const input = addressFieldInput(field);

      if (!input || input.dataset.mbManualEditBound === "true") return;

      input.dataset.mbManualEditBound = "true";

      input.addEventListener("input", function () {
        input.dataset.mbManualEdit = "true";
        input.dataset.mbManualEditCep = lastFilledCepDigits;
      });
    });
  }

  function fillAddressFields(digits, data) {
    const mapping = {
      endereco: data.logradouro,
      bairro: data.bairro,
      cidade: data.localidade,
      uf: data.uf
    };

    Object.keys(mapping).forEach(function (field) {
      const value = mapping[field];
      if (!value) return;

      const input = addressFieldInput(field);
      if (!input) return;

      if (isProtectedFromOverwrite(input, digits)) return;

      input.value = value;
      clearManualEditMark(input);
    });

    lastFilledCepDigits = digits;
  }

  async function fetchCep(digits) {
    const response = await fetch("https://viacep.com.br/ws/" + digits + "/json/");

    if (!response.ok) {
      throw new Error("Falha ao consultar CEP.");
    }

    const data = await response.json();

    if (data.erro) {
      return null;
    }

    return data;
  }

  function saveCep(data, digits) {
    const payload = {
      cep: formatCep(digits),
      digits: digits,
      logradouro: data.logradouro || "",
      bairro: data.bairro || "",
      localidade: data.localidade || "",
      uf: data.uf || "",
      savedAt: Date.now()
    };

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {}
  }

  function readSavedCep() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;

      const payload = JSON.parse(raw);
      if (!payload || onlyDigits(payload.digits).length !== 8) return null;

      return payload;
    } catch (error) {
      return null;
    }
  }

  function hasValidatedCep() {
    const saved = readSavedCep();
    return !!(saved && onlyDigits(saved.digits).length === 8);
  }

  function currentProductSlug() {
    const params = new URLSearchParams(window.location.search);
    return params.get("p") || "bolsa-juliana";
  }

  function enhanceBuyNowWithCep(digits) {
    const links = Array.from(document.querySelectorAll(".buy-now, a[href*='checkout.html']"));

    links.forEach(function (link) {
      const href = link.getAttribute("href") || "";
      if (!href.includes("checkout.html")) return;

      try {
        const url = new URL(href, window.location.href);

        if (!url.searchParams.get("p")) {
          url.searchParams.set("p", currentProductSlug());
        }

        url.searchParams.set("cep", digits);

        link.setAttribute("href", url.pathname.split("/").pop() + url.search);
        link.dataset.cepReady = "true";
      } catch (error) {}
    });
  }

  function guideToBuyButton() {
    const buyButton =
      document.querySelector(".buy-now") ||
      document.querySelector(".product-actions .buy-btn") ||
      document.querySelector("a[href*='checkout.html']");

    if (!buyButton) return;

    window.setTimeout(function () {
      buyButton.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });

      buyButton.classList.remove("mb-buy-pulse");
      void buyButton.offsetWidth;
      buyButton.classList.add("mb-buy-pulse");

      window.setTimeout(function () {
        buyButton.classList.remove("mb-buy-pulse");
      }, 5200);
    }, 1500);
  }

  function guideToCepField(input, reason) {
    if (!input) return;

    window.setTimeout(function () {
      input.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });

      input.classList.add("mb-cep-focus");
      input.focus({ preventScroll: true });

      if (reason === "buy") {
        setStatus(
          input,
          "is-nudge",
          "<strong>Informe seu CEP para continuar.</strong><span>Assim mostramos a entrega pelos Correios antes da finalização.</span>"
        );
      }

      window.setTimeout(function () {
        input.classList.remove("mb-cep-focus");
      }, 4200);
    }, 250);
  }

  function openCheckoutSedex() {
    const form = document.querySelector(".checkout-form");
    const shipping = document.getElementById("shippingOptions");

    if (!form || !shipping) return;

    form.style.display = "none";
    shipping.classList.remove("hidden");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  async function processCompleteCep(input) {
    const digits = onlyDigits(input.value);
    const context = getContext(input);

    if (digits.length !== 8) {
      removeStatus(input);
      return;
    }

    input.value = formatCep(digits);

    setStatus(
      input,
      "is-loading",
      "<strong>Consultando entrega pelos Correios...</strong><span>Validando o CEP informado.</span>"
    );

    let data = null;

    try {
      data = await fetchCep(digits);
    } catch (error) {
      setStatus(
        input,
        "is-error",
        "<strong>Não foi possível validar o CEP agora.</strong><span>Verifique sua conexão ou tente novamente.</span>"
      );
      return;
    }

    if (!data) {
      setStatus(
        input,
        "is-error",
        "<strong>CEP não encontrado.</strong><span>Confira os números digitados e tente novamente.</span>"
      );
      return;
    }

    saveCep(data, digits);
    enhanceBuyNowWithCep(digits);

    const label = addressLabel(data);
    const addressHtml = label
      ? "<span>" + label + "</span>"
      : "<span>CEP confirmado para entrega.</span>";

    if (context === "checkout") {
      fillAddressFields(digits, data);

      setStatus(
        input,
        "is-ready",
        "<strong>Entrega pelos Correios disponível para este endereço.</strong>" + addressHtml
      );

      window.setTimeout(openCheckoutSedex, 1400);
      return;
    }

    setStatus(
      input,
      "is-ready",
      "<strong>Entrega pelos Correios disponível.</strong>" + addressHtml
    );

    guideToBuyButton();
  }

  function bindCepInput(input) {
    if (!input || input.dataset.cepAutoSedex === "true") return;
    if (!isCepInput(input)) return;

    input.dataset.cepAutoSedex = "true";
    input.setAttribute("inputmode", "numeric");
    input.setAttribute("autocomplete", "postal-code");
    input.setAttribute("maxlength", "9");

    let timer = null;
    let lastComplete = "";

    input.addEventListener("input", function () {
      const digits = onlyDigits(input.value);
      input.value = formatCep(digits);

      if (timer) {
        window.clearTimeout(timer);
        timer = null;
      }

      if (digits.length < 8) {
        lastComplete = "";
        removeStatus(input);
        return;
      }

      if (digits === lastComplete) return;
      lastComplete = digits;

      timer = window.setTimeout(function () {
        processCompleteCep(input);
      }, 300);
    });

    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();

        const digits = onlyDigits(input.value);

        if (digits.length === 8) {
          processCompleteCep(input);
          return;
        }

        setStatus(
          input,
          "is-error",
          "<strong>CEP incompleto.</strong><span>Digite os 8 números do CEP.</span>"
        );
      }
    });

    const form = input.closest("form");

    if (form && form.dataset.cepAutoSedexSubmit !== "true") {
      form.dataset.cepAutoSedexSubmit = "true";

      form.addEventListener("submit", function (event) {
        event.preventDefault();

        const digits = onlyDigits(input.value);

        if (digits.length === 8) {
          processCompleteCep(input);
          return;
        }

        setStatus(
          input,
          "is-error",
          "<strong>CEP incompleto.</strong><span>Digite os 8 números do CEP.</span>"
        );
      });
    }
  }

  function guardBuyButtons() {
    const links = Array.from(document.querySelectorAll(".buy-now, a[href*='checkout.html']"));

    links.forEach(function (link) {
      if (link.dataset.cepGuardBound === "true") return;

      link.dataset.cepGuardBound = "true";

      link.addEventListener("click", function (event) {
        const href = link.getAttribute("href") || "";

        if (!href.includes("checkout.html")) return;

        const url = new URL(href, window.location.href);
        const cepInUrl = onlyDigits(url.searchParams.get("cep") || "");

        if (cepInUrl.length === 8 || hasValidatedCep() || link.dataset.cepReady === "true") {
          return;
        }

        const input = findCepInput();

        if (!input) return;

        event.preventDefault();
        guideToCepField(input, "buy");
      });
    });
  }

  function applyCepFromUrlOrStorage() {
    const input = findCepInput();
    if (!input) return;

    const context = getContext(input);
    if (context !== "checkout") return;

    const params = new URLSearchParams(window.location.search);
    const cepFromUrl = onlyDigits(params.get("cep") || "");

    if (cepFromUrl.length === 8) {
      input.value = formatCep(cepFromUrl);
      processCompleteCep(input);
      return;
    }

    const saved = readSavedCep();

    if (saved && onlyDigits(saved.digits).length === 8) {
      const savedDigits = onlyDigits(saved.digits);
      input.value = formatCep(savedDigits);
      fillAddressFields(savedDigits, saved);
      setStatus(
        input,
        "is-ready",
        "<strong>CEP recuperado da etapa anterior.</strong><span>" +
          [saved.logradouro, saved.bairro, saved.localidade && saved.uf ? saved.localidade + " - " + saved.uf : ""]
            .filter(Boolean)
            .join(" • ") +
          "</span>"
      );
      return;
    }

    guideToCepField(input);
  }

  function cleanupOldStatuses() {
    document
      .querySelectorAll("[data-cep-auto-status], .cep-auto-status, .cep-auto-status-clean")
      .forEach(function (node) {
        node.remove();
      });

    document
      .querySelectorAll(".has-cep-status, .mb-buy-pulse, .mb-cep-focus")
      .forEach(function (node) {
        node.classList.remove("has-cep-status", "mb-buy-pulse", "mb-cep-focus");
      });
  }

  function scan() {
    Array.from(document.querySelectorAll("input")).forEach(bindCepInput);
    guardBuyButtons();
    bindAddressFieldTracking();
  }

  function init() {
    cleanupOldStatuses();
    scan();
    applyCepFromUrlOrStorage();

    const observer = new MutationObserver(function () {
      scan();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();