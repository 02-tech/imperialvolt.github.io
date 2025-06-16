// main.js
(() => {
  'use strict';

  // ——————————————————————————————————————————————————————————————————————
  // ELEMENTOS PRINCIPAIS
  // ——————————————————————————————————————————————————————————————————————
  const configFrame    = document.getElementById('configFrame');
  const whatsappAgents = [
    { id: 'link-lucas',   nome: 'Lucas'   },
    { id: 'link-eduarda', nome: 'Eduarda' },
    { id: 'link-alex',    nome: 'Alex'    },
    { id: 'link-nicole',  nome: 'Nicole'  }
  ];
  const ctaBtn         = document.getElementById('cta-btn');
  const mainContent    = document.getElementById('conteudo');
  const supportSent    = document.getElementById('suporte-sentinel');
  const chatToggle     = document.getElementById('chatbot-toggle');
  const chatWindow     = document.getElementById('chatbot-window');
  const chatCloseBtn   = document.getElementById('chat-close');
  const chatInput      = document.getElementById('chat-input');

  // ——————————————————————————————————————————————————————————————————————
  // 1) MENSAGENS DE IFRAME (CONFIG + SUPORTE)
  // ——————————————————————————————————————————————————————————————————————
  window.addEventListener('message', ({ data }) => {
    if (!data || typeof data !== 'object') return;

    switch (data.type) {
      case 'config-frame-height':
        resizeFrame(configFrame, data.height, 60);
        break;

      case 'config-close':
        hide(configFrame);
        break;

      case 'suporte-frame-height':
        const suporteFrame = document.getElementById('suporteFrame');
        resizeFrame(suporteFrame, data.height, 0);
        break;
    }
  });

  function resizeFrame(frame, height, min) {
    if (!frame) return;
    const h = Math.max(min, Number(height) || 0) + 'px';
    frame.style.height    = h;
    frame.style.minHeight = h;
    frame.style.maxHeight = h;
  }

  function hide(el) {
    if (el) el.style.display = 'none';
  }

  // ——————————————————————————————————————————————————————————————————————
  // 2) INICIALIZAÇÃO AO CARREGAR O DOM
  // ——————————————————————————————————————————————————————————————————————
  document.addEventListener('DOMContentLoaded', () => {
    initWhatsAppLinks();
    initCtaAndSupportLazyLoad();
    initChatbotToggle();
  });

  // ——————————————————————————————————————————————————————————————————————
  // 3) LINKS DO WHATSAPP COM SAUDAÇÃO DINÂMICA
  // ——————————————————————————————————————————————————————————————————————
  function initWhatsAppLinks() {
    const phone = '5524992144995';
    const saudacao = () => {
      const h = new Date().getHours();
      return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
    };

    whatsappAgents.forEach(agent => {
      const a = document.getElementById(agent.id);
      if (!a) return;
      const msg = encodeURIComponent(`${saudacao()}, ${agent.nome}! Vim pelo site da Imperial Volt e gostaria de conversar.`);
      a.href = `https://wa.me/${phone}?text=${msg}`;
    });
  }

  // ——————————————————————————————————————————————————————————————————————
  // 4) CTA + LAYOUT LAZY-LOAD DO SUPORTE
  // ——————————————————————————————————————————————————————————————————————
  function initCtaAndSupportLazyLoad() {
    let opened = false, loaded = false;

    ctaBtn.setAttribute('aria-expanded', 'false');
    ctaBtn.addEventListener('click', () => {
      opened = !opened;
      mainContent.classList.toggle('hidden', !opened);
      ctaBtn.setAttribute('aria-expanded', opened.toString());
      if (opened) {
        mainContent.scrollIntoView({ behavior: 'smooth' });
        maybeLoadSuporte();
      }
    });

    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && opened) loadSuporteFrame();
      });
    }, { threshold: 0 });
    observer.observe(supportSent);

    function loadSuporteFrame() {
      if (loaded) return;
      loaded = true;
      const iframe = document.createElement('iframe');
      iframe.id        = 'suporteFrame';
      iframe.src       = 'suporte.html';
      iframe.scrolling = 'no';
      iframe.style.cssText = 'width:100%;border:none;overflow:hidden;';
      supportSent.appendChild(iframe);
    }

    function maybeLoadSuporte() {
      const rect = supportSent.getBoundingClientRect();
      if (rect.top < window.innerHeight && opened) {
        loadSuporteFrame();
      }
    }
  }

  // ——————————————————————————————————————————————————————————————————————
  // 5) TOGGLE DO CHATBOT
  // ——————————————————————————————————————————————————————————————————————
  function initChatbotToggle() {
    chatToggle.setAttribute('aria-expanded', 'false');

    chatToggle.addEventListener('click', () => {
      chatWindow.classList.remove('hidden');
      chatToggle.setAttribute('aria-expanded', 'true');
      chatInput.focus();
    });

    chatCloseBtn.addEventListener('click', () => {
      chatWindow.classList.add('hidden');
      chatToggle.setAttribute('aria-expanded', 'false');
    });
  }

})();