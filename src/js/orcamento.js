/* Imperial Volt — orçamento guiado (fluxo por etapas, sem backend) */
import { precoFormatado } from "./data.js";
import { montarMensagem, linkWhatsApp } from "./whatsapp.js";

const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const MAPA_CATEGORIA = {
  "criar-site": "sites",
  "criar-app": "software",
  "automatizar": "software",
  "impressao-3d": "impressao-3d",
  "nfc": "nfc",
  "revender-nfc": "kits-revenda",
  "registro-marca": "marcas"
};

export function iniciarOrcamento({ raiz, opcoesEntrada, categorias }) {
  const passos = Array.from(raiz.querySelectorAll("[data-passo]"));
  const progresso = raiz.querySelector("[data-progresso]");
  const btnVoltar = raiz.querySelector("[data-voltar]");
  const btnAvancar = raiz.querySelector("[data-avancar]");

  const estado = {
    passoAtual: 1,
    categoriaId: null,
    categoriaLabel: null,
    produto: null,
    uso: null,
    quantidade: 1,
    faixaIndex: null,
    personalizacao: "",
    paginaPersonalizada: "",
    observacoes: ""
  };

  const totalPassos = passos.length;

  function mostrarPasso(n) {
    raiz.querySelector(".assistenteAviso")?.remove();
    passos.forEach((p) => {
      p.hidden = Number(p.getAttribute("data-passo")) !== n;
    });
    progresso.textContent = "Etapa " + n + " de " + totalPassos;
    btnVoltar.hidden = n === 1;
    btnAvancar.textContent = n === totalPassos ? "Enviar ao WhatsApp" : "Avançar";
    if (n === 2) montarPassoProduto();
    if (n === 4) montarPassoQuantidade();
    if (n === totalPassos) montarResumo();
    raiz.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderEntrada() {
    const cont = raiz.querySelector("[data-passo='1'] .assistente__opcoes");
    cont.innerHTML = "";
    opcoesEntrada.forEach((op) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "opcaoBtn";
      b.textContent = op.rotulo;
      b.addEventListener("click", () => {
        estado.categoriaId = MAPA_CATEGORIA[op.id] || null;
        estado.categoriaLabel = op.rotulo;
        cont.querySelectorAll(".opcaoBtn").forEach((x) => x.classList.remove("opcaoBtn--ativo"));
        b.classList.add("opcaoBtn--ativo");
      });
      cont.appendChild(b);
    });
  }

  function categoriaAtual() {
    return categorias.find((c) => c.id === estado.categoriaId);
  }

  function montarPassoProduto() {
    const cont = raiz.querySelector("[data-passo='2'] .assistente__opcoes");
    cont.innerHTML = "";
    const cat = categoriaAtual();
    if (!cat) {
      cont.innerHTML = "<p class='muted'>Selecione uma opção na etapa anterior para continuar.</p>";
      return;
    }
    cat.itens.forEach((item) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "opcaoBtn opcaoBtn--produto";
      b.innerHTML = `<b>${item.nome}</b><span>${precoFormatado(item)}</span>`;
      b.addEventListener("click", () => {
        estado.produto = item;
        estado.faixaIndex = item.faixas ? 0 : null;
        cont.querySelectorAll(".opcaoBtn").forEach((x) => x.classList.remove("opcaoBtn--ativo"));
        b.classList.add("opcaoBtn--ativo");
      });
      cont.appendChild(b);
    });
  }

  function montarPassoQuantidade() {
    const cont = raiz.querySelector("[data-passo='4'] .assistente__opcoes");
    cont.innerHTML = "";

    if (estado.produto?.faixas) {
      const sel = document.createElement("select");
      sel.className = "assistenteSelect";
      estado.produto.faixas.forEach((f, i) => {
        const o = document.createElement("option");
        o.value = i;
        o.textContent = `${f.quantidade} un — ${brl(f.valorTotal)} (${brl(f.valorUnitario)}/un)`;
        sel.appendChild(o);
      });
      sel.addEventListener("change", () => {
        estado.faixaIndex = Number(sel.value);
        estado.quantidade = estado.produto.faixas[estado.faixaIndex].quantidade;
      });
      estado.faixaIndex = 0;
      estado.quantidade = estado.produto.faixas[0].quantidade;
      cont.appendChild(sel);
    } else {
      const label = document.createElement("label");
      label.className = "assistenteCampo";
      label.innerHTML = `<span>Quantidade desejada</span>`;
      const input = document.createElement("input");
      input.type = "number";
      input.min = "1";
      input.value = String(estado.quantidade || 1);
      input.addEventListener("input", () => {
        estado.quantidade = Number(input.value) || 1;
      });
      label.appendChild(input);
      cont.appendChild(label);
    }
  }

  function calcularValor() {
    const p = estado.produto;
    if (!p) return null;

    if (p.faixas && estado.faixaIndex != null) {
      return brl(p.faixas[estado.faixaIndex].valorTotal) + " (" + brl(p.faixas[estado.faixaIndex].valorUnitario) + "/un)";
    }
    if (p.preco != null) {
      const multiplica = estado.categoriaId === "impressao-3d";
      const total = multiplica ? p.preco * (estado.quantidade || 1) : p.preco;
      return brl(total) + (multiplica && estado.quantidade > 1 ? " (total para " + estado.quantidade + " un)" : "");
    }
    if (p.precoInicial != null) return "a partir de " + brl(p.precoInicial) + " — confirmado no atendimento";
    if (p.precoMinimo != null) return "a partir de " + brl(p.precoMinimo) + " — confirmado no atendimento";
    return "valor a confirmar no atendimento";
  }

  function montarResumo() {
    const cont = raiz.querySelector("[data-passo='" + totalPassos + "'] .assistente__resumo");
    const campos = [
      ["1", "O que procura", estado.categoriaLabel || "—"],
      ["2", "Produto/serviço", estado.produto?.nome || "—"],
      ["3", "Uso", estado.uso || "—"],
      ["4", "Quantidade", estado.quantidade ? String(estado.quantidade) : "—"],
      ["5", "Personalização", estado.personalizacao || "Nenhuma informada"],
      ["6", "Página/aplicação personalizada", estado.paginaPersonalizada || "Não informado"],
      ["7", "Observações", estado.observacoes || "Nenhuma"],
    ];

    cont.innerHTML = campos.map(([passo, rotulo, valor]) => `
      <div class="resumoLinha" data-ir-para="${passo}">
        <span>${rotulo}</span>
        <b>${valor}</b>
        <button type="button" class="resumoEditar" data-ir-para="${passo}">Editar</button>
      </div>
    `).join("") + `
      <div class="resumoLinha resumoLinha--valor">
        <span>Valor estimado</span>
        <b>${calcularValor() || "a confirmar no atendimento"}</b>
      </div>
    `;

    cont.querySelectorAll("[data-ir-para]").forEach((elx) => {
      elx.addEventListener("click", () => mostrarPasso(Number(elx.getAttribute("data-ir-para"))));
    });
  }

  raiz.querySelector("[data-passo='3'] .assistente__opcoes")?.addEventListener("click", (e) => {
    const b = e.target.closest(".opcaoBtn");
    if (!b) return;
    estado.uso = b.textContent;
    raiz.querySelectorAll("[data-passo='3'] .opcaoBtn").forEach((x) => x.classList.remove("opcaoBtn--ativo"));
    b.classList.add("opcaoBtn--ativo");
  });

  const campoPersonalizacao = raiz.querySelector("[data-campo='personalizacao']");
  campoPersonalizacao?.addEventListener("input", () => { estado.personalizacao = campoPersonalizacao.value; });

  const campoPagina = raiz.querySelector("[data-campo='paginaPersonalizada']");
  campoPagina?.addEventListener("input", () => { estado.paginaPersonalizada = campoPagina.value; });

  const campoObs = raiz.querySelector("[data-campo='observacoes']");
  campoObs?.addEventListener("input", () => { estado.observacoes = campoObs.value; });

  function avisar(mensagem) {
    let aviso = raiz.querySelector(".assistenteAviso");
    if (!aviso) {
      aviso = document.createElement("p");
      aviso.className = "assistenteAviso";
      btnAvancar.parentElement.insertAdjacentElement("beforebegin", aviso);
    }
    aviso.textContent = mensagem;
  }

  function limparAviso() {
    raiz.querySelector(".assistenteAviso")?.remove();
  }

  btnAvancar.addEventListener("click", () => {
    if (estado.passoAtual === 1 && !estado.categoriaId) {
      avisar("Selecione uma opção para continuar.");
      return;
    }
    if (estado.passoAtual === 2 && !estado.produto) {
      avisar("Escolha um produto ou serviço para continuar.");
      return;
    }
    limparAviso();

    if (estado.passoAtual === totalPassos) {
      const msg = montarMensagem({
        produto: estado.produto?.nome,
        quantidade: estado.quantidade ? String(estado.quantidade) : null,
        finalidade: estado.uso,
        personalizacao: estado.personalizacao,
        paginaPersonalizada: estado.paginaPersonalizada,
        observacoes: estado.observacoes,
        valor: calcularValor(),
        origem: "Orçamento guiado"
      });
      window.open(linkWhatsApp(msg), "_blank", "noopener");
      return;
    }

    estado.passoAtual = Math.min(totalPassos, estado.passoAtual + 1);
    mostrarPasso(estado.passoAtual);
  });

  btnVoltar.addEventListener("click", () => {
    estado.passoAtual = Math.max(1, estado.passoAtual - 1);
    mostrarPasso(estado.passoAtual);
  });

  renderEntrada();
  mostrarPasso(1);

  return {
    irParaCategoria(categoriaId) {
      const alvo = Object.entries(MAPA_CATEGORIA).find(([, v]) => v === categoriaId);
      if (!alvo) return;
      estado.categoriaId = categoriaId;
      estado.categoriaLabel = opcoesEntrada.find((o) => o.id === alvo[0])?.rotulo || categoriaId;
      const cont = raiz.querySelector("[data-passo='1'] .assistente__opcoes");
      cont.querySelectorAll(".opcaoBtn").forEach((x) => x.classList.remove("opcaoBtn--ativo"));
      const btnAlvo = Array.from(cont.querySelectorAll(".opcaoBtn")).find((b) => b.textContent === estado.categoriaLabel);
      btnAlvo?.classList.add("opcaoBtn--ativo");
      estado.passoAtual = 2;
      mostrarPasso(2);
    }
  };
}
