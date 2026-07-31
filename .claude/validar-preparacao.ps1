param(
    [switch]$PermitirPendencias
)

$ErrorActionPreference = "Stop"

$Base = Split-Path -Parent $PSScriptRoot
$DadosSite = Join-Path $Base "dados-site"

$Falhas = New-Object System.Collections.Generic.List[string]
$Alertas = New-Object System.Collections.Generic.List[string]

Get-ChildItem "$DadosSite\*.json" | ForEach-Object {
    try {
        Get-Content $_.FullName -Raw | ConvertFrom-Json | Out-Null
    }
    catch {
        $Falhas.Add("JSON inválido: $($_.Name)")
    }
}

$Config = Get-Content "$DadosSite\configuracoes.json" -Raw |
    ConvertFrom-Json

$Whatsapp = [string]$Config.empresa.whatsapp

if ([string]::IsNullOrWhiteSpace($Whatsapp)) {
    $Alertas.Add("WhatsApp comercial ainda não foi informado.")
}
elseif ($Whatsapp -notmatch '^55\d{10,11}$') {
    $Falhas.Add("WhatsApp inválido. Use somente números, com DDI 55 e DDD. Exemplo: 5524992144995.")
}
elseif ($Whatsapp -match 'COLOQUE|NUMERO|EXEMPLO') {
    $Falhas.Add("O campo WhatsApp contém um texto de exemplo, não um número real.")
}

$Servicos = Get-Content "$DadosSite\servicos.json" -Raw |
    ConvertFrom-Json

$PrecosPendentes = @(
    $Servicos.categorias.servicos |
        Where-Object {
            $_.tipoPreco -eq "a definir" -or
            (
                $null -eq $_.preco -and
                $null -eq $_.precoInicial -and
                $null -eq $_.acrescimoPercentual
            )
        }
)

foreach ($Item in $PrecosPendentes) {
    $Falhas.Add("Serviço sem preço definido: $($Item.nome)")
}

$Catalogo = Get-Content "$DadosSite\catalogo.json" -Raw |
    ConvertFrom-Json

$ProdutosSemPreco = @(
    $Catalogo.categorias.produtos |
        Where-Object {
            $null -eq $_.preco -and
            $null -eq $_.precoInicial -and
            $null -eq $_.precoMinimo -and
            $null -eq $_.faixas
        }
)

foreach ($Item in $ProdutosSemPreco) {
    $Falhas.Add("Produto sem preço definido: $($Item.nome)")
}

Write-Host "`n=== VALIDAÇÃO IMPERIAL VOLT 2.0 ===" -ForegroundColor Cyan

foreach ($Alerta in $Alertas) {
    Write-Host "PENDÊNCIA: $Alerta" -ForegroundColor Yellow
}

foreach ($Falha in $Falhas) {
    Write-Host "ERRO: $Falha" -ForegroundColor Red
}

if ($Falhas.Count -gt 0) {
    throw "A preparação possui $($Falhas.Count) erro(s) impeditivo(s)."
}

if ($Alertas.Count -gt 0 -and -not $PermitirPendencias) {
    throw "Existem $($Alertas.Count) pendência(s). Resolva-as antes de executar o Claude Code."
}

Write-Host "Base validada para implementação." -ForegroundColor Green

