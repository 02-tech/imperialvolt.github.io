# Prepara fotos novas para o site: redimensiona, converte para WebP e remove metadados (EXIF/GPS).
# Os originais nunca sao alterados. Requer ImageMagick (magick).
# Uso:
#   pwsh -File tools/otimizar-fotos.ps1 -Origem "C:\caminho\fotos-originais" -Destino "src/imagens/produtos"
#   parametros opcionais: -Largura 1600 (lado maior, px)  -Qualidade 80
param(
  [Parameter(Mandatory)] [string]$Origem,
  [Parameter(Mandatory)] [string]$Destino,
  [int]$Largura = 1600,
  [int]$Qualidade = 80
)
$ErrorActionPreference = 'Stop'
if (-not (Get-Command magick -ErrorAction SilentlyContinue)) { throw 'ImageMagick (magick) nao encontrado.' }

$repo = Split-Path $PSScriptRoot -Parent
$dest = if ([IO.Path]::IsPathRooted($Destino)) { $Destino } else { Join-Path $repo $Destino }
New-Item -ItemType Directory -Force $dest | Out-Null

$fotos = Get-ChildItem $Origem -File | Where-Object { $_.Extension -match '^\.(jpe?g|png|webp|heic|tiff?)$' }
if (-not $fotos) { throw "Nenhuma foto encontrada em $Origem" }

foreach ($f in $fotos) {
  # nome amigavel para URL: minusculas, sem acento, hifens
  $base = $f.BaseName.Normalize([Text.NormalizationForm]::FormD) -replace '\p{Mn}', ''
  $base = ($base.ToLower() -replace '[^a-z0-9]+', '-').Trim('-')
  $out = Join-Path $dest "$base.webp"
  if (Test-Path $out) { Write-Host "  JA EXISTE (pulado): $out"; continue }
  magick $f.FullName -auto-orient -resize "${Largura}x${Largura}>" -strip -quality $Qualidade $out
  magick identify -regard-warnings $out | Out-Null
  $kb = [math]::Round((Get-Item $out).Length / 1KB)
  $dim = magick identify -format '%wx%h' $out
  Write-Host ("  OK {0,-40} {1,10} {2,6} KB" -f "$base.webp", $dim, $kb)
}
Write-Host "`nPronto. Revise as imagens em $dest antes de referenciar no site."
