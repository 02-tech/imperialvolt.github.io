// main.js — versão estável + auto-resize do suporte
(() => {
  'use strict';

  /* ------------------------------------------------------------------
   * 0. Elementos principais
   * ---------------------------------------------------------------- */
  const mainBox = document.getElementById('conteudo');    // <main> que some/mostra
  const ctaBtn  = document.getElementById('cta-btn');     // botão “⚡ Energize…”
  const langSel = document.getElementById('lang-select'); // seletor de idioma

  /* ------------------------------------------------------------------
   * 1. Ajuste de altura do iframe de suporte
   * ---------------------------------------------------------------- */
  window.addEventListener('message', evt => {
    const { data } = evt;
    if (!data || data.type !== 'suporte-frame-height') return;

    const sup = document.getElementById('suporteFrame');
    if (sup) {
      // Altura mínima: 120 px para evitar “piscadas” em telas estreitas
      sup.style.height = Math.max(120, +data.height || 0) + 'px';
    }
  });

  /* ------------------------------------------------------------------
   * 2. Mostrar / esconder o <main>
   * ---------------------------------------------------------------- */
  function initCTA() {
    if (!ctaBtn || !mainBox) return;

    ctaBtn.addEventListener('click', () => {
      mainBox.classList.toggle('hidden');

      const aberto = !mainBox.classList.contains('hidden');
      ctaBtn.setAttribute('aria-expanded', aberto);

      if (aberto) {
        mainBox.scrollIntoView({ behavior: 'smooth' });
        revealNow(); // garante fade-in imediato do que já estiver na viewport
      }
    });
  }

  /* ------------------------------------------------------------------
   * 3. Fade-in das seções (.fade-section)
   * ---------------------------------------------------------------- */
  let revealNow = () => {};          // será preenchido logo abaixo

  function initRevealObserver() {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('inview');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.fade-section').forEach(sec => io.observe(sec));

    // Helper: revela imediatamente tudo que já está visível
    revealNow = () => {
      document
        .querySelectorAll('.fade-section:not(.inview)')
        .forEach(sec => {
          const r = sec.getBoundingClientRect();
          if (r.top < window.innerHeight * 0.85) sec.classList.add('inview');
        });
    };
  }

  /* ------------------------------------------------------------------
   * 4. Links de WhatsApp dinâmicos
   * ---------------------------------------------------------------- */
  function initWhats() {
    const phone = '5524992144995';
    const saud  = () => ['Bom dia','Boa tarde','Boa noite'][
      [0,12,18,24].findIndex(t => new Date().getHours() < t) - 1
    ];

    [
      ['link-lucas',  'Lucas'],
      ['link-eduarda','Eduarda'],
      ['link-alex',   'Alex'],
      ['link-nicole', 'Nicole']
    ].forEach(([id, nome]) => {
      const el = document.getElementById(id);
      if (el) {
        el.href =
          `https://wa.me/${phone}?text=${
            encodeURIComponent(`${saud()}, ${nome}! Vim pelo site da Imperial Volt e gostaria de conversar.`)
          }`;
      }
    });
  }

  /* ------------------------------------------------------------------
   * 5. Chat flutuante
   * ---------------------------------------------------------------- */
  function initChat() {
    const btnChat   = document.getElementById('chatbot-toggle');
    const chatWin   = document.getElementById('chatbot-window');
    const chatClose = document.getElementById('chat-close');
    const chatInput = document.getElementById('chat-input');
    if (!btnChat || !chatWin) return;

    const abrir  = () => {
      chatWin.classList.remove('hidden');
      btnChat.setAttribute('aria-expanded','true');
      chatInput?.focus();
    };
    const fechar = () => {
      chatWin.classList.add('hidden');
      btnChat.setAttribute('aria-expanded','false');
    };

    btnChat.addEventListener('click', e => {
      e.stopPropagation();
      chatWin.classList.contains('hidden') ? abrir() : fechar();
    });
    chatClose.addEventListener('click', fechar);
    document.addEventListener('click', e => {
      if (!chatWin.classList.contains('hidden') &&
          !chatWin.contains(e.target) &&
          e.target !== btnChat) fechar();
    });
  }

  /* ------------------------------------------------------------------
   * 6. Internacionalização (i18n) simples
   * ---------------------------------------------------------------- */
  async function initI18n() {
    if (!langSel) return;

    const saved = localStorage.getItem('lang') || navigator.language || 'pt-BR';
    langSel.value = saved;
    await setLang(saved);

    langSel.addEventListener('change', () => setLang(langSel.value));
  }

  async function setLang(lang) {
    try {
      const dict = await fetch(`locales/${lang}.json`).then(r => r.json());
      document.documentElement.lang = lang;
      localStorage.setItem('lang', lang);

      document.querySelectorAll('[data-i18n]').forEach(el => {
        const k = el.dataset.i18n;
        if (dict[k]) el.textContent = dict[k];
      });
      document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const k = el.dataset.i18nPlaceholder;
        if (dict[k]) el.placeholder = dict[k];
      });

      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && dict['meta.description']) metaDesc.content = dict['meta.description'];
      if (dict['page.title']) document.title = dict['page.title'];
    } catch (err) {
      console.error('i18n', err);
    }
  }

  /* ------------------------------------------------------------------
   * 7. Bootstrap quando o DOM estiver pronto
   * ---------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initCTA();
    initRevealObserver();
    initWhats();
    initChat();
    initI18n();
  });

})();