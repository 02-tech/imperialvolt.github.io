/* Checkout preparado para links públicos, sem expor credenciais no site estático. */

export function obterLinkCheckout(pagamentos, itemId, modalidade = "default") {
  if (!pagamentos?.checkout?.ativo) return "";
  const links = pagamentos.checkout.links?.[itemId];
  if (!links) return "";
  return links[modalidade] || links.default || "";
}

export function checkoutDisponivel(pagamentos, itemId) {
  return Boolean(obterLinkCheckout(pagamentos, itemId));
}
