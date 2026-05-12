# ===========================================================
# ASW Hub — new content scaffold
# Usage:
#   .\new-content.ps1 session "sesar-deployment-update"
#   .\new-content.ps1 speaker "enaire-director-general"
# ===========================================================

param(
  [Parameter(Mandatory=$true)]
  [ValidateSet("session","speaker")]
  [string]$Type,

  [Parameter(Mandatory=$true)]
  [string]$Slug
)

$base = $PSScriptRoot

if ($Type -eq "session") {
  $src  = "$base\src\sessions\_template.md"
  $dest = "$base\src\sessions\$Slug.md"
} else {
  $src  = "$base\src\speakers\_template.md"
  $dest = "$base\src\speakers\$Slug.md"
}

if (Test-Path $dest) {
  Write-Host "File already exists: $dest" -ForegroundColor Yellow
  exit 1
}

Copy-Item $src $dest
Write-Host ""
Write-Host "Created: $dest" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Open the file and fill in the placeholders"
Write-Host "  2. Run:  git add src/${Type}s/$Slug.md"
Write-Host "  3. Run:  git commit -m `"Add $Type: $Slug`""
Write-Host "  4. Run:  git push"
Write-Host ""
Write-Host "The page will be live at:" -ForegroundColor Cyan
Write-Host "  https://aswhub.maxifidigital.com/${Type}s/$Slug/"

# Open the file in the default editor
Start-Process $dest
