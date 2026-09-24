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

## O que nunca vai ao ar

- `_config.yml` exclui do build: `CLAUDE.md`, `README.md`, `docs/`, `tools/`, `_relatorios/`, `novosite/`.
  Ao criar arquivo interno novo fora dessas pastas, acrescentar à lista.
- `.gitignore` bloqueia `novosite/` (projeto separado, contém `.secrets/`), `.wrangler/`, `node_modules/`, `.env*`.
- Sites de clientes não ficam neste repositório/domínio (política de domínios).

## Voltar atrás

- Uma mudança publicada: `git revert <commit>` + push.
- Backups de 2026-09-24 em `IMPERIAL_VOLT\_BACKUPS\`: zip dos arquivos, `imperialvolt.com-historico-20260924-095043.bundle`
  (histórico completo, todas as branches; restaurar com `git clone <arquivo.bundle>`), patch do rascunho.
