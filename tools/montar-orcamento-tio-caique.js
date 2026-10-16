// Uso: node tools/montar-orcamento-tio-caique.js docs/orcamentos-fontes/tio-caique-v2-original.html orcamentos/tio-caique-barbearia-fda887 tio-caique-barbearia-fda887 <AAAA-MM-DD validade = publicação + 7 dias>
// Orçamento V5 Tio Caique (V4 + site R$ 350 + kit completo) (16/10): animação dos cartões entrando/saindo do porta-cartões 3D, cor branco translúcido/preto,
// itens independentes (cartões >= 20, porta-cartões, site com agenda), promoção do porta-cartões por 1 semana, oferta do site.
// Encaixe do cartão verificado contra a malha real (geo4.js): base Y -35.8, Z 4 -> topo Z -1, 0 pontos da peça no volume.
const fs = require('fs'), path = require('path');
const [ORIG, DIR, SLUG, PROMO_ATE] = process.argv.slice(2); // PROMO_ATE = AAAA-MM-DD (data da publicação + 7 dias)
if (!/^\d{4}-\d{2}-\d{2}$/.test(PROMO_ATE || '')) throw new Error('informe PROMO_ATE AAAA-MM-DD');
const src = fs.readFileSync(ORIG, 'utf8');
const URL = `https://imperialvolt.com/orcamentos/${SLUG}/`;
const meshes = src.match(/<script id="product-meshes" type="application\/json">[\s\S]*?<\/script>/)[0];
const iRender = src.indexOf('// Geometria real extraída'), iGl = src.indexOf('const vShader=');
if (iRender < 0 || iGl < iRender) throw new Error('renderizador nao encontrado');
const fallback = src.slice(iRender, iGl); // meshes, canvas, gl e o desenho alternativo sem WebGL (originais do V2)
const img = src.match(/data:image\/webp;base64,([A-Za-z0-9+/=]+)/)[1];
fs.mkdirSync(DIR, { recursive: true });
fs.writeFileSync(path.join(DIR, 'cartao.webp'), Buffer.from(img, 'base64'));
const [pa, pm, pd] = PROMO_ATE.split('-');
const PROMO_TXT = `${pd}/${pm}`;

