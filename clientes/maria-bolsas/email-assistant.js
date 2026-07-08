(function () {
  const STORAGE_KEY = "maria_bolsas_cliente_email";

  const domains = [
    "gmail.com",
    "hotmail.com",
    "outlook.com",
    "yahoo.com.br",
    "yahoo.com",
    "icloud.com",
    "live.com",
    "bol.com.br",
    "uol.com.br"
  ];

  const corrections = {
    "gmai.com": "gmail.com",
    "gmal.com": "gmail.com",
    "gmial.com": "gmail.com",
    "gmail.con": "gmail.com",
    "gmail.com.br": "gmail.com",
    "hotmial.com": "hotmail.com",
    "hotmai.com": "hotmail.com",
    "hotmal.com": "hotmail.com",
    "hotmail.con": "hotmail.com",
    "outlok.com": "outlook.com",
    "outloo.com": "outlook.com",
    "outlook.con": "outlook.com",
    "icloud.con": "icloud.com",
    "iclould.com": "icloud.com",
    "yaho.com": "yahoo.com",
    "yahoo.con": "yahoo.com"
  };

  function isEmailInput(input) {
    const text = [
      input.type || "",
      input.name || "",
      input.id || "",
      input.placeholder || "",
      input.getAttribute("aria-label") || "",
      input.autocomplete || ""
    ].join(" ").toLowerCase();

    return text.includes("email") || text.includes("e-mail") || text.includes("mail");
  }

  function splitEmail(value) {
    const clean = String(value || "").trim().toLowerCase();
    const at = clean.indexOf("@");

    if (at < 1) {
      return {
        user: clean,
        domain: "",
        hasAt: false
      };
    }

    return {
      user: clean.slice(0, at),
      domain: clean.slice(at + 1),
      hasAt: true
    };
  }

  function getSuggestion(value) {
    const parts = splitEmail(value);

    if (!parts.hasAt || !parts.user || !parts.domain) return null;

    if (corrections[parts.domain]) {
      return parts.user + "@" + corrections[parts.domain];
    }

    const partial = domains.find(function (domain) {
      return domain.startsWith(parts.domain) && domain !== parts.domain;
    });

    if (partial && parts.domain.length >= 2) {
      return parts.user + "@" + partial;
    }

    return null;
  }

  function saveEmail(value) {
    const clean = String(value || "").trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) return;

    try {
      window.localStorage.setItem(STORAGE_KEY, clean);
    } catch (error) {}
  }

  function readSavedEmail() {
    try {
      return window.localStorage.getItem(STORAGE_KEY) || "";
    } catch (error) {
      return "";
    }
  }

  function getBox(input) {
    let box = input.parentElement ? input.parentElement.querySelector(".mb-email-assistant") : null;

    if (!box) {
      box = document.createElement("div");
      box.className = "mb-email-assistant";
      box.setAttribute("aria-live", "polite");
      input.insertAdjacentElement("afterend", box);
    }

    return box;
  }

  function clearBox(input) {
    const box = input.parentElement ? input.parentElement.querySelector(".mb-email-assistant") : null;
    if (box) box.remove();
  }

  function showSuggestion(input, suggestion) {
    const box = getBox(input);

    box.innerHTML = [
      '<span>Você quis dizer</span>',
      '<button type="button" class="mb-email-suggestion">' + suggestion + '</button>'
    ].join(" ");

    const button = box.querySelector("button");

    if (button) {
      button.addEventListener("click", function () {
        input.value = suggestion;
        saveEmail(suggestion);
        clearBox(input);
        input.dispatchEvent(new Event("change", { bubbles: true }));
      });
    }
  }

  function bindEmailInput(input) {
    if (!input || input.dataset.emailAssistant === "true") return;
    if (!isEmailInput(input)) return;

    input.dataset.emailAssistant = "true";
    input.setAttribute("type", "email");
    input.setAttribute("autocomplete", "email");
    input.setAttribute("inputmode", "email");
    input.setAttribute("spellcheck", "false");
    input.setAttribute("autocapitalize", "none");

    const saved = readSavedEmail();

    if (saved && !input.value) {
      input.value = saved;
    }

    input.addEventListener("input", function () {
      const suggestion = getSuggestion(input.value);

      if (suggestion && suggestion !== input.value.trim().toLowerCase()) {
        showSuggestion(input, suggestion);
      } else {
        clearBox(input);
      }
    });

    input.addEventListener("blur", function () {
      const suggestion = getSuggestion(input.value);

      if (suggestion && suggestion !== input.value.trim().toLowerCase()) {
        showSuggestion(input, suggestion);
        return;
      }

      saveEmail(input.value);
    });

    input.addEventListener("change", function () {
      saveEmail(input.value);
    });
  }

  function scan() {
    Array.from(document.querySelectorAll("input")).forEach(bindEmailInput);
  }

  function init() {
    scan();

    const observer = new MutationObserver(scan);

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