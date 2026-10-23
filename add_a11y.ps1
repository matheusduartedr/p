$hubHtml = [System.IO.File]::ReadAllText("Plataforma Final\Quantum Hub.html", [System.Text.Encoding]::UTF8)

$navRegex = '(<button class="nav-btn" id="btn-theme-toggle" onclick="toggleMainTheme\(\)">.*?</button>)'
$navInject = @"
`$1
      <div style="display:flex; gap:4px; margin-left:8px; border-left:1px solid rgba(0,204,255,0.3); padding-left:12px;">
        <button class="nav-btn" onclick="changeFontSize(1)" title="Aumentar Fonte (A+)"><span style="font-size:1.1em; font-weight:bold;">A+</span></button>
        <button class="nav-btn" onclick="changeFontSize(-1)" title="Diminuir Fonte (A-)"><span style="font-size:0.9em; font-weight:bold;">A-</span></button>
      </div>
"@
$hubHtml = [System.Text.RegularExpressions.Regex]::Replace($hubHtml, $navRegex, $navInject)

$jsInject = @"
    // Acessibilidade: Tamanho da Fonte
    let currentFontSize = 100;
    function changeFontSize(step) {
      currentFontSize += step * 10;
      if(currentFontSize < 80) currentFontSize = 80;
      if(currentFontSize > 150) currentFontSize = 150;
      document.documentElement.style.fontSize = currentFontSize + '%';
    }
  </script>
"@
# Replace only the LAST occurrence of </script> to avoid breaking earlier scripts
$idx = $hubHtml.LastIndexOf("</script>")
if ($idx -ge 0) {
    $hubHtml = $hubHtml.Substring(0, $idx) + $jsInject + $hubHtml.Substring($idx + 9)
}

[System.IO.File]::WriteAllText("Plataforma Final\Quantum Hub.html", $hubHtml, [System.Text.Encoding]::UTF8)
Write-Output "Accessibility buttons added!"
