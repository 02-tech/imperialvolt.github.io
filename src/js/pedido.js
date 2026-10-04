/* Imperial Volt — catálogo e preços único + pedido único (sem pagamento online).
   Presentes (dados-site/presentes.json) e serviços (dados-site/servicos.json) aparecem no MESMO formato de cartão, com
   cada preço uma única vez, e vão para o MESMO pedido, finalizado pelo WhatsApp com a mensagem organizada.
   Regra de preço: 15% no Pix OU promoção vigente, conforme a oferta (nunca os dois no mesmo item).
   Valores "a partir de" entram no total como mínimo; mensalidades somam à parte; "sob orçamento" fica fora do total. */

import { formatarMoeda, prazoFormatado, precoFormatado } from "./data.js";
import { linkWhatsApp } from "./whatsapp.js";

const $ = (seletor, raiz = document) => raiz.querySelector(seletor);
const CHAVE = "iv-pedido-v1";
const reduz = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const DESTAQUES = new Set(["homenagem-digital", "site-institucional-estatico", "sistema-web-painel-administrativo", "automacao-simples"]);

function criar(tag, className, texto) {
  const elemento = document.createElement(tag);
  if (className) elemento.className = className;
  if (texto != null) elemento.textContent = texto;
  return elemento;
}
// arredonda para centavos, meio centavo para cima (evita 84,915 virar 84,91 por imprecisão de ponto flutuante)
const centavos = (valor) => Math.round(Number((valor * 100).toFixed(6))) / 100;
const moeda = (valor) => formatarMoeda(valor).replace(/ /g, " ");

let dados = null;      // presentes.json (regras, promoções, extras)
let abas = [];         // [{ id, nome, descricao, itens: [produto] }]
let produtos = [];     // todos os produtos do catálogo, num só formato
let estado = { itens: [], nome: "", observacoes: "" };
let ultimoFoco = null;
let abaAtiva = "presentes";
let servicosBase = [];

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

// ---------- catálogo único ----------
function deServico(item, categoria) {
  const base = item.preco ?? item.precoInicial ?? item.precoMinimo ?? null;
  const mensal = item.tipoPreco === "mensal";
  const detalhes = [];
  if (item.idealPara) detalhes.push(["Ideal para", item.idealPara]);
  if (item.quandoUsar) detalhes.push(["Quando usar", item.quandoUsar]);
  if (item.quandoNaoNecessario) detalhes.push(["Quando não é necessário", item.quandoNaoNecessario]);
  if (item.custosExternos?.length) detalhes.push(["Custos externos", item.custosExternos.join(" ")]);
  if (item.observacao) detalhes.push(["Observação", item.observacao]);
  return {
    id: item.id, tipo: "servico", categoriaId: categoria.id, categoriaNome: categoria.nome,
    nome: item.nome, descricao: item.descricao, inclui: item.inclui || [], detalhes,
    preco: base, precoTexto: precoFormatado(item).replace(/ /g, " "),
    aPartirDe: item.precoInicial != null || item.precoMinimo != null || /a partir de/.test(item.tipoPreco || ""),
    mensal, pixElegivel: base != null && item.precoPix != null && !mensal,
    prazo: prazoFormatado(item), quantidade: false, campoConteudo: "Conte rapidamente o que você precisa (opcional)"
  };
}
function dePresente(p) {
  const detalhes = p.condicao ? [["Condição", p.condicao]] : [];
  return { ...p, categoriaId: "presentes", categoriaNome: "Presentes", detalhes, quantidade: true, aPartirDe: false, mensal: false };
}
function montarCatalogo(presentes, categoriasServico) {
  const presentesItens = [...(presentes.produtos || []), ...(presentes.fisico?.produtos || [])].map(dePresente);
  abas = [{ id: "presentes", nome: "Presentes", descricao: "Homenagens digitais personalizadas e presentes interativos por aproximação. Presentes físicos em preparação.", itens: presentesItens }];
  (categoriasServico || []).forEach((c) => abas.push({ id: c.id, nome: c.nome, descricao: c.descricao, itens: c.itens.map((i) => deServico(i, c)) }));
  produtos = abas.flatMap((a) => a.itens);
}
const produto = (id) => produtos.find((p) => p.id === id) || null;
const extra = (id) => dados?.extras.find((e) => e.id === id) || null;

