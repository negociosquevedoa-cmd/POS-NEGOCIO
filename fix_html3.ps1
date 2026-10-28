$lines = Get-Content 'C:\Users\quevedo\Desktop\POS NEGOCIO\index.html'
$scriptIdx = -1
for($i=0; $i -lt $lines.Count; $i++) {
    if($lines[$i] -match 'app.js') {
        $scriptIdx = $i
        break
    }
}

if($scriptIdx -ge 0) {
    $newLines = $lines[0..$scriptIdx]
    $newLines += '</body>'
    $newLines += '</html>'
    $newLines | Set-Content 'C:\Users\quevedo\Desktop\POS NEGOCIO\index.html' -Encoding utf8
    Write-Host "Archivo index.html corregido exitosamente - Linea script: $scriptIdx"
} else {
    Write-Host "No se encontró el tag script"
}
