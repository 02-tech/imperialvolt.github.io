# Confere o site publicado (imperialvolt.com) contra o repositorio local. Somente leitura.
# Uso: pwsh -File tools/verificar-site.ps1
$ErrorActionPreference = 'Stop'
$base = 'https://imperialvolt.com'
$repo = Split-Path $PSScriptRoot -Parent
$fail = 0
function Check($label, $ok, $info = '') {
  if ($ok) { Write-Host "  OK    $label $info" } else { Write-Host "  FALHA $label $info"; $script:fail++ }
}
function Get($path) { Invoke-WebRequest "$base$path" -UseBasicParsing -SkipHttpErrorCheck -MaximumRedirection 5 }
function Sha($bytes) { [BitConverter]::ToString([Security.Cryptography.SHA256]::HashData($bytes)).Replace('-', '') }
# texto: compara ignorando CRLF (Windows) vs LF (publicado)
function TextSha([byte[]]$bytes) { Sha ([Text.Encoding]::UTF8.GetBytes(([Text.Encoding]::UTF8.GetString($bytes)).Replace("`r", ''))) }

# 1. paginas publicas: no ar e iguais ao commit local
foreach ($p in 'index.html', 'privacidade.html', 'termos.html', 'cookies.html', 'robots.txt', 'sitemap.xml') {
  $r = Get "/$p"
  $local = Join-Path $repo $p
  $same = (Test-Path $local) -and ((TextSha $r.RawContentStream.ToArray()) -eq (TextSha ([IO.File]::ReadAllBytes($local))))
  Check "/$p" ($r.StatusCode -eq 200) "(HTTP $($r.StatusCode), $(if ($same) {'igual ao local'} else {'difere do local: publicado ainda nao atualizou ou ha mudanca local'}))"
}

# 2. imagens referenciadas: HTTP 200 e arquivo WebP/PNG/JPG integro (tamanho declarado = recebido)
$refs = Get-ChildItem $repo -Recurse -Include *.html, *.js, *.json, *.css -File |
  Where-Object { $_.FullName -notmatch '\\(novosite|node_modules|\.git|_relatorios|docs|tools)\\' } |
  ForEach-Object { [regex]::Matches((Get-Content $_.FullName -Raw), 'src/imagens/[A-Za-z0-9_./-]+\.(webp|png|jpe?g|svg)') | ForEach-Object Value } |
  Sort-Object -Unique
$bad = @()
foreach ($img in $refs) {
  $r = Get "/$img"
  if ($r.StatusCode -ne 200) { $bad += "$img (HTTP $($r.StatusCode))"; continue }
  $b = $r.RawContentStream.ToArray()
  if ($img -like '*.webp' -and $b.Length -ge 12) {
    $declared = [BitConverter]::ToUInt32($b, 4) + 8
    if ($declared -ne $b.Length) { $bad += "$img (TRUNCADA: $($b.Length) de $declared bytes)" }
  }
}
Check 'imagens' ($bad.Count -eq 0) "($($refs.Count - $bad.Count)/$($refs.Count) integras)"
$bad | ForEach-Object { Write-Host "        $_" }

# 3. arquivos internos NAO podem estar publicos
foreach ($p in '/CLAUDE.md', '/docs/RUNBOOK.md', '/tools/verificar-site.ps1', '/clientes/saulo-garcia/', '/novosite/') {
  $c = (Get $p).StatusCode
  Check "privado $p" ($c -eq 404) "(HTTP $c)"
}

# 4. HTTPS e dominio
$r = Invoke-WebRequest 'http://www.imperialvolt.com/' -UseBasicParsing -MaximumRedirection 5
Check 'http/www -> https://imperialvolt.com' ($r.BaseResponse.RequestMessage.RequestUri.AbsoluteUri -eq "$base/") "($($r.BaseResponse.RequestMessage.RequestUri))"

if ($fail) { Write-Host "`n$fail verificacao(oes) falharam."; exit 1 } else { Write-Host "`nTudo certo." }
