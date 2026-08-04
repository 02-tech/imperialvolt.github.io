/* Inicializacao da experiencia comercial publica da Imperial Volt. */
import { carregarDados, precoFormatado, unificarCategorias } from "./data.js";
import { renderCatalogo, renderDestaques } from "./catalogo.js";
import { iniciarOrcamento } from "./orcamento.js";
import { linkWhatsApp, montarMensagem } from "./whatsapp.js";

const $ = (seletor, raiz = document) => raiz.querySelector(seletor);
const CHAT_AUTO_CLOSE_MS = 3500;

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
  const limparTimer = () => window.clearTimeout(temporizador);
  const fechar = () => {
    limparTimer();
    caixa.hidden = true;
    fab.setAttribute("aria-expanded", "false");
  };
  const reiniciarTimer = () => {
    if (caixa.hidden) return;
    limparTimer();
    // Small margin keeps the visible time within the promised five seconds.
    temporizador = window.setTimeout(fechar, CHAT_AUTO_CLOSE_MS);
  };
  const abrir = () => {
    caixa.hidden = false;
    fab.setAttribute("aria-expanded", "true");
    window.IV_CHAT?.boot?.();
    window.IV_CHAT?.reset?.();
    reiniciarTimer();
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
    if (!evento.target.closest("#chatClose")) reiniciarTimer();
  });
  caixa.addEventListener("keydown", reiniciarTimer);
  document.addEventListener("pointerdown", (evento) => {
    if (!caixa.hidden && !caixa.contains(evento.target) && !fab.contains(evento.target)) fechar();
  });
  window.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") fechar();
  });

  window.ImperialVoltApp = { ...(window.ImperialVoltApp || {}), abrirChat: abrir, fecharChat: fechar, reiniciarChat: reiniciarTimer };
}

function renderCategorias(categorias, selecionar) {
  const alvo = $("#categoryNav");
  if (!alvo) return;
  alvo.replaceChildren();
  [...categorias, { id: "empresas-revendedores", nome: "Empresas e revendedores", icone: "07" }].forEach((categoria) => {
    const botao = criar("button", "category-nav__item");
    botao.type = "button";
    botao.append(criar("strong", "", categoria.nome), criar("span", "", categoria.icone));
    botao.addEventListener("click", () => selecionar(categoria.id));
    alvo.appendChild(botao);
  });
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

function renderComparativoSites(servicos) {
  const alvo = $("#siteComparison");
  const categoria = servicos?.categorias?.find((item) => item.id === "sites");
  const planos = categoria?.servicos?.filter((item) => item.comparativo) || [];
  if (!alvo || !planos.length) return;

  const recursos = [
    ["Estrutura", "estrutura"],
    ["Design e personalização", "design"],
    ["Captação e contato", "captacao"],
    ["Conteúdo principal", "conteudo"],
    ["Catálogo e filtros", "catalogo"],
    ["Banco de dados e painel", "dados"]
  ];
  const rolagem = criar("div", "site-comparison__scroll");
  const tabela = criar("div", "site-comparison__table");
  tabela.setAttribute("role", "table");

  const cabecalho = criar("div", "site-comparison__row site-comparison__row--head");
  cabecalho.setAttribute("role", "row");
  cabecalho.appendChild(criar("div", "site-comparison__feature", "Recurso"));
  planos.forEach((plano) => {
    const celula = criar("div", "site-comparison__plan");
    celula.setAttribute("role", "columnheader");
    celula.append(criar("strong", "", plano.nome), criar("small", "", precoFormatado(plano)));
    cabecalho.appendChild(celula);
  });
  tabela.appendChild(cabecalho);

  recursos.forEach(([rotulo, chave]) => {
    const linha = criar("div", "site-comparison__row");
    linha.setAttribute("role", "row");
    linha.appendChild(criar("div", "site-comparison__feature", rotulo));
    planos.forEach((plano) => {
      const valor = plano.comparativo[chave] || "Definido no escopo";
      const celula = criar("div", "site-comparison__cell", valor);
      celula.setAttribute("role", "cell");
      if (valor.startsWith("Não")) celula.classList.add("is-excluded");
      if (valor.includes("escopo")) celula.classList.add("is-scoped");
      linha.appendChild(celula);
    });
    tabela.appendChild(linha);
  });

  rolagem.appendChild(tabela);
  alvo.replaceChildren(rolagem);
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

function rolarPara(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function boot() {
  setYear();
  setupMenu();
  setupChat();
  setupReveal();
  window.IV_CHAT?.boot?.();

  try {
    const dados = await carregarDados();
    const categorias = unificarCategorias(dados);
    const quote = iniciarOrcamento({ raiz: $("#quoteBuilder"), categorias, politicas: dados.politicas });
    const selecionarProduto = (selecao) => {
      quote.selecionar(selecao);
      rolarPara("orcamento");
    };
    const catalogo = renderCatalogo(categorias, {
      gridEl: $("#gridCatalogo"),
      filtrosEl: $("#catalogFilters"),
      maisEl: $("#catalogMore"),
      onSelect: selecionarProduto
    });
    renderDestaques(categorias, $("#gridDestaques"), [
      "landing-page-profissional",
      "tag-nfc-personalizada",
      "apito-morte-asteca",
      "pedido-registro-marca"
    ], selecionarProduto);
    renderCategorias(categorias, (categoriaId) => {
      if (categoriaId === "empresas-revendedores") {
        quote.selecionar({ categoriaId });
        rolarPara("orcamento");
        return;
      }
      catalogo.filtrar(categoriaId);
      rolarPara("catalogo");
    });
    document.querySelectorAll("[data-quote-category]").forEach((link) => {
      link.addEventListener("click", () => quote.selecionar({ categoriaId: link.dataset.quoteCategory }));
    });
    renderComparativoSites(dados.servicos);
    renderFaq(dados.faq);
    renderProvaSocial(dados);
    preencherContato(dados.publico);
  } catch (erro) {
    console.error("[Imperial Volt] Falha ao iniciar o site", erro);
    const destino = $("#quoteBuilder");
    if (destino) destino.textContent = "Não foi possível carregar as opções agora. Fale conosco pelo WhatsApp.";
  }
}

boot();
