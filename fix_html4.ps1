$content = Get-Content 'C:\Users\quevedo\Desktop\POS NEGOCIO\index.html' -Raw
$pattern = '(?s)(    <script src="app.js"></script>).*'
$replacement = '$1`r`n</body>`r`n</html>'
$newContent = [regex]::Replace($content, $pattern, $replacement)
Set-Content 'C:\Users\quevedo\Desktop\POS NEGOCIO\index.html' -Value $newContent -Encoding utf8
Write-Host "Archivo index.html corregido exitosamente"
