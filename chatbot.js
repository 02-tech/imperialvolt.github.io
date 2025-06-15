/* ───────── BASE DE RESPOSTAS EMBUTIDA ───────── */
const respostas = {

  // ─────── Saudações ampliadas ───────
  "oi": "Olá! Aqui é o Voltz ⚡. Como posso ajudar você hoje? Serviços digitais, motivação ou só bater um papo?",
  "ola": "@oi", "olá": "@oi", "opa": "@oi", "eae": "@oi", "e aí": "@oi", "beleza": "@oi", "fala": "@oi",
  "bom-dia": "Bom dia! ☀️ Pronto para mais um dia de evolução digital?",
  "bom-dia-voltz": "@bom-dia",
  "boa-tarde": "Boa tarde! Precisa de uma ideia, um orçamento ou um conselho?",
  "boa-noite": "Boa noite! 🌙 Voltz está por aqui até pra conversar sobre insônia e futuro!",
  "boa-madrugada": "Boa madrugada! Precisa de inspiração ou resolver um pepino? Tô contigo!",

  // ─────── Agradecimentos e gentilezas ───────
  "obrigado": "De nada! 😊 Sempre que precisar, conte comigo.",
  "obrigada": "@obrigado", "vlw": "@obrigado", "valeu": "@obrigado", "agradeco": "@obrigado", "agradecido": "@obrigado",
  "muito-obrigado": "@obrigado", "grato": "@obrigado", "show": "Tamo junto! ⚡",
  "top": "@show", "massa": "@show", "da-hora": "@show",

  // ─────── Motivação, autoajuda, frases — inclui @faguital —──────
  "me-motiva": "Você já deu o primeiro passo só de perguntar. 'Esperei pelo tempo certo e tudo o que consegui foi menos tempo.' — @faguital",
  "motivacao": "@me-motiva",
  "motivação": "@me-motiva",
  "frase-motivacional": "Nunca subestime o poder de começar pequeno. O importante é sair da inércia.",
  "autoajuda": "Às vezes, o que falta não é tempo, é prioridade. Foque no que você quer colher daqui a 1 ano.",
  "inspiracao": "Inspiração se constrói agindo. O resto é desculpa do medo.",
  "inspiração": "@inspiracao",
  "to-desanimado": "Desânimo passa, resultado fica. Não precisa fazer tudo hoje, mas faça alguma coisa por você.",
  "tô-desanimado": "@to-desanimado",
  "to-sem-energia": "Beba água, estique o corpo e lembra: até o Voltz precisa recarregar!",
  "desistir": "Pensando em desistir? Pense porque começou. O caminho é mais curto pra quem não para.",
  "frase-do-dia": "Hoje pode ser o dia que muda seu destino. Só depende de uma decisão.",
  "faguital": "Faguital é o criador desse projeto — sempre com uma frase pesada para sair da zona de conforto.",
  "esperei-pelo-tempo-certo": "\"Esperei pelo tempo certo e tudo o que consegui foi menos tempo.\" — Lição: não espere demais, faça acontecer agora.",
  "zona-de-conforto": "Nada acontece de novo dentro da zona de conforto. Seu maior risco é não arriscar.",
  "pode-me-ajudar": "Meu trabalho é motivar e entregar soluções! Me conta o que te trava — juntos vamos destravar seu projeto ou sua mente.",

  // ─────── Dúvidas existenciais, perguntas de vida —──────
  "qual-o-sentido-da-vida": "Pergunta clássica! Pra mim, o sentido é evoluir, servir e aproveitar o caminho. E pra você?",
  "vida": "@qual-o-sentido-da-vida",
  "pra-que-tanto-trabalho": "Trabalho é ferramenta, não prisão. Trabalhe por propósito, não só por obrigação.",
  "como-ser-mais-feliz": "Felicidade é processo, não prêmio final. Aprenda algo novo, ajude alguém, evolua um pouquinho todo dia.",
  "por-que-as-coisas-dão-errado": "Errar é dado de fábrica, desistir é opcional. Todo erro pode virar história de vitória se você não para.",
  "quem-sou-eu": "Só você pode responder. Mas eu sou o Voltz, e te ajudo a encontrar as respostas fazendo perguntas melhores!",

  // ─────── Piadas leves, humor, quebra-gelo —──────
  "me-conta-uma-piada": "Por que o desenvolvedor não larga o teclado? Porque ele já está muito bem... 'digitado'.",
  "piada": "@me-conta-uma-piada",
  "piadinha": "@me-conta-uma-piada",
  "conta-uma": "@me-conta-uma-piada",
  "tem-alguma-piada": "@me-conta-uma-piada",
  "faz-uma-piada": "@me-conta-uma-piada",
  "fale-uma-piada": "@me-conta-uma-piada",
  "conta-uma-historia": "Lá vai: uma vez um cliente pediu um site pra ontem. Ontem acabou, e hoje o site ficou pronto! Moral: tudo tem seu tempo, mas começa pedindo.",
  "historia": "@conta-uma-historia",

  // ...continue colando até chegar na ~1/3 do arquivo...

  // ─────── Vendas, primeiros FAQs de serviço —──────
  "quero-orcamento": "Claro! Me conte o que você precisa (site, app, automação?) e seu WhatsApp pra nossa equipe te chamar.",
  "fazer-site": "Fazemos sim, do mais básico ao mais avançado. Pra começar, diga se é pra negócio ou pessoal.",
  "quero-fazer-app": "Seu app pode ser simples, profissional, integrar com WhatsApp ou ter painel. Me diz sua ideia!",
  "servicos-para-pequenas-empresas": "Atendemos de MEI a multinacional. Site para padaria, app para delivery, automação para escritório... tem solução pra todo mundo.",
  "ajuda-com-instagram": "Criamos e otimizamos perfis, fazemos arte visual e impulsionamento. Seu Insta vai ficar top!",
  "ajuda-com-dividas": "Primeiro passo é organizar, segundo é agir. Se precisar, temos planilhas, dicas e parceiros financeiros para apoiar.",
  "meu-site-foi-hackeado": "Entre em contato urgente! Segurança é prioridade máxima. Podemos auditar e restaurar seu site, se precisar.",

  // ─────── Saúde mental, ansiedade, produtividade —──────
  "ansiedade": "Ansiedade é excesso de futuro. Se concentre no próximo passo, não no resultado final.",
  "procrastinacao": "Procrastinar é normal, mas não deixe virar padrão. Faça uma tarefa pequena agora e desbloqueie seu cérebro.",
  "produtividade": "Produtividade não é fazer tudo, é fazer o que importa. Priorize o que te move pra frente.",
  "sono": "Dormir bem é a base. Se for insônia de ideias, anota tudo num papel, depois relaxa.",
  "acordar-cedo": "Dica: coloque o celular longe da cama e se comprometa com algo importante pela manhã.",

  // ─────── Autoconhecimento, propósito —──────
  "como-descobrir-meu-proposito": "Teste coisas novas, erre sem medo, se envolva em projetos. Seu propósito aparece fazendo.",
  "o-que-e-sucesso": "Sucesso é consequência de pequenas escolhas certas, feitas todos os dias.",
  "de-quem-e-a-culpa": "Culpa imobiliza, responsabilidade transforma. Foque no que pode mudar, não no que já passou.",

  // ─────── Idiomas e internacionalização (exemplo) —──────
  "fala-ingles": "Yes! I can help you in English if you prefer.",
  "speak-english": "@fala-ingles",
  "hablas-espanol": "¡Sí! Puedo ayudarte en español si lo prefieres.",
  "fala-espanhol": "@hablas-espanol",
  "fala-frances": "Je parle un peu de français, mais mon portugais est meilleur! 😅",

  // ─────── Primeiras respostas para erros, confusões e linguagem informal —──────
  "voce-e-humano": "Sou digital, mas fui treinado pra entender gente de verdade.",
  "vc-e-humano": "@voce-e-humano",
  "quem-e-voce": "Eu sou Voltz, sua energia digital para resolver e motivar. Não sou humano, mas quase lá.",
  "tamo-junto": "@show",
  "kkk": "KKK! Sorrir já é um passo pra destravar a criatividade.",
  "rsrs": "@kkk", "haha": "@kkk", "hahaha": "@kkk", "kkkkk": "@kkk",

  // ─────── Palavrões e desabafo leve —──────
  "porra": "Calma, guerreiro! Energia pesada vira energia produtiva se canalizar pro projeto certo.",
  "caralho": "@porra",
  "bosta": "Se a vida tá uma bosta, bora fertilizar essa terra e fazer brotar ideia nova.",
  "merda": "@bosta",
  "foda": "O importante é ser foda na vida real, não só nas palavras. Vamos pra ação?",
  "cacete": "Desabafo faz parte, mas agora bora pensar no próximo passo.",
  "putz": "Putz! Problemas aparecem, mas juntos resolvemos um de cada vez.",
  "droga": "Respira, pensa e tenta de novo. Persistência é maior que azar.",

  // ─────── Sugestão de menu automático para usuários indecisos —──────
  "menu": "Escolha uma opção ou digite sua dúvida:\n• Serviços\n• Orçamento\n• Motivação\n• Equipe\n• Suporte\n• Piada\n• Fale com humano",

  // ─────── Tecnologia, dúvidas técnicas, cotidiano digital ───────
  "como-fazer-um-site": "O segredo de um bom site é simplicidade, velocidade e autenticidade. Podemos fazer pra você ou te guiar no processo!",
  "como-criar-um-site-gratis": "Existem plataformas como Wix, WordPress e Google Sites. Mas se quiser um site realmente seu, fale comigo para um orçamento acessível.",
  "site-responsivo": "Sim, todos os sites da Imperial Volt funcionam perfeitamente em celular, tablet e computador.",
  "o-que-e-seo": "SEO é a otimização para motores de busca, ajudando seu site a ser encontrado no Google.",
  "meu-site-nao-aparece-no-google": "Podemos analisar e sugerir melhorias de SEO. Já indexou seu site no Google Search Console?",
  "email-profissional": "Um e-mail com seu domínio passa mais confiança. Configuramos @seudominio.com para você.",
  "meu-email-nao-recebe": "Verifique spam e configurações. Se continuar, podemos revisar o DNS ou migrar sua hospedagem.",
  "como-integrar-whatsapp-no-site": "É possível adicionar botão, link direto ou chat automatizado. Me diga seu objetivo que eu faço a melhor solução.",
  "pagamento-online": "Configuramos pagamentos com cartão, Pix, boleto, Mercado Pago, PayPal e mais. Seu site pronto para vender online.",
  "meu-site-esta-lento": "Sites lentos perdem clientes. Podemos otimizar imagens, scripts e hospedagem para turbinar sua página.",
  "o-que-e-landing-page": "Landing page é uma página criada para converter visitantes em clientes. Ideal para campanhas de venda rápida ou captação de contatos.",
  "pixel-facebook": "Instalamos pixel do Facebook e Google Analytics para rastrear visitantes e melhorar campanhas.",
  "blog": "Criamos blogs, otimizamos textos e ensinamos você a manter sua página atualizada.",
  "o-que-e-api": "API é uma ponte que conecta sistemas diferentes. Integramos seu sistema com ERPs, WhatsApp, automações e muito mais.",
  "automatizar-tarefas": "Automatizar poupa tempo e dinheiro! Podemos criar robôs para planilhas, e-mails, Instagram e qualquer processo digital.",
  "como-escolher-hospedagem": "Vai depender do seu projeto. Sites leves podem usar Hostinger, Locaweb ou Umbler. Projetos robustos, AWS, Google Cloud ou DigitalOcean.",
  "backup-site": "Fazemos backup automático e seguro. Assim você nunca perde seus dados!",
  "ssl": "Todo site precisa de SSL (cadeado de segurança). Instalamos e renovamos pra você sem custo extra em projetos novos.",
  "como-fazer-um-app": "App pode ser nativo, híbrido ou web. Fale sua ideia que eu explico o melhor caminho (e custo-benefício!).",
  "como-publicar-app-na-playstore": "Cuidamos de todo o processo de publicação na Google Play, da criação à aprovação.",
  "app-para-whatsapp": "Desenvolvemos bots, respostas automáticas e apps integrados com WhatsApp para atendimento, vendas ou delivery.",
  "o-que-e-nfc": "NFC permite comunicação por aproximação, usado em cartões, pagamentos e automação. Sabia que dá pra integrar com Arduino?",
  "arduino": "Automação, robótica, controle de dispositivos, sensores... Com Arduino, seu projeto vira realidade.",
  "raspberry": "Mini computador de bolso! Serve para automação residencial, servidores, central de mídia, câmera de segurança e mais.",
  "como-fazer-um-bot": "Bots podem automatizar atendimento, vendas e tarefas repetitivas. Me fale sua ideia e eu mostro exemplos práticos.",
  "ai": "Sim, inteligência artificial já está em tudo: chatbots, recomendação de produtos, filtros de foto. E pode turbinar seu negócio!",
  "o-que-e-cloud": "Cloud é usar servidores online para guardar, processar ou rodar sistemas. Mais seguro, escalável e fácil de manter.",
  "computador-lento": "Limpe arquivos desnecessários, desinstale programas pesados e veja se não há vírus. Precisa de um script de limpeza? Só pedir!",
  "formatar-pc": "Posso te orientar no passo a passo para não perder arquivos e fazer tudo seguro.",
  "meu-celular-nao-liga": "Tente carregar por outro cabo, forçar reinício. Se não resolver, pode ser bateria ou hardware — procure um técnico de confiança.",
  "android-travado": "Reinicie o aparelho. Se persistir, podemos ver apps em segundo plano ou necessidade de atualização.",
  "iphone-travado": "Tente forçar reinício segurando Power+Home. Persistindo, pode ser necessário restaurar pelo iTunes.",
  "senha-wifi": "Por segurança, não forneço senhas sem autorização. Se for sua, acesse o roteador ou peça ao responsável.",
  "recuperar-arquivos-apagados": "Parou de usar o dispositivo? Existem programas como Recuva. Se for SSD, as chances diminuem. Sempre faça backup!",
  "impressora-nao-imprime": "Verifique cabos, drivers, papel e tinta. Se for Wi-Fi, tente reinstalar ou conectar direto via USB.",
  "erro-de-janela": "Se puder, envie o erro exato. Quanto mais detalhe, melhor posso ajudar.",

  // ...continue colando até chegar em ~2/3 do arquivo...

  // ─────── Fallback para perguntas não mapeadas ───────
  "nao-entendi": "Hmm... não encontrei uma resposta exata para isso. Talvez você queira saber sobre:\n• Serviços\n• Formas de pagamento\n• Equipe\n• Início do projeto\n\nPode tentar reformular ou clicar em uma dessas opções!",

  // ─────── SUGESTÕES EXTRAS DE BOTÕES RÁPIDOS NO CHAT ───────
  "_sugestoes": [
    "serviços",
    "pagamento",
    "equipe",
    "como começar",
    "quanto custa",
    "prazo",
    "whatsapp",
    "promoções",
    "voltz",
    "contato"
  ]
};

