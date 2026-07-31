/* Imperial Volt — assistente comercial guiado (baseado em regras, sem IA e sem API paga) */
import { carregarDados, unificarCategorias, precoFormatado } from "../src/js/data.js";
import { montarMensagem, linkWhatsApp } from "../src/js/whatsapp.js";

const $ = (s, elx = document) => elx.querySelector(s);

const RESPOSTA_SIGILO =
  "Algumas soluções são desenvolvidas de forma personalizada conforme a necessidade de cada cliente. " +
  "Para entender seu projeto e apresentar uma proposta adequada, fale com nosso atendimento.";

const PALAVRAS_SIGILO = [
  "patente", "proprietári", "tecnologia própria", "tecnologia interna",
  "segredo", "sigilo", "sigiloso", "protocolo interno", "funciona por dentro",
  "funciona internamente", "código fonte interno", "arquitetura interna",
  "projeto principal", "produto secreto", "como funciona o chip por dentro",
  "formato de dados interno", "modo offline exclusivo", "diferencial secreto"
];

const state = {
  booted: false,
  dados: null,
  categorias: null,
  contexto: null, // { tipo: 'categoria'|'faq', categoriaId, item }
};

function now() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function addMsg(text, who) {
  const body = $("#chatBody");
  if (!body) return;
  const div = document.createElement("div");
  div.className = "msg " + (who === "me" ? "msg--me" : "msg--bot");
  div.innerHTML = `<div>${escapeHtml(text).replaceAll("\n", "<br>")}</div><small>${now()}</small>`;
  body.appendChild(div);
  body.scrollTop = body.scrollHeight;
  return div;
}

function addOpcoes(opcoes) {
  const body = $("#chatBody");
  if (!body) return;
  const wrap = document.createElement("div");
  wrap.className = "msg msg--bot msg--opcoes";
  opcoes.forEach((op) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chatOpcao";
    b.textContent = op.rotulo;
    b.addEventListener("click", () => {
      addMsg(op.rotulo, "me");
      op.acao();
    });
    wrap.appendChild(b);
  });
  body.appendChild(wrap);
  body.scrollTop = body.scrollHeight;
}

function opcaoMenuPrincipal() {
  return [
    { id: "sites", rotulo: "🌐 Sites e páginas" },
    { id: "software", rotulo: "⚙️ Apps, sistemas e automação" },
    { id: "impressao-3d", rotulo: "🧊 Impressão 3D" },
    { id: "nfc", rotulo: "📶 Tags e chaveiros NFC" },
    { id: "kits-revenda", rotulo: "📦 Kits para revendedores" },
    { id: "marcas", rotulo: "📝 Registro de marca" },
    { id: "faq", rotulo: "❓ Perguntas frequentes" },
    { id: "whats", rotulo: "💬 Falar direto no WhatsApp" }
  ];
}

function mostrarMenuPrincipal(mensagem) {
  state.contexto = null;
  addMsg(mensagem || "Sobre o que você quer falar?", "bot");
  addOpcoes(opcaoMenuPrincipal().map((op) => ({
    rotulo: op.rotulo,
    acao: () => tratarMenuPrincipal(op.id)
  })));
}

function tratarMenuPrincipal(id) {
  if (id === "faq") return mostrarFaq();
  if (id === "whats") return abrirWhatsGeral();
  mostrarCategoria(id);
}

function mostrarCategoria(categoriaId) {
  const cat = state.categorias.find((c) => c.id === categoriaId);
  if (!cat) return mostrarMenuPrincipal();

  state.contexto = { tipo: "categoria", categoriaId };
  addMsg(`${cat.nome}. Estes são os itens disponíveis:`, "bot");
  addOpcoes(cat.itens.map((item) => ({
    rotulo: `${item.nome} — ${precoFormatado(item)}`,
    acao: () => mostrarItem(cat, item)
  })).concat([
    { rotulo: "⬅ Voltar ao menu", acao: () => mostrarMenuPrincipal() }
  ]));
}

function mostrarItem(cat, item) {
  state.contexto = { tipo: "categoria", categoriaId: cat.id, item };

  const linhas = [item.descricao || "", "Valor: " + precoFormatado(item)];
  if (item.inclui) linhas.push("Inclui: " + item.inclui.join(", "));
  if (item.prazoEstimadoDiasUteis) {
    linhas.push(`Prazo estimado: ${item.prazoEstimadoDiasUteis.minimo}–${item.prazoEstimadoDiasUteis.maximo} dias úteis`);
  }
  if (cat.id === "nfc" && item.faixas) {
    linhas.push("Quantidades: " + item.faixas.map((f) => `${f.quantidade} un (${precoFormatado({ preco: f.valorUnitario })}/un)`).join(" · "));
  }
  addMsg(linhas.filter(Boolean).join("\n"), "bot");

  addOpcoes([
    { rotulo: "💬 Quero orçamento deste item", acao: () => abrirWhatsItem(cat, item) },
    { rotulo: "⬅ Ver outros itens", acao: () => mostrarCategoria(cat.id) },
    { rotulo: "🏠 Menu principal", acao: () => mostrarMenuPrincipal() }
  ]);
}

