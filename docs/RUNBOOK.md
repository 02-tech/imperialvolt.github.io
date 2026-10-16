# Runbook — site oficial imperialvolt.com

> Arquivo interno: não é publicado (ver `_config.yml`, lista `exclude`).

## Como o site é publicado

- Repositório: `github.com/02-tech/imperialvolt.github.io` (conta GitHub `02-tech`, logada via `gh` nesta máquina).
- GitHub Pages publica **a branch `main`, raiz `/`**, com domínio `imperialvolt.com` (arquivo `CNAME`) e HTTPS obrigatório.
- **Todo `git push origin main` vai ao ar em ~1 minuto.** Não há ambiente de teste no meio; testar localmente antes.
- Pasta local canônica: `C:\Users\FAGUITAL\PROJETOS\IMPERIAL_VOLT\imperialvolt.com` (branch `main`).

## Fluxo de edição

1. Conferir que está tudo alinhado:
   ```
   cd C:\Users\FAGUITAL\PROJETOS\IMPERIAL_VOLT\imperialvolt.com
   git checkout main
   git pull --ff-only
   git status          # deve estar limpo
   ```
2. Editar. Conteúdo comercial vem de `dados-site/*.json` (não inventar preço, prazo, depoimento; ver `CLAUDE.md`).
3. Pré-visualizar: `python -m http.server 8000` nesta pasta → `http://127.0.0.1:8000/`.
   Conferir celular (DevTools, 390x844) e desktop.
4. Commitar com mensagem clara (um assunto por commit).
5. Publicar (Guilherme): `git push origin main`.
   Deploy pelo Claude costuma ser bloqueado pelo classificador de auto-modo do Claude Code; nesse caso o Claude
   prepara os commits e o Guilherme roda o push.
6. Conferir o que foi ao ar: `pwsh -File tools/verificar-site.ps1` (espera ~1-2 min depois do push).

## Fotos novas

```
pwsh -File tools/otimizar-fotos.ps1 -Origem "C:\pasta\com\fotos" -Destino "src/imagens/produtos"
```
- Redimensiona (lado maior 1600 px), converte para WebP, **remove EXIF/GPS**, nomeia sem acento/espaço.
- Não sobrescreve arquivo existente; originais não são alterados.
- Depois, referenciar o arquivo no HTML/JSON correspondente e rodar o passo 3.
- Só usar fotos reais e com direito de uso (regra do `CLAUDE.md`: nada de projeto "supostamente realizado").

## Orçamentos para clientes (área oficial /orcamentos/)

- Cada orçamento fica em `orcamentos/<cliente>-<6 letras/números aleatórios>/index.html` (ex.: `tio-caique-barbearia-fda887`).
  O sufixo aleatório impede que alguém adivinhe o link de outro cliente. Gerar com
  `node -e "console.log(require('crypto').randomBytes(3).toString('hex'))"`.
- `orcamentos/index.html` não lista ninguém: só explica que cada cliente recebe o próprio link.
- Toda página de orçamento precisa ter: `<meta name="robots" content="noindex,nofollow,noarchive">`; botão de confirmação
  para o WhatsApp oficial (`wa.me/5524992144995`); og:title/og:description/og:image (prévia do link no WhatsApp,
  `previa.jpg` 1200x630 na mesma pasta); caminhos relativos para `../../icons/`. Nunca entra no `sitemap.xml`.
- Testar antes do commit: servidor local numa porta livre (NUNCA 8765, é do channel-pc; ver LESSON-20261016-035649-5D44E9)
  e `node tools/testar-orcamento.js http://127.0.0.1:<porta>/orcamentos/<pasta>/ <pastaCapturas>`. Com
  `PREVIA=<caminho>/previa.jpg` o mesmo teste gera a imagem de prévia do link a partir do topo da página.
- Preços, prazos e textos: só o que Guilherme aprovou para aquele cliente. Modelo 3D só se for autoral/encomenda do
  próprio cliente (regra de 15/10: nenhum modelo de catálogo no site).
- Publicar = commit + push na main (como o resto do site). Enviar o link ao cliente é sempre do Guilherme.

## O que nunca vai ao ar

- `_config.yml` exclui do build: `CLAUDE.md`, `README.md`, `docs/`, `tools/`, `_relatorios/`, `novosite/`.
  Ao criar arquivo interno novo fora dessas pastas, acrescentar à lista.
- `.gitignore` bloqueia `novosite/` (projeto separado, contém `.secrets/`), `.wrangler/`, `node_modules/`, `.env*`.
- Sites de clientes não ficam neste repositório/domínio (política de domínios).

## Voltar atrás

- Uma mudança publicada: `git revert <commit>` + push.
- Backups de 2026-09-24 em `IMPERIAL_VOLT\_BACKUPS\`: zip dos arquivos, `imperialvolt.com-historico-20260924-095043.bundle`
  (histórico completo, todas as branches; restaurar com `git clone <arquivo.bundle>`), patch do rascunho.
