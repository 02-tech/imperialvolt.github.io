/* Atendimento de atalhos: sem IA, sem campo livre e sem respostas inventadas. */
import { linkWhatsApp, montarMensagem } from "../src/js/whatsapp.js";

const estado = { pronto: false };

function irPara(id) {
  window.ImperialVoltApp?.fecharChat?.();
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function criarEscolha(texto, acao) {
  const botao = document.createElement("button");
  botao.type = "button";
  botao.className = "guided-chat__choice";
  botao.textContent = texto;
  botao.addEventListener("click", () => {
    window.ImperialVoltApp?.reiniciarChat?.();
    acao();
  });
  return botao;
}

function renderizar() {
  const corpo = document.getElementById("chatBody");
  if (!corpo) return;
  corpo.replaceChildren();
  corpo.appendChild(Object.assign(document.createElement("p"), {
    textContent: "Olá. Escolha um caminho e eu levo você direto ao ponto."
  }));
  const opcoes = document.createElement("div");
  opcoes.className = "guided-chat__choices";
  opcoes.append(
    criarEscolha("Soluções físicas sob medida", () => irPara("solucoes-fisicas")),
    criarEscolha("Analisar um projeto", () => irPara("orcamento")),
    criarEscolha("Perguntas frequentes", () => irPara("faq")),
    criarEscolha("Falar no WhatsApp", () => {
      const mensagem = montarMensagem({ origem: "Atendimento guiado" });
      window.open(linkWhatsApp(mensagem), "_blank", "noopener");
      window.ImperialVoltApp?.fecharChat?.();
    })
  );
  corpo.appendChild(opcoes);
}

function boot() {
  if (estado.pronto) return;
  estado.pronto = true;
  renderizar();
}

function reset() {
  if (!estado.pronto) boot();
  renderizar();
}

window.IV_CHAT = { boot, reset };
