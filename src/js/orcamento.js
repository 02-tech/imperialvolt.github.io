/* Orçamento guiado de uma tela: seleção clara e envio contextual ao WhatsApp. */
import { formatarMoeda, precoFormatado } from "./data.js";
import { linkWhatsApp, montarMensagem } from "./whatsapp.js";

const CATEGORIA_EMPRESAS = {
  id: "empresas-revendedores",
  nome: "Empresas e revendedores",
  icone: "07",
  itens: [{
    id: "solucao-empresarial",
    nome: "Solução empresarial sob medida",
    descricao: "Fornecimento em quantidade, personalização visual, gravação de links ou contatos, página personalizada, aplicação personalizada, identidade própria e desenvolvimento sob orçamento."
  }]
};

function criar(tag, className, texto) {
  const elemento = document.createElement(tag);
  if (className) elemento.className = className;
  if (texto != null) elemento.textContent = texto;
  return elemento;
}

export function iniciarOrcamento({ raiz, categorias, politicas }) {
  const todasCategorias = [...categorias, CATEGORIA_EMPRESAS];
  const estado = {
    categoriaId: null,
    itemId: null,
    quantidade: 1,
    faixaIndex: 0,
    finalidade: "",
    personalizacao: "",
    observacoes: "",
    pagamento: ""
  };

  const categoriaAtual = () => todasCategorias.find((categoria) => categoria.id === estado.categoriaId) || null;
  const itemAtual = () => categoriaAtual()?.itens.find((item) => item.id === estado.itemId) || null;

  const valorAtual = () => {
    const item = itemAtual();
    if (!item) return "A confirmar no atendimento";
    if (item.faixas?.length) {
      const faixa = item.faixas[estado.faixaIndex] || item.faixas[0];
      return `${formatarMoeda(faixa.valorTotal)} (${formatarMoeda(faixa.valorUnitario)}/un)`;
    }
    if (item.preco != null) {
      const total = estado.categoriaId === "impressao-3d" ? item.preco * estado.quantidade : item.preco;
      return formatarMoeda(total);
    }
    if (item.precoInicial != null || item.precoMinimo != null) return precoFormatado(item);
    return "Sob orçamento";
  };

  const quantidadeAtual = () => {
    const item = itemAtual();
    if (item?.faixas?.length) return String((item.faixas[estado.faixaIndex] || item.faixas[0]).quantidade);
    return estado.categoriaId === "impressao-3d" ? String(estado.quantidade) : "";
  };

  function botaoEscolha(item, ativo, acao, pequeno) {
    const botao = criar("button", `quote-choice${ativo ? " is-active" : ""}${pequeno ? " quote-choice--compact" : ""}`);
    botao.type = "button";
    botao.dataset.action = acao;
    botao.dataset.id = item.id;
    botao.append(criar("strong", "", item.nome), criar("small", "", item.icone || item.preco));
    return botao;
  }

  function campo(label, control) {
    const envoltorio = criar("label", "quote-field");
    envoltorio.append(criar("span", "", label), control);
    return envoltorio;
  }

  function atualizarResumo() {
    const categoria = categoriaAtual();
    const item = itemAtual();
    const valores = {
      categoria: categoria?.nome || "Escolha uma categoria",
      item: item?.nome || "Escolha uma opção",
      valor: item ? valorAtual() : "--",
      quantidade: quantidadeAtual() || "--"
    };
    Object.entries(valores).forEach(([chave, valor]) => {
      const alvo = raiz.querySelector(`[data-summary="${chave}"]`);
      if (alvo) alvo.textContent = valor;
    });
  }

  function renderizar() {
    raiz.replaceChildren();
    const painel = criar("div", "quote-panel");
    painel.appendChild(criar("p", "quote-panel__label", "1. Selecione a categoria"));
    const categoriasEl = criar("div", "quote-categories");
    todasCategorias.forEach((categoria) => categoriasEl.appendChild(botaoEscolha({ id: categoria.id, nome: categoria.nome, icone: categoria.icone }, estado.categoriaId === categoria.id, "category")));
    painel.appendChild(categoriasEl);

    const categoria = categoriaAtual();
    if (categoria) {
      painel.appendChild(criar("p", "quote-panel__label quote-panel__label--next", "2. Escolha a opção"));
      const itensEl = criar("div", "quote-items");
      categoria.itens.forEach((item) => itensEl.appendChild(botaoEscolha({ id: item.id, nome: item.nome, preco: precoFormatado(item) }, estado.itemId === item.id, "item", true)));
      painel.appendChild(itensEl);
    }

    const item = itemAtual();
    if (item) {
      const campos = criar("div", "quote-fields");
      if (item.faixas?.length) {
        const select = criar("select", "");
        select.dataset.field = "faixaIndex";
        item.faixas.forEach((faixa, indice) => {
          const opcao = criar("option", "", `${faixa.quantidade} un - ${formatarMoeda(faixa.valorTotal)} (${formatarMoeda(faixa.valorUnitario)}/un)`);
          opcao.value = String(indice);
          opcao.selected = indice === estado.faixaIndex;
          select.appendChild(opcao);
        });
        campos.appendChild(campo("Quantidade", select));
      } else if (estado.categoriaId === "impressao-3d") {
        const quantidade = criar("input", "");
        quantidade.type = "number";
        quantidade.min = "1";
        quantidade.value = String(estado.quantidade);
        quantidade.dataset.field = "quantidade";
        campos.appendChild(campo("Quantidade desejada", quantidade));
      }

      const finalidade = criar("select", "");
      finalidade.dataset.field = "finalidade";
      ["", "Uso pessoal", "Empresa", "Revenda"].forEach((opcao) => {
        const option = criar("option", "", opcao || "Selecione uma finalidade");
        option.value = opcao;
        option.selected = opcao === estado.finalidade;
        finalidade.appendChild(option);
      });
      campos.appendChild(campo("Finalidade", finalidade));

      const personalizacao = criar("textarea", "");
      personalizacao.placeholder = "Ex.: medida, peça a repor, adaptação, função, cor ou detalhe necessário";
      personalizacao.value = estado.personalizacao;
      personalizacao.dataset.field = "personalizacao";
      campos.appendChild(campo("Detalhes da solução ou personalização", personalizacao));

      const observacoes = criar("textarea", "");
      observacoes.placeholder = "Informe contexto de uso, medidas, fotos disponíveis ou o que ajuda a analisar a necessidade.";
      observacoes.value = estado.observacoes;
      observacoes.dataset.field = "observacoes";
      campos.appendChild(campo("Observações", observacoes));

      const pagamento = criar("select", "");
      pagamento.dataset.field = "pagamento";
      const descontoPix = politicas?.pagamento?.pixIntegral?.descontoPercentual;
      ["", descontoPix ? `Pix integral (${descontoPix}% de desconto)` : "Pix integral", "Cartão de crédito", "Quero orientação sobre pagamento"].forEach((opcao) => {
        const option = criar("option", "", opcao || "Forma de pagamento pretendida");
        option.value = opcao;
        option.selected = opcao === estado.pagamento;
        pagamento.appendChild(option);
      });
      campos.appendChild(campo("Pagamento", pagamento));
      painel.appendChild(campos);
    }

    const resumo = criar("aside", "quote-summary");
    resumo.appendChild(criar("p", "quote-summary__label", "Sua solicitação"));
    const linhas = [
      ["categoria", "Categoria", categoria?.nome || "Escolha uma categoria"],
      ["item", "Opção", item?.nome || "Escolha uma opção"],
      ["valor", "Valor de referência", item ? valorAtual() : "--"],
      ["quantidade", "Quantidade", quantidadeAtual() || "--"]
    ];
    linhas.forEach(([id, rotulo, valor]) => {
      const linha = criar("div", "quote-summary__item");
      const dado = criar("strong", "", valor);
      dado.dataset.summary = id;
      linha.append(criar("span", "", rotulo), dado);
      resumo.appendChild(linha);
    });
    resumo.appendChild(criar("p", "quote-summary__note", "Projetos personalizados são avaliados individualmente. Valores, acabamento, prazo e entrega são confirmados após análise."));
    const enviar = criar("button", "button button--lime", "Enviar solicitação pelo WhatsApp");
    enviar.type = "button";
    enviar.disabled = !item;
    enviar.dataset.action = "send";
    resumo.appendChild(enviar);
    raiz.append(painel, resumo);
  }

  raiz.addEventListener("click", (evento) => {
    const botao = evento.target.closest("button[data-action]");
    if (!botao) return;
    if (botao.dataset.action === "category") {
      estado.categoriaId = botao.dataset.id;
      estado.itemId = null;
      estado.faixaIndex = 0;
      estado.quantidade = 1;
      renderizar();
      return;
    }
    if (botao.dataset.action === "item") {
      estado.itemId = botao.dataset.id;
      estado.faixaIndex = 0;
      estado.quantidade = 1;
      renderizar();
      return;
    }
    if (botao.dataset.action === "send") {
      const item = itemAtual();
      if (!item) return;
      const mensagem = montarMensagem({
        produto: item.nome,
        quantidade: quantidadeAtual(),
        finalidade: estado.finalidade,
        personalizacao: estado.personalizacao,
        observacoes: estado.observacoes,
        valor: valorAtual(),
        pagamento: estado.pagamento,
        origem: "Orçamento guiado"
      });
      window.open(linkWhatsApp(mensagem), "_blank", "noopener");
    }
  });

  const atualizarCampo = (evento) => {
    const campo = evento.target.closest("[data-field]");
    if (!campo) return;
    if (campo.dataset.field === "quantidade") estado.quantidade = Math.max(1, Number(campo.value) || 1);
    else estado[campo.dataset.field] = campo.dataset.field === "faixaIndex" ? Number(campo.value) : campo.value;
    atualizarResumo();
  };
  raiz.addEventListener("input", atualizarCampo);
  raiz.addEventListener("change", atualizarCampo);

  renderizar();
  return {
    selecionar({ categoriaId, itemId }) {
      estado.categoriaId = categoriaId;
      estado.itemId = itemId || null;
      estado.faixaIndex = 0;
      estado.quantidade = 1;
      renderizar();
    }
  };
}
