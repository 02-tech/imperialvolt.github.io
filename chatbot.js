/* ───────── BASE DE RESPOSTAS ─────────
 * Todas as chaves já vêm SEM acento e em minúsculas
 * porque a função `normalizar()` converte a entrada.
 */
const respostas = {
  /* ─── Saudações ─── */
  "oi":"Olá! Aqui é o Voltz ⚡. Como posso ajudar? Serviços digitais, motivação ou só bater um papo?",
  "bom-dia":"Bom dia! ☀️ Pronto para evoluir seu projeto?",
  "boa-tarde":"Boa tarde! Precisa de ideia, orçamento ou conselho?",
  "boa-noite":"Boa noite! 🌙 Posso ajudar mesmo fora do horário comercial!",

  /* ─── Agradecimentos ─── */
  "obrigado":"De nada! 😊 Sempre que precisar, conte comigo.",
  "valeu":"@obrigado", "vlw":"@obrigado",

  /* ─── Menu rápido (agora todos reconhecidos) ─── */
  "servicos":"Oferecemos sites, apps, automações e design. Qual te interessa?",
  "apps":"@quero-fazer-app",   /* novo alias */
  "app":"@quero-fazer-app",
  "pagamento":"Pix, cartão em até 12×, boleto ou assinatura mensal — você escolhe.",
  "equipe":"Nossa equipe tem devs, designers e consultores. Quer falar com alguém específico?",
  "suporte":"Tem algum problema urgente? Descreva que já direciono pro suporte.",
  "motivacao":"@me-motiva",

  /* ─── Motivação / frases ─── */
  "me-motiva":"Você já deu o primeiro passo só de perguntar. \"Esperei pelo tempo certo e tudo o que consegui foi menos tempo.\" — @faguital",

  /* ─── Orçamento & valores ─── */
  "valores":"Cada projeto é único. Me diga se precisa de site, app ou automação pra eu estimar.",
  "preco":"@valores",
  "precos":"@valores",
  "quanto-custa":"@valores",

  /* ─── Apps / serviços específicos ─── */
  "quero-fazer-app":"Seu app pode ser simples, híbrido ou nativo. Conte a ideia e digo caminhos e custos.",
  "fazer-site":"Fazemos sites institucionais, lojas e landing pages. Qual estilo procura?",

  /* ─── Fallback ─── */
  "nao-entendi":
    "Hmm… não encontrei uma resposta exata. Talvez queira saber sobre:\n• Serviços\n• Orçamento\n• Motivação\n• Equipe\n• Suporte"
};

/* ───────── UTILITÁRIOS ───────── */
const normalizar = s =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g,'')
   .replace(/[^\w\s-]/g,'').trim().replace(/\s+/g,'-').toLowerCase();

function obterResposta(q){
  const k = normalizar(q);
  let r = respostas[k];
  if(r && r.startsWith('@')) r = respostas[r.slice(1)];
  return r || respostas['nao-entendi'];
}

/* ───────── DOM helpers ───────── */
const $ = s => document.querySelector(s);
const log = $('#chat-log');

function addMsg(txt, cls){
  const d = document.createElement('div');
  d.className = cls;
  d.textContent = txt;
  log.appendChild(d);
  log.scrollTop = log.scrollHeight;
}

function sugestoes(){
  const wrap = document.createElement('div');
  wrap.className = 'sugestoes';
  ['serviços','pagamento','equipe','motivação','suporte'].forEach(t=>{
    const b = document.createElement('button');
    b.textContent = t;
    b.onclick = () => enviar(t);
    wrap.appendChild(b);
  });
  log.appendChild(wrap);
  log.scrollTop = log.scrollHeight;
}

/* ───────── ENVIO ───────── */
function enviar(txt){
  const msg = txt.trim();
  if(!msg) return;
  addMsg('🗨️ '+msg,'user-msg');
  const resp = obterResposta(msg);
  addMsg('🤖 '+resp,'bot-msg');
  if(resp === respostas['nao-entendi']) sugestoes();
}

/* ───────── BOOT ───────── */
document.addEventListener('DOMContentLoaded',()=>{
  const win   = $('#chatbot-window');
  const input = $('#chat-input');
  const toggle= $('#chatbot-toggle');
  const close = $('#chat-close');
  const form  = $('#chat-form');

  toggle.onclick = () => { win.classList.remove('hidden'); input.focus(); };
  close .onclick = () => win.classList.add('hidden');

  addMsg('🤖 Olá! Sou o Voltz-Bot ⚡. Como posso ajudar?', 'bot-msg');

  form.addEventListener('submit', e=>{
    e.preventDefault();
    enviar(input.value);
    input.value = '';
  });
});