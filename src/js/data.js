/* Dados estritamente publicos usados pela experiencia comercial. */

const ARQUIVOS = {
  publico: "./dados-site/publico.json",
  catalogo: "./dados-site/catalogo-publico.json",
  servicos: "./dados-site/servicos.json",
  politicas: "./dados-site/politicas.json",
  avaliacoes: "./dados-site/avaliacoes.json",
  faq: "./dados-site/faq.json"
};

const ROTULOS = {
  "projetos-digitais": { titulo: "Projetos digitais", icone: "01" },
  marcas: { titulo: "Registro de marcas", icone: "02" },
  manutencao: { titulo: "Manutenção e suporte", icone: "03" },
  "impressao-3d": { titulo: "Soluções físicas em impressão 3D", icone: "04" },
  nfc: { titulo: "Tags e chaveiros NFC", icone: "05" }
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

  (dados.servicos?.categorias || []).forEach((categoria) => {
    if (!ROTULOS[categoria.id]) return;
    categorias.push(normalizarCategoria(categoria, categoria.servicos || []));
  });

  (dados.catalogo?.categorias || []).forEach((categoria) => {
    if (!ROTULOS[categoria.id]) return;
    categorias.push(normalizarCategoria(categoria, categoria.produtos || []));
  });

  return categorias;
}

function normalizarCategoria(categoria, itens) {
  const rotulo = ROTULOS[categoria.id];
  return {
    id: categoria.id,
    nome: rotulo?.titulo || categoria.nome,
    icone: rotulo?.icone || "--",
    descricao: categoria.descricao || "",
    itens: itens.map((item) => ({
      id: item.id,
      nome: item.nome,
      descricao: item.descricao || "",
      preco: item.preco ?? null,
      precoInicial: item.precoInicial ?? null,
      precoMinimo: item.precoMinimo ?? null,
      tipoPreco: item.tipoPreco || null,
      inclui: item.inclui || [],
      naoInclui: item.naoInclui || [],
      faixas: item.faixas || [],
      adicionais: item.adicionais || [],
      avisoPreco: item.avisoPreco || "",
      prazoEstimadoDiasUteis: item.prazoEstimadoDiasUteis || null
    }))
  };
}

export function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function precoFormatado(item) {
  if (item.faixas?.length) {
    const menor = Math.min(...item.faixas.map((faixa) => faixa.valorUnitario));
    return `a partir de ${formatarMoeda(menor)} /un`;
  }
  if (item.preco != null) return formatarMoeda(item.preco);
  if (item.precoInicial != null) return `a partir de ${formatarMoeda(item.precoInicial)}`;
  if (item.precoMinimo != null) return `a partir de ${formatarMoeda(item.precoMinimo)}`;
  return "sob orçamento";
}
