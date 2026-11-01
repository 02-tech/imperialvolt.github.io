/* Imperial Volt — navegação ao rolar.
   O cabeçalho não acompanha a rolagem. Quando ele sai da tela, aparece o raio flutuante (com o número de itens do pedido);
   um toque no raio traz o cabeçalho de volta, com menu e pedido. Ele se recolhe ao escolher um destino, com Esc,
   com toque fora ou ao voltar a rolar a página. */

const $ = (seletor, raiz = document) => raiz.querySelector(seletor);
const reduz = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

function configurarLinksInternos() {
  document.addEventListener("click", (evento) => {
    const link = evento.target.closest('a[href^="#"]');
    if (!link || evento.defaultPrevented || evento.button !== 0 || evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) return;
    const id = decodeURIComponent(link.hash.slice(1));
    const destino = id && document.getElementById(id);
    if (!destino) return;
    evento.preventDefault();
    destino.scrollIntoView({ behavior: reduz() ? "auto" : "smooth", block: "start" });
    if (link.classList.contains("skip-link")) destino.focus({ preventScroll: true });
    history.pushState(null, "", link.hash);
  });
}

function configurarScrollSpy() {
  if (!("IntersectionObserver" in window)) return;
  const links = [...document.querySelectorAll('.desktop-nav a[href^="#"], #mobileNav a[href^="#"]')];
  const ids = [...new Set(links.map((link) => link.hash.slice(1)).filter(Boolean))];
  const secoes = ids.map((id) => document.getElementById(id)).filter((secao) => secao?.matches("main > section"));
  if (!secoes.length) return;

  const ativar = (id) => links.forEach((link) => {
    const ativo = link.hash === `#${id}`;
    link.classList.toggle("nav-link--ativo", ativo);
    if (ativo) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
  const atualizar = () => {
    const linha = innerHeight * 0.38;
    const atual = secoes.reduce((escolhida, secao) => secao.getBoundingClientRect().top <= linha ? secao : escolhida, secoes[0]);
    ativar(atual.id);
  };
  const observador = new IntersectionObserver(atualizar, { rootMargin: "-18% 0px -55% 0px", threshold: [0, 0.15, 0.5] });
  secoes.forEach((secao) => observador.observe(secao));
  atualizar();
}

export function iniciarNavegacao() {
  configurarLinksInternos();
  configurarScrollSpy();
  const cabecalho = $(".site-header");
  if (!cabecalho || !("IntersectionObserver" in window)) return;

  const raio = document.createElement("button");
  raio.type = "button";
  raio.className = "nav-raio";
  raio.hidden = true;
  raio.setAttribute("aria-label", "Abrir menu e pedido");
  raio.setAttribute("aria-expanded", "false");
  raio.innerHTML = '<img src="./icons/imperial-volt-bolt.svg" alt="" aria-hidden="true"><span class="nav-raio__n" hidden>0</span>';
  document.body.appendChild(raio);
  const numero = raio.querySelector(".nav-raio__n");

  // o raio mostra quantos itens há no pedido (espelha o contador do cabeçalho)
  const contador = $("#pedidoContador");
  const espelhar = () => {
    if (!contador) return;
    numero.textContent = contador.textContent;
    numero.hidden = contador.hidden;
    raio.setAttribute("aria-label", contador.hidden ? "Abrir menu e pedido" : `Abrir menu e pedido (${contador.textContent} no pedido)`);
  };
  if (contador) new MutationObserver(espelhar).observe(contador, { childList: true, attributes: true, characterData: true, subtree: true });
  espelhar();

  // marcador no topo: quando sai da tela, o cabeçalho também saiu
  const marcador = document.createElement("div");
  marcador.className = "nav-marcador";
  marcador.setAttribute("aria-hidden", "true");
  cabecalho.before(marcador);

  let fora = false, aberto = false, rolagemAoAbrir = 0;
  const atualizar = () => {
    // o cabeçalho continua grudado no topo, mas recolhido para fora da tela (sem pular o conteúdo)
    cabecalho.classList.toggle("site-header--recolhido", fora && !aberto);
    raio.hidden = !fora || aberto;
    raio.classList.toggle("is-visible", fora && !aberto);
  };
  function abrir() {
    aberto = true;
    rolagemAoAbrir = scrollY;
    raio.setAttribute("aria-expanded", "true");
    atualizar();
    const primeiro = cabecalho.querySelector("a, button");
    if (primeiro) primeiro.focus({ preventScroll: true });
  }
  function fechar(devolverFoco) {
    if (!aberto) return;
    aberto = false;
    const menu = $("#mobileNav");
    if (menu && !menu.hidden) document.dispatchEvent(new CustomEvent("iv:fechar-menu"));
    raio.setAttribute("aria-expanded", "false");
    atualizar();
    if (devolverFoco && fora) raio.focus({ preventScroll: true });
  }

  new IntersectionObserver(([entrada]) => {
    fora = !entrada.isIntersecting;
    if (!fora) fechar(false);
    atualizar();
  }, { rootMargin: "80px 0px 0px 0px" }).observe(marcador);

  raio.addEventListener("click", abrir);
  cabecalho.addEventListener("click", (e) => { if (aberto && e.target.closest("a[href^='#']")) fechar(false); });
  // o pedido abre por cima; o cabeçalho flutuante se recolhe
  $("#pedidoBotao")?.addEventListener("click", () => fechar(false));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && aberto) fechar(true); });
  document.addEventListener("pointerdown", (e) => { if (aberto && !cabecalho.contains(e.target) && !raio.contains(e.target)) fechar(false); });
  addEventListener("scroll", () => { if (aberto && Math.abs(scrollY - rolagemAoAbrir) > 160) fechar(false); }, { passive: true });
}
