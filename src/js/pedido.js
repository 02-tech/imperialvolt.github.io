/* Imperial Volt — vitrine de presentes e carrinho como montador de pedido (sem pagamento online).
   Preços, extras, combos, Pix e promoções vêm de dados-site/presentes.json; nada de preço fixo aqui.
   Regra de preço: 15% no Pix OU promoção vigente, conforme a oferta (nunca os dois no mesmo item).
   O pedido fica salvo no navegador e é finalizado pelo WhatsApp com a mensagem já organizada. */

import { formatarMoeda } from "./data.js";
import { linkWhatsApp } from "./whatsapp.js";

const $ = (seletor, raiz = document) => raiz.querySelector(seletor);
const CHAVE = "iv-pedido-v1";
const reduz = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

function criar(tag, className, texto) {
  const elemento = document.createElement(tag);
  if (className) elemento.className = className;
  if (texto != null) elemento.textContent = texto;
  return elemento;
}
// arredonda para centavos, meio centavo para cima (evita 84,915 virar 84,91 por imprecisão de ponto flutuante)
const centavos = (valor) => Math.round(Number((valor * 100).toFixed(6))) / 100;

let dados = null;
let estado = { itens: [], nome: "", observacoes: "" };
let ultimoFoco = null;

// ---------- persistência ----------
function carregarEstado() {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE) || "null");
    if (salvo && Array.isArray(salvo.itens)) estado = { itens: salvo.itens, nome: salvo.nome || "", observacoes: salvo.observacoes || "" };
  } catch { /* sem armazenamento: o pedido vale só nesta visita */ }
}
function salvarEstado() {
  try { localStorage.setItem(CHAVE, JSON.stringify(estado)); } catch { /* ok */ }
}

// ---------- catálogo e preços ----------
const produto = (id) => dados?.produtos.find((p) => p.id === id) || dados?.fisico?.produtos?.find((p) => p.id === id) || null;
const extra = (id) => dados?.extras.find((e) => e.id === id) || null;

function extrasDisponiveis(item) {
  const p = produto(item.produtoId);
  if (!p) return [];
  if (p.tipo === "fisico") {
    const lista = [];
    if (p.elegivelAproximacao) lista.push("aproximacao-combo");
    if (p.elegivelAproximacao) lista.push("homenagem-combo-30");
    if (p.personalizacaoSimples) lista.push("personalizacao-simples");
    return lista;
  }
  return p.extrasPermitidos || [];
}

function promocaoDo(produtoId, hoje = new Date()) {
  const dia = hoje.toISOString().slice(0, 10);
  const vigentes = (dados?.promocoes || []).filter((promo) => promo.ativa && promo.aplicaA?.includes(produtoId)
    && (!promo.inicio || promo.inicio <= dia) && (!promo.fim || promo.fim >= dia));
  return vigentes.sort((a, b) => b.percentual - a.percentual)[0] || null;
}

export function calcularLinha(item) {
  const p = produto(item.produtoId);
  if (!p) return null;
  const variante = p.variantes?.find((v) => v.id === item.varianteId) || null;
  const base = variante ? variante.preco : p.preco;
  // homenagem de combo só vale com a aproximação presente (física: extra; avulsa: já inclusa)
  const extras = (item.extras || []).map(extra).filter(Boolean).filter((e) => !e.requer || p.tipo !== "fisico" || item.extras.includes(e.requer));
  const unitario = centavos(base + extras.reduce((soma, e) => soma + e.preco, 0));
  const qtd = Math.max(1, item.qtd || 1);
  const promo = promocaoDo(p.id);
  const pixPct = dados.regras.pixPercentual || 0;
  const unitarioPromo = promo ? centavos(unitario * (1 - promo.percentual / 100)) : null;
  const unitarioPix = !promo && p.pixElegivel ? centavos(unitario * (1 - pixPct / 100)) : null;
  return {
    produto: p, variante, extras, qtd, base, unitario, promo, unitarioPromo, unitarioPix,
    total: centavos((unitarioPromo ?? unitario) * qtd),
    totalCheio: centavos(unitario * qtd),
    totalPix: centavos((unitarioPromo ?? unitarioPix ?? unitario) * qtd)
  };
}

