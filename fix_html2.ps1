$content = Get-Content 'C:\Users\quevedo\Desktop\POS NEGOCIO\index.html' -Raw
$idx = $content.IndexOf('    <script src="app.js"></script>')
if ($idx -ge 0) {
    $newContent = $content.Substring(0, $idx + 33)
    $newContent += "`r`n</body>`r`n</html>"
    Set-Content 'C:\Users\quevedo\Desktop\POS NEGOCIO\index.html' -Value $newContent -Encoding utf8
    Write-Host "Archivo index.html corregido exitosamente"
} else {
    Write-Host "No se encontró el tag script"
}
