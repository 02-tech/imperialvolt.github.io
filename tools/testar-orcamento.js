// Teste de uma página de orçamento (orcamentos/<slug>/). Uso: node tools/testar-orcamento.js <url> <pastaCapturas>
// Confere: sem erro de JS, sem rolagem horizontal, noindex, prévia 3D desenhada (pixels não vazios), total coerente,
// botão de confirmação apontando para o WhatsApp oficial. Tira captura da página inteira em 390 e 1366.
const { spawn, spawnSync } = require("child_process"); const fs = require("fs"), os = require("os"), path = require("path");
const [URL0, OUT] = process.argv.slice(2); if (!URL0 || !OUT) { console.error("Uso: node tools/testar-orcamento.js <url> <pasta>"); process.exit(2); }
fs.mkdirSync(OUT, { recursive: true }); const perfil = fs.mkdtempSync(path.join(os.tmpdir(), "fc-")); const port = 9750 + Math.floor(Math.random() * 40);
spawn("C:/Program Files/Google/Chrome/Application/chrome.exe", ["--headless=new", "--hide-scrollbars", `--remote-debugging-port=${port}`, `--user-data-dir=${perfil}`, "about:blank"], { stdio: "ignore" });
const fim = c => { spawnSync("powershell.exe", ["-NoProfile", "-Command", "Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'chrome.exe' -and $_.CommandLine -like '*" + path.basename(perfil) + "*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"]); process.exit(c); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
let falhas = 0; const ok = (c, m) => { console.log(`  ${c ? "ok  " : "FALHA"} ${m}`); if (!c) falhas++; };
(async () => {
  let a; for (let i = 0; i < 150; i++) { try { a = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break; } catch { await sleep(200); } }
  const ws = new WebSocket(a.find(x => x.type === "page").webSocketDebuggerUrl); await new Promise(r => ws.addEventListener("open", r));
  let id = 0; const p = new Map(), erros = [];
  ws.addEventListener("message", e => { const m = JSON.parse(e.data); if (m.id && p.has(m.id)) { p.get(m.id)(m); p.delete(m.id); } if (m.method === "Runtime.exceptionThrown") erros.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text); if (m.method === "Log.entryAdded" && m.params.entry.level === "error") erros.push(m.params.entry.text + " " + (m.params.entry.url || "")); });
  const send = (method, params = {}) => new Promise(r => { const i = ++id; p.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  const ev = async x => (await send("Runtime.evaluate", { expression: x, returnByValue: true, awaitPromise: true })).result.result.value;
  await send("Runtime.enable"); await send("Log.enable");
  for (const [w, h] of [[390, 844], [1366, 768]]) {
    console.log(`== ${w}`);
    await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: w < 800 });
    await send("Page.navigate", { url: URL0 }); await sleep(3500);
    const r = await ev(`(()=>{const c=document.getElementById('model3d');let pix=0;try{const t=document.createElement('canvas');t.width=c.width;t.height=c.height;const x=t.getContext('2d');x.drawImage(c,0,0);const d=x.getImageData(0,0,t.width,t.height).data;for(let i=3;i<d.length;i+=16)if(d[i]>0)pix++}catch(e){pix=-1}
      const conf=document.getElementById('share');
      return {scrollX:document.documentElement.scrollWidth>innerWidth+1, noindex:/noindex/.test(document.querySelector('meta[name=robots]')?.content||''), pix, total:document.getElementById('total')?.textContent, og:!!document.querySelector('meta[property="og:image"]'), h:document.documentElement.scrollHeight}})()`);
    ok(!r.scrollX, "sem rolagem horizontal");
    ok(r.noindex, "meta robots noindex");
    ok(r.og, "og:image para a prévia do link");
    ok(r.pix > 50, `prévia 3D desenhada (${r.pix} amostras com pixel)`);
    ok(/R\$/.test(r.total || ""), `total exibido: ${r.total}`);
    if (process.env.CASOS && w < 800) { // CASOS='[{"qty":20,"stand":true,"pix":"R$ 41,86","outras":"R$ 46,60"}]' (valores calculados à mão)
      for (const c of JSON.parse(process.env.CASOS)) {
        const v = await ev(`(()=>{const q=document.getElementById('qty'),s=document.getElementById('addStand');q.value=${c.qty};q.dispatchEvent(new Event('change'));if(s.checked!==${!!c.stand})s.click();const n=t=>t.replace(/\\u00a0/g," ");return {pix:n(document.getElementById("total").textContent),outras:n(document.getElementById("other").textContent)}})()`);
        ok(v.pix === c.pix && v.outras.includes(c.outras), `${c.qty} cartões${c.stand ? " + porta-cartões" : ""}: Pix ${v.pix} (esperado ${c.pix}), ${v.outras} (esperado ${c.outras})`);
      }
      await send("Page.navigate", { url: URL0 }); await sleep(2500);
    }
    if (w < 800) {
      const urlZap = await ev(`(()=>{let u='';const o=window.open;window.open=x=>{u=x};document.getElementById('share').click();window.open=o;return u})()`);
      ok(urlZap.startsWith("https://wa.me/5524992144995?text="), "confirmar pedido abre o WhatsApp oficial");
      ok(decodeURIComponent(urlZap).includes("TOTAL"), "mensagem do WhatsApp leva o resumo com total");
      if (await ev("!!document.getElementById('mbar')")) { // barra fixa do total (só nos orçamentos que a têm)
        const barra = async () => ev(`(()=>{const b=document.getElementById('mbar');if(!b)return null;const r=b.getBoundingClientRect();return {vis:!b.classList.contains('hide')&&r.top<innerHeight,txt:document.getElementById('mbarTotal').textContent}})()`);
        await ev(`document.querySelector('.product-layout').scrollIntoView({block:'start'});1`); await sleep(700);
        let b = await barra(); ok(b && b.vis && b.txt === r.total, `barra fixa com o total fora do resumo (prévia 3D) (${b && b.txt})`);
        { const c = await send("Page.captureScreenshot", { format: "png" }); fs.writeFileSync(path.join(OUT, "orcamento-390-barra.png"), Buffer.from(c.result.data, "base64")); }
        await ev(`document.getElementById('tier75').click();1`); await sleep(300);
        b = await barra(); ok(b && b.txt === await ev(`document.getElementById('total').textContent`) && b.txt !== r.total, `barra acompanha a mudança de opção (${b && b.txt})`);
        await ev(`document.getElementById('tier50').click();document.querySelector('.summary-card .actions').scrollIntoView({block:'center'});1`); await sleep(700);
        b = await barra(); ok(b && !b.vis, "barra some quando o resumo com os botões está na tela");
      }
    }
    await send("Emulation.setDeviceMetricsOverride", { width: w, height: r.h, deviceScaleFactor: 1, mobile: w < 800 }); await sleep(900);
    const s = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true });
    fs.writeFileSync(path.join(OUT, `orcamento-${w}.png`), Buffer.from(s.result.data, "base64"));
  }
  if (process.env.PREVIA) { // gera a imagem de prévia do link (og:image), 1200x630, a partir do topo da própria página
    await send("Emulation.setDeviceMetricsOverride", { width: 1200, height: 630, deviceScaleFactor: 1, mobile: false });
    await send("Page.navigate", { url: URL0 }); await sleep(3000);
    const s = await send("Page.captureScreenshot", { format: "jpeg", quality: 84 });
    fs.writeFileSync(process.env.PREVIA, Buffer.from(s.result.data, "base64")); console.log("  prévia do link gravada em " + process.env.PREVIA);
  }
  ok(!erros.length, "sem erros de JS/rede" + (erros.length ? ": " + erros.slice(0, 3).join(" | ") : ""));
  console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTODOS OS TESTES PASSARAM"); fim(falhas ? 1 : 0);
})().catch(e => { console.error(e); fim(1); });
