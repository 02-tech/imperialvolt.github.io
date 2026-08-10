/* Catálogo comercial: filtros leves, variações e encaminhamento contextual. */
import { formatarMoeda, precoFormatado } from "./data.js";
import { abrirWhatsApp } from "./whatsapp.js";

const IMAGENS_VITRINE = {
  "tag-nfc-personalizada": "./src/imagens/vitrine/nfc-tag.svg",
  "chaveiro-nfc-personalizado": "./src/imagens/vitrine/nfc-chaveiro.svg",
  "apito-morte-asteca": "./src/imagens/produtos/apito-morte-asteca.jpg",
  "impressao-sob-medida": "./src/imagens/vitrine/produto-personalizado.svg",
  "projetos-digitais": "./src/imagens/vitrine/sites.svg",
  marcas: "./src/imagens/vitrine/registro-marca.svg",
  manutencao: "./src/imagens/vitrine/automacoes.svg"
};

function criar(tag, className, texto) {
  const elemento = document.createElement(tag);
  if (className) elemento.className = className;
  if (texto != null) elemento.textContent = texto;
  return elemento;
}

function detalhes(titulo, itens) {
  if (!itens?.length) return null;
  const bloco = criar("details", "product-card__details");
  bloco.open = false;
  const summary = criar("summary", "", titulo);
  const lista = criar("ul", "product-card__list");
  itens.forEach((item) => lista.appendChild(criar("li", "", typeof item === "string" ? item : item.nome)));
  bloco.append(summary, lista);
  return bloco;
}

function valorSelecionado(item, faixaIndex = 0) {
  if (!item.faixas?.length) return { valor: precoFormatado(item), quantidade: "1" };
  const faixa = item.faixas[faixaIndex] || item.faixas[0];
  return {
    valor: `${formatarMoeda(faixa.valorTotal)} (${formatarMoeda(faixa.valorUnitario)}/un)`,
    quantidade: String(faixa.quantidade)
  };
}

function imagemDoItem(item, categoria) {
  if (item.id.includes("automacao") || item.id.includes("integracao")) return "./src/imagens/vitrine/automacoes.svg";
  return IMAGENS_VITRINE[item.id] || IMAGENS_VITRINE[categoria.id] || "./src/imagens/vitrine/produto-personalizado.svg";
}

function criarCard(item, categoria, onSelect) {
  const card = criar("article", `product-card product-card--${categoria.id}`);
  card.dataset.categoria = categoria.id;
  card.dataset.item = item.id;

  const visual = criar("div", "product-card__visual");
  const imagem = document.createElement("img");
  imagem.src = imagemDoItem(item, categoria);
  imagem.alt = "";
  imagem.loading = item.id === "apito-morte-asteca" ? "eager" : "lazy";
  imagem.decoding = "async";
  imagem.setAttribute("aria-hidden", "true");
  visual.append(
    imagem,
    criar("span", "product-card__code", categoria.icone),
    criar("span", "product-card__category", categoria.nome)
  );

  const titulo = criar("h3", "", item.nome);
  const preco = criar("p", "product-card__price", precoFormatado(item));
  const descricao = criar("p", "product-card__summary", item.descricao || "Solicite os detalhes para alinharmos a melhor configuração.");
  card.append(visual, titulo, preco, descricao);

  if (item.avisoPreco) {
    card.appendChild(criar("p", "product-card__notice", item.avisoPreco));
  }

  if (item.inclui?.length) {
    const lista = criar("ul", "product-card__list");
    item.inclui.slice(0, 2).forEach((texto) => lista.appendChild(criar("li", "", texto)));
    card.appendChild(lista);
  }

  let selectFaixa;
  if (item.faixas?.length) {
    const campo = criar("label", "select-field");
    campo.appendChild(criar("span", "", "Quantidade"));
    selectFaixa = criar("select", "");
    item.faixas.forEach((faixa, indice) => {
      const opcao = criar("option", "", `${faixa.quantidade} un - ${formatarMoeda(faixa.valorTotal)} (${formatarMoeda(faixa.valorUnitario)}/un)`);
      opcao.value = String(indice);
      selectFaixa.appendChild(opcao);
    });
    selectFaixa.addEventListener("change", () => {
      preco.textContent = valorSelecionado(item, Number(selectFaixa.value)).valor;
    });
    campo.appendChild(selectFaixa);
    card.appendChild(campo);
  }

  const incluiDetalhes = detalhes("Ver itens e escopo", item.inclui?.slice(2));
  const adicionais = detalhes("Personalização e adicionais", item.adicionais);
  const naoInclui = detalhes("O que não está incluso", item.naoInclui);
  [incluiDetalhes, adicionais, naoInclui].filter(Boolean).forEach((bloco) => card.appendChild(bloco));

  if (item.prazoEstimadoDiasUteis) {
    const prazo = item.prazoEstimadoDiasUteis;
    card.appendChild(criar("p", "product-card__meta", `Prazo estimado: ${prazo.minimo}-${prazo.maximo} dias úteis`));
  }

  const acoes = criar("div", "product-card__actions");
  const orçamento = criar("button", "button button--ink button--small", "Montar solicitação");
  const whats = criar("button", "product-card__whats", "WhatsApp");

  orçamento.type = "button";
  whats.type = "button";
  orçamento.addEventListener("click", () => onSelect?.({ categoriaId: categoria.id, itemId: item.id }));
  whats.addEventListener("click", () => {
    const selecionado = valorSelecionado(item, Number(selectFaixa?.value || 0));
    abrirWhatsApp({
      produto: item.nome,
      quantidade: selecionado.quantidade,
      valor: selecionado.valor,
      origem: `Catálogo - ${categoria.nome}`
    });
  });
  acoes.append(orçamento, whats);
  card.appendChild(acoes);
  return card;
}

