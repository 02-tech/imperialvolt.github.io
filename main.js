// main.js — acrescido: painel de configurações (⚙️) + auto-resize do configFrame
(() => {
  'use strict';

  /* ------------------------------------------------------------------
   * 0. Elementos principais
   * ---------------------------------------------------------------- */
  const mainBox  = document.getElementById('conteudo');   // <main> que some/mostra
  const ctaBtn   = document.getElementById('cta-btn');    // botão “⚡ Energize…”
  const langSel  = document.getElementById('lang-select');// seletor de idioma
  const cfgFrame = document.getElementById('configFrame');// iframe de configurações
  const cfgBtn   = document.getElementById('config-toggle'); // botão ⚙️ (adicione no HTML)

  /* ------------------------------------------------------------------
   * 1. Ajuste de altura para iframes
   * ---------------------------------------------------------------- */
  window.addEventListener('message', ({ data }) => {
    if (!data?.type) return;

    // suporte.html
    if (data.type === 'suporte-frame-height') {
      const sup = document.getElementById('suporteFrame');
      if (sup) sup.style.height = Math.max(120, +data.height || 0) + 'px';
    }

    // config.html
    if (data.type === 'config-frame-height' && cfgFrame) {
      cfgFrame.style.height = Math.max(120, +data.height || 0) + 'px';
    }
  });

  /* ------------------------------------------------------------------
   * 2. Mostrar / esconder o painel de configurações
   * ---------------------------------------------------------------- */
  function initConfigToggle() {
    if (!cfgBtn || !cfgFrame) return;

    const abrir  = () => { cfgFrame.classList.add('open');  cfgBtn.setAttribute('aria-expanded','true'); };
    const fechar = () => { cfgFrame.classList.remove('open');cfgBtn.setAttribute('aria-expanded','false'); };

    cfgBtn.addEventListener('click', e => {
      e.stopPropagation();
      cfgFrame.classList.contains('open') ? fechar() : abrir();
    });

    // fecha com ESC
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && cfgFrame.classList.contains('open')) fechar();
    });
  }

  /* ------------------------------------------------------------------
   * 3. Mostrar / esconder o <main>
   * ---------------------------------------------------------------- */
  function initCTA() {
    if (!ctaBtn || !mainBox) return;

    ctaBtn.addEventListener('click', () => {
      mainBox.classList.toggle('hidden');
      const aberto = !mainBox.classList.contains('hidden');
      ctaBtn.setAttribute('aria-expanded', aberto);
      if (aberto) { mainBox.scrollIntoView({ behavior:'smooth' }); revealNow(); }
    });
  }

  /* ------------------------------------------------------------------
   * 4. Fade-in das seções (.fade-section)
   * ---------------------------------------------------------------- */
  let revealNow = () => {};
  function initRevealObserver() {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('inview'); obs.unobserve(e.target); } });
    }, { threshold:0.15 });

    document.querySelectorAll('.fade-section').forEach(sec => io.observe(sec));

    revealNow = () => {
      document.querySelectorAll('.fade-section:not(.inview)')
        .forEach(sec => { const r = sec.getBoundingClientRect(); if (r.top < window.innerHeight*0.85) sec.classList.add('inview'); });
    };
  }

  /* ------------------------------------------------------------------
   * 5. Links de WhatsApp dinâmicos
   * ---------------------------------------------------------------- */
  function initWhats() {
    const phone = '5524992144995';
    const saud  = () => ['Bom dia','Boa tarde','Boa noite'][[0,12,18,24].findIndex(t => new Date().getHours() < t) - 1];

    [['link-lucas','Lucas'],['link-eduarda','Eduarda'],['link-alex','Alex'],['link-nicole','Nicole']]
      .forEach(([id,nome]) => {
        const el = document.getElementById(id);
        if (el) el.href = `https://wa.me/${phone}?text=${encodeURIComponent(`${saud()}, ${nome}! Vim pelo site da Imperial Volt e gostaria de conversar.`)}`;
      });
  }

  /* ------------------------------------------------------------------
   * 6. Chat flutuante
   * ---------------------------------------------------------------- */
  function initChat() {
    const btnChat   = document.getElementById('chatbot-toggle');
    const chatWin   = document.getElementById('chatbot-window');
    const chatClose = document.getElementById('chat-close');
    const chatInput = document.getElementById('chat-input');
    if (!btnChat || !chatWin) return;

    const abrir  = () => { chatWin.classList.remove('hidden'); btnChat.setAttribute('aria-expanded','true'); chatInput?.focus(); };
    const fechar = () => { chatWin.classList.add('hidden');  btnChat.setAttribute('aria-expanded','false'); };

    btnChat.addEventListener('click', e => { e.stopPropagation(); chatWin.classList.contains('hidden') ? abrir() : fechar(); });
    chatClose.addEventListener('click', fechar);
    document.addEventListener('click', e => { if (!chatWin.classList.contains('hidden') && !chatWin.contains(e.target) && e.target !== btnChat) fechar(); });
  }

  /* ------------------------------------------------------------------
   * 7. Internacionalização (i18n) simples
   * ---------------------------------------------------------------- */
  async function initI18n() {
    if (!langSel) return;
    const saved = localStorage.getItem('lang') || navigator.language || 'pt-BR';
    langSel.value = saved; await setLang(saved);
    langSel.addEventListener('change', () => setLang(langSel.value));
  }
  async function setLang(lang) {
    try {
      const dict = await fetch(`locales/${lang}.json`).then(r => r.json());
      document.documentElement.lang = lang; localStorage.setItem('lang', lang);
      document.querySelectorAll('[data-i18n]').forEach(el => { const k = el.dataset.i18n; if (dict[k]) el.textContent = dict[k]; });
      document.querySelectorAll('[data-i18n-placeholder]').forEach(el => { const k = el.dataset.i18nPlaceholder; if (dict[k]) el.placeholder = dict[k]; });
      const meta = document.querySelector('meta[name=\"description\"]'); if (meta && dict['meta.description']) meta.content = dict['meta.description'];
      if (dict['page.title']) document.title = dict['page.title'];
    } catch (err) { console.error('i18n', err); }
  }

  /* ------------------------------------------------------------------
   * 8. Bootstrap
   * ---------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initConfigToggle();
    initCTA();
    initRevealObserver();
    initWhats();
    initChat();
    initI18n();
  });

})();