const css = `
:root{color-scheme:light;--ink:#1f2a2d;--muted:#66747a;--line:#e5e9e8;--soft:#f4f6f3;--brand:#233e42;--ok:#1d7157;--gold:#b98b2f}
*{box-sizing:border-box}html{scroll-behavior:smooth}
body{margin:0;background:#fff;color:var(--ink);font:16px/1.55 Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;-webkit-font-smoothing:antialiased}
.wrap{max-width:1060px;margin:0 auto;padding:0 22px}
header{border-bottom:1px solid var(--line)}
.nav{height:68px;display:flex;align-items:center;justify-content:space-between;gap:14px}
.brand{display:flex;align-items:center;gap:10px;color:inherit;text-decoration:none;font-weight:800;letter-spacing:-.03em}
.brand img{width:36px;height:36px;border-radius:11px;display:block}
.date{font-size:13px;color:var(--muted)}
.hero{padding:44px 0 6px}
.eyebrow{margin:0 0 8px;font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#4f7a70}
h1{margin:0;font-size:clamp(30px,5vw,48px);line-height:1.07;letter-spacing:-.045em}
.hero p{margin:12px 0 0;color:var(--muted);max-width:580px}
h2{margin:0 0 6px;font-size:26px;letter-spacing:-.03em}
.sub{margin:0 0 18px;color:var(--muted)}
section{padding:40px 0 6px}
.reveal{opacity:0;transform:translateY(18px);transition:opacity .7s ease,transform .7s ease}
.reveal.in{opacity:1;transform:none}
.show{display:grid;grid-template-columns:1.25fr .75fr;gap:18px;align-items:stretch}
.stage{border:1px solid var(--line);border-radius:22px;overflow:hidden;position:relative;background:radial-gradient(ellipse at 45% 28%,#e9eeeb 0%,#c3ccc8 100%)}
.stage.dark{background:radial-gradient(ellipse at 45% 30%,#ffffff 0%,#e9ece8 100%)}
.viewer{width:100%;aspect-ratio:5/4;position:relative}
.viewer canvas{width:100%;height:100%;display:block;touch-action:none;cursor:grab}
.viewer canvas:active{cursor:grabbing}
.hint{position:absolute;left:14px;bottom:14px;font-size:12px;color:#4f5f63;background:#ffffffe0;border-radius:999px;padding:6px 12px;pointer-events:none;transition:opacity .4s}
.reset{position:absolute;right:14px;bottom:14px;width:36px;height:36px;border-radius:50%;border:1px solid var(--line);background:#fff;font-size:16px;cursor:pointer}
.cores{position:absolute;left:14px;top:14px;display:flex;gap:8px;background:#ffffffe6;border-radius:999px;padding:6px;box-shadow:0 4px 14px rgba(0,0,0,.06)}
.cor{display:flex;align-items:center;gap:7px;border:0;background:none;border-radius:999px;padding:5px 11px 5px 6px;font:inherit;font-size:13px;font-weight:700;color:var(--ink);cursor:pointer}
.cor i{width:20px;height:20px;border-radius:50%;display:block;border:1px solid #cfd5d3}
.cor[data-cor=branco] i{background:radial-gradient(circle at 35% 30%,#fff 0%,#e9ece8 60%,#cfd6d2 100%);opacity:.9}
.cor[data-cor=preto] i{background:radial-gradient(circle at 35% 30%,#555 0%,#1a1b1d 70%)}
.cor.on{background:var(--brand);color:#fff}
.side{display:flex;flex-direction:column;gap:18px}
.card-art{border:1px solid var(--line);border-radius:22px;background:linear-gradient(160deg,#f6f7f4,#e9ece7);padding:26px 22px;display:grid;place-items:center;perspective:900px}
.card-art img{width:100%;max-width:380px;height:auto;aspect-ratio:90/50;border-radius:10px;box-shadow:0 18px 36px rgba(15,30,30,.28);animation:flutua 6s ease-in-out infinite;transform-style:preserve-3d}
@keyframes flutua{0%,100%{transform:rotateX(8deg) rotateY(-10deg) translateY(0)}50%{transform:rotateX(4deg) rotateY(8deg) translateY(-6px)}}
.feat{border:1px solid var(--line);border-radius:22px;padding:18px 20px}
.feat h3{margin:0 0 4px;font-size:18px;letter-spacing:-.02em}.feat p{margin:0;color:var(--muted);font-size:14px}
.feat+.feat{margin-top:0}
.orc{display:grid;grid-template-columns:1.1fr .9fr;gap:18px;align-items:start}
.itens{display:flex;flex-direction:column;gap:12px}
.it{border:1.5px solid var(--line);border-radius:18px;padding:16px 18px;transition:border-color .2s,background .2s}
.it.on{border-color:var(--brand);background:#fbfdfb}
.it__top{display:flex;align-items:center;gap:12px;cursor:pointer}
.it__top input{width:22px;height:22px;accent-color:var(--brand);flex:none;margin:0}
.it__top div{flex:1}.it__top b{display:block;font-size:17px}.it__top small{color:var(--muted);font-size:13px}
.it__pr{text-align:right;white-space:nowrap}.it__pr s{display:block;font-size:13px;color:#8a979b}.it__pr strong{font-size:18px}
.it__body{margin-top:14px}
.it:not(.on) .it__body{opacity:.45;pointer-events:none}
.qty{display:flex;align-items:center;gap:10px}
.qty button{width:42px;height:42px;border-radius:12px;border:1px solid var(--line);background:#fff;font-size:20px;cursor:pointer;color:inherit}
.qty input{width:86px;height:42px;border:1px solid var(--line);border-radius:12px;text-align:center;font:inherit;font-weight:700}
.qty span{font-size:13px;color:var(--muted)}
.chips{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}
.chips button{font:inherit;font-size:14px;font-weight:700;border:1px solid var(--line);background:#fff;border-radius:999px;padding:6px 14px;cursor:pointer;color:inherit}
.chips button.on{background:var(--brand);border-color:var(--brand);color:#fff}
.faixas{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}
.faixas div{border:1.5px solid var(--line);border-radius:14px;padding:10px 12px}
.faixas div.on{border-color:var(--brand);background:#f6faf7;box-shadow:inset 0 0 0 1px var(--brand)}
.faixas b{display:block;font-size:19px;letter-spacing:-.03em}.faixas span{font-size:13px;color:var(--muted)}
.faixas em{display:inline-block;margin-top:4px;font-style:normal;font-size:11px;font-weight:700;color:var(--ok);background:#e9f4ee;border-radius:999px;padding:2px 8px}
.nudge{margin:10px 0 0;font-size:14px;color:var(--ok);font-weight:600;min-height:1.2em}
.promo{display:inline-flex;align-items:center;gap:6px;margin-top:2px;font-size:12px;font-weight:700;color:#8a5a00;background:#fff4dc;border-radius:999px;padding:3px 10px}
.mini-cores{display:flex;gap:8px}
.mini-cores button{display:flex;align-items:center;gap:7px;border:1.5px solid var(--line);background:#fff;border-radius:999px;padding:6px 12px 6px 7px;font:inherit;font-size:13px;font-weight:700;cursor:pointer;color:inherit}
.mini-cores button i{width:18px;height:18px;border-radius:50%;display:block;border:1px solid #cfd5d3}
.mini-cores button[data-cor=branco] i{background:radial-gradient(circle at 35% 30%,#fff 0%,#e9ece8 60%,#cfd6d2 100%)}
.mini-cores button[data-cor=preto] i{background:radial-gradient(circle at 35% 30%,#555 0%,#1a1b1d 70%)}
.mini-cores button.on{border-color:var(--brand);box-shadow:inset 0 0 0 1px var(--brand)}
.res{background:#fff;border:1.5px solid #cfdcd5;border-radius:20px;padding:22px;position:sticky;top:16px}
.res h3{margin:0 0 2px;font-size:18px}
.validade{margin:0 0 10px;font-size:12px;font-weight:700;color:#8a5a00}
.vencido{margin:0 0 14px;padding:10px 14px;border-radius:12px;background:#fff4dc;color:#6b4700;font-size:14px}
.kit{border:1.5px dashed #c9b27a;background:#fffaf0;border-radius:16px;padding:14px 16px;display:grid;gap:4px;transition:background .3s,border-color .3s}
.kit b{font-size:15px}.kit span{font-size:13px;color:#6f6250}
.kit.on{border-style:solid;border-color:#1f8f4e;background:#effaf3}.kit.on b{color:#1d7157}
.kit[hidden]{display:none}
.res .kitrow{color:#1d7157;font-weight:600}
.agpreco{margin:0 0 14px;font-size:15px;color:#c4d3ce}.agpreco s{color:#8fa59f}.agpreco strong{font-size:26px;color:#fff;letter-spacing:-.03em}.agpreco span{font-size:13px}
.res .row{display:flex;justify-content:space-between;gap:12px;font-size:15px;padding:5px 0;color:#3d4a4e}
.res .row[hidden]{display:none}
.res .empty{color:var(--muted);font-size:14px;padding:6px 0}
.res .pix{margin-top:12px;padding-top:14px;border-top:1px solid var(--line);display:flex;justify-content:space-between;align-items:end;gap:10px}
.res .pix span{font-weight:700}.res .pix small{display:block;font-weight:600;color:var(--ok);font-size:13px}
.res .pix strong{font-size:36px;letter-spacing:-.04em;line-height:1;transition:transform .2s}
.res .pix strong.bump{transform:scale(1.06)}
.res .other{text-align:right;font-size:14px;color:var(--muted);margin-top:6px}
.cta{display:block;width:100%;margin-top:18px;border:0;border-radius:14px;background:#1f8f4e;color:#fff;font:inherit;font-weight:800;font-size:17px;padding:16px;cursor:pointer;transition:filter .2s,opacity .2s}
.cta:hover{filter:brightness(1.06)}.cta:disabled{opacity:.45;cursor:not-allowed}
.fine{margin:12px 0 0;font-size:12px;color:var(--muted);text-align:center}
.agenda{border-radius:26px;background:linear-gradient(150deg,#16252a 0%,#233e42 60%,#2d5a52 100%);color:#eef3f1;padding:34px;display:grid;grid-template-columns:1fr 340px;gap:30px;align-items:center;overflow:hidden}
.agenda h2{color:#fff}.agenda .sub{color:#c4d3ce}
.agenda ul{list-style:none;margin:16px 0 22px;padding:0;display:grid;gap:10px}
.agenda li{display:flex;gap:10px;align-items:flex-start;font-size:15px}
.agenda li::before{content:"";flex:none;width:20px;height:20px;margin-top:2px;border-radius:50%;background:#c7f34d url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Cpath d='M5 10.5l3 3 7-7' stroke='%2316252a' stroke-width='2.4' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center/14px no-repeat}
.agenda .quero{border:0;border-radius:14px;background:#c7f34d;color:#16252a;font:inherit;font-weight:800;font-size:16px;padding:14px 20px;cursor:pointer}
.agenda .quero.on{background:#fff}
.agenda .obs{font-size:12px;color:#a9bcb6;margin:12px 0 0}
.phone{background:#0d1416;border-radius:36px;padding:12px;box-shadow:0 30px 60px rgba(0,0,0,.35);width:100%;max-width:330px;justify-self:center}
.screen{background:#fff;color:var(--ink);border-radius:26px;overflow:hidden;min-height:470px;position:relative}
.scr-top{background:#16252a;color:#fff;padding:16px 16px 12px}
.scr-top b{display:block;font-size:16px}.scr-top span{font-size:12px;color:#b9c9c4}
.tabs{display:flex;background:#0f1b1e}
.tabs button{flex:1;border:0;background:none;color:#9fb3ad;font:inherit;font-size:12px;font-weight:700;padding:9px 4px;cursor:pointer}
.tabs button.on{color:#fff;box-shadow:inset 0 -2px 0 #c7f34d}
.scr-body{padding:14px}
.dias{display:flex;gap:6px;overflow:hidden}
.dias button{flex:1;border:1px solid var(--line);background:#fff;border-radius:12px;padding:7px 2px;font:inherit;font-size:11px;cursor:pointer;color:inherit;line-height:1.2}
.dias button b{display:block;font-size:15px}
.dias button.on{background:#16252a;color:#fff;border-color:#16252a}
.horas{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:12px}
.horas button{border:1px solid var(--line);background:#fff;border-radius:10px;padding:8px 0;font:inherit;font-size:13px;font-weight:700;cursor:pointer;color:inherit}
.horas button.busy{background:#f1f2f1;color:#a4adab;text-decoration:line-through;cursor:not-allowed}
.horas button.sel{background:#c7f34d;border-color:#9fc322}
.agendar{margin-top:12px;width:100%;border:0;border-radius:12px;background:#16252a;color:#fff;font:inherit;font-weight:800;padding:12px;cursor:pointer}
.agendar:disabled{opacity:.35;cursor:not-allowed}
.ok-msg{position:absolute;inset:0;background:#fff;display:grid;place-items:center;text-align:center;padding:24px;opacity:0;pointer-events:none;transition:opacity .35s}
.ok-msg.show{opacity:1;pointer-events:auto}
.ok-msg .chk{width:64px;height:64px;border-radius:50%;background:#1f8f4e;margin:0 auto 12px;display:grid;place-items:center;transform:scale(.4);transition:transform .45s cubic-bezier(.2,1.6,.4,1)}
.ok-msg.show .chk{transform:scale(1)}
.ok-msg p{margin:4px 0;color:var(--muted);font-size:14px}.ok-msg b{font-size:18px}
.lista{display:grid;gap:8px}
.lista div{display:flex;justify-content:space-between;border:1px solid var(--line);border-radius:10px;padding:9px 11px;font-size:13px}
.lista div.novo{border-color:#9fc322;background:#f7fde6;animation:pisca 1.2s ease 2}
@keyframes pisca{50%{background:#e9f9b8}}
.lista small{color:var(--muted)}
.demo-tag{display:block;text-align:center;font-size:11px;color:var(--muted);padding:8px 0 10px}
button:focus-visible,input:focus-visible,a:focus-visible{outline:2px solid #486d70;outline-offset:2px}
footer{margin-top:48px;border-top:1px solid var(--line);padding:18px 0 30px;font-size:13px;color:var(--muted)}
footer .wrap{display:flex;flex-wrap:wrap;gap:6px 18px;align-items:center}footer a{color:inherit}
.toast{position:fixed;bottom:22px;left:50%;transform:translateX(-50%) translateY(10px);background:#173b4e;color:#fff;border-radius:10px;padding:10px 16px;font-size:14px;opacity:0;pointer-events:none;transition:.25s;z-index:30}
.toast.show{opacity:1;transform:translateX(-50%)}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
@media(max-width:900px){.show,.orc,.agenda{grid-template-columns:1fr}.res{position:static}.agenda{padding:26px 20px}.side{display:grid;grid-template-columns:1fr}}
@media(max-width:480px){.wrap{padding:0 16px}.hero{padding-top:30px}.date{font-size:12px}.res .pix strong{font-size:32px}.cor{padding:4px 9px 4px 5px;font-size:12px}.card-art{padding:20px 16px}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}.reveal{opacity:1;transform:none;transition:none}.card-art img{animation:none}.toast,.ok-msg,.ok-msg .chk{transition:none}.lista div.novo{animation:none}}
@media print{.cta,.reset,.hint,.toast,.quero{display:none!important}.res{position:static}.reveal{opacity:1;transform:none}}
`;

