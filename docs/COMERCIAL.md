# Operação comercial do site (presentes, pedido e preços)

Criado em 2026-10-03 (CLAUDE/SITES nucleo-faguital) ao executar o comando de Guilherme
`COMANDO_SITE_IMPERIAL_VOLT_ATUALIZACAO_COMERCIAL`. Arquivo interno (`docs/` não é publicado).

## Onde ficam os preços

| O quê | Arquivo | Observação |
|---|---|---|
| Presentes (homenagem, experiência por aproximação, extras, combos, régua física, promoções) | `dados-site/presentes.json` | lido por `src/js/pedido.js` |
| Serviços digitais e demais serviços | `dados-site/servicos.json` | abas de "Sites e serviços" e orçamento |
| Produtos físicos antigos | `dados-site/catalogo-publico.json` (site) e `catalogo.json` | todos com `"publico": false` + `pendencia` |
| Textos de preço fixos | `index.html` (bloco "digital-difference"), `faq.json`, `termos-gerais.json`, `termos-sites.json` | manter coerentes ao mudar preço |

Regra de preço: **15% no Pix OU condição promocional vigente, conforme a oferta** (nunca os dois no mesmo item).
Proibido: preço cheio artificial, desconto falso, contagem regressiva falsa, "vitalício".

## Criar uma campanha (20%, 25%, 30%...)

Em `presentes.json`, copiar `promocoesModelo.exemplo` para a lista `promocoes`, com `ativa: true`, `percentual`,
`aplicaA` (ids de produto) e `inicio`/`fim` (AAAA-MM-DD). O site mostra o preço de campanha e não aplica o Pix nesse
item. Ao fim do período a campanha some sozinha (comparação por data).

## Publicar um produto físico (somente depois de validar produção E licença comercial)

Adicionar em `presentes.json` → `fisico.produtos` um objeto como:

```json
{ "id": "luminaria-nome-13cm", "tipo": "fisico", "nome": "Luminária com nome", "preco": 79.9,
  "pixElegivel": true, "elegivelAproximacao": true, "personalizacaoSimples": true }
```

Preço pela régua (`fisico.regua`: 7 a 9 cm R$ 49,90; 10 a 12 cm R$ 59,90; 13 a 15 cm R$ 79,90; 16 a 18 cm R$ 99,90;
peça diferenciada a partir de R$ 129,90). Com `elegivelAproximacao`, o pedido oferece a experiência por aproximação
(+ R$ 34,90) e, depois dela, a homenagem de 30 dias em combo (+ R$ 99,90). A vitrine visual dos físicos ainda precisa
ser criada quando o primeiro produto for validado (hoje a seção mostra "em preparação"). Nunca publicar modelo de
terceiro sem licença comercial confirmada.

## Homenagem com prazo

A homenagem é vendida por 7, 14, 30 ou 60 dias. No projeto da homenagem, colocar no `<head>`:
`<meta name="homenagem-expira" content="AAAA-MM-DD">` e `<script src="../comum/expira.js"></script>`
(ver `IMPERIAL_VOLT/homenagem-nfc-exemplares/src/comum/expira.js`). Depois da data, o link leva a
`https://imperialvolt.com/homenagem-encerrada.html` ("Esta homenagem chegou ao fim. Quer criar uma para alguém
especial?"). Para encerrar de vez, publicar no fim do prazo um `index.html` que redirecione para essa página.

## Testes

`node tools/testar-pedido.js http://127.0.0.1:8000/ <pasta>` com a raiz servida
(`python -m http.server 8000 --bind 127.0.0.1`): vitrine, carrinho, combos, Pix, promoção, WhatsApp, pedido salvo,
ausência de preço antigo e de termos proibidos, 390 e 1366 px. Depois de publicar: `pwsh -File tools/verificar-site.ps1`.
