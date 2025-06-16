// main.js
(() => {
  'use strict';

  /* ELEMENTOS */
  const cfgFrame   = document.getElementById('configFrame');
  const sentinel   = document.getElementById('suporte-sentinel');
  const mainBox    = document.getElementById('conteudo');
  const ctaBtn     = document.getElementById('cta-btn');
  const langSel    = document.getElementById('lang-select');

  const btnChat    = document.getElementById('chatbot-toggle');
  const chatWin    = document.getElementById('chatbot-window');
  const chatClose  = document.getElementById('chat-close');
  const chatInput  = document.getElementById('chat-input');

  /* Mensagens de iframes */
  window.addEventListener('message', ({data})=>{
    if(!data||typeof data!=='object') return;
    const applyH=(f,h,min)=>f&&['height','minHeight','maxHeight']
      .forEach(p=>f.style[p]=`${Math.max(min, +h||0)}px`);
    switch(data.type){
      case'config-frame-height':applyH(cfgFrame,data.height,60);break;
      case'config-close':cfgFrame&&(cfgFrame.style.display='none');break;
      case'suporte-frame-height':applyH(document.getElementById('suporteFrame'),data.height,0);break;
    }
  });

  document.addEventListener('DOMContentLoaded',()=>{
    initWhats();initCTA();initChat();initReveal();initI18n();
  });

  /* WhatsApp */
  function initWhats(){
    const f='5524992144995';
    const saud=()=>['Bom dia','Boa tarde','Boa noite'][
      [0,12,18,24].findIndex(t=>new Date().getHours()<t)-1];
    [['link-lucas','Lucas'],['link-eduarda','Eduarda'],['link-alex','Alex'],['link-nicole','Nicole']]
      .forEach(([id,n])=>{
        const a=document.getElementById(id);
        if(a) a.href=`https://wa.me/${f}?text=${encodeURIComponent(`${saud()}, ${n}! Vim pelo site da Imperial Volt e gostaria de conversar.`)}`;
      });
  }

  /* CTA + suporte */
  function initCTA(){
    let aberto=false,frameOK=false;
    ctaBtn.addEventListener('click',()=>{
      aberto=!aberto;
      mainBox.classList.toggle('hidden',!aberto);
      ctaBtn.setAttribute('aria-expanded',aberto);
      if(aberto){mainBox.scrollIntoView({behavior:'smooth'});talvezCarregar();}
    });
    new IntersectionObserver(e=>e.forEach(x=>x.isIntersecting&&aberto&&carregar()))
      .observe(sentinel);
    function talvezCarregar(){if(sentinel.getBoundingClientRect().top<innerHeight)carregar();}
    function carregar(){
      if(frameOK)return;frameOK=true;
      const i=document.createElement('iframe');
      Object.assign(i,{id:'suporteFrame',src:'suporte.html',scrolling:'no'});
      i.style.cssText='width:100%;border:none;overflow:hidden;';
      sentinel.appendChild(i);
    }
  }

  /* Chat */
  function initChat(){
    const toggle=()=>{
      const h=chatWin.classList.toggle('hidden');
      btnChat.setAttribute('aria-expanded',(!h).toString());
      if(!h)chatInput.focus();
    };
    btnChat.addEventListener('click',e=>{e.stopPropagation();toggle();});
    chatClose.addEventListener('click',toggle);
    document.addEventListener('click',e=>{
      if(!chatWin.classList.contains('hidden')&&!chatWin.contains(e.target)&&e.target!==btnChat)toggle();
    });
  }

  /* Scroll reveal */
  function initReveal(){
    const io=new IntersectionObserver((ent,ob)=>ent.forEach(el=>{
      if(el.isIntersecting){el.target.classList.add('inview');ob.unobserve(el.target);}
    }),{threshold:.15});
    document.querySelectorAll('.fade-section').forEach(el=>io.observe(el));
  }

  /* I18n */
  async function initI18n(){
    const save=localStorage.getItem('lang')||navigator.language||'pt-BR';
    langSel.value=save;await setLang(save);
    langSel.addEventListener('change',()=>setLang(langSel.value));
  }
  async function setLang(lang){
    try{
      const d=await fetch(`locales/${lang}.json`).then(r=>r.json());
      document.documentElement.lang=lang;localStorage.setItem('lang',lang);
      q('[data-i18n]').forEach(e=>d[e.dataset.i18n]&&(e.textContent=d[e.dataset.i18n]));
      q('[data-i18n-placeholder]').forEach(e=>{
        const k=e.dataset.i18nPlaceholder;if(d[k])e.placeholder=d[k];
      });
      const m=document.querySelector('meta[name="description"]');
      if(m&&d['meta.description'])m.content=d['meta.description'];
      if(d['page.title'])document.title=d['page.title'];
    }catch(e){console.error('i18n',e);}
  }
  const q=s=>document.querySelectorAll(s);

})();