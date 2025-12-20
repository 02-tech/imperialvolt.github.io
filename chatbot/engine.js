/* Imperial Volt — Chat Engine (simples, robusto e sem auto pop-up) */
(function(){
  const $ = (s, el=document) => el.querySelector(s);

  const state = {
    booted: false,
  };

  function now(){
    const d = new Date();
    return d.toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"});
  }

  function addMsg(text, who){
    const body = $("#chatBody");
    if(!body) return;

    const div = document.createElement("div");
    div.className = "msg " + (who === "me" ? "msg--me" : "msg--bot");
    div.innerHTML = `
      <div>${escapeHtml(text)}</div>
      <small>${now()}</small>
    `;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  function escapeHtml(str){
    return String(str)
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }

  function route(input){
    const t = String(input || "").toLowerCase();

    if(t.includes("site") || t.includes("landing")){
      return "Perfeito. Você quer: landing (conversão) ou institucional? E qual é seu objetivo (vender, captar leads, apresentar serviços)?";
    }
    if(t.includes("sistema") || t.includes("painel")){
      return "Fechado. Esse sistema é para quê (clientes, estoque, ordens, check-in, relatórios)? Você precisa login e níveis de acesso?";
    }
    if(t.includes("autom") || t.includes("script") || t.includes("power")){
      return "Automação é onde dá mais ganho. Me diga: qual tarefa você repete todo dia e quanto tempo ela toma?";
    }
    if(t.includes("preço") || t.includes("valor") || t.includes("quanto")){
      return "Orçamento depende do escopo. Me diga: tipo (site/sistema/automação), prazo desejado e 2 referências do que você considera 'bom'.";
    }
    if(t.includes("prazo") || t.includes("tempo")){
      return "Prazo varia pelo escopo. Se você me disser o objetivo + referências, eu te dou uma estimativa real na hora.";
    }

    return "Me diga o objetivo em 1 frase: o que você quer que isso resolva? (site, sistema ou automação)";
  }

  function bind(){
    const form = $("#chatForm");
    const inp = $("#chatInput");
    if(!form || !inp) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const v = inp.value.trim();
      if(!v) return;
      inp.value = "";

      addMsg(v, "me");

      const r = route(v);
      setTimeout(() => addMsg(r, "bot"), 220);
    });
  }

  function boot(){
    if(state.booted) return;
    state.booted = true;

    bind();
    addMsg("Olá. Quer um site, sistema ou automação? Me diga o objetivo e eu te direciono.", "bot");
  }

  function focus(){
    const inp = $("#chatInput");
    if(inp) inp.focus();
  }

  window.IV_CHAT = {
    boot,
    focus
  };
})();
