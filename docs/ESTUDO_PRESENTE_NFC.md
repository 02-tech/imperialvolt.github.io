> SUPERADO em 2026-10-03 pelo comando de Guilherme (preços e estrutura em docs/COMERCIAL.md). Mantido como histórico do estudo.

# Estudo: Presente com NFC e homenagens (Imperial Volt)

Preparado em 2026-10-03 por CLAUDE (SITES, conta nucleo-faguital, sessão eef558ae) a pedido de Guilherme, para estudo
em outro chat. Arquivo interno (a pasta `docs/` não é publicada). Nada aqui está decidido até Guilherme dar o comando.

## 1. O que já existe e está no ar

- **Exemplos de homenagem** (neutros, sem dados de ninguém): https://homenagem-exemplo.pages.dev/
  com Aniversário, Natal e Ano Novo. Cada um abre como presente, toca uma caixinha de música feita no próprio celular,
  tem interação (velas, árvore, fogos) e, desde hoje, um **guia de "próxima parte"** embaixo para ninguém precisar
  adivinhar que deve rolar. Fonte: `IMPERIAL_VOLT/homenagem-nfc-exemplares` (publicação manual por Guilherme).
- **Site oficial imperialvolt.com** (no ar, commit `ee600b1`): seção "Homenagens que abrem com um toque" depois do
  catálogo, item "Homenagens" no menu e link "Ver exemplos de homenagem" nos cartões da Tag e do Chaveiro NFC.
- **Catálogo atual de NFC no site** (`dados-site/catalogo-publico.json`): Tag NFC Personalizada a partir de R$ 24,90
  (R$ 16 a unidade em 50), Chaveiro NFC Personalizado a partir de R$ 34,90. É o produto avulso, também para empresas.
- **Homenagens reais já feitas** (não usar como vitrine sem autorização, são pessoais): Carmélia e Luiz (tag gravada),
  e as homenagens de família.

## 2. O que está pronto localmente e NÃO deve ser publicado

Commit local em `imperialvolt.com` (à frente do `origin/main`): "catálogo virtual com foco digital e Presente com NFC".
Tem coisas boas que serão reaproveitadas e uma tabela de preços **já descartada por Guilherme**:

- Aproveitável: topo com foco digital ("Sites, sistemas e presentes digitais."), menu reorganizado (Serviços e preços,
  Presente com NFC, Soluções, Catálogo, Para empresas, Orçamento), seção `#presente-nfc` logo após o topo com 3 passos,
  exemplos e **formulário que monta o pedido e envia pronto pelo WhatsApp** (pacote, ocasião, link ou ideia da mensagem,
  data, nome), produtos físicos movidos para depois do catálogo. Os pacotes vêm de `dados-site/servicos.json`
  (categoria `presente-nfc`), então trocar a tabela é só trocar dados.
- Descartado: os 5 pacotes Toque Direto R$ 34,90, Toque com Mensagem R$ 69,90, Homenagem Completa R$ 149,90,
  Kit Lembrança R$ 89,90, Kit Presente Completo R$ 199,90.
- Pagamento: checkout InfinitePay existe no código mas está desligado; decisão atual de Guilherme: **pedido pelo
  WhatsApp**, pagamento e prazo combinados no atendimento.

## 3. Princípios de Guilherme (palavras dele, resumidas com fidelidade)

- Vender pelo **desejo do cliente**, não pela técnica: "Torne o seu presente físico uma aproximação virtual".
- Separar: **(a)** a pessoa já tem um link (Instagram, site) e só quer a aproximação; **(b)** "criamos essa homenagem
  para você", como adicional.
- Não cobrar preços diferentes por **pequenas modificações**. A homenagem é a homenagem, feita com o melhor; diferenças
  de valor só se fizerem sentido (limites de fotos e conteúdo, ou tempo).
- **Nada vitalício** para homenagem: "daqui 10 anos eu posso nem tá trabalhando com isso"; domínio e serviços são pagos
  e mudam; homenagem é **de momento**; o mercado tem que girar (o Ano Novo de um ano não é para ser reusado no outro).
- Prazos curtos são o foco: 7 dias, 14 dias, 30 dias, 2 meses. A pessoa usa no dia, revê uns dias depois, e acabou.
  Seis meses "pode existir", mas não é foco.
- Exceção possível: **modelo não personalizado para enviar a várias pessoas** (ex.: Ano Novo genérico). Pode ter prazo
  maior porque é reaproveitado, mas **nunca vitalício**.