export function calcularTotais() {
  const linhas = estado.itens.map(calcularLinha).filter(Boolean);
  const soma = (campo) => centavos(linhas.reduce((t, l) => t + l[campo], 0));
  const cheio = soma("totalCheio"), total = soma("total"), pix = soma("totalPix");
  return { linhas, cheio, total, pix, descontoPromo: centavos(cheio - total), economiaPix: centavos(total - pix), quantidade: linhas.reduce((t, l) => t + l.qtd, 0) };
}

// ---------- ações ----------
const novoUid = () => Math.random().toString(36).slice(2, 9);

export function adicionar(produtoId, { varianteId = null, qtd = 1, extras = [] } = {}) {
  const p = produto(produtoId);
  if (!p) return null;
  const item = { uid: novoUid(), produtoId, varianteId: varianteId || p.varianteInicial || null, qtd, extras: [...extras], conteudo: "" };
  estado.itens.push(item);
  salvarEstado();
  renderPainel();
  const n = $("#pedidoContador"); if (n) { n.classList.remove("pulsa"); void n.offsetWidth; n.classList.add("pulsa"); }
  avisar(`${p.nome} adicionada ao pedido`);
  oferecerUpsell(item);
  return item.uid;
}
function itemPorUid(uid) { return estado.itens.find((i) => i.uid === uid); }
function alterar(uid, mudanca) {
  const item = itemPorUid(uid);
  if (!item) return;
  Object.assign(item, mudanca);
  // sem aproximação, a homenagem de combo de um produto físico sai junto
  const p = produto(item.produtoId);
  if (p?.tipo === "fisico" && !item.extras.includes("aproximacao-combo")) item.extras = item.extras.filter((e) => e !== "homenagem-combo-30");
  salvarEstado();
  renderPainel();
}
function alternarExtra(uid, extraId, ligado) {
  const item = itemPorUid(uid);
  if (!item) return;
  const extras = new Set(item.extras);
  if (ligado) extras.add(extraId); else extras.delete(extraId);
  alterar(uid, { extras: [...extras] });
}
function remover(uid) {
  estado.itens = estado.itens.filter((i) => i.uid !== uid);
  salvarEstado();
  renderPainel();
}
function limpar() {
  estado = { itens: [], nome: estado.nome, observacoes: "" };
  salvarEstado();
  renderPainel();
}

// ---------- mensagem do WhatsApp ----------
export function montarMensagemPedido() {
  const { linhas, cheio, total, pix, descontoPromo } = calcularTotais();
  const m = ["Olá! Montei este pedido no site da Imperial Volt:", ""];
  linhas.forEach((l, i) => {
    const item = estado.itens[i];
    m.push(`${i + 1}. ${l.produto.nome}${l.variante ? ` (${l.variante.rotulo})` : ""}`);
    m.push(`   Quantidade: ${l.qtd}`);
    m.push(`   Preço unitário: ${formatarMoeda(l.base)}`);
    l.extras.forEach((e) => m.push(`   Adicional: ${e.nome} (+ ${formatarMoeda(e.preco)})`));
    if (item.conteudo) m.push(`   Personalização: ${item.conteudo}`);
    if (l.promo) m.push(`   Promoção: ${l.promo.nome} (-${l.promo.percentual}%)`);
    m.push(`   Subtotal: ${formatarMoeda(l.total)}${l.unitarioPix ? ` (no Pix: ${formatarMoeda(l.totalPix)})` : ""}`);
  });
  m.push("");
  if (descontoPromo > 0) m.push(`Preço cheio: ${formatarMoeda(cheio)}`, `Descontos de promoção: - ${formatarMoeda(descontoPromo)}`);
  m.push(`Total estimado: ${formatarMoeda(total)}`);
  if (pix < total) m.push(`Total estimado no Pix: ${formatarMoeda(pix)} (${dados.regras.pixPercentual}% de desconto nos itens elegíveis, sem somar com promoção)`);
  if (estado.observacoes.trim()) m.push("", `Observações: ${estado.observacoes.trim()}`);
  if (estado.nome.trim()) m.push(`Meu nome: ${estado.nome.trim()}`);
  m.push("", "Pode confirmar valores, prazo e próximos passos?");
  // o formatador de moeda usa espaço não separável; na mensagem fica o espaço comum
  return m.join("\n").replace(/ /g, " ");
}