const body = `
<header><div class="wrap nav"><a class="brand" href="https://imperialvolt.com/"><img src="../../icons/imperial-volt-bolt.svg" alt=""/>Imperial Volt</a><span class="date">Orçamento de 16/10/2026</span></div></header>
<main class="wrap">
<div class="hero">
<p class="eyebrow">Tio Caique Barbearia</p>
<h1>Seus cartões de visita e o porta-cartões do balcão</h1>
<p>Feitos com a identidade da sua barbearia. Veja como fica, escolha o que quiser e confirme pelo WhatsApp.</p>
</div>

<section aria-labelledby="t1" class="reveal">
<h2 id="t1">Veja como fica no seu balcão</h2>
<p class="sub">Gire a peça e escolha a cor.</p>
<div class="show">
<div class="stage" id="stage">
<div class="viewer" id="view"><canvas id="model3d" aria-label="Porta-cartões em 3D com os cartões da barbearia. Arraste para girar."></canvas></div>
<div class="cores" role="group" aria-label="Cor do porta-cartões"><button class="cor on" type="button" data-cor="branco" aria-pressed="true"><i></i>Branco translúcido</button><button class="cor" type="button" data-cor="preto" aria-pressed="false"><i></i>Preto</button></div>
<span class="hint" id="hint">Arraste para girar</span>
<button class="reset" id="reset" type="button" aria-label="Voltar à posição inicial">↺</button>
</div>
<div class="side">
<div class="card-art"><img src="cartao.webp" alt="Arte do cartão de visita da Tio Caique Barbearia" width="436" height="226"/></div>
<div class="feat"><h3>Cartões de visita</h3><p>90 × 50 mm, papel fotográfico 180 g/m², com a sua arte.</p></div>
<div class="feat"><h3>Porta-cartões para o balcão</h3><p>Com o nome da barbearia. 15 cm de altura.</p></div>
</div>
</div>
<div hidden><button id="iso" type="button"></button><button id="front" type="button"></button><button id="side" type="button"></button><button id="top" type="button"></button><input id="baseToggle" type="checkbox" checked/></div>
</section>

<section aria-labelledby="t2" class="reveal">
<h2 id="t2">Seu orçamento</h2>
<p class="vencido" id="vencido" hidden>As condições especiais deste orçamento terminaram em ${PROMO_TXT}. Fale com a gente para renovar.</p>
<p class="sub">Escolha só o que quiser.</p>
<div class="orc">
<div class="itens">
<div class="it on" id="itCards">
<label class="it__top"><input id="addCards" type="checkbox" checked/><div><b>Cartões de visita</b><small>A partir de 20 cartões</small></div></label>
<div class="it__body">
<div class="qty"><button id="less" type="button" aria-label="Diminuir">−</button><label class="sr" for="qty">Quantidade de cartões</label><input id="qty" type="number" inputmode="numeric" min="20" step="1" value="50"/><button id="more" type="button" aria-label="Aumentar">+</button><span>mínimo 20</span></div>
<div class="chips" role="group" aria-label="Atalhos de quantidade"><button type="button" data-q="20">20</button><button type="button" data-q="50">50</button><button type="button" data-q="75">75</button><button type="button" data-q="100">100</button></div>
<div class="faixas"><div id="f1" class="on"><b>R$ 1,58</b><span>por cartão, de 20 a 74</span></div><div id="f2"><b>R$ 1,50</b><span>por cartão, a partir de 75</span><br/><em>desconto por quantidade</em></div></div>
<p class="nudge" id="nudge"></p>
</div>
</div>
<div class="it on" id="itStand">
<label class="it__top"><input id="addStand" type="checkbox" checked/><div><b>Porta-cartões para o balcão</b><span class="promo" id="promoTag">Preço especial até ${PROMO_TXT}</span></div><div class="it__pr"><s id="standDe">R$ 29,00</s><strong id="standPor">R$ 15,00</strong></div></label>
<div class="it__body"><div class="mini-cores" role="group" aria-label="Cor do porta-cartões"><button type="button" data-cor="branco" class="on" aria-pressed="true"><i></i>Branco translúcido</button><button type="button" data-cor="preto" aria-pressed="false"><i></i>Preto</button></div></div>
</div>
<div class="it" id="itSite">
<label class="it__top"><input id="addSite" type="checkbox"/><div><b>Site com agenda online</b><small>Vitrine da barbearia + agendamento pelo celular · <a href="#agenda">ver como funciona</a></small></div><div class="it__pr"><s id="siteDe">R$ 890,00</s><strong id="sitePor">R$ 350,00</strong></div></label>
</div>
<div class="kit" id="kit"><b id="kitTit">Kit completo: R$ 25 de desconto + brinde</b><span id="kitTxt">Cartões + porta-cartões + site. De brinde, uma tag NFC: o cliente aproxima o celular e abre seu Instagram ou seu site.</span></div>
</div>
<aside class="res" aria-live="polite">
<h3>Resumo</h3><p class="validade" id="validade">Condições especiais válidas até ${PROMO_TXT}</p>
<div class="row" id="rowCards"><span id="rowQty">50 cartões × R$ 1,58</span><b id="cardsPrice">R$ 79,00</b></div>
<div class="row" id="rowStand"><span id="rowStandTxt">Porta-cartões · branco translúcido</span><b id="standPrice">R$ 15,00</b></div>
<div class="row" id="rowSite" hidden><span>Site com agenda online</span><b id="sitePrice">R$ 350,00</b></div>
<div class="row kitrow" id="rowKit" hidden><span>Desconto do kit completo</span><b>− R$ 25,00</b></div>
<div class="row kitrow" id="rowBrinde" hidden><span>Brinde: tag NFC</span><b>grátis</b></div>
<p class="empty" id="empty" hidden>Escolha pelo menos um item.</p>
<div class="pix"><span>No Pix<small id="saving">Você economiza R$ 11,85</small></span><strong id="total">R$ 82,15</strong></div>
<div class="other" id="other">Outras formas: R$ 94,00</div>
<button class="cta" id="share" type="button">Confirmar pelo WhatsApp</button>
<p class="fine">15% de desconto no Pix sobre os cartões. Domínio próprio (opcional) à parte. Prazo e entrega combinados na confirmação.</p>
</aside>
</div>
</section>

<section id="agenda" aria-labelledby="t3" class="reveal">
<div class="agenda">
<div>
<p class="eyebrow" style="color:#c7f34d">Para ir além</p>
<h2 id="t3">Sua barbearia com agenda online</h2>
<p class="sub">Um site com a cara da Tio Caique onde o cliente escolhe o dia e o horário pelo celular, a qualquer hora.</p>
<ul>
<li>Seu site: serviços, fotos, localização e contato da barbearia</li>
<li>O cliente marca sozinho, sem precisar te chamar</li>
<li>Horário marcado sai da agenda: ninguém marca em cima de outro</li>
<li>Uma página privada, só sua, com todos os agendamentos</li>
<li>O cliente paga na barbearia, como já é hoje</li>
</ul>
<p class="agpreco" id="agPreco"><s>R$ 890,00</s> <strong>R$ 350,00</strong> <span>neste orçamento</span></p>
<button class="quero" id="quero" type="button">Quero no meu pedido</button>
<p class="obs">Experimente ao lado. É uma demonstração: nada é enviado.</p>
</div>
<div class="phone" aria-label="Demonstração da agenda online">
<div class="screen">
<div class="scr-top"><b>Tio Caique Barbearia</b><span>Agende seu horário</span></div>
<div class="tabs" role="tablist"><button class="on" type="button" data-tab="cliente" role="tab" aria-selected="true">Cliente</button><button type="button" data-tab="dono" role="tab" aria-selected="false">Sua página</button></div>
<div class="scr-body" id="tabCliente">
<div class="dias" id="dias"></div>
<div class="horas" id="horas"></div>
<button class="agendar" id="agendar" type="button" disabled>Escolha um horário</button>
</div>
<div class="scr-body" id="tabDono" hidden><div class="lista" id="lista"></div></div>
<div class="ok-msg" id="okMsg"><div><div class="chk"><svg width="30" height="30" viewBox="0 0 20 20"><path d="M5 10.5l3 3 7-7" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></div><b>Horário marcado!</b><p id="okTxt"></p><p>Pagamento na barbearia.</p></div></div>
</div>
<span class="demo-tag" style="color:#a9bcb6">demonstração</span>
</div>
</div>
</section>
</main>
<footer><div class="wrap"><strong>Imperial Volt</strong><a href="https://wa.me/5524992144995" target="_blank" rel="noopener">WhatsApp +55 24 99214-4995</a><a href="https://www.instagram.com/imperialvolt" target="_blank" rel="noopener">@imperialvolt</a><span>CNPJ 60.179.279/0001-44</span></div></footer>
<div class="toast" id="toast" role="status"></div>
`;