function abrirWhatsItem(cat, item) {
  const msg = montarMensagem({
    produto: item.nome,
    valor: precoFormatado(item),
    origem: "Chatbot — " + cat.nome
  });
  window.open(linkWhatsApp(msg), "_blank", "noopener");
  addMsg("Abri o WhatsApp com sua solicitação preenchida. Alguma outra dúvida?", "bot");
  addOpcoes([
    { rotulo: "🏠 Menu principal", acao: () => mostrarMenuPrincipal() }
  ]);
}

function abrirWhatsGeral() {
  const msg = montarMensagem({ origem: "Chatbot — atendimento direto" });
  window.open(linkWhatsApp(msg), "_blank", "noopener");
  addMsg("Abri o WhatsApp para você falar direto com o atendimento.", "bot");
  addOpcoes([{ rotulo: "🏠 Menu principal", acao: () => mostrarMenuPrincipal() }]);
}

function mostrarFaq() {
  state.contexto = { tipo: "faq" };
  const categoriasFaq = state.dados.faq?.categorias || [];
  addMsg("Escolha um tema de dúvida frequente:", "bot");
  addOpcoes(categoriasFaq.map((c) => ({
    rotulo: c.nome,
    acao: () => mostrarFaqCategoria(c)
  })).concat([{ rotulo: "🏠 Menu principal", acao: () => mostrarMenuPrincipal() }]));
}

function mostrarFaqCategoria(catFaq) {
  catFaq.perguntas.forEach((p) => addMsg(p.pergunta + "\n" + p.resposta, "bot"));
  addOpcoes([
    { rotulo: "⬅ Outros temas", acao: () => mostrarFaq() },
    { rotulo: "🏠 Menu principal", acao: () => mostrarMenuPrincipal() }
  ]);
}

function contemPalavraSigilo(texto) {
  const t = texto.toLowerCase();
  return PALAVRAS_SIGILO.some((p) => t.includes(p));
}

function rotearTexto(textoOriginal) {
  const t = textoOriginal.toLowerCase();

  if (contemPalavraSigilo(t)) {
    addMsg(RESPOSTA_SIGILO, "bot");
    addOpcoes([{ rotulo: "💬 Falar com atendimento", acao: () => abrirWhatsGeral() }, { rotulo: "🏠 Menu principal", acao: () => mostrarMenuPrincipal() }]);
    return;
  }

  if (/reiniciar|recome|menu/.test(t)) return mostrarMenuPrincipal();
  if (/voltar/.test(t) && state.contexto?.tipo === "categoria") return mostrarCategoria(state.contexto.categoriaId);
  if (/whats|humano|atendente/.test(t)) return abrirWhatsGeral();
  if (/d[uú]vida|faq|pergunta/.test(t)) return mostrarFaq();

  if (/site|landing|p[aá]gina/.test(t)) return mostrarCategoria("sites");
  if (/sistema|painel|app|aplicativo|automa[cç][aã]o|script/.test(t)) return mostrarCategoria("software");
  if (/impress|3d|pla/.test(t)) return mostrarCategoria("impressao-3d");
  if (/nfc|tag|chaveiro/.test(t)) return mostrarCategoria("nfc");
  if (/revend|kit/.test(t)) return mostrarCategoria("kits-revenda");
  if (/marca|inpi|registro/.test(t)) return mostrarCategoria("marcas");
  if (/pre[cç]o|valor|quanto custa/.test(t)) {
    addMsg("Os valores aparecem em cada produto ou serviço. Sobre qual categoria você quer saber o preço?", "bot");
    return addOpcoes(opcaoMenuPrincipal().slice(0, 6).map((op) => ({ rotulo: op.rotulo, acao: () => tratarMenuPrincipal(op.id) })));
  }

  addMsg("Não tenho certeza se entendi. Escolha uma das opções abaixo ou digite de outro jeito.", "bot");
  addOpcoes(opcaoMenuPrincipal().map((op) => ({ rotulo: op.rotulo, acao: () => tratarMenuPrincipal(op.id) })));
}

function bind() {
  const form = $("#chatForm");
  const inp = $("#chatInput");
  if (!form || !inp) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = inp.value.trim();
    if (!v) return;
    inp.value = "";
    addMsg(v, "me");
    rotearTexto(v);
  });
}

async function boot() {
  if (state.booted) return;
  state.booted = true;

  bind();
  state.dados = await carregarDados();
  state.categorias = unificarCategorias(state.dados);

  addMsg(
    "Olá! Este é o atendimento guiado da Imperial Volt. Posso te ajudar a conhecer produtos e serviços, tirar dúvidas frequentes e montar sua solicitação para o WhatsApp.",
    "bot"
  );
  addOpcoes(opcaoMenuPrincipal().map((op) => ({ rotulo: op.rotulo, acao: () => tratarMenuPrincipal(op.id) })));
}

function focus() {
  const inp = $("#chatInput");
  if (inp) inp.focus();
}

window.IV_CHAT = { boot, focus };
