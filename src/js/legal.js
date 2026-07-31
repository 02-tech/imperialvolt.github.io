/* Imperial Volt — renderização genérica de documentos legais a partir de dados-site/*.json
   Mantém uma única fonte de dados: nada aqui deve conter texto jurídico embutido. */

function humanizarChave(chave) {
  const mapa = {
    cnpj: "CNPJ",
    inpi: "INPI"
  };
  const semCamel = chave.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  const palavras = semCamel.split(/[\s_]+/).map((p) => mapa[p.toLowerCase()] || p);
  const frase = palavras.join(" ");
  return frase.charAt(0).toUpperCase() + frase.slice(1);
}

function renderArray(valor, nivel) {
  if (!valor.length) return "";
  if (typeof valor[0] !== "object") {
    return "<ul>" + valor.map((v) => `<li>${v}</li>`).join("") + "</ul>";
  }
  return valor.map((item) => {
    const chaveLabel = ["categoria", "nome", "destinatario", "rotulo", "pergunta", "titulo"].find((k) => item[k]);
    const label = chaveLabel ? item[chaveLabel] : null;
    const resto = { ...item };
    if (chaveLabel) delete resto[chaveLabel];
    if (item.pergunta) {
      return `<p><b>${item.pergunta}</b><br>${item.resposta || ""}</p>`;
    }
    return (label ? `<h${nivel}>${label}</h${nivel}>` : "") + renderObjeto(resto, Math.min(nivel + 1, 6));
  }).join("");
}

function renderObjeto(obj, nivel = 3) {
  let html = "";
  for (const [chave, valor] of Object.entries(obj)) {
    if (chave === "titulo" || chave === "ultimaAtualizacao" || valor == null || valor === "") continue;
    const rotulo = humanizarChave(chave);
    if (typeof valor === "string" || typeof valor === "number" || typeof valor === "boolean") {
      html += `<h${nivel}>${rotulo}</h${nivel}><p>${valor}</p>`;
    } else if (Array.isArray(valor)) {
      html += `<h${nivel}>${rotulo}</h${nivel}>` + renderArray(valor, nivel + 1);
    } else if (typeof valor === "object") {
      html += `<h${nivel}>${rotulo}</h${nivel}>` + renderObjeto(valor, Math.min(nivel + 1, 6));
    }
  }
  return html;
}

export async function renderDocumentoLegal({ arquivos, alvoId }) {
  const alvo = document.getElementById(alvoId);
  if (!alvo) return;

  const specs = arquivos.map((a) => (typeof a === "string" ? { arquivo: a } : a));

  try {
    const documentos = await Promise.all(specs.map((s) => fetch(s.arquivo).then((r) => r.json())));
    alvo.innerHTML = documentos.map((doc, i) => {
      const titulo = doc.titulo || specs[i].titulo || "";
      const cabecalho = `<h1>${titulo}</h1>` + (doc.ultimaAtualizacao ? `<p class="muted small">Última atualização: ${doc.ultimaAtualizacao}</p>` : "");
      return `<section class="legalDoc">${cabecalho}${renderObjeto(doc, 2)}</section>`;
    }).join("<hr class='legalDivisor'>");
  } catch (e) {
    alvo.innerHTML = "<p>Não foi possível carregar este documento no momento.</p>";
    console.error(e);
  }
}
