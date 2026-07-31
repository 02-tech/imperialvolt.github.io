/* Imperial Volt — catálogo navegável, filtros e comparação de planos */
import { precoFormatado } from "./data.js";
import { abrirWhatsApp } from "./whatsapp.js";

const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function el(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

function cardFaixas(item) {
  if (!item.faixas) return "";
  const opcoes = item.faixas.map((f, i) =>
    `<option value="${i}">${f.quantidade} un — ${brl(f.valorTotal)} (${brl(f.valorUnitario)}/un)</option>`
  ).join("");
  return `
    <label class="qtySelect">
      <span>Quantidade</span>
      <select data-faixas>${opcoes}</select>
    </label>`;
}

function cardInclui(item) {
  if (!item.inclui) return "";
  return `<ul class="card__list">${item.inclui.slice(0, 5).map(i => `<li>${i}</li>`).join("")}</ul>`;
}

function renderCard(item, categoriaNome) {
  const card = el(`
    <article class="prodCard" data-categoria="${item._categoriaId}">
      <div class="prodCard__top">
        <span class="prodCard__tag">${categoriaNome}</span>
        <span class="prodCard__preco">${precoFormatado(item)}</span>
      </div>
      <h3>${item.nome}</h3>
      <p>${item.descricao}</p>
      ${cardInclui(item)}
      ${cardFaixas(item)}
      ${item.prazoEstimadoDiasUteis ? `<p class="prodCard__prazo">Prazo estimado: ${item.prazoEstimadoDiasUteis.minimo}–${item.prazoEstimadoDiasUteis.maximo} dias úteis</p>` : ""}
      <button type="button" class="btn btn--ghost prodCard__cta">Solicitar no WhatsApp →</button>
    </article>
  `);

  const btn = card.querySelector(".prodCard__cta");
  const selectFaixas = card.querySelector("[data-faixas]");

  btn.addEventListener("click", () => {
    let valor = precoFormatado(item);
    let quantidade = "1";

    if (selectFaixas && item.faixas) {
      const f = item.faixas[Number(selectFaixas.value)];
      valor = brl(f.valorTotal) + " (" + brl(f.valorUnitario) + "/un)";
      quantidade = String(f.quantidade);
    }

    abrirWhatsApp({
      produto: item.nome,
      quantidade,
      valor,
      origem: "Catálogo — " + categoriaNome
    });
  });

  return card;
}

export function renderCatalogo(categorias, { gridEl, filtrosEl }) {
  gridEl.innerHTML = "";
  filtrosEl.innerHTML = "";

  const chipTodos = el(`<button type="button" class="chip chip--ativo" data-filtro="todos">Todos</button>`);
  filtrosEl.appendChild(chipTodos);

  categorias.forEach((cat) => {
    const chip = el(`<button type="button" class="chip" data-filtro="${cat.id}">${cat.icone} ${cat.nome}</button>`);
    filtrosEl.appendChild(chip);

    cat.itens.forEach((item) => {
      item._categoriaId = cat.id;
      gridEl.appendChild(renderCard(item, cat.nome));
    });
  });

  filtrosEl.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;

    filtrosEl.querySelectorAll(".chip").forEach((c) => c.classList.remove("chip--ativo"));
    chip.classList.add("chip--ativo");

    const alvo = chip.getAttribute("data-filtro");
    gridEl.querySelectorAll(".prodCard").forEach((card) => {
      const mostrar = alvo === "todos" || card.getAttribute("data-categoria") === alvo;
      card.style.display = mostrar ? "" : "none";
    });
  });
}

export function renderComparacaoSites(categorias, tabelaEl) {
  const sites = categorias.find((c) => c.id === "sites");
  if (!sites) return;

  const linhas = sites.itens.map((s) => `
    <tr>
      <th scope="row">${s.nome}</th>
      <td>${precoFormatado(s)}</td>
      <td>${(s.inclui && s.inclui[1]) || "—"}</td>
      <td>${s.prazoEstimadoDiasUteis ? s.prazoEstimadoDiasUteis.minimo + "–" + s.prazoEstimadoDiasUteis.maximo + " dias úteis" : "sob orçamento"}</td>
    </tr>
  `).join("");

  tabelaEl.innerHTML = `
    <table class="compareTable">
      <thead>
        <tr>
          <th scope="col">Plano</th>
          <th scope="col">Investimento</th>
          <th scope="col">Estrutura</th>
          <th scope="col">Prazo estimado</th>
        </tr>
      </thead>
      <tbody>${linhas}</tbody>
    </table>
  `;
}

export function renderDestaques(categorias, destaquesEl, idsDestaque) {
  const todos = categorias.flatMap((cat) => cat.itens.map((it) => ({ ...it, _categoriaId: cat.id, _categoriaNome: cat.nome })));
  destaquesEl.innerHTML = "";

  idsDestaque.forEach((id) => {
    const item = todos.find((i) => i.id === id);
    if (item) destaquesEl.appendChild(renderCard(item, item._categoriaNome));
  });
}
