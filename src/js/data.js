/* Dados estritamente publicos usados pela experiencia comercial. */

const ARQUIVOS = {
  publico: "./dados-site/publico.json",
  catalogo: "./dados-site/catalogo-publico.json",
  servicos: "./dados-site/servicos.json",
  politicas: "./dados-site/politicas.json",
  pagamentos: "./dados-site/pagamentos.json",
  avaliacoes: "./dados-site/avaliacoes.json",
  faq: "./dados-site/faq.json"
};

const ROTULOS = {
  "presenca-digital": { titulo: "Presença digital e Google", icone: "01", origem: "servico" },
  "projetos-digitais": { titulo: "Sites e lojas", icone: "02", origem: "servico" },
  "sistemas-aplicativos": { titulo: "Sistemas e aplicativos", icone: "03", origem: "servico" },
  "automacoes-ia": { titulo: "Automações, integrações e IA", icone: "04", origem: "servico" },
  "servicos-avulsos": { titulo: "Serviços avulsos", icone: "05", origem: "servico" },
  "servicos-impressao-3d": { titulo: "Impressão 3D sob medida", icone: "06", origem: "servico" },
  marcas: { titulo: "Registro de marcas", icone: "07", origem: "servico" },
  manutencao: { titulo: "Manutenção e suporte", icone: "08", origem: "servico" },
  "impressao-3d": { titulo: "Soluções físicas em impressão 3D", icone: "09", origem: "catalogo" },
  nfc: { titulo: "Tags e chaveiros NFC", icone: "10", origem: "catalogo" }
};

async function carregarJson(caminho) {
  const resposta = await fetch(caminho, { cache: "no-store" });
  if (!resposta.ok) throw new Error(`Falha ao carregar ${caminho}`);
  return resposta.json();
}

let promessa;

export function carregarDados() {
  if (!promessa) {
    promessa = Promise.all(
      Object.entries(ARQUIVOS).map(async ([chave, caminho]) => [chave, await carregarJson(caminho)])
    ).then((pares) => Object.fromEntries(pares));
  }
  return promessa;
}

export function unificarCategorias(dados) {
  const categorias = [];
  const descontoPix = dados.servicos?.regrasGerais?.pixIntegralDescontoPercentual ?? dados.catalogo?.regrasGerais?.pixIntegralDescontoPercentual ?? 0;

  (dados.servicos?.categorias || []).forEach((categoria) => {
    if (!ROTULOS[categoria.id]) return;
    categorias.push(normalizarCategoria(categoria, categoria.servicos || [], "servico", descontoPix));
  });

  (dados.catalogo?.categorias || []).forEach((categoria) => {
    if (!ROTULOS[categoria.id]) return;
    categorias.push(normalizarCategoria(categoria, categoria.produtos || [], "catalogo", descontoPix));
  });

  return categorias;
}

function normalizarCategoria(categoria, itens, origem, descontoPix) {
  const rotulo = ROTULOS[categoria.id];
  return {
    id: categoria.id,
    nome: rotulo?.titulo || categoria.nome,
    icone: rotulo?.icone || "--",
    origem: rotulo?.origem || origem,
    entradaRotulo: categoria.entradaRotulo || rotulo?.titulo || categoria.nome,
    descricao: categoria.descricao || "",
    itens: itens.map((item) => normalizarItem(item, categoria.id, origem, descontoPix))
  };
}

function normalizarItem(item, categoriaId, origem, descontoPix) {
  const base = item.preco ?? item.precoInicial ?? item.precoMinimo ?? null;
  const pixElegivel = item.pixElegivel ?? (origem === "servico" && typeof base === "number" && !["mensal", "por lote"].includes(item.tipoPreco));
  const precoPix = item.precoPix ?? (pixElegivel && typeof base === "number" && descontoPix > 0
    ? Math.round(base * (1 - (descontoPix / 100)) * 100) / 100
    : null);

  return {
    id: item.id,
    nome: item.nome,
    descricao: item.descricao || "",
    mensagemComercial: item.mensagemComercial || "",
    idealPara: item.idealPara || "",
    quandoUsar: item.quandoUsar || "",
    quandoNaoNecessario: item.quandoNaoNecessario || "",
    observacao: item.observacao || "",
    origem,
    categoriaId,
    preco: item.preco ?? null,
    precoInicial: item.precoInicial ?? null,
    precoMinimo: item.precoMinimo ?? null,
    precoPix,
    pixElegivel,
    recorrenciaMensal: item.recorrenciaMensal ?? null,
    unidadePreco: item.unidadePreco || "",
    precoTexto: item.precoTexto || "",
    tipoPreco: item.tipoPreco || null,
    inclui: item.inclui || [],
    naoInclui: item.naoInclui || [],
    custosExternos: item.custosExternos || [],
    faixas: item.faixas || [],
    adicionais: item.adicionais || [],
    avisoPreco: item.avisoPreco || "",
    avisoRecorrencia: item.avisoRecorrencia || "",
    prazoEstimadoDiasUteis: item.prazoEstimadoDiasUteis || null,
    prazoTexto: item.prazoTexto || ""
  };
}

export function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function sufixoPreco(item) {
  if (item.unidadePreco) return item.unidadePreco;
  if (!item.tipoPreco || ["fixo", "a partir de", "preço de referência"].includes(item.tipoPreco)) return "";
  return ` ${item.tipoPreco}`;
}

export function precoFormatado(item) {
  if (item.precoTexto) return item.precoTexto;
  if (item.faixas?.length) {
    const menor = Math.min(...item.faixas.map((faixa) => faixa.valorUnitario));
    return `a partir de ${formatarMoeda(menor)} /un`;
  }
  if (item.preco != null) {
    const prefixo = item.tipoPreco === "a partir de" ? "a partir de " : "";
    return `${prefixo}${formatarMoeda(item.preco)}${sufixoPreco(item)}`;
  }
  if (item.precoInicial != null) return `a partir de ${formatarMoeda(item.precoInicial)}${sufixoPreco(item)}`;
  if (item.precoMinimo != null) return `a partir de ${formatarMoeda(item.precoMinimo)}${sufixoPreco(item)}`;
  return "sob orçamento";
}

export function prazoFormatado(item) {
  if (item?.prazoTexto) return item.prazoTexto;
  const prazo = item?.prazoEstimadoDiasUteis;
  if (!prazo?.minimo && !prazo?.maximo) return "Definido conforme o escopo.";
  if (prazo.minimo === prazo.maximo) return `${prazo.minimo} dia útil`;
  return `${prazo.minimo} a ${prazo.maximo} dias úteis`;
}

export function categoriasDeServicos(categorias) {
  return categorias.filter((categoria) => categoria.origem === "servico");
}

export function categoriasDeCatalogo(categorias) {
  return categorias.filter((categoria) => categoria.origem === "catalogo");
}
