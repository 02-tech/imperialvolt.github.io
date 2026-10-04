// Teste do catálogo único e do pedido (Chrome headless via CDP, sem dependências).
// Uso: servir a raiz (python -m http.server 8000 --bind 127.0.0.1) e
//      node tools/testar-pedido.js http://127.0.0.1:8000/ <pastaCapturas>
// Cobre: catálogo único (abas, cada preço uma vez, sem blocos de preço antigos), produto adicionado, quantidade, remoção,
// adicional aceito e recusado, combo, Pix, promoção sem acumular, serviço "a partir de", mensalidade, total,
// mensagem do WhatsApp, pedido salvo, ausência de preço antigo/termos proibidos, mobile e desktop.
"use strict";
const { spawn, execFileSync } = require("child_process"); const fs = require("fs"), os = require("os"), path = require("path");
const [BASE = "http://127.0.0.1:8000/", OUT = path.join(os.tmpdir(), "iv-pedido")] = process.argv.slice(2); fs.mkdirSync(OUT, { recursive: true });
const port = 9600 + Math.floor(Math.random() * 200), prof = fs.mkdtempSync(path.join(os.tmpdir(), "ivp-"));
const ch = spawn("C:/Program Files/Google/Chrome/Application/chrome.exe", ["--headless=new", "--hide-scrollbars", `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, "about:blank"], { stdio: "ignore" });
// encerra só o Chrome deste teste, pela pasta de perfil exclusiva
const matar = () => { try { ch.kill(); } catch { } try { execFileSync("powershell", ["-NoProfile", "-Command", `Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'chrome.exe' -and $_.CommandLine -like '*${path.basename(prof)}*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }`], { stdio: "ignore" }); } catch { } };
const sleep = ms => new Promise(r => setTimeout(r, ms));
let falhas = 0; const ok = (c, m) => { console.log(`  ${c ? "ok  " : "FALHA"} ${m}`); if (!c) falhas++; };
const reais = v => "R$ " + v.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
(async () => {
  let t; for (let i = 0; i < 150; i++) { try { t = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break; } catch { await sleep(200); } }
  const ws = new WebSocket(t.find(x => x.type === "page").webSocketDebuggerUrl); await new Promise(r => ws.addEventListener("open", r));
  let id = 0; const pend = new Map(), errs = [];
  ws.addEventListener("message", e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); }
    if (m.method === "Runtime.exceptionThrown") errs.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
    if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") errs.push("console: " + m.params.args.map(a => a.value || a.description).join(" "));
    if (m.method === "Network.responseReceived" && m.params.response.status >= 400) errs.push(m.params.response.status + " " + m.params.response.url); });
  const send = (method, params = {}) => new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  // o que vem da página chega com o espaço não separável (do formatador de moeda) trocado por espaço comum
  const limparEspacos = (v) => typeof v === "string" ? v.split(String.fromCharCode(160)).join(" ") : (v && typeof v === "object" ? JSON.parse(limparEspacos(JSON.stringify(v))) : v);
  const ev = async x => { const r = await send("Runtime.evaluate", { expression: x, returnByValue: true, awaitPromise: true, userGesture: true }); if (r.result.exceptionDetails) throw new Error(x.slice(0, 120) + " -> " + JSON.stringify(r.result.exceptionDetails).slice(0, 300)); return limparEspacos(r.result.result.value); };
  const foto = async n => { const s = await send("Page.captureScreenshot", { format: "png" }); fs.writeFileSync(path.join(OUT, n + ".png"), Buffer.from(s.result.data, "base64")); };
  const clicar = async sel => ev(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});if(!e)throw new Error("sem "+${JSON.stringify(sel)});e.click();return 1})()`);
  const totais = () => ev(`window.IVPedido.calcularTotais()`);
  const preparar = `document.querySelectorAll('.reveal').forEach(e=>e.classList.add('is-visible','visible','in'));window.__aberto=[];window.open=(u)=>{window.__aberto.push(u);return null};1`;
  const textoPagina = `document.body.innerText.split(String.fromCharCode(160)).join(" ")`;
  await send("Runtime.enable"); await send("Network.enable"); await send("Page.enable");

  for (const [w, h] of [[390, 844], [1366, 768]]) {
    console.log(`\n== ${w}x${h}`);
    await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: w < 800 });
    await send("Page.navigate", { url: BASE + "?t=" + Date.now() }); await sleep(3200);
    await ev(`localStorage.clear();1`); await send("Page.reload"); await sleep(3200); await ev(preparar);

    const pag = await ev(`(()=>{const tx=${textoPagina};return {ovx:document.documentElement.scrollWidth-innerWidth,
      ordem:[...document.querySelectorAll('main > section')].map(s=>s.id||s.className.split(' ')[0]).join(' > '),
      abas:[...document.querySelectorAll('#catalogoAbas [role=tab]')].map(e=>e.textContent),
      cards:[...document.querySelectorAll('#catalogoGrade .oferta-card h3')].map(e=>e.textContent),
      antigos:['.digital-difference','#siteComparison','#orcamento','#quoteBuilder','#servicos-precos','#presentes'].filter(s=>document.querySelector(s)),
      proibidos:['vitalíci','Vitalíci','R$ 350','Landing Page','Apito','Asteca','Toque Direto','R$ 600','A partir de R$ 1.200','Tag NFC Personalizada','Orçamento guiado'].filter(p=>tx.includes(p)),
      fisicos:!!document.querySelector('#presentes-fisicos')&&document.querySelector('#presentes-fisicos').textContent.includes('Em preparação'),
      produtosFisicos:document.querySelectorAll('.product-card').length}})()`);
    ok(pag.ovx === 0, `sem rolagem lateral (${pag.ovx}px)`);
    ok(pag.ordem.startsWith("topo > conversion-strip > catalogo > solucoes-fisicas"), `ordem das seções: ${pag.ordem}`);
    ok(!pag.antigos.length, `sem blocos de preço antigos ou duplicados${pag.antigos.length ? ": " + pag.antigos.join(", ") : ""}`);
    ok(pag.abas[0] === "Presentes" && pag.abas.includes("Sites e lojas"), `abas: ${pag.abas.join(" | ")}`);
    ok(pag.cards.join("|") === "Homenagem digital personalizada|Experiência por aproximação", `aba Presentes: ${pag.cards.join(", ")}`);
    ok(!pag.proibidos.length, `sem preço antigo ou termo proibido${pag.proibidos.length ? ": " + pag.proibidos.join(", ") : ""}`);
    ok(pag.fisicos && pag.produtosFisicos === 0, "presentes físicos em preparação, nenhum produto físico à venda");
    ok(await ev(`document.querySelector('.oferta-card[data-produto=homenagem-digital] .variante.is-active').textContent.startsWith('30 dias')`) && await ev(`document.querySelector('.oferta-card[data-produto=homenagem-digital] .oferta-card__preco strong').textContent`) === "R$ 119,90", "homenagem abre em 30 dias (R$ 119,90), destacada");
    const sites = await ev(`(()=>{window.IVPedido.abrirAba('projetos-digitais');const precos=[...document.querySelectorAll('#catalogoGrade .oferta-card__preco strong')].map(e=>e.textContent);const n=${textoPagina}.split('R$ 890,00').length-1;const nota=!document.querySelector('[data-so-aba=projetos-digitais]').hidden;window.IVPedido.abrirAba('presentes');return {precos,n,nota}})()`);
    ok(sites.precos.join("|") === "a partir de R$ 890,00|a partir de R$ 1.690,00|a partir de R$ 2.990,00|a partir de R$ 3.990,00", `aba Sites e lojas: ${sites.precos.join(" · ")}`);
    ok(sites.n === 1, `R$ 890 aparece uma única vez na página (${sites.n})`);
    ok(sites.nota, "nota de domínio e hospedagem aparece só na aba de sites");
    await foto(`${w}_1_catalogo`);

    // 1) homenagem 30 dias
    await clicar('.oferta-card[data-produto=homenagem-digital] .oferta-card__acoes .button'); await sleep(300);
    ok(!(await ev(`!!document.getElementById('pedidoOferta')`)), "homenagem avulsa: sem oferta extra");
    ok(await ev(`document.getElementById('pedidoContador').textContent`) === "1", "produto adicionado: contador = 1");
    // 2) experiência por aproximação, recusa a homenagem
    await clicar('.oferta-card[data-produto=experiencia-aproximacao] .oferta-card__acoes .button'); await sleep(400);
    ok(await ev(`(document.getElementById('pedidoOferta')?.innerText||'').includes('99,90')`), "oferta opcional da homenagem por + R$ 99,90 aparece");
    await clicar('.pedido-oferta__nao'); await sleep(200);
    ok(!(await ev(`!!document.getElementById('pedidoOferta')`)), "\"Continuar sem adicionar\" fecha a oferta");
    // 3) experiência de novo, aceita a homenagem
    await clicar('.oferta-card[data-produto=experiencia-aproximacao] .oferta-card__acoes .button'); await sleep(400);
    await clicar('#pedidoOferta .button'); await sleep(300);
    let tt = await totais();
    ok(tt.linhas.length === 3 && tt.linhas[1].extras.length === 0 && tt.linhas[2].extras.length === 1, "adicional recusado numa linha e aceito na outra");
    ok(tt.linhas[2].total === 149.8, `combo aproximação + homenagem: ${reais(tt.linhas[2].total)} (49,90 + 99,90)`);

    // painel: quantidade, variante, remover
    await clicar('#pedidoBotao'); await sleep(450);
    ok(await ev(`!document.getElementById('pedidoPainel').hidden`), "painel do pedido abre");
    await clicar('#pedidoLista li:nth-child(1) .pedido-qtd button:last-of-type'); await sleep(150);
    tt = await totais(); ok(tt.linhas[0].qtd === 2 && tt.linhas[0].total === 239.8, `quantidade alterada: 2 × 119,90 = ${reais(tt.linhas[0].total)}`);
    await ev(`(()=>{const s=document.querySelector('#pedidoLista li:nth-child(1) select');s.value='7-dias';s.dispatchEvent(new Event('change'));return 1})()`); await sleep(150);
    tt = await totais(); ok(tt.linhas[0].total === 199.8, `variante alterada para 7 dias: 2 × 99,90 = ${reais(tt.linhas[0].total)}`);
    await clicar('#pedidoLista li:nth-child(2) .pedido-item__remover'); await sleep(150);
    tt = await totais(); ok(tt.linhas.length === 2, "item removido");
    ok(tt.total === 349.6, `total: ${reais(tt.total)} (199,80 + 149,80)`);
    ok(tt.pix === 297.17, `Pix 15%: ${reais(tt.pix)} (169,84 + 127,33)`);
    ok(await ev(`document.getElementById('pedidoTotal').textContent`) === "R$ 349,60" && await ev(`document.getElementById('pedidoPix').textContent`) === "R$ 297,17", "totais exibidos no painel");
    await ev(`(()=>{const i=document.querySelector('#pedidoLista li:nth-child(2) input[type=text]');i.value='aniversário da minha mãe';i.dispatchEvent(new Event('change'));const n=document.getElementById('pedidoNome');n.value='Teste';n.dispatchEvent(new Event('input'));const o=document.getElementById('pedidoObs');o.value='Entrega até sexta';o.dispatchEvent(new Event('input'));return 1})()`);
    await foto(`${w}_2_pedido`);

    // mensagem do WhatsApp
    await clicar('#pedidoFinalizar'); await sleep(200);
    const url = await ev(`window.__aberto[0]||''`);
    const msg = decodeURIComponent((url.split("text=")[1] || ""));
    ok(url.startsWith("https://wa.me/5524992144995"), "finalizar abre o WhatsApp da Imperial Volt");
    ok(["Homenagem digital personalizada (7 dias)", "Quantidade: 2", "Preço unitário: R$ 99,90", "Adicional: Homenagem digital personalizada (30 dias) (+ R$ 99,90)", "Personalização: aniversário da minha mãe", "Total estimado: R$ 349,60", "Total estimado no Pix: R$ 297,17", "Observações: Entrega até sexta", "Meu nome: Teste"].every(s => msg.includes(s)), "mensagem com produto, quantidade, variante, adicional, personalização, preços, total, Pix e observações");
    if (w === 390) console.log("     ----- mensagem -----\n" + msg.split("\n").map(l => "     " + l).join("\n"));

    // pedido salvo
    await send("Page.reload"); await sleep(3000); await ev(preparar);
    tt = await totais(); ok(tt.linhas.length === 2 && tt.total === 349.6, "pedido continua salvo depois de recarregar");

    // serviço "a partir de" e mensalidade no mesmo pedido
    await ev(`(()=>{window.IVPedido.limpar();window.IVPedido.adicionar('site-institucional-estatico');window.IVPedido.adicionar('site-institucional-estatico');window.IVPedido.adicionar('manutencao-site');window.IVPedido.adicionar('homenagem-digital');document.getElementById('pedidoOferta')?.remove();return 1})()`);
    tt = await totais();
    ok(tt.linhas.length === 3, "serviço repetido não duplica no pedido");
    ok(tt.aPartirDe && tt.total === 1009.9 && tt.mensal === 99, `total a partir de ${reais(tt.total)} (890 + 119,90) e mensalidade ${reais(tt.mensal)}/mês à parte`);
    const msg2 = await ev(`window.IVPedido.montarMensagemPedido()`);
    ok(["Site vitrine / institucional [Sites e lojas]", "Preço: a partir de R$ 890,00", "Total estimado: a partir de R$ 1.009,90", "Mensalidade: a partir de R$ 99,00/mês"].every(s => msg2.includes(s)), "mensagem com serviço a partir de, total mínimo e mensalidade");
    ok(await ev(`(()=>{window.IVPedido.abrirPainel();return document.getElementById('pedidoTotal').textContent})()`) === "a partir de R$ 1.009,90" && await ev(`document.getElementById('pedidoMensal').textContent`) === "a partir de R$ 99,00/mês", "painel mostra total mínimo e mensalidade");
    await sleep(400); await foto(`${w}_3_servicos`);
    await ev(`document.getElementById('pedidoFechar').click();1`);

    // produto físico elegível simulado (nenhum é publicado): upsell em duas etapas e combo
    await ev(`(()=>{const d=JSON.parse(JSON.stringify(window.IVPedido._dados()));d.fisico.produtos=[{id:"teste-fisico",tipo:"fisico",nome:"Peça de teste",preco:59.9,pixElegivel:true,elegivelAproximacao:true,personalizacaoSimples:true}];window.IVPedido._definirDados(d);window.IVPedido.limpar();window.IVPedido.adicionar("teste-fisico");return 1})()`); await sleep(400);
    ok(await ev(`(document.getElementById('pedidoOferta')?.innerText||'').includes('Torne este presente ainda mais especial')`), "físico elegível: oferta de aproximação (+ R$ 34,90)");
    await clicar('#pedidoOferta .button'); await sleep(700);
    ok(await ev(`(document.getElementById('pedidoOferta')?.innerText||'').includes('homenagem completa')`), "depois da aproximação: oferta da homenagem (+ R$ 99,90)");
    await clicar('#pedidoOferta .button'); await sleep(300);
    tt = await totais(); ok(tt.linhas[0].total === 194.7, `combo completo: 59,90 + 34,90 + 99,90 = ${reais(tt.linhas[0].total)}`);
    await ev(`(()=>{const u=window.IVPedido.estado().itens[0].uid;window.IVPedido.alternarExtra(u,"aproximacao-combo",false);return 1})()`);
    tt = await totais(); ok(tt.linhas[0].total === 59.9, "sem a aproximação, a homenagem de combo sai junto (R$ 59,90)");

    // promoção não acumula com o Pix
    await ev(`(()=>{const d=JSON.parse(JSON.stringify(window.IVPedido._dados()));d.promocoes=[{id:"t",ativa:true,nome:"Campanha teste",percentual:20,aplicaA:["homenagem-digital"],inicio:null,fim:null}];window.IVPedido._definirDados(d);window.IVPedido.limpar();window.IVPedido.adicionar("homenagem-digital");window.IVPedido.adicionar("experiencia-aproximacao");document.getElementById('pedidoOferta')?.remove();return 1})()`); await sleep(200);
    tt = await totais();
    ok(tt.linhas[0].total === 95.92 && tt.linhas[0].totalPix === 95.92, `homenagem com campanha 20%: ${reais(tt.linhas[0].total)}, sem Pix por cima`);
    ok(tt.linhas[1].totalPix === 42.42, `item sem campanha mantém o Pix: ${reais(tt.linhas[1].totalPix)}`);
    ok(tt.total === 145.82 && tt.pix === 138.34, `totais com campanha: ${reais(tt.total)}, no Pix ${reais(tt.pix)}`);
    await ev(`window.IVPedido.limpar();localStorage.clear();1`);
  }
  console.log("\nerros JS/rede:", errs.length ? errs : "nenhum"); if (errs.length) falhas++;
  console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTODOS OS TESTES PASSARAM");
  ws.close(); matar(); process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); matar(); process.exit(1); });
