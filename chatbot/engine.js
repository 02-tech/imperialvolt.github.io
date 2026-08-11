/* Voltz-Bot: atendimento guiado conectado aos dados publicos do site. */
import { carregarDados, formatarMoeda, prazoFormatado, precoFormatado, unificarCategorias } from "../src/js/data.js";
import { linkWhatsApp, montarMensagem } from "../src/js/whatsapp.js";

const estado = {
  dados: null,
  categorias: [],
  inicializacao: null,
  historico: [],
  opcoes: null,
  digitando: false,
  memoria: {}
};

const $ = (seletor) => document.querySelector(seletor);
const MEMORIA_KEY = "imperialvolt:voltzbot:session:v1";
const MEMORIA_MAX_MS = 24 * 60 * 60 * 1000;

function storageLocal() {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function persistirMemoria() {
  const storage = storageLocal();
  if (!storage) return;
  try {
    storage.setItem(MEMORIA_KEY, JSON.stringify({
      atualizadoEm: Date.now(),
      historico: estado.historico.slice(-36),
      memoria: estado.memoria
    }));
  } catch {
    // A conversa continua funcionando mesmo se o navegador bloquear o storage.
  }
}

function restaurarMemoria() {
  const storage = storageLocal();
  if (!storage) return false;
  try {
    const salvo = JSON.parse(storage.getItem(MEMORIA_KEY) || "null");
    if (!salvo || Date.now() - Number(salvo.atualizadoEm) > MEMORIA_MAX_MS) {
      storage.removeItem(MEMORIA_KEY);
      return false;
    }
    estado.historico = Array.isArray(salvo.historico) ? salvo.historico.filter((item) => item?.tipo && item?.texto) : [];
    estado.memoria = salvo.memoria && typeof salvo.memoria === "object" ? salvo.memoria : {};
    return estado.historico.length > 0;
  } catch {
    return false;
  }
}

function apagarMemoria() {
  try {
    storageLocal()?.removeItem(MEMORIA_KEY);
  } catch {
    // O estado em memoria ainda pode ser limpo normalmente.
  }
}

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
  if (!texto) return;
  estado.historico.push({ tipo, texto });
  estado.historico = estado.historico.slice(-36);
  persistirMemoria();
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
    estado.digitando = true;
    renderizar();
    window.ImperialVoltApp?.marcarInteracao?.();
    window.setTimeout(() => {
      acao();
      estado.digitando = false;
      renderizar();
      window.ImperialVoltApp?.reiniciarChat?.();
    }, 480);
  });
  return botao;
}

function respostaInicial() {
  return "Olá! Eu sou o Voltz-Bot. Posso mostrar soluções, valores, condições de pagamento e levar você direto ao orçamento.";
}

function opcoesIniciais(alvo) {
  alvo.append(
    criarEscolha("Escolher pelo problema que quero resolver", () => mostrarProjetosDigitais()),
    criarEscolha("Comprar solução física ou NFC", () => mostrarCategoriasFisicas()),
    criarEscolha("Ver preços e desconto no Pix", () => mostrarPrecos()),
    criarEscolha("Ir direto para o orçamento", () => irParaOrcamento()),
    criarEscolha("Perguntas frequentes", () => mostrarFaq()),
    criarEscolha("Falar com a equipe", () => falarNoWhatsApp({ origem: "Voltz-Bot" }))
  );
  if (estado.historico.length > 1) {
    alvo.appendChild(criarEscolha("Limpar conversa e começar de novo", () => iniciarConversa(true)));
  }
}

function mostrarProjetosDigitais() {
  adicionarHistorico("assistant", "Claro. Você não precisa conhecer os termos técnicos. Escolha o resultado que procura e eu mostro as opções, valores e prazos publicados.");
  const categorias = estado.categorias.filter((categoria) => categoria.origem === "servico");
  estado.opcoes = categorias.map((categoria) => ({
    texto: categoria.entradaRotulo || categoria.nome,
    acao: () => mostrarCategoria(categoria.id)
  }));
  estado.opcoes.push({ texto: "Voltar ao início", acao: iniciarConversa });
}

