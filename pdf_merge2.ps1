$hubHtml = [System.IO.File]::ReadAllText("Plataforma Final\Quantum Hub.html", [System.Text.Encoding]::UTF8)
$regexB64 = '<iframe src="data:text/html;base64,([^"]+)"'
$match = [System.Text.RegularExpressions.Regex]::Match($hubHtml, $regexB64)
$b64 = $match.Groups[1].Value

[IO.File]::WriteAllBytes("guide.html", [Convert]::FromBase64String($b64))

$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$htmlPath = "$pwd\guide.html"
$pdfPath = "$pwd\guide.pdf"
Start-Process -FilePath $chromePath -ArgumentList "--headless --disable-gpu --print-to-pdf=`"$pdfPath`" `"$htmlPath`"" -Wait

Start-Sleep -Seconds 2

$pdfBytes = [IO.File]::ReadAllBytes($pdfPath)
$pdfB64 = [Convert]::ToBase64String($pdfBytes)
$pdfDataUrl = "data:application/pdf;base64," + $pdfB64

$regexLink = '<a href="data:text/html;base64,[^"]+" download="Guia de Uso - QUANTUM HUB\.html"([^>]+)>&#x1F4E5; Baixar Guia<\/a>'
$replacement = '<a href="' + $pdfDataUrl + '" download="Guia de Uso - QUANTUM HUB.pdf"$1>&#x1F4E5; Baixar em PDF</a>'
$hubHtml = [System.Text.RegularExpressions.Regex]::Replace($hubHtml, $regexLink, $replacement)

[System.IO.File]::WriteAllText("Plataforma Final\Quantum Hub.html", $hubHtml, [System.Text.Encoding]::UTF8)

Remove-Item "guide.html"
Remove-Item "guide.pdf"
Write-Output "PDF generated and embedded!"
