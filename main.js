// main.js
'use strict';

// 1) Mensagens dos iframes
window.addEventListener('message', e => {
  const d = e.data;
  if (!d || typeof d !== 'object') return;

  if (d.type === 'config-frame-height') {
    const f = document.getElementById('configFrame');
    if (f) {
      const h = Math.max(60, Number(d.height) || 0) + 'px';
      f.style.height = f.style.minHeight = f.style.maxHeight = h;
    }
  }
  if (d.type === 'config-close') {
    const f = document.getElementById('configFrame');
    if (f) f.style.display = 'none';
  }
  if (d.type === 'suporte-frame-height') {
    const sf = document.getElementById('suporteFrame');
    if (sf) sf.style.height = (d.height || 0) + 'px';
  }
});

// 2) Quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  initWhatsAppLinks();
  initCtaAndSupportLazyLoad();
  initChatbotToggle();
});

// Gera links de WhatsApp com saudação dinâmica
function initWhatsAppLinks() {
  const agents = [
    { id: 'link-lucas', nome: 'Lucas' },
    { id: 'link-eduarda', nome: 'Eduarda' },
    { id: 'link-alex', nome: 'Alex' },
    { id: 'link-nicole', nome: 'Nicole' }
  ];
  const phone = '5524992144995';
  function saudacao() {
    const h = new Date().getHours();
    return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  }
  agents.forEach(a => {
    const el = document.getElementById(a.id);
    if (!el) return;
    const msg = encodeURIComponent(`${saudacao()}, ${a.nome}! Vim pelo site da Imperial Volt e gostaria de conversar.`);
    el.href = `https://wa.me/${phone}?text=${msg}`;
  });
}

// Alterna o conteúdo e faz lazy-load do suporte
function initCtaAndSupportLazyLoad() {
  const btn     = document.getElementById('cta-btn');
  const content = document.getElementById('conteudo');
  const sent    = document.getElementById('suporte-sentinel');
  let aberto = false, loaded = false;

  btn.addEventListener('click', () => {
    content.classList.toggle('hidden');
    aberto = !content.classList.contains('hidden');
    if (aberto) {
      content.scrollIntoView({ behavior: 'smooth' });
      maybeLoad();
    }
  });

  function loadFrame() {
    if (loaded) return;
    loaded = true;
    const iframe = document.createElement('iframe');
    iframe.id        = 'suporteFrame';
    iframe.src       = 'suporte.html';
    iframe.scrolling = 'no';
    iframe.style.cssText = 'width:100%;border:none;overflow:hidden;';
    sent.appendChild(iframe);
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting && aberto) loadFrame();
    });
  }, { threshold: 0 });
  obs.observe(sent);

  function maybeLoad() {
    const rect = sent.getBoundingClientRect();
    if (rect.top < window.innerHeight && aberto) loadFrame();
  }
}

// Controla abertura/fechamento do chatbot
function initChatbotToggle() {
  const toggle = document.getElementById('chatbot-toggle');
  const win    = document.getElementById('chatbot-window');
  const close  = document.getElementById('chat-close');
  const input  = document.getElementById('chat-input');

  toggle.addEventListener('click', () => {
    win.classList.remove('hidden');
    toggle.setAttribute('aria-expanded','true');
    input.focus();
  });
  close.addEventListener('click', () => {
    win.classList.add('hidden');
    toggle.setAttribute('aria-expanded','false');
  });
}