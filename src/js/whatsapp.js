/* Imperial Volt — construção de mensagens dinâmicas para WhatsApp */

const TELEFONE = "5524992144995";

export function linkWhatsApp(mensagem) {
  return "https://wa.me/" + TELEFONE + "?text=" + encodeURIComponent(mensagem);
}

/**
 * Monta uma mensagem comercial personalizada a partir dos campos preenchidos.
 * Campos vazios/nulos são omitidos, evitando mensagens genéricas ou incompletas.
 */
export function montarMensagem(campos) {
  const linhas = ["Olá! Vi no site da Imperial Volt e tenho interesse."];

  if (campos.produto) linhas.push("Produto/serviço: " + campos.produto);
  if (campos.plano) linhas.push("Opção/plano: " + campos.plano);
  if (campos.quantidade) linhas.push("Quantidade: " + campos.quantidade);
  if (campos.finalidade) linhas.push("Finalidade: " + campos.finalidade);
  if (campos.personalizacao) linhas.push("Personalização desejada: " + campos.personalizacao);
  if (campos.paginaPersonalizada) linhas.push("Interesse em página/aplicação personalizada: " + campos.paginaPersonalizada);
  if (campos.plataforma) linhas.push("Plataforma: " + campos.plataforma);
  if (campos.estruturaDados) linhas.push("Dados e operação: " + campos.estruturaDados);
  if (campos.integracoes) linhas.push("Integrações/automação: " + campos.integracoes);
  if (campos.publicacaoLojas) linhas.push("Publicação em lojas: " + campos.publicacaoLojas);
  if (campos.manutencao) linhas.push("Manutenção/hospedagem mensal: " + campos.manutencao);
  if (campos.observacoes) linhas.push("Observações: " + campos.observacoes);
  if (campos.valor) linhas.push("Valor apresentado no site: " + campos.valor);
  if (campos.valorPix) linhas.push("Valor estimado no Pix integral: " + campos.valorPix);
  if (campos.prazo) linhas.push("Prazo estimado publicado: " + campos.prazo);
  if (campos.idealPara) linhas.push("Indicação do serviço: " + campos.idealPara);
  if (campos.pagamento) linhas.push("Forma de pagamento pretendida: " + campos.pagamento);
  if (campos.origem) linhas.push("Origem: " + campos.origem);

  linhas.push(campos.valorFechado ? "Quero seguir com este valor e receber os próximos passos." : "Poderia confirmar o orçamento e o prazo?");
  return linhas.join("\n");
}

export function abrirWhatsApp(campos) {
  window.open(linkWhatsApp(montarMensagem(campos)), "_blank", "noopener");
}