// ---------- interface: aviso ----------
function avisar(texto) {
  let aviso = $("#pedidoAviso");
  if (!aviso) {
    aviso = criar("div", "pedido-aviso");
    aviso.id = "pedidoAviso";
    aviso.setAttribute("role", "status");
    document.body.appendChild(aviso);
  }
  aviso.textContent = texto;
  aviso.classList.add("is-visible");
  clearTimeout(avisar.t);
  avisar.t = setTimeout(() => aviso.classList.remove("is-visible"), 2600);
}

// ---------- interface: upsell (leve, opcional, sem bloquear a página) ----------
function oferta({ titulo, texto, preco, rotuloSim, aoAceitar }) {
  $("#pedidoOferta")?.remove();
  const caixa = criar("div", "pedido-oferta");
  caixa.id = "pedidoOferta";
  caixa.setAttribute("role", "dialog");
  caixa.setAttribute("aria-labelledby", "pedidoOfertaTitulo");
  const h = criar("h3", "", titulo); h.id = "pedidoOfertaTitulo";
  caixa.append(h, criar("p", "", texto), criar("strong", "pedido-oferta__preco", `+ ${formatarMoeda(preco)}`));
  const acoes = criar("div", "pedido-oferta__acoes");
  const sim = criar("button", "button button--lime button--small", rotuloSim); sim.type = "button";
  const nao = criar("button", "pedido-oferta__nao", "Continuar sem adicionar"); nao.type = "button";
  const fechar = () => { caixa.remove(); document.removeEventListener("keydown", esc); };
  const esc = (e) => { if (e.key === "Escape") fechar(); };
  sim.addEventListener("click", () => { fechar(); aoAceitar(); });
  nao.addEventListener("click", fechar);
  document.addEventListener("keydown", esc);
  acoes.append(sim, nao);
  caixa.appendChild(acoes);
  document.body.appendChild(caixa);
  sim.focus({ preventScroll: true });
}
function oferecerUpsell(item) {
  const p = produto(item.produtoId);
  if (!p) return;
  const homenagem = extra("homenagem-combo-30");
  const ofertaHomenagem = () => oferta({
    titulo: "Quer transformar essa aproximação em uma homenagem completa?",
    texto: "Podemos criar uma experiência digital personalizada com fotos, mensagens e outros detalhes especiais. Homenagem personalizada por 30 dias.",
    preco: homenagem.preco, rotuloSim: "Adicionar a homenagem",
    aoAceitar: () => { alternarExtra(item.uid, "homenagem-combo-30", true); avisar("Homenagem adicionada ao presente"); }
  });
  if (p.tipo === "fisico" && p.elegivelAproximacao) {
    const aprox = extra("aproximacao-combo");
    oferta({
      titulo: "Torne este presente ainda mais especial",
      texto: "Adicione uma experiência por aproximação. A pessoa aproxima o celular e acessa o conteúdo que você preparou para ela.",
      preco: aprox.preco, rotuloSim: "Adicionar ao presente",
      aoAceitar: () => { alternarExtra(item.uid, "aproximacao-combo", true); avisar("Experiência por aproximação adicionada"); setTimeout(ofertaHomenagem, reduz() ? 0 : 350); }
    });
  } else if ((p.extrasPermitidos || []).includes("homenagem-combo-30")) {
    ofertaHomenagem();
  }
}

