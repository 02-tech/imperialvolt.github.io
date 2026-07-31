/* Imperial Volt — carregamento central dos dados públicos (dados-site/*.json) */

const ARQUIVOS = {
  config: "./dados-site/configuracoes.json",
  presenca: "./dados-site/presenca-digital.json",
  catalogo: "./dados-site/catalogo.json",
  servicos: "./dados-site/servicos.json",
  politicas: "./dados-site/politicas.json",
  avaliacoes: "./dados-site/avaliacoes.json",
  faq: "./dados-site/faq.json",
  fluxo: "./dados-site/fluxo-comercial.json"
};

async function carregarJson(caminho) {
  const resp = await fetch(caminho, { cache: "no-store" });
  if (!resp.ok) throw new Error("Falha ao carregar " + caminho);
  return resp.json();
}

let promessa = null;

export function carregarDados() {
  if (!promessa) {
    promessa = Promise.all(Object.entries(ARQUIVOS).map(async ([chave, caminho]) => {
      try {
        return [chave, await carregarJson(caminho)];
      } catch (e) {
        console.error("[Imperial Volt] Não foi possível carregar", caminho, e);
        return [chave, null];
      }
    })).then((pares) => Object.fromEntries(pares));
  }
  return promessa;
}

/* Une servicos.json + catalogo.json numa única lista de categorias comerciais */
export function unificarCategorias(dados) {
  const lista = [];

  const rotulos = {
    sites: { titulo: "Sites e páginas digitais", icone: "🌐" },
    software: { titulo: "Aplicativos, sistemas e automação", icone: "⚙️" },
    marcas: { titulo: "Registro de marcas", icone: "📝" },
    manutencao: { titulo: "Manutenção e suporte", icone: "🛠️" },
    "impressao-3d": { titulo: "Impressão 3D", icone: "🧊" },
    nfc: { titulo: "Tags e chaveiros NFC", icone: "📶" },
    "kits-revenda": { titulo: "Kits NFC para revendedores", icone: "📦" }
  };

  (dados.servicos?.categorias || []).forEach((cat) => {
    lista.push({
      id: cat.id,
      nome: rotulos[cat.id]?.titulo || cat.nome,
      icone: rotulos[cat.id]?.icone || "•",
      itens: (cat.servicos || []).map(normalizarItem)
    });
  });

  (dados.catalogo?.categorias || []).forEach((cat) => {
    lista.push({
      id: cat.id,
      nome: rotulos[cat.id]?.titulo || cat.nome,
      icone: rotulos[cat.id]?.icone || "•",
      descricao: cat.descricao,
      itens: (cat.produtos || []).map(normalizarItem)
    });
  });

  return lista;
}

function normalizarItem(item) {
  return {
    id: item.id,
    nome: item.nome,
    descricao: item.descricao || "",
    preco: item.preco ?? null,
    precoInicial: item.precoInicial ?? null,
    precoMinimo: item.precoMinimo ?? null,
    tipoPreco: item.tipoPreco || null,
    inclui: item.inclui || null,
    naoInclui: item.naoInclui || null,
    faixas: item.faixas || null,
    adicionais: item.adicionais || null,
    prazoEstimadoDiasUteis: item.prazoEstimadoDiasUteis || null,
    acrescimoPercentual: item.acrescimoPercentual ?? null,
    original: item
  };
}

export function precoFormatado(item) {
  const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  if (item.faixas && item.faixas.length) {
    return "a partir de " + brl(item.faixas[item.faixas.length - 1].valorUnitario) + " /un";
  }
  if (item.preco != null) return brl(item.preco);
  if (item.precoInicial != null) return "a partir de " + brl(item.precoInicial);
  if (item.precoMinimo != null) return "orçamento a partir de " + brl(item.precoMinimo);
  if (item.acrescimoPercentual != null) return "+" + item.acrescimoPercentual + "%";
  return "sob orçamento";
}
