# Estado atual — site oficial imperialvolt.com

> Arquivo interno (não publicado). Atualizado em 2026-09-24 por CLAUDE (posição SITES, conta principal,
> sessão 381bb779…), claim `claim-20260924-imperialvolt-site-oficial-organizacao-v1`.
> Autorização: Guilherme, 2026-09-24: "verifique e vamos organizar isso; autonomia para corrigir com boas práticas".

## Estado comprovado (2026-09-24)

- No ar: `https://imperialvolt.com` (GitHub Pages, branch `main`, HTTPS obrigatório, `www`/`http` redirecionam).
  Última publicação antes desta organização: 2026-08-17 (`5faf3cc`).
- Acesso: `gh` logado como `02-tech`, permissão admin/push no repositório.
- Página sem erros de console nem overflow horizontal em 390x844; links internos e externos respondem
  (exceto `g.page/r/.../review`, que não resolveu por DNS nesta máquina, sem conclusão: conferir manualmente).

## Problemas encontrados e corrigidos (commits locais, aguardando push)

1. `c12a103` — **4 fotos de produtos truncadas no ar** (~30 KB de arquivos de 32–170 KB; o tamanho declarado
   no cabeçalho de cada arquivo publicado bate exatamente com o arquivo íntegro local, prova de que são a mesma
   imagem cortada no upload). Substituídas pelas íntegras.
2. `03ec318` — `CLAUDE.md` estava público em `imperialvolt.com/CLAUDE.md`. `_config.yml` passa a excluir arquivos
   internos do build; `.gitignore` bloqueia `novosite/` (projeto separado com `.secrets/`), `.wrangler/`, etc.
3. `a9f7efb` — preview antigo do site do Saulo publicado em `imperialvolt.com/clientes/saulo-garcia/` removido
   (site vendido/entregue; vive em `https://itaipava.transferexecutivo.workers.dev/`). Nada linkava para ele.
4. Scripts `tools/verificar-site.ps1` (detectou os 3 problemas acima no site atual) e `tools/otimizar-fotos.ps1`;
   este runbook.

## Organização da pasta local

- Antes: branch `imperialvolt-2.0` (só local) com 18 arquivos alterados sem commit (2026-08-10/11); `main` local
  52 commits atrás do publicado; arquivos não rastreados duplicando os publicados.
- Verificado: o rascunho tinha **conteúdo idêntico ao publicado** (11 arquivos byte a byte; JSON de catálogo iguais
  semanticamente, só formatação; JS só sem os `?v=` de cache do publicado). Único item exclusivo: aviso de
  governança no `CLAUDE.md`, reaplicado.
