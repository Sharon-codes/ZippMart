# Push ProFlo to Hugging Face Space ADI576/ProFlo
# Requires HF git credentials (https://huggingface.co/settings/tokens)

$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$SpaceDir = Join-Path $env:TEMP "proflo-hf-space"
$SpaceUrl = "https://huggingface.co/spaces/ADI576/ProFlo"

$SkipNames = @(
    ".git", "node_modules", ".next", "dist",
    "worker", "docs", "nlp-lab", "infra", "proposals", "supabase"
)
$SkipRelPaths = @(
    "deploy/image.png"
)

$Token = $env:HF_TOKEN
if (-not $Token) { $Token = $env:HUGGING_FACE_HUB_TOKEN }
if ($Token) {
    $SpaceUrl = "https://user:$Token@huggingface.co/spaces/ADI576/ProFlo"
}

function Test-SkipRelPath([string]$RelPath) {
    $norm = ($RelPath -replace '\\', '/').TrimStart('/')
    foreach ($skip in $SkipRelPaths) {
        if ($norm -eq $skip) { return $true }
    }
    return $false
}

function Copy-Tree($Source, $Dest, [string]$RelBase = "") {
    New-Item -ItemType Directory -Force -Path $Dest | Out-Null
    Get-ChildItem $Source -Force | ForEach-Object {
        if ($SkipNames -contains $_.Name) { return }
        $rel = if ($RelBase) { "$RelBase/$($_.Name)" } else { $_.Name }
        if (Test-SkipRelPath $rel) { return }
        $target = Join-Path $Dest $_.Name
        if ($_.PSIsContainer) {
            Copy-Tree $_.FullName $target $rel
        } else {
            Copy-Item $_.FullName $target -Force
        }
    }
}

if (Test-Path $SpaceDir) { Remove-Item -Recurse -Force $SpaceDir }
git clone $SpaceUrl $SpaceDir

Copy-Tree $Root $SpaceDir
Copy-Item "$Root\deploy\huggingface\README.md" (Join-Path $SpaceDir "README.md") -Force
Copy-Item "$Root\Dockerfile" (Join-Path $SpaceDir "Dockerfile") -Force

Push-Location $SpaceDir
# Remove binary brand guide if it was committed in a prior failed attempt
if (Test-Path "deploy/image.png") { git rm -f --cached deploy/image.png 2>$null; Remove-Item -Force deploy/image.png -ErrorAction SilentlyContinue }

git add -A
if (-not (git diff --cached --quiet)) {
    git commit -m "Deploy ProFlo UI revamp: shop, admin, cashier + API"
}
git push
if ($LASTEXITCODE -ne 0) {
    Pop-Location
    Write-Error "HF push failed. Check output above (e.g. secrets scanner rejected a file)."
}
Pop-Location

Write-Host "Pushed. Space rebuilds at https://huggingface.co/spaces/ADI576/ProFlo - then live at proflotech.com via Cloudflare."
