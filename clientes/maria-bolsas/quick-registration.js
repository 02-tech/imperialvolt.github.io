(function () {
  const STORAGE_KEY = "maria_bolsas_cliente_cadastro";
  const CEP_STORAGE_KEY = "maria_bolsas_cep_entrega";

  function onlyDigits(value) {
    return String(value || "").replace(/\D/g, "");
  }

  function formatCep(value) {
    const digits = onlyDigits(value).slice(0, 8);
    if (digits.length <= 5) return digits;
    return digits.slice(0, 5) + "-" + digits.slice(5);
  }

  function formatPhone(value) {
    const digits = onlyDigits(value).slice(0, 11);

    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return "(" + digits.slice(0, 2) + ") " + digits.slice(2);
    if (digits.length <= 10) return "(" + digits.slice(0, 2) + ") " + digits.slice(2, 6) + "-" + digits.slice(6);

    return "(" + digits.slice(0, 2) + ") " + digits.slice(2, 7) + "-" + digits.slice(7);
  }

  function getReturnUrl() {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("retorno") || "produto.html?p=bolsa-juliana";

    if (/^https?:\/\//i.test(raw)) return "produto.html?p=bolsa-juliana";
    if (raw.includes("..")) return "produto.html?p=bolsa-juliana";

    return raw;
  }

  function setStatus(type, message) {
    const status = document.getElementById("quickRegistrationStatus");
    if (!status) return;

    status.className = "mb-registration-status " + type;
    status.textContent = message;
  }

  function loadSavedCep(input) {
    if (!input) return;

    try {
      const raw = window.localStorage.getItem(CEP_STORAGE_KEY);
      if (!raw) return;

      const payload = JSON.parse(raw);
      if (!payload || !payload.digits) return;

      input.value = formatCep(payload.digits);
    } catch (error) {}
  }

  function init() {
    const form = document.getElementById("quickRegistrationForm");
    if (!form) return;

    const nameInput = form.querySelector('[name="nome"]');
    const emailInput = form.querySelector('[name="email"]');
    const phoneInput = form.querySelector('[name="whatsapp"]');
    const cepInput = form.querySelector('[name="cep"]');

    loadSavedCep(cepInput);

    if (phoneInput) {
      phoneInput.addEventListener("input", function () {
        phoneInput.value = formatPhone(phoneInput.value);
      });
    }

    if (cepInput) {
      cepInput.addEventListener("input", function () {
        cepInput.value = formatCep(cepInput.value);
      });
    }

    window.setTimeout(function () {
      if (nameInput) nameInput.focus();
    }, 350);

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const nome = nameInput ? nameInput.value.trim() : "";
      const email = emailInput ? emailInput.value.trim() : "";
      const whatsapp = phoneInput ? phoneInput.value.trim() : "";
      const cep = cepInput ? cepInput.value.trim() : "";

      if (nome.length < 2) {
        setStatus("is-error", "Informe seu nome para continuar.");
        if (nameInput) nameInput.focus();
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setStatus("is-error", "Informe um e-mail válido.");
        if (emailInput) emailInput.focus();
        return;
      }

      if (onlyDigits(whatsapp).length < 10) {
        setStatus("is-error", "Informe um WhatsApp válido.");
        if (phoneInput) phoneInput.focus();
        return;
      }

      const payload = {
        nome: nome,
        email: email,
        whatsapp: whatsapp,
        cep: cep,
        createdAt: Date.now()
      };

      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch (error) {}

      setStatus("is-ready", "Cadastro salvo. Você será levado para continuar a compra.");

      window.setTimeout(function () {
        window.location.href = getReturnUrl();
      }, 950);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();