function mostrarCategoriasFisicas() {
  adicionarHistorico("assistant", "Posso te levar para uma compra do catálogo ou para uma solução sob medida. Escolha uma frente:");
  estado.opcoes = [
    { texto: "Soluções sob medida em impressão 3D", acao: () => mostrarCategoria("servicos-impressao-3d") },
    { texto: "Comprar um produto 3D", acao: () => mostrarCategoria("impressao-3d") },
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

  const linhas = [item.nome, item.descricao, `Valor: ${precoFormatado(item)}.`, `Prazo estimado: ${prazoFormatado(item)}.`];
  if (item.precoPix != null) linhas.push(`Pix integral: ${formatarMoeda(item.precoPix)} (-15%).`);
  if (item.recorrenciaMensal != null) linhas.push(`Recorrência: ${formatarMoeda(item.recorrenciaMensal)}/mês, quando contratada.`);
  if (item.mensagemComercial) linhas.push(item.mensagemComercial);
  if (item.idealPara) linhas.push(`Ideal para: ${item.idealPara}`);
  if (item.quandoUsar) linhas.push(`Quando usar: ${item.quandoUsar}`);
  if (item.inclui?.length) linhas.push(`Inclui: ${item.inclui.slice(0, 3).join("; ")}.`);
  if (item.custosExternos?.length) linhas.push(`Custos externos: ${item.custosExternos.slice(0, 2).join("; ")}.`);
  if (item.naoInclui?.length) linhas.push(`Fica fora por padrão: ${item.naoInclui.slice(0, 2).join("; ")}.`);
  estado.memoria.ultimoItem = { categoriaId: categoria?.id || categoriaId, itemId: item.id, nome: item.nome };
  persistirMemoria();
  adicionarHistorico("assistant", linhas.join("\n"));
  estado.opcoes = [
    { texto: "Selecionar no orçamento", acao: () => irParaOrcamento(categoria?.id, item.id) },
    { texto: "Falar sobre esta opção no WhatsApp", acao: () => falarNoWhatsApp({ produto: item.nome, valor: precoFormatado(item), origem: "Voltz-Bot" }) },
    { texto: "Voltar ao início", acao: iniciarConversa }
  ];
}

function mostrarPrecos() {
  const ids = ["perfil-empresa-google", "landing-page-estatica", "site-institucional-estatico", "site-dinamico-cms", "sistema-web-painel-administrativo", "aplicativo-android", "automacao-simples", "assistente-ia", "impressao-arquivo-pronto"];
  const itens = ids.map((id) => encontrarItem(id).item).filter(Boolean);
  const resumo = itens
    .map((item) => `${item.nome}: ${precoFormatado(item)} · ${prazoFormatado(item)}`)
    .join("\n");
  adicionarHistorico("assistant", `Aqui estão alguns valores públicos de referência:\n${resumo}\n\nO site organiza todos os serviços por categoria. O Pix integral tem 15% de desconto quando indicado; custos externos e recorrências ficam separados quando aplicáveis.`);
  estado.opcoes = [
    { texto: "Ver todos os serviços, preços e prazos", acao: () => irParaSecao("servicos-precos") },
    { texto: "Calcular meu orçamento", acao: irParaOrcamento },
    { texto: "Voltar ao início", acao: iniciarConversa }
  ];
}

function mostrarFaq(perguntaFiltrada = "") {
  const perguntas = (estado.dados?.faq?.categorias || []).flatMap((categoria) => categoria.perguntas || []);
  const termo = normalizar(perguntaFiltrada);
  const palavras = termo.split(/\s+/).filter((palavra) => palavra.length > 2 && !["qual", "como", "onde", "para", "uma", "tem", "estao", "esta"].includes(palavra));
  const encontradas = termo
    ? perguntas
      .map((pergunta) => ({ pergunta, pontos: palavras.filter((palavra) => normalizar(`${pergunta.pergunta} ${pergunta.resposta}`).includes(palavra)).length }))
      .filter(({ pontos }) => pontos >= Math.max(1, palavras.length - 1))
      .sort((a, b) => b.pontos - a.pontos)
      .slice(0, 2)
      .map(({ pergunta }) => pergunta)
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

function obterResumoOrcamento() {
  return window.ImperialVoltApp?.obterOrcamento?.() || null;
}

function mostrarOrcamentoAtual() {
  const resumo = obterResumoOrcamento();
  if (!resumo?.item) {
    adicionarHistorico("assistant", "Seu orçamento ainda está vazio. Posso mostrar as opções ou você pode me dizer o que deseja adicionar.");
    estado.opcoes = [
      { texto: "Escolher uma solução", acao: mostrarProjetosDigitais },
      { texto: "Voltar ao início", acao: iniciarConversa }
    ];
    return;
  }
  adicionarHistorico("assistant", `No orçamento está selecionado:\n${resumo.item}\nCategoria: ${resumo.categoria}\nValor atual: ${resumo.valor}\nQuantidade: ${resumo.quantidade || "não se aplica"}.`);
  estado.opcoes = [
    { texto: "Remover do orçamento", acao: limparOrcamentoConversa },
    { texto: "Trocar a solução", acao: mostrarProjetosDigitais },
    { texto: "Abrir orçamento completo", acao: () => irParaSecao("orcamento") }
  ];
}

function limparOrcamentoConversa() {
  window.ImperialVoltApp?.limparOrcamento?.();
  estado.memoria.orcamento = null;
  estado.memoria.ultimoItem = null;
  persistirMemoria();
  adicionarHistorico("assistant", "Removi a seleção do orçamento. Nada foi enviado ou contratado. Escolha outra solução quando quiser.");
  estado.opcoes = [
    { texto: "Escolher uma solução", acao: mostrarProjetosDigitais },
    { texto: "Voltar ao início", acao: iniciarConversa }
  ];
}

function encontrarItemPorTexto(texto) {
  const termo = normalizar(texto);
  const atalhos = [
    ["perfil da empresa", "perfil-empresa-google"],
    ["google maps", "perfil-empresa-google"],
    ["otimizar google", "otimizacao-perfil-google"],
    ["cartao digital", "pagina-links-cartao-digital"],
    ["site institucional", "site-institucional-estatico"],
    ["site avancado", "site-institucional-avancado"],
    ["site completo", "site-institucional-estatico"],
    ["landing", "landing-page-estatica"],
    ["one page", "landing-page-estatica"],
    ["painel", "site-dinamico-cms"],
    ["cms", "site-dinamico-cms"],
    ["web app", "sistema-web-painel-administrativo"],
    ["sistema", "sistema-web-painel-administrativo"],
    ["banco de dados", "sistema-web-painel-administrativo"],
    ["desktop", "aplicativo-desktop-electron"],
    ["electron", "aplicativo-desktop-electron"],
    ["android e ios", "aplicativo-android-ios"],
    ["android", "aplicativo-android"],
    ["iphone", "aplicativo-ios"],
    ["aplicativo", "aplicativo-android"],
    ["app", "aplicativo-android"],
    ["loja virtual", "ecommerce-loja-virtual"],
    ["ecommerce", "ecommerce-loja-virtual"],
    ["automacao", "automacao-simples"],
    ["integracao", "integracao-api"],
    ["pix", "integracao-pagamento"],
    ["pagamento", "integracao-pagamento"],
    ["bot", "bot-atendimento-automatizado"],
    ["ia", "assistente-ia"],
    ["chaveiro", "chaveiro-nfc-personalizado"],
    ["nfc", "tag-nfc-personalizada"],
    ["impressao 3d", "impressao-arquivo-pronto"],
    ["reposicao", "peca-reposicao-personalizada"],
    ["adaptacao", "ajuste-adaptacao-modelo-3d"],
    ["apito", "apito-morte-asteca"]
  ];
  const atalho = atalhos.find(([palavra]) => termo.includes(palavra));
  if (atalho) return encontrarItem(atalho[1]);
  return { categoria: null, item: null };
}

function selecionarPorComando(texto) {
  const { categoria, item } = encontrarItemPorTexto(texto);
  if (!item) return false;
  window.ImperialVoltApp?.selecionarProduto?.({ categoriaId: categoria.id, itemId: item.id });
  estado.memoria.ultimoItem = { categoriaId: categoria.id, itemId: item.id, nome: item.nome };
  estado.memoria.orcamento = item.nome;
  persistirMemoria();
  adicionarHistorico("assistant", `Adicionei ${item.nome} ao orçamento. Você pode pedir para trocar, remover ou abrir o orçamento completo.`);
  estado.opcoes = [
    { texto: "Abrir orçamento completo", acao: () => irParaSecao("orcamento") },
    { texto: "Ver o resumo atual", acao: mostrarOrcamentoAtual },
    { texto: "Remover esta seleção", acao: limparOrcamentoConversa }
  ];
  return true;
}

function tratarComandosDeOrcamento(termo) {
  const falaSobreOrcamento = /(orcamento|pedido|selecao|escolhido|carrinho)/.test(termo)
    || (estado.memoria.orcamento && /(isso|ele|item|selecao|quanto ficou|quanto ta|quanto esta|o que escolhi)/.test(termo));
  if (/(limpar|zerar|remover|tirar|excluir|apagar|cancelar)/.test(termo) && falaSobreOrcamento) {
    limparOrcamentoConversa();
    return true;
  }
  if (/(ver|mostrar|qual|quanto|quanto ficou|resumo|voltar|abrir|o que escolhi)/.test(termo) && falaSobreOrcamento) {
    mostrarOrcamentoAtual();
    return true;
  }
  if (/(adicionar|colocar|trocar|mudar|selecionar|escolher|quero)/.test(termo) && selecionarPorComando(termo)) return true;
  return false;
}

function interpretarEntrada(texto, adicionarUsuario = true) {
  const termo = normalizar(texto);
  if (!termo) return;
  if (adicionarUsuario) adicionarHistorico("user", texto);
  estado.memoria.ultimaPergunta = texto;
  persistirMemoria();
  if (tratarComandosDeOrcamento(termo)) return;
  if (/(pix|preco|valor|pagamento|parcel)/.test(termo)) return mostrarPrecos();
  if (/(perfil|google maps|aparecer no google)/.test(termo)) return mostrarItem("presenca-digital", "perfil-empresa-google");
  if (/(seo|analytics|search console)/.test(termo)) return mostrarItem("servicos-avulsos", termo.includes("seo") ? "seo-inicial" : "analytics-search-console");
  if (/(desktop|electron|computador)/.test(termo)) return mostrarItem("sistemas-aplicativos", "aplicativo-desktop-electron");
  if (/(android.*ios|ios.*android)/.test(termo)) return mostrarItem("sistemas-aplicativos", "aplicativo-android-ios");
  if (/(aplicativo|app|android|ios|iphone|mobile)/.test(termo)) return mostrarItem("sistemas-aplicativos", termo.includes("ios") || termo.includes("iphone") ? "aplicativo-ios" : "aplicativo-android");
  if (/(sistema|web app|painel|banco de dados|login)/.test(termo)) return mostrarItem("sistemas-aplicativos", "sistema-web-painel-administrativo");
  if (/(landing|one page)/.test(termo)) return mostrarItem("projetos-digitais", "landing-page-estatica");
  if (/(institucional)/.test(termo)) return mostrarItem("projetos-digitais", "site-institucional-estatico");
  if (/(ecommerce|e-commerce|loja virtual)/.test(termo)) return mostrarItem("projetos-digitais", "ecommerce-loja-virtual");
  if (/(site|pagina)/.test(termo)) return mostrarProjetosDigitais();
  if (/(3d|impressao|peca|reposicao|adaptacao)/.test(termo)) return mostrarCategoria("servicos-impressao-3d");
  if (/(nfc|tag|chaveiro)/.test(termo)) return mostrarCategoria("nfc");
  if (/(faq|duvida|dominio|vps|loja|publicar|manutencao|orcamento|inpi|taxa)/.test(termo)) return mostrarFaq(termo);
  encaminharPergunta(texto);
}

function irParaSecao(id) {
  window.ImperialVoltApp?.fecharChat?.();
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function irParaOrcamento(categoriaId, itemId) {
  if (categoriaId && itemId) {
    window.ImperialVoltApp?.selecionarProduto?.({ categoriaId, itemId });
    const { categoria, item } = encontrarItem(itemId, categoriaId);
    if (item) {
      estado.memoria.ultimoItem = { categoriaId: categoria?.id || categoriaId, itemId: item.id, nome: item.nome };
      estado.memoria.orcamento = item.nome;
      persistirMemoria();
      adicionarHistorico("assistant", `Selecionei ${item.nome} no orçamento. Você pode revisar os detalhes antes de enviar pelo WhatsApp.`);
    }
  }
  else if (categoriaId) window.ImperialVoltApp?.selecionarProduto?.({ categoriaId });
  irParaSecao("orcamento");
}

function falarNoWhatsApp(campos = {}) {
  window.open(linkWhatsApp(montarMensagem(campos)), "_blank", "noopener");
  window.ImperialVoltApp?.fecharChat?.();
}

function iniciarConversa(novaConversa = false) {
  if (novaConversa) {
    estado.historico = [];
    estado.memoria = {};
    apagarMemoria();
  }
  adicionarHistorico("assistant", estado.historico.length ? "Continuo com você. Escolha um caminho ou me diga o que deseja ajustar." : respostaInicial());
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
  formulario.innerHTML = `<input id="chatMessage" name="message" type="text" autocomplete="off" placeholder="${estado.digitando ? "Aguarde a resposta..." : "Digite uma dúvida..."}" aria-label="Digite uma dúvida para o Voltz-Bot"${estado.digitando ? " disabled" : ""}><button type="submit" aria-label="Enviar pergunta"${estado.digitando ? " disabled" : ""}>Enviar</button>`;
  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const campo = formulario.elements.message;
    const texto = campo.value.trim();
    if (!texto) return;
    estado.opcoes = [];
    estado.digitando = true;
    campo.value = "";
    renderizar();
    window.ImperialVoltApp?.marcarInteracao?.();
    window.setTimeout(() => {
      interpretarEntrada(texto, false);
      estado.digitando = false;
      renderizar();
      window.ImperialVoltApp?.reiniciarChat?.();
    }, 480);
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
  if (estado.digitando) {
    const indicador = document.createElement("article");
    indicador.className = "guided-chat__typing";
    indicador.setAttribute("aria-label", "Voltz-Bot está digitando");
    indicador.innerHTML = "<span></span><span></span><span></span>";
    conversa.appendChild(indicador);
  }
  corpo.appendChild(conversa);
  if (!estado.digitando) renderizarOpcoes(corpo);
  renderizarEntrada(corpo);
  requestAnimationFrame(() => { corpo.scrollTop = corpo.scrollHeight; });
}

function boot() {
  if (estado.inicializacao) return estado.inicializacao;
  estado.historico = [{ tipo: "assistant", texto: "Só um instante. Estou carregando as opções atualizadas do site." }];
  estado.opcoes = [];
  estado.digitando = true;
  renderizar();
  estado.inicializacao = carregarDados().then((dados) => {
    estado.dados = dados;
    estado.categorias = unificarCategorias(dados);
    estado.historico = [];
    estado.memoria = {};
    const voltou = restaurarMemoria();
    if (voltou) adicionarHistorico("assistant", "Encontrei a conversa desta aba. Podemos continuar de onde paramos ou começar de novo.");
    else iniciarConversa();
    estado.digitando = false;
    renderizar();
  }).catch(() => {
    estado.historico = [{ tipo: "assistant", texto: "Não consegui carregar o catálogo agora. Posso encaminhar você diretamente para o WhatsApp." }];
    estado.opcoes = [{ texto: "Falar no WhatsApp", acao: () => falarNoWhatsApp({ origem: "Voltz-Bot" }) }];
    estado.digitando = false;
    renderizar();
  });
  return estado.inicializacao;
}

function reset() {
  if (!estado.dados) return boot();
  estado.digitando = false;
  renderizar();
}

window.IV_CHAT = { boot, reset };