// ---------- interface: painel do pedido ----------
function renderPainel() {
  const contador = $("#pedidoContador");
  const { linhas, total, pix, cheio, descontoPromo, quantidade } = calcularTotais();
  if (contador) { contador.textContent = String(quantidade); contador.hidden = !quantidade; }
  const botao = $("#pedidoBotao");
  if (botao) botao.setAttribute("aria-label", quantidade ? `Abrir pedido (${quantidade} ${quantidade === 1 ? "item" : "itens"})` : "Abrir pedido (vazio)");
  const lista = $("#pedidoLista");
  if (!lista) return;
  lista.replaceChildren();
  $("#pedidoVazio").hidden = linhas.length > 0;
  $("#pedidoRodape").hidden = linhas.length === 0;
  linhas.forEach((l, i) => {
    const item = estado.itens[i];
    const li = criar("li", "pedido-item");
    const topo = criar("div", "pedido-item__topo");
    topo.append(criar("strong", "", l.produto.nome));
    const rem = criar("button", "pedido-item__remover", "Remover"); rem.type = "button";
    rem.setAttribute("aria-label", `Remover ${l.produto.nome}`);
    rem.addEventListener("click", () => remover(item.uid));
    topo.appendChild(rem);
    li.appendChild(topo);

    if (l.produto.variantes?.length) {
      const campo = criar("label", "pedido-campo");
      campo.appendChild(criar("span", "", "Período"));
      const sel = criar("select", "");
      l.produto.variantes.forEach((v) => { const o = criar("option", "", `${v.rotulo}: ${formatarMoeda(v.preco)}`); o.value = v.id; o.selected = v.id === item.varianteId; sel.appendChild(o); });
      sel.addEventListener("change", () => alterar(item.uid, { varianteId: sel.value }));
      campo.appendChild(sel);
      li.appendChild(campo);
    }

    const qtd = criar("div", "pedido-qtd");
    qtd.appendChild(criar("span", "", "Quantidade"));
    const menos = criar("button", "", "−"); menos.type = "button"; menos.setAttribute("aria-label", "Diminuir quantidade");
    const valor = criar("output", "", String(l.qtd));
    const mais = criar("button", "", "+"); mais.type = "button"; mais.setAttribute("aria-label", "Aumentar quantidade");
    menos.disabled = l.qtd <= 1;
    menos.addEventListener("click", () => alterar(item.uid, { qtd: Math.max(1, l.qtd - 1) }));
    mais.addEventListener("click", () => alterar(item.uid, { qtd: Math.min(20, l.qtd + 1) }));
    qtd.append(menos, valor, mais);
    li.appendChild(qtd);

    extrasDisponiveis(item).forEach((extraId) => {
      const e = extra(extraId);
      if (!e) return;
      const bloqueado = l.produto.tipo === "fisico" && e.requer && !item.extras.includes(e.requer);
      const rotulo = criar("label", "pedido-extra");
      const caixa = document.createElement("input");
      caixa.type = "checkbox"; caixa.checked = item.extras.includes(extraId); caixa.disabled = bloqueado;
      caixa.addEventListener("change", () => alternarExtra(item.uid, extraId, caixa.checked));
      rotulo.append(caixa, criar("span", "", `${e.nome} (+ ${formatarMoeda(e.preco)})`));
      li.appendChild(rotulo);
    });

    if (l.produto.campoConteudo || l.produto.tipo === "digital") {
      const campo = criar("label", "pedido-campo");
      campo.appendChild(criar("span", "", item.extras.includes("homenagem-combo-30") ? "Para quem é a homenagem e a ocasião" : (l.produto.campoConteudo || "Para quem é e qual a ocasião")));
      const entrada = criar("input", "");
      entrada.type = "text"; entrada.value = item.conteudo || "";
      entrada.placeholder = l.produto.tipo === "digital" || item.extras.includes("homenagem-combo-30") ? "Ex.: aniversário da minha mãe" : "Ex.: @perfil, link de um vídeo ou playlist";
      entrada.addEventListener("change", () => { item.conteudo = entrada.value.trim(); salvarEstado(); });
      campo.appendChild(entrada);
      li.appendChild(campo);
    }

    const preco = criar("p", "pedido-item__preco");
    if (l.promo) {
      preco.append(criar("s", "", formatarMoeda(l.totalCheio)), criar("strong", "", formatarMoeda(l.total)), criar("small", "", `${l.promo.nome}: -${l.promo.percentual}% (não soma com o Pix)`));
    } else {
      preco.append(criar("strong", "", formatarMoeda(l.total)));
      if (l.unitarioPix) preco.appendChild(criar("small", "", `ou ${formatarMoeda(l.totalPix)} no Pix`));
    }
    li.appendChild(preco);
    lista.appendChild(li);
  });

  $("#pedidoTotal").textContent = formatarMoeda(total);
  $("#pedidoPix").textContent = formatarMoeda(pix);
  $("#pedidoLinhaPix").hidden = !(pix < total);
  $("#pedidoLinhaPromo").hidden = !(descontoPromo > 0);
  $("#pedidoPromo").textContent = `- ${formatarMoeda(descontoPromo)}`;
  $("#pedidoCheio").textContent = formatarMoeda(cheio);
}

