/* Imperial Volt — main.js (limpo, sem auto pop-up) */
const $ = (s, el=document) => el.querySelector(s);

function setWhatsLinks() {
  const phone = "5524992144995";
  const base = "https://wa.me/" + phone;
  const msg = "Olá! Quero um orçamento. Meu objetivo é: ";
  const url = base + "?text=" + encodeURIComponent(msg);

  const a1 = $("#whatsFab");
  const a2 = $("#whatsMain");
  if(a1) a1.href = url;
  if(a2) a2.href = url;
}

function setYear(){
  const y = $("#year");
  if(y) y.textContent = String(new Date().getFullYear());
}

function themeToggle(){
  const btn = $("#themeBtn");
  if(!btn) return;

  btn.addEventListener("click", () => {
    const html = document.documentElement;
    const cur = html.getAttribute("data-theme") || "dark";
    const next = (cur === "dark") ? "light" : "dark";
    html.setAttribute("data-theme", next);
    try{ localStorage.setItem("iv_theme", next); }catch(e){}
  });
}

function mobileMenu(){
  const btn = $("#menuBtn");
  const nav = $("#mobileNav");
  if(!btn || !nav) return;

  btn.addEventListener("click", () => {
    const isHidden = nav.hasAttribute("hidden");
    if(isHidden) nav.removeAttribute("hidden");
    else nav.setAttribute("hidden", "");
  });

  nav.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if(a) nav.setAttribute("hidden", "");
  });
}

function chatUI(){
  const fab = $("#chatFab");
  const openBtn = $("#openChatBtn");
  const box = $("#ivChat");
  const close = $("#chatClose");

  const open = () => {
    if(!box) return;
    box.removeAttribute("hidden");
    try{ window.IV_CHAT && window.IV_CHAT.focus(); }catch(e){}
  };
  const hide = () => box && box.setAttribute("hidden","");

  if(fab) fab.addEventListener("click", open);
  if(openBtn) openBtn.addEventListener("click", open);
  if(close) close.addEventListener("click", hide);

  // ESC fecha
  window.addEventListener("keydown", (e) => {
    if(e.key === "Escape") hide();
  });

  // Nunca abre sozinho. Ponto.
}

function budgetPrefLinks(){
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-pref]");
    if(!a) return;

    const pref = a.getAttribute("data-pref") || "";
    const phone = "5524992144995";
    const base = "https://wa.me/" + phone;
    const msg = "Olá! Quero um orçamento. Interesse: " + pref + ". Meu objetivo é: ";
    const url = base + "?text=" + encodeURIComponent(msg);

    // se for link interno do site, não precisa navegar pro WA automaticamente
    // mas aqui é CTA de orçamento → já aponta pro #orcamento e deixa o Whats com mensagem pronta
    e.preventDefault();
    const main = document.getElementById("whatsMain");
    const fab = document.getElementById("whatsFab");
    if(main) main.href = url;
    if(fab) fab.href = url;

    const anchor = document.getElementById("orcamento");
    if(anchor) anchor.scrollIntoView({behavior:"smooth", block:"start"});
  });
}

setYear();
setWhatsLinks();
themeToggle();
mobileMenu();
chatUI();
budgetPrefLinks();

// boot do chat (mensagem inicial) — engine.js cria a API
setTimeout(() => {
  try{
    if(window.IV_CHAT && typeof window.IV_CHAT.boot === "function"){
      window.IV_CHAT.boot();
    }
  }catch(e){}
}, 0);
