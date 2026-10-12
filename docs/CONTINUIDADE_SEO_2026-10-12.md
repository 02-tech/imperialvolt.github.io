# Continuidade: identidade digital e indexação

Autor: CODEX, sessão fd2cb605631e, 2026-10-12. Projeto: Imperial Volt.
Autorização: Guilherme autorizou concluir e publicar o trabalho disponível sem novas perguntas.
Cópia de trabalho: /workspace/scratch/fd2cb605631e/imperialvolt.
Pasta canônica informada pelo runbook: C:\Users\FAGUITAL\PROJETOS\IMPERIAL_VOLT\imperialvolt.com.

## Alterações preparadas

- index.html: destinos iniciais de quatro contatos WhatsApp e dois links Instagram preenchidos diretamente no HTML com os dados comerciais existentes; telefone visível no contato. JavaScript preservado.
- sitemap.xml: lastmod da página alterada atualizado para 2026-10-12.
- docs/MISSAO_FUTURA_FAGUITAL_LEXICOGRAFIA.md: missão de pesquisa registrada, sem publicar manifesto ou enviar solicitações.
- Schema existente preservado: Person, Organization e Project já têm identificadores cruzados consistentes. Spotify não incluído sem perfil confirmado.

## Pendências para ferramenta com acesso local/autenticado

1. Search Console: reutilizar a sessão autenticada e confirmar a conta e as propriedades faguital.com.br, imperialvolt.com e tecnofagguard.com.br. Inspecionar as três páginas iniciais e faguital.com.br/sobre.html. Registrar indexação, canonical escolhido pelo Google, último rastreamento e eventual bloqueio. Fazer teste ao vivo antes de solicitar indexação de página corrigida; não repetir solicitações sem mudança.
2. Sitemaps: conferir envio e processamento de /sitemap.xml nas três propriedades. Enviar apenas se ausente/incorreto. Datas dos sites não alterados não devem ser mudadas artificialmente. Investigar exclusões antes de criar novas páginas.
3. Performance: extrair setembro e outubro, incluindo visualizações e termos do Business Profile, consultas e cliques do Search Console. Registrar contatos reais qualificados e origem; não confundir pedidos de rota com clientes.
4. Perfis musicais: localizar o perfil oficial de artista Spotify e demais canais nos documentos/distribuidora existentes; confirmar identidade, incluir sameAs somente na Person e links visíveis correspondentes, sem misturar empresa e artista.
5. Central local: executar o bootstrap CODEX, consultar ownership/locks e registrar evidências na central canônica. Foram lidas as quatro instruções centrais via GitHub; o Windows/control plane local não está acessível nesta sessão. O SECURITY_POLICY.md indicado na governança não foi encontrado no snapshot remoto consultado; localizar a versão canônica antes de mudanças maiores.
6. Missão lexical: manter em pesquisa; reunir evidências independentes sem inventar significado nem simular uso coletivo. Não submeter a dicionários nesta fase.

## Verificação e rollback

Checar em celular e desktop os destinos de WhatsApp/Instagram com JavaScript ligado e desligado; conferir JSON-LD e sitemap XML. Comprovação de publicação deve vir de leitura do domínio e do commit remoto, não só do envio.
Rollback: reverter apenas o commit desta missão, preservando trabalhos posteriores. Não fazer reset/force-push.
Arquivos docs/ são excluídos do GitHub Pages pelo _config.yml. São documentação interna ao build, mas o repositório GitHub é público; não colocar dados sigilosos.

## Continuação local (2026-10-12, CLAUDE/SITES principal, sessão 381bb779)

Claim `claim-20261012-sites-principal-continuidade-seo-codex-v1`. Pasta local sincronizada com `dfae159` (fast-forward, árvore limpa).

- Teste de navegador (Chrome headless, site publicado, 390 e 1366, JavaScript ligado e desligado): os 6 destinos do Codex
  (4 WhatsApp 5524992144995, 2 Instagram imperialvolt) corretos nos 4 cenários, 0 erros de JS.
- Achado: sem JavaScript, `#contactAddress` e `#contactEmail` ainda tinham `href="#"` e texto vazio. Preenchidos no HTML com os
  mesmos valores que `src/js/main.js` gera a partir de `dados-site/publico.json` (endereço com link do Google Maps e
  `mailto:contato.imperialvolt@gmail.com`). Reteste local: 8 de 8 destinos ok nos 4 cenários, nenhum `href="#"` restante.