const app = `
const BRL=c=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(c/100);
const $=id=>document.getElementById(id);
const REDUZ=matchMedia('(prefers-reduced-motion: reduce)').matches;
const PROMO_ATE=new Date('${PROMO_ATE}T23:59:59-03:00');
const promoAtiva=()=>Date.now()<=PROMO_ATE.getTime();
const MIN=20,DESC=75;
const COR_NOME={branco:'branco translúcido',preto:'preto'};
let cor='branco';
let toastT;function toast(t){$('toast').textContent=t;$('toast').classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>$('toast').classList.remove('show'),2600)}
const qtd=()=>Math.max(MIN,Math.floor(Number($('qty').value)||MIN));
function quote(){const cardsOn=$('addCards').checked,standOn=$('addStand').checked,siteOn=$('addSite').checked;const q=qtd(),unit=q>=DESC?150:158;const cards=cardsOn?q*unit:0;const ativo=promoAtiva();const standUnit=ativo?1500:2900;const stand=standOn?standUnit:0;const siteUnit=ativo?35000:0;const site=siteOn?siteUnit:0;const kit=ativo&&cardsOn&&standOn&&siteOn;const kitOff=kit?2500:0;const off=cards-Math.round(cards*.85);const cheio=cards+stand+site-kitOff;return {cardsOn,standOn,siteOn,ativo,q,unit,cards,stand,standUnit,site,siteUnit,kit,kitOff,off,cheio,pix:cheio-off}}
let ultimoTotal='';
function update(){const x=quote();
 $('itCards').classList.toggle('on',x.cardsOn);$('itStand').classList.toggle('on',x.standOn);$('itSite').classList.toggle('on',x.siteOn);
 $('rowCards').hidden=!x.cardsOn;$('rowQty').textContent=x.q+' cartões × '+BRL(x.unit);$('cardsPrice').textContent=BRL(x.cards);
 $('rowStand').hidden=!x.standOn;$('rowStandTxt').textContent='Porta-cartões · '+COR_NOME[cor];$('standPrice').textContent=BRL(x.standUnit);
 $('rowSite').hidden=!x.siteOn;$('sitePrice').textContent=x.ativo?BRL(x.siteUnit):'sob consulta';$('rowKit').hidden=!x.kit;$('rowBrinde').hidden=!x.kit;
 const nItens=[x.cardsOn,x.standOn,x.siteOn].filter(Boolean).length,falta=!x.cardsOn?'os cartões':!x.standOn?'o porta-cartões':'o site';
 $('kit').hidden=!x.ativo;$('kit').classList.toggle('on',x.kit);$('kitTit').textContent=x.kit?'Kit completo ativado: − R$ 25,00 + tag NFC de brinde':nItens===2?'Adicione '+falta+' e ganhe R$ 25 de desconto + brinde':'Kit completo: R$ 25 de desconto + brinde';
 const nada=!x.cardsOn&&!x.standOn&&!x.siteOn;$('empty').hidden=!nada;$('share').disabled=nada;
 const t=x.cheio?BRL(x.pix):'—';$('total').textContent=t;if(t!==ultimoTotal&&!REDUZ){$('total').classList.add('bump');setTimeout(()=>$('total').classList.remove('bump'),180)}ultimoTotal=t;
 $('saving').textContent=x.off?'Você economiza '+BRL(x.off):(x.siteOn&&!x.cheio?'Site: valor sob consulta':'');
 $('other').textContent=x.cheio?'Outras formas: '+BRL(x.cheio)+(x.siteOn&&!x.ativo?' + site sob consulta':''):'';
 $('f1').classList.toggle('on',x.unit===158);$('f2').classList.toggle('on',x.unit===150);
 document.querySelectorAll('.chips button').forEach(c=>c.classList.toggle('on',+c.dataset.q===x.q));
 $('nudge').textContent=!x.cardsOn?'':x.q*158>DESC*150&&x.q<DESC?'Com 75 cartões você paga menos: '+BRL(DESC*150)+'.':x.q>=50&&x.q<DESC?'Com 75 cartões, cada um sai por R$ 1,50.':'';
 $('quero').textContent=x.siteOn?'Incluído no pedido ✓':'Quero no meu pedido';$('quero').classList.toggle('on',x.siteOn)}
const setQ=n=>{$('qty').value=Math.max(MIN,n);update()};
$('qty').addEventListener('input',update);$('qty').addEventListener('change',()=>setQ(qtd()));
$('less').addEventListener('click',()=>setQ(qtd()-1));$('more').addEventListener('click',()=>setQ(qtd()+1));
document.querySelectorAll('.chips button').forEach(c=>c.addEventListener('click',()=>setQ(+c.dataset.q)));
for(const id of ['addCards','addStand','addSite'])$(id).addEventListener('change',update);
if(!promoAtiva()){for(const id of ['standDe','promoTag','siteDe','validade','agPreco'])$(id).hidden=true;$('sitePor').textContent='sob consulta';$('sitePor').style.fontSize='14px';$('vencido').hidden=false}
$('quero').addEventListener('click',()=>{const s=$('addSite');s.checked=!s.checked;update();toast(s.checked?'Site com agenda incluído no seu pedido':'Site retirado do pedido');if(s.checked)document.getElementById('t2').scrollIntoView({behavior:REDUZ?'auto':'smooth',block:'start'})});
function setCor(c){cor=c;document.querySelectorAll('[data-cor]').forEach(b=>{const on=b.dataset.cor===c;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)});$('stage').classList.toggle('dark',c==='preto');window.dispatchEvent(new CustomEvent('cor-porta',{detail:c}));update()}
document.querySelectorAll('[data-cor]').forEach(b=>b.addEventListener('click',()=>setCor(b.dataset.cor)));
function summary(){const x=quote();const l=['Olá! Quero confirmar meu orçamento.','','TIO CAIQUE BARBEARIA · Imperial Volt'];
 if(x.cardsOn)l.push(x.q+' cartões de visita ('+BRL(x.unit)+' cada): '+BRL(x.cards));
 if(x.standOn)l.push('Porta-cartões '+COR_NOME[cor]+': '+BRL(x.standUnit)+(promoAtiva()?' (preço especial até ${PROMO_TXT})':''));
 if(x.siteOn)l.push(x.ativo?'Site com agenda online: '+BRL(x.siteUnit)+' (preço especial até ${PROMO_TXT})':'Quero saber mais: site com agenda online');
 if(x.kit)l.push('Kit completo: − R$ 25,00 + brinde tag NFC');
 if(x.cheio)l.push('TOTAL no Pix: '+BRL(x.pix)+' (outras formas: '+BRL(x.cheio)+')');
 l.push('','Orçamento: ${URL}');return l.join('\\n')}
$('share').addEventListener('click',()=>{if($('share').disabled)return;window.open('https://wa.me/5524992144995?text='+encodeURIComponent(summary()),'_blank','noopener,noreferrer')});
update();
// revelar ao rolar
if('IntersectionObserver' in window&&!REDUZ){const io=new IntersectionObserver(es=>{for(const e of es)if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}},{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>io.observe(el))}else document.querySelectorAll('.reveal').forEach(el=>el.classList.add('in'));
// demonstração da agenda (só no navegador, nada é enviado)
(()=>{const DS=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];const HS=['09:00','10:00','11:00','13:00','14:00','15:00','16:00','17:00','18:00'];
 const dias=[];const d=new Date();d.setHours(12,0,0,0);while(dias.length<5){d.setDate(d.getDate()+1);if(d.getDay()!==0)dias.push(new Date(d))}
 const nomes=['Rafael','Bruno','Lucas','Diego','Mateus','André','Felipe'];
 const ocup={};dias.forEach((dd,i)=>{ocup[i]=HS.filter((h,j)=>(i*7+j*5)%4===0)});
 const marcados=[];dias.forEach((dd,i)=>ocup[i].forEach((h,j)=>marcados.push({i,h,nome:nomes[(i+j)%nomes.length]})));
 let dia=0,hora=null;
 const fmt=dd=>DS[dd.getDay()]+', '+String(dd.getDate()).padStart(2,'0')+'/'+String(dd.getMonth()+1).padStart(2,'0');
 function render(){$('dias').innerHTML=dias.map((dd,i)=>'<button type="button" class="'+(i===dia?'on':'')+'" data-i="'+i+'">'+DS[dd.getDay()]+'<b>'+dd.getDate()+'</b></button>').join('');
  $('horas').innerHTML=HS.map(h=>{const busy=ocup[dia].includes(h);return '<button type="button" class="'+(busy?'busy':h===hora?'sel':'')+'" data-h="'+h+'"'+(busy?' disabled aria-label="'+h+' ocupado"':'')+'>'+h+'</button>'}).join('');
  $('agendar').disabled=!hora;$('agendar').textContent=hora?'Agendar '+hora:'Escolha um horário';
  const l=marcados.filter(m=>m.i===dia).sort((a,b)=>a.h.localeCompare(b.h));
  $('lista').innerHTML='<small>'+fmt(dias[dia])+' · '+l.length+' horários marcados</small>'+l.map(m=>'<div class="'+(m.novo?'novo':'')+'"><b>'+m.h+'</b><span>'+m.nome+'</span></div>').join('')}
 $('dias').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;dia=+b.dataset.i;hora=null;render()});
 $('horas').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;hora=b.dataset.h;render()});
 $('agendar').addEventListener('click',()=>{if(!hora)return;ocup[dia].push(hora);marcados.forEach(m=>m.novo=false);marcados.push({i:dia,h:hora,nome:'Você',novo:true});$('okTxt').textContent=fmt(dias[dia])+' às '+hora;$('okMsg').classList.add('show');hora=null;render();setTimeout(()=>{$('okMsg').classList.remove('show');aba('dono')},REDUZ?1200:1900)});
 function aba(t){document.querySelectorAll('.tabs button').forEach(b=>{const on=b.dataset.tab===t;b.classList.toggle('on',on);b.setAttribute('aria-selected',on)});$('tabCliente').hidden=t!=='cliente';$('tabDono').hidden=t!=='dono'}
 document.querySelectorAll('.tabs button').forEach(b=>b.addEventListener('click',()=>aba(b.dataset.tab)));
 render()})();
`;

