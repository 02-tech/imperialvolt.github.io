/* Voltz-Bot: atendimento guiado conectado aos dados publicos do site. */
import { carregarDados, formatarMoeda, precoFormatado, unificarCategorias } from "../src/js/data.js";
import { linkWhatsApp, montarMensagem } from "../src/js/whatsapp.js";

const estado = {
  dados: null,
  categorias: [],
  inicializacao: null,
  historico: [],
  opcoes: null
};

const $ = (seletor) => document.querySelector(seletor);

function normalizar(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function encontrarCategoria(id) {
  return estado.categorias.find((categoria) => categoria.id === id);
}

function encontrarItem(itemId, categoriaId) {
  const categoria = categoriaId ? encontrarCategoria(categoriaId) : null;
  const item = categoria?.itens.find((entrada) => entrada.id === itemId);
  if (item) return { categoria, item };

  for (const possivelCategoria of estado.categorias) {
    const possivelItem = possivelCategoria.itens.find((entrada) => entrada.id === itemId);
    if (possivelItem) return { categoria: possivelCategoria, item: possivelItem };
  }
  return { categoria: null, item: null };
}

function adicionarHistorico(tipo, texto) {
  if (texto) estado.historico.push({ tipo, texto });
}

function criarMensagem(tipo, texto) {
  const mensagem = document.createElement("article");
  mensagem.className = `guided-chat__message guided-chat__message--${tipo}`;
  const paragrafo = document.createElement("p");
  paragrafo.textContent = texto;
  mensagem.appendChild(paragrafo);
  return mensagem;
}

function criarEscolha(texto, acao, classe = "") {
  const botao = document.createElement("button");
  botao.type = "button";
  botao.className = `guided-chat__choice${classe ? ` ${classe}` : ""}`;
  botao.textContent = texto;
  botao.addEventListener("click", () => {
    adicionarHistorico("user", texto);
    acao();
    renderizar();
    window.ImperialVoltApp?.reiniciarChat?.();
  });
  return botao;
}

function respostaInicial() {
  return "Olá! Eu sou o Voltz-Bot. Posso mostrar soluções, valores, condições de pagamento e levar você direto ao orçamento.";
}

function opcoesIniciais(alvo) {
  alvo.append(
    criarEscolha("Criar site, sistema ou aplicativo", () => mostrarProjetosDigitais()),
    criarEscolha("Comprar solução física ou NFC", () => mostrarCategoriasFisicas()),
    criarEscolha("Ver preços e desconto no Pix", () => mostrarPrecos()),
    criarEscolha("Ir direto para o orçamento", () => irParaOrcamento()),
    criarEscolha("Perguntas frequentes", () => mostrarFaq()),
    criarEscolha("Falar com a equipe", () => falarNoWhatsApp({ origem: "Voltz-Bot" }))
  );
}

function mostrarProjetosDigitais() {
  adicionarHistorico("assistant", "Claro. Escolha o tipo de projeto e eu mostro o ponto de partida, o que entra no escopo e o próximo passo.");
  const categoria = encontrarCategoria("projetos-digitais");
  estado.opcoes = (categoria?.itens || []).slice(0, 8).map((item) => ({
    texto: item.nome,
    acao: () => mostrarItem("projetos-digitais", item.id)
  }));
  estado.opcoes.push({ texto: "Voltar ao início", acao: iniciarConversa });
}

function mostrarCategoriasFisicas() {
  adicionarHistorico("assistant", "Posso te levar para uma compra do catálogo ou para uma solução sob medida. Escolha uma frente:");
  estado.opcoes = [
    { texto: "Soluções físicas em impressão 3D", acao: () => mostrarCategoria("impressao-3d") },
    { texto: "Tags e chaveiros NFC", acao: () => mostrarCategoria("nfc") },
    { texto: "Empresas e revendedores", acao: () => irParaOrcamento() },
    { texto: "Voltar ao início", acao: iniciarConversa }
  ];
}

function mostrarCategoria(categoriaId) {
  const categoria = encontrarCategoria(categoriaId);
  adicionarHistorico("assistant", categoria?.descricao || "Veja algumas opções disponíveis nesta categoria:");
  estado.opcoes = (categoria?.itens || []).slice(0, 7).map((item) => ({
    texto: `${item.nome} · ${precoFormatado(item)}`,
    acao: () => mostrarItem(categoriaId, item.id)
  }));
  estado.opcoes.push({ texto: "Ir para o catálogo", acao: () => irParaSecao("catalogo") });
  estado.opcoes.push({ texto: "Voltar ao início", acao: iniciarConversa });
}

function mostrarItem(categoriaId, itemId) {
  const { categoria, item } = encontrarItem(itemId, categoriaId);
  if (!item) {
    adicionarHistorico("assistant", "Não encontrei essa opção no catálogo atual. Posso levar você ao orçamento para explicar o que precisa.");
    estado.opcoes = [{ texto: "Ir para o orçamento", acao: irParaOrcamento }, { texto: "Voltar ao início", acao: iniciarConversa }];
    return;
  }

  const linhas = [item.nome, item.descricao, `Valor: ${precoFormatado(item)}.`];
  if (item.precoPix != null) linhas.push(`Pix integral: ${formatarMoeda(item.precoPix)} (-15%).`);
  if (item.recorrenciaMensal != null) linhas.push(`Recorrência: ${formatarMoeda(item.recorrenciaMensal)}/mês, quando contratada.`);
  if (item.inclui?.length) linhas.push(`Inclui: ${item.inclui.slice(0, 3).join("; ")}.`);
  if (item.naoInclui?.length) linhas.push(`Fica fora por padrão: ${item.naoInclui.slice(0, 2).join("; ")}.`);
  adicionarHistorico("assistant", linhas.join("\n"));
  estado.opcoes = [
    { texto: "Selecionar no orçamento", acao: () => irParaOrcamento(categoria?.id, item.id) },
    { texto: "Falar sobre esta opção no WhatsApp", acao: () => falarNoWhatsApp({ produto: item.nome, valor: precoFormatado(item), origem: "Voltz-Bot" }) },
    { texto: "Voltar ao início", acao: iniciarConversa }
  ];
}

function mostrarPrecos() {
  const categoria = encontrarCategoria("projetos-digitais");
  const ids = ["landing-page-estatica", "site-institucional-estatico", "site-dinamico-cms", "web-app-sistema-customizado", "ecommerce-loja-virtual", "aplicativo-android-multiplataforma"];
  const resumo = (categoria?.itens || [])
    .filter((item) => ids.includes(item.id))
    .map((item) => `${item.nome}: ${precoFormatado(item)}`)
    .join("\n");
  adicionarHistorico("assistant", `Aqui estão os valores públicos de referência:\n${resumo}\n\nO Pix integral tem 15% de desconto quando indicado. Custos externos e recorrências só entram quando contratados.`);
  estado.opcoes = [
    { texto: "Comparar planos no site", acao: () => irParaSecao("planos-sites") },
    { texto: "Calcular meu orçamento", acao: irParaOrcamento },
    { texto: "Voltar ao início", acao: iniciarConversa }
  ];
}

function mostrarFaq(perguntaFiltrada = "") {
  const perguntas = (estado.dados?.faq?.categorias || []).flatMap((categoria) => categoria.perguntas || []);
  const termo = normalizar(perguntaFiltrada);
  const encontradas = termo
    ? perguntas.filter((pergunta) => normalizar(`${pergunta.pergunta} ${pergunta.resposta}`).includes(termo)).slice(0, 2)
    : perguntas.slice(0, 5);
  if (!encontradas.length) return encaminharPergunta(perguntaFiltrada);
  adicionarHistorico("assistant", "Encontrei estas respostas no conteúdo oficial do site:");
  encontradas.forEach((pergunta) => adicionarHistorico("assistant", `${pergunta.pergunta}\n${pergunta.resposta}`));
  estado.opcoes = [
    { texto: "Ver todas as perguntas frequentes", acao: () => irParaSecao("faq") },
    { texto: "Voltar ao início", acao: iniciarConversa }
  ];
}

function encaminharPergunta(texto) {
  const pergunta = String(texto || "").trim();
  adicionarHistorico("assistant", "Ainda não tenho uma resposta cadastrada para isso. Posso encaminhar sua pergunta diretamente para a Imperial Volt, sem inventar uma informação.");
  estado.opcoes = [
    { texto: "Enviar pergunta pelo WhatsApp", acao: () => falarNoWhatsApp({ observacoes: pergunta, origem: "Pergunta não encontrada no Voltz-Bot" }) },
    { texto: "Voltar ao início", acao: iniciarConversa }
  ];
}

function interpretarEntrada(texto) {
  const termo = normalizar(texto);
  if (!termo) return;
  adicionarHistorico("user", texto);
  if (/(pix|preco|valor|pagamento|parcel)/.test(termo)) return mostrarPrecos();
  if (/(aplicativo|app|android|ios|mobile)/.test(termo)) return mostrarItem("projetos-digitais", "aplicativo-android-multiplataforma");
  if (/(sistema|web app|painel|banco de dados|login)/.test(termo)) return mostrarItem("projetos-digitais", "web-app-sistema-customizado");
  if (/(landing|one page)/.test(termo)) return mostrarItem("projetos-digitais", "landing-page-estatica");
  if (/(institucional)/.test(termo)) return mostrarItem("projetos-digitais", "site-institucional-estatico");
  if (/(ecommerce|e-commerce|loja virtual)/.test(termo)) return mostrarItem("projetos-digitais", "ecommerce-loja-virtual");
  if (/(site|pagina)/.test(termo)) return mostrarProjetosDigitais();
  if (/(3d|impressao|peca|reposicao|adaptacao)/.test(termo)) return mostrarCategoria("impressao-3d");
  if (/(nfc|tag|chaveiro)/.test(termo)) return mostrarCategoria("nfc");
  if (/(faq|duvida|dominio|vps|loja|publicar|manutencao|orcamento)/.test(termo)) return mostrarFaq(termo);
  encaminharPergunta(texto);
}

function irParaSecao(id) {
  window.ImperialVoltApp?.fecharChat?.();
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function irParaOrcamento(categoriaId, itemId) {
  if (categoriaId && itemId) window.ImperialVoltApp?.selecionarProduto?.({ categoriaId, itemId });
  else if (categoriaId) window.ImperialVoltApp?.selecionarProduto?.({ categoriaId });
  irParaSecao("orcamento");
}

function falarNoWhatsApp(campos = {}) {
  window.open(linkWhatsApp(montarMensagem(campos)), "_blank", "noopener");
  window.ImperialVoltApp?.fecharChat?.();
}

function iniciarConversa() {
  estado.historico = [{ tipo: "assistant", texto: respostaInicial() }];
  estado.opcoes = null;
}

function renderizarOpcoes(corpo) {
  const opcoes = document.createElement("div");
  opcoes.className = "guided-chat__choices";
  if (!estado.opcoes) opcoesIniciais(opcoes);
  else estado.opcoes.forEach(({ texto, acao }) => opcoes.appendChild(criarEscolha(texto, acao)));
  corpo.appendChild(opcoes);
}

function renderizarEntrada(corpo) {
  const formulario = document.createElement("form");
  formulario.className = "guided-chat__input";
  formulario.innerHTML = '<input id="chatMessage" name="message" type="text" autocomplete="off" placeholder="Digite uma dúvida..." aria-label="Digite uma dúvida para o Voltz-Bot"><button type="submit" aria-label="Enviar pergunta">Enviar</button>';
  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const campo = formulario.elements.message;
    const texto = campo.value.trim();
    if (!texto) return;
    estado.opcoes = null;
    interpretarEntrada(texto);
    campo.value = "";
    renderizar();
    window.ImperialVoltApp?.reiniciarChat?.();
  });
  corpo.appendChild(formulario);
}

