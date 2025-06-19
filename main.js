// main.js
(() => {
  'use strict';

  /* ELEMENTOS PRINCIPAIS */
  const cfgFrame  = document.getElementById('configFrame');
  const sentinel  = document.getElementById('suporte-sentinel');
  const mainBox   = document.getElementById('conteudo');
  const ctaBtn    = document.getElementById('cta-btn');
  const langSel   = document.getElementById('lang-select');

  /* CHAT */
  const btnChat   = document.getElementById('chatbot-toggle');
  const chatWin   = document.getElementById('chatbot-window');
  const chatClose = document.getElementById('chat-close');
  const chatInput = document.getElementById('chat-input');

  /* ------------------------------------------------------------------ */
  window.addEventListener('message', ({ data }) => {
    if (!data || typeof data !== 'object') return;
    const setH = (f, h, min) =>
      f && ['height', 'minHeight', 'maxHeight']
        .forEach(p => (f.style[p] = `${Math.max(min, +h || 0)}px`));

    switch (data.type) {
      case 'config-frame-height':  setH(cfgFrame, data.height, 60); break;
      case 'config-close':         cfgFrame && (cfgFrame.style.display = 'none'); break;
      case 'suporte-frame-height': setH(document.getElementById('suporteFrame'), data.height, 0); break;
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    initWhats();
    initCTA();
    initChat();
    initReveal();
    initI18n();
  });

  /* ----------------------- WHATSAPP LINKS --------------------------- */
  function initWhats () {
    const phone = '5524992144995';
    const saud  = () => ['Bom dia','Boa tarde','Boa noite'][[0,12,18,24].findIndex(t => new Date().getHours() < t) - 1];

    [
      ['link-lucas','Lucas'],
      ['link-eduarda','Eduarda'],
      ['link-alex','Alex'],
      ['link-nicole','Nicole']
    ].forEach(([id, nome]) => {
      const a = document.getElementById(id);
      if (a) a.href = `https://wa.me/${phone}?text=${encodeURIComponent(`${saud()}, ${nome}! Vim pelo site da Imperial Volt e gostaria de conversar.`)}`;
    });
  }

  /* ---------------------- CTA / SUPORTE ----------------------------- */
  function initCTA () {
    let aberto = false, frameOK = false;

    ctaBtn.addEventListener('click', () => {
      aberto = !aberto;
      mainBox.classList.toggle('hidden', !aberto);
      ctaBtn.setAttribute('aria-expanded', aberto);

      if (aberto) {
        mainBox.scrollIntoView({ behavior: 'smooth' });
        maybeLoadSuporte();
        const sup = document.getElementById('suporteFrame');
        if (sup) sup.style.display = '';          // volta a exibir se já existia
      } else {
        /* NOVO → avisa suporte para fechar e esconde o iframe */
        const sup = document.getElementById('suporteFrame');
        sup?.contentWindow?.postMessage({ type: 'suporte-close' }, '*');
        if (sup) sup.style.display = 'none';
      }
    });

    /* Lazy-load */
    new IntersectionObserver(ents => ents.forEach(e => e.isIntersecting && aberto && loadSuporte()))
      .observe(sentinel);

    function maybeLoadSuporte () {
      if (sentinel.getBoundingClientRect().top < innerHeight) loadSuporte();
    }
    function loadSuporte () {
      if (frameOK) return; frameOK = true;
      const ifr = Object.assign(document.createElement('iframe'), {
        id:  'suporteFrame',
        src: 'suporte.html',
        scrolling: 'no'
      });
      ifr.style.cssText = 'width:100%;border:none;overflow:hidden;';
      sentinel.appendChild(ifr);
    }
  }

  /* ------------------------- CHAT ----------------------------------- */
  function initChat () {
    const abrir  = () => {
      chatWin.classList.remove('hidden');
      btnChat.setAttribute('aria-expanded', 'true');
      chatInput?.focus();
    };
    const fechar = () => {
      chatWin.classList.add('hidden');
      btnChat.setAttribute('aria-expanded', 'false');
    };

    btnChat .addEventListener('click', e => { e.stopPropagation(); chatWin.classList.contains('hidden') ? abrir() : fechar(); });
    chatClose.addEventListener('click', fechar);
    document.addEventListener('click', e => {
      if (!chatWin.classList.contains('hidden') && !chatWin.contains(e.target) && e.target !== btnChat) fechar();
    });
  }

  /* ---------------------- REVEAL ON SCROLL -------------------------- */
  function initReveal () {
    const io = new IntersectionObserver((ents, obs) => {
      ents.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('inview');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: .15 });

    document.querySelectorAll('.fade-section').forEach(el => io.observe(el));
  }

  /* ----------------------- I18N ------------------------------------ */
  async function initI18n () {
    const saved = localStorage.getItem('lang') || navigator.language || 'pt-BR';
    langSel.value = saved;
    await setLang(saved);
    langSel.addEventListener('change', () => setLang(langSel.value));
  }
  async function setLang (lang) {
    try {
      const dict = await fetch(`locales/${lang}.json`).then(r => r.json());
      document.documentElement.lang = lang;
      localStorage.setItem('lang', lang);
      $$('[data-i18n]').forEach(el => dict[el.dataset.i18n] && (el.textContent = dict[el.dataset.i18n]));
      $$('[data-i18n-placeholder]').forEach(el => {
        const k = el.dataset.i18nPlaceholder;
        if (dict[k]) el.placeholder = dict[k];
      });
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && dict['meta.description']) metaDesc.content = dict['meta.description'];
      if (dict['page.title']) document.title = dict['page.title'];
    } catch (err) { console.error('i18n', err); }
  }
  const $$ = s => document.querySelectorAll(s);

})();