- O telefone visível (`+55 24 99214-4995`) é o texto do link do WhatsApp; não há link `tel:` (não é erro, só registro).
- Spotify (pendência 4): nenhum perfil de artista nem distribuidora em documentos locais (6_SITES, 8_DOCUMENTOS, 5_MIDIA,
  FAGUITAL, Central). Mantido fora do Schema e dos links. Só Guilherme confirma se o perfil existe.
- Central (pendência 5): trabalho do CODEX `fd2cb605631e` registrado em `events/EVENTS.jsonl` pela CLAUDE.
- Pendências 1 a 3 (Search Console, sitemaps, desempenho/Business Profile) exigem navegador logado: ainda abertas.
- Commit local desta continuação; push é do Guilherme.

## Search Console e desempenho (2026-10-12, CLAUDE/SITES principal, leitura no Chrome logado, nada enviado)

Período de desempenho: 01/09 a 11/10/2026. Nenhuma solicitação de indexação nem envio de sitemap (nada mudou que exigisse).

| Propriedade | Indexadas | Não indexadas (motivo) | Sitemap | Cliques / impressões / posição |
|---|---|---|---|---|
| imperialvolt.com | 1 (`/`) | 6: 3 redirecionamento (http/www), 2 `noindex` intencional (páginas legais/encerrada), 1 alternativa com canônica | processado, lido 10/10, 1 URL | 10 / 24 / 2,9 (consultas visíveis: "software development", "software") |
| faguital.com.br | 1 (`/`) | 2: 1 redirecionamento, 1 "detectada, mas não indexada" (provavelmente `/sobre.html`; só a página inicial teve impressões) | processado, lido 12/10, 2 URLs | 13 / 20 / 1,6 (consulta visível: "ele é famoso?") |
| tecnofagguard.com.br | 1 (`/`) | 0, nenhum problema em 90 dias | processado, lido 05/10, 1 URL | 1 / 5 / 4,6 |

- Inspeção de URL e detalhe dos motivos não abriram: a aba do Chrome em segundo plano congela cliques/digitação. Para
  confirmar o caso de `/sobre.html`: Guilherme abre a inspeção com a janela em primeiro plano (pedido de indexação já
  feito em 02/10; não repetir sem mudança).
- Perfil da Empresa (Business Profile): não lido pelo mesmo motivo. Fica pendente.
- Spotify: Guilherme confirmou em 12/10 que **não tem conta**. Não incluir.

### Inspeção de `faguital.com.br/sobre.html` (2026-10-12, autorizada por Guilherme)

- Confirmado: "Detectada, mas não indexada no momento". Descoberta pelo `sitemap.xml` e pela página inicial; **nunca
  rastreada** (último rastreamento N/D). Não é bloqueio do site: o Google ainda não buscou a página.
- A página mudou depois do pedido de 02/10 (layout restaurado em 05/10, commit 71f885f), então um novo pedido é válido.
  O teste ao vivo foi iniciado, mas a aba do Chrome congelou antes do resultado; **pedido de indexação NÃO enviado**.
  Próximo passo: com a janela do Chrome visível, "Testar o URL publicado" → se ok, "Solicitar indexação" (uma vez).
- Perfil da Empresa: não lido (mesmo motivo).

### Concluído com o navegador visível (2026-10-12, mesma sessão; o navegador conectado é o Microsoft Edge deste PC)

- `faguital.com.br/sobre.html`: teste ao vivo **"O URL está disponível para o Google / É possível indexar a página"**
  (12/10, 12:26). **Indexação solicitada uma vez** (fila de rastreamento prioritário). Não repetir; reconferir em 1 a 2 semanas.
- Perfil da Empresa "Imperial Volt" (confirmado, código 14047239461582191353), maio a out./2026: **178 interações**, das
  quais **174 pedidos de rota**, 4 cliques no site, 0 chamadas, 0 cliques no chat. Por mês: setembro 26, outubro 19
  (até 12/10); pico em agosto. Pedido de rota não é cliente: contatos qualificados vindos do perfil no período = os 4 cliques
  no site (no máximo). O painel novo não mostra termos de busca nem visualizações.
- O Google sugere confirmar o horário no feriado de 12/10 (N. Sra. Aparecida) e adicionar foto interna: decisão de Guilherme.