function abrirPainel() {
  const painel = $("#pedidoPainel");
  if (!painel) return;
  ultimoFoco = document.activeElement;
  painel.hidden = false;
  document.body.classList.add("pedido-aberto");
  requestAnimationFrame(() => painel.classList.add("is-open"));
  $("#pedidoFechar").focus();
}
function fecharPainel() {
  const painel = $("#pedidoPainel");
  if (!painel || painel.hidden) return;
  painel.classList.remove("is-open");
  document.body.classList.remove("pedido-aberto");
  setTimeout(() => { painel.hidden = true; }, reduz() ? 0 : 280);
  ultimoFoco?.focus?.({ preventScroll: true });
}

// ---------- vitrine de presentes ----------
function renderVitrine() {
  const alvo = $("#vitrinePresentes");
  if (!alvo) return;
  alvo.replaceChildren();
  const pix = dados.regras.pixPercentual;
  dados.produtos.forEach((p) => {
    const card = criar("article", `presente-card presente-card--${p.tipo}`);
    card.dataset.produto = p.id;
    card.appendChild(criar("span", "presente-card__tipo", p.tipo === "digital" ? "Presente digital" : "Presente interativo"));
    card.appendChild(criar("h3", "", p.nome));
    card.appendChild(criar("p", "presente-card__chamada", p.chamada));
    card.appendChild(criar("p", "presente-card__desc", p.descricao));

    let varianteSel = p.varianteInicial || null;
    const preco = criar("p", "presente-card__preco");
    const atualizarPreco = () => {
      const v = p.variantes?.find((x) => x.id === varianteSel);
      const valor = v ? v.preco : p.preco;
      const promo = promocaoDo(p.id);
      preco.replaceChildren();
      if (promo) {
        preco.append(criar("s", "", formatarMoeda(valor)), criar("strong", "", formatarMoeda(centavos(valor * (1 - promo.percentual / 100)))), criar("small", "", `${promo.nome}: -${promo.percentual}%`));
      } else {
        preco.append(criar("strong", "", formatarMoeda(valor)));
        if (p.pixElegivel) preco.appendChild(criar("small", "", `ou ${formatarMoeda(centavos(valor * (1 - pix / 100)))} no Pix (${pix}% de desconto)`));
      }
    };

    if (p.variantes?.length) {
      const grupo = criar("div", "presente-card__variantes");
      grupo.setAttribute("role", "radiogroup");
      grupo.setAttribute("aria-label", "Período disponível");
      p.variantes.forEach((v) => {
        const b = criar("button", `variante${v.destaque ? " variante--destaque" : ""}`);
        b.type = "button";
        b.setAttribute("role", "radio");
        b.dataset.variante = v.id;
        b.append(criar("span", "", v.rotulo), criar("small", "", formatarMoeda(v.preco)));
        if (v.destaque) b.appendChild(criar("em", "", "Mais escolhida"));
        const marcar = () => grupo.querySelectorAll(".variante").forEach((x) => { const on = x.dataset.variante === varianteSel; x.classList.toggle("is-active", on); x.setAttribute("aria-checked", String(on)); x.tabIndex = on ? 0 : -1; });
        b.addEventListener("click", () => { varianteSel = v.id; marcar(); atualizarPreco(); });
        b.addEventListener("keydown", (e) => {
          if (!["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(e.key)) return;
          e.preventDefault();
          const k = p.variantes.findIndex((x) => x.id === varianteSel) + (e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1);
          varianteSel = p.variantes[(k + p.variantes.length) % p.variantes.length].id; marcar(); atualizarPreco();
          grupo.querySelector(`[data-variante="${varianteSel}"]`).focus();
        });
        grupo.appendChild(b);
        marcar();
      });
      card.appendChild(grupo);
      if (p.condicao) card.appendChild(criar("p", "presente-card__condicao", p.condicao));
    }
    atualizarPreco();
    card.appendChild(preco);

    const lista = criar("ul", "presente-card__lista");
    p.inclui.forEach((t) => lista.appendChild(criar("li", "", t)));
    card.appendChild(lista);
    if (!p.variantes?.length && p.condicao) card.appendChild(criar("p", "presente-card__condicao", p.condicao));

    const acoes = criar("div", "presente-card__acoes");
    const add = criar("button", "button button--lime", "Adicionar ao pedido");
    add.type = "button";
    add.addEventListener("click", () => adicionar(p.id, { varianteId: varianteSel }));
    acoes.appendChild(add);
    if (p.exemplos) {
      const ex = criar("a", "presente-card__exemplo", "Ver exemplos ↗");
      ex.href = p.exemplos; ex.target = "_blank"; ex.rel = "noopener";
      acoes.appendChild(ex);
    }
    card.appendChild(acoes);
    alvo.appendChild(card);
  });
}

// ---------- inicialização ----------
export function iniciarPedido(presentes) {
  if (!presentes?.produtos) return;
  dados = presentes;
  carregarEstado();
  // itens salvos que deixaram de existir (produto retirado) saem do pedido
  estado.itens = estado.itens.filter((i) => produto(i.produtoId));
  renderVitrine();

  $("#pedidoBotao")?.addEventListener("click", abrirPainel);
  $("#pedidoFechar")?.addEventListener("click", fecharPainel);
  $("#pedidoContinuar")?.addEventListener("click", fecharPainel);
  $("#pedidoFundo")?.addEventListener("click", fecharPainel);
  $("#pedidoLimpar")?.addEventListener("click", limpar);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("#pedidoOferta")) fecharPainel(); });
  const nome = $("#pedidoNome"), obs = $("#pedidoObs");
  if (nome) { nome.value = estado.nome; nome.addEventListener("input", () => { estado.nome = nome.value; salvarEstado(); }); }
  if (obs) { obs.value = estado.observacoes; obs.addEventListener("input", () => { estado.observacoes = obs.value; salvarEstado(); }); }
  $("#pedidoFinalizar")?.addEventListener("click", () => {
    if (!estado.itens.length) return;
    window.open(linkWhatsApp(montarMensagemPedido()), "_blank", "noopener");
  });
  renderPainel();

  // gancho para testes e para o Voltz-Bot
  window.IVPedido = {
    adicionar, remover, alterar, alternarExtra, limpar, calcularTotais, montarMensagemPedido,
    estado: () => JSON.parse(JSON.stringify(estado)),
    _dados: () => dados,
    _definirDados(novos) { dados = novos; renderVitrine(); renderPainel(); }
  };
}