/* ───────── UTILITÁRIOS ───────── */
function normalizar(str) {
  return str.normalize('NFD')
            .replace(/[\u0300-\u036f]/g,'')
            .replace(/[^\w\s-]/g,'')
            .trim()
            .replace(/\s+/g,'-')
            .toLowerCase();
}
function obterResposta(p){
  const k = normalizar(p);
  let r  = respostas[k];
  if(typeof r==='string' && r.startsWith('@')){
    r = respostas[r.slice(1)] || respostas['nao-entendi'];
  }
  return r || respostas['nao-entendi'];
}

/* ───────── DOM HELPERS ───────── */
const logEl = () => document.getElementById('chat-log');
function addMsg(t,c){
  const d=document.createElement('div');d.className=c;d.textContent=t;
  logEl().appendChild(d);logEl().scrollTop=logEl().scrollHeight;
}
function mostrarSugestoes(){
  const w=document.createElement('div');w.className='sugestoes';
  respostas._sugestoes.forEach(it=>{
    const b=document.createElement('button');b.textContent=it;b.onclick=()=>enviar(it);w.appendChild(b);
  });
  logEl().appendChild(w);logEl().scrollTop=logEl().scrollHeight;
}

/* ───────── ENVIO ───────── */
function enviar(q){
  addMsg('🗨️ '+q,'user-msg');
  const r=obterResposta(q);
  addMsg('🤖 '+r,'bot-msg');
  if(r===respostas['nao-entendi']) mostrarSugestoes();
}

/* ───────── BOOT ───────── */
document.addEventListener('DOMContentLoaded',()=>{
  const toggle=document.getElementById('chatbot-toggle');
  const win   =document.getElementById('chatbot-window');
  const close =document.getElementById('chat-close');
  const input =document.getElementById('chat-input');

  toggle.onclick=()=>{win.classList.remove('hidden');input.focus();};
  close.onclick =()=>win.classList.add('hidden');

  addMsg('🤖 Olá! Sou o Voltz-Bot ⚡. Como posso ajudar?','bot-msg');

  input.addEventListener('keydown',e=>{
    if(e.key==='Enter'&&input.value.trim()){
      enviar(input.value.trim());input.value='';
    }
  });
});