- R$ 50 por algo vitalício (o que o mercado faz) é "jogar o trabalho no lixo".

## 4. Pesquisa de mercado (2026-10-03)

| O que | Faixa | Observação |
|---|---|---|
| Página de presente pronta, a pessoa monta sozinha (Love In Code, Meu Presente Digital, DearYou, Tempo Juntos, QR Love, Timeline Love) | R$ 19,90 a R$ 49,90 | quase sempre "vitalício", automático, por QR Code, sem objeto físico |
| Tag ou chaveiro NFC simples (Elo7, Mercado Livre) | R$ 9,90 a R$ 26,00 | só o objeto gravado |
| Plaquinha NFC, cartão NFC com site, kit executivo NFC | R$ 125 a R$ 150 | produto pronto com página |
| Peça 3D personalizada (luminária, abajur com nome) | R$ 55 a R$ 110 | objeto físico |
| Quadro/azulejo "Spotify" com foto e QR | R$ 18 a R$ 50 | objeto físico simples |

Fontes: loveincodes.com, meupresente.digital, dearyou.com.br, tempojuntos.com, qrlove.com.br, timelinelove.com,
elo7.com.br (chaveiro NFC, presente personalizado namorada), lista.mercadolivre.com.br (tag NFC personalizada),
tagmebrindes.com.br (kit executivo NFC).

Leitura: o mercado barato é **automático e vitalício**; o nosso diferencial é **feito à mão, exclusivo, com interação,
abrindo por aproximação num objeto físico**. Concorrer por preço com os automáticos não é o caminho.

## 5. Última proposta da SITES (para o estudo, não decidida)

**Presente com aproximação** (a pessoa já tem o link):
- Tag na caixa ou no presente que ela já tem: R$ 29,90 (tag avulsa R$ 24,90 + aplicação e teste).
- Chaveiro 3D personalizado com NFC: R$ 34,90 (preço atual do catálogo).
- Peça 3D decorativa com nome, com NFC: a partir de R$ 89,90 (preço atual do catálogo).

**Homenagem criada por nós** (adicional), **uma versão só**, conteúdo generoso e igual para todos (carta, até 10 fotos,
música, interação do tema, 1 rodada de ajustes), preço pelo **tempo no ar**:

| Tempo | Preço sugerido |
|---|---|
| 7 dias | R$ 39,90 |
| 14 dias | R$ 49,90 |
| 30 dias | R$ 59,90 |
| 60 dias | R$ 79,90 |
| 6 meses (existe, não é foco) | R$ 119,90 |

**Fim do prazo**: a página vira "Esta homenagem terminou. Quer criar uma para alguém?" com link para o site; a tag no
presente passa a divulgar a Imperial Volt. **Renovação** pelo WhatsApp perto do fim (recompra).

## 6. Pontos em aberto para o estudo

1. A escada de prazos (7/14/30/60 dias) e os valores. Sugestão: destacar **30 dias** como o "mais escolhido".
2. Modelo **não personalizado para várias pessoas** (ex.: cartão de Ano Novo, Natal, Dia das Mães para enviar a lista
   de contatos ou clientes): preço, prazo maior (ex.: 30 a 90 dias), quantidade de envios, pode virar produto para
   empresas mandarem a clientes.
3. Limites que fazem sentido sem parecer "cobrar por detalhe": nº de fotos, vídeo sim ou não, música própria ou da
   caixinha, ajustes extras.
4. Prazo de produção (o site hoje não promete prazo). Ex.: até X dias úteis após receber fotos e texto; "urgente" com
   adicional?
5. Pix com desconto (o site dá 15% no Pix nos serviços digitais; nos presentes ainda não foi decidido).
6. Ativar o checkout InfinitePay (links de pagamento por pacote) ou continuar só com WhatsApp.
7. Página expirada: mostrar a tela de "terminou" (recomendado) ou redirecionar direto para o site.
8. Termos: as condições de NFC já existem (`dados-site/termos-nfc.json`: não prometer funcionamento em todos os
   celulares). Falta um termo curto de homenagem (prazo no ar, o que acontece no fim, uso de fotos enviadas).

## 7. Como a SITES executa depois do comando

Trocar a categoria `presente-nfc` em `dados-site/servicos.json` pela tabela decidida, ajustar o formulário (campo de
prazo), revisar textos da seção `#presente-nfc`, testar (390/900/1366, pedido no WhatsApp), commit e publicação.
Nos exemplos e nas homenagens reais: implementar a data de expiração e a tela de "terminou".
