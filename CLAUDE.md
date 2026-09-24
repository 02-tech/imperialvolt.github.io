<!-- AI-GOVERNANCE-NOTICE: v1 -->
> [!IMPORTANT]
> **Governança obrigatória para qualquer inteligência artificial**
> Antes de usar, interpretar ou atualizar esta memória ou instrução, a IA deve: identificar-se explicitamente (agente, sessão/tarefa e projeto); confirmar o diretório canônico; consultar as memórias globais e do projeto; e cumprir os protocolos, padrões, estados e decisões de `C:\Users\FAGUITAL\PROJETOS\0_CENTRAL_ENGENHARIA`.
> Leitura mínima obrigatória: `00_GOVERNANCA\AI_CODING_RULES.md`, `08_AI\CONTEXT_RULES.md`, `08_AI\MEMORY_POLICY.md`, `08_AI\SESSION_BOOTSTRAP.md` e as instruções específicas do projeto.
> Antes de escrever, deve verificar autoria, ownership/lock e trabalho concorrente; preservar o conteúdo existente; não sobrescrever trabalho alheio; e registrar autoria, timestamp, arquivos, comandos relevantes, resultado, validações, rollback e pendências.
> Em caso de divergência, o estado real verificado, a fonte canônica do projeto e os protocolos centrais prevalecem. Memória privada de agente não substitui evidência atual.
<!-- /AI-GOVERNANCE-NOTICE -->

# Projeto Imperial Volt 2.0

## Estado do projeto

Este repositório contém o site oficial da Imperial Volt.

- Produção: branch main
- Desenvolvimento: branch local de trabalho a partir da main (a antiga `imperialvolt-2.0` é só histórico, não usar)
- Domínio: imperialvolt.com
- Hospedagem: GitHub Pages
- Tecnologia: HTML, CSS e JavaScript estáticos
- Não utilizar CMS
- Não utilizar construtores visuais

## Publicação e operação (verificado em 2026-09-24)

- GitHub Pages publica a `main` (raiz): **todo push na main vai ao ar em ~1 min**, sem ambiente de teste.
- Fluxo de edição, fotos novas e verificação: `docs/RUNBOOK.md`. Estado e pendências: `docs/ESTADO_ATUAL.md`.
- `_config.yml` impede que arquivos internos (este `CLAUDE.md`, `docs/`, `tools/`) sejam publicados.
  Arquivo interno novo fora dessas pastas precisa entrar na lista `exclude`.
- Nunca versionar `novosite/` (projeto separado, contém `.secrets/`) nem site de cliente neste repositório.

## Objetivo futuro

Construir uma vitrine comercial premium e extremamente profissional para:

- produtos de impressão 3D;
- tags e chaveiros NFC;
- kits NFC para revendedores;
- sites;
- sistemas;
- aplicativos;
- automações.

## Fonte oficial de informações

Antes de implementar, ler integralmente:

- dados-site/configuracoes.json
- dados-site/catalogo.json
- dados-site/servicos.json
- dados-site/politicas.json
- dados-site/avaliacoes.json
- .claude/briefings/MISSAO-IMPERIAL-VOLT-2.0.md

Não inventar:

- preços;
- depoimentos;
- avaliações;
- prazos;
- garantias;
- formas de pagamento;
- endereços;
- números de telefone;
- características de produtos;
- imagens ou projetos supostamente realizados.

## Regras técnicas futuras

- preservar o domínio e o arquivo CNAME;
- funcionar no GitHub Pages;
- utilizar caminhos relativos;
- ser responsivo;
- ter acessibilidade básica;
- não depender de backend para navegação principal;
- evitar bibliotecas desnecessárias;
- armazenar imagens localmente;
- otimizar imagens;
- não usar conteúdo protegido sem licença;
- não substituir arquivos existentes sem criar uma estratégia de migração;
- testar antes de qualquer commit.

## Estado atual

A fase atual é somente preparação.

Não reconstruir o site até que o briefing final esteja completo.

## Presença digital e contatos

Ler também:

- dados-site/presenca-digital.json

Regras:

- usar contato.imperialvolt@gmail.com como e-mail comercial;
- usar suporte.imperialvolt@gmail.com para suporte e privacidade;
- não publicar métricas administrativas internas;
- não exibir números de seguidores como informação permanente;
- não inventar URL do Facebook;
- diferenciar atendimento automatizado 24h de atendimento humano;
- não afirmar sincronização automática com Google, Instagram ou Facebook;
- utilizar somente avaliações reais cadastradas em dados-site/avaliacoes.json.
