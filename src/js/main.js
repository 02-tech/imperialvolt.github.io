/* Inicializacao da experiencia comercial publica da Imperial Volt. */
import { carregarDados, categoriasDeCatalogo, categoriasDeServicos, formatarMoeda, prazoFormatado, precoFormatado, unificarCategorias } from "./data.js";
import { renderCatalogo, renderDestaques } from "./catalogo.js";
import { iniciarOrcamento } from "./orcamento.js";
import { linkWhatsApp, montarMensagem } from "./whatsapp.js";

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

function renderServicosComerciais(servicoCategorias, selecionar) {
  const categorias = (servicoCategorias || []).filter((categoria) => categoria.itens?.length).map((categoria) => ({ ...categoria, servicos: categoria.itens }));
  const tabsAlvo = $("#serviceTabs");
  const ofertasAlvo = $("#serviceOffers") || $("#digitalOffers");
  const comparativoAlvo = $("#siteComparison");
  if (!categorias.length || !ofertasAlvo) return;

  const criarLista = (itens, classe = "digital-offer__list") => {
    const lista = criar("ul", classe);
    (itens || []).slice(0, 5).forEach((item) => lista.appendChild(criar("li", "", item)));
    return lista;
  };

  const renderCategoria = (categoriaId) => {
    const categoria = categorias.find((item) => item.id === categoriaId) || categorias[0];
    if (!categoria) return;
    if (tabsAlvo) {
      tabsAlvo.querySelectorAll("button").forEach((botao) => {
        const ativo = botao.dataset.serviceCategory === categoria.id;
        botao.classList.toggle("is-active", ativo);
        botao.setAttribute("aria-pressed", String(ativo));
      });
    }
    ofertasAlvo.replaceChildren();
    categoria.servicos.forEach((oferta, indice) => {
      const destaque = oferta.id === "site-institucional-estatico" || oferta.id === "sistema-web-painel-administrativo" || oferta.id === "automacao-simples";
      const card = criar("article", `digital-offer${destaque ? " digital-offer--featured" : ""}`);
      const cabecalho = criar("div", "digital-offer__head");
      cabecalho.append(criar("span", "digital-offer__eyebrow", categoria.nome), criar("span", "digital-offer__index", String(indice + 1).padStart(2, "0")));
      const precificacao = criar("div", "digital-offer__pricing");
      precificacao.appendChild(criar("strong", "digital-offer__price", precoFormatado(oferta)));
      if (oferta.precoPix != null) precificacao.appendChild(criar("small", "digital-offer__pix", `Pix integral: ${formatarMoeda(oferta.precoPix)} (-15%)`));
      precificacao.appendChild(criar("small", "digital-offer__deadline", `Prazo estimado: ${prazoFormatado(oferta)}`));
      card.append(cabecalho, criar("h3", "", oferta.nome), precificacao, criar("p", "digital-offer__description", oferta.descricao));
      if (oferta.mensagemComercial) card.appendChild(criar("p", "digital-offer__message", `“${oferta.mensagemComercial}”`));
      if (oferta.idealPara) {
        const indicado = criar("p", "digital-offer__audience");
        indicado.append(criar("strong", "", "Ideal para: "), criar("span", "", oferta.idealPara));
        card.appendChild(indicado);
      }
      if (oferta.quandoUsar) {
        const quando = criar("p", "digital-offer__when");
        quando.append(criar("strong", "", "Quando usar: "), criar("span", "", oferta.quandoUsar));
        card.appendChild(quando);
      }
      card.appendChild(criar("span", "digital-offer__included-label", "Normalmente inclui"));
      card.appendChild(criarLista(oferta.inclui));
      const detalhes = criar("details", "digital-offer__details");
      detalhes.appendChild(criar("summary", "", "Ver limites e custos externos"));
      const detalhesGrid = criar("div", "digital-offer__details-grid");
      const naoNecessario = criar("div", "digital-offer__detail-block digital-offer__detail-block--muted");
      naoNecessario.appendChild(criar("strong", "", "Quando não é necessário"));
      naoNecessario.appendChild(criar("p", "digital-offer__detail-copy", oferta.quandoNaoNecessario || "Quando outra solução menor já resolve o objetivo."));
      const custos = criar("div", "digital-offer__detail-block");
      custos.appendChild(criar("strong", "", "Custos externos"));
      custos.appendChild(criarLista(oferta.custosExternos, "digital-offer__list digital-offer__list--external"));
      detalhesGrid.append(naoNecessario, custos);
      detalhes.appendChild(detalhesGrid);
      card.appendChild(detalhes);
      if (oferta.observacao) card.appendChild(criar("p", "digital-offer__next", oferta.observacao));
      const acao = criar("button", "button button--ink button--small", "Solicitar esta opção");
      acao.type = "button";
      acao.addEventListener("click", () => selecionar({ categoriaId: categoria.id, itemId: oferta.id }));
      card.appendChild(acao);
      ofertasAlvo.appendChild(card);
    });
  };

  if (tabsAlvo) {
    tabsAlvo.replaceChildren();
    categorias.forEach((categoria) => {
      const botao = criar("button", "service-tabs__item", categoria.nome);
      botao.type = "button";
      botao.dataset.serviceCategory = categoria.id;
      botao.setAttribute("aria-pressed", "false");
      botao.addEventListener("click", () => renderCategoria(categoria.id));
      tabsAlvo.appendChild(botao);
    });
  }
  renderCategoria(categorias[0].id);

  if (comparativoAlvo) {
    const todos = categorias.flatMap((categoria) => categoria.servicos);
    const idsComparacao = ["landing-page-estatica", "site-institucional-estatico", "site-institucional-avancado", "site-dinamico-cms", "ecommerce-loja-virtual"];
    comparativoAlvo.replaceChildren();
    idsComparacao.map((id) => todos.find((oferta) => oferta.id === id)).filter(Boolean).forEach((oferta) => {
      const card = criar("article", `digital-compare-card${oferta.id === "site-institucional-estatico" ? " digital-compare-card--featured" : ""}`);
      card.append(criar("span", "digital-compare-card__tag", oferta.id === "site-institucional-estatico" ? "Mais escolhido" : "Formato"));
      card.append(criar("h3", "", oferta.nome), criar("strong", "digital-compare-card__price", precoFormatado(oferta)));
      card.appendChild(criar("small", "digital-compare-card__deadline", `Prazo: ${prazoFormatado(oferta)}`));
      card.appendChild(criar("p", "digital-compare-card__result", oferta.idealPara || oferta.descricao));
      const detalhes = criar("dl", "digital-compare-card__details");
      [["Quando usar", oferta.quandoUsar], ["O que resolve", oferta.descricao]].forEach(([rotulo, valor]) => {
        detalhes.append(criar("dt", "", rotulo), criar("dd", "", valor || "Definido no escopo"));
      });
      card.appendChild(detalhes);
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
    window.ImperialVoltApp = {
      ...(window.ImperialVoltApp || {}),
      selecionarProduto,
      obterOrcamento: () => quote.obterOrcamento(),
      limparOrcamento: () => quote.limpar()
    };
    const catalogo = renderCatalogo(categoriasDeCatalogo(categorias), {
      gridEl: $("#gridCatalogo"),
      filtrosEl: $("#catalogFilters"),
      maisEl: $("#catalogMore"),
      onSelect: selecionarProduto
    });
    renderDestaques(categorias, $("#gridDestaques"), [
      "perfil-empresa-google",
      "landing-page-estatica",
      "tag-nfc-personalizada",
      "apito-morte-asteca",
      "pedido-registro-marca"
    ], selecionarProduto);
    renderCategorias(categoriasDeCatalogo(categorias), (categoriaId) => {
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
    renderServicosComerciais(categoriasDeServicos(categorias), selecionarProduto);
    renderFaq(dados.faq);
    renderConversionStrip(dados);
    renderProvaSocial(dados);
    preencherContato(dados.publico);
  } catch (erro) {
    console.error("[Imperial Volt] Falha ao iniciar o site", erro);
    const destino = $("#quoteBuilder");
    if (destino) destino.textContent = "Não foi possível carregar as opções agora. Fale conosco pelo WhatsApp.";
  }
}

boot();
