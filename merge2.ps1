$b64 = Get-Content "b64.txt" -Raw
$dataUrl = "data:text/html;base64," + $b64.Trim()

$hubHtml = [System.IO.File]::ReadAllText("Plataforma Final\Quantum Hub.html", [System.Text.Encoding]::UTF8)

$navRegex = '(<button[^>]+id="nav-espectro"[^>]*>.*?</button>)'
$navInject = "`$1`r`n      <button class=`"nav-btn`" id=`"nav-guia`" onclick=`"goSection('guia')`">&#x1F4D6; Guia de Uso</button>"
$hubHtml = [System.Text.RegularExpressions.Regex]::Replace($hubHtml, $navRegex, $navInject)

$sectionHtml = @"
  <!-- GUIA DE USO -->
  <section id="guia" class="section">
    <div class="container">
      <div class="sec-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
        <div style="text-align:left;">
          <h2 class="sec-title" style="margin-bottom:0;">&#x1F4D6; Guia de Uso</h2>
          <p class="sec-sub">Instruções completas de como utilizar o Quantum Hub</p>
        </div>
        <a href="$dataUrl" download="Guia de Uso - QUANTUM HUB.html" style="background:var(--cyan); color:#000; padding:10px 20px; text-decoration:none; border-radius:20px; font-weight:bold; box-shadow:0 4px 15px rgba(0,204,255,0.4); display:inline-block;">&#x1F4E5; Baixar Guia</a>
      </div>
      <div style="width:100%; height:75vh; border:1px solid var(--border); border-radius:16px; overflow:hidden; background:#fff; margin-top:20px;">
        <iframe src="$dataUrl" style="width:100%; height:100%; border:none;"></iframe>
      </div>
    </div>
  </section>

"@

$hubHtml = $hubHtml.Replace("  <!-- TABELA PERIODICA INTERATIVA -->", $sectionHtml + "  <!-- TABELA PERIODICA INTERATIVA -->")

[System.IO.File]::WriteAllText("Plataforma Final\Quantum Hub.html", $hubHtml, [System.Text.Encoding]::UTF8)

Remove-Item "b64.txt"
$files = Get-ChildItem "Plataforma Final\Guia de Uso*.html"
foreach ($f in $files) { Remove-Item $f.FullName }
Write-Output "Done"
