$guideBytes = [System.IO.File]::ReadAllBytes("Plataforma Final\Guia de Uso — QUANTUM HUB.html")
$base64Guide = [Convert]::ToBase64String($guideBytes)
$dataUrl = "data:text/html;base64," + $base64Guide

$hubHtml = [System.IO.File]::ReadAllText("Plataforma Final\Quantum Hub.html", [System.Text.Encoding]::UTF8)

$navTarget = "id=`"nav-espectro`" onclick=`"goSection('espectro')`">📊 Espectro</button>"
$navInject = "id=`"nav-espectro`" onclick=`"goSection('espectro')`">📊 Espectro</button>`r`n      <button class=`"nav-btn`" id=`"nav-guia`" onclick=`"goSection('guia')`">📖 Guia de Uso</button>"
$hubHtml = $hubHtml.Replace($navTarget, $navInject)

$sectionHtml = @"
  <!-- GUIA DE USO -->
  <section id="guia" class="section">
    <div class="container">
      <div class="sec-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
        <div style="text-align:left;">
          <h2 class="sec-title" style="margin-bottom:0;">📖 Guia de Uso</h2>
          <p class="sec-sub">Instruções completas de como utilizar o Quantum Hub</p>
        </div>
        <a href="$dataUrl" download="Guia de Uso - QUANTUM HUB.html" style="background:var(--cyan); color:#000; padding:10px 20px; text-decoration:none; border-radius:20px; font-weight:bold; box-shadow:0 4px 15px rgba(0,204,255,0.4); display:inline-block;">📥 Baixar Guia (HTML)</a>
      </div>
      <div style="width:100%; height:75vh; border:1px solid var(--border); border-radius:16px; overflow:hidden; background:#fff; margin-top:20px;">
        <iframe src="$dataUrl" style="width:100%; height:100%; border:none;"></iframe>
      </div>
    </div>
  </section>
"@

$hubHtml = $hubHtml.Replace("  </body>", $sectionHtml + "`r`n  </body>")

[System.IO.File]::WriteAllText("Plataforma Final\Quantum Hub.html", $hubHtml, [System.Text.Encoding]::UTF8)

Remove-Item "Plataforma Final\Guia de Uso — QUANTUM HUB.html"
Write-Output "Integration completed!"
