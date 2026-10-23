$newGuide = @"
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Guia de Uso — QUANTUM HUB</title>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap" rel="stylesheet">
<style>
:root{
  --bg:#070b14; --surface:#111828; --surface2:#161f33; --border:#232f47;
  --text:#e7ebf3; --muted:#93a0b8;
  --cyan:#35d6f0; --purple:#a98bff; --green:#3ee2a3; --amber:#f5b84d; --red:#ff7676;
  --font-h:'Sora',system-ui,sans-serif; --font-b:'Inter',system-ui,sans-serif; --font-m:'IBM Plex Mono',ui-monospace,monospace;
  box-sizing:border-box;
}
html{scroll-behavior:smooth;}
*{margin:0;padding:0;}
body{background:var(--bg); color:var(--text); font-family:var(--font-b); line-height:1.6;}
.topbar{position:sticky; top:0; z-index:10; background:rgba(7,11,20,0.9); border-bottom:1px solid var(--border); padding:14px 20px;}
.brand{font-family:var(--font-h); font-weight:800; font-size:1.1rem; color:var(--cyan);}
main{max-width:800px; margin:0 auto; padding:36px 20px 80px;}
h1{font-family:var(--font-h); font-size:2.2rem; margin-bottom:10px; color:var(--cyan);}
h2{font-family:var(--font-h); font-size:1.5rem; margin-top:40px; margin-bottom:15px; border-bottom:1px solid var(--border); padding-bottom:5px; color:var(--purple);}
h3{font-family:var(--font-h); font-size:1.1rem; margin-top:25px; margin-bottom:10px; color:var(--text);}
p{margin-bottom:15px; color:var(--muted);}
ul{margin-left:20px; margin-bottom:15px;}
li{margin-bottom:8px; color:var(--muted);}
b{color:var(--text);}
.physics{background:var(--surface2); border-left:4px solid var(--cyan); padding:15px; margin:20px 0; border-radius:4px;}
.physics-title{font-family:var(--font-m); color:var(--cyan); font-size:0.85rem; font-weight:bold; margin-bottom:8px; letter-spacing:1px;}
.chip{display:inline-block; padding:3px 8px; background:var(--surface); border:1px solid var(--border); border-radius:4px; font-size:0.85rem; color:var(--text); margin-right:5px; margin-bottom:5px;}
</style>
</head>
<body>
<div class="topbar"><div class="brand">⚛️ QUANTUM HUB - Guia de Uso Completo</div></div>
<main>
  <h1>Como utilizar o Quantum Hub</h1>
  <p>Bem-vindo ao guia oficial do Quantum Hub. Aqui você aprenderá a usar cada botão e tela da plataforma, além de compreender os conceitos de física quântica e química por trás de cada visualização.</p>

  <div class="physics">
    <div class="physics-title">O QUE É O MODELO QUÂNTICO DO ÁTOMO?</div>
    <p style="margin-bottom:0">Ao contrário do que imaginamos no dia a dia, os elétrons não orbitam o núcleo como planetas em torno do Sol (Modelo de Bohr/Semi-clássico). Na realidade, eles se comportam como ondas de probabilidade. Onde a nuvem é mais densa, há uma maior chance de encontrar o elétron. Essa descoberta revolucionou a física e é a base de toda a química moderna.</p>
  </div>

  <h2>1. Barra de Navegação Superior</h2>
  <p>Os controles principais globais ficam no topo da tela.</p>
  <ul>
    <li><b>Home / Orbitais / Espectro:</b> Alterna entre as telas principais da aplicação. O simulador não recarrega a página, mantendo o estado de onde você parou.</li>
    <li><b>Tema Claro / Escuro:</b> Alterna as cores da plataforma. <i>Significado prático:</i> O tema escuro reduz o cansaço visual, enquanto o tema claro é excelente para usar em salas de aula iluminadas ou projetores.</li>
    <li><b>Botões A+ / A-:</b> Aumentam ou diminuem o tamanho de todas as fontes da plataforma, garantindo acessibilidade para quem precisa de letras maiores.</li>
  </ul>

  <h2>2. Simulador de Orbitais e Transições</h2>
  <p>Esta tela é o coração da plataforma, focada no átomo de Hidrogênio.</p>

  <h3>Modelos Atômicos (Abas Superiores)</h3>
  <ul>
    <li><span class="chip">Semi-clássico</span> Mostra o átomo segundo o modelo de Bohr (órbitas circulares planas). <i>Significado Físico:</i> Historicamente importante, pois introduziu a ideia de que a energia é <b>quantizada</b> (dividida em níveis discretos, n=1, 2, 3...), mas falha ao não considerar a natureza ondulatória do elétron.</li>
    <li><span class="chip">Quântico</span> Mostra o modelo de Schrödinger (nuvem eletrônica). <i>Significado Físico:</i> O elétron não tem uma posição exata até ser medido (Princípio da Incerteza de Heisenberg). A forma tridimensional mostra a densidade de probabilidade.</li>
  </ul>

  <h3>Painel de Informações do Átomo (Números Quânticos)</h3>
  <p>Cada orbital é como um "endereço" quântico único, definido por quatro números:</p>
  <div class="physics">
    <ul style="margin-bottom:0">
      <li><b>n (Principal):</b> Define o tamanho e a energia da órbita. Quanto maior, mais distante do núcleo e mais energético. (ex: 1, 2, 3)</li>
      <li><b>ℓ (Momento Angular):</b> Define a forma do orbital. 0 = s (esfera), 1 = p (halteres), 2 = d (trevos). </li>
      <li><b>mℓ (Magnético):</b> Define a orientação do orbital no espaço (eixos x, y, z).</li>
      <li><b>ms (Spin):</b> O giro intrínseco do elétron (+1/2 ou -1/2).</li>
    </ul>
  </div>

  <h3>Controles de Efeitos (Excitação e Emissão)</h3>
  <ul>
    <li><span class="chip">⚡ Excitar Elétron</span> Força o elétron a saltar para uma camada superior. <i>Significado Físico:</i> Simula a absorção de energia externa (como calor ou luz) pelo átomo, deixando-o num estado instável de maior energia.</li>
    <li><span class="chip">💡 Emitir Fóton</span> Faz o elétron retornar a uma camada interior. <i>Significado Físico:</i> Como o átomo prefere a estabilidade, o elétron "cai" e a energia excedente é ejetada na forma de uma partícula de luz (fóton). A cor desse fóton depende do tamanho do salto!</li>
  </ul>

  <h3>Estilos de Visualização 3D</h3>
  <ul>
    <li><span class="chip">Sólido</span> Mostra o limite exterior (casca) onde há 90% de chance de achar o elétron.</li>
    <li><span class="chip">Nuvem</span> Renderiza milhares de pontos individuais. É a visão mais realista da mecânica quântica, onde cada ponto representa uma provável posição do elétron.</li>
    <li><span class="chip">Wireframe / Transparente</span> Permitem enxergar os lobos internos e o núcleo do átomo sem que a casca externa bloqueie a visão.</li>
  </ul>

  <h2>3. Espectro do Hidrogênio</h2>
  <p>Se o simulador de orbitais lida com um átomo, esta seção lida com o que podemos medir no laboratório: a luz emitida.</p>
  
  <h3>Emissão vs Absorção</h3>
  <ul>
    <li><span class="chip">Emissão</span> Um gás aquecido libera energia na forma de luz, mas apenas em certas cores (linhas brilhantes num fundo preto).</li>
    <li><span class="chip">Absorção</span> Luz branca atravessa um gás frio. O gás "rouba" fótons de energias específicas, deixando falhas (linhas escuras) no arco-íris de fundo. É assim que sabemos de que são feitas as estrelas!</li>
  </ul>

  <h3>Séries Espectrais (Lyman, Balmer, etc.)</h3>
  <p>Os saltos dos elétrons são agrupados pelo seu "destino final":</p>
  <div class="physics">
    <ul style="margin-bottom:0">
      <li><b>Série de Lyman (Cai para n=1):</b> Saltos enormes que emitem radiação Ultravioleta (invisível aos nossos olhos).</li>
      <li><b>Série de Balmer (Cai para n=2):</b> Saltos médios que emitem luz no espectro Visível (Vermelho, Azul-ciano, Violeta). São as linhas coloridas que você consegue ver na tela.</li>
      <li><b>Série de Paschen (Cai para n=3):</b> Saltos pequenos, emitem Infravermelho.</li>
    </ul>
  </div>

  <h3>A Bancada Experimental 3D</h3>
  <p>Este painel reproduz um experimento real de espectroscopia. A fonte emite luz, que passa por uma fenda e atinge um <b>Prisma</b>. <br><i>Física envolvida:</i> O prisma sofre refração; como cada cor (frequência) da luz sofre um desvio diferente, o prisma separa o feixe de luz atômico nas suas linhas componentes, projetando-as na tela cinza.</p>
  
  <p><i>Dica de uso:</i> Você pode arrastar a câmera para olhar a tela do prisma bem de perto e clicar em uma das linhas de luz projetadas para revelar instantaneamente a transição energética responsável por aquela cor.</p>
