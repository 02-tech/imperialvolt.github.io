/* Inicializacao da experiencia comercial publica da Imperial Volt. */
import { carregarDados, categoriasDeServicos, unificarCategorias } from "./data.js";
import { linkWhatsApp, montarMensagem } from "./whatsapp.js";
import { iniciarPedido, abrirAba, abrirPainel, adicionar, resumoParaChat } from "./pedido.js?v=20261004-vitrine";
import { iniciarNavegacao } from "./navegacao.js?v=20261004-vitrine";

const $ = (seletor, raiz = document) => raiz.querySelector(seletor);
const CHAT_AUTO_CLOSE_MS = 5000;
const CHAT_ACTIVE_CLOSE_MS = 18000;

function criar(tag, className, texto) {
  const elemento = document.createElement(tag);
  if (className) elemento.className = className;
  if (texto != null) elemento.textContent = texto;
  return elemento;
}

function setYear() {
  const ano = $("#year");
  if (ano) ano.textContent = String(new Date().getFullYear());
}

function setupMenu() {
  const botao = $("#menuBtn");
  const menu = $("#mobileNav");
  if (!botao || !menu) return;

  const fechar = () => {
    menu.hidden = true;
    botao.setAttribute("aria-expanded", "false");
  };
  botao.addEventListener("click", () => {
    const aberto = !menu.hidden;
    menu.hidden = aberto;
    botao.setAttribute("aria-expanded", String(!aberto));
  });
  menu.addEventListener("click", (evento) => {
    if (evento.target.closest("a")) fechar();
  });
}

function setupReveal() {
  const elementos = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    elementos.forEach((elemento) => elemento.classList.add("is-visible"));
    return;
  }
  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) return;
      entrada.target.classList.add("is-visible");
      observador.unobserve(entrada.target);
    });
  }, { threshold: 0.12 });
  elementos.forEach((elemento) => observador.observe(elemento));
}

function setupChat() {
  const fab = $("#chatFab");
  const caixa = $("#ivChat");
  const fecharBotao = $("#chatClose");
  if (!fab || !caixa || !fecharBotao) return;

  let temporizador;
  let conversaAtiva = false;
  const limparTimer = () => window.clearTimeout(temporizador);
  const fechar = () => {
    limparTimer();
    caixa.hidden = true;
    fab.setAttribute("aria-expanded", "false");
  };
  const reiniciarTimer = (interacao = true) => {
    if (caixa.hidden) return;
    if (interacao) conversaAtiva = true;
    limparTimer();
    temporizador = window.setTimeout(fechar, conversaAtiva ? CHAT_ACTIVE_CLOSE_MS : CHAT_AUTO_CLOSE_MS);
  };
  const abrir = () => {
    conversaAtiva = false;
    caixa.hidden = false;
    fab.setAttribute("aria-expanded", "true");
    window.IV_CHAT?.boot?.();
    window.IV_CHAT?.reset?.();
    reiniciarTimer(false);
  };

  caixa.hidden = true;
  fab.setAttribute("aria-expanded", "false");
  fab.setAttribute("aria-controls", "ivChat");
  const alternar = () => (caixa.hidden ? abrir() : fechar());
  fab.addEventListener("click", alternar);
  fab.addEventListener("keydown", (evento) => {
    if (evento.key !== "Enter" && evento.key !== " ") return;
    evento.preventDefault();
    alternar();
  });
  fecharBotao.addEventListener("click", (evento) => {
    evento.stopPropagation();
    fechar();
  });
  caixa.addEventListener("pointerdown", (evento) => {
    if (!evento.target.closest("#chatClose")) reiniciarTimer(true);
  });
  caixa.addEventListener("keydown", () => reiniciarTimer(true));
  document.addEventListener("pointerdown", (evento) => {
    if (!caixa.hidden && !caixa.contains(evento.target) && !fab.contains(evento.target)) fechar();
  });
  window.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") fechar();
  });

  window.ImperialVoltApp = {
    ...(window.ImperialVoltApp || {}),
    abrirChat: abrir,
    fecharChat: fechar,
    reiniciarChat: () => reiniciarTimer(true),
    marcarInteracao: () => reiniciarTimer(true)
  };
}

function renderFaq(faq) {
  const alvo = $("#listaFaq");
  if (!alvo || !faq?.categorias) return;
  alvo.replaceChildren();
  faq.categorias.forEach((categoria) => {
    categoria.perguntas.forEach((pergunta) => {
      const detalhes = criar("details", "faq-item");
      detalhes.append(criar("summary", "", pergunta.pergunta), criar("p", "", pergunta.resposta));
      alvo.appendChild(detalhes);
    });
  });
}

function dataBrasil(iso) {
  const [ano, mes, dia] = String(iso || "").split("-");
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : "data não informada";
}

