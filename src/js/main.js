/* Inicializacao da experiencia comercial publica da Imperial Volt. */
import { carregarDados, formatarMoeda, precoFormatado, unificarCategorias } from "./data.js";
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
  [...categorias, { id: "empresas-revendedores", nome: "Empresas e revendedores", icone: "06" }].forEach((categoria) => {
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

function renderProjetosDigitais(servicos, selecionar) {
  const categoria = servicos?.categorias?.find((item) => item.id === "projetos-digitais");
  const ofertas = categoria?.servicos || [];
  const destaqueAlvo = $("#digitalOffers");
  const comparativoAlvo = $("#siteComparison");
  const idsPrincipais = [
    "landing-page-estatica",
    "site-institucional-estatico",
    "site-dinamico-cms",
    "web-app-sistema-customizado",
    "ecommerce-loja-virtual"
  ];
  const ofertasPrincipais = idsPrincipais.map((id) => ofertas.find((oferta) => oferta.id === id)).filter(Boolean);
  if (!categoria || !ofertasPrincipais.length) return;

  if (destaqueAlvo) {
    destaqueAlvo.replaceChildren();
    ofertasPrincipais.forEach((oferta, indice) => {
      const card = criar("article", `digital-offer${oferta.id === "web-app-sistema-customizado" ? " digital-offer--featured" : ""}`);
      const cabecalho = criar("div", "digital-offer__head");
      cabecalho.append(criar("span", "digital-offer__eyebrow", oferta.comparativo?.tag || "Projeto digital"), criar("span", "digital-offer__index", String(indice + 1).padStart(2, "0")));
      const precificacao = criar("div", "digital-offer__pricing");
      precificacao.appendChild(criar("strong", "digital-offer__price", precoFormatado(oferta)));
      if (oferta.precoPix != null) precificacao.appendChild(criar("small", "digital-offer__pix", `Pix integral: ${formatarMoeda(oferta.precoPix)} (-15%)`));
      if (oferta.recorrenciaMensal != null) precificacao.appendChild(criar("small", "digital-offer__recurrence", `Manutenção/hospedagem: ${formatarMoeda(oferta.recorrenciaMensal)}/mês, quando contratada`));
      card.append(cabecalho, criar("h3", "", oferta.nome), precificacao, criar("p", "digital-offer__description", oferta.descricao));
      const lista = criar("ul", "digital-offer__list");
      (oferta.inclui || []).slice(0, 4).forEach((item) => lista.appendChild(criar("li", "", item)));
      card.appendChild(lista);
      const acao = criar("button", "button button--ink button--small", "Ver valor e avançar");
      acao.type = "button";
      acao.addEventListener("click", () => selecionar({ categoriaId: categoria.id, itemId: oferta.id }));
      card.appendChild(acao);
      destaqueAlvo.appendChild(card);
    });
  }

  if (comparativoAlvo) {
    comparativoAlvo.replaceChildren();
    ofertasPrincipais.forEach((oferta) => {
      const card = criar("article", `digital-compare-card${oferta.id === "web-app-sistema-customizado" ? " digital-compare-card--featured" : ""}`);
      card.append(criar("span", "digital-compare-card__tag", oferta.comparativo?.tag || "Projeto digital"));
      card.append(criar("h3", "", oferta.nome), criar("strong", "digital-compare-card__price", precoFormatado(oferta)));
      if (oferta.precoPix != null) card.appendChild(criar("small", "digital-compare-card__pix", `Pix: ${formatarMoeda(oferta.precoPix)}`));
      if (oferta.recorrenciaMensal != null) card.appendChild(criar("small", "digital-compare-card__recurrence", `Recorrência: ${formatarMoeda(oferta.recorrenciaMensal)}/mês`));
      const resultado = oferta.comparativo?.resultado || oferta.descricao;
      card.append(criar("p", "digital-compare-card__result", resultado));
      const detalhes = criar("dl", "digital-compare-card__details");
      [["Estrutura", "estrutura"], ["Dados", "dados"], ["Operação", "operacao"]].forEach(([rotulo, chave]) => {
        detalhes.append(criar("dt", "", rotulo), criar("dd", "", oferta.comparativo?.[chave] || "Definido no escopo"));
      });
      comparativoAlvo.appendChild(card);
    });
  }
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
    const quote = iniciarOrcamento({ raiz: $("#quoteBuilder"), categorias, politicas: dados.politicas, pagamentos: dados.pagamentos });
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
      "landing-page-estatica",
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
    renderProjetosDigitais(dados.servicos, selecionarProduto);
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
