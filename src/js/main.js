/* Imperial Volt — main.js */
import { carregarDados, unificarCategorias } from "./data.js";
import { renderCatalogo, renderComparacaoSites, renderDestaques } from "./catalogo.js";
import { iniciarOrcamento } from "./orcamento.js";
import { linkWhatsApp, montarMensagem } from "./whatsapp.js";

const $ = (s, elx = document) => elx.querySelector(s);

function setWhatsLinks() {
  const url = linkWhatsApp(montarMensagem({ observacoes: "Quero um orçamento." }));
  ["#whatsFab", "#whatsMain", "#whatsContato"].forEach((sel) => {
    const a = $(sel);
    if (a) a.href = url;
  });
}

function setYear() {
  const y = $("#year");
  if (y) y.textContent = String(new Date().getFullYear());
}

function themeToggle() {
  const btn = $("#themeBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const html = document.documentElement;
    const cur = html.getAttribute("data-theme") || "dark";
    const next = cur === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", next);
    try { localStorage.setItem("iv_theme", next); } catch (e) {}
  });
}

function mobileMenu() {
  const btn = $("#menuBtn");
  const nav = $("#mobileNav");
  if (!btn || !nav) return;

  btn.addEventListener("click", () => {
    if (nav.hasAttribute("hidden")) nav.removeAttribute("hidden");
    else nav.setAttribute("hidden", "");
  });

  nav.addEventListener("click", (e) => {
    if (e.target.closest("a")) nav.setAttribute("hidden", "");
  });
}

function chatUI() {
  const fab = $("#chatFab");
  const box = $("#ivChat");
  const close = $("#chatClose");

  const open = () => {
    if (!box) return;
    box.removeAttribute("hidden");
    try { window.IV_CHAT && window.IV_CHAT.focus(); } catch (e) {}
  };
  const hide = () => box && box.setAttribute("hidden", "");

  if (fab) fab.addEventListener("click", open);
  if (close) close.addEventListener("click", hide);

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hide();
  });
}

function renderChipsSolucoes(categorias) {
  const cont = $("#chipsCategorias");
  if (!cont) return;
  cont.innerHTML = "";
  categorias.forEach((cat) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.textContent = `${cat.icone} ${cat.nome}`;
    b.addEventListener("click", () => {
      const filtroChip = document.querySelector(`#filtrosCatalogo [data-filtro="${cat.id}"]`);
      filtroChip?.click();
      document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    cont.appendChild(b);
  });
}

function renderFaq(dados) {
  const cont = $("#listaFaq");
  if (!cont || !dados.faq) return;
  cont.innerHTML = "";

  dados.faq.categorias.forEach((cat) => {
    const bloco = document.createElement("div");
    bloco.className = "faq__grupo";
    bloco.innerHTML = `<h3 class="faq__grupoTitulo">${cat.nome}</h3>`;
    cat.perguntas.forEach((p) => {
      const det = document.createElement("details");
      det.innerHTML = `<summary>${p.pergunta}</summary><div class="faq__body">${p.resposta}</div>`;
      bloco.appendChild(det);
    });
    cont.appendChild(bloco);
  });
}

function renderPagamento(dados) {
  const alvo = $("#textoPagamento");
  if (alvo && dados.politicas?.textoPublico) {
    alvo.textContent = dados.politicas.textoPublico.descricao;
  }
}

function renderProvaSocial(dados) {
  const alvo = $("#provaSocial");
  if (!alvo) return;

  const google = dados.presenca?.googleEmpresa;
  const avaliacoes = dados.avaliacoes?.avaliacoes || [];

  if (avaliacoes.length) {
    alvo.innerHTML = avaliacoes.map((a) => `
      <div class="avaliacao">
        <b>${a.nome || "Cliente"}</b>
        <p>${a.comentario || ""}</p>
      </div>
    `).join("");
    return;
  }

  if (google?.notaCapturada) {
    alvo.innerHTML = `
      <div class="ctaBox__text">
        <b>${google.notaCapturada.toFixed(1)} ★ no Google</b>
        <span>${google.quantidadeAvaliacoesCapturada} avaliação(ões) — dado capturado em ${google.dataCaptura}. Não representa atualização automática.</span>
      </div>
      <a class="btn btn--ghost" href="${google.linkAvaliacao}" target="_blank" rel="noopener">Ver/avaliar no Google →</a>
    `;
  } else {
    alvo.innerHTML = `<div class="ctaBox__text"><span>Ainda não há avaliações públicas cadastradas.</span></div>`;
  }
}

async function boot() {
  setYear();
  themeToggle();
  mobileMenu();
  chatUI();
  setWhatsLinks();

  const dados = await carregarDados();
  const categorias = unificarCategorias(dados);

  renderChipsSolucoes(categorias);

  renderCatalogo(categorias, {
    gridEl: document.getElementById("gridCatalogo"),
    filtrosEl: document.getElementById("filtrosCatalogo")
  });

  renderDestaques(categorias, document.getElementById("gridDestaques"), [
    "site-comercial-catalogo",
    "tag-nfc-personalizada",
    "impressao-sob-medida",
    "kit-revenda-start",
    "pedido-registro-marca"
  ]);

  renderDestaques(categorias, document.getElementById("gridRevenda"), [
    "kit-revenda-start",
    "kit-revenda-pro",
    "aplicativo-mobile-adicional"
  ]);

  renderComparacaoSites(categorias, document.getElementById("tabelaComparativa"));
  renderFaq(dados);
  renderPagamento(dados);
  renderProvaSocial(dados);

  const raizOrcamento = document.getElementById("assistenteOrcamento");
  if (raizOrcamento) {
    iniciarOrcamento({
      raiz: raizOrcamento,
      opcoesEntrada: dados.fluxo?.entrada?.opcoes || [],
      categorias
    });
  }
}

boot();

setTimeout(() => {
  try {
    if (window.IV_CHAT && typeof window.IV_CHAT.boot === "function") {
      window.IV_CHAT.boot();
    }
  } catch (e) {}
}, 0);