</main>
</body>
</html>
"@
[IO.File]::WriteAllText("guia_expanded.html", $newGuide, [System.Text.Encoding]::UTF8)

# 1. Update HTML base64 for Iframe
$htmlBytes = [IO.File]::ReadAllBytes("guia_expanded.html")
$htmlB64 = [Convert]::ToBase64String($htmlBytes)
$htmlDataUrl = "data:text/html;base64," + $htmlB64

# 2. Generate PDF using Chrome
$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$htmlPath = "$pwd\guia_expanded.html"
$pdfPath = "$pwd\guia_expanded.pdf"
Start-Process -FilePath $chromePath -ArgumentList "--headless --disable-gpu --print-to-pdf=`"$pdfPath`" `"$htmlPath`"" -Wait
Start-Sleep -Seconds 3

# 3. Read PDF base64
$pdfBytes = [IO.File]::ReadAllBytes($pdfPath)
$pdfB64 = [Convert]::ToBase64String($pdfBytes)
$pdfDataUrl = "data:application/pdf;base64," + $pdfB64

# 4. Modify Quantum Hub.html
$hubHtml = [System.IO.File]::ReadAllText("Plataforma Final\Quantum Hub.html", [System.Text.Encoding]::UTF8)

# Replace iframe src
$iframeRegex = '<iframe src="data:text/html;base64,[^"]+"'
$iframeReplacement = '<iframe src="' + $htmlDataUrl + '"'
$hubHtml = [System.Text.RegularExpressions.Regex]::Replace($hubHtml, $iframeRegex, $iframeReplacement)

# Replace PDF download href
$pdfRegex = '<a href="data:application/pdf;base64,[^"]+" download="Guia de Uso - QUANTUM HUB.pdf"'
$pdfReplacement = '<a href="' + $pdfDataUrl + '" download="Guia de Uso - QUANTUM HUB.pdf"'
$hubHtml = [System.Text.RegularExpressions.Regex]::Replace($hubHtml, $pdfRegex, $pdfReplacement)

[System.IO.File]::WriteAllText("Plataforma Final\Quantum Hub.html", $hubHtml, [System.Text.Encoding]::UTF8)

# Cleanup
Remove-Item "guia_expanded.html"
Remove-Item "guia_expanded.pdf"
Write-Output "Update complete!"
