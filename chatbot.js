/* ───────── BASE DE RESPOSTAS ───────── */
const respostas = {
  /* — aliases de menu rápidos (precisavam existir) — */
  "servicos":   "Oferecemos sites, apps, automações, design… Diga qual interessa que explico!",
  "pagamento":  "Pix, cartão em até 12×, boleto ou assinatura mensal — o que for melhor pra você.",
  "equipe":     "Nossa equipe tem devs, designers e consultores. Quer falar com quem?",

  /* ... (todo o seu dicionário original permanece aqui) ... */

  "nao-entendi":
    "Hmm… não peguei. Talvez queira saber sobre:\n• Serviços\n• Orçamento\n• Motivação\n• Equipe\n• Suporte\n\nÉ só clicar ou digitar uma dessas opções!"
};

/* ───────── UTILITÁRIOS ───────── */
const normalizar = s =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g,'')
   .replace(/[^\w\s-]/g,'').trim().replace(/\s+/g,'-').toLowerCase();

function obterResposta(pergunta){
  const k = normalizar(pergunta);
  let r   = respostas[k];
  if(typeof r === 'string' && r.startsWith('@')){
    r = respostas[r.slice(1)] || respostas['nao-entendi'];
  }
  return r || respostas['nao-entendi'];
}

/* ───────── DOM HELPERS ───────── */
const $ = sel => document.querySelector(sel);
const log = $('#chat-log');

function addMsg(txt, cls){
  const div = document.createElement('div');
  div.className = cls;
  div.textContent = txt;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

function mostrarSugestoes(){
  const wrap = document.createElement('div');
  wrap.className = 'sugestoes';
  ['serviços','pagamento','equipe','motivação','suporte'].forEach(label=>{
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.onclick = () => enviar(label);   // usa label visível
    wrap.appendChild(btn);
  });
  log.appendChild(wrap);
  log.scrollTop = log.scrollHeight;
}

/* ───────── ENVIO ───────── */
function enviar(textoRaw){
  const texto = textoRaw.trim();
  if(!texto) return;
  addMsg('🗨️ '+texto, 'user-msg');

  const resp = obterResposta(texto);
  addMsg('🤖 '+resp, 'bot-msg');

  if(resp === respostas['nao-entendi']) mostrarSugestoes();
}

/* ───────── BOOT ───────── */
document.addEventListener('DOMContentLoaded',()=>{
  const win   = $('#chatbot-window');
  const input = $('#chat-input');
  const toggle= $('#chatbot-toggle');
  const close = $('#chat-close');
  const form  = $('#chat-form');   // novo <form>

  /* abre/fecha */
  toggle.onclick = () => { win.classList.remove('hidden'); input.focus(); };
  close .onclick = () => win.classList.add('hidden');

  /* mensagem inicial */
  addMsg('🤖 Olá! Sou o Voltz-Bot ⚡. Como posso ajudar?', 'bot-msg');

  /* Enter OU clique no botão “Enviar” */
  form.addEventListener('submit', e=>{
    e.preventDefault();
    enviar(input.value);
    input.value = '';
  });
});