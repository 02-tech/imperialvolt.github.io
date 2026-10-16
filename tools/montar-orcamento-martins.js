// Uso: node tools/montar-orcamento-martins.js <laboratorio.html> <imagem-conceito.jpg> <pasta-destino> <slug> <AAAA-MM-DD validade>
// Orçamento do porta-escovinha floral (Martins), 16/10/2026. Geometria: a MESMA do laboratório de modelagem autoral
// (docs/orcamentos-fontes/martins-laboratorio-mascara-floral.html), gerada no navegador. Preços da pesquisa aprovada:
// Pix R$ 8,00/un (branco translúcido) e R$ 8,50/un (outras cores); a partir de 75 un, mais 5% (aplicado antes do Pix).
const fs = require('fs'), path = require('path');
const [LAB, IMG, DIR, SLUG, VALIDADE] = process.argv.slice(2);
if (!/^\d{4}-\d{2}-\d{2}$/.test(VALIDADE || '')) throw new Error('informe a validade AAAA-MM-DD');
const lab = fs.readFileSync(LAB, 'utf8');
const ini = lab.indexOf('function smooth(v)'), fim = lab.indexOf('function config()');
if (ini < 0 || fim < ini) throw new Error('geometria do laboratorio nao encontrada');
const geometria = lab.slice(ini, fim);
fs.mkdirSync(DIR, { recursive: true });
fs.copyFileSync(IMG, path.join(DIR, 'conceito.jpg'));
const URL = `https://imperialvolt.com/orcamentos/${SLUG}/`;
const [, vm, vd] = VALIDADE.split('-'); const VAL_TXT = `${vd}/${vm}`;