// Renderizador WebGL novo (cor, translúcido, cartões animados). Sem WebGL, cai no desenho alternativo original do V2.
const gl3d = `
const vS='attribute vec3 a_p;attribute vec3 a_n;uniform mat4 u_vp;varying vec3 v_n;varying vec3 v_p;void main(){v_n=a_n;v_p=a_p;gl_Position=u_vp*vec4(a_p,1.0);}';
const fS='precision mediump float;varying vec3 v_n;varying vec3 v_p;uniform vec3 u_color;uniform vec3 u_eye;uniform float u_alpha;uniform float u_spec;void main(){vec3 n=normalize(v_n);vec3 v=normalize(u_eye-v_p);if(dot(n,v)<0.0)n=-n;float diff=max(dot(n,normalize(vec3(-0.48,0.81,0.32))),0.0);float fill=max(dot(n,normalize(vec3(0.35,0.44,-0.82))),0.0);vec3 h=normalize(normalize(vec3(-0.32,0.88,0.34))+v);float sp=pow(max(dot(n,h),0.0),u_spec);float light=0.62+0.30*diff+0.10*fill;float fr=pow(1.0-max(dot(n,v),0.0),2.0);vec3 c=u_color*light+vec3(0.22)*sp+vec3(0.10)*fr-vec3(0.10)*fr*step(0.5,u_color.r);gl_FragColor=vec4(min(c,vec3(1.0)),clamp(u_alpha+(1.0-u_alpha)*fr*0.8,0.0,1.0));}';
const vT='attribute vec3 a_p;attribute vec2 a_t;uniform mat4 u_vp;varying vec2 v_t;void main(){v_t=a_t;gl_Position=u_vp*vec4(a_p,1.0);}';
const fT='precision mediump float;varying vec2 v_t;uniform sampler2D u_tex;uniform float u_has;uniform float u_alpha;uniform float u_shade;void main(){vec4 t=texture2D(u_tex,v_t);vec3 back=vec3(0.13,0.15,0.17);vec3 c=gl_FrontFacing?mix(back,t.rgb,u_has):back;gl_FragColor=vec4(c*u_shade,u_alpha);}';
function sh(s,t){const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(o));return o}
function prog(a,b){const p=gl.createProgram();gl.attachShader(p,sh(a,gl.VERTEX_SHADER));gl.attachShader(p,sh(b,gl.FRAGMENT_SHADER));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));return p}
const P1=prog(vS,fS),P2=prog(vT,fT);
const L1={p:gl.getAttribLocation(P1,'a_p'),n:gl.getAttribLocation(P1,'a_n'),vp:gl.getUniformLocation(P1,'u_vp'),c:gl.getUniformLocation(P1,'u_color'),eye:gl.getUniformLocation(P1,'u_eye'),a:gl.getUniformLocation(P1,'u_alpha'),sp:gl.getUniformLocation(P1,'u_spec')};
const L2={p:gl.getAttribLocation(P2,'a_p'),t:gl.getAttribLocation(P2,'a_t'),vp:gl.getUniformLocation(P2,'u_vp'),tex:gl.getUniformLocation(P2,'u_tex'),has:gl.getUniformLocation(P2,'u_has'),a:gl.getUniformLocation(P2,'u_alpha'),sh:gl.getUniformLocation(P2,'u_shade')};
function upload(mesh){const vs=mesh.v,fs=mesh.f,o=mesh.offset,pos=new Float32Array(fs.length*9),nrm=new Float32Array(fs.length*9);let k=0;for(const f of fs){const a=vs[f[0]],b=vs[f[1]],c=vs[f[2]];const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const L=Math.hypot(nx,ny,nz)||1;nx/=L;ny/=L;nz/=L;for(const id of f){const p=vs[id];pos[k]=p[0]+o[0]-50.8;nrm[k++]=nx;pos[k]=p[2]+o[2]-74.95;nrm[k++]=nz;pos[k]=29-(p[1]+o[1]);nrm[k++]=-ny}}const pb=gl.createBuffer(),nb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,pb);gl.bufferData(gl.ARRAY_BUFFER,pos,gl.STATIC_DRAW);gl.bindBuffer(gl.ARRAY_BUFFER,nb);gl.bufferData(gl.ARRAY_BUFFER,nrm,gl.STATIC_DRAW);return {pb,nb,count:fs.length*3}}
const parts=[upload(meshes.expo),upload(meshes.base)];delete meshes.expo;delete meshes.base;
// cartão: 90x50 mm, apoiado na bandeja (topo Y -35.8), inclinado contra o fundo: base Z 4 -> topo Z -1 (verificado sem colisão)
const CX=0.7,YB=-35.6,ZB=4,ZT=-1,UP=[0,Math.sqrt(2500-25)/50,(ZT-ZB)/50],NOR=[0,-UP[2],UP[1]];
const cardBuf=gl.createBuffer(),cardTex=gl.createBuffer();
function cardVerts(s,i){const off=(2-i)*0.45;const bx=CX,by=YB+UP[1]*s+NOR[1]*off,bz=ZB+UP[2]*s+NOR[2]*off;const L=[bx-45,by,bz],R=[bx+45,by,bz],TL=[L[0],L[1]+50*UP[1],L[2]+50*UP[2]],TR=[R[0],R[1]+50*UP[1],R[2]+50*UP[2]];return new Float32Array([...L,...R,...TR,...L,...TR,...TL])}
gl.bindBuffer(gl.ARRAY_BUFFER,cardTex);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([0,1,1,1,1,0,0,1,1,0,0,0]),gl.STATIC_DRAW);
const tex=gl.createTexture();let hasTex=0;const im=new Image();im.onload=()=>{gl.bindTexture(gl.TEXTURE_2D,tex);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,im);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);hasTex=1;pede()};im.src='cartao.webp';
const CORES={branco:{c:[0.93,0.94,0.93],a:0.8,sp:22},preto:{c:[0.11,0.115,0.125],a:1,sp:40}};let corAtual='branco';
window.addEventListener('cor-porta',e=>{corAtual=e.detail;pede()});
function dot(a,b){return a.reduce((s,v,i)=>s+v*b[i],0)}function norm(a){const l=Math.hypot(...a)||1;return a.map(v=>v/l)}function cross(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]}
function lookAt(e,t,u){const z=norm(e.map((v,i)=>v-t[i])),x=norm(cross(u,z)),y=cross(z,x);return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,e),-dot(y,e),-dot(z,e),1])}
function proj(f,ar,n,fa){const t=1/Math.tan(f/2),nf=1/(n-fa);return new Float32Array([t/ar,0,0,0,0,t,0,0,0,0,(fa+n)*nf,-1,0,0,2*fa*n*nf,0])}
function mul(A,B){const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)o[c*4+r]=A[r]*B[c*4]+A[4+r]*B[c*4+1]+A[8+r]*B[c*4+2]+A[12+r]*B[c*4+3];return o}
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
let yaw=-.48,pitch=.16,dist=330,auto=!REDUZ,t0=performance.now(),visivel=true,rodando=false;
// linha do tempo dos cartões (8 s): entram de cima um a um, ficam, saem e voltam
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
function desloc(t,i){if(REDUZ)return 0;const T=(t/1000)%8,a=.25*(2-i),ent=clamp((T-a)/1.1,0,1),sai=clamp((T-5.4-.25*i)/1.1,0,1);return 95*(1-ease(ent))+95*ease(sai)}
function draw(now){rodando=false;const r=canvas.getBoundingClientRect();if(r.width<5||r.height<5)return;const dpr=Math.min(window.devicePixelRatio||1,1.75),w=Math.max(1,Math.round(r.width*dpr)),h=Math.max(1,Math.round(r.height*dpr));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}
 const t=now-t0;if(auto)yaw=-.48+.42*Math.sin(t/3200);
 gl.viewport(0,0,w,h);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);
 const eye=[dist*Math.cos(pitch)*Math.sin(yaw),dist*Math.sin(pitch),dist*Math.cos(pitch)*Math.cos(yaw)],VP=mul(proj(34*Math.PI/180,w/h,.1,1800),lookAt(eye,[0,-4,0],[0,1,0]));
 // 1) cartões (opacos; transparentes só enquanto entram/saem)
 gl.useProgram(P2);gl.uniformMatrix4fv(L2.vp,false,VP);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex);gl.uniform1i(L2.tex,0);gl.uniform1f(L2.has,hasTex);
 gl.bindBuffer(gl.ARRAY_BUFFER,cardTex);gl.enableVertexAttribArray(L2.t);gl.vertexAttribPointer(L2.t,2,gl.FLOAT,false,0,0);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
 for(let i=2;i>=0;i--){const s=desloc(t,i);const al=clamp(1-(s-30)/65,0,1);if(al<=0.01)continue;gl.uniform1f(L2.a,al);gl.uniform1f(L2.sh,i===0?1:.82);gl.bindBuffer(gl.ARRAY_BUFFER,cardBuf);gl.bufferData(gl.ARRAY_BUFFER,cardVerts(s,i),gl.DYNAMIC_DRAW);gl.enableVertexAttribArray(L2.p);gl.vertexAttribPointer(L2.p,3,gl.FLOAT,false,0,0);gl.depthMask(al>.98);gl.drawArrays(gl.TRIANGLES,0,6)}
 gl.disableVertexAttribArray(L2.t);gl.depthMask(true);
 // 2) peça: pré-passe de profundidade + cor (translúcido mostra os cartões por trás)
 const C=CORES[corAtual];gl.useProgram(P1);gl.uniformMatrix4fv(L1.vp,false,VP);gl.uniform3fv(L1.c,C.c);gl.uniform3fv(L1.eye,eye);gl.uniform1f(L1.a,C.a);gl.uniform1f(L1.sp,C.sp);
 const passes=C.a<1?[0,1]:[1];
 for(const ps of passes){gl.colorMask(ps===1,ps===1,ps===1,ps===1);gl.depthMask(ps===0||C.a>=1);if(ps===1&&C.a<1)gl.depthFunc(gl.LEQUAL);
  for(const m of parts){gl.bindBuffer(gl.ARRAY_BUFFER,m.pb);gl.enableVertexAttribArray(L1.p);gl.vertexAttribPointer(L1.p,3,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ARRAY_BUFFER,m.nb);gl.enableVertexAttribArray(L1.n);gl.vertexAttribPointer(L1.n,3,gl.FLOAT,false,0,0);gl.drawArrays(gl.TRIANGLES,0,m.count)}}
 gl.colorMask(true,true,true,true);gl.depthMask(true);gl.disableVertexAttribArray(L1.n);
 if(!REDUZ&&visivel)pede()}
function pede(){if(!rodando){rodando=true;requestAnimationFrame(draw)}}
if('IntersectionObserver' in window)new IntersectionObserver(es=>{visivel=es[0].isIntersecting;if(visivel)pede()}).observe(canvas);
const pointers=new Map();let pinch=0;
const parar=()=>{if(auto){auto=false;$('hint').style.opacity='0'}};
canvas.addEventListener('pointerdown',e=>{try{canvas.setPointerCapture(e.pointerId)}catch(_){}pointers.set(e.pointerId,[e.clientX,e.clientY]);parar()});
canvas.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;const b=pointers.get(e.pointerId);pointers.set(e.pointerId,[e.clientX,e.clientY]);const ps=[...pointers.values()];if(ps.length===1){yaw+=(e.clientX-b[0])*.009;pitch=clamp(pitch+(b[1]-e.clientY)*.007,-1.2,1.3)}else if(ps.length>=2){const n=Math.hypot(ps[0][0]-ps[1][0],ps[0][1]-ps[1][1]);if(pinch)dist=clamp(dist*pinch/n,170,700);pinch=n}pede()});
for(const ev of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(ev,e=>{pointers.delete(e.pointerId);pinch=0});
canvas.addEventListener('wheel',e=>{if(!e.ctrlKey&&!e.metaKey)return;e.preventDefault();dist=clamp(dist*Math.exp(e.deltaY*.002),170,700);parar();pede()},{passive:false});
$('reset').addEventListener('click',()=>{yaw=-.48;pitch=.16;dist=330;auto=!REDUZ;t0=performance.now();$('hint').style.opacity='1';pede()});
window.addEventListener('resize',pede);new ResizeObserver(pede).observe($('view'));pede();
`;

const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="robots" content="noindex,nofollow,noarchive"/>
<meta name="theme-color" content="#ffffff"/>
<title>Orçamento · Tio Caique Barbearia | Imperial Volt</title>
<meta name="description" content="Cartões de visita e porta-cartões personalizado para a Tio Caique Barbearia."/>
<link rel="icon" href="../../icons/favicon.svg" type="image/svg+xml"/>
<meta property="og:type" content="website"/>
<meta property="og:site_name" content="Imperial Volt"/>
<meta property="og:title" content="Orçamento · Tio Caique Barbearia"/>
<meta property="og:description" content="Seus cartões de visita e o porta-cartões do balcão. Veja em 3D e escolha o seu."/>
<meta property="og:url" content="${URL}"/>
<meta property="og:image" content="${URL}previa.jpg"/>
<meta property="og:image:width" content="1200"/><meta property="og:image:height" content="630"/>
<style>${css}</style>
</head>
<body>
${body}
${meshes}
<script>
(()=>{'use strict';
${app}
${fallback}
${gl3d}
})();
</script>
</body>
</html>
`;
fs.writeFileSync(path.join(DIR, 'index.html'), html);
console.log('ok', (html.length / 1024).toFixed(0) + ' KB', 'promoção até', PROMO_TXT);
