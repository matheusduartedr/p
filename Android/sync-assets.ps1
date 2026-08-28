$ErrorActionPreference = "Stop"

$src = "d:\PROJETOS\Android\www"
$dest = "d:\PROJETOS\Android\android\app\src\main\assets\public"

if (Test-Path $dest) {
    Remove-Item -Recurse -Force $dest
}
New-Item -ItemType Directory -Force -Path $dest | Out-Null

Copy-Item -Recurse -Force "$src\*" $dest
Copy-Item -Force "d:\PROJETOS\Android\capacitor.config.json" "d:\PROJETOS\Android\android\app\src\main\assets\capacitor.config.json"

Write-Host "Web assets successfully synchronized into Android native assets/public!"
Write-Host "Total assets in Android:" (Get-ChildItem -Recurse $dest | Measure-Object).Count "files and directories"
