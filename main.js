// main.js
(() => {
  'use strict';

  /* ----------------------------- ELEMENTOS ---------------------------- */
  const cfgFrame   = document.getElementById('configFrame');
  const scrollWrap = document.getElementById('scroll-wrap');   // contêiner dedicado
  const sentinel   = document.getElementById('suporte-sentinel');
  const ctaBtn     = document.getElementById('cta-btn');
  const langSel    = document.getElementById('lang-select');

  /* CHAT  -------------------------------------------------------------- */
  const btnChat   = document.getElementById('chatbot-toggle');
  const chatWin   = document.getElementById('chatbot-window');
  const chatClose = document.getElementById('chat-close');
  const chatInput = document.getElementById('chat-input');

  /* ---------------------- 1. MENSAGENS ENTRE IFRAMES ----------------- */
  window.addEventListener('message', ({ data }) => {
    if (!data || typeof data !== 'object') return;

    const setH = (frame, h, min = 0) => {
      frame && ['height', 'minHeight', 'maxHeight']
        .forEach(prop => frame.style[prop] = `${Math.max(min, +h || 0)}px`);
    };

    switch (data.type) {
      case 'config-frame-height':  setH(cfgFrame,             data.height, 60); break;
      case 'config-close':         cfgFrame.style.display = 'none';            break;
      case 'suporte-frame-height': setH(document.getElementById('suporteFrame'), data.height); break;
    }
  });

  /* -------------------------- 2. APP BOOT ----------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initWhats();
    initCTA();
    initChat();
    initReveal();
    initI18n();
  });

  /* -------------------------- 3. WHATS LINKS -------------------------- */
  function initWhats () {
    const phone = '5524992144995';
    const saud  = () => ['Bom dia','Boa tarde','Boa noite']
      [[0,12,18,24].findIndex(t => new Date().getHours() < t) - 1];

    [
      ['link-lucas',  'Lucas'],
      ['link-eduarda','Eduarda'],
      ['link-alex',   'Alex'],
      ['link-nicole', 'Nicole']
    ].forEach(([id, nome]) => {
      const a = document.getElementById(id);
      if (a)
        a.href = `https://wa.me/${phone}?text=${encodeURIComponent(`${saud()}, ${nome}! Vim pelo site Imperial Volt e gostaria de conversar.`)}`;
    });
  }

  /* ---------------------- 4. CTA / SUPORTE LOGIC --------------------- */
  function initCTA () {
    let aberto       = false;   // estado MAIN visível?
    let suporteReady = false;   // iframe já injetado?

    /* injeta o iframe no sentinel */
    function injectSuporte () {
      if (suporteReady) return;
      suporteReady = true;

      const ifr = document.createElement('iframe');
      ifr.id        = 'suporteFrame';
      ifr.src       = 'suporte.html';
      ifr.scrolling = 'no';
      ifr.style.cssText = 'width:100%;border:none;overflow:hidden;transition:height .25s ease';
      sentinel.appendChild(ifr);
    }

    /* observa a rolagem interna DO scrollWrap */
    function onScroll () {
      if (scrollWrap.scrollTop + scrollWrap.clientHeight >= scrollWrap.scrollHeight - 4) {
        injectSuporte();
        scrollWrap.removeEventListener('scroll', onScroll);
      }
    }

    /* clique no botão hero */
    ctaBtn.addEventListener('click', () => {
      aberto = !aberto;
      scrollWrap.classList.toggle('hidden', !aberto);
      ctaBtn.setAttribute('aria-expanded', aberto);

      if (aberto) {
        scrollWrap.scrollTop = 0;        // começa no topo
        /* se o conteúdo já for curto ou usuário rolar, injeta */
        onScroll();
        scrollWrap.addEventListener('scroll', onScroll);
      } else {
        /* esconde iframe se ele existir e fecha dentro dele */
        const sup = document.getElementById('suporteFrame');
        sup?.contentWindow?.postMessage({ type: 'suporte-close' }, '*');
        scrollWrap.removeEventListener('scroll', onScroll);
      }
    });
  }

  /* ----------------------------- 5. CHAT ----------------------------- */
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

  /* ------------------------ 6. REVEAL EFFECT ------------------------- */
  function initReveal () {
    const io = new IntersectionObserver((ents, obs) => {
      ents.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('inview');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: .15, root: scrollWrap });   // root = nosso contêiner

    document.querySelectorAll('.fade-section').forEach(el => io.observe(el));
  }

  /* --------------------------- 7. I18N ------------------------------- */
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

      $$('[data-i18n]').forEach(el => {
        const k = el.dataset.i18n;
        if (dict[k]) el.textContent = dict[k];
      });

      $$('[data-i18n-placeholder]').forEach(el => {
        const k = el.dataset.i18nPlaceholder;
        if (dict[k]) el.placeholder = dict[k];
      });

      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && dict['meta.description']) metaDesc.content = dict['meta.description'];
      if (dict['page.title']) document.title = dict['page.title'];
    } catch (err) { console.error('i18n', err); }
  }

  /* util */
  const $$ = s => document.querySelectorAll(s);

})();