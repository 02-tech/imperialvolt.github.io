// main.js
(() => {
  'use strict';

  /* ELEMENTOS ------------------------------------------------------------ */
  const cfgFrame  = document.getElementById('configFrame');
  const sentinel  = document.getElementById('suporte-sentinel');
  const mainBox   = document.getElementById('conteudo');
  const ctaBtn    = document.getElementById('cta-btn');

  const btnChat   = document.getElementById('chatbot-toggle');
  const chatWin   = document.getElementById('chatbot-window');
  const chatClose = document.getElementById('chat-close');
  const chatInput = document.getElementById('chat-input');

  /* IFRAMES -------------------------------------------------------------- */
  window.addEventListener('message', ({ data }) => {
    if (!data || typeof data !== 'object') return;

    switch (data.type) {
      case 'config-frame-height':
        resize(cfgFrame, data.height, 60);
        break;
      case 'config-close':
        if (cfgFrame) cfgFrame.style.display = 'none';
        break;
      case 'suporte-frame-height':
        resize(document.getElementById('suporteFrame'), data.height, 0);
        break;
    }
  });

  const resize = (f, h, min) => f && (f.style.height =
    f.style.minHeight = f.style.maxHeight = `${Math.max(min, +h || 0)}px`);

  /* BOOT ----------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    whatsappLinks();
    ctaSupport();
    chatToggle();
    scrollReveal();
  });

  /* WHATSAPP LINKS ------------------------------------------------------- */
  function whatsappLinks () {
    const phone = '5524992144995';
    const hi = () => {
      const h = new Date().getHours();
      return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
    };

    [
      { id: 'link-lucas',   nome: 'Lucas'   },
      { id: 'link-eduarda', nome: 'Eduarda' },
      { id: 'link-alex',    nome: 'Alex'    },
      { id: 'link-nicole',  nome: 'Nicole'  }
    ].forEach(({ id, nome }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const txt = encodeURIComponent(`${hi()}, ${nome}! Vim pelo site da Imperial Volt e gostaria de conversar.`);
      el.href = `https://wa.me/${phone}?text=${txt}`;
    });
  }

  /* CTA + LAZY-LOAD SUPORTE --------------------------------------------- */
  function ctaSupport () {
    let open = false, loaded = false;

    ctaBtn.addEventListener('click', () => {
      open = !open;
      mainBox.classList.toggle('hidden', !open);
      ctaBtn.setAttribute('aria-expanded', open);
      if (open) {
        mainBox.scrollIntoView({ behavior: 'smooth' });
        maybeLoad();
      }
    });

    const io = new IntersectionObserver(ents => {
      ents.forEach(e => e.isIntersecting && open && load());
    });
    io.observe(sentinel);

    function load () {
      if (loaded) return; loaded = true;
      const ifr = document.createElement('iframe');
      ifr.id = 'suporteFrame';
      ifr.src = 'suporte.html';
      ifr.scrolling = 'no';
      ifr.style.cssText = 'width:100%;border:none;overflow:hidden;';
      sentinel.appendChild(ifr);
    }
    const maybeLoad = () => {
      if (sentinel.getBoundingClientRect().top < innerHeight) load();
    };
  }

  /* CHAT ----------------------------------------------------------------- */
  function chatToggle () {

    /* abre/fecha */
    const toggle = () => {
      const hide = chatWin.classList.toggle('hidden');
      btnChat.setAttribute('aria-expanded', (!hide).toString());
      !hide && chatInput.focus();
    };
    btnChat .addEventListener('click', e => { e.stopPropagation(); toggle(); });
    chatClose.addEventListener('click', toggle);

    /* fecha ao tocar fora em mobile  */
    document.addEventListener('click', e => {
      if (!chatWin.classList.contains('hidden') && !chatWin.contains(e.target) && e.target !== btnChat) toggle();
    });
  }

  /* SCROLL-REVEAL -------------------------------------------------------- */
  function scrollReveal () {
    const items = document.querySelectorAll('.fade-section');
    const io = new IntersectionObserver((ents, obs) => {
      ents.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('inview');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: .15 });
    items.forEach(el => io.observe(el));
  }

})();