function renderProvaSocial(dados) {
  const alvo = $("#provaSocial");
  if (!alvo) return;
  alvo.replaceChildren();
  const google = dados.publico?.google;
  const avaliacoes = dados.avaliacoes?.avaliacoes || [];

  if (google?.notaCapturada != null) {
    alvo.appendChild(criar("strong", "proof-card__score", `${String(google.notaCapturada).replace(".", ",")} ★`));
    alvo.appendChild(criar("p", "", `${google.quantidadeAvaliacoesCapturada} avaliações no Google. Informação capturada em ${dataBrasil(google.dataCaptura)}, sem atualização automática.`));
  }

  if (avaliacoes.length) {
    const lista = criar("div", "review-list");
    avaliacoes.forEach((avaliacao) => {
      const card = criar("article", "review-card");
      const cabecalho = criar("div", "review-card__head");
      cabecalho.append(criar("strong", "", avaliacao.nome), criar("span", "", "★★★★★"));
      const comentario = criar("p", "", avaliacao.comentario);
      comentario.classList.add("review-card__comment");
      const resposta = criar("div", "review-card__reply");
      resposta.append(criar("small", "", "Resposta da Imperial Volt"), criar("p", "", avaliacao.respostaEmpresa));
      card.append(cabecalho, comentario, resposta);
      lista.appendChild(card);
    });
    alvo.appendChild(lista);
  }

  if (google?.linkAvaliacao) {
    const link = criar("a", "button button--ink button--small", "Ver todas avaliações");
    link.href = google.linkAvaliacao;
    link.target = "_blank";
    link.rel = "noopener";
    alvo.appendChild(link);
  }
}

function renderConversionStrip(dados) {
  const google = dados.publico?.google;
  const score = $("#trustGoogleScore");
  const count = $("#trustGoogleCount");
  const link = $("#trustGoogleLink");
  if (score && google?.notaCapturada != null) {
    score.textContent = String(google.notaCapturada).replace(".", ",");
  }
  if (count && google?.quantidadeAvaliacoesCapturada != null) {
    count.textContent = `${google.quantidadeAvaliacoesCapturada} avaliações no Google`;
  }
  if (link && google?.linkAvaliacao) {
    link.href = google.linkAvaliacao;
  }
}

function preencherContato(publico) {
  const empresa = publico?.empresa;
  if (!empresa) return;
  const whats = linkWhatsApp(montarMensagem({ origem: "Site institucional" }));
  ["#heroWhats", "#whatsMain", "#whatsContato", "#whatsFab"].forEach((seletor) => {
    const link = $(seletor);
    if (link) link.href = whats;
  });
  const endereco = $("#contactAddress");
  if (endereco) {
    endereco.textContent = empresa.endereco;
    endereco.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(empresa.endereco)}`;
  }
  const contato = $("#whatsContato");
  if (contato) contato.textContent = empresa.telefoneExibicao;
  const email = $("#contactEmail");
  if (email) {
    email.textContent = empresa.emailComercial;
    email.href = `mailto:${empresa.emailComercial}`;
  }
  const instagram = $("#contactInstagram");
  if (instagram) instagram.href = empresa.instagram;
  const instagramLink = $("#instagramLink");
  if (instagramLink) instagramLink.href = empresa.instagram;
  const instagramDescricao = $("#instagramDescription");
  if (instagramDescricao && empresa.instagramDescricao) instagramDescricao.textContent = empresa.instagramDescricao;
  const cidade = $("#footerCity");
  if (cidade) cidade.textContent = `${empresa.cidade} - ${empresa.estado}`;
}


async function boot() {
  setYear();
  setupMenu();
  iniciarNavegacao();
  setupChat();
  setupReveal();
  window.IV_CHAT?.boot?.();

  try {
    const dados = await carregarDados();
    const categorias = unificarCategorias(dados);
    // catálogo e pedido únicos: presentes e serviços no mesmo formato, um só pedido
    iniciarPedido(dados.presentes, categoriasDeServicos(categorias));
    // API usada pelo Voltz-Bot (mantida; agora opera o pedido único)
    window.ImperialVoltApp = {
      ...(window.ImperialVoltApp || {}),
      selecionarProduto: ({ categoriaId, itemId } = {}) => {
        if (itemId && adicionar(itemId, { silencioso: true })) { abrirPainel(); return; }
        if (categoriaId) abrirAba(categoriaId, { rolar: true });
      },
      abrirPedido: abrirPainel,
      obterOrcamento: () => resumoParaChat(),
      limparOrcamento: () => window.IVPedido?.limpar()
    };
    renderFaq(dados.faq);
    renderConversionStrip(dados);
    renderProvaSocial(dados);
    preencherContato(dados.publico);
  } catch (erro) {
    console.error("[Imperial Volt] Falha ao iniciar o site", erro);
    const destino = $("#catalogoGrade");
    if (destino) destino.textContent = "Não foi possível carregar as opções agora. Fale conosco pelo WhatsApp.";
  }
}

boot();

