// main.js
(() => {
  'use strict';

  /* ELEMENTOS */
  const configFrame  = document.getElementById('configFrame');
  const sentinel     = document.getElementById('suporte-sentinel');
  const contentBox   = document.getElementById('conteudo');
  const ctaBtn       = document.getElementById('cta-btn');
  const chatToggle   = document.getElementById('chatbot-toggle');
  const chatWindow   = document.getElementById('chatbot-window');
  const chatClose    = document.getElementById('chat-close');
  const chatInput    = document.getElementById('chat-input');

  /* 1. MENSAGENS DOS IFRAMES ------------------------------------------------ */
  window.addEventListener('message', ({ data }) => {
    if (!data || typeof data !== 'object') return;
    if (data.type === 'config-frame-height') resizeFrame(configFrame, data.height, 60);
    if (data.type === 'config-close')        hide(configFrame);
    if (data.type === 'suporte-frame-height') {
      const sf = document.getElementById('suporteFrame');
      resizeFrame(sf, data.height, 0);
    }
  });

  function resizeFrame(frame, h, min) {
    if (frame) {
      const px = Math.max(min, +h || 0) + 'px';
      frame.style.height    = px;
      frame.style.minHeight = px;
      frame.style.maxHeight = px;
    }
  }
  function hide(el) {
    if (el) el.style.display = 'none';
  }

  /* 2. INICIALIZAÇÃO -------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initWhatsAppLinks();
    initCTAandSupport();
    initChatbot();
    initScrollAnimations();
  });

  /* 3. LINKS DO WHATSAPP ---------------------------------------------------- */
  function initWhatsAppLinks() {
    const phone = '5524992144995';
    const greet = () => {
      const h = new Date().getHours();
      return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
    };
    [
      { id: 'link-lucas',  nome: 'Lucas' },
      { id: 'link-eduarda', nome: 'Eduarda' },
      { id: 'link-alex',   nome: 'Alex' },
      { id: 'link-nicole', nome: 'Nicole' }
    ].forEach(a => {
      const el = document.getElementById(a.id);
      if (!el) return;
      const msg = encodeURIComponent(`${greet()}, ${a.nome}! Vim pelo site da Imperial Volt e gostaria de conversar.`);
      el.href = `https://wa.me/${phone}?text=${msg}`;
    });
  }

  /* 4. CTA + SUPORTE (lazy-load) ------------------------------------------- */
  function initCTAandSupport() {
    let opened = false, loaded = false;

    ctaBtn.addEventListener('click', () => {
      opened = !opened;
      contentBox.classList.toggle('hidden', !opened);
      ctaBtn.setAttribute('aria-expanded', opened);
      if (opened) {
        contentBox.scrollIntoView({ behavior: 'smooth' });
        maybeLoadSupport();
      }
    });

    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && opened) loadSupport();
      });
    }, { threshold: 0 });
    observer.observe(sentinel);

    function loadSupport() {
      if (loaded) return;
      loaded = true;
      const ifr = document.createElement('iframe');
      ifr.id        = 'suporteFrame';
      ifr.src       = 'suporte.html';
      ifr.scrolling = 'no';
      ifr.style.cssText = 'width:100%;border:none;overflow:hidden;';
      sentinel.appendChild(ifr);
    }
    function maybeLoadSupport() {
      if (sentinel.getBoundingClientRect().top < innerHeight) loadSupport();
    }
  }

  /* 5. CHATBOT -------------------------------------------------------------- */
  function initChatbot() {
    chatToggle.addEventListener('click', () => {
      chatWindow.classList.remove('hidden');
      chatToggle.setAttribute('aria-expanded', 'true');
      chatInput.focus();
    });
    chatClose.addEventListener('click', () => {
      chatWindow.classList.add('hidden');
      chatToggle.setAttribute('aria-expanded', 'false');
    });
  }

  /* 6. ANIMAÇÕES AO SCROLL -------------------------------------------------- */
  function initScrollAnimations() {
    const items = document.querySelectorAll('.fade-section');
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('inview');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    items.forEach(el => io.observe(el));
  }

})();