function renderizar() {
  const corpo = $("#chatBody");
  if (!corpo) return;
  corpo.replaceChildren();
  const conversa = document.createElement("div");
  conversa.className = "guided-chat__conversation";
  estado.historico.forEach(({ tipo, texto }) => conversa.appendChild(criarMensagem(tipo, texto)));
  corpo.appendChild(conversa);
  renderizarOpcoes(corpo);
  renderizarEntrada(corpo);
  requestAnimationFrame(() => { corpo.scrollTop = corpo.scrollHeight; });
}

function boot() {
  if (estado.inicializacao) return estado.inicializacao;
  estado.historico = [{ tipo: "assistant", texto: "Só um instante. Estou carregando as opções atualizadas do site." }];
  estado.opcoes = [];
  renderizar();
  estado.inicializacao = carregarDados().then((dados) => {
    estado.dados = dados;
    estado.categorias = unificarCategorias(dados);
    iniciarConversa();
    renderizar();
  }).catch(() => {
    estado.historico = [{ tipo: "assistant", texto: "Não consegui carregar o catálogo agora. Posso encaminhar você diretamente para o WhatsApp." }];
    estado.opcoes = [{ texto: "Falar no WhatsApp", acao: () => falarNoWhatsApp({ origem: "Voltz-Bot" }) }];
    renderizar();
  });
  return estado.inicializacao;
}

function reset() {
  if (!estado.dados) return boot();
  iniciarConversa();
  renderizar();
}

window.IV_CHAT = { boot, reset };
