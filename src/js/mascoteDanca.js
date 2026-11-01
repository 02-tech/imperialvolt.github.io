// Personagem dançando enquanto o catálogo rola. O frame avança conforme a
// passagem pela seção #catalogo; sem JS, sem IntersectionObserver ou com
// prefers-reduced-motion, fica parado no primeiro frame (progressive enhancement).
const TOTAL_FRAMES = 8;
const FRAME_SRC = (n) => `./src/imagens/marca/danca/danca-${String(n).padStart(2, "0")}.png`;

export function iniciarMascoteDanca() {
  const img = document.getElementById("catalogoDanca");
  const secao = document.getElementById("catalogo");
  // o progresso da dança usa a passagem do PRÓPRIO personagem pela tela, não da
  // seção #catalogo inteira (ela tem milhares de px, o personagem só fica à
  // vista por uma fração pequena disso - calcular contra a seção inteira
  // deixava o progresso preso perto de 0 durante todo o tempo em que ele
  // realmente aparece, então ele nunca avançava de frame visivelmente)
  const palco = document.querySelector(".catalogo__mascote") || secao;
  if (!img || !secao || !palco) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!("IntersectionObserver" in window)) return;

  let carregados = false;
  let frameAtual = 1;
  let pendente = false;

  function carregarRestante() {
    if (carregados) return;
    carregados = true;
    for (let n = 2; n <= TOTAL_FRAMES; n++) {
      const pre = new Image();
      pre.src = FRAME_SRC(n);
    }
  }

  function atualizar() {
    pendente = false;
    const retangulo = palco.getBoundingClientRect();
    const percurso = retangulo.height + innerHeight;
    const progresso = Math.min(1, Math.max(0, (innerHeight - retangulo.top) / percurso));
    const indice = 1 + Math.min(TOTAL_FRAMES - 1, Math.floor(progresso * TOTAL_FRAMES));
    if (indice !== frameAtual) {
      frameAtual = indice;
      img.src = FRAME_SRC(indice);
    }
  }

  function aoRolar() {
    if (pendente) return;
    pendente = true;
    requestAnimationFrame(atualizar);
  }

  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        carregarRestante();
        window.addEventListener("scroll", aoRolar, { passive: true });
        atualizar();
      } else {
        window.removeEventListener("scroll", aoRolar);
      }
    });
  }, { threshold: 0 });
  observador.observe(secao);
}