- Preservado: `git stash` "rascunho imperialvolt-2.0 de 2026-08-10/11 …" + patch + zip + bundle em `IMPERIAL_VOLT\_BACKUPS\`.
  Branch `imperialvolt-2.0` mantida intacta.
- Agora: pasta em `main`, alinhada ao publicado + os commits acima.

## Atualização (2026-10-01, CLAUDE/ORQUESTRADOR nucleo-faguital, sessão 154219e0, via posição SITES)

- **Push já foi feito** (item 1 abaixo, antigo): verificado agora, `main` local = `origin/main` (0 commits de
  diferença em qualquer direção), HEAD atual `d63f08a` ("perf: otimiza o mascote do Voltz-Bot, 2,2 MB -> 52 KB"),
  posterior aos commits listados acima. `imperialvolt.com/CLAUDE.md` confirmado 404 no ar (prova de que o
  `_config.yml`/push desta rodada está publicado). Não houve autorização nesta passagem para rodar
  `tools/verificar-site.ps1`; isso permanece como próximo passo.
- Itens 2 e 3 abaixo continuam reais e pendentes de decisão do Guilherme — não verificados de novo nesta
  passagem além de confirmar que `novosite/` (409 MB, com `.secrets/`) ainda está dentro desta pasta.

## Atualização (2026-10-02, CLAUDE/SITES nucleo-faguital, sessão eef558ae)

- A atualização de 2026-10-01 acima foi escrita pelo ORQUESTRADOR nucleo-faguital (sessão 154219e0) e ficou sem commit;
  foi salva agora a pedido de Guilherme, com a autoria original preservada.
- `tools/verificar-site.ps1`: tudo certo (ver item 1).
- Identidade digital: JSON-LD (WebSite, Organization, Person, Project), `llms.txt`, `humans.txt`, IndexNow e Google Search
  Console verificado por DNS (Cloudflare, TXT `google-site-verification`; não apagar), sitemap enviado.
- Branches antigas: as 20 branches remotas de agosto foram arquivadas como tags `arquivo/*` (mais `arquivo/saulo-preview`)
  e removidas por Guilherme; no GitHub resta só `main`. Lista com SHAs:
  `0_CENTRAL_ENGENHARIA/09_COLABORACAO_IA/control_plane/evidence/imperialvolt-branches-arquivo-20261002/branches-antes.txt`.
- `novosite/`: decisão delegada por Guilherme; mantida no lugar por ora (é a fonte do P20 agenda-demo, tem segredos, está
  fora do Git e do site, privado 404). Mudança de raiz fica para migração própria.
- `saulo.imperialvolt.store` agora só redireciona para o site atual do cliente (ver ESTADO_ATUAL do Saulo).

## Pendências

1. ~~**Push** (`git push origin main`) — Guilherme.~~ **CONCLUÍDO** (ver atualização acima). `tools/verificar-site.ps1`
   rodado em 2026-10-02: "Tudo certo" (páginas iguais ao local, 14/14 imagens, privados 404, http/www -> https).
2. **Decisão 2026-10-02: manter por ora** (ver atualização). `novosite/` (409 MB, projeto do Codex com agendamento Cloudflare e `.secrets/`) está dentro desta pasta, fora do
   Git. Deveria ter raiz própria (ex.: `2_APPS\WEB\...` ou `0_AUTOMACAO`) conforme `PROJECT_LOCATION_STANDARD.md`;
   não movido (migração exige decisão e checagem de referências).
3. ~~20 branches antigas no GitHub~~ **RESOLVIDO** em 2026-10-02: arquivadas como tags `arquivo/*` e removidas (ver atualização).
4. Worktree `IMPERIAL_VOLT\imperialvolt.com-saulo-preview` (branch `saulo-preview`) — legado do preview do Saulo; não mexido.
5. Fotos novas: fluxo pronto (`tools/otimizar-fotos.ps1`), aguardando as fotos.

## Atualização (2026-10-03, CLAUDE/SITES nucleo-faguital, sessão eef558ae)

- Handoff da SITES principal (`20261003-SITES-principal-to-SITES-homenagens-nfc-site-oficial-e-fluxo-guiado.md`), tarefa B:
  - Nova seção `#homenagens` ("Homenagens que abrem com um toque") logo após o catálogo: 3 cartões (Aniversário, Natal,
    Ano Novo) abrindo cada exemplo, botão "Ver exemplos" (https://homenagem-exemplo.pages.dev/, nova aba) e "Pedir a minha"
    (`#orcamento`, categoria `nfc`). Link "Homenagens" no menu (desktop e móvel).
  - Campo `exemplo` {texto, url} na Tag e no Chaveiro NFC em `dados-site/catalogo-publico.json` (o que o site carrega) e
    em `dados-site/catalogo.json`; `src/js/data.js` repassa o campo e `src/js/catalogo.js` mostra "Ver exemplos de homenagem ↗".
  - Nenhum preço, prazo ou depoimento novo. Versões de cache: `?v=20261003-homenagens`.
  - Testado local (390, 1024, 1366): sem rolagem lateral, sem erros JS/rede, links certos.
  - Commit local, **sem push** (handoff: publicar é com Guilherme). Depois do push: `pwsh -File tools/verificar-site.ps1`.
  - Atenção técnica: este repositório tem arquivos com terminações de linha misturadas (CRLF/LF); editar preservando o
    original (o commit foi feito com `core.autocrlf=false` para o diff conter só as linhas alteradas).

## Atualização (2026-10-03, CLAUDE/SITES nucleo-faguital, sessão eef558ae): atualização comercial

- Executado o comando de Guilherme `COMANDO_SITE_IMPERIAL_VOLT_ATUALIZACAO_COMERCIAL`. Operação e esquema de dados:
  `docs/COMERCIAL.md`. Estudo anterior (pacotes descartados): `docs/ESTUDO_PRESENTE_NFC.md`; o commit local antigo
  (`83b2930`) **não foi publicado**: tirado da fila e guardado só na branch local `arquivo/catalogo-virtual-v1-descartado`.
- Presentes (`dados-site/presentes.json` + `src/js/pedido.js`): homenagem digital personalizada 7/14/30/60 dias
  (R$ 99,90 / 109,90 / 119,90 destaque / 149,90); experiência por aproximação R$ 49,90 avulsa ou + R$ 34,90 em físico;
  homenagem 30 dias em combo + R$ 99,90 (oferecida depois da aproximação; vale também para a aproximação avulsa, que já a
  inclui); personalização simples + R$ 19,90; pintura e projeto personalizado sob orçamento. Pix 15% OU promoção, sem
  somar; estrutura de campanhas pronta (nenhuma ativa).
- Carrinho como montador de pedido (sem pagamento online): botão "Pedido" no cabeçalho, painel com quantidade, período,
  adicionais, preço por item, Pix, promoções, total, nome e observações, salvo no navegador; finaliza no WhatsApp com a
  mensagem organizada. Upsell leve e opcional ("Adicionar ao presente" / "Continuar sem adicionar").
- Físicos: nenhum à venda. Produtos antigos (apito, arte automotiva, nome decorativo, suporte, organizador, sob medida) e
  tag/chaveiro NFC com `"publico": false` + motivo (produção/licença não validadas ou substituídos pela experiência);
  categoria de serviço "Impressão 3D sob medida" fora da oferta (modelagem passa a projeto personalizado sob orçamento).
  Seção "Presentes físicos Imperial Volt: em preparação" com CTA "Quero um projeto personalizado".
- Sites: vitrine/institucional a partir de R$ 890, dinâmico/CMS R$ 1.690, loja virtual R$ 2.990, projeto web
  personalizado R$ 3.990 ("a partir de"); landing page e site avançado saíram da tabela. Nota de domínio, hospedagem e
  continuidade (sem nada permanente incluído). FAQ e termos atualizados.
- Topo: "Presentes que emocionam. Sites que vendem."; menu: Presentes, Sites e serviços, Sob medida, Para empresas,
  Orçamento; seção "O que você pode comprar" explica presente digital, físico, interativo, completo, projeto
  personalizado e presença digital profissional. `homenagem-encerrada.html` = página de continuidade de homenagem expirada.
- Testes: `tools/testar-pedido.js` (390 e 1366) todos ok; termos sem preço antigo de sites; expiração testada.
- 2026-10-03 (navegação): cabeçalho deixa de acompanhar a rolagem; ao sair da tela recolhe e aparece o raio flutuante
  (canto superior esquerdo, com nº de itens do pedido) que traz o cabeçalho de volta; recolhe ao escolher destino, Esc,
  toque fora ou nova rolagem. Botões flutuantes refeitos: WhatsApp verde com símbolo limpo, Voltz-Bot com avatar
  recortado (`src/imagens/marca/voltz-avatar.png`), acima da barra de gestos, escondidos com o pedido aberto.
  Testes: `tools/testar-navegacao.js` e `tools/testar-pedido.js`.
