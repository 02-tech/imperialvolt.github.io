// Teste da navegação ao rolar (raio flutuante) e dos botões flutuantes. Uso: node tools/testar-navegacao.js http://127.0.0.1:8000/ <pastaCapturas>
const { spawn, spawnSync } = require("child_process"); const fs = require("fs"), os = require("os"), path = require("path");
const [URL0, OUT] = process.argv.slice(2); fs.mkdirSync(OUT, { recursive: true }); const perfil = fs.mkdtempSync(path.join(os.tmpdir(), "fc-")); const port = 9750 + Math.floor(Math.random() * 40);
spawn("C:/Program Files/Google/Chrome/Application/chrome.exe", ["--headless=new", "--hide-scrollbars", `--remote-debugging-port=${port}`, `--user-data-dir=${perfil}`, "about:blank"], { stdio: "ignore" });
const fim = c => { spawnSync("powershell.exe", ["-NoProfile", "-Command", "Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'chrome.exe' -and $_.CommandLine -like '*" + path.basename(perfil) + "*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }"], { stdio: "ignore" }); process.exit(c); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
let falhas = 0; const ok = (c, m) => { console.log(`  ${c ? "ok  " : "FALHA"} ${m}`); if (!c) falhas++; };
(async () => {
  let a; for (let i = 0; i < 150; i++) { try { a = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break; } catch { await sleep(200); } }
  const ws = new WebSocket(a.find(x => x.type === "page").webSocketDebuggerUrl); await new Promise(r => ws.addEventListener("open", r));
  let id = 0; const p = new Map(), erros = []; ws.addEventListener("message", e => { const m = JSON.parse(e.data); if (m.id && p.has(m.id)) { p.get(m.id)(m); p.delete(m.id); } if (m.method === "Runtime.exceptionThrown") erros.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text); });
  const send = (method, params = {}) => new Promise(r => { const i = ++id; p.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  const ev = async x => (await send("Runtime.evaluate", { expression: x, returnByValue: true, awaitPromise: true })).result.result.value;
  const toque = async (x, y) => { await send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] }); await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }); };
  const foto = async n => { const s = await send("Page.captureScreenshot", { format: "png" }); fs.writeFileSync(path.join(OUT, n + ".png"), Buffer.from(s.result.data, "base64")); };
  const estado = () => ev(`(()=>{const h=document.querySelector('.site-header'),r=document.querySelector('.nav-raio'),hb=h.getBoundingClientRect();return {cabecalhoVisivel:hb.bottom>0&&getComputedStyle(h).visibility!=='hidden',raio:!!r&&!r.hidden&&r.classList.contains('is-visible'),n:r&&!r.querySelector('.nav-raio__n').hidden?r.querySelector('.nav-raio__n').textContent:''}})()`);
  await send("Runtime.enable");
  for (const [w, h] of [[390, 844], [1366, 768]]) {
    console.log(`== ${w}`);
    await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 2, mobile: w < 800 });
    if (w < 800) await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 }); else await send("Emulation.setTouchEmulationEnabled", { enabled: false });
    await send("Page.navigate", { url: URL0 + "?v=" + Date.now() }); await sleep(3500);
    await ev(`localStorage.clear();1`);
    let e = await estado(); ok(e.cabecalhoVisivel && !e.raio, "no topo: cabeçalho visível, sem raio");
    await ev(`scrollTo({top:2200,behavior:'instant'});1`); await sleep(900);
    e = await estado(); ok(!e.cabecalhoVisivel && e.raio, "rolando: cabeçalho recolhido e raio visível");
    await foto(`${w}-1-raio`);
    const rr = await ev(`(()=>{const b=document.querySelector('.nav-raio').getBoundingClientRect();return {x:b.left+b.width/2,y:b.top+b.height/2}})()`);
    if (w < 800) await toque(rr.x, rr.y); else await ev(`document.querySelector('.nav-raio').click();1`);
    await sleep(600);
    e = await estado(); ok(e.cabecalhoVisivel && !e.raio, "tocar no raio traz o cabeçalho de volta");
    await foto(`${w}-2-aberto`);
    await ev(`scrollBy({top:400,behavior:'instant'});1`); await sleep(700);
    e = await estado(); ok(!e.cabecalhoVisivel && e.raio, "voltar a rolar recolhe o cabeçalho");
    await ev(`document.querySelector('.nav-raio').click();1`); await sleep(500);
    await ev(`document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}));1`); await sleep(500);
    e = await estado(); ok(!e.cabecalhoVisivel && e.raio, "Esc recolhe o cabeçalho");
    await ev(`window.IVPedido.adicionar('homenagem-digital');document.getElementById('pedidoOferta')?.remove();1`); await sleep(400);
    e = await estado(); ok(e.n === "1", "raio mostra 1 item no pedido");
    if (w < 800) {
      await ev(`document.querySelector('.nav-raio').click();1`); await sleep(500);
      await ev(`document.getElementById('menuBtn').click();1`); await sleep(400);
      await foto(`${w}-3-menu`);
      await ev(`document.querySelector('#mobileNav a[href="#catalogo"]:not([data-aba])').click();1`); await sleep(1500);
      e = await estado(); ok(!e.cabecalhoVisivel && e.raio && await ev(`document.getElementById('mobileNav').hidden`), "escolher um item do menu leva à seção e recolhe tudo");
      ok(Math.abs(await ev(`Math.round(document.getElementById('catalogo').getBoundingClientRect().top)`)) < 60, "seção aparece no topo, sem ficar escondida");
    }
    const fab = await ev(`(()=>{const w=document.getElementById('whatsFab').getBoundingClientRect(),c=document.getElementById('chatFab').getBoundingClientRect(),img=document.querySelector('#chatFab img');return {wb:Math.round(innerHeight-w.bottom),cb:Math.round(innerHeight-c.bottom),gap:Math.round(c.top-w.bottom),size:Math.round(c.width),img:img.naturalWidth}})()`);
    ok(fab.cb >= 12 && fab.gap > 6 && fab.img > 0, `botões flutuantes: ${JSON.stringify(fab)}`);
    await ev(`document.getElementById('pedidoBotao').click();1`); await sleep(500);
    ok(await ev(`getComputedStyle(document.getElementById('whatsFab')).display==='none'&&getComputedStyle(document.querySelector('.nav-raio')).display==='none'`), "pedido aberto esconde os botões flutuantes");
    await ev(`document.getElementById('pedidoFechar').click();window.IVPedido.limpar();localStorage.clear();1`); await sleep(400);
    await ev(`scrollTo({top:0,behavior:'instant'});1`); await sleep(700);
    e = await estado(); ok(e.cabecalhoVisivel && !e.raio, "de volta ao topo: cabeçalho normal");
  }
  console.log("erros:", erros.length ? erros : "nenhum"); fim(falhas ? 1 : 0);
})().catch(e => { console.error(e); fim(1); });