export function renderCatalogo(categorias, { gridEl, filtrosEl, maisEl, onSelect }) {
  filtrosEl.replaceChildren();
  gridEl.replaceChildren();
  let expandido = false;

  const renderizar = (filtro) => {
    gridEl.replaceChildren();
    const itens = categorias
      .filter((categoria) => filtro === "todos" || categoria.id === filtro)
      .flatMap((categoria) => categoria.itens.map((item) => ({ categoria, item })));
    const limite = filtro === "todos" && !expandido ? 9 : itens.length;
    itens.slice(0, limite).forEach(({ categoria, item }) => gridEl.appendChild(criarCard(item, categoria, onSelect)));

    if (!maisEl) return;
    maisEl.replaceChildren();
    if (filtro !== "todos" || itens.length <= 9) return;
    const botao = criar("button", "button button--line", expandido ? "Mostrar seleção inicial" : `Ver todos os ${itens.length} itens`);
    botao.type = "button";
    botao.addEventListener("click", () => {
      expandido = !expandido;
      renderizar(filtro);
      if (!expandido) maisEl.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    maisEl.appendChild(botao);
  };

  const selecionarFiltro = (filtro) => {
    filtrosEl.querySelectorAll("button").forEach((botao) => {
      botao.classList.toggle("is-active", botao.dataset.filtro === filtro);
    });
    if (filtro !== "todos") expandido = false;
    renderizar(filtro);
  };

  [{ id: "todos", nome: "Todos", icone: "00" }, ...categorias].forEach((categoria) => {
    const botao = criar("button", "catalog-filter", `${categoria.icone} ${categoria.nome}`);
    botao.type = "button";
    botao.dataset.filtro = categoria.id;
    botao.addEventListener("click", () => selecionarFiltro(categoria.id));
    filtrosEl.appendChild(botao);
  });

  selecionarFiltro("todos");
  return { filtrar: selecionarFiltro };
}

export function renderDestaques(categorias, destaquesEl, idsDestaque, onSelect) {
  destaquesEl.replaceChildren();
  const itens = categorias.flatMap((categoria) => categoria.itens.map((item) => ({ categoria, item })));
  idsDestaque.forEach((id) => {
    const encontrado = itens.find(({ item }) => item.id === id);
    if (encontrado) destaquesEl.appendChild(criarCard(encontrado.item, encontrado.categoria, onSelect));
  });
}
