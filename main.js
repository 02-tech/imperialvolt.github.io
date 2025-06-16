// main.js
(() => {
  'use strict';

  /* ELEMENTOS ------------------------------------------------------------- */
  const configFrame = document.getElementById('configFrame');
  const sentinel    = document.getElementById('suporte-sentinel');
  const mainBox     = document.getElementById('conteudo');
  const ctaBtn      = document.getElementById('cta-btn');

  const chatToggle  = document.getElementById('chatbot-toggle');
  const chatWin     = document.getElementById('chatbot-window');
  const chatClose   = document.getElementById('chat-close');
  const chatInput   = document.getElementById('chat-input');

  /* MENSAGENS IFRAMES ----------------------------------------------------- */
  window.addEventListener('message', ({ data }) => {
    if (!data || typeof data !== 'object') return;
    if (data.type === 'config-frame-height') resizeFrame(configFrame, data.height, 60);
    if (data.type === 'config-close')        hide(configFrame);
    if (data.type === 'suporte-frame-height'){
      const sf=document.getElementById('suporteFrame');
      resizeFrame(sf,data.height,0);
    }
  });
  function resizeFrame(f,h,min){ if(f){const px=Math.max(min,+h||0)+'px';f.style.height=f.style.minHeight=f.style.maxHeight=px;} }
  const hide = el => el&&(el.style.display='none');

  /* BOOT ------------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', () => {
    initWhatsApp();
    initCTA();
    initChat();
    scrollReveal();
  });

  /* WHATSAPP LINKS -------------------------------------------------------- */
  function initWhatsApp(){
    const phone='5524992144995';
    const hi=()=>{const h=new Date().getHours();return h<12?'Bom dia':h<18?'Boa tarde':'Boa noite';};
    [
      {id:'link-lucas',nome:'Lucas'},
      {id:'link-eduarda',nome:'Eduarda'},
      {id:'link-alex',nome:'Alex'},
      {id:'link-nicole',nome:'Nicole'}
    ].forEach(a=>{
      const el=document.getElementById(a.id);
      if(!el)return;
      el.href=`https://wa.me/${phone}?text=${encodeURIComponent(`${hi()}, ${a.nome}! Vim pelo site da Imperial Volt e gostaria de conversar.`)}`;
    });
  }

  /* CTA + suporte --------------------------------------------------------- */
  function initCTA(){
    let open=false,loaded=false;
    ctaBtn.addEventListener('click',()=>{
      open=!open;
      mainBox.classList.toggle('hidden',!open);
      ctaBtn.setAttribute('aria-expanded',open);
      if(open){mainBox.scrollIntoView({behavior:'smooth'});maybeLoad();}
    });
    const io=new IntersectionObserver(e=>e.forEach(ent=>{if(ent.isIntersecting&&open)load()}),{threshold:0});
    io.observe(sentinel);

    function load(){
      if(loaded)return;loaded=true;
      const ifr=document.createElement('iframe');
      ifr.id='suporteFrame';ifr.src='suporte.html';ifr.scrolling='no';
      ifr.style.cssText='width:100%;border:none;overflow:hidden;';
      sentinel.appendChild(ifr);
    }
    const maybeLoad=()=>{if(sentinel.getBoundingClientRect().top<innerHeight)load();}
  }

  /* CHAT ------------------------------------------------------------------ */
  function initChat(){
    chatToggle.addEventListener('click',()=>{
      chatWin.classList.remove('hidden');
      chatToggle.setAttribute('aria-expanded','true');
      chatInput.focus();
      /* fecha ao tocar fora (mobile) */
      setTimeout(()=>{
        document.addEventListener('click',outside,{once:true});
      },0);
    });
    const outside=e=>{
      if(!chatWin.contains(e.target)&&e.target!==chatToggle)close();
    };
    const close=()=>{
      chatWin.classList.add('hidden');
      chatToggle.setAttribute('aria-expanded','false');
    };
    chatClose.addEventListener('click',close);
  }

  /* SCROLL-REVEAL --------------------------------------------------------- */
  function scrollReveal(){
    const items=document.querySelectorAll('.fade-section');
    const io=new IntersectionObserver((ents,obs)=>{
      ents.forEach(ent=>{
        if(ent.isIntersecting){
          ent.target.classList.add('inview');
          obs.unobserve(ent.target);
        }
      });
    },{threshold:.15});
    items.forEach(el=>io.observe(el));
  }

})();