const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="robots" content="noindex,nofollow,noarchive"/>
<meta name="theme-color" content="#ffffff"/>
<title>Orçamento · Porta-escovinha floral | Imperial Volt</title>
<meta name="description" content="Porta-escovinha floral personalizado, produzido sob encomenda pela Imperial Volt."/>
<link rel="icon" href="../../icons/favicon.svg" type="image/svg+xml"/>
<meta property="og:type" content="website"/>
<meta property="og:site_name" content="Imperial Volt"/>
<meta property="og:title" content="Orçamento · Porta-escovinha floral"/>
<meta property="og:description" content="Brinde com flores em relevo e tampa de rosca. Veja em 3D e escolha cor e quantidade."/>
<meta property="og:url" content="${URL}"/>
<meta property="og:image" content="${URL}previa.jpg"/>
<meta property="og:image:width" content="1200"/><meta property="og:image:height" content="630"/>
<style>
:root{color-scheme:light;--ink:#262330;--muted:#6f6876;--line:#ece6ea;--soft:#fbf7f9;--rosa:#c94a81;--rosa2:#a9356a;--ok:#1d7157}
*{box-sizing:border-box}html{scroll-behavior:smooth}
body{margin:0;background:#fff;color:var(--ink);font:16px/1.55 Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;-webkit-font-smoothing:antialiased}
.wrap{max-width:1060px;margin:0 auto;padding:0 22px}
header{border-bottom:1px solid var(--line)}
.nav{height:68px;display:flex;align-items:center;justify-content:space-between;gap:14px}
.brand{display:flex;align-items:center;gap:10px;color:inherit;text-decoration:none;font-weight:800;letter-spacing:-.03em}
.brand img{width:36px;height:36px;border-radius:11px;display:block}
.date{font-size:13px;color:var(--muted)}
.hero{padding:44px 0 6px}
.eyebrow{margin:0 0 8px;font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--rosa)}
h1{margin:0;font-size:clamp(30px,5vw,48px);line-height:1.07;letter-spacing:-.045em}
.hero p{margin:12px 0 0;color:var(--muted);max-width:600px}
h2{margin:0 0 6px;font-size:26px;letter-spacing:-.03em}
.sub{margin:0 0 18px;color:var(--muted)}
section{padding:40px 0 6px}
.reveal{opacity:0;transform:translateY(18px);transition:opacity .7s ease,transform .7s ease}.reveal.in{opacity:1;transform:none}
.show{display:grid;grid-template-columns:1.25fr .75fr;gap:18px;align-items:stretch}
.stage{border:1px solid var(--line);border-radius:22px;overflow:hidden;position:relative;background:radial-gradient(ellipse at 45% 28%,#fdf6fa 0%,#e6d9e1 100%)}
.stage.claro{background:radial-gradient(ellipse at 45% 28%,#ffffff 0%,#f2ecef 100%)}
.viewer{width:100%;aspect-ratio:5/4;position:relative}
.viewer canvas{width:100%;height:100%;display:block;touch-action:none;cursor:grab}.viewer canvas:active{cursor:grabbing}
.viewer img{width:100%;height:100%;object-fit:contain;display:none}
.viewer.sem3d canvas{display:none}.viewer.sem3d img{display:block}
.hint{position:absolute;left:14px;bottom:14px;font-size:12px;color:#5d5262;background:#ffffffe0;border-radius:999px;padding:6px 12px;pointer-events:none;transition:opacity .4s}
.reset{position:absolute;right:14px;bottom:14px;width:36px;height:36px;border-radius:50%;border:1px solid var(--line);background:#fff;font-size:16px;cursor:pointer}
.cores{position:absolute;left:14px;top:14px;right:14px;display:flex;flex-wrap:wrap;gap:6px}
.cor{display:flex;align-items:center;gap:7px;border:0;background:#ffffffe6;border-radius:999px;padding:5px 11px 5px 6px;font:inherit;font-size:13px;font-weight:700;color:var(--ink);cursor:pointer;box-shadow:0 3px 10px rgba(0,0,0,.05)}
.cor i{width:20px;height:20px;border-radius:50%;display:block;border:1px solid #d8cfd5}
.cor.on{background:var(--ink);color:#fff}
.side{display:flex;flex-direction:column;gap:14px}
.feat{border:1px solid var(--line);border-radius:20px;padding:18px 20px}
.feat h3{margin:0 0 4px;font-size:17px;letter-spacing:-.02em}.feat p{margin:0;color:var(--muted);font-size:14px}
.medidas{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.medidas div{background:var(--soft);border-radius:14px;padding:12px 14px}.medidas b{display:block;font-size:19px;letter-spacing:-.02em}.medidas span{font-size:12px;color:var(--muted)}
.orc{display:grid;grid-template-columns:1.1fr .9fr;gap:18px;align-items:start}
.box{border:1.5px solid var(--line);border-radius:20px;padding:20px}
.label{font-size:13px;font-weight:700;color:var(--muted);margin:0 0 10px}
.qty{display:flex;align-items:center;gap:10px}
.qty button{width:42px;height:42px;border-radius:12px;border:1px solid var(--line);background:#fff;font-size:20px;cursor:pointer;color:inherit}
.qty input{width:90px;height:42px;border:1px solid var(--line);border-radius:12px;text-align:center;font:inherit;font-weight:700}
.qty span{font-size:13px;color:var(--muted)}
.chips{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}
.chips button{font:inherit;font-size:14px;font-weight:700;border:1px solid var(--line);background:#fff;border-radius:999px;padding:6px 14px;cursor:pointer;color:inherit}
.chips button.on{background:var(--ink);border-color:var(--ink);color:#fff}
.acab{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:6px}
.acab button{font:inherit;text-align:left;border:1.5px solid var(--line);background:#fff;border-radius:14px;padding:12px 14px;cursor:pointer;color:inherit}
.acab button b{display:block;font-size:15px}.acab button strong{display:block;font-size:19px;letter-spacing:-.03em;margin-top:2px}.acab button small{font-size:12px;color:var(--muted)}
.acab button.on{border-color:var(--rosa);background:#fff7fb;box-shadow:inset 0 0 0 1px var(--rosa)}
.faixa{margin-top:14px;border-radius:14px;padding:12px 14px;background:#f6f2f5;font-size:14px;color:#5b4f5b}
.faixa.on{background:#edf8f1;color:var(--ok);font-weight:700}
.res{background:#fff;border:1.5px solid #ead3df;border-radius:20px;padding:22px;position:sticky;top:16px}
.res h3{margin:0 0 2px;font-size:18px}
.validade{margin:0 0 10px;font-size:12px;font-weight:700;color:var(--rosa2)}
.res .row{display:flex;justify-content:space-between;gap:12px;font-size:15px;padding:5px 0;color:#4a4350}
.res .row[hidden]{display:none}.res .row.desc{color:var(--ok);font-weight:600}
.res .pix{margin-top:12px;padding-top:14px;border-top:1px solid var(--line);display:flex;justify-content:space-between;align-items:end;gap:10px}
.res .pix span{font-weight:700}.res .pix small{display:block;font-weight:600;color:var(--ok);font-size:13px}
.res .pix strong{font-size:36px;letter-spacing:-.04em;line-height:1;transition:transform .2s}.res .pix strong.bump{transform:scale(1.06)}
.res .un{text-align:right;font-size:14px;color:var(--ink);font-weight:700;margin-top:4px}
.res .other{text-align:right;font-size:14px;color:var(--muted);margin-top:2px}
.cta{display:block;width:100%;margin-top:18px;border:0;border-radius:14px;background:#1f8f4e;color:#fff;font:inherit;font-weight:800;font-size:17px;padding:16px;cursor:pointer}
.cta:hover{filter:brightness(1.06)}
.bom{margin:14px 0 0;padding:0;list-style:none;display:grid;gap:6px;font-size:13px;color:var(--muted)}
.bom li{display:flex;gap:8px}.bom li::before{content:"•";color:var(--rosa)}
.vencido{margin:0 0 14px;padding:10px 14px;border-radius:12px;background:#fff4dc;color:#6b4700;font-size:14px}
button:focus-visible,input:focus-visible,a:focus-visible{outline:2px solid var(--rosa);outline-offset:2px}
footer{margin-top:48px;border-top:1px solid var(--line);padding:18px 0 30px;font-size:13px;color:var(--muted)}
footer .wrap{display:flex;flex-wrap:wrap;gap:6px 18px;align-items:center}footer a{color:inherit}
.nota{font-size:12px;color:#8a8190;margin:14px 0 0}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
@media(max-width:900px){.show,.orc{grid-template-columns:1fr}.res{position:static}}
@media(max-width:480px){.wrap{padding:0 16px}.hero{padding-top:30px}.date{font-size:12px}.res .pix strong{font-size:32px}.cor{padding:4px 9px 4px 5px;font-size:12px}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}.reveal{opacity:1;transform:none;transition:none}}
@media print{.cta,.reset,.hint{display:none!important}.res{position:static}.reveal{opacity:1;transform:none}}
</style>
</head>
<body>
<header><div class="wrap nav"><a class="brand" href="https://imperialvolt.com/"><img src="../../icons/imperial-volt-bolt.svg" alt=""/>Imperial Volt</a><span class="date">Orçamento de 16/10/2026</span></div></header>
<main class="wrap">
<div class="hero">
<p class="eyebrow">Proposta para Martins</p>
<h1>Porta-escovinha floral</h1>
<p>Um brinde delicado, com flores em relevo e tampa de rosca. Projeto próprio da Imperial Volt, feito sob encomenda.</p>
</div>

<section aria-labelledby="t1" class="reveal">
<h2 id="t1">Veja a peça</h2>
<p class="sub">Gire, escolha a cor e veja a tampa abrindo.</p>
<div class="show">
<div class="stage" id="stage">
<div class="viewer" id="view"><canvas id="model3d" aria-label="Porta-escovinha floral em 3D. Arraste para girar."></canvas><img src="conceito.jpg" alt="Imagem ilustrativa do porta-escovinha floral" width="570" height="712"/></div>
<div class="cores" role="group" aria-label="Cor da peça">
<button class="cor on" type="button" data-cor="branco" aria-pressed="true"><i style="background:radial-gradient(circle at 35% 30%,#fff,#e7e3e6 65%,#cfc6cc)"></i>Branco translúcido</button>
<button class="cor" type="button" data-cor="rosa" aria-pressed="false"><i style="background:#e0457f"></i>Rosa</button>
<button class="cor" type="button" data-cor="lilas" aria-pressed="false"><i style="background:#a98ad6"></i>Lilás</button>
<button class="cor" type="button" data-cor="preto" aria-pressed="false"><i style="background:#1d1b20"></i>Preto</button>
</div>
<span class="hint" id="hint">Arraste para girar</span>
<button class="reset" id="reset" type="button" aria-label="Voltar à posição inicial">↺</button>
</div>
<div class="side">
<div class="feat"><h3>Flores em relevo</h3><p>Corpo e tampa com o mesmo desenho floral, que dá a volta inteira na peça.</p></div>
<div class="feat"><h3>Tampa de rosca</h3><p>Fecha girando, como uma embalagem de verdade. A escovinha fica protegida dentro.</p></div>
<div class="medidas"><div><b>11,8 cm</b><span>altura montada</span></div><div><b>2,3 cm</b><span>diâmetro</span></div></div>
</div>
</div>
</section>

<section aria-labelledby="t2" class="reveal">
<h2 id="t2">Seu orçamento</h2>
<p class="vencido" id="vencido" hidden>Este orçamento venceu em ${VAL_TXT}. Fale com a gente para renovar os valores.</p>
<div class="orc">
<div class="box">
<p class="label">Quantas unidades?</p>
<div class="qty"><button id="less" type="button" aria-label="Diminuir">−</button><label class="sr" for="qty">Quantidade</label><input id="qty" type="number" inputmode="numeric" min="50" step="1" value="50"/><button id="more" type="button" aria-label="Aumentar">+</button><span>mínimo 50</span></div>
<div class="chips" role="group" aria-label="Atalhos de quantidade"><button type="button" data-q="50">50</button><button type="button" data-q="75">75</button><button type="button" data-q="100">100</button></div>
<p class="label" style="margin-top:18px">Acabamento</p>
<div class="acab" role="group" aria-label="Acabamento">
<button type="button" data-acab="branco" class="on" aria-pressed="true"><b>Branco translúcido</b><strong id="pBranco">R$ 8,00</strong><small>por unidade no Pix</small></button>
<button type="button" data-acab="cor" aria-pressed="false"><b>Outras cores</b><strong id="pCor">R$ 8,50</strong><small>por unidade no Pix</small></button>
</div>
<div class="faixa" id="faixa">A partir de 75 unidades: mais 5% de desconto.</div>
</div>
<aside class="res" aria-live="polite">
<h3>Resumo</h3><p class="validade" id="validade">Valores válidos até ${VAL_TXT}</p>
<div class="row"><span id="rowQtd">50 porta-escovinhas</span><b id="rowCor">Branco translúcido</b></div>
<div class="row desc" id="rowVol" hidden><span>Desconto por quantidade (5%)</span><b>incluído</b></div>
<div class="pix"><span>No Pix<small id="saving">Você economiza R$ 70,59</small></span><strong id="total">R$ 400,00</strong></div>
<div class="un" id="un">R$ 8,00 por unidade</div>
<div class="other" id="other">Outras formas: R$ 470,59</div>
<button class="cta" id="share" type="button">Confirmar pelo WhatsApp</button>
<ul class="bom">
<li>Produção depois da aprovação de uma amostra física</li>
<li>Prazo combinado depois da amostra aprovada</li>
<li>Escovinhas e frete não incluídos</li>
</ul>
</aside>
</div>
<p class="nota">Peça decorativa para guardar a escovinha; não serve para armazenar cosmético direto. Cor e translucidez podem variar um pouco na peça real. Nas outras cores, a tonalidade é confirmada antes da produção.</p>
</section>
</main>
<footer><div class="wrap"><strong>Imperial Volt</strong><a href="https://wa.me/5524992144995" target="_blank" rel="noopener">WhatsApp +55 24 99214-4995</a><a href="https://www.instagram.com/imperialvolt" target="_blank" rel="noopener">@imperialvolt</a><span>CNPJ 60.179.279/0001-44</span></div></footer>
<script>
(()=>{'use strict';
const $=id=>document.getElementById(id);
const BRL=c=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(c/100);
const REDUZ=matchMedia('(prefers-reduced-motion: reduce)').matches;
const VALIDADE=new Date('${VALIDADE}T23:59:59-03:00');const vencido=Date.now()>VALIDADE.getTime();
const MIN=50,VOL=75;let acab='branco',cor='branco';
const NOME_COR={branco:'Branco translúcido',rosa:'Rosa',lilas:'Lilás',preto:'Preto'};
const qtd=()=>Math.max(MIN,Math.floor(Number($('qty').value)||MIN));
// preço no Pix por unidade (centavos x100 para não perder 0,5 centavo): branco 800, cor 850; 75+ = x0,95
function quote(){const q=qtd(),vol=q>=VOL,u=(acab==='branco'?800:850)*(vol?.95:1);const pix=Math.round(q*u);const cheio=Math.round(q*u/.85);return {q,vol,u,pix,cheio,off:cheio-pix}}
let ult='';
function update(){const x=quote();
 $('rowQtd').textContent=x.q+' porta-escovinhas';$('rowCor').textContent=acab==='branco'?'Branco translúcido':(cor==='branco'?'Outra cor':NOME_COR[cor]);
 $('rowVol').hidden=!x.vol;$('faixa').classList.toggle('on',x.vol);$('faixa').textContent=x.vol?'Desconto de 5% por quantidade aplicado.':'A partir de 75 unidades: mais 5% de desconto.';
 $('pBranco').textContent=BRL(Math.round(800*(x.vol?.95:1)));$('pCor').textContent=BRL(Math.round(850*(x.vol?.95:1)));
 const t=BRL(x.pix);$('total').textContent=t;if(t!==ult&&!REDUZ){$('total').classList.add('bump');setTimeout(()=>$('total').classList.remove('bump'),180)}ult=t;
 $('saving').textContent='Você economiza '+BRL(x.off);$('un').textContent=BRL(Math.round(x.u))+' por unidade';$('other').textContent='Outras formas: '+BRL(x.cheio);
 document.querySelectorAll('.chips button').forEach(c=>c.classList.toggle('on',+c.dataset.q===x.q));
 document.querySelectorAll('[data-acab]').forEach(b=>{const on=b.dataset.acab===acab;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)})}
const setQ=n=>{$('qty').value=Math.max(MIN,n);update()};
$('qty').addEventListener('input',update);$('qty').addEventListener('change',()=>setQ(qtd()));
$('less').addEventListener('click',()=>setQ(qtd()-1));$('more').addEventListener('click',()=>setQ(qtd()+1));
document.querySelectorAll('.chips button').forEach(c=>c.addEventListener('click',()=>setQ(+c.dataset.q)));
function setCor(c){cor=c;document.querySelectorAll('[data-cor]').forEach(b=>{const on=b.dataset.cor===c;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)});$('stage').classList.toggle('claro',c==='preto');acab=c==='branco'?'branco':'cor';window.dispatchEvent(new CustomEvent('cor-peca',{detail:c}));update()}
document.querySelectorAll('[data-cor]').forEach(b=>b.addEventListener('click',()=>setCor(b.dataset.cor)));
document.querySelectorAll('[data-acab]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.acab==='branco')setCor('branco');else setCor(cor==='branco'?'rosa':cor)}));
if(vencido){$('vencido').hidden=false;$('validade').hidden=true}
function summary(){const x=quote();return ['Olá! Quero confirmar o orçamento do porta-escovinha floral.','','Imperial Volt · Porta-escovinha floral',x.q+' unidades · '+(acab==='branco'?'branco translúcido':'cor: '+NOME_COR[cor]+' (tonalidade a confirmar)'),(x.vol?'Com 5% de desconto por quantidade. ':'')+'Por unidade no Pix: '+BRL(Math.round(x.u)),'TOTAL no Pix: '+BRL(x.pix)+' (outras formas: '+BRL(x.cheio)+')','Produção depois da aprovação da amostra física. Escovinhas e frete não incluídos.','','Orçamento: ${URL}'].join('\\n')}
$('share').addEventListener('click',()=>window.open('https://wa.me/5524992144995?text='+encodeURIComponent(summary()),'_blank','noopener,noreferrer'));
update();
if('IntersectionObserver' in window&&!REDUZ){const io=new IntersectionObserver(es=>{for(const e of es)if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}},{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>io.observe(el))}else document.querySelectorAll('.reveal').forEach(el=>el.classList.add('in'));

// ===== 3D: geometria do laboratório autoral (mesmas funções), animação da tampa abrindo e fechando =====
const TAU=Math.PI*2;
${geometria}
const canvas=$('model3d');const gl=canvas.getContext('webgl2',{alpha:true,antialias:true,preserveDrawingBuffer:true});
if(!gl){$('view').classList.add('sem3d');$('hint').hidden=true;$('reset').hidden=true;return}
const OPT={d:23,h:76,c:39,r:1,g:.3};
const vs=\`#version 300 es
in vec3 aPos;in vec3 aNor;uniform mat4 uVP;uniform vec3 uOff;uniform float uRot;out vec3 vN;out vec3 vP;
void main(){float c=cos(uRot),s=sin(uRot);vec3 p=vec3(c*aPos.x-s*aPos.y,s*aPos.x+c*aPos.y,aPos.z)+uOff;vec3 n=vec3(c*aNor.x-s*aNor.y,s*aNor.x+c*aNor.y,aNor.z);
vec3 w=vec3(p.x,p.z,-p.y);vN=vec3(n.x,n.z,-n.y);vP=w;gl_Position=uVP*vec4(w,1.0);}\`;
const fs=\`#version 300 es
precision highp float;in vec3 vN;in vec3 vP;uniform vec3 uCol;uniform vec3 uEye;uniform float uA;uniform float uSp;out vec4 o;
void main(){vec3 n=normalize(vN);vec3 v=normalize(uEye-vP);if(dot(n,v)<0.0)n=-n;float d=max(dot(n,normalize(vec3(-.45,.8,.4))),0.0);float f=max(dot(n,normalize(vec3(.4,.3,-.8))),0.0);
vec3 h=normalize(normalize(vec3(-.3,.9,.35))+v);float sp=pow(max(dot(n,h),0.0),uSp);float fr=pow(1.0-max(dot(n,v),0.0),2.0);
vec3 c=uCol*(.55+.38*d+.10*f)+vec3(.20)*sp+vec3(.08)*fr;o=vec4(min(c,vec3(1.0)),clamp(uA+(1.0-uA)*fr*.8,0.0,1.0));}\`;
function sh(t,s){const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);if(!gl.getShaderParameter(x,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(x));return x}
const prog=gl.createProgram();gl.attachShader(prog,sh(gl.VERTEX_SHADER,vs));gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,fs));gl.linkProgram(prog);gl.useProgram(prog);
const U={};for(const n of ['uVP','uOff','uRot','uCol','uEye','uA','uSp'])U[n]=gl.getUniformLocation(prog,n);
const pecas=[buildMesh('body',OPT),buildMesh('cap',OPT)].map(m=>{const vao=gl.createVertexArray();gl.bindVertexArray(vao);const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,m.v,gl.STATIC_DRAW);let l=gl.getAttribLocation(prog,'aPos');gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,3,gl.FLOAT,false,0,0);const nb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,nb);gl.bufferData(gl.ARRAY_BUFFER,m.normals,gl.STATIC_DRAW);l=gl.getAttribLocation(prog,'aNor');gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,3,gl.FLOAT,false,0,0);const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,m.indices,gl.STATIC_DRAW);gl.bindVertexArray(null);return {vao,count:m.indices.length}});
const CORES={branco:{c:[.95,.94,.95],a:.78,sp:24},rosa:{c:[.90,.27,.50],a:1,sp:30},lilas:{c:[.66,.54,.84],a:1,sp:30},preto:{c:[.11,.105,.12],a:1,sp:44}};let corAt='branco';
window.addEventListener('cor-peca',e=>{corAt=e.detail;pede()});
function dot(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]}function norm(a){const l=Math.hypot(a[0],a[1],a[2])||1;return [a[0]/l,a[1]/l,a[2]/l]}function cross(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]}
function lookAt(e,t,u){const z=norm([e[0]-t[0],e[1]-t[1],e[2]-t[2]]),x=norm(cross(u,z)),y=cross(z,x);return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,e),-dot(y,e),-dot(z,e),1])}
function proj(f,ar,n,fa){const t=1/Math.tan(f/2),nf=1/(n-fa);return new Float32Array([t/ar,0,0,0,0,t,0,0,0,0,(fa+n)*nf,-1,0,0,2*fa*n*nf,0])}
function mul(A,B){const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)o[c*4+r]=A[r]*B[c*4]+A[4+r]*B[c*4+1]+A[8+r]*B[c*4+2]+A[12+r]*B[c*4+3];return o}
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v)),ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
let yaw=-.5,pitch=.16,dist=330,auto=!REDUZ,t0=performance.now(),visivel=true,rodando=false;
// ciclo de 8 s: fechada, tampa desenrosca (sobe 10 mm girando 4 voltas = passo 2,4 mm) e se afasta, fica aberta, volta e enrosca
function tampa(t){if(REDUZ)return {lift:0,rot:0};const T=(t/1000)%8;let k=0;if(T<2)k=0;else if(T<3.6)k=ease((T-2)/1.6);else if(T<5.2)k=1;else if(T<6.8)k=1-ease((T-5.2)/1.6);else k=0;
 const desenrosca=clamp(k/.55,0,1),afasta=clamp((k-.55)/.45,0,1);return {lift:10*desenrosca+38*ease(afasta),rot:-desenrosca*TAU*10/2.4}}
function draw(now){rodando=false;const r=canvas.getBoundingClientRect();if(r.width<5)return;const dpr=Math.min(devicePixelRatio||1,1.75),w=Math.round(r.width*dpr),h=Math.round(r.height*dpr);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}
 const t=now-t0;if(auto)yaw=-.5+.5*Math.sin(t/3400);const tp=tampa(t);
 gl.viewport(0,0,w,h);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
 const alvo=[0,(OPT.h+3+OPT.c+tp.lift)/2,0],eye=[alvo[0]+dist*Math.cos(pitch)*Math.sin(yaw),alvo[1]+dist*Math.sin(pitch),alvo[2]+dist*Math.cos(pitch)*Math.cos(yaw)];
 gl.uniformMatrix4fv(U.uVP,false,mul(proj(32*Math.PI/180,w/h,1,2000),lookAt(eye,alvo,[0,1,0])));gl.uniform3fv(U.uEye,eye);
 const C=CORES[corAt];gl.uniform3fv(U.uCol,C.c);gl.uniform1f(U.uA,C.a);gl.uniform1f(U.uSp,C.sp);
 const pos=[[0,0,0,0],[0,0,OPT.h+3+tp.lift,tp.rot]];
 for(const ps of (C.a<1?[0,1]:[1])){gl.colorMask(ps===1,ps===1,ps===1,ps===1);gl.depthMask(ps===0||C.a>=1);
  pecas.forEach((m,i)=>{gl.bindVertexArray(m.vao);gl.uniform3fv(U.uOff,pos[i].slice(0,3));gl.uniform1f(U.uRot,pos[i][3]);gl.drawElements(gl.TRIANGLES,m.count,gl.UNSIGNED_INT,0)})}
 gl.colorMask(true,true,true,true);gl.depthMask(true);gl.bindVertexArray(null);
 if(!REDUZ&&visivel)pede()}
function pede(){if(!rodando){rodando=true;requestAnimationFrame(draw)}}
if('IntersectionObserver' in window)new IntersectionObserver(es=>{visivel=es[0].isIntersecting;if(visivel)pede()}).observe(canvas);
const pts=new Map();let pinch=0;const parar=()=>{if(auto){auto=false;$('hint').style.opacity='0'}};
canvas.addEventListener('pointerdown',e=>{try{canvas.setPointerCapture(e.pointerId)}catch(_){}pts.set(e.pointerId,[e.clientX,e.clientY]);parar()});
canvas.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;const b=pts.get(e.pointerId);pts.set(e.pointerId,[e.clientX,e.clientY]);const p=[...pts.values()];if(p.length===1){yaw+=(e.clientX-b[0])*.009;pitch=clamp(pitch+(b[1]-e.clientY)*.007,-1.2,1.3)}else{const n=Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1]);if(pinch)dist=clamp(dist*pinch/n,170,620);pinch=n}pede()});
for(const ev of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(ev,e=>{pts.delete(e.pointerId);pinch=0});
canvas.addEventListener('wheel',e=>{if(!e.ctrlKey&&!e.metaKey)return;e.preventDefault();dist=clamp(dist*Math.exp(e.deltaY*.002),170,620);parar();pede()},{passive:false});
$('reset').addEventListener('click',()=>{yaw=-.5;pitch=.16;dist=330;auto=!REDUZ;t0=performance.now();$('hint').style.opacity='1';pede()});
window.addEventListener('resize',pede);new ResizeObserver(pede).observe($('view'));pede();
})();
</script>
</body>
</html>
`;
fs.writeFileSync(path.join(DIR, 'index.html'), html);
console.log('ok', (html.length / 1024).toFixed(0) + ' KB', 'validade', VAL_TXT);