function extrasDisponiveis(item) {
  const p = produto(item.produtoId);
  if (!p) return [];
  if (p.tipo === "fisico") {
    const lista = [];
    if (p.elegivelAproximacao) lista.push("aproximacao-combo", "homenagem-combo-30");
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

// texto de preço igual em cartão, pedido e mensagem
function textoPreco(p, valor) {
  if (valor == null) return p.precoTexto || "sob orçamento";
  if (p.tipo === "servico") return p.precoTexto;
  return moeda(valor);
}

export function calcularLinha(item) {
  const p = produto(item.produtoId);
  if (!p) return null;
  const variante = p.variantes?.find((v) => v.id === item.varianteId) || null;
  const base = variante ? variante.preco : p.preco;
  const qtd = p.quantidade ? Math.max(1, item.qtd || 1) : 1;
  if (base == null) {
    return { produto: p, variante, extras: [], qtd, base: null, sobOrcamento: true, total: 0, totalCheio: 0, totalPix: 0, unitarioPix: null, promo: null };
  }
  const extras = (item.extras || []).map(extra).filter(Boolean).filter((e) => !e.requer || p.tipo !== "fisico" || item.extras.includes(e.requer));
  const unitario = centavos(base + extras.reduce((soma, e) => soma + e.preco, 0));
  const promo = promocaoDo(p.id);
  const pixPct = dados.regras.pixPercentual || 0;
  const unitarioPromo = promo ? centavos(unitario * (1 - promo.percentual / 100)) : null;
  const unitarioPix = !promo && p.pixElegivel ? centavos(unitario * (1 - pixPct / 100)) : null;
  return {
    produto: p, variante, extras, qtd, base, unitario, promo, unitarioPromo, unitarioPix, sobOrcamento: false,
    total: centavos((unitarioPromo ?? unitario) * qtd),
    totalCheio: centavos(unitario * qtd),
    totalPix: centavos((unitarioPromo ?? unitarioPix ?? unitario) * qtd)
  };
}

export function calcularTotais() {
  const linhas = estado.itens.map(calcularLinha).filter(Boolean);
  const unicas = linhas.filter((l) => !l.sobOrcamento && !l.produto.mensal);
  const soma = (lista, campo) => centavos(lista.reduce((t, l) => t + l[campo], 0));
  const cheio = soma(unicas, "totalCheio"), total = soma(unicas, "total"), pix = soma(unicas, "totalPix");
  const mensais = linhas.filter((l) => !l.sobOrcamento && l.produto.mensal);
  return {
    linhas, cheio, total, pix, descontoPromo: centavos(cheio - total), economiaPix: centavos(total - pix),
    aPartirDe: unicas.some((l) => l.produto.aPartirDe), mensal: soma(mensais, "total"), mensalAPartirDe: mensais.some((l) => l.produto.aPartirDe),
    sobOrcamento: linhas.filter((l) => l.sobOrcamento).length,
    quantidade: linhas.reduce((t, l) => t + l.qtd, 0)
  };
}

// ---------- ações ----------
const novoUid = () => Math.random().toString(36).slice(2, 9);

export function adicionar(produtoId, { varianteId = null, qtd = 1, extras = [], silencioso = false } = {}) {
  const p = produto(produtoId);
  if (!p) return null;
  // serviço já no pedido não duplica
  if (p.tipo === "servico") {
    const existente = estado.itens.find((i) => i.produtoId === produtoId);
    if (existente) { avisar(`${p.nome} já está no pedido`); return existente.uid; }
  }
  const item = { uid: novoUid(), produtoId, varianteId: varianteId || p.varianteInicial || null, qtd, extras: [...extras], conteudo: "" };
  estado.itens.push(item);
  salvarEstado();
  renderPainel();
  const n = $("#pedidoContador"); if (n) { n.classList.remove("pulsa"); void n.offsetWidth; n.classList.add("pulsa"); }
  avisar(`${p.nome} no pedido`);
  if (!silencioso) oferecerUpsell(item);
  return item.uid;
}
function itemPorUid(uid) { return estado.itens.find((i) => i.uid === uid); }
function alterar(uid, mudanca) {
  const item = itemPorUid(uid);
  if (!item) return;
  Object.assign(item, mudanca);
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
  const t = calcularTotais();
  const m = ["Olá! Montei este pedido no site da Imperial Volt:", ""];
  t.linhas.forEach((l, i) => {
    const item = estado.itens[i];
    m.push(`${i + 1}. ${l.produto.nome}${l.variante ? ` (${l.variante.rotulo})` : ""}${l.produto.tipo === "servico" ? ` [${l.produto.categoriaNome}]` : ""}`);
    if (l.produto.quantidade) m.push(`   Quantidade: ${l.qtd}`);
    m.push(`   Preço${l.produto.quantidade ? " unitário" : ""}: ${textoPreco(l.produto, l.base)}`);
    l.extras.forEach((e) => m.push(`   Adicional: ${e.nome} (+ ${moeda(e.preco)})`));
    if (item.conteudo) m.push(`   Personalização: ${item.conteudo}`);
    if (l.promo) m.push(`   Promoção: ${l.promo.nome} (-${l.promo.percentual}%)`);
    if (!l.sobOrcamento && (l.produto.quantidade || l.extras.length || l.promo)) m.push(`   Subtotal: ${moeda(l.total)}${l.unitarioPix ? ` (no Pix: ${moeda(l.totalPix)})` : ""}`);
  });
  m.push("");
  if (t.descontoPromo > 0) m.push(`Preço cheio: ${moeda(t.cheio)}`, `Descontos de promoção: - ${moeda(t.descontoPromo)}`);
  if (t.total > 0) m.push(`Total estimado: ${t.aPartirDe ? "a partir de " : ""}${moeda(t.total)}`);
  if (t.total > 0 && t.pix < t.total) m.push(`Total estimado no Pix: ${t.aPartirDe ? "a partir de " : ""}${moeda(t.pix)} (${dados.regras.pixPercentual}% de desconto nos itens elegíveis, sem somar com promoção)`);
  if (t.mensal > 0) m.push(`Mensalidade: ${t.mensalAPartirDe ? "a partir de " : ""}${moeda(t.mensal)}/mês`);
  if (t.sobOrcamento) m.push(`Itens sob orçamento: ${t.sobOrcamento}`);
  if (t.aPartirDe) m.push("Valores \"a partir de\" são o mínimo do formato; o valor final depende do escopo.");
  if (estado.observacoes.trim()) m.push("", `Observações: ${estado.observacoes.trim()}`);
  if (estado.nome.trim()) m.push(`Meu nome: ${estado.nome.trim()}`);
  m.push("", "Pode confirmar valores, prazo e próximos passos?");
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
  avisar.t = setTimeout(() => aviso.classList.remove("is-visible"), 2400);
}

// ---------- interface: oferta opcional (upsell), leve e sem bloquear a página ----------
function oferta({ titulo, texto, preco, rotuloSim, aoAceitar }) {
  $("#pedidoOferta")?.remove();
  const caixa = criar("div", "pedido-oferta");
  caixa.id = "pedidoOferta";
  caixa.setAttribute("role", "dialog");
  caixa.setAttribute("aria-labelledby", "pedidoOfertaTitulo");
  const h = criar("h3", "", titulo); h.id = "pedidoOfertaTitulo";
  caixa.append(h, criar("p", "", texto), criar("strong", "pedido-oferta__preco", `+ ${moeda(preco)}`));
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
  const t = calcularTotais();
  if (contador) { contador.textContent = String(t.quantidade); contador.hidden = !t.quantidade; }
  const botao = $("#pedidoBotao");
  if (botao) botao.setAttribute("aria-label", t.quantidade ? `Abrir pedido (${t.quantidade} ${t.quantidade === 1 ? "item" : "itens"})` : "Abrir pedido (vazio)");
  const lista = $("#pedidoLista");
  if (!lista) return;
  lista.replaceChildren();
  $("#pedidoVazio").hidden = t.linhas.length > 0;
  $("#pedidoRodape").hidden = t.linhas.length === 0;
  t.linhas.forEach((l, i) => {
    const item = estado.itens[i];
    const li = criar("li", "pedido-item");
    const topo = criar("div", "pedido-item__topo");
    const nome = criar("div", "pedido-item__nome");
    nome.append(criar("small", "", l.produto.categoriaNome), criar("strong", "", l.produto.nome));
    topo.appendChild(nome);
    const rem = criar("button", "pedido-item__remover", "Remover"); rem.type = "button";
    rem.setAttribute("aria-label", `Remover ${l.produto.nome}`);
    rem.addEventListener("click", () => remover(item.uid));
    topo.appendChild(rem);
    li.appendChild(topo);

    if (l.produto.variantes?.length) {
      const campo = criar("label", "pedido-campo");
      campo.appendChild(criar("span", "", "Período"));
      const sel = criar("select", "");
      l.produto.variantes.forEach((v) => { const o = criar("option", "", `${v.rotulo}: ${moeda(v.preco)}`); o.value = v.id; o.selected = v.id === item.varianteId; sel.appendChild(o); });
      sel.addEventListener("change", () => alterar(item.uid, { varianteId: sel.value }));
      campo.appendChild(sel);
      li.appendChild(campo);
    }

    if (l.produto.quantidade) {
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
    }

    extrasDisponiveis(item).forEach((extraId) => {
      const e = extra(extraId);
      if (!e) return;
      const bloqueado = l.produto.tipo === "fisico" && e.requer && !item.extras.includes(e.requer);
      const rotulo = criar("label", "pedido-extra");
      const caixa = document.createElement("input");
      caixa.type = "checkbox"; caixa.checked = item.extras.includes(extraId); caixa.disabled = bloqueado;
      caixa.addEventListener("change", () => alternarExtra(item.uid, extraId, caixa.checked));
      rotulo.append(caixa, criar("span", "", `${e.nome} (+ ${moeda(e.preco)})`));
      li.appendChild(rotulo);
    });

    const campo = criar("label", "pedido-campo");
    const comHomenagem = l.produto.tipo === "digital" || item.extras.includes("homenagem-combo-30");
    campo.appendChild(criar("span", "", comHomenagem ? "Para quem é e qual a ocasião" : (l.produto.campoConteudo || "Detalhes (opcional)")));
    const entrada = criar("input", "");
    entrada.type = "text"; entrada.value = item.conteudo || "";
    entrada.placeholder = comHomenagem ? "Ex.: aniversário da minha mãe" : (l.produto.tipo === "servico" ? "Ex.: site para minha pousada, com 5 páginas" : "Ex.: @perfil, link de um vídeo ou playlist");
    entrada.addEventListener("change", () => { item.conteudo = entrada.value.trim(); salvarEstado(); });
    campo.appendChild(entrada);
    li.appendChild(campo);

    const preco = criar("p", "pedido-item__preco");
    if (l.sobOrcamento) preco.append(criar("strong", "", textoPreco(l.produto, null)));
    else if (l.promo) preco.append(criar("s", "", moeda(l.totalCheio)), criar("strong", "", moeda(l.total)), criar("small", "", `${l.promo.nome}: -${l.promo.percentual}% (não soma com o Pix)`));
    else {
      preco.append(criar("strong", "", l.produto.tipo === "servico" && !l.extras.length ? textoPreco(l.produto, l.base) : moeda(l.total)));
      if (l.unitarioPix) preco.appendChild(criar("small", "", `ou ${l.produto.aPartirDe ? "a partir de " : ""}${moeda(l.totalPix)} no Pix`));
    }
    li.appendChild(preco);
    lista.appendChild(li);
  });

  const prefixo = t.aPartirDe ? "a partir de " : "";
  $("#pedidoTotal").textContent = t.total > 0 ? prefixo + moeda(t.total) : "a combinar";
  $("#pedidoPix").textContent = prefixo + moeda(t.pix);
  $("#pedidoLinhaPix").hidden = !(t.total > 0 && t.pix < t.total);
  $("#pedidoLinhaPromo").hidden = !(t.descontoPromo > 0);
  $("#pedidoPromo").textContent = `- ${moeda(t.descontoPromo)}`;
  $("#pedidoCheio").textContent = moeda(t.cheio);
  const mensal = $("#pedidoLinhaMensal");
  if (mensal) { mensal.hidden = !(t.mensal > 0); $("#pedidoMensal").textContent = `${t.mensalAPartirDe ? "a partir de " : ""}${moeda(t.mensal)}/mês`; }
  const nota = $("#pedidoNotaEscopo");
  if (nota) {
    const partes = [];
    if (t.aPartirDe) partes.push("Valores \"a partir de\" são o mínimo do formato; o final depende do escopo.");
    if (t.sobOrcamento) partes.push("Itens sob orçamento são avaliados no atendimento.");
    nota.textContent = partes.join(" ");
    nota.hidden = !partes.length;
  }
}

export function abrirPainel() {
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

// ---------- interface: catálogo (abas + cartões no mesmo formato) ----------
function cartao(p) {
  const pix = dados.regras.pixPercentual;
  const card = criar("article", `oferta-card${DESTAQUES.has(p.id) ? " oferta-card--destaque" : ""}`);
  card.dataset.produto = p.id;
  const topo = criar("div", "oferta-card__topo");
  topo.appendChild(criar("span", "oferta-card__tipo", p.tipo === "digital" ? "Presente digital" : p.tipo === "interativo" ? "Presente interativo" : p.tipo === "fisico" ? "Presente físico" : p.categoriaNome));
  if (DESTAQUES.has(p.id)) topo.appendChild(criar("span", "oferta-card__selo", "Mais escolhido"));
  card.appendChild(topo);
  card.appendChild(criar("h3", "", p.nome));
  if (p.chamada) card.appendChild(criar("p", "oferta-card__chamada", p.chamada));

  let varianteSel = p.varianteInicial || null;
  const preco = criar("div", "oferta-card__preco");
  const atualizarPreco = () => {
    const v = p.variantes?.find((x) => x.id === varianteSel);
    const valor = v ? v.preco : p.preco;
    preco.replaceChildren();
    const promo = valor != null ? promocaoDo(p.id) : null;
    if (promo) {
      preco.append(criar("s", "", moeda(valor)), criar("strong", "", moeda(centavos(valor * (1 - promo.percentual / 100)))), criar("small", "", `${promo.nome}: -${promo.percentual}%`));
    } else {
      preco.appendChild(criar("strong", "", textoPreco(p, valor)));
      if (valor != null && p.pixElegivel) preco.appendChild(criar("small", "", `ou ${p.aPartirDe ? "a partir de " : ""}${moeda(centavos(valor * (1 - pix / 100)))} no Pix`));
    }
    if (p.prazo) preco.appendChild(criar("small", "oferta-card__prazo", `Prazo: ${p.prazo}`));
  };

  if (p.variantes?.length) {
    const grupo = criar("div", "oferta-card__variantes");
    grupo.setAttribute("role", "radiogroup");
    grupo.setAttribute("aria-label", "Período disponível");
    const marcar = () => grupo.querySelectorAll(".variante").forEach((x) => { const on = x.dataset.variante === varianteSel; x.classList.toggle("is-active", on); x.setAttribute("aria-checked", String(on)); x.tabIndex = on ? 0 : -1; });
    p.variantes.forEach((v) => {
      const b = criar("button", `variante${v.destaque ? " variante--destaque" : ""}`);
      b.type = "button"; b.setAttribute("role", "radio"); b.dataset.variante = v.id;
      b.append(criar("span", "", v.rotulo));
      if (v.destaque) b.appendChild(criar("em", "", "Mais escolhida"));
      b.addEventListener("click", () => { varianteSel = v.id; marcar(); atualizarPreco(); });
      b.addEventListener("keydown", (e) => {
        if (!["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(e.key)) return;
        e.preventDefault();
        const k = p.variantes.findIndex((x) => x.id === varianteSel) + (e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1);
        varianteSel = p.variantes[(k + p.variantes.length) % p.variantes.length].id; marcar(); atualizarPreco();
        grupo.querySelector(`[data-variante="${varianteSel}"]`).focus();
      });
      grupo.appendChild(b);
    });
    marcar();
    card.appendChild(grupo);
  }
  atualizarPreco();
  card.appendChild(preco);
  if (p.descricao) card.appendChild(criar("p", "oferta-card__desc", p.descricao));
  if (p.inclui?.length) {
    const lista = criar("ul", "oferta-card__lista");
    p.inclui.slice(0, 4).forEach((t) => lista.appendChild(criar("li", "", t)));
    card.appendChild(lista);
  }
  if (p.detalhes?.length) {
    const det = criar("details", "oferta-card__detalhes");
    det.appendChild(criar("summary", "", "Ver detalhes"));
    const dl = criar("dl", "");
    p.detalhes.forEach(([rotulo, texto]) => dl.append(criar("dt", "", rotulo), criar("dd", "", texto)));
    det.appendChild(dl);
    card.appendChild(det);
  }
  const acoes = criar("div", "oferta-card__acoes");
  const add = criar("button", "button button--lime button--small", "Adicionar ao pedido");
  add.type = "button";
  add.addEventListener("click", () => adicionar(p.id, { varianteId: varianteSel }));
  acoes.appendChild(add);
  if (p.exemplos) {
    const ex = criar("a", "oferta-card__exemplo", "Ver exemplos ↗");
    ex.href = p.exemplos; ex.target = "_blank"; ex.rel = "noopener";
    acoes.appendChild(ex);
  }
  card.appendChild(acoes);
  return card;
}

export function abrirAba(id, { rolar = false } = {}) {
  const aba = abas.find((a) => a.id === id) || abas[0];
  if (!aba) return;
  abaAtiva = aba.id;
  document.querySelectorAll("#catalogoAbas [role=tab]").forEach((b) => {
    const on = b.dataset.aba === aba.id;
    b.setAttribute("aria-selected", String(on)); b.tabIndex = on ? 0 : -1; b.classList.toggle("is-active", on);
  });
  // mantém a aba ativa visível na faixa de abas (no celular a faixa rola na horizontal)
  const ativa = document.getElementById(`aba-${aba.id}`);
  const faixa = $("#catalogoAbas");
  if (ativa && faixa) faixa.scrollTo({ left: ativa.offsetLeft - faixa.offsetLeft - 16, behavior: reduz() ? "auto" : "smooth" });
  const painel = $("#catalogoPainel");
  painel.setAttribute("aria-labelledby", `aba-${aba.id}`);
  $("#catalogoDescricao").textContent = aba.descricao || "";
  const grade = $("#catalogoGrade");
  grade.replaceChildren(...aba.itens.map(cartao));
  document.querySelectorAll("[data-so-aba]").forEach((el) => { el.hidden = el.dataset.soAba !== aba.id; });
  if (rolar) $("#catalogo")?.scrollIntoView({ behavior: reduz() ? "auto" : "smooth", block: "start" });
}

function renderAbas() {
  const alvo = $("#catalogoAbas");
  if (!alvo) return;
  alvo.replaceChildren();
  abas.forEach((a, i) => {
    const b = criar("button", "catalogo-aba", a.nome);
    b.type = "button"; b.id = `aba-${a.id}`; b.dataset.aba = a.id;
    b.setAttribute("role", "tab"); b.setAttribute("aria-controls", "catalogoPainel");
    b.addEventListener("click", () => abrirAba(a.id));
    b.addEventListener("keydown", (e) => {
      if (!["ArrowRight", "ArrowLeft"].includes(e.key)) return;
      e.preventDefault();
      const k = abas.findIndex((x) => x.id === abaAtiva) + (e.key === "ArrowRight" ? 1 : -1);
      const prox = abas[(k + abas.length) % abas.length];
      abrirAba(prox.id); $(`#aba-${prox.id}`).focus();
    });
    alvo.appendChild(b);
  });
  abrirAba(abas[0].id);
}

// ---------- inicialização ----------
export function iniciarPedido(presentes, categoriasServico = []) {
  if (!presentes?.produtos) return;
  dados = presentes;
  servicosBase = categoriasServico;
  montarCatalogo(presentes, categoriasServico);
  carregarEstado();
  estado.itens = estado.itens.filter((i) => produto(i.produtoId));
  renderAbas();

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
  // links que abrem uma aba do catálogo (ex.: "Ver sites e serviços digitais")
  document.querySelectorAll("[data-aba]:not([role=tab])").forEach((link) => link.addEventListener("click", (e) => { e.preventDefault(); abrirAba(link.dataset.aba, { rolar: true }); }));
  renderPainel();

  // gancho para testes
  window.IVPedido = {
    adicionar, remover, alterar, alternarExtra, limpar, calcularTotais, montarMensagemPedido, abrirAba, abrirPainel,
    estado: () => JSON.parse(JSON.stringify(estado)),
    _dados: () => dados,
    _definirDados(novos) { dados = novos; montarCatalogo(novos, servicosBase); renderAbas(); renderPainel(); }
  };
}

// resumo para o Voltz-Bot (último item do pedido)
export function resumoParaChat() {
  const t = calcularTotais();
  const l = t.linhas[t.linhas.length - 1];
  if (!l) return null;
  return { item: l.produto.nome, categoria: l.produto.categoriaNome, valor: l.sobOrcamento ? textoPreco(l.produto, null) : (l.produto.tipo === "servico" ? textoPreco(l.produto, l.base) : moeda(l.total)), quantidade: l.produto.quantidade ? String(l.qtd) : "" };
}
