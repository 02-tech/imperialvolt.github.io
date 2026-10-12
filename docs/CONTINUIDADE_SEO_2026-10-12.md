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
